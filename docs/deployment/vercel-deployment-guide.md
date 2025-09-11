# 🚀 NeonPro Vercel Deployment Guide
*Complete deployment configuration and troubleshooting guide*

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Configuration Files](#configuration-files)
- [Deployment Steps](#deployment-steps)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [Validation](#validation)
- [Rollback Procedures](#rollback-procedures)

---

## 🎯 Overview

NeonPro uses a **hybrid deployment strategy** on Vercel, combining:

- **Frontend**: React + Vite SPA deployed as static files
- **Backend**: Hono.js API deployed as Vercel Functions
- **Framework**: Configured as `null` to prevent auto-detection conflicts

### Key Architecture Features:
- ✅ **Monorepo Support**: Turborepo for efficient builds
- ✅ **Edge Functions**: Hono API on Vercel Edge Runtime
- ✅ **Static Assets**: Optimized caching for web resources
- ✅ **Security Headers**: Healthcare-grade security configuration
- ✅ **Regional Deployment**: Brazil-optimized (GRU1 region)

---

## 🔧 Prerequisites

### Local Requirements:
```bash
# Node.js 20+ with corepack enabled
node --version  # >= 20.0.0
corepack enable
corepack prepare pnpm@9.0.0 --activate

# Vercel CLI for deployment management
npm i -g vercel@latest
vercel --version
```

### Project Setup:
```bash
# Clone and setup project
git clone https://github.com/your-org/neonpro.git
cd neonpro
pnpm install

# Build verification
pnpm turbo build
```

### Vercel Account Setup:
- ✅ Vercel Pro account (required for teams)
- ✅ GitHub repository connected
- ✅ Environment variables configured
- ✅ Domain configured (optional)

---

## 📁 Configuration Files

### 1. **Primary Configuration: `vercel.json`**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "version": 2,
  "framework": null,                    // CRITICAL: Prevents auto-detection
  "regions": ["gru1"],                  // Brazil optimization
  "buildCommand": "pnpm turbo build --filter=@neonpro/web --filter=@neonpro/api",
  "outputDirectory": "apps/web/dist",   // Static files location
  "installCommand": "corepack enable && corepack prepare pnpm@9.0.0 --activate && pnpm install --no-frozen-lockfile",
  "cleanUrls": true,
  "trailingSlash": false,

  "rewrites": [
    // API routing to Hono function
    { "source": "/api/(.*)", "destination": "/api/index.ts" },
    // SPA routing for React Router
    { "source": "/((?!api|.*\\..*).*)", "destination": "/index.html" }
  ],
  
  "headers": [
    // Static asset caching
    {
      "source": "/(.*)\\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    // Security headers for all routes
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "geolocation=(), microphone=(), camera=()" }
      ]
    }
  ]
}
```

### 2. **API Entry Point: `api/index.ts`**

```typescript
// CRITICAL: Default export pattern for Vercel Functions
import { app } from '../apps/api/src/app'

export default app
```

### 3. **API Application: `apps/api/src/app.ts`**

```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono()

// Middleware
app.use('*', cors())
app.use('*', logger())

// Routes
app.get('/api/health', (c) => c.json({ status: 'ok' }))
app.get('/api/v1/health', (c) => c.json({ status: 'healthy', service: 'neonpro-api' }))

// OpenAPI
app.get('/api/openapi.json', (c) => c.json({
  openapi: '3.0.0',
  info: { title: 'NeonPro API', version: '1.0.0' },
  paths: {}
}))

export { app }
```

---

## 🚀 Deployment Steps

### Method 1: **GitHub Integration (Recommended)**

1. **Connect Repository**:
   ```bash
   vercel --prod
   # Follow prompts to connect GitHub repo
   ```

2. **Configure Project**:
   - Framework: **Other** (not Next.js!)
   - Build Command: `pnpm turbo build --filter=@neonpro/web --filter=@neonpro/api`
   - Output Directory: `apps/web/dist`
   - Install Command: `corepack enable && corepack prepare pnpm@9.0.0 --activate && pnpm install`

3. **Auto-deployment**:
   - Push to `main` branch triggers production deployment
   - Pull requests create preview deployments

### Method 2: **Manual Deployment**

```bash
# Deploy to production
vercel --prod

# Deploy specific branch
vercel --prod --meta gitCommitSha=$(git rev-parse HEAD)

# Force rebuild (clears cache)
vercel --prod --force
```

### Method 3: **CI/CD Pipeline**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Enable Corepack
        run: corepack enable
        
      - name: Install dependencies
        run: corepack prepare pnpm@9.0.0 --activate && pnpm install
        
      - name: Build project
        run: pnpm turbo build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🔐 Environment Variables

### Required Variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Frontend Environment Variables (VITE_ prefix)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Security & Encryption
JWT_SECRET=your-super-secret-jwt-key-here
ENCRYPTION_KEY=32-character-encryption-key-here

# Application Configuration
NODE_ENV=production
LOG_LEVEL=info
VERCEL_REGION=gru1
```

### Setting Variables in Vercel:

1. **Via Dashboard**:
   - Go to Project → Settings → Environment Variables
   - Add each variable with appropriate scope (Production/Preview/Development)

2. **Via CLI**:
   ```bash
   vercel env add NODE_ENV production
   vercel env add DATABASE_URL postgresql://... production
   vercel env add SUPABASE_URL https://... production
   ```

3. **Bulk Import**:
   ```bash
   # From .env file
   vercel env pull .env.vercel.production
   # Edit file then push back
   vercel env push .env.vercel.production
   ```

---

## 🔍 Troubleshooting

### Common Issues & Solutions:

#### 1. **Framework Auto-Detection**

**Problem**: Vercel detects as Next.js instead of static + functions

**Symptoms**:
- API endpoints return web app responses
- Hono routes return 404
- Next.js headers in responses

**Solution**:
```json
// vercel.json - MUST have framework: null
{
  "framework": null,  // This prevents auto-detection
  "version": 2
}
```

**Verification**:
```bash
# Check project settings
vercel project ls
# Should show Framework: "Other" not "Next.js"
```

#### 2. **Build Command Issues**

**Problem**: Build fails with dependency or command errors

**Solution**:
```bash
# Ensure correct install command
"installCommand": "corepack enable && corepack prepare pnpm@9.0.0 --activate && pnpm install --no-frozen-lockfile"

# Ensure correct build command
"buildCommand": "pnpm turbo build --filter=@neonpro/web --filter=@neonpro/api"
```

#### 3. **API Routing Problems**

**Problem**: `/api/*` routes not reaching Hono functions

**Root Causes**:
- Incorrect export pattern in `api/index.ts`
- Missing or wrong rewrite rules
- Framework detection overriding routes

**Solutions**:
```typescript
// api/index.ts - MUST be default export
import { app } from '../apps/api/src/app'
export default app  // Not: export { app }
```

```json
// vercel.json - Correct rewrite
"rewrites": [
  { "source": "/api/(.*)", "destination": "/api/index.ts" }
]
```

#### 4. **Environment Variable Issues**

**Problem**: Variables not available during build or runtime

**Debugging**:
```bash
# Check if variables are set
vercel env ls

# Pull current environment
vercel env pull .env.debug

# Test build locally
vercel build
```

#### 5. **Cache Issues**

**Problem**: Old deployment artifacts causing issues

**Solution**:
```bash
# Force rebuild without cache
vercel --prod --force

# Clear deployment cache via dashboard
# Project → Settings → General → Clear Cache
```

---

## ✅ Validation

### 1. **Smoke Test**

Run the automated smoke test script:

```bash
# Simple validation
./scripts/simple-smoke-test.sh https://your-deployment.vercel.app

# Comprehensive validation
./scripts/smoke-test.sh https://your-deployment.vercel.app true
```

### 2. **Manual Testing**

```bash
# Test homepage
curl -I https://your-deployment.vercel.app
# Should return: 200 OK

# Test API health
curl https://your-deployment.vercel.app/api/health
# Should return: {"status":"ok"}

# Test API v1 health
curl https://your-deployment.vercel.app/api/v1/health
# Should return: {"status":"healthy","service":"neonpro-api"}

# Test OpenAPI spec
curl https://your-deployment.vercel.app/api/openapi.json
# Should return: JSON with openapi field
```

### 3. **Performance Testing**

```bash
# Response time testing
time curl https://your-deployment.vercel.app/api/health
# Should be < 1 second

# Load testing
ab -n 100 -c 10 https://your-deployment.vercel.app/api/health
```

### 4. **Function Verification**

In Vercel Dashboard:
1. Go to **Functions** tab
2. Verify `api/index.ts` is listed as active
3. Check function logs for errors
4. Test function invocation directly

---

## 🔄 Rollback Procedures

### Quick Rollback Commands:

```bash
# Emergency rollback to previous deployment
vercel rollback $(vercel ls --limit 2 --json | jq -r '.[1].url')

# Promote specific deployment
vercel promote https://neonpro-git-abc123.vercel.app

# Deploy specific git commit
vercel --prod --meta gitCommitSha=abc123def456
```

### Complete Rollback Guide:

See detailed procedures in: [`docs/deployment/rollback-guide.md`](rollback-guide.md)

---

## 📊 Monitoring & Maintenance

### Ongoing Monitoring:

```bash
# Check deployment logs
vercel logs --follow

# Monitor function performance
vercel logs --filter=function

# Check project status
vercel project ls
```

### Regular Maintenance:

1. **Weekly**: Review function logs for errors
2. **Monthly**: Update dependencies and redeploy
3. **Quarterly**: Review performance metrics and optimize
4. **As needed**: Clear cache and force rebuild for issues

---

## 🆘 Emergency Contacts

### Critical Issues:
- **Immediate**: Use rollback procedures above
- **Escalation**: Contact development team
- **Platform Issues**: Vercel Support (Pro plan required)

### Support Resources:
- **Documentation**: This guide and linked resources
- **Monitoring**: Vercel Dashboard → Project → Functions/Logs
- **Community**: GitHub Issues for non-critical questions

---

## 🎯 Success Criteria

### Deployment Success Indicators:
- ✅ All smoke tests pass (>95% success rate)
- ✅ API endpoints return correct Hono responses
- ✅ Functions tab shows `api/index.ts` as active
- ✅ Response times < 1s for API endpoints
- ✅ No 5xx errors in function logs

### Post-Deployment Validation:
- ✅ User authentication flows work
- ✅ Database connectivity established
- ✅ Real-time features functional
- ✅ Security headers present
- ✅ Performance metrics within targets

---

Remember: This configuration has been tested and validated. Follow the exact patterns documented here for successful deployments.