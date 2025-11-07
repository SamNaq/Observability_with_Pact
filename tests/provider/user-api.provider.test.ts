import { Verifier } from '@pact-foundation/pact';
import { pactTestTotal, pactTestDuration } from '../../src/utils/metrics';
import { logger } from '../../src/utils/logger';
import path from 'path';

describe('User API Provider Verification', () => {
  const providerBaseUrl = process.env.PROVIDER_URL || 'http://localhost:3001';

  it('should verify the provider against all consumer contracts', async () => {
    const testStart = Date.now();
    
    // Use local pact files by default (no Docker required)
    const pactUrls = [path.resolve(process.cwd(), 'pact_contract', 'user-consumer-user-provider.json')];
    
    const verifierOptions: any = {
      provider: 'user-provider',
      providerBaseUrl,
      logLevel: 'info',
      pactUrls,
    };

    // Optional: Use Pact Broker if URL is provided (requires Docker/cloud broker)
    if (process.env.PACT_BROKER_URL) {
      verifierOptions.pactBrokerUrl = process.env.PACT_BROKER_URL;
      verifierOptions.pactBrokerUsername = process.env.PACT_BROKER_USERNAME;
      verifierOptions.pactBrokerPassword = process.env.PACT_BROKER_PASSWORD;
      verifierOptions.publishVerificationResult = true;
      verifierOptions.providerVersion = process.env.PROVIDER_VERSION || '1.0.0';
      verifierOptions.consumerVersionSelectors = [
        {
          latest: true,
        },
      ];
      // Remove pactUrls when using broker
      delete verifierOptions.pactUrls;
    }

    const verifier = new Verifier(verifierOptions);

    try {
      const output = await verifier.verifyProvider();
      const duration = (Date.now() - testStart) / 1000;

      expect(output).toBeDefined();

      pactTestTotal.inc({
        test_type: 'provider',
        status: 'success',
        consumer: 'user-consumer',
        provider: 'user-provider',
      });
      pactTestDuration.observe(
        {
          test_type: 'provider',
          consumer: 'user-consumer',
          provider: 'user-provider',
        },
        duration
      );

      logger.info('Provider verification passed', {
        duration: `${duration.toFixed(3)}s`,
        status: 'success',
        providerBaseUrl,
      });
    } catch (error: any) {
      const duration = (Date.now() - testStart) / 1000;
      pactTestTotal.inc({
        test_type: 'provider',
        status: 'failure',
        consumer: 'user-consumer',
        provider: 'user-provider',
      });
      pactTestDuration.observe(
        {
          test_type: 'provider',
          consumer: 'user-consumer',
          provider: 'user-provider',
        },
        duration
      );

      logger.error('Provider verification failed', {
        error: error?.message || String(error),
        duration: `${duration.toFixed(3)}s`,
        providerBaseUrl,
      });
      throw error;
    }
  }, 30000); // 30 second timeout
});
