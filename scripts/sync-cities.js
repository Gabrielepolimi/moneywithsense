/**
 * Sync city scores (and optional rent hints) from Teleport API into data/cities.json
 * Run: node scripts/sync-cities.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CITIES_PATH = path.join(__dirname, '..', 'data', 'cities.json');
const DELAY_MS = 500;

const CATEGORY_MAP = [
  [/housing/i, 'housing'],
  [/safety/i, 'safety'],
  [/healthcare|health/i, 'healthcare'],
  [/education/i, 'education'],
  [/environmental|environment/i, 'environment'],
  [/economy/i, 'economy'],
  [/culture|entertainment|leisure/i, 'culture'],
  [/internet|broadband/i, 'internet']
];

function mapTeleportScores(categories) {
  if (!Array.isArray(categories)) return null;
  const scores = {
    housing: null,
    safety: null,
    healthcare: null,
    education: null,
    environment: null,
    economy: null,
    culture: null,
    internet: null
  };
  for (const cat of categories) {
    const name = cat.name || '';
    const val = cat.score_out_of_10 ?? cat.out_of_10;
    if (typeof val !== 'number') continue;
    for (const [re, key] of CATEGORY_MAP) {
      if (re.test(name)) {
        scores[key] = Math.round(val * 10) / 10;
        break;
      }
    }
  }
  const vals = Object.values(scores).filter((v) => v != null);
  if (vals.length === 0) return null;
  const overall = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  return { ...scores, overall };
}

/** Try to scale monthly rent buckets from Teleport rent data (USD-ish) */
function applyRentToCosts(city, rentUsd) {
  if (!rentUsd || rentUsd < 200) return false;
  const factor = rentUsd / 1800;
  const c = city.costs;
  if (!c) return false;
  const scale = (r) => ({
    min: Math.max(100, Math.round(r.min * factor)),
    max: Math.max(150, Math.round(r.max * factor))
  });
  if (c.rentCenterOneBed) {
    c.rentCenterOneBed = scale(c.rentCenterOneBed);
    c.rentCenterStudio = scale(c.rentCenterStudio || { min: c.rentCenterOneBed.min * 0.75, max: c.rentCenterOneBed.max * 0.8 });
    c.rentOutsideOneBed = scale(c.rentOutsideOneBed || { min: c.rentCenterOneBed.min * 0.55, max: c.rentCenterOneBed.max * 0.6 });
  }
  return true;
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function syncCity(city, lastUpdated) {
  const slug = city.teleportSlug;
  if (!slug) return { ok: false, reason: 'no teleportSlug' };

  const scoresUrl = `https://api.teleport.org/api/urban_areas/slug:${encodeURIComponent(slug)}/scores/`;
  let scoresData;
  try {
    scoresData = await fetchJson(scoresUrl);
  } catch (e) {
    return { ok: false, reason: `scores: ${e.message}` };
  }

  const mapped = mapTeleportScores(scoresData.categories);
  if (!mapped) {
    return { ok: false, reason: 'no mappable score categories' };
  }
  city.scores = city.scores || {};
  for (const [k, v] of Object.entries(mapped)) {
    if (v != null) city.scores[k] = v;
  }
  city.lastUpdated = lastUpdated;

  await sleep(DELAY_MS);

  const detailsUrl = `https://api.teleport.org/api/urban_areas/slug:${encodeURIComponent(slug)}/details/`;
  let details;
  try {
    details = await fetchJson(detailsUrl);
  } catch {
    return { ok: true };
  }

  const rentHref =
    details._links?.['ua:rent']?.href ||
    details._links?.['ua:details:rent']?.href ||
    details.rent_url;

  if (rentHref) {
    try {
      await sleep(DELAY_MS);
      const rentData = await fetchJson(rentHref);
      const cat = rentData.categories?.find((x) => /apartment|one|1.br|1 bedroom/i.test(x.label || x.name || ''));
      const median =
        cat?.currency_prices?.USD?.median ||
        cat?.data?.find?.((d) => d.label === 'median')?.currency_prices?.USD ||
        rentData.median;
      if (typeof median === 'number') {
        applyRentToCosts(city, median);
      }
    } catch {
      /* keep existing costs */
    }
  }

  return { ok: true };
}

async function main() {
  if (!fs.existsSync(CITIES_PATH)) {
    console.error('Missing', CITIES_PATH);
    process.exit(1);
  }

  const raw = fs.readFileSync(CITIES_PATH, 'utf8');
  const cities = JSON.parse(raw);
  if (!Array.isArray(cities)) {
    console.error('cities.json must be an array');
    process.exit(1);
  }

  const now = new Date();
  const lastUpdated = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    process.stdout.write(`[${i + 1}/${cities.length}] ${city.slug}... `);
    try {
      const r = await syncCity(city, lastUpdated);
      if (r.ok) {
        updated++;
        console.log('OK');
      } else {
        failed++;
        console.log('FAIL', r.reason);
      }
    } catch (e) {
      failed++;
      console.log('FAIL', e.message);
    }
    if (i < cities.length - 1) await sleep(DELAY_MS);
  }

  fs.writeFileSync(CITIES_PATH, JSON.stringify(cities, null, 2), 'utf8');
  console.log('\n---');
  console.log(`Updated (with lastUpdated bump): ${updated}`);
  console.log(`Failed / skipped: ${failed}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
