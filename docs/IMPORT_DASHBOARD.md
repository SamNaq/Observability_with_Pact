# Importing the Pact Contract Testing Dashboard

## 📊 Dashboard Created

I've created a new dashboard matching your screenshot: `grafana/dashboards/pact-contract-testing.json`

This dashboard includes:
- ✅ **Overall Health** - Donut chart showing test success rate
- ✅ **Test Status Summary** - Table showing Total Tests, Passed, Failed, Broken, Skipped
- ✅ **SLI - Availability** - Success rate percentage with SLO target
- ✅ **SLI - Latency** - P95 latency in milliseconds
- ✅ **Contracts & Verifications** - Table showing published contracts

## 🚀 Import to Grafana Cloud

### Option 1: Import via Grafana UI

1. Go to https://samernaqvi.grafana.net/
2. Click **"+"** → **"Import dashboard"**
3. Click **"Upload JSON file"**
4. Select: `grafana/dashboards/pact-contract-testing.json`
5. Select your Prometheus data source
6. Click **"Import"**

### Option 2: Import via API

```bash
# Get your Grafana API key from Grafana Cloud
# Then run:
curl -X POST https://samernaqvi.grafana.net/api/dashboards/db \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d @grafana/dashboards/pact-contract-testing.json
```

## 📋 Dashboard Panels

1. **Overall Health** - Success rate as a donut chart with color coding (F/D/C/B/A grades)
2. **Test Status Summary** - Breakdown of tests by status (success, failure, broken)
3. **SLI - Availability** - Availability percentage with 95% SLO target
4. **SLI - Latency** - P95 latency in milliseconds
5. **Contracts & Verifications** - Table of published contracts by consumer/provider

## 🎨 Dashboard Features

- **Dark theme** - Matches your screenshot
- **Auto-refresh** - Every 10 seconds
- **Color-coded thresholds** - Green/Yellow/Red based on health
- **SLO indicators** - Shows if targets are met

## 📊 Metrics Used

The dashboard uses these Prometheus metrics:
- `pact_tests_total` - Total test executions by status
- `pact_test_duration_seconds` - Test execution duration
- `pact_contracts_published_total` - Published contracts

## 🔍 View Dashboard

Once imported:
**https://samernaqvi.grafana.net/d/pact-contract-testing/pact-contract-testing-observability-dashboard**



