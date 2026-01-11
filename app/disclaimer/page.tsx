export const metadata = {
  title: 'Disclaimer | Money With Sense',
  description: 'Informational-only disclaimer for Money With Sense.',
}

export default function DisclaimerPage() {
  return (
    <div className="bg-white text-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Disclaimer</p>
          <h1 className="text-3xl md:text-4xl font-bold">Informational purposes only</h1>
        </div>

        <div className="space-y-4 text-gray-700">
          <p>
            Money With Sense provides educational content about personal finance. The information on this site is for informational purposes only and is not financial, investment, tax, or legal advice.
          </p>
          <p>
            We do not know your personal circumstances. Always consider your situation and, where appropriate, consult a qualified professional before making financial decisions.
          </p>
          <p>
            We may earn revenue from ads or affiliate links. Recommendations remain based on merit; sponsored placements are clearly disclosed.
          </p>
          <p>
            Accuracy matters: we strive to keep content updated, but rates, terms, and regulations change. Verify critical details with official sources linked in each article.
          </p>
        </div>
      </div>
    </div>
  )
}
