import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Sanity Client Configuration
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'z0g6hj8g',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-08-10',
  useCdn: process.env.NODE_ENV === 'production',
  token: process.env.SANITY_API_TOKEN,
});

// Image URL builder
const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: unknown) {
  return builder.image(source);
}

// Query for articles
export const articlesQuery = `
  *[_type == "article"] {
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
    tags[]->{
      _id,
      title,
      slug
    },
    content,
    readingTime,
    difficulty,
    targetAudience,
    financeTopics[]->{
      _id,
      title,
      slug
    },
    newsletterFeatured,
    newsletterPriority
  } | order(publishedAt desc)
`;

// Query for articles with targeting
export const targetedArticlesQuery = `
  *[_type == "article" && (
    $topics in financeTopics[]->slug ||
    $difficulty == difficulty ||
    $categories in categories[]->slug
  )] {
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
    tags[]->{
      _id,
      title,
      slug
    },
    content,
    readingTime,
    difficulty,
    targetAudience,
    financeTopics[]->{
      _id,
      title,
      slug
    },
    newsletterFeatured,
    newsletterPriority
  } | order(publishedAt desc) [0...$limit]
`;

// Query for newsletter
export const newsletterArticlesQuery = `
  *[_type == "article" && newsletterFeatured == true] | order(newsletterPriority desc, publishedAt desc) [0...5] {
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
    tags[]->{
      _id,
      title,
      slug
    },
    readingTime,
    difficulty,
    financeTopics[]->{
      _id,
      title,
      slug
    }
  }
`;

export default sanityClient;
