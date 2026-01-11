import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Configurazione Sanity Client
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'YOUR_SANITY_PROJECT_ID',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-08-10',
  useCdn: process.env.NODE_ENV === 'production',
  token: process.env.SANITY_API_TOKEN,
});

// Builder per URL immagini
const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}

// Query per articoli
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
    fishingTechniques[]->{
      _id,
      title,
      slug
    },
    targetSpecies[]->{
      _id,
      title,
      slug
    },
    environments[]->{
      _id,
      title,
      slug
    },
    seasons[]->{
      _id,
      title,
      slug
    },
    newsletterFeatured,
    newsletterPriority
  } | order(publishedAt desc)
`;

// Query per articoli con targeting
export const targetedArticlesQuery = `
  *[_type == "article" && (
    $techniques in fishingTechniques[]->slug ||
    $species in targetSpecies[]->slug ||
    $environments in environments[]->slug ||
    $seasons in seasons[]->slug ||
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
    fishingTechniques[]->{
      _id,
      title,
      slug
    },
    targetSpecies[]->{
      _id,
      title,
      slug
    },
    environments[]->{
      _id,
      title,
      slug
    },
    seasons[]->{
      _id,
      title,
      slug
    },
    newsletterFeatured,
    newsletterPriority
  } | order(publishedAt desc) [0...$limit]
`;

// Query per newsletter
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
    fishingTechniques[]->{
      _id,
      title,
      slug
    },
    targetSpecies[]->{
      _id,
      title,
      slug
    },
    environments[]->{
      _id,
      title,
      slug
    },
    seasons[]->{
      _id,
      title,
      slug
    }
  }
`;

export default sanityClient;
