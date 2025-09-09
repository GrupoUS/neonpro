# 📁 NeonPro Source Tree Structure

**Real monorepo structure (apps/packages) validated and categorized**

## 🌳 **Estrutura de Diretórios Principal**

```
neonpro/
├── 📁 apps/                              # Aplicações principais
│   ├── 📁 api/                           # Backend Hono.dev
│   │   ├── 📄 package.json               # Dependencies & scripts
│   │   ├── 📁 src/
│   │   │   ├── 📄 index.ts              # Main Hono app entry
│   │   │   ├── 📁 routes/               # API route handlers
│   │   │   ├── 📁 middleware/           # Healthcare security middleware
│   │   │   └── 📁 lib/                  # Shared utilities
│   │   └── 📄 vitest.config.ts         # Test configuration
│   │
│   └── 📁 web/                          # Frontend Application (TanStack Router + Vite)
│       ├── 📄 package.json              # Dependencies & scripts
│       ├── 📁 src/                      # TanStack Router Application (NEW)
│       │   ├── 📄 main.tsx              # Application entry point
│       │   ├── 📁 routes/               # File-based routing (TanStack Router)
│       │   ├── 📁 components/           # React components
│       │   │   └── 📁 ui/               # shadcn/ui components (complete)
│       │   ├── 📁 hooks/                # Custom hooks
│       │   ├── 📁 contexts/             # React contexts
│       │   ├── 📁 providers/            # Context providers
│       │   ├── 📁 features/             # Feature-based components
│       │   ├── 📁 lib/                  # Utilities & configs
│       │   │   ├── 📄 supabase.ts       # Supabase client
│       │   │   └── 📄 toast-helpers.ts  # Toast utilities
│       │   ├── 📁 styles/               # CSS & styling
│       │   └── 📁 test/                 # Test setup & utilities
│       ├── 📄 vite.config.ts           # Vite configuration
│       ├── 📄 tailwind.config.ts       # Tailwind CSS config
│       └── 📄 index.html               # Vite HTML entry point
│
├── 📁 packages/                          # Shared packages
│   ├── 📁 ui/                           # Shared UI components
│   ├── 📁 utils/                        # Shared utilities
│   ├── 📁 database/                     # Database schemas & migrations
│   ├── 📁 shared/                       # Shared types & constants
│   ├── 📁 security/                     # Healthcare security utilities
│   └── 📁 types/                        # Shared TypeScript types
│
├── 📁 docs/                             # Project documentation
│   ├── 📄 AGENTS.md                     # Agent coordination system
│   ├── 📁 architecture/                 # Architecture documentation
│   ├── 📁 apis/                         # API documentation
│   ├── 📁 rules/                        # Coding standards & rules
│   └── 📁 database-schema/              # Database documentation
│
├── 📁 tools/                            # Development tools
├── 📁 .github/                          # GitHub workflows & templates
├── 📁 .claude/                          # Claude configuration
├── 📄 turbo.json                        # Turborepo configuration
├── 📄 package.json                      # Root package configuration
└── 📄 pnpm-workspace.yaml               # PNPM workspace config
```

## 🎯 **Quando Usar Esta Estrutura**

### **Localização de Código**

- **Backend API**: `apps/api/src/` - Todas as APIs Hono
- **Frontend**: `apps/web/src/` - Aplicação React + TanStack Router
- **Componentes Compartilhados**: `packages/ui/src/` - UI components
- **Utilitários**: `packages/utils/src/` - Funções utilitárias
- **Tipos**: `packages/types/src/` - TypeScript definitions

### **Wiring Entre Repos**

- **Workspace Dependencies**: Use `workspace:*` no package.json
- **Imports**: Use aliases configurados (`@neonpro/ui`, `@neonpro/utils`)
- **Build**: Turborepo gerencia dependências entre packages

## 🔧 **Configurações de Build**

### **Turborepo Pipeline**

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    }
  }
}
```

### **Package Manager**

- **Primary**: PNPM (performance + efficiency)
- **Fallback**: Bun (3-5x faster for scripts)
- **Workspace**: Shared dependencies in root

## 📦 **Package Dependencies**

### **Apps**

- **api**: Independente, apenas packages internos
- **web**: Depende de todos os packages compartilhados

### **Packages**

- **ui**: Depende de utils, types
- **database**: Independente (Prisma schemas)
- **shared**: Depende de types
- **utils**: Independente
- **types**: Base para todos

## 🎨 **Padrões de Importação**

```typescript
// Internal packages
import type { Patient, } from '@neonpro/types'
import { Button, } from '@neonpro/ui'
import { formatDate, } from '@neonpro/utils'

// Local imports
import { Header, } from '@/components/header'
import { useAuth, } from '@/hooks/useAuth'
import { cn, } from '@/lib/utils'
```

## 🚀 **Scripts de Desenvolvimento**

```bash
# Development
pnpm dev           # Start all apps in dev mode
pnpm dev:web       # Start only web app
pnpm dev:api       # Start only API

# Build
pnpm build         # Build all packages + apps
pnpm build:web     # Build web app only

# Quality
pnpm lint          # Lint all packages
pnpm type-check    # TypeScript check all
pnpm test          # Run all tests
```

## 📋 **File Naming Conventions**

### **Components**

- **React Components**: PascalCase (`PatientCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`usePatients.ts`)
- **Utilities**: camelCase (`formatCurrency.ts`)
- **Types**: PascalCase (`Patient.ts`, `ApiResponse.ts`)

### **Directories**

- **kebab-case**: `patient-portal/`, `health-records/`
- **camelCase**: Para JavaScript concepts (`components/`, `hooks/`)

## 🔍 **Navegação Rápida**

| Funcionalidade     | Localização            | Propósito             |
| ------------------ | ---------------------- | --------------------- |
| **API Routes**     | `apps/api/src/routes/` | Endpoints Hono        |
| **React Pages**    | `apps/web/src/routes/` | TanStack Router pages |
| **UI Components**  | `packages/ui/src/`     | Shared components     |
| **Business Logic** | `apps/web/src/hooks/`  | Custom hooks          |
| **Database**       | `packages/database/`   | Schemas & migrations  |
| **Config Files**   | Root + app directories | Build & tool configs  |

---

**Status**: ✅ **VALIDATED**\
**Última Atualização**: 2025-01-08\
**Uso**: Locating code, packages, or wiring across the repo
