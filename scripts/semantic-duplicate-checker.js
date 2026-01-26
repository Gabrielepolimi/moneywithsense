/**
 * 🔍 MoneyWithSense - Semantic Duplicate Checker
 * 
 * Semantically analyzes keywords to avoid:
 * - Keyword Cannibalization (articles competing for the same keywords)
 * - Duplicate content (same topic with different titles)
 * - Wasted AI resources
 * 
 * Uses Google Gemini for intelligent semantic analysis
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAllArticlesForDuplicateCheck } from './sanity-helpers.js';

// ===== CONFIGURAZIONE =====
const CONFIG = {
  // Similarity threshold to consider an article duplicate (0-100)
  // NOTE: Set VERY high (98) - blocks ONLY nearly identical duplicates
  // Ex: "how to budget money" vs "how to budget money" = duplicate
  // Ex: "budgeting for beginners" vs "budgeting for families" = OK, different!
  similarityThreshold: 98,
  // Numero massimo di articoli da confrontare (per ottimizzare costi/tempo)
  maxArticlesToCompare: 30,
  // Abilita logging dettagliato
  verbose: true
};

let genAI;
let model;

/**
 * Inizializza il client Gemini
 */
function initGemini() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('❌ GEMINI_API_KEY non configurata!');
  }
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });
}

/**
 * Prompt per l'analisi semantica dei duplicati
 */
const DUPLICATE_CHECK_PROMPT = (newKeyword, existingArticles) => `
You are an SEO expert specialized in the personal finance niche.
Analyze if a NEW KEYWORD is semantically duplicated compared to existing articles.

=== NEW KEYWORD TO ANALYZE ===
"${newKeyword}"

=== EXISTING ARTICLES ON SITE ===
${existingArticles.map((a, i) => `
${i + 1}. Title: "${a.title}"
   Slug: ${a.slug}
   Excerpt: ${a.excerpt || 'N/A'}
   SEO Keywords: ${(a.seoKeywords || []).join(', ') || 'N/A'}
`).join('\n')}

=== ANALYSIS REQUIRED ===
For each existing article, evaluate:
1. TOPIC OVERLAP: Does the new keyword cover the same main topic?
2. SEARCH INTENT: Would a user searching for the new keyword be satisfied with the existing article?
3. KEYWORD CANNIBALIZATION: Would both contents compete for the same Google queries?

=== RULES - BE EXTREMELY PERMISSIVE ===
- Similarity 98-100%: DUPLICATE - ONLY if title and topic are IDENTICAL
- Similarity 0-97%: ALWAYS PROCEED - even if related, they are different articles

GOLDEN RULE: Block ONLY if someone searching on Google would find EXACTLY the same content.

EXAMPLES OF NON-DUPLICATES (ALWAYS PROCEED):
- "budgeting for beginners" vs "budgeting for families" = DIFFERENT (audience different)
- "investing in stocks" vs "investing in bonds" = DIFFERENT (investment type different)
- "401k guide" vs "IRA guide" = DIFFERENT (account type different)
- "credit card debt tips" vs "student loan tips" = DIFFERENT (debt type different)
- "saving money 2025" vs "saving money 2024" = DIFFERENT (year different)
- "retirement planning 30s" vs "retirement planning 50s" = DIFFERENT (age group different)

EXAMPLES OF DUPLICATES (BLOCK ONLY THESE):
- "how to budget guide" vs "budgeting guide tutorial" = SAME IDENTICAL ARTICLE

When in doubt, ALWAYS respond with isDuplicate: false and recommendation: "proceed".

Rispondi SOLO con questo JSON (senza markdown code blocks):
{
  "isDuplicate": boolean,
  "maxSimilarity": number (0-100),
  "mostSimilarArticle": {
    "title": "titolo articolo più simile",
    "slug": "slug",
    "similarity": number (0-100),
    "reason": "spiegazione breve del perché è simile"
  },
  "recommendation": "proceed" | "modify_angle" | "skip",
  "suggestedAngle": "se recommendation è modify_angle, suggerisci un angolo diverso per differenziare l'articolo",
  "analysis": "breve analisi SEO (max 100 parole)"
}
`;

/**
 * Analizza se una keyword è semanticamente duplicata
 * @param {string} newKeyword - La nuova keyword da verificare
 * @param {Object} options - Opzioni aggiuntive
 * @returns {Promise<Object>} Risultato dell'analisi
 */
export async function checkSemanticDuplicate(newKeyword, options = {}) {
  const { verbose = CONFIG.verbose, skipCheck = false } = options;

  if (skipCheck) {
    if (verbose) console.log('⏭️ Check duplicati saltato (skipCheck=true)');
    return {
      isDuplicate: false,
      maxSimilarity: 0,
      recommendation: 'proceed',
      skipped: true
    };
  }

  if (verbose) {
    console.log('\n' + '🔍'.repeat(20));
    console.log('ANALISI SEMANTICA DUPLICATI');
    console.log('🔍'.repeat(20));
    console.log(`\n📝 Keyword: "${newKeyword}"\n`);
  }

  // 1. Recupera articoli esistenti da Sanity
  const existingArticles = await getAllArticlesForDuplicateCheck();

  if (existingArticles.length === 0) {
    if (verbose) console.log('✅ Nessun articolo esistente - procedi liberamente\n');
    return {
      isDuplicate: false,
      maxSimilarity: 0,
      recommendation: 'proceed',
      analysis: 'Nessun articolo esistente nel database.'
    };
  }

  // 2. Limita il numero di articoli da confrontare
  const articlesToCompare = existingArticles.slice(0, CONFIG.maxArticlesToCompare);
  if (verbose) console.log(`📊 Confronto con ${articlesToCompare.length} articoli esistenti...`);

  // 3. Inizializza Gemini e analizza con retry
  initGemini();

  const maxRetries = 2;
  let content;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const startTime = Date.now();
      const result = await model.generateContent(
        DUPLICATE_CHECK_PROMPT(newKeyword, articlesToCompare)
      );
      const response = await result.response;
      content = response.text();
      
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      if (verbose) console.log(`⏱️ Analisi completata in ${elapsed}s`);
      break; // Successo
      
    } catch (retryError) {
      const isRateLimit = retryError.message.includes('429');
      if (isRateLimit && attempt < maxRetries) {
        console.log(`   ⏳ Rate limit - attendo 20s e riprovo...`);
        await new Promise(r => setTimeout(r, 20000));
      } else {
        throw retryError;
      }
    }
  }

  try {
    // 4. Parsa la risposta JSON
    const cleanContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('⚠️ Risposta non in formato JSON, procedo comunque');
      return {
        isDuplicate: false,
        maxSimilarity: 0,
        recommendation: 'proceed',
        error: 'Parse error - proceeding anyway'
      };
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // 5. Logga risultato
    if (verbose) {
      console.log('\n' + '='.repeat(50));
      console.log('📊 RISULTATO ANALISI');
      console.log('='.repeat(50));
      
      if (analysis.isDuplicate) {
        console.log(`\n🔴 DUPLICATO RILEVATO!`);
        console.log(`   Similarità: ${analysis.maxSimilarity}%`);
        console.log(`   Articolo simile: "${analysis.mostSimilarArticle?.title}"`);
        console.log(`   Motivo: ${analysis.mostSimilarArticle?.reason}`);
      } else if (analysis.recommendation === 'modify_angle') {
        console.log(`\n🟡 SOVRAPPOSIZIONE PARZIALE`);
        console.log(`   Similarità: ${analysis.maxSimilarity}%`);
        console.log(`   Suggerimento: ${analysis.suggestedAngle}`);
      } else {
        console.log(`\n🟢 NESSUN DUPLICATO`);
        console.log(`   Similarità massima: ${analysis.maxSimilarity}%`);
      }

      console.log(`\n📝 Raccomandazione: ${analysis.recommendation.toUpperCase()}`);
      console.log(`💡 Analisi: ${analysis.analysis}`);
      console.log('='.repeat(50) + '\n');
    }

    return analysis;

  } catch (error) {
    console.error('❌ Errore nell\'analisi semantica:', error.message);
    // In caso di errore, procedi comunque (fail-safe)
    return {
      isDuplicate: false,
      maxSimilarity: 0,
      recommendation: 'proceed',
      error: error.message
    };
  }
}

/**
 * Verifica batch di keyword per duplicati
 * @param {Array<string>} keywords - Array di keyword da verificare
 * @returns {Promise<Object>} Report con keyword sicure e da evitare
 */
export async function checkBatchDuplicates(keywords) {
  console.log('\n' + '📋'.repeat(20));
  console.log('VERIFICA BATCH DUPLICATI');
  console.log('📋'.repeat(20));
  console.log(`\n🔢 Keyword da verificare: ${keywords.length}\n`);

  const results = {
    safe: [],      // Keyword sicure da usare
    modify: [],    // Keyword che richiedono un angolo diverso
    skip: [],      // Keyword da saltare (duplicati)
    errors: []     // Keyword con errori di verifica
  };

  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i];
    console.log(`\n[${i + 1}/${keywords.length}] Verifico: "${keyword}"`);

    try {
      const analysis = await checkSemanticDuplicate(keyword, { verbose: false });

      if (analysis.recommendation === 'proceed') {
        results.safe.push({ keyword, analysis });
        console.log(`   ✅ SAFE (${analysis.maxSimilarity}% similarità)`);
      } else if (analysis.recommendation === 'modify_angle') {
        results.modify.push({ keyword, analysis });
        console.log(`   🟡 MODIFY (${analysis.maxSimilarity}% similarità)`);
      } else {
        results.skip.push({ keyword, analysis });
        console.log(`   🔴 SKIP (${analysis.maxSimilarity}% similarità)`);
      }

      // Pausa per rate limiting Gemini
      if (i < keywords.length - 1) {
        await new Promise(r => setTimeout(r, 2000));
      }

    } catch (error) {
      results.errors.push({ keyword, error: error.message });
      console.log(`   ❌ ERROR: ${error.message}`);
    }
  }

  // Report finale
  console.log('\n' + '='.repeat(50));
  console.log('📊 REPORT BATCH');
  console.log('='.repeat(50));
  console.log(`✅ Safe: ${results.safe.length}`);
  console.log(`🟡 Da modificare: ${results.modify.length}`);
  console.log(`🔴 Da saltare: ${results.skip.length}`);
  console.log(`❌ Errori: ${results.errors.length}`);
  console.log('='.repeat(50) + '\n');

  return results;
}

/**
 * Esporta funzione per log formattato del risultato
 */
export function formatDuplicateResult(analysis) {
  if (analysis.isDuplicate) {
    return `🔴 DUPLICATO (${analysis.maxSimilarity}%) - Simile a: "${analysis.mostSimilarArticle?.title}"`;
  } else if (analysis.recommendation === 'modify_angle') {
    return `🟡 MODIFICA ANGOLO (${analysis.maxSimilarity}%) - Suggerimento: ${analysis.suggestedAngle}`;
  } else {
    return `✅ OK (${analysis.maxSimilarity}% max similarità)`;
  }
}

// ===== CLI =====
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log(`
🔍 MoneyWithSense Semantic Duplicate Checker
=============================================

Checks if a keyword is semantically duplicated compared to existing articles.

Usage:
  node scripts/semantic-duplicate-checker.js "keyword to check"
  node scripts/semantic-duplicate-checker.js --batch "keyword1" "keyword2" "keyword3"

Examples:
  node scripts/semantic-duplicate-checker.js "budgeting for beginners"
  node scripts/semantic-duplicate-checker.js --batch "investing 401k" "credit card tips" "emergency fund"

Output recommendations:
  - proceed: Safe keyword, no duplicate
  - modify_angle: Similar article exists, consider different angle
  - skip: Certain duplicate, skip this keyword

Prerequisites:
  - GEMINI_API_KEY configured
  - SANITY_API_TOKEN to read existing articles
`);
    return;
  }

  // Batch mode
  if (args[0] === '--batch') {
    const keywords = args.slice(1);
    if (keywords.length === 0) {
      console.error('❌ Fornisci almeno una keyword dopo --batch');
      process.exit(1);
    }
    await checkBatchDuplicates(keywords);
    return;
  }

  // Single keyword mode
  const keyword = args[0];
  await checkSemanticDuplicate(keyword);
}

main().catch(console.error);

export default {
  checkSemanticDuplicate,
  checkBatchDuplicates,
  formatDuplicateResult
};

