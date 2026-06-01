# Simple Gist Plus Demo

A complete, working example of the Gist Plus protocol in action!

## What This Demo Shows

- ✅ **Intent Creation** - Agent expresses its needs
- ✅ **Offer Negotiation** - Provider responds with pricing
- ✅ **Session Creation** - Prepaid channel with balance tracking
- ✅ **Multiple Requests** - Pay-per-request with automatic deduction
- ✅ **Receipt Generation** - Cryptographic proof for each request
- ✅ **SLA Verification** - Automatic latency checking
- ✅ **Session Closure** - Refund remaining balance

## The Scenario

**Provider:** A weather API that requires payment via Gist Plus
**Agent:** An AI agent that needs weather data for multiple cities
**Protocol:** Gist Plus handles all negotiation, payment, and verification automatically

## How to Run

### Terminal 1: Start the Provider

```bash
cd examples/simple-demo
node provider.js
```

You'll see:
```
🏭 Gist Plus Weather API Provider
================================

Configuration:
  Price: 0.001 USDC per request
  SLA: <1000ms latency
  Endpoint: http://localhost:3000

✅ Server started
🌐 Listening on http://localhost:3000
```

### Terminal 2: Run the Agent

```bash
cd examples/simple-demo
node agent.js
```

Watch the complete protocol flow happen automatically!

## Expected Output

### Agent Side:
```
🤖 Gist Plus Weather Agent
========================

📋 Step 1: Creating Intent...
   ✅ Intent created
   📝 Capability: weather-api
   💰 Max price: 0.01 USDC
   ⚡ SLA: <1000ms

🤝 Step 2: Negotiating with provider...
   ✅ Offer received
   🆔 Offer ID: offer_1234567890
   💵 Price: 0.001 USDC
   ⚡ SLA: <1000ms
   ✅ Offer accepted!

💰 Step 3: Creating prepaid session...
   💸 Depositing 0.01 USDC to provider...
   ✅ Session created!
   🆔 Session ID: session_1234567890
   💰 Balance: 0.01 USDC
   📊 Max requests: 10

🚀 Step 4: Making weather requests...

🌤️  Requesting weather for: New York
   ✅ Response received
   🌡️  Temperature: 72°F
   ☁️  Condition: Sunny
   💧 Humidity: 65%
   
   📝 Receipt:
      ID: receipt_1234567890
      Latency: 123ms
      Charged: 0.001 USDC
      SLA: ✅ MET
      Signature: mock_signature_12345...

[... 4 more cities ...]

💵 Step 5: Closing session...
   ✅ Session closed
   💰 Refund: 0.0050 USDC

🎉 Demo Complete!
```

### Provider Side:
```
📨 POST /api/weather
   🤝 Negotiating with Intent...
   📋 Intent: weather-api
   💰 Max price: 0.01 USDC
   ✅ Offer created: offer_1234567890
   💵 Price: 0.001 USDC

📨 POST /api/session/create
   💰 Creating session...
   ✅ Session created: session_1234567890
   💵 Deposit: 0.01 USDC
   📊 Max requests: 10

📨 POST /api/weather
   🔄 Processing request for: New York
   💳 Session: session_1234567890...
   💰 Balance: 0.0100 USDC
   ✅ Request completed in 123ms
   💵 Charged: 0.001 USDC
   💰 Remaining: 0.0090 USDC
   📊 Requests left: 9
   ✅ SLA: 123ms / 1000ms

[... 4 more requests ...]

📨 POST /api/session/close
   💵 Closing session: session_1234567890
   💰 Refund: 0.0050 USDC
```

## What's Happening Under the Hood

### 1. Intent → Offer Negotiation
```javascript
// Agent sends Intent
Agent → Provider: "I want weather-api, max 0.01 USDC/request"

// Provider responds with 402 + Offer
Provider → Agent: "402 Payment Required + Here's my Offer: 0.001 USDC/request"

// Agent evaluates
0.001 <= 0.01 ✅ Accepted!
```

### 2. Session Creation
```javascript
// Agent deposits funds
Deposit: 0.01 USDC
Price per request: 0.001 USDC
Maximum requests: 10

// Session created with balance tracking
Session {
  balance: 0.01,
  pricePerRequest: 0.001,
  requestCount: 0
}
```

### 3. Request Execution
```javascript
// For each request:
1. Provider validates session (active, sufficient balance)
2. Provider processes request
3. Provider deducts from balance (0.01 → 0.009)
4. Provider generates signed Receipt
5. Agent receives data + Receipt

// Balance tracking:
Request 1: 0.010 → 0.009 ✅
Request 2: 0.009 → 0.008 ✅
Request 3: 0.008 → 0.007 ✅
Request 4: 0.007 → 0.006 ✅
Request 5: 0.006 → 0.005 ✅
```

### 4. Receipt Verification
```javascript
Receipt {
  receiptId: "receipt_123",
  latency: 123ms,
  amountCharged: 0.001,
  slaVerification: {
    met: true,  // 123ms < 1000ms ✅
    metrics: { latency: { expected: 1000, actual: 123, met: true } }
  },
  signature: "provider_signature",  // Verifiable!
  inputHash: "sha256(...)",   // Tamper-proof
  outputHash: "sha256(...)"   // Tamper-proof
}
```

### 5. Session Closure
```javascript
// Remaining balance refunded
Initial deposit: 0.01 USDC
Spent (5 requests): 0.005 USDC
Remaining: 0.005 USDC
Refund: 0.005 USDC ✅
```

## Why This is Revolutionary

### Traditional API:
```javascript
// Problem 1: Manual API key management
const API_KEY = "sk_live_abc123...";  // Can be stolen!

// Problem 2: Fixed pricing
const PRICE = 0.01;  // No negotiation

// Problem 3: No proof
const response = await fetch(url, { headers: { "X-API-Key": API_KEY }});
// No receipt, no SLA, no refunds

// Problem 4: Pay per request
// Every call needs payment processing!
```

### Gist Plus Way:
```javascript
// ✅ Automatic negotiation
// ✅ Dynamic pricing
// ✅ Cryptographic receipts
// ✅ SLA enforcement
// ✅ Prepaid sessions (no per-request overhead)
// ✅ Automatic refunds
```

## Customization

Want to modify the demo?

### Change Pricing:
```javascript
// In provider.js
const PROVIDER_CONFIG = {
  basePrice: 0.005,  // Change price
  // ...
};
```

### Add New Endpoints:
```javascript
// In provider.js
if (url === '/api/my-service') {
  return handleSessionRequest(req, res, body, sessionId);
}
```

### Different Agent Behavior:
```javascript
// In agent.js
const cities = ['Boston', 'Miami', 'Seattle'];  // Different cities
const depositAmount = 0.02;  // More deposit
```

## Production Differences

This demo uses mock data for simplicity. In production:

| Demo | Production |
|------|-----------|
| Mock deposits | Real Solana transactions |
| Mock signatures | Real Ed25519 signatures |
| In-memory storage | Redis/PostgreSQL |
| Mock receipts | On-chain anchoring (optional) |
| Local HTTP | HTTPS with real endpoints |

But the **protocol flow is identical**! 🎯

## Next Steps

1. ✅ Run this demo to understand the protocol
2. 📚 Read the [full documentation](../../docs/GETTING_STARTED.md)
3. 🔧 Modify this example for your use case
4. 🚀 Build your own Gist Plus service!

## Questions?

- How does negotiation work? → See Step 2 in the output
- How are receipts verified? → Each has a signature + hashes
- What if SLA is breached? → Automatic refund (built-in)
- Can I use other tokens? → Yes! SOL, USDC, USDT, BONK

---

**This is Gist Plus in action!** 🚀

**The future of AI commerce, running on your machine right now.**

