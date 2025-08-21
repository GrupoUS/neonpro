# Tech Stack - NeonPro Healthcare Platform 2025

> **Enhanced com configurações avançadas Turborepo e melhores práticas 2025**

## 🏗️ **Core Architecture**

### **Monorepo Management**
- **Turborepo 2.x** - Build system e task orchestration
- **pnpm 9.x** - Package manager com workspaces
- **TypeScript 5.x** - Type safety e development experience

### **Frontend Stack**
- **Next.js 15** - React framework com App Router + Server Components
- **React 19** - UI library com Server Components
- **TanStack Query 5.x** - Server state management e data fetching
- **Tailwind CSS 3.x** - Utility-first CSS framework
- **shadcn/ui + TweakCN** - Component library com healthcare theme

### **Backend & Database**
- **Hono.dev 4.x** - Ultra-fast web framework para Edge Functions
- **Vercel Edge Functions** - Serverless compute com Hono.dev runtime
- **Supabase** - PostgreSQL, Auth, Real-time, Storage
- **Row Level Security (RLS)** - Database-level authorization
- **Hono RPC Client** - Type-safe API communication

### **Development & Quality**
- **Biome** - Code formatting e linting (substitui ESLint + Prettier)
- **Vitest** - Unit testing framework
- **Playwright** - E2E testing
- **TypeScript** - Static type checking

## 📦 **Dependency Mapping**

### **Production Dependencies**
```yaml
RUNTIME_DEPENDENCIES:
  React_Ecosystem:
    - "react": "^19.0.0"
    - "react-dom": "^19.0.0"
    - "next": "^15.0.0"
    
  State_Management:
    - "@tanstack/react-query": "^5.0.0"
    - "@tanstack/react-query-devtools": "^5.0.0"
    - "zustand": "^4.0.0"
    
  UI_Components:
    - "@radix-ui/react-*": "^1.0.0"
    - "lucide-react": "^0.400.0"
    - "tailwindcss": "^3.4.0"
    
  Forms_Validation:
    - "react-hook-form": "^7.45.0"
    - "zod": "^3.22.0"
    - "@hookform/resolvers": "^3.3.0"
    
  Backend_Framework:
    - "hono": "^4.0.0"
    - "@hono/node-server": "^1.0.0"
    - "@hono/zod-validator": "^0.2.0"

  Backend_SDKs:
    - "@supabase/supabase-js": "^2.38.0"
    - "@supabase/ssr": "^0.0.10"
    
  Utilities:
    - "clsx": "^2.0.0"
    - "tailwind-merge": "^2.0.0"
    - "class-variance-authority": "^0.7.0"
    - "date-fns": "^2.30.0"
```

### **Development Dependencies**
```yaml
DEVELOPMENT_DEPENDENCIES:
  Build_Tools:
    - "turbo": "^2.0.0"
    - "tsup": "^8.0.0"
    - "typescript": "^5.2.0"
    
  Code_Quality:
    - "@biomejs/biome": "^1.4.0"
    - "prettier": "^3.0.0" # Legacy support
    - "eslint": "^8.0.0" # Legacy support
    
  Testing:
    - "vitest": "^1.0.0"
    - "@testing-library/react": "^14.0.0"
    - "@testing-library/jest-dom": "^6.0.0"
    - "playwright": "^1.40.0"
    
  Type_Generation:
    - "supabase": "^1.100.0"
    - "@supabase/cli": "^1.100.0"
```

## ⚙️ **Configuration Files**

### **turbo.json - Build Pipeline**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": [
        "$TURBO_DEFAULT$",
        ".env.local",
        ".env.production"
      ],
      "outputs": [
        ".next/**",
        "!.next/cache/**",
        "dist/**",
        "build/**"
      ],
      "env": [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "NEXT_PUBLIC_APP_URL"
      ]
    },
    "dev": {
      "cache": false,
      "persistent": true,
      "inputs": [
        "$TURBO_DEFAULT$",
        ".env.local"
      ]
    },
    "lint": {
      "dependsOn": ["^lint"],
      "inputs": [
        "src/**/*.{ts,tsx,js,jsx}",
        "app/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
        "lib/**/*.{ts,tsx}",
        "biome.json",
        "eslint.config.js"
      ]
    },
    "type-check": {
      "dependsOn": ["^build"],
      "inputs": [
        "$TURBO_DEFAULT$",
        "tsconfig.json"
      ]
    },
    "test": {
      "dependsOn": ["^build"],
      "inputs": [
        "src/**/*.{ts,tsx}",
        "tests/**/*.{ts,tsx}",
        "__tests__/**/*.{ts,tsx}",
        "vitest.config.ts"
      ],
      "outputs": [
        "coverage/**"
      ]
    },
    "test:e2e": {
      "dependsOn": ["build"],
      "inputs": [
        "tests/**/*.{ts,tsx}",
        "e2e/**/*.{ts,tsx}",
        "playwright.config.ts"
      ]
    }
  },
  "remoteCache": {
    "signature": true,
    "enabled": true
  },
  "experimentalSpaces": {
    "id": "neonpro-spaces"
  }
}
```

### **pnpm-workspace.yaml - Workspace Config**
```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tools/*"

# Shared dependencies hoisting
shamefullyHoist: false

# Node modules settings
nodeLinker: isolated

# Resolution settings
packageExtensions:
  react-dom:
    peerDependencies:
      react: "*"

# Dependency overrides
overrides:
  "react": "^19.0.0"
  "react-dom": "^19.0.0"
  "@types/react": "^18.2.0"
  "@types/react-dom": "^18.2.0"

# pnpm-specific optimizations
save-exact: true
resolution-mode: highest
```

### **biome.json - Code Quality**
```json
{
  "$schema": "https://biomejs.dev/schemas/1.4.1/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 80,
    "lineEnding": "lf"
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": {
        "noForEach": "error",
        "noStaticOnlyClass": "error"
      },
      "style": {
        "noNonNullAssertion": "warn",
        "useNodejsImportProtocol": "error"
      },
      "suspicious": {
        "noExplicitAny": "warn",
        "noArrayIndexKey": "warn"
      },
      "performance": {
        "noDelete": "error"
      },
      "nursery": {
        "useSortedClasses": "error"
      }
    }
  },
  "javascript": {
    "formatter": {
      "semicolons": "asNeeded",
      "quoteStyle": "single",
      "jsxQuoteStyle": "double",
      "trailingComma": "es5"
    }
  },
  "typescript": {
    "formatter": {
      "semicolons": "asNeeded",
      "quoteStyle": "single"
    }
  },
  "files": {
    "include": [
      "src/**/*",
      "app/**/*",
      "components/**/*",
      "lib/**/*",
      "packages/**/*",
      "apps/**/*"
    ],
    "ignore": [
      "node_modules",
      ".next",
      "dist",
      "build",
      "coverage",
      "*.config.js",
      "*.config.ts"
    ]
  }
}
```

### **Root tsconfig.json - TypeScript Base**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/app/*": ["./app/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### **Hono.dev Configuration (apps/api)**
```typescript
// apps/api/src/index.ts - Main Hono application
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'

// Route imports
import { authRoutes } from './routes/auth'
import { patientsRoutes } from './routes/patients'
import { appointmentsRoutes } from './routes/appointments'
import { clinicsRoutes } from './routes/clinics'

// Middleware imports
import { authMiddleware } from './middleware/auth'
import { lgpdMiddleware } from './middleware/lgpd'
import { rateLimitMiddleware } from './middleware/rate-limit'

const app = new Hono()

// Global middleware
app.use('*', cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://neonpro.app'] 
    : ['http://localhost:3000'],
  credentials: true,
}))

app.use('*', logger())
app.use('*', secureHeaders())
app.use('*', rateLimitMiddleware())
app.use('*', lgpdMiddleware())

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// API routes with authentication
app.route('/api/v1/auth', authRoutes)
app.use('/api/v1/*', authMiddleware())
app.route('/api/v1/patients', patientsRoutes)
app.route('/api/v1/appointments', appointmentsRoutes)
app.route('/api/v1/clinics', clinicsRoutes)

export default app
export type AppType = typeof app
```

```typescript
// apps/api/package.json - Hono project configuration
{
  "name": "@neonpro/api",
  "version": "0.1.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsup",
    "start": "node dist/index.js",
    "test": "vitest",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "hono": "^4.0.0",
    "@hono/node-server": "^1.0.0",
    "@hono/zod-validator": "^0.2.0",
    "@supabase/supabase-js": "^2.38.0",
    "zod": "^3.23.8",
    "jose": "^5.0.0"
  },
  "devDependencies": {
    "@neonpro/tsconfig": "workspace:*",
    "tsx": "^4.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.2.0",
    "vitest": "^1.0.0"
  }
}
```

## 🚀 **Build Scripts**

### **Root package.json Scripts**
```json
{
  "scripts": {
    "build": "turbo run build",
    "build:api": "turbo run build --filter=@neonpro/api",
    "dev": "turbo run dev",
    "dev:api": "turbo run dev --filter=@neonpro/api",
    "dev:web": "turbo run dev --filter=@neonpro/web",
    "lint": "turbo run lint",
    "lint:fix": "turbo run lint:fix",
    "type-check": "turbo run type-check",
    "test": "turbo run test",
    "test:e2e": "turbo run test:e2e",
    "test:coverage": "turbo run test -- --coverage",
    "clean": "turbo run clean",
    "format": "biome format --write .",
    "format:check": "biome format .",
    "check": "biome check .",
    "check:fix": "biome check --apply .",
    "ci": "pnpm run format:check && pnpm run lint && pnpm run type-check && pnpm run test",
    "postinstall": "pnpm run build --filter=@neonpro/types",
    "db:generate": "supabase gen types typescript --project-id $PROJECT_REF > packages/types/src/database.ts",
    "db:push": "supabase db push",
    "db:pull": "supabase db pull",
    "db:reset": "supabase db reset"
  }
}
```

### **App-specific Scripts (apps/web)**
```json
{
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start",
    "lint": "biome check src/ app/ components/ lib/",
    "lint:fix": "biome check --apply src/ app/ components/ lib/",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "clean": "rm -rf .next dist coverage"
  }
}
```

### **Package-specific Scripts (packages/ui)**
```json
{
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "lint": "biome check src/",
    "lint:fix": "biome check --apply src/",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "clean": "rm -rf dist coverage",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

## 🔧 **Build Optimization**

### **tsup Configuration (packages/ui)**
```typescript
// tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  esbuildOptions: (options) => {
    options.banner = {
      js: '"use client";',
    }
  },
})
```

### **Next.js Configuration**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      '@neonpro/ui',
      '@neonpro/shared',
      'lucide-react',
      '@radix-ui/react-icons'
    ],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  transpilePackages: [
    '@neonpro/ui',
    '@neonpro/shared',
    '@neonpro/types'
  ],
  images: {
    domains: ['avatars.githubusercontent.com'],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

### **Tailwind Configuration**
```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

## 📱 **Progressive Web App (PWA)**

### **PWA Configuration**
```javascript
// next.config.js (with PWA)
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
        }
      }
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
        }
      }
    }
  ]
})

module.exports = withPWA(nextConfig)
```

### **Service Worker Strategy**
```typescript
// src/lib/sw.ts
const SW_VERSION = '1.0.0'

// Cache strategies
const CACHE_STRATEGIES = {
  static: 'CACHE_FIRST',
  api: 'NETWORK_FIRST',
  images: 'CACHE_FIRST'
}

// Offline fallbacks
const OFFLINE_FALLBACKS = {
  document: '/offline.html',
  image: '/images/offline-fallback.svg',
  audio: '/audio/offline-fallback.mp3',
  video: '/videos/offline-fallback.mp4'
}
```

## 🔄 **Update & Versioning Strategy**

### **Dependency Update Schedule**
```yaml
UPDATE_SCHEDULE:
  Daily:
    - Security patches (automated via Dependabot)
    
  Weekly:
    - Patch updates for direct dependencies
    - Biome updates
    - Internal package updates
    
  Monthly:
    - Minor version updates
    - Tool updates (Turborepo, Vitest, Playwright)
    - Review and update base configurations
    
  Quarterly:
    - Major version updates (after thorough testing)
    - Architecture reviews
    - Performance audits
    - Security audits
```

### **Breaking Change Management**
```yaml
BREAKING_CHANGES:
  Process:
    1. Impact analysis across all packages
    2. Create migration guide
    3. Gradual rollout with feature flags
    4. Comprehensive testing
    5. Team training and documentation
    
  Communication:
    - RFC process for major changes
    - Change logs with migration paths
    - Team notifications via Slack
    - Documentation updates
```

### **Version Pinning Strategy**
```yaml
VERSION_STRATEGY:
  Exact_Pinning: # No caret (^) or tilde (~)
    - React ecosystem packages
    - Build tools (Turborepo, Vite, etc.)
    - Testing frameworks
    
  Range_Allowed: # Caret (^) for patch updates
    - Utility libraries
    - UI libraries (if stable API)
    - Development tools
    
  Regular_Updates:
    - Weekly security patches
    - Monthly minor updates
    - Quarterly major reviews
```

## 🎯 **Performance Targets 2025**

### **Build Performance**
```yaml
BUILD_METRICS:
  Development:
    - First build: <15 seconds
    - Incremental builds: <3 seconds
    - Hot reload: <500ms
    - Type checking: <5 seconds
    
  Production:
    - Full build (all apps): <10 minutes
    - Single app build: <3 minutes
    - Cache hit rate: >85%
    - Bundle analysis: <1 minute
    
  CI/CD:
    - Lint + Type check: <2 minutes
    - Test suite: <5 minutes
    - Build + Deploy: <8 minutes
    - Full pipeline: <15 minutes
```

### **Runtime Performance**
```yaml
RUNTIME_METRICS:
  Core_Web_Vitals:
    - LCP: <1.5s (target), <2.5s (threshold)
    - FID: <50ms (target), <100ms (threshold)
    - CLS: <0.05 (target), <0.1 (threshold)
    
  Bundle_Size:
    - Initial JS: <200KB gzipped
    - Initial CSS: <50KB gzipped
    - Images: WebP/AVIF with fallbacks
    - Total page weight: <1MB
    
  Caching:
    - Static assets: 1 year cache
    - API responses: Context-based caching
    - Database queries: Query-level optimization
    - CDN hit rate: >95%
```

---

> **🔄 Living Document**: Tech stack evolui baseado em pesquisa contínua de melhores práticas, performance benchmarks e feedback do time de desenvolvimento. Última atualização: Janeiro 2025.