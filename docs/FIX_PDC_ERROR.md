# Fixing Private Data Source Connect (PDC) Error

## 🔴 Problem

The Prometheus data source is configured with **"Private data source connect"** (PDC), which is causing a "network unreachable" error.

**PDC is for connecting to private/on-premise data sources through a tunnel.**  
**Grafana Cloud Prometheus is a cloud service - it doesn't need PDC!**

## ✅ Solution: Disable PDC and Use Direct Connection

### Step 1: Remove Private Data Source Connect Configuration

On the Prometheus data source configuration page:

1. Scroll down to the **"Private data source connect"** section
2. **Clear or disable** the PDC configuration:
   - Remove the "Private data source connect network" selection
   - Or find a toggle/checkbox to disable PDC
   - The field showing "pdc-samernaqvi-default (0 agent...)" should be cleared

3. The data source should use **direct connection** instead of PDC

### Step 2: Configure Direct Access

1. **URL**: Should be set to:
   ```
   https://prometheus-prod-13-prod-us-east-0.grafana.net/api/prom
   ```

2. **Access**: Should be set to:
   - **"Server (default)"** OR
   - **"Direct"** OR
   - **"Proxy"**

3. **Authentication** (if needed):
   - Enable **"Basic Auth"**
   - **Username**: Your Instance ID (`1749481`)
   - **Password**: Your Grafana Cloud token

### Step 3: Test Connection

1. Scroll down and click **"Save & test"**
2. You should see **"Data source is working"** ✅
3. If there's still an error, check:
   - The URL is correct
   - Authentication credentials are correct
   - Access method is set to "Server" or "Direct"

### Step 4: Refresh Dashboard

After fixing the data source:
1. Go back to your dashboard
2. Click **"Refresh"** button
3. Wait a few seconds
4. You should see data in all panels!

## 🔄 Alternative: Create New Data Source

If you can't easily disable PDC on the existing data source:

1. **Delete** the current Prometheus data source
2. **Create a new** Prometheus data source:
   - Go to **"Connections"** → **"Data Sources"** → **"Add data source"**
   - Select **"Prometheus"**
3. **Configure it**:
   - **URL**: `https://prometheus-prod-13-prod-us-east-0.grafana.net/api/prom`
   - **Access**: "Server (default)"
   - **Auth**: Basic auth with Instance ID and token
   - **DO NOT enable** Private Data Source Connect
4. Click **"Save & test"**
5. Update your dashboard to use this new data source

## 🎯 Key Differences

### Private Data Source Connect (PDC)
- ✅ For: Private/on-premise data sources
- ✅ Requires: PDC agent running
- ✅ Uses: Tunnel through Grafana Cloud
- ❌ NOT for: Grafana Cloud's own services

### Direct Connection
- ✅ For: Grafana Cloud services (like Prometheus)
- ✅ No agent needed
- ✅ Direct HTTPS connection
- ✅ This is what you need!

## 📝 Quick Checklist

- [ ] Disable/remove Private Data Source Connect
- [ ] Set URL to Grafana Cloud Prometheus endpoint
- [ ] Set Access to "Server" or "Direct"
- [ ] Configure basic auth (if needed)
- [ ] Test connection - should see "Data source is working"
- [ ] Refresh dashboard - should see data!

## 🔍 How to Verify

After fixing, you can verify in **"Explore"**:

1. Go to **"Explore"** in Grafana
2. Select your Prometheus data source
3. Try query: `http_requests_total`
4. You should see metrics!

If you see data here, the dashboard will work too!




