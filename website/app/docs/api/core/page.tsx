import CodeBlock from '@/components/CodeBlock'
import NpmPackageLink from '@/components/NpmPackageLink'

export default function CoreAPIPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">@gistplus/core</h1>
      <p className="text-lg text-dark/60 mb-3">
        Core protocol primitives, types, and cryptographic functions
      </p>
      <div className="mb-12">
        <NpmPackageLink name="@gistplus/core" />
      </div>

      {/* Functions */}
      <div className="space-y-12">
        <div>
          <h2 className="text-2xl font-bold mb-6">Core Functions</h2>

          <div className="space-y-8">
            <div className="border-l-4 border-purple pl-6">
              <h3 className="text-lg font-mono font-bold mb-2">createIntent()</h3>
              <CodeBlock
                language="typescript"
                code={`import { createIntent } from '@gistplus/core';

const intent = createIntent({
  capability: string,
  maxPricePerRequest: number,
  token: 'SOL' | 'USDC' | 'USDT' | 'BONK',
  agentPubkey: string | PublicKey,
  sla?: SLA,
  metadata?: Record<string, any>
});`}
              />
            </div>

            <div className="border-l-4 border-blue pl-6">
              <h3 className="text-lg font-mono font-bold mb-2">createOffer()</h3>
              <CodeBlock
                language="typescript"
                code={`import { createOffer } from '@gistplus/core';

const offer = createOffer({
  intent: Intent,
  providerPubkey: string | PublicKey,
  pricePerRequest: number,
  sla: SLA,
  sessionDurationMs: number,
  endpoint: string
}, providerKeypair);  // Signs with Ed25519`}
              />
            </div>

            <div className="border-l-4 border-purple-dark pl-6">
              <h3 className="text-lg font-mono font-bold mb-2">verifyOffer()</h3>
              <CodeBlock
                language="typescript"
                code={`import { verifyOffer } from '@gistplus/core';

// Throws if invalid
verifyOffer(offer);

// Verifies:
// ✓ Signature is valid
// ✓ Offer hasn't expired
// ✓ All required fields present`}
              />
            </div>

            <div className="border-l-4 border-blue-dark pl-6">
              <h3 className="text-lg font-mono font-bold mb-2">createReceipt()</h3>
              <CodeBlock
                language="typescript"
                code={`import { createReceipt } from '@gistplus/core';

const receipt = createReceipt({
  session: Session,
  requestNumber: number,
  inputData: any,
  outputData: any,
  requestStartedAt: number,
  requestCompletedAt: number,
  amountCharged: number
}, providerKeypair);  // Signs with Ed25519`}
              />
            </div>

            <div className="border-l-4 border-purple pl-6">
              <h3 className="text-lg font-mono font-bold mb-2">verifyReceipt()</h3>
              <CodeBlock
                language="typescript"
                code={`import { verifyReceipt } from '@gistplus/core';

// Throws if invalid
verifyReceipt(receipt);

// Verifies:
// ✓ Ed25519 signature valid
// ✓ Signed by correct provider
// ✓ Timestamps valid`}
              />
            </div>
          </div>
        </div>

        {/* Cryptography */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Cryptographic Functions</h2>

          <CodeBlock
            language="typescript"
            code={`import {
  signMessage,
  verifySignature,
  hashObject,
  hashString,
  createSignableMessage
} from '@gistplus/core';

// Sign a message
const signature = signMessage(message, keypair);

// Verify signature
const valid = verifySignature(message, signature, publicKey);

// Hash an object (canonical JSON + SHA-256)
const hash = hashObject({ foo: 'bar' });

// Hash a string
const stringHash = hashString('hello world');

// Create signable message from object
const message = createSignableMessage(offer);`}
          />
        </div>

        {/* Constants */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Constants</h2>

          <CodeBlock
            language="typescript"
            code={`import {
  PROTOCOL_VERSION,
  HTTP_STATUS,
  HEADERS,
  SUPPORTED_TOKENS,
  TOKEN_MINTS
} from '@gistplus/core';

console.log(PROTOCOL_VERSION);  // "0.1.0"

console.log(HTTP_STATUS.PAYMENT_REQUIRED);  // 402
console.log(HTTP_STATUS.SESSION_STARTED);   // 201

console.log(HEADERS.INTENT);      // "X-Gist-Intent"
console.log(HEADERS.OFFER);       // "X-Gist-Offer"
console.log(HEADERS.SESSION_ID);  // "X-Gist-Session-Id"
console.log(HEADERS.RECEIPT);     // "X-Gist-Receipt"

console.log(SUPPORTED_TOKENS);    // ['SOL', 'USDC', 'USDT', 'BONK']

console.log(TOKEN_MINTS.USDC);
// "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"`}
          />
        </div>

        {/* Networks */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Network Configuration</h2>

          <CodeBlock
            language="typescript"
            code={`import { 
  getNetworkConfig,
  getRpcUrl,
  getExplorerUrl
} from '@gistplus/core';

// Get network config
const config = getNetworkConfig('devnet');
console.log(config.rpcUrl);

// Get RPC URL
const rpc = getRpcUrl('mainnet-beta');

// Get explorer URL for transaction
const explorerUrl = getExplorerUrl(txSignature, 'devnet');
// https://explorer.solana.com/tx/ABC...?cluster=devnet`}
          />
        </div>
      </div>
    </div>
  )
}

