import client from '../sanityClient';

const postProjection = `{
    _id,
    title,
    slug,
    mainImage{
      asset->{url}
    },
    publishedAt,
    "author": author->name,
    "categories": categories[]->title,
    excerpt,
    body,
    showYouTubeVideo,
    youtubeUrl,
    youtubeTitle,
    youtubeDescription
  }`;

export type GetPostsOptions = {
  /** Exclude posts tagged with Sanity category slug `cost-of-living` */
  excludeCostOfLivingCategory?: boolean;
  /** ISR revalidate seconds; default 3600. Use 0 for no-store (admin/debug). */
  revalidate?: number;
};

export async function getPosts(options?: GetPostsOptions) {
  const exclude =
    options?.excludeCostOfLivingCategory === true
      ? ` && !("cost-of-living" in categories[]->slug.current)`
      : '';

  const revalidate = options?.revalidate !== undefined ? options.revalidate : 3600;

  return await client.fetch(
    `*[_type == "post" && status == "published" && publishedAt <= $now${exclude}] | order(publishedAt desc) ${postProjection}`,
    { now: new Date().toISOString() },
    revalidate === 0
      ? { cache: 'no-store', next: { revalidate: 0 } }
      : { next: { revalidate } }
  );
}

/** Posts in Cost of Living category (for hub + editorial remainder on /categories/cost-of-living) */
export async function getCostOfLivingCategoryPosts(revalidate = 3600) {
  return await client.fetch(
    `*[_type == "post" && status == "published" && publishedAt <= $now && "cost-of-living" in categories[]->slug.current] | order(publishedAt desc) ${postProjection}`,
    { now: new Date().toISOString() },
    { next: { revalidate } }
  );
}

/** Slugs for `generateStaticParams` on /articles/[slug] (ISR-friendly). */
export async function getAllPublishedPostSlugs(revalidate = 3600) {
  const slugs = await client.fetch<string[]>(
    `*[_type == "post" && status == "published" && publishedAt <= $now].slug.current`,
    { now: new Date().toISOString() },
    { next: { revalidate } }
  );
  return Array.isArray(slugs) ? slugs.filter(Boolean) : [];
}
