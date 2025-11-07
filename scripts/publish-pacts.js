const path = require('path');
const { execSync } = require('child_process');

// Check if Pact Broker is configured
const pactBrokerUrl = process.env.PACT_BROKER_URL;

if (!pactBrokerUrl) {
  console.log('ℹ️  No Pact Broker URL configured. Pact files are stored locally in ./pacts/');
  console.log('📁 Local pact files:');
  const fs = require('fs');
  const pactDir = path.resolve(process.cwd(), 'pact_contract');
  if (fs.existsSync(pactDir)) {
    const files = fs.readdirSync(pactDir).filter(f => f.endsWith('.json'));
    if (files.length > 0) {
      files.forEach(file => {
        console.log(`   - ${file}`);
      });
      console.log('\n💡 To publish to a Pact Broker, set PACT_BROKER_URL environment variable');
      console.log('   Example: export PACT_BROKER_URL=http://your-broker-url');
      console.log('   Then use: pact-broker publish ./pacts --consumer-app-version 1.0.0');
    } else {
      console.log('   (No pact files found yet. Run consumer tests first.)');
    }
  }
  process.exit(0);
}

// If broker URL is set, use Pact CLI to publish
console.log('📤 Publishing pacts to Pact Broker...');
console.log(`   Broker URL: ${pactBrokerUrl}`);

try {
  const pactDir = path.resolve(process.cwd(), 'pact_contract');
  const consumerVersion = process.env.CONSUMER_VERSION || '1.0.0';
  const tags = process.env.PACT_TAGS ? process.env.PACT_TAGS.split(',') : ['main'];
  
  // Build command for Pact CLI
  let command = `pact-broker publish "${pactDir}" --consumer-app-version "${consumerVersion}" --broker-base-url "${pactBrokerUrl}"`;
  
  if (process.env.PACT_BROKER_USERNAME && process.env.PACT_BROKER_PASSWORD) {
    command += ` --broker-username "${process.env.PACT_BROKER_USERNAME}" --broker-password "${process.env.PACT_BROKER_PASSWORD}"`;
  }
  
  tags.forEach(tag => {
    command += ` --tag "${tag}"`;
  });
  
  console.log(`\n📋 Running: ${command.replace(/--broker-password "[^"]+"/, '--broker-password "***"')}\n`);
  
  execSync(command, { stdio: 'inherit' });
  
  console.log('\n✅ Pacts published successfully to Pact Broker!');
  console.log(`📋 View contracts at: ${pactBrokerUrl}/pacts`);
  
  process.exit(0);
} catch (error) {
  console.error('\n❌ Error publishing pacts to broker');
  console.error('💡 Make sure you have pact-broker CLI installed:');
  console.error('   npm install -g @pact-foundation/pact-cli');
  console.error('   or');
  console.error('   Use a cloud-hosted Pact Broker service');
  process.exit(1);
}
