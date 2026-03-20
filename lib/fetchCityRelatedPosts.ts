import { sanityClient } from '../sanityClient';
import type { City } from './cities';

export type CityRelatedPost = {
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: string;
};

export async function fetchCityRelatedPosts(city: City): Promise<CityRelatedPost[]> {
  const pattern = `*${city.name}*`;
  try {
    const posts = await sanityClient.fetch<CityRelatedPost[]>(
      `*[_type == "post" && status == "published" && defined(slug.current) && defined(publishedAt) && publishedAt <= $now && (title match $pattern || title match "*cost of living*")] | order(publishedAt desc) [0...3] {
        title,
        "slug": slug.current,
        excerpt,
        publishedAt
      }`,
      { pattern, now: new Date().toISOString() }
    );
    return posts || [];
  } catch {
    return [];
  }
}
