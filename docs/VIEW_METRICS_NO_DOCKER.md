# Viewing Metrics Without Docker

Since Docker is not available, here are alternative ways to view your metrics:

## Option 1: View Metrics Directly (No Docker Required)

### 1. Start Your Services

**Terminal 1 - Provider:**
```bash
npm run dev:provider
```

**Terminal 2 - Consumer:**
```bash
npm run dev:consumer
```

### 2. Access Metrics Endpoints Directly

**Consumer Metrics:**
```bash
curl http://localhost:3000/metrics
```

**Provider Metrics:**
```bash
curl http://localhost:3001/metrics
```

### 3. View Metrics in Browser

Open in your browser:
- Consumer: http://localhost:3000/metrics
- Provider: http://localhost:3001/metrics

### 4. Run Tests to Generate Metrics

```bash
# In Terminal 3
npm run test:consumer
npm run test:provider
```

### 5. Generate API Traffic

```bash
# Create users
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com"}'

# Get users
curl http://localhost:3000/api/users

# Make multiple requests
for i in {1..20}; do curl http://localhost:3000/api/users; sleep 0.5; done
```

## Option 2: Use a Local Prometheus Installation

If you can install Prometheus locally (without Docker):

1. Download Prometheus: https://prometheus.io/download/
2. Update `prometheus/prometheus.yml` to use `localhost:3000` and `localhost:3001` instead of `host.docker.internal`
3. Run Prometheus: `./prometheus --config.file=prometheus/prometheus.yml`
4. Access: http://localhost:9090

## Option 3: Use Cloud Grafana (Free Tier)

1. Sign up for Grafana Cloud (free): https://grafana.com/auth/sign-up/create-user
2. Get your Prometheus remote write URL
3. Configure your services to push metrics to Grafana Cloud

## Option 4: View Logs Instead

All metrics are also logged! Check the logs directory:

```bash
# View all logs
tail -f logs/combined.log

# View error logs
tail -f logs/error.log

# View consumer test logs
tail -f logs/pact-consumer.log

# View provider test logs
tail -f logs/pact-provider.log
```

## Metrics Available

The metrics endpoints expose:
- HTTP request counts and duration
- Pact test execution metrics
- User operation counts
- Active connections

You can parse these metrics or use any Prometheus-compatible tool!
