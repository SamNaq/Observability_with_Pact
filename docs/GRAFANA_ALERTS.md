## Setting up Grafana Alert for Pact/Test Failures

### Alert Target
- Metric: `increase(pact_tests_total{status="failure"}[5m])` (or `test_runs_total{status="fail"}`)
- Condition: Greater than 0
- Data source: Grafana Cloud Prometheus
- Notification channel: choose your preferred (e.g., email, Slack)

### Demo Workflow
1. **Ensure metrics pusher is running** (`npm run metrics:push`) and provider/consumer services are up.
2. **Trigger the failing test intentionally:**
   ```bash
   npm run test:provider:fail
   ```
   - The failure increments `pact_tests_total{status="failure"}`.
3. **Wait for the next metrics push** (15 seconds) and refresh the dashboard:
   - `Provider Pact Pass Rate` drops below 100%.
   - `Test Automation Breakdown` shows a failure count.
4. **Grafana alert fires** because the failure metric > 0.
5. **Reset by rerunning tests without the flag:**
   ```bash
   npm run test:provider
   ```
   - Pass rate returns to 100%.

### Notes
- The failing test block is guarded by `DEMO_FAIL_PROVIDER` so normal runs stay green.
- You can create additional alerts for smoke failures using `test_runs_total{status="fail"}`.

