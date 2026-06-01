import CodeBlock from '@/components/CodeBlock'

export default function SessionsPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">Sessions</h1>
      <p className="text-lg text-dark/60 mb-12">
        Prepaid channels that enable efficient multi-request transactions
      </p>

      {/* What is a Session */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">What is a Session?</h2>
        
        <p className="text-dark/70 mb-6 leading-relaxed">
          A Session is a <strong>prepaid channel</strong> between an agent and provider. Instead of paying for each request individually, 
          the agent deposits funds once and can make multiple requests with automatic balance deduction.
        </p>

        <div className="border-2 border-purple/20 bg-purple/5 p-6 rounded mb-6">
          <div className="text-sm font-bold mb-3">💡 Key Benefit</div>
          <div className="text-sm leading-relaxed">
            <strong>50x fewer blockchain transactions!</strong> One session creation tx + one close tx = supports 100+ requests.
            Traditional per-request model would need 100 transactions.
          </div>
        </div>
      </div>

      {/* Session Lifecycle */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Session States</h2>
        
        <div className="space-y-3">
          <div className="p-4 border-l-4 border-purple bg-purple/5">
            <div className="font-bold mb-1">ACTIVE</div>
            <div className="text-sm text-dark/60">Session is live, balance sufficient, can make requests</div>
          </div>
          <div className="p-4 border-l-4 border-blue bg-blue/5">
            <div className="font-bold mb-1">DEPLETED</div>
            <div className="text-sm text-dark/60">Balance too low for another request, needs refill or close</div>
          </div>
          <div className="p-4 border-l-4 border-purple-dark bg-purple-dark/5">
            <div className="font-bold mb-1">EXPIRED</div>
            <div className="text-sm text-dark/60">Time limit reached, can no longer make requests</div>
          </div>
          <div className="p-4 border-l-4 border-blue-dark bg-blue-dark/5">
            <div className="font-bold mb-1">REFUNDED</div>
            <div className="text-sm text-dark/60">Session closed, remaining balance returned to agent</div>
          </div>
        </div>
      </div>

      {/* State Transitions */}
      <div className="mb-12 border-2 border-dark/20 bg-panel-2 p-6">
        <div className="text-xs uppercase tracking-wider font-bold mb-4 opacity-50">
          STATE TRANSITIONS
        </div>
        <pre className="font-mono text-[11px] leading-relaxed overflow-x-auto text-dark/70">
          {`State Diagram:
─────────────

         ┌─────────┐
         │ PENDING │ (Initial creation)
         └────┬────┘
              │
         ┌────▼────┐
    ┌───►  ACTIVE  ├───┐
    │    └────┬────┘   │
    │         │        │
    │         │        │
Refill   ┌───▼───┐    │ Depleted
    │    │DEPLETED│◄───┘
    └────┤        │
         └───┬────┘
             │
         ┌───▼────┐
         │EXPIRED │ (Time limit reached)
         └───┬────┘
             │
         ┌───▼────┐
         │REFUNDED│ (Closed & refunded)
         └────────┘

State Transitions:
──────────────────
PENDING  → ACTIVE    (on successful creation)
ACTIVE   → DEPLETED  (balance < pricePerRequest)
ACTIVE   → EXPIRED   (current time > expiresAt)
DEPLETED → REFUNDED  (on close)
EXPIRED  → REFUNDED  (on close)
ACTIVE   → REFUNDED  (on manual close)`}
        </pre>
      </div>

      {/* Session Structure */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Session Structure</h2>
        
        <CodeBlock
          language="typescript"
          code={`interface Session {
  // Identity
  sessionId: string;
  offerId: string;              // Based on accepted Offer
  agentPubkey: string;
  providerPubkey: string;
  
  // Financial
  token: SupportedToken;
  depositAmount: number;         // Initially deposited
  remainingBalance: number;      // Current balance
  pricePerRequest: number;       // Cost per request
  
  // Timing
  startedAt: number;             // Creation timestamp
  expiresAt: number;             // Expiration timestamp
  
  // Guarantees
  sla: SLA;                      // SLA terms
  
  // State
  state: SessionState;           // Current state
  requestCount: number;          // Requests made
  
  // Optional On-Chain
  creationTxSignature?: string;  // Solana tx
  pdaAddress?: string;           // On-chain PDA
  
  metadata?: Record<string, any>;
}`}
        />
      </div>

      {/* Balance Management */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Balance Management</h2>

        <CodeBlock
          language="typescript"
          title="How Balance Works"
          code={`// Initial state
const session = {
  depositAmount: 1.0,        // Deposited 1 USDC
  remainingBalance: 1.0,     // Full balance
  pricePerRequest: 0.008,    // Each request costs 0.008
  requestCount: 0
};

// After Request #1
session.remainingBalance = 0.992;  // 1.0 - 0.008
session.requestCount = 1;

// After Request #2  
session.remainingBalance = 0.984;  // 0.992 - 0.008
session.requestCount = 2;

// ... continues ...

// After Request #125
session.remainingBalance = 0;      // Depleted!
session.requestCount = 125;
session.state = "depleted";

// Total requests possible:
Math.floor(depositAmount / pricePerRequest)
// = Math.floor(1.0 / 0.008)
// = 125 requests`}
        />
      </div>

      {/* Session Creation */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Creating a Session</h2>

        <div className="border-2 border-dark/20 bg-panel-2 p-6 mb-4">
          <div className="text-xs uppercase tracking-wider font-bold mb-4 opacity-50">
            SESSION CREATION FLOW
          </div>
          <div className="text-sm space-y-3">
            <div className="flex items-start gap-3">
              <div className="font-bold text-purple">1.</div>
              <div>Agent calls createSession() and transfers funds to provider on Solana</div>
            </div>
            <div className="flex items-start gap-3">
              <div className="font-bold text-blue">2.</div>
              <div>Provider waits for transaction confirmation</div>
            </div>
            <div className="flex items-start gap-3">
              <div className="font-bold text-purple-dark">3.</div>
              <div>Provider verifies correct amount and sender</div>
            </div>
            <div className="flex items-start gap-3">
              <div className="font-bold text-blue-dark">4.</div>
              <div>Provider creates Session object with balance tracking</div>
            </div>
            <div className="flex items-start gap-3">
              <div className="font-bold text-purple">5.</div>
              <div>Session returned to agent - ready to make requests!</div>
            </div>
          </div>
        </div>

        <CodeBlock
          language="typescript"
          code={`const session = await client.createSession(offer, {
  depositAmount: 1.0,      // How much to deposit
  anchorOnChain: true      // Optional: store on Solana
});

// What happens:
// 1. Agent transfers 1.0 USDC to provider on Solana
// 2. Provider waits for transaction confirmation
// 3. Provider verifies amount and sender
// 4. Provider creates Session object
// 5. Session returned to agent
// 6. Agent can now make requests!`}
        />
      </div>

      {/* Session Monitoring */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Monitoring Sessions</h2>

        <CodeBlock
          language="typescript"
          code={`// Check session status
const session = client.getSession(sessionId);

console.log('Balance:', session.remainingBalance);
console.log('Requests made:', session.requestCount);
console.log('Requests remaining:', 
  Math.floor(session.remainingBalance / session.pricePerRequest)
);
console.log('Expires:', new Date(session.expiresAt));
console.log('State:', session.state);

// Auto-refill when low
if (session.remainingBalance < 0.01) {
  console.log('Low balance, closing and creating new session...');
  await client.closeSession(sessionId);
  await createNewSession();
}`}
        />
      </div>

      {/* Session Closure */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Closing Sessions</h2>

        <CodeBlock
          language="typescript"
          title="Close Session & Get Refund"
          code={`const refund = await client.closeSession(sessionId);

console.log('Refunded:', refund.refundAmount, session.token);
console.log('Transaction:', refund.txSignature);

// Example calculation:
// Deposit: 1.0 USDC
// Used: 0.24 USDC (30 requests × 0.008)
// Refund: 0.76 USDC

// Refund is automatic and fair!`}
        />
      </div>
    </div>
  )
}

