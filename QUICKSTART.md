# Gist Plus Quick Start

Get up and running in under 5 minutes.

## Install

```bash
# For AI agents
npm install @gistplus/client @solana/web3.js

# For API providers
npm install @gistplus/server express @solana/web3.js
```

## Agent example

```typescript
import { Connection, Keypair } from '@solana/web3.js';
import { GistClient } from '@gistplus/client';

const connection = new Connection('https://api.devnet.solana.com');
const wallet = Keypair.generate();
const client = new GistClient({ connection, wallet });

const intent = client.createIntent({
  capability: 'gpt-4-inference',
  maxPricePerRequest: 0.01,
  token: 'USDC',
  sla: { maxLatencyMs: 2000 },
});

const offer = await client.negotiate('https://api.provider.com', intent);
const session = await client.createSession(offer);
const result = await session.request({ prompt: 'Hello!' });

console.log(result.receipt);
```

## Provider example

```typescript
import express from 'express';
import { Connection, Keypair } from '@solana/web3.js';
import { gistMiddleware } from '@gistplus/server';

const app = express();

app.use(
  gistMiddleware({
    connection: new Connection('https://api.devnet.solana.com'),
    wallet: Keypair.generate(),
    endpoint: 'http://localhost:3000',
    pricing: { basePrice: 0.005, token: 'USDC' },
    sla: { maxLatencyMs: 2000 },
  })
);

app.post('/api/inference', (req, res) => {
  res.json({ response: 'Hello from Gist Plus!' });
});

app.listen(3000);
```

## Try the demo (no install)

```bash
node examples/simple-demo/provider.js   # terminal 1
node examples/simple-demo/agent.js      # terminal 2
```

## Next steps

- **Docs:** [gistplus.dev/docs](https://gistplus.dev/docs)
- **Examples:** [`examples/`](./examples)
- **Protocol spec:** [`docs/protocol-spec.md`](./docs/protocol-spec.md)
- **Publish packages:** `npm run publish:all` from repo root
