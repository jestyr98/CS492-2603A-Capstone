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
    hasAdminMenuAccess,
  } = deps;

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
      await dbRun(db, 'COMMIT;');

      req.session.user = {
        customerId: insertCustomerResult.lastID,
        email,
        firstName: parsed.data.firstName.trim(),
        lastName: parsed.data.lastName.trim(),
        phone,
      };

      res.status(201).json({
        email,
        firstName: parsed.data.firstName.trim(),
        lastName: parsed.data.lastName.trim(),
        phone,
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
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const passwordMatches = await bcrypt.compare(parsed.data.password, account.password_hash);
      if (!passwordMatches) {
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
}

module.exports = registerAuthRoutes;
