# Deployment Guide

## Overview

This guide provides instructions for deploying the NeonPro Healthcare Platform to production. The platform uses a hybrid architecture with Vercel Edge, Supabase Functions, and Bun runtime.

## Prerequisites

Before deploying the platform, ensure you have:

- Node.js 18+ or Bun 1.0+ installed
- A Vercel account
- A Supabase account
- Environment variables configured
- Database set up and migrated

## Environment Variables

### Required Environment Variables

Configure the following environment variables:

#### Vercel

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App
NEXT_PUBLIC_APP_URL=your_app_url
NEXT_PUBLIC_APP_NAME=NeonPro Healthcare Platform

# Authentication
NEXTAUTH_URL=your_auth_url
NEXTAUTH_SECRET=your_auth_secret

# Monitoring
SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

#### Supabase

```bash
# Database
DATABASE_URL=your_database_url

# Authentication
JWT_SECRET=your_jwt_secret

# External APIs
OPENAI_API_KEY=your_openai_api_key
```

### Local Development

Create a `.env.local` file in the root directory:

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit the file with your configuration
```

## Vercel Deployment

### Setup

1. Install the Vercel CLI:

```bash
bun i -g vercel
```

2. Login to Vercel:

```bash
vercel login
```

3. Link your project to Vercel:

```bash
vercel link
```

### Configuration

Create a `vercel.json` file in the root directory:

```json
{
  "version": 2,
  "name": "neonpro-healthcare-platform",
  "buildCommand": "bun run build",
  "outputDirectory": "dist",
  "installCommand": "bun install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "edge"
    }
  },
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key",
    "NEXT_PUBLIC_APP_URL": "@app_url",
    "NEXT_PUBLIC_APP_NAME": "@app_name",
    "NEXTAUTH_URL": "@auth_url",
    "NEXTAUTH_SECRET": "@auth_secret",
    "SENTRY_DSN": "@sentry_dsn",
    "SENTRY_AUTH_TOKEN": "@sentry_auth_token"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
      "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key",
      "NEXT_PUBLIC_APP_URL": "@app_url",
      "NEXT_PUBLIC_APP_NAME": "@app_name",
      "NEXTAUTH_URL": "@auth_url",
      "NEXTAUTH_SECRET": "@auth_secret",
      "SENTRY_DSN": "@sentry_dsn",
      "SENTRY_AUTH_TOKEN": "@sentry_auth_token"
    }
  }
}
```

### Deployment

1. Deploy to preview:

```bash
vercel
```

2. Deploy to production:

```bash
vercel --prod
```

3. View deployment logs:

```bash
vercel logs
```

## Supabase Deployment

### Setup

1. Create a new Supabase project:

```bash
# Using the Supabase CLI
supabase init
supabase login
supabase projects create
```

2. Link your local project to Supabase:

```bash
supabase link --project-ref your_project_ref
```

### Database Migration

1. Run database migrations:

```bash
bun packages/database/scripts/migrate.ts
```

2. Seed the database:

```bash
bun packages/database/scripts/seed.ts
```

### Functions Deployment

1. Deploy Supabase Functions:

```bash
supabase functions deploy
```

2. View function logs:

```bash
supabase functions logs
```

## Monitoring

### Vercel Analytics

1. Enable Vercel Analytics in your project settings
2. View analytics in the Vercel dashboard

### Supabase Monitoring

1. Enable monitoring in your Supabase project settings
2. View metrics in the Supabase dashboard

### Sentry

1. Create a Sentry account
2. Create a new project
3. Configure Sentry in your application

```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## Performance Optimization

### Edge Functions

1. Configure Edge Functions for low latency:

```javascript
// app/api/example/route.ts
export const runtime = 'edge';

export async function GET(request: Request) {
  // Edge function logic
}
```

2. Optimize Edge Functions for performance:

```javascript
// app/api/example/route.ts
export const runtime = 'edge';

export async function GET(request: Request) {
  // Cache response for 1 hour
  return new Response('Hello, world!', {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
```

### Database Optimization

1. Optimize database queries:

```javascript
// packages/database/src/models/example.ts
export async function getExample(id: string) {
  return prisma.example.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      // Only select the fields you need
    },
  });
}
```

2. Use database indexes:

```sql
-- Create an index for frequently queried columns
CREATE INDEX idx_example_id ON example(id);
```

### Bundle Optimization

1. Optimize bundle size:

```javascript
// next.config.js
module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  },
};
```

2. Use dynamic imports:

```javascript
// app/page.tsx
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('../components/DynamicComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});

export default function Page() {
  return <DynamicComponent />;
}
```

## Security

### Authentication

1. Configure authentication:

```javascript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

2. Protect API routes:

```javascript
// app/api/example/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Protected route logic
}
```

### Data Protection

1. Encrypt sensitive data:

```javascript
// packages/database/src/utils/encryption.ts
import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(text: string): string {
  const [iv, encrypted] = text.split(':');
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

2. Implement row-level security:

```sql
-- Enable RLS
ALTER TABLE example ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view their own data" ON example
  FOR SELECT USING (user_id = auth.uid());
```

## Compliance

### LGPD Compliance

1. Implement data minimization:

```javascript
// app/api/example/route.ts
export async function POST(request: Request) {
  const { name, email } = await request.json();

  // Only collect the data you need
  const user = await prisma.user.create({
    data: {
      name,
      email,
      // Don't collect unnecessary data
    },
  });

  return Response.json(user);
}
```

2. Implement data retention:

```javascript
// packages/database/src/scripts/cleanup.ts
export async function cleanupOldRecords() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  await prisma.example.deleteMany({
    where: {
      createdAt: {
        lt: thirtyDaysAgo,
      },
    },
  });
}
```

### ANVISA Compliance

1. Implement audit trails:

```javascript
// packages/database/src/models/audit-log.ts
export async function createAuditLog({
  userId,
  action,
  resourceType,
  resourceId,
  details,
}: {
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: any;
}) {
  return prisma.auditLog.create({
    data: {
      userId,
      action,
      resourceType,
      resourceId,
      details,
    },
  });
}
```

2. Implement quality management:

```javascript
// packages/database/src/models/quality-control.ts
export async function performQualityCheck({
  resourceId,
  checkType,
  result,
}: {
  resourceId: string;
  checkType: string;
  result: boolean;
}) {
  return prisma.qualityControl.create({
    data: {
      resourceId,
      checkType,
      result,
      checkedAt: new Date(),
    },
  });
}
```

### CFM Compliance

1. Implement professional conduct:

```javascript
// packages/database/src/models/professional-conduct.ts
export async function recordProfessionalConduct({
  professionalId,
  conductType,
  description,
}: {
  professionalId: string;
  conductType: string;
  description: string;
}) {
  return prisma.professionalConduct.create({
    data: {
      professionalId,
      conductType,
      description,
      recordedAt: new Date(),
    },
  });
}
```

2. Implement patient safety:

```javascript
// packages/database/src/models/patient-safety.ts
export async function recordPatientSafetyIncident({
  patientId,
  incidentType,
  description,
  severity,
}: {
  patientId: string;
  incidentType: string;
  description: string;
  severity: string;
}) {
  return prisma.patientSafetyIncident.create({
    data: {
      patientId,
      incidentType,
      description,
      severity,
      reportedAt: new Date(),
    },
  });
}
```

### WCAG Compliance

1. Implement accessibility:

```javascript
// app/components/AccessibleButton.tsx
import { forwardRef } from 'react';

export const AccessibleButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      {...props}
      aria-label={props['aria-label'] || props.title}
    >
      {children}
    </button>
  );
});
```

2. Implement keyboard navigation:

```javascript
// app/components/KeyboardNavigation.tsx
import { useEffect } from 'react';

export function KeyboardNavigation() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle keyboard navigation
      switch (event.key) {
        case 'Tab':
          // Handle tab navigation
          break;
        case 'Enter':
        case ' ':
          // Handle activation
          break;
        case 'Escape':
          // Handle dismissal
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return null;
}
```

## Troubleshooting

### Common Issues

1. **Build Failures**:

```bash
# Clear build cache
rm -rf .next
rm -rf node_modules
bun install

# Rebuild
bun run build
```

2. **Database Connection Issues**:

```bash
# Check database connection
bun packages/database/scripts/check-connection.ts

# Reset database
bun packages/database/scripts/reset.ts
```

3. **Environment Variable Issues**:

```bash
# Check environment variables
bun run env:check

# Reset environment variables
cp .env.example .env.local
```

### Logs

1. **Vercel Logs**:

```bash
# View deployment logs
vercel logs

# View function logs
vercel logs --filter=function
```

2. **Supabase Logs**:

```bash
# View database logs
supabase db logs

# View function logs
supabase functions logs
```

3. **Application Logs**:

```javascript
// app/api/example/route.ts
export async function GET(request: Request) {
  console.log('Request received:', request.url);

  try {
    // Route logic
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
```

## Conclusion

This guide provides comprehensive instructions for deploying the NeonPro Healthcare Platform to production. By following these steps, you can ensure a secure, performant, and compliant deployment of the platform.
