'use client'

/**
 * Ambient page background: deep base color, animated gradient orbs,
 * subtle grid, and a top radial glow. Purely decorative, pointer-events-none.
 */
export default function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base */}
      <div className="absolute inset-0 bg-base" />

      {/* Top radial glow */}
      <div className="absolute inset-x-0 top-0 h-[600px] bg-radial-glow" />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage:
            'radial-gradient(circle at 50% 0%, #000 0%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(circle at 50% 0%, #000 0%, transparent 75%)',
        }}
      />

      {/* Floating orbs */}
      <div className="absolute -left-40 top-20 h-[480px] w-[480px] rounded-full bg-violet/20 blur-[120px] animate-float-slow" />
      <div
        className="absolute -right-40 top-[420px] h-[520px] w-[520px] rounded-full bg-cyan/15 blur-[130px] animate-float"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="absolute left-1/3 top-[1100px] h-[420px] w-[420px] rounded-full bg-indigo/15 blur-[120px] animate-float-slow"
        style={{ animationDelay: '4s' }}
      />
    </div>
  )
}
