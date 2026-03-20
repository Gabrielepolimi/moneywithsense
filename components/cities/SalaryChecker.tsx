'use client';

import { useMemo, useState } from 'react';
import type { CityCostRange } from '../../lib/cities';

type Household = 'single' | 'couple' | 'family';

type Props = {
  cityName: string;
  monthlyBudget: {
    single: CityCostRange;
    couple: CityCostRange;
    family: CityCostRange;
  };
  costs: Record<string, CityCostRange>;
};

function avg(r: CityCostRange) {
  return Math.round((r.min + r.max) / 2);
}

export default function SalaryChecker({ cityName, monthlyBudget, costs }: Props) {
  const [salary, setSalary] = useState('');
  const [household, setHousehold] = useState<Household>('single');
  const [submitted, setSubmitted] = useState(false);

  const essentials = useMemo(() => {
    const rent = costs.rentCenterOneBed ?? { min: 0, max: 0 };
    const g = costs.groceries ?? { min: 0, max: 0 };
    const u = costs.utilities ?? { min: 0, max: 0 };
    const t = costs.transport ?? { min: 0, max: 0 };
    return avg(rent) + avg(g) + avg(u) + avg(t);
  }, [costs]);

  const parsedSalary = parseFloat(salary.replace(/,/g, '')) || 0;
  const budget = monthlyBudget[household];
  const remaining = parsedSalary - essentials;

  let status: 'comfortable' | 'tight' | 'difficult' | null = null;
  let message = '';
  let pct: number | null = null;
  let shortfall = 0;

  if (submitted && parsedSalary > 0) {
    if (parsedSalary >= budget.max) {
      status = 'comfortable';
      message = `You'd have $${(parsedSalary - budget.max).toLocaleString('en-US')} left each month vs our upper budget estimate.`;
    } else if (parsedSalary >= budget.min) {
      status = 'tight';
      pct = Math.round((parsedSalary / budget.max) * 100);
      message = `Your salary covers about ${pct}% of our upper monthly estimate ($${budget.max.toLocaleString('en-US')}).`;
    } else {
      status = 'difficult';
      shortfall = budget.min - parsedSalary;
      message = `You're about $${shortfall.toLocaleString('en-US')} short of our lower monthly estimate ($${budget.min.toLocaleString('en-US')}).`;
    }
  }

  return (
    <section className="rounded-2xl border border-secondary-200 bg-secondary-50 p-6 md:p-8">
      <h2 className="text-xl font-bold text-secondary-900 mb-2">Can you afford to live in {cityName}?</h2>
      <p className="text-secondary-600 text-sm mb-6">
        Enter your monthly take-home in USD. We compare it to typical budgets for your household size (estimates, not financial advice).
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
            className="w-full rounded-xl border border-secondary-200 px-4 py-2.5 text-secondary-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className="sm:w-56">
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
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
      >
        Check →
      </button>

      {submitted && parsedSalary <= 0 && (
        <p className="mt-4 text-sm text-amber-700">Please enter a valid monthly salary.</p>
      )}

      {submitted && parsedSalary > 0 && status && (
        <div className="mt-6 rounded-xl border border-secondary-200 bg-white p-5">
          {status === 'comfortable' && (
            <p className="text-lg font-semibold text-emerald-700 mb-2">✅ Comfortable</p>
          )}
          {status === 'tight' && (
            <p className="text-lg font-semibold text-amber-700 mb-2">⚠️ Tight</p>
          )}
          {status === 'difficult' && (
            <p className="text-lg font-semibold text-red-700 mb-2">❌ Difficult</p>
          )}
          <p className="text-secondary-700 mb-4">{message}</p>
          <div className="text-sm text-secondary-600 border-t border-secondary-100 pt-4">
            <p>
              <strong>Essential costs (est.):</strong> ${essentials.toLocaleString('en-US')}/mo (rent center 1-bed, groceries, utilities, transport — mid estimates)
            </p>
            <p className="mt-1">
              <strong>Remaining after essentials:</strong> ${remaining.toLocaleString('en-US')}/mo
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
