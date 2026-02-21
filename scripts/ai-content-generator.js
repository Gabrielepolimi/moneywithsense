/**
 * 🤖 MoneyWithSense - AI Content Generator con Unsplash + Fallback
 *
 * Genera articoli completi usando Gemini AI con immagini da Unsplash
 * e fallback su cartella locale se Unsplash non disponibile
 *
 * Funzionalità:
 * - Generazione testo con Google Gemini
 * - Immagine principale da Unsplash (con fallback locale)
 * - SEO ottimizzato automaticamente
 * - Pubblicazione diretta su Sanity CMS
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { VertexAI } from '@google-cloud/vertexai';
import { createClient } from '@sanity/client';
import { searchPhotos, trackDownload } from './unsplash-service.js';
import {
  getDefaultAuthorId,
  getCategoryIdBySlug,
  articleExistsBySlug,
  getArticleSlugsForInternalLinks,
  markdownToBlockContent,
  slugify,
  validatePostDocument
} from './sanity-helpers.js';
import { checkSemanticDuplicate } from './semantic-duplicate-checker.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Per ottenere __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== CONFIGURAZIONE =====
const CONFIG = {
  // Vertex AI: gemini-2.5-pro (fallback 2.5-flash-lite). Google AI Studio fallback: gemini-1.5-flash
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-pro',
  maxTokens: 8000,
  temperature: 0.7,
  publishImmediately: true,
  readingTimeMin: 5,
  readingTimeMax: 12,
  initialLikesMin: 0,
  initialLikesMax: 0,
  // Cartella immagini fallback (finance)
  fallbackImagesDir: path.join(__dirname, '..', 'public', 'images', 'fallback-finance'),
  // Retry config per Unsplash
  unsplashMaxRetries: 2,
  unsplashRetryDelay: 2000 // 2 secondi
};

const USED_UNSPLASH_IDS_FILE = path.join(__dirname, '..', 'data', 'unsplash-used.json');
const MAX_STORED_UNSPLASH_IDS = 300;
const usedUnsplashPhotoIds = new Set();
let usedUnsplashPhotoIdQueue = [];

function loadUsedUnsplashIds() {
  try {
    if (!fs.existsSync(USED_UNSPLASH_IDS_FILE)) {
      return;
    }
    const raw = fs.readFileSync(USED_UNSPLASH_IDS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    const ids = Array.isArray(parsed) ? parsed : parsed.ids;
    if (!Array.isArray(ids)) return;

    const trimmed = ids.slice(-MAX_STORED_UNSPLASH_IDS);
    usedUnsplashPhotoIdQueue = [];
    usedUnsplashPhotoIds.clear();
    trimmed.forEach((id) => {
      if (id && !usedUnsplashPhotoIds.has(id)) {
        usedUnsplashPhotoIds.add(id);
        usedUnsplashPhotoIdQueue.push(id);
      }
    });
  } catch (error) {
    console.warn(`⚠️ Impossibile caricare unsplash-used.json: ${error.message}`);
  }
}

function saveUsedUnsplashIds() {
  try {
    const dir = path.dirname(USED_UNSPLASH_IDS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const payload = {
      updatedAt: new Date().toISOString(),
      ids: usedUnsplashPhotoIdQueue
    };
    fs.writeFileSync(USED_UNSPLASH_IDS_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (error) {
    console.warn(`⚠️ Impossibile salvare unsplash-used.json: ${error.message}`);
  }
}

function rememberUnsplashId(id) {
  if (!id || usedUnsplashPhotoIds.has(id)) return;
  usedUnsplashPhotoIds.add(id);
  usedUnsplashPhotoIdQueue.push(id);
  if (usedUnsplashPhotoIdQueue.length > MAX_STORED_UNSPLASH_IDS) {
    const removed = usedUnsplashPhotoIdQueue.shift();
    if (removed) usedUnsplashPhotoIds.delete(removed);
  }
  saveUsedUnsplashIds();
}

loadUsedUnsplashIds();

// Sanity Client
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'z0g6hj8g',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-08-10',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// Gemini AI - Support both Vertex AI and Google AI Studio (like Cost of Living)
let genAI = null;
let vertexAI = null;
let useVertexAI = false;
let forceAiStudio = false;

function getGeminiAI() {
  if (forceAiStudio) {
    if (!genAI) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY mancante (fallback su AI Studio).');
      }
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      console.log('✅ Google AI Studio inizializzato (fallback)');
    }
    return genAI;
  }
  if (process.env.GCP_PROJECT_ID && process.env.GCP_LOCATION) {
    if (!vertexAI) {
      try {
        vertexAI = new VertexAI({
          project: process.env.GCP_PROJECT_ID,
          location: process.env.GCP_LOCATION || 'us-central1'
        });
        useVertexAI = true;
        console.log(`✅ Vertex AI inizializzato: project=${process.env.GCP_PROJECT_ID}, location=${process.env.GCP_LOCATION}`);
      } catch (error) {
        useVertexAI = false;
        console.warn('❌ Vertex AI init fallito:', error.message);
        throw new Error(`Vertex AI init fallito: ${error.message}`);
      }
    }
    return vertexAI;
  }
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY mancante (o imposta GCP_PROJECT_ID e GCP_LOCATION per Vertex AI).');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ Google AI Studio inizializzato');
  }
  return genAI;
}

/**
 * Genera testo con Gemini (Vertex con 2.5-pro o Google AI Studio con 1.5-flash)
 */
async function generateText(prompt, options = {}) {
  const ai = getGeminiAI();
  const temperature = options.temperature ?? CONFIG.temperature;
  const maxOutputTokens = options.maxOutputTokens ?? CONFIG.maxTokens;
  let modelName = options.model ?? CONFIG.geminiModel;
  if (!useVertexAI && (modelName === 'gemini-2.5-pro' || modelName === 'gemini-2.5-flash-lite')) {
    modelName = 'gemini-1.5-flash';
  }
  if (useVertexAI) {
    let model;
    try {
      model = ai.getGenerativeModel({ model: modelName });
    } catch (modelError) {
      if (modelName === 'gemini-2.5-pro') {
        console.warn('⚠️ gemini-2.5-pro non disponibile, provo gemini-2.5-flash-lite...');
        try {
          model = ai.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
        } catch (fallbackError) {
          throw new Error(`Sia gemini-2.5-pro che gemini-2.5-flash-lite falliti: ${fallbackError.message}`);
        }
      } else {
        throw modelError;
      }
    }
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature, maxOutputTokens }
    });
    const text = result?.response?.candidates?.[0]?.content?.parts
      ?.map(p => p.text)
      .filter(Boolean)
      .join('\n')
      .trim();
    if (!text) throw new Error('Vertex AI ha restituito risposta vuota');
    return text;
  }
  const model = ai.getGenerativeModel({ model: modelName });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature, maxOutputTokens }
  });
  return result.response.text();
}

// ===== GESTIONE IMMAGINI =====

/**
 * Scarica immagine da URL e la carica su Sanity come asset
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
    
    console.log(`   ☁️ Immagine caricata su Sanity: ${asset._id}`);
    
    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id
      },
      alt: alt
    };
  } catch (error) {
    console.error(`   ❌ Errore upload immagine da URL: ${error.message}`);
    return null;
  }
}

/**
 * Carica immagine da file locale su Sanity
 */
async function uploadLocalImageToSanity(localPath, filename, alt) {
  try {
    if (!fs.existsSync(localPath)) {
      throw new Error(`File non trovato: ${localPath}`);
    }
    
    const buffer = fs.readFileSync(localPath);
    
    const asset = await sanityClient.assets.upload('image', buffer, {
      filename: `${filename}.jpg`,
      contentType: 'image/jpeg'
    });
    
    console.log(`   ☁️ Immagine locale caricata su Sanity: ${asset._id}`);
    
    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id
      },
      alt: alt
    };
  } catch (error) {
    console.error(`   ❌ Errore upload immagine locale: ${error.message}`);
    return null;
  }
}

/**
 * Ottiene lista immagini fallback dalla cartella locale
 */
function getFallbackImages() {
  try {
    if (!fs.existsSync(CONFIG.fallbackImagesDir)) {
      console.log(`   ⚠️ Cartella fallback non trovata: ${CONFIG.fallbackImagesDir}`);
      return [];
    }
    
    const files = fs.readdirSync(CONFIG.fallbackImagesDir);
    const imageFiles = files.filter(f => 
      /\.(jpg|jpeg|png|webp)$/i.test(f) && !f.startsWith('.')
    );
    
    return imageFiles.map(f => path.join(CONFIG.fallbackImagesDir, f));
  } catch (error) {
    console.error(`   ❌ Errore lettura cartella fallback: ${error.message}`);
    return [];
  }
}

/**
 * Seleziona immagine fallback random
 */
function getRandomFallbackImage() {
  const images = getFallbackImages();
  if (images.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
}

/**
 * Ottiene immagine con fallback: prima Unsplash, poi locale
 */
async function getImageWithFallback(keyword, categorySlug, finalSlug, articleTitle, log) {
  let mainImageAsset = null;
  let imageCredit = null;
  let imageSource = null;
  
  // 1. Prova Unsplash con retry
  for (let attempt = 1; attempt <= CONFIG.unsplashMaxRetries; attempt++) {
    try {
      const imageKeywords = extractImageKeywords(keyword, categorySlug);
      const orderBy = Math.random() < 0.5 ? 'relevant' : 'latest';
      const page = Math.floor(Math.random() * 4) + 1;
      log(`   🔍 Tentativo ${attempt}/${CONFIG.unsplashMaxRetries} - Query: "${imageKeywords}" (order: ${orderBy}, page: ${page})`);

      const photos = await searchPhotos(imageKeywords, {
        perPage: 12,
        orientation: 'landscape',
        orderBy,
        page
      });

      if (photos && photos.length > 0) {
        const candidates = photos.filter(photo => photo?.id && photo.url && !photo.id.startsWith('placeholder'));
        const unused = candidates.filter(photo => !usedUnsplashPhotoIds.has(photo.id));
        const pool = unused.length > 0 ? unused : candidates;
        const photo = pool[Math.floor(Math.random() * pool.length)];

        if (photo) {
          imageCredit = photo.author;

          // Traccia download (ToS Unsplash)
          if (photo.downloadLink) {
            await trackDownload(photo.downloadLink);
          }

          log(`   ✅ Unsplash: ${photo.description || 'Immagine trovata'}`);
          log(`   📷 by ${photo.author?.name || 'Unknown'}`);

          // Upload su Sanity
          mainImageAsset = await uploadImageToSanity(
            photo.url,
            finalSlug,
            `${articleTitle} - Foto di ${photo.author?.name || 'Unsplash'} su Unsplash`
          );

          if (mainImageAsset) {
            imageSource = 'unsplash';
            rememberUnsplashId(photo.id);
            break;
          }
        }
      }
      
      // Se arriviamo qui, non abbiamo trovato nulla di valido
      if (attempt < CONFIG.unsplashMaxRetries) {
        log(`   ⏳ Nessuna immagine valida, retry tra ${CONFIG.unsplashRetryDelay/1000}s...`);
        await new Promise(r => setTimeout(r, CONFIG.unsplashRetryDelay));
      }
      
    } catch (error) {
      log(`   ⚠️ Errore Unsplash (tentativo ${attempt}): ${error.message}`);
      if (attempt < CONFIG.unsplashMaxRetries) {
        await new Promise(r => setTimeout(r, CONFIG.unsplashRetryDelay));
      }
    }
  }
  
  // 2. Fallback su immagini locali
  if (!mainImageAsset) {
    log('   📁 Fallback su immagini locali...');
    const fallbackImage = getRandomFallbackImage();
    
    if (fallbackImage) {
      log(`   📸 Usando: ${path.basename(fallbackImage)}`);
      
      mainImageAsset = await uploadLocalImageToSanity(
        fallbackImage,
        finalSlug,
        `${articleTitle} - Money With Sense`
      );
      
      if (mainImageAsset) {
        imageSource = 'fallback';
        imageCredit = { name: 'MoneyWithSense', username: 'moneywithsense' };
      }
    } else {
      log('   ⚠️ No fallback images available');
      log('   💡 Add images to: public/images/fallback-finance/');
    }
  }
  
  return { mainImageAsset, imageCredit, imageSource };
}

// ===== PROMPT TEMPLATE (MoneyWithSense Content Strategy) =====
const ARTICLE_PROMPT = `You are a personal finance editor writing for MoneyWithSense.com.

TOPIC: "{keyword}"
CATEGORY: {category}
SEASON: {season}

=== WRITING STYLE ===
- Simple, global English (readable by US, UK, AU, CA, EU audiences)
- No heavy American slang
- Short sentences (max 20 words average)
- No guru tone or hype
- Practical, calm, trustworthy voice
- Never clickbait or sensationalist

=== STRICT REQUIREMENTS ===

1) TITLE: max 60 characters, SEO-friendly, no quotes, practical focus

2) EXCERPT: max 150 characters (strict) for meta description

3) CONTENT STRUCTURE (must follow this exact order):
   
   a) INTRO (practical)
      - Real problem, simple language
      - Who this is for
      - What they'll learn
   
   b) WHY IT MATTERS
      - Real-life impact on everyday finances
      - Keep it grounded, no exaggeration
   
   c) MAIN CONTENT (3-6 sections)
      - Use ## for section titles (NOT "H2:" text!)
      - Example: ## How to Start Saving Today
      - Actionable advice with concrete examples
      - Use bullet points or numbered lists
      - Include specific numbers/amounts when helpful
   
   d) COMMON MISTAKES
      - 3-5 typical errors related to the topic
      - Brief explanation of why each is problematic
   
   e) QUICK CHECKLIST / TAKEAWAYS
      - Bullet list, 5-8 items
      - Easy to save or screenshot
   
   f) FAQ (optional, only if adds SEO value)
      - 2-4 common questions with brief answers
      - Use ### for each question
   
   g) CONCLUSION
      - Practical summary
      - Soft call-to-action (reflect, take one step)
   
   h) DISCLAIMER (required at end)
      - "This content is for informational purposes only and does not constitute financial advice. Always consult a qualified professional for personalized guidance."

4) INTERNAL LINKS: {INTERNAL_LINKS_SECTION}

5) LENGTH: 1,200-1,600 words (minimum 900, never below 800)

6) SEO & FORMATTING:
   - Include primary keyword in first 100 words
   - Use 4-6 related keywords naturally throughout
   - IMPORTANT: Use proper markdown syntax for headers:
     * ## Section Title (for H2)
     * ### Subsection Title (for H3)
     * NEVER write "H2:" or "H3:" as text!

7) PRODUCTS (for potential affiliate, optional):
   - 2-3 real, globally available tools/apps/services
   - No fake claims, realistic benefits only
   - Include price range or "free/freemium"

=== OUTPUT FORMAT (EXACTLY) ===

---TITLE---
[Title here, max 60 chars]
---EXCERPT---
[Meta description, max 150 chars]
---KEYWORDS---
[primary keyword, related keyword 1, related keyword 2, ...]
---PRODUCTS---
PRODUCT1: Exact name | Brief benefit | Price/free
PRODUCT2: Exact name | Brief benefit | Price/free
PRODUCT3: Exact name | Brief benefit | Price/free
---CONTENT---
[Full markdown article. CRITICAL: Use proper markdown headers:
- ## for main sections (NOT "H2:" as text!)
- ### for subsections (NOT "H3:" as text!)
Example:
## Why Saving Money Matters
Content here...

### Start With Small Steps
More content...

{INTERNAL_LINKS_CONTENT} Include disclaimer at the end.]
---END---

=== EXCLUSIONS ===
Do NOT write about: trading, crypto, stock picking, specific investment advice, market predictions, or anything requiring professional licensing.

Write original, practical, and helpful content. No invented statistics. Focus on real, actionable advice that helps everyday people manage money better.`;

// ===== FUNZIONE PRINCIPALE =====
export async function generateArticle(keyword, categorySlug = 'personal-finance', options = {}) {
  const { skipDuplicateCheck = false, verbose = true } = options;
  
  const log = (msg) => verbose && console.log(msg);
  
  log('\n' + '💰'.repeat(18));
  log(`GENERATING ARTICLE: "${keyword}"`);
  log('💰'.repeat(18) + '\n');

  // 1. Check duplicati semantici (se non saltato)
  if (!skipDuplicateCheck) {
    log('🔍 Controllo duplicati semantici...');
    try {
      const duplicateAnalysis = await checkSemanticDuplicate(keyword, { verbose: false });
      
      if (duplicateAnalysis.isDuplicate || duplicateAnalysis.recommendation === 'skip') {
        log(`❌ SKIP: Keyword troppo simile a "${duplicateAnalysis.mostSimilarArticle?.title}"`);
        log(`   Similarità: ${duplicateAnalysis.maxSimilarity}%`);
        return {
          skipped: true,
          reason: 'duplicate',
          similarTo: duplicateAnalysis.mostSimilarArticle?.title,
          similarity: duplicateAnalysis.maxSimilarity
        };
      }
      log(`✅ Nessun duplicato trovato (max ${duplicateAnalysis.maxSimilarity}% similarità)`);
    } catch (error) {
      log(`⚠️ Errore check duplicati: ${error.message} - Procedo comunque`);
    }
  }

  // 2. Verifica slug non esistente
  const baseSlug = slugify(keyword);
  log(`🔗 Slug generato: ${baseSlug}`);
  
  const slugExists = await articleExistsBySlug(baseSlug);
  if (slugExists) {
    log('⚠️ Slug già esistente, aggiungo timestamp...');
  }
  const finalSlug = slugExists ? `${baseSlug}-${Date.now()}` : baseSlug;

  // 3. Articoli esistenti per link interni (solo slug che esistono)
  log('🔗 Recupero articoli esistenti per link interni...');
  const existingArticles = await getArticleSlugsForInternalLinks(40);
  const internalLinksList = existingArticles.map((a) => `- ${a.slug}: ${a.title}`).join('\n');
  const hasInternalLinksPool = existingArticles.length > 0;
  const internalLinksSection = hasInternalLinksPool
    ? `When relevant, include 1–2 internal links to existing articles. Use ONLY the following slugs (these pages exist). Format: [anchor text](/articles/EXACT-SLUG). Do not invent slugs.\n\nAvailable articles (slug : title):\n${internalLinksList}`
    : 'DO NOT include internal links in the article markdown. Related content is shown automatically by the site.';
  const internalLinksContent = hasInternalLinksPool
    ? 'If relevant, add 1–2 internal links using only the slugs listed above. '
    : 'Do not add internal links. ';
  if (hasInternalLinksPool) log(`   ${existingArticles.length} articoli disponibili per link interni`);

  // 4. Genera contenuto con Gemini
  log('🤖 Generazione contenuto con Gemini AI...');
  const season = getCurrentSeason();
  const prompt = ARTICLE_PROMPT
    .replace('{keyword}', keyword)
    .replace('{category}', categorySlug)
    .replace('{season}', season)
    .replace('{INTERNAL_LINKS_SECTION}', internalLinksSection)
    .replace('{INTERNAL_LINKS_CONTENT}', internalLinksContent);

  let articleContent;
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      articleContent = await generateText(prompt, {
        temperature: CONFIG.temperature,
        maxOutputTokens: CONFIG.maxTokens,
        model: CONFIG.geminiModel
      });
      log('✅ Contenuto generato con successo');
      break;
    } catch (error) {
      const isVertexError = error.message && (
        error.message.includes('SERVICE_DISABLED') ||
        error.message.includes('PERMISSION_DENIED') ||
        error.message.includes('403') ||
        error.message.includes('Unable to authenticate') ||
        error.message.includes('credentials')
      );
      if (useVertexAI && isVertexError && attempt === 1 && process.env.GEMINI_API_KEY) {
        log('⚠️ Vertex AI fallito, fallback su Google AI Studio...');
        forceAiStudio = true;
        useVertexAI = false;
        genAI = null;
        vertexAI = null;
        continue;
      }
      const isRateLimit = error.message.includes('429') || error.message.includes('Too Many Requests');
      if (isRateLimit && attempt < maxRetries) {
        const waitTime = attempt * 30;
        log(`⏳ Rate limit (429) - Attendo ${waitTime}s prima del retry ${attempt + 1}/${maxRetries}...`);
        await new Promise(r => setTimeout(r, waitTime * 1000));
      } else if (attempt === maxRetries) {
        console.error('❌ Errore Gemini dopo tutti i tentativi:', error.message);
        throw new Error(`Errore generazione Gemini: ${error.message}`);
      } else {
        console.error('❌ Errore Gemini:', error.message);
        throw new Error(`Errore generazione Gemini: ${error.message}`);
      }
    }
  }

  // 4. Parsa il contenuto generato
  log('📝 Parsing contenuto...');
  const parsed = parseGeneratedContent(articleContent);
  
  if (!parsed.title || !parsed.content) {
    throw new Error('Contenuto generato non valido - titolo o contenuto mancante');
  }
  
  log(`   Titolo: "${parsed.title}"`);
  log(`   Excerpt: ${parsed.excerpt?.length || 0} caratteri`);
  log(`   Keywords: ${parsed.keywords?.length || 0}`);
  log(`   Prodotti: ${parsed.products?.length || 0}`);

  // 5. Cerca immagine (Unsplash + fallback locale)
  log('📸 Ricerca immagine...');
  const { mainImageAsset, imageCredit, imageSource } = await getImageWithFallback(
    keyword, 
    categorySlug, 
    finalSlug, 
    parsed.title,
    log
  );

  // 6. Prepara documento Sanity
  log('📄 Preparazione documento Sanity...');
  
  const authorId = await getDefaultAuthorId();
  const categoryId = await getCategoryIdBySlug(categorySlug);
  
  if (!authorId) {
    throw new Error('Nessun autore trovato in Sanity. Crea prima un autore.');
  }

  // Converti markdown in block content
  const bodyBlocks = markdownToBlockContent(parsed.content);

  // Calcola reading time e likes random
  const wordCount = parsed.content.split(/\s+/).length;
  const readingTime = Math.max(
    CONFIG.readingTimeMin,
    Math.min(CONFIG.readingTimeMax, Math.ceil(wordCount / 200))
  );
  const initialLikes = Math.floor(
    Math.random() * (CONFIG.initialLikesMax - CONFIG.initialLikesMin + 1)
  ) + CONFIG.initialLikesMin;

  // Excerpt max 150 caratteri (validazione Sanity)
  const rawExcerpt = parsed.excerpt || parsed.title || '';
  const excerpt = rawExcerpt.length > 150 ? rawExcerpt.substring(0, 147) + '...' : rawExcerpt;

  // Documento completo
  const sanityDocument = {
    _type: 'post',
    title: parsed.title,
    slug: { current: finalSlug },
    excerpt,
    author: { _type: 'reference', _ref: authorId },
    categories: categoryId ? [{ _type: 'reference', _ref: categoryId }] : [],
    body: bodyBlocks,
    readingTime,
    ...(initialLikes > 0 && { initialLikes }),
    seoTitle: parsed.title,
    seoDescription: excerpt,
    seoKeywords: parsed.keywords || [],
    status: 'published',
    publishedAt: CONFIG.publishImmediately ? new Date().toISOString() : null
  };

  // Aggiungi immagine se disponibile
  if (mainImageAsset) {
    sanityDocument.mainImage = mainImageAsset;
    
    // Aggiungi credito immagine alla fine del body
    if (imageCredit && imageSource === 'unsplash') {
      const creditBlock = {
        _type: 'block',
        _key: 'image-credit',
        style: 'normal',
        markDefs: [],
        children: [{
          _type: 'span',
          _key: 'credit-span',
          text: `📷 Foto di ${imageCredit.name} su Unsplash`,
          marks: []
        }]
      };
      sanityDocument.body.push(creditBlock);
    }
  }

  // 8. Valida documento
  const validation = validatePostDocument(sanityDocument);
  if (!validation.valid) {
    console.error('❌ Validazione fallita:', validation.errors);
    throw new Error(`Documento non valido: ${validation.errors.join(', ')}`);
  }

  // 9. Crea in Sanity
  log('💾 Creazione articolo in Sanity...');
  
  try {
    const created = await sanityClient.create(sanityDocument);
    
    log('\n' + '✅'.repeat(25));
    log('ARTICOLO CREATO CON SUCCESSO!');
    log('✅'.repeat(25));
    log(`   📝 Titolo: ${parsed.title}`);
    log(`   🔗 Slug: ${finalSlug}`);
    log(`   📊 Parole: ~${wordCount}`);
    log(`   ⏱️ Lettura: ${readingTime} min`);
    log(`   ❤️ Likes: ${initialLikes}`);
    log(`   🛒 Prodotti linkati: ${parsed.products?.length || 0}`);
    if (mainImageAsset) {
      log(`   📸 Immagine: ✅ (${imageSource === 'unsplash' ? 'Unsplash' : 'Fallback locale'})`);
    } else {
      log(`   📸 Immagine: ❌ (nessuna disponibile)`);
    }
    log(`   📅 Stato: ${CONFIG.publishImmediately ? 'Pubblicato' : 'Bozza'}`);
    log(`   🆔 ID: ${created._id}`);
    
    return {
      ...created,
      wordCount,
      hasImage: !!mainImageAsset,
      imageSource,
      linkedProducts: parsed.products?.length || 0
    };
  } catch (error) {
    console.error('❌ Errore Sanity:', error.message);
    throw error;
  }
}

// ===== HELPER FUNCTIONS =====

/**
 * Parsa il contenuto generato da Gemini
 */
function parseGeneratedContent(content) {
  const result = {
    title: '',
    excerpt: '',
    keywords: [],
    products: [],
    content: ''
  };

  try {
    // Title
    const titleMatch = content.match(/---TITLE---\s*([\s\S]*?)(?=---EXCERPT---|$)/i);
    if (titleMatch) {
      result.title = titleMatch[1].trim().replace(/^["']|["']$/g, '').substring(0, 60);
    }

    // Excerpt (max 150 per validazione Sanity)
    const excerptMatch = content.match(/---EXCERPT---\s*([\s\S]*?)(?=---KEYWORDS---|$)/i);
    if (excerptMatch) {
      const raw = excerptMatch[1].trim();
      result.excerpt = raw.length > 150 ? raw.substring(0, 147) + '...' : raw;
    }

    // Keywords
    const keywordsMatch = content.match(/---KEYWORDS---\s*([\s\S]*?)(?=---PRODUCTS---|$)/i);
    if (keywordsMatch) {
      result.keywords = keywordsMatch[1]
        .trim()
        .split(/[,\n]/)
        .map(k => k.trim())
        .filter(k => k.length > 0)
        .slice(0, 10);
    }

    // Products
    const productsMatch = content.match(/---PRODUCTS---\s*([\s\S]*?)(?=---CONTENT---|$)/i);
    if (productsMatch) {
      const productLines = productsMatch[1].trim().split('\n').filter(l => l.includes('|'));
      result.products = productLines.map(line => {
        const parts = line.replace(/^PRODUCT\d*:\s*/i, '').split('|').map(p => p.trim());
        return {
          name: parts[0] || 'Finance Tool',
          description: parts[1] || '',
          price: parts[2] || '$29'
        };
      }).slice(0, 4);
    }

    // Content
    const contentMatch = content.match(/---CONTENT---\s*([\s\S]*?)(?=---END---|$)/i);
    if (contentMatch) {
      result.content = contentMatch[1].trim();
    } else {
      const fallbackMatch = content.match(/---CONTENT---\s*([\s\S]*)/i);
      if (fallbackMatch) {
        result.content = fallbackMatch[1].trim().replace(/---END---[\s\S]*$/i, '');
      }
    }

    // Fallback heuristic
    if (!result.title && !result.content) {
      const lines = content.split('\n').filter(l => l.trim());
      result.title = lines[0]?.replace(/^#\s*/, '').substring(0, 60) || 'Finance Article';
      result.content = lines.slice(1).join('\n');
    }

  } catch (error) {
    console.error('Errore parsing:', error.message);
  }

  return result;
}

/**
 * Estrai keyword per ricerca immagine - IMPROVED VERSION
 * Uses full words and varied search queries for better Unsplash results
 */
function extractImageKeywords(keyword, category) {
  const pick = (items) => items[Math.floor(Math.random() * items.length)];
  const stopwords = new Set([
    'how', 'to', 'the', 'a', 'an', 'of', 'and', 'in', 'with', 'for', 'on', 'at',
    'your', 'you', 'is', 'are', 'this', 'that', 'from', 'without', 'guide', 'tips',
    'best', 'simple', 'easy', 'money', 'finance', 'financial'
  ]);

  const tokens = keyword
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopwords.has(word))
    .slice(0, 4);

  const categoryPhrases = {
    'personal-finance': ['personal finance', 'money management', 'financial planning'],
    'saving-money': ['saving money', 'piggy bank', 'budget planning'],
    'investing-basics': ['investment planning', 'portfolio review', 'growth chart'],
    'passive-income': ['side income', 'multiple income streams', 'remote work'],
    'budgeting': ['budget planner', 'expense tracking', 'monthly budget'],
    'credit-debt': ['credit card payment', 'debt payoff', 'credit score'],
    'credit-and-debt': ['credit card payment', 'debt payoff', 'credit score'],
    'banking-cards': ['online banking', 'bank card', 'mobile banking'],
    'banking-and-cards': ['online banking', 'bank card', 'mobile banking'],
    'taxes-tips': ['tax documents', 'tax planning', 'calculator desk'],
    'taxes-and-tips': ['tax documents', 'tax planning', 'calculator desk'],
    'side-hustles': ['freelancer workspace', 'side hustle', 'home office'],
    'money-psychology': ['money mindset', 'financial habits', 'stress relief']
  };

  const sceneModifiers = [
    'desk setup', 'notebook', 'calculator', 'laptop', 'spreadsheet', 'receipt',
    'planning session', 'workspace', 'coffee table', 'home office', 'minimal'
  ];

  const styleModifiers = [
    'clean', 'modern', 'professional', 'minimal', 'natural light', 'organized'
  ];

  const base = tokens.join(' ');
  const categoryPhrase = pick(categoryPhrases[category] || ['personal finance', 'budget planning']);

  const variants = [
    `${base || categoryPhrase} ${categoryPhrase}`,
    `${base || categoryPhrase} ${pick(sceneModifiers)}`,
    `${categoryPhrase} ${pick(sceneModifiers)}`,
    `${base || categoryPhrase} ${pick(styleModifiers)}`,
    `${categoryPhrase} ${pick(styleModifiers)}`
  ];

  const cleanedVariants = variants
    .map(q => q.replace(/\s+/g, ' ').trim())
    .filter(q => q.length > 0);

  return cleanedVariants.length > 0 ? pick(cleanedVariants) : categoryPhrase;
}

/**
 * Restituisce la stagione corrente
 */
function getCurrentSeason() {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

// ===== EXPORT =====
export default generateArticle;
