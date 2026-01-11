export const metadata = {
  title: 'Sources | Money With Sense',
  description: 'Our approach to citing authoritative sources for personal finance content.',
}

const sourceBuckets = [
  {
    title: 'Official & Government',
    items: ['IRS, SEC, CFPB (US)', 'HMRC, FCA (UK)', 'EU/ECB publications', 'OECD, World Bank, IMF'],
  },
  {
    title: 'Regulators & Central Banks',
    items: ['Federal Reserve, Bank of England, ECB', 'National central banks and financial regulators'],
  },
  {
    title: 'Data & Research',
    items: ['Statista, FRED, BIS, reputable academic or industry studies'],
  },
  {
    title: 'Product Information',
    items: ['Issuer/bank official pages', 'Terms & conditions, rate sheets, fee schedules'],
  },
]

export default function SourcesPage() {
  return (
    <div className="bg-white text-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Sources</p>
          <h1 className="text-3xl md:text-4xl font-bold">How we reference information</h1>
          <p className="text-lg text-gray-600">
            We prioritize authoritative, up-to-date sources and link to them directly. Each article includes a “Sources & references” box with 2–5 reputable links.
          </p>
        </header>

        <section className="grid md:grid-cols-2 gap-6">
          {sourceBuckets.map((bucket) => (
            <div key={bucket.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <h2 className="text-lg font-semibold text-gray-900">{bucket.title}</h2>
              <ul className="list-disc list-inside text-gray-600 mt-3 space-y-2">
                {bucket.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Accuracy and freshness</h2>
          <p className="text-gray-600">
            Rates, thresholds, and rules change. We mark time-sensitive data and review articles periodically; outdated claims are corrected or removed. Where regional differences matter, we note the jurisdiction.
          </p>
        </section>
      </div>
    </div>
  )
}
