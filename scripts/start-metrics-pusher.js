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
const https = require('https');

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

async function pushToGrafanaCloud(metrics) {
  const urlObj = new URL(PROMETHEUS_URL);
  
  // For Grafana Cloud service accounts, use basic auth:
  // Username: service account username
  // Password: service account token
  const auth = Buffer.from(`${USERNAME}:${API_TOKEN}`).toString('base64');
  
  const headers = {
    'Content-Type': 'text/plain',  // Prometheus text format
    'X-Prometheus-Remote-Write-Version': '0.1.0',
    'Authorization': `Basic ${auth}`,  // Basic auth with service account username:token
  };
  
  const options = {
    hostname: urlObj.hostname,
    port: urlObj.port || 443,
    path: urlObj.pathname,
    method: 'POST',
    headers: headers,
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, body: data });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(metrics);
    req.end();
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
    
    // Push to Grafana Cloud
    await pushToGrafanaCloud(combinedMetrics);
    
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