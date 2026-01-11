import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import { sanityClient } from '../../../sanityClient';
import RelatedArticlesCarousel from '../../../components/articles/RelatedArticlesCarousel';
import LikeButton from '../../../components/articles/LikeButton';
import FishingRodComparison from '../../../components/articles/FishingRodComparison';
import YouTubeEmbed from '../../../components/articles/YouTubeEmbed';

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: any;
  publishedAt: string;
  mainImage?: string;
  author: string;
  categories: Array<{
    title: string;
    slug: string;
  }>;
  fishingTechniques: Array<{
    title: string;
    slug: string;
  }>;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  seoImage?: string;
  readingTime?: number;
  status: string;
  initialLikes?: number;
  showFishingRodComparison?: boolean;
  fishingRodComparisonTitle?: string;
  selectedProducts?: Array<{
    productId: string;
    name: string;
    brand: string;
    price: number;
    length?: number;
    castingPower?: string;
    action?: string;
    experienceLevel: string;
    badge?: string;
    quickReview?: string;
    affiliateLink?: string;
    image?: string;
  }>;
  showYouTubeVideo?: boolean;
  youtubeUrl?: string;
  youtubeTitle?: string;
  youtubeDescription?: string;
  youtube?: {
    videoId: string;
    title?: string;
    channelTitle?: string;
    url?: string;
    embedUrl?: string;
    reason?: string;
    takeaways?: string[];
    metrics?: {
      views?: number;
      likeCount?: number;
      commentCount?: number;
      durationSeconds?: number;
      publishedAt?: string;
    };
  };
}

interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  mainImage?: string;
  publishedAt: string;
  author: string;
  readingTime?: number;
}

interface Props {
  params: Promise<{ slug: string }>;
}

const siteUrl = 'https://moneywithsense.com';
const categoryToPillar: Record<string, string> = {
  'personal-finance': 'personal-finance',
  'saving-money': 'saving-money',
  'investing-basics': 'investing-basics',
  'passive-income': 'passive-income',
  'budgeting': 'budgeting',
  'credit-debt': 'credit-and-debt',
  'credit-and-debt': 'credit-and-debt',
  'banking-cards': 'banking-and-cards',
  'banking-and-cards': 'banking-and-cards',
  'taxes-finance-tips': 'taxes-and-finance-tips',
  'taxes-and-finance-tips': 'taxes-and-finance-tips',
  'side-hustles': 'side-hustles',
  'money-psychology': 'money-psychology',
};

// Disabilita il build statico per ora
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1 ora

// Forza il refresh dei dati
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  
  if (!post) {
    return {
      title: 'Article not found',
      description: 'The article you are looking for does not exist.',
    };
  }

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const image = post.seoImage || post.mainImage || '';
  const keywords = post.seoKeywords || ['personal finance', 'money tips', 'budgeting', 'investing basics'];

  return {
    title,
    description,
    keywords,
    authors: [{ name: post.author }],
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: `${siteUrl}/articoli/${post.slug}`,
    },
  };
}

async function getPost(slug: string): Promise<Post | null> {
  try {
    const post = await sanityClient.fetch(`
      *[_type == "post" && slug.current == $slug && status == "published"][0] {
        _id,
        title,
        "slug": slug.current,
        excerpt,
        body,
        publishedAt,
        "mainImage": mainImage.asset->url,
        "author": author->name,
        categories[]->{
          title,
          "slug": slug.current
        },
        fishingTechniques[]->{
          title,
          "slug": slug.current
        },
        seoTitle,
        seoDescription,
        seoKeywords,
        "seoImage": seoImage.asset->url,
        readingTime,
        status,
        initialLikes,
        showFishingRodComparison,
        fishingRodComparisonTitle,
        selectedProducts,
        showYouTubeVideo,
        youtubeUrl,
        youtubeTitle,
      youtubeDescription,
      youtube
      }
    `, { slug }, {
      // Disabilita il caching per Vercel
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    return post;
  } catch (error) {
    console.error('Errore nel recupero articolo:', error);
    return null;
  }
}

async function getRelatedArticles(currentArticleId: string): Promise<Article[]> {
  try {
    const articles = await sanityClient.fetch(`
      *[_type == "post" && status == "published" && _id != $currentId && publishedAt <= $now] | order(publishedAt desc) [0...12] {
        _id,
        title,
        "slug": slug.current,
        excerpt,
        "mainImage": mainImage.asset->url,
        publishedAt,
        "author": author->name,
        readingTime
      }
    `, { 
      currentId: currentArticleId,
      now: new Date().toISOString()
    }, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    return articles || [];
  } catch (error) {
    console.error('Errore nel recupero articoli correlati:', error);
    return [];
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  // Recupera gli articoli correlati
  const relatedArticles = await getRelatedArticles(post._id);

  // Controlli di sicurezza per i dati
  if (!post.title || !post.author) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Structured Data per l'articolo
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.mainImage || '',
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'MoneyWithSense',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/images/icononly.png`
      }
    },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/articoli/${post.slug}`
    },
    articleSection: post.categories && post.categories.length > 0 ? post.categories.map((cat: any) => cat.title).join(', ') : '',
    keywords: post.seoKeywords?.join(', ') || 'personal finance, budgeting, investing',
    wordCount: post.body?.length || 0,
  };

  const primaryCategory = post.categories?.[0];
  const pillarSlug = primaryCategory ? categoryToPillar[primaryCategory.slug] : undefined;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        {/* Header */}
        <header className="mb-8 sm:mb-12">
          <div className="mb-4 sm:mb-6">
            {post.categories && post.categories.length > 0 && post.categories.map((category, index) => (
              <span
                key={category.slug || `category-${index}`}
                className="inline-block bg-emerald-50 text-emerald-700 text-sm sm:text-base px-3 sm:px-4 py-1 sm:py-2 rounded-full mr-2 sm:mr-3 mb-2 sm:mb-3 font-medium"
              >
                {category.title}
              </span>
            ))}
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            {post.title}
          </h1>
          
          {post.excerpt && (
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 space-y-2 sm:space-y-0">
            <div className="flex flex-wrap items-center space-x-4 sm:space-x-6">
              <span className="font-medium">By {post.author}</span>
              <span className="hidden sm:inline">•</span>
              <span>{formatDate(post.publishedAt)}</span>
              {post.readingTime && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span>{post.readingTime} min read</span>
                </>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <LikeButton 
                articleId={post._id} 
                initialLikes={post.initialLikes || 0} 
              />
            </div>
          </div>

        </header>

        {/* Immagine principale */}
        {post.mainImage && (
          <div className="mb-8 sm:mb-12">
            <Image
              src={post.mainImage}
              alt={post.title}
              width={1200}
              height={630}
              className="w-full h-auto rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl"
              priority
            />
          </div>
        )}

        {/* YouTube */}
        {post.youtube?.videoId || post.youtube?.embedUrl || post.youtube?.url ? (
          <div className="mb-8 sm:mb-12">
            <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                Recommended video
              </h2>
              {post.youtube.reason && (
                <p className="text-gray-700 mb-3 text-sm sm:text-base">
                  {post.youtube.reason}
                </p>
              )}
              {post.youtube.takeaways && post.youtube.takeaways.length > 0 && (
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1 text-sm sm:text-base">
                  {post.youtube.takeaways.slice(0, 3).map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              )}
              <YouTubeEmbed
                videoId={
                  post.youtube.videoId ||
                  post.youtube.embedUrl ||
                  post.youtube.url ||
                  ''
                }
                title={post.youtube.title || post.title}
                className="mt-4"
              />
              {post.youtube.channelTitle && (
                <p className="text-xs text-gray-500 mt-2">
                  Channel: {post.youtube.channelTitle}
                </p>
              )}
            </div>
          </div>
        ) : post.showYouTubeVideo && post.youtubeUrl && (
          <div className="mb-8 sm:mb-12">
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-red-200" itemScope itemType="https://schema.org/VideoObject">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800" itemProp="name">
                  📺 {post.youtubeTitle || 'Video'}
                </h3>
              </div>

              {post.youtubeDescription && (
                <div className="mb-6">
                  <div className="prose prose-sm sm:prose max-w-none text-gray-700">
                    <div className="whitespace-pre-line" itemProp="description" role="complementary" aria-label="Video description">
                      {post.youtubeDescription}
                    </div>
                  </div>
                </div>
              )}

              <YouTubeEmbed
                videoId={post.youtubeUrl}
                title={post.youtubeTitle}
                className="w-full"
              />

              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "VideoObject",
                    "name": post.youtubeTitle || "Video",
                    "description": post.youtubeDescription || "Video content",
                    "thumbnailUrl": `https://img.youtube.com/vi/${post.youtubeUrl.split('v=')[1]?.split('&')[0] || post.youtubeUrl}/maxresdefault.jpg`,
                    "embedUrl": `https://www.youtube.com/embed/${post.youtubeUrl.split('v=')[1]?.split('&')[0] || post.youtubeUrl}`,
                    "uploadDate": post.publishedAt,
                    "author": {
                      "@type": "Person",
                      "name": post.author
                    }
                  })
                }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg sm:prose-xl max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-li:text-gray-800 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">
          <PortableText value={post.body} />
        </div>

        {/* Product comparison (optional) */}
        {post.showFishingRodComparison && (
          <div className="mt-12">
            <FishingRodComparison
              customTitle={post.fishingRodComparisonTitle}
              selectedProducts={post.selectedProducts}
            />
          </div>
        )}

        {/* Pillar + Related */}
        <div className="mt-16 space-y-8">
          {pillarSlug && (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Pillar</p>
                <h3 className="text-xl font-bold text-gray-900">
                  {primaryCategory?.title || 'This topic'} Pillar
                </h3>
                <p className="text-sm text-gray-600">Deep dive on this topic with a full guide.</p>
              </div>
              <Link
                href={`/pillars/${pillarSlug}`}
                className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                View pillar
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}

          {relatedArticles.length > 0 && (
            <RelatedArticlesCarousel articles={relatedArticles.slice(0, 2)} />
          )}
        </div>
      </article>
    </>
  );
}
