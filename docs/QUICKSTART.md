# Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Project
```bash
npm run build
```

### 3. Start Services (No Docker Required!)

**Note**: Pact contracts are stored locally in `./pact_contract/` - no Docker needed!

### 4. Start Services

**Terminal 1 - Provider Service:**
```bash
npm run dev:provider
```

**Terminal 2 - Consumer Service:**
```bash
npm run dev:consumer
```

### 5. Run Consumer Tests (Generates Contracts)
```bash
npm run test:consumer
```

This creates contract files in `./pact_contract/` directory.

### 6. Run Provider Tests (Verifies Against Contracts)
```bash
# Make sure provider service is running first
npm run dev:provider
# Then in another terminal:
npm run test:provider
```

### 7. Optional: Publish Contracts to Pact Broker
```bash
# Only if you have a Pact Broker URL configured
export PACT_BROKER_URL=http://your-broker-url
npm run pact:publish
```

If no broker URL is set, it will show you the local contract files instead.

## 📊 Access Services

**Always Available:**
- **Consumer API**: http://localhost:3000
- **Provider API**: http://localhost:3001
- **Consumer Metrics**: http://localhost:3000/metrics
- **Provider Metrics**: http://localhost:3001/metrics
- **Pact Contracts**: `./pact_contract/` directory (local JSON files)

**Optional (Requires Docker):**
- **Pact Broker**: http://localhost:9292 (username: `pact`, password: `pact`)
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3002 (username: `admin`, password: `admin`)

## 📈 View Metrics

**Local Metrics (No Docker):**
- View metrics directly at `/metrics` endpoints
- Metrics are Prometheus-compatible format

**Optional: Grafana Dashboard (Requires Docker):**
1. Start Docker Compose: `docker-compose up -d`
2. Open Grafana: http://localhost:3002
3. Login with `admin`/`admin`
4. Navigate to **Dashboards** → **Pact Contract Testing Observability**

## 🧪 Test the APIs

### Create a User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com"}'
```

### Get All Users
```bash
curl http://localhost:3000/api/users
```

### Get User by ID
```bash
curl http://localhost:3000/api/users/1
```

## 🔍 View Logs

Logs are in the `logs/` directory:
- `combined.log` - All application logs
- `error.log` - Error logs only
- `pact-consumer.log` - Consumer test logs
- `pact-provider.log` - Provider test logs

## 🛑 Stop Services

```bash
# Stop Node.js services: Ctrl+C in terminal windows

# Optional: Stop Docker infrastructure (if running)
docker-compose down
```

## 📁 View Pact Contracts

Pact contracts are stored locally in `./pact_contract/`:
```bash
cat pact_contract/user-consumer-user-provider.json
```

You can view, commit, and share these contract files via version control!

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the Pact Broker UI to see published contracts
- Check Grafana dashboards for metrics and observability
- Review test logs for detailed test execution information
