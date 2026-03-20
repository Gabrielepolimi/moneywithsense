/**
 * 301 article → database pages (used by next.config.js).
 * London vs Manchester → /cities/london (Manchester not in cities.json).
 */
export function buildArticleCostOfLivingRedirects() {
  return [
    { source: '/articles/cost-of-living-in-stockholm-2026', destination: '/cities/stockholm', permanent: true },
    { source: '/articles/cost-of-living-in-vancouver-2026', destination: '/cities/vancouver', permanent: true },
    { source: '/articles/cost-of-living-in-prague-2026', destination: '/cities/prague', permanent: true },
    { source: '/articles/cost-of-living-in-dubai-2026', destination: '/cities/dubai', permanent: true },
    { source: '/articles/cost-of-living-in-san-francisco-2026', destination: '/cities/san-francisco', permanent: true },
    { source: '/articles/cost-of-living-in-los-angeles-2026', destination: '/cities/los-angeles', permanent: true },
    { source: '/articles/cost-of-living-guide-2026', destination: '/cities', permanent: true },
    { source: '/articles/toronto-vs-vancouver-cost-of-living-2026', destination: '/compare/toronto-vs-vancouver', permanent: true },
    {
      source: '/articles/london-vs-manchester-cost-of-living-2026',
      destination: '/cities/london',
      permanent: true,
    },
    { source: '/articles/berlin-vs-munich-cost-of-living-2026', destination: '/compare/berlin-vs-munich', permanent: true },
    { source: '/articles/barcelona-vs-madrid-cost-of-living-2026', destination: '/compare/barcelona-vs-madrid', permanent: true },
    { source: '/articles/sydney-vs-melbourne-cost-of-living-2026', destination: '/compare/melbourne-vs-sydney', permanent: true },
    {
      source: '/articles/new-york-city-vs-chicago-cost-of-living-2026',
      destination: '/compare/chicago-vs-new-york',
      permanent: true,
    },
    // Legacy URLs (were in vercel.json → old articles; now → database)
    { source: '/articles/average-cost-of-living-in-london', destination: '/cities/london', permanent: true },
    { source: '/articles/madrid-neighborhood-guide', destination: '/cities/madrid', permanent: true },
  ];
}
