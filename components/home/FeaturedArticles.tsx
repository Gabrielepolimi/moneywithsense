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
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!articles || articles.length === 0) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Content coming soon
            </h2>
            <p className="text-secondary-600 mb-8 max-w-md mx-auto">
              We're preparing comprehensive guides on personal finance. Subscribe to be notified when they're ready.
            </p>
            <Link 
              href="/newsletter"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-full hover:bg-primary-700 transition-all shadow-finance"
            >
              Get notified
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
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
            <span className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-2 block">
              Latest Insights
            </span>
            <h2 className="text-3xl font-bold text-secondary-900 mb-2">
              Fresh articles
            </h2>
            <p className="text-secondary-600">
              Practical guides on saving, budgeting, investing, and building income.
            </p>
          </div>
          <Link 
            href="/articles"
            className="hidden sm:flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 transition-colors group"
          >
            View all articles
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <article className="h-full bg-white rounded-2xl border border-secondary-100 overflow-hidden hover:border-primary-200 hover:shadow-card-hover transition-all">
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-secondary-100">
                  {article.mainImage?.asset?.url ? (
                    <Image
                      src={article.mainImage.asset.url}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center">
                      <svg className="w-12 h-12 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Category & Date */}
                  <div className="flex items-center gap-3 mb-3">
                    {article.categories && article.categories[0] && (
                      <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
                        {article.categories[0]}
                      </span>
                    )}
                    {article.publishedAt && (
                      <span className="text-xs text-secondary-400">
                        {formatDate(article.publishedAt)}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-secondary-500 text-sm line-clamp-2">
                    {article.excerpt || 'Practical tips to improve your financial well-being...'}
                  </p>

                  {/* Read more */}
                  <div className="mt-4 flex items-center text-sm font-medium text-primary-600 group-hover:text-primary-700">
                    Read article
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-10 text-center sm:hidden">
          <Link 
            href="/articles"
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary-100 text-secondary-900 font-medium rounded-full hover:bg-secondary-200 transition-colors"
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
