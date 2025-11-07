# Viewing Metrics - Complete Guide

## ✅ Without Docker (Recommended for You)

### Step 1: Start Services

**Terminal 1:**
```bash
npm run dev:provider
```

**Terminal 2:**
```bash
npm run dev:consumer
```

### Step 2: View Metrics Directly

**Open in Browser:**
- Consumer Metrics: http://localhost:3000/metrics
- Provider Metrics: http://localhost:3001/metrics

**Or use curl:**
```bash
curl http://localhost:3000/metrics | grep -E "http_requests|pact_tests|user_operations"
```

### Step 3: Generate Metrics

**Run Tests:**
```bash
npm run test:consumer
npm run test:provider
```

**Generate API Traffic:**
```bash
./scripts/generate-traffic.sh
```

**Or manually:**
```bash
# Create users
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/users \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"User $i\", \"email\": \"user$i@example.com\"}"
done

# Fetch users
for i in {1..20}; do
  curl http://localhost:3000/api/users
  sleep 0.1
done
```

### Step 4: View Logs

```bash
# View all logs
tail -f logs/combined.log

# View error logs
tail -f logs/error.log

# View metrics in logs
grep -i "metric" logs/combined.log
```

## 📊 Metrics Available

The `/metrics` endpoints expose Prometheus-compatible metrics:

- `http_request_duration_seconds` - HTTP request duration
- `http_requests_total` - Total HTTP requests
- `pact_tests_total` - Pact test execution counts
- `pact_test_duration_seconds` - Pact test duration
- `user_operations_total` - User operation counts
- `active_connections` - Active connections

## 🔍 Parse Metrics

You can parse the metrics using any tool that supports Prometheus format:

```bash
# View specific metric
curl http://localhost:3000/metrics | grep "http_requests_total"

# Count total requests
curl http://localhost:3000/metrics | grep "http_requests_total" | grep -v "#"
```

## 📈 Alternative: Use Grafana Cloud (Free)

If you want a Grafana dashboard without Docker:

1. Sign up: https://grafana.com/auth/sign-up/create-user
2. Create a Prometheus data source
3. Configure remote write from your services
4. Import the dashboard JSON from `grafana/dashboards/pact-observability.json`

## 🛠️ Option: Local Prometheus + Grafana

If you can install Prometheus and Grafana locally (without Docker):

1. **Download Prometheus:** https://prometheus.io/download/
2. **Run Prometheus:**
   ```bash
   ./prometheus --config.file=prometheus/prometheus-local.yml
   ```
3. **Download Grafana:** https://grafana.com/grafana/download
4. **Run Grafana:**
   ```bash
   ./bin/grafana-server
   ```
5. **Access:** http://localhost:3000
6. **Configure Prometheus as data source**
7. **Import dashboard:** `grafana/dashboards/pact-observability.json`
