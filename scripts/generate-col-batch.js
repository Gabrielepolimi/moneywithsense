/**
 * 🏙️ Cost of Living Batch Generator
 *
 * Fetches unused topics from the Sanity queue and generates articles.
 * Marks topics as used after successful generation.
 *
 * Usage:
 *   node scripts/generate-col-batch.js                  # 2 articles (default)
 *   node scripts/generate-col-batch.js --count 5        # 5 articles
 *   node scripts/generate-col-batch.js --dry-run         # preview queue without generating
 */

import { getUnusedCOLTopics, markCOLTopicAsUsed } from './sanity-helpers.js';
import { generateCostOfLivingArticle } from './ai-costofliving-generator.js';

const PAUSE_BETWEEN_ARTICLES_MS = 30_000;
const DEFAULT_COUNT = 2;

function parseArgs() {
  const args = process.argv.slice(2);
  let count = DEFAULT_COUNT;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--count' && args[i + 1]) {
      count = parseInt(args[i + 1], 10);
      if (isNaN(count) || count < 1) count = DEFAULT_COUNT;
      i++;
    }
    if (args[i] === '--dry-run') {
      dryRun = true;
    }
  }

  return { count, dryRun };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const { count, dryRun } = parseArgs();

  console.log('🏙️ Cost of Living Batch Generator');
  console.log('='.repeat(50));
  console.log(`   Count: ${count}`);
  console.log(`   Dry run: ${dryRun}`);
  console.log('');

  const topics = await getUnusedCOLTopics(count);

  if (!topics || topics.length === 0) {
    console.log('⚠️  No unused topics in the Sanity queue. Add topics first.');
    console.log('   Use: node scripts/import-col-topics.js');
    process.exit(0);
  }

  console.log(`📋 ${topics.length} topic(s) fetched from queue:\n`);
  topics.forEach((t, i) => {
    const label = t.mode === 'comparison'
      ? `${t.city} vs ${t.comparisonCity} (${t.country})`
      : `${t.city}, ${t.country}`;
    console.log(`   ${i + 1}. [${t.priority}] ${label} — ${t.mode}`);
  });
  console.log('');

  if (dryRun) {
    console.log('🔍 Dry run complete — no articles generated.');
    process.exit(0);
  }

  const results = { success: 0, failed: 0, skipped: 0 };

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    const label = topic.mode === 'comparison'
      ? `${topic.city} vs ${topic.comparisonCity}`
      : `${topic.city}, ${topic.country}`;

    console.log(`\n${'─'.repeat(50)}`);
    console.log(`📝 [${i + 1}/${topics.length}] Generating: ${label} (${topic.mode})`);
    console.log(`${'─'.repeat(50)}\n`);

    try {
      const result = await generateCostOfLivingArticle(
        topic.city,
        topic.country,
        topic.year || 2026,
        topic.comparisonCity || null,
        topic.mode || 'city'
      );

      await markCOLTopicAsUsed(topic._id);
      console.log(`\n✅ Article created: ${result.slug}`);
      console.log(`   Topic ${topic._id} marked as used.`);
      results.success++;
    } catch (error) {
      const isDuplicate = error.message?.includes('Duplicate article already exists') ||
                          error.message?.includes('duplicate');

      if (isDuplicate) {
        console.log(`\nℹ️  Article already exists for ${label} — marking topic as used.`);
        try {
          await markCOLTopicAsUsed(topic._id);
        } catch (markError) {
          console.error(`   ⚠️  Could not mark topic as used: ${markError.message}`);
        }
        results.skipped++;
      } else {
        console.error(`\n❌ Generation failed for ${label}: ${error.message}`);
        results.failed++;
      }
    }

    if (i < topics.length - 1) {
      console.log(`\n⏳ Pausing ${PAUSE_BETWEEN_ARTICLES_MS / 1000}s before next article...`);
      await sleep(PAUSE_BETWEEN_ARTICLES_MS);
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log('📊 Batch Generation Report');
  console.log(`   ✅ Success: ${results.success}`);
  console.log(`   ⏭️  Skipped (duplicate): ${results.skipped}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   📋 Total processed: ${topics.length}`);
  console.log('='.repeat(50));

  if (results.failed > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
