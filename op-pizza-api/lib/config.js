const path = require('path');

function loadConfig() {
  const PORT = Number(process.env.PORT || 8080);
  const API_BEARER_TOKEN = process.env.API_BEARER_TOKEN || 'dev-token-only';
  const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-session-secret-replace-in-prod';
  const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',').map((s) => s.trim());
  const ALLOW_INSECURE_LOCALHOST = String(process.env.ALLOW_INSECURE_LOCALHOST || 'true').toLowerCase() === 'true';
  const TRUST_PROXY = String(process.env.TRUST_PROXY || 'false').toLowerCase() === 'true';
  const TOKEN_TTL_SECONDS = Number(process.env.TOKEN_TTL_SECONDS || 900);
  const ENFORCE_ONE_TIME_TOKEN = String(process.env.ENFORCE_ONE_TIME_TOKEN || 'true').toLowerCase() === 'true';
  const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 12);

  const appDbDir = path.resolve(__dirname, '..', '..', 'op-pizza', 'database');
  const APP_DB_PATH = path.join(appDbDir, 'op_pizza.db');
  const APP_DB_SCHEMA_PATH = path.join(appDbDir, 'schema.sql');
  const APP_DB_SEED_PATH = path.join(appDbDir, 'seed.sql');
  const APP_DEV_SECRETS_PATH = path.resolve(__dirname, '..', '..', 'op-pizza', 'src', 'secrets.txt');
  const APP_ASSETS_DIR = path.resolve(__dirname, '..', '..', 'op-pizza', 'src', 'assets');

  return {
    PORT,
    API_BEARER_TOKEN,
    SESSION_SECRET,
    ALLOWED_ORIGINS,
    ALLOW_INSECURE_LOCALHOST,
    TRUST_PROXY,
    TOKEN_TTL_SECONDS,
    ENFORCE_ONE_TIME_TOKEN,
    BCRYPT_SALT_ROUNDS,
    APP_DB_PATH,
    APP_DB_SCHEMA_PATH,
    APP_DB_SEED_PATH,
    APP_DEV_SECRETS_PATH,
    APP_ASSETS_DIR,
  };
}

module.exports = { loadConfig };
