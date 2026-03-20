/**
 * Article slugs that 301 to /cities/* or /compare/* — hide from /articles, sitemap, and COL category "editorial" list.
 */
export function isMigratedSingleCityArticleSlug(slug: string): boolean {
  if (slug === 'cost-of-living-guide-2026') return true;
  return /^cost-of-living-in-.+-202(6|7)$/.test(slug);
}

export function isMigratedCompareArticleSlug(slug: string): boolean {
  return /-vs-.+-cost-of-living-2026$/.test(slug);
}

export function isMigratedCostOfLivingArticleSlug(slug: string): boolean {
  return isMigratedSingleCityArticleSlug(slug) || isMigratedCompareArticleSlug(slug);
}
