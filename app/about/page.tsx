export const metadata = {
  title: 'About | Money With Sense',
  description: 'Learn how Money With Sense delivers clear, practical personal finance guidance for a global audience.',
}

export default function AboutPage() {
  return (
    <div className="bg-white text-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">About</p>
          <h1 className="text-3xl md:text-4xl font-bold">Money With Sense</h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Money With Sense is a practical personal finance publication. We focus on clear, actionable guidance for a global audience: saving money, budgeting, investing basics, side hustles, and responsible credit use.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">What we do</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Explain money topics in simple English, avoiding jargon.</li>
              <li>Prioritize actionable steps over theory.</li>
              <li>Design content to be evergreen, with freshness updates where needed.</li>
              <li>Balance education with responsible monetization (ads and affiliate links with disclosure).</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">How we work</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Start from a keyword map to avoid duplication and cannibalization.</li>
              <li>Use AI-assisted drafting with human review for clarity and compliance.</li>
              <li>Add “Why it matters”, “Common mistakes”, and checklists to each piece.</li>
              <li>Link to authoritative sources (government, regulators, reputable institutions).</li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Disclaimer</h2>
          <p className="text-gray-600">
            Our content is for informational purposes only. It is not financial advice, investment advice, or a recommendation to buy or sell any product or service. Always consider your personal circumstances and consult a qualified professional where appropriate.
          </p>
        </div>
      </div>
    </div>
  )
}
