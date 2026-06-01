'use client'

import { useEffect, useState } from 'react'
import Logo from './Logo'

const LINKS = [
  { label: 'Packages', href: '/#packages' },
  { label: 'Compare', href: '/#compare' },
  { label: 'Code', href: '/#examples' },
  { label: 'Run', href: '/#playground' },
  { label: 'Docs', href: '/docs' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className="sticky top-0 z-50">
      <div
        className={`border-b border-ink transition-colors duration-200 ${
          scrolled ? 'bg-paper/90 backdrop-blur' : 'bg-paper'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <a href="/" className="transition-opacity hover:opacity-70">
            <Logo />
          </a>

          {/* Center links, divided by hairlines */}
          <div className="hidden items-stretch border border-ink md:flex">
            {LINKS.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                className={`px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-paper ${
                  i !== 0 ? 'border-l border-ink' : ''
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-smoke lg:flex">
              <span className="h-2 w-2 animate-blink rounded-full bg-ink" />
              Devnet live
            </span>
            <a
              href="https://github.com/gistplusxyz/gistplus"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ink"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
