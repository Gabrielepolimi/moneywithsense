/**
 * 📋 Cost of Living Queue Manager
 *
 * Manages the queue of cost-of-living articles to generate.
 * Features:
 * - Priority-based processing (higher number = higher priority)
 * - Lock mechanism with TTL (30 minutes)
 * - Git conflict handling (pull/rebase + retry)
 * - Retry logic (max 1 retry per item)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const QUEUE_FILE = path.join(__dirname, '..', 'data', 'costofliving-queue.json');
const QUEUE_SEED_FILE = path.join(__dirname, '..', 'data', 'costofliving-queue-seed.json');
const LOCK_TTL_MINUTES = 30;
const MAX_RETRIES = 1;
const MAX_ITEMS_PER_RUN = 1;

/**
 * Load queue from file. If queue file doesn't exist, load from seed so runs have items to process.
 */
export function loadQueue() {
  try {
    const pathToLoad = fs.existsSync(QUEUE_FILE)
      ? QUEUE_FILE
      : (fs.existsSync(QUEUE_SEED_FILE) ? QUEUE_SEED_FILE : null);
    if (!pathToLoad) {
      return {
        lock: {
          locked: false,
          lockedAt: null,
          lockedBy: null,
          lockTtlMinutes: LOCK_TTL_MINUTES
        },
        items: []
      };
    }
    const raw = fs.readFileSync(pathToLoad, 'utf-8');
    const queue = JSON.parse(raw);
    if (pathToLoad === QUEUE_SEED_FILE) {
      console.log('📋 Queue loaded from seed (costofliving-queue.json not found)');
    }
    return queue;
  } catch (error) {
    console.error('❌ Error loading queue:', error.message);
    return {
      lock: {
        locked: false,
        lockedAt: null,
        lockedBy: null,
        lockTtlMinutes: LOCK_TTL_MINUTES
      },
      items: []
    };
  }
}

/**
 * Save queue to file with git conflict handling
 */
export function saveQueue(queue) {
  try {
    const dir = path.dirname(QUEUE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2), 'utf-8');
    
    // Try to commit (optional, for tracking)
    try {
      execSync('git add data/costofliving-queue.json', { cwd: path.dirname(QUEUE_FILE), stdio: 'ignore' });
      execSync(`git commit -m "Update costofliving queue"`, { cwd: path.dirname(QUEUE_FILE), stdio: 'ignore' });
    } catch (gitError) {
      // Git commit is optional, don't fail if it errors
    }
    
    return true;
  } catch (error) {
    // If write fails due to conflict, try pull/rebase + retry
    if (error.message.includes('conflict') || error.message.includes('CONFLICT')) {
      console.log('⚠️ Git conflict detected, attempting pull/rebase + retry...');
      try {
        execSync('git pull --rebase origin main', { 
          cwd: path.dirname(QUEUE_FILE),
          stdio: 'inherit'
        });
        // Retry write once
        fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2), 'utf-8');
        console.log('✅ Queue saved after rebase');
        return true;
      } catch (rebaseError) {
        console.error('❌ Failed to resolve conflict:', rebaseError.message);
        return false;
      }
    }
    console.error('❌ Error saving queue:', error.message);
    return false;
  }
}

/**
 * Check if lock is stale (older than TTL)
 */
export function isLockStale(lock) {
  if (!lock.locked || !lock.lockedAt) {
    return true; // Not locked, treat as stale (unlocked)
  }
  
  const lockedAt = new Date(lock.lockedAt);
  const now = new Date();
  const ageMinutes = (now - lockedAt) / (1000 * 60);
  
  return ageMinutes > (lock.lockTtlMinutes || LOCK_TTL_MINUTES);
}

/**
 * Acquire lock if available or stale
 */
export function acquireLock(queue, lockedBy) {
  if (isLockStale(queue.lock)) {
    // Stale lock, treat as unlocked
    if (queue.lock.locked) {
      console.log(`⚠️ Stale lock detected (${queue.lock.lockedBy}), unlocking...`);
    }
    queue.lock = {
      locked: true,
      lockedAt: new Date().toISOString(),
      lockedBy: lockedBy,
      lockTtlMinutes: LOCK_TTL_MINUTES
    };
    saveQueue(queue);
    return true;
  }
  
  if (queue.lock.locked) {
    return false; // Lock is fresh, cannot acquire
  }
  
  // Lock is available
  queue.lock = {
    locked: true,
    lockedAt: new Date().toISOString(),
    lockedBy: lockedBy,
    lockTtlMinutes: LOCK_TTL_MINUTES
  };
  saveQueue(queue);
  return true;
}

/**
 * Release lock
 */
export function releaseLock(queue) {
  queue.lock = {
    locked: false,
    lockedAt: null,
    lockedBy: null,
    lockTtlMinutes: LOCK_TTL_MINUTES
  };
  saveQueue(queue);
}

/**
 * Get next item from queue (highest priority, pending status)
 */
export function getNextItem(queue) {
  const pending = queue.items.filter(item => item.status === 'pending');
  if (pending.length === 0) {
    return null;
  }
  
  // Sort by priority DESC, then addedAt ASC
  pending.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority; // Higher priority first
    }
    return new Date(a.addedAt) - new Date(b.addedAt); // Older first
  });
  
  return pending[0];
}

/**
 * Mark item as completed
 */
export function markDone(queue, item) {
  const index = queue.items.findIndex(i => 
    i.city === item.city && 
    i.country === item.country && 
    i.year === item.year &&
    i.addedAt === item.addedAt
  );
  
  if (index >= 0) {
    queue.items[index].status = 'completed';
    queue.items[index].completedAt = new Date().toISOString();
    saveQueue(queue);
  }
}

/**
 * Mark item as failed
 */
export function markFailed(queue, item, error) {
  const index = queue.items.findIndex(i => 
    i.city === item.city && 
    i.country === item.country && 
    i.year === item.year &&
    i.addedAt === item.addedAt
  );
  
  if (index >= 0) {
    queue.items[index].status = 'failed';
    queue.items[index].failedAt = new Date().toISOString();
    queue.items[index].error = error.message || String(error);
    queue.items[index].retryCount = (queue.items[index].retryCount || 0) + 1;
    
    // If retry count exceeded, keep as failed
    if (queue.items[index].retryCount > MAX_RETRIES) {
      queue.items[index].status = 'failed_permanent';
    }
    
    saveQueue(queue);
  }
}

/**
 * Retry failed item (if retry count allows)
 */
export function retryItem(queue, item) {
  const index = queue.items.findIndex(i => 
    i.city === item.city && 
    i.country === item.country && 
    i.year === item.year &&
    i.addedAt === item.addedAt
  );
  
  if (index >= 0 && queue.items[index].retryCount < MAX_RETRIES) {
    queue.items[index].status = 'pending';
    queue.items[index].failedAt = null;
    queue.items[index].error = null;
    saveQueue(queue);
    return true;
  }
  
  return false;
}

/**
 * Add item to queue
 */
export function addItem(queue, item) {
  const newItem = {
    city: item.city,
    country: item.country,
    year: item.year || 2026,
    comparisonCity: item.comparisonCity || null,
    mode: item.mode || 'city',
    priority: item.priority || 10,
    status: 'pending',
    retryCount: 0,
    failedAt: null,
    addedAt: new Date().toISOString()
  };
  
  queue.items.push(newItem);
  saveQueue(queue);
  return newItem;
}

/**
 * Process next item from queue (with lock management)
 */
export async function processNextItem(generatorFn) {
  const queue = loadQueue();
  
  // Try to acquire lock
  const lockedBy = `scheduled-run-${Date.now()}`;
  if (!acquireLock(queue, lockedBy)) {
    console.log('⚠️ Queue is locked, skipping...');
    return { processed: false, reason: 'locked' };
  }
  
  try {
    // Get next item
    const item = getNextItem(queue);
    if (!item) {
      console.log('✅ No pending items in queue');
      releaseLock(queue);
      return { processed: false, reason: 'no_items' };
    }
    
    console.log(`\n📋 Processing queue item: ${item.city}, ${item.country} (${item.year})`);
    if (item.comparisonCity) {
      console.log(`   Comparison: ${item.city} vs ${item.comparisonCity}`);
    }
    
    // Generate article
    try {
      const result = await generatorFn(
        item.city,
        item.country,
        item.year,
        item.comparisonCity,
        item.mode
      );
      
      markDone(queue, item);
      console.log(`✅ Queue item completed: ${result.slug}`);
      
      return {
        processed: true,
        success: true,
        item: item,
        result: result
      };
    } catch (error) {
      markFailed(queue, item, error);
      console.error(`❌ Queue item failed: ${error.message}`);
      
      return {
        processed: true,
        success: false,
        item: item,
        error: error.message
      };
    }
  } finally {
    releaseLock(queue);
  }
}

// CLI support
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  if (command === 'list') {
    const queue = loadQueue();
    console.log('\n📋 Cost of Living Queue');
    console.log('='.repeat(50));
    console.log(`Lock: ${queue.lock.locked ? `LOCKED by ${queue.lock.lockedBy} at ${queue.lock.lockedAt}` : 'UNLOCKED'}`);
    console.log(`Items: ${queue.items.length}`);
    console.log(`Pending: ${queue.items.filter(i => i.status === 'pending').length}`);
    console.log(`Completed: ${queue.items.filter(i => i.status === 'completed').length}`);
    console.log(`Failed: ${queue.items.filter(i => i.status === 'failed' || i.status === 'failed_permanent').length}`);
    console.log('\nPending items:');
    queue.items
      .filter(i => i.status === 'pending')
      .sort((a, b) => b.priority - a.priority)
      .forEach((item, idx) => {
        console.log(`  ${idx + 1}. ${item.city}, ${item.country} (${item.year}) - Priority: ${item.priority}`);
      });
  } else if (command === 'add') {
    const city = process.argv[3];
    const country = process.argv[4];
    const year = parseInt(process.argv[5]) || 2026;
    const priority = parseInt(process.argv[6]) || 10;
    const comparisonCity = process.argv[7] || null;
    const mode = process.argv[8] || 'city';
    
    if (!city || !country) {
      console.error('Usage: node costofliving-queue.js add <city> <country> [year] [priority] [comparisonCity] [mode]');
      process.exit(1);
    }
    
    const queue = loadQueue();
    const item = addItem(queue, { city, country, year, priority, comparisonCity, mode });
    console.log(`✅ Added to queue: ${item.city}, ${item.country} (${item.year})`);
  } else {
    console.log('Usage:');
    console.log('  node costofliving-queue.js list');
    console.log('  node costofliving-queue.js add <city> <country> [year] [priority] [comparisonCity] [mode]');
  }
}
