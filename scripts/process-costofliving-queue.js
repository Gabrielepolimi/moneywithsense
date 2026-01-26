/**
 * 📋 Process Cost of Living Queue
 *
 * Wrapper script to process queue items from scheduled runs
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
