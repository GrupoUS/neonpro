# Vercel Mono-Repo Deployment Guide

## Overview

This document provides comprehensive guidance for deploying the NeonPro healthcare platform to Vercel using a mono-repo architecture. The platform includes both a React web application and a Node.js API service with healthcare compliance requirements.

## Architecture

### Mono-Repo Structure
```
neonpro/
├── apps/
│   ├── web/           # React web application (Vercel)
│   └── api/           # Node.js API service (Vercel)
├── packages/
│   ├── database/      # Database client and utilities
│   ├── ui/           # Shared React components
│   └── healthcare-core/ # Healthcare business logic
└── docs/
```

### Vercel Projects
- **Web Application**: `neonpro-web` (Primary app)
- **API Service**: `neonpro-api` (Backend service)

## Prerequisites

### Required Accounts
- [Vercel Account](https://vercel.com) with appropriate permissions
- [GitHub Repository](https://github.com) connected to Vercel
- [Supabase Project](https://supabase.com) for database services
- Environment variables configured in both Vercel projects

### Local Development Setup
```bash
# Install dependencies
bun install

# Verify local build works
bun run build

# Run tests
bun test
```

## Deployment Configuration

### Vercel.json Configuration

Each app has its own `vercel.json` with specific configurations:

#### Web Application (`apps/web/vercel.json`)
```json
{
  "framework": "vite",
  "buildCommand": "bun run build",
  "outputDirectory": "dist",
  "installCommand": "bun install",
  "devCommand": "bun run dev",
  "functions": {
    "app/**/*.tsx": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public,max-age=31536000,immutable"
        }
      ]
    },
    {
      "source": "/(.*\\.js)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public,max-age=31536000,immutable"
        }
      ]
    }
  ],
  "securityHeaders": {
    "contentSecurityPolicy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https: wss:;",
    "strictTransportSecurity": "max-age=63072000; includeSubDomains; preload",
    "xContentTypeOptions": "nosniff",
    "xFrameOptions": "DENY",
    "xXssProtection": "1; mode=block",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "permissionsPolicy": "camera=(), microphone=(), geolocation=()"
  },
  "env": {
    "VITE_API_URL": "https://neonpro-api.vercel.app/api",
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
```

#### API Service (`apps/api/vercel.json`)
```json
{
  "framework": "vite",
  "buildCommand": "bun run build",
  "outputDirectory": "dist",
  "installCommand": "bun install",
  "functions": {
    "src/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET,POST,PUT,DELETE,OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type,Authorization,X-Requested-With"
        }
      ]
    }
  ],
  "securityHeaders": {
    "contentSecurityPolicy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https: wss:;",
    "strictTransportSecurity": "max-age=63072000; includeSubDomains; preload",
    "xContentTypeOptions": "nosniff",
    "xFrameOptions": "DENY",
    "xXssProtection": "1; mode=block",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "permissionsPolicy": "camera=(), microphone=(), geolocation=()"
  },
  "env": {
    "DATABASE_URL": "@database_url",
    "SUPABASE_URL": "@supabase_url",
    "SUPABASE_SERVICE_KEY": "@supabase_service_key",
    "JWT_SECRET": "@jwt_secret",
    "AI_PROVIDER_API_KEY": "@ai_provider_api_key"
  }
}
```

## Environment Variables

### Web Application Environment Variables
```bash
# API Configuration
VITE_API_URL=https://neonpro-api.vercel.app/api

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Feature Flags
VITE_ENABLE_AI_CHAT=true
VITE_ENABLE_TELEMEDICINE=true
```

### API Service Environment Variables
```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Security Configuration
JWT_SECRET=your-jwt-secret-key
SESSION_SECRET=your-session-secret-key

# AI Configuration
AI_PROVIDER_API_KEY=your-ai-api-key
AI_MODEL=gpt-4
AI_MAX_TOKENS=4000

# Healthcare Compliance
AUDIT_LOG_ENABLED=true
LGPD_COMPLIANCE_ENABLED=true
HEALTHCARE_DATA_ENCRYPTION_KEY=your-encryption-key
```

## Deployment Scripts

### Deploy Script (`scripts/deploy.sh`)
```bash
#!/bin/bash
set -e

echo "🚀 Starting NeonPro deployment..."

# Check prerequisites
command -v vercel >/dev/null 2>&1 || { echo "❌ Vercel CLI not found"; exit 1; }
command -v bun >/dev/null 2>&1 || { echo "❌ Bun not found"; exit 1; }

# Ensure we're on main branch
if [[ $(git branch --show-current) != "main" ]]; then
    echo "❌ Must be on main branch to deploy"
    exit 1
fi

# Clean build artifacts
echo "🧹 Cleaning build artifacts..."
rm -rf node_modules/.cache
rm -rf .turbo
rm -rf packages/*/dist
rm -rf apps/*/dist

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Build packages first
echo "🔨 Building packages..."
bun run build:packages

# Build applications
echo "🔨 Building applications..."
bun run build

# Validate builds
echo "✅ Validating builds..."
if [[ ! -d "apps/web/dist" ]]; then
    echo "❌ Web build failed"
    exit 1
fi

if [[ ! -d "apps/api/dist" ]]; then
    echo "❌ API build failed"
    exit 1
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."

# Deploy API service
echo "📡 Deploying API service..."
cd apps/api
vercel --prod --yes
cd ../..

# Deploy web application
echo "🌐 Deploying web application..."
cd apps/web
vercel --prod --yes
cd ../..

echo "✅ Deployment complete!"
echo "🔗 Web Application: https://neonpro-web.vercel.app"
echo "🔗 API Service: https://neonpro-api.vercel.app"
```

## Build System Configuration

### Turbo.json Configuration
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    }
  }
}
```

### Package Build Scripts
```json
{
  "scripts": {
    "build": "turbo run build",
    "build:packages": "turbo run build --filter=@neonpro/*",
    "build:web": "cd apps/web && bun run build",
    "build:api": "cd apps/api && bun run build",
    "dev": "turbo run dev --parallel",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check"
  }
}
```

## Healthcare Compliance

### Security Headers
Both applications include comprehensive security headers:
- Content Security Policy (CSP)
- Strict Transport Security (HSTS)
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer Policy
- Permissions Policy

### Data Protection
- All database connections use Row Level Security (RLS)
- PII data is encrypted at rest and in transit
- Audit logging for all data access
- LGPD compliance for Brazilian healthcare data

### API Security
- JWT-based authentication
- Rate limiting on all endpoints
- Input validation and sanitization
- CORS restrictions
- Request logging and monitoring

## Monitoring and Observability

### Vercel Analytics
- Built-in analytics for both applications
- Real-time performance metrics
- Error tracking and alerting

### Custom Monitoring
```typescript
// API monitoring middleware
app.use('*', async (c, next) => {
  const start = Date.now()
  await next()
  const duration = Date.now() - start
  
  // Log metrics to monitoring service
  console.log({
    path: c.req.path,
    method: c.req.method,
    status: c.res.status,
    duration,
    timestamp: new Date().toISOString()
  })
})
```

## Troubleshooting

### Common Issues

#### Build Failures
1. **TypeScript Errors**: Run `bun run type-check` locally
2. **Package Dependencies**: Run `bun install` and check lockfile
3. **Build Cache**: Clear with `rm -rf .turbo && rm -rf node_modules/.cache`

#### Runtime Errors
1. **Environment Variables**: Verify all required variables are set
2. **Database Connection**: Check DATABASE_URL and Supabase credentials
3. **CORS Issues**: Verify origin headers in API responses

#### Performance Issues
1. **Bundle Size**: Use `bun run analyze` to check bundle size
2. **Cold Starts**: Consider edge functions for frequently accessed endpoints
3. **Database Queries**: Optimize queries and add appropriate indexes

### Debug Commands
```bash
# Check build status
vercel ls

# View deployment logs
vercel logs neonpro-api
vercel logs neonpro-web

# Preview deployment
vercel --preview

# Rollback deployment
vercel rollback
```

## Best Practices

### Development Workflow
1. **Feature Branches**: Create separate branches for features
2. **Pull Requests**: Use PRs for code review
3. **Automated Tests**: Ensure all tests pass before deployment
4. **Environment Parity**: Keep development and production environments consistent

### Performance Optimization
1. **Code Splitting**: Use dynamic imports for large components
2. **Image Optimization**: Use Next.js Image component or Vite image plugin
3. **Caching**: Implement appropriate caching strategies
4. **Bundle Analysis**: Regular analyze bundle size and optimize

### Security Practices
1. **Secrets Management**: Use Vercel environment variables for secrets
2. **Regular Updates**: Keep dependencies up to date
3. **Security Scanning**: Regular security audits and penetration testing
4. **Compliance Monitoring**: Continuous monitoring for healthcare compliance

## Rollback Procedure

### Emergency Rollback
```bash
# List recent deployments
vercel ls neonpro-api
vercel ls neonpro-web

# Rollback to specific deployment
vercel rollback neonpro-api <deployment-id>
vercel rollback neonpro-web <deployment-id>
```

### Database Rollback
1. Use Supabase point-in-time recovery
2. Restore from automated backups
3. Verify data integrity after rollback

## Support

### Internal Resources
- [Architecture Documentation](../architecture/)
- [API Documentation](../apis/)
- [Database Schema](../database-schema/)
- [Coding Standards](../rules/coding-standards.md)

### External Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Healthcare Compliance Guidelines](https://www.gov.br/anvisa)

### Contact
- **Platform Team**: platform@neonpro.com
- **Security Team**: security@neonpro.com
- **Compliance Team**: compliance@neonpro.com