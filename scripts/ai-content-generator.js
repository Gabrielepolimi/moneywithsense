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
import { checkSemanticDuplicate } from './semantic-duplicate-checker.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Per ottenere __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== CONFIGURAZIONE =====
const CONFIG = {
  geminiModel: 'gemini-2.0-flash',
  maxTokens: 8000,
  temperature: 0.7,
  publishImmediately: true,
  readingTimeMin: 5,
  readingTimeMax: 12,
  initialLikesMin: 120,
  initialLikesMax: 520,
  // Cartella immagini fallback (finance)
  fallbackImagesDir: path.join(__dirname, '..', 'public', 'images', 'fallback-finance'),
  // Retry config per Unsplash
  unsplashMaxRetries: 2,
  unsplashRetryDelay: 2000 // 2 secondi
};

// Sanity Client
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'z0g6hj8g',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-08-10',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// Gemini AI
let genAI = null;

function getGeminiAI() {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY non configurata');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
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
      log(`   🔍 Tentativo ${attempt}/${CONFIG.unsplashMaxRetries} - Query: "${imageKeywords}"`);
      
      const photos = await searchPhotos(imageKeywords, {
        perPage: 5,
        orientation: 'landscape'
      });
      
      if (photos && photos.length > 0 && photos[0].url) {
        const photo = photos[0];
        
        // Verifica che non sia un placeholder
        if (photo.id && !photo.id.startsWith('placeholder')) {
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

// ===== PROMPT TEMPLATE (Finance, EN) =====
const ARTICLE_PROMPT = `You are a personal finance editor and SEO copywriter. 
Write a clear, practical, long-form article about: "{keyword}"

STRICT REQUIREMENTS:
1) TITLE: max 60 chars, compelling and SEO-friendly (no quotes).
2) EXCERPT: 150-160 chars for meta description.
3) CONTENT:
   - 900-1500 words, H2/H3 structure, short paragraphs (2-4 sentences)
   - Sections (must appear, in order):
     • Practical intro (set context, audience, promise)
     • Why it matters
     • Actionable steps (numbered or bullets)
     • Common mistakes to avoid
     • Quick checklist (bullets, 5-8 items)
     • FAQ (3 Q&A, concise)
     • Sources & references (authoritative, 3-5 bullets)
     • Conclusion with a useful CTA
   - Add a short financial disclaimer at the end: "This content is for informational purposes only. Not financial advice."
   - Tone: simple, trustworthy, global English; avoid jargon or, if needed, explain it.
   - Include 1 primary keyword and 4-6 related keywords naturally.
4) AFFILIATES / PRODUCTS (generic, no fake claims):
   - Suggest 2-3 real products/services/tools relevant to the topic (global, no region-specific unless obvious).
   - For each: exact name, brief benefit (max 80 chars), realistic price range or “varies”.
   - Mention them naturally in the content using the exact names listed.
5) OUTPUT FORMAT (EXACTLY):
---TITLE---
[Title here]
---EXCERPT---
[Meta description here]
---KEYWORDS---
[primary keyword, related keyword 1, related keyword 2, ...]
---PRODUCTS---
PRODUCT1: Exact product/service name | Brief benefit | $XX or "varies"
PRODUCT2: Exact product/service name | Brief benefit | $XX or "varies"
PRODUCT3: Exact product/service name | Brief benefit | $XX or "varies"
---CONTENT---
[Markdown content with ## for H2 and ### for H3. Must contain all required sections in order. Include the disclaimer line at the end.]
---END---

CATEGORY: {category}
SEASON: {season}

Write original, practical, and accurate content. Do not invent statistics. Keep language simple and globally understandable.`;

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

  // 3. Genera contenuto con Gemini
  log('🤖 Generazione contenuto con Gemini AI...');
  const season = getCurrentSeason();
  const prompt = ARTICLE_PROMPT
    .replace('{keyword}', keyword)
    .replace('{category}', categorySlug)
    .replace('{season}', season);

  let articleContent;
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const ai = getGeminiAI();
      const model = ai.getGenerativeModel({ model: CONFIG.geminiModel });
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: CONFIG.temperature,
          maxOutputTokens: CONFIG.maxTokens
        }
      });

      articleContent = result.response.text();
      log('✅ Contenuto generato con successo');
      break;
      
    } catch (error) {
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

  // Documento completo
  const sanityDocument = {
    _type: 'post',
    title: parsed.title,
    slug: { current: finalSlug },
    excerpt: parsed.excerpt || parsed.title,
    author: { _type: 'reference', _ref: authorId },
    categories: categoryId ? [{ _type: 'reference', _ref: categoryId }] : [],
    body: bodyBlocks,
    readingTime,
    initialLikes,
    seoTitle: parsed.title,
    seoDescription: parsed.excerpt,
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

    // Excerpt
    const excerptMatch = content.match(/---EXCERPT---\s*([\s\S]*?)(?=---KEYWORDS---|$)/i);
    if (excerptMatch) {
      result.excerpt = excerptMatch[1].trim().substring(0, 160);
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
 * Estrai keyword per ricerca immagine
 */
function extractImageKeywords(keyword, category) {
  const categoryImages = {
    'personal-finance': 'personal finance planning money management',
    'saving-money': 'saving money budgeting frugal living',
    'investing-basics': 'investing stocks bonds etf finance',
    'passive-income': 'passive income cash flow finance',
    'budgeting': 'budgeting planner money tracker',
    'credit-debt': 'credit score debt payoff finance',
    'credit-and-debt': 'credit score debt payoff finance',
    'banking-cards': 'online banking credit card finance',
    'banking-and-cards': 'online banking credit card finance',
    'taxes-tips': 'tax finance documents calculator',
    'taxes-and-tips': 'tax finance documents calculator',
    'side-hustles': 'side hustle freelance remote work',
    'money-psychology': 'money mindset financial habits'
  };

  const mainWords = keyword
    .toLowerCase()
    .replace(/guide|how to|best|tips|basics|for|the|a|an|of|and|in|with/gi, '')
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 3)
    .slice(0, 3)
    .join(' ');

  const categoryKeyword = categoryImages[category] || 'personal finance';

  return `${mainWords} ${categoryKeyword} clean minimal`.trim();
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
