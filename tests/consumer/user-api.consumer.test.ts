import { Pact, Matchers } from '@pact-foundation/pact';
import { logger } from '../../src/utils/logger';
import axios, { AxiosInstance } from 'axios';
import path from 'path';

const provider = new Pact({
  consumer: 'user-consumer',
  provider: 'user-provider',
  port: 1234,
  log: path.resolve(process.cwd(), 'logs', 'pact-consumer.log'),
  logLevel: 'info',
  dir: path.resolve(process.cwd(), 'pact_contract'),
  spec: 2,
});

describe('User API Consumer Tests', () => {
  let client: AxiosInstance;
  const metricsEndpoint =
    process.env.PACT_METRICS_URL || 'http://localhost:3001/internal/metrics/pact-tests';

  async function recordPactMetric(
    status: 'success' | 'failure',
    durationSeconds?: number
  ): Promise<void> {
    try {
      await axios.post(
        metricsEndpoint,
        {
          testType: 'consumer',
          status,
          consumer: 'user-consumer',
          provider: 'user-provider',
          durationSeconds,
        },
        { timeout: 2000 }
      );
    } catch (error: any) {
      logger.warn('Unable to record consumer pact metric', {
        error: error?.message || String(error),
      });
    }
  }

  beforeAll(() => provider.setup());
  afterEach(() => provider.verify());
  afterAll(() => provider.finalize());

  beforeEach(() => {
    client = axios.create({
      baseURL: provider.mockService.baseUrl,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      validateStatus: () => true, // Don't throw on any status
    });
  });

  describe('GET /api/users', () => {
    it('should return a list of users', async () => {
      const testStart = Date.now();
      const expectedUsers = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      await provider.addInteraction({
        state: 'users exist',
        uponReceiving: 'a request for all users',
        withRequest: {
          method: 'GET',
          path: '/api/users',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: Matchers.eachLike(
            {
              id: Matchers.string('1'),
              name: Matchers.string('John Doe'),
              email: Matchers.string('john.doe@example.com'),
              createdAt: Matchers.string(),
            },
            { min: 1 }
          ),
        },
      });

      try {
        const response = await client.get('/api/users');
        const duration = (Date.now() - testStart) / 1000;

        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeGreaterThanOrEqual(1);
        // Verify structure matches
        expect(response.data[0]).toHaveProperty('id');
        expect(response.data[0]).toHaveProperty('name');
        expect(response.data[0]).toHaveProperty('email');
        expect(response.data[0]).toHaveProperty('createdAt');

        await recordPactMetric('success', duration);

        logger.info('Consumer test passed: GET /api/users', {
          duration: `${duration.toFixed(3)}s`,
          status: 'success',
        });
      } catch (error: any) {
        await recordPactMetric('failure');
        logger.error('Consumer test failed: GET /api/users', {
          error: error?.message || String(error),
        });
        throw error;
      }
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a user by ID', async () => {
      const testStart = Date.now();
      const expectedUser = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      const interaction = await provider.addInteraction({
        state: 'user with id 1 exists',
        uponReceiving: 'a request for a user by ID',
        withRequest: {
          method: 'GET',
          path: '/api/users/1',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            id: Matchers.string('1'),
            name: Matchers.string('John Doe'),
            email: Matchers.string('john.doe@example.com'),
            createdAt: Matchers.string(),
          },
        },
      });

      // Wait a moment for the interaction to be fully registered
      await new Promise(resolve => setTimeout(resolve, 10));

      try {
        const response = await client.get('/api/users/1');
        const duration = (Date.now() - testStart) / 1000;

        expect(response.status).toBe(200);
        expect(response.data.id).toBe('1');
        expect(response.data.name).toBe('John Doe');
        expect(response.data.email).toBe('john.doe@example.com');
        expect(response.data).toHaveProperty('createdAt');
        // Verify createdAt is a valid ISO date string
        expect(typeof response.data.createdAt).toBe('string');
        expect(() => new Date(response.data.createdAt)).not.toThrow();

        await recordPactMetric('success', duration);

        logger.info('Consumer test passed: GET /api/users/:id', {
          duration: `${duration.toFixed(3)}s`,
          userId: '1',
          status: 'success',
        });
      } catch (error: any) {
        await recordPactMetric('failure');
        logger.error('Consumer test failed: GET /api/users/:id', {
          error: error?.message || String(error),
        });
        throw error;
      }
    });

    it('should return 404 when user does not exist', async () => {
      const testStart = Date.now();

      const interaction = await provider.addInteraction({
        state: 'user with id 999 does not exist',
        uponReceiving: 'a request for a non-existent user',
        withRequest: {
          method: 'GET',
          path: '/api/users/999',
        },
        willRespondWith: {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            error: 'User not found',
          },
        },
      });

      // Wait a moment for the interaction to be fully registered
      await new Promise(resolve => setTimeout(resolve, 10));

      const response = await client.get('/api/users/999');
      const duration = (Date.now() - testStart) / 1000;
      expect(response.status).toBe(404);
      expect(response.data.error).toBe('User not found');

      await recordPactMetric('success', duration);

      logger.info('Consumer test passed: GET /api/users/:id (404)', {
        duration: `${duration.toFixed(3)}s`,
        status: 'success',
      });
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const testStart = Date.now();
      const newUser = {
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
      };

      const createdUser = {
        id: '3',
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      const interaction = await provider.addInteraction({
        state: 'user can be created',
        uponReceiving: 'a request to create a new user',
        withRequest: {
          method: 'POST',
          path: '/api/users',
          headers: {
            'Content-Type': 'application/json',
          },
          body: newUser,
        },
        willRespondWith: {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            id: Matchers.string(),
            name: Matchers.string('Alice Johnson'),
            email: Matchers.string('alice.johnson@example.com'),
            createdAt: Matchers.string(),
          },
        },
      });

      // Wait a moment for the interaction to be fully registered
      await new Promise(resolve => setTimeout(resolve, 10));

      try {
        const response = await client.post('/api/users', newUser);
        const duration = (Date.now() - testStart) / 1000;

        expect(response.status).toBe(201);
        expect(response.data.name).toBe(newUser.name);
        expect(response.data.email).toBe(newUser.email);
        expect(response.data.id).toBeDefined();

        await recordPactMetric('success', duration);

        logger.info('Consumer test passed: POST /api/users', {
          duration: `${duration.toFixed(3)}s`,
          status: 'success',
        });
      } catch (error: any) {
        await recordPactMetric('failure');
        logger.error('Consumer test failed: POST /api/users', {
          error: error?.message || String(error),
        });
        throw error;
      }
    });
  });
});
