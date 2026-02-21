/**
 * 📥 Import Cost of Living Topics into Sanity
 *
 * Reads data/moneywithsense_topic_queue_100.json and creates
 * costOfLivingTopic documents in Sanity, skipping duplicates.
 *
 * Usage:
 *   node scripts/import-col-topics.js                    # import all
 *   node scripts/import-col-topics.js --dry-run           # preview only
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@sanity/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, '..', 'data', 'moneywithsense_topic_queue_100.json');

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'z0g6hj8g',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-08-10',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

function parseComparisonRow(row) {
  const result = {
    city: row.city,
    country: row.country,
    region: row.region,
    mode: row.mode,
    priority: row.priority || 'media',
    searchIntent: row.searchIntent || '',
    notes: row.notes || '',
    year: row.year || 2026,
    used: false,
    comparisonCity: null,
    comparisonCountry: null
  };

  if (row.mode === 'comparison' && row.city.includes(' vs ')) {
    const [cityA, cityB] = row.city.split(' vs ').map(s => s.trim());
    result.city = cityA;
    result.comparisonCity = cityB;

    if (row.country.includes('/')) {
      const [countryA, countryB] = row.country.split('/').map(s => s.trim());
      result.country = countryA;
      result.comparisonCountry = countryB;
    }
  }

  return result;
}

function buildDedupKey(topic) {
  const key = `${topic.city}|${topic.country}|${topic.mode}|${topic.year || 2026}`;
  if (topic.mode === 'comparison') {
    return `${key}|${topic.comparisonCity || ''}`;
  }
  return key;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.log('📥 Import Cost of Living Topics into Sanity');
  console.log('='.repeat(50));
  if (dryRun) console.log('🔍 DRY RUN — no documents will be created\n');

  if (!fs.existsSync(DATA_FILE)) {
    console.error(`❌ Data file not found: ${DATA_FILE}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  const rows = JSON.parse(raw);
  console.log(`📋 ${rows.length} topics found in data file\n`);

  console.log('🔍 Fetching existing topics from Sanity...');
  const existing = await sanityClient.fetch(`
    *[_type == "costOfLivingTopic"]{
      city, country, mode, year, comparisonCity
    }
  `);
  console.log(`   ${existing.length} topics already in Sanity\n`);

  const existingKeys = new Set(existing.map(t => buildDedupKey(t)));

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of rows) {
    const topic = parseComparisonRow(row);
    const key = buildDedupKey(topic);

    if (existingKeys.has(key)) {
      console.log(`   ⏭️  Skip (exists): ${topic.city}, ${topic.country} [${topic.mode}]`);
      skipped++;
      continue;
    }

    if (dryRun) {
      console.log(`   ➕ Would create: ${topic.city}, ${topic.country} [${topic.mode}]${topic.comparisonCity ? ` vs ${topic.comparisonCity}` : ''}`);
      created++;
      continue;
    }

    try {
      const doc = {
        _type: 'costOfLivingTopic',
        city: topic.city,
        country: topic.country,
        region: topic.region || undefined,
        mode: topic.mode,
        priority: topic.priority,
        searchIntent: topic.searchIntent || undefined,
        notes: topic.notes || undefined,
        year: topic.year,
        used: false,
        ...(topic.comparisonCity && { comparisonCity: topic.comparisonCity }),
        ...(topic.comparisonCountry && { comparisonCountry: topic.comparisonCountry })
      };

      await sanityClient.create(doc);
      existingKeys.add(key);
      console.log(`   ✅ Created: ${topic.city}, ${topic.country} [${topic.mode}]${topic.comparisonCity ? ` vs ${topic.comparisonCity}` : ''}`);
      created++;
    } catch (error) {
      console.error(`   ❌ Error: ${topic.city}, ${topic.country} — ${error.message}`);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Import complete${dryRun ? ' (DRY RUN)' : ''}`);
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  if (errors > 0) console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📋 Total in Sanity: ${existing.length + (dryRun ? 0 : created)}`);
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
