'use client'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface CodeBlockProps {
  language: string
  code: string
  title?: string
  showLineNumbers?: boolean
}

export default function CodeBlock({
  language,
  code,
  title,
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="panel group overflow-hidden">
      {title && (
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            {title}
          </span>
          <button
            onClick={copy}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2 py-1 text-[10px] font-bold text-muted transition-all hover:border-violet/40 hover:text-ink"
          >
            {copied ? (
              <>
                <Check size={12} className="text-cyan" /> Copied
              </>
            ) : (
              <>
                <Copy size={12} /> Copy
              </>
            )}
          </button>
        </div>
      )}
      <div className="relative">
        {!title && (
          <button
            onClick={copy}
            className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-lg border border-white/10 bg-base/80 px-2 py-1 text-[10px] font-bold text-muted backdrop-blur transition-all hover:border-violet/40 hover:text-ink"
          >
            {copied ? (
              <>
                <Check size={12} className="text-cyan" /> Copied
              </>
            ) : (
              <>
                <Copy size={12} /> Copy
              </>
            )}
          </button>
        )}
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            padding: '20px',
            background: 'transparent',
            fontSize: '13px',
            lineHeight: '1.7',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'var(--font-jetbrains-mono), monospace',
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
