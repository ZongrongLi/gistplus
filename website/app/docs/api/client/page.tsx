import CodeBlock from '@/components/CodeBlock'
import NpmPackageLink from '@/components/NpmPackageLink'

export default function ClientAPIPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">@gistplus/client</h1>
      <p className="text-lg text-dark/60 mb-3">
        Client SDK for AI agents and applications
      </p>
      <div className="mb-12">
        <NpmPackageLink name="@gistplus/client" />
      </div>

      {/* Installation */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <CodeBlock language="bash" code="npm install @gistplus/client @solana/web3.js" />
      </div>

      {/* GistClient */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">GistClient</h2>
        <p className="text-dark/70 mb-6">
          Main client class for interacting with Gist Plus providers.
        </p>

        {/* Constructor */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Constructor</h3>
          <CodeBlock
            language="typescript"
            code={`import { Connection, Keypair } from '@solana/web3.js';
import { GistClient } from '@gistplus/client';

const client = new GistClient({
  connection: Connection,    // Solana connection
  wallet: Keypair,          // Agent's keypair
  httpConfig?: {            // Optional
    timeout?: number,
    headers?: Record<string, string>
  }
});`}
          />
        </div>

        {/* Methods */}
        <div className="space-y-8">
          {/* createIntent */}
          <div className="border-l-4 border-purple pl-6">
            <h3 className="text-lg font-bold mb-2 font-mono">createIntent()</h3>
            <p className="text-sm text-dark/60 mb-4">Creates a new Intent expressing agent's needs</p>
            <CodeBlock
              language="typescript"
              code={`const intent = client.createIntent({
  capability: string,           // e.g., 'gpt-4-inference'
  maxPricePerRequest: number,   // Max price willing to pay
  token: 'SOL' | 'USDC' | 'USDT' | 'BONK',
  maxSessionBudget?: number,    // Optional: total budget
  sessionDurationMs?: number,   // Optional: session length
  sla?: {
    maxLatencyMs?: number,
    minUptimePercent?: number
  },
  metadata?: Record<string, any>
});

// Returns: Intent object`}
            />
          </div>

          {/* negotiate */}
          <div className="border-l-4 border-blue pl-6">
            <h3 className="text-lg font-bold mb-2 font-mono">negotiate()</h3>
            <p className="text-sm text-dark/60 mb-4">Negotiates with provider and receives signed Offer</p>
            <CodeBlock
              language="typescript"
              code={`const offer = await client.negotiate(
  providerEndpoint: string,    // Provider's URL
  intent: Intent,              // Your Intent
  options?: {
    headers?: Record<string, string>,
    timeout?: number
  }
);

// Returns: Signed Offer from provider
// Throws: Error if negotiation fails`}
            />
          </div>

          {/* createSession */}
          <div className="border-l-4 border-blue-dark pl-6">
            <h3 className="text-lg font-bold mb-2 font-mono">createSession()</h3>
            <p className="text-sm text-dark/60 mb-4">Creates prepaid session from accepted Offer</p>
            <CodeBlock
              language="typescript"
              code={`const session = await client.createSession(
  offer: Offer,
  options?: {
    depositAmount?: number,      // Custom deposit
    anchorOnChain?: boolean     // Store on Solana (optional)
  }
);

// Behind the scenes:
// 1. Transfers funds to provider on Solana
// 2. Provider verifies transaction
// 3. Session created with balance tracking
// 4. Returns active Session object

// Returns: Active Session
// Throws: Error if session creation fails`}
            />
          </div>

          {/* executeRequest */}
          <div className="border-l-4 border-purple pl-6">
            <h3 className="text-lg font-bold mb-2 font-mono">executeRequest()</h3>
            <p className="text-sm text-dark/60 mb-4">Executes request within a Session</p>
            <CodeBlock
              language="typescript"
              code={`const result = await client.executeRequest(
  sessionId: string,
  requestData: any
);

// Returns:
// {
//   data: any,           // API response
//   receipt: Receipt     // Cryptographic proof
// }

// Receipt includes:
// - inputHash (SHA-256)
// - outputHash (SHA-256)
// - latencyMs
// - slaVerification { met: boolean }
// - signature (Ed25519)

// Throws:
// - SessionExpiredError
// - InsufficientFundsError`}
            />
          </div>

          {/* closeSession */}
          <div className="border-l-4 border-purple-dark pl-6">
            <h3 className="text-lg font-bold mb-2 font-mono">closeSession()</h3>
            <p className="text-sm text-dark/60 mb-4">Closes session and receives refund for remaining balance</p>
            <CodeBlock
              language="typescript"
              code={`const refund = await client.closeSession(sessionId: string);

// Returns:
// {
//   refundAmount: number,
//   txSignature: string    // Solana transaction
// }`}
            />
          </div>
        </div>
      </div>

      {/* Complete Example */}
      <div className="mt-12 mb-12">
        <h2 className="text-2xl font-bold mb-6">Complete Example</h2>
        <CodeBlock
          language="typescript"
          title="Complete AI Agent"
          showLineNumbers={true}
          code={`import { Connection, Keypair } from '@solana/web3.js';
import { GistClient } from '@gistplus/client';

async function main() {
  // Setup
  const connection = new Connection('https://api.devnet.solana.com');
  const wallet = Keypair.generate();
  
  // Get free devnet SOL
  await connection.requestAirdrop(wallet.publicKey, 1e9);
  
  const client = new GistClient({ connection, wallet });
  
  // Create Intent
  const intent = client.createIntent({
    capability: 'gpt-4-inference',
    maxPricePerRequest: 0.01,
    token: 'USDC',
    sla: { maxLatencyMs: 2000 }
  });
  
  // Negotiate
  const offer = await client.negotiate(
    'https://ai-api.example.com',
    intent
  );
  
  if (offer.pricePerRequest > intent.maxPricePerRequest) {
    throw new Error('Price too high!');
  }
  
  // Create Session
  const session = await client.createSession(offer, {
    depositAmount: 1.0  // 1 USDC
  });
  
  console.log(\`Session created! Can make \${
    Math.floor(session.remainingBalance / session.pricePerRequest)
  } requests\`);
  
  // Execute multiple requests
  for (let i = 0; i < 5; i++) {
    const result = await client.executeRequest(
      session.sessionId,
      { prompt: \`Request #\${i + 1}\` }
    );
    
    console.log(\`Request \${i + 1}:\`, result.data);
    console.log('SLA met:', result.receipt.slaVerification.met);
  }
  
  // Close session
  const refund = await client.closeSession(session.sessionId);
  console.log('Refunded:', refund.refundAmount, 'USDC');
}

main();`}
        />
      </div>

      {/* Error Handling */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Error Handling</h2>
        <CodeBlock
          language="typescript"
          code={`import { 
  SessionExpiredError, 
  InsufficientFundsError,
  InvalidOfferError 
} from '@gistplus/core';

try {
  const result = await client.executeRequest(sessionId, data);
} catch (error) {
  if (error instanceof SessionExpiredError) {
    console.log('Session expired, creating new one...');
    await createNewSession();
  } else if (error instanceof InsufficientFundsError) {
    console.log('Balance too low, closing and refunding...');
    await client.closeSession(sessionId);
  } else {
    console.error('Unexpected error:', error);
  }
}`}
        />
      </div>

      {/* Next */}
      <div className="bg-purple/5 border-2 border-purple/20 p-6 rounded">
        <div className="text-sm font-bold mb-3">Next Steps</div>
        <div className="space-y-2 text-sm">
          <a href="/docs/api/server" className="block text-purple hover:underline">
            → Check out the Server API for providers
          </a>
          <a href="/docs/guides/agent" className="block text-purple hover:underline">
            → Build a complete AI agent
          </a>
        </div>
      </div>
    </div>
  )
}

