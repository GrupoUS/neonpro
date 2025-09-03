# Source Tree Architecture - NeonPro AI Healthcare Platform 2025

> **Production-Ready Architecture** - Estrutura real implementada e validada (Atualizado: Setembro 2025)

## 📋 **Arquitetura Atual Confirmada**

O NeonPro utiliza uma arquitetura **Turborepo com 2 apps + 23 packages**, focada em funcionalidade essencial, performance e compliance para clínicas de estética brasileiras.

### **Estrutura Real Implementada (Atualizada)**

```
neonpro/
├── 🏗️ apps/ (2 applications)
│   ├── web/              # Next.js 15 Frontend Application (App Router)
│   └── api/              # Hono.dev Backend API (Vercel functions)
│
├── 📦 packages/ (23 packages)
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
│   │   └── config/                   # Shared lint/tsconfig presets
│   │
│   ├── 🏥 Healthcare & Compliance
│   │   ├── compliance/               # Compliance helpers (LGPD, ANVISA, CFM)
│   │   └── security/                 # Security middleware + unified audit
│   │
│   ├── 🤖 AI & Intelligence
│   │   ├── ai/                       # AI services, prediction core
│   │   └── cache/                    # Cache abstractions (browser/edge)
│   │
│   ├── 📊 Monitoring & Performance
│   │   ├── monitoring/               # Monitoring libs + quality gates
│   │   └── health-dashboard/         # Health dashboard components
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

- apps/web (Next.js 15)
  - Build: next build
  - Tests: vitest run (unit + integration via root vitest projects)
  - Depends on: @neonpro/ui, @neonpro/shared, @neonpro/domain, @neonpro/database, @neonpro/monitoring
  - Deployment: Vercel (root vercel.json maps functions apps/web/app/api/**/*)

- apps/api (Hono)
  - Entry: api/index.ts (adapter) + src/index.ts (app)
  - Tests: vitest (node env)
  - Deployment: Vercel functions via apps/api/vercel.json (routes /api/* → api/index.ts)

### 📦 Packages (Resumo)

- UI & Components: ui, brazilian-healthcare-ui, shared, utils
- Data & Types: database, types, domain
- Core Services: core-services, config
- Healthcare & Compliance: compliance, security
- AI & Intelligence: ai, cache
- Monitoring & Performance: monitoring, health-dashboard
- Infrastructure: auth, integrations, devops
- Enterprise: enterprise, docs

### 🧭 Tools/

- tools/testing: unified vitest utilities, configs, and reports
- tools/e2e: legacy playwright/cypress suites and reports (not used in CI by default)
- tools/reports: dependency graphs, inventories, audit summaries

## 🔗 Dependências (Turbo)

Principais relações conforme turbo.json (build dependsOn):

- @neonpro/database → @neonpro/types
- @neonpro/cache → @neonpro/types, @neonpro/database
- @neonpro/auth → @neonpro/types, @neonpro/database
- @neonpro/shared → @neonpro/types, @neonpro/database, @neonpro/auth
- @neonpro/monitoring → @neonpro/types, @neonpro/database, @neonpro/shared
- @neonpro/devops → @neonpro/types, @neonpro/database, @neonpro/monitoring
- @neonpro/ui → @neonpro/types, @neonpro/shared
- @neonpro/domain → @neonpro/types, @neonpro/database, @neonpro/shared
- @neonpro/ai → @neonpro/types, @neonpro/cache
- @neonpro/core-services → @neonpro/types, @neonpro/database, @neonpro/shared
- @neonpro/config → @neonpro/types
- @neonpro/utils → @neonpro/types
- @neonpro/security → @neonpro/types, @neonpro/database
- @neonpro/integrations → @neonpro/types, @neonpro/database, @neonpro/auth
- @neonpro/brazilian-healthcare-ui → @neonpro/types, @neonpro/ui, @neonpro/shared
- @neonpro/health-dashboard → @neonpro/types, @neonpro/ui, @neonpro/brazilian-healthcare-ui, @neonpro/monitoring
- @neonpro/enterprise → @neonpro/types, @neonpro/database, @neonpro/auth, @neonpro/security, @neonpro/compliance
- @neonpro/docs → @neonpro/types

## 🏗️ Builds & Saídas

- turbo tasks.build outputs: .next/** (apps/web), dist/** (packages), build/**
- Root vercel.json
  - buildCommand: bash scripts/vercel-build.sh
  - functions: apps/web/app/api/**/*.{js,ts} → runtime nodejs20.x
  - headers: security + CORS for /api
  - env: NEXT_PUBLIC_API_URL="/api"
- apps/api/vercel.json
  - routes: /api/(.*) → /api/index.ts
  - functions: api/index.ts runtime nodejs20.x

## 🧪 Testes

- Root vitest.config.ts utiliza "projects":
  - unit: include tools/tests/**, apps/web/tests/**, apps/api/src/**/*.test.ts, packages/ui|utils|core-services|shared
  - integration: include apps/web/tests/integration/** e packages/*/tests/integration/**
- Execução via pnpm test (turbo run test)

## 📌 Estado dos Testes (Última Execução)

- Comando: pnpm test
- Resultado: FALHA — @neonpro/tooling#test não encontrou arquivos de teste
- Saída relevante (vitest):
  - "No test files found, exiting with code 1"
  - Padrões do projeto unit/integration configurados no vitest.root
- Observação: Por solicitação, nenhum ajuste foi aplicado. O pacote @neonpro/tooling expõe scripts de teste, mas não possui testes em tools/tests no momento.

## 🔄 Notas de Atualização

- Atualizado apps/, packages/ e tools/ para refletir a estrutura real conforme o repositório
- Dependências entre pacotes sincronizadas com turbo.json
- Adicionados detalhes de build/saídas e configurações de deployment (vercel.json)
- Registrado estado atual dos testes e cobertura (não gerada devido à falha)
