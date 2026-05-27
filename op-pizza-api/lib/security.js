const crypto = require('crypto');

function createSecurity({ API_BEARER_TOKEN, ALLOW_INSECURE_LOCALHOST }) {
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

  function hasAdminMenuAccess(sessionUser) {
    if (!sessionUser || sessionUser.accountType !== 'employee') {
      return false;
    }

    const title = String(sessionUser.jobTitle || '').toLowerCase();
    return title.includes('manager') || title.includes('lead') || title.includes('supervisor');
  }

  function requireAdminMenuAccess(req, res, next) {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'Not signed in' });
    }

    if (!hasAdminMenuAccess(req.session.user)) {
      return res.status(403).json({ error: 'Admin access is restricted to Shift Leads and Managers.' });
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

  return {
    requireBearerToken,
    requireSession,
    hasAdminMenuAccess,
    requireAdminMenuAccess,
    requireSecureTransport,
  };
}

module.exports = { createSecurity };
