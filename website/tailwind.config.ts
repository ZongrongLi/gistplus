import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // Square by default — no rounded corners anywhere.
    borderRadius: {
      none: '0',
      DEFAULT: '0',
      full: '9999px', // reserved for the rare dot/indicator
    },
    extend: {
      colors: {
        // Monochrome system. Warm off-white paper + near-black ink.
        paper: '#F4F3EE',
        'paper-2': '#EBEAE3',
        ink: '#0B0B0B',
        'ink-2': '#1A1A1A',
        smoke: '#6B6B66',
        hairline: '#0B0B0B',

        // Back-compat aliases used across older components.
        cream: '#F4F3EE',
        'cream-dark': '#EBEAE3',
        dark: '#0B0B0B',
        'dark-light': '#1A1A1A',
        panel: '#FFFFFF',
        'panel-2': '#EBEAE3',
        'panel-3': '#E2E1D9',
        muted: '#6B6B66',
        base: '#F4F3EE',
        // Neutralize old brand colors to monochrome.
        purple: '#0B0B0B',
        'purple-dark': '#0B0B0B',
        'purple-light': '#1A1A1A',
        violet: '#0B0B0B',
        indigo: '#0B0B0B',
        cyan: '#0B0B0B',
        blue: '#0B0B0B',
        'blue-dark': '#0B0B0B',
      },
      fontFamily: {
        sans: ['var(--font-archivo)', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['var(--font-archivo)', 'Helvetica Neue', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'Consolas', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.05em',
        tighter: '-0.03em',
      },
      boxShadow: {
        hard: '4px 4px 0 0 #0B0B0B',
        'hard-sm': '2px 2px 0 0 #0B0B0B',
        'hard-lg': '8px 8px 0 0 #0B0B0B',
        'hard-inset': 'inset 3px 3px 0 0 #0B0B0B',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out both',
        'slide-up': 'slideUp 0.7s cubic-bezier(0.16,1,0.3,1) both',
        'slide-in': 'slideIn 0.3s ease-out both',
        marquee: 'marquee 28s linear infinite',
        'marquee-rev': 'marqueeRev 28s linear infinite',
        blink: 'blink 1.05s steps(2, start) infinite',
        'spin-slow': 'spin 22s linear infinite',
        ticktock: 'ticktock 1s steps(1) infinite',
        grain: 'grain 0.6s steps(2) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-14px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        marqueeRev: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        ticktock: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0,0)' },
          '50%': { transform: 'translate(-2%, 1%)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
