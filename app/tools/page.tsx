import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Financial Tools',
  description: 'Free financial calculators and tools to help you budget, save, invest, and manage your money better.',
};

const tools = [
  {
    name: 'Savings Goal Calculator',
    slug: 'savings-goal',
    description: 'Calculate how long it will take to reach your savings goal based on your monthly contributions.',
    icon: '🎯',
    status: 'available',
  },
  {
    name: 'Budget Planner',
    slug: 'budget-planner',
    description: 'Create a personalized budget using the 50/30/20 rule or custom categories.',
    icon: '📊',
    status: 'coming-soon',
  },
  {
    name: 'Compound Interest Calculator',
    slug: 'compound-interest',
    description: 'See how your investments can grow over time with the power of compound interest.',
    icon: '📈',
    status: 'coming-soon',
  },
  {
    name: 'Debt Payoff Calculator',
    slug: 'debt-payoff',
    description: 'Compare debt snowball vs. avalanche methods and create a payoff plan.',
    icon: '💳',
    status: 'coming-soon',
  },
  {
    name: 'Emergency Fund Calculator',
    slug: 'emergency-fund',
    description: 'Determine how much you need in your emergency fund based on your expenses.',
    icon: '🛡️',
    status: 'coming-soon',
  },
  {
    name: 'Net Worth Tracker',
    slug: 'net-worth',
    description: 'Calculate and track your net worth by adding up assets and subtracting liabilities.',
    icon: '💰',
    status: 'coming-soon',
  },
];

export default function ToolsPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-b from-accent-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-accent-600 text-sm font-semibold uppercase tracking-wider mb-4 block">
            Free Resources
          </span>
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            Financial Tools
          </h1>
          <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
            Simple, free calculators and tools to help you make smarter money decisions.
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <div key={tool.slug} className="relative">
                {tool.status === 'available' ? (
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="block h-full"
                  >
                    <div className="h-full bg-white rounded-2xl border border-secondary-100 p-6 hover:border-primary-200 hover:shadow-card-hover transition-all group">
                      <div className="text-4xl mb-4">{tool.icon}</div>
                      <h2 className="text-lg font-semibold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {tool.name}
                      </h2>
                      <p className="text-secondary-600 text-sm mb-4">
                        {tool.description}
                      </p>
                      <span className="text-sm font-medium text-primary-600 flex items-center gap-1">
                        Try it free
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                ) : (
                  <div className="h-full bg-secondary-50 rounded-2xl border border-secondary-100 p-6 opacity-75">
                    <div className="text-4xl mb-4 grayscale">{tool.icon}</div>
                    <h2 className="text-lg font-semibold text-secondary-700 mb-2">
                      {tool.name}
                    </h2>
                    <p className="text-secondary-500 text-sm mb-4">
                      {tool.description}
                    </p>
                    <span className="inline-block text-xs font-medium text-secondary-500 bg-secondary-200 px-3 py-1 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-secondary-50 border-t border-secondary-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">
            Get notified when new tools launch
          </h2>
          <p className="text-secondary-600 mb-8">
            Subscribe to our newsletter for tool updates and weekly finance tips.
          </p>
          <Link
            href="/newsletter"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-full hover:bg-primary-700 transition-all"
          >
            Subscribe Free
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
