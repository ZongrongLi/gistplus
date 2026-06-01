# Gist Plus

[![npm @gistplus/core](https://img.shields.io/npm/v/@gistplus/core?style=flat-square)](https://www.npmjs.com/package/@gistplus/core)
[![npm @gistplus/client](https://img.shields.io/npm/v/@gistplus/client?style=flat-square)](https://www.npmjs.com/package/@gistplus/client)
[![npm @gistplus/server](https://img.shields.io/npm/v/@gistplus/server?style=flat-square)](https://www.npmjs.com/package/@gistplus/server)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg?style=flat-square)](LICENSE)
[![Solana](https://img.shields.io/badge/Solana-Devnet%20Ready-14F195?style=flat-square&logo=solana)](https://solana.com)
[![Website](https://img.shields.io/badge/docs-gistplus.dev-8b5cf6?style=flat-square)](https://gistplus.dev)
[![Twitter Follow](https://img.shields.io/twitter/follow/gistplus?style=social)](https://x.com/gistplus)

**The economic layer for autonomous AI agents.**

Gist Plus is a programmable commerce protocol on Solana. Agents negotiate pricing, open prepaid sessions, pay per request, and verify every response with cryptographic receipts — no API keys, no manual billing, no humans in the loop.

---

## Why Gist Plus

| | Per-request paywalls | Gist Plus sessions |
|---|---|---|
| **Cost (100 calls)** | ~$3.50 | ~$1.00 |
| **Latency overhead** | High (tx every call) | Low (2 on-chain txs) |
| **Proof of delivery** | None | Signed receipts |
| **SLA enforcement** | Manual | Automatic refunds |
| **Agent-ready** | No | Yes |

Sessions batch payment upfront, so agents get REST-like speed with on-chain settlement and verifiable audit trails.

---

## Protocol flow

```
Agent                    Provider                  Solana
  │                         │                        │
  │──── Intent ────────────►│                        │
  │◄─── Offer (signed) ─────│                        │
  │──── Open session ───────┼───────────────────────►│
  │──── Request ───────────►│                        │
  │◄─── Response + Receipt ─│                        │
  │──── Close / refund ─────┼───────────────────────►│
```

1. **Intent** — Agent states capability, max price, and SLA requirements  
2. **Offer** — Provider returns a signed quote  
3. **Session** — Prepaid channel for multiple requests  
4. **Receipt** — Cryptographic proof of work and latency  

---

## Install

**For AI agents and apps:**

```bash
npm install @gistplus/client @solana/web3.js
```

**For API providers:**

```bash
npm install @gistplus/server express @solana/web3.js
```

**Full stack:**

```bash
npm install @gistplus/core @gistplus/client @gistplus/server
```

### Packages

| Package | Purpose | npm |
|---------|---------|-----|
| [`@gistplus/core`](./packages/core/typescript) | Types, crypto, protocol primitives | [npm](https://www.npmjs.com/package/@gistplus/core) |
| [`@gistplus/client`](./packages/client/typescript) | Agent SDK — negotiate, pay, verify | [npm](https://www.npmjs.com/package/@gistplus/client) |
| [`@gistplus/server`](./packages/server/typescript) | Express middleware for providers | [npm](https://www.npmjs.com/package/@gistplus/server) |
| [`@gistplus/gateway`](./packages/gateway/typescript) | Receipt verification & SLA resolution | [npm](https://www.npmjs.com/package/@gistplus/gateway) |
| [`@gistplus/indexer`](./packages/indexer/typescript) | Analytics & reputation | [npm](https://www.npmjs.com/package/@gistplus/indexer) |
| [`gistplus-solana`](./packages/solana) | On-chain programs (Anchor) | Deploy with Anchor |

---

## Quick start

### Agent

```typescript
import { Connection, Keypair } from '@solana/web3.js';
import { GistClient } from '@gistplus/client';

const client = new GistClient({
  connection: new Connection('https://api.devnet.solana.com'),
  wallet: Keypair.generate(),
});

const intent = client.createIntent({
  capability: 'gpt-4-inference',
  maxPricePerRequest: 0.01,
  token: 'USDC',
  sla: { maxLatencyMs: 2000 },
});

const offer = await client.negotiate('https://api.provider.com', intent);
const session = await client.createSession(offer);
const result = await session.request({ prompt: 'Hello!' });

console.log(result.receipt); // signed proof of delivery
```

### Provider

```typescript
import express from 'express';
import { Connection, Keypair } from '@solana/web3.js';
import { gistMiddleware } from '@gistplus/server';

const app = express();

app.use(
  gistMiddleware({
    connection: new Connection('https://api.devnet.solana.com'),
    wallet: Keypair.generate(),
    endpoint: 'https://your-api.com',
    pricing: { basePrice: 0.005, token: 'USDC' },
    sla: { maxLatencyMs: 2000 },
  })
);

app.post('/api/inference', (req, res) => {
  res.json({ response: 'Hello from Gist Plus!' });
});

app.listen(3000);
```

### Zero-dependency demo

```bash
# Terminal 1
node examples/simple-demo/provider.js

# Terminal 2
node examples/simple-demo/agent.js
```

See [`examples/simple-demo/README.md`](./examples/simple-demo/README.md) for the full walkthrough.

---

## Monorepo layout

```
gistplus/
├── packages/
│   ├── core/typescript/      # @gistplus/core
│   ├── client/typescript/    # @gistplus/client
│   ├── server/typescript/    # @gistplus/server
│   ├── gateway/typescript/   # @gistplus/gateway
│   ├── indexer/typescript/   # @gistplus/indexer
│   └── solana/               # Anchor programs
├── examples/                 # Agents, providers, demos
├── website/                  # gistplus.dev docs & landing
└── docs/                     # Protocol specs & guides
```

```bash
npm install          # install all workspaces
npm run build        # build all packages
npm run publish:dry  # dry-run npm publish
```

---

## Documentation

| Resource | Link |
|----------|------|
| **Website & docs** | [gistplus.dev](https://gistplus.dev) |
| **Quick start** | [gistplus.dev/docs/quickstart](https://gistplus.dev/docs/quickstart) |
| **Protocol overview** | [gistplus.dev/docs/protocol](https://gistplus.dev/docs/protocol) |
| **Examples** | [`examples/`](./examples) |
| **Protocol spec** | [`docs/protocol-spec.md`](./docs/protocol-spec.md) |
| **Architecture** | [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) |
| **Roadmap** | [`docs/ROADMAP.md`](./docs/ROADMAP.md) |

---

## Use cases

- AI inference marketplaces — pay per token with SLA guarantees  
- Data APIs — metered access with automatic refunds on breach  
- Agent toolchains — autonomous agents buying compute, storage, and APIs  
- Oracle & compute networks — verifiable delivery receipts  

---

## Contributing

Contributions welcome — bugs, docs, examples, and code.

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) and open an issue or PR on this repo.

---

## Community

- **Website:** [gistplus.dev](https://gistplus.dev)
- **GitHub:** [github.com/gistplusxyz/gistplus](https://github.com/gistplusxyz/gistplus)
- **X:** [@gistplus](https://x.com/gistplus)

---

## License

Apache 2.0 — see [LICENSE](./LICENSE).
