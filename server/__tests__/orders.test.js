const request = require('supertest');
const { app } = require('./helpers');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');

let token;
let menuItem;

beforeEach(async () => {
  const user = new User({
    email: 'waiter@test.com',
    password: 'waiter123',
    role: 'waiter',
    name: 'Test Waiter'
  });
  await user.save();

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'waiter@test.com', password: 'waiter123' });
  token = res.body.token;

  menuItem = await MenuItem.create({
    name: 'Café Test',
    description: 'Desc',
    price: 2.50,
    category: 'café',
    preparationTime: 3
  });
});

describe('POST /api/orders', () => {
  it('crea pedido con items válidos', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerName: 'Cliente Test',
        items: [{
          menuItem: menuItem._id.toString(),
          quantity: 2,
          customizations: [{ name: 'Tamaño', value: 'Grande', priceModifier: 0.50 }]
        }],
        orderType: 'dine-in',
        tableNumber: '5'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('orderNumber');
    expect(res.body.customerName).toBe('Cliente Test');
    expect(res.body.status).toBe('pendiente');
    expect(res.body.totalAmount).toBe(6.00); // (2.50 + 0.50) * 2
  });

  it('rechaza pedido sin autenticación', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'Test',
        items: [{ menuItem: menuItem._id.toString(), quantity: 1 }],
        orderType: 'dine-in'
      });

    expect(res.status).toBe(401);
  });

  it('rechaza pedido con item inexistente', async () => {
    const fakeId = '000000000000000000000000';
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerName: 'Test',
        items: [{ menuItem: fakeId, quantity: 1 }],
        orderType: 'dine-in'
      });

    expect(res.status).toBe(400);
  });

  it('recalcula total del lado del servidor ignorando subtotal del cliente', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerName: 'Test',
        items: [{
          menuItem: menuItem._id.toString(),
          quantity: 1,
          subtotal: 0.50 // Intentar precio fraudulento
        }],
        orderType: 'dine-in'
      });

    expect(res.status).toBe(201);
    expect(res.body.totalAmount).toBe(2.50); // Precio real desde DB
  });
});

describe('GET /api/orders', () => {
  it('requiere autenticación', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });

  it('devuelve pedidos del usuario autenticado', async () => {
    const createRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerName: 'Test',
        items: [{ menuItem: menuItem._id.toString(), quantity: 1 }],
        orderType: 'takeaway'
      });
    const orderId = createRes.body._id;

    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.some(o => o._id === orderId)).toBe(true);
  });
});

describe('PATCH /api/orders/:id/status', () => {
  it('actualiza estado del pedido', async () => {
    const createRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerName: 'Test',
        items: [{ menuItem: menuItem._id.toString(), quantity: 1 }],
        orderType: 'dine-in'
      });
    const orderId = createRes.body._id;

    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'confirmado' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('confirmado');
  });
});
