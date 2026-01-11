import { MetadataRoute } from 'next';

const siteUrl = 'https://moneywithsense.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/_next/',
          '/newsletter/unsubscribe',
          '/*?search=',
          '/*&search=',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
