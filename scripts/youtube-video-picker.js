/**
 * 🎥 YouTube Video Picker
 * Seleziona automaticamente 1 video YouTube di alta qualità per un articolo.
 *
 * Uso:
 *   node scripts/youtube-video-picker.js "<article-slug>" [--dry-run]
 *
 * Requisiti:
 *   - YOUTUBE_API_KEY
 *   - SANITY_API_TOKEN
 *   - GEMINI_API_KEY (per relevance + takeaways; fallback euristico se assente/fallisce)
 */

import crypto from 'crypto';
import { createClient } from '@sanity/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ====== CONFIG ======
const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'z0g6hj8g';
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const SANITY_API_TOKEN = process.env.SANITY_API_TOKEN;
const YT_KEY = process.env.YOUTUBE_API_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

const YT_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const YT_VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';

const CACHE_TTL_DAYS = 90;

// Threshold (MoneyWithSense Quality Standards)
// Adjusted for better video discovery in niche finance topics
const VIEWS_MIN_GENERIC = 10000;  // Standard quality threshold
const VIEWS_MIN_NICHE = 5000;     // Niche topics can have lower views
const VIEWS_HARD_FLOOR = 2000;    // Absolute minimum
const MIN_DURATION_SEC = 180;     // 3 min minimum
const SHORTS_MAX_SEC = 60;        // Exclude shorts

const N_MAX_SEARCH_RESULTS = 30;
const MAX_CANDIDATES_FOR_LLM = 12; // limit LLM calls

// Video intro text (MoneyWithSense editorial style)
const VIDEO_INTRO_TEXT = "Online there are many videos on this topic, but this one explains the concept clearly and practically. It's a useful visual reference to better understand this approach.";

// ====== Clients ======
const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: '2024-08-10',
  token: SANITY_API_TOKEN,
  useCdn: false,
});

let genAI = null;
function getGemini() {
  if (genAI) return genAI;
  if (!GEMINI_KEY) {
    throw new Error('GEMINI_API_KEY mancante: il picker richiede il ranking LLM');
  }
  genAI = new GoogleGenerativeAI(GEMINI_KEY);
  return genAI;
}

// ====== Utils ======
function isoDurationToSeconds(iso) {
  if (!iso) return 0;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const [, h, mnt, s] = m;
  return (parseInt(h || '0', 10) * 3600) + (parseInt(mnt || '0', 10) * 60) + parseInt(s || '0', 10);
}

function hashSignature(parts) {
  const str = parts.filter(Boolean).join('||');
  return crypto.createHash('sha256').update(str).digest('hex');
}

function isNiche(texts = []) {
  const nicheKeywords = [
    'roth ira', '401k', 'index fund', 'etf', 'dividend', 'compound interest',
    'emergency fund', 'debt snowball', 'debt avalanche', 'credit score', 'fico',
    'hsa', 'fsa', 'tax deduction', 'capital gains', 'tax loss harvesting',
    'asset allocation', 'rebalancing', 'dollar cost averaging', 'fire movement',
    'passive income', 'side hustle', 'freelance', 'gig economy', 'budgeting',
    'zero-based budget', '50/30/20', 'envelope system', 'sinking fund'
  ];
  const hay = texts.join(' ').toLowerCase();
  return nicheKeywords.some(k => hay.includes(k));
}

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

// Heuristic relevance (fallback)
function heuristicRelevance(article, video) {
  const textA = (article.title + ' ' + (article.excerpt || '') + ' ' + article.headings.join(' ')).toLowerCase();
  const textB = (video.title + ' ' + (video.description || '')).toLowerCase();
  let score = 0;
  const terms = article.title.split(/\s+/).filter(w => w.length > 3);
  terms.forEach(t => {
    if (textB.includes(t.toLowerCase())) score += 1;
  });
  const rel = clamp(score / Math.max(terms.length, 6), 0, 1);
  return rel;
}

async function getRelevanceViaGemini(article, video) {
  const gem = getGemini();
  if (!gem) return null;
  try {
    const model = gem.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `
You are a personal finance assistant. Evaluate how relevant this video is for the article.
Reply ONLY with JSON: {"relevance":0-1,"reason":"...","takeaways":["...","...","..."]} without any extra text.

Article:
- Title: ${article.title}
- Excerpt: ${article.excerpt || ''}
- Headings: ${article.headings.join(' | ')}
- Categories/topics: ${[...article.categories, ...(article.topics || [])].join(', ')}

Video:
- Title: ${video.title}
- Description: ${video.description || ''}
- Duration: ${video.durationSeconds}s
- Views: ${video.views}
    `;
    const res = await model.generateContent(prompt);
    const txt = res.response?.text?.() || res.response?.text;
    const jsonMatch = txt?.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const data = JSON.parse(jsonMatch[0]);
    return {
      relevance: clamp(Number(data.relevance) || 0, 0, 1),
      reason: typeof data.reason === 'string' ? data.reason : '',
      takeaways: Array.isArray(data.takeaways) ? data.takeaways.slice(0, 3).map(String) : [],
    };
  } catch (err) {
    console.warn('Gemini relevance fallback:', err.message);
    return null;
  }
}

async function oEmbedCheck(videoId) {
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  try {
    const r = await fetch(url);
    return r.ok;
  } catch {
    return false;
  }
}

async function fetchArticle(slug) {
  const query = `
    *[_type == "post" && slug.current == $slug && status == "published"][0]{
      _id,
      title,
      "slug": slug.current,
      excerpt,
      body,
      "categories": categories[]->title,
      "topics": financeTopics[]->title,
      youtube,
      showYouTubeVideo,
      youtubeUrl
    }
  `;
  return sanityClient.fetch(query, { slug });
}

function extractHeadingsFromBody(body = []) {
  const headings = [];
  (body || []).forEach(block => {
    if (block?._type === 'block' && /^h[23]$/.test(block.style || '')) {
      const text = (block.children || []).map(c => c.text || '').join('');
      if (text) headings.push(text);
    }
  });
  return headings;
}

function buildQueries(article) {
  const q = new Set();
  const base = article.title;
  q.add(base);
  (article.headings || []).slice(0, 3).forEach(h => q.add(h));
  (article.categories || []).forEach(c => q.add(`${c} personal finance`));
  (article.topics || []).forEach(t => q.add(`${t} money tips`));

  // tutorial versions
  const mainTopic = article.topics?.[0] || '';
  const mainCat = article.categories?.[0] || '';
  if (mainTopic) q.add(`${mainTopic} tutorial money`);
  if (mainCat) q.add(`${mainCat} explained`);
  if (article.title.toLowerCase().includes('budget')) q.add(`budgeting tutorial beginner`);
  if (article.title.toLowerCase().includes('invest')) q.add(`investing for beginners`);

  // cleanup
  const queries = Array.from(q)
    .map(s => s.trim())
    .filter(s => s.length > 8)
    .slice(0, 8);
  return queries;
}

async function ytSearch(query) {
  const params = new URLSearchParams({
    key: YT_KEY,
    part: 'snippet',
    q: query,
    maxResults: String(Math.min(N_MAX_SEARCH_RESULTS, 30)),
    type: 'video',
    videoEmbeddable: 'true',
    safeSearch: 'moderate',
    relevanceLanguage: 'en',
  });
  const res = await fetch(`${YT_SEARCH_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`YouTube search failed: ${res.status}`);
  const data = await res.json();
  return data.items || [];
}

async function ytVideosDetails(ids) {
  const params = new URLSearchParams({
    key: YT_KEY,
    part: 'snippet,statistics,contentDetails',
    id: ids.join(','),
    maxResults: String(ids.length),
  });
  const res = await fetch(`${YT_VIDEOS_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`YouTube videos failed: ${res.status}`);
  const data = await res.json();
  return data.items || [];
}

function applyHardFilters(video, niche) {
  if (video.live !== 'none') return 'live';
  if (video.durationSeconds < MIN_DURATION_SEC) return 'too_short';
  if (video.durationSeconds <= SHORTS_MAX_SEC) return 'shorts';
  if (video.isShorts) return 'shorts';

  const views = video.views || 0;
  const minView = niche ? VIEWS_MIN_NICHE : VIEWS_MIN_GENERIC;
  if (views < VIEWS_HARD_FLOOR) return 'views_floor';
  if (views < minView) return 'views_threshold';

  if (video.blacklisted) return 'blacklisted';
  return null;
}

function isBlacklisted(snippet = {}) {
  const hay = `${snippet.title || ''} ${snippet.description || ''}`.toLowerCase();
  const bad = [
    'roblox', 'minecraft', 'fortnite', 'gaming', 'piggy', '#shorts',
    'motivazione', 'motivation', 'yoga', 'meditazione', 'mindfulness', 'sadhguru', 'guru'
  ];
  return bad.some(b => hay.includes(b));
}

function extractMainKeyword(article) {
  const tryPick = (words = []) => {
    const found = (words || []).find(w => w && w.length >= 5);
    return found ? found.toLowerCase() : null;
  };
  const fromSlug = article.slug ? tryPick(String(article.slug).split('-')) : null;
  if (fromSlug) return fromSlug;
  const fromTitle = tryPick((article.title || '').toLowerCase().split(/\s+/));
  return fromTitle;
}

function videoHasKeyword(video, keyword) {
  if (!keyword) return true;
  const hay = `${video.title || ''} ${video.description || ''}`.toLowerCase();
  return hay.includes(keyword.toLowerCase());
}

function computeScores(video, rel, niche) {
  const relevance = clamp(rel || 0, 0, 1);
  const viewsScore = Math.log10((video.views || 1) + 1);
  const likeRate = video.views ? (video.likeCount || 0) / video.views : 0;
  const commentRate = video.views ? (video.commentCount || 0) / video.views : 0;
  const engagementScore = clamp(likeRate * 5 + commentRate * 2, 0, 1); // euristica
  const dur = video.durationSeconds || 0;
  let durationScore = 0.4;
  if (dur >= 360 && dur <= 1200) durationScore = 1; // 6-20 min best
  else if (dur >= 240 && dur < 360) durationScore = 0.7;
  else if (dur > 1200 && dur <= 2700) durationScore = 0.6;
  const monthsAgo = video.publishedAt ? (Date.now() - new Date(video.publishedAt).getTime()) / (1000 * 60 * 60 * 24 * 30) : 120;
  const freshnessScore = monthsAgo <= 36 ? 1 : monthsAgo <= 60 ? 0.6 : 0.3;

  const total =
    0.45 * relevance +
    0.20 * viewsScore +
    0.15 * engagementScore +
    0.10 * durationScore +
    0.10 * freshnessScore;
  return { total, relevance, engagementScore, durationScore, freshnessScore, viewsScore };
}

async function main() {
  const args = process.argv.slice(2).filter(Boolean);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  const slug = args.find(a => !a.startsWith('-'));

  if (!slug) {
    console.error('❌ Specifica uno slug: node scripts/youtube-video-picker.js "<slug>" [--dry-run]');
    process.exit(1);
  }
  if (!SANITY_API_TOKEN) {
    console.error('❌ SANITY_API_TOKEN mancante');
    process.exit(1);
  }
  if (!YT_KEY) {
    console.error('❌ YOUTUBE_API_KEY mancante');
    process.exit(1);
  }

  console.log(`\n🎥 YouTube Picker - slug: ${slug} ${dryRun ? '(dry-run)' : ''}\n`);

  const article = await fetchArticle(slug);
  if (!article) {
    console.error('❌ Articolo non trovato o non pubblicato');
    process.exit(1);
  }

  const headings = extractHeadingsFromBody(article.body);
  const safeHeadings = Array.isArray(headings) ? headings : [];
  const safeCategories = Array.isArray(article.categories) ? article.categories.filter(Boolean) : [];
  const safeTopics = Array.isArray(article.topics) ? article.topics.filter(Boolean) : [];
  const articleData = {
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt || '',
    headings: safeHeadings,
    categories: safeCategories,
    topics: safeTopics,
  };

  // Cache check (skip if --force)
  const signature = hashSignature([
    article.title,
    article.excerpt || '',
    safeHeadings.join('|'),
    safeCategories.join('|'),
    safeTopics.join('|'),
  ]);
  if (!force && article.youtube?.signatureHash === signature && article.youtube?.pickedAt) {
    const pickedAt = new Date(article.youtube.pickedAt).getTime();
    const ageDays = (Date.now() - pickedAt) / (1000 * 60 * 60 * 24);
    if (ageDays < CACHE_TTL_DAYS) {
      console.log('⏭️ Cache valida, salto (youtube già selezionato di recente)');
      process.exit(0);
    }
  }

  const queries = buildQueries(articleData);
  console.log('🔎 Query generate:', queries);

  // Collect candidates
  const videosMap = new Map();
  for (const q of queries) {
    try {
      const res = await ytSearch(q);
      res.forEach(item => {
        const vid = item.id?.videoId;
        if (!vid) return;
        if (!videosMap.has(vid)) {
          videosMap.set(vid, {
            id: vid,
            title: item.snippet?.title || '',
            description: item.snippet?.description || '',
            channelTitle: item.snippet?.channelTitle || '',
            live: item.snippet?.liveBroadcastContent || 'none',
            query: q,
          });
        }
      });
    } catch (err) {
      console.warn(`⚠️ Search fallita per "${q}":`, err.message);
    }
  }

  const ids = Array.from(videosMap.keys());
  if (ids.length === 0) {
    console.log('⚠️ Nessun candidato trovato');
    if (!dryRun) {
      await sanityClient.patch(article._id).set({
        youtube: null,
        showYouTubeVideo: false,
      }).commit({ autoGenerateArrayKeys: true });
    }
    process.exit(0);
  }

  // fetch details in batches
  const details = [];
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    try {
      const det = await ytVideosDetails(chunk);
      details.push(...det);
    } catch (err) {
      console.warn('⚠️ videos.list fallita:', err.message);
    }
  }

  // merge details
  const candidates = details.map(item => {
    const base = videosMap.get(item.id);
    const stats = item.statistics || {};
    const snippet = item.snippet || {};
    const durationSeconds = isoDurationToSeconds(item.contentDetails?.duration);
    const lang = snippet.defaultAudioLanguage || snippet.defaultLanguage || '';
    const blacklisted = isBlacklisted(snippet);
    return {
      id: item.id,
      title: snippet.title || base?.title || '',
      description: snippet.description || base?.description || '',
      channelTitle: snippet.channelTitle || base?.channelTitle || '',
      views: Number(stats.viewCount || 0),
      likeCount: Number(stats.likeCount || 0),
      commentCount: Number(stats.commentCount || 0),
      durationSeconds,
      publishedAt: snippet.publishedAt,
      live: base?.live || snippet.liveBroadcastContent || 'none',
      blacklisted,
      lang: lang.toLowerCase(),
      query: base?.query,
    };
  });

  const niche = isNiche([article.title, ...safeHeadings, ...safeCategories, ...safeTopics]);
  console.log(`📊 Candidati totali trovati: ${candidates.length}, isNiche: ${niche}`);
  
  // Log drop reasons
  const dropReasons = {};
  const mainKeyword = extractMainKeyword(articleData);
  const filtered = candidates.filter(c => {
    const reason = applyHardFilters(c, niche);
    if (reason) {
      c._dropReason = reason;
      dropReasons[reason] = (dropReasons[reason] || 0) + 1;
      return false;
    }
    // Language: accept only English for MoneyWithSense
    if (c.lang && !c.lang.startsWith('en')) {
      c._dropReason = 'lang';
      return false;
    }
    // keyword hard-match: titolo/descrizione deve contenere la mainKeyword (se esiste)
    if (mainKeyword && !videoHasKeyword(c, mainKeyword)) {
      c._dropReason = 'keyword';
      return false;
    }
    return true;
  });

  // Log why videos were dropped
  if (Object.keys(dropReasons).length > 0) {
    console.log('📉 Motivi di esclusione:');
    Object.entries(dropReasons).forEach(([reason, count]) => {
      console.log(`   - ${reason}: ${count} video`);
    });
  }
  console.log(`✅ Video che passano i filtri: ${filtered.length}`);

  if (filtered.length === 0) {
    console.log('⚠️ Nessun candidato supera i filtri minimi');
    if (!dryRun) {
      await sanityClient.patch(article._id).set({
        youtube: null,
        showYouTubeVideo: false,
      }).commit({ autoGenerateArrayKeys: true });
    }
    process.exit(0);
  }

  // Ordina per views per limitare LLM
  const sorted = filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
  const limited = sorted.slice(0, MAX_CANDIDATES_FOR_LLM);

  // relevance via Gemini + fallback
  for (const vid of limited) {
    const gemRes = await getRelevanceViaGemini(articleData, vid);
    if (gemRes) {
      vid.relevance = gemRes.relevance;
      vid.reason = gemRes.reason;
      vid.takeaways = gemRes.takeaways;
    } else {
      vid.relevance = heuristicRelevance(articleData, vid);
      vid.reason = '';
      vid.takeaways = [];
    }
    // Language preference: slight penalty if not English
    if (vid.lang && !vid.lang.startsWith('en')) {
      vid.relevance *= 0.85;
    }
    vid.score = computeScores(vid, vid.relevance, niche);
  }

  // Log candidate stats before filtering
  console.log(`📊 Candidati prima del filtro relevance: ${limited.length}`);
  limited.forEach(v => {
    console.log(`   - "${v.title?.substring(0, 40)}..." views=${v.views} rel=${(v.relevance || 0).toFixed(2)}`);
  });

  // Filter by relevance >= 0.6 (lowered from 0.85 for better results)
  const strong = limited.filter(v => (v.relevance || 0) >= 0.6);
  if (strong.length === 0) {
    console.log('⚠️ Nessun candidato supera la soglia di rilevanza (0.6)');
    if (!dryRun) {
      await sanityClient.patch(article._id).set({
        youtube: null,
        showYouTubeVideo: false,
      }).commit({ autoGenerateArrayKeys: true });
    }
    process.exit(0);
  }
  const winner = strong.sort((a, b) => b.score.total - a.score.total)[0];

  if (!winner) {
    console.log('⚠️ Nessun vincitore selezionato');
    if (!dryRun) {
      await sanityClient.patch(article._id).set({
        youtube: null,
        showYouTubeVideo: false,
      }).commit({ autoGenerateArrayKeys: true });
    }
    process.exit(0);
  }

  // Embed check
  const embeddable = await oEmbedCheck(winner.id);
  if (!embeddable) {
    console.log('⚠️ Video non embeddabile, fallback a nessun video');
    if (!dryRun) {
      await sanityClient.patch(article._id).set({
        youtube: null,
        showYouTubeVideo: false,
      }).commit({ autoGenerateArrayKeys: true });
    }
    process.exit(0);
  }

  const payload = {
    youtube: {
      videoId: winner.id,
      title: winner.title,
      channelTitle: winner.channelTitle,
      url: `https://www.youtube.com/watch?v=${winner.id}`,
      embedUrl: `https://www.youtube.com/embed/${winner.id}`,
      reason: winner.reason || `We chose this video because it explains ${article.title.toLowerCase()} well.`,
      takeaways: winner.takeaways && winner.takeaways.length > 0
        ? winner.takeaways.slice(0, 3)
        : undefined,
      metrics: {
        views: winner.views,
        likeCount: winner.likeCount,
        commentCount: winner.commentCount,
        durationSeconds: winner.durationSeconds,
        publishedAt: winner.publishedAt,
      },
      lang: winner.lang || '',
      score: winner.score?.total || 0,
      relevance: winner.relevance || 0,
      queries,
      pickedAt: new Date().toISOString(),
      signatureHash: signature,
    },
    showYouTubeVideo: true,
    youtubeUrl: winner.id,
    youtubeTitle: winner.title,
    youtubeDescription: VIDEO_INTRO_TEXT,
  };

  console.log('\n🏆 Video scelto:', winner.id, '-', winner.title);
  console.log('   Score:', winner.score?.total?.toFixed(3), 'Relevance:', winner.relevance?.toFixed(3), 'Views:', winner.views);

  if (dryRun) {
    console.log('\n💾 Dry-run: payload non salvato.');
    console.log(JSON.stringify(payload, null, 2));
    process.exit(0);
  }

  await sanityClient.patch(article._id).set(payload).commit({ autoGenerateArrayKeys: true });
  console.log('✅ Salvato su Sanity');
}

main().catch(err => {
  console.error('❌ Errore YouTube picker:', err.message);
  process.exit(1);
});

