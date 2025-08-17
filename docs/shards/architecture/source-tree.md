# Source Tree Architecture - NeonPro Turborepo

> **Feature-based Monorepo Structure baseada em melhores práticas 2025**

## 🏗️ **Estrutura Geral do Monorepo**

```
neonpro/
├── apps/                           # Aplicações deployáveis
│   └── web/                        # Next.js 15 App Router (Principal)
│
├── packages/                       # Packages compartilhados
│   ├── ui/                        # Design system & components
│   ├── shared/                    # Business logic compartilhada
│   ├── types/                     # TypeScript types globais
│   ├── config/                    # Configurações compartilhadas
│   ├── utils/                     # Utilities & helpers
│   └── core-services/             # 🆕 Serviços centralizados (hooks, services)
│
├── tools/                         # 🆕 Ferramentas de desenvolvimento centralizadas
│   ├── testing/                   # Testes, mocks, relatórios centralizados
│   │   ├── unit/                  # Testes unitários
│   │   ├── integration/           # Testes de integração
│   │   ├── e2e/                   # Testes end-to-end (Playwright)
│   │   ├── mocks/                 # Dados mock centralizados
│   │   ├── reports/               # Relatórios de teste e análise
│   │   ├── fixtures/              # Dados de teste fixos
│   │   ├── coverage/              # Relatórios de cobertura
│   │   └── legacy-tests/          # Testes migrados do antigo src/
│   ├── scripts/                   # Scripts de build & deployment
│   └── config/                    # Configurações de ferramentas
│
├── infrastructure/                # 🆕 Infraestrutura e automação
│   └── automation/                # Jobs do Trigger.dev e automações
│       ├── client.ts              # Cliente Trigger.dev
│       ├── jobs/                  # Definições de jobs
│       │   ├── appointment-reminders.ts
│       │   ├── compliance-reports.ts
│       │   └── patient-followup.ts
│       └── config/                # Configurações de infraestrutura
│
├── docs/                          # Documentação do projeto
│   ├── shards/                    # Documentação modular
│   │   ├── architecture/          # Decisões arquiteturais
│   │   └── stories/               # User stories e especificações
│   ├── guides/                    # Guias de desenvolvimento
│   ├── api/                       # Documentação da API
│   └── archive/                   # 🆕 Código legado arquivado
│       └── legacy-app-structure/  # Estrutura antiga do src/app
│
├── turbo.json                     # Turborepo pipeline configuration
├── pnpm-workspace.yaml           # pnpm workspace configuration
├── package.json                   # Root package.json
└── playwright.config.ts           # Configuração global do Playwright
```

## 📱 **Apps Structure (Feature-based)**

### **apps/web/ - Main Healthcare Dashboard**
```
apps/web/
├── app/                           # Next.js 15 App Router
│   ├── (dashboard)/              # Route groups
│   │   ├── patients/             # Feature: Patient Management
│   │   │   ├── page.tsx          # List patients
│   │   │   ├── [id]/             # Patient details
│   │   │   ├── components/       # Patient-specific components
│   │   │   ├── actions.ts        # Server actions
│   │   │   └── types.ts          # Patient types
│   │   │
│   │   ├── appointments/         # Feature: Appointment System
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   ├── components/
│   │   │   ├── actions.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── analytics/            # Feature: Healthcare Analytics
│   │   │   ├── page.tsx
│   │   │   ├── components/
│   │   │   │   ├── charts/       # Chart components
│   │   │   │   ├── metrics/      # Metric components
│   │   │   │   └── reports/      # Report components
│   │   │   ├── actions.ts
│   │   │   └── types.ts
│   │   │
│   │   └── settings/             # Feature: System Settings
│   │       ├── page.tsx
│   │       ├── profile/
│   │       ├── team/
│   │       └── billing/
│   │
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   │
│   ├── api/                      # API routes
│   │   ├── patients/
│   │   ├── appointments/
│   │   ├── analytics/
│   │   └── webhooks/
│   │
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── loading.tsx               # Global loading UI
│   ├── error.tsx                 # Global error UI
│   └── not-found.tsx             # 404 page
│
├── components/                    # App-specific components
│   ├── layout/                   # Layout components
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── footer.tsx
│   │
│   ├── features/                 # Feature-specific components
│   │   ├── patient-card.tsx
│   │   ├── appointment-calendar.tsx
│   │   └── analytics-widget.tsx
│   │
│   └── providers/                # React providers
│       ├── auth-provider.tsx
│       ├── theme-provider.tsx
│       └── query-provider.tsx
│
├── lib/                          # App utilities
│   ├── auth.ts                   # Authentication logic
│   ├── db.ts                     # Database connection
│   ├── validations.ts            # Zod schemas
│   └── utils.ts                  # App-specific utilities
│
├── middleware.ts                 # Next.js middleware
├── next.config.js               # Next.js configuration
├── tailwind.config.js           # Tailwind configuration
└── package.json                 # App dependencies
```

## 📦 **Packages Structure**

### **packages/ui/ - Design System**
```
packages/ui/
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── button/
│   │   │   ├── button.tsx
│   │   │   ├── button.stories.tsx
│   │   │   ├── button.test.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── input/
│   │   ├── modal/
│   │   ├── card/
│   │   └── data-table/
│   │
│   ├── icons/                    # Icon components
│   │   ├── healthcare/           # Healthcare-specific icons
│   │   ├── general/              # General purpose icons
│   │   └── index.ts
│   │
│   ├── styles/                   # Design tokens & styles
│   │   ├── globals.css
│   │   ├── tokens.css
│   │   └── components.css
│   │
│   └── index.ts                  # Main export file
│
├── tailwind.config.js            # UI-specific Tailwind config
├── tsconfig.json                 # TypeScript config
└── package.json                  # UI package dependencies
```

### **packages/shared/ - Business Logic**
```
packages/shared/
├── src/
│   ├── services/                 # Business services
│   │   ├── patient-service.ts
│   │   ├── appointment-service.ts
│   │   ├── analytics-service.ts
│   │   └── notification-service.ts
│   │
│   ├── validations/              # Zod schemas
│   │   ├── patient.ts
│   │   ├── appointment.ts
│   │   └── user.ts
│   │
│   ├── constants/                # Business constants
│   │   ├── appointment-types.ts
│   │   ├── patient-statuses.ts
│   │   └── medical-specialties.ts
│   │
│   └── utils/                    # Business utilities
│       ├── date-helpers.ts
│       ├── medical-calculations.ts
│       └── report-generators.ts
│
├── tsconfig.json
└── package.json
```

### **packages/core-services/ - 🆕 Serviços Centralizados**
```
packages/core-services/
├── src/
│   ├── hooks/                    # React hooks centralizados
│   │   ├── usePatients.ts
│   │   ├── useAppointments.ts
│   │   ├── useAnalytics.ts
│   │   └── index.ts
│   │
│   ├── services/                 # Serviços de negócio centralizados
│   │   ├── api-client.ts
│   │   ├── data-fetcher.ts
│   │   ├── cache-manager.ts
│   │   └── index.ts
│   │
│   └── index.ts                  # Exports principais
│
├── tsconfig.json
└── package.json
```

### **packages/types/ - Global Types**
```
packages/types/
├── src/
│   ├── database.ts               # Supabase generated types
│   ├── api.ts                    # API response types
│   ├── auth.ts                   # Authentication types
│   ├── healthcare.ts             # Healthcare domain types
│   └── index.ts                  # Type exports
│
├── scripts/
│   └── generate-types.ts         # Type generation script
│
├── tsconfig.json
└── package.json
```

### **packages/config/ - Shared Configurations**
```
packages/config/
├── src/
│   ├── env.ts                    # Environment variables
│   ├── database.ts               # Database configuration
│   ├── auth.ts                   # Auth configuration
│   └── app.ts                    # App-wide settings
│
├── tsconfig.json
└── package.json
```

## 🛠️ **Tools Structure - 🆕 Centralizado**

### **tools/testing/ - Testing Centralizados**
```
tools/testing/
├── unit/                         # Testes unitários
│   ├── components/
│   ├── services/
│   ├── utils/
│   └── __mocks__/
│
├── integration/                  # Testes de integração
│   ├── api/
│   ├── database/
│   └── auth/
│
├── e2e/                         # Testes end-to-end (Playwright)
│   ├── specs/
│   │   ├── patient-flow.spec.ts
│   │   ├── appointment-flow.spec.ts
│   │   └── compliance.spec.ts
│   ├── fixtures/
│   ├── page-objects/
│   └── utils/
│
├── mocks/                       # Dados mock centralizados
│   ├── patients.json
│   ├── appointments.json
│   ├── users.json
│   └── services.json
│
├── reports/                     # Relatórios de teste e análise
│   ├── coverage/
│   ├── performance/
│   ├── accessibility/
│   └── security/
│
├── fixtures/                    # Dados de teste fixos
│   ├── database-seeds/
│   ├── test-images/
│   └── sample-documents/
│
├── coverage/                    # Relatórios de cobertura
│   ├── unit/
│   ├── integration/
│   └── combined/
│
└── legacy-tests/                # 🆕 Testes migrados do antigo src/
    └── archived-test-files/
```

### **tools/scripts/ - Scripts de Desenvolvimento**
```
tools/scripts/
├── build/                       # Scripts de build
├── deploy/                      # Scripts de deployment
├── database/                    # Scripts de database
├── quality/                     # Scripts de qualidade
└── maintenance/                 # Scripts de manutenção
```

## 🏗️ **Infrastructure Structure - 🆕 Infraestrutura Centralizada**

### **infrastructure/automation/ - Trigger.dev e Automações**
```
infrastructure/automation/
├── client.ts                    # Cliente Trigger.dev configurado
├── trigger.config.ts            # Configuração do Trigger.dev
│
├── jobs/                        # Definições de jobs
│   ├── appointment-reminders.ts # Lembretes de consulta
│   ├── compliance-reports.ts    # Relatórios de conformidade
│   ├── patient-followup.ts      # Follow-up de pacientes
│   ├── backup-automation.ts     # Backup automatizado
│   └── analytics-processing.ts  # Processamento de analytics
│
├── config/                      # Configurações de infraestrutura
│   ├── environments.ts
│   ├── schedules.ts
│   └── notifications.ts
│
└── utils/                       # Utilities para automação
    ├── email-templates.ts
    ├── notification-helpers.ts
    └── compliance-validators.ts
```

## 📚 **Documentation Structure - 🆕 Documentação Reorganizada**

### **docs/archive/ - Código Legado Arquivado**
```
docs/archive/
└── legacy-app-structure/        # 🆕 Estrutura antiga do src/app
    ├── components/              # Componentes antigos
    ├── pages/                   # Páginas antigas
    ├── styles/                  # Estilos antigos
    └── README.md                # Documentação do que foi arquivado
```

## ⚙️ **Configuration Files**

### **turbo.json - Pipeline Configuration**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "test:e2e": {
      "dependsOn": ["^build"],
      "outputs": ["tools/testing/reports/**"]
    }
  },
  "remoteCache": {
    "signature": true
  }
}
```

### **pnpm-workspace.yaml**
```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tools/*"
  - "infrastructure/*"
```

### **playwright.config.ts - Configuração Global**
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tools/testing/e2e/specs',
  outputDir: './tools/testing/reports/e2e-results',
  reporter: [
    ['html', { outputFolder: './tools/testing/reports/html' }],
    ['json', { outputFile: './tools/testing/reports/results.json' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
});
```

## 🔄 **Package Dependencies Strategy**

### **Dependency Hierarchy**
```
apps/web
├── @neonpro/ui
├── @neonpro/shared
├── @neonpro/types
├── @neonpro/config
├── @neonpro/core-services    # 🆕
└── @neonpro/utils

packages/ui
├── @neonpro/types
└── @neonpro/config

packages/shared
├── @neonpro/types
└── @neonpro/config

packages/core-services        # 🆕
├── @neonpro/types
├── @neonpro/shared
└── @neonpro/utils

infrastructure/automation
├── @neonpro/types
├── @neonpro/shared
└── @neonpro/core-services    # 🆕
```

### **Workspace Protocol Usage**
```json
{
  "dependencies": {
    "@neonpro/ui": "workspace:*",
    "@neonpro/shared": "workspace:*",
    "@neonpro/types": "workspace:*",
    "@neonpro/core-services": "workspace:*"
  }
}
```

## 🎯 **Benefits desta Nova Estrutura**

### **✅ Vantagens da Reorganização**
- **Testing Centralizado**: Todos os testes, mocks e relatórios em `tools/testing/`
- **Infrastructure Isolation**: Automações Trigger.dev organizadas em `infrastructure/automation/`
- **Legacy Management**: Código antigo arquivado de forma organizada em `docs/archive/`
- **Core Services**: Hooks e serviços reutilizáveis centralizados em `packages/core-services/`
- **Clean Structure**: Estrutura mais limpa e profissional seguindo best practices

### **📊 Performance Benefits**
- **Reduced Bundle Size**: Eliminação de código legado desnecessário
- **Centralized Caching**: Cache centralizado para testes e builds
- **Optimized Dependencies**: Dependências organizadas por responsabilidade
- **Parallel Testing**: Testes executam em paralelo de forma mais eficiente

### **🔧 Developer Experience Melhorado**
- **Clear Separation**: Separação clara entre app logic, infra e testes
- **Easy Navigation**: Estrutura intuitiva para encontrar arquivos
- **Maintenance**: Manutenção simplificada com responsabilidades bem definidas
- **Onboarding**: Novo developers entendem a estrutura rapidamente

### **🏗️ Architectural Benefits**
- **Scalability**: Estrutura preparada para crescimento do time e funcionalidades
- **Modularity**: Cada package tem responsabilidade bem definida
- **Reusability**: Componentes e serviços facilmente reutilizáveis
- **Professional Standard**: Segue padrões da indústria para monorepos enterprise

---

> **📝 Nota**: Esta estrutura reorganizada reflete o estado atual do projeto após cleanup abrangente. A organização centralizada de testes, infraestrutura e serviços melhora significativamente a maintainability e developer experience.