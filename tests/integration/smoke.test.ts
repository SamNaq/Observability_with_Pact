import request from 'supertest';
import fetch from 'node-fetch';

const SUITE = 'smoke';
const PROVIDER_BASE_URL = process.env.PROVIDER_URL || 'http://localhost:3001';

async function reportResult(status: 'pass' | 'fail') {
  try {
    await fetch(`${PROVIDER_BASE_URL}/internal/metrics/test-runs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suite: SUITE, status }),
    });
  } catch (error) {
    // Don't fail tests just because metrics reporting failed
    console.warn('Unable to report smoke test result', error);
  }
}

async function runWithMetrics(fn: () => Promise<void>) {
  try {
    await fn();
    await reportResult('pass');
  } catch (error) {
    await reportResult('fail');
    throw error;
  }
}

describe('Smoke integration tests', () => {
  it('should report provider health', async () => {
    await runWithMetrics(async () => {
      const response = await request(PROVIDER_BASE_URL).get('/health').expect(200);
      expect(response.body).toMatchObject({
        status: 'healthy',
        service: 'user-provider',
      });
    });
  });

  it('should create and retrieve a user successfully', async () => {
    await runWithMetrics(async () => {
      const payload = {
        name: 'Smoke Test User',
        email: `smoke-${Date.now()}@example.com`,
      };

      const createResponse = await request(PROVIDER_BASE_URL).post('/api/users').send(payload).expect(201);
      expect(createResponse.body).toMatchObject({
        name: payload.name,
        email: payload.email,
      });

      const { id } = createResponse.body;
      expect(id).toBeDefined();

      const fetchResponse = await request(PROVIDER_BASE_URL).get(`/api/users/${id}`).expect(200);
      expect(fetchResponse.body).toMatchObject({
        id,
        name: payload.name,
        email: payload.email,
      });
    });
  });
});

