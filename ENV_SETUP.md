# 🔑 Environment Variables Setup

## Quick Setup

Crea un file `.env.local` nella root del progetto con questo contenuto:

```bash
# ===================================
# MoneyWithSense - Environment Variables
# ===================================

# ----- OBBLIGATORI -----

# Google Gemini AI (per generare contenuti)
GEMINI_API_KEY=your_gemini_api_key_here

# Sanity CMS Write Token (per pubblicare articoli)
SANITY_API_TOKEN=your_sanity_token_here

# ----- GIÀ CONFIGURATI -----

NEXT_PUBLIC_SANITY_PROJECT_ID=z0g6hj8g
NEXT_PUBLIC_SANITY_DATASET=production

# ----- OPZIONALI -----

# Unsplash (per immagini di qualità)
UNSPLASH_ACCESS_KEY=

# YouTube (per video correlati)
YOUTUBE_API_KEY=
```

---

## Come ottenere le API Keys

### 1. GEMINI_API_KEY (Obbligatoria)

1. Vai su [Google AI Studio](https://aistudio.google.com/apikey)
2. Clicca "Create API Key"
3. Seleziona o crea un progetto Google Cloud
4. Copia la key

**Costo:** Gratuito per uso moderato (15 RPM, 1M tokens/min)

---

### 2. SANITY_API_TOKEN (Obbligatoria)

1. Vai su [Sanity Manage](https://www.sanity.io/manage)
2. Seleziona il progetto `moneywithsense`
3. Vai su **API** → **Tokens**
4. Clicca "Add API Token"
5. Nome: `content-generator`
6. Permissions: **Editor**
7. Copia il token

---

### 3. UNSPLASH_ACCESS_KEY (Opzionale)

1. Vai su [Unsplash Developers](https://unsplash.com/developers)
2. Registrati/Accedi
3. Crea una nuova app
4. Copia "Access Key"

**Costo:** Gratuito (50 richieste/ora, 5000/mese)

**Nota:** Se non configurata, il sistema usa le immagini in `/public/images/fallback-finance/`

---

### 4. YOUTUBE_API_KEY (Opzionale)

1. Vai su [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Crea un progetto o selezionane uno
3. Abilita "YouTube Data API v3"
4. Crea credenziali → API Key

---

## Vercel (Produzione)

Per la produzione, aggiungi le variabili su Vercel:

1. Vai su [Vercel Dashboard](https://vercel.com)
2. Seleziona `moneywithsense`
3. Settings → Environment Variables
4. Aggiungi ogni variabile

---

## Test

Dopo aver configurato, testa con:

```bash
node scripts/ai-content-generator.js --test
```
