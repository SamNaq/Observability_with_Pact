# Pact Contracts

This document explains how Pact contracts work in this project.

## Contract Files

The Pact contract file is stored in `../pact_contract/` directory:
- `user-consumer-user-provider.json` - Contract between consumer and provider

## How It Works

1. **Consumer Tests** (`npm run test:consumer`) generate contract files in `pact_contract/` directory
2. **Provider Tests** (`npm run test:provider`) verify the provider against these contracts
3. Contracts are stored locally - no Docker or external services required

## Optional: Using Pact Broker

If you want to use a Pact Broker (cloud-hosted or local Docker), set the `PACT_BROKER_URL` environment variable:

```bash
export PACT_BROKER_URL=http://your-broker-url
export PACT_BROKER_USERNAME=your-username
export PACT_BROKER_PASSWORD=your-password
```

Then run `npm run pact:publish` to publish contracts to the broker.

## Viewing Contracts

You can view the contract files directly - they're JSON files that describe:
- Expected request/response interactions
- Request/response schemas
- Provider states

These contracts serve as documentation and can be shared between teams via version control.

## Contract Location

All Pact contract files are stored in:
```
pact_contract/
  └── user-consumer-user-provider.json
```

This directory is in `.gitignore` by default, but you can commit contracts to version control if desired.



