# Frequently Asked Questions

## General

### What is Gist Plus?

Gist Plus is a protocol for programmable commerce between AI agents and services. It enables autonomous negotiation, payment, and verification built on Solana.

### Why "402++"?

HTTP 402 means "Payment Required". We've extended it (`++`) into a full protocol for machine-to-machine commerce with negotiation, sessions, and receipts.

### Is this production-ready?

Version 0.1.0 is an MVP. Core functionality works, but needs:
- Security audits
- Production hardening
- More testing at scale

### Who should use Gist Plus?

- **AI agent developers** - Autonomous payment for APIs
- **API providers** - Monetize endpoints easily
- **Researchers** - Economic AI experiments
- **Builders** - Decentralized AI marketplaces

## Technical

### Why Solana?

- **Speed**: 400ms blocks, near-instant settlement
- **Cost**: ~$0.00025 per transaction
- **Throughput**: 65,000+ TPS
- **Smart contracts**: Full programmability

### Can I use other blockchains?

Not yet, but it's planned:
- v0.6: Ethereum L2s
- v0.7: BNB Chain
- v0.8: Cross-chain bridge

### Do all transactions go on-chain?

No! Only:
- Session creation (fund deposit)
- Session closure (refund)
- Optional receipt anchoring

Requests are off-chain (HTTP) for speed.

### How are signatures verified?

Ed25519 signatures (Solana native):
```typescript
const message = canonicalJSON(offer);
const valid = verify(message, signature, publicKey);
```

### What if a provider lies in a receipt?

1. Receipt is signed by provider
2. Agent can dispute on-chain
3. Gateway service arbitrates
4. On-chain evidence is immutable

### Can I run my own gateway/indexer?

Yes! Both are optional:
- **Gateway**: Independent verification service
- **Indexer**: Analytics and reputation

Run your own or use community services.

## Usage

### How do agents discover providers?

Currently: Out-of-band (URLs, registries)

Future: On-chain provider registry with capabilities.

### What tokens are supported?

- SOL (native)
- USDC
- USDT
- BONK

More tokens can be added easily.

### Can I use fiat currency?

Not directly. You need:
1. On-ramp to crypto (Coinbase, etc.)
2. Convert to USDC/SOL
3. Use Gist Plus

### How fast are transactions?

- **Negotiation**: ~100-500ms (HTTP)
- **Session creation**: ~1-2s (Solana tx)
- **Requests**: ~100-2000ms (depends on service)
- **Receipts**: Instant (signed off-chain)

### What if session expires?

- Agent can close early for refund
- Auto-expires and refunds on timeout
- Provider can close if needed

### Can I reuse a session?

Yes! That's the point:
- Create once
- Make many requests
- Balance decrements per request
- Refund remaining on close

## Economics

### How much does it cost?

**For Agents:**
- Service price (negotiated)
- Solana fees (~$0.00025 per tx)
- 2 transactions per session

**For Providers:**
- No protocol fees
- Only standard Solana tx fees
- Keep 100% of service revenue

### Can pricing be dynamic?

Yes! Providers can use:
- Load-based pricing
- Time-based pricing
- SLA-based pricing
- Custom algorithms

### How are refunds calculated?

If SLA breached:
- **Latency**: 50% refund per request
- **Unavailable**: 100% refund
- **High errors**: Proportional refund

Calculated automatically in receipts.

### Can I set my own SLA?

Yes! Both sides negotiate:
- Agent sets requirements in Intent
- Provider commits in Offer
- Verified automatically in Receipts

## Security

### What if my private key is stolen?

Like any crypto:
- Attacker can spend your funds
- Use hardware wallets
- Or secure key management systems

### Can receipts be faked?

No:
- Signed by provider's key
- Verified cryptographically
- Optionally anchored on-chain
- Immutable after creation

### What about replay attacks?

Prevented by:
- Unique IDs (intentId, offerId, etc.)
- Timestamps
- Session expiration
- Signature verification

### Is there a bug bounty?

Coming soon! Security is critical.

## Development

### Can I contribute?

Yes! See [CONTRIBUTING.md](../CONTRIBUTING.md)

### What about Python support?

Planned for v0.2+. TypeScript is priority for v0.1.

### How do I report bugs?

- GitHub Issues
- Discord (security issues)
- Email: security@gistplus.dev

### Can I fork this?

Yes! Apache 2.0 license.

### Where's the roadmap?

See [README.md](../README.md) for phases.

## Business

### Is there a company behind this?

It's an open-source protocol. No single company owns it.

### How do you make money?

We don't (yet). Potential future:
- Hosted gateway service
- Premium indexer features
- Support contracts

### Can I build a business on this?

Absolutely! Use cases:
- AI inference marketplaces
- Data API platforms
- Compute marketplaces
- Agent service aggregators

### Will there be a token?

Not currently planned. Native tokens (SOL, USDC) work fine.

## Troubleshooting

### "Session not found"

- Session expired
- Wrong session ID
- Provider restarted (sessions in memory)

### "Insufficient balance"

- Session depleted
- Refill or create new session

### "Signature invalid"

- Offer/Receipt tampered
- Network corruption
- Provider key mismatch

### "402 Payment Required"

This is NORMAL! It means:
1. Endpoint requires payment
2. Send Intent to negotiate
3. Create session
4. Retry request with session

### Still have questions?

- **Discord**: [x.com/gistplus](https://x.com/gistplus)
- **GitHub Discussions**: [github.com/gistplusxyz/gistplus/discussions](https://github.com/gistplusxyz/gistplus/discussions)
- **Email**: hello@gistplus.dev

---

**Building the future of AI commerce** 🚀

