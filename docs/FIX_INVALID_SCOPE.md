# Fixing "Invalid Scope Requested" Error

## 🔴 Error

```
HTTP 401: {"status":"error","error":"authentication error: invalid scope requested"}
```

## 🔍 Root Cause

The token doesn't have the **"metrics:write"** scope needed for Prometheus remote write.

## ✅ Solution: Create a New Token with Correct Permissions

### Step 1: Create a Service Account Token

1. Go to https://samernaqvi.grafana.net/
2. Navigate to **"My Account"** → **"Service Accounts"**
3. Click **"Create service account"** (or use existing one)
4. Name it: **"Prometheus Remote Write"**
5. Assign permissions:
   - ✅ **"MetricsPublisher"** (for remote write)
   - OR ✅ **"Admin"** (full access)
6. Click **"Create service account"**

### Step 2: Create Token for Service Account

1. Click on your service account
2. Click **"Add token"** or **"Create token"**
3. Name it: **"Remote Write Token"**
4. Select permissions:
   - ✅ **"MetricsPublisher"** 
   - OR ✅ **"Admin"**
5. Click **"Create token"**
6. **Copy the token immediately** (you won't see it again!)

### Step 3: Update Configuration

Update `.env.cloud` with the new token:

```bash
GRAFANA_CLOUD_API_TOKEN=<new-service-account-token>
```

### Step 4: Restart Metrics Pusher

```bash
npm run metrics:push
```

You should see **"✅ Metrics pushed successfully"** instead of errors!

## 🔄 Alternative: Use API Key

If you prefer to use an API Key instead:

1. Go to **"My Account"** → **"API Keys"**
2. Click **"Create API Key"**
3. Name it: **"Prometheus Remote Write"**
4. Select **"MetricsPublisher"** or **"Admin"** permissions
5. Copy the token
6. Update `.env.cloud` with the new token

## 📝 Token Requirements

The token must have:
- ✅ **"metrics:write"** scope
- ✅ **"MetricsPublisher"** permission
- ✅ OR **"Admin"** permission

Tokens without these permissions will fail with "invalid scope requested".

## 🎯 Quick Test

After updating the token:

1. Run: `npm run metrics:push`
2. Wait 15 seconds
3. You should see: **"✅ Metrics pushed successfully"**
4. Check Grafana Explore: Query `http_requests_total` with "Last 5 minutes"
5. You should see data!

## 💡 Why This Happens

Grafana Cloud requires specific permissions for remote write:
- **Service account tokens** with "MetricsPublisher" permission work
- **API Keys** with "MetricsPublisher" permission work
- **Tokens without metrics permissions** will fail with "invalid scope requested"

Make sure your token has the **"MetricsPublisher"** or **"Admin"** permission!




