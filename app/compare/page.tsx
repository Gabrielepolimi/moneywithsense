import { Metadata } from 'next';
import Link from 'next/link';
import { getAllCities, canonicalComparePairSlug, getCityBySlug } from '../../lib/cities';
import CompareCityPicker from '../../components/cities/CompareCityPicker';
import { ogDefaultImage, siteUrl } from '../../lib/seo';

export const metadata: Metadata = {
  title: 'Cost of Living Comparisons — 2026 | MoneyWithSense',
  description:
    'Compare cost of living between any two cities. Side-by-side breakdowns of rent, food, transport and quality of life.',
  alternates: { canonical: `${siteUrl}/compare`, languages: { en: `${siteUrl}/compare` } },
  openGraph: {
    title: 'Cost of Living Comparisons — 2026 | MoneyWithSense',
    description:
      'Compare cost of living between any two cities. Side-by-side breakdowns of rent, food, transport and quality of life.',
    url: `${siteUrl}/compare`,
    images: [ogDefaultImage],
  },
  twitter: {
    card: 'summary_large_image',
    images: [ogDefaultImage.url],
  },
};

/** Slug pairs (any order) — links use canonical URL */
const POPULAR_SLUG_PAIRS: [string, string][] = [
  ['new-york', 'london'],
  ['london', 'paris'],
  ['dubai', 'singapore'],
  ['tokyo', 'seoul'],
  ['toronto', 'vancouver'],
  ['sydney', 'melbourne'],
  ['berlin', 'munich'],
  ['barcelona', 'madrid'],
  ['new-york', 'los-angeles'],
  ['london', 'amsterdam'],
  ['singapore', 'hong-kong'],
  ['paris', 'berlin'],
  ['zurich', 'geneva'],
  ['stockholm', 'oslo'],
  ['vienna', 'prague'],
  ['miami', 'new-york'],
  ['san-francisco', 'new-york'],
  ['los-angeles', 'chicago'],
  ['dubai', 'london'],
  ['tokyo', 'osaka'],
  ['amsterdam', 'berlin'],
  ['lisbon', 'madrid'],
  ['bangkok', 'kuala-lumpur'],
  ['mexico-city', 'bogota'],
];

const BROWSE_REGIONS: { title: string; pairs: [string, string][] }[] = [
  {
    title: 'Europe',
    pairs: [
      ['london', 'paris'],
      ['berlin', 'munich'],
      ['barcelona', 'madrid'],
      ['stockholm', 'oslo'],
      ['rome', 'milan'],
      ['dublin', 'edinburgh'],
    ],
  },
  {
    title: 'Asia',
    pairs: [
      ['tokyo', 'seoul'],
      ['singapore', 'hong-kong'],
      ['bangkok', 'kuala-lumpur'],
      ['tokyo', 'osaka'],
      ['shanghai', 'beijing'],
      ['delhi', 'mumbai'],
    ],
  },
  {
    title: 'North America',
    pairs: [
      ['new-york', 'los-angeles'],
      ['toronto', 'vancouver'],
      ['miami', 'new-york'],
      ['chicago', 'boston'],
      ['san-francisco', 'new-york'],
      ['montreal', 'toronto'],
    ],
  },
  {
    title: 'South America',
    pairs: [
      ['buenos-aires', 'sao-paulo'],
      ['mexico-city', 'bogota'],
      ['medellin', 'bogota'],
      ['lima', 'santiago'],
    ],
  },
  {
    title: 'Oceania',
    pairs: [
      ['sydney', 'melbourne'],
      ['auckland', 'sydney'],
      ['brisbane', 'melbourne'],
      ['perth', 'melbourne'],
    ],
  },
  {
    title: 'Africa & Middle East',
    pairs: [
      ['dubai', 'london'],
      ['dubai', 'singapore'],
      ['tel-aviv', 'istanbul'],
      ['cape-town', 'johannesburg'],
      ['cairo', 'casablanca'],
      ['abu-dhabi', 'dubai'],
    ],
  },
];

const INTRO =
  'MoneyWithSense helps you compare monthly budgets, rent, groceries, transport, and quality-of-life scores across 100+ global cities. Choose any two destinations for a side-by-side breakdown in USD and local currency, plus salary scenarios and links to each city guide. Use it when relocating, benchmarking pay, or planning extended travel in 2026.';

function PopularLink({ a, b }: { a: string; b: string }) {
  const ca = getCityBySlug(a);
  const cb = getCityBySlug(b);
  if (!ca || !cb) return null;
  const pair = canonicalComparePairSlug(a, b);
  return (
    <Link
      href={`/compare/${pair}`}
      className="block rounded-xl border border-secondary-200 px-4 py-3 hover:border-primary-300 text-sm font-medium text-secondary-800 hover:text-primary-700 transition-colors"
    >
      {ca.name} vs {cb.name}
    </Link>
  );
}

function RegionBlock({ title, pairs }: { title: string; pairs: [string, string][] }) {
  return (
    <div className="mb-10">
      <h3 className="text-lg font-bold text-secondary-900 mb-4">{title}</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {pairs.map(([x, y]) => (
          <PopularLink key={`${title}-${x}-${y}`} a={x} b={y} />
        ))}
      </div>
    </div>
  );
}

export default function CompareHubPage() {
  const cities = getAllCities();
  const cityOptions = cities.map((c) => ({
    slug: c.slug,
    name: c.name,
    country: c.country,
  }));

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="text-sm text-secondary-500 mb-6">
          <Link href="/" className="hover:text-primary-600">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-secondary-800">Compare</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
          Cost of Living Comparisons — 2026
        </h1>
        <p className="text-secondary-700 leading-relaxed max-w-3xl mb-10">{INTRO}</p>

        <CompareCityPicker cities={cityOptions} />

        <section className="mt-14">
          <h2 className="text-2xl font-bold text-secondary-900 mb-6">Popular comparisons</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {POPULAR_SLUG_PAIRS.map(([a, b]) => (
              <PopularLink key={`pop-${a}-${b}`} a={a} b={b} />
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Browse by region</h2>
          <p className="text-secondary-600 text-sm mb-8">
            Quick links to high-intent city pairs in each part of the world.
          </p>
          {BROWSE_REGIONS.map((r) => (
            <RegionBlock key={r.title} title={r.title} pairs={r.pairs} />
          ))}
        </section>

        <section className="mt-12 rounded-2xl border border-secondary-200 bg-secondary-50 p-6">
          <h2 className="font-bold text-secondary-900 mb-4">Explore individual cities</h2>
          <p className="text-secondary-600 text-sm mb-4">
            Prefer a single-city guide? Browse budgets and scores for every destination.
          </p>
          <Link href="/cities" className="text-primary-600 font-medium hover:underline">
            All cities →
          </Link>
        </section>
      </div>
    </div>
  );
}
