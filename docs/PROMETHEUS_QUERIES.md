# Prometheus Queries to Try

## 🔍 Check if Targets Are Up

In the Prometheus query interface (http://localhost:9090), try these queries:

### 1. Check All Targets
```
up
```
This shows all targets and their status (1 = up, 0 = down)

### 2. Check Specific Services
```
up{job="user-consumer"}
up{job="user-provider"}
```

### 3. Check HTTP Requests
```
http_requests_total
```

### 4. Check Pact Tests
```
pact_tests_total
```

### 5. Check User Operations
```
user_operations_total
```

## 📊 Verify Services Are Running

Make sure your services are running:

```bash
# Terminal 1 - Provider
npm run dev:provider

# Terminal 2 - Consumer
npm run dev:consumer
```

Then check if metrics are available:
```bash
curl http://localhost:3000/metrics
curl http://localhost:3001/metrics
```

## 🔍 Check Prometheus Targets

1. Go to http://localhost:9090/targets
2. Look for `user-consumer` and `user-provider`
3. They should show as "UP" (green)

If they show as "DOWN":
- Check services are running
- Check ports 3000 and 3001 are accessible
- Check Prometheus config is correct

## 📈 Generate Metrics

After running tests and generating traffic, try:

```
# HTTP request rate
rate(http_requests_total[5m])

# Pact test results
pact_tests_total

# User operations
rate(user_operations_total[5m])
```

## 🐛 Troubleshooting

### No Data in Prometheus

1. **Check Targets**: http://localhost:9090/targets
   - Should show `user-consumer` and `user-provider` as "UP"

2. **Check Services Are Running**:
   ```bash
   curl http://localhost:3000/metrics
   curl http://localhost:3001/metrics
   ```

3. **Check Prometheus Config**:
   - Verify `prometheus/prometheus-cloud.yml` is correct
   - Check scrape targets are `localhost:3000` and `localhost:3001`

4. **Check Prometheus Logs**:
   - Look at the terminal where Prometheus is running
   - Check for any errors

### Metrics Not Showing in Grafana Cloud

1. **Check Remote Write**:
   - Look at Prometheus logs for remote write errors
   - Verify credentials in `prometheus-cloud.yml`

2. **Check Dashboard Data Source**:
   - Go to https://samernaqvi.grafana.net/
   - Verify Prometheus data source is configured
   - Check it's pointing to your Grafana Cloud Prometheus instance



