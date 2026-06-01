import { Github } from 'lucide-react'
import Logo from './Logo'
import { GITHUB_REPO, NPM_PACKAGES } from '@/lib/links'

const COLUMNS = [
  {
    title: 'Packages',
    links: [
      { label: '@gistplus/core', href: NPM_PACKAGES.core },
      { label: '@gistplus/client', href: NPM_PACKAGES.client },
      { label: '@gistplus/server', href: NPM_PACKAGES.server },
      { label: '@gistplus/gateway', href: NPM_PACKAGES.gateway },
      { label: '@gistplus/indexer', href: NPM_PACKAGES.indexer },
    ],
  },
  {
    title: 'Documentation',
    links: [
      { label: 'Introduction', href: '/docs' },
      { label: 'Quick Start', href: '/docs/quickstart' },
      { label: 'Protocol', href: '/docs/protocol' },
      { label: 'All docs', href: '/docs' },
    ],
  },
  {
    title: 'Project',
    links: [
      { label: 'GitHub', href: GITHUB_REPO },
      { label: 'License (Apache 2.0)', href: `${GITHUB_REPO}/blob/main/LICENSE` },
      { label: 'Contributing', href: `${GITHUB_REPO}/blob/main/CONTRIBUTING.md` },
      { label: 'Roadmap', href: `${GITHUB_REPO}/blob/main/docs/ROADMAP.md` },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              The economic layer for autonomous AI agents. Built on Solana.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href={GITHUB_REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-muted transition-all hover:border-violet/40 hover:text-ink"
                aria-label="GitHub"
              >
                <Github size={16} />
              </a>
              <a
                href="https://x.com/gistplus"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs font-medium text-muted transition-all hover:border-violet/40 hover:text-ink"
              >
                @gistplus
              </a>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="eyebrow mb-4">{col.title}</div>
              <div className="space-y-2.5">
                {col.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="block text-sm text-muted transition-colors hover:text-ink"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-muted sm:flex-row">
          <span>© {new Date().getFullYear()} Gist Plus</span>
          <span className="flex items-center gap-2">
            Powered by Solana
            <span className="h-1 w-1 rounded-full bg-cyan" />
            Open source
          </span>
        </div>
      </div>
    </footer>
  )
}
