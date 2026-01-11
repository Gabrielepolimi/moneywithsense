export const metadata = {
  title: 'Pillars | Money With Sense',
  description: 'Core pillar guides for personal finance categories.',
}

const pillarCategories = [
  'Personal Finance',
  'Saving Money',
  'Investing Basics',
  'Passive Income',
  'Budgeting',
  'Credit & Debt',
  'Banking & Cards',
  'Taxes & Finance Tips',
  'Side Hustles',
  'Money Psychology',
]

export default function PillarsPage() {
  return (
    <div className="bg-white text-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Pillars</p>
          <h1 className="text-3xl md:text-4xl font-bold">Core guides by category</h1>
          <p className="text-gray-600">
            Each pillar is a comprehensive guide (1200–2000 words) that anchors a cluster of related articles. Every new article should link back to its pillar and to two related pieces.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pillarCategories.map((name) => (
            <div key={name} className="rounded-2xl border border-gray-100 bg-gray-50 p-5 space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
              <p className="text-sm text-gray-600">
                Pillar guide coming soon. It will cover fundamentals, common mistakes, checklists, and links to related articles.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
