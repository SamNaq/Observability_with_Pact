#!/bin/bash

# Script to push metrics to Grafana Cloud
# 
# Usage:
#   ./scripts/push-to-grafana-cloud.sh
#
# Environment variables:
#   GRAFANA_CLOUD_PROMETHEUS_URL - Prometheus remote write URL
#   GRAFANA_CLOUD_USERNAME - Your Grafana Cloud username
#   GRAFANA_CLOUD_API_TOKEN - API token

PROMETHEUS_URL="${GRAFANA_CLOUD_PROMETHEUS_URL}"
USERNAME="${GRAFANA_CLOUD_USERNAME}"
API_TOKEN="${GRAFANA_CLOUD_API_TOKEN}"

if [ -z "$PROMETHEUS_URL" ] || [ -z "$USERNAME" ] || [ -z "$API_TOKEN" ]; then
  echo "❌ Missing required environment variables:"
  echo "   GRAFANA_CLOUD_PROMETHEUS_URL - Prometheus remote write URL"
  echo "   GRAFANA_CLOUD_USERNAME - Your Grafana Cloud username"
  echo "   GRAFANA_CLOUD_API_TOKEN - API token"
  echo ""
  echo "💡 Get these from: https://samernaqvi.grafana.net/"
  echo "   1. Go to 'My Account' → 'Prometheus'"
  echo "   2. Find your Prometheus Remote Write URL"
  echo "   3. Create an API token with metrics permissions"
  exit 1
fi

echo "📤 Pushing metrics to Grafana Cloud..."
echo "   URL: $PROMETHEUS_URL"
echo "   Username: $USERNAME"
echo ""

# Fetch metrics from services
echo "📊 Fetching metrics from services..."
CONSUMER_METRICS=$(curl -s http://localhost:3000/metrics)
PROVIDER_METRICS=$(curl -s http://localhost:3001/metrics)

if [ -z "$CONSUMER_METRICS" ] || [ -z "$PROVIDER_METRICS" ]; then
  echo "❌ Error: Services not running. Please start them first:"
  echo "   npm run dev:provider"
  echo "   npm run dev:consumer"
  exit 1
fi

# Combine metrics
COMBINED_METRICS="$CONSUMER_METRICS"$'\n'"$PROVIDER_METRICS"

# Send to Grafana Cloud using curl
echo "☁️  Sending to Grafana Cloud..."

# Extract host and path from URL
HOST=$(echo "$PROMETHEUS_URL" | sed -E 's|https?://([^/]+).*|\1|')
PATH_AND_QUERY=$(echo "$PROMETHEUS_URL" | sed -E 's|https?://[^/]+(.*)|\1|')

# Create basic auth header
AUTH=$(echo -n "$USERNAME:$API_TOKEN" | base64)

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$PROMETHEUS_URL" \
  -H "Content-Type: text/plain" \
  -H "Authorization: Basic $AUTH" \
  -H "X-Prometheus-Remote-Write-Version: 0.1.0" \
  --data-binary "$COMBINED_METRICS")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 204 ]; then
  echo "✅ Metrics sent successfully!"
  echo "📊 Check your Grafana Cloud dashboard: https://samernaqvi.grafana.net/"
else
  echo "❌ Error sending metrics (HTTP $HTTP_CODE):"
  echo "$BODY"
  echo ""
  echo "💡 Troubleshooting:"
  echo "   1. Check your Prometheus Remote Write URL is correct"
  echo "   2. Verify your API token has metrics publishing permissions"
  echo "   3. Check Grafana Cloud documentation for remote write format"
  exit 1
fi



