#!/bin/bash

# Setup script for Demo Observability project

set -e

echo "🚀 Setting up Demo Observability project..."

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p pacts
mkdir -p dist

# Check if .env exists
if [ ! -f .env ]; then
  echo "📝 Creating .env file from example..."
  cat > .env << EOF
# Service Configuration
NODE_ENV=development
SERVICE_NAME=user-service

# Provider Service
PROVIDER_PORT=3001
PROVIDER_URL=http://localhost:3001

# Consumer Service
CONSUMER_PORT=3000
CONSUMER_URL=http://localhost:3000

# Pact Broker Configuration
PACT_BROKER_URL=http://localhost:9292
PACT_BROKER_USERNAME=pact
PACT_BROKER_PASSWORD=pact

# Version Information
CONSUMER_VERSION=1.0.0
PROVIDER_VERSION=1.0.0
PACT_TAGS=main,latest

# Logging
LOG_LEVEL=info
EOF
  echo "✅ .env file created"
else
  echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build project
echo "🔨 Building project..."
npm run build

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start infrastructure: docker-compose up -d"
echo "2. Start provider service: npm run dev:provider"
echo "3. Start consumer service: npm run dev:consumer"
echo "4. Run tests: npm test"
echo "5. View Grafana: http://localhost:3002"
echo "6. View Pact Broker: http://localhost:9292"



