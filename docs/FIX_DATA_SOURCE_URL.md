# Fixing Data Source URL Error

## 🔴 Problem

The error message shows:
```
Post "http://localhost:9090/api/v1/query_range": network unreachable
```

**Grafana Cloud is trying to connect to `localhost:9090`, but it cannot access your local machine!**

## ✅ Solution: Fix Prometheus Data Source URL

### Step 1: Find Your Grafana Cloud Prometheus Query URL

1. Go to https://samernaqvi.grafana.net/
2. Navigate to **"My Account"** → **"Prometheus"**
3. Look for **"Prometheus Endpoint"** or **"Query URL"**
4. It should look like:
   - `https://prometheus-prod-13-prod-us-east-0.grafana.net/api/prom`
   - **NOT** `/api/prom/push` (that's for remote write)
   - **NOT** `/api/prom/push` (that's for sending data)

### Step 2: Update Data Source in Grafana Cloud

1. Go to **"Connections"** → **"Data Sources"**
2. Click on your **Prometheus** data source (or create one if it doesn't exist)
3. In the **"URL"** field, change:
   - **FROM**: `http://localhost:9090` ❌
   - **TO**: `https://prometheus-prod-13-prod-us-east-0.grafana.net/api/prom` ✅
4. Set **"Access"** to **"Server (default)"**
5. If authentication is needed:
   - **Basic Auth**: Enable it
   - **Username**: Your Instance ID (e.g., `1749481`)
   - **Password**: Your Grafana Cloud token
6. Click **"Save & Test"**
7. You should see **"Data source is working"** ✅

### Step 3: Verify Data Source

1. Go to **"Explore"** in Grafana
2. Select your **Prometheus** data source
3. Try query: `http_requests_total`
4. You should see metrics!

### Step 4: Refresh Dashboard

After fixing the data source:
1. Go back to your dashboard
2. Click **"Refresh"** button
3. Wait a few seconds
4. You should see data in all panels!

## 📊 How It Works

1. **Prometheus** (running locally) scrapes metrics from your services
2. **Prometheus** pushes metrics to Grafana Cloud via **remote_write** (`/api/prom/push`)
3. **Grafana Cloud Prometheus** stores the metrics
4. **Grafana Dashboard** queries Grafana Cloud Prometheus via **query endpoint** (`/api/prom`)

## 🔍 Key Differences

- **Remote Write URL** (`/api/prom/push`): Used by your local Prometheus to **send** metrics
- **Query URL** (`/api/prom`): Used by Grafana to **query** metrics

Both are needed but for different purposes!

## 🎯 Quick Fix

1. **Data Source URL** should be: `https://prometheus-prod-13-prod-us-east-0.grafana.net/api/prom`
2. **NOT**: `http://localhost:9090`
3. After fixing, refresh dashboard - data should appear!




