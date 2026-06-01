# Gist Plus Protocol Specification

**Version:** 0.1.0  
**Status:** Draft  
**Authors:** Gist Plus Contributors

## Abstract

Gist Plus is a protocol for programmable commerce between autonomous AI systems. It extends HTTP 402 (Payment Required) into a complete negotiation, transaction, and verification framework built on Solana.

## 1. Introduction

### 1.1 Motivation

Traditional API monetization requires:
- Manual API key management
- Fixed pricing with no negotiation
- No cryptographic proof of work
- No SLA enforcement
- Centralized payment processors

Gist Plus solves these problems with:
- Automatic negotiation between agents
- Dynamic, market-driven pricing
- Cryptographic receipts for every transaction
- Automatic SLA enforcement and refunds
- Decentralized settlement on Solana

### 1.2 Design Goals

1. **Autonomous** - Agents transact without human intervention
2. **Trustless** - Cryptographic verification, no intermediaries
3. **Efficient** - Prepaid sessions eliminate per-request overhead
4. **Fair** - SLA enforcement with automatic refunds
5. **Scalable** - Built on Solana for high throughput

## 2. Protocol Architecture

### 2.1 Four-Stage Model

Gist Plus uses a four-stage transactional model:

#### Stage 1: Intent
Agent expresses demand with constraints.

#### Stage 2: Offer
Provider responds with signed quote.

#### Stage 3: Session
Prepaid channel for multiple requests.

#### Stage 4: Receipt
Cryptographic proof of completed work.

### 2.2 Transport Layer

- **Protocol**: HTTP/1.1 or HTTP/2
- **Encoding**: JSON
- **Signatures**: Ed25519 (Solana native)
- **Hashing**: SHA-256

## 3. Data Structures

### 3.1 Intent

```typescript
{
  version: "0.1.0",
  timestamp: 1234567890000,
  intentId: "intent_abc123",
  capability: "gpt-4-inference",
  maxPricePerRequest: 0.01,
  token: "USDC",
  maxSessionBudget: 1.0,
  sessionDurationMs: 600000,
  sla: {
    maxLatencyMs: 2000,
    minUptimePercent: 99.0
  },
  agentPubkey: "SolanaPublicKey...",
  metadata: {}
}
```

**Fields:**
- `intentId` - Unique identifier
- `capability` - Service requested (e.g., "gpt-4-inference")
- `maxPricePerRequest` - Price ceiling (in token units)
- `token` - Payment token (SOL, USDC, etc.)
- `sla` - Service level requirements
- `agentPubkey` - Agent's Solana public key

### 3.2 Offer

```typescript
{
  version: "0.1.0",
  timestamp: 1234567890000,
  intentId: "intent_abc123",
  offerId: "offer_xyz789",
  providerPubkey: "SolanaPublicKey...",
  pricePerRequest: 0.008,
  token: "USDC",
  tokenMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  sla: {
    maxLatencyMs: 1500,
    minUptimePercent: 99.5
  },
  sessionDurationMs: 600000,
  expiresAt: 1234567950000,
  endpoint: "https://api.provider.com",
  signature: "base58EncodedEd25519Signature...",
  metadata: {}
}
```

**Fields:**
- `offerId` - Unique identifier
- `providerPubkey` - Provider's Solana public key
- `pricePerRequest` - Actual price offered
- `sla` - SLA guarantees
- `expiresAt` - Offer expiration timestamp
- `signature` - Ed25519 signature over all fields

**Signature Verification:**
```typescript
const message = canonicalJSON(offer, exclude=['signature']);
const valid = ed25519.verify(
  message,
  offer.signature,
  offer.providerPubkey
);
```

### 3.3 Session

```typescript
{
  version: "0.1.0",
  timestamp: 1234567890000,
  sessionId: "session_def456",
  offerId: "offer_xyz789",
  agentPubkey: "AgentPublicKey...",
  providerPubkey: "ProviderPublicKey...",
  token: "USDC",
  depositAmount: 1.0,
  remainingBalance: 1.0,
  pricePerRequest: 0.008,
  startedAt: 1234567890000,
  expiresAt: 1234568490000,
  sla: { ... },
  state: "active",
  creationTxSignature: "SolanaTransaction...",
  pdaAddress: "PDA...",
  requestCount: 0
}
```

**States:**
- `active` - Session is active
- `depleted` - Balance exhausted
- `expired` - Time expired
- `refunded` - Funds returned
- `disputed` - Under dispute

### 3.4 Receipt

```typescript
{
  version: "0.1.0",
  timestamp: 1234567890500,
  receiptId: "receipt_ghi789",
  sessionId: "session_def456",
  requestNumber: 1,
  inputHash: "sha256(input)",
  outputHash: "sha256(output)",
  requestStartedAt: 1234567890000,
  requestCompletedAt: 1234567890500,
  latencyMs: 500,
  amountCharged: 0.008,
  slaVerification: {
    met: true,
    metrics: {
      latency: { expected: 1500, actual: 500, met: true }
    }
  },
  providerPubkey: "ProviderPublicKey...",
  signature: "base58EncodedEd25519Signature...",
  pdaAddress: "PDA...",
  metadata: {}
}
```

## 4. Protocol Flow

### 4.1 Discovery & Negotiation

**Agent → Provider:**
```http
POST /api/inference HTTP/1.1
Host: provider.com
X-402-Intent: {"intentId":"intent_abc123",...}
Content-Type: application/json

{}
```

**Provider → Agent:**
```http
HTTP/1.1 402 Payment Required
X-402-Offer: {"offerId":"offer_xyz789",...}
Content-Type: application/json

{
  "message": "Offer provided",
  "offerId": "offer_xyz789",
  "pricePerRequest": 0.008
}
```

### 4.2 Session Creation

**On-Chain Transaction:**
1. Agent transfers funds to provider (Solana)
2. Provider verifies transaction
3. Provider creates Session
4. Optional: Anchor session on-chain (PDA)

**Provider → Agent:**
```http
HTTP/1.1 201 Session Started
Content-Type: application/json

{
  "sessionId": "session_def456",
  "depositAmount": 1.0,
  "remainingBalance": 1.0,
  "expiresAt": 1234568490000
}
```

### 4.3 Request Execution

**Agent → Provider:**
```http
POST /api/inference HTTP/1.1
Host: provider.com
X-402-Session-Id: session_def456
Content-Type: application/json

{
  "prompt": "Explain quantum computing"
}
```

**Provider → Agent:**
```http
HTTP/1.1 200 OK
X-402-Receipt: {"receiptId":"receipt_ghi789",...}
X-402-SLA-Status: met
Content-Type: application/json

{
  "response": "Quantum computing uses quantum bits...",
  "model": "gpt-4"
}
```

### 4.4 Session Closure

**Agent → Provider:**
```http
POST /api/session/close HTTP/1.1
Host: provider.com
X-402-Session-Id: session_def456
Content-Type: application/json

{
  "sessionId": "session_def456"
}
```

**Provider → Agent:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "refundAmount": 0.76,
  "txSignature": "SolanaTransaction..."
}
```

## 5. Cryptographic Verification

### 5.1 Canonical JSON

All objects must be serialized deterministically:
1. Sort keys alphabetically (recursive)
2. No whitespace
3. UTF-8 encoding

### 5.2 Signature Generation

```typescript
// Create signable message
const message = canonicalJSON(object, exclude=['signature']);
const messageBytes = utf8Encode(message);

// Sign with Ed25519
const signature = ed25519.sign(messageBytes, keypair.secretKey);
const signatureBase58 = base58.encode(signature);
```

### 5.3 Hash Generation

```typescript
// Hash input/output for receipts
const inputHash = sha256(canonicalJSON(input));
const outputHash = sha256(canonicalJSON(output));
```

## 6. SLA Enforcement

### 6.1 SLA Parameters

```typescript
interface SLA {
  maxLatencyMs?: number;      // Maximum response time
  minUptimePercent?: number;  // Minimum availability
  maxErrorRatePercent?: number; // Maximum error rate
}
```

### 6.2 Verification

Each Receipt includes SLA verification:
```typescript
{
  slaVerification: {
    met: boolean,
    metrics: {
      latency: { expected, actual, met },
      uptime: { expected, actual, met },
      errorRate: { expected, actual, met }
    },
    refundAmount?: number
  }
}
```

### 6.3 Refund Calculation

If SLA breached:
- Latency breach: 50% refund of request
- Service unavailable: 100% refund
- High error rate (>10%): Partial refund proportional to errors

## 7. On-Chain Integration

### 7.1 Solana Programs

**Program ID:** `X4o2PPxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**Instructions:**
1. `initialize_session` - Create session PDA
2. `anchor_receipt` - Store receipt on-chain
3. `close_session` - Process refund
4. `create_refund_claim` - Dispute resolution

### 7.2 PDAs (Program Derived Addresses)

**Session PDA:**
```
seeds: ["session", session_id]
```

**Receipt PDA:**
```
seeds: ["receipt", receipt_id]
```

## 8. Security Considerations

### 8.1 Threat Model

- **Malicious Provider**: Signs false receipts
- **Malicious Agent**: Claims false SLA breaches
- **Man-in-the-Middle**: Intercepts/modifies messages
- **Replay Attacks**: Reuses old signatures

### 8.2 Mitigations

1. **Signatures**: All Offers/Receipts signed
2. **Timestamps**: Prevent replay attacks
3. **On-Chain Anchoring**: Immutable audit trail
4. **Third-Party Verification**: Gateway services
5. **Reputation System**: Track provider/agent behavior

## 9. Extensions

### 9.1 Streaming

Pay-per-token for LLM outputs:
```typescript
{
  streamingConfig: {
    pricePerToken: 0.0001,
    updateFrequency: 100  // tokens
  }
}
```

### 9.2 Multi-Provider Bundles

Pipeline multiple providers:
```typescript
{
  bundle: [
    { provider: "A", capability: "fetch" },
    { provider: "B", capability: "process" },
    { provider: "C", capability: "summarize" }
  ],
  splitRatio: [0.2, 0.5, 0.3]
}
```

### 9.3 Cross-Chain

Bridge to other chains:
```typescript
{
  chain: "ethereum",
  token: "ETH",
  bridgeContract: "0x..."
}
```

## 10. References

- [Solana Documentation](https://docs.solana.com/)
- [Anchor Framework](https://www.anchor-lang.com/)
- [Ed25519 Signatures](https://ed25519.cr.yp.to/)
- [HTTP 402](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/402)

---

**Gist Plus Protocol** - Making AI commerce autonomous, fair, and trustless.

