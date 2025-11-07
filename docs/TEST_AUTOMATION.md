# Automated Contract Test Workflow

The GitHub Actions workflow `Contract Test Automation` runs Pact consumer and provider checks on every push or pull request to `main`. Use this as the “testability” pillar in your demo.

## What the Workflow Does

1. Installs project dependencies with `npm ci`.
2. Runs `npm run test:consumer` to generate Pact contracts.
3. Runs `npm run test:provider` to verify the provider against the latest contracts.
4. Uploads the generated contracts from `pact_contract/` as a build artifact for download.

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
```

## Customize

- Add more test suites (integration, synthetic checks) and extend the workflow.
- Publish Pact files to a broker by adding a job step that runs `npm run pact:publish` with the appropriate credentials.

