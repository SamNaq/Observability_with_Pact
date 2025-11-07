# Installing Prometheus (Optional)

You don't need Prometheus to push metrics to Grafana Cloud! The `npm run metrics:push` script works without it.

However, if you want to use Prometheus, here's how to install it:

## Option 1: Using Homebrew (Easiest for macOS)

```bash
# Install Prometheus
brew install prometheus

# Verify installation
prometheus --version

# Run Prometheus
prometheus --config.file=prometheus/prometheus-cloud.yml
```

## Option 2: Download Binary

1. **Download Prometheus:**
   ```bash
   # Go to: https://prometheus.io/download/
   # Or use curl:
   cd ~/Downloads
   curl -LO https://github.com/prometheus/prometheus/releases/download/v2.48.0/prometheus-2.48.0.darwin-amd64.tar.gz
   ```

2. **Extract:**
   ```bash
   tar -xzf prometheus-2.48.0.darwin-amd64.tar.gz
   cd prometheus-2.48.0.darwin-amd64
   ```

3. **Run:**
   ```bash
   ./prometheus --config.file=/Users/samer.naqvi/Demo_Observability/prometheus/prometheus-cloud.yml
   ```

## Option 3: Use the Push Script (No Prometheus Needed!)

**You don't need Prometheus!** Use the existing push script instead:

```bash
# Start services
npm run dev:provider  # Terminal 1
npm run dev:consumer   # Terminal 2

# Push metrics (no Prometheus needed!)
npm run metrics:push   # Terminal 3
```

The push script:
- ✅ Works without Prometheus
- ✅ Pushes metrics directly to Grafana Cloud
- ✅ Runs continuously (every 15 seconds)
- ✅ Easier to use

## Recommendation

**Use the push script** (`npm run metrics:push`) instead of Prometheus - it's simpler and doesn't require installation!

The only reason to use Prometheus is if:
- You want to scrape metrics at a specific interval
- You want to use Prometheus's query language
- You want to store metrics locally before pushing

For just pushing metrics to Grafana Cloud, the push script is perfect!