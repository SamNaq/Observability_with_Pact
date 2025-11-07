# Fixing "No Data" in Grafana Dashboard

## 🔍 Problem

The dashboard shows "No data" because:
1. **No metrics have been generated yet** - Tests need to be run to create Pact metrics
2. **Metrics haven't been pushed to Grafana Cloud** - Metrics need to be scraped and pushed

## ✅ Solution

### Step 1: Generate Metrics by Running Tests

Run the Pact tests to generate metrics:

```bash
# Run consumer tests
npm run test:consumer

# Run provider tests  
npm run test:provider

# Or run both
npm test
```

This will:
- Execute Pact tests
- Increment `pact_tests_total` metrics
- Record `pact_test_duration_seconds` metrics
- Generate contract data

### Step 2: Start Services (if not running)

```bash
# Terminal 1 - Provider
npm run dev:provider

# Terminal 2 - Consumer
npm run dev:consumer
```

### Step 3: Start Prometheus (if not running)

```bash
# Navigate to Prometheus directory
cd ~/Downloads/prometheus-3.7.3.darwin-amd64

# Start Prometheus with cloud config
./prometheus --config.file=/Users/samer.naqvi/Demo_Observability/prometheus/prometheus-cloud.yml
```

This will:
- Scrape metrics from localhost:3000 and localhost:3001
- Push metrics to Grafana Cloud every 15 seconds

### Step 4: Start Metrics Pusher (Alternative)

If Prometheus isn't running, use the metrics pusher:

```bash
npm run metrics:push
```

This will:
- Fetch metrics from services every 15 seconds
- Push them directly to Grafana Cloud

### Step 5: Verify Metrics in Grafana Cloud

1. Go to https://samernaqvi.grafana.net/
2. Click **"Explore"** in the left sidebar
3. Select your **Prometheus** data source
4. Run this query: `pact_tests_total`
5. You should see metrics with labels like:
   - `test_type=consumer|provider`
   - `status=success|failure`
   - `consumer=user-consumer`
   - `provider=user-provider`

### Step 6: Refresh Dashboard

Once metrics are in Grafana Cloud:
1. Go back to your dashboard
2. Click the refresh button (or wait for auto-refresh)
3. You should now see data in all panels!

## 🔧 Troubleshooting

### Still seeing "No data"?

1. **Check if metrics are being generated:**
   ```bash
   curl http://localhost:3000/metrics | grep pact_tests_total
   curl http://localhost:3001/metrics | grep pact_tests_total
   ```

2. **Check if Prometheus is scraping:**
   - Go to http://localhost:9090/targets
   - Check if targets are "UP" and green

3. **Check if metrics are being pushed:**
   - Check Prometheus logs for errors
   - Check metrics pusher logs for errors

4. **Verify Grafana Cloud data source:**
   - Go to Grafana Cloud → Connections → Data Sources
   - Make sure Prometheus data source is configured correctly
   - Test the connection

5. **Check time range:**
   - Make sure dashboard time range covers when tests were run
   - Try "Last 6 hours" or "Last 1 hour"

## 📊 Expected Metrics

After running tests, you should see:
- `pact_tests_total{test_type="consumer",status="success",consumer="user-consumer",provider="user-provider"}`
- `pact_tests_total{test_type="provider",status="success",consumer="user-consumer",provider="user-provider"}`
- `pact_test_duration_seconds_bucket{...}` (histogram)
- `pact_contracts_published_total{...}` (if contracts are published)

## 🎯 Quick Test

Run this to verify everything works:

```bash
# 1. Start services
npm run dev:provider &
npm run dev:consumer &

# 2. Run tests
npm test

# 3. Start Prometheus (or metrics pusher)
# Prometheus:
cd ~/Downloads/prometheus-3.7.3.darwin-amd64
./prometheus --config.file=/Users/samer.naqvi/Demo_Observability/prometheus/prometheus-cloud.yml &

# OR metrics pusher:
npm run metrics:push &

# 4. Wait 30 seconds for metrics to be pushed
# 5. Refresh dashboard in Grafana Cloud
```




