# Grafana Cloud Authentication Fix

## ✅ Found Your Instance ID

Your Grafana Cloud Instance ID is: **13**

## 🔧 Configuration Updated

I've updated the configuration with:
- **Endpoint**: `https://samernaqvi.grafana.net/api/prom/push`
- **Username**: `13` (Instance ID)
- **Password**: Your service account token

## 🚀 Try It Now

```bash
# Make sure services are running
npm run dev:provider  # Terminal 1
npm run dev:consumer   # Terminal 2

# Push metrics
npm run metrics:push   # Terminal 3
```

## 🐛 If Still Getting 401 Error

The authentication might need a different format. Try these:

### Option 1: Check Token Permissions

1. Go to https://samernaqvi.grafana.net/
2. Navigate to **"My Account"** → **"API Keys"** or **"Service Accounts"**
3. Find your "Demo-Pact-Observability" service account
4. Verify it has **"MetricsPublisher"** or **"Admin"** permissions

### Option 2: Try Different Endpoint

The endpoint might be:
- `https://samernaqvi.grafana.net/api/prom/push` (main URL)
- `https://prometheus-prod-13-prod-us-east-0.grafana.net/api/prom/push` (instance-specific)

### Option 3: Use Prometheus Agent

If the push script doesn't work, use Prometheus Agent which handles authentication better:

```bash
# Download Prometheus: https://prometheus.io/download/
./prometheus --config.file=prometheus/prometheus-cloud.yml
```

## 📝 Current Configuration

All files are updated:
- ✅ `prometheus/prometheus-cloud.yml` - Prometheus config
- ✅ `.env.cloud` - Environment variables
- ✅ `scripts/start-metrics-pusher.js` - Push script

The configuration uses:
- **URL**: `https://samernaqvi.grafana.net/api/prom/push`
- **Username**: `13`
- **Password**: Your service account token

## 💡 Alternative: Check Grafana Cloud Docs

For service account authentication, check:
https://grafana.com/docs/grafana-cloud/send-data/metrics/prometheus-remote-write/



