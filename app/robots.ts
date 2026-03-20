import { MetadataRoute } from 'next'

const baseUrl = 'https://moneywithsense.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/', '/studio/', '/admin/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
