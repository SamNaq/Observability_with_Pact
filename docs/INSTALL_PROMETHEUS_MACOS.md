# Installing Prometheus on macOS

## ✅ Quick Install (Homebrew)

```bash
# Install Prometheus
brew install prometheus

# Verify installation
prometheus --version

# Run Prometheus with our config
prometheus --config.file=/Users/samer.naqvi/Demo_Observability/prometheus/prometheus-cloud.yml
```

## 📥 Alternative: Download macOS Binary

If you don't have Homebrew:

1. **Download macOS version:**
   - Go to: https://prometheus.io/download/
   - Download: `prometheus-3.7.3.darwin-amd64.tar.gz` (NOT linux-amd64)

2. **Extract and run:**
   ```bash
   cd ~/Downloads
   tar -xzf prometheus-3.7.3.darwin-amd64.tar.gz
   cd prometheus-3.7.3.darwin-amd64
   ./prometheus --config.file=/Users/samer.naqvi/Demo_Observability/prometheus/prometheus-cloud.yml
   ```

## 🚀 Quick Start

Once Prometheus is installed:

```bash
# Terminal 1 - Start Provider
npm run dev:provider

# Terminal 2 - Start Consumer
npm run dev:consumer

# Terminal 3 - Run Prometheus
prometheus --config.file=/Users/samer.naqvi/Demo_Observability/prometheus/prometheus-cloud.yml
```

## ✅ Verify It's Working

1. **Check Prometheus UI**: http://localhost:9090
2. **Check Targets**: http://localhost:9090/targets
   - Should show `user-consumer` and `user-provider` as "UP"
3. **View Dashboard**: https://samernaqvi.grafana.net/d/pact-observability/pact-contract-testing-observability



