'use client'

/**
 * Infinite horizontal ticker. Pure CSS transform loop — content is duplicated
 * so the -50% translate wraps seamlessly.
 */
export default function Marquee({
  items,
  reverse = false,
  invert = false,
  className = '',
}: {
  items: string[]
  reverse?: boolean
  invert?: boolean
  className?: string
}) {
  const row = [...items, ...items]
  return (
    <div
      className={`group relative flex overflow-hidden border-y ${
        invert ? 'border-paper bg-ink text-paper' : 'border-ink bg-paper text-ink'
      } ${className}`}
    >
      <div
        className={`flex shrink-0 items-center whitespace-nowrap ${
          reverse ? 'animate-marquee-rev' : 'animate-marquee'
        } group-hover:[animation-play-state:paused]`}
      >
        {row.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.22em]">
              {item}
            </span>
            <span aria-hidden className="text-xs opacity-50">
              ✳
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
