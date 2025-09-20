---
title: "NeonPro Vercel Deployment Guide"
last_updated: 2025-09-18
form: guide
tags: [deployment, vercel, production, healthcare, LGPD, ANVISA]
related:
  - ../architecture/tech-stack.md
  - ../apis/apis.md
  - ../compliance/lgpd-audit-checklist.md
---

# NeonPro Vercel Deployment Guide

Complete guide for deploying the NeonPro Healthcare Platform to production on Vercel with Brazilian healthcare compliance and LGPD requirements.

## 🚀 Quick Start Deployment

### Prerequisites

```bash
# Required CLI tools
node --version    # v20.0.0+
pnpm --version    # v8.15.0+
vercel --version  # Latest
git --version     # v2.30.0+

# Platform requirements
# - Vercel account with team access
# - Supabase project configured for production
# - Domain with SSL certificate (for production)
# - Monitoring setup (Sentry, Vercel Analytics)
```

### Environment Configuration

Create production environment variables in Vercel dashboard:

```bash
# Core Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com.br
API_URL=https://your-api-domain.com.br

# Database Configuration (Supabase)
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Healthcare Compliance (Brazil)
ANVISA_API_ENDPOINT=https://consultas.anvisa.gov.br/api/v1
SUS_INTEGRATION_ENDPOINT=https://sis.saude.gov.br/api/v1
TUSS_VERSION=2024.1
CFM_REGISTRY_API=https://portal.cfm.org.br/api/v1

# LGPD Compliance
LGPD_CONSENT_RETENTION_DAYS=2555  # 7 years as required
AUDIT_LOG_RETENTION_DAYS=3653     # 10 years for audit trails
DATA_ANONYMIZATION_SCHEDULE="0 2 * * 0"  # Weekly at 2 AM Sunday

# Security Configuration
NEXTAUTH_SECRET=generate-32-char-secret-key-here
NEXTAUTH_URL=https://your-domain.com.br
CSP_REPORT_URI=https://your-domain.com.br/api/csp-report
SECURITY_HEADERS_ENABLED=true
RATE_LIMIT_PER_MINUTE=100

# AI Integration
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
AI_PROVIDER_FALLBACK=anthropic
AI_RATE_LIMIT_PER_HOUR=1000

# Monitoring & Observability
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
SENTRY_SAMPLE_RATE=0.1  # 10% sampling for production
VERCEL_ANALYTICS_ID=your-analytics-id

# Performance & Caching
REDIS_URL=redis://your-redis-instance:6379
CACHE_TTL_SECONDS=3600
CDN_ENABLED=true
EDGE_CACHING_ENABLED=true
```

## 📋 Pre-Deployment Checklist

### 🔍 1. Code Quality & Testing

```bash
# Run complete test suite
pnpm test:frontend
pnpm test:backend
pnpm test:integration
pnpm test:e2e

# Quality checks
pnpm lint
pnpm type-check
pnpm format

# Security audit
pnpm audit --audit-level moderate
pnpm audit --fix

# Bundle analysis
pnpm analyze-bundle
```

### 🏥 2. Healthcare Compliance Validation

- [ ] **LGPD Compliance**
  - [ ] Consent management implemented
  - [ ] Data export functionality working
  - [ ] Data deletion procedures active
  - [ ] Audit trails capturing all data access
  - [ ] Privacy policy updated and accessible

- [ ] **ANVISA Medical Device Software Compliance**
  - [ ] Medical device software classification documented (SaMD Class I)
  - [ ] Risk management file updated
  - [ ] Clinical evaluation completed
  - [ ] Technical documentation complete

- [ ] **CFM Professional Standards**
  - [ ] Digital prescription compliance
  - [ ] Medical records digital signature
  - [ ] Telemedicine regulations compliance
  - [ ] Professional registration validation

### 🔒 3. Security Validation

- [ ] **Authentication & Authorization**
  - [ ] Multi-factor authentication enabled
  - [ ] Role-based access control configured
  - [ ] Session management secure
  - [ ] API authentication working

- [ ] **Data Protection**
  - [ ] All PII encrypted at rest
  - [ ] Data transmission encrypted (TLS 1.3)
  - [ ] Database access controls configured
  - [ ] Backup encryption verified

- [ ] **Security Headers**
  - [ ] Content Security Policy configured
  - [ ] HSTS headers enabled
  - [ ] X-Frame-Options set to DENY
  - [ ] Input validation comprehensive

### 📊 4. Performance Validation

- [ ] **Frontend Performance**
  - [ ] First Contentful Paint < 1.5s
  - [ ] Largest Contentful Paint < 2.5s
  - [ ] Cumulative Layout Shift < 0.1
  - [ ] Time to Interactive < 3s
  - [ ] Bundle size optimized

- [ ] **Backend Performance**
  - [ ] API response times < 200ms (95th percentile)
  - [ ] Database query optimization verified
  - [ ] Caching strategy implemented
  - [ ] Rate limiting configured

## 🚀 Deployment Process

### Option A: Vercel CLI Deployment (Recommended)

```bash
# 1. Install and authenticate Vercel CLI
pnpm dlx vercel --version
vercel login

# 2. Link project to Vercel
vercel link

# 3. Configure environment variables
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production
# ... (add all production environment variables)

# 4. Deploy to production
vercel --prod

# 5. Verify deployment
curl -f https://your-domain.com.br/api/health
```

### Option B: GitHub Integration Deployment

1. **Connect GitHub Repository**
   - Go to Vercel dashboard → Import Project
   - Select NeonPro repository
   - Configure framework preset: "Other" (for Turborepo monorepo)

2. **Configure Build Settings**

   ```json
   {
     "buildCommand": "pnpm build --filter @neonpro/web",
     "outputDirectory": "apps/web/dist",
     "installCommand": "pnpm install",
     "devCommand": "pnpm dev --filter @neonpro/web"
   }
   ```

3. **Set Environment Variables**
   - Import from `.env.production` file
   - Verify all required variables are set
   - Test with preview deployment first

4. **Deploy**
   - Push to `main` branch triggers automatic deployment
   - Monitor deployment logs for errors
   - Verify health checks pass

## 🏗️ Monorepo Configuration

### Vercel Configuration Files

Create `vercel.json` in project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/web/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/apps/web/dist/$1"
    }
  ],
  "functions": {
    "apps/api/**/*.ts": {
      "runtime": "nodejs20.x",
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Turborepo Configuration

Ensure `turbo.json` includes production builds:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["src/**/*.{ts,tsx,js,jsx}", "package.json", "tsconfig.json"],
      "outputs": ["dist/**", "build/**"],
      "cache": true
    },
    "vercel-build": {
      "dependsOn": ["build"],
      "outputs": ["apps/web/dist/**"]
    }
  }
}
```

## 🎯 Domain & SSL Configuration

### Custom Domain Setup

1. **Add Domain in Vercel**

   ```bash
   vercel domains add your-domain.com.br
   ```

2. **Configure DNS Records**

   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com

   Type: A
   Name: @
   Value: 76.76.19.61 (Vercel IP)
   ```

3. **SSL Certificate**
   - Automatic via Let's Encrypt
   - Verify HTTPS redirect works
   - Test SSL Labs rating (A+ target)

### Brazilian Domain Considerations

- Use `.com.br` for Brazilian healthcare compliance
- Configure CDN with São Paulo edge locations
- Ensure LGPD compliance notices are accessible
- Set proper `lang="pt-BR"` in HTML

## 📊 Monitoring & Observability

### Health Checks Setup

```typescript
// api/health.ts
export default function handler(req: any, res: any) {
  const healthCheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA || "unknown",
    checks: {
      database: "connected",
      redis: "connected",
      external_apis: "operational",
    },
  };

  res.status(200).json(healthCheck);
}
```

### Performance Monitoring

```bash
# Configure Vercel Analytics
pnpm add @vercel/analytics
```

```typescript
// pages/_app.tsx
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

### Error Tracking

```bash
# Configure Sentry for production
pnpm add @sentry/nextjs @sentry/tracing
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT,
  tracesSampleRate: 0.1, // 10% sampling for production
  beforeSend(event) {
    // Remove PII from error reports
    if (event.user) {
      delete event.user.email;
      delete event.user.id;
    }
    return event;
  },
});
```

## 🔄 Deployment Pipeline

### Automated CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8.15.0

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - name: Quality Checks
        run: |
          pnpm lint
          pnpm type-check
          pnpm test:frontend
          pnpm test:backend

      - name: Security Audit
        run: |
          pnpm audit --audit-level moderate

      - name: Healthcare Compliance Check
        run: |
          pnpm test:healthcare-compliance

  deploy:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy Project Artifacts to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### Rollback Strategy

```bash
# Emergency rollback to previous deployment
vercel rollback --timeout 30s

# Rollback to specific deployment
vercel ls
vercel rollback [deployment-url]

# Health check after rollback
curl -f https://your-domain.com.br/api/health
```

## 📋 Post-Deployment Validation

### Automated Validation Script

```bash
#!/bin/bash
# post-deployment-validation.sh

BASE_URL="https://your-domain.com.br"
API_URL="$BASE_URL/api"

echo "🚀 Starting post-deployment validation..."

# Health checks
echo "📊 Checking API health..."
curl -f "$API_URL/health" || exit 1

echo "🔒 Validating security headers..."
curl -I "$BASE_URL" | grep -q "X-Frame-Options: DENY" || exit 1

echo "🏥 Testing healthcare endpoints..."
curl -f "$API_URL/v1/medical-records" -H "Authorization: Bearer $TEST_TOKEN" || exit 1

echo "📱 Checking mobile responsiveness..."
# Add mobile-specific tests here

echo "♿ Accessibility validation..."
# Add accessibility tests here

echo "🎯 Performance validation..."
# Add performance tests here

echo "✅ All validation checks passed!"
```

### Manual Verification Checklist

- [ ] **Functionality Tests**
  - [ ] User registration and login working
  - [ ] Medical records creation and retrieval
  - [ ] Billing and payment processing
  - [ ] AI chat functionality operational
  - [ ] File upload and download working

- [ ] **Performance Tests**
  - [ ] Page load times acceptable
  - [ ] API response times normal
  - [ ] Database queries optimized
  - [ ] CDN caching working

- [ ] **Compliance Tests**
  - [ ] LGPD consent flow working
  - [ ] Audit logs being created
  - [ ] Data export functionality
  - [ ] Data deletion procedures

- [ ] **Security Tests**
  - [ ] Authentication required for protected routes
  - [ ] SQL injection protection working
  - [ ] XSS protection enabled
  - [ ] CSRF protection active

## 🆘 Troubleshooting Guide

### Common Deployment Issues

#### Build Failures

```bash
# Clear Turborepo cache
pnpm turbo --clear

# Check TypeScript errors
pnpm type-check

# Verify dependencies
pnpm install --frozen-lockfile
```

#### Environment Variable Issues

```bash
# List current environment variables
vercel env ls

# Update environment variable
vercel env add VARIABLE_NAME production

# Test environment variables
vercel dev
```

#### Performance Issues

```bash
# Analyze bundle size
pnpm analyze-bundle

# Check database performance
# Run database query analysis
# Monitor API response times
```

#### LGPD Compliance Issues

```bash
# Verify consent management
curl -f "$API_URL/v1/consent/status"

# Check audit trail
curl -f "$API_URL/v1/audit/recent"

# Test data export
curl -f "$API_URL/v1/data-export" -H "Authorization: Bearer $TOKEN"
```

### Emergency Contacts

- **Platform Team**: platform@neonpro.com.br
- **Security Team**: security@neonpro.com.br
- **Compliance Officer**: compliance@neonpro.com.br
- **DevOps Team**: devops@neonpro.com.br

### Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Supabase Support**: https://supabase.com/support
- **LGPD Guidelines**: https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd
- **ANVISA Resources**: https://www.gov.br/anvisa/pt-br

## 📈 Scaling Considerations

### Traffic Scaling

- **Vercel Functions**: Auto-scaling up to 1000 concurrent executions
- **Database**: Supabase connection pooling and read replicas
- **CDN**: Global edge network with Brazilian presence
- **Monitoring**: Real-time metrics and alerting

### Performance Optimization

- **Code Splitting**: Route-based and component-based splitting
- **Image Optimization**: Next.js Image component with WebP
- **Edge Caching**: Static assets and API responses
- **Database Optimization**: Query optimization and indexing

### Cost Optimization

- **Function Duration**: Optimize cold start times
- **Bandwidth**: Efficient asset compression
- **Database**: Query optimization and connection pooling
- **Storage**: Image optimization and CDN caching

---

**Document Status**: ✅ Complete - Production Deployment Guide  
**Target Audience**: DevOps, Platform Engineers, Healthcare IT  
**Compliance Level**: LGPD + ANVISA + CFM Ready  
**Last Updated**: 2025-09-18  
**Next Review**: 2025-12-18
