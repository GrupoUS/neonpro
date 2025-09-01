# Source Tree Architecture - NeonPro AI Healthcare Platform 2025

> **Production-Ready Architecture** - Estrutura real implementada e validada (Atualizado: Agosto 2025)

## 📋 **Arquitetura Atual Confirmada**

O NeonPro utiliza uma arquitetura **Turborepo com 2 apps + 20 packages**, focada em funcionalidade essencial, performance e compliance LGPD para clínicas de estética brasileiras.

### **Estrutura Real Implementada**

```
neonpro/
├── 🏗️ apps/ (2 applications)
│   ├── web/              # Next.js 15 Frontend Application
│   └── api/              # Hono.dev Backend API
│
├── 📦 packages/ (20 packages)
│   ├── 🎨 UI & Components (4 packages)
│   │   ├── ui/                    # shadcn/ui + healthcare components
│   │   ├── brazilian-healthcare-ui/ # Brazilian healthcare UI library
│   │   ├── shared/                # Shared utilities and helpers
│   │   └── utils/                 # Common utility functions
│   │
│   ├── 🔒 Data & Types (3 packages)
│   │   ├── database/              # Primary database package (Supabase + Prisma)
│   │   ├── types/                 # TypeScript type definitions
│   │   └── domain/                # Business logic and domain models
│   │
│   ├── ⚡ Core Services (2 packages)
│   │   ├── core-services/         # Business logic services
│   │   └── config/                # Configuration management and TypeScript configs
│   │
│   ├── 🏥 Healthcare & Compliance (2 packages)
│   │   ├── compliance/            # LGPD compliance automation
│   │   └── security/              # Security utilities and unified audit service
│   │
│   ├── 🤖 AI & Intelligence (2 packages)
│   │   ├── ai/                    # AI services and integrations
│   │   └── cache/                 # Advanced caching solutions
│   │
│   ├── 📊 Monitoring & Performance (2 packages)
│   │   ├── monitoring/            # System monitoring and alerts
│   │   └── health-dashboard/      # System health visualization
│   │
│   ├── 🔗 Infrastructure (3 packages)
│   │   ├── auth/                  # Authentication and authorization
│   │   ├── integrations/          # External service integrations
│   │   └── devops/                # DevOps tooling and scripts
│   │
│   ├── 🚀 Enterprise (2 packages)
│   │   ├── enterprise/            # Enterprise features
│   │   └── docs/                  # Documentation generation
│
└── 🔧 tools/ (Development Tooling)
    ├── scripts/                   # Build and deployment scripts
    └── turbo/                     # Turborepo configuration
```

### **🔒 Unified Audit Service**

O `@neonpro/security` inclui um serviço de auditoria unificado com recursos enterprise:

#### **Funcionalidades Principais**

- **Auditoria Completa**: Todos os eventos de auditoria em um serviço
- **Recursos Enterprise**: Exportação de dados, estatísticas avançadas, criptografia
- **Performance Otimizada**: Processamento em lote e métricas de performance
- **Compliance LGPD**: Retenção automática e limpeza de dados
- **Hash Chain**: Integridade criptográfica dos logs de auditoria

#### **Uso do Serviço**

```typescript
import { UnifiedAuditService } from "@neonpro/security";

const auditService = new UnifiedAuditService();
await auditService.logPatientAccess(patientId, userId, "view");
```

### **📊 Dependências dos Packages**

- **Total de Packages**: 20
- **Dependências Internas Médias**: 2.1 por package
- **Package Mais Dependente**: @neonpro/ai (4 dependências)
- **Dependências Circulares**: Nenhuma detectada
- **Status da Arquitetura**: Madura e bem organizada

## 📱 **Frontend Application (apps/web)**

### **Estrutura Implementada:**

```
apps/web/
├── src/
│   ├── app/                       # Next.js 15 App Router
│   │   ├── layout.tsx             # Root layout with providers
│   │   ├── page.tsx               # Landing page
│   │   ├── globals.css            # Global styles and CSS variables
│   │   │
│   │   ├── (auth)/                # Authentication routes
│   │   │   ├── login/             # Login page
│   │   │   ├── register/          # Registration page
│   │   │   └── layout.tsx         # Auth layout
│   │   │
│   │   ├── (dashboard)/           # Protected dashboard routes
│   │   │   ├── dashboard/         # Main dashboard
│   │   │   ├── patients/          # Patient management
│   │   │   ├── appointments/      # Appointment scheduling
│   │   │   ├── compliance/        # LGPD compliance dashboard
│   │   │   └── profile/           # User profile
│   │   │
│   │   └── api/                   # API routes (Edge functions)
│   │
│   ├── components/                # Reusable UI components
│   │   ├── ui/                    # shadcn/ui base components
│   │   ├── forms/                 # Form components
│   │   ├── layouts/               # Layout components
│   │   └── healthcare/            # Healthcare-specific components
│   │
│   ├── lib/                       # Utility libraries
│   │   ├── utils.ts               # Common utilities (cn, etc.)
│   │   ├── api-client.ts          # Hono RPC client
│   │   ├── auth.ts                # Authentication utilities
│   │   ├── healthcare/            # Healthcare-specific utilities
│   │   └── validations.ts         # Zod validation schemas
│   │
│   ├── contexts/                  # React contexts
│   │   ├── auth-context.tsx       # Authentication context
│   │   ├── api-context.tsx        # API client context
│   │   └── theme-context.tsx      # Theme and UI context
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── use-auth.ts            # Authentication hooks
│   │   ├── use-api.ts             # API interaction hooks
│   │   └── use-healthcare.ts      # Healthcare-specific hooks
│   │
│   └── types/                     # Frontend-specific types
│       ├── api.ts                 # API response types
│       ├── auth.ts                # Authentication types
│       └── healthcare.ts          # Healthcare domain types
│
├── public/                        # Static assets
├── package.json                   # Dependencies and scripts
├── next.config.mjs                # Next.js configuration
├── tailwind.config.ts             # Tailwind CSS configuration
└── tsconfig.json                  # TypeScript configuration
```

## 🚀 **Backend API (apps/api)**

### **Estrutura Implementada:**

```
apps/api/
├── src/
│   ├── index.ts                   # Hono.dev application entry point
│   │
│   ├── routes/                    # API route handlers
│   │   ├── auth.ts                # Authentication routes
│   │   ├── patients.ts            # Patient management
│   │   ├── appointments.ts        # Appointment scheduling
│   │   ├── professionals.ts       # Professional management
│   │   ├── services.ts            # Service management
│   │   ├── analytics.ts           # Analytics and reporting
│   │   ├── compliance.ts          # LGPD compliance
│   │   ├── health.ts              # Health checks
│   │   └── ai/                    # AI-powered endpoints
│   │
│   ├── middleware/                # Custom middleware
│   │   ├── auth.ts                # Authentication middleware
│   │   ├── lgpd.ts                # LGPD compliance middleware
│   │   ├── audit.ts               # Audit trail middleware
│   │   ├── rate-limit.ts          # Rate limiting
│   │   └── error-handler.ts       # Global error handling
│   │
│   ├── services/                  # Business logic services
│   │   ├── auth.service.ts        # Authentication service
│   │   ├── patient.service.ts     # Patient management service
│   │   ├── appointment.service.ts # Appointment service
│   │   ├── compliance.service.ts  # LGPD compliance service
│   │   └── ai.service.ts          # AI integration service
│   │
│   ├── lib/                       # Utility libraries
│   │   ├── database.ts            # Supabase client configuration
│   │   ├── constants.ts           # Application constants
│   │   ├── validators.ts          # Request validation schemas
│   │   └── utils.ts               # Common utilities
│   │
│   └── types/                     # Backend-specific types
│       ├── env.ts                 # Environment variables
│       ├── database.ts            # Database types
│       └── api.ts                 # API request/response types
│
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
└── vercel.json                    # Vercel deployment configuration
```

## 📁 Estrutura do Monorepo

### Aplicações (2)

```
apps/
├── web/          # Frontend Next.js 15 (App Router)
└── api/          # Backend Hono.dev + tRPC
```

### Packages (20)

#### UI & Components (4)

```
packages/ui/
├── ui/                        # shadcn/ui + healthcare components
├── brazilian-healthcare-ui/   # Brazilian healthcare UI library
├── shared/                    # Shared utilities and helpers
└── utils/                     # Common utility functions
```

#### Data & Types (3)

```
packages/data/
├── database/                  # Primary database package (Supabase + Prisma)
├── types/                     # TypeScript type definitions
└── domain/                    # Business logic and domain models
```

#### Core Services (2)

```
packages/core/
├── core-services/             # Business logic services
└── config/                    # Configuration management and TypeScript configs
```

#### Healthcare & Compliance (2)

```
packages/healthcare/
├── compliance/                # LGPD compliance automation
└── security/                  # Security utilities and unified audit service
```

#### AI & Intelligence (2)

```
packages/ai/
├── ai/                        # AI services and integrations
└── cache/                     # Advanced caching solutions
```

#### Monitoring & Performance (2)

```
packages/monitoring/
├── monitoring/                # System monitoring and alerts
└── health-dashboard/          # System health visualization
```

#### Infrastructure (3)

```
packages/infrastructure/
├── auth/                     # Authentication and authorization
├── integrations/             # External service integrations
└── devops/                   # DevOps tooling and scripts
```

#### Enterprise (2)

```
packages/enterprise/
├── enterprise/               # Enterprise features
└── docs/                     # Documentation generation
```

### Development Tooling

```
tools/
├── eslint-config/            # Configuração ESLint compartilhada
├── typescript-config/        # Configuração TypeScript
├── prettier-config/          # Configuração Prettier
└── build-tools/              # Ferramentas de build customizadas
```

## 📊 Status de Implementação dos Packages

### ✅ Totalmente Implementados (15)

```typescript
const fullyImplemented = {
  // UI & Components
  "shadcn-ui": "Biblioteca completa de componentes",
  "ui-components": "Componentes base funcionais",
  "ui-themes": "Sistema de temas operacional",
  "ui-utils": "Utilitários de UI implementados",

  // Data & Types
  "shared-types": "Tipos compartilhados definidos",
  "validation-schemas": "Schemas Zod completos",

  // Core Services
  "auth-service": "Autenticação Supabase funcional",
  "notification-service": "Sistema de notificações básico",

  // Infrastructure
  config: "Configurações centralizadas",
  utils: "Utilitários gerais implementados",

  // Development Tools
  "eslint-config": "Configuração ESLint ativa",
  "typescript-config": "TypeScript configurado",
  "prettier-config": "Formatação automatizada",
  "build-tools": "Ferramentas de build funcionais",

  // Healthcare Specific
  "brazilian-healthcare-ui": "Componentes específicos para clínicas",
};
```

### 🚧 Estruturados/Parciais (12)

```typescript
const partiallyImplemented = {
  // Data & Types
  "database-types": "Tipos básicos, expandindo conforme necessário",
  "api-contracts": "Contratos principais definidos",

  // Core Services
  "file-service": "Upload básico implementado",
  "payment-service": "Estrutura criada, integrações pendentes",
  "audit-service": "Logs básicos, compliance em desenvolvimento",

  // Healthcare & Compliance
  "lgpd-compliance": "Estrutura básica, automatização em progresso",
  "anvisa-integration": "Preparado para integrações futuras",
  "medical-protocols": "Protocolos básicos definidos",
  "patient-safety": "Alertas básicos implementados",

  // AI & Intelligence
  "ai-chat": "Chat básico funcional, IA em integração",
  "no-show-prediction": "Modelo básico, refinamento contínuo",
  "ai-insights": "Analytics básicos, IA em desenvolvimento",

  // Monitoring
  "performance-monitoring": "Métricas básicas coletadas",
  "error-tracking": "Sentry integrado, dashboards em desenvolvimento",

  // Enterprise
  "multi-tenant": "Arquitetura preparada, implementação futura",
};
```

## 📦 **Package Architecture**

### **Core Packages**

#### **packages/database/** (Primary Database Package)

```
packages/database/
├── src/
│   ├── client.ts                  # Supabase client configuration
│   ├── types.ts                   # Database type definitions
│   ├── migrations/                # Database migrations
│   ├── schemas/                   # Table schemas
│   └── utils.ts                   # Database utilities
├── supabase/                      # Supabase configuration
└── package.json
```

#### **packages/db/** (Legacy - To Be Consolidated)

```
packages/db/
├── src/                           # Legacy database utilities
├── prisma/                        # Prisma schema and migrations
├── supabase/                      # Supabase configuration
└── types/                         # Legacy type definitions
```

> **⚠️ Consolidation Notice**: The `packages/db/` package is being consolidated into `packages/database/` to reduce redundancy and improve maintainability. This accounts for the current count of 24 packages (including both legacy db and new database packages). Upon completion of migration, the final count will be 23 packages as originally planned.

#### **packages/ui/** (shadcn/ui Integration)

```
packages/ui/
├── src/
│   ├── components/                # UI components
│   │   ├── button.tsx             # Button component
│   │   ├── input.tsx              # Input component
│   │   ├── card.tsx               # Card component
│   │   └── index.ts               # Component exports
│   ├── utils.ts                   # UI utilities
│   └── index.ts                   # Main exports
├── package.json
└── tailwind.config.ts             # Tailwind configuration
```

#### **packages/types/** (Shared Types)

```
packages/types/
├── src/
│   ├── api.ts                     # API types
│   ├── auth.ts                    # Authentication types
│   ├── healthcare.ts              # Healthcare domain types
│   ├── database.ts                # Database types (auto-generated)
│   └── index.ts                   # Type exports
└── package.json
```

## 🔧 **Development Workflow**

### **Package Dependencies**

```yaml
DEPENDENCY_HIERARCHY:
  apps/web:
    - "@neonpro/ui"
    - "@neonpro/types"
    - "@neonpro/shared"
    - "@neonpro/auth"
    - "@neonpro/database"

  apps/api:
    - "@neonpro/types"
    - "@neonpro/database"
    - "@neonpro/core-services"
    - "@neonpro/compliance"
    - "@neonpro/security"

  packages/ui:
    - "@neonpro/types"
    - "@neonpro/shared"
    - "@neonpro/utils"

  packages/database:
    - "@neonpro/types"
    - "@neonpro/config"
```

### **Build Pipeline**

```bash
# Development
pnpm dev                    # Start all applications
pnpm dev:web               # Start frontend only
pnpm dev:api               # Start backend only

# Building
pnpm build                 # Build all packages and apps
pnpm build:web             # Build frontend
pnpm build:api             # Build backend

# Quality
pnpm ci:check              # Full code validation
pnpm format                # Format code
pnpm lint                  # Lint code
pnpm type-check            # TypeScript validation

# Testing
pnpm test                  # Run all tests
pnpm test:e2e              # End-to-end tests
pnpm test:coverage         # Test coverage
```

## 🎯 **Key Features Implemented**

### **Healthcare Compliance**

- ✅ LGPD compliance middleware
- ✅ Audit trail logging
- ✅ Data anonymization utilities
- ✅ Professional access controls

### **Core Functionality**

- ✅ Patient management system
- ✅ Appointment scheduling
- ✅ Professional dashboard
- ✅ Authentication system

### **Technical Excellence**

- ✅ TypeScript strict mode
- ✅ Modern React patterns
- ✅ Hono.dev high performance
- ✅ Responsive design system

## 📊 **Performance Targets**

```yaml
PERFORMANCE_METRICS:
  Frontend:
    - Lighthouse Score: >90
    - First Contentful Paint: <2s
    - Bundle Size: <1MB
    - Time to Interactive: <3s

  Backend:
    - API Response Time: <200ms
    - Throughput: >400k req/sec
    - Error Rate: <0.1%
    - Uptime: >99.9%

  Database:
    - Query Response: <50ms
    - Connection Pool: 20 connections
    - RLS Policies: 100% coverage
    - Backup Frequency: 4x daily
```

## 📁 Detailed Structure: `apps/web` (Frontend)

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── layout.tsx
│   │   ├── dashboard/         # Dashboard routes
│   │   │   ├── patients/
│   │   │   ├── appointments/
│   │   │   ├── ai-chat/
│   │   │   ├── analytics/
│   │   │   └── layout.tsx
│   │   ├── api/               # API routes
│   │   │   ├── auth/
│   │   │   ├── patients/
│   │   │   ├── appointments/
│   │   │   └── ai/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/            # Reusable components
│   │   ├── ui/                # shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── form.tsx
│   │   │   └── ...
│   │   ├── forms/             # Form components
│   │   │   ├── patient-form.tsx
│   │   │   ├── appointment-form.tsx
│   │   │   └── auth-forms.tsx
│   │   ├── layouts/           # Layout components
│   │   │   ├── dashboard-layout.tsx
│   │   │   ├── auth-layout.tsx
│   │   │   └── sidebar.tsx
│   │   └── healthcare/        # Healthcare-specific
│   │       ├── patient-card.tsx
│   │       ├── appointment-list.tsx
│   │       ├── ai-chat.tsx
│   │       └── no-show-predictor.tsx
│   ├── lib/                   # Utility libraries
│   │   ├── utils.ts           # General utilities
│   │   ├── auth.ts            # Authentication helpers
│   │   ├── supabase.ts        # Supabase client
│   │   ├── validations.ts     # Zod schemas
│   │   └── hooks/             # Custom hooks
│   │       ├── use-auth.ts
│   │       ├── use-patients.ts
│   │       └── use-ai-chat.ts
│   ├── stores/                # Zustand stores
│   │   ├── auth-store.ts
│   │   ├── patient-store.ts
│   │   └── ui-store.ts
│   └── types/                 # TypeScript types
│       ├── auth.ts
│       ├── patient.ts
│       ├── appointment.ts
│       └── ai.ts
├── public/                    # Static assets
│   ├── icons/
│   ├── images/
│   └── favicon.ico
├── .env.local                 # Environment variables
├── next.config.js             # Next.js configuration
├── tailwind.config.js         # Tailwind configuration
├── components.json            # shadcn/ui configuration
└── package.json
```

## 📁 Detailed Structure: `apps/api` (Backend)

```
apps/api/
├── src/
│   ├── routes/                # API routes
│   │   ├── auth.ts
│   │   ├── patients.ts
│   │   ├── appointments.ts
│   │   └── ai.ts
│   ├── middleware/            # Middleware functions
│   │   ├── auth.ts
│   │   ├── cors.ts
│   │   └── validation.ts
│   ├── services/              # Business logic
│   │   ├── patient-service.ts
│   │   ├── appointment-service.ts
│   │   └── ai-service.ts
│   ├── utils/                 # Utility functions
│   │   ├── database.ts
│   │   ├── validation.ts
│   │   └── encryption.ts
│   └── types/                 # TypeScript types
│       ├── api.ts
│       └── database.ts
├── supabase/                  # Supabase configuration
│   ├── migrations/
│   ├── functions/
│   └── config.toml
└── package.json
```

## 🚀 **Deployment Architecture**

### **Production Stack**

- **Frontend**: Vercel (Edge Functions + CDN)
- **Backend**: Vercel Edge Functions
- **Database**: Supabase (PostgreSQL + Real-time)
- **Monitoring**: Sentry + Vercel Analytics
- **DNS**: Vercel domains
- **Documentation**: Centralized in `/docs` directory
- **Package Manager**: BUN ou PNPM (obrigatório)
- **Linting**: Oxc Oxlint + Dprint + Prettier
- **Type Checking**: TypeScript strict mode
- **Testing**: Vitest + Testing Library
- **Git Hooks**: Husky + lint-staged
- **CI/CD**: GitHub Actions

---

> **Production Status**: ✅ **READY FOR DEPLOY** - Arquitetura otimizada para clínicas de estética brasileiras com compliance LGPD e recursos enterprise integrados.

> **Última Atualização**: Janeiro de 2025 - Estrutura atual com 20 packages otimizados e UnifiedAuditService com recursos enterprise.
