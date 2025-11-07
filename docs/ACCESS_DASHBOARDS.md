# How to Access Prometheus and Grafana Dashboards

## 📊 Prometheus Dashboard

### What Prometheus Shows

**Prometheus collects METRICS only** (not logs):
- ✅ HTTP request counts and duration
- ✅ Pact test execution metrics
- ✅ User operation counts
- ✅ Active connections
- ❌ **Does NOT show logs** (logs are in `logs/` directory)

### Accessing Prometheus

**Step 1: Start Docker Infrastructure**

```bash
docker-compose up -d
```

Wait about 30 seconds for services to start:
```bash
docker-compose ps
```

**Step 2: Start Your Services**

In separate terminals:
```bash
# Terminal 1
npm run dev:provider

# Terminal 2
npm run dev:consumer
```

**Step 3: Generate Some Metrics**

```bash
# Run tests to generate Pact metrics
npm run test:consumer
npm run test:provider

# Or generate API traffic
./scripts/generate-traffic.sh
```

**Step 4: Access Prometheus**

Open in your browser:
```
http://localhost:9090
```

### Using Prometheus Dashboard

1. **Check Targets**: Click "Status" → "Targets"
   - Should show `user-consumer` and `user-provider` as "UP"
   - If "DOWN", check that services are running

2. **Query Metrics**: Use the search bar at the top to query metrics:
   ```promql
   # Total HTTP requests
   sum(http_requests_total)
   
   # HTTP request rate (requests per second)
   rate(http_requests_total[5m])
   
   # Pact test results
   pact_tests_total
   
   # User operations
   user_operations_total
   
   # HTTP request duration (p95)
   histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
   ```

3. **View Graph**: Click "Graph" tab to visualize metrics over time

4. **Execute Query**: Click "Execute" to see results

### Example Queries

Try these in Prometheus (http://localhost:9090):

```promql
# Total HTTP requests by service
sum by (service) (http_requests_total)

# Pact test success rate
sum(pact_tests_total{status="success"}) / sum(pact_tests_total) * 100

# Average HTTP request duration
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# User operations by type
sum by (operation) (user_operations_total)
```

## 📈 Grafana Dashboard

### What Grafana Shows

**Grafana visualizes METRICS from Prometheus** (not logs):
- ✅ HTTP Request Rate and Duration (charts)
- ✅ Pact Test Results and Duration (graphs)
- ✅ User Operations Metrics (time series)
- ✅ Active Connections (gauges)
- ✅ Status Code Distribution (bar charts)
- ❌ **Does NOT show logs** (logs are in `logs/` directory)

### Accessing Grafana

**Step 1: Start Docker Infrastructure** (if not already running)

```bash
docker-compose up -d
```

**Step 2: Access Grafana**

Open in your browser:
```
http://localhost:3002
```

Login:
- **Username**: `admin`
- **Password**: `admin`

**Step 3: View Dashboard**

1. Click **"Dashboards"** in the left menu
2. Click **"Pact Contract Testing Observability"**
3. You'll see all metrics visualized!

### What's in the Dashboard

The dashboard includes:
- **HTTP Request Rate** - Requests per second
- **HTTP Request Duration (p95)** - 95th percentile response time
- **Pact Test Results** - Test execution counts and success/failure
- **Pact Test Duration** - How long tests take
- **User Operations Rate** - User CRUD operations
- **Active Connections** - Current connections
- **Status Code Distribution** - HTTP status codes
- **Pact Test Success Rate** - Percentage of passing tests

## 📝 Logs (Separate from Prometheus/Grafana)

**Important**: Logs are NOT in Prometheus or Grafana. They are stored in files:

### View Logs

```bash
# View all logs
tail -f logs/combined.log

# View error logs only
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
├── pact-consumer.log  # Consumer test logs
└── pact-provider.log   # Provider test logs
```

## 🚀 Complete Workflow

### 1. Start Everything

```bash
# Terminal 1 - Provider
npm run dev:provider

# Terminal 2 - Consumer
npm run dev:consumer

# Terminal 3 - Start infrastructure
docker-compose up -d
```

### 2. Generate Metrics

```bash
# Run tests
npm run test:consumer
npm run test:provider

# Generate API traffic
./scripts/generate-traffic.sh
```

### 3. Access Dashboards

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3002 (admin/admin)

### 4. View Logs

```bash
tail -f logs/combined.log
```

## 📊 Summary

| Item | Location | Access | Contains |
|------|----------|--------|----------|
| **Metrics** | Prometheus | http://localhost:9090 | HTTP, Pact, User metrics |
| **Dashboards** | Grafana | http://localhost:3002 | Visualized metrics |
| **Raw Metrics** | Service endpoints | http://localhost:3000/metrics | Prometheus format |
| **Logs** | File system | `logs/` directory | Application logs |

## 🔍 Troubleshooting

### Prometheus shows "DOWN" targets?

1. Check services are running: http://localhost:3000/metrics
2. Check Docker networking: `docker-compose logs prometheus`
3. Verify Prometheus config: `prometheus/prometheus.yml`

### No metrics in Prometheus?

1. Make sure services are running
2. Generate some traffic or run tests
3. Wait a few seconds (scraping interval is 15s)
4. Check metrics endpoint: http://localhost:3000/metrics

### Grafana shows "No data"?

1. Verify Prometheus data source is configured
2. Check Prometheus has data: http://localhost:9090/graph
3. Ensure services are running and generating metrics
4. Check dashboard time range (top right corner)

### Can't access Prometheus/Grafana?

1. Check Docker is running: `docker ps`
2. Check containers are up: `docker-compose ps`
3. Verify ports are free: `lsof -i:9090` and `lsof -i:3002`



