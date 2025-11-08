import request from 'supertest';
import app from '../../provider/server';

describe('Provider API Routes', () => {
  it('returns service metadata on root', async () => {
    const response = await request(app).get('/').expect(200);
    expect(response.body).toHaveProperty('service', 'user-provider');
    expect(response.body).toHaveProperty('endpoints');
  });

  it('lists all users', async () => {
    const response = await request(app).get('/api/users').expect(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('returns 404 for missing user', async () => {
    await request(app).get('/api/users/9999').expect(404);
  });

  it('rejects creation without payload', async () => {
    await request(app).post('/api/users').send({}).expect(400);
  });

  it('creates a new user', async () => {
    const payload = { name: 'Provider Coverage', email: 'provider-coverage@example.com' };
    const response = await request(app).post('/api/users').send(payload).expect(201);
    expect(response.body).toMatchObject({
      name: payload.name,
      email: payload.email,
    });
    expect(response.body).toHaveProperty('id');
  });
});

if (process.env.DEMO_FAIL_PROVIDER === 'true') {
  describe('[FAILURE DEMO] Provider API Routes', () => {
    it('intentionally fails for demo alert', () => {
      throw new Error('Intentional failure for Grafana alert demo');
    });
  });
}

