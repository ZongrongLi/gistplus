import CodeBlock from '@/components/CodeBlock'

export default function QuickStartPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">Quick Start</h1>
      <p className="text-lg text-dark/60 mb-12">
        Get running with Gist Plus in under 5 minutes
      </p>

      {/* Step 1 */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple to-blue text-white flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h2 className="text-2xl font-bold">Install the Package</h2>
        </div>
        
        <p className="text-dark/70 mb-4 ml-11">
          Choose based on your use case:
        </p>

        <div className="ml-11 space-y-3">
          <div>
            <div className="text-sm font-bold mb-2">For AI Agents (most common)</div>
            <CodeBlock language="bash" code="npm install @gistplus/client @solana/web3.js" />
          </div>

          <div>
            <div className="text-sm font-bold mb-2">For API Providers</div>
            <CodeBlock language="bash" code="npm install @gistplus/server express @solana/web3.js" />
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple to-blue text-white flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h2 className="text-2xl font-bold">Write Your First Agent</h2>
        </div>

        <div className="ml-11">
          <CodeBlock
            language="typescript"
            title="agent.ts"
            code={`import { Connection, Keypair } from '@solana/web3.js';
import { GistClient } from '@gistplus/client';

// 1. Setup
const connection = new Connection('https://api.devnet.solana.com');
const wallet = Keypair.generate();

const client = new GistClient({ connection, wallet });

// 2. Create Intent
const intent = client.createIntent({
  capability: 'weather-api',
  maxPricePerRequest: 0.01,
  token: 'USDC',
  sla: { maxLatencyMs: 2000 }
});

// 3. Negotiate with provider
const offer = await client.negotiate(
  'https://api.provider.com',
  intent
);

console.log('Got offer:', offer.pricePerRequest, offer.token);

// 4. Create prepaid session
const session = await client.createSession(offer, {
  depositAmount: 0.1  // 0.1 USDC
});

console.log('Session created:', session.sessionId);
console.log('Can make', Math.floor(0.1 / offer.pricePerRequest), 'requests');

// 5. Execute requests
const result = await client.executeRequest(
  session.sessionId,
  { city: 'New York' }
);

console.log('Response:', result.data);
console.log('Receipt:', result.receipt);
console.log('SLA met:', result.receipt.slaVerification.met);

// 6. Close and get refund
await client.closeSession(session.sessionId);`}
          />
        </div>
      </div>

      {/* Step 3 */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple to-blue text-white flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h2 className="text-2xl font-bold">Run It</h2>
        </div>

        <div className="ml-11">
          <CodeBlock
            language="bash"
            code={`# Get devnet SOL (free)
solana airdrop 1 YOUR_WALLET --url devnet

# Run your agent
ts-node agent.ts`}
          />
        </div>
      </div>

      {/* Data Flow */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">What Happens Behind the Scenes</h2>
        
        <div className="border-2 border-dark/20 bg-panel-2 p-6">
          <pre className="font-mono text-xs leading-relaxed overflow-x-auto">
{`Agent                           Provider                  Solana
  │                               │                           │
  │ createIntent()                │                           │
  ├─ Intent {                     │                           │
  │    capability: "weather-api"  │                           │
  │    maxPrice: 0.01             │                           │
  │  }                            │                           │
  │                               │                           │
  │ negotiate() ───────────────>  │                           │
  │   X-Gist-Intent header         │                           │
  │                               │ createOffer()             │
  │                               ├─ Offer {                  │
  │                               │    price: 0.008           │
  │                               │    signature: "..."       │
  │                               │  }                        │
  │ <──────────────────────────── │                           │
  │   402 + X-Gist-Offer           │                           │
  │                               │                           │
  │ createSession()               │                           │
  ├─ Transfer 0.1 USDC ──────────────────────────────────────>│
  │                               │ verifyPayment()           │
  │                               │<──────────────────────────┤
  │                               │ createSession()           │
  │ <──────────────────────────── │                           │
  │   Session {id, balance}       │                           │
  │                               │                           │
  │ executeRequest() ──────────>  │                           │
  │   + Session-Id header         │                           │
  │                               │ processRequest()          │
  │                               │ deductBalance()           │
  │                               │ createReceipt()           │
  │ <──────────────────────────── │                           │
  │   Data + Receipt              │                           │
  │                               │                           │
  │ ... 99 more requests ...      │                           │
  │ (NO blockchain overhead!)     │                           │
  │                               │                           │
  │ closeSession() ────────────>  │                           │
  │                               │ calculateRefund()         │
  │ <─────────────────────────────────────────────────────────┤
  │   Refund remaining balance    │                           │`}
          </pre>
        </div>
      </div>

      {/* Next */}
      <div className="bg-purple/5 border-2 border-purple/20 p-6 rounded">
        <div className="text-sm font-bold mb-3">Continue Learning</div>
        <div className="space-y-2 text-sm">
          <a href="/docs/negotiation" className="block text-purple hover:underline">
            → Deep dive into Intent-Offer negotiation
          </a>
          <a href="/docs/sessions" className="block text-purple hover:underline">
            → Understanding Sessions and balance management
          </a>
          <a href="/docs/receipts" className="block text-purple hover:underline">
            → Cryptographic receipts and verification
          </a>
        </div>
      </div>
    </div>
  )
}

