import { MetadataRoute } from 'next'
import { getPosts } from '../lib/getPosts'

const baseUrl = 'https://moneywithsense.com'

// Static pages
const staticPages = [
  { url: '', priority: 1.0, changeFrequency: 'daily' as const },
  { url: '/articles', priority: 0.9, changeFrequency: 'daily' as const },
  { url: '/categories', priority: 0.9, changeFrequency: 'weekly' as const },
  { url: '/guides', priority: 0.9, changeFrequency: 'weekly' as const },
  { url: '/tools', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/newsletter', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
  { url: '/editorial-policy', priority: 0.6, changeFrequency: 'monthly' as const },
  { url: '/sources', priority: 0.6, changeFrequency: 'monthly' as const },
  { url: '/contact', priority: 0.6, changeFrequency: 'monthly' as const },
  { url: '/privacy', priority: 0.5, changeFrequency: 'yearly' as const },
  { url: '/terms', priority: 0.5, changeFrequency: 'yearly' as const },
  { url: '/cookie-policy', priority: 0.5, changeFrequency: 'yearly' as const },
  { url: '/disclaimer', priority: 0.5, changeFrequency: 'yearly' as const },
  { url: '/affiliate-disclosure', priority: 0.5, changeFrequency: 'yearly' as const },
  { url: '/site-map', priority: 0.4, changeFrequency: 'weekly' as const },
]

// Categories
const categories = [
  'personal-finance',
  'saving-money',
  'budgeting',
  'investing-basics',
  'passive-income',
  'credit-debt',
  'banking-cards',
  'taxes-tips',
  'side-hustles',
  'money-psychology',
]

// Pillar Guides (important for SEO)
const pillarGuides = [
  'personal-finance-guide',
  'saving-money-guide',
  'budgeting-guide',
  'investing-basics-guide',
  'passive-income-guide',
  'credit-debt-guide',
  'banking-cards-guide',
  'taxes-tips-guide',
  'side-hustles-guide',
  'money-psychology-guide',
]

// Tools
const tools = [
  'savings-goal',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all published articles
  let articles: { slug: { current: string }; publishedAt?: string }[] = []
  try {
    articles = await getPosts()
  } catch {
    console.error('Failed to fetch posts for sitemap')
    articles = []
  }

  // Static pages
  const staticEntries = staticPages.map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))

  // Category pages
  const categoryEntries = categories.map((category) => ({
    url: `${baseUrl}/categories/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Pillar Guide pages (high priority for SEO)
  const guideEntries = pillarGuides.map((guide) => ({
    url: `${baseUrl}/guides/${guide}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }))

  // Tool pages
  const toolEntries = tools.map((tool) => ({
    url: `${baseUrl}/tools/${tool}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Article pages
  const articleEntries = articles.map((article) => ({
    url: `${baseUrl}/articles/${article.slug.current}`,
    lastModified: article.publishedAt ? new Date(article.publishedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    ...staticEntries,
    ...categoryEntries,
    ...guideEntries,
    ...toolEntries,
    ...articleEntries,
  ]
}
