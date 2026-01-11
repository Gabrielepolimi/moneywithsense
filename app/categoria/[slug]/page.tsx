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
  { slug: 'personal-finance', name: 'Personal Finance', description: 'Foundations for managing money wisely, step by step.', keywords: 'personal finance, money basics, financial planning', color: 'emerald' },
  { slug: 'saving-money', name: 'Saving Money', description: 'Practical ways to spend less and build a safety net.', keywords: 'saving money, frugal tips, emergency fund', color: 'blue' },
  { slug: 'investing-basics', name: 'Investing Basics', description: 'Simple investing concepts for beginners.', keywords: 'investing basics, beginner investing, ETFs', color: 'indigo' },
  { slug: 'passive-income', name: 'Passive Income', description: 'Ideas and frameworks to earn while you sleep.', keywords: 'passive income, cash flow, dividends', color: 'orange' },
  { slug: 'budgeting', name: 'Budgeting', description: 'Build a budget that actually works for you.', keywords: 'budgeting, budget templates, zero-based budget', color: 'teal' },
  { slug: 'credit-and-debt', name: 'Credit & Debt', description: 'Use credit wisely and pay down debt with a plan.', keywords: 'credit score, debt payoff, loans', color: 'amber' },
  { slug: 'banking-and-cards', name: 'Banking & Cards', description: 'Pick accounts and cards that fit your needs.', keywords: 'bank accounts, credit cards, fees', color: 'violet' },
  { slug: 'taxes-and-finance-tips', name: 'Taxes & Finance Tips', description: 'Essentials for taxes and day-to-day money decisions.', keywords: 'tax tips, finance tips, deductions', color: 'cyan' },
  { slug: 'side-hustles', name: 'Side Hustles', description: 'Earn more with flexible, low-barrier ideas.', keywords: 'side hustles, earn extra, freelancing', color: 'rose' },
  { slug: 'money-psychology', name: 'Money Psychology', description: 'Mindset, habits, and behavior change around money.', keywords: 'money mindset, financial habits, behavior', color: 'slate' },
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
      title: 'Category not found | Money With Sense',
      description: 'The category you are looking for does not exist.',
    };
  }

  const title = `${category.name} | Money With Sense`;
  const canonicalUrl = `${siteUrl}/categoria/${slug}`;

  return {
    title,
    description: category.description,
    keywords: category.keywords,
    authors: [{ name: 'Money With Sense Team' }],
    robots: 'index, follow',
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description: category.description,
      url: canonicalUrl,
      siteName: 'Money With Sense',
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
  const categoryPosts = posts.filter((post) =>
    post.categories?.some((cat: any) => slugifyCategory(typeof cat === 'object' ? cat.title : cat) === slug)
  );

  const colors = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
  }[category?.color || 'slate'];

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className={`py-16 ${colors.bg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
              ← Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {category?.name}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {category?.description}
            </p>
            <div className="mt-4">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${colors.text} ${colors.bg} ${colors.border}`}>
                {categoryPosts.length} articles
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {categoryPosts.length === 0 ? (
            <div className="text-center text-gray-600">
              No articles yet for this category. New content is on the way.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categoryPosts.map((post: any) => (
                <article key={post._id} className="group">
                  <Link href={`/articoli/${post.slug.current}`}>
                    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                      <div className="relative h-48 overflow-hidden">
                        {post.mainImage?.asset?.url ? (
                          <Image
                            src={post.mainImage.asset.url}
                            alt={post.title}
                            width={400}
                            height={200}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          {post.categories && post.categories.length > 0 ? (
                            post.categories.slice(0, 2).map((categoryItem: any, index: number) => (
                              <span
                                key={index}
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  index === 0 ? `${colors.text} ${colors.bg}` : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {typeof categoryItem === 'object' ? categoryItem.title : categoryItem}
                              </span>
                            ))
                          ) : (
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors.text} ${colors.bg}`}>
                              {category?.name}
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {post.excerpt || 'Clear, practical tips to manage your money better.'}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {formatDate(post.publishedAt)}
                          </span>
                          <span className={`text-sm font-medium ${colors.text}`}>
                            Read more →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
