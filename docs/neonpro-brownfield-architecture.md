# NEONPRO Brownfield Architecture Document

## Introduction

This document captures the **CURRENT STATE** of the NEONPRO aesthetic clinic SaaS platform, including technical debt, workarounds, and real-world patterns. It serves as a reference for AI agents working on enhancements and follows BMAD (Breakthrough Method of Agile AI-driven Development) brownfield documentation standards.

### Document Scope

Comprehensive documentation of entire system with focus on:
- **Healthcare Domain**: Brazilian aesthetic and beauty clinics
- **Recent Migration**: Clerk → Supabase authentication system 
- **Active Development**: Dashboard enhancements and compliance features
- **Technical Debt**: 100+ identified TODOs/FIXMEs requiring resolution

### Change Log

| Date       | Version | Description                           | Author              |
| ---------- | ------- | ------------------------------------- | ------------------- |
| 2025-08-18 | 1.0     | Initial brownfield analysis (BMAD)   | Business Analyst    |

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

- **Main Entry**: `apps/web/app/layout.tsx` (Next.js 15 App Router root layout)
- **Configuration**: `turbo.json`, `package.json`, `.env.production.template`
- **Core Business Logic**: `packages/core-services/`, `apps/web/lib/`
- **API Definitions**: `apps/web/app/api/` (Next.js App Router API routes)
- **Database Models**: `apps/web/types/supabase.ts`, RPC functions in SQL
- **Key Algorithms**: AI prediction engine, scheduling optimization, compliance automation

### Enhancement Impact Areas (Based on Current TODOs)

**HIGH PRIORITY AREAS:**
- `apps/web/lib/ai-scheduling.ts` - AI scheduling system (TODO implementation)
- `apps/web/app/components/bmad-master-dashboard.tsx` - Main dashboard (TODO fixes)
- `packages/security/src/auth/mfa-service.ts` - MFA authentication (TODO completion)
- `apps/web/app/api/stock/alerts/route.ts` - Stock management alerts (TODO features)
- `packages/compliance/src/` - ANVISA/LGPD compliance modules (TODO implementations)

## High Level Architecture

### Technical Summary

NEONPRO implements an **AI-First Edge-Native Healthcare SaaS architecture** specifically designed for Brazilian aesthetic and beauty clinics. The system leverages **Next.js 15 Server Components with Supabase backend** for healthcare data management, **Turborepo monorepo structure** for scalable development, and **embedded compliance mechanisms** for LGPD, ANVISA, and CFM requirements.

**CURRENT STATE REALITY:**
- ✅ **Recently migrated** from Clerk to Supabase (authentication system fully functional)
- ✅ **Monorepo structure** well-organized with clear package boundaries
- ✅ **Healthcare compliance** modules implemented but require TODO completion
- ⚠️ **Active development** with 100+ TODOs requiring systematic resolution
- ⚠️ **Technical debt** in legacy code and disabled files needing cleanup

### Actual Tech Stack (from package.json analysis)

| Category           | Technology            | Version | Notes                                    |
| ------------------ | -------------------- | ------- | ---------------------------------------- |
| Runtime            | Node.js              | Latest  | With PNPM package management            |
| Framework          | Next.js              | 15      | App Router (non-negotiable architecture)|
| Database           | Supabase PostgreSQL  | Latest  | Recently migrated from Clerk            |
| Authentication     | Supabase Auth        | Latest  | WebAuthn integration active             |
| Monorepo           | Turborepo            | ^1.13.4 | With PNPM workspaces                    |
| UI Framework       | React                | 18      | With Tailwind CSS + shadcn/ui           |
| State Management   | React Query/Tanstack | ^5.62.5 | For server state management             |
| Testing            | Vitest + Playwright  | Latest  | Unit and E2E testing configured         |
| Code Quality       | Biome                | ^2.2.0  | Recently applied fixes                  |
| Build System       | Turbo + Webpack      | Latest  | Optimized for Vercel deployment         |

### Repository Structure Reality Check

- **Type**: Monorepo with domain-driven package boundaries
- **Package Manager**: PNPM with workspaces and catalog
- **Build Tool**: Turborepo with advanced caching and pipeline optimization
- **Notable**: Clean separation between packages and apps, healthcare domain-specific modules
## Source Tree and Module Organization

### Project Structure (Actual)

```text
neonpro/
├── apps/
│   └── web/                    # Next.js 15 App Router (Main Application)
│       ├── app/                # Next.js App Router pages and API routes
│       │   ├── (dashboard)/    # Route groups for dashboard pages
│       │   ├── api/           # API routes (healthcare, auth, compliance)
│       │   ├── components/    # Application-specific components
│       │   └── lib/           # Application utilities and services
│       ├── components/        # Shared UI components
│       ├── hooks/             # Custom React hooks
│       ├── lib/               # Shared application libraries
│       ├── types/             # TypeScript type definitions
│       └── middleware.ts      # Edge middleware for auth/routing
├── packages/                  # Shared packages for monorepo
│   ├── ai/                   # AI prediction and scheduling services
│   ├── compliance/           # LGPD/ANVISA/CFM compliance modules
│   ├── core-services/        # Business logic services
│   ├── devops/              # Development and deployment utilities
│   ├── domain/              # Domain-specific hooks and utilities
│   ├── enterprise/          # Enterprise features and API gateway
│   ├── monitoring/          # Healthcare monitoring and analytics
│   ├── security/            # Authentication, MFA, and security services
│   ├── types/               # Shared TypeScript definitions
│   ├── ui/                  # Shared UI components (shadcn/ui based)
│   └── utils/               # Shared utility functions
├── tools/                   # Development and testing tools
│   └── testing/             # Centralized testing setup and utilities
├── docs/                    # Project documentation
├── infrastructure/          # Database, deployment, and infrastructure
└── scripts/                 # Build and maintenance scripts
```

### Key Modules and Their Purpose

**CORE BUSINESS MODULES:**
- **Patient Management**: `apps/web/app/(dashboard)/dashboard/patients/` - Patient data and medical records
- **Scheduling System**: `packages/ai/src/scheduling/` + `apps/web/lib/ai-scheduling.ts` - AI-powered appointment scheduling
- **Treatment Management**: `packages/core-services/src/treatments/` - Aesthetic treatment protocols
- **Compliance Engine**: `packages/compliance/src/` - Automated LGPD/ANVISA/CFM compliance
- **Stock Management**: `apps/web/app/api/stock/` - Inventory and supplies management
- **Financial System**: Billing, payments, and subscription management

**TECHNICAL INFRASTRUCTURE:**
- **Authentication**: `packages/security/src/auth/` - Supabase Auth + WebAuthn + MFA
- **AI Services**: `packages/ai/src/` - Prediction models and scheduling optimization
- **Monitoring**: `packages/monitoring/src/` - Healthcare-specific analytics and dashboards
- **Enterprise Gateway**: `packages/enterprise/src/api-gateway/` - API management and routing
## Technical Debt and Known Issues

### Critical Technical Debt

1. **100+ TODO/FIXME Items**: Systematic technical debt requiring immediate attention
   - **AI Scheduling**: `apps/web/lib/ai-scheduling.ts` - Core scheduling algorithm incomplete
   - **Stock Alerts**: `apps/web/app/api/stock/alerts/route.ts` - Alert system implementation pending
   - **MFA Service**: `packages/security/src/auth/mfa-service.ts` - Multi-factor auth incomplete
   - **Dashboard**: `apps/web/app/components/bmad-master-dashboard.tsx` - Main dashboard needs completion
   - **Compliance**: Multiple TODO items in ANVISA/LGPD modules requiring implementation

2. **Disabled Files Requiring Cleanup**: Files with .disabled extension that need removal
   - Legacy hooks in `packages/domain/src/hooks/legacy/` - Should be completely removed
   - Analytics components with .disabled extensions - Clean up or restore
   - Test files with .skip extensions - Resolve and enable or remove

3. **Migration Artifacts**: Recent Clerk → Supabase migration left cleanup items
   - Some references to old auth patterns may remain
   - Migration documentation files need archiving
   - Authentication flow fully functional but may have unused imports

4. **Build System Technical Debt**:
   - Some package dependencies may be outdated after recent reorganization
   - Turbo pipeline could be further optimized for healthcare-specific workflows
   - Test coverage could be improved (currently estimated at ~60-70%)

### Workarounds and Gotchas

**DEVELOPMENT ENVIRONMENT:**
- **Windows-Specific**: Project runs on Windows, some scripts may need .ps1/.bat alternatives
- **PNPM Required**: Must use PNPM, not npm/yarn - dependency resolution issues otherwise
- **Supabase Local**: Local development requires Supabase CLI setup for full functionality
- **Environment Variables**: Multiple .env files - check .env.production.template for required vars

**HEALTHCARE COMPLIANCE:**
- **LGPD Automation**: Some compliance features are automated, others require manual trigger
- **ANVISA Integration**: Regulatory documentation service has specific validation requirements
- **CFM Requirements**: Medical professional validation follows specific Brazilian protocols
- **Audit Trails**: All patient data operations must maintain audit logs (implemented)

**MONOREPO CONSTRAINTS:**
- **Package Dependencies**: Some internal packages have circular dependency risks
- **Build Order**: Certain packages must build before others (handled by Turborepo)
- **Testing Strategy**: Tests are centralized in `tools/testing/` but may need package-specific additions## Data Models and APIs

### Data Models

**Primary Data Models** (see actual model files):
- **User/Professional Model**: `apps/web/types/supabase.ts` + `apps/web/lib/supabase/professionals.ts`
- **Patient Model**: Supabase tables with Brazilian healthcare-specific fields
- **Appointment/Scheduling**: Complex scheduling system with AI optimization hooks
- **Treatment Models**: Aesthetic clinic treatment protocols and history
- **Compliance Records**: LGPD consent, ANVISA documentation, CFM professional data
- **Financial Models**: Billing, payment plans, subscription management
- **Stock/Inventory**: Product and supply management with alert thresholds

### API Specifications

**Next.js App Router API Routes** (RESTful pattern):
- **Authentication**: `apps/web/app/api/auth/` - WebAuthn, callbacks, and session management
- **Patient Management**: `apps/web/app/api/patients/` - CRUD operations with healthcare compliance
- **AI Services**: `apps/web/app/api/ai/` - Prediction models and scheduling optimization
- **Stock Management**: `apps/web/app/api/stock/` - Inventory tracking and automated alerts
- **Compliance**: Various compliance-related endpoints for LGPD/ANVISA automation
- **Financial**: Payment plans, subscriptions, and billing automation

**Supabase Integration**:
- **RPC Functions**: `apps/web/lib/supabase/rpc-functions.sql` - Database-level business logic
- **Real-time Subscriptions**: Used for live dashboard updates and notifications
- **Row Level Security (RLS)**: Multi-tenant data isolation implemented
- **File Storage**: Supabase Storage for patient documents and compliance files

## Integration Points and External Dependencies

### External Services

| Service          | Purpose              | Integration Type | Key Files                                    |
| ---------------- | -------------------- | ---------------- | -------------------------------------------- |
| Supabase         | Backend-as-a-Service | SDK + RPC        | `apps/web/utils/supabase/`                   |
| Vercel           | Hosting + Edge Fns   | Platform         | `vercel.json`, deployment configs            |
| Stripe           | Payment Processing   | REST API         | Financial modules (subscription billing)     |
| OpenAI           | AI Services          | REST API         | `packages/ai/` prediction and scheduling     |
| Brazilian APIs   | Compliance           | REST/SOAP        | ANVISA, CFM, LGPD-related integrations      |
| Email Services   | Notifications        | SDK/API          | Patient communications and alerts            |

### Internal Integration Points

**Frontend-Backend Communication:**
- Next.js App Router API routes with Supabase backend
- Real-time subscriptions for live dashboard updates
- Edge middleware for authentication and routing
- WebAuthn integration for secure authentication

**Package Integration:**
- Shared types across all packages via `packages/types/`
- UI components shared via `packages/ui/` (shadcn/ui based)
- Utility functions centralized in `packages/utils/`
- Domain-specific hooks in `packages/domain/`

**Healthcare-Specific Integrations:**
- Compliance automation across all patient-related operations
- Audit trail integration for regulatory requirements
- Multi-tenant RLS for clinic data isolation
- Professional credential validation (CRM, COREN)## Development and Deployment

### Local Development Setup

**Prerequisites:**
1. **Node.js** (Latest LTS) + **PNPM** (required, not npm/yarn)
2. **Supabase CLI** for local development database
3. **Windows-compatible** development environment

**Actual Setup Steps:**
```bash
# 1. Clone and install dependencies
pnpm install

# 2. Environment setup
cp .env.production.template .env.local
# Fill in required environment variables

# 3. Start development
pnpm dev  # Starts Next.js dev server + all packages

# 4. Database (if needed)
# Set up Supabase local instance or connect to cloud
```

**Known Setup Issues:**
- **PNPM Required**: Package resolution fails with npm/yarn due to monorepo structure
- **Environment Variables**: Multiple variables required for full functionality
- **Windows Compatibility**: Some scripts may need PowerShell execution policy adjustments
- **Supabase Setup**: Database connection required for auth and data operations

### Build and Deployment Process

**Build Commands:**
```bash
# Development
pnpm dev                    # Start all packages in development mode
pnpm build                  # Production build of all packages
pnpm lint                   # Code quality checks with Biome
pnpm test                   # Run test suites (unit + integration)
pnpm type-check            # TypeScript validation

# Healthcare-specific
pnpm compliance:check       # Run compliance validation
pnpm ai:build-models       # Build AI prediction models
pnpm schedule:optimize     # Scheduling optimization
pnpm treatments:validate   # Treatment protocol validation
```

**Deployment:**
- **Platform**: Vercel (configured for Next.js + Supabase)
- **Process**: Automatic deployment via Git integration
- **Environment**: Multi-environment support (dev, staging, production)
- **Healthcare Compliance**: Automated compliance checks in deployment pipeline

### Testing Reality

**Current Test Coverage:**
- **Unit Tests**: Vitest configuration, estimated ~60-70% coverage
- **Integration Tests**: Some API routes and component integration tests
- **E2E Tests**: Playwright configured for critical user flows
- **Healthcare Tests**: Compliance and regulatory validation tests
- **Manual Testing**: Still primary method for complex healthcare workflows

**Running Tests:**
```bash
pnpm test              # Run all tests
pnpm test:unit         # Unit tests only
pnpm test:integration  # Integration tests
# Playwright E2E tests configured but may need environment setup
```## Current Enhancement Areas - TODO Resolution Priority

### HIGH PRIORITY (Immediate Impact)

**1. AI Scheduling System** (`apps/web/lib/ai-scheduling.ts`)
- **Status**: TODO - Core algorithm incomplete
- **Impact**: Critical feature for clinic operations
- **Complexity**: High - Requires AI model integration
- **Dependencies**: OpenAI integration, scheduling database models

**2. Stock Management Alerts** (`apps/web/app/api/stock/alerts/route.ts`)
- **Status**: TODO - Alert system implementation
- **Impact**: Operational efficiency for clinic inventory
- **Complexity**: Medium - API routes and notification system
- **Dependencies**: Database models, notification services

**3. MFA Authentication** (`packages/security/src/auth/mfa-service.ts`)
- **Status**: TODO - Multi-factor authentication incomplete
- **Impact**: Security compliance requirement
- **Complexity**: High - Security-critical implementation
- **Dependencies**: WebAuthn, Supabase Auth, recovery mechanisms

### MEDIUM PRIORITY (Feature Enhancement)

**4. Master Dashboard** (`apps/web/app/components/bmad-master-dashboard.tsx`)
- **Status**: TODO - Dashboard functionality needs completion
- **Impact**: User experience and clinic management efficiency  
- **Complexity**: Medium - UI components and data integration
- **Dependencies**: Various API endpoints, real-time data

**5. Compliance Automation** (Multiple files in `packages/compliance/src/`)
- **Status**: Multiple TODOs - ANVISA/LGPD modules incomplete
- **Impact**: Regulatory compliance for Brazilian healthcare
- **Complexity**: High - Legal and regulatory requirements
- **Dependencies**: Brazilian government APIs, documentation standards

### LOW PRIORITY (Code Quality)

**6. Monitoring & Analytics** (`packages/monitoring/src/`)
- **Status**: Various TODOs - Healthcare analytics features
- **Impact**: Business intelligence and performance monitoring
- **Complexity**: Medium - Data aggregation and visualization

**7. Test Coverage Improvement**
- **Status**: Multiple test files need completion
- **Impact**: Code quality and deployment confidence
- **Complexity**: Low-Medium - Test writing and coverage improvement

## Appendix - Useful Commands and Scripts

### Frequently Used Commands

```bash
# Development Workflow
pnpm dev               # Start development environment
pnpm build             # Build all packages
pnpm lint              # Code quality checks
pnpm test              # Run test suites
pnpm clean             # Clean build artifacts

# Healthcare-Specific Operations
pnpm compliance:check  # Validate regulatory compliance
pnpm ai:build-models   # Rebuild AI prediction models
pnpm treatments:validate # Validate treatment protocols

# Monorepo Management
pnpm --filter=@neonpro/ui build    # Build specific package
pnpm add <package> --workspace=web # Add dependency to specific app
```

### Debugging and Troubleshooting

**Common Issues:**
- **Build Failures**: Check Turborepo cache with `pnpm clean`
- **Type Errors**: Run `pnpm type-check` for detailed TypeScript issues
- **Database Issues**: Verify Supabase connection and environment variables
- **Authentication Problems**: Check WebAuthn setup and Supabase configuration

**Log Locations:**
- **Application Logs**: Console output during development
- **Build Logs**: Turborepo provides detailed build information
- **Database Logs**: Supabase dashboard for database operations
- **Deployment Logs**: Vercel dashboard for production issues

**Healthcare-Specific Debugging:**
- **Compliance Validation**: Use `pnpm compliance:check` for regulatory issues
- **Patient Data**: Verify RLS policies and audit trail functionality
- **Professional Credentials**: Check CRM/COREN validation services

---

## Conclusion

This brownfield documentation reflects the **actual current state** of NEONPRO as of August 2025. The system has a solid foundation with Next.js 15, Supabase, and Turborepo, but requires systematic resolution of 100+ TODO items and elimination of technical debt to reach full operational capacity.

**Key Success Factors for Enhancement:**
1. **Prioritize TODO Resolution**: Focus on high-impact items first (AI scheduling, stock alerts, MFA)
2. **Maintain Healthcare Compliance**: All changes must preserve LGPD/ANVISA/CFM compliance
3. **Preserve Monorepo Structure**: Work within established package boundaries
4. **Test Thoroughly**: Healthcare applications require rigorous testing
5. **Document Changes**: Update this document as enhancements are completed