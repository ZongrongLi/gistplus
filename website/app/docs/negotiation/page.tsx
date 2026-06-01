import CodeBlock from '@/components/CodeBlock'

export default function NegotiationPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">Intent → Offer Negotiation</h1>
      <p className="text-lg text-dark/60 mb-12">
        How agents and providers negotiate pricing dynamically
      </p>

      {/* Flow Diagram */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Negotiation Flow</h2>
        
        <div className="space-y-3">
          <div className="flex items-start gap-4 p-4 border-l-4 border-purple bg-purple/5">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple text-white flex items-center justify-center text-xs font-bold">1</div>
            <div>
              <div className="font-bold mb-1">Agent Creates Intent</div>
              <div className="text-sm text-dark/60">Expresses capability needed, maximum price, and SLA requirements</div>
              <CodeBlock language="typescript" code={`{ capability: "gpt-4", maxPrice: 0.01, sla: {...} }`} />
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 border-l-4 border-blue bg-blue/5">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue text-white flex items-center justify-center text-xs font-bold">2</div>
            <div>
              <div className="font-bold mb-1">Agent Sends Intent to Provider</div>
              <div className="text-sm text-dark/60 font-mono text-xs">POST /api with X-Gist-Intent header</div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 border-l-4 border-purple-dark bg-purple-dark/5">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-dark text-white flex items-center justify-center text-xs font-bold">3</div>
            <div>
              <div className="font-bold mb-1">Provider Creates Signed Offer</div>
              <div className="text-sm text-dark/60">Calculates price, signs with Ed25519, returns 402 status</div>
              <CodeBlock language="typescript" code={`{ price: 0.008, signature: "ed25519..." }`} />
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 border-l-4 border-blue-dark bg-blue-dark/5">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-dark text-white flex items-center justify-center text-xs font-bold">4</div>
            <div>
              <div className="font-bold mb-1">Agent Verifies & Accepts</div>
              <div className="text-sm text-dark/60">Checks signature, validates price ≤ maxPrice, creates session</div>
            </div>
          </div>
        </div>
      </div>

      {/* Old ASCII kept for reference */}
      <div className="mb-12 border-2 border-dark/20 bg-panel-2 p-6">
        <div className="text-xs uppercase tracking-wider font-bold mb-4 opacity-50">
          DETAILED MESSAGE FLOW
        </div>
        <pre className="font-mono text-[11px] leading-relaxed overflow-x-auto text-dark/70">
{`Agent                                    Provider
  │                                          │
  │ 1. Create Intent                         │
  ├─ {                                       │
  │    capability: "gpt-4",                  │
  │    maxPricePerRequest: 0.01,  ──┐       │
  │    token: "USDC"                 │       │
  │  }                               │       │
  │                                  │       │
  │ 2. Send Intent                   │       │
  ├──────────────────────────────────┼───────>│
  │   POST /api/inference            │       │
  │   X-Gist-Intent: {...}            │       │
  │                                  │       │
  │                                  │    3. Evaluate Intent
  │                                  │    ├─ Check capability
  │                                  │    ├─ Calculate price
  │                                  │    ├─ Check if can meet SLA
  │                                  │    │
  │                                  │    4. Create Offer
  │                                  │    ├─ {
  │                                  │    │    pricePerRequest: 0.008,
  │                                  │    │    sla: { maxLatencyMs: 1500 }
  │                                  │    │  }
  │                                  │    │
  │                                  │    5. Sign Offer
  │                                  │    ├─ Ed25519 signature
  │                                  │    │
  │ 6. Receive Offer                 │    │
  │<─────────────────────────────────┼────┤
  │   402 Payment Required           │    │
  │   X-Gist-Offer: {...}             │    │
  │                                  │    │
  │ 7. Verify Signature              │    │
  ├─ verifyOffer(offer) ✓            │    │
  │                                  │    │
  │ 8. Check Price                   │    │
  ├─ 0.008 <= 0.01 ✓                 │    │
  │                                  │    │
  │ 9. Accept Offer                  │    │
  ├─ Create session ─────────────────┼────>│`}
        </pre>
      </div>

      {/* Intent Structure */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Intent Structure</h2>
        
        <CodeBlock
          language="typescript"
          title="Intent Object"
          code={`interface Intent {
  // Identification
  version: string;              // Protocol version "0.1.0"
  timestamp: number;            // Unix timestamp
  intentId: string;             // Unique ID
  
  // Requirements
  capability: string;           // What service needed
  maxPricePerRequest: number;   // Price ceiling
  token: SupportedToken;        // Payment token
  
  // Optional
  maxSessionBudget?: number;    // Total budget limit
  sessionDurationMs?: number;   // Desired session length
  sla?: {
    maxLatencyMs?: number;      // Max response time
    minUptimePercent?: number;  // Min availability
    maxErrorRatePercent?: number; // Max error rate
  };
  
  // Identity
  agentPubkey: string;          // Solana public key
  metadata?: Record<string, any>;
}`}
        />
      </div>

      {/* Offer Structure */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Offer Structure</h2>
        
        <CodeBlock
          language="typescript"
          title="Offer Object"
          code={`interface Offer {
  // Identification
  version: string;
  timestamp: number;
  intentId: string;             // References Intent
  offerId: string;              // Unique ID
  
  // Provider Info
  providerPubkey: string;       // Provider's Solana key
  endpoint: string;             // API endpoint URL
  
  // Pricing
  pricePerRequest: number;      // Actual price offered
  token: SupportedToken;
  tokenMint: string;            // Solana mint address
  
  // Guarantees
  sla: SLA;                     // SLA commitments
  sessionDurationMs: number;    // How long session lasts
  expiresAt: number;            // Offer expiration
  
  // Cryptographic Proof
  signature: string;            // Ed25519 signature
  
  metadata?: Record<string, any>;
}`}
        />
      </div>

      {/* Signature Verification */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Signature Verification</h2>
        
        <p className="text-dark/70 mb-4">
          Every Offer is cryptographically signed by the provider using Ed25519.
        </p>

        <div className="border-2 border-dark/20 bg-panel-2 p-6 mb-4">
          <div className="text-xs uppercase tracking-wider font-bold mb-4 opacity-50">
            SIGNATURE PROCESS
          </div>
          <pre className="font-mono text-xs leading-relaxed">
{`Provider Side (Creating Offer):
────────────────────────────────
1. Create Offer object (without signature field)
2. Serialize to canonical JSON
3. Hash with SHA-256
4. Sign hash with Ed25519 private key
5. Encode signature as base58
6. Add signature field to Offer
7. Send to agent

Agent Side (Verifying Offer):
──────────────────────────────
1. Receive Offer
2. Extract signature field
3. Remove signature from object
4. Serialize to canonical JSON
5. Hash with SHA-256  
6. Verify signature with provider's public key
7. Check offer hasn't expired
8. Verify price <= maxPricePerRequest
9. Accept or reject`}
          </pre>
        </div>

        <CodeBlock
          language="typescript"
          code={`import { verifyOffer } from '@gistplus/core';

// Verify offer is valid and not tampered
try {
  verifyOffer(offer);
  console.log('✓ Offer is valid');
  
  // Check if acceptable
  if (offer.pricePerRequest <= intent.maxPricePerRequest) {
    console.log('✓ Price acceptable');
    // Accept and create session
  }
} catch (error) {
  if (error instanceof OfferExpiredError) {
    console.log('Offer expired, request new one');
  } else if (error instanceof InvalidSignatureError) {
    console.log('Signature invalid, offer tampered!');
  }
}`}
        />
      </div>

      {/* Pricing Example */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Dynamic Pricing Example</h2>
        
        <CodeBlock
          language="typescript"
          title="Custom Pricing Strategy"
          code={`import { PricingStrategy } from '@gistplus/server';

class CustomPricing implements PricingStrategy {
  async getPrice(intent: Intent): Promise<number> {
    let price = 0.01;  // base
    
    // Adjust for capability
    if (intent.capability === 'gpt-4-inference') {
      price = 0.02;
    }
    
    // Adjust for SLA strictness
    if (intent.sla?.maxLatencyMs && intent.sla.maxLatencyMs < 1000) {
      price *= 1.5;  // 50% premium for <1s response
    }
    
    // Adjust for current load
    const load = await getCurrentLoad();
    price *= (1 + load);
    
    // Adjust for time of day
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 17) {
      price *= 1.2;  // 20% premium during business hours
    }
    
    return price;
  }
}

// Use in middleware
app.use('/api/*', gistMiddleware({
  // ...
  pricing: new CustomPricing()
}));`}
        />
      </div>
    </div>
  )
}

