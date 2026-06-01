'use client'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { ChevronDown, Check, Copy } from 'lucide-react'
import { useState } from 'react'

const SNIPPETS = [
  {
    title: 'Intent creation',
    lang: 'typescript',
    code: `import { GistClient } from '@gistplus/client';

const intent = client.createIntent({
  capability: 'gpt-4-inference',
  maxPricePerRequest: 0.01,
  token: 'USDC',
  sla: { maxLatencyMs: 2000 }
});`,
  },
  {
    title: 'Offer negotiation',
    lang: 'typescript',
    code: `const offer = await client.negotiate(
  'https://api.provider.com',
  intent
);

// Returns:
// {
//   pricePerRequest: 0.008,  // 20% discount!
//   sla: { maxLatencyMs: 1500 },
//   signature: "..."  // Ed25519 signed
// }`,
  },
  {
    title: 'Session creation',
    lang: 'typescript',
    code: `const session = await client.createSession(offer, {
  depositAmount: 1.0  // 1 USDC
});

console.log(session.remainingBalance);  // 1.0 USDC
console.log(session.pricePerRequest);   // 0.008
// Can make 125 requests on one deposit!`,
  },
  {
    title: 'Execute request',
    lang: 'typescript',
    code: `const result = await client.executeRequest(
  session.sessionId,
  { prompt: 'Explain quantum computing' }
);

console.log(result.data);     // AI response
console.log(result.receipt);  // Cryptographic proof`,
  },
  {
    title: 'Receipt verification',
    lang: 'typescript',
    code: `import { verifyReceipt } from '@gistplus/core';

const receipt = result.receipt;
verifyReceipt(receipt); // Throws if invalid

if (receipt.slaVerification.met) {
  console.log('SLA met');
} else {
  console.log('Breached — refund:',
    receipt.slaVerification.refundAmount);
}`,
  },
  {
    title: 'Server middleware (Express)',
    lang: 'typescript',
    code: `import { gistMiddleware } from '@gistplus/server';

app.use('/api/*', gistMiddleware({
  connection,
  wallet,
  endpoint: 'https://your-api.com',
  pricing: { basePrice: 0.01, token: 'USDC' },
  sla: { maxLatencyMs: 2000 }
}));

// Every /api/* route is now monetized.`,
  },
  {
    title: 'Auto receipt generation',
    lang: 'typescript',
    code: `app.post('/api/inference', async (req, res) => {
  const result = await runInference(req.body);

  // Middleware auto-signs the receipt
  return res.gistReceipt?.(result);

  // Receipt includes:
  // - Ed25519 signature
  // - SHA-256 input/output hashes
  // - SLA verification
});`,
  },
  {
    title: 'Dynamic pricing',
    lang: 'typescript',
    code: `import { LoadBasedPricingStrategy } from '@gistplus/server';

const pricing = new LoadBasedPricingStrategy(
  0.01,   // base price
  'USDC',
  () => getCurrentLoad()  // returns 0-1
);

// 0% load  -> $0.01
// 50% load -> $0.015
// 100% load -> $0.02`,
  },
  {
    title: 'On-chain anchoring',
    lang: 'rust',
    code: `// Anchor a receipt to Solana
pub fn anchor_receipt(
    ctx: Context<AnchorReceipt>,
    receipt_id: String,
    session_id: String,
    input_hash: String,
    output_hash: String,
    sla_met: bool,
) -> Result<()> {
    let receipt = &mut ctx.accounts.receipt;
    receipt.receipt_id = receipt_id;
    receipt.session_id = session_id;
    receipt.sla_met = sla_met;
    Ok(())
}`,
  },
  {
    title: 'Multi-provider routing',
    lang: 'typescript',
    code: `// Get offers from multiple providers
const offers = await Promise.all(
  providers.map(p => client.negotiate(p, intent))
);

// Pick the cheapest
const best = offers.sort(
  (a, b) => a.pricePerRequest - b.pricePerRequest
)[0];

// Agent auto-routes to the best deal.`,
  },
]

export default function CodeSnippets() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const copy = (code: string, index: number) => {
    navigator.clipboard.writeText(code)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <section id="examples" className="relative px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12">
          <div className="flex items-center gap-3">
            <span className="eyebrow">Code examples</span>
            <span className="accent-bar" />
          </div>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight">
            From intent to receipt in{' '}
            <span className="text-gradient">a few lines</span>
          </h2>
        </div>

        <div className="space-y-2.5">
          {SNIPPETS.map((snippet, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={snippet.title}
                className="panel overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="group flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs font-bold text-gradient">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-display text-sm font-semibold text-ink">
                      {snippet.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {isOpen && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation()
                          copy(snippet.code, i)
                        }}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-muted transition-all hover:border-violet/40 hover:text-ink"
                      >
                        {copiedIndex === i ? (
                          <>
                            <Check size={12} className="text-cyan" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy size={12} /> Copy
                          </>
                        )}
                      </span>
                    )}
                    <ChevronDown
                      size={18}
                      className={`text-muted transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-violet' : ''
                      }`}
                    />
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-[640px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="border-t border-white/10">
                    <SyntaxHighlighter
                      language={snippet.lang}
                      style={oneDark}
                      customStyle={{
                        margin: 0,
                        padding: '22px',
                        background: 'transparent',
                        fontSize: '13px',
                        lineHeight: '1.7',
                      }}
                      codeTagProps={{
                        style: {
                          fontFamily: 'var(--font-jetbrains-mono), monospace',
                        },
                      }}
                    >
                      {snippet.code}
                    </SyntaxHighlighter>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Click any example to expand, copy, and drop into your project.
        </p>
      </div>
    </section>
  )
}
