# ✅ Credentials Updated!

Your Grafana Cloud credentials have been updated with the service account information.

## 📝 Updated Configuration

- **Remote Write URL**: `https://prometheus-prod-13-prod-us-east-0.grafana.net/api/prom/push`
- **Username**: `sa-1-pact_observability-22e7813e-0512-415e-8288-3cd3ad70e749`
- **Token**: `<your-grafana-cloud-token>`

## 🚀 Test It Now

```bash
# Make sure services are running
npm run dev:provider  # Terminal 1
npm run dev:consumer   # Terminal 2

# Push metrics
npm run metrics:push   # Terminal 3
```

You should see:
```
✅ [timestamp] Metrics pushed successfully
```

Instead of:
```
❌ Error pushing metrics: HTTP 401
```

## 📊 View Your Dashboard

Once metrics are pushing successfully, view your dashboard:
**https://samernaqvi.grafana.net/d/pact-observability/pact-contract-testing-observability**

## 🔍 If Still Getting Errors

If you still get errors:

1. **Check services are running:**
   ```bash
   curl http://localhost:3000/metrics
   curl http://localhost:3001/metrics
   ```

2. **Check the endpoint URL:**
   - The URL should be: `https://prometheus-prod-13-prod-us-east-0.grafana.net/api/prom/push`
   - Not the edit page URL you provided

3. **Verify service account permissions:**
   - Go to https://samernaqvi.grafana.net/
   - Check "My Account" → "Service Accounts"
   - Verify "Demo-Pact-Observability" has "MetricsPublisher" permission

## ✅ Files Updated

- ✅ `.env.cloud` - Updated with new credentials
- ✅ `prometheus/prometheus-cloud.yml` - Updated with new credentials
- ✅ `scripts/start-metrics-pusher.js` - Updated with new defaults



