'use client'

export default function TwitterButton() {
  return (
    <a
      href="https://x.com/gistplus"
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-6 right-6 z-50 flex h-12 items-center gap-2 rounded-full border border-white/10 bg-panel/80 px-4 text-sm font-semibold text-ink shadow-panel backdrop-blur-xl transition-all hover:border-violet/40 hover:shadow-lift"
      title="Follow @gistplus on X"
    >
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-brand-gradient text-xs font-bold text-white">
        𝕏
      </span>
      <span className="hidden sm:inline">@gistplus</span>
    </a>
  )
}
