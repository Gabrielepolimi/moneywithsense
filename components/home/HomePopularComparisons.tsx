import Link from 'next/link';
import { canonicalComparePairSlug } from '../../lib/cities';

const ROWS: { a: string; b: string; label: string }[] = [
  { a: 'new-york', b: 'london', label: 'New York vs London' },
  { a: 'dubai', b: 'singapore', label: 'Dubai vs Singapore' },
  { a: 'toronto', b: 'vancouver', label: 'Toronto vs Vancouver' },
  { a: 'tokyo', b: 'seoul', label: 'Tokyo vs Seoul' },
  { a: 'sydney', b: 'melbourne', label: 'Sydney vs Melbourne' },
  { a: 'berlin', b: 'munich', label: 'Berlin vs Munich' },
];

export default function HomePopularComparisons() {
  return (
    <section className="py-16 bg-white border-b border-secondary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-3xl mb-2 block" aria-hidden>
            ⚖️
          </span>
          <h2 className="text-3xl font-bold text-secondary-900 mb-2">Popular City Comparisons</h2>
          <p className="text-secondary-600">Side-by-side budgets and quality of life — pick two cities.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto mb-10">
          {ROWS.map(({ a, b, label }) => (
            <Link
              key={`${a}-${b}`}
              href={`/compare/${canonicalComparePairSlug(a, b)}`}
              className="rounded-2xl border border-secondary-200 bg-secondary-50 px-5 py-4 text-center font-semibold text-secondary-800 hover:border-primary-300 hover:bg-primary-50/50 hover:text-primary-800 transition-all"
            >
              {label}
            </Link>
          ))}
        </div>
        <p className="text-center">
          <Link href="/compare" className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:underline">
            See all comparisons →
          </Link>
        </p>
      </div>
    </section>
  );
}
