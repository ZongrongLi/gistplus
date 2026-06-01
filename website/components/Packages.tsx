'use client'

import { ArrowUpRight, Boxes, Bot, Server, ShieldCheck, BarChart3 } from 'lucide-react'
import { NPM_PACKAGES } from '@/lib/links'

const PACKAGES = [
  {
    name: '@gistplus/core',
    desc: 'Protocol foundation — types, signing, serialization',
    icon: Boxes,
    npm: NPM_PACKAGES.core,
    docs: '/docs/api/core',
    popular: false,
  },
  {
    name: '@gistplus/client',
    desc: 'For AI agents — negotiate, transact, verify',
    icon: Bot,
    npm: NPM_PACKAGES.client,
    docs: '/docs/api/client',
    popular: true,
  },
  {
    name: '@gistplus/server',
    desc: 'For providers — monetize any endpoint',
    icon: Server,
    npm: NPM_PACKAGES.server,
    docs: '/docs/api/server',
    popular: true,
  },
  {
    name: '@gistplus/gateway',
    desc: 'Independent receipt & SLA verification',
    icon: ShieldCheck,
    npm: NPM_PACKAGES.gateway,
    docs: '/docs/api/gateway',
    popular: false,
  },
  {
    name: '@gistplus/indexer',
    desc: 'Reputation scoring & market analytics',
    icon: BarChart3,
    npm: NPM_PACKAGES.indexer,
    docs: '/docs/api/indexer',
    popular: false,
  },
]

export default function Packages() {
  return (
    <section id="packages" className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <div className="flex items-center gap-3">
            <span className="eyebrow">Modular by design</span>
            <span className="accent-bar" />
          </div>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight">
            Five packages.{' '}
            <span className="text-gradient">One protocol.</span>
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            Install only what you need. Every package is fully typed and ships
            with first-class TypeScript support.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PACKAGES.map((pkg, i) => {
            const Icon = pkg.icon
            return (
              <div
                key={pkg.name}
                className="panel panel-hover group relative flex flex-col p-6 animate-slide-up"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                {pkg.popular && (
                  <span className="absolute right-4 top-4 rounded-full border border-violet/30 bg-violet/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-light">
                    Popular
                  </span>
                )}

                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-violet transition-colors group-hover:border-violet/40 group-hover:text-violet-light">
                  <Icon size={20} />
                </div>

                <div className="font-mono text-sm font-bold text-ink transition-colors group-hover:text-gradient">
                  {pkg.name}
                </div>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {pkg.desc}
                </p>

                <div className="mt-5 flex items-center gap-4 border-t border-white/10 pt-4 text-xs">
                  <a
                    href={pkg.npm}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-muted transition-colors hover:text-ink"
                  >
                    npm <ArrowUpRight size={12} />
                  </a>
                  <a
                    href={pkg.docs}
                    className="flex items-center gap-1 text-muted transition-colors hover:text-ink"
                  >
                    docs <ArrowUpRight size={12} />
                  </a>
                </div>
              </div>
            )
          })}

          {/* Install-all card */}
          <div className="panel relative flex flex-col justify-center overflow-hidden p-6 card-grid-bg">
            <div className="absolute inset-0 bg-brand-gradient-soft" />
            <div className="relative">
              <div className="eyebrow mb-3 text-violet-light">Install all</div>
              <code className="block break-all font-mono text-xs leading-relaxed text-ink">
                npm i @gistplus/core @gistplus/client @gistplus/server
                @gistplus/gateway @gistplus/indexer
              </code>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
