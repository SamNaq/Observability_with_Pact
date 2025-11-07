# Pushing Metrics to Grafana Cloud

## 🔍 Current Status

You're seeing "No data" in Grafana Explore, which means metrics aren't in Grafana Cloud yet.

## ✅ Solution: Generate Fresh Metrics and Verify Push

### Step 1: Generate Fresh Metrics

Generate HTTP traffic to create new metrics:

```bash
# Generate HTTP requests
for i in {1..50}; do
  curl http://localhost:3000/api/users
  curl http://localhost:3001/api/users
  sleep 0.3
done
```

### Step 2: Wait for Prometheus to Scrape

Prometheus scrapes every 10 seconds (configured in `prometheus-cloud.yml`).

**Wait 15-20 seconds** after generating metrics for Prometheus to scrape them.

### Step 3: Wait for Prometheus to Push

Prometheus pushes to Grafana Cloud via remote_write.

**Wait another 30 seconds** after scraping for Prometheus to push to Grafana Cloud.

**Total wait time: ~45-60 seconds** after generating metrics.

### Step 4: Check in Grafana Explore

1. Go to **"Explore"** in Grafana Cloud
2. Select your **Prometheus** data source
3. Query: `http_requests_total`
4. **Time range**: **"Last 5 minutes"** (important!)
5. Click **"Run query"**

You should see data!

### Step 5: Refresh Dashboard

After seeing data in Explore:

1. Go back to your dashboard
2. Change time range to **"Last 5 minutes"**
3. Click **"Refresh"**
4. You should see data in all panels!

## 🔍 Verify Prometheus is Working

### Check Prometheus is Running

```bash
ps aux | grep prometheus | grep -v grep
```

Should show Prometheus process running.

### Check Prometheus is Scraping

1. Go to http://localhost:9090/targets
2. Should see:
   - `user-consumer` (localhost:3000) - **UP** ✅
   - `user-provider` (localhost:3001) - **UP** ✅

### Check Metrics in Local Prometheus

```bash
curl "http://localhost:9090/api/v1/query?query=http_requests_total"
```

Should show metrics with recent timestamps.

### Check Remote Write is Configured

```bash
curl "http://localhost:9090/api/v1/status/config" | grep remote_write
```

Should show remote_write configuration with Grafana Cloud URL.

## 🐛 Troubleshooting

### Issue 1: Metrics in Local Prometheus but Not in Grafana Cloud

**Symptom**: Metrics show in http://localhost:9090 but not in Grafana Cloud

**Possible causes**:
- Remote write authentication failed
- Remote write URL incorrect
- Network connectivity issues

**Solution**:
1. Check Prometheus logs for remote_write errors
2. Verify credentials in `prometheus-cloud.yml`
3. Check remote_write URL is correct

### Issue 2: No Metrics in Local Prometheus

**Symptom**: No metrics in http://localhost:9090

**Possible causes**:
- Services not running
- Prometheus not scraping
- Metrics not being generated

**Solution**:
1. Check services are running: `curl http://localhost:3000/metrics`
2. Check Prometheus targets: http://localhost:9090/targets
3. Generate more metrics

### Issue 3: Time Range Too Wide

**Symptom**: Metrics exist but dashboard shows "No data"

**Solution**:
- Change time range to **"Last 5 minutes"** or **"Last 15 minutes"**
- Make sure time range covers when metrics were generated

## 📝 Quick Test Sequence

1. **Generate metrics**:
   ```bash
   for i in {1..30}; do
     curl http://localhost:3000/api/users
     curl http://localhost:3001/api/users
     sleep 0.3
   done
   ```

2. **Wait 60 seconds** for Prometheus to scrape and push

3. **Check in Explore**:
   - Query: `http_requests_total`
   - Time range: **"Last 5 minutes"**
   - Should see data!

4. **Refresh dashboard**:
   - Time range: **"Last 5 minutes"**
   - Should see data!

## 🎯 Key Points

- **Prometheus scrapes every 10 seconds** (configured)
- **Remote write happens every 15 seconds** (default)
- **Total delay: ~45-60 seconds** from metric generation to Grafana Cloud
- **Time range matters**: Use "Last 5 minutes" for recent metrics
- **Metrics expire**: Old metrics might not be visible if time range is too wide

## ✅ Success Indicators

- ✅ Metrics show in http://localhost:9090
- ✅ Metrics show in Grafana Explore
- ✅ Dashboard shows data
- ✅ No errors in Prometheus logs




