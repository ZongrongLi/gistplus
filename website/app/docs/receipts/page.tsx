import CodeBlock from '@/components/CodeBlock'

export default function ReceiptsPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">Cryptographic Receipts</h1>
      <p className="text-lg text-dark/60 mb-12">
        Verifiable proof of every transaction with signatures and hashes
      </p>

      {/* What is a Receipt */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">What is a Receipt?</h2>
        
        <p className="text-dark/70 mb-6 leading-relaxed">
          Every request in Gist Plus generates a <strong>cryptographically signed receipt</strong> that proves:
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="border-2 border-purple/20 bg-purple/5 p-4 rounded">
            <div className="text-sm font-bold mb-2">✓ Work Was Done</div>
            <div className="text-xs text-dark/70">Provider's Ed25519 signature proves they processed the request</div>
          </div>
          <div className="border-2 border-purple/20 bg-purple/5 p-4 rounded">
            <div className="text-sm font-bold mb-2">✓ Data Integrity</div>
            <div className="text-xs text-dark/70">SHA-256 hashes prove input/output weren't tampered</div>
          </div>
          <div className="border-2 border-purple/20 bg-purple/5 p-4 rounded">
            <div className="text-sm font-bold mb-2">✓ SLA Compliance</div>
            <div className="text-xs text-dark/70">Automatic verification of latency and quality metrics</div>
          </div>
          <div className="border-2 border-purple/20 bg-purple/5 p-4 rounded">
            <div className="text-sm font-bold mb-2">✓ Fair Charges</div>
            <div className="text-xs text-dark/70">Receipt shows exactly what was charged</div>
          </div>
        </div>
      </div>

      {/* Receipt Structure */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Receipt Structure</h2>
        
        <CodeBlock
          language="typescript"
          code={`interface Receipt {
  // Identity
  receiptId: string;
  sessionId: string;
  requestNumber: number;         // Sequence in session
  
  // Cryptographic Proof
  inputHash: string;             // SHA-256 of input
  outputHash: string;            // SHA-256 of output
  signature: string;             // Ed25519 signature
  
  // Timing
  requestStartedAt: number;      // Start timestamp
  requestCompletedAt: number;    // End timestamp
  latencyMs: number;             // Actual latency
  
  // Financial
  amountCharged: number;         // Amount deducted
  
  // SLA Verification
  slaVerification: {
    met: boolean,                // Was SLA met?
    metrics: {
      latency?: {
        expected: number,
        actual: number,
        met: boolean
      }
    },
    refundAmount?: number        // If breached
  },
  
  // Provider
  providerPubkey: string;        // Who created this
  
  // Optional
  pdaAddress?: string;           // On-chain anchor
  metadata?: Record<string, any>;
}`}
        />
      </div>

      {/* Verification Process */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Verification Process</h2>

        <div className="border-2 border-dark/20 bg-panel-2 p-6 mb-4">
          <pre className="font-mono text-xs leading-relaxed overflow-x-auto">
{`Receipt Verification Steps:
───────────────────────────

1. SIGNATURE VERIFICATION
   ┌──────────────────────────────────────┐
   │ Extract signature from receipt       │
   │ Remove signature field               │
   │ Serialize remaining fields to JSON   │
   │ Hash with SHA-256                    │
   │ Verify Ed25519 signature             │
   │   → Valid = Provider signed this ✓   │
   └──────────────────────────────────────┘

2. DATA INTEGRITY CHECK
   ┌──────────────────────────────────────┐
   │ Hash original input with SHA-256     │
   │ Compare to receipt.inputHash         │
   │   → Match = Input not tampered ✓     │
   │                                      │
   │ Hash original output with SHA-256    │
   │ Compare to receipt.outputHash        │
   │   → Match = Output not tampered ✓    │
   └──────────────────────────────────────┘

3. SLA VERIFICATION
   ┌──────────────────────────────────────┐
   │ Check latencyMs <= sla.maxLatencyMs  │
   │   → If yes: SLA met ✓                │
   │   → If no: Refund triggered          │
   └──────────────────────────────────────┘

4. TIMESTAMP VALIDATION
   ┌──────────────────────────────────────┐
   │ Verify completedAt > startedAt       │
   │ Verify latency = completed - started │
   │   → Prevents time manipulation ✓     │
   └──────────────────────────────────────┘`}
          </pre>
        </div>

        <CodeBlock
          language="typescript"
          title="Verifying a Receipt"
          code={`import { verifyReceipt, verifyReceiptHashes } from '@gistplus/core';

// 1. Verify signature
try {
  verifyReceipt(receipt);
  console.log('✓ Signature valid');
} catch (error) {
  console.error('✗ Invalid signature!');
  throw error;
}

// 2. Verify data integrity
const hashesValid = verifyReceiptHashes(
  receipt,
  originalInput,
  originalOutput
);

if (!hashesValid) {
  console.error('✗ Data tampered!');
  throw new Error('Receipt hashes dont match');
}

// 3. Check SLA
if (!receipt.slaVerification.met) {
  console.log('⚠ SLA breached');
  console.log('Refund amount:', receipt.slaVerification.refundAmount);
}

console.log('✓ Receipt fully verified');`}
        />
      </div>

      {/* SLA Refunds */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Automatic SLA Refunds</h2>

        <CodeBlock
          language="typescript"
          code={`// Scenario: SLA requires <2000ms, but request took 3500ms

const receipt = {
  latencyMs: 3500,
  amountCharged: 0.008,
  slaVerification: {
    met: false,                    // SLA breached!
    metrics: {
      latency: {
        expected: 2000,
        actual: 3500,
        met: false
      }
    },
    refundAmount: 0.004            // 50% refund for breach
  }
};

// Agent automatically gets 0.004 USDC refund
// Balance: 0.996 → 1.0 (refund applied)
// Only paid 0.004 instead of 0.008

// Fair and automatic!`}
        />
      </div>

      {/* On-Chain Anchoring */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">On-Chain Anchoring</h2>
        <p className="text-dark/70 mb-4">
          Optionally anchor receipts to Solana for permanent, immutable proof.
        </p>

        <CodeBlock
          language="rust"
          title="Solana Program (Anchor)"
          code={`pub fn anchor_receipt(
    ctx: Context<AnchorReceipt>,
    receipt_id: String,
    session_id: String,
    input_hash: String,
    output_hash: String,
    latency_ms: u64,
    sla_met: bool,
) -> Result<()> {
    let receipt = &mut ctx.accounts.receipt;
    
    receipt.receipt_id = receipt_id;
    receipt.session_id = session_id;
    receipt.input_hash = input_hash;
    receipt.output_hash = output_hash;
    receipt.latency_ms = latency_ms;
    receipt.sla_met = sla_met;
    receipt.timestamp = Clock::get()?.unix_timestamp;
    
    msg!("Receipt anchored: {}", receipt.receipt_id);
    Ok(())
}`}
        />
      </div>
    </div>
  )
}

