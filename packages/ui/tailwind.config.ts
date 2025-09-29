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
        // NEONPRO Brand Colors in oklch format for better accessibility
        neonpro: {
          primary: 'oklch(0.437 0.368 66.8)', // #AC9469 - Golden Primary
          'deep-blue': 'oklch(0.243 0.489 12.2)', // #112031 - Professional Trust
          accent: 'oklch(0.564 0.286 90.8)', // #E8D5B7 - Premium Services  
          neutral: 'oklch(0.961 0 0)', // #F5F5F5 - Calming Neutral
          background: 'oklch(1 0 0)', // #FFFFFF - Clean Background
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        neonpro: '8px', // Standard border radius
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
