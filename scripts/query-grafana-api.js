#!/usr/bin/env node

/**
 * Query Grafana Cloud API to check metrics and troubleshoot dashboard
 * 
 * Usage:
 *   node scripts/query-grafana-api.js
 */

require('dotenv').config({ path: '.env.cloud' });
const https = require('https');

const GRAFANA_URL = process.env.GRAFANA_CLOUD_URL || 'https://samernaqvi.grafana.net';
const API_TOKEN = process.env.GRAFANA_CLOUD_API_TOKEN;

async function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(GRAFANA_URL);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: path,
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: json });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(json)}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: data });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function checkDataSources() {
  console.log('📊 Checking data sources...\n');
  
  try {
    const result = await makeRequest('/api/datasources');
    const prometheus = result.data.filter(ds => ds.type === 'prometheus');
    
    console.log(`Found ${prometheus.length} Prometheus data source(s):\n`);
    prometheus.forEach(ds => {
      console.log(`  ID: ${ds.id}`);
      console.log(`  Name: ${ds.name}`);
      console.log(`  UID: ${ds.uid}`);
      console.log(`  URL: ${ds.url}`);
      console.log(`  Access: ${ds.access}`);
      console.log('');
    });
    
    return prometheus[0];
  } catch (error) {
    console.error('❌ Error checking data sources:', error.message);
    return null;
  }
}

async function queryMetrics(datasourceId, query) {
  console.log(`🔍 Querying metrics via data source ${datasourceId}...\n`);
  console.log(`Query: ${query}\n`);
  
  try {
    const result = await makeRequest(
      `/api/datasources/proxy/${datasourceId}/api/v1/query?query=${encodeURIComponent(query)}`
    );
    
    const queryResult = result.data.data;
    if (queryResult.result && queryResult.result.length > 0) {
      console.log(`✅ Found ${queryResult.result.length} metric series:\n`);
      queryResult.result.slice(0, 5).forEach((series, i) => {
        console.log(`  ${i + 1}. ${JSON.stringify(series.metric)}`);
        console.log(`     Value: ${series.value[1]} (timestamp: ${series.value[0]})`);
      });
      if (queryResult.result.length > 5) {
        console.log(`  ... and ${queryResult.result.length - 5} more`);
      }
      return true;
    } else {
      console.log('❌ No metrics found');
      return false;
    }
  } catch (error) {
    console.error('❌ Error querying metrics:', error.message);
    return false;
  }
}

async function main() {
  if (!API_TOKEN) {
    console.error('❌ Missing Grafana Cloud API token. Set GRAFANA_CLOUD_API_TOKEN in .env.cloud or your environment.');
    process.exit(1);
  }

  console.log('🔍 Checking Grafana Cloud for metrics...\n');
  console.log(`Grafana URL: ${GRAFANA_URL}\n`);
  
  const datasource = await checkDataSources();
  
  if (!datasource) {
    console.error('❌ No Prometheus data source found');
    process.exit(1);
  }
  
  console.log('---\n');
  
  // Query different metrics
  const queries = [
    'http_requests_total',
    'sum(http_requests_total)',
    'sum(rate(http_requests_total[5m]))',
  ];
  
  for (const query of queries) {
    const hasData = await queryMetrics(datasource.id, query);
    if (hasData) {
      console.log('\n✅ Metrics are available in Grafana Cloud!');
      console.log('   Dashboard should work - check time range is "Last 5 minutes"\n');
      break;
    }
    console.log('');
  }
  
  console.log('\n💡 Tips:');
  console.log('   - Make sure dashboard time range is "Last 5 minutes"');
  console.log('   - Generate fresh metrics if needed');
  console.log('   - Wait 60 seconds after generating metrics');
}

main().catch(console.error);




