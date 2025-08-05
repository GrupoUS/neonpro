# NeonPro Technology Stack - BMAD Enhanced

*Auto-loaded by BMad Dev Agent (@dev) - Version: BMad v4.29.0*

## 🎯 Overview
This document defines the complete technology stack, configurations, and architectural decisions for NeonPro following BMAD Method standards. It is automatically loaded when using the BMad Dev Agent (@dev) to ensure all implementations align with the chosen technology foundation and maintain ≥9.5/10 quality standards.

## 🏗️ BMAD-Enhanced Core Technology Stack

### Hybrid Frontend Architecture (BMAD-Optimized)
- **Next.js 15**: App Router with React 19 Server Components by default
- **React 19**: Latest stable with concurrent features, Actions, and enhanced form handling  
- **Vite 6**: Ultra-fast development server for interactive components and rapid iteration
- **TypeScript 5.6+**: Strict configuration for type safety and BMAD quality compliance
- **Tailwind CSS 4.0**: Utility-first CSS framework with design tokens and CSS-in-JS support

### React 19 + Vite Integration Strategy
```typescript
// Hybrid Architecture Pattern
// Next.js for SSR pages and SEO-critical routes
// Vite for interactive components and development speed

// Next.js Pages (app/dashboard/page.tsx)
export default async function DashboardPage() {
  const data = await fetchServerData()
  return <DashboardLayout data={data} />
}

// Vite Components (components/interactive/PatientForm.tsx)  
"use client"
import { useActionState } from 'react' // React 19 feature
export default function PatientForm() {
  const [state, formAction] = useActionState(createPatient, initialState)
  // Fast HMR development with Vite
}
```

### Backend & Database (BMAD-Compliant)
- **Supabase**: Postgres database with real-time capabilities and edge functions
- **Supabase Auth**: JWT-based authentication with OAuth providers and RLS integration
- **Row Level Security (RLS)**: Multi-tenant data isolation with clinic_id sharding
- **Edge Functions**: Serverless Deno functions for BMAD-compliant business logic
- **Supabase Realtime**: WebSocket connections for live collaborative features

### UI Component System (Design System Excellence)
- **shadcn/ui v4**: Component library built on Radix UI primitives with BMAD quality standards
- **Radix UI**: Accessible, unstyled UI primitives ensuring WCAG 2.1 AA+ compliance
- **Lucide React**: Icon library for consistent iconography across all components
- **CSS Variables**: Design token system for theming and dark mode support
- **Tailwind CSS**: Utility-first with custom aesthetic clinic design system

### Form & Validation (React 19 Enhanced)
- **react-hook-form**: Performant forms with minimal re-renders and React 19 Actions integration
- **zod**: TypeScript-first schema validation with BMAD compliance rules
- **@hookform/resolvers**: Integration between react-hook-form and zod for form validation
- **React 19 Actions**: Server Actions for optimistic updates and error handling

### Development Tools (BMAD Workflow)
- **pnpm**: Fast, efficient package manager for monorepo support
- **Vite 6**: Development server with HMR for rapid component iteration
- **ESLint 9**: Code linting with Next.js configuration and BMAD quality rules
- **Prettier**: Code formatting integrated with ESLint for consistency
- **TypeScript 5.6+**: Static type checking with strict configuration
- **Biome**: Fast linter and formatter alternative for performance-critical workflows

### Deployment & Infrastructure (Edge-Optimized)
- **Vercel**: Frontend hosting with Edge Runtime and global CDN
- **Supabase Cloud**: Managed Postgres with global replication and edge functions
- **Vercel Analytics**: Performance monitoring and user analytics with GDPR compliance
- **GitHub Actions**: CI/CD pipeline with BMAD quality gates and automated testing
- **Docker**: Containerized development environment for consistency across team

## 📦 BMAD-Enhanced Dependency Map

### Production Dependencies (React 19 + Vite 6 Ready)
```json
{
  "@hookform/resolvers": "^3.3.4",
  "@radix-ui/react-avatar": "^1.0.4",
  "@radix-ui/react-dialog": "^1.0.5", 
  "@radix-ui/react-dropdown-menu": "^2.0.6",
  "@radix-ui/react-icons": "^1.3.0",
  "@radix-ui/react-label": "^2.0.2",
  "@radix-ui/react-navigation-menu": "^1.1.4",
  "@radix-ui/react-popover": "^1.0.7",
  "@radix-ui/react-scroll-area": "^1.0.5",
  "@radix-ui/react-separator": "^1.0.3",
  "@radix-ui/react-slot": "^1.0.2",
  "@radix-ui/react-tabs": "^1.0.4",
  "@radix-ui/react-toast": "^1.1.5",
  "@supabase/ssr": "^0.1.0",
  "@supabase/supabase-js": "^2.39.3",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.0",
  "lucide-react": "^0.263.1",
  "next": "^15.0.3",
  "next-themes": "^0.2.1",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-hook-form": "^7.49.3",
  "sonner": "^1.4.0",
  "tailwind-merge": "^2.2.1",
  "tailwindcss-animate": "^1.0.7",
  "zod": "^3.22.4",
  "framer-motion": "^11.0.3",
  "date-fns": "^3.3.1",
  "use-debounce": "^10.0.0"
}
```

### Development Dependencies (BMAD Toolchain)
```json
{
  "@types/node": "^20.11.17",
  "@types/react": "^19.0.0", 
  "@types/react-dom": "^19.0.0",
  "eslint": "^9.0.0",
  "eslint-config-next": "^15.0.3",
  "postcss": "^8.4.35",
  "tailwindcss": "^4.0.0-alpha.20",
  "typescript": "^5.6.2",
  "vite": "^6.0.0",
  "@vitejs/plugin-react": "^4.2.1",
  "vitest": "^2.0.5",
  "@testing-library/react": "^14.2.1",
  "@testing-library/jest-dom": "^6.4.2",
  "playwright": "^1.41.2",
  "@biomejs/biome": "^1.5.3",
  "husky": "^9.0.10",
  "lint-staged": "^15.2.2"
}
```

### Vite Configuration Integration
```typescript
// vite.config.ts - For interactive component development
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    port: 3001, // Different port from Next.js (3000)
    open: false,
  },
  build: {
    lib: {
      entry: 'components/interactive/index.ts',
      name: 'NeonProInteractive',
      fileName: 'neonpro-interactive',
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
})
```

## ⚙️ BMAD-Enhanced Configuration Files

### Next.js 15 Configuration (React 19 Ready)
```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
    ppr: true, // Partial Prerendering
    reactCompiler: true, // React 19 Compiler
  },
  images: {
    domains: ['supabase.co', 'your-supabase-url.supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },
  typescript: {
    // Enable strict type checking for BMAD quality
    ignoreBuildErrors: false,
  },
  eslint: {
    // Enforce BMAD coding standards
    ignoreDuringBuilds: false,
  },
  // Vite integration for development components
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.resolve.alias['@vite-components'] = path.resolve('./components/interactive')
    }
    return config
  },
}

export default nextConfig
```

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Tailwind 4.0 Configuration (Aesthetic Clinic Theme)
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    // Vite components integration
    './components/interactive/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // BMAD Design System Colors for Aesthetic Clinics
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Aesthetic clinic specific colors
        wellness: {
          50: "hsl(var(--wellness-50))",
          500: "hsl(var(--wellness-500))",
          900: "hsl(var(--wellness-900))",
        },
        treatment: {
          success: "hsl(var(--treatment-success))",
          warning: "hsl(var(--treatment-warning))",
          danger: "hsl(var(--treatment-danger))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Aesthetic-specific animations
        "fade-in-up": {
          from: {
            opacity: "0",
            transform: "translateY(10px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.3s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
}

export default config
```

## 🔌 Environment Configuration

### Required Environment Variables
```bash
# .env.local (Development)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OAuth Configuration (Google)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Application URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Production Environment Variables
```bash
# Vercel Production Environment
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

## 🏛️ Architecture Decisions

### Why Next.js 15 App Router?
- **Server Components**: Better performance and SEO
- **Nested Layouts**: Efficient UI composition
- **Built-in TypeScript**: First-class TypeScript support
- **Image Optimization**: Automatic image optimization
- **API Routes**: Full-stack capabilities

### Why Supabase?
- **Real-time**: Built-in real-time subscriptions
- **Authentication**: Complete auth system with OAuth
- **Row Level Security**: Built-in multi-tenancy
- **Edge Functions**: Serverless backend logic
- **PostgREST**: Automatic REST API generation

### Why shadcn/ui?
- **Accessible**: Built on Radix UI primitives
- **Customizable**: Easy theming with CSS variables
- **TypeScript**: Full TypeScript support
- **Modern**: Latest React patterns and best practices
- **Maintainable**: Copy-paste components, not package dependencies

### Why pnpm?
- **Speed**: Faster installation and resolution
- **Disk Efficiency**: Shared packages across projects
- **Strict**: Better dependency resolution
- **Monorepo**: Excellent workspace support

## 🔧 Development Scripts

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build", 
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

### VS Code Tasks Integration
```json
// Available VS Code tasks for NeonPro
{
  "NeonPro: Start Development": "pnpm dev",
  "NeonPro: Build Production": "pnpm build", 
  "NeonPro: Lint & Fix": "pnpm lint --fix",
  "NeonPro: Type Check": "pnpm tsc --noEmit"
}
```

## 📱 PWA Configuration

### Service Worker
- **Offline Support**: Cache critical resources
- **Background Sync**: Queue data when offline
- **Push Notifications**: Real-time notifications
- **App Install**: Native app installation

### Web Manifest
```json
{
  "name": "NeonPro Clinic Management",
  "short_name": "NeonPro",
  "description": "Modern clinic management system",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png", 
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 🔄 Update Strategy

### Dependency Management
- **Automated Updates**: All dependencies use "latest" for automatic updates
- **Security Updates**: Priority for security-related updates
- **Breaking Changes**: Careful review of major version updates
- **Testing**: Comprehensive testing before production deployment

### Version Tracking
- **Next.js**: Track LTS releases and new features
- **React**: Follow stable release cycle
- **Supabase**: Monitor feature releases and deprecations
- **shadcn/ui**: Update components as needed

---

*This document is part of the BMad Method configuration for NeonPro and is automatically loaded by the Dev Agent for consistent technology stack alignment.*
## 🚀 React 19 + Vite Migration Strategy

### Phase 1: Parallel Development Setup
```bash
# Install React 19 and Vite 6
pnpm add react@19 react-dom@19 vite@6 @vitejs/plugin-react@4
pnpm add -D @types/react@19 @types/react-dom@19

# Update Next.js to 15 for React 19 support
pnpm add next@15
```

### Phase 2: Hybrid Architecture Implementation
```typescript
// Development Workflow:
// 1. Use Vite for interactive component development (HMR speed)
// 2. Use Next.js for SSR pages and production builds
// 3. Share components between both environments

// components/interactive/index.ts (Vite entry point)
export { PatientForm } from './PatientForm'
export { AppointmentCalendar } from './AppointmentCalendar'
export { TreatmentSelector } from './TreatmentSelector'

// app/dashboard/patients/page.tsx (Next.js page)
import { PatientForm } from '@/components/interactive/PatientForm'
```

### Phase 3: React 19 Features Integration
```typescript
// Use React 19 Actions for form handling
"use client"
import { useActionState } from 'react'

export function PatientForm() {
  const [state, formAction] = useActionState(createPatient, {
    message: '',
    errors: {}
  })
  
  return (
    <form action={formAction}>
      {/* Optimistic updates built-in */}
    </form>
  )
}

// Server Actions with React 19 compatibility
export async function createPatient(prevState: any, formData: FormData) {
  // Validation with Zod
  const validatedFields = PatientSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  })
  
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to create patient.',
    }
  }
  
  // Database operation
  const { error } = await supabase
    .from('patients')
    .insert(validatedFields.data)
    
  if (error) {
    return { message: 'Database Error: Failed to create patient.' }
  }
  
  revalidatePath('/dashboard/patients')
  redirect('/dashboard/patients')
}
```

## 🔄 Development Scripts (BMAD-Enhanced)

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "dev:vite": "vite",
    "dev:both": "concurrently \"next dev\" \"vite\"",
    "build": "next build", 
    "build:vite": "vite build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:e2e": "playwright test",
    "format": "biome format --write .",
    "check": "biome check .",
    "prepare": "husky install"
  }
}
```

### BMAD Quality Gates Integration
```json
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint
pnpm type-check
pnpm test run
echo "✅ BMAD Quality Gates Passed"
```

## 📈 Performance Benchmarks (BMAD Target)

### Development Speed
- **Vite HMR**: <50ms component updates
- **Next.js SSR**: <100ms server response
- **Type Checking**: <2s full project check
- **Build Time**: <30s production build

### Runtime Performance
- **First Contentful Paint**: <1.2s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1
- **First Input Delay**: <100ms
- **Time to Interactive**: <3s

### Quality Metrics (BMAD ≥9.5/10)
- **TypeScript Coverage**: 100%
- **Test Coverage**: ≥90%
- **Accessibility Score**: ≥95
- **Performance Score**: ≥90
- **SEO Score**: ≥95

---

*This technology stack documentation is maintained as part of the BMAD Method and ensures consistent development standards across all NeonPro components.*