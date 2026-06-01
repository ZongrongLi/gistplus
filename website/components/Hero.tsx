'use client'

import { useState } from 'react'
import TypeLine from './TypeLine'

const TABS = [
  { id: 'agent', label: 'Agents', cmd: 'npm i @gistplus/client' },
  { id: 'provider', label: 'Providers', cmd: 'npm i @gistplus/server' },
  { id: 'all', label: 'All', cmd: 'npm i @gistplus/core @gistplus/client @gistplus/server' },
] as const

const STATS = [
  { value: '3.5', unit: '×', label: 'Cheaper' },
  { value: '6', unit: '×', label: 'Faster' },
  { value: '50', unit: '×', label: 'Fewer txs' },
  { value: '100', unit: '%', label: 'Autonomous' },
]

const FLOW = [
  { num: '01', label: 'Intent', desc: 'Agent states its needs' },
  { num: '02', label: 'Offer', desc: 'Provider signs a quote' },
  { num: '03', label: 'Session', desc: 'Prepaid channel opens' },
  { num: '04', label: 'Receipt', desc: 'Cryptographic proof' },
]

export default function Hero() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('agent')
  const [copied, setCopied] = useState(false)
  const activeCmd = TABS.find((t) => t.id === tab)!.cmd

  const copy = () => {
    navigator.clipboard.writeText(activeCmd)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <section className="relative overflow-hidden border-b border-ink bg-grid">
      <div className="mx-auto max-w-7xl px-5 py-16 md:py-24">
        {/* Top meta row */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-3 border-b border-ink pb-4">
          <span className="eyebrow">Gist Plus // Protocol v0.1</span>
          <span className="eyebrow">Solana · TypeScript · Apache-2.0</span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-[14vw] font-extrabold uppercase leading-[0.86] tracking-tightest md:text-[8.5rem]">
          <span className="block animate-slide-up">Commerce</span>
          <span
            className="block animate-slide-up text-outline"
            style={{ animationDelay: '80ms' }}
          >
            for
          </span>
          <span
            className="block animate-slide-up"
            style={{ animationDelay: '160ms' }}
          >
            machines
          </span>
        </h1>

        {/* Sub + typewriter */}
        <div className="mt-8 grid gap-8 border-t border-ink pt-8 md:grid-cols-[1.4fr_1fr]">
          <p className="max-w-xl text-lg leading-relaxed text-ink-2">
            Gist Plus is a programmable payment protocol for autonomous AI.
            Prepaid sessions, signed receipts, and instant settlement on Solana —
            no API keys, no humans in the loop.
          </p>
          <div className="flex flex-col justify-end">
            <span className="eyebrow mb-2">Agents that can</span>
            <div className="font-mono text-lg font-bold">
              <span className="text-smoke">{'> '}</span>
              <TypeLine
                phrases={[
                  'negotiate prices.',
                  'open sessions.',
                  'pay per call.',
                  'verify receipts.',
                  'claim refunds.',
                ]}
              />
            </div>
          </div>
        </div>

        {/* CTAs + install */}
        <div className="mt-10 grid gap-4 md:grid-cols-[auto_1fr] md:items-stretch">
          <div className="flex gap-0">
            <a href="#playground" className="btn-ink">
              Run the demo
            </a>
            <a
              href="https://github.com/gistplusxyz/gistplus"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-line border-l-0"
            >
              Source ↗
            </a>
          </div>

          {/* Install terminal */}
          <div className="box-hard">
            <div className="flex items-center justify-between border-b border-ink">
              <div className="flex">
                {TABS.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] transition-colors ${
                      i !== 0 ? 'border-l border-ink' : ''
                    } ${
                      tab === t.id
                        ? 'bg-ink text-paper'
                        : 'text-smoke hover:text-ink'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <button
                onClick={copy}
                className="border-l border-ink px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] transition-colors hover:bg-ink hover:text-paper"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="overflow-x-auto px-4 py-3">
              <code className="whitespace-nowrap font-mono text-sm">
                <span className="text-smoke">$ </span>
                {activeCmd}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 border-t border-ink md:grid-cols-4">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className={`group px-5 py-6 transition-colors hover:bg-ink hover:text-paper ${
              i !== 0 ? 'border-l border-ink' : ''
            } ${i >= 2 ? 'border-t border-ink md:border-t-0' : ''}`}
          >
            <div className="font-display text-5xl font-extrabold tracking-tightest">
              {s.value}
              <span className="text-2xl align-top">{s.unit}</span>
            </div>
            <div className="mt-1 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-smoke group-hover:text-paper">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Protocol flow */}
      <div className="grid grid-cols-1 border-t border-ink sm:grid-cols-2 lg:grid-cols-4">
        {FLOW.map((step, i) => (
          <div
            key={step.num}
            className={`relative px-5 py-7 ${
              i !== 0 ? 'border-t border-ink sm:border-t-0 sm:border-l' : ''
            } ${i === 2 ? 'lg:border-l border-ink' : ''} ${
              i >= 2 ? 'sm:border-t lg:border-t-0' : ''
            }`}
          >
            <div className="index-num">{step.num}</div>
            <div className="mt-3 font-display text-xl font-extrabold uppercase tracking-tighter">
              {step.label}
            </div>
            <div className="mt-1 text-sm text-smoke">{step.desc}</div>
            {i < FLOW.length - 1 && (
              <span className="absolute right-3 top-7 hidden font-mono text-smoke lg:block">
                →
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
