'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface SavingsResult {
  monthlyNeeded: number;
  totalContributions: number;
  totalInterestEarned: number;
  finalAmount: number;
  monthlyBreakdown: { month: number; balance: number; contribution: number; interest: number }[];
}

function calculateSavings(
  goalAmount: number,
  currentSavings: number,
  months: number,
  annualInterestRate: number
): SavingsResult {
  const monthlyRate = annualInterestRate / 100 / 12;
  const remaining = Math.max(goalAmount - currentSavings, 0);

  if (months <= 0 || remaining <= 0) {
    return {
      monthlyNeeded: 0,
      totalContributions: 0,
      totalInterestEarned: 0,
      finalAmount: currentSavings,
      monthlyBreakdown: [],
    };
  }

  let monthlyNeeded: number;

  if (monthlyRate === 0) {
    monthlyNeeded = remaining / months;
  } else {
    const factor = Math.pow(1 + monthlyRate, months);
    const futureCurrentSavings = currentSavings * factor;
    monthlyNeeded = (goalAmount - futureCurrentSavings) * monthlyRate / (factor - 1);
    monthlyNeeded = Math.max(monthlyNeeded, 0);
  }

  const monthlyBreakdown: SavingsResult['monthlyBreakdown'] = [];
  let balance = currentSavings;
  let totalContributions = 0;
  let totalInterestEarned = 0;

  for (let month = 1; month <= months; month++) {
    const interest = balance * monthlyRate;
    balance += interest + monthlyNeeded;
    totalContributions += monthlyNeeded;
    totalInterestEarned += interest;

    monthlyBreakdown.push({
      month,
      balance: Math.round(balance * 100) / 100,
      contribution: monthlyNeeded,
      interest: Math.round(interest * 100) / 100,
    });
  }

  return {
    monthlyNeeded: Math.round(monthlyNeeded * 100) / 100,
    totalContributions: Math.round(totalContributions * 100) / 100,
    totalInterestEarned: Math.round(totalInterestEarned * 100) / 100,
    finalAmount: Math.round(balance * 100) / 100,
    monthlyBreakdown,
  };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function SavingsGoalCalculator() {
  const [goalAmount, setGoalAmount] = useState(10000);
  const [currentSavings, setCurrentSavings] = useState(1000);
  const [months, setMonths] = useState(24);
  const [annualInterestRate, setAnnualInterestRate] = useState(4.5);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const result = useMemo(() => {
    return calculateSavings(goalAmount, currentSavings, months, annualInterestRate);
  }, [goalAmount, currentSavings, months, annualInterestRate]);

  const progressPercent = Math.min((currentSavings / goalAmount) * 100, 100);

  const presetGoals = [
    { label: 'Emergency Fund', amount: 10000 },
    { label: 'Vacation', amount: 5000 },
    { label: 'Car Down Payment', amount: 8000 },
    { label: 'Home Down Payment', amount: 50000 },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/tools" 
            className="inline-flex items-center text-sm text-secondary-500 hover:text-primary-600 mb-6 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Tools
          </Link>
          <div className="flex items-start gap-4">
            <div className="text-5xl">🎯</div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-2">
                Savings Goal Calculator
              </h1>
              <p className="text-secondary-600 text-lg">
                Find out exactly how much you need to save each month to reach your financial goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Result Card - Always visible at top on mobile */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-lg mb-8">
          <h2 className="text-sm font-medium text-primary-100 uppercase tracking-wider mb-1">
            Monthly Savings Needed
          </h2>
          <p className="text-5xl font-bold mb-4">
            {formatCurrency(result.monthlyNeeded)}
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary-500/30">
            <div>
              <p className="text-primary-200 text-xs">Total You&apos;ll Save</p>
              <p className="text-xl font-semibold">{formatCurrency(result.totalContributions)}</p>
            </div>
            <div>
              <p className="text-primary-200 text-xs">Interest Earned</p>
              <p className="text-xl font-semibold text-green-300">+{formatCurrency(result.totalInterestEarned)}</p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Quick Presets */}
            <div className="bg-secondary-50 rounded-2xl p-5 border border-secondary-100">
              <h3 className="text-sm font-semibold text-secondary-700 mb-3">Quick Presets</h3>
              <div className="flex flex-wrap gap-2">
                {presetGoals.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setGoalAmount(preset.amount)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                      goalAmount === preset.amount
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-secondary-600 border-secondary-200 hover:border-primary-300'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Inputs */}
            <div className="bg-white rounded-2xl p-6 border border-secondary-100 shadow-sm space-y-5">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  🎯 Savings Goal
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-500 text-lg">$</span>
                  <input
                    type="number"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-10 pr-4 py-3 text-lg font-semibold rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    min="0"
                    step="500"
                  />
                </div>
                <input
                  type="range"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(Number(e.target.value))}
                  className="w-full mt-2 accent-primary-600"
                  min="1000"
                  max="100000"
                  step="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  💰 Current Savings
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-500 text-lg">$</span>
                  <input
                    type="number"
                    value={currentSavings}
                    onChange={(e) => setCurrentSavings(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-10 pr-4 py-3 text-lg font-semibold rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    min="0"
                    step="100"
                  />
                </div>
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-secondary-500 mb-1">
                    <span>Progress toward goal</span>
                    <span>{progressPercent.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-secondary-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  📅 Timeframe (months)
                </label>
                <input
                  type="number"
                  value={months}
                  onChange={(e) => setMonths(Math.max(1, Number(e.target.value)))}
                  className="w-full px-4 py-3 text-lg font-semibold rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  min="1"
                  max="360"
                />
                <div className="flex gap-2 mt-2">
                  {[6, 12, 24, 36, 60].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMonths(m)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        months === m
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-secondary-600 border-secondary-200 hover:border-primary-300'
                      }`}
                    >
                      {m < 12 ? `${m}mo` : `${m / 12}yr`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  📈 Annual Interest Rate (APY)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={annualInterestRate}
                    onChange={(e) => setAnnualInterestRate(Math.max(0, Number(e.target.value)))}
                    className="w-full px-4 py-3 text-lg font-semibold rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pr-10"
                    min="0"
                    max="20"
                    step="0.1"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400 font-medium">%</span>
                </div>
                <p className="text-xs text-secondary-500 mt-1.5">
                  High-yield savings accounts typically offer 4-5% APY.
                </p>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="bg-white rounded-2xl p-5 border border-secondary-100 shadow-sm">
              <h3 className="font-semibold text-secondary-900 mb-4">Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-secondary-100">
                  <span className="text-secondary-600">Starting amount</span>
                  <span className="font-semibold text-secondary-900">{formatCurrency(currentSavings)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-secondary-100">
                  <span className="text-secondary-600">Amount still needed</span>
                  <span className="font-semibold text-secondary-900">{formatCurrency(Math.max(goalAmount - currentSavings, 0))}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-secondary-100">
                  <span className="text-secondary-600">Time to reach goal</span>
                  <span className="font-semibold text-secondary-900">
                    {months >= 12 ? `${Math.floor(months / 12)} yr ${months % 12} mo` : `${months} months`}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-secondary-100">
                  <span className="text-secondary-600">Final balance</span>
                  <span className="font-semibold text-primary-600">{formatCurrency(result.finalAmount)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-secondary-600">Free money from interest</span>
                  <span className="font-semibold text-green-600">+{formatCurrency(result.totalInterestEarned)}</span>
                </div>
              </div>
            </div>

            {/* Toggle Monthly Breakdown */}
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="w-full flex items-center justify-between p-4 bg-secondary-50 rounded-xl border border-secondary-100 hover:bg-secondary-100 transition-colors"
            >
              <span className="font-medium text-secondary-700">View Monthly Breakdown</span>
              <svg
                className={`w-5 h-5 text-secondary-500 transition-transform ${showBreakdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showBreakdown && result.monthlyBreakdown.length > 0 && (
              <div className="bg-white rounded-2xl border border-secondary-100 overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-secondary-600 font-medium">Month</th>
                        <th className="px-4 py-3 text-right text-secondary-600 font-medium">Deposit</th>
                        <th className="px-4 py-3 text-right text-secondary-600 font-medium">Interest</th>
                        <th className="px-4 py-3 text-right text-secondary-600 font-medium">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.monthlyBreakdown.map((row, i) => (
                        <tr key={row.month} className={i % 2 === 0 ? 'bg-white' : 'bg-secondary-50/50'}>
                          <td className="px-4 py-2.5 text-secondary-700">{row.month}</td>
                          <td className="px-4 py-2.5 text-right text-secondary-700">{formatCurrency(row.contribution)}</td>
                          <td className="px-4 py-2.5 text-right text-green-600">{formatCurrency(row.interest)}</td>
                          <td className="px-4 py-2.5 text-right font-medium text-secondary-900">{formatCurrency(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
              <h3 className="font-semibold text-secondary-900 mb-3 flex items-center gap-2">
                <span>💡</span> Tips to Save Faster
              </h3>
              <ul className="space-y-2 text-sm text-secondary-700">
                <li className="flex gap-2">
                  <span className="text-amber-500">•</span>
                  <span>Set up automatic transfers on payday</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-500">•</span>
                  <span>Use a high-yield savings account (4-5% APY)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-500">•</span>
                  <span>Add windfalls (tax refunds, bonuses) to savings</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-500">•</span>
                  <span>Round up purchases and save the difference</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-secondary-50 rounded-xl border border-secondary-100">
          <p className="text-xs text-secondary-500 leading-relaxed">
            <strong>Disclaimer:</strong> This calculator provides estimates for informational purposes only. 
            Actual results may vary based on interest rate changes, fees, and other factors. 
            This is not financial advice. Consult a qualified financial advisor for personalized guidance.
          </p>
        </div>
      </div>
    </div>
  );
}
