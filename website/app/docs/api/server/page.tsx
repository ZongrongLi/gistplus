import CodeBlock from '@/components/CodeBlock'
import NpmPackageLink from '@/components/NpmPackageLink'

export default function ServerAPIPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">@gistplus/server</h1>
      <p className="text-lg text-dark/60 mb-3">
        Server middleware for API providers to monetize endpoints
      </p>
      <div className="mb-12">
        <NpmPackageLink name="@gistplus/server" />
      </div>

      {/* Installation */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <CodeBlock language="bash" code="npm install @gistplus/server express @solana/web3.js" />
      </div>

      {/* gistMiddleware */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">gistMiddleware</h2>
        <p className="text-dark/70 mb-6">
          Express middleware that handles the complete Gist Plus protocol automatically.
        </p>

        <CodeBlock
          language="typescript"
          title="Basic Setup"
          code={`import express from 'express';
import { Connection, Keypair } from '@solana/web3.js';
import { gistMiddleware } from '@gistplus/server';

const app = express();
const connection = new Connection('https://api.devnet.solana.com');
const wallet = Keypair.generate();

// Apply middleware to protected routes
app.use('/api/*', gistMiddleware({
  connection: Connection,       // Solana connection
  wallet: Keypair,             // Provider's keypair
  endpoint: string,            // Your API URL
  pricing: {
    basePrice: number,
    token: 'SOL' | 'USDC' | 'USDT' | 'BONK'
  },
  sla: {
    maxLatencyMs?: number,
    minUptimePercent?: number
  },
  sessionDurationMs?: number,  // Default: 10 minutes
  offerExpirationMs?: number   // Default: 1 minute
}));`}
        />
      </div>

      {/* What Middleware Does */}
      <div className="mb-12">
        <h3 className="text-xl font-bold mb-4">What the Middleware Does</h3>
        
        <div className="border-2 border-dark/20 bg-panel-2 p-6">
          <pre className="font-mono text-xs leading-relaxed">
{`Request Flow:

1. Request arrives at /api/endpoint

2. Middleware checks for X-Gist-Session-Id header

   ┌─ NO SESSION ────────────────────────────┐
   │                                          │
   │  • Check for X-Gist-Intent header        │
   │  • Generate signed Offer                │
   │  • Return 402 + X-Gist-Offer header      │
   │                                          │
   └──────────────────────────────────────────┘

   ┌─ HAS SESSION ───────────────────────────┐
   │                                          │
   │  • Validate session exists & active     │
   │  • Check balance >= pricePerRequest     │
   │  • Attach session to req.gistSession    │
   │  • Call your route handler              │
   │  • Generate signed receipt              │
   │  • Deduct from session balance          │
   │  • Return response + X-Gist-Receipt      │
   │                                          │
   └──────────────────────────────────────────┘`}
          </pre>
        </div>
      </div>

      {/* Usage */}
      <div className="mb-12">
        <h3 className="text-xl font-bold mb-6">Using in Your Routes</h3>

        <CodeBlock
          language="typescript"
          title="Protected API Endpoint"
          code={`app.post('/api/inference', async (req, res) => {
  // Session automatically attached by middleware
  const session = req.gistSession;
  
  console.log('Session ID:', session.sessionId);
  console.log('Balance:', session.remainingBalance);
  console.log('Request #:', session.requestCount + 1);
  
  // Your API logic
  const result = await runInference(req.body);
  
  // Middleware automatically:
  // - Generates receipt
  // - Signs with Ed25519
  // - Verifies SLA
  // - Deducts from balance
  // - Sends X-Gist-Receipt header
  
  return res.gistReceipt?.(result);
});`}
        />
      </div>

      {/* Pricing Strategies */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Pricing Strategies</h2>

        <div className="space-y-6">
          <div>
            <h4 className="font-bold mb-3">Static Pricing</h4>
            <CodeBlock
              language="typescript"
              code={`pricing: {
  basePrice: 0.01,
  token: 'USDC'
}

// Same price for all requests`}
            />
          </div>

          <div>
            <h4 className="font-bold mb-3">Load-Based Pricing</h4>
            <CodeBlock
              language="typescript"
              code={`import { LoadBasedPricingStrategy } from '@gistplus/server';

const pricing = new LoadBasedPricingStrategy(
  0.01,     // base price
  'USDC',
  () => {
    // Return 0-1 representing load
    return getCurrentLoad() / maxLoad;
  }
);

// Price scales with server load:
// 0% load  → $0.01
// 50% load → $0.015
// 100% load → $0.02`}
            />
          </div>

          <div>
            <h4 className="font-bold mb-3">Time-Based Pricing</h4>
            <CodeBlock
              language="typescript"
              code={`import { TimeBasedPricingStrategy } from '@gistplus/server';

const pricing = new TimeBasedPricingStrategy(
  0.02,   // peak price
  0.01,   // off-peak price
  { start: 9, end: 17 },  // 9 AM - 5 PM peak hours
  'USDC'
);`}
            />
          </div>
        </div>
      </div>

      {/* Complete Example */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Complete Provider Example</h2>
        <CodeBlock
          language="typescript"
          title="provider.ts"
          showLineNumbers={true}
          code={`import express from 'express';
import { Connection, Keypair } from '@solana/web3.js';
import { gistMiddleware } from '@gistplus/server';

const app = express();
app.use(express.json());

const connection = new Connection('https://api.devnet.solana.com');
const wallet = Keypair.generate();

// Configure Gist Plus middleware
app.use('/api/*', gistMiddleware({
  connection,
  wallet,
  endpoint: 'https://your-api.com',
  pricing: { basePrice: 0.01, token: 'USDC' },
  sla: { maxLatencyMs: 2000, minUptimePercent: 99.5 }
}));

// Weather API
app.post('/api/weather', async (req, res) => {
  const { city } = req.body;
  const data = await getWeatherData(city);
  return res.gistReceipt?.(data);
});

// AI Inference API
app.post('/api/inference', async (req, res) => {
  const { prompt } = req.body;
  const response = await runAI(prompt);
  return res.gistReceipt?.(response);
});

app.listen(3000, () => {
  console.log('✅ API monetized with Gist Plus!');
});`}
        />
      </div>
    </div>
  )
}

