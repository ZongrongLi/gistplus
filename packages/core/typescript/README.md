# @gistplus/core

[![Twitter Follow](https://img.shields.io/twitter/follow/gistplus?style=social)](https://x.com/gistplus)

Core protocol schemas, types, and cryptography for the Gist Plus programmable commerce protocol.

## Installation

```bash
npm install @gistplus/core
```

## What is Gist Plus?

Gist Plus is a protocol for programmable commerce between AI agents and services, built on Solana. It enables autonomous negotiation, payment, and verification with cryptographic guarantees.

## What's in This Package?

This is the **core foundation** that all other Gist Plus packages depend on. It provides:

- ✅ **Type Definitions** - Complete TypeScript types for Intent, Offer, Session, Receipt
- ✅ **Cryptography** - Ed25519 signature generation and verification
- ✅ **Serialization** - Canonical JSON and SHA-256 hashing
- ✅ **Validation** - Input validation for all protocol objects
- ✅ **Constants** - Protocol constants, HTTP status codes, token definitions

## Usage

### Creating an Intent

```typescript
import { createIntent, Intent } from '@gistplus/core';

const intent: Intent = createIntent({
  capability: 'gpt-4-inference',
  maxPricePerRequest: 0.01,
  token: 'USDC',
  agentPubkey: myKeypair.publicKey,
  sla: {
    maxLatencyMs: 2000,
    minUptimePercent: 99.0
  }
});
```

### Creating and Verifying an Offer

```typescript
import { createOffer, verifyOffer } from '@gistplus/core';

// Provider creates offer
const offer = createOffer({
  intent,
  providerPubkey: providerKeypair.publicKey,
  pricePerRequest: 0.008,
  sla: { maxLatencyMs: 1500 },
  sessionDurationMs: 600000,
  endpoint: 'https://api.provider.com'
}, providerKeypair);

// Agent verifies offer
verifyOffer(offer); // Throws if invalid or expired
```

### Creating a Receipt

```typescript
import { createReceipt } from '@gistplus/core';

const receipt = createReceipt({
  session,
  requestNumber: 1,
  inputData: { prompt: 'Hello' },
  outputData: { response: 'Hi there!' },
  requestStartedAt: startTime,
  requestCompletedAt: Date.now(),
  amountCharged: session.pricePerRequest
}, providerKeypair);
```

### Verifying Signatures

```typescript
import { verifySignature } from '@gistplus/core';

// Verify offer signature
const message = createSignableMessage(offer);
verifySignature(message, offer.signature, offer.providerPubkey);

// Verify receipt signature
const receiptMessage = createSignableMessage(receipt);
verifySignature(receiptMessage, receipt.signature, receipt.providerPubkey);
```

## Types

### Intent
Agent's expression of demand with price constraints and SLA requirements.

### Offer
Provider's signed quote in response to an Intent.

### Session
Prepaid channel for multiple requests with balance tracking.

### Receipt
Cryptographic proof of completed work with SLA verification.

## Constants

```typescript
import { 
  HTTP_STATUS,
  SUPPORTED_TOKENS,
  TOKEN_MINTS 
} from '@gistplus/core';

console.log(HTTP_STATUS.PAYMENT_REQUIRED); // 402
console.log(SUPPORTED_TOKENS); // ['SOL', 'USDC', 'USDT', 'BONK']
```

## API Reference

See the [full documentation](https://github.com/gistplusxyz/gistplus/tree/main/docs) for complete API reference.

## Related Packages

- **[@gistplus/client](https://www.npmjs.com/package/@gistplus/client)** - Client SDK for AI agents
- **[@gistplus/server](https://www.npmjs.com/package/@gistplus/server)** - Server middleware for providers

## License

Apache 2.0

## Links

- [GitHub](https://github.com/gistplusxyz/gistplus)
- [Documentation](https://github.com/gistplusxyz/gistplus/tree/main/docs)
- [Examples](https://github.com/gistplusxyz/gistplus/tree/main/examples)

