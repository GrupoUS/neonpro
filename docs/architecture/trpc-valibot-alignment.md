---
title: "tRPC + Valibot Integration Guide"
last_updated: 2025-01-25
form: how-to
tags: [trpc, valibot, zod, tanstack-query, prisma, supabase, integration]
related:
  - ./tech-stack.md
  - ./source-tree.md
  - ../AGENTS.md
  - ../rules/coding-standards.md
---

# tRPC + Valibot Integration Guide — Version: 2.0.0

## Overview

This guide provides comprehensive instructions for integrating tRPC v11.0.0 with Valibot v0.30.0 validation, TanStack Query v5.62.0 for state management, and Prisma v5.7.0 + Supabase v2.45.1 for database operations in the NeonPro aesthetic clinic platform.

**Target Audience**: Full-stack developers working with TypeScript, React, and modern backend technologies.

**Goal**: Maintain type-safe, performant API layer while preparing incremental migration from Zod to Valibot with proper fallback strategies.

## Prerequisites

### Required Dependencies

```json
{
  "@trpc/client": "^11.0.0",
  "@trpc/server": "^11.0.0",
  "@trpc/react-query": "^11.0.0",
  "@tanstack/react-query": "^5.62.0",
  "valibot": "^0.30.0",
  "zod": "^4.22.0",
  "prisma": "^5.7.0",
  "@supabase/supabase-js": "^2.45.1"
}
```

### Environment Setup

```bash
# Required environment variables
VITE_API_URL=http://localhost:3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_database_connection_string
```

### Knowledge Requirements

- TypeScript 5.9.2+ with strict mode
- React 19+ with hooks
- Basic understanding of tRPC concepts
- Familiarity with schema validation libraries

## Quick Start

### 1. Basic tRPC Client Setup

```typescript
// src/lib/trpcClient.ts
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@neonpro/api';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      headers() {
        return {
          'Content-Type': 'application/json',
        };
      },
    }),
  ],
});
```

### 2. TanStack Query Integration

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        if (error?.message?.includes('401')) return false;
        return failureCount < 3;
      },
    },
  },
});
```

## TanStack Query Integration Examples

### Real-time Query Hook with tRPC + Supabase

```typescript
// src/hooks/useAestheticProcedures.ts
import { useRealtimeQuery } from '@/hooks/realtime';
import { trpcClient } from '@/lib/trpcClient';
import * as v from 'valibot';

// Valibot schema for procedure data
const ProcedureSchema = v.object({
  id: v.string(),
  name: v.string(),
  duration: v.number(),
  price: v.number(),
  category: v.string(),
});

export const useAestheticProcedures = () => {
  return useRealtimeQuery({
    queryKey: ['aesthetic-procedures'],
    queryFn: async () => {
      const data = await trpcClient.procedures.list.query();
      // Validate response with Valibot
      return v.parse(v.array(ProcedureSchema), data);
    },
    table: 'procedures', // Supabase table for real-time updates
    schema: 'public',
    invalidateOn: ['INSERT', 'UPDATE', 'DELETE'],
    enableOptimisticUpdates: true,
    staleTime: 10 * 60 * 1000, // 10 minutes
    select: (data) => data.sort((a, b) => a.name.localeCompare(b.name)),
  });
};
```

### Mutation with Optimistic Updates

```typescript
// src/hooks/useCreateAppointment.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trpcClient } from '@/lib/trpcClient';
import * as v from 'valibot';

const CreateAppointmentSchema = v.object({
  clientId: v.string(),
  procedureId: v.string(),
  scheduledAt: v.string(),
  notes: v.optional(v.string()),
});

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: v.InferInput<typeof CreateAppointmentSchema>) => {
      const validatedData = v.parse(CreateAppointmentSchema, data);
      return trpcClient.appointments.create.mutate(validatedData);
    },
    onMutate: async (newAppointment) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['appointments'] });

      // Snapshot previous value
      const previousAppointments = queryClient.getQueryData(['appointments']);

      // Optimistically update
      queryClient.setQueryData(['appointments'], (old: any[]) => [
        ...old,
        { ...newAppointment, id: 'temp-' + Date.now() },
      ]);

      return { previousAppointments };
    },
    onError: (err, newAppointment, context) => {
      // Rollback on error
      queryClient.setQueryData(['appointments'], context?.previousAppointments);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};
```

### Real-time Integration Hook

```typescript
// src/hooks/useRealtimeAppointments.ts
import { useRealtimeQuery } from '@/hooks/realtime';
import { trpc } from '@/lib/trpc';

export const useRealtimeAppointments = (params?: {
  clientId?: string;
  status?: string;
  limit?: number;
}) => {
  return useRealtimeQuery({
    queryKey: ['appointments', params],
    queryFn: () => trpc.appointments?.list?.query?.(params),
    table: 'appointments',
    schema: 'public',
    invalidateOn: ['INSERT', 'UPDATE', 'DELETE'],
    enableOptimisticUpdates: true,
    staleTime: 30 * 1000, // 30 seconds - shorter for real-time data
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

```typescript
// src/hooks/useInfiniteClients.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { trpcClient } from '@/lib/trpcClient';
import * as v from 'valibot';

const ClientsResponseSchema = v.object({
  clients: v.array(v.object({
    id: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
  })),
  nextCursor: v.optional(v.string()),
  hasMore: v.boolean(),
});

export const useInfiniteClients = (searchTerm?: string) => {
  return useInfiniteQuery({
    queryKey: ['clients', 'infinite', searchTerm],
    queryFn: async ({ pageParam }) => {
      const data = await trpcClient.clients.list.query({
        cursor: pageParam,
        limit: 20,
        search: searchTerm,
      });
      return v.parse(ClientsResponseSchema, data);
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      clients: data.pages.flatMap(page => page.clients),
    }),
  });
};
```

## Valibot + Zod Fallback Strategy

### Primary Valibot Implementation

```typescript
// src/schemas/appointment.ts
import * as v from 'valibot';

// Primary schema using Valibot (75% smaller bundle)
export const AppointmentSchema = v.object({
  id: v.string(),
  clientId: v.string(),
  procedureId: v.string(),
  scheduledAt: v.pipe(v.string(), v.isoDateTime()),
  status: v.picklist(['scheduled', 'confirmed', 'completed', 'cancelled']),
  notes: v.optional(v.string()),
  createdAt: v.pipe(v.string(), v.isoDateTime()),
  updatedAt: v.pipe(v.string(), v.isoDateTime()),
});

export type Appointment = v.InferOutput<typeof AppointmentSchema>;
```

### Zod Fallback Implementation

```typescript
// src/schemas/appointment.fallback.ts
import { z } from 'zod';

// Fallback schema using Zod for complex validations not yet supported by Valibot
export const AppointmentSchemaZod = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  procedureId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled']),
  notes: z.string().optional(),
  // Complex validation example that might need Zod
  recurringPattern: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    interval: z.number().min(1).max(12),
    endDate: z.string().datetime().optional(),
  }).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type AppointmentZod = z.infer<typeof AppointmentSchemaZod>;
```

### Smart Validation Strategy

```typescript
// src/utils/validation.ts
import * as v from 'valibot';
import { z } from 'zod';

export class ValidationError extends Error {
  constructor(message: string, public issues: any[]) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validateWithFallback = <T>(
  data: unknown,
  valibotSchema: v.BaseSchema<any, T, any>,
  zodSchema?: z.ZodSchema<T>
): T => {
  try {
    // Try Valibot first (preferred for performance)
    return v.parse(valibotSchema, data);
  } catch (valibotError) {
    if (zodSchema) {
      try {
        // Fallback to Zod for complex validations
        console.warn('Valibot validation failed, using Zod fallback:', valibotError);
        return zodSchema.parse(data);
      } catch (zodError) {
        throw new ValidationError('Both Valibot and Zod validation failed', [
          valibotError,
          zodError,
        ]);
      }
    }
    throw new ValidationError('Valibot validation failed', [valibotError]);
  }
};

// Usage example
export const validateAppointment = (data: unknown) => {
  return validateWithFallback(
    data,
    AppointmentSchema,
    AppointmentSchemaZod
  );
};
```

## Supabase Realtime + TanStack Query Integration

### Overview

The NeonPro platform integrates Supabase Realtime with TanStack Query to provide automatic data synchronization across all connected clients. This ensures that healthcare data is always up-to-date without manual refreshing.

### Key Features

- **Automatic Query Invalidation**: Queries are automatically refetched when underlying data changes
- **Optimistic Updates**: UI updates immediately before server confirmation
- **Healthcare Compliance**: Built-in audit logging for LGPD/ANVISA compliance
- **Connection Management**: Robust connection handling with automatic reconnection

### Setup

#### 1. Provider Setup

```typescript
// src/App.tsx
import { RealtimeQueryProvider } from './providers/RealtimeQueryProvider'

function App() {
  return (
    <RealtimeQueryProvider>
      {/* Your app content */}
    </RealtimeQueryProvider>
  )
}
```

#### 2. Database Configuration

Ensure your Supabase tables have Real-time enabled:

```sql
-- Enable realtime for appointments table
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;

-- Enable realtime for patients table  
ALTER PUBLICATION supabase_realtime ADD TABLE patients;

-- Enable realtime for telemedicine_sessions table
ALTER PUBLICATION supabase_realtime ADD TABLE telemedicine_sessions;
```

### Real-time Hook Usage

#### Basic Real-time Query

```typescript
import { useRealtimeAppointments } from '@/hooks/realtime'

function AppointmentList() {
  const { data, isLoading } = useRealtimeAppointments({
    status: 'scheduled',
    limit: 50
  })

  // Data automatically updates when appointments change in the database
  return (
    <div>
      {data?.map(appointment => (
        <AppointmentCard key={appointment.id} appointment={appointment} />
      ))}
    </div>
  )
}
```

#### Real-time Mutations

```typescript
import { useCreateAppointment, useUpdateAppointment } from '@/hooks/realtime'

function AppointmentForm() {
  const createAppointment = useCreateAppointment()
  const updateAppointment = useUpdateAppointment()

  const handleCreate = async (data) => {
    // Automatically invalidates related queries and broadcasts to other clients
    await createAppointment.mutateAsync(data)
  }

  const handleUpdate = async (id, data) => {
    // Updates are reflected in real-time across all connected clients
    await updateAppointment.mutateAsync({ id, data })
  }

  return (
    // Form UI
  )
}
```

### Healthcare Compliance Features

#### Audit Logging

All real-time events are automatically logged for compliance:

```typescript
// Automatic audit logging for healthcare compliance
console.log('[AUDIT] Real-time appointment update received:', payload)
console.log('[AUDIT] Real-time patient update received:', payload)  
console.log('[AUDIT] Real-time telemedicine session update received:', payload)
```

#### LGPD Compliance

- Patient data updates are logged for LGPD audit requirements
- Sensitive data is automatically filtered in real-time events
- Data access is tracked and logged

#### Professional Council Compliance

- Telemedicine session updates include CFM compliance logging
- Professional actions are tracked in real-time
- Session data is handled according to medical regulations

### Database Configuration

```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["public", "auth", "clinic"]
}

model Client {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  phone     String?
  cpf       String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  appointments Appointment[]
  
  @@schema("clinic")
  @@map("clients")
}

model Appointment {
  id          String            @id @default(cuid())
  clientId    String
  procedureId String
  scheduledAt DateTime
  status      AppointmentStatus @default(SCHEDULED)
  notes       String?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  
  client    Client    @relation(fields: [clientId], references: [id])
  procedure Procedure @relation(fields: [procedureId], references: [id])
  
  @@schema("clinic")
  @@map("appointments")
}

enum AppointmentStatus {
  SCHEDULED
  CONFIRMED
  COMPLETED
  CANCELLED
  
  @@schema("clinic")
}
```

### Supabase Client Setup

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Real-time subscription helper
export const subscribeToTable = <T>(
  table: string,
  callback: (payload: T) => void,
  filter?: string
) => {
  return supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'clinic',
        table,
        filter,
      },
      callback
    )
    .subscribe();
};
```

### Integrated tRPC Router with Prisma + Supabase

```typescript
// src/server/routers/appointments.ts
import { z } from 'zod';
import * as v from 'valibot';
import { router, protectedProcedure } from '../trpc';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { validateWithFallback } from '@/utils/validation';

const CreateAppointmentInput = v.object({
  clientId: v.string(),
  procedureId: v.string(),
  scheduledAt: v.pipe(v.string(), v.isoDateTime()),
  notes: v.optional(v.string()),
});

export const appointmentsRouter = router({
  list: protectedProcedure
    .input(v.optional(v.object({
      clientId: v.optional(v.string()),
      status: v.optional(v.picklist(['scheduled', 'confirmed', 'completed', 'cancelled'])),
      limit: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100))),
      cursor: v.optional(v.string()),
    })))
    .query(async ({ input, ctx }) => {
      const { clientId, status, limit = 20, cursor } = input || {};
      
      const appointments = await prisma.appointment.findMany({
        where: {
          ...(clientId && { clientId }),
          ...(status && { status: status.toUpperCase() as any }),
          ...(cursor && { id: { gt: cursor } }),
        },
        include: {
          client: true,
          procedure: true,
        },
        take: limit + 1,
        orderBy: { scheduledAt: 'asc' },
      });

      const hasMore = appointments.length > limit;
      const items = hasMore ? appointments.slice(0, -1) : appointments;
      const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

      return {
        appointments: items,
        nextCursor,
        hasMore,
      };
    }),

  create: protectedProcedure
    .input(CreateAppointmentInput)
    .mutation(async ({ input, ctx }) => {
      const validatedInput = v.parse(CreateAppointmentInput, input);
      
      // Create appointment in database
      const appointment = await prisma.appointment.create({
        data: {
          ...validatedInput,
          scheduledAt: new Date(validatedInput.scheduledAt),
          status: 'SCHEDULED',
        },
        include: {
          client: true,
          procedure: true,
        },
      });

      // Send real-time notification via Supabase
      await supabase
        .channel('appointment-created')
        .send({
          type: 'broadcast',
          event: 'appointment-created',
          payload: appointment,
        });

      return appointment;
    }),

  update: protectedProcedure
    .input(v.object({
      id: v.string(),
      data: v.partial(CreateAppointmentInput),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, data } = input;
      
      const appointment = await prisma.appointment.update({
        where: { id },
        data: {
          ...data,
          ...(data.scheduledAt && { scheduledAt: new Date(data.scheduledAt) }),
          updatedAt: new Date(),
        },
        include: {
          client: true,
          procedure: true,
        },
      });

      // Real-time update notification
      await supabase
        .channel('appointment-updated')
        .send({
          type: 'broadcast',
          event: 'appointment-updated',
          payload: appointment,
        });

      return appointment;
    }),
});
```

### Real-time Integration Hook

```typescript
// src/hooks/useRealtimeAppointments.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useRealtimeAppointments = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('appointments-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'clinic',
          table: 'appointments',
        },
        (payload) => {
          // Invalidate and refetch appointments
          queryClient.invalidateQueries({ queryKey: ['appointments'] });
          
          // Optionally update specific queries
          if (payload.eventType === 'INSERT') {
            queryClient.setQueryData(['appointments'], (old: any) => {
              if (!old) return old;
              return {
                ...old,
                appointments: [payload.new, ...old.appointments],
              };
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
```

## Best Practices & Configuration

### Performance Optimization

```typescript
// src/lib/trpc-config.ts
import { httpBatchLink, loggerLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import superjson from 'superjson';

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      transformer: superjson,
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: '/api/trpc',
          maxURLLength: 2083,
          // Batch requests for better performance
          maxBatchSize: 10,
          // Headers for authentication
          headers() {
            return {
              'x-trpc-source': 'nextjs-react',
            };
          },
        }),
      ],
      queryClientConfig: {
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: (failureCount, error: any) => {
              if (error?.data?.code === 'UNAUTHORIZED') return false;
              return failureCount < 3;
            },
          },
        },
      },
    };
  },
  ssr: false,
});
```

### Error Handling Strategy

```typescript
// src/utils/error-handling.ts
import { TRPCError } from '@trpc/server';
import * as v from 'valibot';

export const handleValidationError = (error: unknown): never => {
  if (v.isValiError(error)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Validation failed',
      cause: error.issues,
    });
  }
  
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Unknown validation error',
  });
};

export const withErrorHandling = <T extends (...args: any[]) => any>(
  fn: T
): T => {
  return ((...args: any[]) => {
    try {
      return fn(...args);
    } catch (error) {
      handleValidationError(error);
    }
  }) as T;
};
```

## Troubleshooting

### Common Issues and Solutions

**Issue**: Type errors when importing router types
```typescript
// ❌ Don't import router types directly in client
import type { AppRouter } from '../server/router';

// ✅ Use type inference instead
import { trpc } from '@/utils/trpc';
type RouterOutput = inferRouterOutputs<typeof trpc>;
```

**Issue**: Valibot validation fails for complex schemas
```typescript
// ✅ Use fallback strategy
const result = validateWithFallback(data, valibotSchema, zodSchema);
```

**Issue**: Real-time subscriptions not working
```typescript
// ✅ Ensure proper channel cleanup
useEffect(() => {
  const channel = supabase.channel('my-channel');
  // ... subscription logic
  
  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

**Issue**: Bundle size too large with both Valibot and Zod
```typescript
// ✅ Use dynamic imports for fallback
const validateWithDynamicFallback = async (data: unknown, valibotSchema: any) => {
  try {
    return v.parse(valibotSchema, data);
  } catch (error) {
    const { z } = await import('zod');
    // Use Zod as fallback
  }
};
```

### Performance Monitoring

```typescript
// src/utils/performance.ts
export const measureValidationPerformance = () => {
  const valibotStart = performance.now();
  // Valibot validation
  const valibotEnd = performance.now();
  
  const zodStart = performance.now();
  // Zod validation
  const zodEnd = performance.now();
  
  console.log(`Valibot: ${valibotEnd - valibotStart}ms`);
  console.log(`Zod: ${zodEnd - zodStart}ms`);
};
```

## Migration Strategy

### Phase 1: Setup Infrastructure (✅ COMPLETE)
- ✅ tRPC client implementation with type safety
- ✅ Basic Valibot schemas for new features
- ✅ Zod fallback strategy  
- ✅ **Supabase Realtime + TanStack Query integration**
- ✅ **Real-time hooks with automatic query invalidation**
- ✅ **Healthcare compliance logging for real-time events**

### Phase 2: Incremental Migration (🔄 IN PROGRESS)
- Convert high-traffic endpoints to Valibot
- **Migrate existing queries to real-time enabled hooks**
- Maintain Zod for complex validations
- Monitor bundle size and performance
- **Implement real-time features for critical healthcare workflows**

### Phase 3: Optimization (📋 PLANNED)
- Remove Zod dependencies where possible
- Optimize bundle splitting
- Performance benchmarking
- **Advanced real-time features (presence, collaborative editing)**
- **Real-time analytics and monitoring**

## Related Documentation

- [Technology Stack](./tech-stack.md) - Complete technology decisions and rationale
- [Source Tree](./source-tree.md) - Project structure and organization
- [AGENTS.md](../AGENTS.md) - Development workflow and standards
- [Coding Standards](../rules/coding-standards.md) - Code quality guidelines

## Next Steps

1. **✅ COMPLETE - Supabase Realtime Integration**: Implemented comprehensive real-time data synchronization with TanStack Query
2. **🔄 IN PROGRESS - Backend Router Stabilization**: Complete tRPC v11 router implementation with stable contracts
3. **📋 PLANNED - Performance Optimization**: Implement bundle analysis and optimization strategies
4. **📋 PLANNED - Enhanced Real-time Features**: Expand Supabase real-time integration with presence and collaborative features
5. **📋 PLANNED - Comprehensive Testing**: Implement testing for validation fallback scenarios and real-time functionality
6. **📋 PLANNED - API Documentation**: Create interactive API documentation with real-time examples

### Real-time Implementation Status

- ✅ **Core Infrastructure**: Real-time hooks with automatic query invalidation
- ✅ **Healthcare Compliance**: Audit logging for LGPD/ANVISA compliance  
- ✅ **Provider Setup**: Global real-time connection management
- ✅ **Example Implementation**: Complete appointment dashboard with real-time updates
- ✅ **Documentation**: Comprehensive integration guide and API reference
- ✅ **Testing Framework**: Basic test structure for real-time functionality

### Usage Example

```typescript
// Before: Standard TanStack Query
const { data } = useQuery({
  queryKey: ['appointments'],
  queryFn: () => trpc.appointments.list.query()
})

// After: Real-time enabled with automatic updates
const { data } = useRealtimeAppointments({
  status: 'scheduled',
  limit: 50
})
// Data automatically updates when changes occur in the database
```

---

**Document Status**: ✅ Enhanced - Comprehensive Integration Guide
**Focus**: Practical implementation with real-world examples
**Target Length**: 400+ lines with comprehensive coverage
**Last Updated**: 2025-01-25
**Next Review**: 2025-04-25
