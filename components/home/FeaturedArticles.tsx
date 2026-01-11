import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Article {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: { asset?: { url: string } };
  publishedAt?: string;
  author?: string;
  categories?: string[];
  excerpt?: string;
}

interface FeaturedArticlesProps {
  articles: Article[];
}

export default function FeaturedArticles({ articles }: FeaturedArticlesProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (!articles || articles.length === 0) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Articles coming soon
            </h2>
            <p className="text-gray-600 mb-8">
              We’re preparing new personal finance guides. Stay tuned!
            </p>
            <Link 
              href="/newsletter"
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              Notify me
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Latest articles
            </h2>
            <p className="text-gray-600">
              Fresh guides on saving, budgeting, investing, and growing income.
            </p>
          </div>
          <Link 
            href="/articles"
            className="hidden sm:flex items-center gap-2 text-gray-900 font-medium hover:text-gray-600 transition-colors"
          >
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.slice(0, 6).map((article) => (
            <Link 
              key={article._id}
              href={`/articles/${article.slug.current}`}
              className="group"
            >
              <article className="h-full">
                {/* Image */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-gray-100">
                  {article.mainImage?.asset?.url ? (
                    <Image
                      src={article.mainImage.asset.url}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div>
                  {/* Category & Date */}
                  <div className="flex items-center gap-3 mb-2">
                    {article.categories && article.categories[0] && (
                      <span className="text-sm font-medium text-blue-600">
                        {article.categories[0]}
                      </span>
                    )}
                    {article.publishedAt && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span className="text-sm text-gray-500">
                          {formatDate(article.publishedAt)}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2 mb-2">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-gray-500 text-sm line-clamp-2">
                    {article.excerpt || 'Practical tips to improve your finances...'}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-10 text-center sm:hidden">
          <Link 
            href="/articles"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-900 font-medium rounded-full hover:bg-gray-200 transition-colors"
          >
            View all articles
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
