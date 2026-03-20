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
  canonicalComparePairSlug
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
  const description = `Planning to live in ${city.name}? A single person needs $${single.min.toLocaleString('en-US')}-$${single.max.toLocaleString('en-US')}/month. Full breakdown: rent, food, transport, and quality of life scores.`;
  const og = ogImageForCity(city.slug);
  return {
    title,
    description,
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
    description: `Monthly cost breakdown for ${city.name}: rent, food, transport, utilities and quality of life scores.`,
    url: `${siteUrl}/cities/${city.slug}`,
    creator: { '@type': 'Organization', name: 'MoneyWithSense' },
    dateModified: city.lastUpdated,
    variableMeasured: ['Rent', 'Groceries', 'Transport', 'Utilities', 'Overall cost of living']
  };

  const overall = city.scores?.overall ?? 0;
  const safety = city.scores?.safety ?? 0;
  const housing = city.scores?.housing ?? 0;
  const qol = getQualityOfLifeScore(city);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }} />

      <article className="min-h-screen bg-white">
        <div className="bg-gradient-to-b from-primary-50 to-white border-b border-secondary-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 text-center">
            <div className="text-5xl mb-3" aria-hidden>
              {countryFlagEmoji(city.countryCode)}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-1">
              Cost of Living in {city.name}
            </h1>
            <p className="text-lg text-secondary-600 mb-6">{city.country}</p>
            <p className="text-sm text-secondary-500 uppercase tracking-wide mb-2">Monthly budget (single)</p>
            <p className="text-4xl md:text-5xl font-extrabold text-primary-700 mb-2">
              ${single.min.toLocaleString('en-US')}–${single.max.toLocaleString('en-US')}
              <span className="text-2xl md:text-3xl font-bold text-secondary-700">/month</span>
            </p>
            <p className="text-lg text-secondary-700 mb-8">
              {formatCostRange(single.min, single.max, city)} <span className="text-secondary-500">(local currency)</span>
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${scoreColorClass(overall)}`}>
                Overall {overall.toFixed(1)}
              </span>
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${scoreColorClass(safety)}`}>
                Safety {safety.toFixed(1)}
              </span>
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${scoreColorClass(housing)}`}>
                Housing {housing.toFixed(1)}
              </span>
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${scoreColorClass(qol)}`}>
                Quality of life {qol.toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-secondary-400 mt-6">Last updated: {city.lastUpdated}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
          <SalaryChecker cityName={city.name} monthlyBudget={city.monthlyBudget} costs={city.costs} />

          <section>
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">Cost breakdown</h2>
            <div className="overflow-x-auto rounded-2xl border border-secondary-200">
              <table className="w-full text-sm">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="text-left p-3 font-semibold text-secondary-800">Category</th>
                    <th className="text-right p-3 font-semibold text-secondary-800">USD</th>
                    <th className="text-right p-3 font-semibold text-secondary-800">Local currency</th>
                  </tr>
                </thead>
                <tbody>
                  {COST_ROWS.map(({ key, label }) => {
                    const r = city.costs[key as string];
                    if (!r) return null;
                    return (
                      <tr key={key} className="border-t border-secondary-100">
                        <td className="p-3 text-secondary-800">{label}</td>
                        <td className="p-3 text-right tabular-nums">
                          ${r.min.toLocaleString('en-US')}–${r.max.toLocaleString('en-US')}
                        </td>
                        <td className="p-3 text-right tabular-nums">{formatCostRange(r.min, r.max, city)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

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
                <div className="space-y-3">
                  {similar.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/cities/${c.slug}`}
                      className="block rounded-xl border border-secondary-200 p-4 hover:border-primary-300 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{countryFlagEmoji(c.countryCode)}</span>
                        <div>
                          <p className="font-medium text-secondary-900">{c.name}</p>
                          <p className="text-sm text-secondary-500">{c.country}</p>
                          <p className="text-sm text-primary-600 mt-1">
                            ${c.monthlyBudget.single.min.toLocaleString('en-US')}–$
                            {c.monthlyBudget.single.max.toLocaleString('en-US')}/mo
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-secondary-800 mb-3">Cheaper alternatives</h3>
                <div className="space-y-3">
                  {cheaper.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/cities/${c.slug}`}
                      className="block rounded-xl border border-secondary-200 p-4 hover:border-primary-300 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{countryFlagEmoji(c.countryCode)}</span>
                        <div>
                          <p className="font-medium text-secondary-900">{c.name}</p>
                          <p className="text-sm text-secondary-500">{c.country}</p>
                          <p className="text-sm text-primary-600 mt-1">
                            ${c.monthlyBudget.single.min.toLocaleString('en-US')}–$
                            {c.monthlyBudget.single.max.toLocaleString('en-US')}/mo
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
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
