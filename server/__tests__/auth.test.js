const request = require('supertest');
const { app } = require('./helpers');
const User = require('../models/User');

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    const user = new User({
      email: 'test@cafe.com',
      password: 'test123',
      role: 'waiter',
      name: 'Test Waiter'
    });
    await user.save();
  });

  it('loguea con credenciales válidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@cafe.com', password: 'test123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'test@cafe.com');
    expect(res.body.user).toHaveProperty('role', 'waiter');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('rechaza password incorrecto', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@cafe.com', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Credenciales inválidas');
  });

  it('rechaza email inexistente', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@cafe.com', password: 'test123' });

    expect(res.status).toBe(401);
  });

  it('es case-insensitive para email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'TEST@CAFE.COM', password: 'test123' });

    expect(res.status).toBe(200);
  });
});

describe('GET /api/auth/verify', () => {
  let token;

  beforeEach(async () => {
    const user = new User({
      email: 'verify@cafe.com',
      password: 'test123',
      role: 'kitchen',
      name: 'Test Kitchen'
    });
    await user.save();

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'verify@cafe.com', password: 'test123' });
    token = res.body.token;
  });

  it('verifica token válido', async () => {
    const res = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('verify@cafe.com');
  });

  it('rechaza token inválido', async () => {
    const res = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(401);
  });

  it('rechaza sin token', async () => {
    const res = await request(app).get('/api/auth/verify');
    expect(res.status).toBe(401);
  });
});
