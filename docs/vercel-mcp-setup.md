# Vercel MCP (Model Context Protocol) Authentication Setup

## Overview

This document provides a comprehensive guide for configuring and authenticating the Vercel MCP server for the NeonPro healthcare application. The setup includes authentication credentials, project linking, environment variable management, and deployment configuration.

## Prerequisites

- Node.js 18+ installed
- pnpm package manager configured
- GitHub account with repository access
- Vercel account linked to GitHub

## Authentication Setup Process

### 1. Install Vercel CLI

Since global package installation may have PATH issues, use npx for reliable access:

```bash
# Test Vercel CLI availability
npx vercel@latest --version

# This will install and run the latest version
```

### 2. Authenticate with Vercel

```bash
# Start authentication process
npx vercel login

# Select authentication method:
# - Continue with GitHub (recommended for this project)
# - Continue with Google
# - Continue with Email
# - Continue with SAML SSO
```

**Authentication Flow:**

1. Select "Continue with GitHub"
2. Browser will open to Vercel authentication page
3. Authorize Vercel to access your GitHub account
4. Return to terminal for confirmation

### 3. Link Project to Vercel

```bash
# Link current project to Vercel
npx vercel link

# Follow prompts:
# - Confirm project setup: Y
# - Select scope: grupous' projects
# - Link to existing project: Y (if project exists)
```

**Project Linking Results:**

- Creates `.vercel/` directory with project configuration
- Adds `.vercel/` to `.gitignore` automatically
- Links local project to Vercel project: `grupous-projects/neonpro`

### 4. Environment Variables Management

#### View Current Environment Variables

```bash
npx vercel env ls
```

#### Add New Environment Variables

```bash
# Add environment variable for specific environment
npx vercel env add VARIABLE_NAME production
npx vercel env add VARIABLE_NAME preview
npx vercel env add VARIABLE_NAME development
```

#### Required Environment Variables for NeonPro

**Supabase Configuration:**

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`

**Authentication:**

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `NEXTAUTH_URL`

**API Keys:**

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `EXA_API_KEY`
- `TAVILY_API_KEY`
- `GOOGLE_API_KEY`

**Monitoring & Analytics:**

- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`

**Compliance & Healthcare:**

- `ANVISA_COMPLIANCE_MODE`
- `LGPD_AUDIT_ENABLED`

**Clerk Authentication:**

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

### 5. Project Configuration Files

#### vercel.json Configuration

The project includes a comprehensive `vercel.json` with:

- Framework: Next.js
- Build commands optimized for monorepo
- Security headers (HSTS, CSP, etc.)
- API function configuration
- Regional deployment (gru1 - São Paulo)

#### .vercelignore Configuration

Created to optimize deployments by excluding:

- Node modules and dependencies
- Build artifacts and cache
- Development and testing files
- Documentation and tools
- Large media files

### 6. Deployment Commands

#### Manual Deployment

```bash
# Deploy to preview environment
npx vercel

# Deploy to production
npx vercel --prod --yes

# Deploy with archive optimization (for large projects)
npx vercel --prod --yes --archive=tgz
```

#### Automated Deployment Scripts

```bash
# Use project scripts for optimized deployment
pnpm deploy:vercel      # Production deployment
pnpm deploy:staging     # Staging deployment
```

## Security Best Practices

### 1. Environment Variable Security

- Never commit `.env.local` or `.env` files
- Use Vercel's encrypted environment variable storage
- Rotate API keys regularly
- Use different keys for development/production

### 2. Access Control

- Limit Vercel project access to necessary team members
- Use GitHub organization for repository access control
- Enable two-factor authentication on Vercel account

### 3. Deployment Security

- Review deployment previews before production
- Use branch protection rules in GitHub
- Monitor deployment logs for security issues

## Troubleshooting

### Common Issues

#### 1. CLI Not Found

```bash
# If vercel command not found, use npx
npx vercel@latest [command]
```

#### 2. Too Many Files Error

```bash
# Use archive option for large projects
npx vercel --archive=tgz
```

#### 3. Authentication Timeout

```bash
# Re-authenticate if session expires
npx vercel logout
npx vercel login
```

#### 4. Environment Variable Issues

```bash
# Check current variables
npx vercel env ls

# Pull environment variables to local
npx vercel env pull .env.local
```

### Project-Specific Considerations

#### Monorepo Structure

- Project uses Turbo for build orchestration
- Main application in `apps/web/`
- Shared packages in `packages/`

#### Healthcare Compliance

- LGPD compliance variables configured
- ANVISA compliance mode enabled
- Audit trail environment variables set

#### Performance Optimization

- Regional deployment in São Paulo (gru1)
- CDN configuration for static assets
- Function memory and timeout optimization

## Verification Steps

### 1. Test Authentication

```bash
npx vercel whoami
```

### 2. Verify Project Linking

```bash
npx vercel project ls
```

### 3. Check Environment Variables

```bash
npx vercel env ls
```

### 4. Test Deployment

```bash
npx vercel --archive=tgz
```

## Support and Resources

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Project Setup Script](./scripts/setup-vercel.sh)

## Maintenance

### Regular Tasks

- Review and rotate API keys quarterly
- Update environment variables as needed
- Monitor deployment performance
- Review security headers and CSP policies

### Updates

- Keep Vercel CLI updated: `npm update -g vercel`
- Review Vercel platform updates
- Update Node.js runtime as needed

---

**Last Updated:** 2025-01-29\
**Configuration Status:** ✅ Authenticated and Configured\
**Project:** grupous-projects/neonpro\
**Environment:** Production Ready
