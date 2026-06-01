/**
 * Simple Gist Plus Agent Example
 * 
 * An AI agent that pays for weather data using Gist Plus protocol
 * 
 * USAGE:
 * 1. Start the provider: node examples/simple-demo/provider.js
 * 2. Run this agent: node examples/simple-demo/agent.js
 */

const http = require('http');

const PROVIDER_URL = 'http://localhost:3000';
const AGENT_CONFIG = {
  agentPubkey: 'AgentKey456DEF',
  wallet: 'mock_wallet',
};

console.log('🤖 Gist Plus Weather Agent');
console.log('========================\n');
console.log('Agent:', AGENT_CONFIG.agentPubkey);
console.log('Provider:', PROVIDER_URL);
console.log('');

// Current session
let currentSession = null;

// Helper: Make HTTP request
function makeRequest(method, path, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, PROVIDER_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body ? JSON.parse(body) : null
        });
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Step 1: Create Intent
async function createIntent() {
  console.log('📋 Step 1: Creating Intent...');
  
  const intent = {
    version: '0.1.0',
    timestamp: Date.now(),
    intentId: `intent_${Date.now()}`,
    capability: 'weather-api',
    maxPricePerRequest: 0.01,
    token: 'USDC',
    agentPubkey: AGENT_CONFIG.agentPubkey,
    sla: {
      maxLatencyMs: 1000
    }
  };
  
  console.log('   ✅ Intent created');
  console.log(`   📝 Capability: ${intent.capability}`);
  console.log(`   💰 Max price: ${intent.maxPricePerRequest} ${intent.token}`);
  console.log(`   ⚡ SLA: <${intent.sla.maxLatencyMs}ms\n`);
  
  return intent;
}

// Step 2: Negotiate with provider
async function negotiate(intent) {
  console.log('🤝 Step 2: Negotiating with provider...');
  
  const response = await makeRequest(
    'POST',
    '/api/weather',
    { city: 'New York' },
    { 'X-Gist-Intent': JSON.stringify(intent) }
  );
  
  if (response.status !== 402) {
    throw new Error(`Expected 402, got ${response.status}`);
  }
  
  const offerHeader = response.headers['x-gist-offer'];
  if (!offerHeader) {
    throw new Error('No offer received');
  }
  
  const offer = JSON.parse(offerHeader);
  
  console.log('   ✅ Offer received');
  console.log(`   🆔 Offer ID: ${offer.offerId}`);
  console.log(`   💵 Price: ${offer.pricePerRequest} ${offer.token}`);
  console.log(`   ⚡ SLA: <${offer.sla.maxLatencyMs}ms`);
  console.log(`   ⏰ Valid until: ${new Date(offer.expiresAt).toLocaleTimeString()}`);
  
  // Verify offer is acceptable
  if (offer.pricePerRequest > intent.maxPricePerRequest) {
    throw new Error('Offer price exceeds Intent maximum');
  }
  
  console.log('   ✅ Offer accepted!\n');
  
  return offer;
}

// Step 3: Create Session
async function createSession(offer) {
  console.log('💰 Step 3: Creating prepaid session...');
  
  const depositAmount = 0.01; // Deposit 0.01 USDC
  
  // In real implementation, this would be a Solana transaction
  console.log(`   💸 Depositing ${depositAmount} ${offer.token} to provider...`);
  console.log('   ⏳ (In production: Solana transaction here)');
  
  const response = await makeRequest(
    'POST',
    '/api/session/create',
    {
      offerId: offer.offerId,
      depositAmount,
      agentPubkey: AGENT_CONFIG.agentPubkey
    }
  );
  
  if (response.status !== 201) {
    throw new Error(`Failed to create session: ${response.status}`);
  }
  
  const session = response.body;
  
  console.log('   ✅ Session created!');
  console.log(`   🆔 Session ID: ${session.sessionId}`);
  console.log(`   💰 Balance: ${session.remainingBalance} ${session.token}`);
  console.log(`   📊 Max requests: ${Math.floor(session.remainingBalance / session.pricePerRequest)}`);
  console.log(`   ⏰ Expires: ${new Date(session.expiresAt).toLocaleTimeString()}\n`);
  
  return session;
}

// Step 4: Execute requests
async function executeRequest(session, city) {
  console.log(`🌤️  Requesting weather for: ${city}`);
  
  const response = await makeRequest(
    'POST',
    '/api/weather',
    { city },
    { 'X-Gist-Session-Id': session.sessionId }
  );
  
  if (response.status !== 200) {
    throw new Error(`Request failed: ${response.status}`);
  }
  
  const receiptHeader = response.headers['x-gist-receipt'];
  const receipt = JSON.parse(receiptHeader);
  const data = response.body;
  
  console.log('   ✅ Response received');
  console.log(`   🌡️  Temperature: ${data.weather.temp}°F`);
  console.log(`   ☁️  Condition: ${data.weather.condition}`);
  console.log(`   💧 Humidity: ${data.weather.humidity}%`);
  console.log('');
  console.log('   📝 Receipt:');
  console.log(`      ID: ${receipt.receiptId}`);
  console.log(`      Latency: ${receipt.latencyMs}ms`);
  console.log(`      Charged: ${receipt.amountCharged} ${session.token}`);
  console.log(`      SLA: ${receipt.slaVerification.met ? '✅ MET' : '❌ BREACHED'}`);
  console.log(`      Signature: ${receipt.signature.substring(0, 30)}...`);
  console.log('');
  
  return receipt;
}

// Step 5: Close session
async function closeSession(session) {
  console.log('💵 Step 5: Closing session...');
  
  const response = await makeRequest(
    'POST',
    '/api/session/close',
    { sessionId: session.sessionId }
  );
  
  if (response.status !== 200) {
    throw new Error(`Failed to close session: ${response.status}`);
  }
  
  const refund = response.body;
  
  console.log('   ✅ Session closed');
  console.log(`   💰 Refund: ${refund.refundAmount.toFixed(4)} ${session.token}`);
  console.log('   ⏳ (In production: Solana refund transaction here)\n');
}

// Main execution
async function main() {
  try {
    // Step 1: Create Intent
    const intent = await createIntent();
    await sleep(500);
    
    // Step 2: Negotiate
    const offer = await negotiate(intent);
    await sleep(500);
    
    // Step 3: Create Session
    const session = await createSession(offer);
    currentSession = session;
    await sleep(500);
    
    // Step 4: Execute multiple requests
    console.log('🚀 Step 4: Making weather requests...\n');
    
    const cities = ['New York', 'London', 'Tokyo', 'Paris', 'Sydney'];
    
    for (const city of cities) {
      await executeRequest(session, city);
      await sleep(300);
    }
    
    // Step 5: Close session and get refund
    await closeSession(session);
    
    // Success!
    console.log('🎉 Demo Complete!\n');
    console.log('═'.repeat(50));
    console.log('✅ What just happened:');
    console.log('   1. Agent created Intent expressing needs');
    console.log('   2. Provider responded with signed Offer');
    console.log('   3. Agent deposited funds, created Session');
    console.log('   4. Agent made 5 paid requests (automatic payment)');
    console.log('   5. Each request got cryptographic Receipt');
    console.log('   6. Session closed, remaining balance refunded');
    console.log('═'.repeat(50));
    console.log('\n💡 In production:');
    console.log('   • Deposits would be real Solana transactions');
    console.log('   • Receipts would be anchored on-chain');
    console.log('   • Signatures would use real Ed25519 keys');
    console.log('   • SLA breaches trigger automatic refunds');
    console.log('\n🚀 This is Gist Plus in action!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the demo
console.log('🎬 Starting Gist Plus demo...\n');
setTimeout(main, 1000); // Wait 1 second for provider to be ready

