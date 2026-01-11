import { MetadataRoute } from 'next'
import { sanityClient } from '../sanityClient'

// Cache la sitemap per 1h per evitare richieste continue a Sanity
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://moneywithsense.com'

  const [posts = [], categories = []] = await Promise.all([
    sanityClient
      .fetch(
        `
        *[_type == "post" && status == "published"] {
          "slug": slug.current,
          publishedAt,
          _updatedAt
        }
      `,
      )
      .catch((err) => {
        console.error('Errore fetch articoli per sitemap:', err)
        return []
      }),
    sanityClient
      .fetch(
        `
        *[_type == "category" && defined(slug.current)] {
          "slug": slug.current,
          _updatedAt
        }
      `,
      )
      .catch((err) => {
        console.error('Errore fetch categorie per sitemap:', err)
        return []
      }),
  ])

  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/articoli`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/categoria`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/pillars`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/tools`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/editorial-policy`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/sources`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/disclaimer`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contatti`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/supporto`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/newsletter`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/cookie-policy`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/termini`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ]

  const categoryPages: MetadataRoute.Sitemap = categories.map((category: any) => ({
    url: `${baseUrl}/categoria/${category.slug}`,
    lastModified: category._updatedAt ? new Date(category._updatedAt) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const articlePages: MetadataRoute.Sitemap = posts.map((post: any) => ({
    url: `${baseUrl}/articoli/${post.slug}`,
    lastModified: post._updatedAt ? new Date(post._updatedAt) : new Date(post.publishedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticPages, ...categoryPages, ...articlePages]
}
