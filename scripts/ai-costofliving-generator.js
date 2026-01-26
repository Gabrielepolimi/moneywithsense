/**
 * 🏙️ MoneyWithSense - Cost of Living Content Generator
 *
 * Generates cost-of-living articles for cities with strict structure,
 * anti-duplication, and quality gates.
 *
 * Features:
 * - 3 prompt templates (single city, comparison, budget framing)
 * - Normalized deduplication (citySlug, countryCode)
 * - Structured JSON cost data (no markdown parsing)
 * - Quality gates (cost rounding, total coherence)
 * - YouTube embedding with strict validation
 * - Unsplash variety (8-12 results, photoId tracking)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { VertexAI } from '@google-cloud/vertexai';
import { createClient } from '@sanity/client';
import { searchPhotos, trackDownload } from './unsplash-service.js';
import {
  getDefaultAuthorId,
  getCategoryIdBySlug,
  articleExistsBySlug,
  markdownToBlockContent,
  slugify,
  validatePostDocument
} from './sanity-helpers.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== CONFIGURATION =====
const CONFIG = {
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-pro', // Default to Vertex AI model (try gemini-2.5-pro, fallback to gemini-2.5-flash-lite if not available)
  maxTokens: 10000,
  temperature: 0.7,
  publishImmediately: true,
  readingTimeMin: 6,
  readingTimeMax: 15,
  initialLikesMin: 120,
  initialLikesMax: 520,
  fallbackImagesDir: path.join(__dirname, '..', 'public', 'images', 'fallback-finance'),
  unsplashMaxRetries: 2,
  unsplashRetryDelay: 2000,
  unsplashResultsCount: 12, // Fetch 8-12 results, randomly pick one
  costRoundingSteps: [10, 25], // Round to nearest 10 or 25
  totalCoherenceTolerance: 0.05 // ±5% tolerance for total vs sum of categories
};

const USED_UNSPLASH_IDS_FILE = path.join(__dirname, '..', 'data', 'unsplash-used.json');
const MAX_STORED_UNSPLASH_IDS = 300;
const usedUnsplashPhotoIds = new Set();
let usedUnsplashPhotoIdQueue = [];

/**
 * Load used Unsplash IDs from file
 */
function loadUsedUnsplashIdsFromFile() {
  try {
    if (fs.existsSync(USED_UNSPLASH_IDS_FILE)) {
      const raw = fs.readFileSync(USED_UNSPLASH_IDS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      const ids = Array.isArray(parsed) ? parsed : parsed.ids;
      if (Array.isArray(ids)) {
        ids.forEach(id => {
          if (id && !usedUnsplashPhotoIds.has(id)) {
            usedUnsplashPhotoIds.add(id);
            usedUnsplashPhotoIdQueue.push(id);
          }
        });
      }
    }
  } catch (error) {
    console.warn(`⚠️ Could not load unsplash-used.json: ${error.message}`);
  }
}

/**
 * Load used Unsplash IDs from Sanity (async)
 */
async function loadUsedUnsplashIdsFromSanity() {
  try {
    // Limit query to recent posts (last 1500) to avoid performance issues at scale
    const posts = await sanityClient.fetch(`*[
      _type == "post" && 
      contentSeries == "cost-of-living" && 
      defined(unsplashPhotoId)
    ] | order(publishedAt desc)[0...1500]{
      unsplashPhotoId
    }`);
    posts.forEach(post => {
      if (post.unsplashPhotoId && !usedUnsplashPhotoIds.has(post.unsplashPhotoId)) {
        usedUnsplashPhotoIds.add(post.unsplashPhotoId);
        usedUnsplashPhotoIdQueue.push(post.unsplashPhotoId);
      }
    });
    console.log(`✅ Loaded ${posts.length} Unsplash IDs from Sanity (limited to 1500 most recent)`);
  } catch (err) {
    console.warn('⚠️ Could not load Unsplash IDs from Sanity:', err.message);
  }
}

// Load from file on module init (sync)
loadUsedUnsplashIdsFromFile();

// Sanity Client
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'z0g6hj8g',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-08-10',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// Gemini AI - Support both Vertex AI and Google AI Studio
let genAI = null;
let vertexAI = null;
let useVertexAI = false;
let forceAiStudio = false; // Flag to force Google AI Studio even if Vertex AI is configured

function getGeminiAI() {
  // If forceAiStudio is set, use Google AI Studio even if Vertex AI is configured
  if (forceAiStudio) {
    if (!genAI) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not configured (forced to use AI Studio)');
      }
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      console.log('✅ Google AI Studio API initialized (forced)');
    }
    return genAI;
  }
  
  // Check if Vertex AI is configured
  if (process.env.GCP_PROJECT_ID && process.env.GCP_LOCATION) {
    if (!vertexAI) {
      try {
        // Log credentials info for debugging (don't log actual credentials)
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
          console.log(`🔑 GOOGLE_APPLICATION_CREDENTIALS set to: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
          // Verify file exists
          try {
            if (fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
              console.log(`✅ Credentials file exists and is readable`);
            } else {
              console.error(`❌ Credentials file not found: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
            }
          } catch (fsError) {
            console.warn(`⚠️ Could not verify credentials file: ${fsError.message}`);
          }
        } else {
          console.warn(`⚠️ GOOGLE_APPLICATION_CREDENTIALS not set - Vertex AI will use Application Default Credentials`);
        }
        
        vertexAI = new VertexAI({
          project: process.env.GCP_PROJECT_ID,
          location: process.env.GCP_LOCATION || 'us-central1',
        });
        useVertexAI = true; // Set only after successful initialization
        console.log(`✅ Vertex AI initialized: project=${process.env.GCP_PROJECT_ID}, location=${process.env.GCP_LOCATION}`);
      } catch (error) {
        useVertexAI = false; // Reset flag on failure
        console.error('❌ Failed to initialize Vertex AI:', error.message);
        console.error('   Error details:', error);
        throw new Error(`Vertex AI initialization failed: ${error.message}. Check GOOGLE_APPLICATION_CREDENTIALS.`);
      }
    }
    return vertexAI;
  }
  
  // Fallback to Google AI Studio API
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured (or set GCP_PROJECT_ID and GCP_LOCATION for Vertex AI)');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ Google AI Studio API initialized (fallback)');
  }
  return genAI;
}

/**
 * Generate text using Gemini AI (abstracts differences between Vertex AI and Google AI Studio)
 * @param {string} prompt - The prompt to send to the model
 * @param {object} options - Generation options (temperature, maxOutputTokens, model)
 * @returns {Promise<string>} - The generated text
 */
async function generateText(prompt, options = {}) {
  const ai = getGeminiAI();
  const temperature = options.temperature ?? CONFIG.temperature;
  const maxOutputTokens = options.maxOutputTokens ?? CONFIG.maxTokens;
  const modelName = options.model ?? CONFIG.geminiModel;
  
  if (useVertexAI) {
    // Vertex AI - try specified model, fallback to gemini-2.5-flash-lite if needed
    let model;
    try {
      model = ai.getGenerativeModel({ model: modelName });
    } catch (modelError) {
      if (modelName === 'gemini-2.5-pro') {
        console.warn(`⚠️ gemini-2.5-pro not available, trying gemini-2.5-flash-lite...`);
        try {
          model = ai.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
        } catch (fallbackError) {
          throw new Error(`Both gemini-2.5-pro and gemini-2.5-flash-lite failed: ${fallbackError.message}`);
        }
      } else {
        throw modelError;
      }
    }
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens
      }
    });
    
    if (!result.response || !result.response.candidates || result.response.candidates.length === 0) {
      throw new Error('Vertex AI returned empty response');
    }
    
    // Extract text from all parts (handles multi-part responses and safety blocks)
    const text = result?.response?.candidates?.[0]?.content?.parts
      ?.map(p => p.text)
      .filter(Boolean)
      .join('\n')
      .trim();
    
    if (!text) {
      throw new Error('Vertex AI returned empty text (possibly blocked by safety filters)');
    }
    
    return text;
  } else {
    // Google AI Studio API
    const model = ai.getGenerativeModel({ model: modelName });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens
      }
    });
    return result.response.text();
  }
}

// ===== NORMALIZATION FUNCTIONS =====

/**
 * Normalize city name to slug (e.g., "New York City" → "new-york-city")
 */
function normalizeCityName(city) {
  if (!city) return '';
  // Handle common aliases
  const aliases = {
    'nyc': 'new-york-city',
    'new york': 'new-york-city',
    'new york city': 'new-york-city',
    'la': 'los-angeles',
    'los angeles': 'los-angeles',
    'sf': 'san-francisco',
    'san francisco': 'san-francisco',
    'dc': 'washington-dc',
    'washington dc': 'washington-dc',
    'washington d.c.': 'washington-dc',
  };
  const lower = city.toLowerCase().trim();
  if (aliases[lower]) return aliases[lower];
  return slugify(city);
}

/**
 * Normalize country name to ISO code
 */
function normalizeCountryCode(country) {
  if (!country) return '';
  const countryMap = {
    'united states': 'US',
    'usa': 'US',
    'us': 'US',
    'united kingdom': 'GB',
    'uk': 'GB',
    'england': 'GB',
    'germany': 'DE',
    'france': 'FR',
    'italy': 'IT',
    'spain': 'ES',
    'canada': 'CA',
    'australia': 'AU',
    'japan': 'JP',
    'china': 'CN',
    'india': 'IN',
    'brazil': 'BR',
    'mexico': 'MX',
    'netherlands': 'NL',
    'belgium': 'BE',
    'switzerland': 'CH',
    'austria': 'AT',
    'sweden': 'SE',
    'norway': 'NO',
    'denmark': 'DK',
    'poland': 'PL',
    'portugal': 'PT',
    'greece': 'GR',
    'ireland': 'IE',
    'new zealand': 'NZ',
    'south korea': 'KR',
    'singapore': 'SG',
    'hong kong': 'HK',
    'united arab emirates': 'AE',
    'uae': 'AE',
  };
  const lower = country.toLowerCase().trim();
  return countryMap[lower] || country.toUpperCase().substring(0, 2);
}

/**
 * Normalize currency to valid ISO code [A-Z]{3}
 * Returns null if not a valid ISO currency code
 */
function normalizeCurrency(currency) {
  if (!currency || typeof currency !== 'string') return null;
  // Remove any descriptive text, keep only ISO code
  const match = currency.match(/\b([A-Z]{3})\b/);
  if (match) {
    const isoCode = match[1];
    // Accept any valid ISO currency code (3 uppercase letters)
    if (/^[A-Z]{3}$/.test(isoCode)) {
      return isoCode;
    }
  }
  return null;
}

/**
 * Infer local currency from country code
 */
function inferLocalCurrency(countryCode) {
  const currencyMap = {
    'GB': 'GBP',
    'IE': 'EUR',
    'FR': 'EUR',
    'DE': 'EUR',
    'IT': 'EUR',
    'ES': 'EUR',
    'PT': 'EUR',
    'NL': 'EUR',
    'BE': 'EUR',
    'AT': 'EUR',
    'GR': 'EUR',
    'FI': 'EUR',
    'LU': 'EUR',
    'US': 'USD',
    'CA': 'CAD',
    'AU': 'AUD',
    'NZ': 'NZD',
    'JP': 'JPY',
    'CN': 'CNY',
    'IN': 'INR',
    'BR': 'BRL',
    'MX': 'MXN',
    'CH': 'CHF',
    'SE': 'SEK',
    'NO': 'NOK',
    'DK': 'DKK',
    'PL': 'PLN',
    'KR': 'KRW',
    'SG': 'SGD',
    'HK': 'HKD',
    'AE': 'AED',
  };
  
  const currency = currencyMap[countryCode];
  if (!currency) {
    console.warn(`⚠️ Currency not mapped for country code: ${countryCode}. Prompt will ask AI to use local currency.`);
    return null; // Return null instead of defaulting to USD
  }
  
  return currency;
}

/**
 * Generate deterministic slug based on mode, city, comparison, year
 */
function generateDeterministicSlug(mode, citySlug, comparisonCitySlug, year) {
  let baseSlug;
  
  switch (mode) {
    case 'comparison':
      if (!comparisonCitySlug) {
        throw new Error('Comparison mode requires comparisonCitySlug');
      }
      baseSlug = `${citySlug}-vs-${comparisonCitySlug}-cost-of-living`;
      break;
    case 'budget':
      baseSlug = `how-much-to-live-in-${citySlug}`;
      break;
    case 'city':
    default:
      baseSlug = `cost-of-living-in-${citySlug}`;
      break;
  }
  
  // Always append year for SEO and to prevent collisions
  const articleYear = year || new Date().getFullYear();
  baseSlug = `${baseSlug}-${articleYear}`;
  
  return baseSlug;
}

/**
 * Ensure slug is unique by checking Sanity and appending suffix if needed
 */
async function ensureUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let suffix = 1;
  
  while (true) {
    const count = await sanityClient.fetch(`count(*[_type == "post" && slug.current == $slug])`, { slug });
    
    if (count === 0) {
      return slug;
    }
    
    suffix++;
    slug = `${baseSlug}-${suffix}`;
    
    // Safety limit
    if (suffix > 100) {
      throw new Error(`Could not generate unique slug after 100 attempts for: ${baseSlug}`);
    }
  }
}

// ===== DUPLICATE CHECK =====

/**
 * Check for duplicate cost-of-living articles using normalized fields
 * @param {boolean} strictDedup - If true, throw error on failure (fail closed). If false, allow proceed (fail open).
 */
async function checkDuplicate(citySlug, countryCode, year, comparisonCitySlug = null, comparisonCity = null, strictDedup = false) {
  try {
    // Use boolean hasComparison instead of defined() for parameters (more reliable in GROQ)
    // Also check comparisonCity as fallback for legacy posts without comparisonCitySlug
    const query = `*[
      _type == "post" && 
      contentSeries == "cost-of-living" &&
      citySlug == $citySlug && 
      countryCode == $countryCode && 
      year == $year &&
      (
        ($hasComparison == false && !defined(comparisonCitySlug) && !defined(comparisonCity)) ||
        ($hasComparison == true && (
          comparisonCitySlug == $comparisonCitySlug ||
          comparisonCity == $comparisonCity
        ))
      )
    ]{
      _id,
      title,
      "slug": slug.current,
      city,
      country,
      year,
      comparisonCity,
      comparisonCitySlug
    }`;
    
    const existing = await sanityClient.fetch(query, {
      citySlug,
      countryCode,
      year,
      hasComparison: Boolean(comparisonCitySlug || comparisonCity),
      comparisonCitySlug: comparisonCitySlug || null,
      comparisonCity: comparisonCity || null
    });
    
    if (existing && existing.length > 0) {
      return {
        isDuplicate: true,
        existing: existing[0]
      };
    }
    
    return { isDuplicate: false };
  } catch (error) {
    console.error('❌ Error checking duplicate:', error.message);
    if (strictDedup) {
      throw new Error(`Duplicate check failed (strict mode): ${error.message}. Cannot proceed safely.`);
    }
    // On error, allow proceeding (fail open) only if not strict
    console.warn('⚠️ Duplicate check failed, proceeding anyway (non-strict mode)');
    return { isDuplicate: false };
  }
}

// ===== COST DATA VALIDATION =====

/**
 * Round cost value to nearest 10 or 25
 */
function roundCost(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;

  const steps = Array.isArray(CONFIG.costRoundingSteps) && CONFIG.costRoundingSteps.length
    ? [...CONFIG.costRoundingSteps].sort((a, b) => b - a)  // es: [25,10]
    : [25, 10];

  // Try larger step first (more "clean"), then fallback to smaller
  for (const step of steps) {
    const rounded = Math.round(value / step) * step;
    const tolerance = step / 2; // equivalent to 12.5 for 25
    if (Math.abs(value - rounded) <= tolerance) return rounded;
  }

  // Safety fallback
  const lastStep = steps[steps.length - 1] || 10;
  return Math.round(value / lastStep) * lastStep;
}

/**
 * Validate and fix cost data coherence
 */
function validateCostData(costData) {
  if (!costData || typeof costData !== 'object') {
    return { valid: false, error: 'Invalid cost data structure' };
  }
  
  // Round all cost values
  const categories = [
    'rentCityCenter', 'rentOutside',
    'utilities', 'groceries', 'transport',
    'eatingOut', 'internetPhone', 'entertainment'
  ];
  
  const rounded = { ...costData };
  
  categories.forEach(cat => {
    if (typeof rounded[`${cat}Min`] === 'number') {
      rounded[`${cat}Min`] = roundCost(rounded[`${cat}Min`]);
    }
    if (typeof rounded[`${cat}Max`] === 'number') {
      rounded[`${cat}Max`] = roundCost(rounded[`${cat}Max`]);
    }
  });
  
  // Calculate totals from categories
  const calculatedMin = categories.reduce((sum, cat) => {
    return sum + (rounded[`${cat}Min`] || 0);
  }, 0);
  
  const calculatedMax = categories.reduce((sum, cat) => {
    return sum + (rounded[`${cat}Max`] || 0);
  }, 0);
  
  // Check coherence
  const originalTotalMin = rounded.totalMin || 0;
  const originalTotalMax = rounded.totalMax || 0;
  
  const minDiff = Math.abs(originalTotalMin - calculatedMin);
  const maxDiff = Math.abs(originalTotalMax - calculatedMax);
  const minTolerance = calculatedMin * CONFIG.totalCoherenceTolerance;
  const maxTolerance = calculatedMax * CONFIG.totalCoherenceTolerance;
  
  // Track if totals were actually changed
  let totalsAdjusted = false;
  
  // Fix totals if out of tolerance
  if (minDiff > minTolerance) {
    rounded.totalMin = roundCost(calculatedMin);
    totalsAdjusted = true;
  }
  if (maxDiff > maxTolerance) {
    rounded.totalMax = roundCost(calculatedMax);
    totalsAdjusted = true;
  }
  
  return {
    valid: true,
    costData: rounded,
    warnings: totalsAdjusted ? ['Totals adjusted to match category sums'] : []
  };
}

// ===== PROMPT TEMPLATES =====

const PROMPT_TEMPLATE_SINGLE_CITY = `You are a cost-of-living researcher writing for MoneyWithSense.com,
an independent educational platform about personal finance.

CITY: {city}
COUNTRY: {country}
YEAR: {year}

Your goal is to help readers realistically estimate their monthly cost
of living using transparent ranges and practical explanations.

You are NOT a financial advisor.
You do NOT invent precise numbers.
You explain how estimates are built.

=== WRITING STYLE ===
- Global English (clear for US, UK, EU, CA, AU readers)
- No slang, no hype, no clickbait
- Short, clear sentences (average ≤ 20 words)
- Calm, practical, trustworthy tone
- Neutral and informative
- Always use cost ranges, never exact figures
- Write for humans first, search engines second

=== STRICT REQUIREMENTS ===

1) TITLE
- Max 60 characters
- SEO-friendly
- Must clearly include city name and year

2) SEO_TITLE
- Max 60 characters
- Can differ slightly from display title

3) META_DESCRIPTION
- EXACTLY 150–160 characters
- Neutral, informative, not promotional

4) EXCERPT
- Max 150 characters
- Can match or slightly shorten meta description

---

5) CONTENT STRUCTURE  
(Sections must appear in this exact order with EXACT H2 headings)

CRITICAL: Use these EXACT H2 headings (case-sensitive):
- ## TL;DR
- ## Last Updated
- ## Monthly Cost Breakdown
- ## By Lifestyle
- ## How to Save Money in {city}
- ## Common Mistakes
- ## Quick Checklist
- ## FAQ
- ## Sources & Methodology
- ## Conclusion
- ## Disclaimer

a) TL;DR  
- Either:
  • 3–5 bullet points OR  
  • One short summary paragraph  
  (choose format naturally, not always the same)
- Must clearly answer in LOCAL CURRENCY:
  "You'll need approximately {currencySymbol}X–{currencySymbol}Y per month to live in {city}."
  (Include USD equivalent if different: "approximately €1,200–€1,800 ($1,300–$1,950 USD) per month")

b) Last Updated  
- Format exactly:
  "Last updated: {Month YYYY}"

c) Monthly Cost Breakdown  
- Markdown table with ranges (Min / Max) in LOCAL CURRENCY ({localCurrency})
- Show USD equivalent in parentheses if different from local currency
- Example: "€800–€1,200 ($850–$1,280 USD)"
- Include:
  Rent (city center)
  Rent (outside center)
  Utilities
  Groceries
  Transport
  Eating out
  Internet / Phone
  Entertainment

d) By Lifestyle (Lifestyle Scenarios)
- Single person
- Couple
- Family (if applicable)
- Digital nomad (if applicable)
- Explain how spending patterns differ

e) How to Save Money in {city}
- 5–8 practical, city-specific tips
- Focus on transport, housing, food, daily habits
- No generic advice

f) Common Mistakes
- 3–5 frequent budgeting errors
- Brief explanation why each is problematic

g) Quick Checklist
- 5–8 bullet points
- Easy to screenshot or save

h) FAQ
- 3–6 questions
- Each question as an H3 (###)
- Short, clear answers
- Example: ### Is {city} expensive?

i) Sources & Methodology
- Explain clearly:
  • How ranges are estimated
  • Why prices vary by neighborhood and lifestyle
  • That figures are indicative, not guarantees
  • How readers can validate locally
    (rental sites, supermarkets, local forums)
- Do NOT invent citations or fake sources

j) Conclusion
- Practical wrap-up
- Neutral tone
- Soft suggestion to explore related guides or comparisons
- No selling language

k) Disclaimer (mandatory, exact meaning)
- State clearly:
  "This content is for informational purposes only and does not constitute financial advice."

---

6) INTERNAL LINKS
- DO NOT include any internal or external links in markdown
- Internal linking is handled automatically by the system

7) LENGTH
- Minimum: 1,200 words
- Maximum: 1,800 words
- Never below 1,000 words

8) SEO RULES
- Primary keyword:
  • Use naturally throughout the content
  • Avoid keyword stuffing
  • Appear in first paragraph and at least one H2
- Use 4–6 related keywords naturally
- Use proper markdown:
  • ## for H2
  • ### for H3
- NEVER write "H2:" or "H3:" as text

---

=== OUTPUT FORMAT (EXACT — DO NOT CHANGE) ===

---TITLE---
[Display title, max 60 chars]

---SEO_TITLE---
[SEO title, max 60 chars]

---META_DESCRIPTION---
[150–160 characters]

---EXCERPT---
[Max 150 characters]

---KEYWORDS---
[primary keyword, related keyword 1, related keyword 2, related keyword 3]
---END_KEYWORDS---

---COST_DATA_JSON---
{
  "currency": "{localCurrency}",
  "timeUnit": "monthly",
  "rentCityCenterMin": 1200,
  "rentCityCenterMax": 1800,
  "rentOutsideMin": 800,
  "rentOutsideMax": 1200,
  "utilitiesMin": 100,
  "utilitiesMax": 150,
  "groceriesMin": 300,
  "groceriesMax": 450,
  "transportMin": 80,
  "transportMax": 120,
  "eatingOutMin": 200,
  "eatingOutMax": 350,
  "internetPhoneMin": 50,
  "internetPhoneMax": 80,
  "entertainmentMin": 100,
  "entertainmentMax": 200,
  "totalMin": 2830,
  "totalMax": 4350
}
---END_COST_DATA_JSON---

---DATA_POLICY_JSON---
{
  "dataSources": [
    "Public rental listings",
    "Consumer price indices",
    "Local cost databases"
  ],
  "assumptions": [
    "Based on a one-bedroom apartment",
    "Moderate lifestyle",
    "No luxury expenses included"
  ],
  "lastVerifiedAt": "{ISO_DATE}"
}
---END_DATA_POLICY_JSON---

---CONTENT---
[Full markdown article]

---END---

Write original, helpful, and realistic content.
Your goal is clarity, transparency, and usefulness — not persuasion.`;

const PROMPT_TEMPLATE_COMPARISON = `You are a cost-of-living researcher writing for MoneyWithSense.com.

CITY 1: {city}
CITY 2: {comparisonCity}
COUNTRY: {country}
YEAR: {year}

=== WRITING STYLE ===
- Simple, global English
- Short sentences (max 20 words average)
- Practical, calm, trustworthy voice
- Never clickbait
- Use ranges for costs

=== STRICT REQUIREMENTS ===

1) TITLE: max 60 characters, SEO-friendly comparison title
2) SEO_TITLE: max 60 characters
3) META_DESCRIPTION: exactly 150-160 characters
4) EXCERPT: max 150 characters

5) CONTENT STRUCTURE:
   - TL;DR / In Brief
   - Last Updated
   - Side-by-side comparison table (both cities)
   - Key Differences section
   - Pros and Cons for each city
   - Lifestyle scenarios for both
   - How to save money (both cities)
   - Common mistakes
   - Quick checklist
   - FAQ (3-6 questions)
   - Sources & Methodology (with variability and validation guidance)
   - Conclusion
   - Disclaimer

6) INTERNAL LINKS: DO NOT include internal links in markdown - handled automatically by system

7) LENGTH: 1,600-2,100 words

=== OUTPUT FORMAT ===
[Same as single city template with COST_DATA_JSON for both cities or combined ranges]

Write a comprehensive comparison that helps readers decide between the two cities.`;

const PROMPT_TEMPLATE_BUDGET_FRAMING = `You are a cost-of-living researcher writing for MoneyWithSense.com.

CITY: {city}
COUNTRY: {country}
YEAR: {year}

FRAMING: "How much do you need to live in {city}?"

=== WRITING STYLE ===
- Simple, global English
- Short sentences
- Practical, calm voice
- Focus on minimum viable budget and different lifestyle scenarios

=== STRICT REQUIREMENTS ===

1) TITLE: "How Much Do You Need to Live in {city} (2026)?"
2) SEO_TITLE: max 60 characters
3) META_DESCRIPTION: exactly 150-160 characters
4) EXCERPT: max 150 characters

5) CONTENT STRUCTURE:
   - TL;DR / In Brief (focus on minimum budget)
   - Last Updated
   - Minimum Viable Budget (bare bones)
   - Comfortable Budget (moderate lifestyle)
   - Luxury Budget (if applicable)
   - Monthly Cost Breakdown table
   - By Lifestyle scenarios
   - How to save money
   - Common mistakes
   - Quick checklist
   - FAQ
   - Sources & Methodology
   - Conclusion
   - Disclaimer

6) INTERNAL LINKS: DO NOT include internal links in markdown - handled automatically by system

7) LENGTH: 1,200-1,800 words

=== OUTPUT FORMAT ===
[Same as single city template]

Focus on answering "how much do I need?" with clear budget tiers.`;

/**
 * Select prompt template based on mode
 */
function getPromptTemplate(mode, city, country, year, comparisonCity = null) {
  const templates = {
    'city': PROMPT_TEMPLATE_SINGLE_CITY,
    'comparison': PROMPT_TEMPLATE_COMPARISON,
    'budget': PROMPT_TEMPLATE_BUDGET_FRAMING
  };
  
  let selectedMode = mode;
  
  // Auto-select template if not specified
  if (!selectedMode) {
    if (comparisonCity) {
      selectedMode = 'comparison';
    } else {
      // Rotate between city and budget templates
      const random = Math.random();
      selectedMode = random < 0.5 ? 'city' : 'budget';
    }
  }
  
  const template = templates[selectedMode] || templates['city'];
  
  // Infer local currency for the country
  const countryCode = normalizeCountryCode(country);
  const localCurrency = inferLocalCurrency(countryCode);
  // For JSON template, always use ISO code (fallback to USD if not mapped)
  // For display text, use symbol or fallback to USD with instruction
  const costDataCurrency = localCurrency || 'USD'; // Always ISO for JSON
  const currencySymbol = localCurrency 
    ? (localCurrency === 'EUR' ? '€' : localCurrency === 'GBP' ? '£' : localCurrency === 'USD' ? '$' : localCurrency)
    : '$'; // Use USD symbol as fallback, but add instruction in prompt
  
  // Add currency instruction if currency not mapped
  const currencyInstruction = localCurrency 
    ? '' 
    : '\n\nIMPORTANT: Even though the JSON uses USD (due to missing currency mapping), write the article using the local currency symbol for {city}. Do not use [LOCAL_CURRENCY] placeholder - use the actual currency symbol (e.g., €, £, ¥, etc.) based on the country.';
  
  return template
    .replace(/{city}/g, city)
    .replace(/{country}/g, country)
    .replace(/{year}/g, year.toString())
    .replace(/{comparisonCity}/g, comparisonCity || '')
    .replace(/{localCurrency}/g, costDataCurrency) // Always ISO code for JSON
    .replace(/{currencySymbol}/g, currencySymbol)
    + currencyInstruction; // Append instruction if needed
}

// ===== CONTENT PARSING =====

/**
 * Parse Gemini output with structured JSON sections
 */
function parseGeneratedContent(content) {
  const sections = {
    title: '',
    seoTitle: '',
    metaDescription: '',
    excerpt: '',
    keywords: [],
    costData: null,
    dataPolicy: null,
    content: ''
  };
  
  // Extract sections with specific next markers for robustness
  const titleMatch = content.match(/---TITLE---\s*([\s\S]*?)\s*---SEO_TITLE---/);
  if (titleMatch) sections.title = titleMatch[1].trim();
  
  const seoTitleMatch = content.match(/---SEO_TITLE---\s*([\s\S]*?)\s*---META_DESCRIPTION---/);
  if (seoTitleMatch) sections.seoTitle = seoTitleMatch[1].trim();
  
  const metaDescMatch = content.match(/---META_DESCRIPTION---\s*([\s\S]*?)\s*---EXCERPT---/);
  if (metaDescMatch) sections.metaDescription = metaDescMatch[1].trim();
  
  const excerptMatch = content.match(/---EXCERPT---\s*([\s\S]*?)\s*---KEYWORDS---/);
  if (!excerptMatch) {
    // Fallback to old format for backward compatibility
    const oldMatch = content.match(/---EXCERPT---\s*([\s\S]*?)\s*---(?!KEYWORDS)/);
    if (oldMatch) {
      const nextMarker = content.indexOf('---', oldMatch.index + oldMatch[0].length);
      if (nextMarker > 0) {
        const start = oldMatch.index + oldMatch[0].length;
        sections.excerpt = content.substring(start, nextMarker).trim();
      }
    }
  } else {
    sections.excerpt = excerptMatch[1].trim();
  }
  
  // Truncate excerpt to 150 chars if too long (safety check)
  if (sections.excerpt && sections.excerpt.length > 150) {
    sections.excerpt = sections.excerpt.substring(0, 147) + '...';
  }
  
  // Parse with new delimiters (---END_XXX---) for robustness, with fallback to old format
  const keywordsMatch = content.match(/---KEYWORDS---\s*([\s\S]*?)\s*---END_KEYWORDS---/);
  if (!keywordsMatch) {
    // Fallback to old format for backward compatibility
    const oldMatch = content.match(/---KEYWORDS---\s*([\s\S]*?)\s*---(?!END_KEYWORDS)/);
    if (oldMatch) {
      const nextMarker = content.indexOf('---', oldMatch.index + oldMatch[0].length);
      if (nextMarker > 0) {
        const start = oldMatch.index + oldMatch[0].length;
        sections.keywords = content.substring(start, nextMarker).trim().split(',').map(k => k.trim()).filter(Boolean);
      }
    }
  } else {
    sections.keywords = keywordsMatch[1].split(',').map(k => k.trim()).filter(Boolean);
  }
  
  const costDataMatch = content.match(/---COST_DATA_JSON---\s*([\s\S]*?)\s*---END_COST_DATA_JSON---/);
  if (!costDataMatch) {
    // Fallback to old format
    const oldMatch = content.match(/---COST_DATA_JSON---\s*([\s\S]*?)\s*---(?!END_COST_DATA_JSON)/);
    if (oldMatch) {
      const nextMarker = content.indexOf('---', oldMatch.index + oldMatch[0].length);
      if (nextMarker > 0) {
        const start = oldMatch.index + oldMatch[0].length;
        const jsonStr = content.substring(start, nextMarker).trim();
        try {
          sections.costData = JSON.parse(jsonStr);
        } catch (e) {
          console.warn('⚠️ Failed to parse COST_DATA_JSON (fallback):', e.message);
        }
      }
    }
  } else {
    try {
      sections.costData = JSON.parse(costDataMatch[1].trim());
    } catch (e) {
      console.warn('⚠️ Failed to parse COST_DATA_JSON:', e.message);
    }
  }
  
  const dataPolicyMatch = content.match(/---DATA_POLICY_JSON---\s*([\s\S]*?)\s*---END_DATA_POLICY_JSON---/);
  if (!dataPolicyMatch) {
    // Fallback to old format
    const oldMatch = content.match(/---DATA_POLICY_JSON---\s*([\s\S]*?)\s*---(?!END_DATA_POLICY_JSON)/);
    if (oldMatch) {
      const nextMarker = content.indexOf('---', oldMatch.index + oldMatch[0].length);
      if (nextMarker > 0) {
        const start = oldMatch.index + oldMatch[0].length;
        const jsonStr = content.substring(start, nextMarker).trim();
        try {
          sections.dataPolicy = JSON.parse(jsonStr);
        } catch (e) {
          console.warn('⚠️ Failed to parse DATA_POLICY_JSON (fallback):', e.message);
        }
      }
    }
  } else {
    try {
      sections.dataPolicy = JSON.parse(dataPolicyMatch[1].trim());
    } catch (e) {
      console.warn('⚠️ Failed to parse DATA_POLICY_JSON:', e.message);
    }
  }
  
  const contentMatch = content.match(/---CONTENT---\s*([\s\S]*?)\s*---END---/);
  if (contentMatch) sections.content = contentMatch[1].trim();
  
  return sections;
}

// ===== QUALITY GATES =====

/**
 * Validate SEO fields (title, seoTitle, metaDescription, excerpt)
 */
function validateSeoFields(parsed) {
  const errors = [];
  
  if (!parsed.title || parsed.title.length > 60) {
    errors.push(`Title must be <= 60 characters (got ${parsed.title?.length || 0})`);
  }
  
  if (!parsed.seoTitle || parsed.seoTitle.length > 60) {
    errors.push(`SEO Title must be <= 60 characters (got ${parsed.seoTitle?.length || 0})`);
  }
  
  const metaDesc = parsed.metaDescription?.trim() || '';
  if (!metaDesc || metaDesc.length < 150 || metaDesc.length > 160) {
    errors.push(`Meta Description must be 150-160 characters (got ${metaDesc.length})`);
  }
  
  const excerpt = parsed.excerpt?.trim() || '';
  if (!excerpt || excerpt.length > 150) {
    errors.push(`Excerpt must be <= 150 characters (got ${excerpt.length})`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate article structure
 */
function validateArticleStructure(content, mode = 'city') {
  const errors = [];
  const warnings = [];
  
  // Check required sections - must be EXACT H2 headings (as specified in prompt)
  const requiredH2Headings = [
    { exact: '## TL;DR', flexible: false },
    { exact: '## Last Updated', flexible: false },
    { exact: '## Monthly Cost Breakdown', flexible: false },
    { exact: '## By Lifestyle', flexible: false },
    { exact: '## How to Save Money', flexible: true }, // Allow "in {city}" suffix
    { exact: '## Common Mistakes', flexible: false },
    { exact: '## Quick Checklist', flexible: false },
    { exact: '## FAQ', flexible: false },
    { exact: '## Sources & Methodology', flexible: false },
    { exact: '## Conclusion', flexible: false },
    { exact: '## Disclaimer', flexible: false }
  ];
  
  /**
   * Create regex for heading validation - tolerant to whitespace and small suffixes
   */
  function makeHeadingRegex(heading) {
    const base = heading.replace(/^##\s+/, '');
    const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Allow optional whitespace, optional colon/dash/emdash, and any text after
    return new RegExp(`^##\\s+${escaped}\\s*(?:[:—-].*)?$`, 'im');
  }
  
  requiredH2Headings.forEach(({ exact, flexible }) => {
    if (flexible) {
      // Allow variations (e.g., "## How to Save Money in {city}")
      // For city mode, require "in {city}" suffix; for others, just require base heading
      const base = exact.replace(/^##\s+/, '');
      const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      if (mode === 'city') {
        // For city mode, require "How to Save Money in {city}" (tolerant to city name variations)
        const regex = new RegExp(`^##\\s+${escaped}\\s+in\\s+[^\\n]+$`, 'im');
        if (!regex.test(content)) {
          errors.push(`Missing required section: ${exact} in {city} (required for city mode)`);
        }
      } else {
        // For other modes, just require base heading
        const regex = new RegExp(`^##\\s+${escaped}\\b.*$`, 'im');
        if (!regex.test(content)) {
          errors.push(`Missing required section: ${exact}`);
        }
      }
    } else {
      // Tolerant exact match (allows whitespace and small suffixes)
      const regex = makeHeadingRegex(exact);
      if (!regex.test(content)) {
        errors.push(`Missing required section: ${exact}`);
      }
    }
  });
  
  // Check H1 count (should be 0 in body, title is separate)
  const h1Matches = content.match(/^#\s+/gm);
  if (h1Matches && h1Matches.length > 0) {
    errors.push(`Found ${h1Matches.length} H1 in body (should be 0, title is separate)`);
  }
  
  // Check for markdown table (header + separator row)
  const hasTable = /\n\|.*\|\n\|[-:\s|]+\|\n/.test(content);
  if (!hasTable) {
    warnings.push('No markdown table found (recommended for cost breakdown)');
  }
  
  // Word count - different thresholds based on mode
  const wordCount = content.split(/\s+/).length;
  if (mode === 'comparison') {
    if (wordCount < 1600) {
      errors.push(`Word count too low: ${wordCount} (minimum 1,600 for comparison)`);
    } else if (wordCount > 2100) {
      warnings.push(`Word count high: ${wordCount} (target 1,600-2,100 for comparison)`);
    }
  } else {
    // city or budget mode
    if (wordCount < 1200) {
      errors.push(`Word count too low: ${wordCount} (minimum 1,200)`);
    } else if (wordCount > 1800) {
      warnings.push(`Word count high: ${wordCount} (target 1,200-1,800 for single city)`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// ===== IMAGE HANDLING =====

/**
 * Upload image to Sanity
 */
async function uploadImageToSanity(imageUrl, filename, alt) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const buffer = Buffer.from(await response.arrayBuffer());
    
    const asset = await sanityClient.assets.upload('image', buffer, {
      filename: `${filename}.jpg`,
      contentType: 'image/jpeg'
    });
    
    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id
      },
      alt: alt
    };
  } catch (error) {
    console.error(`❌ Error uploading image: ${error.message}`);
    return null;
  }
}

/**
 * Get Unsplash image with variety (8-12 results, random pick)
 */
async function getUnsplashImage(city, country, articleTitle, log) {
  if (!process.env.UNSPLASH_ACCESS_KEY) {
    log('   ⚠️ UNSPLASH_ACCESS_KEY not configured');
    return null;
  }
  
  // Diversified queries
  const queries = [
    `${city} skyline`,
    `${city} urban`,
    `${city} lifestyle`,
    `${city} cityscape`,
    `${country} city`,
    `${city} downtown`
  ];
  
  const query = queries[Math.floor(Math.random() * queries.length)];
  
  try {
    const photos = await searchPhotos(query, {
      perPage: CONFIG.unsplashResultsCount,
      orientation: 'landscape'
    });
    
    if (!photos || photos.length === 0) {
      return null;
    }
    
    // Filter out already used photos
    const available = photos.filter(photo => {
      if (!photo?.id) return false;
      // Check against used IDs (loaded from file and Sanity)
      if (usedUnsplashPhotoIds.has(photo.id)) return false;
      return true;
    });
    
    const pool = available.length > 0 ? available : photos;
    const selected = pool[Math.floor(Math.random() * pool.length)];
    
    if (selected) {
      log(`   ✅ Unsplash: ${selected.description || 'Image found'}`);
      log(`   📷 by ${selected.author?.name || 'Unknown'}`);
      
      if (selected.downloadLink) {
        await trackDownload(selected.downloadLink);
      }
      
      const imageAsset = await uploadImageToSanity(
        selected.url,
        `col-${city.toLowerCase().replace(/\s+/g, '-')}`,
        `${articleTitle} - Photo by ${selected.author?.name || 'Unsplash'} on Unsplash`
      );
      
      if (imageAsset) {
        // Store photo ID
        usedUnsplashPhotoIds.add(selected.id);
        usedUnsplashPhotoIdQueue.push(selected.id);
        if (usedUnsplashPhotoIdQueue.length > MAX_STORED_UNSPLASH_IDS) {
          const removed = usedUnsplashPhotoIdQueue.shift();
          if (removed) usedUnsplashPhotoIds.delete(removed);
        }
        // Save to file
        const dir = path.dirname(USED_UNSPLASH_IDS_FILE);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(USED_UNSPLASH_IDS_FILE, JSON.stringify({
          updatedAt: new Date().toISOString(),
          ids: usedUnsplashPhotoIdQueue
        }, null, 2), 'utf-8');
        
        return {
          imageAsset,
          photoId: selected.id,
          credit: selected.author
        };
      }
    }
    
    return null;
  } catch (error) {
    log(`   ⚠️ Unsplash error: ${error.message}`);
    return null;
  }
}

// ===== INTERNAL LINKS =====

/**
 * Find pillar post (Cost of Living Guide)
 */
async function findPillarPost() {
  try {
    const pillar = await sanityClient.fetch(`*[
      _type == "post" && 
      contentSeries == "cost-of-living" &&
      slug.current == "cost-of-living-guide-2026"
    ][0]{ _id }`);
    
    return pillar?._id || null;
  } catch (error) {
    console.error('❌ Error finding pillar post:', error.message);
    return null;
  }
}

/**
 * Find related posts (same country or same series)
 */
/**
 * Find related posts for cost-of-living articles
 * Excludes current post by citySlug + year, prioritizes same country, then recency
 * @param {string} citySlug - Current city slug
 * @param {string} countryCode - Current country code
 * @param {number} year - Current year
 * @param {string|null} currentPostId - Current post ID (if available, for exclusion)
 * @param {number} limit - Maximum number of related posts to return
 */
async function findRelatedPosts(citySlug, countryCode, year, currentPostId = null, limit = 2) {
  try {
    // Build exclusion conditions
    const excludeConditions = [
      '!(citySlug == $citySlug && year == $year)' // Exclude same city+year
    ];
    
    if (currentPostId) {
      excludeConditions.push('_id != $currentPostId');
    }
    
    const query = `*[
      _type == "post" && 
      contentSeries == "cost-of-living" &&
      status == "published" &&
      ${excludeConditions.join(' && ')}
    ] | order(
      countryCode == $countryCode desc,  // Same country first
      publishedAt desc                   // Then by recency
    ) [0...$limit]{
      _id,
      title,
      "slug": slug.current,
      countryCode,
      city,
      year
    }`;
    
    const params = {
      citySlug,
      countryCode,
      year,
      limit
    };
    
    if (currentPostId) {
      params.currentPostId = currentPostId;
    }
    
    const related = await sanityClient.fetch(query, params);
    
    return related || [];
  } catch (error) {
    console.error('❌ Error finding related posts:', error.message);
    return [];
  }
}

// ===== MAIN GENERATOR FUNCTION =====

/**
 * Generate cost-of-living article
 */
export async function generateCostOfLivingArticle(city, country, year, comparisonCity = null, mode = null) {
  const log = (msg) => console.log(msg);
  
  // Load Unsplash IDs from Sanity (async, do it once per generation)
  await loadUsedUnsplashIdsFromSanity();
  
  log(`\n🏙️ Generating Cost of Living article: ${city}, ${country} (${year})`);
  if (comparisonCity) {
    log(`   Comparison: ${city} vs ${comparisonCity}`);
  }
  
  // 1. Normalize fields
  const citySlug = normalizeCityName(city);
  const countryCode = normalizeCountryCode(country);
  const comparisonCitySlug = comparisonCity ? normalizeCityName(comparisonCity) : null;
  
  log(`   Normalized: citySlug="${citySlug}", countryCode="${countryCode}"`);
  
  // 2. Check for duplicates (fail closed in scheduled mode)
  log('🔍 Checking for duplicates...');
  const strictDedup = process.env.STRICT_DEDUP === '1' || process.env.STRICT_DEDUP === 'true';
  if (strictDedup) {
    log('   ⚠️ Strict deduplication mode enabled (fail closed)');
  }
  const duplicateCheck = await checkDuplicate(citySlug, countryCode, year, comparisonCitySlug, comparisonCity, strictDedup);
  
  if (duplicateCheck.isDuplicate) {
    const existing = duplicateCheck.existing;
    const errorMsg = `❌ Duplicate article already exists!

Existing article:
  - Title: ${existing.title}
  - Slug: ${existing.slug}
  - City: ${existing.city || 'N/A'}
  - Country: ${existing.country || 'N/A'}
  - Year: ${existing.year || 'N/A'}

To generate a new article, try:
  - Use a different year (e.g., ${year + 1})
  - Use a different mode (comparison or budget)
  - Or update the existing article instead

If you need to force generation anyway, you can modify the existing article's slug in Sanity first.`;
    throw new Error(errorMsg);
  }
  
  log('✅ No duplicates found');
  
  // 3. Generate content with Gemini
  log('🤖 Generating content with Gemini AI...');
  
  const prompt = getPromptTemplate(mode, city, country, year, comparisonCity);
  
  let articleContent;
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      log(`🔍 Generating content (attempt ${attempt}/${maxRetries})...`);
      articleContent = await generateText(prompt, {
        temperature: CONFIG.temperature,
        maxOutputTokens: CONFIG.maxTokens,
        model: CONFIG.geminiModel
      });
      
      log('✅ Content generated successfully');
      break;
    } catch (error) {
      // Check for specific Vertex AI API errors
      if (error.message && error.message.includes('SERVICE_DISABLED')) {
        const errorMsg = `❌ Vertex AI API is not enabled in your GCP project.
        
To fix this:
1. Go to: https://console.cloud.google.com/apis/api/aiplatform.googleapis.com/overview?project=${process.env.GCP_PROJECT_ID}
2. Click "Enable" to enable the Vertex AI API
3. Wait a few minutes for the API to propagate
4. Retry the workflow

Alternatively, you can enable it via gcloud CLI:
  gcloud services enable aiplatform.googleapis.com --project=${process.env.GCP_PROJECT_ID}`;
        throw new Error(errorMsg);
      }
      
      // Check if Vertex AI failed and we can fallback to Google AI Studio
      if (useVertexAI && process.env.GEMINI_API_KEY) {
        const isVertexError = error.message && (
          error.message.includes('SERVICE_DISABLED') ||
          error.message.includes('PERMISSION_DENIED') ||
          error.message.includes('Unable to authenticate') ||
          error.message.includes('credentials') ||
          error.message.includes('403')
        );
        
        if (isVertexError && attempt === 1) {
          log('⚠️ Vertex AI failed, falling back to Google AI Studio...');
          forceAiStudio = true; // Force AI Studio for all subsequent calls
          useVertexAI = false; // Switch to Google AI Studio
          genAI = null; // Reset to force re-initialization
          vertexAI = null; // Reset Vertex AI to prevent re-initialization attempts
          continue; // Retry with Google AI Studio
        }
      }
      
      if (attempt === maxRetries) {
        throw new Error(`Gemini generation failed after ${maxRetries} attempts: ${error.message}`);
      }
      log(`⏳ Retry ${attempt + 1}/${maxRetries}...`);
      await new Promise(r => setTimeout(r, 5000 * attempt));
    }
  }
  
  // 4. Parse content
  log('📝 Parsing content...');
  const parsed = parseGeneratedContent(articleContent);
  
  if (!parsed.title || !parsed.content) {
    throw new Error('Invalid content structure - missing title or content');
  }
  
  // 5. Validate SEO fields
  log('🔍 Validating SEO fields...');
  const seoValidation = validateSeoFields(parsed);
  if (!seoValidation.valid) {
    log(`⚠️ SEO validation failed: ${seoValidation.errors.join(', ')}`);
    log('   Attempting to fix SEO fields...');
    
    // Retry with fix prompt - ask ONLY for metadata sections, include original content to preserve it
    const seoFixPrompt = `You are fixing SEO metadata for a cost-of-living article. The original content is below.

ORIGINAL CONTENT (DO NOT CHANGE):
---CONTENT---
${parsed.content}
---END---

REQUIRED: Generate ONLY the following metadata sections with these exact constraints:
- TITLE: max 60 characters
- SEO_TITLE: max 60 characters  
- META_DESCRIPTION: EXACTLY 150-160 characters (count carefully)
- EXCERPT: max 150 characters

OUTPUT FORMAT (only these sections):
---TITLE---
[Display title, max 60 chars]

---SEO_TITLE---
[SEO title, max 60 chars]

---META_DESCRIPTION---
[150-160 characters exactly]

---EXCERPT---
[Max 150 characters]

---END---`;
    
    try {
      const ai = getGeminiAI();
      let fixedContent;
      
      if (useVertexAI) {
        let model;
        try {
          model = ai.getGenerativeModel({ model: CONFIG.geminiModel });
        } catch (modelError) {
          if (CONFIG.geminiModel === 'gemini-2.5-pro') {
            model = ai.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
          } else {
            throw modelError;
          }
        }
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: seoFixPrompt }] }],
          generationConfig: {
            temperature: 0.3, // Lower temperature for more precise metadata
            maxOutputTokens: 500 // Only need metadata, not full content
          }
        });
        // Use multi-part extraction (same logic as generateText)
        fixedContent = result?.response?.candidates?.[0]?.content?.parts
          ?.map(p => p.text)
          .filter(Boolean)
          .join('\n')
          .trim();
        
        if (!fixedContent) {
          throw new Error('Vertex AI returned empty metadata (possibly blocked by safety filters)');
        }
      } else {
        const model = ai.getGenerativeModel({ model: CONFIG.geminiModel });
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: seoFixPrompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500 // Only need metadata, not full content
          }
        });
        fixedContent = result.response.text();
      }
      
      // Parse only metadata sections from fixed content
      const titleMatch = fixedContent.match(/---TITLE---\s*([\s\S]*?)\s*---SEO_TITLE---/);
      if (titleMatch) parsed.title = titleMatch[1].trim();
      
      const seoTitleMatch = fixedContent.match(/---SEO_TITLE---\s*([\s\S]*?)\s*---META_DESCRIPTION---/);
      if (seoTitleMatch) parsed.seoTitle = seoTitleMatch[1].trim();
      
      const metaDescMatch = fixedContent.match(/---META_DESCRIPTION---\s*([\s\S]*?)\s*---EXCERPT---/);
      if (metaDescMatch) parsed.metaDescription = metaDescMatch[1].trim();
      
      const excerptMatch = fixedContent.match(/---EXCERPT---\s*([\s\S]*?)\s*---END---/);
      if (excerptMatch) {
        parsed.excerpt = excerptMatch[1].trim();
        // Truncate to 150 chars if too long
        if (parsed.excerpt.length > 150) {
          parsed.excerpt = parsed.excerpt.substring(0, 147) + '...';
        }
      }
      
      // Re-validate
      const fixedSeoValidation = validateSeoFields(parsed);
      if (fixedSeoValidation.valid) {
        log('✅ SEO fields fixed on retry');
      } else {
        throw new Error(`SEO validation failed after retry: ${fixedSeoValidation.errors.join(', ')}`);
      }
    } catch (error) {
      throw new Error(`SEO validation failed: ${seoValidation.errors.join(', ')}. Retry also failed: ${error.message}`);
    }
  } else {
    log('✅ SEO fields validated');
  }
  
  // 6. Validate cost data
  if (parsed.costData) {
    log('💰 Validating cost data...');
    const validation = validateCostData(parsed.costData);
    if (!validation.valid) {
      throw new Error(`Cost data validation failed: ${validation.error}`);
    }
    parsed.costData = validation.costData;
    if (validation.warnings.length > 0) {
      log(`   ⚠️ Warnings: ${validation.warnings.join(', ')}`);
    }
    
    // Add currency fields - costData should already have currency from prompt (localCurrency)
    // But ensure we have both localCurrency and displayCurrency for UI
    // Normalize currency: accept only valid ISO codes [A-Z]{3}, fallback to inferred or USD
    const rawCurrency = parsed.costData?.currency;
    const normalizedCurrency = normalizeCurrency(rawCurrency) || inferLocalCurrency(countryCode) || 'USD';
    
    parsed.costData.currency = normalizedCurrency;
    parsed.costData.localCurrency = normalizedCurrency;
    parsed.costData.displayCurrency = normalizedCurrency;
    
    parsed.costData.fxNote =
      normalizedCurrency !== 'USD'
        ? `All amounts are in ${normalizedCurrency}. USD equivalents are approximate and vary with exchange rates.`
        : 'Ranges are in USD.';
  }
  
  // 7. Validate article structure
  log('✅ Validating article structure...');
  const structureValidation = validateArticleStructure(parsed.content, mode || 'city');
  if (!structureValidation.valid) {
    // Single retry with fix prompt
    log('⚠️ Structure validation failed, retrying with fix prompt...');
    const fixPrompt = `${prompt}\n\nIMPORTANT: The previous output was missing required sections. Please regenerate with ALL required sections as H2 headings (##): TL;DR, Last Updated, Monthly Cost Breakdown, By Lifestyle, How to Save Money, Common Mistakes, Quick Checklist, FAQ, Sources & Methodology, Conclusion, Disclaimer.`;
    
    try {
      // Use generateText abstraction for consistency
      const fixedContent = await generateText(fixPrompt, {
        temperature: CONFIG.temperature,
        maxOutputTokens: CONFIG.maxTokens,
        model: CONFIG.geminiModel
      });
      const fixedParsed = parseGeneratedContent(fixedContent);
      const fixedValidation = validateArticleStructure(fixedParsed.content, mode || 'city');
      if (fixedValidation.valid) {
        Object.assign(parsed, fixedParsed);
        log('✅ Structure fixed on retry');
      } else {
        throw new Error(`Structure validation failed after retry: ${fixedValidation.errors.join(', ')}`);
      }
    } catch (error) {
      throw new Error(`Structure validation failed: ${structureValidation.errors.join(', ')}`);
    }
  }
  
  // 8. Generate deterministic slug
  log('🔗 Generating slug...');
  const baseSlug = generateDeterministicSlug(mode || 'city', citySlug, comparisonCitySlug, year);
  const slug = await ensureUniqueSlug(baseSlug);
  log(`   Slug: ${slug}`);
  
  // 9. Get image
  log('📸 Getting image...');
  const imageResult = await getUnsplashImage(city, country, parsed.title, log);
  
  // 10. Get author and category (needed before creating document for related posts)
  const authorId = await getDefaultAuthorId();
  if (!authorId) {
    throw new Error('No author found in Sanity');
  }
  
  const categoryId = await getCategoryIdBySlug('cost-of-living');
  if (!categoryId) {
    throw new Error('Cost of Living category not found. Create it first.');
  }
  
  // 11. Convert markdown to block content
  log('📄 Converting markdown to blocks...');
  const bodyBlocks = markdownToBlockContent(parsed.content);
  
  // 11b. Validate no H1 in blocks
  const hasH1 = bodyBlocks.some(block => block._type === 'block' && block.style === 'h1');
  if (hasH1) {
    log('⚠️ Found H1 in body blocks, converting to H2...');
    bodyBlocks.forEach(block => {
      if (block._type === 'block' && block.style === 'h1') {
        block.style = 'h2';
      }
    });
  }
  
  // 12. Find internal links (after we have slug, before creating document)
  log('🔗 Finding internal links...');
  const pillarId = await findPillarPost();
  if (!pillarId) {
    throw new Error('Pillar post (cost-of-living-guide-2026) not found. Create it first.');
  }
  
  // Find related posts (exclude current by citySlug+year, will exclude by _id after creation)
  const relatedPosts = await findRelatedPosts(citySlug, countryCode, year, null, 2);
  log(`   Found pillar: ${pillarId}`);
  log(`   Found ${relatedPosts.length} related posts`);
  
  // 13. Calculate reading time
  const wordCount = parsed.content.split(/\s+/).length;
  const readingTime = Math.max(
    CONFIG.readingTimeMin,
    Math.min(CONFIG.readingTimeMax, Math.ceil(wordCount / 200))
  );
  
  const initialLikes = Math.floor(
    Math.random() * (CONFIG.initialLikesMax - CONFIG.initialLikesMin + 1)
  ) + CONFIG.initialLikesMin;
  
  // 14. Create Sanity document
  const sanityDocument = {
    _type: 'post',
    title: parsed.title,
    slug: { current: slug },
    excerpt: parsed.excerpt || parsed.metaDescription,
    author: { _type: 'reference', _ref: authorId },
    categories: [{ _type: 'reference', _ref: categoryId }],
    body: bodyBlocks,
    readingTime,
    initialLikes,
    seoTitle: parsed.seoTitle || parsed.title,
    seoDescription: parsed.metaDescription || parsed.excerpt,
    seoKeywords: parsed.keywords,
    status: 'published',
    publishedAt: CONFIG.publishImmediately ? new Date().toISOString() : null,
    contentSeries: 'cost-of-living',
    primaryKeyword: parsed.keywords[0] || `${city} cost of living ${year}`,
    city: city,
    citySlug: citySlug,
    country: country,
    countryCode: countryCode,
    year: year,
    costOfLivingData: parsed.costData,
    dataPolicy: parsed.dataPolicy,
    internalLinks: {
      pillarRef: { _type: 'reference', _ref: pillarId },
      relatedRefs: relatedPosts.map(p => ({ _type: 'reference', _ref: p._id }))
    }
  };
  
  if (comparisonCity) {
    sanityDocument.comparisonCity = comparisonCity;
    sanityDocument.comparisonCitySlug = comparisonCitySlug;
  }
  
  if (imageResult) {
    sanityDocument.mainImage = imageResult.imageAsset;
    sanityDocument.unsplashPhotoId = imageResult.photoId;
  }
  
  // 14. Validate document
  const validation = validatePostDocument(sanityDocument);
  if (!validation.valid) {
    throw new Error(`Document validation failed: ${validation.errors.join(', ')}`);
  }
  
  // 15. Create in Sanity (skip if dry run)
  const dryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
  
  if (dryRun) {
    log('🔍 DRY RUN: Skipping Sanity creation');
    log(`\n✅✅✅ DRY RUN VALIDATION PASSED! ✅✅✅`);
    log(`📝 Title: ${parsed.title}`);
    log(`🔗 Slug: ${slug}`);
    log(`📊 Words: ~${wordCount}`);
    log(`⏱️ Reading: ${readingTime} min`);
    log(`💰 Cost data: ${parsed.costData ? 'Validated' : 'Missing'}`);
    log(`📋 Structure: All required sections present`);
    
    return {
      success: true,
      articleId: 'dry-run',
      slug: slug,
      title: parsed.title
    };
  }
  
  log('💾 Creating article in Sanity...');
  const created = await sanityClient.create(sanityDocument);
  
  log(`\n✅✅✅ ARTICLE CREATED SUCCESSFULLY! ✅✅✅`);
  log(`📝 Title: ${parsed.title}`);
  log(`🔗 Slug: ${slug}`);
  log(`📊 Words: ~${wordCount}`);
  log(`⏱️ Reading: ${readingTime} min`);
  log(`🆔 ID: ${created._id}`);
  
  // 17. Update related posts now that we have the document ID (exclude current) - non-blocking
  if (relatedPosts.length > 0) {
    log('🔄 Updating related posts (excluding current)...');
    try {
      const updatedRelatedPosts = await findRelatedPosts(citySlug, countryCode, year, created._id, 2);
      if (updatedRelatedPosts.length !== relatedPosts.length || updatedRelatedPosts.some((p, i) => p._id !== relatedPosts[i]?._id)) {
        // Update internal links if different
        await sanityClient.patch(created._id).set({
          'internalLinks.relatedRefs': updatedRelatedPosts.map(p => ({ _type: 'reference', _ref: p._id }))
        }).commit();
        log(`   Updated related posts: ${updatedRelatedPosts.length}`);
      }
    } catch (error) {
      // Non-blocking: log warning but don't fail the entire generation
      console.warn(`⚠️ Failed to update related posts (non-blocking): ${error.message}`);
      log(`   ⚠️ Related posts update skipped (non-critical)`);
    }
  }
  
  // 18. YouTube picker (if available, skip in dry run)
  if (process.env.YOUTUBE_API_KEY && !dryRun) {
    log('🎥 Starting YouTube picker...');
    try {
      // Pass context as arguments: slug, city, country, year, mode
      const { stdout, stderr } = await execFileAsync('node', [
        path.join(__dirname, 'youtube-video-picker.js'),
        slug,
        city,
        country,
        year.toString(),
        mode || 'city'
      ], {
        env: {
          ...process.env,
          YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
          SANITY_API_TOKEN: process.env.SANITY_API_TOKEN,
          GEMINI_API_KEY: process.env.GEMINI_API_KEY,
          GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
          GCP_LOCATION: process.env.GCP_LOCATION,
          GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
          NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        },
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });
      
      // Show YouTube picker output
      if (stdout) {
        const lines = stdout.trim().split('\n');
        lines.forEach(line => {
          if (line.includes('🏆') || line.includes('⚠️') || line.includes('❌') || line.includes('✅')) {
            log('   ' + line);
          }
        });
      }
      if (stderr) console.warn('   YouTube stderr:', stderr);
      log('✅ YouTube picker completed');
    } catch (err) {
      console.warn('⚠️ YouTube picker failed:', err.message);
      if (err.stdout) console.log('   stdout:', err.stdout.slice(-500));
      if (err.stderr) console.log('   stderr:', err.stderr.slice(-500));
    }
  }
  
  return {
    success: true,
    articleId: created._id,
    slug: slug,
    title: parsed.title
  };
}

// CLI support
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const city = args[0];
  const country = args[1];
  const year = parseInt(args[2]) || 2026;
  const comparisonCity = (args[3] && args[3].trim() !== '') ? args[3] : null;
  const mode = (args[4] && args[4].trim() !== '') ? args[4] : null;
  const dryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
  
  if (!city || !country) {
    console.error('Usage: node ai-costofliving-generator.js <city> <country> [year] [comparisonCity] [mode]');
    console.error('       Set DRY_RUN=1 environment variable for dry run mode');
    process.exit(1);
  }
  
  if (dryRun) {
    console.log('\n🔍 DRY RUN MODE - Validating only, no article will be created\n');
  }
  
  generateCostOfLivingArticle(city, country, year, comparisonCity, mode)
    .then(result => {
      if (dryRun) {
        console.log('\n✅ Dry run validation complete!');
        console.log('   All checks passed. Article would be created with:');
        console.log(`   - Title: ${result.title}`);
        console.log(`   - Slug: ${result.slug}`);
      } else {
        console.log('\n✅ Generation complete!');
      }
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Generation failed:', error.message);
      if (dryRun) {
        console.error('   Dry run validation failed - fix issues before generating');
      }
      process.exit(1);
    });
}
