#!/usr/bin/env node

/**
 * Check Grafana Cloud dashboard and verify metrics
 * 
 * Usage:
 *   node scripts/check-dashboard.js
 */

require('dotenv').config({ path: '.env.cloud' });
const https = require('https');

const GRAFANA_URL = process.env.GRAFANA_CLOUD_URL || 'https://samernaqvi.grafana.net';
const API_TOKEN = process.env.GRAFANA_CLOUD_API_TOKEN;
const DASHBOARD_UID = 'pact-contract-testing';

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

async function checkDashboard() {
  console.log('🔍 Checking dashboard in Grafana Cloud...\n');
  console.log(`Grafana URL: ${GRAFANA_URL}`);
  console.log(`Dashboard UID: ${DASHBOARD_UID}\n`);
  
  try {
    const result = await makeRequest(`/api/dashboards/uid/${DASHBOARD_UID}`);
    const dashboard = result.data.dashboard;
    
    console.log(`✅ Dashboard found: "${dashboard.title}"\n`);
    console.log(`Panels: ${dashboard.panels.length}\n`);
    
    // Check data sources used
    const datasources = new Set();
    dashboard.panels.forEach((panel, i) => {
      if (panel.targets && panel.targets.length > 0) {
        const ds = panel.targets[0].datasource;
        if (ds && ds.uid) {
          datasources.add(ds.uid);
        }
      }
    });
    
    console.log(`Data sources used: ${Array.from(datasources).join(', ') || 'None found'}\n`);
    
    // Check first few panel queries
    console.log('Panel queries:');
    dashboard.panels.slice(0, 5).forEach((panel, i) => {
      console.log(`\n${i + 1}. ${panel.title}`);
      if (panel.targets && panel.targets.length > 0) {
        panel.targets.forEach((target, j) => {
          console.log(`   Query ${j + 1}: ${target.expr || 'No query'}`);
        });
      } else {
        console.log('   No queries found');
      }
    });
    
    return dashboard;
  } catch (error) {
    console.error('❌ Error checking dashboard:', error.message);
    return null;
  }
}

async function checkDataSources() {
  console.log('\n---\n');
  console.log('📊 Checking data sources...\n');
  
  try {
    const result = await makeRequest('/api/datasources');
    const prometheus = result.data.filter(ds => ds.type === 'prometheus');
    
    console.log(`Found ${prometheus.length} Prometheus data source(s):\n`);
    prometheus.forEach(ds => {
      console.log(`  Name: ${ds.name}`);
      console.log(`  UID: ${ds.uid}`);
      console.log(`  ID: ${ds.id}`);
      console.log(`  URL: ${ds.url}`);
      console.log('');
    });
    
    return prometheus;
  } catch (error) {
    console.error('❌ Error checking data sources:', error.message);
    return [];
  }
}

async function queryMetrics(datasourceId, query) {
  console.log(`\n🔍 Querying metrics via data source ${datasourceId}...\n`);
  console.log(`Query: ${query}\n`);
  
  try {
    const result = await makeRequest(
      `/api/datasources/proxy/${datasourceId}/api/v1/query?query=${encodeURIComponent(query)}`
    );
    
    const queryResult = result.data.data;
    if (queryResult.result && queryResult.result.length > 0) {
      console.log(`✅ Found ${queryResult.result.length} metric series:\n`);
      queryResult.result.slice(0, 3).forEach((series, i) => {
        console.log(`  ${i + 1}. ${JSON.stringify(series.metric)}`);
        console.log(`     Value: ${series.value[1]} (timestamp: ${series.value[0]})`);
      });
      if (queryResult.result.length > 3) {
        console.log(`  ... and ${queryResult.result.length - 3} more`);
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

  const dashboard = await checkDashboard();
  const datasources = await checkDataSources();
  
  if (dashboard && datasources.length > 0) {
    // Try to query metrics using the first Prometheus data source
    const ds = datasources[0];
    console.log(`\n---\n`);
    console.log(`Testing queries with data source: ${ds.name} (ID: ${ds.id})\n`);
    
    const queries = [
      'http_requests_total',
      'sum(http_requests_total)',
      'sum(rate(http_requests_total[5m]))',
    ];
    
    for (const query of queries) {
      const hasData = await queryMetrics(ds.id, query);
      if (hasData) {
        console.log('\n✅ Metrics are available in Grafana Cloud!');
        console.log('   Dashboard should work - check time range is "Last 5 minutes"\n');
        break;
      }
      console.log('');
    }
  }
  
  console.log('\n💡 Tips:');
  console.log('   - Make sure dashboard time range is "Last 5 minutes"');
  console.log('   - Check that dashboard is using the correct Prometheus data source');
  console.log('   - Verify metrics pusher is running and pushing successfully');
}

main().catch(console.error);




