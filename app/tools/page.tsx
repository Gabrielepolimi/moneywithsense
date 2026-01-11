export const metadata = {
  title: 'Tools | Money With Sense',
  description: 'Interactive calculators and helpers for personal finance.',
}

const plannedTools = [
  { name: 'Savings Goal Calculator', summary: 'How much to save per month to reach a target by a date.' },
  { name: 'Debt Payoff Planner', summary: 'Snowball/avalanche estimator with timelines.' },
  { name: 'Rule of 72', summary: 'Quick growth/doubling time estimator.' },
]

export default function ToolsPage() {
  return (
    <div className="bg-white text-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Tools</p>
          <h1 className="text-3xl md:text-4xl font-bold">Finance calculators</h1>
          <p className="text-gray-600">
            We are rolling out simple, SEO-friendly calculators to help readers plan, save, and pay off debt. Below are the first planned tools.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {plannedTools.map((tool) => (
            <div key={tool.name} className="rounded-2xl border border-gray-100 bg-gray-50 p-5 space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">{tool.name}</h2>
              <p className="text-sm text-gray-600">{tool.summary}</p>
              <p className="text-xs text-emerald-700 font-semibold">Coming soon</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
