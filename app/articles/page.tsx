import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getPosts } from '../../lib/getPosts';

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Browse all personal finance articles on MoneyWithSense - practical guides on saving, budgeting, investing, and building income.',
};

const categories = [
  { name: 'All', slug: 'all' },
  { name: 'Personal Finance', slug: 'personal-finance' },
  { name: 'Saving Money', slug: 'saving-money' },
  { name: 'Budgeting', slug: 'budgeting' },
  { name: 'Investing', slug: 'investing-basics' },
  { name: 'Side Hustles', slug: 'side-hustles' },
  { name: 'Credit & Debt', slug: 'credit-debt' },
];

export default async function ArticlesPage() {
  const articles = await getPosts();

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-b from-secondary-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-4 block">
              Learn & Grow
            </span>
            <h1 className="text-4xl font-bold text-secondary-900 mb-4">
              All Articles
            </h1>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Practical, actionable guides to help you take control of your finances.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={cat.slug === 'all' ? '/articles' : `/categories/${cat.slug}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  cat.slug === 'all'
                    ? 'bg-secondary-900 text-white'
                    : 'bg-white border border-secondary-200 text-secondary-600 hover:border-primary-300 hover:text-primary-600'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {articles && articles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article: {
                _id: string;
                title: string;
                slug: { current: string };
                mainImage?: { asset?: { url: string } };
                publishedAt?: string;
                categories?: string[];
                excerpt?: string;
              }) => (
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
                      <h2 className="text-lg font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                        {article.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-secondary-500 text-sm line-clamp-2 mb-4">
                        {article.excerpt || 'Practical tips to improve your financial well-being...'}
                      </p>

                      {/* Read more */}
                      <div className="flex items-center text-sm font-medium text-primary-600 group-hover:text-primary-700">
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
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                Articles coming soon
              </h2>
              <p className="text-secondary-600 mb-8 max-w-md mx-auto">
                We're working on comprehensive guides to help you with your financial journey. Subscribe to be notified when they're ready.
              </p>
              <Link
                href="/newsletter"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-full hover:bg-primary-700 transition-all"
              >
                Get notified
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-secondary-50 border-t border-secondary-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">
            Never miss an article
          </h2>
          <p className="text-secondary-600 mb-8">
            Get weekly personal finance insights delivered straight to your inbox.
          </p>
          <Link
            href="/newsletter"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-full hover:bg-primary-700 transition-all"
          >
            Subscribe to Newsletter
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
