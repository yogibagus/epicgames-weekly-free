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

### Common Issues

#### 1. Chromium Launch Errors
If you see errors like `libnspr4.so: cannot open shared object file`:

- ✅ **Fixed**: Enhanced Chromium args with `--single-process` and `--no-zygote`
- ✅ **Fixed**: Added fallback configuration for Vercel
- ✅ **Fixed**: Proper environment variable configuration

#### 2. Build Failures
If the build fails:

1. Check Vercel function logs in the dashboard
2. Ensure all dependencies are in `package.json`
3. Verify TypeScript compilation passes locally with `npm run build`
4. Check for any missing environment variables

#### 3. API Timeout Issues
If requests timeout:

- The API has a 30-second timeout configured in `vercel.json`
- First request may be slower due to cold start
- Subsequent requests will be faster

#### 4. CORS Issues
If you get CORS errors:

- CORS is pre-configured in `next.config.js`
- All origins are allowed (`*`)
- Check if the request is going to the correct endpoint

### Debug Steps

1. **Check Vercel Logs**:
   ```bash
   vercel logs
   ```

2. **Test Locally**:
   ```bash
   npm run build
   npm run dev
   curl http://localhost:3000/api/health
   ```

3. **Verify Dependencies**:
   ```bash
   npm list @sparticuz/chromium puppeteer-core
   ```
