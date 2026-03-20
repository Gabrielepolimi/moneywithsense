import { Metadata } from 'next';
import Link from 'next/link';
import BudgetPlannerTool from '../../../components/tools/BudgetPlannerTool';
import { ogDefaultImage, siteUrl } from '../../../lib/seo';

export const metadata: Metadata = {
  title: 'Monthly Budget Planner by City 2026 | MoneyWithSense',
  description:
    'Create a personalized monthly budget for any city. Choose your lifestyle and get a detailed breakdown with charts. Free budget planner.',
  alternates: {
    canonical: `${siteUrl}/tools/budget-planner`,
    languages: { en: `${siteUrl}/tools/budget-planner` },
  },
  openGraph: {
    title: 'Monthly Budget Planner by City 2026 | MoneyWithSense',
    description:
      'Create a personalized monthly budget for any city. Choose your lifestyle and get a detailed breakdown with charts. Free budget planner.',
    url: `${siteUrl}/tools/budget-planner`,
    images: [ogDefaultImage],
  },
  twitter: {
    card: 'summary_large_image',
    images: [ogDefaultImage.url],
  },
};

export default function BudgetPlannerPage() {
  return (
    <div className="bg-white min-h-screen">
      <section className="bg-gradient-to-b from-secondary-50 to-white border-b border-secondary-100 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-secondary-500 mb-6">
            <Link href="/" className="hover:text-primary-600">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/tools" className="hover:text-primary-600">
              Tools
            </Link>
            <span className="mx-2">/</span>
            <span className="text-secondary-800">Budget planner</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">Monthly budget planner by city</h1>
          <p className="text-lg text-secondary-600 max-w-2xl">
            Pick a city, lifestyle, housing, and transport. We build a pie chart, line-item breakdown, and optional PDF
            export—all in your browser.
          </p>
        </div>
      </section>
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <BudgetPlannerTool />
        </div>
      </section>
    </div>
  );
}
