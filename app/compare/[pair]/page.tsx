import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import {
  getAllComparePairParams,
  getCityBySlug,
  countryFlagEmoji,
  formatCostRange,
  parseCityPair,
  canonicalComparePairSlug,
  getSimilarCities,
  getCheaperAlternatives,
  scoreBarClass,
} from '../../../lib/cities';
import type { City, CityCostRange } from '../../../lib/cities';
import ComparisonSalaryChecker from '../../../components/cities/ComparisonSalaryChecker';
import { ogDefaultImage, siteUrl } from '../../../lib/seo';
const YEAR = 2026;

type Props = { params: Promise<{ pair: string }> };

export function generateStaticParams() {
  return getAllComparePairParams();
}

function mid(r: CityCostRange) {
  return (r.min + r.max) / 2;
}

function usdRange(r: CityCostRange) {
  return `$${r.min.toLocaleString('en-US')}–$${r.max.toLocaleString('en-US')}`;
}

type RowDef = { label: string; a: CityCostRange; b: CityCostRange };

function winnerName(aVal: number, bVal: number, nameA: string, nameB: string): string {
  if (Math.abs(aVal - bVal) < 0.5) return 'Tie';
  return aVal < bVal ? nameA : nameB;
}

function buildRelatedComparisons(A: City, B: City): { pair: string; title: string }[] {
  const seen = new Set<string>();
  const out: { pair: string; title: string }[] = [];
  const push = (s1: string, s2: string, title: string) => {
    if (s1 === s2) return;
    const k = canonicalComparePairSlug(s1, s2);
    if (seen.has(k)) return;
    seen.add(k);
    out.push({ pair: k, title });
  };

  const sim1 = getSimilarCities(A, 8).find((c) => c.slug !== B.slug);
  const sim2 = getSimilarCities(B, 8).find((c) => c.slug !== A.slug);
  const ch1 = getCheaperAlternatives(A, 4).find((c) => c.slug !== B.slug);
  const ch2 = getCheaperAlternatives(B, 4).find((c) => c.slug !== A.slug);

  if (sim1) push(A.slug, sim1.slug, `${A.name} vs ${sim1.name}`);
  if (sim2) push(B.slug, sim2.slug, `${B.name} vs ${sim2.name}`);
  if (ch1) push(A.slug, ch1.slug, `${A.name} vs ${ch1.name}`);
  if (ch2) push(B.slug, ch2.slug, `${B.name} vs ${ch2.name}`);

  return out.slice(0, 4);
}

function chooseBullets(city: City, other: City): string[] {
  const cheaper = city.monthlyBudget.single.max <= other.monthlyBudget.single.max;
  const lines: string[] = [];
  lines.push(
    cheaper
      ? `You want lower typical monthly costs than ${other.name}`
      : `You're happy to pay more for what ${city.name} offers vs ${other.name}`
  );
  for (const p of city.pros) {
    if (lines.length >= 5) break;
    if (!lines.includes(p)) lines.push(p);
  }
  for (const p of city.bestFor) {
    if (lines.length >= 5) break;
    if (!lines.includes(p)) lines.push(p);
  }
  return lines.slice(0, 5);
}

const SCORE_KEYS = [
  'housing',
  'safety',
  'healthcare',
  'education',
  'environment',
  'economy',
  'culture',
  'internet',
] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const parsed = parseCityPair(pair);
  if (!parsed) return { title: `Compare cities | MoneyWithSense` };
  const [ra, rb] = parsed;
  const s1 = ra < rb ? ra : rb;
  const s2 = ra < rb ? rb : ra;
  const A = getCityBySlug(s1);
  const B = getCityBySlug(s2);
  if (!A || !B) return { title: 'Compare cities | MoneyWithSense' };
  const canonicalSlug = canonicalComparePairSlug(ra, rb);
  const title = `${A.name} vs ${B.name} Cost of Living ${YEAR} — Full Comparison | MoneyWithSense`;
  const description = `${A.name} costs ${usdRange(A.monthlyBudget.single)}/month vs ${B.name} at ${usdRange(
    B.monthlyBudget.single
  )}/month. See which city is cheaper, safer, and better for expats in ${YEAR}.`;
  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/compare/${canonicalSlug}`,
      languages: { en: `${siteUrl}/compare/${canonicalSlug}` },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/compare/${canonicalSlug}`,
      images: [ogDefaultImage],
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogDefaultImage.url],
    },
  };
}

export default async function ComparePairPage({ params }: Props) {
  const { pair } = await params;
  const parsed = parseCityPair(pair);
  if (!parsed) notFound();
  const [rawA, rawB] = parsed;
  const canonicalSlug = canonicalComparePairSlug(rawA, rawB);
  if (pair !== canonicalSlug) {
    permanentRedirect(`/compare/${canonicalSlug}`);
  }

  const slugA = rawA < rawB ? rawA : rawB;
  const slugB = rawA < rawB ? rawB : rawA;
  const A = getCityBySlug(slugA);
  const B = getCityBySlug(slugB);
  if (!A || !B) notFound();

  const maxA = A.monthlyBudget.single.max;
  const maxB = B.monthlyBudget.single.max;
  const minA = A.monthlyBudget.single.min;
  const minB = B.monthlyBudget.single.min;
  const cheaper = maxA <= maxB ? A : B;
  const pricier = maxA <= maxB ? B : A;
  const cheapMax = cheaper.monthlyBudget.single.max;
  const priceyMax = pricier.monthlyBudget.single.max;
  const pctMore =
    cheapMax > 0 ? (((priceyMax - cheapMax) / cheapMax) * 100).toFixed(0) : '0';

  const tableRows: RowDef[] = [
    { label: 'Rent (1-bed, city center)', a: A.costs.rentCenterOneBed, b: B.costs.rentCenterOneBed },
    { label: 'Rent (1-bed, outside center)', a: A.costs.rentOutsideOneBed, b: B.costs.rentOutsideOneBed },
    { label: 'Utilities', a: A.costs.utilities, b: B.costs.utilities },
    { label: 'Groceries', a: A.costs.groceries, b: B.costs.groceries },
    { label: 'Eating out (mid-range meal)', a: A.costs.restaurantMid, b: B.costs.restaurantMid },
    { label: 'Public transport (monthly)', a: A.costs.transport, b: B.costs.transport },
    { label: 'Internet & Mobile', a: A.costs.internet, b: B.costs.internet },
    { label: 'Gym membership', a: A.costs.gym, b: B.costs.gym },
    { label: 'Cinema ticket', a: A.costs.cinema, b: B.costs.cinema },
  ];

  const totalA = A.monthlyBudget.single;
  const totalB = B.monthlyBudget.single;
  const midTotalA = mid(totalA);
  const midTotalB = mid(totalB);
  const totalWinner = winnerName(midTotalA, midTotalB, A.name, B.name);

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Is ${A.name} cheaper than ${B.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${cheaper.name} shows lower typical monthly costs ($${cheaper.monthlyBudget.single.min.toLocaleString('en-US')}–$${cheaper.monthlyBudget.single.max.toLocaleString('en-US')}) than ${pricier.name} ($${pricier.monthlyBudget.single.min.toLocaleString('en-US')}–$${pricier.monthlyBudget.single.max.toLocaleString('en-US')}) in our ${YEAR} estimates.`,
        },
      },
      {
        '@type': 'Question',
        name: `What is the cost difference between ${A.name} and ${B.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Using upper single-person estimates, ${pricier.name} is about ${pctMore}% more expensive than ${cheaper.name}. Actual spend varies by lifestyle.`,
        },
      },
      {
        '@type': 'Question',
        name: `Which city has better quality of life, ${A.name} or ${B.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${A.name} scores ${A.scores.overall.toFixed(1)}/10 overall vs ${B.name} at ${B.scores.overall.toFixed(1)}/10. Compare housing, safety, healthcare, and culture in the breakdown below.`,
        },
      },
      {
        '@type': 'Question',
        name: `What salary do you need to live in ${A.name} vs ${B.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `For a single person we estimate roughly ${usdRange(A.monthlyBudget.single)} per month in ${A.name} and ${usdRange(
            B.monthlyBudget.single
          )} in ${B.name}. Use the salary checker on this page to test your income against both.`,
        },
      },
    ],
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Compare', item: `${siteUrl}/compare` },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${A.name} vs ${B.name}`,
        item: `${siteUrl}/compare/${canonicalSlug}`,
      },
    ],
  };

  const related = buildRelatedComparisons(A, B);

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: `${A.name} vs ${B.name} cost of living`,
            url: `${siteUrl}/compare/${canonicalSlug}`,
          }),
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="text-sm text-secondary-500 mb-6">
          <Link href="/" className="hover:text-primary-600">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/compare" className="hover:text-primary-600">
            Compare
          </Link>
          <span className="mx-2">/</span>
          <span className="text-secondary-800">
            {A.name} vs {B.name}
          </span>
        </nav>

        {/* Hero */}
        <section className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-2 text-center md:text-left">
            {countryFlagEmoji(A.countryCode)} {A.name}{' '}
            <span className="text-secondary-400 font-normal mx-1">vs</span>{' '}
            {countryFlagEmoji(B.countryCode)} {B.name}
          </h1>
          <p className="text-secondary-600 text-center md:text-left mb-8">
            Cost of living comparison · {YEAR}
          </p>
          <div className="grid md:grid-cols-2 gap-4 md:gap-6 items-stretch">
            <div
              className={`rounded-2xl border p-6 md:p-8 ${A.slug === cheaper.slug ? 'bg-emerald-50 border-emerald-200' : 'bg-secondary-50 border-secondary-200'}`}
            >
              <div className="text-4xl mb-2">{countryFlagEmoji(A.countryCode)}</div>
              <p className="text-2xl font-bold text-secondary-900">{A.name}</p>
              <p className="text-secondary-600 text-sm mb-3">{A.country}</p>
              <p className="text-2xl font-bold text-primary-800">
                {usdRange(A.monthlyBudget.single)}/mo
              </p>
              <p className="text-sm text-secondary-600 mt-2">
                {formatCostRange(A.monthlyBudget.single.min, A.monthlyBudget.single.max, A)} / month (local)
              </p>
            </div>
            <div
              className={`rounded-2xl border p-6 md:p-8 ${B.slug === cheaper.slug ? 'bg-emerald-50 border-emerald-200' : 'bg-secondary-50 border-secondary-200'}`}
            >
              <div className="text-4xl mb-2">{countryFlagEmoji(B.countryCode)}</div>
              <p className="text-2xl font-bold text-secondary-900">{B.name}</p>
              <p className="text-secondary-600 text-sm mb-3">{B.country}</p>
              <p className="text-2xl font-bold text-primary-800">
                {usdRange(B.monthlyBudget.single)}/mo
              </p>
              <p className="text-sm text-secondary-600 mt-2">
                {formatCostRange(B.monthlyBudget.single.min, B.monthlyBudget.single.max, B)} / month (local)
              </p>
            </div>
          </div>

          <div className="mt-8 text-center max-w-2xl mx-auto">
            {maxA !== maxB && (
              <>
                <p className="mt-3 text-xl font-bold text-secondary-800">
                  {pricier.name} is {pctMore}% more expensive
                </p>
                <p className="text-emerald-700 font-medium mt-1">{cheaper.name} wins on affordability</p>
              </>
            )}
            {maxA === maxB && (
              <p className="mt-3 text-secondary-700">Similar upper-end monthly estimates for a single person.</p>
            )}
          </div>
        </section>

        {/* Comparison table */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">Cost breakdown</h2>
          <div className="overflow-x-auto rounded-2xl border border-secondary-200">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="text-left p-3 font-semibold">Category</th>
                  <th className="text-left p-3 font-semibold">{A.name} (USD)</th>
                  <th className="text-left p-3 font-semibold">{B.name} (USD)</th>
                  <th className="text-left p-3 font-semibold">Winner</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => {
                  const ma = mid(row.a);
                  const mb = mid(row.b);
                  const w = winnerName(ma, mb, A.name, B.name);
                  const aWin = ma < mb;
                  const bWin = mb < ma;
                  return (
                    <tr key={row.label} className="border-t border-secondary-100">
                      <td className="p-3 font-medium text-secondary-800">{row.label}</td>
                      <td className={`p-3 ${aWin ? 'bg-emerald-50 font-medium' : ''}`}>{usdRange(row.a)}</td>
                      <td className={`p-3 ${bWin ? 'bg-emerald-50 font-medium' : ''}`}>{usdRange(row.b)}</td>
                      <td className="p-3 text-secondary-800">
                        {w === 'Tie' ? 'Tie' : `🟢 ${w}`}
                      </td>
                    </tr>
                  );
                })}
                <tr className="border-t-2 border-secondary-300 bg-emerald-50/80 font-bold">
                  <td className="p-3">Monthly total (single)</td>
                  <td className="p-3">{usdRange(totalA)}</td>
                  <td className="p-3">{usdRange(totalB)}</td>
                  <td className="p-3">{totalWinner === 'Tie' ? 'Tie' : `🟢 ${totalWinner}`}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="mb-12">
          <ComparisonSalaryChecker
            cityA={{
              name: A.name,
              monthlyBudget: A.monthlyBudget,
            }}
            cityB={{
              name: B.name,
              monthlyBudget: B.monthlyBudget,
            }}
          />
        </div>

        {/* Quality of life */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-secondary-900 mb-6">Quality of life comparison</h2>
          <div className="space-y-6">
            {SCORE_KEYS.map((key) => {
              const label = key.charAt(0).toUpperCase() + key.slice(1);
              const va = A.scores[key];
              const vb = B.scores[key];
              const aBetter = va > vb;
              const bBetter = vb > va;
              return (
                <div key={key}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-secondary-800">{label}</span>
                    <span className="text-xs text-secondary-500">
                      {va.toFixed(1)} / 10 · {vb.toFixed(1)} / 10
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-secondary-600 truncate">{A.name}</span>
                        {aBetter && (
                          <span className="text-[10px] font-semibold text-emerald-700 whitespace-nowrap">▲ better</span>
                        )}
                      </div>
                      <div className="h-2 rounded-full bg-secondary-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${scoreBarClass(va)}`}
                          style={{ width: `${Math.min(100, va * 10)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-secondary-600 truncate">{B.name}</span>
                        {bBetter && (
                          <span className="text-[10px] font-semibold text-emerald-700 whitespace-nowrap">▲ better</span>
                        )}
                      </div>
                      <div className="h-2 rounded-full bg-secondary-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${scoreBarClass(vb)}`}
                          style={{ width: `${Math.min(100, vb * 10)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Who should choose */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">Who should choose which city?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-secondary-200 p-6 bg-white">
              <h3 className="font-bold text-secondary-900 mb-3">Choose {A.name} if…</h3>
              <ul className="space-y-2 text-secondary-700">
                {chooseBullets(A, B).map((line) => (
                  <li key={line} className="flex gap-2">
                    <span>✓</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-secondary-200 p-6 bg-white">
              <h3 className="font-bold text-secondary-900 mb-3">Choose {B.name} if…</h3>
              <ul className="space-y-2 text-secondary-700">
                {chooseBullets(B, A).map((line) => (
                  <li key={line} className="flex gap-2">
                    <span>✓</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">You might also like…</h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {related.map((r) => (
                <li key={r.pair}>
                  <Link
                    href={`/compare/${r.pair}`}
                    className="block rounded-xl border border-secondary-200 px-4 py-3 hover:border-primary-300 text-primary-700 font-medium"
                  >
                    {r.title} →
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mb-12 grid md:grid-cols-2 gap-6">
          <Link
            href={`/cities/${A.slug}`}
            className="rounded-2xl border border-secondary-200 p-6 hover:border-primary-300 transition-colors block"
          >
            <p className="text-2xl mb-2">📊</p>
            <h3 className="text-lg font-bold text-secondary-900">Full {A.name} guide</h3>
            <p className="text-sm text-secondary-600 mt-2 mb-4">
              See all costs, neighborhoods and quality of life scores
            </p>
            <span className="text-primary-600 font-medium">Explore {A.name} →</span>
          </Link>
          <Link
            href={`/cities/${B.slug}`}
            className="rounded-2xl border border-secondary-200 p-6 hover:border-primary-300 transition-colors block"
          >
            <p className="text-2xl mb-2">📊</p>
            <h3 className="text-lg font-bold text-secondary-900">Full {B.name} guide</h3>
            <p className="text-sm text-secondary-600 mt-2 mb-4">
              See all costs, neighborhoods and quality of life scores
            </p>
            <span className="text-primary-600 font-medium">Explore {B.name} →</span>
          </Link>
        </section>
      </div>
    </div>
  );
}
