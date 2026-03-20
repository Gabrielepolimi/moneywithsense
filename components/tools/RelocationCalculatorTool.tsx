'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import citiesData from '../../data/cities.json';
import type { City } from '../../lib/cities';
import { canonicalComparePairSlug } from '../../lib/cities';
import { midRange } from '../../lib/tools/cityCosts';

const cities = citiesData as City[];
const SITE = 'https://moneywithsense.com';

function relocationNotes(city: City): string[] {
  const notes: string[] = [];
  if (city.country === 'United Arab Emirates') {
    notes.push('The UAE has no personal income tax on most employment income—your real purchasing power is often higher than the headline budget suggests.');
  }
  if (city.country === 'Singapore') {
    notes.push('Singapore GST is 9% on many goods and services—factor that into discretionary spend.');
  }
  if (city.country === 'Switzerland') {
    notes.push('Switzerland is expensive but salaries are often high; compare net offers and benefits, not gross alone.');
  }
  if (city.country === 'United States') {
    notes.push('U.S. health insurance is not included in our budget estimates—budget extra separately.');
  }
  return notes;
}

function formatUsd(n: number) {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

export default function RelocationCalculatorTool() {
  const sorted = useMemo(
    () => [...cities].sort((a, b) => a.name.localeCompare(b.name, 'en')),
    []
  );

  const [fromSlug, setFromSlug] = useState('');
  const [toSlug, setToSlug] = useState('');
  const [salary, setSalary] = useState('');
  const [done, setDone] = useState(false);

  const parsed = parseFloat(salary.replace(/,/g, '')) || 0;
  const A = fromSlug ? cities.find((c) => c.slug === fromSlug) : undefined;
  const B = toSlug ? cities.find((c) => c.slug === toSlug) : undefined;

  const equivalent =
    A && B && A.monthlyBudget.single.max > 0
      ? parsed * (B.monthlyBudget.single.max / A.monthlyBudget.single.max)
      : 0;

  const avgA = A ? midRange(A.monthlyBudget.single) : 0;
  const avgB = B ? midRange(B.monthlyBudget.single) : 0;
  const pctAffordable =
    avgA > 0 ? Math.round((1 - avgB / avgA) * 100) : 0;
  const monthlyDiff = parsed - equivalent;

  const shareText =
    A && B && parsed > 0
      ? `I calculated that I need ${formatUsd(equivalent)}/month to maintain my lifestyle in ${B.name} (vs ${formatUsd(parsed)} in ${A.name}). Calculate yours: ${SITE}/tools/relocation-calculator`
      : '';

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(shareText);
      alert('Copied to clipboard!');
    } catch {
      alert('Could not copy — select and copy manually.');
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="rounded-2xl border border-secondary-200 bg-secondary-50 p-6 md:p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">I currently live in</label>
          <select
            className="w-full rounded-xl border border-secondary-200 px-4 py-2.5 bg-white"
            value={fromSlug}
            onChange={(e) => {
              setFromSlug(e.target.value);
              setDone(false);
            }}
          >
            <option value="">City…</option>
            {sorted.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}, {c.country}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">My monthly salary (USD)</label>
          <input
            type="text"
            inputMode="decimal"
            className="w-full rounded-xl border border-secondary-200 px-4 py-2.5 bg-white"
            value={salary}
            onChange={(e) => {
              setSalary(e.target.value);
              setDone(false);
            }}
            placeholder="e.g. 4500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">I&apos;m considering moving to</label>
          <select
            className="w-full rounded-xl border border-secondary-200 px-4 py-2.5 bg-white"
            value={toSlug}
            onChange={(e) => {
              setToSlug(e.target.value);
              setDone(false);
            }}
          >
            <option value="">City…</option>
            {sorted.map((c) => (
              <option key={`t-${c.slug}`} value={c.slug} disabled={c.slug === fromSlug}>
                {c.name}, {c.country}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setDone(true)}
          className="w-full sm:w-auto px-8 py-3 rounded-full bg-primary-600 text-white font-semibold hover:bg-primary-700"
        >
          Calculate equivalent salary →
        </button>
      </div>

      {done && A && B && fromSlug !== toSlug && parsed > 0 && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-secondary-900">
            Moving from {A.name} to {B.name}
          </h2>
          <div className="space-y-2 text-secondary-800">
            <p>
              <strong>Your current salary:</strong> {formatUsd(parsed)}/month in {A.name}
            </p>
            <p>
              <strong>Equivalent salary needed:</strong> {formatUsd(equivalent)}/month in {B.name}
            </p>
          </div>

          {pctAffordable > 0 && (
            <p className="text-lg text-emerald-800 font-medium">
              {B.name} is about {pctAffordable}% more affordable than {A.name} (by our single-person budget midpoints).
            </p>
          )}
          {pctAffordable < 0 && (
            <p className="text-lg text-amber-800 font-medium">
              {B.name} is about {Math.abs(pctAffordable)}% more expensive than {A.name} by the same measure.
            </p>
          )}
          {monthlyDiff > 0 && (
            <p>
              You could maintain a similar lifestyle with about <strong>{formatUsd(monthlyDiff)} LESS</strong> per month
              (in USD terms using our upper budget anchors).
            </p>
          )}
          {monthlyDiff < 0 && (
            <p>
              You may need about <strong>{formatUsd(-monthlyDiff)} MORE</strong> per month in {B.name} to match the same
              lifestyle anchor.
            </p>
          )}

          <div className="rounded-2xl border border-secondary-200 bg-white p-6">
            <h3 className="font-bold text-secondary-900 mb-4">Cost of Living Comparison</h3>
            <div className="space-y-4">
              {[A, B].map((c) => {
                const avg = midRange(c.monthlyBudget.single);
                const maxBar = Math.max(avgA, avgB, 1);
                const w = Math.round((avg / maxBar) * 100);
                return (
                  <div key={c.slug}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-secondary-600">{formatUsd(avg)} avg</span>
                    </div>
                    <div className="h-3 rounded-full bg-secondary-100 overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${w}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl bg-secondary-50 border border-secondary-200 p-5 text-sm space-y-3">
            <p className="font-semibold text-secondary-900">What changes</p>
            <ul className="space-y-2 text-secondary-700">
              <li>
                🏠 Rent: {A.name} {formatUsd(A.costs.rentCenterOneBed.min)}–{formatUsd(A.costs.rentCenterOneBed.max)} →{' '}
                {B.name} {formatUsd(B.costs.rentCenterOneBed.min)}–{formatUsd(B.costs.rentCenterOneBed.max)}
              </li>
              <li>
                🛒 Food: {A.name} {formatUsd(A.costs.groceries.min)}–{formatUsd(A.costs.groceries.max)} → {B.name}{' '}
                {formatUsd(B.costs.groceries.min)}–{formatUsd(B.costs.groceries.max)}
              </li>
              <li>
                🚌 Transport: {A.name} {formatUsd(A.costs.transport.min)}–{formatUsd(A.costs.transport.max)} → {B.name}{' '}
                {formatUsd(B.costs.transport.min)}–{formatUsd(B.costs.transport.max)}
              </li>
            </ul>
            {relocationNotes(B).map((n) => (
              <p key={n} className="text-amber-900 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                ⚠️ Note: {n}
              </p>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            <Link href={`/cities/${B.slug}`} className="text-primary-600 font-semibold hover:underline">
              See full {B.name} guide →
            </Link>
            <Link
              href={`/compare/${canonicalComparePairSlug(A.slug, B.slug)}`}
              className="text-primary-600 font-semibold hover:underline"
            >
              Compare {A.name} vs {B.name} →
            </Link>
          </div>

          <button
            type="button"
            onClick={copyShare}
            className="px-6 py-3 rounded-full border-2 border-primary-600 text-primary-700 font-semibold hover:bg-primary-50"
          >
            Share this result
          </button>
        </div>
      )}

      {done && (!A || !B || fromSlug === toSlug || parsed <= 0) && (
        <p className="text-amber-700">Select two different cities and enter a valid monthly salary.</p>
      )}
    </div>
  );
}
