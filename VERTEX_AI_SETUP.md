# Vertex AI Setup Guide

This guide explains how to configure Vertex AI to use advanced Gemini models like `gemini-2.5-pro` or `gemini-2.0-flash-exp`.

## Why Vertex AI?

- Access to latest models: `gemini-2.5-pro`, `gemini-2.0-flash-exp`
- Better rate limits and quotas
- More control over model versions
- Enterprise-grade features

## Prerequisites

1. **Google Cloud Platform Account**
   - Sign up at https://cloud.google.com
   - Create a new project or use existing one

2. **Enable Vertex AI API**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Navigate to "APIs & Services" → "Library"
   - Search for "Vertex AI API"
   - Click "Enable"

3. **Create Service Account**
   - Go to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Name: `vertex-ai-generator`
   - Grant role: `Vertex AI User`
   - Create and download JSON key

## Local Setup

### 1. Install Google Cloud SDK (optional, for local auth)

```bash
# macOS
brew install google-cloud-sdk

# Or download from: https://cloud.google.com/sdk/docs/install
```

### 2. Authenticate

```bash
gcloud auth application-default login
```

### 3. Set Environment Variables

Create `.env.local`:

```env
GCP_PROJECT_ID=your-project-id
GCP_LOCATION=us-central1
GEMINI_MODEL=gemini-2.0-flash-exp  # or gemini-2.5-pro when available

# Optional: Use service account key file
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

## GitHub Actions Setup

### 1. Add Secrets to GitHub

Go to your repository → Settings → Secrets and variables → Actions

Add these secrets:

- **`GCP_PROJECT_ID`**: Your Google Cloud project ID
- **`GCP_LOCATION`**: Region (default: `us-central1`)
- **`GOOGLE_APPLICATION_CREDENTIALS_JSON`**: Content of your service account JSON key file (paste entire JSON)
- **`GEMINI_MODEL`** (optional): Model name (default: `gemini-2.0-flash-exp`)

### 2. Get Service Account JSON

1. Download the JSON key file from Google Cloud Console
2. Open it in a text editor
3. Copy the entire JSON content
4. Paste it as `GOOGLE_APPLICATION_CREDENTIALS_JSON` secret in GitHub

**Important**: The workflow will automatically create the credentials file from this secret.

## Available Models

### Vertex AI Models

- `gemini-2.0-flash-exp` (recommended, fast, good quality)
- `gemini-2.5-pro` (when available, best quality)
- `gemini-1.5-pro` (stable, high quality)
- `gemini-1.5-flash` (fast, good quality)

### Google AI Studio Models (fallback)

If Vertex AI is not configured, the system falls back to:
- `gemini-1.5-flash` (works with API key)
- `gemini-pro` (stable)

## Testing

### Test Locally

```bash
# Set environment variables
export GCP_PROJECT_ID=your-project-id
export GCP_LOCATION=us-central1
export GEMINI_MODEL=gemini-2.0-flash-exp

# Test Cost of Living generator
node scripts/ai-costofliving-generator.js "London" "UK" 2026
```

### Test on GitHub Actions

1. Go to Actions → "Cost of Living Content Generation"
2. Click "Run workflow"
3. Fill in the form
4. The workflow will automatically use Vertex AI if `GCP_PROJECT_ID` is set

## Troubleshooting

### Error: "Project not found"
- Verify `GCP_PROJECT_ID` is correct
- Ensure Vertex AI API is enabled in the project

### Error: "Permission denied"
- Check service account has `Vertex AI User` role
- Verify credentials JSON is valid

### Error: "Model not found"
- Check model name is correct (case-sensitive)
- Verify model is available in your region
- Try `gemini-2.0-flash-exp` first (most widely available)

### Fallback to Google AI Studio

If Vertex AI fails, the system automatically falls back to Google AI Studio API (if `GEMINI_API_KEY` is set).

## Cost Considerations

- Vertex AI pricing: https://cloud.google.com/vertex-ai/pricing
- Google AI Studio: Free tier available, then pay-as-you-go
- Consider using `gemini-2.0-flash-exp` for cost efficiency

## Next Steps

1. Set up GCP project and enable Vertex AI API
2. Create service account and download JSON key
3. Add secrets to GitHub Actions
4. Test with a simple workflow run
5. Monitor costs in Google Cloud Console
