import CodeBlock from '@/components/CodeBlock'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function ProtocolPage() {
  return (
    <div className="max-w-4xl prose-sm">
      <h1 className="text-4xl font-bold mb-4">Protocol Overview</h1>
      <p className="text-lg text-dark/60 mb-12">
        Understanding the Gist Plus four-stage transactional model
      </p>

      {/* Architecture */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Architecture</h2>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="border-2 border-purple/20 bg-panel-2 p-6">
            <div className="text-xs uppercase tracking-wider font-bold mb-3 text-purple">
              APPLICATION LAYER
            </div>
            <div className="text-sm space-y-2">
              <div>• AI Agents</div>
              <div>• API Providers</div>
              <div>• Applications</div>
            </div>
          </div>

          <div className="border-2 border-blue/20 bg-panel-2 p-6">
            <div className="text-xs uppercase tracking-wider font-bold mb-3 text-blue">
              PROTOCOL LAYER
            </div>
            <div className="text-sm space-y-2">
              <div>• @gistplus/client</div>
              <div>• @gistplus/server</div>
              <div>• Intent/Offer/Session/Receipt</div>
            </div>
          </div>

          <div className="border-2 border-purple-dark/20 bg-panel-2 p-6">
            <div className="text-xs uppercase tracking-wider font-bold mb-3 text-purple-dark">
              BLOCKCHAIN LAYER
            </div>
            <div className="text-sm space-y-2">
              <div>• Solana Programs</div>
              <div>• Session Escrow</div>
              <div>• Receipt Storage</div>
            </div>
          </div>
        </div>
      </div>

      {/* Four Stages */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Four-Stage Model</h2>

        {/* Stage 1: Intent */}
        <div className="mb-8 border-l-4 border-purple pl-6">
          <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-purple to-purple-dark bg-clip-text text-transparent">
            Stage 1: Intent
          </h3>
          <p className="text-dark/70 mb-4">
            Agent expresses what it wants and maximum price willing to pay.
          </p>
          <CodeBlock
            language="typescript"
            code={`const intent = {
  intentId: "intent_abc123",
  capability: "gpt-4-inference",
  maxPricePerRequest: 0.01,  // Max willing to pay
  token: "USDC",
  sla: {
    maxLatencyMs: 2000,      // Must respond in <2s
    minUptimePercent: 99.0   // Must have 99% uptime
  },
  agentPubkey: "SolanaPublicKey..."
}`}
          />
        </div>

        {/* Stage 2: Offer */}
        <div className="mb-8 border-l-4 border-blue pl-6">
          <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-purple-dark to-blue bg-clip-text text-transparent">
            Stage 2: Offer
          </h3>
          <p className="text-dark/70 mb-4">
            Provider responds with actual price and SLA guarantees, cryptographically signed.
          </p>
          <CodeBlock
            language="typescript"
            code={`const offer = {
  offerId: "offer_xyz789",
  intentId: "intent_abc123",     // References Intent
  providerPubkey: "ProviderKey...",
  pricePerRequest: 0.008,        // 20% discount!
  token: "USDC",
  sla: {
    maxLatencyMs: 1500,          // Better than required
    minUptimePercent: 99.5
  },
  expiresAt: 1234567890,
  signature: "base58_ed25519..."  // Cryptographic proof
}`}
          />
        </div>

        {/* Stage 3: Session */}
        <div className="mb-8 border-l-4 border-blue-dark pl-6">
          <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue to-blue-dark bg-clip-text text-transparent">
            Stage 3: Session
          </h3>
          <p className="text-dark/70 mb-4">
            Prepaid channel allowing multiple requests under one payment.
          </p>
          <CodeBlock
            language="typescript"
            code={`const session = {
  sessionId: "session_def456",
  offerId: "offer_xyz789",       // Based on accepted Offer
  depositAmount: 1.0,            // 1 USDC deposited
  remainingBalance: 1.0,         // Decrements with each request
  pricePerRequest: 0.008,
  startedAt: 1234567890,
  expiresAt: 1234657890,         // 10 minutes later
  state: "active",
  requestCount: 0,
  creationTxSignature: "Solana..." // On-chain proof
}

// Can make 125 requests! (1.0 / 0.008 = 125)`}
          />
        </div>

        {/* Stage 4: Receipt */}
        <div className="mb-8 border-l-4 border-purple pl-6">
          <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-dark to-purple bg-clip-text text-transparent">
            Stage 4: Receipt
          </h3>
          <p className="text-dark/70 mb-4">
            Cryptographic proof of work for each completed request.
          </p>
          <CodeBlock
            language="typescript"
            code={`const receipt = {
  receiptId: "receipt_ghi789",
  sessionId: "session_def456",
  requestNumber: 1,
  inputHash: "sha256(...)",        // Proves input integrity
  outputHash: "sha256(...)",       // Proves output integrity
  requestStartedAt: 1234567890,
  requestCompletedAt: 1234568390,
  latencyMs: 500,
  amountCharged: 0.008,
  slaVerification: {
    met: true,                     // SLA compliance
    metrics: {
      latency: { expected: 1500, actual: 500, met: true }
    }
  },
  providerPubkey: "ProviderKey...",
  signature: "base58_ed25519..."   // Provider's signature
}

// Verifiable proof that:
// ✓ Request was executed
// ✓ SLA was met
// ✓ Correct amount charged
// ✓ Input/output integrity preserved`}
          />
        </div>
      </div>

      {/* Message Flow */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Message Flow</h2>
        
        <div className="border-2 border-dark/20 bg-panel-2 p-6">
          <div className="text-xs uppercase tracking-wider font-bold mb-4 opacity-50">
            HTTP MESSAGES
          </div>
          <div className="space-y-6 text-sm font-mono">
            <div>
              <div className="text-xs text-dark/50 mb-2">Request without session:</div>
              <pre className="text-xs bg-cream p-3 rounded overflow-x-auto">
{`POST /api/inference
Host: provider.com
X-Gist-Intent: {"capability":"gpt-4",...}

→ Response: 402 Payment Required
X-Gist-Offer: {"pricePerRequest":0.008,...}`}
              </pre>
            </div>

            <div>
              <div className="text-xs text-dark/50 mb-2">Request with session:</div>
              <pre className="text-xs bg-cream p-3 rounded overflow-x-auto">
{`POST /api/inference
Host: provider.com
X-Gist-Session-Id: session_def456
Content: {"prompt":"Hello"}

→ Response: 200 OK
X-Gist-Receipt: {"receiptId":"receipt_123",...}
Content: {"response":"Hi there!"}`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-purple/5 border-2 border-purple/20 p-6 rounded">
        <div className="text-sm font-bold mb-3">Next Steps</div>
        <div className="space-y-2 text-sm">
          <Link href="/docs/quickstart" className="flex items-center gap-2 text-purple hover:underline">
            <ArrowRight size={16} />
            Follow the Quick Start guide
          </Link>
          <Link href="/docs/api/client" className="flex items-center gap-2 text-purple hover:underline">
            <ArrowRight size={16} />
            Explore the Client API
          </Link>
          <Link href="/docs/guides/agent" className="flex items-center gap-2 text-purple hover:underline">
            <ArrowRight size={16} />
            Build your first agent
          </Link>
        </div>
      </div>
    </div>
  )
}

