require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');

const app = express();

const PORT = Number(process.env.PORT || 8080);
const API_BEARER_TOKEN = process.env.API_BEARER_TOKEN || 'dev-token-only';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-session-secret-replace-in-prod';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',').map(s => s.trim());
const ALLOW_INSECURE_LOCALHOST = String(process.env.ALLOW_INSECURE_LOCALHOST || 'true').toLowerCase() === 'true';
const TRUST_PROXY = String(process.env.TRUST_PROXY || 'false').toLowerCase() === 'true';
const TOKEN_TTL_SECONDS = Number(process.env.TOKEN_TTL_SECONDS || 900);
const ENFORCE_ONE_TIME_TOKEN = String(process.env.ENFORCE_ONE_TIME_TOKEN || 'true').toLowerCase() === 'true';

app.disable('x-powered-by');
app.set('trust proxy', TRUST_PROXY);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'same-site' },
  })
);
app.use(express.json({ limit: '32kb' }));
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  })
);

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: !ALLOW_INSECURE_LOCALHOST,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
    },
  })
);
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

const tokenVault = new Map();
const paymentsByIdempotency = new Map();
const paymentsById = new Map();
const refundsByIdempotency = new Map();

const cardSchema = z.object({
  cardNumber: z.string().regex(/^\d{13,19}$/),
  expiryMonth: z.number().int().min(1).max(12),
  expiryYear: z.number().int().min(new Date().getFullYear()).max(new Date().getFullYear() + 30),
  cvv: z.string().regex(/^\d{3,4}$/),
  cardholderName: z.string().min(2).max(120),
});

const tokenizeSchema = z.object({
  card: cardSchema,
  metadata: z.record(z.string(), z.string()).optional(),
});

const paymentSchema = z.object({
  token: z.string().regex(/^tok_[a-f0-9]{24}$/),
  amount: z.number().positive().max(100000),
  currency: z.string().regex(/^[A-Z]{3}$/),
  merchantReference: z.string().min(1).max(100),
});

const refundSchema = z.object({
  paymentId: z.string().regex(/^pay_[a-f0-9]{24}$/),
  amount: z.number().positive().max(100000),
  reason: z.string().min(1).max(300).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const checkoutSchema = z.object({
  card: z.object({
    cardNumber: z.string().regex(/^\d{13,19}$/),
    expiryMonth: z.number().int().min(1).max(12),
    expiryYear: z.number().int().min(new Date().getFullYear()).max(new Date().getFullYear() + 30),
    cvv: z.string().regex(/^\d{3,4}$/),
    cardholderName: z.string().min(2).max(120),
  }),
  amount: z.number().positive().max(100000),
  currency: z.string().regex(/^[A-Z]{3}$/),
  merchantReference: z.string().min(1).max(100),
});

function secureEquals(a, b) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function requireBearerToken(req, res, next) {
  const authHeader = req.header('authorization') || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token || !secureEquals(token, API_BEARER_TOKEN)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

function requireSession(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Not signed in' });
  }
  next();
}

function requireSecureTransport(req, res, next) {
  const isHttps = req.secure || req.get('x-forwarded-proto') === 'https';
  const isLocalhost = req.hostname === 'localhost' || req.hostname === '127.0.0.1';

  if (!isHttps && !(ALLOW_INSECURE_LOCALHOST && isLocalhost)) {
    return res.status(400).json({
      error: 'Insecure transport is not allowed. Use HTTPS.',
    });
  }

  next();
}

function maskPan(cardNumber) {
  const last4 = cardNumber.slice(-4);
  return `**** **** **** ${last4}`;
}

function makeId(prefix) {
  return `${prefix}_${crypto.randomBytes(12).toString('hex')}`;
}

function isTokenExpired(tokenRecord) {
  return Date.now() >= tokenRecord.expiresAtMs;
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/v1/tokens', requireSecureTransport, requireBearerToken, (req, res) => {
  const parsed = tokenizeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.issues });
  }

  const { card, metadata } = parsed.data;

  const token = makeId('tok');
  const issuedAtMs = Date.now();
  const expiresAtMs = issuedAtMs + TOKEN_TTL_SECONDS * 1000;
  const tokenRecord = {
    token,
    fingerprint: crypto.createHash('sha256').update(`${card.cardNumber}|${card.expiryMonth}|${card.expiryYear}`).digest('hex'),
    maskedPan: maskPan(card.cardNumber),
    expiryMonth: card.expiryMonth,
    expiryYear: card.expiryYear,
    cardholderName: card.cardholderName,
    metadata: metadata || {},
    createdAt: new Date(issuedAtMs).toISOString(),
    expiresAt: new Date(expiresAtMs).toISOString(),
    expiresAtMs,
    usedAt: null,
  };

  tokenVault.set(token, tokenRecord);

  res.status(201).json({
    token,
    maskedPan: tokenRecord.maskedPan,
    expiryMonth: tokenRecord.expiryMonth,
    expiryYear: tokenRecord.expiryYear,
    createdAt: tokenRecord.createdAt,
    expiresAt: tokenRecord.expiresAt,
  });
});

app.post('/v1/payments', requireSecureTransport, requireBearerToken, (req, res) => {
  const parsed = paymentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.issues });
  }

  const idempotencyKey = req.header('idempotency-key');
  if (!idempotencyKey || idempotencyKey.length < 8 || idempotencyKey.length > 128) {
    return res.status(400).json({ error: 'Missing or invalid Idempotency-Key header' });
  }

  if (paymentsByIdempotency.has(idempotencyKey)) {
    return res.status(200).json(paymentsByIdempotency.get(idempotencyKey));
  }

  const { token, amount, currency, merchantReference } = parsed.data;
  const tokenRecord = tokenVault.get(token);

  if (!tokenRecord) {
    return res.status(404).json({ error: 'Token not found' });
  }

  if (isTokenExpired(tokenRecord)) {
    return res.status(410).json({ error: 'Token expired' });
  }

  if (ENFORCE_ONE_TIME_TOKEN && tokenRecord.usedAt) {
    return res.status(409).json({ error: 'Token already used' });
  }

  const paymentId = makeId('pay');
  const response = {
    paymentId,
    status: 'authorized',
    amount,
    currency,
    merchantReference,
    token,
    maskedPan: tokenRecord.maskedPan,
    createdAt: new Date().toISOString(),
  };

  tokenRecord.usedAt = response.createdAt;
  paymentsByIdempotency.set(idempotencyKey, response);
  paymentsById.set(paymentId, response);

  res.status(201).json(response);
});

app.post('/v1/refunds', requireSecureTransport, requireBearerToken, (req, res) => {
  const parsed = refundSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.issues });
  }

  const idempotencyKey = req.header('idempotency-key');
  if (!idempotencyKey || idempotencyKey.length < 8 || idempotencyKey.length > 128) {
    return res.status(400).json({ error: 'Missing or invalid Idempotency-Key header' });
  }

  if (refundsByIdempotency.has(idempotencyKey)) {
    return res.status(200).json(refundsByIdempotency.get(idempotencyKey));
  }

  const { paymentId, amount, reason } = parsed.data;
  const payment = paymentsById.get(paymentId);

  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  if (amount > payment.amount) {
    return res.status(400).json({ error: 'Refund amount exceeds original payment amount' });
  }

  const refundResponse = {
    refundId: makeId('ref'),
    paymentId,
    amount,
    currency: payment.currency,
    status: 'refunded',
    reason: reason || null,
    createdAt: new Date().toISOString(),
  };

  refundsByIdempotency.set(idempotencyKey, refundResponse);
  res.status(201).json(refundResponse);
});

// ── Session auth routes ──────────────────────────────────────────

app.post('/api/login', requireSecureTransport, (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid credentials format' });
  }

  // Mock: accept any well-formed email + non-empty password.
  // Replace with real user lookup before going to production.
  const { email } = parsed.data;
  req.session.user = { email };

  res.json({ email });
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
  res.json({ email: req.session.user.email });
});

// ── Checkout proxy (UI → here → payment API) ─────────────────────

app.post('/api/checkout', requireSecureTransport, (req, res) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.issues });
  }

  const { card, amount, currency, merchantReference } = parsed.data;

  // Tokenize the card internally (no raw card data leaves this function).
  const token = makeId('tok');
  const issuedAtMs = Date.now();
  const expiresAtMs = issuedAtMs + TOKEN_TTL_SECONDS * 1000;
  const tokenRecord = {
    token,
    fingerprint: crypto.createHash('sha256').update(`${card.cardNumber}|${card.expiryMonth}|${card.expiryYear}`).digest('hex'),
    maskedPan: maskPan(card.cardNumber),
    expiryMonth: card.expiryMonth,
    expiryYear: card.expiryYear,
    cardholderName: card.cardholderName,
    metadata: req.session.user ? { userEmail: req.session.user.email } : {},
    createdAt: new Date(issuedAtMs).toISOString(),
    expiresAt: new Date(expiresAtMs).toISOString(),
    expiresAtMs,
    usedAt: null,
  };
  tokenVault.set(token, tokenRecord);

  // Charge the token immediately (one-time use, same request).
  const paymentId = makeId('pay');
  const idempotencyKey = makeId('idk');
  const payment = {
    paymentId,
    status: 'authorized',
    amount,
    currency,
    merchantReference,
    token,
    maskedPan: tokenRecord.maskedPan,
    createdAt: new Date().toISOString(),
  };

  tokenRecord.usedAt = payment.createdAt;
  paymentsByIdempotency.set(idempotencyKey, payment);
  paymentsById.set(paymentId, payment);

  // Return only safe, non-sensitive fields to the browser.
  res.status(201).json({
    paymentId: payment.paymentId,
    status: payment.status,
    maskedPan: payment.maskedPan,
    amount: payment.amount,
    currency: payment.currency,
    createdAt: payment.createdAt,
  });
});

app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  next(err);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Mock payment API listening on port ${PORT}`);
  });
}

module.exports = app;

