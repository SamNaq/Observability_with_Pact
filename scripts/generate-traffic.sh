#!/bin/bash

# Script to generate API traffic for metrics

echo "🚀 Generating API traffic for metrics..."

CONSUMER_URL="http://localhost:3000"

echo "📊 Creating users..."
for i in {1..10}; do
  curl -X POST "$CONSUMER_URL/api/users" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"User $i\", \"email\": \"user$i@example.com\"}" \
    -s > /dev/null
  echo "Created user $i"
  sleep 0.2
done

echo "📊 Fetching users..."
for i in {1..20}; do
  curl "$CONSUMER_URL/api/users" -s > /dev/null
  if [ $((i % 5)) -eq 0 ]; then
    echo "Made $i requests..."
  fi
  sleep 0.1
done

echo "✅ Traffic generation complete!"
echo "📊 View metrics at:"
echo "   - Consumer: http://localhost:3000/metrics"
echo "   - Provider: http://localhost:3001/metrics"



