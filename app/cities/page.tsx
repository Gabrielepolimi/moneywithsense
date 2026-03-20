import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import CityFilters from '../../components/cities/CityFilters';
import { getAllCities } from '../../lib/cities';
import { ogDefaultImage, siteUrl } from '../../lib/seo';

export const metadata: Metadata = {
  title: 'Cost of Living by City — 2026 Global Guide | MoneyWithSense',
  description:
    'Compare cost of living in 100+ cities worldwide. Monthly budgets, rent prices, and quality of life scores for 2026.',
  alternates: {
    canonical: `${siteUrl}/cities`,
    languages: { en: `${siteUrl}/cities` },
  },
  openGraph: {
    title: 'Cost of Living by City — 2026 Global Guide | MoneyWithSense',
    description:
      'Compare cost of living in 100+ cities worldwide. Monthly budgets, rent prices, and quality of life scores for 2026.',
    url: `${siteUrl}/cities`,
    images: [ogDefaultImage],
  },
  twitter: {
    card: 'summary_large_image',
    images: [ogDefaultImage.url],
  },
};

function midSingle(c: ReturnType<typeof getAllCities>[0]) {
  return (c.monthlyBudget.single.min + c.monthlyBudget.single.max) / 2;
}

export default function CitiesHubPage() {
  const cities = getAllCities();
  let sum = 0;
  let mostExpensive = cities[0];
  let mostAffordable = cities[0];
  for (const c of cities) {
    sum += midSingle(c);
    if (c.monthlyBudget.single.max > mostExpensive.monthlyBudget.single.max) mostExpensive = c;
    if (c.monthlyBudget.single.min < mostAffordable.monthlyBudget.single.min) mostAffordable = c;
  }
  const stats = {
    count: cities.length,
    avgBudgetMid: Math.round(sum / cities.length),
    mostExpensive,
    mostAffordable
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-b from-primary-50 to-white border-b border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            Cost of Living by City — 2026 Global Guide
          </h1>
          <p className="text-lg text-secondary-600 max-w-3xl leading-relaxed">
            Browse monthly budgets, rent ranges, transport, food, and quality-of-life scores for major cities across
            every continent. Filter by region, sort by affordability or lifestyle scores, and open a full guide for
            each destination. Figures are estimates in USD for easy comparison, with local currency shown on city
            pages—use them as a starting point, not financial advice.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Suspense
          fallback={<div className="text-secondary-600 text-center py-12">Loading cities…</div>}
        >
          <CityFilters cities={cities} stats={stats} />
        </Suspense>
      </div>

      <section className="border-t border-secondary-100 bg-secondary-50 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Try our free tools</h2>
          <p className="text-secondary-600 mb-8 max-w-2xl">
            Calculators and planners powered by the same city dataset—no signup.
          </p>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <li>
              <Link
                href="/tools/salary-checker"
                className="block rounded-2xl border border-secondary-200 bg-white p-5 font-semibold text-primary-700 hover:border-primary-300"
              >
                Salary checker →
              </Link>
            </li>
            <li>
              <Link
                href="/tools/relocation-calculator"
                className="block rounded-2xl border border-secondary-200 bg-white p-5 font-semibold text-primary-700 hover:border-primary-300"
              >
                Relocation calculator →
              </Link>
            </li>
            <li>
              <Link
                href="/tools/budget-planner"
                className="block rounded-2xl border border-secondary-200 bg-white p-5 font-semibold text-primary-700 hover:border-primary-300"
              >
                Budget planner →
              </Link>
            </li>
            <li>
              <Link
                href="/tools/cost-of-living-index"
                className="block rounded-2xl border border-secondary-200 bg-white p-5 font-semibold text-primary-700 hover:border-primary-300"
              >
                Cost of living index →
              </Link>
            </li>
          </ul>
          <p className="mt-8">
            <Link href="/tools" className="text-primary-600 font-medium hover:underline">
              All tools →
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
