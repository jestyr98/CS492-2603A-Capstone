# Mock Payment API (Tokenization)

A local mock payment API that simulates tokenization and payment authorization while applying secure-by-default patterns:

- No raw card data is stored after tokenization.
- API access requires bearer token auth.
- Payment and token endpoints reject insecure transport unless localhost dev mode is enabled.
- Rate-limited and hardened with helmet.
- Idempotency support for payment submissions.
- Token expiration support.
- One-time token usage enforcement.
- Refund endpoint for mock payment reversals.

## Quick Start

1. Copy `.env.example` to `.env` and set your own token.
2. Install dependencies:

```bash
npm install
```

3. Run in dev mode:

```bash
npm run dev
```

The API starts on `http://localhost:8080` by default.

4. Run tests:

```bash
npm test
```

## Environment Variables

- `PORT`: API port (default `8080`)
- `API_BEARER_TOKEN`: shared token required for auth
- `ALLOW_INSECURE_LOCALHOST`: `true` for local HTTP testing only
- `TRUST_PROXY`: set `true` when behind a trusted reverse proxy
- `TOKEN_TTL_SECONDS`: token lifetime in seconds (default `900`)
- `ENFORCE_ONE_TIME_TOKEN`: `true` to allow each token only once (default `true`)

## Endpoints

### `GET /health`
Returns service status.

### `POST /v1/tokens`
Tokenizes card details.

Headers:
- `Authorization: Bearer <API_BEARER_TOKEN>`

Body:

```json
{
  "card": {
    "cardNumber": "4111111111111111",
    "expiryMonth": 12,
    "expiryYear": 2030,
    "cvv": "123",
    "cardholderName": "Jane Doe"
  },
  "metadata": {
    "customerId": "12345"
  }
}
```

### `POST /v1/payments`
Submits a mock authorization using a token.

Headers:
- `Authorization: Bearer <API_BEARER_TOKEN>`
- `Idempotency-Key: <unique-request-key>`

Body:

```json
{
  "token": "tok_<from-tokenization>",
  "amount": 19.99,
  "currency": "USD",
  "merchantReference": "ORDER-1001"
}
```

### `POST /v1/refunds`
Submits a mock refund tied to a previous payment.

Headers:
- `Authorization: Bearer <API_BEARER_TOKEN>`
- `Idempotency-Key: <unique-request-key>`

Body:

```json
{
  "paymentId": "pay_<from-payment>",
  "amount": 10.0,
  "reason": "Customer requested partial refund"
}
```

## Example cURL

```bash
curl -X POST http://localhost:8080/v1/tokens \
  -H "Authorization: Bearer dev-token-only" \
  -H "Content-Type: application/json" \
  -d '{"card":{"cardNumber":"4111111111111111","expiryMonth":12,"expiryYear":2030,"cvv":"123","cardholderName":"Jane Doe"}}'
```

```bash
curl -X POST http://localhost:8080/v1/payments \
  -H "Authorization: Bearer dev-token-only" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: test-key-001" \
  -d '{"token":"tok_REPLACE_ME","amount":19.99,"currency":"USD","merchantReference":"ORDER-1001"}'
```

```bash
curl -X POST http://localhost:8080/v1/refunds \
  -H "Authorization: Bearer dev-token-only" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: refund-key-001" \
  -d '{"paymentId":"pay_REPLACE_ME","amount":10.00,"reason":"Customer requested partial refund"}'
```

## Notes

This project is intentionally a mock and should not be used as a real PCI-compliant payment processor. For production, use a certified payment provider and managed vault/tokenization service.
