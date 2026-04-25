/**
 * Generate salaries + localTips for each city via Gemini, merge into cities.json.
 *
 * Run:
 *   npm run cities:salaries -- --only london,new-york,dubai,lisbon,tokyo   # dry subset
 *   npm run cities:salaries                                                 # all 100
 *   npm run cities:salaries -- --force                                      # re-generate
 *
 * Requires GEMINI_API_KEY (Google AI Studio) in .env.local (loaded with --env-file).
 * Vertex AI is used automatically if GCP_PROJECT_ID + GCP_LOCATION are set.
 *
 * Idempotent: skips cities where `salaries` and `localTips` are already present
 * (unless --force). Checkpoints cities.json after each city so partial runs are safe.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CITIES_PATH = path.join(__dirname, '..', 'data', 'cities.json');

const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const TEMPERATURE = 0.4;
const MAX_OUTPUT_TOKENS = 2048;
const DELAY_MS = 1200;
const MAX_RETRIES = 3;
const DEBUG = process.env.DEBUG_GEMINI === '1';

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { only: null, force: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--force') opts.force = true;
    else if (a === '--only' && args[i + 1]) {
      opts.only = new Set(args[i + 1].split(',').map((s) => s.trim()));
      i++;
    } else if (a.startsWith('--only=')) {
      opts.only = new Set(a.slice('--only='.length).split(',').map((s) => s.trim()));
    }
  }
  return opts;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function buildPrompt(city) {
  return `You are a concise cost-of-living data generator. Return ONLY a strict JSON object (no markdown, no commentary) for the city below. Numbers must be integers in USD (monthly net pay). Tips must be specific to this city and actionable, no generic advice.

City: ${city.name}, ${city.country}
Currency: ${city.currency}
Year: 2026
Existing rent (city center, 1-bed, USD/mo): ${city.costs?.rentCenterOneBed?.min}-${city.costs?.rentCenterOneBed?.max}
Our cost index (NY=100): ${city.costIndex}

Return JSON matching this schema exactly:
{
  "salaries": {
    "averageNet": { "usd": <int>, "note": "monthly net, take-home" },
    "softwareEngineer": { "usd": <int>, "note": "mid-level, monthly net" },
    "nurse": { "usd": <int>, "note": "hospital RN, monthly net" },
    "teacher": { "usd": <int>, "note": "public secondary, monthly net" },
    "marketing": { "usd": <int>, "note": "mid-level marketing manager, monthly net" }
  },
  "localTips": [
    "<tip 1: one-sentence, mentions a specific place/service/neighbourhood/card in ${city.name}>",
    "<tip 2: one-sentence, different category from tip 1>",
    "<tip 3: one-sentence, different category from tips 1-2>"
  ]
}

Constraints:
- Salaries are MONTHLY NET in USD, after income tax + social contributions, realistic for 2026.
- Salaries must be internally consistent (software engineer typically > teacher/nurse in most markets).
- Tips: mention real services, stores, transport cards, or neighbourhoods by name when possible (e.g., "Oyster card", "Lidl", "Mercadona", "Jumeirah", "Shibuya").
- No financial-advice disclaimers, no "approximately", no ranges — just the numbers.
- Output MUST be valid JSON, parseable by JSON.parse.`;
}

function stripCodeFence(text) {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();
}

function safeParseJson(text) {
  const cleaned = stripCodeFence(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    const first = cleaned.indexOf('{');
    const last = cleaned.lastIndexOf('}');
    if (first >= 0 && last > first) {
      try {
        return JSON.parse(cleaned.slice(first, last + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function validateResult(obj) {
  if (!obj || typeof obj !== 'object') return 'not an object';
  const s = obj.salaries;
  if (!s || typeof s !== 'object') return 'missing salaries';
  for (const k of ['averageNet', 'softwareEngineer', 'nurse', 'teacher', 'marketing']) {
    if (!s[k] || typeof s[k].usd !== 'number' || s[k].usd <= 0) return `bad salary.${k}`;
  }
  if (!Array.isArray(obj.localTips) || obj.localTips.length < 3) return 'missing localTips (>=3)';
  if (obj.localTips.some((t) => typeof t !== 'string' || t.trim().length < 8)) return 'localTips too short';
  return null;
}

function needsGeneration(city, force) {
  if (force) return true;
  return !(city.salaries && city.localTips && city.localTips.length >= 3);
}

async function callGemini(genAI, prompt) {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      temperature: TEMPERATURE,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      responseMimeType: 'application/json'
    }
  });
  const res = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }]
  });
  return res.response.text();
}

async function generateForCity(genAI, city) {
  let lastError = null;
  let lastRaw = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const text = await callGemini(genAI, buildPrompt(city));
      lastRaw = text;
      const obj = safeParseJson(text);
      const err = validateResult(obj);
      if (err) {
        lastError = `invalid response: ${err}`;
        if (DEBUG) console.log(`\n[debug ${city.slug} attempt ${attempt}] raw (first 400 chars):\n${(text || '').slice(0, 400)}\n`);
        await sleep(600);
        continue;
      }
      return obj;
    } catch (e) {
      lastError = e.message || String(e);
      await sleep(1000 * attempt);
    }
  }
  if (DEBUG && lastRaw) {
    console.log(`\n[debug ${city.slug} final raw]:\n${lastRaw.slice(0, 800)}\n`);
  }
  throw new Error(lastError || 'unknown');
}

async function main() {
  const opts = parseArgs();

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY not set. Run with: node --env-file=.env.local scripts/generate-city-salaries-tips.mjs');
    process.exit(1);
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log(`Using model: ${MODEL_NAME} (temperature ${TEMPERATURE}).`);

  const raw = fs.readFileSync(CITIES_PATH, 'utf8');
  const cities = JSON.parse(raw);
  if (!Array.isArray(cities)) throw new Error('cities.json must be an array');

  const targets = cities.filter((c) => {
    if (opts.only && !opts.only.has(c.slug)) return false;
    return needsGeneration(c, opts.force);
  });

  console.log(`${targets.length} cities to process${opts.only ? ` (subset: ${[...opts.only].join(', ')})` : ''}${opts.force ? ' (force)' : ''}.`);

  let ok = 0;
  let fail = 0;
  for (let i = 0; i < targets.length; i++) {
    const city = targets[i];
    process.stdout.write(`[${i + 1}/${targets.length}] ${city.slug}... `);
    try {
      const result = await generateForCity(genAI, city);
      city.salaries = result.salaries;
      city.localTips = result.localTips.slice(0, 5);
      fs.writeFileSync(CITIES_PATH, JSON.stringify(cities, null, 2), 'utf8');
      ok++;
      console.log('OK');
    } catch (e) {
      fail++;
      console.log('FAIL', e.message);
    }
    if (i < targets.length - 1) await sleep(DELAY_MS);
  }

  console.log('\n---');
  console.log(`Done. OK: ${ok} | FAIL: ${fail} | Skipped: ${cities.length - targets.length - (opts.only ? cities.length - targets.length : 0)}`);
  console.log(`Output: ${CITIES_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
