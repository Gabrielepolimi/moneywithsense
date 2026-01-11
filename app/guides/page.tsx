import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Guides',
  description: 'Comprehensive pillar guides on personal finance fundamentals - in-depth resources for saving, budgeting, investing, and more.',
};

const guides = [
  {
    title: 'The Complete Guide to Personal Finance',
    slug: 'personal-finance-guide',
    description: 'Everything you need to know about managing your money. From basics to advanced strategies for financial success.',
    category: 'Personal Finance',
    readTime: '25 min read',
    icon: '💼',
    topics: ['Money mindset', 'Financial goals', 'Net worth', 'Financial planning'],
  },
  {
    title: 'Saving Money: A Comprehensive Guide',
    slug: 'saving-money-guide',
    description: 'Practical strategies to reduce expenses, build an emergency fund, and grow your savings faster.',
    category: 'Saving Money',
    readTime: '20 min read',
    icon: '💰',
    topics: ['Emergency fund', 'Cutting expenses', 'Automating savings', 'High-yield accounts'],
  },
  {
    title: 'Budgeting That Actually Works',
    slug: 'budgeting-guide',
    description: 'Find the budgeting method that fits your life. From zero-based to 50/30/20, we cover them all.',
    category: 'Budgeting',
    readTime: '22 min read',
    icon: '📊',
    topics: ['Budget methods', 'Tracking spending', 'Budget tools', 'Staying on track'],
  },
  {
    title: "Investing Basics for Beginners",
    slug: 'investing-basics-guide',
    description: "Start your investment journey with confidence. Learn about stocks, bonds, ETFs, and retirement accounts.",
    category: 'Investing Basics',
    readTime: '30 min read',
    icon: '📈',
    topics: ['Stock market basics', 'Index funds', 'Retirement accounts', 'Risk management'],
  },
  {
    title: 'Building Passive Income Streams',
    slug: 'passive-income-guide',
    description: 'Explore ways to earn money while you sleep. From dividends to digital products.',
    category: 'Passive Income',
    readTime: '18 min read',
    icon: '🔄',
    topics: ['Dividend investing', 'Real estate', 'Digital products', 'Royalties'],
  },
  {
    title: 'Credit & Debt Management',
    slug: 'credit-debt-guide',
    description: 'Master your credit score and develop a plan to become debt-free. Strategies that work.',
    category: 'Credit & Debt',
    readTime: '24 min read',
    icon: '💳',
    topics: ['Credit score factors', 'Debt payoff strategies', 'Good vs bad debt', 'Credit repair'],
  },
  {
    title: 'Banking & Credit Cards Guide',
    slug: 'banking-cards-guide',
    description: 'Choose the right accounts, maximize rewards, and use banking products to your advantage.',
    category: 'Banking & Cards',
    readTime: '16 min read',
    icon: '🏦',
    topics: ['Choosing a bank', 'Credit card rewards', 'Account types', 'Fee avoidance'],
  },
  {
    title: 'Side Hustles: Building Extra Income',
    slug: 'side-hustles-guide',
    description: 'Explore proven side hustle ideas and learn how to build sustainable extra income.',
    category: 'Side Hustles',
    readTime: '28 min read',
    icon: '🚀',
    topics: ['Freelancing', 'Gig economy', 'Online business', 'Skills to monetize'],
  },
  {
    title: 'Taxes Made Simple',
    slug: 'taxes-guide',
    description: 'Understand tax basics, common deductions, and strategies to minimize your tax burden legally.',
    category: 'Taxes & Tips',
    readTime: '22 min read',
    icon: '📋',
    topics: ['Tax basics', 'Deductions', 'Tax-advantaged accounts', 'Filing tips'],
  },
  {
    title: 'Money Psychology & Habits',
    slug: 'money-psychology-guide',
    description: 'Understand your relationship with money and build lasting financial habits.',
    category: 'Money Psychology',
    readTime: '15 min read',
    icon: '🧠',
    topics: ['Money beliefs', 'Behavioral finance', 'Building habits', 'Financial anxiety'],
  },
];

export default function GuidesPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-4 block">
            In-Depth Resources
          </span>
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            Pillar Guides
          </h1>
          <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
            Comprehensive, beginner-friendly guides covering every major area of personal finance. 
            Start here to build a solid foundation.
          </p>
        </div>
      </section>

      {/* Guides List */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {guides.map((guide, index) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="group block"
              >
                <article className="bg-white rounded-2xl border border-secondary-100 p-6 md:p-8 hover:border-primary-200 hover:shadow-card-hover transition-all">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-secondary-100 flex items-center justify-center text-3xl group-hover:bg-primary-50 transition-colors">
                      {guide.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
                          {guide.category}
                        </span>
                        <span className="text-xs text-secondary-400">
                          {guide.readTime}
                        </span>
                      </div>

                      <h2 className="text-xl font-semibold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {guide.title}
                      </h2>

                      <p className="text-secondary-600 mb-4">
                        {guide.description}
                      </p>

                      {/* Topics */}
                      <div className="flex flex-wrap gap-2">
                        {guide.topics.map((topic) => (
                          <span
                            key={topic}
                            className="text-xs text-secondary-500 bg-secondary-50 px-2 py-1 rounded"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="hidden md:flex items-center">
                      <svg className="w-6 h-6 text-secondary-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-secondary-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Get weekly finance insights
          </h2>
          <p className="text-secondary-300 mb-8">
            Join our newsletter for actionable tips delivered straight to your inbox.
          </p>
          <Link
            href="/newsletter"
            className="inline-flex items-center px-6 py-3 bg-primary-500 text-white font-medium rounded-full hover:bg-primary-400 transition-all"
          >
            Subscribe Free
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
