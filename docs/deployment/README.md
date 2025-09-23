# NeonPro Deployment Guide

## Overview

NeonPro is a modern aesthetic clinic management platform designed for Brazilian beauty professionals. This guide covers deployment processes and configurations.

## Prerequisites

- Node.js >= 20.0.0
- Bun >= 1.0.0
- Vercel account
- Supabase project

## Quick Deploy

### Using Scripts

```bash
# Preview deployment
./scripts/deploy.sh

# Production deployment
./scripts/deploy.sh production

# Staging deployment
./scripts/deploy.sh staging
```

### Manual Deploy

```bash
# Install dependencies
bun install

# Build application
bun run vercel-build

# Deploy to Vercel
vercel deploy --prod --scope grupous-projects --yes
```

## Configuration

### Environment Variables

Create `.env.production`:

```env
VITE_API_URL=https://api.neonpro.com
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_key
```

### Vercel Configuration

The `vercel.json` is configured for:

- Bun package manager
- Web app build
- Static output from `dist` directory

## Architecture

### Tech Stack

- **Frontend**: React 19, TypeScript 5.9.2, Vite
- **Backend**: tRPC v11, Supabase
- **Routing**: TanStack Router
- **Styling**: Tailwind CSS
- **Testing**: Playwright

### Key Features

- Client management for aesthetic clinics
- Appointment scheduling
- WhatsApp Business integration
- Anti-no-show AI engine
- LGPD compliance

## Testing

### End-to-End Tests

```bash
# Run Playwright tests
npx playwright test --config apps/tools/playwright.config.ts
```

### Type Checking

```bash
# Type check all packages
bun run type-check
```

## Monitoring

- Vercel Analytics
- Supabase monitoring
- Error tracking (when configured)

## Support

For deployment issues:

- Check Vercel deployment logs
- Verify environment variables
- Ensure all dependencies are installed
- Consult the architecture documentation

## Security Notes

- Always use environment variables for sensitive data
- Keep dependencies updated
- Follow LGPD compliance guidelines
- Regular security audits recommended
