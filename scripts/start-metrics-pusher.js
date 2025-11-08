#!/usr/bin/env node

/**
 * Continuous metrics pusher to Grafana Cloud
 * 
 * This script continuously fetches metrics from your services
 * and pushes them to Grafana Cloud every 15 seconds.
 * 
 * Usage:
 *   node scripts/start-metrics-pusher.js
 * 
 * Make sure services are running first:
 *   npm run dev:provider
 *   npm run dev:consumer
 */

require('dotenv').config({ path: '.env.cloud' });
const http = require('http');
const fetch = require('node-fetch').default;
const { pushTimeseries } = require('prometheus-remote-write');

// Grafana Cloud Prometheus remote write endpoint
const PROMETHEUS_URL = process.env.GRAFANA_CLOUD_PROMETHEUS_URL;
const USERNAME = process.env.GRAFANA_CLOUD_USERNAME;  // Instance ID
const API_TOKEN = process.env.GRAFANA_CLOUD_API_TOKEN;  // Grafana Cloud token
const INTERVAL = 15000; // 15 seconds

async function fetchMetrics(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode} from ${url}`));
        }
      });
    }).on('error', reject);
  });
}

const METRIC_ALLOWLIST = [
  /^http_requests_total/,
  /^http_request_duration_seconds/,
  /^test_runs_total/,
  /^user_operations_total/,
  /^pact_tests_total/,
  /^pact_test_duration_seconds/,
  /^pact_contracts_published_total/,
  /^active_connections/,
  /^test_coverage_percent/,
];

function shouldIncludeMetric(name) {
  return METRIC_ALLOWLIST.some((regex) => regex.test(name));
}

function parseLabels(labelString = '') {
  const labels = {};
  if (!labelString) return labels;

  // Remove surrounding braces { ... }
  const trimmed = labelString.replace(/^{|}$/g, '');
  if (!trimmed.trim()) return labels;

  const parts = trimmed.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
  for (const part of parts) {
    const [key, rawValue] = part.split('=');
    if (!key || !rawValue) continue;
    labels[key.trim()] = rawValue.trim().replace(/^"|"$/g, '').replace(/\\"/g, '"');
  }
  return labels;
}

function parseMetricsToTimeseries(metricsText) {
  const lines = metricsText.split('\n');
  const timeseries = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const parts = trimmed.split(/\s+/);
    if (parts.length < 2) continue;

    const metricAndLabels = parts[0];
    const value = Number(parts[1]);
    if (Number.isNaN(value)) continue;

    const match = metricAndLabels.match(/^([a-zA-Z_:][a-zA-Z0-9_:]*)(\{.*\})?$/);
    if (!match) continue;

    const metricName = match[1];
    if (!shouldIncludeMetric(metricName)) {
      continue;
    }

    const labels = parseLabels(match[2] || '');

    timeseries.push({
      labels: {
        __name__: metricName,
        ...labels,
      },
      samples: [
        {
          value,
          timestamp: Date.now(),
        },
      ],
    });
  }

  return timeseries;
}

async function pushToGrafanaCloud(timeseries) {
  if (timeseries.length === 0) {
    return;
  }

  await pushTimeseries(timeseries, {
    url: PROMETHEUS_URL,
    auth: {
      username: USERNAME,
      password: API_TOKEN,
    },
    headers: {
      'X-Prometheus-Remote-Write-Version': '0.1.0',
    },
    fetch,
  });
}

async function pushMetrics() {
  try {
    // Fetch metrics from both services
    const consumerMetrics = await fetchMetrics('http://localhost:3000/metrics').catch(() => '');
    const providerMetrics = await fetchMetrics('http://localhost:3001/metrics').catch(() => '');
    
    if (!consumerMetrics && !providerMetrics) {
      console.log('⚠️  Services not running. Waiting...');
      return;
    }

    const combinedMetrics = [consumerMetrics, providerMetrics].filter(Boolean).join('\n');
    const timeseries = parseMetricsToTimeseries(combinedMetrics);

    // Push to Grafana Cloud
    await pushToGrafanaCloud(timeseries);
    
    const timestamp = new Date().toISOString();
    console.log(`✅ [${timestamp}] Metrics pushed successfully`);
    
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`❌ [${timestamp}] Error pushing metrics:`, error.message);
  }
}

if (!PROMETHEUS_URL || !USERNAME || !API_TOKEN) {
  console.error('❌ Missing Grafana Cloud configuration. Please set GRAFANA_CLOUD_PROMETHEUS_URL, GRAFANA_CLOUD_USERNAME, and GRAFANA_CLOUD_API_TOKEN in .env.cloud or environment variables.');
  process.exit(1);
}

console.log('🚀 Starting metrics pusher to Grafana Cloud...');
console.log(`   Endpoint: ${PROMETHEUS_URL}`);
console.log(`   Username: ${USERNAME}`);
console.log(`   Interval: ${INTERVAL / 1000} seconds`);
console.log('   Press Ctrl+C to stop\n');

// Push immediately
pushMetrics();

// Then push every INTERVAL
const interval = setInterval(pushMetrics, INTERVAL);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping metrics pusher...');
  clearInterval(interval);
  process.exit(0);
});