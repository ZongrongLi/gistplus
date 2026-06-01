import CodeBlock from '@/components/CodeBlock'

export default function AgentGuidePage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">Build an AI Agent</h1>
      <p className="text-lg text-dark/60 mb-12">
        Complete guide to building an autonomous AI agent with Gist Plus
      </p>

      {/* Architecture */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Agent Architecture</h2>
        
        <div className="border-2 border-dark/20 bg-panel-2 p-6">
          <pre className="font-mono text-xs leading-relaxed overflow-x-auto">
{`┌────────────────────────────────────────────┐
│            Your AI Agent                    │
├────────────────────────────────────────────┤
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │         Decision Logic               │  │
│  │  • What capability needed?           │  │
│  │  • What's the max price?             │  │
│  │  • Which provider to use?            │  │
│  └────────────┬─────────────────────────┘  │
│               │                             │
│  ┌────────────▼─────────────────────────┐  │
│  │       GistClient (SDK)               │  │
│  │  • createIntent()                    │  │
│  │  • negotiate()                       │  │
│  │  • createSession()                   │  │
│  │  • executeRequest()                  │  │
│  └────────────┬─────────────────────────┘  │
│               │                             │
└───────────────┼─────────────────────────────┘
                │
    ┌───────────▼──────────┐
    │  Solana Blockchain   │
    │  • Payments          │
    │  • Receipts          │
    └──────────────────────┘`}
          </pre>
        </div>
      </div>

      {/* Complete Agent */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Complete Agent Implementation</h2>

        <CodeBlock
          language="typescript"
          title="ai-agent.ts"
          showLineNumbers={true}
          code={`import { Connection, Keypair } from '@solana/web3.js';
import { GistClient } from '@gistplus/client';

class AIAgent {
  private client: GistClient;
  private sessions: Map<string, string> = new Map();

  constructor(connection: Connection, wallet: Keypair) {
    this.client = new GistClient({ connection, wallet });
  }

  /**
   * Get data from a provider
   */
  async getData(
    providerUrl: string,
    capability: string,
    requestData: any
  ) {
    // Check if we have an active session with this provider
    let sessionId = this.sessions.get(providerUrl);
    
    if (!sessionId) {
      // No session, create one
      sessionId = await this.createSessionWithProvider(
        providerUrl,
        capability
      );
      this.sessions.set(providerUrl, sessionId);
    }

    try {
      // Execute request
      const result = await this.client.executeRequest(
        sessionId,
        requestData
      );

      // Verify receipt
      if (!result.receipt.slaVerification.met) {
        console.warn('SLA breached, got refund');
      }

      return result.data;
    } catch (error) {
      // Session might be expired or depleted
      console.log('Session issue, creating new one...');
      this.sessions.delete(providerUrl);
      
      // Retry with new session
      return this.getData(providerUrl, capability, requestData);
    }
  }

  /**
   * Create session with a provider
   */
  private async createSessionWithProvider(
    providerUrl: string,
    capability: string
  ): Promise<string> {
    // 1. Create Intent
    const intent = this.client.createIntent({
      capability,
      maxPricePerRequest: 0.02,  // Willing to pay up to $0.02
      token: 'USDC',
      sla: {
        maxLatencyMs: 3000,       // Max 3s response
        minUptimePercent: 99.0
      }
    });

    // 2. Negotiate
    const offer = await this.client.negotiate(providerUrl, intent);

    // 3. Validate offer
    if (offer.pricePerRequest > intent.maxPricePerRequest) {
      throw new Error('Price too high');
    }

    // 4. Create session
    const session = await this.client.createSession(offer, {
      depositAmount: 1.0  // 1 USDC should last ~50 requests
    });

    console.log(\`✓ Session created with \${providerUrl}\`);
    return session.sessionId;
  }

  /**
   * Cleanup - close all sessions
   */
  async cleanup() {
    for (const sessionId of this.sessions.values()) {
      try {
        await this.client.closeSession(sessionId);
      } catch (error) {
        console.error('Error closing session:', error);
      }
    }
    this.sessions.clear();
  }
}

// Usage
async function main() {
  const connection = new Connection('https://api.devnet.solana.com');
  const wallet = Keypair.generate();
  
  const agent = new AIAgent(connection, wallet);
  
  // Get weather data
  const weather = await agent.getData(
    'https://weather-api.com',
    'weather-data',
    { city: 'New York' }
  );
  console.log('Weather:', weather);
  
  // Get AI inference
  const inference = await agent.getData(
    'https://ai-api.com',
    'gpt-4-inference',
    { prompt: 'Explain AI' }
  );
  console.log('AI Response:', inference);
  
  // Cleanup on exit
  await agent.cleanup();
}

main();`}
        />
      </div>

      {/* Multi-Provider */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Multi-Provider Strategy</h2>

        <CodeBlock
          language="typescript"
          code={`class SmartAgent {
  async findBestProvider(capability: string) {
    const providers = [
      'https://provider1.com',
      'https://provider2.com',
      'https://provider3.com'
    ];

    // Get offers from all
    const offers = await Promise.all(
      providers.map(async (url, i) => {
        try {
          const intent = this.client.createIntent({
            capability,
            maxPricePerRequest: 0.05,
            token: 'USDC'
          });
          
          const offer = await this.client.negotiate(url, intent);
          return { url, offer };
        } catch {
          return null;
        }
      })
    );

    // Filter valid offers
    const valid = offers.filter(o => o !== null);

    if (valid.length === 0) {
      throw new Error('No providers available');
    }

    // Select cheapest
    const best = valid.sort(
      (a, b) => a.offer.pricePerRequest - b.offer.pricePerRequest
    )[0];

    console.log(\`Selected \${best.url} at \${best.offer.pricePerRequest} USDC\`);
    
    return best;
  }
}`}
        />
      </div>
    </div>
  )
}

