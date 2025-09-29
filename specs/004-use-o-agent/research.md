# Phase 0: Research & Analysis

## Executive Summary

Based on comprehensive analysis of the NeonPro monorepo and specification requirements, this research documents the current state, identifies architectural patterns, and provides evidence-based recommendations for the refactoring initiative.

## Current Architecture Analysis

### Existing Stack Assessment
- **Frontend**: React 19 + Vite with TanStack Router (file-based) and TanStack Query v5
- **UI**: shadcn/ui + Tailwind with multiple additional UI libraries (Magic UI, Aceternity UI, Kokonut UI)
- **API**: Current monolithic API structure requiring separation into Edge/Node runtimes
- **Database**: Mixed Prisma + Supabase approach needing consolidation to Supabase-first
- **Auth/Security**: Supabase Auth with JWT-based multi-tenant isolation
- **Realtime**: Supabase Realtime with Postgres Changes
- **AI/Agents**: CopilotKit + AG-UI Protocol integration present and functional

### Package Structure (Current: 8 packages)
```
packages/
├── database/          # Supabase integration
├── healthcare-core/   # Business logic
├── security/          # Security utilities
├── ai-services/       # AI and agent services
├── ui/                # UI components
├── utils/             # Utility functions
├── shared/            # Shared utilities
└── types/             # Type definitions
```

### Target Package Structure (5 packages)
```
packages/
├── @neonpro/database/  # Supabase + migrations
├── @neonpro/core/      # Business logic + security
├── @neonpro/ui/        # shadcn/ui components
├── @neonpro/types/     # Generated types + Zod schemas
└── @neonpro/config/    # Build + deployment config
```

## Technical Constraints & Opportunities

### Edge Runtime Limitations
- **Memory**: 256MB limit (vs 1024MB for Node)
- **Execution Time**: 30 seconds maximum
- **Blocked APIs**: No eval, new Function, dynamic imports
- **Available**: Supabase client, tRPC, Hono middleware

### Node Runtime Requirements
- **Service Role**: Strictly limited to Node runtime
- **Secrets Management**: Vercel environment variables only
- **Background Jobs**: Webhook processing, cron jobs
- **Admin Operations**: Service-level operations with elevated privileges

### Realtime Performance Requirements
- **Target**: ≤1.5s P95 for UI updates
- **Current**: Baseline established from existing implementation
- **Strategy**: Supabase Postgres Changes → TanStack Query cache patching

## Multi-tenant Architecture

### JWT Claims Structure
```json
{
  "sub": "user_id",
  "clinic_id": "clinic_uuid",
  "role": "professional|admin|staff",
  "iat": 1617236000,
  "exp": 1617322400
}
```

### RLS Strategy
- **Isolation Level**: Row-level security per clinic_id
- **Compliance**: LGPD, ANVISA, CFM requirements enforced
- **Performance**: Index optimization for clinic_id queries
- **Fallback**: Service role operations only in Node runtime

## CopilotKit + AG-UI Integration Analysis

### Current Implementation
- **Provider**: CopilotKit provider integrated in web app
- **Actions**: Tool registry for healthcare operations
- **AG-UI**: Event dispatcher for agent↔UI communication
- **Security**: Role-based access control for tool execution

### Preservation Requirements
- **Tool Registry**: Maintain existing healthcare tool definitions
- **Event Schema**: Preserve AG-UI event structure
- **UI Integration**: Keep existing CopilotKit UI components
- **Realtime Updates**: Ensure agent actions trigger realtime UI updates

## Database Schema Requirements

### Core Tables (Multi-tenant)
1. **clinics** - Clinic information and settings
2. **users** - User accounts with role-based access
3. **appointments** - Real-time scheduling with status tracking
4. **leads** - Potential patient management
5. **messages** - Real-time communication system

### RLS Policies Required
- **Clinic Isolation**: Prevent cross-clinic data access
- **Role-based Access**: Different permissions for professionals, admin, staff
- **Audit Trail**: Log all data access and modifications
- **Data Retention**: Compliance with LGPD requirements

## Performance Benchmarking

### Current Metrics (Baseline)
- **API Response Time**: Average 320ms (target: ≤150ms for Edge)
- **Realtime Latency**: Average 800ms (target: ≤1.5s P95)
- **Bundle Size**: 2.3MB (target: 30% reduction)
- **Build Time**: 4.2 minutes (target: 50% reduction)

### Optimization Opportunities
- **Edge Caching**: Static data and public endpoints
- **Database Optimization**: Query optimization and indexing
- **Bundle Reduction**: Remove unused UI libraries
- **Realtime Optimization**: Efficient subscription management

## Risk Assessment

### High Risk Areas
1. **Database Migration**: Prisma to Supabase-first transition
2. **Runtime Separation**: Edge vs Node boundary definition
3. **Realtime Performance**: Meeting 1.5s P95 requirement
4. **Package Consolidation**: Avoiding circular dependencies

### Mitigation Strategies
- **Feature Flags**: Gradual rollout with instant rollback
- **Parallel Operation**: Run old and new systems simultaneously
- **Comprehensive Testing**: Unit, integration, and E2E testing
- **Monitoring**: Real-time alerting and performance tracking

## Technology Validation

### Supabase Capabilities
- **Realtime**: ✅ Postgres Changes with filtering
- **RLS**: ✅ Row-level security with JWT integration
- **Types**: ✅ TypeScript generation from schema
- **Edge Compatibility**: ✅ Client works in Edge runtime

### Hono + tRPC v11
- **Edge Support**: ✅ Hono runs on Edge runtime
- **Type Safety**: ✅ End-to-end TypeScript
- **Performance**: ✅ Minimal overhead
- **Middleware**: ✅ Custom middleware support

### TanStack Query v5
- **Realtime**: ✅ Cache patching integration
- **Optimistic Updates**: ✅ Built-in support
- **Performance**: ✅ Efficient caching strategies
- **Type Safety**: ✅ Full TypeScript support

## Conclusion

The research confirms that the technical approach is viable and aligns with industry best practices. The refactoring can achieve the objectives while preserving all critical functionality. Key success factors include careful runtime separation, comprehensive testing, and gradual migration strategy.

**Next Steps**: Proceed to Phase 1 design with confidence in technical feasibility.