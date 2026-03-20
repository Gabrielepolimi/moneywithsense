import { Metadata } from 'next';
import Link from 'next/link';
import SalaryCheckerTool from '../../../components/tools/SalaryCheckerTool';
import { ogDefaultImage, siteUrl } from '../../../lib/seo';

export const metadata: Metadata = {
  title: 'Salary to Cost of Living Calculator 2026 | MoneyWithSense',
  description:
    'Enter your salary and see if you can afford to live in 100+ cities worldwide. Free cost of living calculator for expats and remote workers.',
  alternates: {
    canonical: `${siteUrl}/tools/salary-checker`,
    languages: { en: `${siteUrl}/tools/salary-checker` },
  },
  openGraph: {
    title: 'Salary to Cost of Living Calculator 2026 | MoneyWithSense',
    description:
      'Enter your salary and see if you can afford to live in 100+ cities worldwide. Free cost of living calculator for expats and remote workers.',
    url: `${siteUrl}/tools/salary-checker`,
    images: [ogDefaultImage],
  },
  twitter: {
    card: 'summary_large_image',
    images: [ogDefaultImage.url],
  },
};

const softwareLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Salary to Cost of Living Calculator',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description: 'Calculate if your salary is enough to live in any city worldwide.',
  url: `${siteUrl}/tools/salary-checker`,
};

const POPULAR_CITY_SLUGS = ['new-york', 'london', 'dubai', 'tokyo', 'singapore', 'paris', 'berlin', 'sydney'] as const;

export default function SalaryCheckerPage() {
  return (
    <div className="bg-white min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareLd) }} />
      <section className="bg-gradient-to-b from-primary-50 to-white border-b border-secondary-100 py-12 md:py-16">
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
            <span className="text-secondary-800">Salary checker</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">Salary to cost of living calculator</h1>
          <p className="text-lg text-secondary-600 max-w-2xl">
            Enter your income, household size, and city. We estimate rent, food, transport, and utilities from our 2026 city
            database—no signup required.
          </p>
        </div>
      </section>
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SalaryCheckerTool />
        </div>
      </section>
      <section className="py-12 border-t border-secondary-100 bg-secondary-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-secondary-900 mb-4">Popular cities to check</h2>
          <p className="text-secondary-600 text-sm mb-6">Jump straight to a full cost-of-living guide.</p>
          <ul className="flex flex-wrap gap-3">
            {POPULAR_CITY_SLUGS.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/cities/${slug}`}
                  className="inline-block px-4 py-2 rounded-full bg-white border border-secondary-200 text-sm font-medium text-primary-700 hover:border-primary-300"
                >
                  {slug
                    .split('-')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ')}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
