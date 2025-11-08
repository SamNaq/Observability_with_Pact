# Automated Contract Test Workflow

The GitHub Actions workflow `Contract Test Automation` runs Pact consumer and provider checks on every push or pull request to `main`. Use this as the “testability” pillar in your demo.

## What the Workflow Does

1. Installs project dependencies with `npm ci`.
2. Runs `npm run test:consumer` to generate Pact contracts.
3. Runs `npm run test:provider` to verify the provider against the latest contracts.
4. Runs `npm run test:integration` (smoke checks backed by metrics).
5. Uploads the generated contracts from `pact_contract/` as a build artifact for download.

## How to Demo It

- Push a change or open a pull request; the workflow triggers automatically.
- Show the GitHub Action result—green for success, red for failures.
- Download the `pact-contracts` artifact to prove contracts were created.
- Combine this with the Grafana dashboard to tell the story of automated testing ➜ metrics ➜ observability.

## Trigger Manually

If you want to rehearse without pushing to the main repo, run the same steps locally:

```bash
npm ci
npm run test:consumer
npm run test:provider
npm run test:integration
```

## Customize

- Extend the smoke suite or add more test types (synthetic checks, load tests) and wire them into the workflow.
- Publish Pact files to a broker by adding a job step that runs `npm run pact:publish` with the appropriate credentials.

## Observability Tie-In

- The smoke suite increments the `test_runs_total{suite="smoke", status="pass|fail"}` Prometheus counter.
- Pact consumer and provider tests hit the provider’s internal metrics endpoint to increment `pact_tests_total{test_type="consumer|provider", status="success|failure"}` and `pact_test_duration_seconds`.
- Coverage reports are parsed by `scripts/report-coverage.js` and pushed as `test_coverage_percent{suite="consumer|provider|integration", metric="lines"}`.
- Grafana panels show:
  - **Smoke Test Outcomes** donut (`increase(test_runs_total[1h])`)
  - **Consumer Pact Pass Rate** and **Provider Pact Pass Rate** stats (`increase(pact_tests_total[1h])`)
  - **Test Coverage (Lines %)** table plus **Average Coverage** stat fed by `test_coverage_percent`
- During the demo, run `npm run test:integration` locally (with the metrics pusher running) to show the panel update in real time.
- For alert demos, use `npm run test:provider:fail`; see `docs/GRAFANA_ALERTS.md`.

## Coverage Reporting

Each test script runs with `--coverage` and then executes:

```bash
node scripts/report-coverage.js <suite>
```

The script reads `coverage/<suite>/coverage-summary.json` and posts the line coverage percentage to `/internal/metrics/test-coverage` on the provider service. The metrics pusher forwards `test_coverage_percent` to Grafana Cloud.

