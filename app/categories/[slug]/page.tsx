import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { getPosts } from '../../../lib/getPosts';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const siteUrl = 'https://moneywithsense.com';

const categories = [
  { slug: 'personal-finance', name: 'Personal Finance', description: 'Core concepts and foundations of managing your money effectively.', keywords: 'personal finance, money management, financial planning', icon: '💼' },
  { slug: 'saving-money', name: 'Saving Money', description: 'Practical strategies to reduce expenses and grow your savings.', keywords: 'saving money, frugal tips, emergency fund, save more', icon: '💰' },
  { slug: 'budgeting', name: 'Budgeting', description: 'Budget methods, templates, and tips that actually work.', keywords: 'budgeting, budget templates, 50/30/20, zero-based budget', icon: '📊' },
  { slug: 'investing-basics', name: 'Investing Basics', description: 'Introduction to stocks, ETFs, retirement accounts, and building wealth.', keywords: 'investing basics, stock market, index funds, retirement', icon: '📈' },
  { slug: 'passive-income', name: 'Passive Income', description: 'Ways to earn money with minimal ongoing effort.', keywords: 'passive income, dividends, rental income, royalties', icon: '🔄' },
  { slug: 'credit-debt', name: 'Credit & Debt', description: 'Managing credit scores, paying off debt, and using credit wisely.', keywords: 'credit score, debt payoff, credit cards, loans', icon: '💳' },
  { slug: 'banking-cards', name: 'Banking & Cards', description: 'Choosing the right bank accounts, credit cards, and maximizing benefits.', keywords: 'bank accounts, credit cards, high-yield savings, rewards', icon: '🏦' },
  { slug: 'taxes-tips', name: 'Taxes & Tips', description: 'Tax basics, deductions, and strategies for everyday people.', keywords: 'tax tips, deductions, tax planning, filing taxes', icon: '📋' },
  { slug: 'side-hustles', name: 'Side Hustles', description: 'Ideas and strategies for earning extra income outside your job.', keywords: 'side hustles, freelancing, gig economy, extra income', icon: '🚀' },
  { slug: 'money-psychology', name: 'Money Psychology', description: 'Understanding your relationship with money and building better habits.', keywords: 'money mindset, financial habits, behavioral finance', icon: '🧠' },
];

function slugifyCategory(value?: string) {
  if (!value) return '';
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function generateStaticParams() {
  return categories.map(({ slug }) => ({ slug }));
}

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    return {
      title: 'Category not found',
      description: 'The category you are looking for does not exist.',
    };
  }

  const title = `${category.name} Articles`;
  const canonicalUrl = `${siteUrl}/categories/${slug}`;

  return {
    title,
    description: category.description,
    keywords: category.keywords,
    authors: [{ name: 'MoneyWithSense Team' }],
    robots: 'index, follow',
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${title} | MoneyWithSense`,
      description: category.description,
      url: canonicalUrl,
      siteName: 'MoneyWithSense',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: category.description,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const posts = await getPosts();
  const categoryPosts = posts.filter((post: { categories?: (string | { title: string })[] }) =>
    post.categories?.some((cat) => {
      const catTitle = typeof cat === 'object' ? cat.title : cat;
      return slugifyCategory(catTitle) === slug || 
             catTitle.toLowerCase().includes(category.name.toLowerCase());
    })
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-b from-secondary-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm">
            <ol className="flex items-center gap-2 text-secondary-500">
              <li><Link href="/" className="hover:text-primary-600">Home</Link></li>
              <li>/</li>
              <li><Link href="/categories" className="hover:text-primary-600">Categories</Link></li>
              <li>/</li>
              <li className="text-secondary-900 font-medium">{category.name}</li>
            </ol>
          </nav>

          <div className="text-center">
            <span className="text-5xl mb-4 block">{category.icon}</span>
            <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
              {category.name}
            </h1>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto mb-6">
              {category.description}
            </p>
            <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-primary-50 text-primary-700 border border-primary-100">
              {categoryPosts.length} {categoryPosts.length === 1 ? 'article' : 'articles'}
            </span>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {categoryPosts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-secondary-900 mb-2">Articles coming soon</h2>
              <p className="text-secondary-600 mb-8">
                We're working on content for this category. Subscribe to get notified.
              </p>
              <Link
                href="/newsletter"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-full hover:bg-primary-700 transition-all"
              >
                Get notified
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categoryPosts.map((post: {
                _id: string;
                title: string;
                slug: { current: string };
                mainImage?: { asset?: { url: string } };
                publishedAt?: string;
                excerpt?: string;
                categories?: (string | { title: string })[];
              }) => (
                <article key={post._id} className="group">
                  <Link href={`/articles/${post.slug.current}`}>
                    <div className="bg-white rounded-2xl border border-secondary-100 overflow-hidden hover:border-primary-200 hover:shadow-card-hover transition-all">
                      <div className="relative aspect-[16/10] overflow-hidden bg-secondary-100">
                        {post.mainImage?.asset?.url ? (
                          <Image
                            src={post.mainImage.asset.url}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center">
                            <span className="text-4xl">{category.icon}</span>
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
                            {category.name}
                          </span>
                          {post.publishedAt && (
                            <span className="text-xs text-secondary-400">
                              {formatDate(post.publishedAt)}
                            </span>
                          )}
                        </div>

                        <h2 className="text-lg font-semibold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {post.title}
                        </h2>

                        <p className="text-secondary-500 text-sm line-clamp-2 mb-4">
                          {post.excerpt || 'Practical tips to improve your financial well-being...'}
                        </p>

                        <span className="text-sm font-medium text-primary-600 flex items-center gap-1">
                          Read article
                          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Other Categories */}
      <section className="py-16 bg-secondary-50 border-t border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-8 text-center">
            Explore Other Categories
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.filter(c => c.slug !== slug).map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-secondary-200 text-sm font-medium text-secondary-700 hover:border-primary-300 hover:text-primary-600 transition-all"
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
