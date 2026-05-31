const crypto = require('crypto');

function createPaymentState() {
  const tokenVault = new Map();
  const paymentsByIdempotency = new Map();
  const paymentsById = new Map();
  const refundsByIdempotency = new Map();
  const paymentAuditLog = [];

  function makeId(prefix) {
    return `${prefix}_${crypto.randomBytes(12).toString('hex')}`;
  }

  function maskPan(cardNumber) {
    const last4 = cardNumber.slice(-4);
    return `**** **** **** ${last4}`;
  }

  function isTokenExpired(tokenRecord) {
    return Date.now() >= tokenRecord.expiresAtMs;
  }

  function appendPaymentAudit({ token = null, amount = null, result }) {
    paymentAuditLog.push({
      token,
      amount,
      timestamp: new Date().toISOString(),
      result,
    });
  }

  return {
    tokenVault,
    paymentsByIdempotency,
    paymentsById,
    refundsByIdempotency,
    paymentAuditLog,
    makeId,
    maskPan,
    isTokenExpired,
    appendPaymentAudit,
    crypto,
  };
}

module.exports = { createPaymentState };
