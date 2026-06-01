# @gistplus/server

[![Twitter Follow](https://img.shields.io/twitter/follow/gistplus?style=social)](https://x.com/gistplus)

Server middleware for API providers to monetize endpoints with Gist Plus protocol.

## Installation

```bash
npm install @gistplus/server
```

## What is This?

This package enables **API providers** to:
- 💰 Monetize endpoints automatically
- 🤝 Negotiate pricing with agents
- 📝 Generate cryptographic receipts
- ⚖️ Enforce SLA guarantees
- 💵 Accept SOL/USDC/USDT payments

## Quick Start

```typescript
import express from 'express';
import { Connection, Keypair } from '@solana/web3.js';
import { gistMiddleware } from '@gistplus/server';

const app = express();
const connection = new Connection('https://api.devnet.solana.com');
const wallet = Keypair.generate(); // Your provider wallet

// Add Gist Plus middleware
app.use('/api/*', gistMiddleware({
  connection,
  wallet,
  endpoint: 'https://your-api.com',
  pricing: {
    basePrice: 0.01,
    token: 'USDC'
  },
  sla: {
    maxLatencyMs: 2000,
    minUptimePercent: 99.5
  }
}));

// Your API endpoint (now monetized!)
app.post('/api/inference', async (req, res) => {
  // req.gistSession contains session info
  const result = await runInference(req.body);
  
  // Automatic receipt generation
  return res.gistReceipt?.(result);
});

app.listen(3000);
```

That's it! Your API now:
- ✅ Responds with 402 Payment Required
- ✅ Negotiates with agents automatically
- ✅ Validates sessions
- ✅ Generates signed receipts
- ✅ Tracks balances

## Core Features

### Automatic 402 Responses

```typescript
// When agent hits your endpoint without payment:
GET /api/inference
↓
402 Payment Required
X-Gist-Offer: {signed offer with your pricing}
```

### Dynamic Pricing

```typescript
import { LoadBasedPricingStrategy } from '@gistplus/server';

const pricing = new LoadBasedPricingStrategy(
  0.01,     // base price
  'USDC',
  () => getCurrentLoad()  // returns 0-1
);

app.use(gistMiddleware({
  // ...
  pricing  // Price increases with load
}));
```

### Multiple Pricing Strategies

```typescript
// Static pricing
pricing: { basePrice: 0.01, token: 'USDC' }

// Load-based
pricing: new LoadBasedPricingStrategy(0.01, 'USDC', getLoad)

// Time-based (peak hours)
pricing: new TimeBasedPricingStrategy(
  0.02,  // peak price
  0.01,  // off-peak price
  { start: 9, end: 17 },  // peak hours
  'USDC'
)

// SLA-based (stricter SLA = higher price)
pricing: new SLABasedPricingStrategy(0.01, 'USDC')
```

### Receipt Generation

```typescript
app.post('/api/inference', async (req, res) => {
  const result = await processRequest(req.body);
  
  // Middleware automatically:
  // - Generates receipt
  // - Signs with your key
  // - Verifies SLA
  // - Updates session balance
  // - Sends X-Gist-Receipt header
  
  return res.gistReceipt?.(result);
});
```

### Session Management

```typescript
app.post('/api/inference', async (req, res) => {
  // Session info automatically attached
  const session = req.gistSession;
  
  console.log(session.remainingBalance);
  console.log(session.requestCount);
  console.log(session.expiresAt);
  
  // Process request...
});
```

## API Reference

### gistMiddleware(config)

Creates Express middleware for Gist Plus protocol.

```typescript
app.use(gistMiddleware({
  connection: Connection,           // Solana connection
  wallet: Keypair,                 // Provider wallet
  endpoint: string,                // Your API URL
  pricing: PricingStrategy | {     // Pricing config
    basePrice: number,
    token: 'SOL' | 'USDC' | 'USDT' | 'BONK'
  },
  sla: {                          // SLA guarantees
    maxLatencyMs?: number,
    minUptimePercent?: number,
    maxErrorRatePercent?: number
  },
  sessionDurationMs?: number,     // Default: 10 minutes
  offerExpirationMs?: number      // Default: 1 minute
}));
```

### Request Extensions

The middleware adds these to Express Request:

```typescript
interface Request {
  gistSession?: Session;           // Current session
  gistIntent?: Intent;            // Agent's intent
  gistRequestStartTime?: number;  // For latency calc
}
```

### Response Extensions

The middleware adds these to Express Response:

```typescript
interface Response {
  gistReceipt?: (data: any) => Response;  // Generate receipt
}
```

## Usage Patterns

### Basic Protected Endpoint

```typescript
app.use('/api/*', gistMiddleware(config));

app.post('/api/weather', async (req, res) => {
  const data = await getWeather(req.body.city);
  return res.gistReceipt?.(data);
});
```

### Custom Validation

```typescript
app.post('/api/premium', async (req, res) => {
  const session = req.gistSession;
  
  // Check if enough balance for premium feature
  if (session.remainingBalance < 0.1) {
    return res.status(402).json({
      error: 'Insufficient balance for premium feature'
    });
  }
  
  const result = await processPremium(req.body);
  return res.gistReceipt?.(result);
});
```

### Multiple Endpoints, Different Pricing

```typescript
// Cheap endpoint
app.use('/api/basic', gistMiddleware({
  ...config,
  pricing: { basePrice: 0.001, token: 'USDC' }
}));

// Expensive endpoint
app.use('/api/premium', gistMiddleware({
  ...config,
  pricing: { basePrice: 0.1, token: 'USDC' }
}));
```

### With Error Handling

```typescript
app.post('/api/inference', async (req, res) => {
  try {
    const result = await runInference(req.body);
    return res.gistReceipt?.(result);
  } catch (error) {
    // Errors don't charge the session
    res.status(500).json({ error: error.message });
  }
});
```

## Pricing Strategies

### Static Pricing

```typescript
pricing: {
  basePrice: 0.01,
  token: 'USDC'
}
```

### Load-Based Pricing

```typescript
import { LoadBasedPricingStrategy } from '@gistplus/server';

const pricing = new LoadBasedPricingStrategy(
  0.01,  // base price
  'USDC',
  () => {
    // Return load factor 0-1
    const currentLoad = getCurrentLoad();
    return currentLoad / maxLoad;
  }
);
// Load 0% → 0.01 USDC
// Load 50% → 0.015 USDC
// Load 100% → 0.02 USDC
```

### Time-Based Pricing

```typescript
import { TimeBasedPricingStrategy } from '@gistplus/server';

const pricing = new TimeBasedPricingStrategy(
  0.02,   // peak price
  0.01,   // off-peak price
  { start: 9, end: 17 },  // 9 AM - 5 PM
  'USDC'
);
```

### SLA-Based Pricing

```typescript
import { SLABasedPricingStrategy } from '@gistplus/server';

const pricing = new SLABasedPricingStrategy(0.01, 'USDC');
// <1s latency SLA → 1.5x price
// <2s latency SLA → 1.25x price
// >99.5% uptime → 1.3x price
```

### Custom Pricing

```typescript
class MyCustomPricing implements PricingStrategy {
  getPrice(intent: Intent): number {
    // Your custom logic
    if (intent.capability === 'premium') return 0.1;
    if (isWeekend()) return 0.005;
    return 0.01;
  }
}

const pricing = new MyCustomPricing();
```

## Examples

### AI Inference API

```typescript
app.use('/api/inference', gistMiddleware({
  connection,
  wallet,
  endpoint: 'https://ai.example.com',
  pricing: { basePrice: 0.01, token: 'USDC' },
  sla: { maxLatencyMs: 3000 }
}));

app.post('/api/inference', async (req, res) => {
  const result = await model.generate(req.body.prompt);
  return res.gistReceipt?.(result);
});
```

### Image Generation API

```typescript
app.use('/api/image', gistMiddleware({
  connection,
  wallet,
  endpoint: 'https://image.example.com',
  pricing: { basePrice: 0.05, token: 'USDC' },
  sla: { maxLatencyMs: 10000 }
}));

app.post('/api/image', async (req, res) => {
  const imageUrl = await generateImage(req.body);
  return res.gistReceipt?.({ imageUrl });
});
```

### Data API

```typescript
app.use('/api/data', gistMiddleware({
  connection,
  wallet,
  endpoint: 'https://data.example.com',
  pricing: { basePrice: 0.001, token: 'USDC' },
  sla: { maxLatencyMs: 1000 }
}));

app.post('/api/data', async (req, res) => {
  const data = await fetchData(req.body.query);
  return res.gistReceipt?.(data);
});
```

## Related Packages

- **[@gistplus/core](https://www.npmjs.com/package/@gistplus/core)** - Core protocol (auto-installed)
- **[@gistplus/client](https://www.npmjs.com/package/@gistplus/client)** - For AI agents

## License

Apache 2.0

