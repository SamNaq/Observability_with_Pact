import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import axios, { AxiosInstance } from 'axios';
import { logger } from '../src/utils/logger';
import { register, activeConnections } from '../src/utils/metrics';
import { metricsMiddleware, errorHandler } from '../src/utils/middleware';

const app = express();
const PORT = process.env.CONSUMER_PORT || 3000;
const PROVIDER_URL = process.env.PROVIDER_URL || 'http://localhost:3001';

// Create axios instance for provider API
const providerClient: AxiosInstance = axios.create({
  baseURL: PROVIDER_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Middleware
app.use(express.json());
app.use(metricsMiddleware);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'user-consumer',
    status: 'running',
    version: '1.0.0',
    providerUrl: PROVIDER_URL,
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

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'user-consumer' });
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

// Get all users (proxies to provider)
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    logger.info('Fetching all users from provider', { providerUrl: PROVIDER_URL });
    const response = await providerClient.get('/api/users');
    res.json(response.data);
  } catch (error: any) {
    logger.error('Error fetching users from provider', {
      error: error.message,
      providerUrl: PROVIDER_URL,
    });
    res.status(500).json({ error: 'Failed to fetch users from provider' });
  }
});

// Get user by ID (proxies to provider)
app.get('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info('Fetching user from provider', { userId: id, providerUrl: PROVIDER_URL });
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
      providerUrl: PROVIDER_URL,
    });
    res.status(500).json({ error: 'Failed to fetch user from provider' });
  }
});

// Create user (proxies to provider)
app.post('/api/users', async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    logger.info('Creating user via provider', { name, email, providerUrl: PROVIDER_URL });
    const response = await providerClient.post('/api/users', { name, email });
    res.status(201).json(response.data);
  } catch (error: any) {
    if (error.response?.status === 400) {
      logger.warn('Validation error creating user', { error: error.response.data });
      return res.status(400).json(error.response.data);
    }
    logger.error('Error creating user via provider', {
      error: error.message,
      providerUrl: PROVIDER_URL,
    });
    res.status(500).json({ error: 'Failed to create user via provider' });
  }
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 User Consumer API running on port ${PORT}`, {
    port: PORT,
    providerUrl: PROVIDER_URL,
    environment: process.env.NODE_ENV || 'development',
  });
  activeConnections.inc();
});

export default app;
