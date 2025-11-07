# Running the Project and Viewing Metrics in Grafana

## Step-by-Step Guide

### 1. Build the Project
```bash
npm install
npm run build
```

### 2. Start Infrastructure (Prometheus & Grafana)
```bash
docker-compose up -d
```

Wait about 30 seconds for services to be ready:
```bash
docker-compose ps
```

### 3. Start Provider Service
Open Terminal 1:
```bash
npm run dev:provider
```

You should see: `🚀 User Provider API running on port 3001`

### 4. Start Consumer Service  
Open Terminal 2:
```bash
npm run dev:consumer
```

You should see: `🚀 User Consumer API running on port 3000`

### 5. Generate Some Traffic (Optional - to see metrics)
Open Terminal 3:
```bash
# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com"}'

# Get all users
curl http://localhost:3000/api/users

# Get user by ID
curl http://localhost:3000/api/users/1
```

### 6. Run Tests (to generate Pact test metrics)
Open Terminal 4:
```bash
# Run consumer tests (generates contracts and metrics)
npm run test:consumer

# Run provider tests (generates more metrics)
npm run test:provider
```

### 7. Access Grafana Dashboard
1. Open browser: http://localhost:3002
2. Login:
   - Username: `admin`
   - Password: `admin`
3. Navigate to: **Dashboards** → **Pact Contract Testing Observability**

### 8. View Metrics Endpoints Directly (Optional)
- Consumer Metrics: http://localhost:3000/metrics
- Provider Metrics: http://localhost:3001/metrics
- Prometheus UI: http://localhost:9090

## Quick Commands Summary

```bash
# 1. Build
npm install && npm run build

# 2. Start infrastructure
docker-compose up -d

# 3. Start services (in separate terminals)
npm run dev:provider
npm run dev:consumer

# 4. Run tests
npm run test:consumer
npm run test:provider

# 5. Access Grafana
# Open: http://localhost:3002 (admin/admin)
```

## Stopping Services

```bash
# Stop Node.js services: Ctrl+C in terminal windows

# Stop Docker infrastructure
docker-compose down
```

## Troubleshooting

### Grafana not showing data?
1. Check Prometheus is scraping: http://localhost:9090/targets
2. Verify services are running: http://localhost:3000/metrics
3. Check Docker containers: `docker-compose ps`
4. View Prometheus logs: `docker-compose logs prometheus`

### Services won't start?
- Check ports 3000, 3001 are available
- Check Docker is running: `docker ps`
