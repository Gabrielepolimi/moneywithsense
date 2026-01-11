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

interface Category {
  name: string;
  slug: string;
  color: string;
}

interface CategoryArticlesProps {
  category: Category;
  articles: Article[];
}

const categoryIcons: Record<string, string> = {
  'personal-finance': '💼',
  'saving-money': '💰',
  'budgeting': '📊',
  'investing-basics': '📈',
  'passive-income': '🔄',
  'credit-debt': '💳',
  'banking-cards': '🏦',
  'taxes-tips': '📋',
  'side-hustles': '🚀',
  'money-psychology': '🧠',
};

export default function CategoryArticles({ category, articles }: CategoryArticlesProps) {
  const categoryArticles = articles.filter(article =>
    article.categories?.some(cat =>
      cat.toLowerCase().replace(/\s+/g, '-').includes(category.slug.toLowerCase()) ||
      cat.toLowerCase().includes(category.name.toLowerCase())
    )
  );

  if (categoryArticles.length === 0) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const icon = categoryIcons[category.slug] || '📄';

  return (
    <section className="py-16 bg-white border-t border-secondary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <h2 className="text-2xl font-bold text-secondary-900">
                {category.name}
              </h2>
              <p className="text-secondary-500 text-sm">
                {categoryArticles.length} {categoryArticles.length === 1 ? 'article' : 'articles'}
              </p>
            </div>
          </div>
          <Link 
            href={`/categories/${category.slug}`}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-1 group"
          >
            View all
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Horizontal Scroll */}
        <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
          {categoryArticles.slice(0, 8).map((article) => (
            <Link
              key={article._id}
              href={`/articles/${article.slug.current}`}
              className="flex-shrink-0 w-80 snap-start group"
            >
              <article className="bg-white rounded-2xl border border-secondary-100 overflow-hidden hover:border-primary-200 hover:shadow-card-hover transition-all">
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
                      <span className="text-4xl">{icon}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  {article.publishedAt && (
                    <span className="text-xs text-secondary-400 mb-2 block">
                      {formatDate(article.publishedAt)}
                    </span>
                  )}
                  <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-secondary-500 line-clamp-2">
                    {article.excerpt || 'Learn practical tips and strategies...'}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
