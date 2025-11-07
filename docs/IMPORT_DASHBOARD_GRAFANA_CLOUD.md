# Importing Dashboard to Grafana Cloud

## 📊 Dashboard Created

I've created a dashboard matching your screenshot: `grafana/dashboards/pact-contract-testing.json`

This dashboard includes:
- ✅ **Overall Health** - Donut chart showing test success rate (with color-coded grades)
- ✅ **Test Status Summary** - Table showing test counts by status
- ✅ **SLI - Availability** - Success rate percentage with SLO indicator
- ✅ **SLI - Latency** - P95 latency in milliseconds
- ✅ **Contracts & Verifications** - Table of published contracts

## 🚀 Import to Grafana Cloud

### Step 1: Access Grafana Cloud

Go to https://samernaqvi.grafana.net/ and log in.

### Step 2: Import Dashboard

1. Click **"+"** (plus icon) in the left sidebar
2. Select **"Import dashboard"**
3. Click **"Upload JSON file"**
4. Select: `grafana/dashboards/pact-contract-testing.json`
   - Or paste the JSON content directly

### Step 3: Configure Data Source

1. Select your **Prometheus** data source
   - Make sure it's configured to point to your Grafana Cloud Prometheus instance
2. Click **"Import"**

### Step 4: View Dashboard

Once imported, you'll see:
- **Overall Health** - Donut chart with success rate
- **Test Status Summary** - Breakdown by status
- **SLI - Availability** - Availability percentage
- **SLI - Latency** - P95 latency
- **Contracts & Verifications** - Published contracts

## 📋 Dashboard Features

- **Dark theme** - Matches your screenshot
- **Auto-refresh** - Every 10 seconds
- **Color-coded thresholds** - Green/Yellow/Red based on health
- **SLO indicators** - Shows if targets are met (≥ 95%)

## 📊 Metrics Used

The dashboard uses:
- `pact_tests_total` - Test executions by status
- `pact_test_duration_seconds` - Test duration
- `pact_contracts_published_total` - Published contracts

## 🎯 View Dashboard

After importing:
**https://samernaqvi.grafana.net/d/pact-contract-testing/pact-contract-testing-observability-dashboard**

## 🔍 Dashboard Panels Explained

1. **Overall Health** - Shows test success rate as a percentage with color-coded grades (F/D/C/B/A)
2. **Test Status Summary** - Shows Total Tests, Passed (success), Failed (failure), Broken, Skipped
3. **SLI - Availability** - Success rate percentage with 95% SLO target
4. **SLI - Latency** - P95 latency in milliseconds
5. **Contracts & Verifications** - Table showing published contracts by consumer/provider



