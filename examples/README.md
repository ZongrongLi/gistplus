# Gist Plus Examples

This directory contains working examples of the Gist Plus protocol in action.

## Examples

### 1. AI Agent (`ai-agent/`)

Demonstrates how an autonomous AI agent can:
- Create Intents expressing its needs
- Negotiate pricing with providers
- Create prepaid sessions
- Execute requests with automatic payment
- Verify receipts cryptographically

**Run the agent:**
```bash
cd ai-agent
npm install
npm start
```

### 2. API Provider (`api-provider/`)

Demonstrates how an API provider can:
- Monetize endpoints with Gist Plus
- Automatically negotiate with agents
- Manage sessions and payments
- Generate cryptographic receipts
- Enforce SLA guarantees

**Run the provider:**
```bash
cd api-provider
npm install
npm start
```

## End-to-End Demo

To see the full protocol in action:

1. **Start the provider:**
```bash
cd api-provider
npm install
npm start
# Provider will start on http://localhost:3000
```

2. **In another terminal, run the agent:**
```bash
cd ai-agent
npm install
# Set provider endpoint
export PROVIDER_ENDPOINT=http://localhost:3000/api/inference
npm start
```

3. **Watch the magic happen:**
   - Agent creates Intent
   - Provider responds with Offer (402 status)
   - Agent accepts and creates Session
   - Agent makes multiple requests
   - Each request gets a signed Receipt
   - Agent closes session and receives refund

## Configuration

Both examples use environment variables for configuration:

### AI Agent
```bash
# .env file
SOLANA_RPC=https://api.devnet.solana.com
PROVIDER_ENDPOINT=http://localhost:3000/api/inference
AGENT_PRIVATE_KEY=... # Optional, generates new if not provided
```

### API Provider
```bash
# .env file
PORT=3000
SOLANA_RPC=https://api.devnet.solana.com
PROVIDER_ENDPOINT=http://localhost:3000
PROVIDER_PRIVATE_KEY=... # Optional, generates new if not provided
```

## What's Demonstrated

### The Protocol Flow

1. **Discovery & Negotiation**
   - Agent sends Intent to provider
   - Provider responds with signed Offer
   - Agent evaluates and accepts

2. **Session Creation**
   - Agent deposits funds to provider
   - Session created with escrow
   - Balance tracked on-chain (optional)

3. **Request Execution**
   - Agent sends requests with session ID
   - Provider processes and charges session
   - Signed Receipt returned for each request

4. **SLA Verification**
   - Latency measured automatically
   - SLA compliance checked
   - Refunds triggered if breached

5. **Session Closure**
   - Either party can close session
   - Remaining balance refunded to agent
   - All receipts stored permanently

### Key Features Shown

- ✅ **Automatic Negotiation** - No manual API key management
- ✅ **Prepaid Sessions** - No per-request transaction overhead
- ✅ **Cryptographic Receipts** - Verifiable proof of work
- ✅ **SLA Enforcement** - Automatic refunds for breaches
- ✅ **Multi-Request Sessions** - Efficient batch operations
- ✅ **Refund Logic** - Fair settlement on closure

## Extending the Examples

### Add Custom Capabilities

Edit `api-provider/index.ts` to add new endpoints:

```typescript
app.post('/api/your-capability', async (req, res) => {
  const session = req.gistSession;
  
  // Your logic here
  const result = await yourFunction(req.body);
  
  // Automatic Receipt generation
  return res.gistReceipt?.(result);
});
```

### Implement Dynamic Pricing

Use custom pricing strategies:

```typescript
import { LoadBasedPricingStrategy } from '@gistplus/server';

const pricing = new LoadBasedPricingStrategy(
  0.005, // base price
  'USDC',
  () => getCurrentLoad() // your load function
);
```

### On-Chain Anchoring

Enable on-chain session storage:

```typescript
const session = await client.createSession(offer, {
  anchorOnChain: true  // Store session on Solana
});
```

## Production Considerations

These examples are for demonstration. For production:

1. **Security**
   - Use hardware wallets or KMS for private keys
   - Implement rate limiting
   - Add authentication layers

2. **Persistence**
   - Use Redis/PostgreSQL for session storage
   - Archive receipts to permanent storage
   - Implement receipt indexing

3. **Monitoring**
   - Track SLA metrics
   - Monitor session health
   - Alert on payment issues

4. **Scaling**
   - Deploy providers behind load balancers
   - Use distributed session stores
   - Implement receipt batching

## Learn More

- [Protocol Specification](../docs/protocol-spec.md)
- [Client SDK Documentation](../packages/client/README.md)
- [Server SDK Documentation](../packages/server/README.md)
- [Solana Programs](../packages/solana/README.md)

---

**Built with Gist Plus - The economic layer for AI systems** 🚀

