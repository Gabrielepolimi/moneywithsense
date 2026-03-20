import { Metadata } from 'next';
import Link from 'next/link';
import { canonicalComparePairSlug, getAllCities } from '../../../lib/cities';
import CostOfLivingIndexTable from '../../../components/tools/CostOfLivingIndexTable';
import { ogDefaultImage, siteUrl } from '../../../lib/seo';

export const metadata: Metadata = {
  title: 'Cost of Living Index 2026 — 100 Cities Ranked | MoneyWithSense',
  description:
    'Compare cost of living across 100 cities worldwide. Ranked by monthly budget, with quality of life scores for 2026.',
  alternates: {
    canonical: `${siteUrl}/tools/cost-of-living-index`,
    languages: { en: `${siteUrl}/tools/cost-of-living-index` },
  },
  openGraph: {
    title: 'Cost of Living Index 2026 — 100 Cities Ranked | MoneyWithSense',
    description:
      'Compare cost of living across 100 cities worldwide. Ranked by monthly budget, with quality of life scores for 2026.',
    url: `${siteUrl}/tools/cost-of-living-index`,
    images: [ogDefaultImage],
  },
  twitter: {
    card: 'summary_large_image',
    images: [ogDefaultImage.url],
  },
};

const datasetLd = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'MoneyWithSense Cost of Living Index 2026',
  description:
    'Monthly budget ranges and quality-of-life scores for 100+ cities worldwide, maintained by MoneyWithSense.',
  url: `${siteUrl}/tools/cost-of-living-index`,
};

const TOP_COMPARISONS: [string, string, string][] = [
  ['new-york', 'london', 'New York vs London'],
  ['dubai', 'singapore', 'Dubai vs Singapore'],
  ['tokyo', 'seoul', 'Tokyo vs Seoul'],
  ['sydney', 'melbourne', 'Sydney vs Melbourne'],
  ['berlin', 'munich', 'Berlin vs Munich'],
  ['toronto', 'vancouver', 'Toronto vs Vancouver'],
  ['barcelona', 'madrid', 'Barcelona vs Madrid'],
  ['paris', 'berlin', 'Paris vs Berlin'],
];

export default function CostOfLivingIndexPage() {
  const cities = getAllCities();

  return (
    <div className="bg-white min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetLd) }} />
      <section className="bg-gradient-to-b from-primary-50 to-white border-b border-secondary-100 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-secondary-500 mb-6">
            <Link href="/" className="hover:text-primary-600">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/tools" className="hover:text-primary-600">
              Tools
            </Link>
            <span className="mx-2">/</span>
            <span className="text-secondary-800">Cost of living index</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">Cost of Living Index 2026</h1>
          <p className="text-xl text-secondary-600 max-w-3xl">
            {cities.length} cities ranked by monthly budget (single & couple) with overall and housing scores. Filter, sort,
            and export CSV.
          </p>
        </div>
      </section>
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CostOfLivingIndexTable cities={cities} />
        </div>
      </section>
      <section className="py-12 border-t border-secondary-100 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-secondary-900 mb-4">Most searched comparisons</h2>
          <p className="text-secondary-600 text-sm mb-6">High-intent city pairs from our comparison hub.</p>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {TOP_COMPARISONS.map(([a, b, label]) => (
              <li key={`${a}-${b}`}>
                <Link
                  href={`/compare/${canonicalComparePairSlug(a, b)}`}
                  className="block rounded-xl border border-secondary-200 bg-white px-4 py-3 text-sm font-medium text-primary-700 hover:border-primary-300"
                >
                  {label} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
