import type { Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme"
import shadcnConfig from "shadcn/ui/tailwind.config"

const config = {
  ...shadcnConfig,
  content: [
    ...shadcnConfig.content,
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}", // Added this from your previous config
  ],
  theme: {
    ...shadcnConfig.theme,
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      ...shadcnConfig.theme.extend,
      colors: {
        ...shadcnConfig.theme.extend.colors,
        chart: {
          "1": "oklch(var(--chart-1))",
          "2": "oklch(var(--chart-2))",
          "3": "oklch(var(--chart-3))",
          "4": "oklch(var(--chart-4))",
          "5": "oklch(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "oklch(var(--sidebar))",
          foreground: "oklch(var(--sidebar-foreground))",
          primary: {
            DEFAULT: "oklch(var(--sidebar-primary))",
            foreground: "oklch(var(--sidebar-primary-foreground))",
          },
          accent: {
            DEFAULT: "oklch(var(--sidebar-accent))",
            foreground: "oklch(var(--sidebar-accent-foreground))",
          },
          border: "oklch(var(--sidebar-border))",
          ring: "oklch(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
        serif: ["var(--font-serif)", ...defaultTheme.fontFamily.serif],
        mono: ["var(--font-mono)", ...defaultTheme.fontFamily.mono],
      },
      boxShadow: {
        "2xs": "var(--shadow-2xs)",
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
      },
      keyframes: {
        ...shadcnConfig.theme.extend.keyframes,
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
        ...shadcnConfig.theme.extend.animation,
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [...shadcnConfig.plugins, require("tailwindcss-animate")],
} satisfies Config

export default config
