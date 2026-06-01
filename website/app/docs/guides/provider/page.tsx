import CodeBlock from '@/components/CodeBlock'

export default function ProviderGuidePage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">Build an API Provider</h1>
      <p className="text-lg text-dark/60 mb-12">
        Complete guide to monetizing your API with Gist Plus
      </p>

      {/* Setup */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Step 1: Setup</h2>
        
        <CodeBlock
          language="bash"
          code={`npm install @gistplus/server express @solana/web3.js
npm install -D typescript @types/node @types/express`}
        />
      </div>

      {/* Basic Server */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Step 2: Add Middleware</h2>

        <CodeBlock
          language="typescript"
          title="server.ts"
          showLineNumbers={true}
          code={`import express from 'express';
import { Connection, Keypair } from '@solana/web3.js';
import { gistMiddleware } from '@gistplus/server';

const app = express();
app.use(express.json());

// Solana setup
const connection = new Connection('https://api.devnet.solana.com');
const wallet = Keypair.generate();  // In production: load securely

console.log('Provider wallet:', wallet.publicKey.toBase58());

// Add Gist Plus middleware (ONE LINE!)
app.use('/api/*', gistMiddleware({
  connection,
  wallet,
  endpoint: 'https://your-api.com',  // Your domain
  pricing: {
    basePrice: 0.01,  // $0.01 per request
    token: 'USDC'
  },
  sla: {
    maxLatencyMs: 2000,      // Guarantee <2s
    minUptimePercent: 99.5   // Guarantee 99.5% uptime
  }
}));

app.listen(3000);`}
        />
      </div>

      {/* Add Endpoints */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Step 3: Add Your Endpoints</h2>

        <CodeBlock
          language="typescript"
          code={`// Your endpoints are now automatically monetized!

app.post('/api/weather', async (req, res) => {
  const { city } = req.body;
  
  // req.gistSession contains session info
  console.log('Session:', req.gistSession.sessionId);
  console.log('Balance:', req.gistSession.remainingBalance);
  
  // Your API logic
  const data = await getWeatherData(city);
  
  // Automatic receipt generation
  return res.gistReceipt?.(data);
});

app.post('/api/ai', async (req, res) => {
  const { prompt } = req.body;
  const response = await runAI(prompt);
  return res.gistReceipt?.(response);
});

// That's it! Every request:
// ✓ Checks for valid session
// ✓ Deducts payment from balance
// ✓ Generates signed receipt
// ✓ Verifies SLA compliance
// ✓ Returns cryptographic proof`}
        />
      </div>

      {/* What Happens */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">What Happens Automatically</h2>

        <div className="border-2 border-dark/20 bg-panel-2 p-6">
          <pre className="font-mono text-xs leading-relaxed overflow-x-auto">
{`Request Without Session:
────────────────────────
Agent → POST /api/weather
        No X-Gist-Session-Id header

Middleware:
├─ Checks for Intent header
├─ Generates signed Offer
└─ Returns: 402 Payment Required
            X-Gist-Offer: {...}

Request With Session:
─────────────────────
Agent → POST /api/weather
        X-Gist-Session-Id: session_abc123

Middleware:
├─ Validates session exists
├─ Checks balance >= pricePerRequest
├─ Attaches session to req.gistSession
├─ Calls your handler
│
Your Handler:
├─ Process request
├─ Return data via res.gistReceipt?(data)
│
Middleware:
├─ Generates Receipt {
│    inputHash: sha256(req.body)
│    outputHash: sha256(data)
│    latency: endTime - startTime
│    slaVerification: { met: true/false }
│    signature: ed25519(receipt)
│  }
├─ Deducts from session balance
├─ Updates request count
└─ Returns: 200 OK
            X-Gist-Receipt: {...}
            Content: data`}
          </pre>
        </div>
      </div>

      {/* Production Tips */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Production Tips</h2>

        <div className="space-y-6">
          <div className="border-l-4 border-purple pl-6">
            <h4 className="font-bold mb-2">Use Premium RPC</h4>
            <CodeBlock
              language="typescript"
              code={`// ❌ DON'T use public RPC in production
const connection = new Connection('https://api.mainnet-beta.solana.com');

// ✅ DO use premium RPC
const connection = new Connection(
  process.env.SOLANA_RPC || 'https://rpc.helius.xyz/?api-key=YOUR_KEY'
);`}
            />
          </div>

          <div className="border-l-4 border-blue pl-6">
            <h4 className="font-bold mb-2">Secure Your Keys</h4>
            <CodeBlock
              language="typescript"
              code={`// Load from environment
const privateKey = process.env.WALLET_PRIVATE_KEY;
const secretKey = Buffer.from(privateKey, 'base64');
const wallet = Keypair.fromSecretKey(secretKey);

// NEVER hardcode private keys!`}
            />
          </div>

          <div className="border-l-4 border-purple-dark pl-6">
            <h4 className="font-bold mb-2">Monitor Sessions</h4>
            <CodeBlock
              language="typescript"
              code={`// Health check endpoint
app.get('/health', async (req, res) => {
  res.json({
    status: 'healthy',
    activeSessions: sessionStore.getActiveSessions().length,
    uptime: process.uptime()
  });
});`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

