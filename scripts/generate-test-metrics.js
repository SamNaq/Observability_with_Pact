#!/usr/bin/env node

/**
 * Generate test metrics for demo purposes
 * 
 * This script generates synthetic Pact test metrics
 * so the dashboard can display data during demos.
 * 
 * Usage:
 *   node scripts/generate-test-metrics.js
 */

require('dotenv').config();
const http = require('http');

const SERVICES = [
  { name: 'consumer', port: 3000 },
  { name: 'provider', port: 3001 },
];

// Generate metrics by making HTTP requests to trigger metrics
async function generateMetrics() {
  console.log('Generating test metrics...\n');

  for (const service of SERVICES) {
    try {
      console.log(`Generating metrics for ${service.name}...`);
      
      // Make requests to generate metrics
      for (let i = 0; i < 5; i++) {
        await makeRequest(`http://localhost:${service.port}/api/users`);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`✅ Generated metrics for ${service.name}`);
    } catch (error) {
      console.error(`❌ Error generating metrics for ${service.name}:`, error.message);
    }
  }

  console.log('\n✅ Metrics generation complete!');
  console.log('Check metrics at:');
  console.log('  - Consumer: http://localhost:3000/metrics');
  console.log('  - Provider: http://localhost:3001/metrics');
  console.log('\nNote: Pact test metrics are generated when you run tests.');
  console.log('Run: npm test');
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

// Run if called directly
if (require.main === module) {
  generateMetrics().catch(console.error);
}

module.exports = { generateMetrics };




