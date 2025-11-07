# Accessing Prometheus and Grafana

## 📊 Prometheus

### What is Prometheus?

Prometheus is a **metrics collection and monitoring system**. It:
- ✅ **Collects metrics** from your services (HTTP requests, Pact tests, etc.)
- ✅ **Stores metrics** in a time-series database
- ✅ **Provides a web UI** to query and visualize metrics
- ❌ **Does NOT collect logs** (logs are separate - see `logs/` directory)

### Accessing Prometheus

**Option 1: Using Docker (Recommended)**

1. Start Docker infrastructure:
   ```bash
   docker-compose up -d
   ```

2. Wait for services to start (about 30 seconds):
   ```bash
   docker-compose ps
   ```

3. Open Prometheus UI:
   ```
   http://localhost:9090
   ```

**Option 2: Without Docker (Local Prometheus)**

1. Download Prometheus: https://prometheus.io/download/
2. Extract and run:
   ```bash
   ./prometheus --config.file=prometheus/prometheus-local.yml
   ```
3. Access at: http://localhost:9090

### Using Prometheus Web UI

Once you access http://localhost:9090:

1. **Check Targets**: Click "Status" → "Targets" to see if services are being scraped
   - Should show: `user-consumer` and `user-provider` as "UP"

2. **Query Metrics**: Use the "Graph" tab to query metrics:
   ```promql
   # HTTP request rate
   rate(http_requests_total[5m])
   
   # Pact test results
   pact_tests_total
   
   # User operations
   rate(user_operations_total[5m])
   
   # HTTP request duration (p95)
   histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
   ```

3. **View Metrics**: Click "Graph" to visualize metrics over time

### What Metrics Are Available?

Prometheus collects these metrics from your services:

- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - HTTP request duration
- `pact_tests_total` - Pact test execution counts
- `pact_test_duration_seconds` - Pact test duration
- `user_operations_total` - User operation counts
- `active_connections` - Active connections

### Metrics Endpoints (Direct Access)

You can also view raw metrics directly:
- Consumer: http://localhost:3000/metrics
- Provider: http://localhost:3001/metrics

These are in Prometheus format and show all available metrics.

## 📈 Grafana Dashboard

### What is Grafana?

Grafana is a **visualization and dashboarding tool** that:
- ✅ Connects to Prometheus (or other data sources)
- ✅ Creates beautiful dashboards with charts and graphs
- ✅ Shows metrics in a user-friendly way
- ❌ **Does NOT show logs** (logs are in `logs/` directory)

### Accessing Grafana

**Option 1: Using Docker**

1. Start Docker infrastructure:
   ```bash
   docker-compose up -d
   ```

2. Access Grafana:
   ```
   http://localhost:3002
   ```
   - Username: `admin`
   - Password: `admin`

3. View Dashboard:
   - Navigate to **Dashboards** → **Pact Contract Testing Observability**

**Option 2: Without Docker**

You can use Grafana Cloud (free tier):
1. Sign up: https://grafana.com/auth/sign-up/create-user
2. Create Prometheus data source
3. Import dashboard from `grafana/dashboards/pact-observability.json`

### What the Grafana Dashboard Shows

The dashboard visualizes:
- HTTP Request Rate and Duration
- Pact Test Results and Duration
- User Operations Metrics
- Active Connections
- Status Code Distribution
- Pact Test Success Rate

## 📝 Logs (Separate from Prometheus)

**Logs are NOT in Prometheus/Grafana**. They are stored separately:

### View Logs

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

### Log Files Location

```
logs/
├── combined.log        # All application logs
├── error.log           # Error logs only
├── pact-consumer.log   # Consumer test logs
└── pact-provider.log   # Provider test logs
```

## 🔍 Quick Summary

| Item | Location | Access |
|------|----------|--------|
| **Metrics** | Prometheus | http://localhost:9090 (with Docker) |
| **Dashboards** | Grafana | http://localhost:3002 (with Docker) |
| **Raw Metrics** | Service endpoints | http://localhost:3000/metrics |
| **Logs** | File system | `logs/` directory |

## 🚀 Quick Start (With Docker)

1. **Start services:**
   ```bash
   npm run dev:provider  # Terminal 1
   npm run dev:consumer  # Terminal 2
   ```

2. **Start infrastructure:**
   ```bash
   docker-compose up -d
   ```

3. **Generate metrics:**
   ```bash
   npm run test:consumer
   npm run test:provider
   ```

4. **Access:**
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3002 (admin/admin)

## 📊 Example Prometheus Queries

Try these in the Prometheus UI (http://localhost:9090):

```promql
# Total HTTP requests
sum(http_requests_total)

# HTTP request rate (requests per second)
rate(http_requests_total[5m])

# Pact test success rate
sum(pact_tests_total{status="success"}) / sum(pact_tests_total) * 100

# Average HTTP request duration
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# User operations by type
sum by (operation) (user_operations_total)
```

## 🐛 Troubleshooting

### Prometheus not scraping services?

1. Check targets: http://localhost:9090/targets
2. Verify services are running: http://localhost:3000/metrics
3. Check Docker networking:
   ```bash
   docker-compose logs prometheus
   ```

### No metrics showing?

1. Make sure services are running
2. Generate some traffic or run tests
3. Wait a few seconds for scraping interval (15s default)
4. Check metrics endpoint directly: http://localhost:3000/metrics

### Grafana no data?

1. Verify Prometheus data source is configured
2. Check Prometheus has data: http://localhost:9090/graph
3. Ensure services are running and generating metrics



