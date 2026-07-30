const request = require('supertest');
const { app } = require('./helpers');

describe('GET /api/health', () => {
  it('devuelve healthy cuando la DB está conectada', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('database', 'connected');
    expect(res.body).toHaveProperty('nodeVersion');
  });

  it('devuelve timestamp ISO', async () => {
    const res = await request(app).get('/api/health');
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });
});

describe('GET /', () => {
  it('devuelve mensaje de bienvenida', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Café Bosque');
  });
});
