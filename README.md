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

### Finance Articles Generator
- `scripts/ai-content-generator.js`: Generates finance articles in English, posts to Sanity.
- `scripts/generate-weekly-batch.js`: Batch generator with duplicate checking.
- `scripts/weekly-content-planner.js`: Plans weekly finance content topics.

### Cost of Living Generator
- `scripts/ai-costofliving-generator.js`: Generates cost-of-living articles for cities.
- `scripts/costofliving-queue.js`: Queue manager for scheduled article generation.

#### Running Cost of Living Generator Locally

**Manual generation:**
```bash
node scripts/ai-costofliving-generator.js "London" "UK" 2026
node scripts/ai-costofliving-generator.js "New York City" "United States" 2026 "Chicago" "comparison"
```

**Queue management:**
```bash
# List queue items
node scripts/costofliving-queue.js list

# Add item to queue
node scripts/costofliving-queue.js add "London" "UK" 2026 100
# Priority: 100 (major cities), 50 (regional), 10 (other)

# Add comparison article
node scripts/costofliving-queue.js add "London" "UK" 2026 100 "Manchester" "comparison"
```

**Setup (first time only):**
```bash
# Create category and pillar page
node scripts/create-costofliving-pillar.js
```

#### GitHub Actions Workflow

**Manual trigger:**
1. Go to Actions → "Cost of Living Content Generation"
2. Click "Run workflow"
3. Fill in:
   - City: e.g., "London"
   - Country: e.g., "UK"
   - Year: 2026 (default)
   - Comparison City: (optional)
   - Mode: city/comparison/budget
   - Dry Run: (optional, for testing)

**Scheduled runs:**
- Runs automatically Tue/Fri at 09:00 UTC
- Processes 1 item from queue per run (highest priority first)
- Lock mechanism prevents concurrent runs (30 min TTL)

#### Queue System

The queue system (`data/costofliving-queue.json`) uses:
- **Priority-based processing**: Higher number = higher priority (100 > 50 > 10)
- **Lock mechanism**: Prevents concurrent scheduled runs (30 min TTL, stale locks auto-unlock)
- **Retry logic**: Max 1 retry per item
- **Git conflict handling**: Automatic pull/rebase + retry on conflicts

**Queue item structure:**
```json
{
  "city": "London",
  "country": "UK",
  "year": 2026,
  "comparisonCity": null,
  "mode": "city",
  "priority": 100,
  "status": "pending",
  "retryCount": 0,
  "failedAt": null,
  "addedAt": "2025-01-18T..."
}
```

**Status values:**
- `pending`: Waiting to be processed
- `completed`: Successfully generated
- `failed`: Failed (can retry if retryCount < maxRetries)
- `failed_permanent`: Failed after max retries

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
11. Cost of Living

## License

All rights reserved © MoneyWithSense.com
