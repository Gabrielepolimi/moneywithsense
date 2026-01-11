## MoneyWithSense.com

Next.js (App Router) + Sanity CMS rebrand of FishandTips to a finance site.

### Setup
- Node 18+, `npm install`, `npm run dev`.
- Env vars (`.env.local` for local, Vercel for deploy):
  - `NEXT_PUBLIC_SANITY_PROJECT_ID` (e.g. `z0g6hj8g`)
  - `NEXT_PUBLIC_SANITY_DATASET` (e.g. `production`)
  - `SANITY_API_TOKEN` (editor token)
  - `NEXT_PUBLIC_GA_MEASUREMENT_ID` (GA4, optional)
  - `NEXT_PUBLIC_GSC_VERIFICATION` (Search Console meta, optional)
  - Optional: `GEMINI_API_KEY` if you run AI scripts locally, `UNSPLASH_ACCESS_KEY` for images.

### Scripts / Content
- `scripts/ai-content-generator.js`: finance prompt EN, no Amazon links, posts to Sanity.
- `scripts/weekly-content-planner.js`: weekly finance topics.

### Deploy (Vercel)
- Connect repo `Gabrielepolimi/moneywithsense`.
- Build: `npm run build` (prisma generate + next build).
- Domain (quando pronto con DNS):
  - A @ → `76.76.21.21`
  - CNAME www → `cname.vercel-dns.com`
  - Primary domain: `moneywithsense.com`, redirect `www` → root (also handled in `next.config.js`).

### Notes
- Canonicals puntano a `https://moneywithsense.com`.
- Ad placeholders CLS-safe (`components/ads/AdSlot.tsx`).
- Internal linking: ogni articolo → 1 pillar + 2 related.
- E-E-A-T: pages `/about`, `/editorial-policy`, `/sources`, `/disclaimer` già presenti.
