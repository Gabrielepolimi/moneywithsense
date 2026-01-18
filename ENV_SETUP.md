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

# ----- NEWSLETTER -----

# Google Sheets Webhook (per salvare iscrizioni newsletter)
GOOGLE_SHEETS_WEBHOOK_URL=your_google_apps_script_url_here

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

---

### 5. GOOGLE_SHEETS_WEBHOOK_URL (Newsletter)

Per salvare le iscrizioni alla newsletter su Google Sheets:

#### Step 1: Crea il Google Sheet

1. Vai su [Google Sheets](https://sheets.google.com)
2. Crea un nuovo foglio chiamato `MoneyWithSense Newsletter`
3. Nella prima riga, crea queste colonne:
   - A1: `Timestamp`
   - B1: `First Name`
   - C1: `Last Name`
   - D1: `Email`
   - E1: `Interests`
   - F1: `Topics`
   - G1: `Subscription Date`

#### Step 2: Crea il Google Apps Script

1. Nel foglio, vai su **Extensions** → **Apps Script**
2. Cancella il codice esistente e incolla questo:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      new Date(),                    // Timestamp
      data.firstName || '',          // First Name
      data.lastName || '',           // Last Name
      data.email || '',              // Email
      data.interests || '',          // Interests
      data.topics || '',             // Topics
      data.subscriptionDate || ''    // Subscription Date
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'Newsletter webhook is active' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Salva il progetto (Ctrl+S)

#### Step 3: Deploy come Web App

1. Clicca **Deploy** → **New deployment**
2. Tipo: **Web app**
3. Impostazioni:
   - Description: `Newsletter Webhook`
   - Execute as: `Me`
   - Who has access: `Anyone`
4. Clicca **Deploy**
5. Copia l'**URL** del deployment

#### Step 4: Configura l'environment variable

Usa l'URL copiato come valore per `GOOGLE_SHEETS_WEBHOOK_URL`:

```bash
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/xxx.../exec
```

**Aggiungi questa variabile anche su Vercel** per la produzione.

---

## Test

Dopo aver configurato, testa con:

```bash
node scripts/ai-content-generator.js --test
```

### Test Newsletter (manuale)

```bash
curl -X POST https://moneywithsense.com/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","interests":["saving"],"topics":[]}'
```
