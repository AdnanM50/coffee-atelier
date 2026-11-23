# Aether & Crema — Atelier de Torréfaction

A Next.js 15 App Router specialty coffee storefront & sensory experience featuring a **1,000-frame scroll-scrubbed farm-to-shop origin chronicle**, custom double-curtain startup preloader, thermodynamic brew lab, and interactive 3D coffee vessel explorer.

## Tech Stack

- **Framework**: Next.js 15 (App Router) & React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS & `next/font/google`
- **Motion & Scroll**: GSAP (`ScrollTrigger`, `Flip`, `@gsap/react`) & LocomotiveScroll (Lenis)
- **Icons**: Lucide React

## Routes

- `/` — 1,000-frame scroll-scrubbed Origin Film hero, Architectural Brew Lab, Flavor Matrix, and Omakase Tasting Room
- `/about` — Partner volcanic estates, direct-trade harvests, and roastery manifesto
- `/products` — Filterable & sortable specialty coffee and whole-bean catalog
- `/products/[slug]` — Individual coffee dossier with sensory radar chart, exploded cup anatomy, brew timer, and customizer

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `npm run dev` — Start the Next.js development server
- `npm run build` — Build the production Next.js bundle (`next build`)
- `npm run start` — Start the production server (`next start`)
- `npm run typecheck` — Run TypeScript typechecking (`tsc --noEmit`)
- `npm run frames` — Re-cut `public/videos/coffee-commercial.mp4` into 1,000 50fps WebP frames in `public/frames/` (requires `ffmpeg`)
