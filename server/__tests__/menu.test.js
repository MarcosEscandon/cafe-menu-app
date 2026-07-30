const request = require('supertest');
const { app } = require('./helpers');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');

let adminToken;

beforeEach(async () => {
  const admin = new User({
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin',
    name: 'Test Admin'
  });
  await admin.save();

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.com', password: 'admin123' });
  adminToken = res.body.token;
});

describe('GET /api/menu', () => {
  it('devuelve lista vacía inicialmente', async () => {
    const res = await request(app).get('/api/menu');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('devuelve items del menú', async () => {
    await MenuItem.create({
      name: 'Test Café',
      description: 'Un café de prueba',
      price: 2.50,
      category: 'café',
      preparationTime: 3
    });

    const res = await request(app).get('/api/menu');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Test Café');
  });

  it('filtra por categoría', async () => {
    await MenuItem.create([
      { name: 'Café A', description: 'Desc', price: 2, category: 'café', preparationTime: 3 },
      { name: 'Té A', description: 'Desc', price: 2, category: 'té', preparationTime: 3 }
    ]);

    const res = await request(app).get('/api/menu?category=café');
    expect(res.body.length).toBe(1);
    expect(res.body[0].category).toBe('café');
  });
});

describe('POST /api/menu', () => {
  it('crea item con admin autenticado', async () => {
    const res = await request(app)
      .post('/api/menu')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Nuevo Café',
        description: 'Descripción',
        price: 3.00,
        category: 'café',
        preparationTime: 5
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Nuevo Café');
  });

  it('rechaza creación sin autenticación', async () => {
    const res = await request(app)
      .post('/api/menu')
      .send({ name: 'Test', description: 'Desc', price: 1, category: 'café' });

    expect(res.status).toBe(401);
  });

  it('rechaza categoría inválida', async () => {
    const res = await request(app)
      .post('/api/menu')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test',
        description: 'Desc',
        price: 1,
        category: 'invalida',
        preparationTime: 3
      });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/menu/:id', () => {
  it('actualiza item existente', async () => {
    const item = await MenuItem.create({
      name: 'Original',
      description: 'Desc',
      price: 2,
      category: 'café',
      preparationTime: 3
    });

    const res = await request(app)
      .put(`/api/menu/${item._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Actualizado',
        description: 'Nueva desc',
        price: 3.50,
        category: 'café',
        preparationTime: 5
      });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Actualizado');
    expect(res.body.price).toBe(3.50);
  });
});

describe('DELETE /api/menu/:id', () => {
  it('elimina item existente', async () => {
    const item = await MenuItem.create({
      name: 'Para borrar',
      description: 'Desc',
      price: 1,
      category: 'café',
      preparationTime: 2
    });

    const res = await request(app)
      .delete(`/api/menu/${item._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    const check = await MenuItem.findById(item._id);
    expect(check).toBeNull();
  });
});
