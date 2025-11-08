import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import axios from 'axios';
import { Server } from 'http';
import { logger } from '../src/utils/logger';
import { register, activeConnections } from '../src/utils/metrics';
import { metricsMiddleware, errorHandler } from '../src/utils/middleware';

const DEFAULT_PORT = Number(process.env.CONSUMER_PORT || 3000);
const DEFAULT_PROVIDER_URL = process.env.PROVIDER_URL || 'http://localhost:3001';

export function createConsumerApp(providerBaseUrl: string = DEFAULT_PROVIDER_URL) {
  const app = express();
  const providerClient = axios.create({
    baseURL: providerBaseUrl,
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  app.use(express.json());
  app.use(metricsMiddleware);

  app.get('/', (req: Request, res: Response) => {
    res.json({
      service: 'user-consumer',
      status: 'running',
      version: '1.0.0',
      providerUrl: providerBaseUrl,
      endpoints: {
        health: '/health',
        metrics: '/metrics',
        api: {
          users: '/api/users',
          userById: '/api/users/:id',
          createUser: 'POST /api/users',
        },
      },
    });
  });

  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'healthy', service: 'user-consumer' });
  });

  app.get('/metrics', async (req: Request, res: Response) => {
    try {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (error) {
      res.status(500).end(error);
    }
  });

  app.get('/api/users', async (req: Request, res: Response) => {
    try {
      logger.info('Fetching all users from provider', { providerUrl: providerBaseUrl });
      const response = await providerClient.get('/api/users');
      res.json(response.data);
    } catch (error: any) {
      logger.error('Error fetching users from provider', {
        error: error.message,
        providerUrl: providerBaseUrl,
      });
      res.status(500).json({ error: 'Failed to fetch users from provider' });
    }
  });

  app.get('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      logger.info('Fetching user from provider', { userId: id, providerUrl: providerBaseUrl });
      const response = await providerClient.get(`/api/users/${id}`);
      res.json(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        logger.warn('User not found in provider', { userId: req.params.id });
        return res.status(404).json({ error: 'User not found' });
      }
      logger.error('Error fetching user from provider', {
        error: error.message,
        userId: req.params.id,
        providerUrl: providerBaseUrl,
      });
      res.status(500).json({ error: 'Failed to fetch user from provider' });
    }
  });

  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      const { name, email } = req.body;
      logger.info('Creating user via provider', { name, email, providerUrl: providerBaseUrl });
      const response = await providerClient.post('/api/users', { name, email });
      res.status(201).json(response.data);
    } catch (error: any) {
      if (error.response?.status === 400) {
        logger.warn('Validation error creating user', { error: error.response.data });
        return res.status(400).json(error.response.data);
      }
      logger.error('Error creating user via provider', {
        error: error.message,
        providerUrl: providerBaseUrl,
      });
      res.status(500).json({ error: 'Failed to create user via provider' });
    }
  });

  app.use(errorHandler);

  return app;
}

export function startServer(
  port: number = DEFAULT_PORT,
  providerBaseUrl: string = DEFAULT_PROVIDER_URL
): Server {
  const app = createConsumerApp(providerBaseUrl);
  const server = app.listen(port, () => {
    logger.info(`🚀 User Consumer API running on port ${port}`, {
      port,
      providerUrl: providerBaseUrl,
      environment: process.env.NODE_ENV || 'development',
    });
    activeConnections.inc();
  });
  return server;
}

const defaultApp = createConsumerApp(DEFAULT_PROVIDER_URL);

if (require.main === module) {
  startServer(DEFAULT_PORT, DEFAULT_PROVIDER_URL);
}

export default defaultApp;
