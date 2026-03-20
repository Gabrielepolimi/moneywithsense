'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { City } from '../../lib/cities';
import { countryFlagEmoji } from '../../lib/cities';

type Props = {
  featured: City[];
};

export default function HomeCityExplore({ featured }: Props) {
  const router = useRouter();
  const [q, setQ] = useState('');

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const s = q.trim();
    if (s) router.push(`/cities?search=${encodeURIComponent(s)}`);
    else router.push('/cities');
  }

  return (
    <section className="py-16 bg-gradient-to-b from-primary-50/80 to-white border-b border-secondary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-4xl mb-3 block" aria-hidden>
            🌍
          </span>
          <h2 className="text-3xl font-bold text-secondary-900 mb-3">Find Your City</h2>
          <p className="text-lg text-secondary-600 mb-2 font-medium">Where are you thinking of moving?</p>
          <p className="text-sm text-secondary-500 mb-6">
            Compare cost of living in 100+ cities — budgets, rent, transport, and quality-of-life scores.
          </p>
          <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input
              type="search"
              placeholder="Search any city..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="flex-1 rounded-full border border-secondary-200 px-5 py-3 text-secondary-900 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <button
              type="submit"
              className="px-8 py-3 rounded-full bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
              aria-label="Search cities"
            >
              →
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-secondary-600 mb-4">
          <span className="font-semibold text-secondary-800">Featured:</span>{' '}
          {featured.map((city, i) => (
            <span key={city.slug}>
              {i > 0 && ' · '}
              <Link href={`/cities/${city.slug}`} className="hover:text-primary-600 hover:underline whitespace-nowrap">
                {countryFlagEmoji(city.countryCode)} {city.name}
              </Link>
            </span>
          ))}
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {featured.map((city) => (
            <Link
              key={city.slug}
              href={`/cities/${city.slug}`}
              className="flex items-center gap-4 rounded-2xl border border-secondary-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-primary-200 transition-all"
            >
              <span className="text-4xl shrink-0" aria-hidden>
                {countryFlagEmoji(city.countryCode)}
              </span>
              <div>
                <h3 className="font-semibold text-secondary-900">{city.name}</h3>
                <p className="text-sm text-secondary-500">{city.country}</p>
                <p className="text-sm text-primary-600 font-medium mt-1">
                  ${city.monthlyBudget.single.min.toLocaleString('en-US')}–$
                  {city.monthlyBudget.single.max.toLocaleString('en-US')}/mo
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/cities"
            className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 hover:underline"
          >
            Explore all 100 cities →
          </Link>
        </div>
      </div>
    </section>
  );
}
