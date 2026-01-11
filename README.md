# MoneyWithSense.com

A Next.js (App Router) + Sanity CMS personal finance education site.

## Overview

MoneyWithSense provides practical, jargon-free personal finance education for a global English-speaking audience. Topics include saving, budgeting, investing basics, passive income, credit & debt, and side hustles.

## Setup

### Requirements
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
npm run dev
```

### Environment Variables

Create a `.env.local` file (or configure in Vercel for deployment):

```env
# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=z0g6hj8g
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_editor_token

# Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXX
NEXT_PUBLIC_GSC_VERIFICATION=your_verification_code

# Newsletter (optional)
GOOGLE_SHEETS_WEBHOOK_URL=your_webhook_url

# AI Content Scripts (optional)
GEMINI_API_KEY=your_gemini_key
UNSPLASH_ACCESS_KEY=your_unsplash_key
```

## Content Scripts

- `scripts/ai-content-generator.js`: Generates finance articles in English, posts to Sanity.
- `scripts/weekly-content-planner.js`: Plans weekly finance content topics.

## Deployment (Vercel)

1. Connect repository to Vercel
2. Build command: `npm run build` (runs `prisma generate && next build`)
3. Configure environment variables in Vercel dashboard

### DNS Configuration

- **A Record**: `@` → `76.76.21.21`
- **CNAME Record**: `www` → `cname.vercel-dns.com`
- Primary domain: `moneywithsense.com`
- Redirect `www` to root (configured in `next.config.js`)

## Key Features

- **Canonical URLs**: All pages point to `https://moneywithsense.com`
- **Ad Placeholders**: CLS-safe ad slots (`components/ads/AdPlaceholder.tsx`)
- **Internal Linking**: Each article links to 1 pillar guide + 2 related articles
- **E-E-A-T Pages**: `/about`, `/editorial-policy`, `/sources`, `/disclaimer`, `/affiliate-disclosure`
- **Finance Categories**: 10 defined categories covering all major personal finance topics

## Categories

1. Personal Finance
2. Saving Money
3. Budgeting
4. Investing Basics
5. Passive Income
6. Credit & Debt
7. Banking & Cards
8. Taxes & Finance Tips
9. Side Hustles
10. Money Psychology

## License

All rights reserved © MoneyWithSense.com
