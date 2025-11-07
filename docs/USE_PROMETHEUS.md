# ✅ Using Prometheus Agent (Recommended)

Based on the Grafana Cloud instructions you shared, the configuration is correct. The "invalid scope" error with the push script suggests we should use **Prometheus Agent** instead, which handles authentication better.

## 🚀 Quick Start with Prometheus

### Step 1: Start Your Services

```bash
# Terminal 1 - Start Provider
npm run dev:provider

# Terminal 2 - Start Consumer
npm run dev:consumer
```

### Step 2: Run Prometheus Agent

```bash
# Terminal 3 - Navigate to Prometheus directory
cd ~/Downloads/prometheus-3.7.3.linux-amd64/

# Run Prometheus with our config
./prometheus --config.file=/Users/samer.naqvi/Demo_Observability/prometheus/prometheus-cloud.yml
```

Prometheus will:
- ✅ Scrape metrics from localhost:3000 and localhost:3001
- ✅ Push them to Grafana Cloud automatically
- ✅ Handle authentication correctly

### Step 3: Generate Metrics

```bash
# Run tests
npm run test:consumer
npm run test:provider

# Or generate API traffic
./scripts/generate-traffic.sh
```

### Step 4: View Your Dashboard

Once Prometheus is running and pushing metrics:
**https://samernaqvi.grafana.net/d/pact-observability/pact-contract-testing-observability**

## 📝 Configuration Details

The configuration in `prometheus/prometheus-cloud.yml` matches the Grafana Cloud instructions:

- **URL**: `https://prometheus-prod-13-prod-us-east-0.grafana.net/api/prom/push` (Prometheus adds `/push` automatically)
- **Username**: `1749481` (Instance ID)
- **Password**: `<your-grafana-cloud-token>`

## 🔍 Verify Prometheus is Working

1. **Check Prometheus UI**: http://localhost:9090
2. **Check Targets**: http://localhost:9090/targets
   - Should show `user-consumer` and `user-provider` as "UP"
3. **Check Graph**: http://localhost:9090/graph
   - Query: `up` - should show metrics from your services

## ✅ Why Prometheus Agent Works Better

- ✅ Handles authentication automatically
- ✅ Properly formats metrics for remote write
- ✅ Uses protobuf format (not text/plain)
- ✅ Handles token scopes correctly
- ✅ Built specifically for remote write

## 🎯 Summary

1. ✅ Dashboard created in Grafana Cloud
2. ✅ Configuration matches Grafana Cloud instructions
3. ✅ Use Prometheus Agent (not the push script)
4. ✅ Start services and run Prometheus
5. ✅ View dashboard: https://samernaqvi.grafana.net/d/pact-observability/pact-contract-testing-observability



