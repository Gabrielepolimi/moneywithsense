/**
 * Derive dailyCosts + housingDetails deterministically from existing cities.json fields.
 *
 * Run: npm run cities:derive
 *
 * - dailyCosts are computed from costs.{coffee, restaurant, restaurantMid, groceries, transport}
 *   with regional coefficients for beer (alcohol tax) and taxi base fare.
 * - housingDetails are computed from costs.rentCenterOneBed + country-level
 *   priceToRentRatio & avgMortgageRate tables (2026 baseline).
 * - Safe to re-run: always overwrites the two nested objects to keep values in sync
 *   with the latest costs.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CITIES_PATH = path.join(__dirname, '..', 'data', 'cities.json');

/** Country-level price-to-rent ratio (annual rent multiples to buy). Approx 2025/26 market baseline. */
const PRICE_TO_RENT = {
  US: 20,
  CA: 22,
  MX: 18,
  BR: 15,
  AR: 12,
  CL: 17,
  CO: 14,
  UY: 16,
  PE: 13,
  GB: 28,
  IE: 24,
  FR: 28,
  DE: 28,
  ES: 24,
  PT: 24,
  IT: 26,
  NL: 30,
  BE: 24,
  AT: 28,
  CH: 32,
  SE: 24,
  NO: 22,
  DK: 22,
  FI: 20,
  PL: 22,
  CZ: 24,
  HU: 22,
  RO: 20,
  GR: 24,
  TR: 18,
  RU: 18,
  UA: 16,
  AE: 15,
  SA: 14,
  QA: 14,
  IL: 26,
  EG: 14,
  ZA: 14,
  NG: 12,
  KE: 14,
  MA: 16,
  TN: 15,
  GH: 12,
  SN: 14,
  IN: 24,
  PK: 18,
  BD: 18,
  LK: 18,
  CN: 32,
  HK: 36,
  JP: 22,
  KR: 26,
  TW: 30,
  SG: 40,
  MY: 22,
  TH: 20,
  VN: 22,
  PH: 18,
  ID: 20,
  AU: 24,
  NZ: 24
};

/** Country-level average 25y mortgage rate (APR %) — 2026 baseline. */
const MORTGAGE_RATE = {
  US: 6.8,
  CA: 5.6,
  MX: 10.5,
  BR: 10.8,
  AR: 18,
  CL: 7.5,
  CO: 11.5,
  UY: 8.5,
  PE: 9,
  GB: 4.8,
  IE: 4.2,
  FR: 3.6,
  DE: 3.8,
  ES: 3.9,
  PT: 3.9,
  IT: 4.1,
  NL: 4.0,
  BE: 3.6,
  AT: 3.9,
  CH: 2.4,
  SE: 4.2,
  NO: 5.4,
  DK: 4.7,
  FI: 3.6,
  PL: 7.5,
  CZ: 5.3,
  HU: 6.5,
  RO: 6.8,
  GR: 4.2,
  TR: 28,
  RU: 14,
  UA: 16,
  AE: 4.4,
  SA: 5.2,
  QA: 5.5,
  IL: 5.2,
  EG: 17,
  ZA: 11.2,
  NG: 25,
  KE: 15,
  MA: 5.8,
  TN: 8,
  GH: 22,
  SN: 9,
  IN: 8.6,
  PK: 22,
  BD: 12,
  LK: 12,
  CN: 3.8,
  HK: 4.1,
  JP: 1.5,
  KR: 4.2,
  TW: 2.3,
  SG: 3.5,
  MY: 4.2,
  TH: 5.5,
  VN: 9.5,
  PH: 7.2,
  ID: 7.5,
  AU: 6.3,
  NZ: 6.7
};

/** Relative beer multiplier vs coffee price (culture/alcohol-tax adjusted). */
const BEER_COEF = {
  default: 1.4,
  // Heavy alcohol taxes / pub culture → beer priced well above coffee
  GB: 1.6,
  IE: 1.6,
  NO: 1.8,
  SE: 1.7,
  FI: 1.7,
  IS: 1.8,
  AU: 1.5,
  NZ: 1.5,
  // Beer-first cultures (cheap beer vs coffee)
  DE: 1.1,
  CZ: 0.9,
  BE: 1.2,
  AT: 1.2,
  PL: 1.1,
  HU: 1.0,
  // Dry / restricted — treat as default (non-alcoholic analog)
  AE: 1.6,
  SA: 1.6,
  QA: 1.6
};

/** Base taxi fare USD before per-km charge. */
const TAXI_BASE = {
  default: 4,
  US: 5,
  CA: 5,
  GB: 5,
  FR: 4,
  DE: 4,
  IT: 4,
  ES: 4,
  NL: 4,
  CH: 8,
  NO: 8,
  SE: 7,
  DK: 7,
  FI: 6,
  JP: 6,
  KR: 4,
  CN: 2,
  HK: 3,
  SG: 4,
  AE: 4,
  SA: 3,
  IL: 4,
  AU: 5,
  NZ: 5,
  BR: 2,
  MX: 2,
  CO: 1.5,
  AR: 2,
  IN: 1,
  PK: 1,
  BD: 1,
  LK: 1,
  MY: 2,
  TH: 1.2,
  VN: 0.8,
  PH: 1.2,
  ID: 1.2,
  EG: 0.8,
  ZA: 2,
  NG: 2,
  KE: 2,
  MA: 1.5,
  TN: 1.5,
  TR: 1.5,
  RU: 2,
  UA: 1.5
};

/** Per-km taxi rate USD (regional). */
const TAXI_PER_KM = {
  default: 1.2,
  US: 2.0,
  CA: 1.8,
  GB: 2.0,
  FR: 1.8,
  DE: 2.0,
  IT: 1.6,
  ES: 1.4,
  NL: 2.2,
  CH: 3.5,
  NO: 3.0,
  SE: 2.5,
  DK: 2.5,
  FI: 2.2,
  JP: 2.5,
  KR: 1.2,
  CN: 0.5,
  HK: 1.2,
  SG: 1.3,
  AE: 0.8,
  SA: 0.8,
  IL: 1.5,
  AU: 2.2,
  NZ: 2.0,
  BR: 0.8,
  MX: 0.7,
  CO: 0.6,
  AR: 0.8,
  IN: 0.3,
  PK: 0.3,
  BD: 0.3,
  LK: 0.3,
  MY: 0.6,
  TH: 0.5,
  VN: 0.5,
  PH: 0.4,
  ID: 0.4,
  EG: 0.3,
  ZA: 0.7,
  NG: 0.8,
  KE: 0.7,
  MA: 0.5,
  TN: 0.5,
  TR: 0.6,
  RU: 0.7,
  UA: 0.5
};

function avg(r) {
  if (!r) return 0;
  return (r.min + r.max) / 2;
}

function pick(map, code, fallback) {
  if (!code) return map.default ?? fallback;
  return map[code] ?? map.default ?? fallback;
}

function roundNice(v) {
  if (v >= 1000) return Math.round(v / 10) * 10;
  if (v >= 100) return Math.round(v / 5) * 5;
  if (v >= 20) return Math.round(v);
  if (v >= 5) return Math.round(v * 2) / 2;
  return Math.round(v * 10) / 10;
}

function deriveDailyCosts(city) {
  const cc = city.countryCode;
  const coffee = avg(city.costs?.coffee);
  const lunch = avg(city.costs?.restaurant);
  const dinnerMid = avg(city.costs?.restaurantMid);
  const groceriesMonth = avg(city.costs?.groceries);
  const transportMonth = avg(city.costs?.transport);

  const beerCoef = pick(BEER_COEF, cc, BEER_COEF.default);
  const taxiBase = pick(TAXI_BASE, cc, TAXI_BASE.default);
  const taxiPerKm = pick(TAXI_PER_KM, cc, TAXI_PER_KM.default);

  const beer = coffee > 0 ? coffee * beerCoef : lunch * 0.35;
  const dinnerForTwo = dinnerMid > 0 ? dinnerMid * 2 : lunch * 3;
  const taxi8km = taxiBase + taxiPerKm * 8;

  return {
    coffee: coffee > 0 ? { usd: roundNice(coffee), note: 'flat white at cafe' } : undefined,
    beer: beer > 0 ? { usd: roundNice(beer), note: 'pint at pub' } : undefined,
    lunch: lunch > 0 ? { usd: roundNice(lunch), note: 'meal at inexpensive restaurant' } : undefined,
    dinner: dinnerForTwo > 0 ? { usd: roundNice(dinnerForTwo), note: 'dinner for two, mid-range' } : undefined,
    taxi8km: taxi8km > 0 ? { usd: roundNice(taxi8km), note: '8km taxi ride' } : undefined,
    monthlyGroceries: groceriesMonth > 0 ? { usd: roundNice(groceriesMonth), note: 'single-person monthly groceries' } : undefined,
    _derived: {
      transportMonthly: roundNice(transportMonth),
      source: 'derived-from-costs+regional-coefs'
    }
  };
}

function deriveHousingDetails(city) {
  const cc = city.countryCode;
  const rentCenter = city.costs?.rentCenterOneBed;
  if (!rentCenter) return undefined;

  const ratio = pick(PRICE_TO_RENT, cc, 22);
  const mortgage = pick(MORTGAGE_RATE, cc, 6.5);

  const annualRentMax = rentCenter.max * 12;
  const unitPriceCenter = annualRentMax * ratio;
  const typicalUnitSqm = 55;
  const buySqmCenter = unitPriceCenter / typicalUnitSqm;
  const buySqmOutside = buySqmCenter * 0.55;

  return {
    buyPricePerSqmCenter: { usd: roundNice(buySqmCenter) },
    buyPricePerSqmOutside: { usd: roundNice(buySqmOutside) },
    avgMortgageRate: mortgage,
    priceToRentRatio: ratio
  };
}

function main() {
  const raw = fs.readFileSync(CITIES_PATH, 'utf8');
  const cities = JSON.parse(raw);
  if (!Array.isArray(cities)) {
    console.error('cities.json must be an array');
    process.exit(1);
  }

  let derived = 0;
  for (const city of cities) {
    const daily = deriveDailyCosts(city);
    const housing = deriveHousingDetails(city);
    if (daily) city.dailyCosts = daily;
    if (housing) city.housingDetails = housing;
    derived++;
  }

  fs.writeFileSync(CITIES_PATH, JSON.stringify(cities, null, 2), 'utf8');
  console.log(`Derived dailyCosts + housingDetails for ${derived}/${cities.length} cities.`);
  console.log(`Output: ${CITIES_PATH}`);
}

main();
