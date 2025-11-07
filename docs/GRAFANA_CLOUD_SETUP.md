# Setting Up Grafana Cloud for Your Dashboard

## 📋 What You Need From Your Grafana Cloud Account

To publish metrics to https://samernaqvi.grafana.net/, I need:

### 1. Prometheus Remote Write URL

1. Go to https://samernaqvi.grafana.net/
2. Log in to your account
3. Navigate to **"Connections"** → **"Data Sources"** → **"Add data source"** → **"Prometheus"**
4. Or go to **"My Account"** → **"Prometheus"** section
5. Look for **"Remote Write URL"** or **"Prometheus Remote Write Endpoint"**
   - It should look like: `https://prometheus-prod-XX.grafana.net/api/prom/push`
   - Or: `https://prometheus-us-central-0.grafana.net/api/prom/push`

### 2. Your Grafana Cloud Username

- This is usually a number (like `123456`)
- Found in your account settings or URL

### 3. API Token

1. In Grafana Cloud, go to **"My Account"** → **"API Keys"**
2. Click **"Create API Key"**
3. Give it a name like "Metrics Publisher"
4. Select **"MetricsPublisher"** or **"Admin"** permissions
5. Copy the token immediately (you won't see it again!)

## 🚀 Quick Setup (Once I Have Your Credentials)

Once you provide the above, I'll configure:

1. **Prometheus Agent** (or script) to push metrics to Grafana Cloud
2. **Dashboard import** instructions for your Grafana Cloud account
3. **Configuration files** ready to use

## 📊 Alternative: Manual Setup Steps

### Option 1: Using Prometheus Agent (Recommended)

1. Download Prometheus Agent: https://prometheus.io/download/
2. Configure it to:
   - Scrape your services (localhost:3000, localhost:3001)
   - Remote write to your Grafana Cloud endpoint

### Option 2: Using a Script (Simple)

I'll create a script that periodically fetches metrics from your services and sends them to Grafana Cloud.

### Option 3: Direct Service Integration

Modify your services to push metrics directly to Grafana Cloud using Prometheus remote write.

## 📝 What I Need From You

Please provide ONE of the following:

**Option A: Screenshots**
- Screenshot of your Grafana Cloud Prometheus settings
- Screenshot of your API Keys page

**Option B: Credentials** (you can share these - they're safe)
- Prometheus Remote Write URL
- Your Grafana Cloud username
- API Token

**Option C: Just tell me where to look**
- I'll guide you through finding these in your Grafana Cloud account

## 📖 Reference

Based on Grafana Cloud documentation:
- [Grafana Cloud Prometheus Setup](https://grafana.com/docs/grafana-cloud/send-data/metrics/)
- [Prometheus Remote Write](https://prometheus.io/docs/prometheus/latest/storage/#remote-storage-integrations)