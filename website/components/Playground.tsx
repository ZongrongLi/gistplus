'use client'

import { useState } from 'react'
import { Play, Loader } from 'lucide-react'

type PackageTab = 'core' | 'client' | 'server' | 'gateway' | 'indexer'

export default function Playground() {
  const [activePackage, setActivePackage] = useState<PackageTab>('client')
  const [output, setOutput] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<any>(null)

  const [clientUrl, setClientUrl] = useState('http://localhost:3000/api/weather')
  const [coreMaxPrice, setCoreMaxPrice] = useState('0.01')
  const [serverPort, setServerPort] = useState('3000')

  const addLog = (msg: string) => setOutput((prev) => [...prev, msg])
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

  const testCore = async () => {
    setOutput([])
    setResult(null)
    setIsRunning(true)
    try {
      addLog('Testing @gistplus/core...')
      addLog('')
      addLog('→ Creating Intent...')
      await sleep(300)
      const intent = {
        intentId: `intent_${Date.now()}`,
        capability: 'test-api',
        maxPricePerRequest: parseFloat(coreMaxPrice),
        token: 'USDC',
        agentPubkey: 'Agent_' + Math.random().toString(36).substr(2, 9),
        sla: { maxLatencyMs: 2000 },
      }
      addLog('  ✓ Intent created')
      await sleep(300)
      addLog('→ Validating Intent...')
      await sleep(200)
      addLog('  ✓ Validation passed')
      await sleep(300)
      addLog('→ Creating Offer (simulation)...')
      await sleep(300)
      const offer = {
        offerId: `offer_${Date.now()}`,
        intentId: intent.intentId,
        pricePerRequest: parseFloat(coreMaxPrice) * 0.8,
        token: 'USDC',
        sla: { maxLatencyMs: 1500 },
        signature: 'ed25519_' + Math.random().toString(36).substr(2, 20),
      }
      addLog('  ✓ Offer created and signed')
      await sleep(300)
      addLog('✓ Core functions working!')
      setResult({ intent, offer })
    } catch (err: any) {
      addLog(`✗ Error: ${err.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const testClient = async () => {
    setOutput([])
    setResult(null)
    setIsRunning(true)
    try {
      addLog('Testing @gistplus/client...')
      addLog('')
      addLog('→ Creating Intent...')
      await sleep(300)
      const intent = {
        intentId: `intent_${Date.now()}`,
        capability: 'weather-api',
        maxPricePerRequest: 0.01,
        token: 'USDC',
        agentPubkey: 'TestAgent123',
        sla: { maxLatencyMs: 2000 },
      }
      addLog('  ✓ Intent created')
      await sleep(300)
      addLog(`→ Negotiating with ${clientUrl}...`)
      await sleep(300)
      const response = await fetch(clientUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gist-Intent': JSON.stringify(intent),
        },
        body: JSON.stringify({ city: 'New York' }),
      })
      if (response.status === 402) {
        const offerHeader = response.headers.get('x-gist-offer')
        if (offerHeader) {
          const offer = JSON.parse(offerHeader)
          addLog('  ✓ Offer received')
          addLog(`  Price: ${offer.pricePerRequest} ${offer.token}`)
          addLog(`  SLA: <${offer.sla?.maxLatencyMs}ms`)
          await sleep(300)
          addLog('→ Would create session here')
          addLog('  (Requires Solana wallet with funds)')
          await sleep(300)
          addLog('✓ Client negotiation successful!')
          setResult({ intent, offer })
        } else {
          throw new Error('No offer in response')
        }
      } else {
        throw new Error(`Expected 402, got ${response.status}`)
      }
    } catch (err: any) {
      addLog(`✗ Error: ${err.message}`)
      addLog('Make sure a provider is running.')
    } finally {
      setIsRunning(false)
    }
  }

  const testServer = async () => {
    setOutput([])
    setResult(null)
    setIsRunning(true)
    try {
      addLog('Testing @gistplus/server...')
      addLog('')
      addLog('→ Simulating middleware setup...')
      await sleep(300)
      const config = {
        pricing: { basePrice: 0.01, token: 'USDC' },
        sla: { maxLatencyMs: 2000 },
        endpoint: `http://localhost:${serverPort}`,
      }
      addLog('  ✓ Middleware configured')
      await sleep(300)
      addLog('→ Simulating Intent request...')
      await sleep(300)
      addLog('  ✓ Would return 402 with Offer')
      await sleep(300)
      addLog('→ Simulating session request...')
      await sleep(300)
      addLog('  ✓ Would validate session')
      addLog('  ✓ Would generate receipt')
      await sleep(300)
      addLog('✓ Server middleware ready!')
      setResult(config)
    } catch (err: any) {
      addLog(`✗ Error: ${err.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const testGateway = async () => {
    setOutput([])
    setResult(null)
    setIsRunning(true)
    try {
      addLog('Testing @gistplus/gateway...')
      addLog('')
      addLog('→ Creating mock receipt...')
      await sleep(300)
      const receipt = {
        receiptId: `receipt_${Date.now()}`,
        sessionId: 'session_test',
        inputHash: 'sha256_' + Math.random().toString(36).substr(2, 16),
        outputHash: 'sha256_' + Math.random().toString(36).substr(2, 16),
        latencyMs: 1234,
        slaVerification: { met: true },
        signature: 'ed25519_mock',
      }
      addLog('  ✓ Receipt created')
      await sleep(300)
      addLog('→ Verifying receipt signature...')
      await sleep(400)
      addLog('  ✓ Signature valid')
      await sleep(300)
      addLog('→ Checking SLA compliance...')
      await sleep(300)
      addLog('  ✓ SLA met (1234ms < 2000ms)')
      await sleep(300)
      addLog('✓ Gateway verification complete!')
      setResult(receipt)
    } catch (err: any) {
      addLog(`✗ Error: ${err.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const testIndexer = async () => {
    setOutput([])
    setResult(null)
    setIsRunning(true)
    try {
      addLog('Testing @gistplus/indexer...')
      addLog('')
      addLog('→ Simulating receipt indexing...')
      await sleep(300)
      const receipts = [
        { slaVerification: { met: true }, latencyMs: 1200 },
        { slaVerification: { met: true }, latencyMs: 1500 },
        { slaVerification: { met: false }, latencyMs: 2500 },
        { slaVerification: { met: true }, latencyMs: 1100 },
      ]
      addLog(`  ✓ Indexed ${receipts.length} receipts`)
      await sleep(300)
      addLog('→ Calculating provider reputation...')
      await sleep(400)
      const slaCompliance =
        receipts.filter((r) => r.slaVerification.met).length / receipts.length
      const score = Math.round(slaCompliance * 100)
      addLog(`  ✓ SLA Compliance: ${(slaCompliance * 100).toFixed(1)}%`)
      addLog(`  ✓ Reputation Score: ${score}/100`)
      await sleep(300)
      addLog('→ Generating analytics...')
      await sleep(300)
      const avgLatency =
        receipts.reduce((sum, r) => sum + r.latencyMs, 0) / receipts.length
      addLog(`  ✓ Avg Latency: ${avgLatency.toFixed(0)}ms`)
      await sleep(300)
      addLog('✓ Indexer analytics complete!')
      setResult({ score, slaCompliance, avgLatency, receiptsIndexed: receipts.length })
    } catch (err: any) {
      addLog(`✗ Error: ${err.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const runTest = () => {
    switch (activePackage) {
      case 'core':
        return testCore()
      case 'client':
        return testClient()
      case 'server':
        return testServer()
      case 'gateway':
        return testGateway()
      case 'indexer':
        return testIndexer()
    }
  }

  const packages = [
    { id: 'core' as PackageTab, name: 'Core', desc: 'Protocol primitives' },
    { id: 'client' as PackageTab, name: 'Client', desc: 'For AI agents' },
    { id: 'server' as PackageTab, name: 'Server', desc: 'For providers' },
    { id: 'gateway' as PackageTab, name: 'Gateway', desc: 'Verification' },
    { id: 'indexer' as PackageTab, name: 'Indexer', desc: 'Analytics' },
  ]

  return (
    <section id="playground" className="relative px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <span className="eyebrow">Interactive playground</span>
            <span className="accent-bar" />
          </div>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight">
            Run every package{' '}
            <span className="text-gradient">in your browser</span>
          </h2>
          <p className="mt-3 text-muted">
            Test each package interactively and watch the protocol work in
            real time.
          </p>
        </div>

        {/* Package tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {packages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => {
                setActivePackage(pkg.id)
                setOutput([])
                setResult(null)
              }}
              className={`rounded-xl border px-5 py-2.5 text-left transition-all ${
                activePackage === pkg.id
                  ? 'border-transparent bg-brand-gradient text-white shadow-lg'
                  : 'border-white/10 bg-white/[0.03] text-muted hover:border-violet/40 hover:text-ink'
              }`}
            >
              <div className="text-xs font-bold uppercase tracking-wide">
                {pkg.name}
              </div>
              <div className="text-[10px] opacity-70">{pkg.desc}</div>
            </button>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Inputs */}
          <div className="panel p-6">
            <h3 className="eyebrow mb-4">Test parameters</h3>

            {activePackage === 'core' && (
              <div className="space-y-4">
                <Field label="Max price (USDC)">
                  <input
                    type="number"
                    value={coreMaxPrice}
                    onChange={(e) => setCoreMaxPrice(e.target.value)}
                    step="0.001"
                    className="input"
                  />
                </Field>
                <Hint>
                  Tests Intent creation, validation, Offer generation and
                  signature verification.
                </Hint>
              </div>
            )}

            {activePackage === 'client' && (
              <div className="space-y-4">
                <Field label="Provider endpoint">
                  <input
                    type="text"
                    value={clientUrl}
                    onChange={(e) => setClientUrl(e.target.value)}
                    className="input text-xs"
                  />
                </Field>
                <Hint>
                  Tests the Intent → Offer negotiation flow. Requires a running
                  provider.
                </Hint>
              </div>
            )}

            {activePackage === 'server' && (
              <div className="space-y-4">
                <Field label="Server port">
                  <input
                    type="text"
                    value={serverPort}
                    onChange={(e) => setServerPort(e.target.value)}
                    className="input"
                  />
                </Field>
                <Hint>
                  Simulates middleware setup, 402 responses, session validation
                  and receipt generation.
                </Hint>
              </div>
            )}

            {activePackage === 'gateway' && (
              <Hint>
                Tests receipt verification, signature validation and SLA
                checking with a generated mock receipt.
              </Hint>
            )}

            {activePackage === 'indexer' && (
              <Hint>
                Simulates receipt indexing, reputation calculation and analytics
                generation.
              </Hint>
            )}

            <button
              onClick={runTest}
              disabled={isRunning}
              className="btn-primary mt-6 w-full disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Run test
                </>
              )}
            </button>
          </div>

          {/* Console */}
          <div className="panel overflow-hidden">
            <div className="border-b border-white/10 px-5 py-3">
              <span className="eyebrow">Console output</span>
            </div>
            <div className="h-80 overflow-y-auto bg-black/40 p-5 font-mono text-xs leading-relaxed text-cyan">
              {output.length === 0 ? (
                <div className="text-muted">
                  $ Ready. Select a package and click Run test →
                </div>
              ) : (
                output.map((line, i) => (
                  <div
                    key={i}
                    className="mb-1 animate-slide-in"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    {line}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Result */}
          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <span className="eyebrow">Result</span>
              {result && (
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(JSON.stringify(result, null, 2))
                  }
                  className="rounded-lg border border-white/10 px-2 py-1 text-[10px] font-bold text-muted transition-all hover:border-violet/40 hover:text-ink"
                >
                  Copy JSON
                </button>
              )}
            </div>
            <div className="h-80 overflow-y-auto p-5">
              {result ? (
                <pre className="animate-fade-in overflow-x-auto rounded-xl border border-violet/20 bg-violet/[0.06] p-4 text-xs leading-relaxed text-ink">
                  {JSON.stringify(result, null, 2)}
                </pre>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted">
                  Results will appear here →
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.625rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.03);
          padding: 0.55rem 0.75rem;
          font-family: var(--font-jetbrains-mono), monospace;
          font-size: 0.875rem;
          color: #ececf3;
          transition: all 0.2s;
          outline: none;
        }
        .input:focus {
          border-color: rgba(139, 92, 246, 0.6);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
        }
      `}</style>
    </section>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-muted">
        {label}
      </label>
      {children}
    </div>
  )
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs leading-relaxed text-muted">{children}</p>
}
