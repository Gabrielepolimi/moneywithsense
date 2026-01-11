/**
 * 🗓️ MoneyWithSense Weekly Batch Generator
 * 
 * Generates weekly article batches automatically
 * With anti-duplicate system and automatic retry
 * 
 * Usage:
 *   node scripts/generate-weekly-batch.js                    # Generate 3 automatic articles
 *   node scripts/generate-weekly-batch.js --count 5          # Generate 5 articles
 *   node scripts/generate-weekly-batch.js --file keywords.json # Use custom keyword file
 *   node scripts/generate-weekly-batch.js --dry-run          # Simulate without creating
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateArticle } from './ai-content-generator.js';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { checkSemanticDuplicate } from './semantic-duplicate-checker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== CONFIGURATION =====
const CONFIG = {
  defaultArticleCount: 3,
  pauseBetweenArticles: 20000, // 20 seconds (avoid rate limit 429)
  pauseBetweenDuplicateChecks: 8000, // 8 seconds between duplicate checks
  logFile: path.join(__dirname, '..', 'data', 'generation-log.json'),
  skipDuplicateCheck: false, // If true, skip pre-check for duplicates
  maxRetryAttempts: 3 // How many times to try finding non-duplicate keywords
};

const execFileAsync = promisify(execFile);

// ===== SEASONAL KEYWORD POOL (FINANCE) =====
function getSeasonalKeywords() {
  const month = new Date().getMonth();
  
  // Extended pool of seasonal finance keywords
  const seasonalKeywords = {
    // Winter (Dec, Jan, Feb)
    winter: [
      { keyword: "new year financial resolutions that actually work", category: "money-psychology" },
      { keyword: "how to recover from holiday overspending", category: "budgeting" },
      { keyword: "tax preparation checklist for filing season", category: "taxes-tips" },
      { keyword: "best high-yield savings accounts January 2026", category: "banking-cards" },
      { keyword: "winter side hustles to boost income", category: "side-hustles" },
      { keyword: "how to stick to a budget after the holidays", category: "budgeting" },
      { keyword: "IRA contribution deadline tips", category: "investing-basics" },
      { keyword: "how to pay off holiday credit card debt fast", category: "credit-debt" },
      { keyword: "frugal winter activities that cost nothing", category: "saving-money" },
      { keyword: "annual financial checkup guide", category: "budgeting" },
      { keyword: "how to negotiate lower bills in winter", category: "saving-money" },
      { keyword: "best cashback credit cards for groceries", category: "banking-cards" },
      { keyword: "emergency fund building strategies for beginners", category: "saving-money" },
      { keyword: "how to reduce heating costs this winter", category: "saving-money" },
      { keyword: "401k contribution limits explained", category: "investing-basics" },
      { keyword: "credit score improvement tips for new year", category: "credit-debt" },
      { keyword: "how to create a zero-based budget", category: "budgeting" },
      { keyword: "best money apps to download in 2026", category: "banking-cards" },
      { keyword: "tax deductions you might be missing", category: "taxes-tips" },
      { keyword: "how to automate your savings effectively", category: "saving-money" }
    ],
    // Spring (Mar, Apr, May)
    spring: [
      { keyword: "spring cleaning your finances guide", category: "budgeting" },
      { keyword: "last minute tax filing tips", category: "taxes-tips" },
      { keyword: "how to use your tax refund wisely", category: "saving-money" },
      { keyword: "best travel credit cards for summer vacation", category: "banking-cards" },
      { keyword: "side hustles perfect for spring and summer", category: "side-hustles" },
      { keyword: "how to budget for a summer vacation", category: "budgeting" },
      { keyword: "graduate student loan repayment strategies", category: "credit-debt" },
      { keyword: "investing basics for college graduates", category: "investing-basics" },
      { keyword: "how to start a garden to save on groceries", category: "saving-money" },
      { keyword: "best time to buy a car money tips", category: "saving-money" },
      { keyword: "how to negotiate salary at a new job", category: "side-hustles" },
      { keyword: "Roth IRA vs Traditional IRA comparison", category: "investing-basics" },
      { keyword: "spring cleaning subscriptions you dont need", category: "saving-money" },
      { keyword: "how to build credit from scratch", category: "credit-debt" },
      { keyword: "best balance transfer credit cards", category: "banking-cards" },
      { keyword: "freelance tax tips for gig workers", category: "taxes-tips" },
      { keyword: "how to save money on wedding costs", category: "saving-money" },
      { keyword: "index funds for beginners guide", category: "investing-basics" },
      { keyword: "debt snowball vs avalanche method", category: "credit-debt" },
      { keyword: "how to make money with a side hustle", category: "side-hustles" }
    ],
    // Summer (Jun, Jul, Aug)
    summer: [
      { keyword: "how to save money on summer vacation", category: "saving-money" },
      { keyword: "best summer side hustles for extra income", category: "side-hustles" },
      { keyword: "back to school budgeting tips for parents", category: "budgeting" },
      { keyword: "how to save on air conditioning costs", category: "saving-money" },
      { keyword: "mid-year financial checkup guide", category: "budgeting" },
      { keyword: "best no-fee checking accounts", category: "banking-cards" },
      { keyword: "how to teach kids about money this summer", category: "money-psychology" },
      { keyword: "investing during market volatility guide", category: "investing-basics" },
      { keyword: "how to save on back to school shopping", category: "saving-money" },
      { keyword: "summer job tax tips for teenagers", category: "taxes-tips" },
      { keyword: "how to start investing with 100 dollars", category: "investing-basics" },
      { keyword: "credit card travel rewards maximizing tips", category: "banking-cards" },
      { keyword: "how to budget for college students", category: "budgeting" },
      { keyword: "passive income ideas for summer", category: "side-hustles" },
      { keyword: "how to improve credit score fast", category: "credit-debt" },
      { keyword: "best high-yield savings accounts summer 2026", category: "banking-cards" },
      { keyword: "how to save for a house down payment", category: "saving-money" },
      { keyword: "ETFs vs mutual funds for beginners", category: "investing-basics" },
      { keyword: "how to pay off student loans faster", category: "credit-debt" },
      { keyword: "work from home jobs that pay well", category: "side-hustles" }
    ],
    // Autumn (Sep, Oct, Nov)
    autumn: [
      { keyword: "how to prepare finances for holiday season", category: "budgeting" },
      { keyword: "black friday shopping budget tips", category: "saving-money" },
      { keyword: "year-end tax planning strategies", category: "taxes-tips" },
      { keyword: "how to create a holiday spending budget", category: "budgeting" },
      { keyword: "best credit cards for holiday shopping", category: "banking-cards" },
      { keyword: "how to make money before the holidays", category: "side-hustles" },
      { keyword: "open enrollment health insurance money tips", category: "saving-money" },
      { keyword: "401k year-end contribution strategies", category: "investing-basics" },
      { keyword: "how to avoid holiday debt traps", category: "credit-debt" },
      { keyword: "gift giving on a budget ideas", category: "saving-money" },
      { keyword: "how to negotiate holiday sales prices", category: "saving-money" },
      { keyword: "best cash back apps for holiday shopping", category: "banking-cards" },
      { keyword: "charitable giving tax deductions guide", category: "taxes-tips" },
      { keyword: "how to budget for multiple holidays", category: "budgeting" },
      { keyword: "side hustles for the holiday season", category: "side-hustles" },
      { keyword: "how to invest your year-end bonus", category: "investing-basics" },
      { keyword: "credit card debt payoff before new year", category: "credit-debt" },
      { keyword: "money mindset shift for holiday spending", category: "money-psychology" },
      { keyword: "how to save on heating bills this fall", category: "saving-money" },
      { keyword: "financial goals to set before year end", category: "money-psychology" }
    ]
  };
  
  // Determine current season
  let season;
  if (month >= 2 && month <= 4) season = 'spring';
  else if (month >= 5 && month <= 7) season = 'summer';
  else if (month >= 8 && month <= 10) season = 'autumn';
  else season = 'winter';
  
  console.log(`📅 Current season: ${season}`);
  
  return { keywords: seasonalKeywords[season], season };
}

// ===== EVERGREEN KEYWORDS (FINANCE) =====
const EVERGREEN_KEYWORDS = [
  { keyword: "how to create a monthly budget that works", category: "budgeting" },
  { keyword: "50 30 20 budget rule explained", category: "budgeting" },
  { keyword: "zero based budgeting for beginners", category: "budgeting" },
  { keyword: "envelope budgeting system guide", category: "budgeting" },
  { keyword: "how to build an emergency fund from scratch", category: "saving-money" },
  { keyword: "best ways to save money on groceries", category: "saving-money" },
  { keyword: "no spend challenge rules and tips", category: "saving-money" },
  { keyword: "sinking funds explained with examples", category: "saving-money" },
  { keyword: "how to start investing for beginners", category: "investing-basics" },
  { keyword: "what is dollar cost averaging", category: "investing-basics" },
  { keyword: "compound interest explained simply", category: "investing-basics" },
  { keyword: "how to open a brokerage account", category: "investing-basics" },
  { keyword: "debt snowball method step by step", category: "credit-debt" },
  { keyword: "how to improve your credit score", category: "credit-debt" },
  { keyword: "debt consolidation pros and cons", category: "credit-debt" },
  { keyword: "how to negotiate with creditors", category: "credit-debt" },
  { keyword: "best side hustles from home", category: "side-hustles" },
  { keyword: "how to start freelancing for beginners", category: "side-hustles" },
  { keyword: "passive income ideas that actually work", category: "side-hustles" },
  { keyword: "how to monetize your skills online", category: "side-hustles" },
  { keyword: "tax deductions for self employed", category: "taxes-tips" },
  { keyword: "how to file taxes as a freelancer", category: "taxes-tips" },
  { keyword: "estimated quarterly taxes guide", category: "taxes-tips" },
  { keyword: "tax advantaged accounts explained", category: "taxes-tips" },
  { keyword: "best high yield savings accounts", category: "banking-cards" },
  { keyword: "how to choose a credit card wisely", category: "banking-cards" },
  { keyword: "credit union vs bank comparison", category: "banking-cards" },
  { keyword: "how to maximize credit card rewards", category: "banking-cards" },
  { keyword: "money mindset tips for financial success", category: "money-psychology" },
  { keyword: "how to stop emotional spending", category: "money-psychology" },
  { keyword: "financial anxiety coping strategies", category: "money-psychology" },
  { keyword: "how to talk about money with partner", category: "money-psychology" },
  { keyword: "common budgeting mistakes to avoid", category: "budgeting" },
  { keyword: "how to track expenses effectively", category: "budgeting" },
  { keyword: "pay yourself first method explained", category: "saving-money" }
];

// ===== MAIN FUNCTION =====
async function generateWeeklyBatch(options = {}) {
  const {
    count = CONFIG.defaultArticleCount,
    keywordsFile = null,
    dryRun = false,
    skipDuplicateCheck = CONFIG.skipDuplicateCheck
  } = options;
  
  console.log('\n' + '🗓️'.repeat(30));
  console.log('WEEKLY BATCH GENERATION');
  console.log('🗓️'.repeat(30) + '\n');
  
  const startTime = Date.now();
  const log = {
    startedAt: new Date().toISOString(),
    options,
    duplicateCheck: null,
    results: []
  };
  
  // 1. Determine keywords to use
  let allKeywords;
  
  if (keywordsFile) {
    // Load from file
    const filePath = path.join(__dirname, '..', 'data', keywordsFile);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      allKeywords = data.keywords || data;
      console.log(`📂 Keywords loaded from: ${keywordsFile}`);
    } else {
      console.error(`❌ File not found: ${filePath}`);
      return;
    }
  } else {
    // Mix seasonal + evergreen keywords (LARGE POOL)
    const { keywords: seasonal } = getSeasonalKeywords();
    allKeywords = [...seasonal, ...EVERGREEN_KEYWORDS];
    console.log('🎲 Automatic keyword pool (seasonal + evergreen)');
    console.log(`   Total pool: ${allKeywords.length} keywords available`);
  }

  // Shuffle the entire pool
  allKeywords = shuffleArray(allKeywords);
  
  // 2. Find non-duplicate keywords (with retry)
  let safeKeywords = [];
  let checkedCount = 0;
  let skippedKeywords = [];
  
  if (!skipDuplicateCheck && !dryRun) {
    console.log('\n' + '🔍'.repeat(20));
    console.log('PHASE 1: FINDING NON-DUPLICATE KEYWORDS');
    console.log('🔍'.repeat(20) + '\n');
    console.log(`Goal: find ${count} unique keywords\n`);
    
    for (const kw of allKeywords) {
      // Stop if we have enough keywords
      if (safeKeywords.length >= count) break;
      
      // Limit checks to avoid rate limiting
      if (checkedCount >= count * 3) {
        console.log(`⚠️ Reached ${checkedCount} checks, using remaining keywords without check`);
        break;
      }
      
      checkedCount++;
      console.log(`[${checkedCount}] Checking: "${kw.keyword.substring(0, 50)}..."`);
      
      try {
        const analysis = await checkSemanticDuplicate(kw.keyword, { verbose: false });
        
        // ULTRA PERMISSIVE: skip ONLY if similarity >= 98% (practically identical)
        const isRealDuplicate = analysis.isDuplicate && analysis.maxSimilarity >= 98;
        
        if (isRealDuplicate) {
          console.log(`   🔴 SKIP - Identical duplicate (${analysis.maxSimilarity}%): "${analysis.mostSimilarArticle?.title?.substring(0, 40)}..."`);
          skippedKeywords.push({ ...kw, similarTo: analysis.mostSimilarArticle?.title });
        } else {
          // Proceed ALWAYS if < 98%
          console.log(`   ✅ OK (${analysis.maxSimilarity}% - proceeding)`);
          safeKeywords.push(kw);
        }
        
        // Pause between checks for rate limiting
        await new Promise(r => setTimeout(r, CONFIG.pauseBetweenDuplicateChecks));
        
      } catch (error) {
        // On error (e.g. rate limit), add keyword anyway
        console.log(`   ⚠️ Check error: ${error.message.substring(0, 50)} - Adding anyway`);
        safeKeywords.push(kw);
      }
    }
    
    // If we still don't have enough, take from pool without check
    if (safeKeywords.length < count) {
      const remaining = allKeywords
        .filter(kw => !safeKeywords.find(s => s.keyword === kw.keyword))
        .filter(kw => !skippedKeywords.find(s => s.keyword === kw.keyword))
        .slice(0, count - safeKeywords.length);
      
      console.log(`\n📥 Adding ${remaining.length} extra keywords without duplicate check`);
      safeKeywords.push(...remaining);
    }
    
    log.duplicateCheck = {
      totalChecked: checkedCount,
      safe: safeKeywords.length,
      skipped: skippedKeywords.length
    };
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 KEYWORD SEARCH RESULT');
    console.log('='.repeat(50));
    console.log(`✅ Keywords ready: ${safeKeywords.length}`);
    console.log(`🔴 Keywords skipped: ${skippedKeywords.length}`);
    console.log('='.repeat(50) + '\n');
    
  } else {
    // Skip check, take first N keywords
    safeKeywords = allKeywords.slice(0, count);
    if (skipDuplicateCheck) {
      console.log('\n⏭️ Duplicate check skipped\n');
    }
  }
  
  // Show selected keywords
  console.log(`📝 Keywords to generate (${safeKeywords.length}):`);
  safeKeywords.forEach((k, i) => {
    console.log(`   ${i + 1}. "${k.keyword.substring(0, 60)}..." [${k.category}]`);
  });
  
  if (dryRun) {
    console.log('\n⚠️ DRY RUN - No articles will be created\n');
    return { keywords: safeKeywords, log };
  }
  
  if (safeKeywords.length === 0) {
    console.log('\n⚠️ No keywords available! Pool exhausted.\n');
    return log;
  }
  
  console.log('\n' + '📝'.repeat(20));
  console.log('PHASE 2: ARTICLE GENERATION');
  console.log('📝'.repeat(20) + '\n');
  
  // 3. Generate articles
  for (let i = 0; i < safeKeywords.length; i++) {
    const { keyword, category } = safeKeywords[i];
    const articleNum = i + 1;
    
    console.log(`\n[${articleNum}/${safeKeywords.length}] Generating: "${keyword.substring(0, 50)}..."`);
    console.log('-'.repeat(50));
    
    try {
      // Skip duplicate check in generation (already done above)
      const result = await generateArticle(keyword, category, { skipDuplicateCheck: true });
      
      if (result?.skipped) {
        log.results.push({
          keyword,
          category,
          success: false,
          skipped: true,
          reason: result.reason,
          generatedAt: new Date().toISOString()
        });
      } else {
        log.results.push({
          keyword,
          category,
          success: true,
          articleId: result._id,
          slug: result.slug?.current,
          hasImage: result.hasImage,
          generatedAt: new Date().toISOString()
        });

        // YouTube picker (post-step) if available and not dry-run
        if (process.env.YOUTUBE_API_KEY) {
          const slug = result.slug?.current;
          if (slug) {
            console.log('🎥 Starting YouTube picker for', slug);
            try {
              await execFileAsync('node', [path.join(__dirname, 'youtube-video-picker.js'), slug], {
                env: {
                  ...process.env,
                  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
                  SANITY_API_TOKEN: process.env.SANITY_API_TOKEN,
                  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
                },
              });
              console.log('✅ YouTube picker completed for', slug);
            } catch (err) {
              console.warn('⚠️ YouTube picker failed for', slug, '-', err.message);
            }
          }
        } else {
          console.log('ℹ️ YOUTUBE_API_KEY missing: skipping video picker');
        }
      }
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      log.results.push({
        keyword,
        category,
        success: false,
        error: error.message,
        generatedAt: new Date().toISOString()
      });
    }
    
    // Pause between articles (except last)
    if (i < safeKeywords.length - 1) {
      console.log(`\n⏳ Pausing ${CONFIG.pauseBetweenArticles / 1000}s for rate limiting...`);
      await new Promise(r => setTimeout(r, CONFIG.pauseBetweenArticles));
    }
  }
  
  // 4. Final report
  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  const successful = log.results.filter(r => r.success).length;
  const withImages = log.results.filter(r => r.success && r.hasImage).length;
  const failed = log.results.filter(r => !r.success).length;
  
  log.completedAt = new Date().toISOString();
  log.summary = {
    requested: count,
    successful,
    withImages,
    failed,
    durationMinutes: parseFloat(elapsed)
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL REPORT');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successful}`);
  console.log(`📸 With image: ${withImages}`);
  console.log(`❌ Errors: ${failed}`);
  console.log(`⏱️ Duration: ${elapsed} minutes`);
  
  if (successful > 0) {
    console.log('\nArticles created:');
    log.results.filter(r => r.success).forEach(r => {
      const imgIcon = r.hasImage ? '📸' : '📝';
      console.log(`  ${imgIcon} "${r.keyword.substring(0, 45)}..."`);
      console.log(`     -> ${r.slug}`);
    });
  }
  
  if (failed > 0) {
    console.log('\nFailed articles:');
    log.results.filter(r => !r.success).forEach(r => {
      console.log(`  ❌ "${r.keyword.substring(0, 40)}...": ${r.error?.substring(0, 50) || r.reason}`);
    });
  }
  console.log('='.repeat(60) + '\n');
  
  // 5. Save log
  saveLog(log);
  
  return log;
}

// ===== HELPER FUNCTIONS =====

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function saveLog(log) {
  try {
    // Create directory if it doesn't exist
    const logDir = path.dirname(CONFIG.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Load existing logs
    let logs = [];
    if (fs.existsSync(CONFIG.logFile)) {
      logs = JSON.parse(fs.readFileSync(CONFIG.logFile, 'utf-8'));
    }
    
    // Add new log
    logs.push(log);
    
    // Keep only last 50 logs
    if (logs.length > 50) {
      logs = logs.slice(-50);
    }
    
    fs.writeFileSync(CONFIG.logFile, JSON.stringify(logs, null, 2), 'utf-8');
    console.log(`💾 Log saved to: ${CONFIG.logFile}`);
  } catch (error) {
    console.warn('⚠️ Unable to save log:', error.message);
  }
}

// ===== FUNCTION TO CREATE CUSTOM KEYWORD FILE =====
export async function createKeywordsFile(keywords, filename = 'custom-keywords.json') {
  const filePath = path.join(__dirname, '..', 'data', filename);
  const data = {
    createdAt: new Date().toISOString(),
    description: 'Custom keywords for batch generation',
    keywords
  };
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ Keyword file created: ${filename}`);
  return filePath;
}

// ===== CLI =====
async function main() {
  const args = process.argv.slice(2);
  const options = {
    count: CONFIG.defaultArticleCount,
    keywordsFile: null,
    dryRun: false,
    skipDuplicateCheck: false
  };
  
  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--count' && args[i + 1]) {
      options.count = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--file' && args[i + 1]) {
      options.keywordsFile = args[i + 1];
      i++;
    } else if (args[i] === '--dry-run') {
      options.dryRun = true;
    } else if (args[i] === '--skip-check') {
      options.skipDuplicateCheck = true;
    } else if (args[i] === '--help') {
      console.log(`
🗓️ MoneyWithSense Weekly Batch Generator
=========================================

Automatically generates a batch of articles for the week.
Includes ANTI-DUPLICATE system with automatic retry.

Usage:
  node scripts/generate-weekly-batch.js [options]

Options:
  --count <n>        Number of articles to generate (default: 3)
  --file <name.json> Use custom keyword file from data/ folder
  --dry-run          Show keywords without generating articles
  --skip-check       Skip semantic duplicate check
  --help             Show this message

Examples:
  node scripts/generate-weekly-batch.js
  node scripts/generate-weekly-batch.js --count 5
  node scripts/generate-weekly-batch.js --file keywords-custom.json
  node scripts/generate-weekly-batch.js --count 10 --dry-run
  node scripts/generate-weekly-batch.js --count 5 --skip-check

Anti-Duplicate System:
  Automatically searches for unique keywords from a pool of 55+ keywords.
  If duplicates are found, tries other keywords until enough are found.
  Images are automatically searched on Unsplash.
`);
      return;
    }
  }
  
  try {
    await generateWeeklyBatch(options);
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    process.exit(1);
  }
}

main();
