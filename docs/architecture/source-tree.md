# Source Tree Architecture - NeonPro AI Healthcare Platform 2025

> **Production-Ready Architecture** - Estrutura real implementada e validada (Atualizado: Setembro 2025)

## 📋 **Arquitetura Atual Confirmada**

O NeonPro utiliza uma arquitetura **Turborepo com 2 apps + 24 packages**, focada em funcionalidade essencial, performance e compliance para clínicas de estética brasileiras.

### **Estrutura Real Implementada (Atualizada)**

```
neonpro/
├── 🏗️ apps/ (2 applications)
│   ├── web/              # Next.js 15 Frontend Application (App Router)
│   └── api/              # Hono.dev Backend API (Vercel functions)
│
├── 📦 packages/ (24 packages)
│   ├── 🎨 UI & Components
│   │   ├── ui/                       # shadcn/ui + healthcare components
│   │   ├── brazilian-healthcare-ui/  # Brazilian healthcare UI library
│   │   ├── shared/                   # Shared utilities and helpers
│   │   └── utils/                    # Common utility functions
│   │
│   ├── 🔒 Data & Types
│   │   ├── database/                 # Supabase client + Prisma schema
│   │   ├── types/                    # TypeScript type definitions
│   │   └── domain/                   # Business/domain hooks and types
│   │
│   ├── ⚡ Core Services
│   │   ├── core-services/            # Business logic services
│   │   ├── config/                   # Shared lint/tsconfig presets
│   │   └── tooling/                  # Development tooling and scripts
│   │
│   ├── 🏥 Healthcare & Compliance
│   │   ├── compliance/               # Compliance helpers (LGPD, ANVISA, CFM)
│   │   └── security/                 # Security middleware + unified audit
│   │
│   ├── 🤖 AI & Intelligence
│   │   ├── ai/                       # AI services, prediction core
│   │   ├── cache/                    # Cache abstractions (browser/edge)
│   │   └── performance/              # Performance optimization utilities
│   │
│   ├── 📊 Monitoring & Performance
│   │   ├── monitoring/               # Monitoring libs + quality gates
│   │   ├── health-dashboard/         # Health dashboard components
│   │   └── testing/                  # Testing utilities and configurations
│   │
│   ├── 🔗 Infrastructure
│   │   ├── auth/                     # Auth helpers and scripts
│   │   ├── integrations/             # External integrations
│   │   └── devops/                   # Deployment + CI/CD tooling
│   │
│   ├── 🚀 Enterprise
│   │   ├── enterprise/               # Enterprise features
│   │   └── docs/                     # Docs generators & tooling
│
└── 🔧 tools/ (Development & Testing)
    ├── testing/                      # Vitest configs, reports, utils
    ├── e2e/                          # Playwright/Cypress (kept for refs)
    ├── reports/                      # Analysis & dependency graphs
    └── scripts/                      # CI scripts and helpers
```

### 📁 Apps

**apps/web (Next.js 15)**

- Build: next build
- Tests: vitest run (unit + integration via root vitest projects)
- Depends on: @neonpro/ui, @neonpro/shared, @neonpro/database, @neonpro/monitoring
- Deployment: Vercel (root vercel.json maps functions apps/web/app/api/**/*)
- Outputs: .next/** (excluding cache)

**apps/api (Hono)**

- Entry: api/index.ts (adapter) + src/index.ts (app)
- Tests: vitest (node env)
- Deployment: Vercel functions via apps/api/vercel.json (routes /api/* → api/index.ts)
- Runtime: nodejs20.x

### 📦 Packages (Detalhado)

#### 🎨 UI & Components

- **ui**: shadcn/ui + healthcare components
- **brazilian-healthcare-ui**: Brazilian healthcare UI library
  - Depends on: @neonpro/types, @neonpro/ui, @neonpro/shared
- **shared**: Shared utilities and helpers
  - Depends on: @neonpro/types, @neonpro/database, @neonpro/auth
- **utils**: Common utility functions
  - Depends on: @neonpro/types

#### 🔒 Data & Types

- **database**: Supabase client + Prisma schema
  - Depends on: @neonpro/types
  - Outputs: dist/**, prisma/generated/**
- **types**: TypeScript type definitions (base package)
- **domain**: Business/domain hooks and types
  - Depends on: @neonpro/types, @neonpro/database, @neonpro/shared

#### ⚡ Core Services

- **core-services**: Business logic services
  - Depends on: @neonpro/types, @neonpro/database, @neonpro/shared
- **config**: Shared lint/tsconfig presets
  - Depends on: @neonpro/types
- **tooling**: Development tooling and scripts

#### 🏥 Healthcare & Compliance

- **compliance**: Compliance helpers (LGPD, ANVISA, CFM)
  - Depends on: @neonpro/types
- **security**: Security middleware + unified audit
  - Depends on: @neonpro/types, @neonpro/database

#### 🤖 AI & Intelligence

- **ai**: AI services, prediction core
  - Depends on: @neonpro/types, @neonpro/cache
- **cache**: Cache abstractions (browser/edge)
  - Depends on: @neonpro/types, @neonpro/database
- **performance**: Performance optimization utilities

#### 📊 Monitoring & Performance

- **monitoring**: Monitoring libs + quality gates
  - Depends on: @neonpro/types, @neonpro/database, @neonpro/shared
- **health-dashboard**: Health dashboard components
  - Depends on: @neonpro/types, @neonpro/ui, @neonpro/brazilian-healthcare-ui, @neonpro/monitoring
- **testing**: Testing utilities and configurations

#### 🔗 Infrastructure

- **auth**: Auth helpers and scripts
  - Depends on: @neonpro/types, @neonpro/database
- **integrations**: External integrations
  - Depends on: @neonpro/types, @neonpro/database, @neonpro/auth
- **devops**: Deployment + CI/CD tooling
  - Depends on: @neonpro/types, @neonpro/database, @neonpro/monitoring

#### 🚀 Enterprise

- **enterprise**: Enterprise features
  - Depends on: @neonpro/types, @neonpro/database, @neonpro/auth, @neonpro/security, @neonpro/compliance
- **docs**: Docs generators & tooling
  - Depends on: @neonpro/types

### 🧭 Tools/

- **tools/testing**: unified vitest utilities, configs, and reports
- **tools/e2e**: legacy playwright/cypress suites and reports (not used in CI by default)
- **tools/reports**: dependency graphs, inventories, audit summaries
- **tools/scripts**: CI scripts and helpers

## 🔗 Dependências (Turbo)

Principais relações conforme turbo.json (build dependsOn):

### Base Dependencies

- **@neonpro/types**: Base package (no dependencies)
- **@neonpro/database** → @neonpro/types
- **@neonpro/cache** → @neonpro/types, @neonpro/database
- **@neonpro/compliance** → @neonpro/types

### Auth & Security Layer

- **@neonpro/auth** → @neonpro/types, @neonpro/database
- **@neonpro/security** → @neonpro/types, @neonpro/database
- **@neonpro/shared** → @neonpro/types, @neonpro/database, @neonpro/auth

### Core Services

- **@neonpro/core-services** → @neonpro/types, @neonpro/database, @neonpro/shared
- **@neonpro/monitoring** → @neonpro/types, @neonpro/database, @neonpro/shared
- **@neonpro/domain** → ✅ MIGRATED: Consolidated into @neonpro/ui

### Infrastructure

- **@neonpro/integrations** → @neonpro/types, @neonpro/database, @neonpro/auth
- **@neonpro/devops** → @neonpro/types, @neonpro/database, @neonpro/monitoring

### UI Components

- **@neonpro/ui** → @neonpro/types, @neonpro/shared
- **@neonpro/brazilian-healthcare-ui** → @neonpro/types, @neonpro/ui, @neonpro/shared
- **@neonpro/health-dashboard** → @neonpro/types, @neonpro/ui, @neonpro/brazilian-healthcare-ui, @neonpro/monitoring

### AI & Intelligence

- **@neonpro/ai** → @neonpro/types, @neonpro/cache

### Enterprise

- **@neonpro/enterprise** → @neonpro/types, @neonpro/database, @neonpro/auth, @neonpro/security, @neonpro/compliance

### Utilities

- **@neonpro/config** → @neonpro/types
- **@neonpro/utils** → @neonpro/types
- **@neonpro/docs** → @neonpro/types

## 🏗️ Builds & Saídas

### Turbo Tasks & Outputs

- **build outputs**: .next/** (apps/web), dist/** (packages), build/**
- **test outputs**: coverage/**, tools/testing/reports/**, .vitest/**, node_modules/.vitest/**
- **compliance outputs**: compliance-reports/**

### Deployment Configuration

**Root vercel.json**

- buildCommand: bash scripts/vercel-build.sh
- functions: apps/web/app/api/**/*.{js,ts} → runtime nodejs20.x
- headers: security + CORS for /api
- env: NEXT_PUBLIC_API_URL="/api"

**apps/api/vercel.json**

- routes: /api/(.*) → /api/index.ts
- functions: api/index.ts runtime nodejs20.x

### Global Environment Variables

- NODE_ENV, VERCEL_ENV, CI
- TURBO_TOKEN, TURBO_TEAM
- SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_PROJECT_ID
- DATABASE_URL, DIRECT_URL
- LGPD_COMPLIANCE_KEY, ANVISA_API_KEY, CFM_VALIDATION_KEY
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- OPENAI_API_KEY, ANTHROPIC_API_KEY

## 🧪 Testes

### Test Configuration

- **Root vitest.config.ts** utiliza "projects":
  - **unit**: include tools/tests/**, apps/web/tests/**, apps/api/src/**/*.test.ts, packages/ui|utils|core-services|shared
  - **integration**: include apps/web/tests/integration/** e packages/*/tests/integration/**
- **Execução**: pnpm test (turbo run test)

### Specialized Test Tasks

- **test:healthcare**: Tests for compliance, ANVISA, LGPD
- **test:coverage**: Coverage reporting
- **test:e2e**: End-to-end testing with Playwright
- **compliance:validate**: LGPD, ANVISA compliance validation

## 📌 Estado dos Testes (Última Execução)

- **Comando**: pnpm test
- **Resultado**: FALHA — @neonpro/performance#test não encontrou arquivos de teste
- **Saída relevante** (vitest):
  - "No test files found, exiting with code 1"
  - Padrões do projeto unit/integration configurados no vitest.root
- **Observação**: O pacote @neonpro/performance expõe scripts de teste, mas não possui testes implementados no momento.

## 🔄 Notas de Atualização

- Atualizado para refletir 24 packages (incluindo @neonpro/tooling, @neonpro/performance, @neonpro/testing)
- Dependências entre pacotes sincronizadas com turbo.json atual
- Adicionados detalhes de build/saídas e configurações de deployment (vercel.json)
- Registrado estado atual dos testes e cobertura
- Incluídas variáveis de ambiente globais e configurações de cache remoto
- Documentadas tarefas especializadas de compliance e healthcare testing
