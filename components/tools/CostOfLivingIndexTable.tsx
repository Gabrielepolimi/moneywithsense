'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { City } from '../../lib/cities';
import { countryFlagEmoji } from '../../lib/cities';

type SortKey = 'name' | 'country' | 'singleMin' | 'coupleMin' | 'overall' | 'housing';

type Props = {
  cities: City[];
};

function formatRange(min: number, max: number) {
  return `$${min.toLocaleString('en-US')}–$${max.toLocaleString('en-US')}`;
}

const CONTINENTS = ['All Continents', 'Europe', 'Asia', 'North America', 'South America', 'Oceania', 'Africa'] as const;

export default function CostOfLivingIndexTable({ cities }: Props) {
  const [continent, setContinent] = useState<string>('All Continents');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('singleMin');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    let list = [...cities];
    if (continent !== 'All Continents') {
      list = list.filter((c) => c.continent === continent);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q) || c.slug.includes(q)
      );
    }
    list.sort((a, b) => {
      if (sortKey === 'name') {
        return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      if (sortKey === 'country') {
        return sortDir === 'asc' ? a.country.localeCompare(b.country) : b.country.localeCompare(a.country);
      }
      let va = 0;
      let vb = 0;
      switch (sortKey) {
        case 'singleMin':
          va = a.monthlyBudget.single.max;
          vb = b.monthlyBudget.single.max;
          break;
        case 'coupleMin':
          va = a.monthlyBudget.couple.max;
          vb = b.monthlyBudget.couple.max;
          break;
        case 'overall':
          va = a.scores.overall;
          vb = b.scores.overall;
          break;
        case 'housing':
          va = a.scores.housing;
          vb = b.scores.housing;
          break;
        default:
          va = a.monthlyBudget.single.max;
          vb = b.monthlyBudget.single.max;
      }
      return sortDir === 'asc' ? va - vb : vb - va;
    });
    return list;
  }, [cities, continent, search, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'name' || key === 'country' ? 'asc' : 'desc');
    }
  }

  function exportCsv() {
    const headers = [
      'Rank',
      'City',
      'Country',
      'Continent',
      'Budget Single Min',
      'Budget Single Max',
      'Budget Couple Min',
      'Budget Couple Max',
      'Overall Score',
      'Housing Score',
      'Slug',
    ];
    const rows = filtered.map((c, i) => [
      String(i + 1),
      c.name,
      c.country,
      c.continent,
      String(c.monthlyBudget.single.min),
      String(c.monthlyBudget.single.max),
      String(c.monthlyBudget.couple.min),
      String(c.monthlyBudget.couple.max),
      String(c.scores.overall),
      String(c.scores.housing),
      c.slug,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join(
      '\n'
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cost-of-living-index-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const th = (key: SortKey, label: string) => (
    <th className="text-left p-3 font-semibold text-secondary-800 cursor-pointer hover:bg-secondary-100 whitespace-nowrap" scope="col">
      <button type="button" className="text-left w-full" onClick={() => toggleSort(key)}>
        {label}
        {sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
      </button>
    </th>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row flex-wrap gap-4 items-stretch lg:items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-secondary-600 mb-1">Filter</label>
          <select
            className="w-full rounded-xl border border-secondary-200 px-4 py-2.5 bg-white"
            value={continent}
            onChange={(e) => setContinent(e.target.value)}
          >
            {CONTINENTS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-secondary-600 mb-1">Sort by</label>
          <select
            className="w-full rounded-xl border border-secondary-200 px-4 py-2.5 bg-white"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            <option value="singleMin">Monthly budget (single)</option>
            <option value="coupleMin">Monthly budget (couple)</option>
            <option value="overall">Overall score</option>
            <option value="housing">Housing score</option>
            <option value="name">City name</option>
            <option value="country">Country</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-secondary-600 mb-1">Search city</label>
          <input
            type="search"
            className="w-full rounded-xl border border-secondary-200 px-4 py-2.5"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 whitespace-nowrap"
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-secondary-200">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-secondary-50 border-b border-secondary-200">
            <tr>
              <th className="text-left p-3 w-10 font-semibold text-secondary-800">#</th>
              {th('name', 'City')}
              {th('country', 'Country')}
              {th('singleMin', 'Budget (Single)')}
              {th('coupleMin', 'Budget (Couple)')}
              {th('overall', 'Overall')}
              {th('housing', 'Housing')}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.slug} className="border-t border-secondary-100 hover:bg-secondary-50/80">
                <td className="p-3 text-secondary-500">{i + 1}</td>
                <td className="p-3 font-medium">
                  <Link href={`/cities/${c.slug}`} className="text-primary-700 hover:underline inline-flex items-center gap-2">
                    <span>{countryFlagEmoji(c.countryCode)}</span>
                    {c.name}
                  </Link>
                </td>
                <td className="p-3 text-secondary-700">{c.country}</td>
                <td className="p-3 tabular-nums">{formatRange(c.monthlyBudget.single.min, c.monthlyBudget.single.max)}</td>
                <td className="p-3 tabular-nums">{formatRange(c.monthlyBudget.couple.min, c.monthlyBudget.couple.max)}</td>
                <td className="p-3 tabular-nums">{c.scores.overall.toFixed(1)}</td>
                <td className="p-3 tabular-nums">{c.scores.housing.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-secondary-500">{filtered.length} cities shown</p>
    </div>
  );
}
