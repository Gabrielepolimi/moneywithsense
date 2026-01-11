export const metadata = {
  title: 'Editorial Policy | Money With Sense',
  description: 'How Money With Sense researches, writes, and reviews personal finance content.',
}

const principles = [
  'Clarity first: simple English, no unnecessary jargon.',
  'Actionability: every piece includes steps, examples, and checklists.',
  'Accuracy: link to primary or highly reputable sources.',
  'Freshness: update time-sensitive data and rates when relevant.',
  'Disclosure: mark affiliate links and avoid conflicts of interest.',
]

const articleChecklist = [
  'Unique primary keyword (no cannibalization).',
  'H1/H2/H3 structure with “Why it matters” and “Common mistakes” sections.',
  'At least one internal link to a pillar and two related articles.',
  'Sources section with 2–5 reputable references.',
  'Disclaimer included (informational, not advice).',
]

export default function EditorialPolicyPage() {
  return (
    <div className="bg-white text-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <header className="space-y-3">
          <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Editorial policy</p>
          <h1 className="text-3xl md:text-4xl font-bold">How we publish</h1>
          <p className="text-lg text-gray-600">
            Money With Sense delivers clear, practical finance content. We use AI-assisted drafts with human oversight to ensure accuracy, neutrality, and usefulness.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Our principles</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            {principles.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Article checklist</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            {articleChecklist.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Use of AI</h2>
          <p className="text-gray-600">
            AI helps us brainstorm topics, outline, and draft. Editors review for correctness, clarity, compliance with this policy, and add internal links and sources. We do not publish raw AI output.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Conflicts & disclosures</h2>
          <p className="text-gray-600">
            We may earn from ads or affiliate links. Recommendations are merit-based; sponsored placements are labeled. We avoid biased claims and always include a disclaimer.
          </p>
        </section>
      </div>
    </div>
  )
}
