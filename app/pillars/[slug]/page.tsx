import { notFound } from 'next/navigation'

const siteUrl = 'https://moneywithsense.com'

const pillars = [
  { slug: 'personal-finance', title: 'Personal Finance', summary: 'Foundations: cash flow, safety nets, goal setting, and systems that stick.', color: 'emerald' },
  { slug: 'saving-money', title: 'Saving Money', summary: 'Cut waste, lower bills, and build an emergency fund without extreme frugality.', color: 'blue' },
  { slug: 'investing-basics', title: 'Investing Basics', summary: 'Long-term investing, diversification, fees, and risk basics for beginners.', color: 'indigo' },
  { slug: 'passive-income', title: 'Passive Income', summary: 'Practical ways to add cash flow with realistic expectations and risk notes.', color: 'orange' },
  { slug: 'budgeting', title: 'Budgeting', summary: 'Budgets that work in real life: frameworks, templates, and tracking habits.', color: 'teal' },
  { slug: 'credit-and-debt', title: 'Credit & Debt', summary: 'Use credit wisely, protect your score, and pay down debt with a plan.', color: 'amber' },
  { slug: 'banking-and-cards', title: 'Banking & Cards', summary: 'Pick accounts and cards that fit your needs; minimize fees; maximize perks.', color: 'violet' },
  { slug: 'taxes-and-finance-tips', title: 'Taxes & Finance Tips', summary: 'Everyday tax basics, recordkeeping, deductions where applicable.', color: 'cyan' },
  { slug: 'side-hustles', title: 'Side Hustles', summary: 'Low-barrier ways to earn more; time/skill fit; how to avoid burnout.', color: 'rose' },
  { slug: 'money-psychology', title: 'Money Psychology', summary: 'Habits, biases, and mindset shifts to stay consistent with your plan.', color: 'slate' },
]

const colors = {
  emerald: 'from-emerald-50 to-emerald-100 text-emerald-800 border-emerald-200',
  blue: 'from-blue-50 to-blue-100 text-blue-800 border-blue-200',
  indigo: 'from-indigo-50 to-indigo-100 text-indigo-800 border-indigo-200',
  orange: 'from-orange-50 to-orange-100 text-orange-800 border-orange-200',
  teal: 'from-teal-50 to-teal-100 text-teal-800 border-teal-200',
  amber: 'from-amber-50 to-amber-100 text-amber-800 border-amber-200',
  violet: 'from-violet-50 to-violet-100 text-violet-800 border-violet-200',
  cyan: 'from-cyan-50 to-cyan-100 text-cyan-800 border-cyan-200',
  rose: 'from-rose-50 to-rose-100 text-rose-800 border-rose-200',
  slate: 'from-slate-50 to-slate-100 text-slate-800 border-slate-200',
}

export async function generateStaticParams() {
  return pillars.map(({ slug }) => ({ slug }))
}

export const dynamic = 'force-dynamic'
export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const pillar = pillars.find((p) => p.slug === slug)
  if (!pillar) {
    return { title: 'Pillar not found | Money With Sense' }
  }
  const title = `${pillar.title} Pillar | Money With Sense`
  const description = `${pillar.summary} Core guide with why it matters, common mistakes, and a quick checklist.`
  const canonical = `${siteUrl}/pillars/${pillar.slug}`
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: 'Money With Sense' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function PillarDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const pillar = pillars.find((p) => p.slug === slug)
  if (!pillar) notFound()
  const color = colors[pillar!.color as keyof typeof colors] || colors.slate

  const sections = [
    { title: 'Why it matters', body: 'Context for this pillar: what it solves, who benefits, and how it fits into a simple, long-term money plan.' },
    { title: 'Core principles', body: 'Key rules of thumb, risk notes, and the minimum viable setup to get started without over-optimizing.' },
    { title: 'Step-by-step', body: 'Concrete steps, from setup to maintenance. Include realistic timelines and what “good enough” looks like.' },
    { title: 'Common mistakes', body: 'Frequent pitfalls, red flags, and how to avoid paying hidden fees or making rushed decisions.' },
    { title: 'Quick checklist', body: 'Short list of actions to complete this week; keep it scannable and practical.' },
    { title: 'Sources & references', body: 'Link to 2–5 reputable sources (regulators, banks, official docs, or trusted research).' },
  ]

  return (
    <div className="bg-white text-gray-900">
      <section className={`bg-gradient-to-br ${color} border-b`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-700">Pillar</p>
          <h1 className="text-4xl md:text-5xl font-bold">{pillar?.title}</h1>
          <p className="text-lg text-gray-700 max-w-3xl">{pillar?.summary}</p>
          <p className="text-sm text-gray-600">Each article in this category should link here, plus two related articles in the cluster.</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {sections.map((section) => (
          <div key={section.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-6 space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
            <p className="text-gray-700">{section.body}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
