'use client'

import Background from '@/components/Background'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import InteractiveComparison from '@/components/InteractiveComparison'
import Packages from '@/components/Packages'
import CodeSnippets from '@/components/CodeSnippets'
import Playground from '@/components/Playground'
import Documentation from '@/components/Documentation'
import Footer from '@/components/Footer'
import TwitterButton from '@/components/TwitterButton'

export default function Home() {
  return (
    <main className="relative min-h-screen text-ink">
      <Background />
      <Navbar />
      <Hero />
      <InteractiveComparison />
      <Packages />
      <CodeSnippets />
      <Playground />
      <Documentation />
      <Footer />
      <TwitterButton />
    </main>
  )
}
