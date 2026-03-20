'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { canonicalComparePairSlug } from '../../lib/cities';

export type CityOption = { slug: string; name: string; country: string };

type Props = {
  cities: CityOption[];
};

export default function CompareCityPicker({ cities }: Props) {
  const router = useRouter();
  const sorted = useMemo(
    () => [...cities].sort((a, b) => a.name.localeCompare(b.name, 'en')),
    [cities]
  );
  const [a, setA] = useState('');
  const [b, setB] = useState('');

  const go = () => {
    if (!a || !b || a === b) return;
    const pair = canonicalComparePairSlug(a, b);
    router.push(`/compare/${pair}`);
  };

  return (
    <div className="rounded-2xl border border-secondary-200 bg-secondary-50 p-6 md:p-8">
      <p className="text-secondary-700 mb-4 font-medium">Pick two cities — we&apos;ll open the side-by-side guide.</p>
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-secondary-700 mb-1">City A</label>
          <select
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="w-full rounded-xl border border-secondary-200 px-4 py-2.5 text-secondary-900 bg-white"
          >
            <option value="">Select…</option>
            {sorted.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} — {c.country}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-secondary-700 mb-1">City B</label>
          <select
            value={b}
            onChange={(e) => setB(e.target.value)}
            className="w-full rounded-xl border border-secondary-200 px-4 py-2.5 text-secondary-900 bg-white"
          >
            <option value="">Select…</option>
            {sorted.map((c) => (
              <option key={`b-${c.slug}`} value={c.slug}>
                {c.name} — {c.country}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={go}
          disabled={!a || !b || a === b}
          className="px-8 py-3 rounded-full bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Compare →
        </button>
      </div>
    </div>
  );
}
