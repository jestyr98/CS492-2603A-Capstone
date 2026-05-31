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
    appendPaymentAudit,
  } = deps;

  const normalizeCardNumber = (cardNumber) => String(cardNumber || '').replace(/\s+/g, '');

  const getFailureReasonForCard = (cardDigits) => {
    if (cardDigits.endsWith('0002')) {
      return { code: 'insufficient_funds', message: 'Payment failed: insufficient funds.', retryable: false, status: 402 };
    }

    if (cardDigits.endsWith('9995')) {
      return { code: 'network_error', message: 'Payment failed: network error.', retryable: true, status: 503 };
    }

    if (cardDigits.endsWith('0000')) {
      return { code: 'invalid_card', message: 'Payment failed: invalid card.', retryable: false, status: 400 };
    }

    return null;
  };

  const createTokenFromCard = (card, metadata = {}) => {
    const normalizedCardNumber = normalizeCardNumber(card.cardNumber);
    const token = makeId('tok');
    const issuedAtMs = Date.now();
    const expiresAtMs = issuedAtMs + TOKEN_TTL_SECONDS * 1000;
    const failureReason = getFailureReasonForCard(normalizedCardNumber);

    const tokenRecord = {
      token,
      fingerprint: crypto.createHash('sha256').update(`${normalizedCardNumber}|${card.expiryMonth}|${card.expiryYear}`).digest('hex'),
      maskedPan: maskPan(normalizedCardNumber),
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      cardholderName: card.cardholderName,
      metadata: metadata || {},
      createdAt: new Date(issuedAtMs).toISOString(),
      expiresAt: new Date(expiresAtMs).toISOString(),
      expiresAtMs,
      usedAt: null,
      mockFailure: failureReason,
    };

    tokenVault.set(token, tokenRecord);
    appendPaymentAudit({ token, amount: null, result: 'token_created' });
    return tokenRecord;
  };

  const chargeWithToken = ({ token, amount, currency, merchantReference, idempotencyKey }) => {
    const tokenRecord = tokenVault.get(token);

    if (!tokenRecord) {
      return { status: 404, body: { error: 'Token not found', code: 'token_not_found' } };
    }

    if (isTokenExpired(tokenRecord)) {
      return { status: 410, body: { error: 'Token expired', code: 'token_expired' } };
    }

    if (ENFORCE_ONE_TIME_TOKEN && tokenRecord.usedAt) {
      return { status: 409, body: { error: 'Token already used', code: 'token_already_used' } };
    }

    if (tokenRecord.mockFailure) {
      appendPaymentAudit({ token, amount, result: tokenRecord.mockFailure.code });
      return {
        status: tokenRecord.mockFailure.status,
        body: {
          error: tokenRecord.mockFailure.message,
          code: tokenRecord.mockFailure.code,
          retryable: tokenRecord.mockFailure.retryable,
        },
      };
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
    if (idempotencyKey) {
      paymentsByIdempotency.set(idempotencyKey, response);
    }
    paymentsById.set(paymentId, response);
    appendPaymentAudit({ token, amount, result: 'authorized' });
    return { status: 201, body: response };
  };

  app.post('/v1/tokens', requireSecureTransport, requireBearerToken, (req, res) => {
    const parsed = tokenizeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error.issues });
    }

    const { card, metadata } = parsed.data;
    const tokenRecord = createTokenFromCard(card, metadata);

    res.status(201).json({
      token: tokenRecord.token,
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
    const charge = chargeWithToken({ token, amount, currency, merchantReference, idempotencyKey });
    res.status(charge.status).json(charge.body);
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
    const tokenRecord = createTokenFromCard(card, req.session.user ? { userEmail: req.session.user.email } : {});
    const charge = chargeWithToken({
      token: tokenRecord.token,
      amount,
      currency,
      merchantReference,
      idempotencyKey: makeId('idk'),
    });

    if (charge.status !== 201) {
      return res.status(charge.status).json(charge.body);
    }

    return res.status(201).json({
      paymentId: charge.body.paymentId,
      status: charge.body.status,
      maskedPan: charge.body.maskedPan,
      amount: charge.body.amount,
      currency: charge.body.currency,
      createdAt: charge.body.createdAt,
    });
  });

  app.post('/api/payments/tokenize', requireSecureTransport, (req, res) => {
    const parsed = tokenizeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error.issues });
    }

    const tokenRecord = createTokenFromCard(
      parsed.data.card,
      req.session.user ? { userEmail: req.session.user.email } : {}
    );

    return res.status(201).json({
      token: tokenRecord.token,
      maskedPan: tokenRecord.maskedPan,
      expiryMonth: tokenRecord.expiryMonth,
      expiryYear: tokenRecord.expiryYear,
      createdAt: tokenRecord.createdAt,
      expiresAt: tokenRecord.expiresAt,
    });
  });

  app.post('/api/payments/charge', requireSecureTransport, (req, res) => {
    const parsed = paymentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error.issues });
    }

    const idempotencyKey = req.header('idempotency-key') || makeId('idk');

    if (paymentsByIdempotency.has(idempotencyKey)) {
      return res.status(200).json(paymentsByIdempotency.get(idempotencyKey));
    }

    const { token, amount, currency, merchantReference } = parsed.data;
    const charge = chargeWithToken({ token, amount, currency, merchantReference, idempotencyKey });
    return res.status(charge.status).json(charge.body);
  });
}

module.exports = registerPaymentRoutes;
