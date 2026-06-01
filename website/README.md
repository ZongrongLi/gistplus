# Gist Plus Website

Modern Next.js + Tailwind CSS landing page and docs for **Gist Plus** — the economic
layer for autonomous AI agents.

## Quick start

```bash
cd website
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Stack

- **Next.js 14** (App Router, static export)
- **Tailwind CSS** with a custom dark "protocol" design system
- **TypeScript** throughout
- **lucide-react** icons + `react-syntax-highlighter` code blocks

## Design system

The visual language lives in two files:

- `tailwind.config.ts` — brand tokens (`base`, `ink`, `muted`, `panel`, `violet`,
  `indigo`, `cyan`), gradients, shadows, and animations.
- `app/globals.css` — reusable component utilities: `.panel`, `.panel-hover`,
  `.btn-primary`, `.btn-ghost`, `.pill`, `.eyebrow`, `.accent-bar`, `.text-gradient`.

Prefer composing these utilities over ad-hoc colors so the theme stays consistent.

## Sections (landing page)

1. **Hero** — headline, install tabs, stats, protocol flow
2. **Interactive comparison** — Legacy per-request vs. Gist Plus sessions
3. **Packages** — the five `@gistplus/*` packages
4. **Code snippets** — expandable examples
5. **Playground** — run each package in the browser
6. **Documentation** — links into `/docs`
7. **Footer**

## Commands

```bash
npm run dev      # Dev server (localhost:3000)
npm run build    # Static production build -> ./out
npm run start    # Serve a production build
npm run lint     # Lint
```

## Deploy

The site is configured for static export (`output: 'export'` in `next.config.js`),
so `npm run build` produces a fully static `out/` directory you can host anywhere
(Vercel, Netlify, GitHub Pages, S3, etc.).

## Structure

```
website/
├── app/
│   ├── layout.tsx        # Root layout + fonts + metadata
│   ├── page.tsx          # Landing page
│   ├── globals.css       # Design-system utilities
│   └── docs/             # Documentation pages
├── components/
│   ├── Background.tsx    # Ambient gradient/grid background
│   ├── Logo.tsx          # Gist Plus wordmark + glyph
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── InteractiveComparison.tsx
│   ├── Packages.tsx
│   ├── CodeSnippets.tsx
│   ├── Playground.tsx
│   ├── Documentation.tsx
│   ├── CodeBlock.tsx
│   ├── Footer.tsx
│   └── TwitterButton.tsx
├── tailwind.config.ts
├── next.config.js
└── tsconfig.json
```
