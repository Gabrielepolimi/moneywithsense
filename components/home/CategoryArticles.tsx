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

export default function CategoryArticles({ category, articles }: CategoryArticlesProps) {
  const categoryArticles = articles.filter(article =>
    article.categories?.some(cat =>
      cat.toLowerCase().includes(category.slug.toLowerCase())
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

  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {category.name}
            </h2>
            <p className="text-gray-500 text-sm">
              {categoryArticles.length} {categoryArticles.length === 1 ? 'article' : 'articles'}
            </p>
          </div>
          <Link 
            href={`/categories/${category.slug}`}
            className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors flex items-center gap-1"
          >
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="flex-shrink-0 w-72 snap-start group"
            >
              <article>
                {/* Image */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gray-100">
                  {article.mainImage?.asset?.url ? (
                    <Image
                      src={article.mainImage.asset.url}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div>
                  {article.publishedAt && (
                    <span className="text-xs text-gray-400 mb-1 block">
                      {formatDate(article.publishedAt)}
                    </span>
                  )}
                  <h3 className="font-medium text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
