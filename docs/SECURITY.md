# Security Best Practices

Comprehensive security guide for Gist Plus deployments.

---

## Table of Contents

1. [Threat Model](#threat-model)
2. [Key Management](#key-management)
3. [Network Security](#network-security)
4. [Smart Contract Security](#smart-contract-security)
5. [Application Security](#application-security)
6. [Operational Security](#operational-security)
7. [Incident Response](#incident-response)
8. [Security Checklist](#security-checklist)

---

## Threat Model

### Attack Vectors

#### 1. Private Key Compromise

**Risk:** Attacker gains access to wallet private keys

**Impact:**
- Stolen funds
- Unauthorized transactions
- Reputation damage

**Mitigations:**
- Hardware wallets for production
- AWS KMS / Cloud KMS
- Key rotation policies
- Multi-signature requirements

#### 2. Receipt Forgery

**Risk:** Malicious provider creates fake receipts

**Impact:**
- False proof of work
- Payment without service
- Loss of trust

**Mitigations:**
- Ed25519 signature verification
- On-chain receipt anchoring
- Third-party verification (gateway)
- Reputation systems

#### 3. SLA Gaming

**Risk:** Provider manipulates SLA metrics

**Impact:**
- Incorrect refund calculations
- Loss of agent funds
- System abuse

**Mitigations:**
- Independent verification
- Multiple data points
- Statistical anomaly detection
- On-chain SLA tracking

#### 4. Session Hijacking

**Risk:** Attacker steals session ID

**Impact:**
- Unauthorized use of prepaid session
- Depletion of agent funds

**Mitigations:**
- TLS/HTTPS only
- Session ID rotation
- IP address validation
- Rate limiting per session

#### 5. Replay Attacks

**Risk:** Attacker replays valid transactions

**Impact:**
- Double spending
- Unauthorized charges

**Mitigations:**
- Unique transaction IDs
- Timestamp validation
- Nonce tracking
- On-chain verification

---

## Key Management

### Development Environment

**✅ Acceptable:**
```typescript
// Generate temporary key for testing
const wallet = Keypair.generate();
console.log('Test wallet:', wallet.publicKey.toBase58());

// Store in .env for development
// .env
WALLET_PRIVATE_KEY=base64_encoded_key
```

**❌ Never in Production:**
```typescript
// NEVER hardcode private keys
const secretKey = new Uint8Array([1,2,3,...]);  // DON'T DO THIS!
const wallet = Keypair.fromSecretKey(secretKey);
```

### Production Environment

#### Option 1: Hardware Wallet (Recommended)

```typescript
import { Connection, Transaction } from '@solana/web3.js';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import Solana from '@ledgerhq/hw-app-solana';

class HardwareWalletProvider {
  private transport: TransportNodeHid;
  private solana: Solana;
  
  async initialize() {
    this.transport = await TransportNodeHid.create();
    this.solana = new Solana(this.transport);
  }
  
  async signTransaction(transaction: Transaction): Promise<Transaction> {
    const signature = await this.solana.signTransaction(
      "44'/501'/0'/0'",  // Derivation path
      transaction.serializeMessage()
    );
    
    transaction.addSignature(this.publicKey, signature.signature);
    return transaction;
  }
}
```

#### Option 2: AWS KMS

```typescript
import { KMSClient, SignCommand } from '@aws-sdk/client-kms';

class KMSWalletProvider {
  private kms: KMSClient;
  private keyId: string;
  
  constructor(keyId: string, region: string) {
    this.kms = new KMSClient({ region });
    this.keyId = keyId;
  }
  
  async sign(message: Uint8Array): Promise<string> {
    const command = new SignCommand({
      KeyId: this.keyId,
      Message: message,
      MessageType: 'RAW',
      SigningAlgorithm: 'ECDSA_SHA_256'
    });
    
    const response = await this.kms.send(command);
    return Buffer.from(response.Signature).toString('base64');
  }
}
```

#### Option 3: Google Cloud KMS

```typescript
import { KeyManagementServiceClient } from '@google-cloud/kms';

class GCPKMSProvider {
  private client: KeyManagementServiceClient;
  private keyName: string;
  
  constructor(projectId: string, locationId: string, keyRingId: string, keyId: string) {
    this.client = new KeyManagementServiceClient();
    this.keyName = this.client.cryptoKeyPath(
      projectId,
      locationId,
      keyRingId,
      keyId
    );
  }
  
  async sign(message: Uint8Array): Promise<string> {
    const [response] = await this.client.asymmetricSign({
      name: this.keyName,
      digest: { sha256: message }
    });
    
    return Buffer.from(response.signature).toString('base64');
  }
}
```

### Key Rotation

```typescript
class KeyRotationManager {
  private currentKey: Keypair;
  private previousKeys: Keypair[] = [];
  
  async rotateKey(): Promise<void> {
    // Generate new key
    const newKey = Keypair.generate();
    
    // Transfer funds from old to new
    await this.transferFunds(this.currentKey, newKey);
    
    // Update all sessions
    await this.updateSessions(newKey.publicKey);
    
    // Store old key for historical verification
    this.previousKeys.push(this.currentKey);
    
    // Switch to new key
    this.currentKey = newKey;
    
    console.log('Key rotated to:', newKey.publicKey.toBase58());
  }
  
  async verifyHistorical(signature: string, message: Uint8Array): Promise<boolean> {
    // Try current key
    if (verifySignature(message, signature, this.currentKey.publicKey)) {
      return true;
    }
    
    // Try previous keys
    for (const key of this.previousKeys) {
      if (verifySignature(message, signature, key.publicKey)) {
        return true;
      }
    }
    
    return false;
  }
}
```

---

## Network Security

### TLS/HTTPS Enforcement

```typescript
// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});

// Strict Transport Security
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

### CORS Configuration

```typescript
import cors from 'cors';

// Production CORS
const corsOptions = {
  origin: (origin, callback) => {
    const whitelist = process.env.ALLOWED_ORIGINS?.split(',') || [];
    
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type', 'X-402-*']
};

app.use(cors(corsOptions));
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

// Global rate limiter
const globalLimiter = rateLimit({
  store: new RedisStore({
    client: new Redis(process.env.REDIS_URL)
  }),
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,  // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later'
});

// Per-session rate limiter
const sessionLimiter = rateLimit({
  keyGenerator: (req) => req.gistSession?.sessionId || req.ip,
  windowMs: 60 * 1000,  // 1 minute
  max: 60  // 60 requests per minute per session
});

app.use('/api/*', globalLimiter, sessionLimiter);
```

### DDoS Protection

```typescript
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

// Security headers
app.use(helmet());

// Prevent NoSQL injection
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Request size limits
app.use(express.json({ limit: '10kb' }));

// Slow-down repeated requests
import slowDown from 'express-slow-down';

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs: 500
});

app.use('/api/*', speedLimiter);
```

---

## Smart Contract Security

### Solana Program Security

#### Access Control

```rust
#[derive(Accounts)]
pub struct CloseSession<'info> {
    #[account(
        mut,
        seeds = [b"session", session.session_id.as_bytes()],
        bump = session.bump,
        constraint = authority.key() == session.agent || authority.key() == session.provider @ X402Error::Unauthorized
    )]
    pub session: Account<'info, Session>,
    
    pub authority: Signer<'info>,
}
```

#### Overflow Protection

```rust
// Safe math operations
session.remaining_balance = session
    .remaining_balance
    .checked_sub(amount_charged)
    .ok_or(X402Error::MathOverflow)?;

session.request_count = session
    .request_count
    .checked_add(1)
    .ok_or(X402Error::MathOverflow)?;
```

#### Validation

```rust
pub fn anchor_receipt(
    ctx: Context<AnchorReceipt>,
    receipt_id: String,
    // ... other params
) -> Result<()> {
    let session = &ctx.accounts.session;
    let clock = Clock::get()?;
    
    // Validate session is active
    require!(
        session.state == SessionState::Active,
        X402Error::SessionNotActive
    );
    
    // Validate not expired
    require!(
        clock.unix_timestamp <= session.expires_at,
        X402Error::SessionExpired
    );
    
    // Validate sufficient balance
    require!(
        session.remaining_balance >= amount_charged,
        X402Error::InsufficientBalance
    );
    
    // Validate provider signature
    require!(
        ctx.accounts.provider.key() == session.provider,
        X402Error::Unauthorized
    );
    
    Ok(())
}
```

### Upgrade Safety

```rust
// Immutable program deployment
#[program]
pub mod gistplus {
    use super::*;
    
    // NO upgrade authority
    // Program is immutable once deployed
}
```

---

## Application Security

### Input Validation

```typescript
import { z } from 'zod';

const intentSchema = z.object({
  capability: z.string().min(1).max(100),
  maxPricePerRequest: z.number().positive().max(1000),
  token: z.enum(['SOL', 'USDC', 'USDT', 'BONK']),
  sla: z.object({
    maxLatencyMs: z.number().positive().max(60000).optional(),
    minUptimePercent: z.number().min(0).max(100).optional()
  }).optional()
});

// Validate all inputs
try {
  const validIntent = intentSchema.parse(rawIntent);
} catch (error) {
  throw new InvalidIntentError('Invalid intent format');
}
```

### SQL Injection Prevention

```typescript
// Use parameterized queries
async function getSession(sessionId: string): Promise<Session> {
  const result = await db.query(
    'SELECT * FROM sessions WHERE session_id = $1',
    [sessionId]  // Parameterized
  );
  return result.rows[0];
}

// ❌ NEVER do this:
// const result = await db.query(`SELECT * FROM sessions WHERE session_id = '${sessionId}'`);
```

### XSS Prevention

```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize user inputs
const sanitized = DOMPurify.sanitize(userInput);

// Use Content Security Policy
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; script-src 'self'; object-src 'none';"
  );
  next();
});
```

### Authentication & Authorization

```typescript
class AuthMiddleware {
  async verifySession(req: Request, res: Response, next: NextFunction) {
    const sessionId = req.headers['x-402-session-id'];
    
    if (!sessionId) {
      return res.status(401).json({ error: 'No session ID' });
    }
    
    const session = await getSession(sessionId);
    
    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }
    
    // Verify session is active
    if (!isSessionActive(session)) {
      return res.status(401).json({ error: 'Session expired' });
    }
    
    // Verify IP (optional, but recommended)
    if (session.metadata?.ip && session.metadata.ip !== req.ip) {
      console.warn('IP mismatch for session:', sessionId);
      // Optionally reject
    }
    
    req.gistSession = session;
    next();
  }
}
```

---

## Operational Security

### Logging

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log security events
logger.info('Session created', {
  sessionId: session.sessionId,
  agentPubkey: session.agentPubkey,
  depositAmount: session.depositAmount,
  timestamp: Date.now()
});

// ❌ DON'T log sensitive data
// logger.info('Private key:', privateKey);  // NEVER!
```

### Monitoring

```typescript
import * as Sentry from '@sentry/node';

// Error tracking
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

// Custom monitoring
class SecurityMonitor {
  async checkForAnomalies() {
    // Check for unusual patterns
    const recentSessions = await getRecentSessions();
    
    // Multiple sessions from same agent in short time
    const agentCounts = new Map();
    for (const session of recentSessions) {
      const count = agentCounts.get(session.agentPubkey) || 0;
      agentCounts.set(session.agentPubkey, count + 1);
    }
    
    for (const [agent, count] of agentCounts) {
      if (count > 10) {
        await this.alertSecurityTeam({
          type: 'suspicious_activity',
          agent,
          sessionCount: count,
          timeframe: '1 hour'
        });
      }
    }
  }
}
```

### Backup & Recovery

```typescript
class BackupManager {
  async backupSessions(): Promise<void> {
    const sessions = await getAllSessions();
    const receipts = await getAllReceipts();
    
    const backup = {
      timestamp: Date.now(),
      sessions,
      receipts
    };
    
    // Encrypt backup
    const encrypted = await this.encrypt(JSON.stringify(backup));
    
    // Store in multiple locations
    await Promise.all([
      this.uploadToS3(encrypted),
      this.uploadToGCS(encrypted),
      this.storeOnIPFS(encrypted)
    ]);
  }
  
  async recover(backupId: string): Promise<void> {
    const encrypted = await this.downloadBackup(backupId);
    const decrypted = await this.decrypt(encrypted);
    const backup = JSON.parse(decrypted);
    
    // Restore sessions and receipts
    await this.restoreSessions(backup.sessions);
    await this.restoreReceipts(backup.receipts);
  }
}
```

---

## Incident Response

### Incident Types

#### 1. Key Compromise

**Immediate Actions:**
1. Revoke compromised key
2. Generate new key
3. Transfer funds to new key
4. Update all systems
5. Notify users

```bash
# Emergency key rotation script
./scripts/emergency-key-rotation.sh \
  --old-key $COMPROMISED_KEY \
  --new-key $NEW_KEY \
  --notify-users
```

#### 2. Service Breach

**Immediate Actions:**
1. Take service offline
2. Investigate breach
3. Patch vulnerability
4. Rotate all keys
5. Audit all transactions
6. Notify affected users

#### 3. Smart Contract Vulnerability

**Immediate Actions:**
1. Pause contract (if possible)
2. Move funds to safe address
3. Deploy patched contract
4. Migrate users
5. Post-mortem analysis

### Incident Response Plan

```typescript
class IncidentResponse {
  async handleSecurityIncident(incident: SecurityIncident) {
    // 1. Contain
    await this.containIncident(incident);
    
    // 2. Investigate
    const findings = await this.investigate(incident);
    
    // 3. Remediate
    await this.remediate(findings);
    
    // 4. Notify
    await this.notifyStakeholders(incident, findings);
    
    // 5. Post-mortem
    await this.conductPostMortem(incident, findings);
  }
  
  private async containIncident(incident: SecurityIncident) {
    switch (incident.type) {
      case 'key_compromise':
        await this.revokeKey(incident.affectedKey);
        break;
      case 'ddos_attack':
        await this.enableDDoSProtection();
        break;
      case 'unauthorized_access':
        await this.lockdownSessions();
        break;
    }
  }
}
```

---

## Security Checklist

### Development

- [ ] No hardcoded secrets
- [ ] Input validation on all endpoints
- [ ] Parameterized database queries
- [ ] Error messages don't leak info
- [ ] Dependencies up to date
- [ ] Security linters configured

### Pre-Production

- [ ] Security audit completed
- [ ] Penetration testing done
- [ ] Load testing passed
- [ ] Key management configured
- [ ] Monitoring setup
- [ ] Incident response plan ready

### Production

- [ ] HTTPS enforced
- [ ] Rate limiting enabled
- [ ] DDoS protection active
- [ ] Logging configured
- [ ] Backups automated
- [ ] Hardware wallet in use
- [ ] Multi-sig enabled
- [ ] Bug bounty program launched

### Operations

- [ ] Regular security audits
- [ ] Dependency updates
- [ ] Key rotation schedule
- [ ] Backup testing
- [ ] Incident drills
- [ ] Team security training

---

## Security Contact

For security issues, please email: **security@gistplus.dev**

**DO NOT** open public GitHub issues for security vulnerabilities.

---

**Next: [Deployment Guide](./DEPLOYMENT.md)**

