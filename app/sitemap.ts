import { MetadataRoute } from 'next'
import { getPosts } from '../lib/getPosts'
import { getAllCities, getAllComparePairParams } from '../lib/cities'

const baseUrl = 'https://moneywithsense.com'

/**
 * Task 6 — consolidated sitemap (legal/utility pages excluded).
 * ~603 URLs: home + hubs + categories + articles + cities + compare + tools.
 */
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
  'cost-of-living',
]

const tools = [
  'savings-goal',
  'salary-checker',
  'relocation-calculator',
  'budget-planner',
  'cost-of-living-index',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let articles: { slug: string | { current: string }; publishedAt?: string }[] = []
  try {
    articles = await getPosts({ excludeCostOfLivingCategory: true })
  } catch {
    console.error('Failed to fetch posts for sitemap')
    articles = []
  }

  const core: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/cities`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/compare`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/tools`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/articles`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ]

  const categoryEntries: MetadataRoute.Sitemap = categories.map((slug) => ({
    url: `${baseUrl}/categories/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  const toolEntries: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${baseUrl}/tools/${tool}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/articles/${typeof article.slug === 'string' ? article.slug : article.slug?.current}`,
    lastModified: article.publishedAt ? new Date(article.publishedAt) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  let cityEntries: MetadataRoute.Sitemap = []
  try {
    cityEntries = getAllCities().map((city) => ({
      url: `${baseUrl}/cities/${city.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.85,
    }))
  } catch {
    cityEntries = []
  }

  let compareEntries: MetadataRoute.Sitemap = []
  try {
    compareEntries = getAllComparePairParams().map(({ pair }) => ({
      url: `${baseUrl}/compare/${pair}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.75,
    }))
  } catch {
    compareEntries = []
  }

  return [...core, ...categoryEntries, ...toolEntries, ...articleEntries, ...cityEntries, ...compareEntries]
}
