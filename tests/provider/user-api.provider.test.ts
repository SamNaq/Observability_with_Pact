import { Verifier } from '@pact-foundation/pact';
import { logger } from '../../src/utils/logger';
import path from 'path';
import axios from 'axios';
import { Server } from 'http';
import { startServer as startProviderServer } from '../../provider/server';

describe('User API Provider Verification', () => {
  let providerServer: Server | null = null;
  let providerBaseUrl = process.env.PROVIDER_URL || 'http://localhost:3001';
  let metricsEndpoint = process.env.PACT_METRICS_URL || `${providerBaseUrl}/internal/metrics/pact-tests`;

  beforeAll(async () => {
    if (!process.env.PROVIDER_URL) {
      providerServer = startProviderServer(0);
      await new Promise((resolve) => providerServer!.once('listening', resolve));
      const address = providerServer!.address();
      const port =
        typeof address === 'object' && address && typeof address.port === 'number'
          ? address.port
          : 3001;
      providerBaseUrl = `http://127.0.0.1:${port}`;
      metricsEndpoint = `${providerBaseUrl}/internal/metrics/pact-tests`;
    }
  });

  afterAll(async () => {
    if (providerServer) {
      await new Promise((resolve, reject) =>
        providerServer!.close((err) => (err ? reject(err) : resolve(null)))
      );
    }
  });

  async function recordPactMetric(
    status: 'success' | 'failure',
    durationSeconds?: number
  ): Promise<void> {
    try {
      await axios.post(
        metricsEndpoint,
        {
          testType: 'provider',
          status,
          consumer: 'user-consumer',
          provider: 'user-provider',
          durationSeconds,
        },
        { timeout: 2000 }
      );
    } catch (error: any) {
      logger.warn('Unable to record provider pact metric', {
        error: error?.message || String(error),
      });
    }
  }

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
    const brokerUrl = process.env.PACT_BROKER_URL;
    const brokerUsername = process.env.PACT_BROKER_USERNAME;
    const brokerPassword = process.env.PACT_BROKER_PASSWORD;

    if (brokerUrl && brokerUsername && brokerPassword) {
      verifierOptions.pactBrokerUrl = process.env.PACT_BROKER_URL;
      verifierOptions.pactBrokerUsername = brokerUsername;
      verifierOptions.pactBrokerPassword = brokerPassword;
      verifierOptions.publishVerificationResult = true;
      verifierOptions.providerVersion = process.env.PROVIDER_VERSION || '1.0.0';
      verifierOptions.consumerVersionSelectors = [
        {
          latest: true,
        },
      ];
      // Remove pactUrls when using broker
      delete verifierOptions.pactUrls;
    } else if (brokerUrl || brokerUsername || brokerPassword) {
      logger.warn('Partial Pact Broker credentials detected. Falling back to local pact files.', {
        hasUrl: Boolean(brokerUrl),
        hasUsername: Boolean(brokerUsername),
        hasPassword: Boolean(brokerPassword),
      });
    }

    const verifier = new Verifier(verifierOptions);

    try {
      const output = await verifier.verifyProvider();
      const duration = (Date.now() - testStart) / 1000;

      expect(output).toBeDefined();

      await recordPactMetric('success', duration);

      logger.info('Provider verification passed', {
        duration: `${duration.toFixed(3)}s`,
        status: 'success',
        providerBaseUrl,
      });
    } catch (error: any) {
      const duration = (Date.now() - testStart) / 1000;
      if (error?.pactMetrics) {
        await recordPactMetric(
          error.pactMetrics.status || 'failure',
          error.pactMetrics.durationSeconds ?? duration
        );
      } else {
        await recordPactMetric('failure', duration);
      }

      logger.error('Provider verification failed', {
        error: error?.message || String(error),
        duration: `${duration.toFixed(3)}s`,
        providerBaseUrl,
      });
      throw error;
    }
  }, 30000); // 30 second timeout
});
