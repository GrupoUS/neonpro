# Source Tree Architecture - NeonPro AI Healthcare Platform 2025

> **Production-Ready Architecture** - Estrutura real implementada e validada (Atualizado: Setembro 2025)

## 📋 **Arquitetura Atual Confirmada**

O NeonPro utiliza uma arquitetura **Turborepo com 2 apps + 8 packages**, focada em funcionalidade essencial, performance e compliance para clínicas de estética brasileiras.

### **Estrutura Real Implementada (MVP Simplificado)**

```
neonpro/
├── 🏗️ apps/ (2 applications)
│   ├── web/              # Next.js 15 Frontend Application (App Router)
│   └── api/              # Hono.dev Backend API (Node.js/Vercel functions)
│
├── 📦 packages/ (8 essential packages)
│   ├── types/            # @neonpro/types - TypeScript type definitions
│   ├── ui/               # @neonpro/ui - shadcn/ui + healthcare components
│   ├── database/         # @neonpro/database - Supabase + Prisma integration
│   ├── core-services/    # @neonpro/core-services - Business logic services
│   ├── security/         # @neonpro/security - Auth + security infrastructure
│   ├── shared/           # @neonpro/shared - Shared schemas and API client
│   ├── utils/            # @neonpro/utils - Common utility functions
│   └── config/           # @neonpro/config - Shared TypeScript configurations
│
└── 🛠️ tools/ (Development tools)
    ├── e2e/              # End-to-end testing with Playwright
    ├── testing/          # Testing utilities and configurations
    ├── scripts/          # Development and deployment scripts
    └── reports/          # Analysis and cleanup reports
```

## 🏗️ **Applications (apps/)**

### **Frontend Application (apps/web/)**

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.7.2
- **UI**: React 19 + shadcn/ui v4
- **Styling**: Tailwind CSS with healthcare design tokens
- **State**: Zustand + TanStack Query
- **Purpose**: Healthcare clinic management interface

**Key Features**:

- Patient management with LGPD compliance
- Appointment scheduling with anti-no-show prediction
- Universal AI chat for clinic operations
- Brazilian healthcare compliance (ANVISA, CFM)
- Real-time notifications and updates
- Mobile-first responsive design

### **Backend API (apps/api/)**

- **Framework**: Hono.dev (lightweight web framework)
- **Runtime**: Node.js with Vercel Functions
- **Language**: TypeScript with ESM modules
- **Database**: Supabase PostgreSQL via Prisma ORM
- **Purpose**: RESTful API for healthcare operations

**Key Features**:

- Healthcare data management APIs
- Authentication and authorization
- Real-time subscriptions via Supabase
- AI integration for predictions and chat
- LGPD/ANVISA compliance endpoints
- Audit logging and security monitoring

## 📦 **Packages (packages/)**

### **Core Data & Types**

#### **@neonpro/types**

- **Purpose**: Shared TypeScript type definitions
- **Size**: Minimal (21 lines package.json)
- **Dependencies**: None (pure TypeScript)
- **Exports**: Core type definitions for the entire platform

#### **@neonpro/database**

- **Purpose**: Consolidated database layer with Prisma + Supabase
- **Size**: Comprehensive (112 lines package.json)
- **Key Features**:
  - Prisma ORM with PostgreSQL schema
  - Supabase client integration
  - LGPD/ANVISA compliant data models
  - Real-time subscriptions
  - Database migrations and seeding
- **Scripts**: 20+ database management commands

#### **@neonpro/shared**

- **Purpose**: Shared schemas, API client, and React hooks
- **Size**: Feature-rich (80 lines package.json)
- **Key Features**:
  - Zod schemas for validation
  - Hono RPC API client
  - Healthcare-specific React hooks
  - Real-time data synchronization
  - LGPD compliance utilities

### **User Interface & Components**

#### **@neonpro/ui**

- **Purpose**: Healthcare-optimized UI component library
- **Size**: Comprehensive (106 lines package.json)
- **Key Features**:
  - shadcn/ui base components
  - Brazilian healthcare design system
  - WCAG 2.1 AA accessibility compliance
  - Multiple theme support (NeonPro + Brazilian Healthcare)
  - Radix UI primitives integration
  - Healthcare-specific components

**Component Exports**:

- Base UI components (button, input, dialog, etc.)
- Healthcare dashboard components
- Brazilian healthcare theme tokens
- Accessibility-optimized components

### **Business Logic & Services**

#### **@neonpro/core-services**

- **Purpose**: Core business logic for aesthetic clinic operations
- **Size**: Modular (73 lines package.json)
- **Service Modules**:
  - `scheduling` - Appointment management
  - `treatment` - Treatment protocols
  - `patient` - Patient management
  - `inventory` - Product/equipment tracking
  - `billing` - Financial operations
  - `notification` - Communication services

#### **@neonpro/security**

- **Purpose**: Security infrastructure and authentication
- **Size**: Security-focused (64 lines package.json)
- **Key Features**:
  - JWT authentication with Supabase
  - Multi-factor authentication (MFA)
  - Enterprise auth patterns
  - Healthcare data encryption
  - Audit logging integration
  - LGPD compliance utilities

### **Utilities & Configuration**

#### **@neonpro/utils**

- **Purpose**: Common utility functions and helpers
- **Size**: Utility-focused (50 lines package.json)
- **Key Features**:
  - Brazilian date/time formatting
  - CPF/CNPJ validation
  - Healthcare data validation
  - Tailwind CSS utilities (clsx + tailwind-merge)
  - Zod validation helpers

#### **@neonpro/config**

- **Purpose**: Shared TypeScript and build configurations
- **Size**: Minimal (22 lines package.json)
- **Contents**: Base TypeScript configurations for consistent builds

## 🛠️ **Development Tools (tools/)**

### **Testing Infrastructure**

- **tools/e2e/**: Playwright end-to-end testing
- **tools/testing/**: Vitest configurations and utilities
- **tools/scripts/**: Development automation scripts
- **tools/reports/**: Cleanup and analysis reports

## 🔗 **Package Dependencies**

### **Dependency Graph**

```
apps/web → @neonpro/ui → @neonpro/utils
         → @neonpro/database
         → @neonpro/shared
         → @neonpro/types

apps/api → @neonpro/shared → @neonpro/database
         → @neonpro/types
         → @neonpro/security

@neonpro/core-services → @neonpro/database
                      → @neonpro/utils

@neonpro/security → @neonpro/types (peer)
                  → @neonpro/config (peer)

@neonpro/shared → @neonpro/database

@neonpro/utils → @neonpro/database
```

### **External Dependencies Summary**

**Frontend Stack**:

- Next.js 15 + React 19
- Tailwind CSS + shadcn/ui
- Zustand + TanStack Query
- Supabase client

**Backend Stack**:

- Hono.dev framework
- Prisma ORM
- Supabase PostgreSQL
- AI SDK (OpenAI/Anthropic)

**Development Tools**:

- TypeScript 5.7.2
- Vitest + Playwright
- Turborepo build system
- Oxlint + dprint

## 📊 **Architecture Metrics**

### **Package Size Distribution**

- **Large**: @neonpro/database (112 lines) - Database layer
- **Medium**: @neonpro/ui (106 lines) - UI components
- **Medium**: @neonpro/shared (80 lines) - Shared utilities
- **Medium**: @neonpro/core-services (73 lines) - Business logic
- **Medium**: @neonpro/security (64 lines) - Security layer
- **Small**: @neonpro/utils (50 lines) - Utilities
- **Minimal**: @neonpro/config (22 lines) - Configuration
- **Minimal**: @neonpro/types (21 lines) - Type definitions

### **Complexity Analysis**

- **Total Packages**: 8 (simplified from 24+ in original plan)
- **Applications**: 2 (web frontend + API backend)
- **Development Tools**: 4 directories
- **Dependency Depth**: Maximum 3 levels
- **Build Targets**: ESM + CommonJS support

## 🎯 **MVP Simplification Strategy**

### **Removed Packages** (from original 24+ package plan)

- `brazilian-healthcare-ui` → Merged into `@neonpro/ui`
- `domain` → Merged into `@neonpro/shared`
- `compliance` → Integrated into `@neonpro/security`
- `ai`, `cache`, `performance` → Integrated into core packages
- `monitoring`, `health-dashboard` → Moved to tools/
- `auth`, `integrations` → Consolidated into `@neonpro/security`
- `tooling` → Moved to tools/ directory

### **Consolidation Benefits**

- **Reduced Complexity**: 8 packages vs 24+ packages
- **Faster Builds**: Fewer dependency resolution steps
- **Simpler Maintenance**: Consolidated related functionality
- **Better Performance**: Reduced bundle splitting overhead
- **Easier Development**: Fewer package boundaries to manage

## 🚀 **Development Workflow**

### **Package Development Commands**

```bash
# Root workspace commands
pnpm dev              # Start all development servers
pnpm build            # Build all packages and apps
pnpm test             # Run all tests
pnpm type-check       # TypeScript validation
pnpm lint             # Code linting
pnpm format           # Code formatting

# Individual package commands
pnpm --filter @neonpro/ui build
pnpm --filter @neonpro/database db:migrate
pnpm --filter @neonpro/web dev
```

### **Package Publishing**

- **Registry**: Private workspace packages
- **Versioning**: Semantic versioning with workspace protocol
- **Distribution**: Internal monorepo only (no external publishing)

## 🔒 **Security & Compliance**

### **Healthcare Data Protection**

- **LGPD Compliance**: Built into `@neonpro/security` and `@neonpro/database`
- **ANVISA Compliance**: Medical device regulations in core services
- **CFM Compliance**: Medical council regulations
- **Data Encryption**: At rest and in transit
- **Audit Logging**: Comprehensive healthcare data access tracking

### **Access Control**

- **Role-Based Access**: Professional types (doctor, nurse, coordinator)
- **Row-Level Security**: Database-level data isolation
- **API Authentication**: JWT with Supabase integration
- **Multi-Factor Auth**: Enterprise security patterns

---

**Architecture Status**: ✅ **MVP Simplified & Production Ready**\
**Package Count**: 8 essential packages (reduced from 24+)\
**Build System**: Turborepo with intelligent caching\
**Target Market**: Brazilian Aesthetic Clinics\
**Compliance**: LGPD + ANVISA + CFM Ready\
**Last Updated**: September 2025 - Accurate Current State Documentation
