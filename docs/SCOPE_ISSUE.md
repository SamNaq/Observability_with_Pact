# ⚠️ Token Scope Issue

## 🔴 Current Error

The error "invalid scope requested" suggests the token might not have the correct permissions for Prometheus remote write.

## ✅ What We Have

- **URL**: `https://prometheus-prod-13-prod-us-east-0.grafana.net/api/prom/push`
- **Username**: `1749481` (Instance ID)
- **Token**: `<your-grafana-cloud-token>`

## 🔍 Check Token Permissions

1. Go to https://samernaqvi.grafana.net/
2. Navigate to **"My Account"** → **"API Keys"** or **"Tokens"**
3. Find the token that starts with `glc_`
4. Check if it has:
   - ✅ **MetricsPublisher** permission
   - ✅ **Prometheus Write** permission
   - ✅ **Remote Write** permission

## 💡 Solution Options

### Option 1: Regenerate Token with Correct Permissions

1. In your Grafana Cloud account, create a new token
2. Make sure it has **"MetricsPublisher"** or **"Prometheus Write"** permissions
3. Update `.env.cloud` with the new token

### Option 2: Use Prometheus Agent

Prometheus Agent might handle authentication and permissions better:

```bash
# Install Prometheus
brew install prometheus

# Run Prometheus
prometheus --config.file=prometheus/prometheus-cloud.yml
```

### Option 3: Check Token in Grafana Cloud

1. Go to your Grafana Cloud account
2. Check the token details
3. Verify it's specifically for Prometheus remote write
4. There might be a different token specifically for remote write

## 📝 Note

The token you provided (`glc_`) is a Grafana Cloud token. It might need specific permissions or scopes for Prometheus remote write. Check your Grafana Cloud account to ensure the token has the correct permissions.



