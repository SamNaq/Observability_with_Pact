#!/usr/bin/env node

/**
 * Script to set up Grafana Cloud connection and create dashboard
 * 
 * Usage:
 *   node scripts/setup-grafana-cloud.js
 * 
 * Environment variables:
 *   GRAFANA_CLOUD_TOKEN - Service account token
 *   GRAFANA_CLOUD_URL - Your Grafana Cloud URL (default: https://samernaqvi.grafana.net)
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const GRAFANA_URL = process.env.GRAFANA_CLOUD_URL || 'https://samernaqvi.grafana.net';
const API_TOKEN = process.env.GRAFANA_CLOUD_TOKEN;

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const req = client.request(requestOptions, (res) => {
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

async function getPrometheusEndpoint() {
  console.log('🔍 Finding Prometheus endpoint...');
  
  try {
    // Try to get instance info
    const response = await makeRequest(`${GRAFANA_URL}/api/instance`);
    console.log('✅ Connected to Grafana Cloud');
    console.log(`   Instance: ${response.data.instanceName || 'N/A'}`);
    
    // Try common Prometheus endpoint patterns
    const possibleEndpoints = [
      `${GRAFANA_URL}/api/prom/push`,
      `https://prometheus-prod-01.grafana.net/api/prom/push`,
      `https://prometheus-us-central-0.grafana.net/api/prom/push`,
    ];
    
    console.log('\n📝 Prometheus Remote Write URL options:');
    console.log('   Try these URLs (one should work):');
    possibleEndpoints.forEach((url, i) => {
      console.log(`   ${i + 1}. ${url}`);
    });
    
    // Return the first option as default
    return possibleEndpoints[0];
    
  } catch (error) {
    console.error('❌ Error connecting to Grafana Cloud:', error.message);
    console.log('\n💡 Using default Prometheus endpoint pattern');
    return `${GRAFANA_URL}/api/prom/push`;
  }
}

async function createDashboard() {
  console.log('\n📊 Creating dashboard...');
  
  try {
    const dashboardPath = path.join(__dirname, '..', 'grafana', 'dashboards', 'pact-observability.json');
    const dashboardJson = JSON.parse(fs.readFileSync(dashboardPath, 'utf8'));
    
    // Update dashboard for Grafana Cloud
    dashboardJson.uid = 'pact-observability';
    dashboardJson.title = 'Pact Contract Testing Observability';
    
    // Try to create/update dashboard
    try {
      const response = await makeRequest(`${GRAFANA_URL}/api/dashboards/db`, {
        method: 'POST',
        body: {
          dashboard: dashboardJson,
          overwrite: true,
          folderId: null,
        },
      });
      
      console.log('✅ Dashboard created successfully!');
      console.log(`   Dashboard URL: ${GRAFANA_URL}${response.data.url}`);
      return true;
    } catch (error) {
      console.log('⚠️  Could not create dashboard via API (you may need to import manually)');
      console.log('   Dashboard JSON is ready at: grafana/dashboards/pact-observability.json');
      console.log('   You can import it manually in Grafana Cloud');
      return false;
    }
  } catch (error) {
    console.error('❌ Error creating dashboard:', error.message);
    return false;
  }
}

async function createPrometheusConfig(prometheusUrl) {
  console.log('\n⚙️  Creating Prometheus configuration...');
  
  const config = {
    global: {
      scrape_interval: '15s',
      external_labels: {
        cluster: 'demo-observability',
        environment: 'development',
      },
    },
    scrape_configs: [
      {
        job_name: 'user-consumer',
        scrape_interval: '10s',
        metrics_path: '/metrics',
        static_configs: [
          {
            targets: ['localhost:3000'],
            labels: {
              service: 'user-consumer',
              type: 'api',
            },
          },
        ],
      },
      {
        job_name: 'user-provider',
        scrape_interval: '10s',
        metrics_path: '/metrics',
        static_configs: [
          {
            targets: ['localhost:3001'],
            labels: {
              service: 'user-provider',
              type: 'api',
            },
          },
        ],
      },
    ],
    remote_write: [
      {
        url: prometheusUrl,
        basic_auth: {
          username: API_TOKEN.split('_')[0] || 'token',
          password: API_TOKEN,
        },
        write_relabel_configs: [
          {
            source_labels: ['__name__'],
            regex: '.*',
            action: 'keep',
          },
        ],
      },
    ],
  };
  
  const configPath = path.join(__dirname, '..', 'prometheus', 'prometheus-cloud.yml');
  fs.writeFileSync(configPath, require('yaml').stringify(config));
  
  console.log('✅ Prometheus config created: prometheus/prometheus-cloud.yml');
}

async function createEnvFile(prometheusUrl) {
  console.log('\n📝 Creating environment file...');
  
  const username = API_TOKEN.split('_')[0] || 'token';
  
  const envContent = `# Grafana Cloud Configuration
GRAFANA_CLOUD_PROMETHEUS_URL=${prometheusUrl}
GRAFANA_CLOUD_USERNAME=${username}
GRAFANA_CLOUD_API_TOKEN=${API_TOKEN}
GRAFANA_CLOUD_URL=${GRAFANA_URL}
`;
  
  const envPath = path.join(__dirname, '..', '.env.cloud');
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Environment file created: .env.cloud');
  console.log('   ⚠️  Add .env.cloud to .gitignore (contains sensitive tokens)');
}

async function main() {
  if (!API_TOKEN) {
    console.error('❌ Missing Grafana Cloud token. Set GRAFANA_CLOUD_TOKEN in your environment before running this script.');
    process.exit(1);
  }

  console.log('🚀 Setting up Grafana Cloud connection...\n');
  console.log(`   Grafana URL: ${GRAFANA_URL}`);
  console.log(`   Service Account: Demo-Pact-Observability`);
  console.log('');
  
  try {
    // Get Prometheus endpoint
    const prometheusUrl = await getPrometheusEndpoint();
    
    // Create Prometheus config
    await createPrometheusConfig(prometheusUrl);
    
    // Create environment file
    await createEnvFile(prometheusUrl);
    
    // Try to create dashboard
    await createDashboard();
    
    console.log('\n✅ Setup complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Start your services:');
    console.log('      npm run dev:provider  # Terminal 1');
    console.log('      npm run dev:consumer   # Terminal 2');
    console.log('');
    console.log('   2. If you have Prometheus installed locally:');
    console.log('      ./prometheus --config.file=prometheus/prometheus-cloud.yml');
    console.log('');
    console.log('   3. Or use the push script:');
    console.log('      source .env.cloud');
    console.log('      ./scripts/push-to-grafana-cloud.sh');
    console.log('');
    console.log('   4. View dashboard:');
    console.log(`      ${GRAFANA_URL}`);
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Check if yaml module is available
try {
  require('yaml');
} catch (e) {
  console.log('⚠️  Installing yaml module...');
  console.log('   Run: npm install yaml');
}

main();



