require('dotenv').config();

const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const lusca = require('lusca');
const bcrypt = require('bcryptjs');

const { loadConfig } = require('./lib/config');
const { createSecurity } = require('./lib/security');
const { createPaymentState } = require('./lib/paymentState');
const { createMenuDatabase } = require('./lib/menuDatabase');
const { createNotificationService } = require('./lib/notificationService');
const schemas = require('./lib/schemas');

const registerAuthRoutes = require('./routes/authRoutes');
const registerPaymentRoutes = require('./routes/paymentRoutes');
const registerMenuRoutes = require('./routes/menuRoutes');

const app = express();
const config = loadConfig();

const {
  PORT,
  API_BEARER_TOKEN,
  SESSION_SECRET,
  ALLOWED_ORIGINS,
  ALLOW_INSECURE_LOCALHOST,
  TRUST_PROXY,
  TOKEN_TTL_SECONDS,
  ENFORCE_ONE_TIME_TOKEN,
  BCRYPT_SALT_ROUNDS,
  APP_ASSETS_DIR,
} = config;

const security = createSecurity({ API_BEARER_TOKEN, ALLOW_INSECURE_LOCALHOST });
const paymentState = createPaymentState();
const notificationService = createNotificationService();
const menuDb = createMenuDatabase(config);

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

app.use('/api', lusca.csrf());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

registerAuthRoutes(app, {
  requireSecureTransport: security.requireSecureTransport,
  ensureMenuDatabase: menuDb.ensureMenuDatabase,
  dbGet: menuDb.dbGet,
  dbRun: menuDb.dbRun,
  getAccountByEmail: menuDb.getAccountByEmail,
  bcrypt,
  BCRYPT_SALT_ROUNDS,
  registerSchema: schemas.registerSchema,
  loginSchema: schemas.loginSchema,
  forgotPasswordSchema: schemas.forgotPasswordSchema,
  resetPasswordSchema: schemas.resetPasswordSchema,
  hasAdminMenuAccess: security.hasAdminMenuAccess,
});

registerPaymentRoutes(app, {
  requireSecureTransport: security.requireSecureTransport,
  requireBearerToken: security.requireBearerToken,
  tokenizeSchema: schemas.tokenizeSchema,
  paymentSchema: schemas.paymentSchema,
  refundSchema: schemas.refundSchema,
  checkoutSchema: schemas.checkoutSchema,
  tokenVault: paymentState.tokenVault,
  paymentsByIdempotency: paymentState.paymentsByIdempotency,
  paymentsById: paymentState.paymentsById,
  refundsByIdempotency: paymentState.refundsByIdempotency,
  makeId: paymentState.makeId,
  isTokenExpired: paymentState.isTokenExpired,
  maskPan: paymentState.maskPan,
  TOKEN_TTL_SECONDS,
  ENFORCE_ONE_TIME_TOKEN,
  crypto: paymentState.crypto,
  paymentAuditLog: paymentState.paymentAuditLog,
  appendPaymentAudit: paymentState.appendPaymentAudit,
});

registerMenuRoutes(app, {
  APP_ASSETS_DIR,
  requireSecureTransport: security.requireSecureTransport,
  requireSession: security.requireSession,
  requireAdminMenuAccess: security.requireAdminMenuAccess,
  ensureMenuDatabase: menuDb.ensureMenuDatabase,
  getMenuSections: menuDb.getMenuSections,
  dbAll: menuDb.dbAll,
  dbGet: menuDb.dbGet,
  dbRun: menuDb.dbRun,
  adminMenuItemSchema: schemas.adminMenuItemSchema,
  adminMenuItemUpdateSchema: schemas.adminMenuItemUpdateSchema,
  orderSubmissionSchema: schemas.orderSubmissionSchema,
  sendOrderNotification: notificationService.sendOrderNotification,
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
