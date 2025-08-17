# Source Tree Architecture - NeonPro Turborepo

> **Feature-based Monorepo Structure baseada em melhores práticas 2025**

## 🏗️ **Estrutura Geral do Monorepo**

```
neonpro/
├── apps/                           # Aplicações deployáveis
│   ├── web/                        # Next.js 15 main app (healthcare dashboard)
│   ├── admin/                      # Admin dashboard (opcional futuro)
│   ├── mobile/                     # React Native app (futuro)
│   └── docs/                       # Documentation site (Nextra)
│
├── packages/                       # Packages compartilhados
│   ├── ui/                        # Design system & components
│   ├── shared/                    # Business logic compartilhada
│   ├── config/                    # Configurações compartilhadas
│   ├── types/                     # TypeScript types globais
│   └── utils/                     # Utilities & helpers
│
├── tools/                         # Ferramentas de desenvolvimento
│   ├── eslint-config/            # ESLint configurations
│   ├── tsconfig/                 # TypeScript configurations
│   └── scripts/                  # Build & deployment scripts
│
├── docs/                          # Documentação do projeto
│   ├── architecture/             # Architectural decisions
│   ├── guides/                   # Development guides
│   └── api/                      # API documentation
│
├── turbo.json                     # Turborepo pipeline configuration
├── pnpm-workspace.yaml           # pnpm workspace configuration
└── package.json                   # Root package.json
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
├── hooks/                        # Custom React hooks
│   ├── use-auth.ts
│   ├── use-patients.ts
│   └── use-appointments.ts
│
├── types/                        # App-specific types
│   ├── auth.ts
│   ├── database.ts
│   └── api.ts
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

## 🛠️ **Tools Structure**

### **tools/eslint-config/**
```
tools/eslint-config/
├── base.js                       # Base ESLint config
├── nextjs.js                     # Next.js specific rules
├── react.js                      # React specific rules
└── package.json
```

### **tools/tsconfig/**
```
tools/tsconfig/
├── base.json                     # Base TypeScript config
├── nextjs.json                   # Next.js specific config
├── library.json                  # Library config
└── package.json
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
```

## 🔄 **Package Dependencies Strategy**

### **Dependency Hierarchy**
```
apps/web
├── @neonpro/ui
├── @neonpro/shared
├── @neonpro/types
├── @neonpro/config
└── @neonpro/eslint-config

packages/ui
├── @neonpro/types
└── @neonpro/config (design tokens)

packages/shared
├── @neonpro/types
└── @neonpro/config
```

### **Workspace Protocol Usage**
```json
{
  "dependencies": {
    "@neonpro/ui": "workspace:*",
    "@neonpro/shared": "workspace:*",
    "@neonpro/types": "workspace:*"
  }
}
```

## 🎯 **Benefits desta Estrutura**

### **✅ Vantagens**
- **Feature Independence**: Cada feature é autocontida
- **Code Sharing**: Packages compartilhados reduzem duplicação
- **Type Safety**: Types centralizados garantem consistência
- **Build Optimization**: Turborepo otimiza builds baseado em dependências
- **Team Scalability**: Times podem trabalhar independentemente em features
- **Testing Isolation**: Testes podem ser executados por feature/package

### **📊 Performance Benefits**
- **Incremental Builds**: Apenas código alterado é reconstruído
- **Parallel Execution**: Tasks executam em paralelo quando possível
- **Remote Caching**: Builds são compartilhados entre desenvolvedores
- **Tree Shaking**: Bundle optimization automático

### **🔧 Developer Experience**
- **Hot Reload**: Mudanças refletem instantaneamente
- **IntelliSense**: Autocomplete funciona entre packages
- **Refactoring**: Rename/move funciona através do monorepo
- **Debugging**: Source maps funcionam seamlessly

---

> **📝 Nota**: Esta estrutura evolui baseada no crescimento do projeto e feedback do time. Novas features seguem o padrão feature-based estabelecido.