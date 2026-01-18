/**
 * 🗓️ MoneyWithSense Daily Content Generator
 * 
 * Generates daily article batches automatically
 * With anti-duplicate system and automatic retry
 * 
 * Strategy:
 * - Phase 1 (first 3 months): 1 article/day
 * - Phase 2 (after stable indexing): 2 articles/day
 * 
 * Usage:
 *   node scripts/generate-weekly-batch.js                    # Generate 1 article (default)
 *   node scripts/generate-weekly-batch.js --count 2          # Generate 2 articles
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
  defaultArticleCount: 1, // Phase 1: 1 article/day
  pauseBetweenArticles: 25000, // 25 seconds (avoid rate limit)
  pauseBetweenDuplicateChecks: 8000, // 8 seconds between checks
  logFile: path.join(__dirname, '..', 'data', 'generation-log.json'),
  skipDuplicateCheck: false,
  maxRetryAttempts: 3
};

const execFileAsync = promisify(execFile);

// =============================================================================
// TOPIC CLUSTERS - MoneyWithSense Content Strategy
// =============================================================================
// Priority order: 1 = highest, 6 = lowest
// Excluded: trading, crypto, stock picking, legal advice, market predictions
// =============================================================================

const TOPIC_CLUSTERS = {
  // CLUSTER 1: Saving Money (HIGHEST PRIORITY)
  savingMoney: {
    priority: 1,
    category: 'saving-money',
    keywords: [
      "how to save money without changing lifestyle",
      "hidden expenses draining your budget",
      "monthly money reset checklist",
      "things to stop buying to save money",
      "painless ways to cut monthly expenses",
      "how to save money on a low income",
      "small changes that save hundreds per year",
      "free alternatives to expensive habits",
      "how to stop impulse buying for good",
      "money saving habits that actually work",
      "how to audit your spending in one hour",
      "subscriptions you forgot you were paying for",
      "grocery shopping hacks to save money",
      "how to negotiate lower bills",
      "one week no spend challenge guide",
      "automating your savings without thinking",
      "how to build savings on an irregular income",
      "cost cutting tips that dont feel like sacrifice",
      "how to save for a big purchase fast",
      "lazy ways to save more money",
      "money leaks most people ignore",
      "how to save money as a couple",
      "seasonal expenses to plan for in advance",
      "free things to do instead of spending money",
      "how to break the paycheck to paycheck cycle"
    ]
  },

  // CLUSTER 2: Life Events & Money
  lifeEvents: {
    priority: 2,
    category: 'budgeting',
    keywords: [
      "managing money after a breakup",
      "finances after losing a job",
      "moving to a new city hidden costs",
      "first year living alone expenses guide",
      "financial checklist before getting married",
      "money tips for new parents",
      "how to handle finances after divorce",
      "preparing financially for retirement",
      "money management after inheritance",
      "budgeting during a career change",
      "financial planning for a gap year",
      "how to afford having a baby",
      "money decisions when buying your first home",
      "financial recovery after illness",
      "starting over financially at 40",
      "how to prepare for unexpected expenses",
      "money tips for empty nesters",
      "financial planning for long distance relationships",
      "budgeting for a wedding on any income",
      "how to financially support aging parents"
    ]
  },

  // CLUSTER 3: Personal Finance for Specific People
  specificPeople: {
    priority: 3,
    category: 'budgeting',
    keywords: [
      "money tips for freelancers and self employed",
      "budgeting for couples with different incomes",
      "finance tips for college students",
      "personal finance for expats and immigrants",
      "money management for single parents",
      "financial advice for people in their 20s",
      "budgeting tips for remote workers",
      "money habits for introverts",
      "finance basics for artists and creatives",
      "budgeting for shift workers",
      "money tips for teachers on a tight budget",
      "personal finance for gig economy workers",
      "financial planning for digital nomads",
      "money management for people with ADHD",
      "budgeting tips for healthcare workers",
      "finance guide for first generation earners",
      "money tips for people starting over",
      "budgeting for minimalists",
      "financial advice for caregivers",
      "money management for seasonal workers"
    ]
  },

  // CLUSTER 4: Mistakes & Warnings
  mistakesWarnings: {
    priority: 4,
    category: 'money-psychology',
    keywords: [
      "common money mistakes to avoid",
      "financial habits that look smart but arent",
      "budgeting mistakes beginners make",
      "money traps that keep you broke",
      "worst financial advice people follow",
      "spending habits that seem harmless",
      "money mistakes people make in their 30s",
      "financial red flags in relationships",
      "subscription traps to avoid",
      "why most budgets fail and how to fix them",
      "money myths that cost you thousands",
      "lifestyle inflation warning signs",
      "financial mistakes after getting a raise",
      "emergency fund mistakes to avoid",
      "credit card habits that hurt your finances",
      "money decisions youll regret later",
      "saving mistakes that slow your progress",
      "financial advice to ignore",
      "hidden costs people always forget",
      "money habits that seem frugal but waste money"
    ]
  },

  // CLUSTER 5: Checklists & Systems
  checklistsSystems: {
    priority: 5,
    category: 'budgeting',
    keywords: [
      "monthly financial checklist template",
      "simple personal finance system for beginners",
      "financial reset guide step by step",
      "weekly money review routine",
      "end of year financial checklist",
      "new month budget setup guide",
      "financial spring cleaning checklist",
      "money organization system that works",
      "how to create a personal finance dashboard",
      "quarterly financial review template",
      "bills and expenses tracking system",
      "annual financial planning checklist",
      "money date night questions for couples",
      "financial goal setting framework",
      "budget categories list for beginners",
      "expense tracking methods compared",
      "financial document organization guide",
      "money management apps comparison",
      "zero based budget setup guide",
      "50 30 20 budget rule explained simply"
    ]
  },

  // CLUSTER 6: Side Hustles & Micro-Income (Realistic)
  sideHustles: {
    priority: 6,
    category: 'side-hustles',
    keywords: [
      "realistic ways to make 300 dollars a month",
      "side hustles that dont feel like a second job",
      "low effort ways to earn extra money",
      "weekend side hustles for busy people",
      "online side hustles you can start today",
      "side income ideas for introverts",
      "passive income ideas that actually work",
      "how to make money from home realistically",
      "side hustles for people with full time jobs",
      "micro income streams worth your time",
      "selling unused items for extra cash",
      "freelance skills that pay well",
      "part time gig ideas for extra income",
      "ways to monetize your hobbies",
      "side hustles requiring no startup cost",
      "evening side jobs for extra money",
      "weekend gig economy opportunities",
      "simple services you can offer locally",
      "digital products you can create and sell",
      "how to turn skills into side income"
    ]
  }
};

// =============================================================================
// KEYWORD SELECTION LOGIC
// =============================================================================

/**
 * Build weighted keyword pool based on priority
 * Higher priority clusters get more representation
 */
function buildKeywordPool() {
  const pool = [];
  
  // Weight multipliers based on priority (1 = highest)
  const priorityWeights = {
    1: 4,  // Saving Money: 4x representation
    2: 3,  // Life Events: 3x
    3: 2,  // Specific People: 2x
    4: 2,  // Mistakes: 2x
    5: 1,  // Checklists: 1x
    6: 1   // Side Hustles: 1x
  };
  
  for (const [clusterName, cluster] of Object.entries(TOPIC_CLUSTERS)) {
    const weight = priorityWeights[cluster.priority] || 1;
    
    // Add keywords with weight
    for (let i = 0; i < weight; i++) {
      cluster.keywords.forEach(keyword => {
        pool.push({
          keyword,
          category: cluster.category,
          cluster: clusterName,
          priority: cluster.priority
        });
      });
    }
  }
  
  console.log(`📚 Keyword pool built: ${pool.length} weighted entries`);
  console.log(`   Priority distribution:`);
  console.log(`   - Saving Money (P1): ${TOPIC_CLUSTERS.savingMoney.keywords.length * 4} entries`);
  console.log(`   - Life Events (P2): ${TOPIC_CLUSTERS.lifeEvents.keywords.length * 3} entries`);
  console.log(`   - Specific People (P3): ${TOPIC_CLUSTERS.specificPeople.keywords.length * 2} entries`);
  console.log(`   - Mistakes (P4): ${TOPIC_CLUSTERS.mistakesWarnings.keywords.length * 2} entries`);
  console.log(`   - Checklists (P5): ${TOPIC_CLUSTERS.checklistsSystems.keywords.length} entries`);
  console.log(`   - Side Hustles (P6): ${TOPIC_CLUSTERS.sideHustles.keywords.length} entries`);
  
  return pool;
}

/**
 * Shuffle array randomly
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

async function generateDailyBatch(options = {}) {
  const {
    count = CONFIG.defaultArticleCount,
    keywordsFile = null,
    dryRun = false,
    skipDuplicateCheck = CONFIG.skipDuplicateCheck
  } = options;
  
  console.log('\n' + '📰'.repeat(30));
  console.log('MONEYWITHSENSE DAILY CONTENT GENERATION');
  console.log('📰'.repeat(30) + '\n');
  
  const startTime = Date.now();
  const log = {
    startedAt: new Date().toISOString(),
    options,
    duplicateCheck: null,
    results: []
  };
  
  // 1. Build keyword pool
  let allKeywords;
  
  if (keywordsFile) {
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
    allKeywords = buildKeywordPool();
  }

  // Shuffle the pool
  allKeywords = shuffleArray(allKeywords);
  
  // 2. Find non-duplicate keywords
  let safeKeywords = [];
  let checkedCount = 0;
  let skippedKeywords = [];
  
  if (!skipDuplicateCheck && !dryRun) {
    console.log('\n' + '🔍'.repeat(20));
    console.log('PHASE 1: FINDING UNIQUE KEYWORDS');
    console.log('🔍'.repeat(20) + '\n');
    console.log(`Goal: find ${count} unique keywords\n`);
    
    for (const kw of allKeywords) {
      if (safeKeywords.length >= count) break;
      if (checkedCount >= count * 5) {
        console.log(`⚠️ Reached ${checkedCount} checks, using remaining keywords`);
        break;
      }
      
      checkedCount++;
      console.log(`[${checkedCount}] Checking: "${kw.keyword.substring(0, 50)}..."`);
      
      try {
        const analysis = await checkSemanticDuplicate(kw.keyword, { verbose: false });
        const isRealDuplicate = analysis.isDuplicate && analysis.maxSimilarity >= 95;
        
        if (isRealDuplicate) {
          console.log(`   🔴 SKIP - Too similar (${analysis.maxSimilarity}%)`);
          skippedKeywords.push({ ...kw, similarTo: analysis.mostSimilarArticle?.title });
        } else {
          console.log(`   ✅ OK (${analysis.maxSimilarity}% similarity)`);
          safeKeywords.push(kw);
        }
        
        await new Promise(r => setTimeout(r, CONFIG.pauseBetweenDuplicateChecks));
        
      } catch (error) {
        console.log(`   ⚠️ Check error - Adding anyway`);
        safeKeywords.push(kw);
      }
    }
    
    // Fill remaining if needed
    if (safeKeywords.length < count) {
      const remaining = allKeywords
        .filter(kw => !safeKeywords.find(s => s.keyword === kw.keyword))
        .filter(kw => !skippedKeywords.find(s => s.keyword === kw.keyword))
        .slice(0, count - safeKeywords.length);
      
      console.log(`\n📥 Adding ${remaining.length} extra keywords`);
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
    safeKeywords = allKeywords.slice(0, count);
    if (skipDuplicateCheck) {
      console.log('\n⏭️ Duplicate check skipped\n');
    }
  }
  
  // Show selected keywords
  console.log(`📝 Keywords to generate (${safeKeywords.length}):`);
  safeKeywords.forEach((k, i) => {
    console.log(`   ${i + 1}. "${k.keyword.substring(0, 55)}..." [${k.category}] P${k.priority}`);
  });
  
  if (dryRun) {
    console.log('\n⚠️ DRY RUN - No articles will be created\n');
    return { keywords: safeKeywords, log };
  }
  
  if (safeKeywords.length === 0) {
    console.log('\n⚠️ No keywords available!\n');
    return log;
  }
  
  console.log('\n' + '📝'.repeat(20));
  console.log('PHASE 2: ARTICLE GENERATION');
  console.log('📝'.repeat(20) + '\n');
  
  // 3. Generate articles
  for (let i = 0; i < safeKeywords.length; i++) {
    const { keyword, category, cluster, priority } = safeKeywords[i];
    const articleNum = i + 1;
    
    console.log(`\n[${articleNum}/${safeKeywords.length}] Generating: "${keyword.substring(0, 50)}..."`);
    console.log(`   Category: ${category} | Cluster: ${cluster} | Priority: ${priority}`);
    console.log('-'.repeat(50));
    
    try {
      const result = await generateArticle(keyword, category, { skipDuplicateCheck: true });
      
      if (result?.skipped) {
        log.results.push({
          keyword,
          category,
          cluster,
          priority,
          success: false,
          skipped: true,
          reason: result.reason,
          generatedAt: new Date().toISOString()
        });
      } else {
        log.results.push({
          keyword,
          category,
          cluster,
          priority,
          success: true,
          articleId: result._id,
          slug: result.slug?.current,
          hasImage: result.hasImage,
          generatedAt: new Date().toISOString()
        });

        // YouTube picker (if available)
        if (process.env.YOUTUBE_API_KEY) {
          const slug = result.slug?.current;
          if (slug) {
            console.log('🎥 Starting YouTube picker...');
            try {
              const { stdout, stderr } = await execFileAsync('node', [path.join(__dirname, 'youtube-video-picker.js'), slug], {
                env: {
                  ...process.env,
                  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
                  SANITY_API_TOKEN: process.env.SANITY_API_TOKEN,
                  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
                  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
                },
                maxBuffer: 10 * 1024 * 1024, // 10MB buffer
              });
              // Show YouTube picker output
              if (stdout) {
                const lines = stdout.trim().split('\n');
                // Show key lines: winner selection or no winner
                lines.forEach(line => {
                  if (line.includes('🏆') || line.includes('⚠️') || line.includes('❌') || line.includes('✅ Salvato')) {
                    console.log('   ' + line);
                  }
                });
              }
              if (stderr) console.warn('   YouTube stderr:', stderr);
              console.log('✅ YouTube picker completed');
            } catch (err) {
              console.warn('⚠️ YouTube picker failed:', err.message);
              if (err.stdout) console.log('   stdout:', err.stdout.slice(-500));
              if (err.stderr) console.log('   stderr:', err.stderr.slice(-500));
            }
          }
        }
      }
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      log.results.push({
        keyword,
        category,
        cluster,
        priority,
        success: false,
        error: error.message,
        generatedAt: new Date().toISOString()
      });
    }
    
    // Pause between articles
    if (i < safeKeywords.length - 1) {
      console.log(`\n⏳ Pausing ${CONFIG.pauseBetweenArticles / 1000}s...`);
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
      console.log(`  ${imgIcon} [P${r.priority}] "${r.keyword.substring(0, 40)}..."`);
      console.log(`     -> ${r.slug}`);
    });
  }
  
  if (failed > 0) {
    console.log('\nFailed:');
    log.results.filter(r => !r.success).forEach(r => {
      console.log(`  ❌ "${r.keyword.substring(0, 40)}...": ${r.error?.substring(0, 50) || r.reason}`);
    });
  }
  console.log('='.repeat(60) + '\n');
  
  // 5. Save log
  saveLog(log);
  
  return log;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function saveLog(log) {
  try {
    const logDir = path.dirname(CONFIG.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    let logs = [];
    if (fs.existsSync(CONFIG.logFile)) {
      logs = JSON.parse(fs.readFileSync(CONFIG.logFile, 'utf-8'));
    }
    
    logs.push(log);
    
    // Keep only last 100 logs
    if (logs.length > 100) {
      logs = logs.slice(-100);
    }
    
    fs.writeFileSync(CONFIG.logFile, JSON.stringify(logs, null, 2), 'utf-8');
    console.log(`💾 Log saved to: ${CONFIG.logFile}`);
  } catch (error) {
    console.warn('⚠️ Unable to save log:', error.message);
  }
}

// =============================================================================
// CLI
// =============================================================================

async function main() {
  const args = process.argv.slice(2);
  const options = {
    count: CONFIG.defaultArticleCount,
    keywordsFile: null,
    dryRun: false,
    skipDuplicateCheck: false
  };
  
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
📰 MoneyWithSense Daily Content Generator
==========================================

Generates daily articles from 6 topic clusters:
  1. Saving Money (highest priority)
  2. Life Events & Money
  3. Personal Finance for Specific People
  4. Mistakes & Warnings
  5. Checklists & Systems
  6. Side Hustles (realistic)

Usage:
  node scripts/generate-weekly-batch.js [options]

Options:
  --count <n>        Number of articles to generate (default: 1)
  --file <name.json> Use custom keyword file from data/ folder
  --dry-run          Show keywords without generating articles
  --skip-check       Skip semantic duplicate check
  --help             Show this message

Examples:
  node scripts/generate-weekly-batch.js
  node scripts/generate-weekly-batch.js --count 2
  node scripts/generate-weekly-batch.js --dry-run
`);
      return;
    }
  }
  
  try {
    await generateDailyBatch(options);
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    process.exit(1);
  }
}

main();
