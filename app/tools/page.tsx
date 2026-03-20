import { Metadata } from 'next';
import Link from 'next/link';
import { ogDefaultImage, siteUrl } from '../../lib/seo';

export const metadata: Metadata = {
  title: 'Free Money & City Tools | MoneyWithSense',
  description:
    'Free financial tools to plan your budget, calculate relocation costs, and compare cost of living worldwide.',
  alternates: { canonical: `${siteUrl}/tools`, languages: { en: `${siteUrl}/tools` } },
  openGraph: {
    title: 'Free Money & City Tools | MoneyWithSense',
    description:
      'Free financial tools to plan your budget, calculate relocation costs, and compare cost of living worldwide.',
    url: `${siteUrl}/tools`,
    images: [ogDefaultImage],
  },
  twitter: {
    card: 'summary_large_image',
    images: [ogDefaultImage.url],
  },
};

const cityTools = [
  {
    emoji: '💰',
    title: 'Salary vs cost of living',
    description: 'See if your income fits typical rent, food, and transport in any city.',
    href: '/tools/salary-checker',
  },
  {
    emoji: '✈️',
    title: 'Relocation calculator',
    description: 'Equivalent salary needed when moving between cities—share-ready results.',
    href: '/tools/relocation-calculator',
  },
  {
    emoji: '📊',
    title: 'Budget planner',
    description: 'Lifestyle, housing, and transport → pie chart, breakdown, PDF export.',
    href: '/tools/budget-planner',
  },
  {
    emoji: '🌍',
    title: 'Cost of living index',
    description: '100+ cities ranked—filter, sort, and export CSV.',
    href: '/tools/cost-of-living-index',
  },
];

export default function ToolsPage() {
  return (
    <div className="bg-white min-h-screen">
      <section className="bg-gradient-to-b from-accent-50 to-white py-16 border-b border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-primary-600 text-sm font-semibold uppercase tracking-wider mb-4 block">Free tools</span>
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">Free Money & City Tools</h1>
          <p className="text-xl text-secondary-600 max-w-2xl mx-auto mb-6">
            Plan budgets, compare cities, and stress-test your salary—all in the browser, powered by our 2026 city dataset.
          </p>
          <p className="text-sm font-medium text-secondary-500">
            100+ cities • Free forever • No signup required
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="sr-only">City & money calculators</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {cityTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group block h-full rounded-2xl border border-secondary-200 bg-white p-8 hover:border-primary-300 hover:shadow-card-hover transition-all"
              >
                <div className="text-4xl mb-4">{tool.emoji}</div>
                <h3 className="text-xl font-bold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-secondary-600 text-sm mb-6">{tool.description}</p>
                <span className="text-sm font-semibold text-primary-600 inline-flex items-center gap-1">
                  Try free →
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-secondary-50 border-y border-secondary-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-8">Why use our tools?</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-white rounded-2xl p-6 border border-secondary-100">
              <p className="text-2xl mb-2">🔓</p>
              <h3 className="font-bold text-secondary-900 mb-2">No signup</h3>
              <p className="text-sm text-secondary-600">Run calculators instantly—nothing to create or verify.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-secondary-100">
              <p className="text-2xl mb-2">📅</p>
              <h3 className="font-bold text-secondary-900 mb-2">Data updated monthly</h3>
              <p className="text-sm text-secondary-600">City figures stay aligned with our global cost-of-living dataset.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-secondary-100">
              <p className="text-2xl mb-2">🌐</p>
              <h3 className="font-bold text-secondary-900 mb-2">Works for any city</h3>
              <p className="text-sm text-secondary-600">Same methodology across 100+ destinations—compare apples to apples.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-xl font-bold text-secondary-900 mb-4">More tools</h2>
          <Link
            href="/tools/savings-goal"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-secondary-200 text-secondary-800 font-medium hover:border-primary-300 hover:text-primary-700"
          >
            🎯 Savings goal calculator
          </Link>
        </div>
      </section>

      <section className="py-16 bg-secondary-50 border-t border-secondary-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">Get tips in your inbox</h2>
          <p className="text-secondary-600 mb-8">Newsletter with money and city guides—no spam.</p>
          <Link
            href="/newsletter"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-full hover:bg-primary-700 transition-all"
          >
            Subscribe free
          </Link>
        </div>
      </section>
    </div>
  );
}
