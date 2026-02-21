import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PortableText, PortableTextComponents } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import { sanityClient } from '../../../sanityClient';
import RelatedArticlesCarousel from '../../../components/articles/RelatedArticlesCarousel';
import LikeButton from '../../../components/articles/LikeButton';
import YouTubeEmbed from '../../../components/articles/YouTubeEmbed';
// AdPlaceholder temporarily disabled
// import AdPlaceholder from '../../../components/ads/AdPlaceholder';
import AuthorBox from '../../../components/articles/AuthorBox';

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: PortableTextBlock[];
  publishedAt: string;
  mainImage?: string;
  author: string;
  categories: Array<{
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
const categoryToGuide: Record<string, string> = {
  'personal-finance': 'personal-finance-guide',
  'saving-money': 'saving-money-guide',
  'budgeting': 'budgeting-guide',
  'investing-basics': 'investing-basics-guide',
  'passive-income': 'passive-income-guide',
  'credit-debt': 'credit-debt-guide',
  'banking-cards': 'banking-cards-guide',
  'taxes-tips': 'taxes-guide',
  'side-hustles': 'side-hustles-guide',
  'money-psychology': 'money-psychology-guide',
};

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

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
      canonical: `${siteUrl}/articles/${post.slug}`,
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
        seoTitle,
        seoDescription,
        seoKeywords,
        "seoImage": seoImage.asset->url,
        readingTime,
        status,
        initialLikes,
        showYouTubeVideo,
        youtubeUrl,
        youtubeTitle,
        youtubeDescription,
        youtube
      }
    `, { slug }, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    return post;
  } catch (error) {
    console.error('Error fetching article:', error);
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
    console.error('Error fetching related articles:', error);
    return [];
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(post._id);

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

  // Extract FAQ from body (look for FAQ section)
  function extractFAQFromBody(body: PortableTextBlock[]): Array<{ question: string; answer: string }> {
    const faqs: Array<{ question: string; answer: string }> = [];
    let inFAQSection = false;
    let currentQuestion = '';
    let currentAnswer: string[] = [];
    
    for (const block of body) {
      if (block._type === 'block') {
        // Check if this is an H3 (FAQ question)
        if (block.style === 'h3') {
          const questionText = block.children
            ?.map((child: any) => child.text || '')
            .join('')
            .trim() || '';
          
          // If we were collecting an answer, save previous FAQ
          if (currentQuestion && currentAnswer.length > 0) {
            faqs.push({
              question: currentQuestion,
              answer: currentAnswer.join(' ').trim()
            });
            currentAnswer = [];
          }
          
          // Check if this looks like a question (contains ? or starts with common FAQ patterns)
          if (questionText.includes('?') || 
              /^(what|how|why|when|where|is|are|can|do|does|will)/i.test(questionText)) {
            inFAQSection = true;
            currentQuestion = questionText.replace(/^###\s*/, '').trim();
          } else {
            inFAQSection = false;
          }
        } else if (inFAQSection && block.style === 'normal' && currentQuestion) {
          // Collect answer text
          const answerText = block.children
            ?.map((child: any) => child.text || '')
            .join('')
            .trim() || '';
          if (answerText) {
            currentAnswer.push(answerText);
          }
        } else if (block.style === 'h2') {
          // If we hit another H2, check if it's the FAQ section
          const headingText = block.children
            ?.map((child: any) => child.text || '')
            .join('')
            .toLowerCase() || '';
          if (headingText.includes('faq') || headingText.includes('frequently asked')) {
            inFAQSection = true;
          } else if (inFAQSection) {
            // We've left the FAQ section
            if (currentQuestion && currentAnswer.length > 0) {
              faqs.push({
                question: currentQuestion,
                answer: currentAnswer.join(' ').trim()
              });
            }
            inFAQSection = false;
            currentQuestion = '';
            currentAnswer = [];
          }
        }
      }
    }
    
    // Save last FAQ if exists
    if (currentQuestion && currentAnswer.length > 0) {
      faqs.push({
        question: currentQuestion,
        answer: currentAnswer.join(' ').trim()
      });
    }
    
    return faqs;
  }
  
  const faqs = extractFAQFromBody(post.body);
  
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.mainImage || '',
    author: {
      '@type': 'Organization',
      name: 'MoneyWithSense Editorial Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'MoneyWithSense',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/images/logo.svg`
      }
    },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/articles/${post.slug}`
    },
    articleSection: post.categories?.map(cat => cat.title).join(', ') || '',
    keywords: post.seoKeywords?.join(', ') || 'personal finance, budgeting, investing',
  };
  
  // Generate FAQ schema if FAQs exist
  const faqJsonLd = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  } : null;

  const primaryCategory = post.categories?.[0];
  const guideSlug = primaryCategory ? categoryToGuide[primaryCategory.slug] : undefined;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center gap-2 text-secondary-500">
            <li><Link href="/" className="hover:text-primary-600">Home</Link></li>
            <li>/</li>
            <li><Link href="/articles" className="hover:text-primary-600">Articles</Link></li>
            {primaryCategory && (
              <>
                <li>/</li>
                <li>
                  <Link href={`/categories/${primaryCategory.slug}`} className="hover:text-primary-600">
                    {primaryCategory.title}
                  </Link>
                </li>
              </>
            )}
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-8 sm:mb-12">
          <div className="mb-4 sm:mb-6">
            {post.categories?.map((category, index) => (
              <Link
                key={category.slug || `category-${index}`}
                href={`/categories/${category.slug}`}
                className="inline-block bg-primary-50 text-primary-700 text-sm px-3 py-1.5 rounded-full mr-2 mb-2 font-medium hover:bg-primary-100 transition-colors"
              >
                {category.title}
              </Link>
            ))}
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary-900 mb-4 sm:mb-6 leading-tight">
            {post.title}
          </h1>
          
          {post.excerpt && (
            <p className="text-lg sm:text-xl text-secondary-600 mb-6 sm:mb-8 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-secondary-500 mb-6 sm:mb-8 gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-medium text-secondary-700">MoneyWithSense Team</span>
              <span className="hidden sm:inline text-secondary-300">•</span>
              <span>{formatDate(post.publishedAt)}</span>
              {post.readingTime && (
                <>
                  <span className="hidden sm:inline text-secondary-300">•</span>
                  <span>{post.readingTime} min read</span>
                </>
              )}
            </div>
            {(post.initialLikes != null && post.initialLikes > 0) && (
              <div className="flex items-center gap-4">
                <LikeButton 
                  articleId={post._id} 
                  initialLikes={post.initialLikes} 
                />
              </div>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {post.mainImage && (
          <div className="mb-8 sm:mb-12">
            <Image
              src={post.mainImage}
              alt={post.title}
              width={1200}
              height={630}
              className="w-full h-auto rounded-2xl shadow-card"
              priority
            />
          </div>
        )}

        {/* Disclaimer before content */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
          <p className="text-amber-800 text-sm">
            <strong>Disclaimer:</strong> This article is for educational purposes only and does not constitute financial advice. 
            Always consult with a qualified professional before making financial decisions.
          </p>
        </div>

        {/* YouTube Video (if any) */}
        {(post.youtube?.videoId || post.showYouTubeVideo) && (
          <div className="mb-8 sm:mb-12">
            <div className="bg-secondary-50 rounded-xl p-5 sm:p-6 border border-secondary-200">
              <h2 className="text-xl font-semibold text-secondary-900 mb-3 flex items-center gap-2">
                <span>📺</span> Recommended Video
              </h2>
              {post.youtube?.reason && (
                <p className="text-secondary-600 mb-4 text-sm">
                  {post.youtube.reason}
                </p>
              )}
              <YouTubeEmbed
                videoId={
                  post.youtube?.videoId ||
                  post.youtube?.embedUrl ||
                  post.youtubeUrl ||
                  ''
                }
                title={post.youtube?.title || post.youtubeTitle || post.title}
              />
            </div>
          </div>
        )}

        {/* Ad placeholder temporarily disabled */}
        {/* <AdPlaceholder type="inline" /> */}

        {/* Content */}
        <div className="prose prose-lg max-w-none prose-headings:text-secondary-900 prose-p:text-secondary-700 prose-li:text-secondary-700 prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-secondary-900">
          <PortableText value={post.body} />
        </div>

        {/* Ad placeholder temporarily disabled */}
        {/* <AdPlaceholder type="inline" /> */}

        {/* Author Box */}
        <AuthorBox className="mt-12" />

        {/* Guide + Related */}
        <div className="mt-16 space-y-8">
          {/* Link to Guide */}
          {guideSlug && (
            <div className="rounded-2xl border border-primary-100 bg-primary-50 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-primary-700 uppercase tracking-wide">Complete Guide</p>
                <h3 className="text-xl font-bold text-secondary-900">
                  {primaryCategory?.title} Guide
                </h3>
                <p className="text-sm text-secondary-600">Explore the complete guide on this topic.</p>
              </div>
              <Link
                href={`/guides/${guideSlug}`}
                className="inline-flex items-center px-5 py-2.5 rounded-full bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                View Guide
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <RelatedArticlesCarousel articles={relatedArticles.slice(0, 3)} />
          )}

          {/* Newsletter CTA */}
          <div className="bg-secondary-900 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-3">
              Enjoyed this article?
            </h3>
            <p className="text-secondary-300 mb-6">
              Get more personal finance insights delivered to your inbox weekly.
            </p>
            <Link
              href="/newsletter"
              className="inline-flex items-center px-6 py-3 bg-primary-500 text-white font-medium rounded-full hover:bg-primary-400 transition-colors"
            >
              Subscribe Free
            </Link>
          </div>
        </div>

        {/* Final Disclaimer */}
        <div className="mt-12 pt-8 border-t border-secondary-200">
          <p className="text-xs text-secondary-500">
            The information provided in this article is for general informational and educational purposes only. 
            It is not intended as, and should not be construed as, financial, legal, or investment advice. 
            MoneyWithSense is not a licensed financial advisor. Always consult with qualified professionals regarding your specific situation.
          </p>
        </div>
      </article>
    </>
  );
}
