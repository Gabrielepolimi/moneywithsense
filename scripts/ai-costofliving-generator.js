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
    const posts = await sanityClient.fetch(`*[_type == "post" && contentSeries == "cost-of-living" && defined(unsplashPhotoId)]{
      unsplashPhotoId
    }`);
    posts.forEach(post => {
      if (post.unsplashPhotoId && !usedUnsplashPhotoIds.has(post.unsplashPhotoId)) {
        usedUnsplashPhotoIds.add(post.unsplashPhotoId);
        usedUnsplashPhotoIdQueue.push(post.unsplashPhotoId);
      }
    });
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

function getGeminiAI() {
  // Check if Vertex AI is configured
  if (process.env.GCP_PROJECT_ID && process.env.GCP_LOCATION) {
    useVertexAI = true;
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
        console.log(`✅ Vertex AI initialized: project=${process.env.GCP_PROJECT_ID}, location=${process.env.GCP_LOCATION}`);
      } catch (error) {
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

// ===== DUPLICATE CHECK =====

/**
 * Check for duplicate cost-of-living articles using normalized fields
 */
async function checkDuplicate(citySlug, countryCode, year, comparisonCitySlug = null) {
  try {
    const query = `*[
      _type == "post" && 
      contentSeries == "cost-of-living" &&
      citySlug == $citySlug && 
      countryCode == $countryCode && 
      year == $year &&
      (!defined($comparisonCitySlug) || comparisonCitySlug == $comparisonCitySlug)
    ]{
      _id,
      title,
      "slug": slug.current,
      city,
      country,
      year,
      comparisonCity
    }`;
    
    const existing = await sanityClient.fetch(query, {
      citySlug,
      countryCode,
      year,
      comparisonCitySlug: comparisonCitySlug || null
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
    // On error, allow proceeding (fail open)
    return { isDuplicate: false };
  }
}

// ===== COST DATA VALIDATION =====

/**
 * Round cost value to nearest 10 or 25
 */
function roundCost(value) {
  if (typeof value !== 'number' || isNaN(value)) return 0;
  // Try rounding to nearest 25 first
  const rounded25 = Math.round(value / 25) * 25;
  // If difference is small, use 25-step
  if (Math.abs(value - rounded25) <= 12.5) {
    return rounded25;
  }
  // Otherwise round to nearest 10
  return Math.round(value / 10) * 10;
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
    if (rounded[`${cat}Min`]) {
      rounded[`${cat}Min`] = roundCost(rounded[`${cat}Min`]);
    }
    if (rounded[`${cat}Max`]) {
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
  const totalMin = rounded.totalMin || 0;
  const totalMax = rounded.totalMax || 0;
  
  const minDiff = Math.abs(totalMin - calculatedMin);
  const maxDiff = Math.abs(totalMax - calculatedMax);
  const minTolerance = calculatedMin * CONFIG.totalCoherenceTolerance;
  const maxTolerance = calculatedMax * CONFIG.totalCoherenceTolerance;
  
  // Fix totals if out of tolerance
  if (minDiff > minTolerance) {
    rounded.totalMin = roundCost(calculatedMin);
  }
  if (maxDiff > maxTolerance) {
    rounded.totalMax = roundCost(calculatedMax);
  }
  
  return {
    valid: true,
    costData: rounded,
    warnings: minDiff > minTolerance || maxDiff > maxTolerance ? ['Totals adjusted to match category sums'] : []
  };
}

// ===== PROMPT TEMPLATES =====

const PROMPT_TEMPLATE_SINGLE_CITY = `You are a cost-of-living researcher writing for MoneyWithSense.com.

CITY: {city}
COUNTRY: {country}
YEAR: {year}

=== WRITING STYLE ===
- Simple, global English (readable by US, UK, AU, CA, EU audiences)
- No heavy American slang
- Short sentences (max 20 words average)
- Practical, calm, trustworthy voice
- Never clickbait or sensationalist
- Use ranges for costs, never fabricated precise numbers

=== STRICT REQUIREMENTS ===

1) TITLE: max 60 characters, SEO-friendly
2) SEO_TITLE: max 60 characters, can differ from display title
3) META_DESCRIPTION: exactly 150-160 characters for search engines
4) EXCERPT: 200-300 characters for UI display (can be longer than meta description)

5) CONTENT STRUCTURE (must follow this exact order):
   
   a) TL;DR / In Brief
      - 3-5 bullet points summarizing key costs
      - Quick answer: "You'll need approximately $X-$Y per month"
   
   b) Last Updated
      - "Last updated: [Month YYYY]"
   
   c) Monthly Cost Breakdown
      - Markdown table with categories and ranges
      - Include: Rent (city center/outside), Utilities, Groceries, Transport, Eating Out, Internet/Phone, Entertainment
      - Show Min/Max for each category
   
   d) By Lifestyle (Lifestyle Scenarios)
      - Single person budget
      - Couple budget
      - Family budget (if applicable)
      - Digital nomad budget (if applicable)
   
   e) How to Save Money in {city}
      - 5-8 practical tips specific to the city
      - Local insights (public transport, markets, etc.)
   
   f) Common Mistakes
      - 3-5 typical errors people make when budgeting for {city}
      - Brief explanation of why each is problematic
   
   g) Quick Checklist
      - Bullet list, 5-8 items
      - Easy to save or screenshot
   
   h) FAQ
      - 3-6 common questions with brief answers
      - Use ### for each question
      - Example: ### Is {city} expensive?
   
   i) Sources & Methodology
      - Explain how estimates are built (typical ranges, public price ranges, rental ranges)
      - Pricing variability: prices vary by neighborhood, lifestyle choices, etc.
      - How to validate locally: suggest checking local rental sites, grocery stores, expat forums
      - No fake citations - be honest about methodology
   
   j) Conclusion
      - Practical summary
      - Soft call-to-action
   
   k) Disclaimer (required at end)
      - "This content is for informational purposes only and does not constitute financial advice. Always consult a qualified professional for personalized guidance."

6) INTERNAL LINKS (required):
   - Include 1 link to pillar guide: [Cost of Living Guide](/guides/cost-of-living-guide-2026)
   - Include 2 links to related articles: [anchor text](/articles/{article-slug})
   - Use natural anchor text, not exact match keywords

7) LENGTH: 1,200-1,800 words (minimum 1,200, never below 1,000)

8) SEO & FORMATTING:
   - Include primary keyword in first 120 words
   - Use 4-6 related keywords naturally throughout
   - Use proper markdown syntax: ## for H2, ### for H3
   - NEVER write "H2:" or "H3:" as text!

=== OUTPUT FORMAT (EXACTLY) ===

---TITLE---
[Title here, max 60 chars]
---SEO_TITLE---
[SEO-optimized title, max 60 chars]
---META_DESCRIPTION---
[Meta description, exactly 150-160 chars]
---EXCERPT---
[Excerpt for UI, 200-300 chars]
---KEYWORDS---
[primary keyword, related keyword 1, related keyword 2, ...]
---COST_DATA_JSON---
{
  "currency": "USD",
  "timeUnit": "monthly",
  "householdType": "single",
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
---DATA_POLICY_JSON---
{
  "dataSources": ["Public rental listings", "Consumer price indices", "Local cost databases"],
  "assumptions": ["Based on 1-bedroom apartment in city center", "Excludes luxury items", "Assumes moderate lifestyle"],
  "lastVerifiedAt": "2026-01-18T00:00:00Z"
}
---CONTENT---
[Full markdown article with all required sections]
---END---

Write original, practical, and helpful content. Focus on real, actionable information that helps people estimate their monthly budget.`;

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
4) EXCERPT: 200-300 characters

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

6) INTERNAL LINKS: 1 pillar + 2 related

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
4) EXCERPT: 200-300 characters

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

6) INTERNAL LINKS: 1 pillar + 2 related

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
  
  return template
    .replace(/{city}/g, city)
    .replace(/{country}/g, country)
    .replace(/{year}/g, year.toString())
    .replace(/{comparisonCity}/g, comparisonCity || '');
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
  
  // Extract sections
  const titleMatch = content.match(/---TITLE---\s*([\s\S]*?)\s*---/);
  if (titleMatch) sections.title = titleMatch[1].trim();
  
  const seoTitleMatch = content.match(/---SEO_TITLE---\s*([\s\S]*?)\s*---/);
  if (seoTitleMatch) sections.seoTitle = seoTitleMatch[1].trim();
  
  const metaDescMatch = content.match(/---META_DESCRIPTION---\s*([\s\S]*?)\s*---/);
  if (metaDescMatch) sections.metaDescription = metaDescMatch[1].trim();
  
  const excerptMatch = content.match(/---EXCERPT---\s*([\s\S]*?)\s*---/);
  if (excerptMatch) sections.excerpt = excerptMatch[1].trim();
  
  const keywordsMatch = content.match(/---KEYWORDS---\s*([\s\S]*?)\s*---/);
  if (keywordsMatch) {
    sections.keywords = keywordsMatch[1].split(',').map(k => k.trim()).filter(Boolean);
  }
  
  const costDataMatch = content.match(/---COST_DATA_JSON---\s*([\s\S]*?)\s*---/);
  if (costDataMatch) {
    try {
      sections.costData = JSON.parse(costDataMatch[1].trim());
    } catch (e) {
      console.warn('⚠️ Failed to parse COST_DATA_JSON:', e.message);
    }
  }
  
  const dataPolicyMatch = content.match(/---DATA_POLICY_JSON---\s*([\s\S]*?)\s*---/);
  if (dataPolicyMatch) {
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
 * Validate article structure
 */
function validateArticleStructure(content) {
  const errors = [];
  const warnings = [];
  
  // Check required sections
  const requiredSections = [
    { patterns: ['in brief', 'tldr', 'tl;dr'], name: 'TL;DR' },
    { patterns: ['last updated'], name: 'Last Updated' },
    { patterns: ['monthly cost breakdown', 'cost breakdown'], name: 'Monthly Cost Breakdown' },
    { patterns: ['by lifestyle', 'lifestyle scenarios'], name: 'Lifestyle Scenarios' },
    { patterns: ['how to save money'], name: 'How to Save Money' },
    { patterns: ['common mistakes'], name: 'Common Mistakes' },
    { patterns: ['quick checklist', 'checklist'], name: 'Quick Checklist' },
    { patterns: ['faq', 'frequently asked'], name: 'FAQ' },
    { patterns: ['sources & methodology', 'sources and methodology', 'methodology'], name: 'Sources & Methodology' }
  ];
  
  const contentLower = content.toLowerCase();
  
  requiredSections.forEach(section => {
    const found = section.patterns.some(pattern => contentLower.includes(pattern));
    if (!found) {
      errors.push(`Missing required section: ${section.name}`);
    }
  });
  
  // Check H1 count (should be 0 in body, title is separate)
  const h1Matches = content.match(/^#\s+/gm);
  if (h1Matches && h1Matches.length > 0) {
    errors.push(`Found ${h1Matches.length} H1 in body (should be 0, title is separate)`);
  }
  
  // Check for markdown table
  const tableMatches = content.match(/\|.*\|/);
  if (!tableMatches) {
      warnings.push('No markdown table found (recommended for cost breakdown)');
  }
  
  // Word count
  const wordCount = content.split(/\s+/).length;
  if (wordCount < 1200) {
    errors.push(`Word count too low: ${wordCount} (minimum 1,200)`);
  } else if (wordCount > 2100) {
    warnings.push(`Word count high: ${wordCount} (target 1,200-1,800 for single, 1,600-2,100 for comparison)`);
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
async function findRelatedPosts(citySlug, countryCode, limit = 2) {
  try {
    const related = await sanityClient.fetch(`*[
      _type == "post" && 
      contentSeries == "cost-of-living" &&
      status == "published" &&
      slug.current != $citySlug &&
      (countryCode == $countryCode || defined(countryCode))
    ] | order(publishedAt desc) [0...$limit]{
      _id,
      title,
      "slug": slug.current,
      countryCode
    }`, {
      citySlug,
      countryCode,
      limit
    });
    
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
  
  // 2. Check for duplicates
  log('🔍 Checking for duplicates...');
  const duplicateCheck = await checkDuplicate(citySlug, countryCode, year, comparisonCitySlug);
  
  if (duplicateCheck.isDuplicate) {
    throw new Error(`Duplicate article exists: ${duplicateCheck.existing.title} (${duplicateCheck.existing.slug})`);
  }
  
  log('✅ No duplicates found');
  
  // 3. Generate content with Gemini
  log('🤖 Generating content with Gemini AI...');
  
  const prompt = getPromptTemplate(mode, city, country, year, comparisonCity);
  
  let articleContent;
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const ai = getGeminiAI();
      
      let result;
      if (useVertexAI) {
        // Vertex AI - try gemini-2.5-pro, fallback to gemini-2.5-flash-lite if not available
        let modelName = CONFIG.geminiModel;
        let model;
        
        try {
          log(`🔍 Trying model: ${modelName}`);
          model = ai.getGenerativeModel({ model: modelName });
        } catch (modelError) {
          // If model not found, try fallback
          if (modelName === 'gemini-2.5-pro') {
            log(`⚠️ gemini-2.5-pro not available, trying gemini-2.5-flash-lite...`);
            modelName = 'gemini-2.5-flash-lite';
            try {
              model = ai.getGenerativeModel({ model: modelName });
            } catch (fallbackError) {
              throw new Error(`Both gemini-2.5-pro and gemini-2.5-flash-lite failed: ${fallbackError.message}`);
            }
          } else {
            throw modelError;
          }
        }
        
        log(`✅ Using model: ${modelName}`);
        result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: CONFIG.temperature,
            maxOutputTokens: CONFIG.maxTokens
          }
        });
        
        if (!result.response || !result.response.candidates || result.response.candidates.length === 0) {
          throw new Error('Vertex AI returned empty response');
        }
        
        articleContent = result.response.candidates[0].content.parts[0].text;
        if (modelName !== CONFIG.geminiModel) {
          log(`✅ Using ${modelName} (${CONFIG.geminiModel} not available)`);
        }
      } else {
        // Google AI Studio API
        const model = ai.getGenerativeModel({ model: CONFIG.geminiModel });
        result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: CONFIG.temperature,
            maxOutputTokens: CONFIG.maxTokens
          }
        });
        articleContent = result.response.text();
      }
      
      log('✅ Content generated successfully');
      break;
    } catch (error) {
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
  
  // 5. Validate cost data
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
  }
  
  // 6. Validate article structure
  log('✅ Validating article structure...');
  const structureValidation = validateArticleStructure(parsed.content);
  if (!structureValidation.valid) {
    // Single retry with fix prompt
    log('⚠️ Structure validation failed, retrying with fix prompt...');
    const fixPrompt = `${prompt}\n\nIMPORTANT: The previous output was missing required sections. Please regenerate with ALL required sections: TL;DR, Last Updated, Monthly Cost Breakdown, By Lifestyle, How to Save Money, Common Mistakes, Quick Checklist, FAQ, Sources & Methodology.`;
    
    try {
      const ai = getGeminiAI();
      
      let fixedContent;
      if (useVertexAI) {
        // Vertex AI - try gemini-2.5-pro, fallback to gemini-2.5-flash-lite
        let modelName = CONFIG.geminiModel;
        let model;
        
        try {
          model = ai.getGenerativeModel({ model: modelName });
        } catch (modelError) {
          if (modelName === 'gemini-2.5-pro') {
            modelName = 'gemini-2.5-flash-lite';
            model = ai.getGenerativeModel({ model: modelName });
          } else {
            throw modelError;
          }
        }
        
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: fixPrompt }] }],
          generationConfig: {
            temperature: CONFIG.temperature,
            maxOutputTokens: CONFIG.maxTokens
          }
        });
        fixedContent = result.response.candidates[0].content.parts[0].text;
      } else {
        // Google AI Studio API
        const model = ai.getGenerativeModel({ model: CONFIG.geminiModel });
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: fixPrompt }] }],
          generationConfig: {
            temperature: CONFIG.temperature,
            maxOutputTokens: CONFIG.maxTokens
          }
        });
        fixedContent = result.response.text();
      }
      const fixedParsed = parseGeneratedContent(fixedContent);
      const fixedValidation = validateArticleStructure(fixedParsed.content);
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
  
  // 7. Generate slug
  const primaryKeyword = parsed.keywords[0] || `${city} cost of living ${year}`;
  const slug = slugify(primaryKeyword);
  
  // 8. Get image
  log('📸 Getting image...');
  const imageResult = await getUnsplashImage(city, country, parsed.title, log);
  
  // 9. Find internal links
  log('🔗 Finding internal links...');
  const pillarId = await findPillarPost();
  if (!pillarId) {
    throw new Error('Pillar post (cost-of-living-guide-2026) not found. Create it first.');
  }
  
  const relatedPosts = await findRelatedPosts(citySlug, countryCode, 2);
  log(`   Found pillar: ${pillarId}`);
  log(`   Found ${relatedPosts.length} related posts`);
  
  // 10. Get author and category
  const authorId = await getDefaultAuthorId();
  if (!authorId) {
    throw new Error('No author found in Sanity');
  }
  
  const categoryId = await getCategoryIdBySlug('cost-of-living');
  if (!categoryId) {
    throw new Error('Cost of Living category not found. Create it first.');
  }
  
  // 11. Convert markdown to block content
  const bodyBlocks = markdownToBlockContent(parsed.content);
  
  // 12. Calculate reading time
  const wordCount = parsed.content.split(/\s+/).length;
  const readingTime = Math.max(
    CONFIG.readingTimeMin,
    Math.min(CONFIG.readingTimeMax, Math.ceil(wordCount / 200))
  );
  
  const initialLikes = Math.floor(
    Math.random() * (CONFIG.initialLikesMax - CONFIG.initialLikesMin + 1)
  ) + CONFIG.initialLikesMin;
  
  // 13. Create Sanity document
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
    primaryKeyword: primaryKeyword,
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
  
  // 16. YouTube picker (if available, skip in dry run)
  if (process.env.YOUTUBE_API_KEY && !dryRun) {
    log('🎥 Starting YouTube picker...');
    try {
      const { stdout, stderr } = await execFileAsync('node', [
        path.join(__dirname, 'youtube-video-picker.js'),
        slug
      ], {
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
