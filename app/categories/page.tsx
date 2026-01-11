import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Browse all personal finance topics on MoneyWithSense - from budgeting and saving to investing and side hustles.',
};

const categories = [
  {
    name: 'Personal Finance',
    slug: 'personal-finance',
    description: 'Core concepts and foundations of managing your money effectively.',
    icon: '💼',
    color: 'bg-blue-50 border-blue-100 text-blue-700',
    articles: 15,
  },
  {
    name: 'Saving Money',
    slug: 'saving-money',
    description: 'Practical strategies to reduce expenses and grow your savings.',
    icon: '💰',
    color: 'bg-green-50 border-green-100 text-green-700',
    articles: 12,
  },
  {
    name: 'Budgeting',
    slug: 'budgeting',
    description: 'Budget methods, templates, and tips that actually work.',
    icon: '📊',
    color: 'bg-indigo-50 border-indigo-100 text-indigo-700',
    articles: 10,
  },
  {
    name: 'Investing Basics',
    slug: 'investing-basics',
    description: 'Introduction to stocks, ETFs, retirement accounts, and building wealth.',
    icon: '📈',
    color: 'bg-purple-50 border-purple-100 text-purple-700',
    articles: 14,
  },
  {
    name: 'Passive Income',
    slug: 'passive-income',
    description: 'Ways to earn money with minimal ongoing effort.',
    icon: '🔄',
    color: 'bg-teal-50 border-teal-100 text-teal-700',
    articles: 8,
  },
  {
    name: 'Credit & Debt',
    slug: 'credit-debt',
    description: 'Managing credit scores, paying off debt, and using credit wisely.',
    icon: '💳',
    color: 'bg-orange-50 border-orange-100 text-orange-700',
    articles: 11,
  },
  {
    name: 'Banking & Cards',
    slug: 'banking-cards',
    description: 'Choosing the right bank accounts, credit cards, and maximizing benefits.',
    icon: '🏦',
    color: 'bg-cyan-50 border-cyan-100 text-cyan-700',
    articles: 9,
  },
  {
    name: 'Taxes & Tips',
    slug: 'taxes-tips',
    description: 'Tax basics, deductions, and strategies for everyday people.',
    icon: '📋',
    color: 'bg-amber-50 border-amber-100 text-amber-700',
    articles: 7,
  },
  {
    name: 'Side Hustles',
    slug: 'side-hustles',
    description: 'Ideas and strategies for earning extra income outside your job.',
    icon: '🚀',
    color: 'bg-rose-50 border-rose-100 text-rose-700',
    articles: 13,
  },
  {
    name: 'Money Psychology',
    slug: 'money-psychology',
    description: 'Understanding your relationship with money and building better habits.',
    icon: '🧠',
    color: 'bg-violet-50 border-violet-100 text-violet-700',
    articles: 6,
  },
];

export default function CategoriesPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-b from-secondary-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-4 block">
            Explore Topics
          </span>
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            All Categories
          </h1>
          <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
            Browse our comprehensive guides across all areas of personal finance. Find the topics that matter most to you.
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group"
              >
                <div className={`h-full rounded-2xl border p-6 transition-all hover:shadow-card-hover ${category.color}`}>
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h2 className="text-xl font-semibold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h2>
                  <p className="text-secondary-600 text-sm mb-4">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-secondary-500">
                      {category.articles} articles
                    </span>
                    <svg className="w-5 h-5 text-secondary-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-secondary-50 border-t border-secondary-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">
            Not sure where to start?
          </h2>
          <p className="text-secondary-600 mb-8">
            Check out our comprehensive guides that cover the fundamentals of personal finance.
          </p>
          <Link
            href="/guides"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-full hover:bg-primary-700 transition-all"
          >
            View Pillar Guides
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
