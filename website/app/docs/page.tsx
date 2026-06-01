'use client'

import Link from 'next/link'
import CodeBlock from '@/components/CodeBlock'

const FLOW = [
  { step: '01', title: 'Agent creates Intent', desc: 'Express needs, max price, SLA requirements' },
  { step: '02', title: 'Provider sends Offer', desc: 'Actual price, SLA guarantees, Ed25519 signature' },
  { step: '03', title: 'Agent creates Session', desc: 'Deposits funds on Solana (1 blockchain tx)' },
  { step: '04', title: 'Agent makes requests', desc: '100+ requests, all off-chain, auto-deducted' },
  { step: '05', title: 'Agent closes Session', desc: 'Refund for the remaining balance (1 blockchain tx)' },
]

export default function DocsHome() {
  return (
    <div className="max-w-4xl">
      <div className="mb-12">
        <span className="pill mb-5">Documentation</span>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Gist Plus <span className="text-gradient">Documentation</span>
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          The complete guide to building autonomous AI commerce systems with the
          Gist Plus protocol.
        </p>

        {/* Why Gist Plus */}
        <div className="mt-8 panel p-6">
          <h2 className="font-display text-lg font-bold">
            Why Gist Plus over per-request payments?
          </h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted">
            <p>
              <strong className="text-ink">Legacy per-request flows</strong>{' '}
              pioneered using HTTP 402 “Payment Required” for blockchain-based
              API payments. They work, but every request requires its own
              blockchain transaction — slow and expensive at scale.
            </p>
            <p>
              <strong className="text-ink">Gist Plus</strong> fixes this with{' '}
              <strong className="text-ink">prepaid sessions</strong>. Instead of
              100 transactions for 100 requests, Gist Plus uses just two: one to
              open the session, one to close it. Everything in between happens
              off-chain with automatic balance tracking.
            </p>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-4 border-t border-white/10 pt-5">
            {[
              { v: '3.5×', l: 'Cheaper' },
              { v: '6×', l: 'Faster' },
              { v: '50×', l: 'Fewer txs' },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display text-2xl font-bold text-gradient">
                  {s.v}
                </div>
                <div className="text-xs text-muted">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Protocol flow */}
      <div className="mb-12">
        <h2 className="mb-6 font-display text-2xl font-bold">
          Complete protocol flow
        </h2>
        <div className="space-y-3">
          {FLOW.map((item) => (
            <div
              key={item.step}
              className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-gradient font-mono text-xs font-bold text-white">
                {item.step}
              </div>
              <div>
                <div className="font-semibold text-ink">{item.title}</div>
                <div className="mt-0.5 text-sm text-muted">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-xl border border-violet/20 bg-violet/[0.06] p-4 text-sm text-muted">
          <strong className="text-ink">Key insight:</strong> only steps 03 and
          05 touch the blockchain. Step 04 — all the requests — happens off-chain
          with instant balance deduction. That is why Gist Plus is 50× more
          efficient.
        </div>
      </div>

      {/* Quick install */}
      <div className="mb-12">
        <h2 className="mb-6 font-display text-2xl font-bold">Quick install</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-sm font-semibold text-ink">
              For AI agents
            </div>
            <CodeBlock language="bash" code="npm install @gistplus/client" />
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold text-ink">
              For API providers
            </div>
            <CodeBlock language="bash" code="npm install @gistplus/server" />
          </div>
        </div>
      </div>

      {/* First agent */}
      <div className="mb-12">
        <h2 className="mb-6 font-display text-2xl font-bold">Your first agent</h2>
        <CodeBlock
          language="typescript"
          code={`import { GistClient } from '@gistplus/client';

const client = new GistClient({ connection, wallet });

// 1. Express your needs
const intent = client.createIntent({
  capability: 'gpt-4-inference',
  maxPricePerRequest: 0.01,
  token: 'USDC',
});

// 2. Negotiate
const offer = await client.negotiate(
  'https://api.provider.com',
  intent
);

// 3. Create a session
const session = await client.createSession(offer);

// 4. Execute (payment is automatic)
const result = await client.executeRequest(
  session.sessionId,
  { prompt: 'Hello AI!' }
);

console.log(result.data);     // Response
console.log(result.receipt);  // Proof`}
        />
      </div>

      {/* Quick links */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/docs/quickstart" className="panel panel-hover group p-6">
          <div className="font-display text-lg font-semibold text-ink transition-colors group-hover:text-gradient">
            Quick Start →
          </div>
          <div className="mt-1 text-sm text-muted">Get running in 5 minutes</div>
        </Link>
        <Link href="/docs/protocol" className="panel panel-hover group p-6">
          <div className="font-display text-lg font-semibold text-ink transition-colors group-hover:text-gradient">
            Protocol Overview →
          </div>
          <div className="mt-1 text-sm text-muted">
            Understand the architecture
          </div>
        </Link>
      </div>
    </div>
  )
}
