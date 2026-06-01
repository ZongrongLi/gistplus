# gistplus Solana Program

On-chain storage and verification for Gist Plus protocol.

## Features

- **Session PDAs**: Store prepaid session state on-chain
- **Receipt Anchoring**: Cryptographic proof of completed work
- **Escrow Management**: Hold and distribute funds securely
- **Refund System**: Dispute resolution and SLA enforcement

## Building

```bash
anchor build
```

## Testing

```bash
anchor test
```

## Deploying

```bash
# Deploy to devnet
anchor deploy --provider.cluster devnet

# Deploy to mainnet
anchor deploy --provider.cluster mainnet
```

## Program Structure

### Instructions

1. **initialize_session** - Create a new prepaid session
2. **anchor_receipt** - Store a receipt on-chain
3. **close_session** - Close session and process refund
4. **create_refund_claim** - Initiate dispute resolution

### Accounts

- **Session** - Session state and balance
- **Receipt** - Proof of work record
- **RefundClaim** - Dispute claim

## Integration

See the TypeScript client SDK (`@gistplus/client`) for easy integration with this program.

```typescript
import { GistClient } from '@gistplus/client';

const client = new GistClient({
  connection,
  wallet,
});

// Sessions are automatically anchored on-chain
const session = await client.createSession(offer, {
  anchorOnChain: true
});
```

