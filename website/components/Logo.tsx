'use client'

export default function Logo({
  className = '',
  showWordmark = true,
  invert = false,
}: {
  className?: string
  showWordmark?: boolean
  invert?: boolean
}) {
  const fg = invert ? 'text-paper' : 'text-ink'
  const border = invert ? 'border-paper' : 'border-ink'
  const fill = invert ? 'bg-paper text-ink' : 'bg-ink text-paper'

  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      {/* Square monogram */}
      <span
        className={`relative inline-flex h-8 w-8 items-center justify-center border ${border} ${fill} font-mono text-sm font-bold`}
      >
        G+
      </span>

      {showWordmark && (
        <span
          className={`font-display text-base font-extrabold uppercase tracking-tightest ${fg}`}
        >
          Gist&nbsp;Plus
        </span>
      )}
    </span>
  )
}
