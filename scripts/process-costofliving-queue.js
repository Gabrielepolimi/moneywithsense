/**
 * 📋 Process Cost of Living Queue
 *
 * Wrapper script to process queue items from scheduled runs.
 * Duplicate articles are treated as "already done" (exit 0) so the
 * queue advances to the next item on the following run.
 */

import { processNextItem } from './costofliving-queue.js';
import { generateCostOfLivingArticle } from './ai-costofliving-generator.js';

async function main() {
  console.log('📋 Processing Cost of Living queue (scheduled run)...\n');
  
  const result = await processNextItem(async (city, country, year, comparisonCity, mode) => {
    return await generateCostOfLivingArticle(city, country, year, comparisonCity, mode);
  });
  
  if (result.processed) {
    if (result.success) {
      console.log('\n✅ Queue processing complete');
      process.exit(0);
    } else if (result.duplicate) {
      console.log(`\n✅ Article already exists — item marked as completed. Queue will advance next run.`);
      process.exit(0);
    } else {
      console.error(`\n❌ Queue item failed: ${result.error}`);
      process.exit(1);
    }
  } else {
    console.log(`\nℹ️ No items processed (reason: ${result.reason})`);
    process.exit(0);
  }
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
