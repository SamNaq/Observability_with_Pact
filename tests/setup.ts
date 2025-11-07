import { logger } from '../src/utils/logger';

// Global test setup
beforeAll(() => {
  logger.info('Starting Pact tests');
});

afterAll(() => {
  logger.info('Pact tests completed');
});



