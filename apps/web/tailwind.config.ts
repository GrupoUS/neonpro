import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/domain/src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Optima", "Georgia", "serif"],
        mono: ["JetBrains Mono", "Menlo", "Monaco", "Consolas", "monospace"],
      },
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
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
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
        // Healthcare status colors - NEONPROV1 Enhanced
        "status-critical": "hsl(var(--status-critical))",
        "status-urgent": "hsl(var(--status-urgent))",
        "status-normal": "hsl(var(--status-normal))",
        "status-inactive": "hsl(var(--status-inactive))",
        // LGPD compliance colors - NEONPROV1 Professional
        "lgpd-compliant": "hsl(var(--lgpd-compliant))",
        "lgpd-warning": "hsl(var(--lgpd-warning))",
        "lgpd-violation": "hsl(var(--lgpd-violation))",
        // Chart colors - NEONPROV1 Analytics Palette
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
          "6": "hsl(var(--chart-6))",
        },
        // Professional Healthcare Color System
        "healthcare-primary": "hsl(var(--primary))",
        "healthcare-primary-dark": "hsl(var(--primary-dark))",
        "healthcare-primary-light": "hsl(var(--primary-light))",
        "healthcare-secondary": "hsl(var(--secondary))",
        "healthcare-accent": "hsl(var(--accent))",
        "healthcare-success": "hsl(var(--success))",
        "healthcare-warning": "hsl(var(--warning))",
        "healthcare-danger": "hsl(var(--danger))",
        "healthcare-bg-primary": "hsl(var(--bg-primary))",
        "healthcare-bg-secondary": "hsl(var(--bg-secondary))",
        "healthcare-bg-tertiary": "hsl(var(--bg-tertiary))",
        "healthcare-text-primary": "hsl(var(--text-primary))",
        "healthcare-text-secondary": "hsl(var(--text-secondary))",
        "healthcare-text-muted": "hsl(var(--text-muted))",
        "healthcare-border": "hsl(var(--border))",
        "healthcare-border-light": "hsl(var(--border-light))",
        "sidebar-bg": "hsl(var(--sidebar-bg))",
        "sidebar-text": "hsl(var(--sidebar-text))",
        "sidebar-hover": "hsl(var(--sidebar-hover))",
        "sidebar-active": "hsl(var(--sidebar-active))",
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        DEFAULT: "var(--radius)",
      },
      backgroundImage: {
        "gradient-primary": "var(--gradient-primary)",
        "gradient-secondary": "var(--gradient-secondary)",
        "gradient-accent": "var(--gradient-accent)",
        "gradient-card": "var(--gradient-card)",
        "neonpro-gradient":
          "linear-gradient(135deg, theme(colors.background), theme(colors.primary.DEFAULT))",
        "healthcare-gradient":
          "linear-gradient(135deg, theme(colors.primary.DEFAULT), theme(colors.accent.DEFAULT))",
      },
      boxShadow: {
        "healthcare-sm": "var(--shadow-sm)",
        "healthcare-md": "var(--shadow-md)",
        "healthcare-lg": "var(--shadow-lg)",
        "healthcare-xl": "var(--shadow-xl)",
        "neonpro-glow": "0 0 20px rgba(172, 148, 105, 0.3), 0 0 40px rgba(172, 148, 105, 0.1)",
        "neonpro-card":
          "0 10px 25px -3px rgba(41, 67, 89, 0.1), 0 4px 6px -2px rgba(41, 67, 89, 0.05)",
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
        "pulse-healthcare": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "fade-in-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-healthcare": "pulse-healthcare 2s ease-in-out infinite",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
