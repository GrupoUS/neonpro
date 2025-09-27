import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
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
        // NeonPro Brand Colors from @apex-ui-ux-designer.md
        'neonpro-primary': '#AC9469', // Golden Primary - Aesthetic Luxury
        'neonpro-deep-blue': '#112031', // Healthcare Professional - Trust & Reliability
        'neonpro-accent': '#d2aa60ff', // Gold Accent - Premium Services
        'neonpro-neutral': '#B4AC9C', // Calming Light Beige
        'neonpro-background': '#D2D0C8', // Soft Gray Background
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        'neonpro': '8px', // Standard border radius
      },
      boxShadow: {
        // Neumorphic Design System from @apex-ui-ux-designer.md
        'neumorphic-inset': 'inset 2px 2px 4px rgba(0,0,0,0.1)',
        'neumorphic-raised': '4px 4px 8px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
}

export default config
