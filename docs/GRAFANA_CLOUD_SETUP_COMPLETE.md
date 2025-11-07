# ✅ Grafana Cloud Setup Complete!

Your Grafana Cloud dashboard has been created successfully!

## 🎉 Dashboard Created

**Dashboard URL:** https://samernaqvi.grafana.net/d/pact-observability/pact-contract-testing-observability

The dashboard is now available in your Grafana Cloud account!

## 📊 Next Steps: Start Pushing Metrics

### Option 1: Using Prometheus (Recommended)

If you have Prometheus installed locally:

1. **Start your services:**
   ```bash
   # Terminal 1
   npm run dev:provider
   
   # Terminal 2
   npm run dev:consumer
   ```

2. **Start Prometheus with Grafana Cloud config:**
   ```bash
   # Download Prometheus if needed: https://prometheus.io/download/
   ./prometheus --config.file=prometheus/prometheus-cloud.yml
   ```

   Prometheus will:
   - Scrape metrics from your services (localhost:3000, localhost:3001)
   - Automatically push metrics to Grafana Cloud every 15 seconds

3. **Generate some metrics:**
   ```bash
   # Terminal 3
   npm run test:consumer
   npm run test:provider
   
   # Or generate API traffic
   ./scripts/generate-traffic.sh
   ```

4. **View your dashboard:**
   - Go to: https://samernaqvi.grafana.net/d/pact-observability/pact-contract-testing-observability
   - You should see metrics appearing!

### Option 2: Using Push Script

If you don't have Prometheus installed:

1. **Start your services:**
   ```bash
   npm run dev:provider  # Terminal 1
   npm run dev:consumer   # Terminal 2
   ```

2. **Load credentials and push metrics:**
   ```bash
   # Terminal 3
   source .env.cloud
   ./scripts/push-to-grafana-cloud.sh
   ```

   This will push metrics once. For continuous updates, run it in a loop:
   ```bash
   while true; do
     ./scripts/push-to-grafana-cloud.sh
     sleep 15
   done
   ```

### Option 3: Using Node.js Script (Continuous)

I can create a Node.js script that continuously pushes metrics. Let me know if you'd like this!

## 🔍 Troubleshooting

### Dashboard shows "No data"

1. **Check Prometheus data source:**
   - Go to https://samernaqvi.grafana.net/connections/datasources
   - Make sure there's a Prometheus data source configured
   - If not, add one pointing to your Grafana Cloud Prometheus instance

2. **Verify metrics are being sent:**
   - Check that your services are running: http://localhost:3000/metrics
   - Check Prometheus logs (if using Option 1)
   - Verify the remote write URL is correct

3. **Check service account permissions:**
   - Ensure your service account token has "MetricsPublisher" permissions
   - Verify the token is correct in `.env.cloud`

### Prometheus can't connect to Grafana Cloud

The remote write URL might need adjustment. Common URLs:
- `https://samernaqvi.grafana.net/api/prom/push`
- `https://prometheus-prod-XX.grafana.net/api/prom/push`
- Check your Grafana Cloud account for the exact endpoint

### Services not running

Make sure both services are running:
```bash
# Check if services are up
curl http://localhost:3000/metrics
curl http://localhost:3001/metrics
```

## 📋 Files Created

- ✅ `prometheus/prometheus-cloud.yml` - Prometheus config for Grafana Cloud
- ✅ `.env.cloud` - Your Grafana Cloud credentials (keep this safe!)
- ✅ Dashboard created in Grafana Cloud
- ✅ `scripts/push-to-grafana-cloud.sh` - Script to push metrics

## 🎯 Quick Start Summary

```bash
# 1. Start services
npm run dev:provider  # Terminal 1
npm run dev:consumer   # Terminal 2

# 2. Start Prometheus (if installed)
./prometheus --config.file=prometheus/prometheus-cloud.yml

# 3. Generate metrics
npm run test:consumer
npm run test:provider

# 4. View dashboard
# Open: https://samernaqvi.grafana.net/d/pact-observability/pact-contract-testing-observability
```

## 📚 Resources

- **Your Dashboard:** https://samernaqvi.grafana.net/d/pact-observability/pact-contract-testing-observability
- **Grafana Cloud Docs:** https://grafana.com/docs/grafana-cloud/
- **Prometheus Remote Write:** https://prometheus.io/docs/prometheus/latest/storage/#remote-storage-integrations



