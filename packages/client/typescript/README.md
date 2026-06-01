# @gistplus/client

[![Twitter Follow](https://img.shields.io/twitter/follow/gistplus?style=social)](https://x.com/gistplus)

Client SDK for AI agents and applications to interact with Gist Plus providers.

## Installation

```bash
npm install @gistplus/client
```

## What is This?

This package enables **AI agents and applications** to:
- 🤝 Negotiate pricing with API providers
- 💰 Create prepaid sessions
- 🚀 Execute requests with automatic payment
- ✅ Verify cryptographic receipts
- 💵 Get refunds for unused balance

## Quick Start

```typescript
import { Connection, Keypair } from '@solana/web3.js';
import { GistClient } from '@gistplus/client';

// Initialize
const connection = new Connection('https://api.devnet.solana.com');
const wallet = Keypair.generate(); // Your agent's wallet
const client = new GistClient({ connection, wallet });

// 1. Create Intent (express your needs)
const intent = client.createIntent({
  capability: 'gpt-4-inference',
  maxPricePerRequest: 0.01,
  token: 'USDC',
  sla: { maxLatencyMs: 2000 }
});

// 2. Negotiate with provider
const offer = await client.negotiate('https://api.provider.com', intent);

// 3. Create prepaid session
const session = await client.createSession(offer);

// 4. Execute requests (payment automatic!)
const result = await client.executeRequest(session.sessionId, {
  prompt: 'Explain quantum computing'
});

console.log(result.data);     // API response
console.log(result.receipt);  // Cryptographic proof

// 5. Close session and get refund
await client.closeSession(session.sessionId);
```

## Core Features

### Automatic Negotiation
```typescript
// Agent expresses maximum price
const intent = client.createIntent({
  maxPricePerRequest: 0.01,
  capability: 'ai-inference'
});

// Provider responds with actual price
const offer = await client.negotiate(endpoint, intent);

// Verify it's within budget
if (offer.pricePerRequest <= intent.maxPricePerRequest) {
  // Accept!
}
```

### Prepaid Sessions
```typescript
// Deposit once, make many requests
const session = await client.createSession(offer, {
  depositAmount: 1.0  // 1 USDC
});

// Make multiple requests without per-request transactions
await client.executeRequest(session.sessionId, request1);
await client.executeRequest(session.sessionId, request2);
await client.executeRequest(session.sessionId, request3);
```

### Receipt Verification
```typescript
const result = await client.executeRequest(sessionId, data);

// Every request gets a cryptographic receipt
console.log(result.receipt);
/*
{
  receiptId: "receipt_123",
  inputHash: "sha256(...)",    // Tamper-proof
  outputHash: "sha256(...)",   // Tamper-proof
  signature: "...",            // Provider's signature
  slaVerification: {
    met: true,
    metrics: { latency: { expected: 2000, actual: 1234 } }
  }
}
*/
```

### SLA Enforcement
```typescript
// Request SLA guarantees
const intent = client.createIntent({
  sla: {
    maxLatencyMs: 2000,      // Must respond within 2s
    minUptimePercent: 99.0,  // Must have 99% uptime
  }
});

// If provider breaches SLA, automatic refund!
```

## API Reference

### GistClient

#### Constructor
```typescript
new GistClient({
  connection: Connection,    // Solana connection
  wallet: Keypair,          // Your wallet
  httpConfig?: {            // Optional HTTP settings
    timeout?: number,
    headers?: Record<string, string>
  }
})
```

#### Methods

**createIntent(options)**
```typescript
client.createIntent({
  capability: string,
  maxPricePerRequest: number,
  token: 'SOL' | 'USDC' | 'USDT' | 'BONK',
  sla?: { maxLatencyMs?, minUptimePercent? },
  maxSessionBudget?: number,
  sessionDurationMs?: number,
  metadata?: Record<string, any>
})
```

**negotiate(endpoint, intent)**
```typescript
const offer = await client.negotiate(
  'https://api.provider.com',
  intent
);
```

**createSession(offer, options?)**
```typescript
const session = await client.createSession(offer, {
  depositAmount?: number,      // Custom deposit
  anchorOnChain?: boolean      // Store on Solana (optional)
});
```

**executeRequest(sessionId, data)**
```typescript
const result = await client.executeRequest(
  sessionId,
  { prompt: 'Hello' }
);
// Returns: { data, receipt }
```

**closeSession(sessionId)**
```typescript
const refund = await client.closeSession(sessionId);
// Returns: { refundAmount, txSignature }
```

**getSession(sessionId)**
```typescript
const session = client.getSession(sessionId);
```

**getActiveSessions()**
```typescript
const sessions = client.getActiveSessions();
```

## Examples

### AI Inference
```typescript
const intent = client.createIntent({
  capability: 'gpt-4-inference',
  maxPricePerRequest: 0.01,
  token: 'USDC'
});

const offer = await client.negotiate('https://ai-api.com', intent);
const session = await client.createSession(offer);

const result = await client.executeRequest(session.sessionId, {
  prompt: 'Write a poem about Solana'
});

console.log(result.data.text);
```

### Image Generation
```typescript
const intent = client.createIntent({
  capability: 'image-generation',
  maxPricePerRequest: 0.05,
  token: 'USDC'
});

const offer = await client.negotiate('https://image-api.com', intent);
const session = await client.createSession(offer);

const result = await client.executeRequest(session.sessionId, {
  prompt: 'A futuristic city on Mars',
  style: 'photorealistic'
});

console.log(result.data.imageUrl);
```

### Data Analysis
```typescript
const intent = client.createIntent({
  capability: 'data-analysis',
  maxPricePerRequest: 0.001,
  token: 'USDC'
});

const offer = await client.negotiate('https://data-api.com', intent);
const session = await client.createSession(offer);

const result = await client.executeRequest(session.sessionId, {
  dataset: myData,
  operation: 'statistical-summary'
});

console.log(result.data.analysis);
```

## Error Handling

```typescript
try {
  const offer = await client.negotiate(endpoint, intent);
  const session = await client.createSession(offer);
  const result = await client.executeRequest(session.sessionId, data);
} catch (error) {
  if (error instanceof InvalidOfferError) {
    console.error('Offer validation failed');
  } else if (error instanceof SessionExpiredError) {
    console.error('Session expired, create new one');
  } else if (error instanceof InsufficientFundsError) {
    console.error('Session balance depleted');
  }
}
```

## Related Packages

- **[@gistplus/core](https://www.npmjs.com/package/@gistplus/core)** - Core protocol (auto-installed)
- **[@gistplus/server](https://www.npmjs.com/package/@gistplus/server)** - For API providers

## License

Apache 2.0

