# Gist Plus Architecture

## System Overview

Gist Plus is designed as a modular, layered protocol enabling autonomous commerce between AI agents and service providers.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  ┌──────────────┐              ┌──────────────┐            │
│  │  AI Agents   │              │ API Providers│            │
│  └──────┬───────┘              └──────┬───────┘            │
└─────────┼──────────────────────────────┼──────────────────┘
          │                              │
┌─────────┼──────────────────────────────┼──────────────────┐
│         │      Protocol Layer          │                   │
│  ┌──────▼───────┐              ┌──────▼───────┐          │
│  │ @gistplus/client│              │@gistplus/server │          │
│  │              │              │              │          │
│  │ • Intent     │◄────────────►│ • Offer      │          │
│  │ • Session    │              │ • Receipt    │          │
│  │ • Verify     │              │ • SLA        │          │
│  └──────┬───────┘              └──────┬───────┘          │
└─────────┼──────────────────────────────┼──────────────────┘
          │                              │
┌─────────┼──────────────────────────────┼──────────────────┐
│         │    Infrastructure Layer      │                   │
│  ┌──────▼───────┐  ┌──────────┐  ┌───▼────────┐         │
│  │   Gateway    │  │ Indexer  │  │   Solana   │         │
│  │              │  │          │  │  Programs  │         │
│  │ • Verify     │  │ • Track  │  │            │         │
│  │ • Resolve    │  │ • Analyze│  │ • Escrow   │         │
│  │ • Attest     │  │ • Score  │  │ • Anchor   │         │
│  └──────────────┘  └──────────┘  └────────────┘         │
└──────────────────────────────────────────────────────────┘
          │                              │
┌─────────┼──────────────────────────────┼──────────────────┐
│         │      Settlement Layer        │                   │
│         └──────────────┬───────────────┘                   │
│                   ┌────▼────┐                              │
│                   │ Solana  │                              │
│                   │Blockchain                              │
│                   └─────────┘                              │
└──────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Protocol Core (`@gistplus/core`)

**Purpose:** Foundation types and cryptography

**Components:**
- Type definitions (Intent, Offer, Session, Receipt)
- Signature verification (Ed25519)
- Canonical serialization
- Constants and utilities

**Dependencies:**
- `@solana/web3.js` - Solana integration
- `tweetnacl` - Cryptography
- `bs58` - Base58 encoding

### 2. Client SDK (`@gistplus/client`)

**Purpose:** Enable agents to consume services

**Components:**
- `GistClient` - Main client interface
- `HttpClient` - HTTP communication
- `SessionManager` - Session lifecycle management

**Flow:**
```typescript
Client.createIntent()
  → Client.negotiate()
  → Client.createSession()
  → Client.executeRequest()
  → Client.closeSession()
```

**Key Features:**
- Automatic signature verification
- Session state management
- Receipt validation
- Solana payment handling

### 3. Server SDK (`@gistplus/server`)

**Purpose:** Enable providers to monetize APIs

**Components:**
- `GistProvider` - Provider implementation
- `gistMiddleware` - Express middleware
- `SessionStore` - Session storage
- `PricingStrategy` - Dynamic pricing

**Flow:**
```typescript
Request arrives
  → Check for Session header
  → If no session: Generate Offer, return 402
  → If session: Validate and attach
  → Execute handler
  → Generate Receipt
  → Return response + Receipt
```

**Key Features:**
- Automatic Offer generation
- Session validation
- Receipt creation and signing
- Flexible pricing strategies

### 4. Solana Programs (`gistplus-solana`)

**Purpose:** On-chain state and settlement

**Programs:**
- **Session Program** - Store session state
- **Receipt Program** - Anchor receipts
- **Escrow Program** - Hold funds
- **Refund Program** - Dispute resolution

**Accounts:**
```rust
Session PDA:
  - session_id
  - agent/provider keys
  - balances
  - state

Receipt PDA:
  - receipt_id
  - hashes
  - latency
  - SLA verification
```

### 5. Gateway (`@gistplus/gateway`)

**Purpose:** Independent verification service

**Components:**
- `ReceiptVerifier` - Validate receipts
- `SLAResolver` - Resolve disputes
- Attestation service

**Use Cases:**
- Third-party verification
- Dispute arbitration
- Reputation scoring

### 6. Indexer (`@gistplus/indexer`)

**Purpose:** Analytics and reputation

**Components:**
- `GistIndexer` - Main indexer
- `ReputationTracker` - Provider scores
- `AnalyticsEngine` - Market data

**Tracked Metrics:**
- Request volume
- SLA compliance rates
- Average pricing
- Provider uptime
- Dispute frequency

## Data Flow

### Complete Transaction Flow

```
1. DISCOVERY
   Agent → Provider: "What services do you offer?"
   Provider → Agent: 402 + Offer header

2. NEGOTIATION
   Agent: Evaluate offer against intent
   Agent: Decision (accept/reject/counter)

3. SESSION CREATION
   Agent → Solana: Transfer funds
   Solana → Provider: Confirm transaction
   Provider: Create session
   Provider → Agent: Session details

4. REQUEST EXECUTION (multiple)
   Agent → Provider: Request + Session ID
   Provider: Process request
   Provider: Deduct from session
   Provider: Generate receipt
   Provider → Agent: Response + Receipt

5. VERIFICATION
   Agent: Verify receipt signature
   Agent: Check SLA compliance
   Agent: Store receipt for audit

6. SESSION CLOSURE
   Agent → Provider: Close session
   Provider → Solana: Refund remaining
   Solana → Agent: Receive refund
```

## State Management

### Session States

```
         ┌─────────┐
         │ PENDING │ (Initial)
         └────┬────┘
              │
         ┌────▼────┐
    ┌───►  ACTIVE  ├───┐
    │    └────┬────┘   │
    │         │        │
    │         │        │
Refill   ┌───▼───┐    │ Depleted
    │    │DEPLETED│◄───┘
    └────┤        │
         └───┬────┘
             │
         ┌───▼────┐
         │EXPIRED │
         └───┬────┘
             │
         ┌───▼────┐
         │REFUNDED│
         └────────┘
```

### Receipt Lifecycle

```
Request Start
    ↓
Process Request
    ↓
Calculate SLA
    ↓
Generate Receipt
    ↓
Sign Receipt
    ↓
[Optional] Anchor on-chain
    ↓
Return to Agent
    ↓
Agent Verifies
    ↓
Store Permanently
```

## Security Architecture

### Defense in Depth

1. **Cryptographic Layer**
   - Ed25519 signatures on all Offers/Receipts
   - SHA-256 hashing for data integrity
   - Canonical JSON to prevent manipulation

2. **Blockchain Layer**
   - Immutable transaction records
   - PDAs for deterministic addresses
   - Escrow for secure fund holding

3. **Application Layer**
   - Timestamp validation
   - Replay attack prevention
   - Rate limiting
   - Session expiration

4. **Verification Layer**
   - Independent gateway verification
   - Reputation scoring
   - SLA monitoring

### Threat Mitigation

| Threat | Mitigation |
|--------|-----------|
| Signature forgery | Ed25519 signature verification |
| Receipt tampering | Cryptographic hashes |
| Replay attacks | Timestamps + unique IDs |
| Double spending | On-chain escrow |
| SLA gaming | Automatic verification + refunds |
| Provider fraud | Reputation system + on-chain receipts |
| Agent fraud | Prepaid sessions + deposit |

## Scalability

### Horizontal Scaling

**Providers:**
- Stateless design
- Load balancer compatible
- Distributed session store (Redis)
- Multiple endpoints per provider

**Agents:**
- Parallel sessions with multiple providers
- Request pipelining
- Async receipt processing

### Performance Optimizations

1. **Prepaid Sessions**
   - Eliminates per-request blockchain transactions
   - Batch multiple requests under one payment
   - ~1000x reduction in transaction costs

2. **Off-Chain Execution**
   - Primary flow is HTTP (fast)
   - On-chain only for settlement
   - Optional receipt anchoring

3. **Solana Advantages**
   - ~400ms block time
   - ~65,000 TPS
   - Low transaction fees (~$0.00025)

## Extension Points

### Custom Pricing Strategies

```typescript
class CustomPricing implements PricingStrategy {
  getPrice(intent: Intent): number {
    // Your logic: load, time, reputation, etc.
    return dynamicPrice;
  }
}
```

### Custom SLA Metrics

```typescript
interface CustomSLA extends SLA {
  customMetric: number;
}
```

### On-Chain Extensions

```rust
// New instruction
pub fn custom_verification(
    ctx: Context<CustomVerify>,
    proof: Vec<u8>
) -> Result<()> {
    // Custom verification logic
}
```

## Future Architecture

### Phase 2: Advanced Features

- **Streaming payments** - Pay-per-token for LLMs
- **Multi-provider bundles** - Pipeline workflows
- **Cross-chain bridge** - Ethereum, BSC support
- **ZK proofs** - Private computation verification

### Phase 3: Decentralization

- **Provider discovery** - On-chain registry
- **Reputation oracle** - Decentralized scoring
- **DAO governance** - Protocol upgrades
- **Dispute resolution** - Automated arbitration

---

**Built for scale, designed for autonomy, powered by Solana** 🚀

