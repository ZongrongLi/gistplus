'use client'

import { useState, useEffect } from 'react'

export default function InteractiveComparison() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [legacyProgress, setLegacyProgress] = useState(0)
  const [plusProgress, setPlusProgress] = useState(0)
  const [legacyCost, setLegacyCost] = useState(0)
  const [plusCost, setPlusCost] = useState(0)
  const [legacyTxs, setLegacyTxs] = useState(0)
  const [plusTxs, setPlusTxs] = useState(0)

  const MAX = 100

  useEffect(() => {
    if (!isPlaying) return
    const legacy = setInterval(() => {
      setLegacyProgress((p) => {
        if (p >= MAX) {
          clearInterval(legacy)
          return p
        }
        setLegacyCost((c) => c + 0.035)
        setLegacyTxs((t) => t + 1)
        return p + 1
      })
    }, 55)
    const t1 = setTimeout(() => {
      setPlusTxs(1)
      setPlusCost(0.00025)
    }, 200)
    const t2 = setTimeout(() => {
      setPlusProgress(MAX)
      setPlusCost(1.0005)
    }, 1400)
    const t3 = setTimeout(() => setPlusTxs(2), 2300)
    return () => {
      clearInterval(legacy)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [isPlaying])

  const reset = () => {
    setIsPlaying(false)
    setLegacyProgress(0)
    setPlusProgress(0)
    setLegacyCost(0)
    setPlusCost(0)
    setLegacyTxs(0)
    setPlusTxs(0)
  }
  const start = () => {
    reset()
    setTimeout(() => setIsPlaying(true), 80)
  }

  const legacyDone = legacyProgress >= MAX
  const plusDone = plusProgress >= MAX

  return (
    <section id="compare" className="invert-section border-b border-paper/20">
      <div className="mx-auto max-w-7xl px-5 py-20">
        {/* Header row */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-paper/30 pb-6">
          <div>
            <div className="index-num !text-paper/60">02 / 06 — Benchmark</div>
            <h2 className="mt-3 font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-tightest md:text-7xl">
              100 calls.
              <br />
              <span className="text-outline">two ways.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-paper/70">
            Legacy rails settle every request on-chain. Gist Plus settles a
            session once. Press start and watch the gap open up.
          </p>
        </div>

        {/* Two columns */}
        <div className="mt-10 grid gap-0 border border-paper/30 md:grid-cols-2">
          {/* Legacy */}
          <div className="border-b border-paper/30 p-7 md:border-b-0 md:border-r">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-extrabold uppercase tracking-tighter text-paper/60">
                Legacy
              </h3>
              <span className="border border-paper/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-paper/60">
                Per request
              </span>
            </div>
            <Bars value={legacyProgress} max={MAX} dim />
            <Stat label="Blockchain txs" value={String(legacyTxs)} dim />
            <Stat label="Total fees" value={`$${legacyCost.toFixed(2)}`} dim />
            <Stat
              label="Status"
              value={legacyDone ? 'Complete' : isPlaying ? 'Settling…' : 'Idle'}
              dim
              last
            />
          </div>

          {/* Gist Plus */}
          <div className="relative p-7">
            <span className="absolute right-0 top-0 bg-paper px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-ink">
              Gist Plus
            </span>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-extrabold uppercase tracking-tighter">
                Sessions
              </h3>
            </div>
            <Bars value={plusProgress} max={MAX} />
            <Stat label="Blockchain txs" value={String(plusTxs)} />
            <Stat label="Total fees" value={`$${plusCost.toFixed(4)}`} />
            <Stat
              label="Status"
              value={plusDone ? 'Complete' : isPlaying ? 'Instant' : 'Idle'}
              last
            />
          </div>
        </div>

        {/* Control + results */}
        <div className="mt-8 flex flex-col items-center gap-8">
          <button
            onClick={!isPlaying || (legacyDone && plusDone) ? start : reset}
            className="border border-paper bg-paper px-10 py-4 font-mono text-xs font-bold uppercase tracking-[0.22em] text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            {legacyDone && plusDone
              ? '↻ Run again'
              : isPlaying
              ? '■ Reset'
              : '▶ Start benchmark'}
          </button>

          {legacyDone && plusDone && (
            <div className="grid w-full grid-cols-3 border border-paper/30 animate-fade-in">
              {[
                { v: `${(legacyCost / plusCost).toFixed(0)}×`, l: 'Cheaper' },
                { v: `${legacyTxs / plusTxs}×`, l: 'Fewer txs' },
                { v: '6×', l: 'Faster' },
              ].map((r, i) => (
                <div
                  key={r.l}
                  className={`p-6 text-center ${
                    i !== 0 ? 'border-l border-paper/30' : ''
                  }`}
                >
                  <div className="font-display text-5xl font-extrabold tracking-tightest">
                    {r.v}
                  </div>
                  <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-paper/60">
                    {r.l}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/** 100 tiny cells that fill as progress advances. */
function Bars({
  value,
  max,
  dim = false,
}: {
  value: number
  max: number
  dim?: boolean
}) {
  return (
    <div className="my-6">
      <div className="mb-2 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-paper/60">
        <span>Requests</span>
        <span className="text-paper">
          {value}/{max}
        </span>
      </div>
      <div className="grid grid-cols-25 gap-[2px]" style={{ gridTemplateColumns: 'repeat(25, minmax(0, 1fr))' }}>
        {Array.from({ length: max }).map((_, i) => (
          <span
            key={i}
            className={`h-2 transition-colors duration-150 ${
              i < value
                ? dim
                  ? 'bg-paper/45'
                  : 'bg-paper'
                : 'bg-paper/10'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  dim = false,
  last = false,
}: {
  label: string
  value: string
  dim?: boolean
  last?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between py-3 ${
        last ? '' : 'border-b border-paper/15'
      }`}
    >
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/60">
        {label}
      </span>
      <span
        className={`font-display text-2xl font-extrabold tracking-tighter ${
          dim ? 'text-paper/55' : 'text-paper'
        }`}
      >
        {value}
      </span>
    </div>
  )
}
