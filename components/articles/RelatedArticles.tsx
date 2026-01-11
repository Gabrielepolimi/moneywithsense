import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Article {
  _id: string;
  title: string;
  slug: { current: string } | string;
  mainImage?: { asset?: { url: string } } | string;
  publishedAt?: string;
  author?: string;
  categories?: string[];
  excerpt?: string;
}

interface RelatedArticlesProps {
  articles: Article[];
  currentArticleId?: string;
}

export default function RelatedArticles({ articles, currentArticleId }: RelatedArticlesProps) {
  // Filter out current article and get up to 3 related articles
  const relatedArticles = articles
    .filter(article => article._id !== currentArticleId)
    .slice(0, 3);

  if (relatedArticles.length === 0) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSlug = (article: Article) => {
    return typeof article.slug === 'string' ? article.slug : article.slug.current;
  };

  const getImageUrl = (article: Article) => {
    if (!article.mainImage) return null;
    if (typeof article.mainImage === 'string') return article.mainImage;
    return article.mainImage.asset?.url;
  };

  return (
    <section className="py-12 bg-secondary-50 rounded-2xl">
      <div className="px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">
            Related Articles
          </h2>
          <p className="text-secondary-600">
            Continue exploring personal finance topics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedArticles.map((article) => (
            <Link 
              key={article._id}
              href={`/articles/${getSlug(article)}`}
              className="group"
            >
              <article className="bg-white rounded-xl border border-secondary-100 overflow-hidden hover:border-primary-200 hover:shadow-card-hover transition-all h-full">
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-secondary-100">
                  {getImageUrl(article) ? (
                    <Image
                      src={getImageUrl(article)!}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center">
                      <svg className="w-10 h-10 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    {article.categories && article.categories.length > 0 ? (
                      article.categories.slice(0, 1).map((category, index) => (
                        <span 
                          key={index}
                          className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full"
                        >
                          {category}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                        Finance
                      </span>
                    )}
                    {article.publishedAt && (
                      <span className="text-xs text-secondary-400">
                        {formatDate(article.publishedAt)}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-base font-semibold text-secondary-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {article.title}
                  </h3>
                  
                  <p className="text-secondary-500 text-sm line-clamp-2">
                    {article.excerpt || 'Practical tips to improve your financial well-being...'}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link 
            href="/articles"
            className="inline-flex items-center px-5 py-2.5 text-primary-600 font-medium hover:text-primary-700 transition-colors"
          >
            View All Articles
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
