import CodeBlock from '@/components/CodeBlock'

export default function SecurityPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">Security Best Practices</h1>
      <p className="text-lg text-dark/60 mb-12">
        Keep your Gist Plus deployment secure
      </p>

      {/* Key Management */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Private Key Management</h2>

        <div className="space-y-6">
          <div className="border-2 border-red-500/20 bg-red-50 p-6 rounded">
            <div className="text-sm font-bold mb-3 text-red-800">❌ DON'T DO THIS</div>
            <CodeBlock
              language="typescript"
              code={`// NEVER hardcode private keys
const wallet = Keypair.fromSecretKey(
  new Uint8Array([1,2,3,4,5...])  // DON'T!
);`}
            />
          </div>

          <div className="border-2 border-green-500/20 bg-green-50 p-6 rounded">
            <div className="text-sm font-bold mb-3 text-green-800">✅ DO THIS</div>
            <CodeBlock
              language="typescript"
              code={`// Load from environment
const privateKey = process.env.WALLET_PRIVATE_KEY;
const secretKey = Buffer.from(privateKey, 'base64');
const wallet = Keypair.fromSecretKey(secretKey);

// For production: Use hardware wallet or KMS`}
            />
          </div>
        </div>
      </div>

      {/* Signature Verification */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Always Verify Signatures</h2>

        <CodeBlock
          language="typescript"
          code={`import { verifyOffer, verifyReceipt } from '@gistplus/core';

// ALWAYS verify offers before accepting
try {
  verifyOffer(offer);
  // Signature valid ✓
} catch (error) {
  // Signature invalid - offer tampered!
  throw new Error('Invalid offer');
}

// ALWAYS verify receipts
try {
  verifyReceipt(receipt);
  // Receipt authentic ✓
} catch (error) {
  // Receipt forged!
  throw new Error('Invalid receipt');
}`}
        />
      </div>

      {/* HTTPS Only */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Use HTTPS</h2>

        <CodeBlock
          language="typescript"
          code={`// Production: Enforce HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' 
      && process.env.NODE_ENV === 'production') {
    res.redirect(\`https://\${req.header('host')}\${req.url}\`);
  } else {
    next();
  }
});`}
        />
      </div>

      {/* Rate Limiting */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Rate Limiting</h2>

        <CodeBlock
          language="typescript"
          code={`import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100  // 100 requests per window
});

app.use('/api/*', limiter);`}
        />
      </div>
    </div>
  )
}

