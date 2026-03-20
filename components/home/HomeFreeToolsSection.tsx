import Link from 'next/link';

export default function HomeFreeToolsSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-secondary-50 to-white border-b border-secondary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-3xl mb-2 block" aria-hidden>
          🛠️
        </span>
        <h2 className="text-3xl font-bold text-secondary-900 mb-2">Free Money Tools</h2>
        <p className="text-secondary-600 mb-8 max-w-lg mx-auto">
          See if you can afford your next city — more calculators coming soon.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <span className="rounded-2xl border border-secondary-200 bg-white px-6 py-4 text-secondary-800 font-medium shadow-sm">
            💰 Salary Checker
          </span>
          <span className="rounded-2xl border border-secondary-200 bg-white px-6 py-4 text-secondary-800 font-medium shadow-sm">
            ✈️ Relocation Calculator
          </span>
          <span className="rounded-2xl border border-secondary-200 bg-white px-6 py-4 text-secondary-800 font-medium shadow-sm">
            📊 Budget Planner
          </span>
        </div>
        <Link
          href="/tools"
          className="inline-flex items-center px-8 py-3 rounded-full bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
        >
          Try the tools →
        </Link>
      </div>
    </section>
  );
}
