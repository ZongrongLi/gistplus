'use client'

import { useEffect, useState } from 'react'

/**
 * Typewriter that cycles through a list of phrases: types a phrase, holds,
 * deletes, then advances. Includes a blinking block cursor.
 */
export default function TypeLine({
  phrases,
  className = '',
}: {
  phrases: string[]
  className?: string
}) {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = phrases[index % phrases.length]

    if (!deleting && text === current) {
      const hold = setTimeout(() => setDeleting(true), 1400)
      return () => clearTimeout(hold)
    }

    if (deleting && text === '') {
      setDeleting(false)
      setIndex((i) => (i + 1) % phrases.length)
      return
    }

    const delay = deleting ? 32 : 64
    const t = setTimeout(() => {
      setText((prev) =>
        deleting
          ? current.slice(0, prev.length - 1)
          : current.slice(0, prev.length + 1)
      )
    }, delay)
    return () => clearTimeout(t)
  }, [text, deleting, index, phrases])

  return (
    <span className={className}>
      {text}
      <span
        aria-hidden
        className="ml-0.5 inline-block h-[0.9em] w-[0.55em] translate-y-[0.08em] animate-blink bg-current align-baseline"
      />
    </span>
  )
}
