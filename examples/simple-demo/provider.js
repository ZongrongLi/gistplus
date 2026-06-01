/**
 * Simple Gist Plus Provider Example
 * 
 * A weather API that requires payment via Gist Plus protocol
 * Run this first, then run the agent.js in another terminal
 */

const http = require('http');

// Simple in-memory storage
const sessions = new Map();
const offers = new Map();

// Provider configuration
const PROVIDER_CONFIG = {
  providerPubkey: 'ProviderKey123ABC',
  basePrice: 0.001,  // 0.001 USDC per request
  token: 'USDC',
  endpoint: 'http://localhost:3000',
  sla: {
    maxLatencyMs: 1000,
    minUptimePercent: 99.5
  }
};

console.log('🏭 Gist Plus Weather API Provider');
console.log('================================\n');
console.log('Configuration:');
console.log(`  Price: ${PROVIDER_CONFIG.basePrice} ${PROVIDER_CONFIG.token} per request`);
console.log(`  SLA: <${PROVIDER_CONFIG.sla.maxLatencyMs}ms latency`);
console.log(`  Endpoint: ${PROVIDER_CONFIG.endpoint}\n`);

// Weather data (mock)
const WEATHER_DATA = {
  'New York': { temp: 72, condition: 'Sunny', humidity: 65 },
  'London': { temp: 58, condition: 'Cloudy', humidity: 80 },
  'Tokyo': { temp: 68, condition: 'Rainy', humidity: 75 },
  'Paris': { temp: 65, condition: 'Partly Cloudy', humidity: 70 },
  'Sydney': { temp: 78, condition: 'Clear', humidity: 55 },
};

// Create HTTP server
const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      handleRequest(req, res, body);
    } catch (error) {
      console.error('Error:', error.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
});

function handleRequest(req, res, body) {
  const url = req.url;
  const intentHeader = req.headers['x-gist-intent'];
  const sessionId = req.headers['x-gist-session-id'];
  
  console.log(`\n📨 ${req.method} ${url}`);
  
  // Route: Health check
  if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      protocol: 'Gist Plus',
      provider: PROVIDER_CONFIG.providerPubkey
    }));
    return;
  }
  
  // Route: Weather API (protected by Gist Plus)
  if (url === '/api/weather') {
    // Check if session exists
    if (sessionId) {
      return handleSessionRequest(req, res, body, sessionId);
    }
    
    // No session - check for Intent
    if (intentHeader) {
      return handleIntentNegotiation(req, res, intentHeader);
    }
    
    // No session, no Intent - return 402
    console.log('   ⚠️  No session or Intent - returning 402');
    res.writeHead(402, { 
      'Content-Type': 'application/json',
      'X-Gist-Message': 'Payment Required - Send Intent to negotiate'
    });
    res.end(JSON.stringify({
      error: 'Payment Required',
      message: 'This endpoint requires Gist Plus payment',
      protocol: 'Gist Plus',
      providerPubkey: PROVIDER_CONFIG.providerPubkey
    }));
    return;
  }
  
  // Route: Create session
  if (url === '/api/session/create' && req.method === 'POST') {
    return handleSessionCreation(req, res, body);
  }
  
  // Route: Close session
  if (url.startsWith('/api/session/close') && req.method === 'POST') {
    return handleSessionClosure(req, res, body);
  }
  
  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
}

function handleIntentNegotiation(req, res, intentHeader) {
  console.log('   🤝 Negotiating with Intent...');
  
  const intent = JSON.parse(intentHeader);
  console.log(`   📋 Intent: ${intent.capability}`);
  console.log(`   💰 Max price: ${intent.maxPricePerRequest} ${intent.token}`);
  
  // Create Offer
  const offer = {
    version: '0.1.0',
    timestamp: Date.now(),
    intentId: intent.intentId,
    offerId: `offer_${Date.now()}`,
    providerPubkey: PROVIDER_CONFIG.providerPubkey,
    pricePerRequest: PROVIDER_CONFIG.basePrice,
    token: PROVIDER_CONFIG.token,
    tokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    sla: PROVIDER_CONFIG.sla,
    sessionDurationMs: 600000,
    expiresAt: Date.now() + 60000,
    endpoint: PROVIDER_CONFIG.endpoint,
    signature: 'mock_signature_' + Date.now(),
  };
  
  // Store offer temporarily
  offers.set(offer.offerId, offer);
  
  console.log(`   ✅ Offer created: ${offer.offerId}`);
  console.log(`   💵 Price: ${offer.pricePerRequest} ${offer.token}`);
  
  // Return 402 with Offer
  res.writeHead(402, { 
    'Content-Type': 'application/json',
    'X-Gist-Offer': JSON.stringify(offer)
  });
  res.end(JSON.stringify({
    message: 'Offer provided',
    offerId: offer.offerId,
    pricePerRequest: offer.pricePerRequest,
    token: offer.token
  }));
}

function handleSessionCreation(req, res, body) {
  console.log('   💰 Creating session...');
  
  const data = JSON.parse(body);
  const { offerId, depositAmount, agentPubkey } = data;
  
  const offer = offers.get(offerId);
  if (!offer) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Offer not found or expired' }));
    return;
  }
  
  // Create session
  const session = {
    sessionId: `session_${Date.now()}`,
    offerId: offer.offerId,
    agentPubkey,
    providerPubkey: PROVIDER_CONFIG.providerPubkey,
    token: offer.token,
    depositAmount,
    remainingBalance: depositAmount,
    pricePerRequest: offer.pricePerRequest,
    startedAt: Date.now(),
    expiresAt: Date.now() + offer.sessionDurationMs,
    sla: offer.sla,
    state: 'active',
    requestCount: 0
  };
  
  sessions.set(session.sessionId, session);
  
  console.log(`   ✅ Session created: ${session.sessionId}`);
  console.log(`   💵 Deposit: ${session.depositAmount} ${session.token}`);
  console.log(`   📊 Max requests: ${Math.floor(depositAmount / offer.pricePerRequest)}`);
  
  res.writeHead(201, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(session));
}

function handleSessionRequest(req, res, body, sessionId) {
  const session = sessions.get(sessionId);
  
  if (!session) {
    console.log('   ❌ Session not found');
    res.writeHead(410, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Session not found or expired' }));
    return;
  }
  
  // Check balance
  if (session.remainingBalance < session.pricePerRequest) {
    console.log('   ❌ Insufficient balance');
    res.writeHead(402, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Insufficient balance in session' }));
    return;
  }
  
  const requestStartTime = Date.now();
  
  // Process request
  const requestData = JSON.parse(body || '{}');
  const city = requestData.city || 'New York';
  
  console.log(`   🔄 Processing request for: ${city}`);
  console.log(`   💳 Session: ${sessionId.substring(0, 20)}...`);
  console.log(`   💰 Balance: ${session.remainingBalance.toFixed(4)} ${session.token}`);
  
  // Get weather data
  const weatherData = WEATHER_DATA[city] || WEATHER_DATA['New York'];
  
  // Simulate processing time
  const processingTime = 50 + Math.random() * 200;
  setTimeout(() => {
    const requestEndTime = Date.now();
    const latency = requestEndTime - requestStartTime;
    
    // Update session
    session.remainingBalance -= session.pricePerRequest;
    session.requestCount++;
    
    if (session.remainingBalance < session.pricePerRequest) {
      session.state = 'depleted';
    }
    
    // Create Receipt
    const receipt = {
      receiptId: `receipt_${Date.now()}`,
      sessionId: session.sessionId,
      requestNumber: session.requestCount,
      inputHash: 'sha256_' + Date.now(),
      outputHash: 'sha256_' + (Date.now() + 1),
      requestStartedAt: requestStartTime,
      requestCompletedAt: requestEndTime,
      latencyMs: latency,
      amountCharged: session.pricePerRequest,
      slaVerification: {
        met: latency <= session.sla.maxLatencyMs,
        metrics: {
          latency: {
            expected: session.sla.maxLatencyMs,
            actual: latency,
            met: latency <= session.sla.maxLatencyMs
          }
        }
      },
      providerPubkey: PROVIDER_CONFIG.providerPubkey,
      signature: 'mock_signature_' + Date.now()
    };
    
    console.log(`   ✅ Request completed in ${latency}ms`);
    console.log(`   💵 Charged: ${session.pricePerRequest} ${session.token}`);
    console.log(`   💰 Remaining: ${session.remainingBalance.toFixed(4)} ${session.token}`);
    console.log(`   📊 Requests left: ${Math.floor(session.remainingBalance / session.pricePerRequest)}`);
    console.log(`   ${receipt.slaVerification.met ? '✅' : '❌'} SLA: ${latency}ms / ${session.sla.maxLatencyMs}ms`);
    
    // Return response with receipt
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'X-Gist-Receipt': JSON.stringify(receipt),
      'X-Gist-SLA-Status': receipt.slaVerification.met ? 'met' : 'breached'
    });
    res.end(JSON.stringify({
      city,
      weather: weatherData,
      receipt: receipt
    }));
  }, processingTime);
}

function handleSessionClosure(req, res, body) {
  const data = JSON.parse(body);
  const { sessionId } = data;
  
  const session = sessions.get(sessionId);
  if (!session) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Session not found' }));
    return;
  }
  
  console.log(`   💵 Closing session: ${sessionId}`);
  console.log(`   💰 Refund: ${session.remainingBalance.toFixed(4)} ${session.token}`);
  
  const refundAmount = session.remainingBalance;
  sessions.delete(sessionId);
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    refundAmount,
    message: `Refunded ${refundAmount} ${session.token}`
  }));
}

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log('✅ Server started');
  console.log(`🌐 Listening on http://localhost:${PORT}`);
  console.log('\n💡 Endpoints:');
  console.log('   GET  /health           - Health check');
  console.log('   POST /api/weather      - Weather API (Gist Plus protected)');
  console.log('   POST /api/session/create   - Create session');
  console.log('   POST /api/session/close    - Close session');
  console.log('\n✨ Ready to serve requests!\n');
  console.log('👉 Now run: node examples/simple-demo/agent.js\n');
});

