#!/usr/bin/env node

/**
 * Script to find your Grafana Cloud Instance ID
 * This is needed for Prometheus remote write authentication
 */

const https = require('https');

const GRAFANA_URL = process.env.GRAFANA_CLOUD_URL || 'https://samernaqvi.grafana.net';
const API_TOKEN = process.env.GRAFANA_CLOUD_API_TOKEN;

async function findInstanceId() {
  console.log('🔍 Finding your Grafana Cloud Instance ID...\n');
  console.log(`   URL: ${GRAFANA_URL}`);
  if (!API_TOKEN) {
    console.error('❌ Missing Grafana Cloud API token. Set GRAFANA_CLOUD_API_TOKEN in your environment.');
    process.exit(1);
  }
  console.log('   Token: [redacted]\n');

  try {
    // Try to get datasources to find Prometheus instance
    const url = new URL(`${GRAFANA_URL}/api/datasources`);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };

    const response = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve({ status: res.statusCode, data: json });
          } catch (e) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });
      req.on('error', reject);
      req.end();
    });

    if (response.status === 200) {
      console.log('✅ Connected to Grafana Cloud!\n');
      console.log('📊 Data Sources:');
      response.data.forEach((ds) => {
        console.log(`   - ${ds.name} (${ds.type})`);
        if (ds.type === 'prometheus' && ds.url) {
          console.log(`     URL: ${ds.url}`);
          // Extract instance ID from URL if possible
          const match = ds.url.match(/prometheus-prod-(\d+)/);
          if (match) {
            console.log(`     Instance ID: ${match[1]}`);
          }
        }
      });
    } else {
      console.log('⚠️  Could not fetch data sources automatically');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n💡 To find your Instance ID manually:');
  console.log('   1. Go to https://samernaqvi.grafana.net/');
  console.log('   2. Navigate to "Connections" → "Data Sources" → "Prometheus"');
  console.log('   3. Look for "Instance ID" or check the URL');
  console.log('   4. Or go to "My Account" → "Prometheus" section');
  console.log('\n💡 The Instance ID is usually a number (like 123456)');
}

findInstanceId();



