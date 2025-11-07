# Fixing Authentication for Grafana Cloud Remote Write

## 🔴 Current Issue

The push script is getting **401 "Invalid username or password"** errors. This means the service account token cannot be used directly for Prometheus remote write.

## 🔍 Why This Is Happening

Service account tokens (starting with `glsa_`) are typically used for Grafana API calls, not for Prometheus remote write. Grafana Cloud requires **specific remote write credentials**.

## ✅ Solution: Find Your Remote Write Credentials

### Step 1: Go to Your Grafana Cloud Account

1. Open: https://samernaqvi.grafana.net/
2. Log in

### Step 2: Navigate to Prometheus Data Source

1. Click **"Connections"** (or "Configuration" → "Data Sources")
2. Click on **"Prometheus"** data source
3. Or click **"Add data source"** → **"Prometheus"**

### Step 3: Find Remote Write Section

Look for one of these sections:
- **"Remote Write"** tab
- **"Send Data"** section
- **"Prometheus Remote Write"** section
- **"Metrics"** → **"Remote Write"**

### Step 4: Get Your Credentials

You should see:
- **Remote Write URL** (e.g., `https://prometheus-prod-13-prod-us-east-0.grafana.net/api/prom/push`)
- **Username** (might be your Instance ID `13` or something else)
- **Password** or **Token** (different from your service account token)

### Step 5: Update Configuration

Once you have the credentials, update `.env.cloud`:

```bash
GRAFANA_CLOUD_PROMETHEUS_URL=<the-remote-write-url>
GRAFANA_CLOUD_USERNAME=<the-username>
GRAFANA_CLOUD_API_TOKEN=<the-password-or-token>
```

## 🔄 Alternative: Generate Remote Write Credentials

If you don't see remote write credentials:

1. In your Grafana Cloud account, go to **"My Account"** → **"Prometheus"**
2. Look for **"Generate Remote Write Credentials"** or **"Create Remote Write Token"**
3. This will create a username/password pair specifically for remote write

## 🛠️ Alternative: Use Prometheus Agent

If you can't find remote write credentials, use **Prometheus Agent** which handles authentication differently:

1. **Install Prometheus:**
   ```bash
   brew install prometheus
   ```

2. **Run with config:**
   ```bash
   prometheus --config.file=prometheus/prometheus-cloud.yml
   ```

   Prometheus Agent might handle authentication better than direct HTTP calls.

## 📝 What I Need From You

Please check your Grafana Cloud account and share:

1. **Remote Write URL** - The exact URL shown
2. **Username** - What username is shown (is it `13` or something else?)
3. **Password/Token** - What password or token is shown

Once you share these, I'll update the configuration and it should work!

## 💡 Quick Check

Can you:
1. Go to https://samernaqvi.grafana.net/
2. Navigate to **"Connections"** → **"Data Sources"** → **"Prometheus"**
3. Look for a **"Remote Write"** or **"Send Data"** section
4. Share what you see there (or take a screenshot)

This will help me configure the exact credentials needed!



