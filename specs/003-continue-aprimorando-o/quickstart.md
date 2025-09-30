# Quick Start: NEONPRO Theme + 7 UI Components Installation

## Overview
This guide provides step-by-step instructions for installing and configuring the NEONPRO theme system with 7 specific UI components for the NeonPro aesthetic clinic platform.

## Prerequisites

### System Requirements
- Node.js 18+ or Bun 1.0+
- Git repository access to NeonPro monorepo
- Admin access to modify packages in monorepo
- Basic knowledge of React, TypeScript, and Tailwind CSS

### Environment Setup
```bash
# Ensure you're on the correct branch
git checkout 003-continue-aprimorando-o

# Install dependencies (Bun preferred)
bun install

# Alternative with PNPM
pnpm install
```

## Installation Steps

### Step 1: Install NEONPRO Theme

#### 1.1 Configure Multiple Registries
Create or update `packages/ui/components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  },
  "registries": [
    {
      "name": "@shadcn",
      "url": "https://ui.shadcn.com/registry"
    },
    {
      "name": "@magicui",
      "url": "https://magicui.design/r/registry.json"
    },
    {
      "name": "@aceternity",
      "url": "https://ui.aceternity.com/registry.json"
    },
    {
      "name": "@kokonutui",
      "url": "https://ui.kokonutui.com/r/registry.json"
    }
  ]
}
```

#### 1.2 Install NEONPRO Theme
```bash
cd packages/ui

# Install NEONPRO theme via CLI
pnpm dlx shadcn@latest add --name=neonpro-theme --registry=@tweakcn

# Verify installation
ls src/components/ui/
```

#### 1.3 Configure Theme Variables
Update `packages/ui/src/index.css`:

```css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* NEONPRO Theme Variables */
@layer base {
  :root {
    --neonpro-primary: #ac9469;
    --neonpro-deep-blue: #112031;
    --neonpro-accent: #d4af37;
    --neonpro-neutral: #B4AC9C;
    --neonpro-background: #D2D0C8;
    
    /* Neumorphic Effects */
    --neonpro-shadow-inset: inset 2px 2px 4px rgba(0, 0, 0, 0.1);
    --neonpro-shadow-raised: 4px 4px 8px rgba(0, 0, 0, 0.15);
    --neonpro-border-radius: 8px;
  }

  .dark {
    --neonpro-primary: #b8a770;
    --neonpro-deep-blue: #1a2332;
    --neonpro-accent: #e5c540;
    --neonpro-neutral: #8b8379;
    --neonpro-background: #3a3732;
  }
}

/* NEONPRO Component Styles */
@layer components {
  .neonpro-card {
    @apply border border-neutral-200 bg-background rounded-lg shadow-lg;
    box-shadow: var(--neonpro-shadow-raised);
  }
  
  .neonpro-button {
    @apply inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50;
  }
  
  .neonpro-primary {
    @apply bg-neonpro-primary text-white hover:bg-neonpro-accent;
  }
}
```

### Step 2: Install UI Components

#### 2.1 Magic UI Components
```bash
# Install Magic Card
pnpm dlx shadcn@latest add magic-card --registry=@magicui

# Install Animated Theme Toggler  
pnpm dlx shadcn@latest add animated-theme-toggler --registry=@magicui

# Install Shine Border
pnpm dlx shadcn@latest add shine-border --registry=@magicui
```

#### 2.2 Aceternity UI Components
```bash
# Install Sidebar
pnpm dlx shadcn@latest add sidebar --registry=@aceternity

# Install Hover Border Gradient Button
pnpm dlx shadcn@latest add hover-border-gradient --registry=@aceternity
```

#### 2.3 Kokonut UI Components
```bash
# Install Gradient Button (Particle Button)
pnpm dlx shadcn@latest add gradient-button --registry=@kokonutui
```

#### 2.4 ReactBits Components (Manual Installation)

Create `packages/ui/src/components/ui/tilted-card.tsx`:

```tsx
"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface TiltedCardProps {
  children: React.ReactNode
  className?: string
  tiltAngle?: number
  perspective?: number
  enableGlow?: boolean
  glareColor?: string
}

export const TiltedCard = ({
  children,
  className = "",
  tiltAngle = 15,
  perspective = 1000,
  enableGlow = true,
  glareColor = "rgba(255, 255, 255, 0.4)"
}: TiltedCardProps) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    
    setTilt({
      x: (x - 0.5) * tiltAngle,
      y: (y - 0.5) * tiltAngle
    })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  return (
    <motion.div
      className={`relative w-full h-full cursor-pointer ${className}`}
      style={{
        perspective: `${perspective}px`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: -tilt.y,
        rotateY: tilt.x,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      {enableGlow && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${50 + tilt.x}% ${50 - tilt.y}%, ${glareColor}, transparent)`,
            pointerEvents: 'none',
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
```

#### 2.5 Update Component Exports
Update `packages/ui/src/index.ts`:

```typescript
export * from './components/ui'

// NEONPRO Theme Components
export { NeonproCard } from './components/ui/neonpro-card'
export { AnimatedThemeToggler } from './components/ui/animated-theme-toggler'

// UI Library Components
export { MagicCard } from './components/ui/magic-card'
export { GradientButton } from './components/ui/gradient-button'
export { HoverBorderGradientButton } from './components/ui/hover-border-gradient-button'
export { Sidebar } from './components/ui/sidebar'
export { ShineBorder } from './components/ui/shine-border'
export { TiltedCard } from './components/ui/tilted-card'

// Re-export with NEONPRO styling
export { MagicCard as NeonproMagicCard } from './components/ui/magic-card'
export { GradientButton as NeonproGradientButton } from './components/ui/gradient-button'
```

### Step 3: Configure Theme Provider

#### 3.1 Create Theme Context
Create `packages/ui/src/providers/theme-provider.tsx`:

```tsx
"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'neonpro-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage?.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage?.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
```

#### 3.2 Create Theme Toggle Component
Create `packages/ui/src/components/ui/theme-toggle.tsx`:

```tsx
"use client"

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/providers/theme-provider'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      className="neonpro-button inline-flex items-center justify-center rounded-md p-2 hover:bg-neonpro-neutral/20 transition-colors"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label="Toggle theme"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
```

### Step 4: Integrate with Applications

#### 4.1 Update Web Application
In `apps/web/src/main.tsx`:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@neonpro/ui/providers/theme-provider'
import { App } from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
```

#### 4.2 Add Theme Components to Layout
In `apps/web/src/routes/__root.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { ThemeToggle } from '@neonpro/ui'
import { Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <ThemeToggle />
          </div>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {/* Navigation items */}
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
```

## Verification Steps

### 1. Theme Verification
```bash
# Check theme installation
cd packages/ui && ls src/components/ui/

# Verify CSS variables
grep -r "neonpro-" src/index.css

# Test theme switching
cd apps/web && npm run dev
```

### 2. Component Verification
```bash
# Check component imports
cd packages/ui && npm run type-check

# Verify component rendering
cd apps/web && npm run dev

# Test all 7 components
# 1. MagicCard
# 2. GradientButton
# 3. HoverBorderGradientButton
# 4. AnimatedThemeToggler
# 5. TiltedCard
# 6. Sidebar
# 7. ShineBorder
```

### 3. Accessibility Testing
```bash
# Run accessibility tests
cd apps/web && npm run test:accessibility

# Manual WCAG validation
# 1. Test color contrast (minimum 4.5:1)
# 2. Test keyboard navigation
# 3. Test screen reader compatibility
# 4. Test touch targets (minimum 44px)
```

### 4. Performance Validation
```bash
# Check bundle size impact
cd packages/ui && npm run build

# Verify build time
cd apps/web && npm run build

# Test Core Web Vitals
# 1. Largest Contentful Paint (LCP) ≤ 2.5s
# 2. Interaction to Next Paint (INP) ≤ 200ms
# 3. Cumulative Layout Shift (CLS) ≤ 0.1
```

## Troubleshooting

### Common Issues

#### Theme Not Applying
- Verify CSS variables are defined correctly
- Check Tailwind CSS configuration
- Ensure theme provider wraps the application

#### Component Import Errors
- Verify component exports in `packages/ui/src/index.ts`
- Check TypeScript configuration for path mapping
- Ensure dependencies are installed

#### Performance Issues
- Verify lazy loading for heavy components
- Check bundle size impact
- Optimize animations and transitions

### Support
For issues with NEONPRO theme and UI components:
1. Check this quickstart guide
2. Review error logs in browser console
3. Verify installation steps completed correctly
4. Consult component library documentation

---
*Quick Start Guide Version: 1.0*
*Last Updated: 2025-09-30*
*Compatible with NeonPro v2.0+*