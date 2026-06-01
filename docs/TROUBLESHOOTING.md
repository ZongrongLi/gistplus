# Troubleshooting Guide

Solutions to common issues when using Gist Plus.

---

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Connection Issues](#connection-issues)
3. [Transaction Failures](#transaction-failures)
4. [Session Issues](#session-issues)
5. [Receipt Verification Issues](#receipt-verification-issues)
6. [Performance Issues](#performance-issues)
7. [Debugging Tools](#debugging-tools)
8. [Getting Help](#getting-help)

---

## Installation Issues

### Error: `EUNSUPPORTEDPROTOCOL workspace:*`

**Problem:** npm doesn't support workspace protocol

**Solution:**
```bash
# Use npm 7+ for workspaces
npm install -g npm@latest

# Or use pnpm
npm install -g pnpm
pnpm install

# Or use yarn
npm install -g yarn
yarn install
```

### Error: `Cannot find module '@gistplus/core'`

**Problem:** Core package not installed

**Solution:**
```bash
# If using workspaces
npm install

# If installing individually
cd packages/core/typescript
npm install
npm run build

cd ../client/typescript
npm install
npm link ../core/typescript
npm run build
```

### TypeScript Errors

**Problem:** Type definitions not found

**Solution:**
```bash
# Rebuild all packages
npm run build

# If using workspace
npm run build --workspaces

# Manually build each
cd packages/core/typescript && npm run build
cd packages/client/typescript && npm run build
```

---

## Connection Issues

### Error: `Failed to connect to Solana`

**Problem:** Cannot reach Solana RPC

**Diagnosis:**
```bash
# Test RPC connectivity
curl https://api.devnet.solana.com

# Test with Solana CLI
solana cluster-version --url devnet
```

**Solutions:**

**1. Network Issues:**
```bash
# Check internet connection
ping google.com

# Check firewall
sudo ufw status

# Try different RPC
export SOLANA_RPC=https://api.devnet.solana.com
```

**2. RPC Rate Limiting:**
```bash
# You hit rate limit - use premium RPC
export SOLANA_RPC=https://rpc.helius.xyz/?api-key=YOUR_KEY
```

**3. Wrong Network:**
```typescript
// Check network configuration
console.log('Network:', process.env.SOLANA_NETWORK);
console.log('RPC:', process.env.SOLANA_RPC);

// Verify connection
const health = await connection.getHealth();
console.log('Solana health:', health);
```

### Error: `Provider endpoint not reachable`

**Problem:** Can't connect to Gist Plus provider

**Diagnosis:**
```bash
# Test endpoint
curl http://localhost:3000/health

# Check if provider is running
ps aux | grep node

# Check port binding
netstat -tulpn | grep 3000
```

**Solutions:**

**1. Provider Not Started:**
```bash
# Start the provider
npm run provider:devnet
```

**2. Wrong URL:**
```typescript
// Check configuration
console.log('Provider endpoint:', process.env.PROVIDER_ENDPOINT);

// Test with curl
curl -X POST http://localhost:3000/api/weather \
  -H "Content-Type: application/json" \
  -d '{"city":"New York"}'
# Should return 402 Payment Required
```

**3. CORS Issues:**
```typescript
// Add CORS headers in provider
app.use(cors({
  origin: '*',  // In development
  // origin: ['https://your-app.com'],  // In production
  allowedHeaders: ['Content-Type', 'X-402-*']
}));
```

---

## Transaction Failures

### Error: `Transaction failed: Insufficient funds`

**Problem:** Wallet doesn't have enough SOL or tokens

**Diagnosis:**
```bash
# Check SOL balance
solana balance --url devnet

# Check token balance
spl-token balance USDC_MINT_ADDRESS --url devnet
```

**Solutions:**

**Devnet:**
```bash
# Get free SOL
solana airdrop 2 YOUR_ADDRESS --url devnet

# Get test USDC
# Visit: https://spl-token-faucet.com/
```

**Mainnet:**
```bash
# Buy SOL from exchange
# Transfer to your wallet

# Swap for USDC on Jupiter/Orca
```

### Error: `Transaction signature verification failed`

**Problem:** Transaction not confirmed

**Diagnosis:**
```bash
# Check transaction status
solana confirm TRANSACTION_SIGNATURE --url devnet
```

**Solutions:**

**1. Wait for Confirmation:**
```typescript
// Increase confirmation timeout
const signature = await sendAndConfirmTransaction(
  connection,
  transaction,
  [wallet],
  {
    commitment: 'confirmed',
    preflightCommitment: 'confirmed'
  }
);

// Or use confirmTransaction
await connection.confirmTransaction(signature, 'confirmed');
```

**2. Retry Logic:**
```typescript
async function sendWithRetry(
  transaction: Transaction,
  maxRetries = 3
): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await sendAndConfirmTransaction(
        connection,
        transaction,
        [wallet]
      );
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Retry ${i + 1}/${maxRetries}`);
      await sleep(1000 * (i + 1));
    }
  }
  throw new Error('Transaction failed after retries');
}
```

### Error: `Blockhash not found`

**Problem:** Recent blockhash expired

**Solution:**
```typescript
// Get fresh blockhash
const { blockhash, lastValidBlockHeight } = 
  await connection.getLatestBlockhash('finalized');

transaction.recentBlockhash = blockhash;
transaction.lastValidBlockHeight = lastValidBlockHeight;

// Send immediately
const signature = await sendAndConfirmTransaction(
  connection,
  transaction,
  [wallet]
);
```

---

## Session Issues

### Error: `Session not found`

**Problem:** Session doesn't exist or expired

**Diagnosis:**
```typescript
// Check if session exists
const session = client.getSession(sessionId);
console.log('Session:', session);

// Check expiration
if (session) {
  console.log('Expires at:', new Date(session.expiresAt));
  console.log('Now:', new Date());
  console.log('Expired:', Date.now() > session.expiresAt);
}
```

**Solutions:**

**1. Session Expired:**
```typescript
// Create new session
const newSession = await client.createSession(offer);
```

**2. Wrong Session ID:**
```typescript
// List all sessions
const sessions = client.getActiveSessions();
console.log('Active sessions:', sessions.map(s => s.sessionId));
```

**3. Provider Restarted:**
```typescript
// Sessions are in-memory by default
// Use persistent storage for production

import Redis from 'ioredis';
const redis = new Redis();

// Save sessions to Redis
await redis.set(`session:${sessionId}`, JSON.stringify(session));
```

### Error: `Insufficient balance in session`

**Problem:** Session balance depleted

**Diagnosis:**
```typescript
const session = client.getSession(sessionId);
console.log('Balance:', session.remainingBalance);
console.log('Price per request:', session.pricePerRequest);
console.log('Requests left:', 
  Math.floor(session.remainingBalance / session.pricePerRequest)
);
```

**Solutions:**

**1. Close and Create New:**
```typescript
// Close current session
await client.closeSession(sessionId);

// Create new with more funds
const newSession = await client.createSession(offer, {
  depositAmount: 1.0  // Larger deposit
});
```

**2. Monitor Balance:**
```typescript
// Auto-refill when low
setInterval(async () => {
  const session = client.getSession(sessionId);
  
  if (session && session.remainingBalance < 0.01) {
    console.log('Low balance, creating new session...');
    await client.closeSession(sessionId);
    await createNewSession();
  }
}, 10000);
```

### Error: `Session expired`

**Problem:** Session time limit reached

**Solution:**
```typescript
// Create session with longer duration
const intent = client.createIntent({
  capability: 'api',
  maxPricePerRequest: 0.01,
  token: 'USDC',
  sessionDurationMs: 3600000  // 1 hour instead of default 10 minutes
});
```

---

## Receipt Verification Issues

### Error: `Invalid signature`

**Problem:** Receipt signature doesn't verify

**Diagnosis:**
```typescript
try {
  verifyReceipt(receipt);
  console.log('Receipt is valid');
} catch (error) {
  console.error('Verification failed:', error);
  console.log('Receipt:', JSON.stringify(receipt, null, 2));
}
```

**Solutions:**

**1. Check Provider Public Key:**
```typescript
// Ensure provider key matches
console.log('Receipt provider:', receipt.providerPubkey);
console.log('Expected provider:', session.providerPubkey);

if (receipt.providerPubkey !== session.providerPubkey) {
  console.error('Provider key mismatch!');
}
```

**2. Verify Timestamp:**
```typescript
// Check for clock skew
const now = Date.now();
const receiptAge = now - receipt.timestamp;

if (receiptAge > 60000) {
  console.warn('Receipt is old (>1 minute)');
}

if (receipt.timestamp > now + 10000) {
  console.error('Receipt timestamp in future!');
}
```

**3. Check Canonical JSON:**
```typescript
import { createSignableMessage } from '@gistplus/core';

// Recreate message
const message = createSignableMessage(receipt);
console.log('Message to verify:', message);

// Try manual verification
import { verifySignature } from '@gistplus/core';
const valid = verifySignature(
  message,
  receipt.signature,
  receipt.providerPubkey
);
console.log('Manually verified:', valid);
```

### Error: `SLA breach detected`

**Problem:** Provider didn't meet SLA

**What to do:**

```typescript
const receipt = result.receipt;

if (!receipt.slaVerification.met) {
  console.log('SLA breached!');
  console.log('Metrics:', receipt.slaVerification.metrics);
  
  if (receipt.slaVerification.refundAmount) {
    console.log('Auto-refund:', receipt.slaVerification.refundAmount);
    // Refund is automatic
  }
  
  // If multiple breaches, consider switching providers
  const breachRate = calculateBreachRate(sessionId);
  
  if (breachRate > 0.3) {
    console.log('High breach rate (>30%), switching providers...');
    await switchToBackupProvider();
  }
}
```

---

## Performance Issues

### Slow Request Times

**Diagnosis:**
```typescript
// Measure each step
console.time('negotiate');
const offer = await client.negotiate(endpoint, intent);
console.timeEnd('negotiate');

console.time('createSession');
const session = await client.createSession(offer);
console.timeEnd('createSession');

console.time('executeRequest');
const result = await client.executeRequest(sessionId, data);
console.timeEnd('executeRequest');
```

**Solutions:**

**1. Use Premium RPC:**
```bash
# Slow on public RPC
SOLANA_RPC=https://api.mainnet-beta.solana.com  # Slow

# Fast on premium RPC
SOLANA_RPC=https://rpc.helius.xyz/?api-key=YOUR_KEY  # Fast!
```

**2. Connection Pooling:**
```typescript
// Reuse connections
const connectionPool = new Map<string, Connection>();

function getConnection(rpcUrl: string): Connection {
  if (!connectionPool.has(rpcUrl)) {
    connectionPool.set(rpcUrl, new Connection(rpcUrl));
  }
  return connectionPool.get(rpcUrl)!;
}
```

**3. Batch Requests:**
```typescript
// Instead of serial requests
for (const item of items) {
  await client.executeRequest(sessionId, item);  // Slow
}

// Use parallel requests
await Promise.all(
  items.map(item => client.executeRequest(sessionId, item))
);  // Fast!
```

### High Memory Usage

**Diagnosis:**
```typescript
// Monitor memory
setInterval(() => {
  const usage = process.memoryUsage();
  console.log('Memory:', {
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB'
  });
}, 10000);
```

**Solutions:**

**1. Session Cleanup:**
```typescript
// Clean up old sessions
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions) {
    if (now > session.expiresAt + 3600000) {  // 1 hour grace period
      sessions.delete(sessionId);
    }
  }
}, 300000);  // Every 5 minutes
```

**2. Limit Cache Size:**
```typescript
class LRUCache {
  private maxSize = 1000;
  private cache = new Map();
  
  set(key: string, value: any) {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}
```

---

## Debugging Tools

### Enable Debug Logging

```bash
# Set log level
export LOG_LEVEL=debug

# Run with debug output
DEBUG=gistplus:* npm start
```

### Inspect Network Traffic

```typescript
import axios from 'axios';

// Add request interceptor
axios.interceptors.request.use(request => {
  console.log('Request:', {
    method: request.method,
    url: request.url,
    headers: request.headers,
    data: request.data
  });
  return request;
});

// Add response interceptor
axios.interceptors.response.use(
  response => {
    console.log('Response:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('Error:', {
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);
```

### Solana Transaction Inspector

```typescript
async function inspectTransaction(signature: string) {
  const tx = await connection.getTransaction(signature, {
    commitment: 'confirmed'
  });
  
  console.log('Transaction:', {
    slot: tx.slot,
    blockTime: tx.blockTime,
    fee: tx.meta.fee,
    status: tx.meta.err ? 'failed' : 'success',
    logs: tx.meta.logMessages
  });
  
  return tx;
}

// Usage
const tx = await inspectTransaction(session.creationTxSignature);
```

### Session Debugger

```typescript
class SessionDebugger {
  async diagnose(sessionId: string) {
    const session = await getSession(sessionId);
    
    if (!session) {
      return {
        status: 'not_found',
        message: 'Session does not exist'
      };
    }
    
    const now = Date.now();
    const checks = {
      exists: true,
      state: session.state,
      expired: now > session.expiresAt,
      hasBalance: session.remainingBalance >= session.pricePerRequest,
      timeRemaining: Math.max(0, session.expiresAt - now),
      requestsRemaining: Math.floor(
        session.remainingBalance / session.pricePerRequest
      ),
      onChain: !!session.pdaAddress
    };
    
    // Check on-chain if PDA exists
    if (session.pdaAddress) {
      try {
        const account = await connection.getAccountInfo(
          new PublicKey(session.pdaAddress)
        );
        checks.onChainVerified = account !== null;
      } catch (error) {
        checks.onChainError = error.message;
      }
    }
    
    return checks;
  }
}

// Usage
const debug = new SessionDebugger();
const info = await debug.diagnose(sessionId);
console.log('Session diagnosis:', info);
```

---

## Common Error Messages

### "402 Payment Required"

**This is NORMAL!** It means:
1. Endpoint requires Gist Plus payment
2. Send an Intent to negotiate
3. Create a session
4. Retry request with session ID

**Example:**
```typescript
try {
  const result = await fetch(endpoint, { method: 'POST', body: data });
} catch (error) {
  if (error.response?.status === 402) {
    console.log('Need to pay - starting Gist Plus flow...');
    
    // Get offer from header
    const offer = JSON.parse(
      error.response.headers['x-402-offer']
    );
    
    // Create session and retry
    const session = await client.createSession(offer);
    const result = await fetch(endpoint, {
      method: 'POST',
      body: data,
      headers: { 'X-402-Session-Id': session.sessionId }
    });
  }
}
```

### "Invalid Intent"

**Problem:** Intent doesn't pass validation

**Common causes:**
- Missing required fields
- Invalid token type
- Negative prices
- Invalid public key format

**Solution:**
```typescript
// Validate before sending
import { validateIntent } from '@gistplus/core';

try {
  validateIntent(intent);
  console.log('Intent is valid');
} catch (error) {
  console.error('Intent validation failed:', error.message);
  // Fix the issue
}
```

### "Offer expired"

**Problem:** Waited too long to accept offer

**Solution:**
```typescript
// Check expiration
if (Date.now() > offer.expiresAt) {
  console.log('Offer expired, requesting new one...');
  const newOffer = await client.negotiate(endpoint, intent);
}

// Create session quickly after receiving offer
const offer = await client.negotiate(endpoint, intent);
const session = await client.createSession(offer);  // Do this immediately!
```

---

## Network-Specific Issues

### Devnet Issues

**Airdrop Failures:**
```bash
# Rate limited - wait and retry
sleep 60
solana airdrop 1 YOUR_ADDRESS --url devnet

# Or use faucet
# https://solfaucet.com/
```

**Slow Transactions:**
```bash
# Devnet can be congested
# Use testnet instead
export SOLANA_NETWORK=testnet
```

### Mainnet Issues

**High Transaction Fees:**
```bash
# Set priority fee
solana transfer \
  --allow-unfunded-recipient \
  --url mainnet-beta \
  --priority-fee 1000 \
  RECIPIENT AMOUNT
```

**RPC Rate Limiting:**
```bash
# Use premium RPC (required for production)
export SOLANA_RPC=https://rpc.helius.xyz/?api-key=YOUR_KEY
```

---

## Performance Tuning

### Optimize Connection Settings

```typescript
const connection = new Connection(rpcUrl, {
  commitment: 'confirmed',  // Faster than 'finalized'
  wsEndpoint: wssUrl,       // Enable WebSocket
  confirmTransactionInitialTimeout: 60000
});
```

### Optimize Session Creation

```typescript
// Reuse sessions instead of creating new ones
const sessionPool = new Map<string, Session>();

async function getOrCreateSession(
  capability: string
): Promise<Session> {
  // Check for existing session
  for (const session of sessionPool.values()) {
    if (session.state === 'active' && 
        session.remainingBalance >= session.pricePerRequest) {
      return session;
    }
  }
  
  // Create new if none available
  const newSession = await client.createSession(offer);
  sessionPool.set(newSession.sessionId, newSession);
  return newSession;
}
```

### Reduce Signature Verification Overhead

```typescript
// Cache verified receipts
const verifiedReceipts = new Set<string>();

function verifyReceiptCached(receipt: Receipt): boolean {
  if (verifiedReceipts.has(receipt.receiptId)) {
    return true;
  }
  
  verifyReceipt(receipt);  // Throws if invalid
  verifiedReceipts.add(receipt.receiptId);
  return true;
}
```

---

## Getting Help

### 1. Check Documentation

- [Getting Started](./GETTING_STARTED.md)
- [API Reference](./API_REFERENCE.md)
- [Tutorial](./TUTORIAL.md)
- [FAQ](./FAQ.md)

### 2. Search GitHub Issues

```bash
# Search existing issues
https://github.com/gistplusxyz/gistplus/issues

# Common search terms:
# - "session expired"
# - "insufficient balance"
# - "signature invalid"
```

### 3. Ask the Community

- **Discord**: [x.com/gistplus](https://x.com/gistplus)
- **GitHub Discussions**: [github.com/gistplusxyz/gistplus/discussions](https://github.com/gistplusxyz/gistplus/discussions)
- **X**: [@gistplus](https://x.com/gistplus)

### 4. Open an Issue

If you found a bug:

```markdown
**Describe the bug**
Clear description of what's wrong.

**To Reproduce**
1. Step 1
2. Step 2
3. See error

**Expected behavior**
What should happen.

**Actual behavior**
What actually happens.

**Environment**
- OS: [e.g., Ubuntu 22.04]
- Node.js: [e.g., 18.0.0]
- Package: [e.g., @gistplus/client@0.1.0]
- Network: [e.g., devnet]

**Logs**
```
Paste error logs here
```

**Additional context**
Any other relevant information.
```

---

## Debug Mode

### Enable Verbose Logging

```typescript
// In provider
const provider = new GistProvider({
  connection,
  wallet,
  endpoint,
  pricing,
  sla,
  debug: true  // Enable debug mode
});

// In client
const client = new GistClient({
  connection,
  wallet,
  debug: true  // Enable debug mode
});
```

### Trace Requests

```typescript
class RequestTracer {
  private traces: Map<string, Trace> = new Map();
  
  startTrace(requestId: string) {
    this.traces.set(requestId, {
      startTime: Date.now(),
      events: []
    });
  }
  
  addEvent(requestId: string, event: string) {
    const trace = this.traces.get(requestId);
    if (trace) {
      trace.events.push({
        event,
        timestamp: Date.now(),
        elapsed: Date.now() - trace.startTime
      });
    }
  }
  
  getTrace(requestId: string) {
    return this.traces.get(requestId);
  }
}

// Usage
const tracer = new RequestTracer();
tracer.startTrace(requestId);
tracer.addEvent(requestId, 'intent_created');
tracer.addEvent(requestId, 'offer_received');
tracer.addEvent(requestId, 'session_created');
tracer.addEvent(requestId, 'request_completed');

console.log('Trace:', tracer.getTrace(requestId));
```

---

**Still having issues? Contact: support@gistplus.dev**

