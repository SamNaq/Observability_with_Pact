import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import { logger } from '../src/utils/logger';
import { register, activeConnections, testRunsTotal, testCoveragePercent } from '../src/utils/metrics';
import { metricsMiddleware, errorHandler } from '../src/utils/middleware';
import { userOperationsTotal, pactTestTotal, pactTestDuration } from '../src/utils/metrics';
import { Server } from 'http';

const app = express();
const DEFAULT_PORT = Number(process.env.PROVIDER_PORT || 3001);

// Middleware
app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);

// In-memory data store
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

const users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    createdAt: new Date().toISOString(),
  },
];

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'user-provider',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      api: {
        users: '/api/users',
        userById: '/api/users/:id',
      },
    },
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'user-provider' });
});

// Metrics endpoint
app.get('/metrics', async (req: Request, res: Response) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
});

// Get all users
app.get('/api/users', (req: Request, res: Response) => {
  try {
    logger.info('Fetching all users', { count: users.length });
    userOperationsTotal.inc({ operation: 'list', status: 'success' });
    res.json(users);
  } catch (error) {
    userOperationsTotal.inc({ operation: 'list', status: 'error' });
    throw error;
  }
});

// Get user by ID
app.get('/api/users/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info('Fetching user by ID', { userId: id });
    
    const user = users.find((u) => u.id === id);
    
    if (!user) {
      userOperationsTotal.inc({ operation: 'get', status: 'not_found' });
      logger.warn('User not found', { userId: id });
      return res.status(404).json({ error: 'User not found' });
    }

    userOperationsTotal.inc({ operation: 'get', status: 'success' });
    res.json(user);
  } catch (error) {
    userOperationsTotal.inc({ operation: 'get', status: 'error' });
    throw error;
  }
});

// Create user
app.post('/api/users', (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    logger.info('Creating new user', { name, email });

    if (!name || !email) {
      userOperationsTotal.inc({ operation: 'create', status: 'validation_error' });
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const newUser: User = {
      id: String(users.length + 1),
      name,
      email,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    userOperationsTotal.inc({ operation: 'create', status: 'success' });
    logger.info('User created successfully', { userId: newUser.id });
    res.status(201).json(newUser);
  } catch (error) {
    userOperationsTotal.inc({ operation: 'create', status: 'error' });
    throw error;
  }
});

// Update user
app.put('/api/users/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    logger.info('Updating user', { userId: id, name, email });

    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      userOperationsTotal.inc({ operation: 'update', status: 'not_found' });
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) users[userIndex].name = name;
    if (email) users[userIndex].email = email;

    userOperationsTotal.inc({ operation: 'update', status: 'success' });
    logger.info('User updated successfully', { userId: id });
    res.json(users[userIndex]);
  } catch (error) {
    userOperationsTotal.inc({ operation: 'update', status: 'error' });
    throw error;
  }
});

// Delete user
app.delete('/api/users/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info('Deleting user', { userId: id });

    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      userOperationsTotal.inc({ operation: 'delete', status: 'not_found' });
      return res.status(404).json({ error: 'User not found' });
    }

    users.splice(userIndex, 1);
    userOperationsTotal.inc({ operation: 'delete', status: 'success' });
    logger.info('User deleted successfully', { userId: id });
    res.status(204).send();
  } catch (error) {
    userOperationsTotal.inc({ operation: 'delete', status: 'error' });
    throw error;
  }
});

// Error handling
app.use(errorHandler);

// Internal endpoint to record automated test runs
app.post('/internal/metrics/test-runs', (req: Request, res: Response) => {
  const { suite = 'unknown', status = 'pass' } = req.body || {};

  if (!['pass', 'fail'].includes(status)) {
    return res.status(400).json({ error: 'status must be "pass" or "fail"' });
  }

  testRunsTotal.inc({ suite, status });
  logger.info('Recorded test run result', { suite, status });
  res.status(202).json({ recorded: true });
});

app.post('/internal/metrics/pact-tests', (req: Request, res: Response) => {
  const {
    testType = 'consumer',
    status = 'success',
    consumer = 'user-consumer',
    provider = 'user-provider',
    durationSeconds,
  } = req.body || {};

  if (!['consumer', 'provider'].includes(testType)) {
    return res.status(400).json({ error: 'testType must be "consumer" or "provider"' });
  }

  if (!['success', 'failure'].includes(status)) {
    return res.status(400).json({ error: 'status must be "success" or "failure"' });
  }

  pactTestTotal.inc({
    test_type: testType,
    status,
    consumer,
    provider,
  });

  if (typeof durationSeconds === 'number' && Number.isFinite(durationSeconds)) {
    pactTestDuration.observe(
      {
        test_type: testType,
        consumer,
        provider,
      },
      durationSeconds
    );
  }

  logger.info('Recorded pact test result', {
    testType,
    status,
    durationSeconds,
  });

  res.status(202).json({ recorded: true });
});

app.post('/internal/metrics/test-coverage', (req: Request, res: Response) => {
  const {
    suite = 'unknown',
    metric = 'lines',
    value,
  } = req.body || {};

  const numericValue = Number(value);

  if (!suite || typeof suite !== 'string') {
    return res.status(400).json({ error: 'suite is required' });
  }

  if (!metric || typeof metric !== 'string') {
    return res.status(400).json({ error: 'metric is required' });
  }

  if (!Number.isFinite(numericValue)) {
    return res.status(400).json({ error: 'value must be a finite number' });
  }

  testCoveragePercent.labels({ suite, metric }).set(numericValue);
  logger.info('Recorded coverage metric', { suite, metric, value: numericValue });

  res.status(202).json({ recorded: true });
});

export function startServer(port: number = DEFAULT_PORT): Server {
  const server = app.listen(port, () => {
    logger.info(`🚀 User Provider API running on port ${port}`, {
      port,
      environment: process.env.NODE_ENV || 'development',
    });
    activeConnections.inc();
  });

  return server;
}

if (require.main === module) {
  startServer(DEFAULT_PORT);
}

export default app;
