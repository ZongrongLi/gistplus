import { ArrowRight, FileText } from 'lucide-react'
import Link from 'next/link'

const DOCS = [
  { name: 'Introduction', link: '/docs' },
  { name: 'Quick Start', link: '/docs/quickstart' },
  { name: 'Protocol Overview', link: '/docs/protocol' },
  { name: 'Negotiation', link: '/docs/negotiation' },
  { name: 'Sessions', link: '/docs/sessions' },
  { name: 'Client API', link: '/docs/api/client' },
  { name: 'Server API', link: '/docs/api/server' },
  { name: 'Build an Agent', link: '/docs/guides/agent' },
]

export default function Documentation() {
  return (
    <section id="docs" className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <div className="flex items-center gap-3">
            <span className="eyebrow">Documentation</span>
            <span className="accent-bar" />
          </div>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight">
            Everything you need to{' '}
            <span className="text-gradient">ship</span>
          </h2>
          <p className="mt-3 text-muted">
            Complete guides with interactive examples and end-to-end walkthroughs.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DOCS.map((doc, i) => (
            <Link
              key={doc.name}
              href={doc.link}
              className="panel panel-hover group p-6 animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <FileText
                size={18}
                className="mb-3 text-violet transition-colors group-hover:text-violet-light"
              />
              <div className="font-display text-sm font-semibold text-ink transition-colors group-hover:text-gradient">
                {doc.name}
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                Read <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/docs" className="btn-primary">
            <FileText size={18} />
            Browse all docs
          </Link>
        </div>
      </div>
    </section>
  )
}
