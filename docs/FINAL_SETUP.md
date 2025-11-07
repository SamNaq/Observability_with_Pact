# ✅ Final Setup - Credentials Updated

## 📝 Current Configuration

Your Grafana Cloud credentials have been updated:

- **Remote Write URL**: `https://prometheus-prod-13-prod-us-east-0.grafana.net/api/prom/push`
- **Username**: `sa-1-pact_observability-22e7813e-0512-415e-8288-3cd3ad70e749`
- **Token**: `<your-grafana-cloud-token>`

## 🚀 Start Pushing Metrics

```bash
# Terminal 1 - Start Provider
npm run dev:provider

# Terminal 2 - Start Consumer
npm run dev:consumer

# Terminal 3 - Push Metrics
npm run metrics:push
```

## 📊 View Your Dashboard

Once metrics are pushing successfully:
**https://samernaqvi.grafana.net/d/pact-observability/pact-contract-testing-observability**

## 🔍 If You Still Get Authentication Errors

The error "legacy auth cannot be upgraded because the host is not found" suggests the endpoint might need adjustment. 

### Option 1: Check Your Grafana Cloud Account

1. Go to https://samernaqvi.grafana.net/
2. Navigate to **"Connections"** → **"Data Sources"** → **"Prometheus"**
3. Look for **"Remote Write"** or **"Send Data"** section
4. Check if there's a different endpoint URL shown

### Option 2: Use Prometheus Agent

Prometheus Agent handles authentication better:

```bash
# Install Prometheus
brew install prometheus

# Run with config
prometheus --config.file=prometheus/prometheus-cloud.yml
```

### Option 3: Verify Service Account Permissions

1. Go to **"My Account"** → **"Service Accounts"**
2. Find "Demo-Pact-Observability"
3. Verify it has **"MetricsPublisher"** or **"Admin"** permissions

## ✅ Files Ready

All configuration files are updated and ready:
- ✅ `.env.cloud` - Credentials configured
- ✅ `prometheus/prometheus-cloud.yml` - Prometheus config ready
- ✅ `scripts/start-metrics-pusher.js` - Push script configured



