function registerPaymentRoutes(app, deps) {
  const {
    requireSecureTransport,
    requireBearerToken,
    tokenizeSchema,
    paymentSchema,
    refundSchema,
    checkoutSchema,
    tokenVault,
    paymentsByIdempotency,
    paymentsById,
    refundsByIdempotency,
    makeId,
    isTokenExpired,
    maskPan,
    TOKEN_TTL_SECONDS,
    ENFORCE_ONE_TIME_TOKEN,
    crypto,
  } = deps;

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

  app.post('/api/checkout', requireSecureTransport, (req, res) => {
    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error.issues });
    }

    const { card, amount, currency, merchantReference } = parsed.data;

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

    res.status(201).json({
      paymentId: payment.paymentId,
      status: payment.status,
      maskedPan: payment.maskedPan,
      amount: payment.amount,
      currency: payment.currency,
      createdAt: payment.createdAt,
    });
  });
}

module.exports = registerPaymentRoutes;
