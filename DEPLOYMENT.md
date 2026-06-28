# TikTok Intelligence - Deployment Checklist

## Pre-Deployment Verification

### 1. Environment Variables ✅
Required variables in `.env.production`:
- [x] `DATABASE_URL` - Neon PostgreSQL connection string
- [x] `APIFY_API_TOKEN` - Apify API token for data scraping
- [x] `NEXTAUTH_SECRET` - NextAuth.js secret key
- [x] `NEXTAUTH_URL` - Production URL (https://tiktok.tubefission.com)
- [x] `GOOGLE_CLIENT_ID` - Google OAuth client ID
- [x] `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- [x] `CRON_SECRET_KEY` - Secret for cron job authentication

### 2. Build Verification ✅
- [x] TypeScript compilation passes
- [x] No critical build errors
- [x] Static generation works for all pages
- [x] Dynamic routes configured correctly
- [x] Middleware compilation successful

### 3. Security ✅
- [x] Security headers configured in next.config.mjs
- [x] CSP policy implemented in middleware.ts
- [x] Rate limiting enabled
- [x] HTTPS enforcement with HSTS
- [x] robots.txt created
- [x] sitemap.xml configured

### 4. Performance ✅
- [x] Image optimization configured (WebP/AVIF)
- [x] Next.js experimental optimizations enabled
- [x] Static asset caching headers configured
- [x] Loading states created for all routes
- [x] Code splitting working

### 5. SEO ✅
- [x] Meta tags configured in root layout
- [x] Structured data components created
- [x] FAQ structured data added
- [x] Breadcrumb navigation component created
- [x] OpenGraph and Twitter cards configured
- [x] Canonical URLs set

## Deployment Steps

### Option 1: Manual Deploy via Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Option 2: GitHub Actions Auto-Deploy
1. Push to `develop` branch → Automatic preview deployment
2. Create PR to `main` → Preview deployment with PR comment
3. Merge to `main` → Automatic production deployment

### Option 3: Deployment Script
```bash
# Make script executable
chmod +x deploy.sh

# Deploy to preview
./deploy.sh

# Deploy to production
./deploy.sh production
```

## Post-Deployment Verification

### 1. Smoke Tests
- [ ] Homepage loads correctly
- [ ] Explore page shows trends
- [ ] Trend detail pages work
- [ ] Creator pages load
- [ ] Hashtag pages work
- [ ] Login/Signup functional
- [ ] API endpoints respond

### 2. Performance Checks
- [ ] Lighthouse score > 80
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 2.5s
- [ ] No console errors

### 3. SEO Verification
- [ ] robots.txt accessible
- [ ] sitemap.xml accessible
- [ ] Meta tags present
- [ ] Structured data validates

### 4. Security Checks
- [ ] Security headers present
- [ ] HTTPS enforced
- [ ] No mixed content warnings
- [ ] CSP working correctly

## Monitoring Setup

### Vercel Analytics
- Enable in Vercel Dashboard → Analytics
- Monitor Core Web Vitals
- Track user interactions

### Error Tracking (Recommended)
Add Sentry integration:
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Database Monitoring
- Monitor Neon Dashboard
- Check connection pool usage
- Set up alerts for high latency

## Rollback Plan

If deployment issues occur:
1. Revert the last commit: `git revert HEAD`
2. Push to trigger new deployment
3. Or manually redeploy previous version in Vercel Dashboard

## Support Contacts

- Vercel Support: https://vercel.com/help
- Neon Support: https://neon.tech/docs/introduction
- Next.js Docs: https://nextjs.org/docs

## Notes

- Database migrations run automatically on production deploy
- Static pages are regenerated on each deploy
- API routes are serverless functions
- Cron jobs configured in vercel.json
