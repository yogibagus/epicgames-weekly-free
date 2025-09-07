# Vercel Deployment Guide

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/epic-games-free-weekly-api)

## Manual Deployment

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Deploy to Vercel
```bash
vercel
```

### 3. Environment Variables
No environment variables are required for basic functionality.

## Configuration

The project is pre-configured for Vercel with:

- **Puppeteer**: Uses `@sparticuz/chromium` for serverless compatibility
- **Function Timeout**: 30 seconds for the scraping API
- **Region**: Deployed to `iad1` (US East)
- **CORS**: Configured for cross-origin requests

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/epic/weekly-free` - Scrape Epic Games free games

## Performance Notes

- First request may take longer due to cold start
- Subsequent requests will be faster
- Puppeteer runs in serverless environment with optimized Chromium

## Troubleshooting

If you encounter issues:

1. Check Vercel function logs
2. Ensure all dependencies are in `package.json`
3. Verify the API endpoint is accessible
4. Check for any build errors in Vercel dashboard
