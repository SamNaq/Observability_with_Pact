# 🎉 Grafana Cloud Dashboard Setup Complete!

Your dashboard has been created in your Grafana Cloud account!

## ✅ What's Done

1. ✅ **Dashboard Created** - Available at: https://samernaqvi.grafana.net/d/pact-observability/pact-contract-testing-observability
2. ✅ **Prometheus Config** - Created at `prometheus/prometheus-cloud.yml`
3. ✅ **Push Script** - Ready to push metrics continuously
4. ✅ **Environment File** - Credentials saved in `.env.cloud`

## 🚀 Quick Start: Push Metrics to Grafana Cloud

### Step 1: Start Your Services

```bash
# Terminal 1
npm run dev:provider

# Terminal 2
npm run dev:consumer
```

### Step 2: Push Metrics (Choose One Method)

#### Option A: Using Node.js Script (Easiest - No Prometheus Needed!)

```bash
# Terminal 3
npm run metrics:push
```

This will:
- Continuously fetch metrics from your services
- Push them to Grafana Cloud every 15 seconds
- Keep running until you press Ctrl+C

#### Option B: Using Prometheus (If You Have It Installed)

**Install Prometheus first** (if not installed):

```bash
# macOS (Homebrew)
brew install prometheus

# Or download from: https://prometheus.io/download/
```

**Then start Prometheus:**
```bash
# If installed via Homebrew
prometheus --config.file=prometheus/prometheus-cloud.yml

# Or if using downloaded binary (from extracted directory)
./prometheus --config.file=/full/path/to/prometheus/prometheus-cloud.yml
```

Prometheus will:
- Scrape metrics from localhost:3000 and localhost:3001
- Push them to Grafana Cloud automatically

**Note:** You don't need Prometheus! Option A (push script) works without it.

### Step 3: Generate Metrics

```bash
# Run tests
npm run test:consumer
npm run test:provider

# Or generate API traffic
./scripts/generate-traffic.sh
```

### Step 4: View Your Dashboard

Open in browser:
**https://samernaqvi.grafana.net/d/pact-observability/pact-contract-testing-observability**

## 📊 What You'll See

The dashboard includes:
- **HTTP Request Rate** - Requests per second
- **HTTP Request Duration (p95)** - 95th percentile response time
- **Pact Test Results** - Test execution counts and success/failure
- **Pact Test Duration** - How long tests take
- **User Operations Rate** - User CRUD operations
- **Active Connections** - Current connections
- **Status Code Distribution** - HTTP status codes
- **Pact Test Success Rate** - Percentage of passing tests

## 🔧 Configuration Files

- **`prometheus/prometheus-cloud.yml`** - Prometheus config for Grafana Cloud
- **`.env.cloud`** - Your Grafana Cloud credentials (keep safe!)
- **`scripts/start-metrics-pusher.js`** - Continuous metrics pusher

## 🐛 Troubleshooting

### Dashboard shows "No data"

1. **Check Prometheus Data Source:**
   - Go to https://samernaqvi.grafana.net/connections/datasources
   - Make sure there's a Prometheus data source configured
   - It should point to your Grafana Cloud Prometheus instance

2. **Verify Metrics Are Being Sent:**
   ```bash
   # Check services are running
   curl http://localhost:3000/metrics
   curl http://localhost:3001/metrics
   ```

3. **Check Push Script:**
   ```bash
   npm run metrics:push
   # Should show "✅ Metrics pushed successfully" messages
   ```

### Remote Write URL Issues

If the default URL doesn't work, you may need to find the correct endpoint:

1. Go to https://samernaqvi.grafana.net/
2. Navigate to **"Connections"** → **"Data Sources"** → **"Prometheus"**
3. Look for **"Remote Write URL"** or **"Prometheus Endpoint"**
4. Update `prometheus/prometheus-cloud.yml` with the correct URL

### Authentication Issues (401 Error)

If you're getting "Invalid username or password" errors:

1. **Check Service Account Permissions:**
   - Go to **"My Account"** → **"Service Accounts"**
   - Find "Demo-Pact-Observability"
   - Verify it has **"MetricsPublisher"** or **"Admin"** permissions

2. **Check Remote Write Credentials:**
   - In your Grafana Cloud account, look for **"Remote Write"** credentials
   - The username might not be the Instance ID
   - The password might be different from the service account token
   - See `docs/FIND_GRAFANA_CREDENTIALS.md` for detailed instructions

3. **Try Different Authentication:**
   - The service account token might need to be used as a bearer token
   - Or you might need to generate specific remote write credentials

4. **Use Prometheus Agent:**
   - Prometheus Agent handles authentication better than direct remote write
   - Download: https://prometheus.io/download/
   - Use: `./prometheus --config.file=prometheus/prometheus-cloud.yml`

## 📚 More Information

- **Setup Guide:** `docs/GRAFANA_CLOUD_SETUP_COMPLETE.md`
- **Grafana Cloud Docs:** https://grafana.com/docs/grafana-cloud/
- **Prometheus Remote Write:** https://prometheus.io/docs/prometheus/latest/storage/#remote-storage-integrations

## 🎯 Quick Commands Summary

```bash
# Start services
npm run dev:provider  # Terminal 1
npm run dev:consumer   # Terminal 2

# Push metrics (easiest)
npm run metrics:push   # Terminal 3

# View dashboard
# Open: https://samernaqvi.grafana.net/d/pact-observability/pact-contract-testing-observability
```
