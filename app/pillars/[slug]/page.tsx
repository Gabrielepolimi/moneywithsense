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

const pillarContent: Record<string, {
  intro: string
  sections: Array<{
    title: string
    paragraphs?: string[]
    bullets?: string[]
  }>
}> = {
  'personal-finance': {
    intro: 'Get your money organized, predictable, and pointed toward the goals that matter. This pillar helps you build a stable baseline before chasing optimization.',
    sections: [
      {
        title: 'Why it matters',
        paragraphs: [
          'Personal finance is the operating system for every other money decision. Without a solid handle on cash flow, emergencies, and goals, every tactic feels fragile.',
          'Clarity lowers stress and reduces expensive mistakes. A simple system beats scattered hacks.',
          'When you know your numbers, you can negotiate better, invest calmly, and recover faster from surprises.'
        ]
      },
      {
        title: 'Core principles',
        paragraphs: [
          'Pay yourself first: automate savings toward an emergency fund and short-term goals.',
          'Keep fixed costs lean; avoid lifestyle creep until your safety nets are funded.',
          'Simplify accounts: clear checking for spending, high-yield savings for goals, and a separate buffer for irregular expenses.'
        ]
      },
      {
        title: 'Step-by-step',
        paragraphs: [
          'Map cash flow: list take-home income, fixed bills, and variable spending. Identify leaks.',
          'Build a 1–3 month emergency fund in a high-yield account before increasing investments.',
          'Set 3–5 clear goals (time horizon, target amount, monthly contribution) and automate transfers.',
          'Create a weekly 20-minute money check-in: pay bills, move goal transfers, review one metric (savings rate, buffer, debt progress).',
          'Review quarterly: adjust contributions, cancel unused subscriptions, and renegotiate major bills.'
        ]
      },
      {
        title: 'Common mistakes',
        paragraphs: [
          'Overcomplicating tools and budgets so they break after two weeks.',
          'Running without a buffer and relying on credit for emergencies.',
          'Ignoring irregular expenses (insurance, car maintenance, gifts) which forces debt spikes.'
        ]
      },
      {
        title: 'Quick checklist',
        bullets: [
          'Open/confirm a high-yield savings account; label it Emergency Fund.',
          'Automate transfers on payday toward emergency + one short-term goal.',
          'List fixed bills; renegotiate 1–2 largest (rent, internet, phone, insurance).',
          'Set a weekly 20-minute money review on your calendar.',
          'Track one metric for 30 days: savings rate or spend in top 3 categories.',
          'Create an irregular expenses pot (monthly micro-transfer).',
          'Enable alerts for low balance and large transactions.',
          'Write a one-page plan: goals, monthly amounts, review cadence.'
        ]
      },
      {
        title: 'Sources & references',
        bullets: [
          'OECD financial literacy guidelines',
          'Federal Reserve household economics reports',
          'CFPB (US) or your local consumer finance authority',
          'Reputable high-yield savings providers’ disclosures'
        ]
      }
    ]
  },
  'saving-money': {
    intro: 'Reduce waste without feeling deprived. This pillar focuses on structural savings: bills, habits, and small automations that compound.',
    sections: [
      {
        title: 'Why it matters',
        paragraphs: [
          'Saving is not extreme frugality; it is controlled cash flow that funds freedom and resilience.',
          'Cutting recurring waste has a higher ROI than one-off sacrifices.',
          'A funded buffer prevents high-interest debt when surprises hit.'
        ]
      },
      {
        title: 'Core principles',
        paragraphs: [
          'Attack recurring costs first: housing, transport, food, subscriptions, insurance.',
          'Automate: move savings on payday so you only spend what’s left.',
          'Use rules instead of willpower: 24-hour pause for non-essentials, cart caps, and price anchors.'
        ]
      },
      {
        title: 'Step-by-step',
        paragraphs: [
          'Audit 90 days of statements; flag top 5 spend categories and all recurring charges.',
          'Renegotiate or switch providers (internet, phone, insurance); set reminders to re-shop annually.',
          'Batch cook / meal plan 2–3 anchors per week; set a grocery list template.',
          'Create “micro-buckets” in savings: emergency, essentials buffer, upcoming big purchases.',
          'Set a monthly “stop/keep/start” review to trim, keep, or add habits intentionally.'
        ]
      },
      {
        title: 'Common mistakes',
        paragraphs: [
          'Chasing tiny coupons while ignoring big fixed costs.',
          'Cutting everything at once and rebounding into higher spend later.',
          'Leaving savings in low-yield accounts or mixing them with spending cash.'
        ]
      },
      {
        title: 'Quick checklist',
        bullets: [
          'Cancel/renegotiate 2 subscriptions or bills this week.',
          'Set automated transfers to a high-yield savings on payday.',
          'Cap food delivery/eating out with a weekly limit; pre-commit meals for 3 days.',
          'Create separate pots for emergency and near-term purchases.',
          'Enable merchant/category alerts on your banking app.',
          'Run price checks for insurance/utilities once per year.',
          'Keep a 24-hour pause rule for non-essential buys.',
          'Track savings rate monthly for 3 months.'
        ]
      },
      {
        title: 'Sources & references',
        bullets: [
          'Consumer price index (CPI) data for cost benchmarks',
          'Local consumer protection agency on contracts/penalties',
          'High-yield savings rate trackers',
          'Utility and insurance regulator comparison tools'
        ]
      }
    ]
  },
  'investing-basics': {
    intro: 'Learn long-term, diversified investing so you avoid speculation and focus on time in the market, low fees, and risk that fits your goals.',
    sections: [
      {
        title: 'Why it matters',
        paragraphs: [
          'Investing is how savings outpace inflation over decades.',
          'Knowing the basics prevents panic selling and chasing fads.',
          'A simple, diversified approach frees up time and reduces mistakes.'
        ]
      },
      {
        title: 'Core principles',
        paragraphs: [
          'Diversify broadly (index funds/ETFs), keep fees low, and stay invested.',
          'Align allocation with time horizon and risk capacity, not headlines.',
          'Automate contributions; rebalance on a cadence, not emotions.'
        ]
      },
      {
        title: 'Step-by-step',
        paragraphs: [
          'Define goals and time horizons (short <3y, medium 3–7y, long 10y+).',
          'Pick an account type that fits taxes and access rules in your country.',
          'Choose a simple allocation (e.g., broad equity ETF + bond ETF) and set contribution amounts.',
          'Automate monthly buys; set a quarterly reminder to check allocation drift and rebalance thresholds.',
          'Document your Investment Policy Statement (IPS) to avoid emotional decisions.'
        ]
      },
      {
        title: 'Common mistakes',
        paragraphs: [
          'Stock picking or timing without a plan; chasing performance.',
          'Ignoring fees and taxes, which erode compounding.',
          'Panic selling in downturns due to no predefined rules.'
        ]
      },
      {
        title: 'Quick checklist',
        bullets: [
          'Write a one-page IPS: goals, horizon, target allocation, rebalance rule.',
          'Open the right account type; enable automatic contributions.',
          'Select 1–3 low-cost broad ETFs aligned to your region/currency.',
          'Set a quarterly 15-minute rebalance check.',
          'Turn off market-noise notifications; keep a long-term view.',
          'Know your emergency fund is separate from investments.',
          'Track total expense ratios (TER) and platform fees annually.'
        ]
      },
      {
        title: 'Sources & references',
        bullets: [
          'Regulator/SEC-style investor education portals',
          'World Bank or OECD long-term return data',
          'Provider ETF factsheets and TER disclosures',
          'Local tax authority guidance on capital gains/dividends'
        ]
      }
    ]
  },
  'passive-income': {
    intro: 'Add additional streams without overhyping “passive”. Focus on cash flow, risk, maintenance, and realistic timelines.',
    sections: [
      {
        title: 'Why it matters',
        paragraphs: [
          'Extra income buffers against job risk and accelerates goals.',
          'Diversified cash flow reduces dependence on a single employer or client.',
          'Most “passive” plays still need upfront effort and periodic maintenance—planning prevents disappointment.'
        ]
      },
      {
        title: 'Core principles',
        paragraphs: [
          'Start with low-maintenance, low-capex options before complex plays.',
          'Measure ROI after fees, time, and taxes; cash flow beats vanity revenue.',
          'Document maintenance cadence (updates, renewals, customer support).'
        ]
      },
      {
        title: 'Step-by-step',
        paragraphs: [
          'List skills/assets you already have (content, code, audience, capital).',
          'Pick 1–2 experiments: high-yield savings + a simple digital product/affiliate test.',
          'Ship an MVP in 2–4 weeks; set KPIs (visits, conversion, net margin).',
          'Automate delivery/fulfillment; set weekly 30-minute maintenance slot.',
          'Layer in a second stream only after the first is stable for 4–8 weeks.'
        ]
      },
      {
        title: 'Common mistakes',
        paragraphs: [
          'Overestimating “passive” and underestimating support/updates.',
          'Jumping into high-capex or high-risk plays first.',
          'Ignoring legal/tax implications for payouts and platforms.'
        ]
      },
      {
        title: 'Quick checklist',
        bullets: [
          'Define one low-lift stream to launch this month; timebox to 4 weeks.',
          'Model ROI including fees/taxes; set a minimum acceptable net margin.',
          'Automate delivery, invoicing, and basic customer replies.',
          'Schedule weekly maintenance and monthly KPI review.',
          'Create a sunset/kill rule if ROI not met after a fixed period.',
          'Keep a risk log (platform dependence, policy changes).'
        ]
      },
      {
        title: 'Sources & references',
        bullets: [
          'Platform payout policy docs (Amazon, app stores, ad networks)',
          'Local tax guidance on side income/royalties',
          'Bank/APR disclosures for interest-bearing accounts',
          'Independent reviews on marketplace fees and terms'
        ]
      }
    ]
  },
  budgeting: {
    intro: 'Build a budget that survives real life: flexible, automated, and easy to maintain. The goal is clarity and control, not perfection.',
    sections: [
      {
        title: 'Why it matters',
        paragraphs: [
          'Budgeting creates a feedback loop so you can choose trade-offs intentionally.',
          'A realistic budget prevents debt creep and aligns spending with values.',
          'Visibility reduces anxiety: you know what is safe to spend and what must be protected.'
        ]
      },
      {
        title: 'Core principles',
        paragraphs: [
          'Zero-based or envelope-style allocations make priorities explicit.',
          'Automate fixed transfers; leave only variable spending in the main card.',
          'Review weekly; adjust monthly. Small course corrections beat annual overhauls.'
        ]
      },
      {
        title: 'Step-by-step',
        paragraphs: [
          'List fixed costs, minimum debt payments, and goals; assign amounts on payday.',
          'Create 3–5 envelopes: essentials, variable living, goals, irregulars, fun.',
          'Use separate accounts or sub-accounts to avoid mixing goal money with spending.',
          'Do a weekly 15-minute check: reconcile, move leftovers to goals, reset limits.',
          'Quarterly: recalc targets after income/expense changes.'
        ]
      },
      {
        title: 'Common mistakes',
        paragraphs: [
          'Making the budget too rigid; not allowing a “fun” or buffer line.',
          'Tracking without deciding; numbers mean nothing if categories don’t drive actions.',
          'Ignoring irregular expenses so the budget “breaks” every few months.'
        ]
      },
      {
        title: 'Quick checklist',
        bullets: [
          'Pick a method: zero-based, 50/30/20, or envelope hybrid.',
          'Set up sub-accounts for goals and irregular expenses.',
          'Automate fixed bills + goals; spend from a single variable account/card.',
          'Weekly 15-minute reconciliation; move surplus to goals.',
          'Cap cash withdrawals or discretionary spend with a weekly limit.',
          'Create a small “friction buffer” for surprises each month.'
        ]
      },
      {
        title: 'Sources & references',
        bullets: [
          'Consumer finance regulators on budgeting and debt advice',
          'Banking apps’ official docs on sub-accounts/spaces',
          'Studies on envelope/commitment devices improving adherence',
          'Inflation and cost-of-living trackers to re-anchor categories'
        ]
      }
    ]
  },
  'credit-and-debt': {
    intro: 'Use credit as a tool, not a trap. Protect your score, avoid fee traps, and pick a payoff strategy that fits your psychology and math.',
    sections: [
      {
        title: 'Why it matters',
        paragraphs: [
          'Credit access affects housing, insurance, and job checks in many regions.',
          'Debt drag slows every goal; interest compounds against you.',
          'A plan prevents fees, collections, and long-term score damage.'
        ]
      },
      {
        title: 'Core principles',
        paragraphs: [
          'Pay on time, keep utilization low, and avoid unnecessary hard inquiries.',
          'Choose one payoff method: avalanche (rate-first) or snowball (balance-first).',
          'Consolidate only if fees and discipline improve net outcome.'
        ]
      },
      {
        title: 'Step-by-step',
        paragraphs: [
          'List all debts with APR, balance, minimum, and promo expirations.',
          'Pick avalanche or snowball; automate minimums; stack extra to the target debt.',
          'Set due-date reminders; enable autopay at least for minimums.',
          'Call lenders to seek rate reductions or hardship options if needed.',
          'After payoff, keep a low-utilization card active; avoid closing oldest accounts abruptly.'
        ]
      },
      {
        title: 'Common mistakes',
        paragraphs: [
          'Juggling multiple new credit lines while carrying high utilization.',
          'Ignoring promo expirations and deferred interest offers.',
          'Paying only minimums without a structured payoff plan.'
        ]
      },
      {
        title: 'Quick checklist',
        bullets: [
          'Freeze new credit applications during payoff.',
          'Automate minimums; schedule one extra payment to target debt each month.',
          'Set alerts for utilization >30% and for promo end dates.',
          'Call one lender to negotiate a lower rate or fee reversal.',
          'Track debt-free date; celebrate milestones to stay motivated.',
          'Keep an emergency buffer to avoid new debt during payoff.'
        ]
      },
      {
        title: 'Sources & references',
        bullets: [
          'Credit bureau education portals (e.g., Experian/Equifax/TransUnion)',
          'Local consumer credit regulations and hardship programs',
          'Non-profit credit counseling associations',
          'Regulator warnings about high-cost credit products'
        ]
      }
    ]
  },
  'banking-and-cards': {
    intro: 'Pick accounts and cards that minimize fees, improve yield, and match your spending style. Security and interoperability first.',
    sections: [
      {
        title: 'Why it matters',
        paragraphs: [
          'Bank and card choices shape your fee load, rewards, and fraud protection.',
          'Good account structure simplifies budgeting and automations.',
          'Interoperability (transfers, integrations) saves time and errors.'
        ]
      },
      {
        title: 'Core principles',
        paragraphs: [
          'No or low fees; clear dispute and fraud processes; responsive support.',
          'Use separate accounts for spending vs. savings; avoid mixing buffers with daily spend.',
          'Pick rewards that match your real categories; avoid annual fees unless ROI is clear.'
        ]
      },
      {
        title: 'Step-by-step',
        paragraphs: [
          'List your needs: international travel, cash withdrawals, rewards categories, business vs. personal.',
          'Compare fees (maintenance, ATM, foreign), limits, and app quality.',
          'Open a primary checking for spending, a high-yield savings for goals, and a backup card.',
          'Set up alerts: large transactions, online purchases, foreign use, card-not-present.',
          'Review annually: downgrade/upgrade cards; close only if it won’t hurt history too much.'
        ]
      },
      {
        title: 'Common mistakes',
        paragraphs: [
          'Chasing rewards that don’t match actual spend; paying more in fees than you earn.',
          'Leaving large balances in non-interest accounts.',
          'Weak security hygiene: reused passwords, no 2FA, no alerts.'
        ]
      },
      {
        title: 'Quick checklist',
        bullets: [
          'Enable 2FA and transaction alerts on all accounts/cards.',
          'Open/confirm one high-yield savings; move idle cash.',
          'Map rewards to top 3 categories; cut cards that don’t fit.',
          'Set travel notices and daily spend limits where available.',
          'Download monthly statements; store in a secure folder for records.',
          'Review fee disclosures once a year; renegotiate or switch.'
        ]
      },
      {
        title: 'Sources & references',
        bullets: [
          'Card network and issuer fee schedules',
          'Banking regulator guidance on consumer protections',
          'Independent fee/reward comparison tools',
          'Fraud prevention tips from payment networks'
        ]
      }
    ]
  },
  'taxes-and-finance-tips': {
    intro: 'Stay compliant, organized, and opportunistic about deductions/credits you qualify for. Keep records tidy to avoid stress and penalties.',
    sections: [
      {
        title: 'Why it matters',
        paragraphs: [
          'Taxes touch every paycheck and investment; small mistakes are costly.',
          'Good recordkeeping saves hours and reduces audit anxiety.',
          'Knowing allowed deductions/credits improves net returns.'
        ]
      },
      {
        title: 'Core principles',
        paragraphs: [
          'Keep clean records year-round; don’t rely on memory in tax season.',
          'Separate business/side-hustle finances; keep receipts and invoices organized.',
          'Plan withholding/estimated payments to avoid surprises and penalties.'
        ]
      },
      {
        title: 'Step-by-step',
        paragraphs: [
          'Create a simple folder system: income, expenses, investments, donations, insurance, education.',
          'Track cost basis for investments; keep broker statements and transaction logs.',
          'Set quarterly reminders to upload receipts and reconcile totals.',
          'Check your jurisdiction’s common deductions/credits (education, childcare, retirement, healthcare).',
          'If self-employed, set aside a percentage of revenue for taxes in a separate account.'
        ]
      },
      {
        title: 'Common mistakes',
        paragraphs: [
          'Mixing personal and business expenses; messy records increase risk.',
          'Ignoring estimated tax deadlines where required.',
          'Missing carryovers (losses, credits) due to poor documentation.'
        ]
      },
      {
        title: 'Quick checklist',
        bullets: [
          'Set a monthly 30-minute “tax admin” block.',
          'Store receipts digitally; back up in the cloud.',
          'Download brokerage annual and transaction statements.',
          'Review eligibility for top deductions/credits in your country.',
          'If self-employed, move a fixed % of income to a tax sub-account.',
          'Note filing deadlines; set two reminders before each.'
        ]
      },
      {
        title: 'Sources & references',
        bullets: [
          'Official tax authority website and publications',
          'Certified tax professional guidelines in your country',
          'Broker/platform tax docs and cost-basis tools',
          'Reputable checklists from accounting associations'
        ]
      }
    ]
  },
  'side-hustles': {
    intro: 'Earn extra on your terms. Pick hustles that fit your time, skills, and risk tolerance, and avoid burnout by pacing growth.',
    sections: [
      {
        title: 'Why it matters',
        paragraphs: [
          'Extra income accelerates debt payoff and savings goals.',
          'A side hustle can de-risk career transitions and build new skills.',
          'Structured experiments beat random gigs; you learn faster and quit bad fits sooner.'
        ]
      },
      {
        title: 'Core principles',
        paragraphs: [
          'Validate demand quickly; avoid overbuilding before the first sale.',
          'Timebox experiments; track hourly effective rate after costs.',
          'Protect your health and main job: boundaries and rest matter.'
        ]
      },
      {
        title: 'Step-by-step',
        paragraphs: [
          'List skills/tools you already have; pick one idea with low setup costs.',
          'Set a 2–4 week sprint to launch an MVP and get first paying users.',
          'Track time spent, revenue, costs; decide keep/kill/pivot based on data.',
          'Standardize onboarding, pricing, and delivery to reduce cognitive load.',
          'Reinvest a portion into tools or automation that save time.'
        ]
      },
      {
        title: 'Common mistakes',
        paragraphs: [
          'Saying yes to everything; no niche, no pricing discipline.',
          'Ignoring taxes, contracts, and platform terms.',
          'Letting the hustle erode sleep and main job performance.'
        ]
      },
      {
        title: 'Quick checklist',
        bullets: [
          'Define one offer, one audience; price with a floor rate.',
          'Ship an MVP in 30 days; measure conversion and net hourly rate.',
          'Set weekly hours cap; schedule rest days.',
          'Create a basic contract/engagement letter template.',
          'Track invoices/payments; separate hustle finances.',
          'Decide kill/pivot rules before expanding.'
        ]
      },
      {
        title: 'Sources & references',
        bullets: [
          'Local small-business/sole-proprietor guidelines',
          'Platform terms for marketplaces/freelance sites',
          'Tax authority rules on self-employment income',
          'Best-practice templates from reputable legal/finance orgs'
        ]
      }
    ]
  },
  'money-psychology': {
    intro: 'Your behavior drives results more than spreadsheets. Understand biases, habits, and environment design to stay consistent.',
    sections: [
      {
        title: 'Why it matters',
        paragraphs: [
          'Good plans fail without behavior fit; friction and emotion derail consistency.',
          'Small environment tweaks beat willpower battles.',
          'Awareness of biases (loss aversion, overconfidence) prevents costly moves.'
        ]
      },
      {
        title: 'Core principles',
        paragraphs: [
          'Make the right action the easy action: defaults, automation, pre-commitments.',
          'Use visual cues and checkpoints to sustain habits.',
          'Align goals with values; money is a tool, not a scoreboard.'
        ]
      },
      {
        title: 'Step-by-step',
        paragraphs: [
          'Identify one friction point (overspending category, missed savings transfer).',
          'Add a constraint or automation: lower card limit, separate account, automatic transfer.',
          'Create a trigger-action plan: when paycheck arrives, then move X to savings.',
          'Review monthly: what habit felt hard? Adjust environment before relying on discipline.',
          'Track one behavior metric (e.g., on-time transfers %) instead of only outcomes.'
        ]
      },
      {
        title: 'Common mistakes',
        paragraphs: [
          'Relying purely on motivation without changing systems.',
          'Setting vague goals without triggers or deadlines.',
          'Shame/avoidance when something slips, instead of small resets.'
        ]
      },
      {
        title: 'Quick checklist',
        bullets: [
          'Automate at least one transfer; hide savings from day-to-day view.',
          'Use spending limits/alerts on trouble categories.',
          'Place visual reminders near spending triggers (desk, wallet, phone).',
          'Schedule a 15-minute monthly “money retro”.',
          'Define a reset rule: missed a transfer? Double the next one if affordable.',
          'Pair goals with why they matter to you personally.'
        ]
      },
      {
        title: 'Sources & references',
        bullets: [
          'Behavioral economics primers (biases, nudges)',
          'Habit formation research (implementation intentions, environment design)',
          'Consumer finance behavioral studies from regulators/academia',
          'Well-reviewed books on money mindset and habits'
        ]
      }
    ]
  }
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
  const content = pillarContent[pillar.slug] || {
    intro: pillar.summary,
    sections: [
      { title: 'Why it matters', paragraphs: [pillar.summary] },
      { title: 'Quick checklist', bullets: ['Set goals', 'Review monthly', 'Stay consistent'] },
    ],
  }

  return (
    <div className="bg-white text-gray-900">
      <section className={`bg-gradient-to-br ${color} border-b`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-700">Pillar</p>
          <h1 className="text-4xl md:text-5xl font-bold">{pillar?.title}</h1>
          <p className="text-lg text-gray-700 max-w-3xl">{content.intro}</p>
          <p className="text-sm text-gray-600">Each article in this category should link here, plus two related articles in the cluster.</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {content.sections.map((section) => (
          <div key={section.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-6 space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
            {section.paragraphs?.map((p, idx) => (
              <p key={idx} className="text-gray-700 leading-relaxed">{p}</p>
            ))}
            {section.bullets && (
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {section.bullets.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>
    </div>
  )
}
