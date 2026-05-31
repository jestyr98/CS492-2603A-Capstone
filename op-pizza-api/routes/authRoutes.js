const crypto = require('crypto');

function registerAuthRoutes(app, deps) {
  const {
    requireSecureTransport,
    ensureMenuDatabase,
    dbGet,
    dbRun,
    getAccountByEmail,
    bcrypt,
    BCRYPT_SALT_ROUNDS,
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    hasAdminMenuAccess,
  } = deps;

  const getRequestIp = (req) => {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      return String(forwardedFor).split(',')[0].trim();
    }

    return req.ip || req.socket?.remoteAddress || '';
  };

  app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });

  app.post('/api/register', requireSecureTransport, async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid registration format' });
    }

    let db;
    try {
      db = await ensureMenuDatabase();
      const email = parsed.data.email.trim().toLowerCase();
      const phone = parsed.data.phone && parsed.data.phone.trim() ? parsed.data.phone.trim() : null;

      const existingCustomer = await dbGet(
        db,
        'SELECT customer_id FROM customers WHERE LOWER(email) = LOWER(?);',
        [email]
      );
      if (existingCustomer) {
        return res.status(409).json({ error: 'An account with that email already exists.' });
      }

      const passwordHash = await bcrypt.hash(parsed.data.password, BCRYPT_SALT_ROUNDS);

      await dbRun(db, 'BEGIN TRANSACTION;');
      const insertCustomerResult = await dbRun(
        db,
        `
          INSERT INTO customers (email, first_name, last_name, phone, last_login_at)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP);
        `,
        [email, parsed.data.firstName.trim(), parsed.data.lastName.trim(), phone]
      );

      await dbRun(
        db,
        `
          INSERT INTO customer_credentials (customer_id, password_hash, hash_algorithm, failed_login_attempts, locked_until, password_updated_at)
          VALUES (?, ?, 'bcrypt', 0, NULL, CURRENT_TIMESTAMP);
        `,
        [insertCustomerResult.lastID, passwordHash]
      );

      await dbRun(
        db,
        `
          INSERT OR REPLACE INTO account_mfa_methods (account_type, account_id, method, destination)
          VALUES ('customer', ?, ?, ?);
        `,
        [
          insertCustomerResult.lastID,
          parsed.data.mfaMethod,
          parsed.data.mfaMethod === 'sms' ? (phone || email) : email,
        ]
      );

      await dbRun(db, 'COMMIT;');

      req.session.user = {
        accountType: 'customer',
        accountId: insertCustomerResult.lastID,
        email,
        firstName: parsed.data.firstName.trim(),
        lastName: parsed.data.lastName.trim(),
        phone,
        canAccessAdminMenu: false,
      };

      res.status(201).json({
        accountType: 'customer',
        email,
        firstName: parsed.data.firstName.trim(),
        lastName: parsed.data.lastName.trim(),
        phone,
        canAccessAdminMenu: false,
      });
    } catch (err) {
      if (db) {
        try {
          await dbRun(db, 'ROLLBACK;');
        } catch {
          // Ignore rollback errors because original error is more actionable.
        }
      }
      res.status(500).json({ error: 'Unable to create account right now.' });
    } finally {
      if (db) {
        db.close();
      }
    }
  });

  app.post('/api/login', requireSecureTransport, async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid credentials format' });
    }

    let db;
    try {
      db = await ensureMenuDatabase();
      const email = parsed.data.email.trim().toLowerCase();
      const account = await getAccountByEmail(db, email);

      if (!account) {
        await dbRun(
          db,
          `
            INSERT INTO login_attempt_audit (username, ip_address, status)
            VALUES (?, ?, 'failure');
          `,
          [email, getRequestIp(req)]
        );
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const passwordMatches = await bcrypt.compare(parsed.data.password, account.password_hash);
      if (!passwordMatches) {
        await dbRun(
          db,
          `
            INSERT INTO login_attempt_audit (username, ip_address, status)
            VALUES (?, ?, 'failure');
          `,
          [email, getRequestIp(req)]
        );
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      if (account.account_type === 'customer') {
        await dbRun(
          db,
          `
            UPDATE customers
            SET last_login_at = CURRENT_TIMESTAMP
            WHERE customer_id = ?;
          `,
          [account.account_id]
        );
      }

      req.session.user = {
        accountType: account.account_type,
        accountId: account.account_id,
        email: account.email,
        firstName: account.first_name,
        lastName: account.last_name,
        phone: account.phone,
        jobTitle: account.job_title || null,
        canAccessAdminMenu: hasAdminMenuAccess({ accountType: account.account_type, jobTitle: account.job_title }),
      };

      await dbRun(
        db,
        `
          INSERT INTO login_attempt_audit (username, ip_address, status)
          VALUES (?, ?, 'success');
        `,
        [email, getRequestIp(req)]
      );

      res.json({
        accountType: account.account_type,
        email: account.email,
        firstName: account.first_name,
        lastName: account.last_name,
        phone: account.phone,
        jobTitle: account.job_title || null,
        canAccessAdminMenu: hasAdminMenuAccess({ accountType: account.account_type, jobTitle: account.job_title }),
      });
    } catch {
      res.status(500).json({ error: 'Unable to sign in right now.' });
    } finally {
      if (db) {
        db.close();
      }
    }
  });

  app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ ok: true });
    });
  });

  app.get('/api/me', (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Not signed in' });
    }
    res.json(req.session.user);
  });

  app.post('/api/forgot-password', requireSecureTransport, async (req, res) => {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid forgot-password payload.' });
    }

    let db;
    try {
      db = await ensureMenuDatabase();
      const email = parsed.data.email.trim().toLowerCase();
      const account = await getAccountByEmail(db, email);

      if (!account) {
        return res.json({ ok: true });
      }

      const rawToken = crypto.randomBytes(20).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + (15 * 60 * 1000)).toISOString();

      await dbRun(
        db,
        `
          INSERT INTO password_reset_tokens (account_type, account_id, token_hash, expires_at)
          VALUES (?, ?, ?, ?);
        `,
        [account.account_type, account.account_id, tokenHash, expiresAt]
      );

      // Return reset token in this mock environment to support local end-to-end testing.
      return res.json({ ok: true, resetToken: rawToken, expiresAt });
    } catch {
      return res.status(500).json({ error: 'Unable to create reset token right now.' });
    } finally {
      if (db) {
        db.close();
      }
    }
  });

  app.post('/api/reset-password', requireSecureTransport, async (req, res) => {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid reset-password payload.' });
    }

    let db;
    try {
      db = await ensureMenuDatabase();
      const tokenHash = crypto.createHash('sha256').update(parsed.data.token).digest('hex');
      const tokenRecord = await dbGet(
        db,
        `
          SELECT token_id, account_type, account_id, expires_at, used_at
          FROM password_reset_tokens
          WHERE token_hash = ?
          LIMIT 1;
        `,
        [tokenHash]
      );

      if (!tokenRecord || tokenRecord.used_at || Date.parse(tokenRecord.expires_at) <= Date.now()) {
        return res.status(400).json({ error: 'Reset token is invalid or expired.' });
      }

      const passwordHash = await bcrypt.hash(parsed.data.password, BCRYPT_SALT_ROUNDS);

      await dbRun(db, 'BEGIN TRANSACTION;');

      if (tokenRecord.account_type === 'customer') {
        await dbRun(
          db,
          `
            UPDATE customer_credentials
            SET password_hash = ?, hash_algorithm = 'bcrypt', password_updated_at = CURRENT_TIMESTAMP
            WHERE customer_id = ?;
          `,
          [passwordHash, tokenRecord.account_id]
        );
      } else {
        await dbRun(
          db,
          `
            UPDATE employee_credentials
            SET password_hash = ?, hash_algorithm = 'bcrypt', password_updated_at = CURRENT_TIMESTAMP
            WHERE employee_id = ?;
          `,
          [passwordHash, tokenRecord.account_id]
        );
      }

      await dbRun(
        db,
        `
          UPDATE password_reset_tokens
          SET used_at = CURRENT_TIMESTAMP
          WHERE token_id = ?;
        `,
        [tokenRecord.token_id]
      );

      await dbRun(db, 'COMMIT;');
      return res.json({ ok: true });
    } catch {
      if (db) {
        try {
          await dbRun(db, 'ROLLBACK;');
        } catch {
          // Ignore rollback error during error handling.
        }
      }
      return res.status(500).json({ error: 'Unable to reset password right now.' });
    } finally {
      if (db) {
        db.close();
      }
    }
  });
}

module.exports = registerAuthRoutes;
