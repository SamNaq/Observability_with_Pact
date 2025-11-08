# Demo Observability - Pact Contract Testing

Complete documentation for the Demo Observability project.

## 📚 Documentation Index

- **[QUICKSTART.md](./QUICKSTART.md)** - Quick start guide (5 minutes)
- **[RUN.md](./RUN.md)** - Step-by-step guide to run the project and view metrics in Grafana
- **[VIEW_METRICS.md](./VIEW_METRICS.md)** - Complete guide to viewing metrics
- **[VIEW_METRICS_NO_DOCKER.md](./VIEW_METRICS_NO_DOCKER.md)** - View metrics without Docker
- **[TEST_AUTOMATION.md](./TEST_AUTOMATION.md)** - Automated contract test workflow for demos
- **[GRAFANA_ALERTS.md](./GRAFANA_ALERTS.md)** - Configure alerts and demo intentional failures
- **[PACT_CONTRACTS.md](./PACT_CONTRACTS.md)** - Understanding Pact contracts

## 🎯 Features

- **Consumer-Driven Contract Testing**: Full Pact implementation with consumer and provider tests
- **Local Pact Contracts**: Pact files stored locally in `pact_contract/` (no Docker required)
- **Optional Pact Broker**: Can use cloud-hosted or local Pact Broker for centralized contract management
- **Observability Stack** (Optional - requires Docker):
  - Structured logging with Winston (always available)
  - Prometheus metrics collection
  - Grafana dashboards for visualization
- **Automated Test Workflow**: GitHub Actions pipeline runs Pact consumer/provider checks and publishes Pact artifacts
- **Smoke Integration Suite**: Lightweight API tests (`npm run test:integration`) emit `test_runs_total` metrics for dashboards
- **Dashboard Panels**: Smoke outcomes, consumer/provider pass rates, and automation breakdown highlight testability data
- **Coverage Metrics**: Jest coverage is pushed as `test_coverage_percent` and visualised alongside pass rates
- **TypeScript/Node.js**: Modern, type-safe implementation
- **Express APIs**: RESTful API services (Provider and Consumer)

## 📋 Prerequisites

- **Required**: Node.js 18+ and npm
- **Optional**: Docker and Docker Compose (only needed for Prometheus/Grafana observability or local Pact Broker)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Project

```bash
npm run build
```

### 3. Start the Services (No Docker Required!)

**Note**: Pact contracts are stored locally in `pact_contract/` - no Docker needed for contract testing!

### 4. Start the Services

In separate terminal windows:

**Terminal 1 - Provider Service:**
```bash
npm run dev:provider
```

**Terminal 2 - Consumer Service:**
```bash
npm run dev:consumer
```

### 5. Run Tests

**Consumer Tests** (generates contract files in `pact_contract/`):
```bash
npm run test:consumer
```

**Provider Tests** (verifies provider against local contracts):
```bash
# Make sure provider service is running
npm run dev:provider
# Then in another terminal:
npm run test:provider
```

**Smoke Integration Tests** (emits `test_runs_total` metrics for Grafana):
```bash
npm run test:integration
```

**Coverage Metrics**

Coverage reports are generated automatically when running the individual suites. The coverage percentage is pushed via `scripts/report-coverage.js`:

```bash
npm run test:consumer
npm run test:provider
npm run test:integration
```

Each command reports its coverage to the provider service, which exposes `test_coverage_percent` for Grafana.

**All Tests:**
```bash
npm test
```

### 6. View Pact Contracts

Pact contracts are stored locally in `pact_contract/` directory. You can:
- View contract files directly (JSON format)
- Share them with your team via version control
- Optionally publish to a Pact Broker (see below)

**Optional: Publish to Pact Broker** (if you have a broker URL):
```bash
export PACT_BROKER_URL=http://your-broker-url
export PACT_BROKER_USERNAME=your-username
export PACT_BROKER_PASSWORD=your-password
npm run pact:publish
```

### 7. Optional: Start Observability Stack (Requires Docker)

If you want to view metrics and logs in Grafana:
```bash
docker-compose up -d
```

This will start:
- **Prometheus** at http://localhost:9090
- **Grafana** at http://localhost:3002 (username: `admin`, password: `admin`)
- **Pact Broker** at http://localhost:9292 (username: `pact`, password: `pact`) - optional

**Note**: The observability stack is completely optional. Logs are always available in `logs/` and metrics are exposed at `/metrics` endpoints.

## 📊 Observability

### Logs (Always Available)

Logs are stored in the `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only
- `pact-consumer.log` - Consumer test logs
- `pact-provider.log` - Provider test logs

### Metrics Endpoints (Always Available)

- Consumer Service: http://localhost:3000/metrics
- Provider Service: http://localhost:3001/metrics

You can view these metrics directly or use any Prometheus-compatible tool.

### Pact Contracts (Local Storage)

Pact contracts are stored in `pact_contract/` directory:
- `user-consumer-user-provider.json` - Contract between consumer and provider
- View contracts directly or share via version control

### Optional: Grafana Dashboard (Requires Docker)

If you have Docker running and started the observability stack:

1. Open Grafana at http://localhost:3002
2. Login with `admin`/`admin`
3. Navigate to **Dashboards** → **Pact Contract Testing Observability**

The dashboard includes:
- HTTP Request Rate and Duration
- Pact Test Results and Duration
- User Operations Metrics
- Active Connections
- Status Code Distribution
- Pact Test Success Rate

## 🏗️ Project Structure

```
.
├── consumer/              # Consumer service
│   └── server.ts
├── provider/              # Provider service
│   └── server.ts
├── src/
│   └── utils/
│       ├── logger.ts      # Winston logger
│       ├── metrics.ts     # Prometheus metrics
│       └── middleware.ts  # Express middleware
├── tests/
│   ├── consumer/          # Consumer Pact tests
│   └── provider/          # Provider verification tests
├── pact_contract/         # Pact contract files (generated by tests)
│   └── user-consumer-user-provider.json
├── docs/                   # Documentation
│   ├── README.md          # This file
│   ├── QUICKSTART.md      # Quick start guide
│   ├── RUN.md             # Running the project
│   ├── VIEW_METRICS.md    # Viewing metrics
│   └── PACT_CONTRACTS.md  # Pact contracts guide
├── scripts/
│   ├── publish-pacts.js   # Pact publishing script
│   ├── generate-traffic.sh # Generate API traffic
│   └── kill-ports.sh      # Free up ports
├── grafana/               # Grafana configuration
│   ├── provisioning/
│   └── dashboards/
├── prometheus/
│   └── prometheus.yml     # Prometheus configuration
├── docker-compose.yml     # Infrastructure setup
└── package.json
```

## 🔧 Configuration

Copy `.env.example` to `.env` and modify as needed:

```bash
cp .env.example .env
```

### Environment Variables

- `PROVIDER_PORT` - Provider service port (default: 3001)
- `CONSUMER_PORT` - Consumer service port (default: 3000)
- `LOG_LEVEL` - Logging level (default: info)

**Optional - Pact Broker** (only if using a broker):
- `PACT_BROKER_URL` - Pact Broker URL (if not set, uses local pact files)
- `PACT_BROKER_USERNAME` - Pact Broker username
- `PACT_BROKER_PASSWORD` - Pact Broker password

## 📝 API Endpoints

### Provider Service (Port 3001)

- `GET /` - Service info and available endpoints
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics

### Consumer Service (Port 3000)

- `GET /` - Service info and available endpoints
- `GET /api/users` - Get all users (proxies to provider)
- `GET /api/users/:id` - Get user by ID (proxies to provider)
- `POST /api/users` - Create user (proxies to provider)
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics

## 🧪 Testing Workflow

1. **Consumer Tests**: Write consumer tests that define expected contracts
2. **Generate Contracts**: Consumer tests generate contract files in `pact_contract/`
3. **Provider Verification**: Run provider tests that verify against contracts
4. **Smoke Integration**: Run `npm run test:integration` to validate live endpoints and update the `test_runs_total` metric
5. **Monitor**: View metrics and logs

## 📈 Metrics Collected

- **HTTP Metrics**: Request rate, duration, status codes
- **Pact Metrics**: Test execution, duration, success/failure rates
- **Business Metrics**: User operations, active connections
- **Contract Metrics**: Contracts published to broker

## 🔍 Troubleshooting

### Services won't start
- Check if ports 3000, 3001 are available (for services)
- Ports 3002, 9090, 9292 are only needed if using Docker observability stack

### Pact Contracts not found
- Run consumer tests first: `npm run test:consumer`
- Check that `pact_contract/` directory exists and contains JSON files
- Contracts are generated automatically during consumer tests

### Provider tests failing
- Make sure provider service is running: `npm run dev:provider`
- Verify contract files exist in `pact_contract/` directory
- Check logs in `logs/pact-provider.log`

### Metrics not showing in Grafana (if using Docker)
- Verify Prometheus is scraping: http://localhost:9090/targets
- Check service metrics endpoints are accessible: http://localhost:3000/metrics
- Ensure Docker containers are running: `docker-compose ps`

### Tests failing
- Make sure services are running before running provider tests
- Check logs in `logs/` directory
- Verify contract files exist in `pact_contract/` directory

## 📚 Resources

- [Pact Documentation](https://docs.pact.io/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT License



