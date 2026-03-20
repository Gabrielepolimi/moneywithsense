import { Metadata } from 'next';
import Link from 'next/link';
import RelocationCalculatorTool from '../../../components/tools/RelocationCalculatorTool';
import { canonicalComparePairSlug } from '../../../lib/cities';
import { ogDefaultImage, siteUrl } from '../../../lib/seo';

export const metadata: Metadata = {
  title: 'Relocation Salary Calculator — What Salary Do I Need? | MoneyWithSense',
  description:
    'Moving abroad? Calculate the equivalent salary you need in your new city to maintain your current lifestyle. Free relocation calculator 2026.',
  alternates: {
    canonical: `${siteUrl}/tools/relocation-calculator`,
    languages: { en: `${siteUrl}/tools/relocation-calculator` },
  },
  openGraph: {
    title: 'Relocation Salary Calculator — What Salary Do I Need? | MoneyWithSense',
    description:
      'Moving abroad? Calculate the equivalent salary you need in your new city to maintain your current lifestyle. Free relocation calculator 2026.',
    url: `${siteUrl}/tools/relocation-calculator`,
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
  name: 'Relocation Salary Calculator',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description:
    'Calculate the equivalent salary you need when moving between cities worldwide, using live cost-of-living anchors.',
  url: `${siteUrl}/tools/relocation-calculator`,
};

const POPULAR_ROUTES: [string, string, string, string][] = [
  ['london', 'dubai', 'London', 'Dubai'],
  ['new-york', 'lisbon', 'New York', 'Lisbon'],
  ['san-francisco', 'medellin', 'San Francisco', 'Medellín'],
  ['toronto', 'barcelona', 'Toronto', 'Barcelona'],
  ['sydney', 'singapore', 'Sydney', 'Singapore'],
  ['berlin', 'amsterdam', 'Berlin', 'Amsterdam'],
];

export default function RelocationCalculatorPage() {
  return (
    <div className="bg-white min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareLd) }} />
      <section className="bg-gradient-to-b from-accent-50 to-white border-b border-secondary-100 py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-secondary-500 mb-6">
            <Link href="/" className="hover:text-primary-600">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/tools" className="hover:text-primary-600">
              Tools
            </Link>
            <span className="mx-2">/</span>
            <span className="text-secondary-800">Relocation calculator</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">Relocation salary calculator</h1>
          <p className="text-lg text-secondary-600">
            See what monthly salary you&apos;d need in another city to keep a similar lifestyle—using our cost-of-living
            anchors for 100+ destinations.
          </p>
        </div>
      </section>
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <RelocationCalculatorTool />
        </div>
      </section>
      <section className="py-12 border-t border-secondary-100 bg-secondary-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-secondary-900 mb-4">Popular relocation routes</h2>
          <p className="text-secondary-600 text-sm mb-6">Open a full side-by-side comparison for these city pairs.</p>
          <ul className="space-y-2">
            {POPULAR_ROUTES.map(([a, b, la, lb]) => (
              <li key={`${a}-${b}`}>
                <Link
                  href={`/compare/${canonicalComparePairSlug(a, b)}`}
                  className="text-primary-700 font-medium hover:underline"
                >
                  {la} → {lb}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
