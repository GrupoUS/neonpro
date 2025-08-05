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

## 📦 Complete Dependency Map

### Production Dependencies
```json
{
  "@hookform/resolvers": "latest",
  "@radix-ui/react-avatar": "latest",
  "@radix-ui/react-dialog": "latest", 
  "@radix-ui/react-dropdown-menu": "latest",
  "@radix-ui/react-icons": "latest",
  "@radix-ui/react-label": "latest",
  "@radix-ui/react-navigation-menu": "latest",
  "@radix-ui/react-popover": "latest",
  "@radix-ui/react-scroll-area": "latest",
  "@radix-ui/react-separator": "latest",
  "@radix-ui/react-slot": "latest",
  "@radix-ui/react-tabs": "latest",
  "@radix-ui/react-toast": "latest",
  "@supabase/ssr": "latest",
  "@supabase/supabase-js": "latest",
  "class-variance-authority": "latest",
  "clsx": "latest",
  "lucide-react": "latest",
  "next": "latest",
  "next-themes": "latest",
  "react": "latest",
  "react-dom": "latest",
  "react-hook-form": "latest",
  "sonner": "latest",
  "tailwind-merge": "latest",
  "tailwindcss-animate": "latest",
  "zod": "latest"
}
```

### Development Dependencies
```json
{
  "@types/node": "latest",
  "@types/react": "latest", 
  "@types/react-dom": "latest",
  "eslint": "latest",
  "eslint-config-next": "latest",
  "postcss": "latest",
  "tailwindcss": "latest",
  "typescript": "latest"
}
```

## ⚙️ Configuration Files

### Next.js Configuration
```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['supabase.co', 'your-supabase-url.supabase.co'],
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

### Tailwind Configuration
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
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