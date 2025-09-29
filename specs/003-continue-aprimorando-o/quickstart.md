# NEONPRO Theme Installation Quickstart

## Prerequisites

- Node.js 18+ and pnpm installed
- Next.js monorepo with existing shadcn UI setup
- Access to tweakcn theme registry

## Installation Steps

### 1. Install NEONPRO Theme

```bash
# Navigate to packages directory
cd packages

# Install theme using shadcn CLI
pnpm dlx shadcn@latest add https://tweakcn.dev/r/neonpro

# Install locally for monorepo usage
pnpm add @neonpro/theme
```

### 2. Configure Package Structure

```bash
# Create theme package directory
mkdir -p packages/neonpro-theme

# Move installed theme files
mv node_modules/@neonpro/theme/* packages/neonpro-theme/

# Update package.json
cd packages/neonpro-theme
pnpm init -y
```

### 3. Setup Font Installation

```bash
# Create fonts directory
mkdir -p public/fonts

# Download fonts (or use local copies)
curl -o public/fonts/inter.ttf https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2
curl -o public/fonts/lora.ttf https://fonts.gstatic.com/s/lora/v26/0QIvMX1D_JOuOw2EtF15tg.woff2
curl -o public/fonts/libre-baskerville.ttf https://fonts.gstatic.com/s/librebaskerville/v14/kmKnZrc3Hgbbcjq75U4uslyuy4kn0qNcWx8QDO.woff2
```

### 4. Configure Tailwind CSS

Update `packages/ui/tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "../../apps/web/src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
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
        // ... additional NEONPRO color definitions
      },
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
        serif: ["Lora", ...fontFamily.serif],
        mono: ["Libre Baskerville", ...fontFamily.mono],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
```

### 5. Create Theme Provider

Create `packages/ui/src/theme-provider.tsx`:

```typescript
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  forcedTheme?: Theme;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  forcedTheme?: Theme;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "neonpro-theme",
  forcedTheme,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage?.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (forcedTheme) {
      root.classList.add(forcedTheme);
      return;
    }

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme, forcedTheme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    forcedTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
```

### 6. Create Global CSS

Create `packages/ui/src/globals.css`:

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Lora:ital,wght@0,400..700;1,400..700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap");

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### 7. Setup Symlinks

```bash
# Create symlinks from packages/ui to all apps
cd apps/web
ln -s ../../packages/ui/src/components ./src/components/ui
ln -s ../../packages/ui/src/theme-provider.tsx ./src/theme-provider.tsx
ln -s ../../packages/ui/src/globals.css ./src/globals.css

# Repeat for other apps as needed
```

### 8. Update Root Layout

Update `apps/web/src/app/layout.tsx`:

```typescript
import "./globals.css";
import { ThemeProvider } from "@/theme-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          defaultTheme="system"
          storageKey="neonpro-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 9. Verification

```bash
# Build the project
pnpm build

# Run development server
pnpm dev

# Check that theme is working
curl -I http://localhost:3000
```

## Usage

### Using Theme Components

```typescript
import { useTheme } from "@/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </Button>
  );
}
```

### Custom Styling

```typescript
// Use CSS variables in your components
<div className="bg-primary text-primary-foreground p-4 rounded-md">
  NEONPRO Themed Component
</div>
```

## Troubleshooting

### Common Issues

1. **Font Loading Issues**
   - Verify font files are in `public/fonts/`
   - Check font paths in CSS imports

2. **Theme Not Applying**
   - Ensure ThemeProvider wraps root component
   - Check localStorage for theme preferences

3. **Build Errors**
   - Verify Tailwind configuration includes all app paths
   - Check symlinks are properly created

### Verification Commands

```bash
# Check theme variables
grep -r "var(--" apps/web/src/

# Verify font loading
curl -s http://localhost:3000 | grep -i "font"

# Test theme switching
node -e "
const { readFileSync } = require('fs');
const html = readFileSync('dist/index.html', 'utf8');
console.log(html.includes('--primary') ? '✓ Theme variables found' : '✗ Theme variables missing');
"
```

## Next Steps

1. Integrate with existing shadcn components
2. Customize colors for aesthetic clinic branding
3. Add theme validation tests
4. Optimize font loading performance
5. Document theme usage for development team