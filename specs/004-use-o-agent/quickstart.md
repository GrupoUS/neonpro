# NeonPro Refactoring Quickstart Guide

## Prerequisites

### Required Tools
- Node.js 18+ 
- PNPM 8+
- Supabase CLI 1.0+
- Vercel CLI
- Git

### Environment Setup
```bash
# Clone repository
git clone https://github.com/your-org/neonpro.git
cd neonpro

# Checkout feature branch
git checkout 004-use-o-agent

# Install dependencies
pnpm install

# Setup Supabase CLI
supabase link
supabase db push
```

## Phase 1: Foundation Setup (Weeks 1-2)

### 1.1 Edge/Node Runtime Separation

**File**: `apps/api/src/index.ts`
```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handle } from 'hono/vercel';

// Edge routes (read-only)
const edgeApp = new Hono()
  .use(cors())
  .get('/api/appointments', handleAppointmentsList)
  .get('/api/clinics/:id', handleClinicInfo)
  .get('/api/professionals/:id', handleProfessionalProfile);

// Node routes (service operations)
const nodeApp = new Hono()
  .use(cors())
  .post('/api/appointments', handleCreateAppointment)
  .put('/api/appointments/:id/confirm', handleConfirmAppointment)
  .post('/api/webhooks/supabase', handleSupabaseWebhook);

export default handle(edgeApp); // Default to Edge runtime
export const nodeHandler = handle(nodeApp); // Node runtime for specific routes
```

**Vercel Configuration**: `vercel.json`
```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "edge"
    },
    "api/src/node/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

### 1.2 Package Structure Creation

**Create new packages**:
```bash
# Create consolidated package structure
mkdir -p packages/{core,database,ui,types,config}

# Initialize core package
cd packages/core
pnpm init
```

**Package.json Configuration**:
```json
{
  "name": "@neonpro/core",
  "version": "1.0.0",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest"
  },
  "dependencies": {
    "@neonpro/types": "workspace:*",
    "@neonpro/database": "workspace:*",
    "zod": "^3.22.0"
  }
}
```

### 1.3 RLS Policies Implementation

**File**: `packages/database/supabase/migrations/001_rls_policies.sql`
```sql
-- Multi-tenant isolation for appointments
CREATE POLICY clinic_isolation ON appointments
    FOR ALL TO authenticated
    USING (clinic_id = auth.jwt() ->> 'clinic_id'::uuid)
    WITH CHECK (clinic_id = auth.jwt() ->> 'clinic_id'::uuid);

-- Professional access control
CREATE POLICY professional_access ON appointments
    FOR SELECT TO authenticated
    USING (
        clinic_id = auth.jwt() ->> 'clinic_id'::uuid
        AND professional_id = auth.uid()
    );
```

### 1.4 Feature Flag System

**File**: `packages/config/src/feature-flags.ts`
```typescript
export const featureFlags = {
  NEW_DATABASE_LAYER: process.env.NEW_DATABASE_LAYER === 'true',
  EDGE_RUNTIME_ENABLED: process.env.EDGE_RUNTIME_ENABLED === 'true',
  REALTIME_UPDATES: process.env.REALTIME_UPDATES === 'true',
};
```

## Phase 2: Package Consolidation (Weeks 3-4)

### 2.1 Core Package Creation

**File**: `packages/core/src/index.ts`
```typescript
// Import and re-export from existing packages
export * from './auth';
export * from './security';
export * from './services';
export * from './utils';
export * from './compliance';

// Healthcare-specific exports
export * from './healthcare';
export * from './ai-services';
```

### 2.2 Database Package Setup

**File**: `packages/database/src/index.ts`
```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from '@neonpro/types';

// Edge-compatible client
export const createAnonClient = (supabaseUrl: string, supabaseAnonKey: string) => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
};

// Node-only client with service role
export const createServiceClient = (supabaseUrl: string, serviceRoleKey: string) => {
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
};
```

### 2.3 Type Generation Setup

**File**: `packages/types/src/index.ts`
```typescript
// Generated types from Supabase
export interface Database {
  public: {
    Tables: {
      appointments: { /* ... */ };
      leads: { /* ... */ };
      messages: { /* ... */ };
      users: { /* ... */ };
      clinics: { /* ... */ };
    };
  };
}

// Zod schemas
export * from './schemas/appointments';
export * from './schemas/leads';
export * from './schemas/messages';
export * from './schemas/users';
export * from './schemas/clinics';
```

**Type Generation Script**: `package.json`
```json
{
  "scripts": {
    "types:generate": "supabase gen types typescript --local > packages/types/src/database.ts"
  }
}
```

## Phase 3: API Layer Implementation (Weeks 5-6)

### 3.1 tRPC Router Setup

**File**: `apps/api/src/trpc/router.ts`
```typescript
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { Database } from '@neonpro/types';
import { createAnonClient } from '@neonpro/database';

export const t = initTRPC.context<Context>().create();

export const appointmentsRouter = t.router({
  list: t.procedure
    .input(z.object({ clinicId: z.string().uuid() }))
    .query(async ({ input }) => {
      const supabase = createAnonClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!
      );
      
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('clinic_id', input.clinicId)
        .order('start_time');
      
      return data;
    }),
    
  create: t.procedure
    .input(CreateAppointmentSchema)
    .mutation(async ({ input }) => {
      const supabase = createAnonClient(/* ... */);
      
      const { data } = await supabase
        .from('appointments')
        .insert(input)
        .select()
        .single();
      
      return data;
    }),
    
  confirm: t.procedure
    .input(z.object({ 
      id: z.string().uuid(),
      sendNotification: z.boolean().default(true)
    }))
    .mutation(async ({ input }) => {
      // This requires service role - must run in Node runtime
      const supabase = createServiceClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      const { data } = await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', input.id)
        .select()
        .single();
      
      // Trigger webhook for notifications
      if (input.sendNotification) {
        await sendAppointmentConfirmationWebhook(data);
      }
      
      return data;
    }),
});
```

### 3.2 Realtime Integration

**File**: `apps/web/src/hooks/useRealtimeAppointments.ts`
```typescript
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useSupabase } from './useSupabase';

export const useRealtimeAppointments = (clinicId: string) => {
  const queryClient = useQueryClient();
  const supabase = useSupabase();
  
  useEffect(() => {
    const channel = supabase
      .channel('appointments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `clinic_id=eq.${clinicId}`,
        },
        (payload) => {
          // Update TanStack Query cache
          queryClient.setQueryData(['appointments', clinicId], (old: any[]) => {
            switch (payload.eventType) {
              case 'INSERT':
                return [...old, payload.new];
              case 'UPDATE':
                return old.map(item => 
                  item.id === payload.new.id ? payload.new : item
                );
              case 'DELETE':
                return old.filter(item => item.id !== payload.old.id);
              default:
                return old;
            }
          });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [clinicId, supabase, queryClient]);
};
```

## Phase 4: CopilotKit + AG-UI Integration (Weeks 7-8)

### 4.1 CopilotKit Provider Setup

**File**: `apps/web/src/providers/CopilotKitProvider.tsx`
```typescript
import { CopilotKit } from '@copilotkit/react-core';
import { useSupabase } from './useSupabase';

interface CopilotKitProviderProps {
  children: React.ReactNode;
}

export const CopilotKitProvider = ({ children }: CopilotKitProviderProps) => {
  const supabase = useSupabase();
  
  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      chatApiEndpoint="/api/copilotkit/chat"
      agent="healthcare-assistant"
      categories={['healthcare', 'scheduling', 'patient-management']}
      instructions="You are a healthcare assistant for aesthetic clinics. Help professionals manage appointments, patient communication, and clinic operations."
    >
      {children}
    </CopilotKit>
  );
};
```

### 4.2 AG-UI Event Dispatcher

**File**: `apps/api/src/agui/dispatcher.ts`
```typescript
import { Hono } from 'hono';
import { verifyJWT } from '@neonpro/core/auth';

const app = new Hono();

app.post('/api/agui/events', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  const payload = await c.req.json();
  
  // Verify JWT and extract clinic context
  const jwt = verifyJWT(token);
  const clinicId = jwt.clinic_id;
  
  switch (payload.type) {
    case 'appointment_created':
      await handleAppointmentCreated(clinicId, payload.data);
      break;
    case 'message_sent':
      await handleMessageSent(clinicId, payload.data);
      break;
    case 'lead_updated':
      await handleLeadUpdated(clinicId, payload.data);
      break;
  }
  
  return c.json({ success: true });
});

export default app;
```

## Testing Strategy

### Unit Testing
```bash
# Run unit tests
pnpm test

# Run with coverage
pnpm test:coverage
```

### Integration Testing
```bash
# Start test environment
pnpm test:integration

# Run E2E tests
pnpm test:e2e
```

### RLS Testing
```typescript
// Test RLS policies
test('should enforce clinic isolation', async () => {
  const clinicAUser = createTestUser({ clinic_id: 'clinic-a' });
  const clinicBUser = createTestUser({ clinic_id: 'clinic-b' });
  
  // Clinic A user should not access Clinic B data
  const clinicBAppointments = await getAppointments(clinicBUser, 'clinic-b');
  expect(clinicBAppointments).toHaveLength(0);
});
```

## Deployment

### Vercel Configuration
```bash
# Deploy to Vercel
vercel --prod

# Setup environment variables
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### Monitoring Setup
```typescript
// Add to your application
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

## Rollback Procedure

### Database Rollback
```bash
# Rollback database migration
supabase db rollback

# Restore from backup
supabase db restore <backup-file>
```

### Code Rollback
```bash
# Rollback to previous commit
git reset --hard HEAD~1

# Redeploy
vercel --prod
```

## Success Criteria Verification

### Performance Testing
```bash
# Run performance tests
k6 run k6/tests/appointments-performance.js

# Monitor realtime latency
npm run test:realtime-latency
```

### Compliance Testing
```bash
# Run LGPD compliance checks
npm run test:lgpd-compliance

# Run security audit
npm run audit:security
```

This quickstart guide provides the essential steps to implement the NeonPro refactoring while preserving all critical functionality and ensuring compliance with Brazilian healthcare regulations.