import { sanityClient } from '../../sanityClient';

export interface UserPreferences {
  interests: {
    topics: string[];
  };
}

export interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  mainImage: string;
  author: string;
  categories: Array<{ _id: string; title: string; slug: string }>;
  financeTopics: Array<{ _id: string; title: string; slug: string }>;
}

export interface ScoredArticle extends Article {
  score: number;
  matchReasons: string[];
}

// Calculate matching score between user and article
export function calculateArticleScore(user: UserPreferences, article: Article): ScoredArticle {
  let score = 0;
  const matchReasons: string[] = [];

  // Matching for finance topics (weight: 100%)
  const topicMatches = user.interests.topics.filter(topic =>
    article.financeTopics?.some(art => art.slug === topic) || 
    article.categories?.some(cat => cat.slug === topic) || 
    false
  );
  if (topicMatches.length > 0) {
    score += 100 * (topicMatches.length / user.interests.topics.length);
    matchReasons.push(`Topics: ${topicMatches.join(', ')}`);
  }

  return {
    ...article,
    score: Math.round(score * 100) / 100,
    matchReasons
  };
}

// Fetch articles for newsletter (uses existing POSTs)
export async function getNewsletterArticles(user: UserPreferences): Promise<ScoredArticle[]> {
  try {
    // Query for existing POSTs
    const articles = await sanityClient.fetch(`
      *[_type == "post"] | order(publishedAt desc) [0...10] {
        _id,
        title,
        slug,
        excerpt,
        publishedAt,
        "mainImage": mainImage.asset->url,
        "author": author->name,
        categories[]->{
          _id,
          title,
          slug
        },
        financeTopics[]->{
          _id,
          title,
          slug
        }
      }
    `);

    // Calculate scores and sort
    const scoredArticles = articles
      .map((article: Article) => calculateArticleScore(user, article))
      .sort((a: ScoredArticle, b: ScoredArticle) => b.score - a.score) // Sort by score descending
      .slice(0, 5); // Take top 5

    return scoredArticles;
  } catch (error) {
    console.error('Error fetching newsletter articles:', error);
    return [];
  }
}

// Analyze user preferences for suggestions
export function analyzeUserPreferences(user: UserPreferences) {
  const analysis = {
    totalInterests: 0,
    topicCount: user.interests.topics.length,
    suggestions: [] as string[]
  };

  analysis.totalInterests = analysis.topicCount;

  // Suggestions based on data
  if (analysis.totalInterests < 2) {
    analysis.suggestions.push('Add more finance topics to receive more personalized content');
  }

  if (analysis.topicCount === 0) {
    analysis.suggestions.push('Select your preferred finance topics');
  }

  return analysis;
}
