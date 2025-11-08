/**
 * Failure demo suite used to demonstrate Grafana alerting.
 * Only runs when DEMO_FAIL_PROVIDER=true to keep normal pipelines green.
 */

if (process.env.DEMO_FAIL_PROVIDER === 'true') {
  describe('[FAILURE DEMO] Provider Route Failures', () => {
    it('always fails for demo purposes', () => {
      const error: any = new Error('Intentional provider failure for Grafana alert demo');
      error.pactMetrics = { testType: 'provider', status: 'failure', durationSeconds: 0 };
      throw error;
    });
  });
}

