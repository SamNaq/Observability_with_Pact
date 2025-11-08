import supertest from 'supertest';
import { Server } from 'http';
import { startServer as startProviderServer } from '../../provider/server';
import { createConsumerApp as createApp } from '../../consumer/server';

describe('Consumer API Routes', () => {
  let providerServer: Server;
  let providerPort: number;
  let appRequest: any;

  beforeAll(async () => {
    providerServer = startProviderServer(0);
    await new Promise((resolve) => providerServer.once('listening', resolve));
    const address = providerServer.address();
    providerPort =
      typeof address === 'object' && address && typeof address.port === 'number'
        ? address.port
        : 3001;

    const consumerApp = createApp(`http://127.0.0.1:${providerPort}`);
    appRequest = supertest(consumerApp);
  });

  afterAll(async () => {
    await new Promise((resolve, reject) =>
      providerServer.close((err) => (err ? reject(err) : resolve(null)))
    );
  });

  it('returns list of users from provider', async () => {
    const response = await appRequest.get('/api/users').expect(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('id');
  });

  it('returns single user when existing id is requested', async () => {
    const response = await appRequest.get('/api/users/1').expect(200);
    expect(response.body).toHaveProperty('id', '1');
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('email');
  });

  it('returns 404 for missing user', async () => {
    await appRequest.get('/api/users/9999').expect(404);
  });

  it('creates a new user via provider', async () => {
    const payload = { name: 'Coverage User', email: 'coverage@example.com' };
    const response = await appRequest.post('/api/users').send(payload).expect(201);
    expect(response.body).toMatchObject({
      name: payload.name,
      email: payload.email,
    });
    expect(response.body).toHaveProperty('id');
  });
});

