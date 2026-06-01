'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Menu, X, Github } from 'lucide-react'
import Logo from '@/components/Logo'
import Background from '@/components/Background'
import TwitterButton from '@/components/TwitterButton'
import { GITHUB_REPO } from '@/lib/links'

const SECTIONS = [
  {
    title: 'Getting started',
    links: [
      { name: 'Introduction', href: '/docs' },
      { name: 'Quick Start', href: '/docs/quickstart' },
      { name: 'Installation', href: '/docs/installation' },
    ],
  },
  {
    title: 'Core concepts',
    links: [
      { name: 'Protocol Overview', href: '/docs/protocol' },
      { name: 'Intent → Offer', href: '/docs/negotiation' },
      { name: 'Sessions', href: '/docs/sessions' },
      { name: 'Receipts', href: '/docs/receipts' },
    ],
  },
  {
    title: 'API reference',
    links: [
      { name: '@gistplus/core', href: '/docs/api/core' },
      { name: '@gistplus/client', href: '/docs/api/client' },
      { name: '@gistplus/server', href: '/docs/api/server' },
      { name: '@gistplus/gateway', href: '/docs/api/gateway' },
      { name: '@gistplus/indexer', href: '/docs/api/indexer' },
    ],
  },
  {
    title: 'Guides',
    links: [
      { name: 'Build an Agent', href: '/docs/guides/agent' },
      { name: 'Build a Provider', href: '/docs/guides/provider' },
      { name: 'Deployment', href: '/docs/guides/deployment' },
      { name: 'Security', href: '/docs/guides/security' },
    ],
  },
]

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="relative min-h-screen text-ink">
      <Background />

      {/* Top nav */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-base/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-5">
            <Link href="/" className="transition-opacity hover:opacity-80">
              <Logo />
            </Link>
            <span className="hidden items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted sm:inline-flex">
              Docs
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-white/[0.05] hover:text-ink sm:flex"
            >
              <Github size={15} /> GitHub
            </a>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 text-muted transition-colors hover:bg-white/[0.05] hover:text-ink md:hidden"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-[60px] z-40 h-[calc(100vh-60px)] w-64 overflow-y-auto border-r border-white/10 bg-base/90 p-6 backdrop-blur-xl transition-transform duration-300 md:sticky md:translate-x-0 md:bg-transparent ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="space-y-8">
            {SECTIONS.map((section) => (
              <div key={section.title}>
                <div className="eyebrow mb-3">{section.title}</div>
                <div className="space-y-0.5">
                  {section.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setSidebarOpen(false)}
                      className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-white/[0.05] hover:text-ink"
                    >
                      <ChevronRight
                        size={13}
                        className="text-violet opacity-0 transition-opacity group-hover:opacity-100"
                      />
                      <span>{link.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className="min-h-screen flex-1 p-8 md:p-12">{children}</main>
      </div>

      <TwitterButton />
    </div>
  )
}
