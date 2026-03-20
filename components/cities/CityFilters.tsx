'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { City } from '../../lib/cities';
import {
  countryFlagEmoji,
  scoreColorClass,
  isAfricaOrMiddleEast
} from '../../lib/cities';

type ContinentTab =
  | 'all'
  | 'Europe'
  | 'Asia'
  | 'North America'
  | 'South America'
  | 'Oceania'
  | 'africa-me';

type SortMode = 'expensive' | 'affordable' | 'qol';

type Stats = {
  count: number;
  avgBudgetMid: number;
  mostExpensive: City;
  mostAffordable: City;
};

function midBudget(c: City) {
  return (c.monthlyBudget.single.min + c.monthlyBudget.single.max) / 2;
}

function filterByContinent(cities: City[], tab: ContinentTab): City[] {
  if (tab === 'all') return cities;
  if (tab === 'africa-me') return cities.filter((c) => isAfricaOrMiddleEast(c));
  return cities.filter((c) => c.continent === tab);
}

export default function CityFilters({ cities, stats }: { cities: City[]; stats: Stats }) {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<ContinentTab>('all');
  const [sort, setSort] = useState<SortMode>('qol');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = searchParams.get('search');
    if (q) setSearch(q);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let list = filterByContinent(cities, tab);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.slug.includes(q)
      );
    }
    const copy = [...list];
    if (sort === 'expensive') {
      copy.sort((a, b) => midBudget(b) - midBudget(a));
    } else if (sort === 'affordable') {
      copy.sort((a, b) => midBudget(a) - midBudget(b));
    } else {
      copy.sort((a, b) => (b.scores?.overall ?? 0) - (a.scores?.overall ?? 0));
    }
    return copy;
  }, [cities, tab, sort, search]);

  const tabs: { id: ContinentTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'Europe', label: 'Europe' },
    { id: 'Asia', label: 'Asia' },
    { id: 'North America', label: 'North America' },
    { id: 'South America', label: 'South America' },
    { id: 'Oceania', label: 'Oceania' },
    { id: 'africa-me', label: 'Africa & Middle East' }
  ];

  return (
    <div>
      <div className="mb-6 rounded-2xl bg-secondary-100 border border-secondary-200 px-4 py-3 text-sm text-secondary-700">
        <strong>{stats.count}</strong> cities • Average budget ~$
        {stats.avgBudgetMid.toLocaleString('en-US')}/mo • Most expensive:{' '}
        <Link href={`/cities/${stats.mostExpensive.slug}`} className="text-primary-600 font-medium hover:underline">
          {stats.mostExpensive.name}
        </Link>{' '}
        • Most affordable:{' '}
        <Link href={`/cities/${stats.mostAffordable.slug}`} className="text-primary-600 font-medium hover:underline">
          {stats.mostAffordable.name}
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-secondary-200 text-secondary-700 hover:bg-secondary-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 flex-1 lg:justify-end">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="rounded-xl border border-secondary-200 px-3 py-2 text-sm text-secondary-900"
          >
            <option value="qol">Best Quality of Life</option>
            <option value="expensive">Most Expensive</option>
            <option value="affordable">Most Affordable</option>
          </select>
          <input
            type="search"
            placeholder="Search city name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] rounded-xl border border-secondary-200 px-4 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((city) => {
          const overall = city.scores?.overall ?? 0;
          return (
            <Link
              key={city.slug}
              href={`/cities/${city.slug}`}
              className="group rounded-2xl border border-secondary-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-primary-200 transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-3xl" aria-hidden>
                  {countryFlagEmoji(city.countryCode)}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreColorClass(overall)}`}>
                  {overall.toFixed(1)}
                </span>
              </div>
              <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                {city.name}
              </h3>
              <p className="text-sm text-secondary-500 mb-2">{city.country}</p>
              <p className="text-sm text-secondary-700">
                Single:{' '}
                <strong>
                  ${city.monthlyBudget.single.min.toLocaleString('en-US')}–$
                  {city.monthlyBudget.single.max.toLocaleString('en-US')}/mo
                </strong>
              </p>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-secondary-600 py-12">No cities match your filters.</p>
      )}
    </div>
  );
}
