'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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

interface RelatedArticlesCarouselProps {
  articles: Article[];
}

export default function RelatedArticlesCarousel({ articles }: RelatedArticlesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const itemsPerView = 3;
  const maxIndex = Math.max(0, articles.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (articles.length === 0) {
    return (
      <div className="mt-16 pt-10 border-t border-secondary-200">
        <h2 className="text-2xl font-bold text-secondary-900 mb-8">More Articles</h2>
        <div className="text-center py-8">
          <p className="text-secondary-500 text-lg">No other articles available at the moment.</p>
          <p className="text-secondary-400 text-sm mt-2">Check back soon for new content!</p>
        </div>
      </div>
    );
  }

  const articlesToShow = articles.length <= itemsPerView 
    ? articles 
    : articles.slice(currentIndex, currentIndex + itemsPerView);

  return (
    <div className="mt-16 pt-10 border-t border-secondary-200">
      <h2 className="text-2xl font-bold text-secondary-900 mb-8">More Articles</h2>
      
      <div className="relative">
        {/* Carousel container */}
        <div className="flex space-x-6 overflow-hidden">
          {articlesToShow.map((article) => (
            <div key={article._id} className="flex-shrink-0 w-80 sm:w-96">
              <Link href={`/articles/${article.slug}`} className="group">
                <div className="bg-white rounded-2xl border border-secondary-100 overflow-hidden hover:border-primary-200 hover:shadow-card-hover transition-all">
                  {/* Image */}
                  {article.mainImage ? (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={article.mainImage}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center">
                      <svg className="w-12 h-12 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    
                    {article.excerpt && (
                      <p className="text-secondary-500 text-sm mb-4 line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                    
                    {/* Meta info */}
                    <div className="flex items-center justify-between text-xs text-secondary-400">
                      <span>{formatDate(article.publishedAt)}</span>
                      {article.readingTime && (
                        <span>{article.readingTime} min read</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Navigation buttons */}
        {articles.length > itemsPerView && (
          <>
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white border border-secondary-200 rounded-full p-3 shadow-lg z-10 ${
                currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:border-primary-200'
              }`}
              aria-label="Previous article"
            >
              <svg className="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={nextSlide}
              disabled={currentIndex >= maxIndex}
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white border border-secondary-200 rounded-full p-3 shadow-lg z-10 ${
                currentIndex >= maxIndex ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:border-primary-200'
              }`}
              aria-label="Next article"
            >
              <svg className="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Dots indicator */}
        {articles.length > itemsPerView && maxIndex > 0 && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-primary-600' : 'bg-secondary-300'
                }`}
                aria-label={`Go to group ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
