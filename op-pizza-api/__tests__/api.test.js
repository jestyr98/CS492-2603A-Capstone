process.env.ALLOW_INSECURE_LOCALHOST = 'true';
process.env.API_BEARER_TOKEN = 'dev-token-only';
process.env.TOKEN_TTL_SECONDS = '1';
process.env.ENFORCE_ONE_TIME_TOKEN = 'true';

const request = require('supertest');
const app = require('../index');

const authHeader = { Authorization: 'Bearer dev-token-only' };

function tokenizePayload() {
  return {
    card: {
      cardNumber: '4111111111111111',
      expiryMonth: 12,
      expiryYear: 2030,
      cvv: '123',
      cardholderName: 'Jane Doe',
    },
  };
}

describe('mock payment api', () => {
  test('creates token and payment', async () => {
    const tokenRes = await request(app)
      .post('/v1/tokens')
      .set(authHeader)
      .send(tokenizePayload());

    expect(tokenRes.status).toBe(201);
    expect(tokenRes.body.token).toMatch(/^tok_[a-f0-9]{24}$/);

    const paymentRes = await request(app)
      .post('/v1/payments')
      .set(authHeader)
      .set('Idempotency-Key', 'payment-idempotency-01')
      .send({
        token: tokenRes.body.token,
        amount: 19.99,
        currency: 'USD',
        merchantReference: 'ORDER-1001',
      });

    expect(paymentRes.status).toBe(201);
    expect(paymentRes.body.paymentId).toMatch(/^pay_[a-f0-9]{24}$/);
    expect(paymentRes.body.status).toBe('authorized');
  });

  test('rejects second use of same token', async () => {
    const tokenRes = await request(app)
      .post('/v1/tokens')
      .set(authHeader)
      .send(tokenizePayload());

    expect(tokenRes.status).toBe(201);

    const firstPayment = await request(app)
      .post('/v1/payments')
      .set(authHeader)
      .set('Idempotency-Key', 'payment-idempotency-02')
      .send({
        token: tokenRes.body.token,
        amount: 25,
        currency: 'USD',
        merchantReference: 'ORDER-1002',
      });

    expect(firstPayment.status).toBe(201);

    const secondPayment = await request(app)
      .post('/v1/payments')
      .set(authHeader)
      .set('Idempotency-Key', 'payment-idempotency-03')
      .send({
        token: tokenRes.body.token,
        amount: 25,
        currency: 'USD',
        merchantReference: 'ORDER-1003',
      });

    expect(secondPayment.status).toBe(409);
    expect(secondPayment.body.error).toBe('Token already used');
  });

  test('rejects expired token', async () => {
    const tokenRes = await request(app)
      .post('/v1/tokens')
      .set(authHeader)
      .send(tokenizePayload());

    expect(tokenRes.status).toBe(201);

    await new Promise((resolve) => setTimeout(resolve, 1100));

    const paymentRes = await request(app)
      .post('/v1/payments')
      .set(authHeader)
      .set('Idempotency-Key', 'payment-idempotency-04')
      .send({
        token: tokenRes.body.token,
        amount: 10,
        currency: 'USD',
        merchantReference: 'ORDER-1004',
      });

    expect(paymentRes.status).toBe(410);
    expect(paymentRes.body.error).toBe('Token expired');
  });

  test('creates refund for payment', async () => {
    const tokenRes = await request(app)
      .post('/v1/tokens')
      .set(authHeader)
      .send(tokenizePayload());

    expect(tokenRes.status).toBe(201);

    const paymentRes = await request(app)
      .post('/v1/payments')
      .set(authHeader)
      .set('Idempotency-Key', 'payment-idempotency-05')
      .send({
        token: tokenRes.body.token,
        amount: 42,
        currency: 'USD',
        merchantReference: 'ORDER-1005',
      });

    expect(paymentRes.status).toBe(201);

    const refundRes = await request(app)
      .post('/v1/refunds')
      .set(authHeader)
      .set('Idempotency-Key', 'refund-idempotency-01')
      .send({
        paymentId: paymentRes.body.paymentId,
        amount: 20,
        reason: 'Customer requested partial refund',
      });

    expect(refundRes.status).toBe(201);
    expect(refundRes.body.refundId).toMatch(/^ref_[a-f0-9]{24}$/);
    expect(refundRes.body.status).toBe('refunded');
    expect(refundRes.body.currency).toBe('USD');
  });
});
