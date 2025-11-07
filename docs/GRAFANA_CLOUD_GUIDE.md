# Complete Guide: Publishing to Grafana Cloud

## 🎯 What We'll Do

1. Set up Prometheus Agent to push metrics to your Grafana Cloud
2. Import the dashboard to your Grafana Cloud account
3. View your metrics in beautiful dashboards

## 📋 Step 1: Get Your Grafana Cloud Credentials

Go to https://samernaqvi.grafana.net/ and get:

### A. Prometheus Remote Write URL

1. Log in to your Grafana Cloud account
2. Navigate to **"Connections"** → **"Data Sources"**
3. Click **"Add data source"** → **"Prometheus"**
4. Look for **"Remote Write URL"** or **"Prometheus Endpoint"**
   - Example: `https://prometheus-prod-XX.grafana.net/api/prom/push`
   - Or check: **"My Account"** → **"Prometheus"** section

### B. Your Grafana Cloud Username

- Usually a number (like `123456`)
- Found in your account URL or settings

### C. API Token

1. Go to **"My Account"** → **"API Keys"** (or **"Security"** → **"API Keys"**)
2. Click **"Create API Key"** or **"New Token"**
3. Name it: "Metrics Publisher"
4. Select permissions: **"MetricsPublisher"** or **"Admin"**
5. **Copy the token immediately** (you won't see it again!)

## 🚀 Step 2: Configure Prometheus Agent

### Option A: Using Prometheus Agent (Recommended)

1. **Download Prometheus Agent:**
   ```bash
   # For macOS (using Homebrew)
   brew install prometheus
   
   # Or download from: https://prometheus.io/download/
   ```

2. **Create Prometheus Agent Config:**
   
   I'll create this for you once you provide your credentials.

3. **Run Prometheus Agent:**
   ```bash
   ./prometheus --config.file=prometheus/prometheus-cloud.yml
   ```

### Option B: Using a Push Script (Simple)

I've created a script that will push metrics to Grafana Cloud:

```bash
# Set your credentials
export GRAFANA_CLOUD_PROMETHEUS_URL="your-remote-write-url"
export GRAFANA_CLOUD_USERNAME="your-username"
export GRAFANA_CLOUD_API_TOKEN="your-api-token"

# Run the script (it will push metrics every 15 seconds)
./scripts/push-to-grafana-cloud.sh
```

## 📊 Step 3: Import Dashboard to Grafana Cloud

1. **Log in to Grafana Cloud:**
   - Go to https://samernaqvi.grafana.net/
   - Log in

2. **Import Dashboard:**
   - Click **"+"** → **"Import dashboard"**
   - Click **"Upload JSON file"**
   - Select: `grafana/dashboards/pact-observability.json`
   - Or paste the JSON content

3. **Configure Data Source:**
   - Select your Prometheus data source
   - Click **"Import"**

4. **View Dashboard:**
   - Navigate to **"Dashboards"** → **"Pact Contract Testing Observability"**

## 🔧 Configuration Files I'll Create

Once you provide your credentials, I'll create:

1. **`prometheus/prometheus-cloud.yml`** - Prometheus config for Grafana Cloud
2. **`.env.cloud`** - Your Grafana Cloud credentials (add to .gitignore)
3. **Scripts** - To push metrics automatically

## 📝 What I Need From You

Please provide:

1. **Prometheus Remote Write URL** from your Grafana Cloud account
2. **Your Grafana Cloud Username** (usually a number)
3. **API Token** with metrics publishing permissions

Or if you prefer, I can guide you through finding these in your Grafana Cloud account step-by-step!

## 🎯 Quick Start (Once Credentials Are Set)

```bash
# 1. Set credentials
export GRAFANA_CLOUD_PROMETHEUS_URL="your-url"
export GRAFANA_CLOUD_USERNAME="your-username"
export GRAFANA_CLOUD_API_TOKEN="your-token"

# 2. Start services
npm run dev:provider  # Terminal 1
npm run dev:consumer  # Terminal 2

# 3. Push metrics to Grafana Cloud
./scripts/push-to-grafana-cloud.sh

# 4. Or use Prometheus Agent
./prometheus --config.file=prometheus/prometheus-cloud.yml
```

## 📚 Resources

- [Grafana Cloud Documentation](https://grafana.com/docs/grafana-cloud/)
- [Prometheus Remote Write](https://prometheus.io/docs/prometheus/latest/storage/#remote-storage-integrations)
- [Grafana Cloud Prometheus Setup](https://grafana.com/docs/grafana-cloud/send-data/metrics/)



