'use client';

import { useState } from 'react';
import type { CityCostRange } from '../../lib/cities';

type Household = 'single' | 'couple' | 'family';

type CityBudget = {
  name: string;
  monthlyBudget: {
    single: CityCostRange;
    couple: CityCostRange;
    family: CityCostRange;
  };
};

type Props = {
  cityA: CityBudget;
  cityB: CityBudget;
};

function statusFor(salary: number, budget: CityCostRange): {
  label: string;
  emoji: string;
  sub: string;
  coversPct: number;
} {
  const { min, max } = budget;
  if (salary >= max) {
    const left = salary - max;
    return {
      label: 'Comfortable',
      emoji: '✅',
      sub: `$${left.toLocaleString('en-US')} left/month`,
      coversPct: Math.round((salary / max) * 100),
    };
  }
  if (salary >= min) {
    return {
      label: 'Tight',
      emoji: '⚠️',
      sub: `Between min and max budget bands`,
      coversPct: Math.round((salary / max) * 100),
    };
  }
  const short = min - salary;
  return {
    label: 'Difficult',
    emoji: '❌',
    sub: `$${short.toLocaleString('en-US')} short vs lower estimate`,
    coversPct: Math.round((salary / max) * 100),
  };
}

export default function ComparisonSalaryChecker({ cityA, cityB }: Props) {
  const [salary, setSalary] = useState('');
  const [household, setHousehold] = useState<Household>('single');
  const [submitted, setSubmitted] = useState(false);

  const parsed = parseFloat(salary.replace(/,/g, '')) || 0;
  const bA = cityA.monthlyBudget[household];
  const bB = cityB.monthlyBudget[household];

  const rA = submitted && parsed > 0 ? statusFor(parsed, bA) : null;
  const rB = submitted && parsed > 0 ? statusFor(parsed, bB) : null;

  return (
    <section className="rounded-2xl border border-secondary-200 bg-white p-6 md:p-8">
      <h2 className="text-xl font-bold text-secondary-900 mb-2">See how your salary compares in both cities</h2>
      <p className="text-secondary-600 text-sm mb-6">
        Enter monthly take-home in USD. We compare to our estimated budget range for your household (not financial advice).
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-secondary-700 mb-1">Monthly salary (USD)</label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="e.g. 4500"
            value={salary}
            onChange={(e) => {
              setSalary(e.target.value);
              setSubmitted(false);
            }}
            className="w-full rounded-xl border border-secondary-200 px-4 py-2.5 text-secondary-900 focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="sm:w-48">
          <label className="block text-sm font-medium text-secondary-700 mb-1">Household</label>
          <select
            value={household}
            onChange={(e) => {
              setHousehold(e.target.value as Household);
              setSubmitted(false);
            }}
            className="w-full rounded-xl border border-secondary-200 px-4 py-2.5 text-secondary-900 focus:ring-2 focus:ring-primary-500"
          >
            <option value="single">Single</option>
            <option value="couple">Couple</option>
            <option value="family">Family</option>
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setSubmitted(true)}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-600 text-white font-medium hover:bg-primary-700"
      >
        Compare →
      </button>

      {submitted && parsed <= 0 && (
        <p className="mt-4 text-sm text-amber-700">Please enter a valid monthly salary.</p>
      )}

      {rA && rB && (
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-secondary-100 bg-secondary-50 p-5">
            <p className="font-semibold text-secondary-900 mb-3">{cityA.name}</p>
            <p className="text-lg font-semibold text-secondary-800 mb-1">
              {rA.emoji} {rA.label}
            </p>
            <p className="text-sm text-secondary-700 mb-2">{rA.sub}</p>
            <p className="text-sm text-secondary-600">Covers {rA.coversPct}% of upper estimate</p>
          </div>
          <div className="rounded-xl border border-secondary-100 bg-secondary-50 p-5">
            <p className="font-semibold text-secondary-900 mb-3">{cityB.name}</p>
            <p className="text-lg font-semibold text-secondary-800 mb-1">
              {rB.emoji} {rB.label}
            </p>
            <p className="text-sm text-secondary-700 mb-2">{rB.sub}</p>
            <p className="text-sm text-secondary-600">Covers {rB.coversPct}% of upper estimate</p>
          </div>
        </div>
      )}
    </section>
  );
}
