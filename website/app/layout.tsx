import type { Metadata } from 'next'
import { Archivo, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  weight: ['400', '500', '600', '700', '800', '900'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://gistplus.dev'),
  title: 'Gist Plus — The Economic Layer for AI Agents',
  description:
    'Gist Plus is the programmable commerce protocol for autonomous AI systems. Built on Solana with prepaid sessions, cryptographic receipts, and instant settlement.',
  keywords:
    'gist plus, gistplus, gist protocol, solana, ai agents, blockchain, payments, protocol, autonomous, commerce',
  authors: [{ name: 'Gist Plus' }],
  icons: {
    icon: '/corelogo2.png',
    apple: '/corelogo2.png',
  },
  openGraph: {
    title: 'Gist Plus — The Economic Layer for AI Agents',
    description:
      'Programmable commerce protocol for autonomous AI systems. Built on Solana.',
    type: 'website',
    images: [
      {
        url: '/corelogo2.png',
        width: 1200,
        height: 630,
        alt: 'Gist Plus Protocol',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gist Plus — The Economic Layer for AI Agents',
    description:
      'Programmable commerce protocol for autonomous AI systems. Built on Solana.',
    images: ['/corelogo2.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${archivo.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
