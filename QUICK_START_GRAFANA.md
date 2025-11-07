# 🚀 Quick Start: Push Metrics to Grafana Cloud (No Prometheus Needed!)

## ✅ You Don't Need Prometheus!

The push script works perfectly without Prometheus. Just follow these steps:

### Step 1: Start Your Services

```bash
# Terminal 1 - Provider
npm run dev:provider

# Terminal 2 - Consumer  
npm run dev:consumer
```

### Step 2: Push Metrics to Grafana Cloud

```bash
# Terminal 3 - Push metrics
npm run metrics:push
```

This will:
- ✅ Fetch metrics from your services every 15 seconds
- ✅ Push them directly to Grafana Cloud
- ✅ Keep running until you press Ctrl+C
- ✅ No Prometheus installation needed!

### Step 3: Generate Metrics

In another terminal:

```bash
# Run tests to generate Pact metrics
npm run test:consumer
npm run test:provider

# Or generate API traffic
./scripts/generate-traffic.sh
```

### Step 4: View Your Dashboard

Open in your browser:
**https://samernaqvi.grafana.net/d/pact-observability/pact-contract-testing-observability**

## ⚠️ If You Get Authentication Errors

The push script might show "Invalid username or password" errors. This is because we need to verify the correct credentials from your Grafana Cloud account.

**To fix this:**

1. Go to https://samernaqvi.grafana.net/
2. Navigate to **"Connections"** → **"Data Sources"** → **"Prometheus"**
3. Look for **"Remote Write"** section
4. Share the credentials you see there (or update `.env.cloud` with them)

## 📝 Alternative: Use Prometheus (If You Want)

If you prefer to use Prometheus instead:

```bash
# Install Prometheus (macOS)
brew install prometheus

# Run Prometheus
prometheus --config.file=prometheus/prometheus-cloud.yml
```

But **the push script is easier** - no installation needed!



