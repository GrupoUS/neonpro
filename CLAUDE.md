# 🏥 NEONPRO HEALTHCARE PLATFORM - ARCHITECTURAL REFERENCE

## 📋 PROJECT OVERVIEW

**NeonPro** is a comprehensive healthcare SaaS platform built with modern web technologies, designed for Brazilian healthcare providers with full LGPD compliance and ANVISA/CFM regulatory adherence.

### **Core Architecture:**
- **Framework:** Next.js 14.2.0 with App Router
- **Language:** TypeScript 5.4+ (Strict Mode)
- **Build System:** Turborepo 2.5.5 Monorepo
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **API Layer:** tRPC 11.4.4 with App Router support
- **UI Framework:** React 18.3 + Tailwind CSS + shadcn/ui
- **State Management:** Zustand + TanStack Query

---

## 🏗️ MONOREPO STRUCTURE

### **Workspace Configuration:**
```yaml
# pnpm-workspace.yaml
packages:
  - "apps/neonpro-web"     # Main healthcare application
  - "packages/*"           # Shared packages
  - "tools/*"              # Development tools
```

### **Directory Architecture:**
```
neonpro/
├── apps/
│   └── neonpro-web/              # Main Next.js application (@neonpro/web)
│       ├── src/
│       │   ├── app/              # Next.js 14 App Router
│       │   ├── components/       # App-specific components
│       │   ├── lib/              # App utilities and services
│       │   └── types/            # App-specific types
│       ├── public/               # Static assets
│       └── package.json          # App dependencies
├── packages/
│   ├── ui/                       # Shared UI components (@neonpro/ui)
│   ├── utils/                    # Shared utilities (@neonpro/utils)
│   ├── types/                    # Shared type definitions (@neonpro/types)
│   └── config/                   # Shared configurations (@neonpro/config)
├── docs/                         # Project documentation
├── supabase/                     # Database migrations & config
└── turbo.json                    # Turborepo configuration
```

---

## 🔧 DEVELOPMENT WORKFLOW

### **Package Management:**
- **Package Manager:** pnpm 8.15.0 (Workspace enabled)
- **Node Version:** >=18.17.0
- **Build System:** Turborepo with intelligent caching

### **Common Commands:**
```bash
# Development
pnpm turbo dev                    # Start all development servers
pnpm turbo dev --filter=@neonpro/web  # Start only main app

# Building
pnpm turbo build                  # Build all packages
pnpm turbo build --filter=@neonpro/web # Build only main app

# Quality Assurance
pnpm turbo lint                   # Lint all packages
pnpm turbo type-check            # TypeScript validation
pnpm turbo test                  # Run all tests

# Cleanup
pnpm turbo clean                 # Clean all build artifacts
```

### **Import Patterns:**
```typescript
// ✅ CORRECT: Use monorepo packages
import { Button } from '@neonpro/ui'
import { cn, formatDate } from '@neonpro/utils'
import type { Patient } from '@neonpro/types'

// ✅ CORRECT: App-relative imports
import { PatientForm } from '@/components/patients'
import { usePatients } from '@/lib/hooks'

// ❌ AVOID: Relative path climbing
import { utils } from '../../../packages/utils'
```

---

## 🚀 tRPC API LAYER

### **Configuration:**
- **Version:** tRPC 11.4.4 with App Router support
- **Transport:** HTTP with batch link optimization
- **Transformer:** SuperJSON for enhanced serialization
- **Client:** React Query integration for caching and state management

### **Architecture:**
```
src/
├── server/
│   ├── trpc.ts                  # Base tRPC configuration
│   └── routers/
│       └── _app.ts              # Main router with procedures
├── app/api/trpc/[trpc]/
│   └── route.ts                 # App Router handler (fetchRequestHandler)
└── utils/
    ├── trpc.ts                  # Client hooks and types
    └── trpc-provider.tsx        # Client-side provider component
```

### **Usage Examples:**
```typescript
// Server-side procedure definition
export const appRouter = createTRPCRouter({
  getPatients: publicProcedure
    .input(z.object({ clinicId: z.string() }))
    .query(async ({ input }) => {
      return await db.patients.findMany({
        where: { clinicId: input.clinicId }
      });
    }),
});

// Client-side usage
function PatientsList() {
  const { data: patients, isLoading } = trpc.getPatients.useQuery({
    clinicId: 'clinic-123'
  });
  
  if (isLoading) return <Loading />;
  return <PatientCards patients={patients} />;
}
```

### **Provider Integration:**
The tRPC provider is integrated with the existing ClerkProvider in `layout.tsx`:
```typescript
<ClerkProvider>
  <TRPCProvider>
    <div className="min-h-screen">{children}</div>
  </TRPCProvider>
</ClerkProvider>
```

### **Testing tRPC:**
Use the `TRPCTest` component (`@/components/trpc-test`) to validate the API:
- `hello` - Basic greeting with input validation
- `getSystemStatus` - System health and uptime
- `healthCheck` - Environment and API status

---

## 🎯 HEALTHCARE-SPECIFIC FEATURES

### **Regulatory Compliance:**
- **LGPD (Brazilian GDPR):** Complete data protection implementation
- **ANVISA Compliance:** Medical device and software regulations
- **CFM Standards:** Medical council requirements for digital health

### **Core Modules:**
1. **Patient Management:** Electronic health records with LGPD compliance
2. **Appointment Scheduling:** Smart booking with real-time availability
3. **Billing & Financial:** Brazilian tax calculations and payment processing
4. **Communication System:** Secure patient-provider messaging
5. **AI-Powered Insights:** Automated analysis and recommendations
6. **Audit & Compliance:** Complete activity logging for regulatory requirements

### **Security Architecture:**
- **Authentication:** Clerk + Supabase Auth with JWT tokens
- **Authorization:** Row Level Security (RLS) at database level
- **Data Encryption:** AES-256 encryption for sensitive data
- **Audit Logging:** Complete user activity tracking
- **Multi-tenancy:** Tenant isolation with proper data scoping

---

## 📦 PACKAGE DETAILS

### **@neonpro/ui Package:**
```typescript
// Current structure (placeholder)
export const Button = { /* Basic button styles */ }
export const HealthcareTheme = { /* Healthcare-specific theming */ }

// Target structure (to be implemented)
// - Full shadcn/ui integration
// - Healthcare-specific components (PatientCard, AppointmentForm, etc.)
// - Accessibility compliance (WCAG 2.1 AA)
// - Brazilian healthcare design patterns
```

### **@neonpro/utils Package:**
```typescript
// Utility categories:
// - Date/time formatting (Brazilian locale)
// - Brazilian tax calculations
// - Healthcare data validators
// - API helpers and error handling
// - LGPD compliance utilities
```

### **@neonpro/types Package:**
```typescript
// Type categories:
// - Database types (Supabase generated)
// - API contract types
// - Healthcare domain types (Patient, Appointment, etc.)
// - UI component prop types
// - Brazilian regulatory types (CPF, CNPJ, etc.)
```

---

## 🔍 KNOWN ISSUES & FIXES APPLIED

### **Build Issues Resolved:**
1. **Version Alignment:** Fixed Next.js version mismatch (15.1.0 → 14.2.0)
2. **Syntax Errors:** Fixed method definition outside class scope
3. **Import Issues:** Standardized Supabase client imports (server vs client)

### **Structural Issues Identified:**
1. **Legacy Scripts:** 20+ PowerShell scripts for cleanup (documented in cleanup_candidates.md)
2. **Directory Confusion:** apps/web vs apps/neonpro-web (resolved - neonpro-web is active)
3. **Import Patterns:** Using @/ instead of @neonpro/* (architectural deviation)

### **Ongoing Concerns:**
```typescript
// ⚠️ BUILD WARNINGS: These are acceptable for now
// - OpenTelemetry dynamic imports (Sentry integration)
// - TimeoutOverflowWarning (Node.js issue, not app-breaking)
// - Edge runtime static generation limitations (by design)
```

---

## 🛠️ DEPLOYMENT & INFRASTRUCTURE

### **Development Environment:**
- **Local Development:** Next.js development server
- **Database:** Supabase local development
- **Build Cache:** Turborepo remote caching (configurable)

### **Production Architecture:**
- **Hosting:** Vercel (optimized for Next.js)
- **Database:** Supabase Production
- **CDN:** Vercel Edge Network
- **Monitoring:** Sentry error tracking + custom healthcare metrics

### **Environment Variables:**
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Database
DATABASE_URL=
DIRECT_URL=
```

---

## 📚 BEST PRACTICES

### **Code Organization:**
1. **Components:** Keep app-specific components in apps/neonpro-web/src/components
2. **Shared Components:** Put reusable components in packages/ui
3. **Business Logic:** Services in apps/neonpro-web/src/lib/services
4. **Types:** Domain types in packages/types, app-specific in app/types

### **Import Hierarchy:**
```typescript
// Priority order for imports:
1. External packages (React, Next.js, etc.)
2. Internal monorepo packages (@neonpro/*)
3. App-relative imports (@/*)
4. Relative imports (./components, ../utils)
```

### **Healthcare Data Handling:**
1. **Always validate** healthcare data with Zod schemas
2. **Log all access** to patient data for LGPD compliance
3. **Use RLS policies** for tenant data isolation
4. **Encrypt sensitive fields** at the database level
5. **Implement audit trails** for all CRUD operations

---

## 🧹 MAINTENANCE & CLEANUP

### **Cleanup Candidates:**
Refer to `cleanup_candidates.md` for detailed list of files to review:
- **High Priority:** 20+ PowerShell migration scripts
- **Medium Priority:** Legacy migration documentation
- **Low Priority:** Build caches and temporary files

### **Regular Maintenance:**
```bash
# Weekly tasks
pnpm turbo clean                 # Clear build caches
pnpm audit                       # Check security vulnerabilities
pnpm outdated                   # Check for package updates

# Monthly tasks
# Review and update dependencies
# Analyze bundle sizes
# Performance audits
# Security compliance checks
```

---

## 🎯 FUTURE ROADMAP

### **Immediate Priorities:**
1. **Package Enhancement:** Implement proper @neonpro/ui components
2. **Import Migration:** Convert @/ imports to @neonpro/* pattern
3. **Build Optimization:** Enable Turborepo remote caching
4. **Type Safety:** Complete TypeScript strict mode compliance

### **Medium-term Goals:**
1. **Micro-frontend Architecture:** Enable independent deployments
2. **Performance Optimization:** Implement advanced caching strategies
3. **Accessibility Compliance:** WCAG 2.1 AA certification
4. **International Expansion:** Multi-country healthcare compliance

### **Long-term Vision:**
1. **AI Integration:** Advanced patient insights and automation
2. **Mobile Applications:** React Native apps using shared packages
3. **Third-party Integrations:** EHR systems and medical devices
4. **Regulatory Expansion:** Support for other countries' healthcare laws

---

## 📞 DEVELOPMENT SUPPORT

### **Key Files to Reference:**
- `docs/architecture.md` - Complete architectural documentation
- `implementation_plan.md` - Detailed restructuring plan
- `cleanup_candidates.md` - Files ready for removal
- `turbo.json` - Build configuration
- `pnpm-workspace.yaml` - Workspace setup

### **Troubleshooting:**
1. **Build Failures:** Check Supabase client imports (server vs client)
2. **Type Errors:** Verify TypeScript configuration in each package
3. **Import Errors:** Ensure proper package dependencies in package.json
4. **Performance Issues:** Use Turborepo cache and parallel execution

### **Getting Help:**
- **Architecture Questions:** Reference docs/architecture.md
- **Build Issues:** Check implementation_plan.md Phase 4 validation
- **Healthcare Compliance:** Review regulatory documentation in docs/
- **Package Management:** Follow monorepo import patterns documented above

---

**Last Updated:** August 2025 (Post-Architectural Audit)  
**Next Review:** Monthly architectural compliance check