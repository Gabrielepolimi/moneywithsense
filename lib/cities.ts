import citiesData from '../data/cities.json';
import topComparisonPairsData from '../data/top-comparison-pairs.json';

export type CityNeighborhood = {
  name: string;
  type: string;
  rentMultiplier: number;
  vibe: string;
};

export type CityCostRange = { min: number; max: number };

export type CityScores = {
  overall: number;
  housing: number;
  safety: number;
  healthcare: number;
  education: number;
  environment: number;
  economy: number;
  culture: number;
  internet: number;
};

export type City = {
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  continent: string;
  currency: string;
  currencySymbol: string;
  /** USD value of 1 unit of local currency (e.g. 1 SEK ≈ 0.095 USD) */
  usdRate: number;
  teleportSlug: string;
  population: number;
  language: string;
  timezone: string;
  costIndex: number;
  scores: CityScores;
  monthlyBudget: {
    single: CityCostRange;
    couple: CityCostRange;
    family: CityCostRange;
  };
  costs: Record<string, CityCostRange>;
  neighborhoods: CityNeighborhood[];
  pros: string[];
  cons: string[];
  bestFor: string[];
  similarCities: string[];
  cheaperAlternatives: string[];
  description: string;
  lastUpdated: string;
};

const cities = citiesData as City[];

const bySlug = new Map<string, City>(cities.map((c) => [c.slug, c]));

/** Top 50 globally searched comparison pairs (slugs) — also in data/top-comparison-pairs.json for next.config */
export const TOP_COMPARISON_PAIRS = topComparisonPairsData as unknown as readonly [string, string][];

export function getAllCities(): City[] {
  return [...cities];
}

export function getCityBySlug(slug: string): City | undefined {
  return bySlug.get(slug);
}

export function getCitiesByContinent(continent: string): City[] {
  const q = continent.trim().toLowerCase();
  return cities.filter((c) => c.continent.toLowerCase() === q);
}

export function getSimilarCities(city: City, limit: number): City[] {
  return city.similarCities
    .map((s) => bySlug.get(s))
    .filter((c): c is City => Boolean(c))
    .slice(0, limit);
}

export function getCheaperAlternatives(city: City, limit: number): City[] {
  return city.cheaperAlternatives
    .map((s) => bySlug.get(s))
    .filter((c): c is City => Boolean(c))
    .slice(0, limit);
}

export function parseCityPair(comparison: string): [string, string] | null {
  const parts = comparison.split('-vs-');
  if (parts.length !== 2) return null;
  const [a, b] = parts;
  if (!a || !b) return null;
  return [a, b];
}

/** Canonical compare URL slug: always slugA-vs-slugB with slugA < slugB lexicographically */
export function canonicalComparePairSlug(slugA: string, slugB: string): string {
  if (slugA === slugB) return `${slugA}-vs-${slugB}`;
  return slugA < slugB ? `${slugA}-vs-${slugB}` : `${slugB}-vs-${slugA}`;
}

export function getComparisonPairs(limit = 50): [City, City][] {
  const out: [City, City][] = [];
  for (const [a, b] of TOP_COMPARISON_PAIRS) {
    const ca = bySlug.get(a);
    const cb = bySlug.get(b);
    if (!ca || !cb) continue;
    const s1 = a < b ? a : b;
    const s2 = a < b ? b : a;
    out.push([bySlug.get(s1)!, bySlug.get(s2)!]);
    if (out.length >= limit) break;
  }
  return out.slice(0, limit);
}

/**
 * Convert a USD amount to local currency using usdRate (USD per 1 unit local).
 * Example: 100 USD in SEK with usdRate 0.095 → 100 / 0.095 ≈ 1053 kr
 */
export function formatCost(usd: number, city: City): string {
  const rate = city.usdRate;
  if (!rate || rate <= 0) {
    return `${city.currencySymbol}${usd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }
  const local = usd / rate;
  const rounded = Math.round(local);
  return `${city.currencySymbol}${rounded.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function formatCostRange(minUsd: number, maxUsd: number, city: City): string {
  return `${formatCost(minUsd, city)} – ${formatCost(maxUsd, city)}`;
}

/** Regional indicator flag from ISO 3166-1 alpha-2 */
export function countryFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌍';
  const u = countryCode.toUpperCase();
  const A = 0x1f1e6;
  try {
    return String.fromCodePoint(A + u.charCodeAt(0) - 65, A + u.charCodeAt(1) - 65);
  } catch {
    return '🌍';
  }
}

export function scoreColorClass(score: number): string {
  if (score > 7) return 'bg-emerald-500 text-white';
  if (score >= 5) return 'bg-amber-500 text-white';
  return 'bg-red-500 text-white';
}

export function scoreBarClass(score: number): string {
  if (score > 7) return 'bg-emerald-500';
  if (score >= 5) return 'bg-amber-500';
  return 'bg-red-500';
}

/** Composite “quality of life” (excludes overall/housing/safety for hero badge diversity) */
export function getQualityOfLifeScore(city: City): number {
  const s = city.scores;
  const keys = ['healthcare', 'education', 'environment', 'economy', 'culture', 'internet'] as const;
  const vals = keys.map((k) => s[k]).filter((v): v is number => typeof v === 'number');
  if (!vals.length) return s.overall ?? 0;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

/**
 * All static compare URLs: similar + cheaper alternatives per city, plus top pairs.
 * Each pair is deduped and stored in canonical (alphabetical) slug order.
 */
export function getAllComparePairParams(): { pair: string }[] {
  const seen = new Set<string>();
  const out: { pair: string }[] = [];

  const addPair = (slugA: string, slugB: string) => {
    if (slugA === slugB) return;
    const ca = bySlug.get(slugA);
    const cb = bySlug.get(slugB);
    if (!ca || !cb) return;
    const key = canonicalComparePairSlug(slugA, slugB);
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ pair: key });
    }
  };

  for (const c of cities) {
    for (const sim of c.similarCities) {
      addPair(c.slug, sim);
    }
    for (const alt of c.cheaperAlternatives) {
      addPair(c.slug, alt);
    }
  }

  for (const [a, b] of TOP_COMPARISON_PAIRS) {
    addPair(a, b);
  }

  // Extra canonical pairs: sorted slugs per continent → ring (+2, +3) so total compare pages stay ≥300
  const byContinent = new Map<string, string[]>();
  for (const c of cities) {
    if (!byContinent.has(c.continent)) byContinent.set(c.continent, []);
    byContinent.get(c.continent)!.push(c.slug);
  }
  for (const slugs of byContinent.values()) {
    const sorted = [...new Set(slugs)].sort();
    const n = sorted.length;
    if (n < 2) continue;
    for (let i = 0; i < n; i++) {
      addPair(sorted[i], sorted[(i + 1) % n]);
      if (n > 2) addPair(sorted[i], sorted[(i + 2) % n]);
      if (n > 3) addPair(sorted[i], sorted[(i + 3) % n]);
    }
  }

  return out;
}

export function isAfricaOrMiddleEast(city: City): boolean {
  if (city.continent === 'Africa') return true;
  const meCountries = new Set([
    'United Arab Emirates',
    'Saudi Arabia',
    'Israel',
    'Qatar',
    'Turkey',
    'Kuwait',
    'Bahrain',
    'Oman',
    'Jordan',
    'Lebanon',
    'Iran',
    'Iraq'
  ]);
  return meCountries.has(city.country);
}
