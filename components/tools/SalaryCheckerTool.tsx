'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import citiesData from '../../data/cities.json';
import type { City } from '../../lib/cities';
import { midRange } from '../../lib/tools/cityCosts';

const cities = citiesData as City[];

type Household = 'single' | 'couple' | 'family';
type Employment = 'employed' | 'freelance' | 'remote';

function householdLabel(h: Household): string {
  if (h === 'family') return 'Family with kids';
  return h.charAt(0).toUpperCase() + h.slice(1);
}

function affordabilityStatus(salary: number, min: number, max: number): 'comfortable' | 'tight' | 'difficult' {
  if (salary > max * 1.1) return 'comfortable';
  if (salary > min) return 'tight';
  return 'difficult';
}

function formatUsd(n: number) {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

function BreakdownPanel({
  city,
  salary,
  budget,
}: {
  city: City;
  salary: number;
  budget: { min: number; max: number };
}) {
  const rent = city.costs.rentCenterOneBed;
  const g = city.costs.groceries;
  const t = city.costs.transport;
  const u = city.costs.utilities;

  const rentM = midRange(rent);
  const gM = midRange(g);
  const tM = midRange(t);
  const uM = midRange(u);
  const core = rentM + gM + tM + uM;
  const budgetMid = midRange(budget);
  const otherM = Math.max(0, budgetMid - core);

  const pct = (x: number) => Math.min(100, Math.round((x / salary) * 100));

  const totalMin = (rent?.min ?? 0) + (g?.min ?? 0) + (t?.min ?? 0) + (u?.min ?? 0) + otherM * 0.85;
  const totalMax = (rent?.max ?? 0) + (g?.max ?? 0) + (t?.max ?? 0) + (u?.max ?? 0) + otherM * 1.15;

  const rentOut = midRange(city.costs.rentOutsideOneBed);
  const saveRent = Math.max(0, rentM - rentOut);

  const rows = [
    { label: 'Rent (1-bed, center)', min: rent?.min ?? 0, max: rent?.max ?? 0, mid: rentM },
    { label: 'Groceries', min: g?.min ?? 0, max: g?.max ?? 0, mid: gM },
    { label: 'Transport', min: t?.min ?? 0, max: t?.max ?? 0, mid: tM },
    { label: 'Utilities', min: u?.min ?? 0, max: u?.max ?? 0, mid: uM },
    { label: 'Other', min: otherM * 0.9, max: otherM * 1.1, mid: otherM },
  ];

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-secondary-900">Monthly breakdown:</h4>
      <ul className="space-y-3 text-sm">
        {rows.map((row) => (
          <li key={row.label} className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-secondary-700 w-48 shrink-0">{row.label}</span>
            <span className="text-secondary-600 w-40 shrink-0">
              {formatUsd(row.min)}–{formatUsd(row.max)}
            </span>
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <div className="flex-1 h-2 rounded-full bg-secondary-200 overflow-hidden max-w-xs">
                <div
                  className="h-full bg-primary-500 rounded-full"
                  style={{ width: `${pct(row.mid)}%` }}
                />
              </div>
              <span className="text-secondary-500 w-10 text-right">{pct(row.mid)}%</span>
            </div>
          </li>
        ))}
      </ul>
      <div className="border-t border-secondary-200 pt-3 text-sm space-y-1">
        <p>
          <strong>Total estimated</strong> ~{formatUsd(totalMin)}–{formatUsd(totalMax)}
        </p>
        <p>
          <strong>Remaining</strong> ~{formatUsd(salary - totalMax)}–{formatUsd(salary - totalMin)}
        </p>
      </div>
      {saveRent > 50 && (
        <p className="text-sm text-primary-700 bg-primary-50 rounded-xl px-4 py-3">
          💡 Tip: Living outside the center saves ~{formatUsd(saveRent)}/month on rent
        </p>
      )}
    </div>
  );
}

export default function SalaryCheckerTool() {
  const sorted = useMemo(
    () => [...cities].sort((a, b) => a.name.localeCompare(b.name, 'en')),
    []
  );

  const [salary, setSalary] = useState('');
  const [employment, setEmployment] = useState<Employment>('employed');
  const [household, setHousehold] = useState<Household>('single');
  const [citySlug, setCitySlug] = useState('');
  const [citySlugB, setCitySlugB] = useState('');
  const [compare, setCompare] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cityQuery, setCityQuery] = useState('');

  const parsedSalary = parseFloat(salary.replace(/,/g, '')) || 0;

  const filteredCities = useMemo(() => {
    const q = cityQuery.trim().toLowerCase();
    if (!q) return sorted.slice(0, 80);
    return sorted.filter((c) => c.name.toLowerCase().includes(q) || c.slug.includes(q)).slice(0, 40);
  }, [sorted, cityQuery]);

  const cityA = citySlug ? cities.find((c) => c.slug === citySlug) : undefined;
  const cityB = compare && citySlugB ? cities.find((c) => c.slug === citySlugB) : undefined;

  const runCalc = () => setSubmitted(true);

  const renderResult = (city: City) => {
    const budget = city.monthlyBudget[household];
    const status = affordabilityStatus(parsedSalary, budget.min, budget.max);
    const leftComfort = parsedSalary - budget.max;
    const labels: Record<typeof status, { title: string; body: string; box: string }> = {
      comfortable: {
        title: '✅ COMFORTABLE',
        body: `You'd have ~${formatUsd(leftComfort)} left each month`,
        box: 'border-emerald-300 bg-emerald-50 text-emerald-900',
      },
      tight: {
        title: '⚠️ TIGHT',
        body: `Your salary is between our lower and upper estimates (${formatUsd(budget.min)}–${formatUsd(budget.max)}).`,
        box: 'border-amber-300 bg-amber-50 text-amber-900',
      },
      difficult: {
        title: '❌ DIFFICULT',
        body: `You're about ${formatUsd(budget.min - parsedSalary)} short vs our lower estimate.`,
        box: 'border-red-300 bg-red-50 text-red-900',
      },
    };
    const L = labels[status];

    return (
      <div className="rounded-2xl border border-secondary-200 bg-white p-6 space-y-6">
        <p className="text-secondary-600 text-sm">
          Results for <strong>{city.name}</strong> — {householdLabel(household)} — {formatUsd(parsedSalary)}
          /month
        </p>
        <div className={`rounded-xl border-2 p-5 ${L.box}`}>
          <p className="text-lg font-bold mb-1">{L.title}</p>
          <p className="text-sm opacity-90">{L.body}</p>
        </div>
        <BreakdownPanel city={city} salary={parsedSalary} budget={budget} />
        <Link
          href={`/cities/${city.slug}`}
          className="inline-flex text-primary-600 font-semibold hover:underline"
        >
          See full {city.name} guide →
        </Link>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="rounded-2xl border border-secondary-200 bg-secondary-50 p-6 md:p-8 space-y-8">
        <div>
          <h3 className="text-sm font-bold text-secondary-500 uppercase tracking-wide mb-4">Step 1: Your Income</h3>
          <label className="block text-sm font-medium text-secondary-700 mb-1">Monthly salary (USD)</label>
          <input
            type="text"
            inputMode="decimal"
            className="w-full max-w-md rounded-xl border border-secondary-200 px-4 py-2.5 mb-4"
            value={salary}
            onChange={(e) => {
              setSalary(e.target.value);
              setSubmitted(false);
            }}
            placeholder="e.g. 4500"
          />
          <p className="text-sm font-medium text-secondary-700 mb-2">Employment type</p>
          <div className="flex flex-wrap gap-2">
            {(['employed', 'freelance', 'remote'] as Employment[]).map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmployment(e)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  employment === e
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white border-secondary-200 text-secondary-700 hover:border-primary-300'
                }`}
              >
                {e === 'employed' ? 'Employed' : e === 'freelance' ? 'Freelance' : 'Remote worker'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-secondary-500 uppercase tracking-wide mb-4">Step 2: Your Situation</h3>
          <p className="text-sm font-medium text-secondary-700 mb-2">Household</p>
          <div className="flex flex-wrap gap-2">
            {(['single', 'couple', 'family'] as Household[]).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHousehold(h)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  household === h
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white border-secondary-200 text-secondary-700 hover:border-primary-300'
                }`}
              >
                {householdLabel(h)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-secondary-500 uppercase tracking-wide mb-4">Step 3: Choose City</h3>
          <input
            type="search"
            placeholder="Search or filter cities…"
            className="w-full max-w-md rounded-xl border border-secondary-200 px-4 py-2.5 mb-2"
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
          />
          <select
            className="w-full max-w-md rounded-xl border border-secondary-200 px-4 py-2.5"
            value={citySlug}
            onChange={(e) => {
              setCitySlug(e.target.value);
              setSubmitted(false);
            }}
          >
            <option value="">Select city…</option>
            {(cityQuery.trim() ? filteredCities : sorted).map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}, {c.country}
              </option>
            ))}
          </select>
        </div>

        {compare && (
          <div>
            <h3 className="text-sm font-bold text-secondary-500 uppercase tracking-wide mb-4">Compare with</h3>
            <select
              className="w-full max-w-md rounded-xl border border-secondary-200 px-4 py-2.5"
              value={citySlugB}
              onChange={(e) => {
                setCitySlugB(e.target.value);
                setSubmitted(false);
              }}
            >
              <option value="">Second city…</option>
              {sorted.map((c) => (
                <option key={c.slug} value={c.slug} disabled={c.slug === citySlug}>
                  {c.name}, {c.country}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="button"
          onClick={runCalc}
          className="px-8 py-3 rounded-full bg-primary-600 text-white font-semibold hover:bg-primary-700"
        >
          Calculate →
        </button>
      </div>

      {submitted && parsedSalary > 0 && cityA && (
        <div className="space-y-6">
          {!compare || !citySlugB ? (
            renderResult(cityA)
          ) : cityB && citySlugB !== citySlug ? (
            <div className="grid md:grid-cols-2 gap-6">
              {renderResult(cityA)}
              {renderResult(cityB)}
            </div>
          ) : (
            <p className="text-amber-700">Pick a different second city to compare.</p>
          )}

          {!compare && (
            <button
              type="button"
              onClick={() => {
                setCompare(true);
                setSubmitted(false);
              }}
              className="text-primary-600 font-semibold hover:underline"
            >
              Compare with another city
            </button>
          )}
        </div>
      )}

      {submitted && (parsedSalary <= 0 || !citySlug) && (
        <p className="text-amber-700">Enter a valid salary and select a city.</p>
      )}
    </div>
  );
}
