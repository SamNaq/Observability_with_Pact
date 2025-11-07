# Fixing macOS Security Warning for Prometheus

## 🔒 The Issue

macOS blocks downloaded applications that aren't signed by verified developers. This is a security feature.

## ✅ Solution: Remove Quarantine Attribute

Run this command to allow Prometheus to run:

```bash
cd ~/Downloads/prometheus-3.7.3.darwin-amd64
xattr -d com.apple.quarantine prometheus
```

Then try running Prometheus again:

```bash
./prometheus --version
```

If you still get a warning, you can also allow it in System Settings:

1. Go to **System Settings** → **Privacy & Security**
2. Scroll down to find the blocked app
3. Click **"Open Anyway"** or **"Allow"**

## 🚀 Run Prometheus

Once the security warning is resolved:

```bash
# Terminal 1 - Start Provider
npm run dev:provider

# Terminal 2 - Start Consumer
npm run dev:consumer

# Terminal 3 - Run Prometheus
cd ~/Downloads/prometheus-3.7.3.darwin-amd64
./prometheus --config.file=/Users/samer.naqvi/Demo_Observability/prometheus/prometheus-cloud.yml
```

## 📊 Verify It's Working

1. **Check Prometheus UI**: http://localhost:9090
2. **Check Targets**: http://localhost:9090/targets
   - Should show `user-consumer` and `user-provider` as "UP"
3. **View Dashboard**: https://samernaqvi.grafana.net/d/pact-observability/pact-contract-testing-observability



