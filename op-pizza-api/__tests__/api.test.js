process.env.ALLOW_INSECURE_LOCALHOST = 'true';
process.env.API_BEARER_TOKEN = 'dev-token-only';
process.env.TOKEN_TTL_SECONDS = '1';
process.env.ENFORCE_ONE_TIME_TOKEN = 'true';

const request = require('supertest');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const app = require('../index');
const { loadConfig } = require('../lib/config');

const authHeader = { Authorization: 'Bearer dev-token-only' };
const { APP_DB_PATH } = loadConfig();

function openDb() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(APP_DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(db);
    });
  });
}

function dbRun(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function runCallback(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

async function setEmployeePassword(email, password) {
  const db = await openDb();
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await dbRun(
      db,
      `
        UPDATE employee_credentials
        SET password_hash = ?, hash_algorithm = 'bcrypt', password_updated_at = CURRENT_TIMESTAMP
        WHERE employee_id = (
          SELECT employee_id FROM employees WHERE LOWER(email) = LOWER(?) LIMIT 1
        );
      `,
      [passwordHash, email]
    );
  } finally {
    db.close();
  }
}

async function getCsrfToken(agent) {
  const csrfResponse = await agent.get('/api/csrf-token');
  expect(csrfResponse.status).toBe(200);
  expect(csrfResponse.body.csrfToken).toBeTruthy();
  return csrfResponse.body.csrfToken;
}

async function signIn(agent, { email, password }) {
  const csrfToken = await getCsrfToken(agent);
  const response = await agent
    .post('/api/login')
    .set('x-csrf-token', csrfToken)
    .send({ email, password });

  return response;
}

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
  beforeAll(async () => {
    await setEmployeePassword('maya.lopez@operationpizzeria.com', 'TestAdminPass!123');
  });

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

  test('returns pizza size options and tier pricing for regular pizzas', async () => {
    const menuRes = await request(app)
      .get('/api/menu');

    expect(menuRes.status).toBe(200);
    expect(Array.isArray(menuRes.body.sections)).toBe(true);

    const pizzasSection = menuRes.body.sections.find((section) => section.id === 'pizzas');
    expect(pizzasSection).toBeDefined();

    const standardPizzas = (pizzasSection.items || []).filter(
      (item) => String(item.name || '').toLowerCase() !== 'build your own pizza'
    );

    expect(standardPizzas.length).toBeGreaterThan(0);

    for (const pizza of standardPizzas) {
      expect(pizza.options?.size).toEqual(['Personal', 'Medium', 'Large']);
      expect(pizza.basePrice).toBeDefined();
      expect(pizza.basePrice.Personal).toBeCloseTo(pizza.basePrice.Medium - 3, 2);
      expect(pizza.basePrice.Medium).toBeCloseTo(pizza.basePrice.Large - 3, 2);
      expect(pizza.price).toBe(`$${Number(pizza.basePrice.Large).toFixed(2)}`);
    }
  });

  test('returns build your own pizza with 10.99 start and 3-dollar size deltas', async () => {
    const menuRes = await request(app)
      .get('/api/menu');

    expect(menuRes.status).toBe(200);
    expect(Array.isArray(menuRes.body.sections)).toBe(true);

    const pizzasSection = menuRes.body.sections.find((section) => section.id === 'pizzas');
    expect(pizzasSection).toBeDefined();

    const byodPizza = (pizzasSection.items || []).find(
      (item) => String(item.name || '').toLowerCase() === 'build your own pizza'
    );

    expect(byodPizza).toBeDefined();
    expect(byodPizza.options?.size).toEqual(['Personal', 'Medium', 'Large']);
    expect(byodPizza.basePrice).toEqual({
      Personal: 10.99,
      Medium: 13.99,
      Large: 16.99,
    });
    expect(byodPizza.price).toBe('$16.99');
  });

  test('admin can add and remove a menu item', async () => {
    const adminAgent = request.agent(app);
    const loginResponse = await signIn(adminAgent, {
      email: 'maya.lopez@operationpizzeria.com',
      password: 'TestAdminPass!123',
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.canAccessAdminMenu).toBe(true);

    const optionsResponse = await adminAgent.get('/api/admin/menu/options');
    expect(optionsResponse.status).toBe(200);

    const categories = optionsResponse.body.categories || [];
    const categoryIngredients = optionsResponse.body.categoryIngredients || [];
    const menuItems = optionsResponse.body.menuItems || [];

    const pizzaCategory = categories.find((category) => category.slug === 'pizzas') || categories[0];
    expect(pizzaCategory).toBeDefined();

    const allowedIngredientIds = categoryIngredients
      .filter((link) => link.categoryId === pizzaCategory.id)
      .map((link) => link.ingredientId);

    expect(allowedIngredientIds.length).toBeGreaterThan(0);

    const uniqueName = `QA Test Item ${Date.now()}`;
    const addCsrf = await getCsrfToken(adminAgent);
    const addResponse = await adminAgent
      .post('/api/admin/menu-items')
      .set('x-csrf-token', addCsrf)
      .send({
        categoryId: pizzaCategory.id,
        itemName: uniqueName,
        description: 'Integration test item',
        photoPath: 'qa-test-item.jpg',
        basePrice: 11.99,
        ingredientIds: [allowedIngredientIds[0]],
      });

    expect(addResponse.status).toBe(201);
    expect(addResponse.body.ok).toBe(true);
    expect(addResponse.body.menuItemId).toBeTruthy();

    const addedOptionsResponse = await adminAgent.get('/api/admin/menu/options');
    expect(addedOptionsResponse.status).toBe(200);

    const addedItem = (addedOptionsResponse.body.menuItems || []).find((item) => item.id === addResponse.body.menuItemId);
    expect(addedItem).toBeDefined();
    expect(addedItem.name).toBe(uniqueName);

    const removeCsrf = await getCsrfToken(adminAgent);
    const removeResponse = await adminAgent
      .delete(`/api/admin/menu-items/${addResponse.body.menuItemId}`)
      .set('x-csrf-token', removeCsrf);

    expect(removeResponse.status).toBe(200);
    expect(removeResponse.body.ok).toBe(true);

    const afterRemoveOptionsResponse = await adminAgent.get('/api/admin/menu/options');
    expect(afterRemoveOptionsResponse.status).toBe(200);

    const removedItem = (afterRemoveOptionsResponse.body.menuItems || []).find((item) => item.id === addResponse.body.menuItemId);
    expect(removedItem).toBeUndefined();

    expect(menuItems.some((item) => item.id === addResponse.body.menuItemId)).toBe(false);
  });

  test('customer card order submission creates order history entry and payment receipt notification', async () => {
    const customerAgent = request.agent(app);
    const uniqueEmail = `receipt-test-${Date.now()}@example.com`;

    const registerCsrf = await getCsrfToken(customerAgent);
    const registerResponse = await customerAgent
      .post('/api/register')
      .set('x-csrf-token', registerCsrf)
      .send({
        firstName: 'Receipt',
        lastName: 'Tester',
        email: uniqueEmail,
        phone: '8035554444',
        mfaMethod: 'email',
        password: 'ExamplePass123!',
      });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.email).toBe(uniqueEmail);

    const tokenizeCsrf = await getCsrfToken(customerAgent);
    const tokenizeResponse = await customerAgent
      .post('/api/payments/tokenize')
      .set('x-csrf-token', tokenizeCsrf)
      .send(tokenizePayload());

    expect(tokenizeResponse.status).toBe(201);
    expect(tokenizeResponse.body.token).toMatch(/^tok_[a-f0-9]{24}$/);

    const chargeCsrf = await getCsrfToken(customerAgent);
    const chargeResponse = await customerAgent
      .post('/api/payments/charge')
      .set('x-csrf-token', chargeCsrf)
      .set('Idempotency-Key', `order-charge-${Date.now()}`)
      .send({
        token: tokenizeResponse.body.token,
        amount: 17.99,
        currency: 'USD',
        merchantReference: `ORDER-TEST-${Date.now()}`,
      });

    expect(chargeResponse.status).toBe(201);
    expect(chargeResponse.body.status).toBe('authorized');

    const submitCsrf = await getCsrfToken(customerAgent);
    const submitResponse = await customerAgent
      .post('/api/orders/submit')
      .set('x-csrf-token', submitCsrf)
      .send({
        cartItems: [
          {
            id: 1,
            name: 'Margherita Classic',
            price: '$16.99',
            quantity: 1,
          },
        ],
        orderType: 'carryout',
        deliveryAddress: null,
        billingAddress: {
          street1: '1408 Pepper Street',
          street2: '',
          city: 'Columbia',
          state: 'SC',
          postalCode: '29201',
        },
        paymentMethod: 'card',
        tipAmount: 1.0,
        paymentStatus: chargeResponse.body.status,
        paymentId: chargeResponse.body.paymentId,
        pricing: {
          subtotal: 16.99,
          taxes: 1.0,
          fees: 0,
          total: 17.99,
        },
      });

    expect(submitResponse.status).toBe(201);
    expect(submitResponse.body.orderNumber).toMatch(/^OP-/);

    const notifications = app.locals.notificationService.sentNotifications;
    expect(Array.isArray(notifications)).toBe(true);
    expect(notifications.length).toBeGreaterThan(0);

    const receiptNotification = [...notifications].reverse().find(
      (notification) => notification.orderNumber === submitResponse.body.orderNumber
    );

    expect(receiptNotification).toBeDefined();
    expect(receiptNotification.recipient).toBe(uniqueEmail);
    expect(receiptNotification.status).toBe('payment_successful');
    expect(receiptNotification.channel).toBe('email');

    const historyResponse = await customerAgent.get('/api/orders/history');
    expect(historyResponse.status).toBe(200);

    const createdOrder = (historyResponse.body.orders || []).find(
      (order) => order.orderNumber === submitResponse.body.orderNumber
    );

    expect(createdOrder).toBeDefined();
    expect(createdOrder.status).toBe('placed');
    expect(Array.isArray(createdOrder.items)).toBe(true);
    expect(createdOrder.items.some((item) => item.name === 'Margherita Classic')).toBe(true);
  });

  test('rejects card order submission when payment status is not authorized', async () => {
    const customerAgent = request.agent(app);
    const uniqueEmail = `reject-card-${Date.now()}@example.com`;

    const registerCsrf = await getCsrfToken(customerAgent);
    const registerResponse = await customerAgent
      .post('/api/register')
      .set('x-csrf-token', registerCsrf)
      .send({
        firstName: 'Reject',
        lastName: 'Card',
        email: uniqueEmail,
        phone: '8035550000',
        mfaMethod: 'email',
        password: 'ExamplePass123!',
      });

    expect(registerResponse.status).toBe(201);

    const submitCsrf = await getCsrfToken(customerAgent);
    const submitResponse = await customerAgent
      .post('/api/orders/submit')
      .set('x-csrf-token', submitCsrf)
      .send({
        cartItems: [
          {
            id: 1,
            name: 'Margherita Classic',
            price: '$16.99',
            quantity: 1,
          },
        ],
        orderType: 'carryout',
        deliveryAddress: null,
        billingAddress: {
          street1: '1408 Pepper Street',
          street2: '',
          city: 'Columbia',
          state: 'SC',
          postalCode: '29201',
        },
        paymentMethod: 'card',
        tipAmount: 1.0,
        paymentStatus: 'declined',
        paymentId: 'pay_mock_declined_001',
        pricing: {
          subtotal: 16.99,
          taxes: 1.0,
          fees: 0,
          total: 17.99,
        },
      });

    expect(submitResponse.status).toBe(400);
    expect(submitResponse.body.error).toBe('Card payment must be authorized before order submission.');
  });
});
