import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SalaryChecker from '../../../components/cities/SalaryChecker';
import {
  getAllCities,
  getCityBySlug,
  getSimilarCities,
  getCheaperAlternatives,
  countryFlagEmoji,
  formatCost,
  formatCostRange,
  scoreColorClass,
  scoreBarClass,
  getQualityOfLifeScore,
  canonicalComparePairSlug,
  getGlobalCostMeans,
  mortgageMonthly,
  canAffordRent,
  avgCostUsd
} from '../../../lib/cities';
import { fetchCityRelatedPosts } from '../../../lib/fetchCityRelatedPosts';
import { ogImageForCity, siteUrl } from '../../../lib/seo';
const YEAR = 2026;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllCities().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) return { title: 'City not found' };
  const { single } = city.monthlyBudget;
  const title = `Cost of Living in ${city.name} ${YEAR} - Monthly Budget Guide | MoneyWithSense`;
  const description = `Planning to live in ${city.name}? A single person needs $${single.min.toLocaleString('en-US')}-$${single.max.toLocaleString('en-US')}/month. Full breakdown: rent, food, transport, salaries, housing and quality of life scores.`;
  const og = ogImageForCity(city.slug);
  const keywords = [
    `cost of living ${city.name} ${YEAR}`,
    `${city.name} salary`,
    `average salary ${city.name}`,
    `cost to buy apartment ${city.name}`,
    `daily expenses ${city.name} ${YEAR}`,
    `${city.name} cost of living for expats`,
    `${city.name} monthly budget`,
    `rent in ${city.name}`
  ];
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${siteUrl}/cities/${city.slug}`,
      languages: { en: `${siteUrl}/cities/${city.slug}` },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/cities/${city.slug}`,
      images: [og],
    },
    twitter: {
      card: 'summary_large_image',
      images: [og.url],
    },
  };
}

const COST_ROWS: { key: string; label: string }[] = [
  { key: 'rentCenterOneBed', label: 'Rent (1-bed, city center)' },
  { key: 'rentOutsideOneBed', label: 'Rent (1-bed, outside center)' },
  { key: 'utilities', label: 'Utilities (electricity, heating, water)' },
  { key: 'internet', label: 'Internet & Mobile' },
  { key: 'groceries', label: 'Groceries (monthly)' },
  { key: 'restaurantMid', label: 'Eating out (per meal, mid-range)' },
  { key: 'coffee', label: 'Coffee' },
  { key: 'transport', label: 'Public transport (monthly pass)' },
  { key: 'gym', label: 'Gym membership' },
  { key: 'cinema', label: 'Cinema ticket' }
];

const SCORE_DETAIL_KEYS = [
  ['housing', 'Housing'],
  ['safety', 'Safety'],
  ['healthcare', 'Healthcare'],
  ['education', 'Education'],
  ['environment', 'Environment'],
  ['economy', 'Economy'],
  ['culture', 'Culture'],
  ['internet', 'Internet']
] as const;

export default async function CityPage({ params }: Props) {
  const { slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) notFound();

  const similar = getSimilarCities(city, 4);
  const cheaper = getCheaperAlternatives(city, 4);
  const relatedPosts = await fetchCityRelatedPosts(city);

  const single = city.monthlyBudget.single;
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How much does it cost to live in ${city.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `A single person typically needs about $${single.min.toLocaleString('en-US')}–$${single.max.toLocaleString('en-US')} per month in ${city.name}, depending on lifestyle and neighborhood. Couples and families need higher budgets.`
        }
      },
      {
        '@type': 'Question',
        name: `What is the average rent in ${city.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `For a one-bedroom in the city center, expect roughly $${city.costs.rentCenterOneBed.min.toLocaleString('en-US')}–$${city.costs.rentCenterOneBed.max.toLocaleString('en-US')} per month (USD estimates). Outside the center, ranges are typically lower.`
        }
      },
      {
        '@type': 'Question',
        name: `Is ${city.name} expensive for expats?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${city.name} has a cost index of ${city.costIndex} relative to our dataset. Housing and day-to-day costs vary; review the budget scenarios and cost table on this page for a realistic picture.`
        }
      },
      {
        '@type': 'Question',
        name: `What salary do you need to live comfortably in ${city.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `For a comfortable single lifestyle, aim for at least $${single.max.toLocaleString('en-US')}/month or more in take-home pay (USD), based on our upper-range estimate. Adjust for household size and your spending habits.`
        }
      }
    ]
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Cities', item: `${siteUrl}/cities` },
      { '@type': 'ListItem', position: 3, name: city.name, item: `${siteUrl}/cities/${city.slug}` }
    ]
  };

  const placeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: city.name,
    address: { '@type': 'PostalAddress', addressCountry: city.countryCode },
    url: `${siteUrl}/cities/${city.slug}`
  };

  const datasetJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `Cost of Living in ${city.name} 2026`,
    description: `Monthly cost breakdown for ${city.name}: rent, food, transport, utilities, salaries, property prices and quality of life scores.`,
    url: `${siteUrl}/cities/${city.slug}`,
    creator: { '@type': 'Organization', name: 'MoneyWithSense' },
    dateModified: city.lastUpdated,
    variableMeasured: [
      'Rent',
      'Groceries',
      'Transport',
      'Utilities',
      'Salary',
      'Property price',
      'Daily expenses',
      'Overall cost of living'
    ]
  };

  const overall = city.scores?.overall ?? 0;
  const safety = city.scores?.safety ?? 0;
  const housing = city.scores?.housing ?? 0;
  const qol = getQualityOfLifeScore(city);

  const comfortable = single.max;
  const globalMeans = getGlobalCostMeans();
  const dc = city.dailyCosts;
  const hd = city.housingDetails;
  const transportMid = avgCostUsd(city.costs.transport);
  const gymMid = avgCostUsd(city.costs.gym);

  const UNIT_SQM = 60;
  const mortgageEstimate =
    hd?.buyPricePerSqmCenter?.usd && hd?.avgMortgageRate
      ? mortgageMonthly(hd.buyPricePerSqmCenter.usd * UNIT_SQM, hd.avgMortgageRate, 25)
      : null;

  const SALARY_ROLES: { key: keyof NonNullable<typeof city.salaries>; label: string }[] = [
    { key: 'averageNet', label: 'Average net salary' },
    { key: 'softwareEngineer', label: 'Software engineer (mid)' },
    { key: 'marketing', label: 'Marketing manager' },
    { key: 'teacher', label: 'Teacher (secondary)' },
    { key: 'nurse', label: 'Nurse (RN)' }
  ];

  const rentMax = city.costs.rentCenterOneBed?.max ?? 0;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }} />

      <article className="min-h-screen bg-white">
        {/* Split hero */}
        <div className="bg-gradient-to-b from-primary-50 to-white border-b border-secondary-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-start">
              {/* Left: headline + budget + pills */}
              <div className="order-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl md:text-5xl leading-none" aria-hidden>
                    {countryFlagEmoji(city.countryCode)}
                  </span>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 leading-tight">
                      Cost of Living in {city.name}
                    </h1>
                    <p className="text-sm md:text-base text-secondary-600">{city.country}</p>
                  </div>
                </div>

                <p className="text-xs text-secondary-500 uppercase tracking-wider mb-1 font-semibold">
                  Comfortable budget (single)
                </p>
                <p className="text-4xl md:text-5xl font-extrabold text-primary-700 mb-1 leading-none">
                  ${comfortable.toLocaleString('en-US')}
                  <span className="text-xl md:text-2xl font-bold text-secondary-700">/month</span>
                </p>
                <p className="text-sm text-secondary-600 mb-5">
                  Range ${single.min.toLocaleString('en-US')}–${single.max.toLocaleString('en-US')}/month
                </p>

                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  <span className={`px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-[11px] md:text-xs font-bold whitespace-nowrap ${scoreColorClass(overall)}`}>
                    Overall {overall.toFixed(1)}
                  </span>
                  <span className={`px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-[11px] md:text-xs font-bold whitespace-nowrap ${scoreColorClass(safety)}`}>
                    Safety {safety.toFixed(1)}
                  </span>
                  <span className={`px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-[11px] md:text-xs font-bold whitespace-nowrap ${scoreColorClass(housing)}`}>
                    Housing {housing.toFixed(1)}
                  </span>
                  <span className={`px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-[11px] md:text-xs font-bold whitespace-nowrap ${scoreColorClass(qol)}`}>
                    QoL {qol.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-secondary-400 mt-4">Last updated: {city.lastUpdated}</p>
              </div>

              {/* Right: salary checker compact */}
              <div className="order-2">
                <SalaryChecker
                  cityName={city.name}
                  monthlyBudget={city.monthlyBudget}
                  costs={city.costs}
                  compact
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
          {/* Daily costs at a glance */}
          {(dc?.coffee || dc?.beer || dc?.lunch || dc?.monthlyGroceries) && (
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-2">Daily costs at a glance</h2>
              <p className="text-secondary-600 mb-6 text-sm md:text-base">
                Typical prices you&apos;ll pay in {city.name} for everyday essentials.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {dc?.coffee && (
                  <DailyCard emoji="☕" label="Coffee" amount={`$${dc.coffee.usd}`} note={dc.coffee.note} tone="primary" />
                )}
                {dc?.beer && (
                  <DailyCard emoji="🍺" label="Beer" amount={`$${dc.beer.usd}`} note={dc.beer.note} tone="amber" />
                )}
                {dc?.lunch && (
                  <DailyCard emoji="🍽️" label="Lunch" amount={`$${dc.lunch.usd}`} note={dc.lunch.note} tone="emerald" />
                )}
                {dc?.monthlyGroceries && (
                  <DailyCard
                    emoji="🛒"
                    label="Groceries"
                    amount={`$${dc.monthlyGroceries.usd}`}
                    note={dc.monthlyGroceries.note ?? 'monthly'}
                    tone="primary"
                  />
                )}
                {transportMid > 0 && (
                  <DailyCard
                    emoji="🚌"
                    label="Transport"
                    amount={`$${transportMid.toLocaleString('en-US')}`}
                    note="monthly pass"
                    tone="amber"
                  />
                )}
                {gymMid > 0 && (
                  <DailyCard
                    emoji="💪"
                    label="Gym"
                    amount={`$${gymMid.toLocaleString('en-US')}`}
                    note="monthly membership"
                    tone="emerald"
                  />
                )}
              </div>
            </section>
          )}

          {/* Full cost breakdown with vs-global badge */}
          <section>
            <h2 className="text-2xl font-bold text-secondary-900 mb-2">Full cost breakdown</h2>
            <p className="text-secondary-600 mb-6 text-sm md:text-base">
              Colors show how each category compares to the global average of our 100 tracked cities.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-secondary-200">
              <table className="w-full text-sm">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="text-left p-3 font-semibold text-secondary-800">Category</th>
                    <th className="text-right p-3 font-semibold text-secondary-800">USD</th>
                    <th className="text-right p-3 font-semibold text-secondary-800 hidden sm:table-cell">Local</th>
                    <th className="text-right p-3 font-semibold text-secondary-800">vs global</th>
                  </tr>
                </thead>
                <tbody>
                  {COST_ROWS.map(({ key, label }) => {
                    const r = city.costs[key as string];
                    if (!r) return null;
                    const mid = (r.min + r.max) / 2;
                    const mean = globalMeans[key];
                    let diffPct: number | null = null;
                    if (mean && mean > 0) diffPct = Math.round(((mid - mean) / mean) * 100);
                    const tone =
                      diffPct === null
                        ? 'text-secondary-500'
                        : diffPct <= -15
                          ? 'text-emerald-700 bg-emerald-50'
                          : diffPct >= 15
                            ? 'text-red-700 bg-red-50'
                            : 'text-secondary-600 bg-secondary-50';
                    const arrow = diffPct === null ? '—' : diffPct > 0 ? '↑' : diffPct < 0 ? '↓' : '•';
                    return (
                      <tr key={key} className="border-t border-secondary-100">
                        <td className="p-3 text-secondary-800">{label}</td>
                        <td className="p-3 text-right tabular-nums font-medium text-secondary-900">
                          ${r.min.toLocaleString('en-US')}–${r.max.toLocaleString('en-US')}
                        </td>
                        <td className="p-3 text-right tabular-nums text-secondary-600 hidden sm:table-cell">
                          {formatCostRange(r.min, r.max, city)}
                        </td>
                        <td className="p-3 text-right">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${tone}`}>
                            {arrow} {diffPct === null ? 'n/a' : `${diffPct > 0 ? '+' : ''}${diffPct}%`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Housing market */}
          {hd?.buyPricePerSqmCenter && (
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-2">Housing market</h2>
              <p className="text-secondary-600 mb-6 text-sm md:text-base">
                Rent vs buy snapshot for {city.name} — useful if you&apos;re comparing long-term relocation options.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <HousingStat
                  label="Rent (1-bed center)"
                  value={`$${city.costs.rentCenterOneBed.min.toLocaleString('en-US')}–$${city.costs.rentCenterOneBed.max.toLocaleString('en-US')}/mo`}
                />
                <HousingStat
                  label="Buy center (per m²)"
                  value={`$${hd.buyPricePerSqmCenter.usd.toLocaleString('en-US')}`}
                />
                {hd.buyPricePerSqmOutside && (
                  <HousingStat
                    label="Buy outside (per m²)"
                    value={`$${hd.buyPricePerSqmOutside.usd.toLocaleString('en-US')}`}
                  />
                )}
                {typeof hd.priceToRentRatio === 'number' && (
                  <HousingStat label="Price-to-rent ratio" value={`${hd.priceToRentRatio}×`} />
                )}
                {typeof hd.avgMortgageRate === 'number' && (
                  <HousingStat label="Avg mortgage rate" value={`${hd.avgMortgageRate.toFixed(1)}%`} />
                )}
              </div>
              {mortgageEstimate !== null && (
                <p className="mt-5 text-secondary-700 text-sm md:text-base bg-primary-50 border border-primary-200 rounded-2xl p-4 md:p-5">
                  💰 <strong>Mortgage estimate:</strong> a 60 m² apartment in {city.name} center at
                  ~${hd.buyPricePerSqmCenter.usd.toLocaleString('en-US')}/m² with a 25y loan at{' '}
                  {hd.avgMortgageRate?.toFixed(1)}% would cost roughly{' '}
                  <strong className="text-primary-700">
                    ${mortgageEstimate.toLocaleString('en-US')}/month
                  </strong>{' '}
                  — compare that to the rent range above.
                </p>
              )}
            </section>
          )}

          {/* Local salaries */}
          {city.salaries && (
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-2">Local salaries (monthly net, USD)</h2>
              <p className="text-secondary-600 mb-6 text-sm md:text-base">
                Typical take-home in {city.name}. A green badge means the salary covers at least 2.5× the max rent
                for a 1-bed in the center.
              </p>
              <div className="overflow-x-auto rounded-2xl border border-secondary-200">
                <table className="w-full text-sm">
                  <thead className="bg-secondary-50">
                    <tr>
                      <th className="text-left p-3 font-semibold text-secondary-800">Role</th>
                      <th className="text-right p-3 font-semibold text-secondary-800">Monthly net</th>
                      <th className="text-right p-3 font-semibold text-secondary-800">Covers rent?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SALARY_ROLES.map(({ key, label }) => {
                      const s = city.salaries?.[key];
                      if (!s || typeof s.usd !== 'number') return null;
                      const covers = canAffordRent(s.usd, rentMax);
                      return (
                        <tr key={key} className="border-t border-secondary-100">
                          <td className="p-3 text-secondary-800">{label}</td>
                          <td className="p-3 text-right tabular-nums font-medium text-secondary-900">
                            ${s.usd.toLocaleString('en-US')}
                          </td>
                          <td className="p-3 text-right">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                covers
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {covers ? '✅ Yes' : '❌ No'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Insider tips */}
          {city.localTips && city.localTips.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-2">Local insider tips</h2>
              <p className="text-secondary-600 mb-6 text-sm md:text-base">
                Practical ways to cut costs that actually work in {city.name}.
              </p>
              <div className="grid md:grid-cols-3 gap-3 md:gap-4">
                {city.localTips.slice(0, 3).map((tip, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-amber-200 bg-amber-50 p-4 md:p-5 flex gap-3"
                  >
                    <div className="text-2xl leading-none" aria-hidden>💡</div>
                    <p className="text-sm md:text-base text-amber-900">{tip}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">Budget scenarios</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {(['single', 'couple', 'family'] as const).map((k) => {
                const b = city.monthlyBudget[k];
                const label = k === 'single' ? 'Single' : k === 'couple' ? 'Couple' : 'Family';
                return (
                  <div key={k} className="rounded-2xl border border-secondary-200 p-5 bg-white shadow-sm">
                    <h3 className="font-bold text-lg text-secondary-900 mb-2">{label}</h3>
                    <p className="text-primary-700 font-semibold mb-1">
                      ${b.min.toLocaleString('en-US')}–${b.max.toLocaleString('en-US')}/mo USD
                    </p>
                    <p className="text-secondary-600 text-sm mb-4">{formatCostRange(b.min, b.max, city)}</p>
                    <p className="text-xs font-semibold text-secondary-500 uppercase mb-2">Top expenses</p>
                    <ul className="text-sm text-secondary-700 space-y-1">
                      <li>Rent (1-bed center): ~${city.costs.rentCenterOneBed.max.toLocaleString('en-US')}/mo</li>
                      <li>Groceries: ~${city.costs.groceries.max.toLocaleString('en-US')}/mo</li>
                      <li>Transport: ~${city.costs.transport.max.toLocaleString('en-US')}/mo</li>
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>

          {city.neighborhoods?.length ? (
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-6">Neighbourhood guide</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {city.neighborhoods.map((n) => {
                  const mult = n.rentMultiplier ?? 1;
                  const usdMin = Math.round(city.costs.rentCenterOneBed.min * mult);
                  const usdMax = Math.round(city.costs.rentCenterOneBed.max * mult);
                  const badge = n.type === 'central' ? 'Central' : 'Suburban';
                  return (
                    <div key={n.name} className="rounded-2xl border border-secondary-200 p-5">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-secondary-900">{n.name}</h3>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-700">
                          {badge}
                        </span>
                      </div>
                      <p className="text-sm text-secondary-600 mb-3">{n.vibe}</p>
                      <p className="text-sm font-medium text-primary-700">
                        Est. 1-bed rent: ${usdMin.toLocaleString('en-US')}–${usdMax.toLocaleString('en-US')}/mo (
                        {formatCostRange(usdMin, usdMax, city)})
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          <section>
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">Quality of life scores</h2>
            <div className="space-y-4">
              {SCORE_DETAIL_KEYS.map(([key, label]) => {
                const v = city.scores[key as keyof typeof city.scores];
                if (typeof v !== 'number') return null;
                const pct = Math.min(100, Math.max(0, (v / 10) * 100));
                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-secondary-800">{label}</span>
                      <span className="tabular-nums text-secondary-600">{v.toFixed(1)}/10</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary-100 overflow-hidden">
                      <div className={`h-full rounded-full ${scoreBarClass(v)}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">Pros & cons</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
                <h3 className="font-bold text-emerald-800 mb-3">✅ Pros</h3>
                <ul className="space-y-2 text-emerald-900">
                  {city.pros.map((p) => (
                    <li key={p}>• {p}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5">
                <h3 className="font-bold text-red-800 mb-3">❌ Cons</h3>
                <ul className="space-y-2 text-red-900">
                  {city.cons.map((p) => (
                    <li key={p}>• {p}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">Similar cities & cheaper alternatives</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-secondary-800 mb-3">Similar cities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {similar.map((c) => (
                    <CityCard key={c.slug} city={c} />
                  ))}
                </div>
              </div>
              {cheaper.length > 0 && (
                <div>
                  <h3 className="font-semibold text-secondary-800 mb-3">Cheaper alternatives</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {cheaper.map((c) => (
                      <CityCard key={c.slug} city={c} accent="emerald" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {similar.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                Compare {city.name} with another city
              </h2>
              <ul className="space-y-2">
                {similar.slice(0, 4).map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/compare/${canonicalComparePairSlug(city.slug, s.slug)}`}
                      className="text-primary-600 font-medium hover:underline"
                    >
                      {city.name} vs {s.name} →
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {relatedPosts.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-6">Related articles</h2>
              <div className="space-y-4">
                {relatedPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/articles/${post.slug}`}
                    className="block rounded-2xl border border-secondary-200 p-5 hover:border-primary-200 transition-colors"
                  >
                    <h3 className="font-semibold text-secondary-900 mb-2">{post.title}</h3>
                    {post.excerpt && <p className="text-sm text-secondary-600 line-clamp-2 mb-2">{post.excerpt}</p>}
                    <p className="text-xs text-secondary-400">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US') : ''}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <p className="text-sm text-secondary-500 border-t border-secondary-100 pt-8">
            Estimates are for comparison only and do not constitute financial advice. Sources include our internal
            dataset and periodic third-party index updates.
          </p>
        </div>
      </article>
    </>
  );
}

/* ---------- Presentational helpers (server components) ---------- */

function DailyCard({
  emoji,
  label,
  amount,
  note,
  tone
}: {
  emoji: string;
  label: string;
  amount: string;
  note?: string;
  tone: 'primary' | 'amber' | 'emerald';
}) {
  const toneClass =
    tone === 'primary'
      ? 'bg-primary-50 border-primary-100'
      : tone === 'amber'
        ? 'bg-amber-50 border-amber-100'
        : 'bg-emerald-50 border-emerald-100';
  return (
    <div className={`rounded-2xl border ${toneClass} p-4 md:p-5`}>
      <div className="text-3xl md:text-4xl leading-none mb-2" aria-hidden>
        {emoji}
      </div>
      <p className="text-xs uppercase font-semibold text-secondary-500 tracking-wider mb-1">{label}</p>
      <p className="text-xl md:text-2xl font-extrabold text-secondary-900 tabular-nums">{amount}</p>
      {note && <p className="text-xs text-secondary-500 mt-1 line-clamp-2">{note}</p>}
    </div>
  );
}

function HousingStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-secondary-200 bg-white p-4 md:p-5">
      <p className="text-xs uppercase font-semibold text-secondary-500 tracking-wider mb-1">{label}</p>
      <p className="text-lg md:text-xl font-bold text-secondary-900 tabular-nums">{value}</p>
    </div>
  );
}

function CityCard({
  city,
  accent = 'primary'
}: {
  city: import('../../../lib/cities').City;
  accent?: 'primary' | 'emerald';
}) {
  const priceClass = accent === 'emerald' ? 'text-emerald-700' : 'text-primary-700';
  const borderHover = accent === 'emerald' ? 'hover:border-emerald-300' : 'hover:border-primary-300';
  return (
    <Link
      href={`/cities/${city.slug}`}
      className={`block rounded-2xl border border-secondary-200 ${borderHover} bg-white p-4 transition-colors`}
    >
      <div className="text-3xl leading-none mb-2" aria-hidden>
        {countryFlagEmoji(city.countryCode)}
      </div>
      <p className="font-semibold text-secondary-900 leading-tight">{city.name}</p>
      <p className="text-xs text-secondary-500 mb-2">{city.country}</p>
      <p className={`text-sm font-bold tabular-nums ${priceClass}`}>
        ${city.monthlyBudget.single.min.toLocaleString('en-US')}–$
        {city.monthlyBudget.single.max.toLocaleString('en-US')}/mo
      </p>
    </Link>
  );
}
