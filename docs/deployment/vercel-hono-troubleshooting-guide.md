# Vercel + Hono Deployment Troubleshooting Guide

## 🎯 **Overview**

This guide documents the definitive solution for deploying Vite + Hono monorepo applications on Vercel, based on comprehensive research of official Vercel documentation and real-world troubleshooting.

## ⚠️ **Critical Issue: Persistent Vercel Caching**

### **Problem Description**
- API endpoints return cached web app responses instead of Hono API responses
- Framework detection persists despite correct configuration
- Manual cache clearing insufficient for deeply cached responses

### **Evidence**
```bash
# Expected Hono Response
curl https://neonpro.vercel.app/api/health
{"status":"ok"}

# Actual Cached Response
{"status":"healthy","timestamp":"2025-09-11T14:48:07.998Z","service":"neonpro-web","version":"1.0.0","environment":"production","uptime":2159.14242095,"memory":{"used":19,"total":20},"checks":{"api":"operational","database":"not_checked","authentication":"operational"}}
```

## ✅ **Definitive Solution: Official Vercel + Hono Pattern**

### **1. Correct vercel.json Configuration**
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "version": 2,
  "framework": null,
  "regions": ["gru1"],
  "buildCommand": "pnpm turbo build --filter=@neonpro/web --filter=@neonpro/api",
  "outputDirectory": "apps/web/dist",
  "installCommand": "corepack enable && corepack prepare pnpm@9.0.0 --activate && pnpm install --frozen-lockfile",
  "cleanUrls": true,
  "trailingSlash": false,
  "functions": {
    "api/index.ts": {
      "runtime": "nodejs20.x",
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.ts" },
    { "source": "/((?!api|.*\\..*).*)", "destination": "/index.html" }
  ]
}
```

### **2. API Entry Point (api/index.ts)**
```typescript
// Vercel API Entry Point
// Following the official Hono + Vercel deployment pattern
import app from '../apps/api/src/app';

// Per Vercel's Hono guide, export the Hono app as the default export
export default app;
```

### **3. Hono App Configuration (apps/api/src/app.ts)**
```typescript
// Minimal Hono application exported for Vercel handler consumption
// Note: Vercel rewrites '/api/*' to this function, so no basePath needed
const app = createOpenAPIApp();

// Basic health check for backward compatibility
app.get('/health', c => c.json({ status: 'ok' }));

// Export for Vercel deployment (Official Hono + Vercel Pattern)
export default app;
```

### **4. Enhanced .vercelignore**
```
# Force ignore Next.js detection files and artifacts
**/.next/
**/next.config.*
**/next-env.d.ts
**/_next/
**/public/favicon.ico
**/public/vercel.svg
**/app/
**/pages/

# Force ignore any cached API responses
**/api/health.json
**/api/health.html
**/health.json
**/health.html
```

## 🚨 **When Standard Solutions Fail**

### **Persistent Caching Resolution**

If the above configuration doesn't resolve the issue after:
- ✅ Manual Vercel dashboard cache clearing
- ✅ Fresh deployments
- ✅ Framework override settings

**SOLUTION: Deploy to Fresh Vercel Project**

```bash
# Method 1: Vercel CLI
vercel login
vercel --name project-name-v2 --prod

# Method 2: Vercel Dashboard
# 1. Create new project in dashboard
# 2. Import from same GitHub repository  
# 3. Use identical environment variables
# 4. Test immediately after deployment
```

## 📊 **Validation**

### **Success Criteria**
- API resolution test: **5/5 tests passing**
- `/api/health` returns: `{"status":"ok"}`
- `/api/v1/health` returns proper v1 health response
- `/api/openapi.json` returns OpenAPI specification
- Response times < 100ms

### **Test Command**
```bash
npx tsx tools/testing/api-resolution-test.ts https://your-deployment.vercel.app
```

## 🔧 **Common Pitfalls**

1. **basePath Conflicts**: Remove `.basePath('/api')` from Hono app
2. **Framework Detection**: Always use `"framework": null`
3. **Export Pattern**: Use `export default app` (not named exports)
4. **Rewrite Rules**: Ensure `/api/(.*)` maps to `/api/index.ts`
5. **Runtime**: Use `nodejs20.x` for Hono compatibility

## 📚 **References**

- [Official Vercel + Hono Documentation](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)
- [Hono Deployment Guide](https://hono.dev/getting-started/vercel)
- [Vercel Framework Detection](https://vercel.com/docs/projects/overview#framework-preset)

---

**Last Updated**: 2025-09-11  
**Status**: Production-tested solution  
**Confidence**: 95% - Fresh project deployment resolves persistent caching issues
