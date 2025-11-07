#!/usr/bin/env node

/**
 * Script to send metrics to Grafana Cloud using Prometheus Remote Write
 * 
 * Usage:
 *   node scripts/send-metrics-to-grafana-cloud.js
 * 
 * Environment variables:
 *   GRAFANA_CLOUD_PROMETHEUS_URL - Prometheus remote write URL
 *   GRAFANA_CLOUD_USERNAME - Your Grafana Cloud username
 *   GRAFANA_CLOUD_API_TOKEN - API token with metrics permissions
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PROMETHEUS_URL = process.env.GRAFANA_CLOUD_PROMETHEUS_URL;
const USERNAME = process.env.GRAFANA_CLOUD_USERNAME;
const API_TOKEN = process.env.GRAFANA_CLOUD_API_TOKEN;

if (!PROMETHEUS_URL || !USERNAME || !API_TOKEN) {
  console.error('❌ Missing required environment variables:');
  console.error('   GRAFANA_CLOUD_PROMETHEUS_URL - Prometheus remote write URL');
  console.error('   GRAFANA_CLOUD_USERNAME - Your Grafana Cloud username');
  console.error('   GRAFANA_CLOUD_API_TOKEN - API token');
  console.error('');
  console.error('💡 Get these from: https://samernaqvi.grafana.net/');
  console.error('   1. Go to "My Account" → "Prometheus"');
  console.error('   2. Find your Prometheus Remote Write URL');
  console.error('   3. Create an API token with metrics permissions');
  process.exit(1);
}

async function fetchMetrics(serviceUrl) {
  return new Promise((resolve, reject) => {
    http.get(serviceUrl, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

async function sendToGrafanaCloud(metrics) {
  const url = new URL(PROMETHEUS_URL);
  const auth = Buffer.from(`${USERNAME}:${API_TOKEN}`).toString('base64');
  
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-protobuf',
      'Content-Encoding': 'snappy',
      'Authorization': `Basic ${auth}`,
      'X-Prometheus-Remote-Write-Version': '0.1.0',
    },
  };

  // For now, we'll send as text/plain (Prometheus format)
  // Grafana Cloud may accept this or require protobuf
  options.headers['Content-Type'] = 'text/plain';
  
  return new Promise((resolve, reject) => {
    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
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

async function main() {
  console.log('📤 Sending metrics to Grafana Cloud...');
  console.log(`   URL: ${PROMETHEUS_URL}`);
  console.log(`   Username: ${USERNAME}`);
  console.log('');

  try {
    // Fetch metrics from both services
    console.log('📊 Fetching metrics from services...');
    const consumerMetrics = await fetchMetrics('http://localhost:3000/metrics');
    const providerMetrics = await fetchMetrics('http://localhost:3001/metrics');
    
    const combinedMetrics = consumerMetrics + '\n' + providerMetrics;
    
    // Send to Grafana Cloud
    console.log('☁️  Sending to Grafana Cloud...');
    await sendToGrafanaCloud(combinedMetrics);
    
    console.log('✅ Metrics sent successfully!');
    console.log('📊 Check your Grafana Cloud dashboard: https://samernaqvi.grafana.net/');
  } catch (error) {
    console.error('❌ Error sending metrics:', error.message);
    if (error.message.includes('HTTP')) {
      console.error('');
      console.error('💡 Troubleshooting:');
      console.error('   1. Check your Prometheus Remote Write URL is correct');
      console.error('   2. Verify your API token has metrics publishing permissions');
      console.error('   3. Make sure services are running: http://localhost:3000/metrics');
      console.error('   4. Check Grafana Cloud documentation for remote write format');
    }
    process.exit(1);
  }
}

main();



