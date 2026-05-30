const crypto = require('crypto');

function createPaymentState() {
  const tokenVault = new Map();
  const paymentsByIdempotency = new Map();
  const paymentsById = new Map();
  const refundsByIdempotency = new Map();

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

  return {
    tokenVault,
    paymentsByIdempotency,
    paymentsById,
    refundsByIdempotency,
    makeId,
    maskPan,
    isTokenExpired,
    crypto,
  };
}

module.exports = { createPaymentState };
