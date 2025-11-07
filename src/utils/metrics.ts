import { Registry, Counter, Histogram, Gauge } from 'prom-client';
import { logger } from './logger';

// Create a Registry to register the metrics
export const register = new Registry();

// Add default metrics
register.setDefaultLabels({
  app: 'demo-observability',
  environment: process.env.NODE_ENV || 'development',
});

// HTTP Request Metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// Pact Test Metrics
export const pactTestTotal = new Counter({
  name: 'pact_tests_total',
  help: 'Total number of Pact tests executed',
  labelNames: ['test_type', 'status', 'consumer', 'provider'],
});

export const pactTestDuration = new Histogram({
  name: 'pact_test_duration_seconds',
  help: 'Duration of Pact tests in seconds',
  labelNames: ['test_type', 'consumer', 'provider'],
  buckets: [0.5, 1, 2, 5, 10, 30, 60],
});

export const pactContractPublished = new Counter({
  name: 'pact_contracts_published_total',
  help: 'Total number of Pact contracts published to broker',
  labelNames: ['consumer', 'provider', 'version'],
});

// API Business Metrics
export const userOperationsTotal = new Counter({
  name: 'user_operations_total',
  help: 'Total number of user operations',
  labelNames: ['operation', 'status'],
});

export const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
});

// Register all metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(pactTestTotal);
register.registerMetric(pactTestDuration);
register.registerMetric(pactContractPublished);
register.registerMetric(userOperationsTotal);
register.registerMetric(activeConnections);

logger.info('Prometheus metrics initialized');

export default register;



