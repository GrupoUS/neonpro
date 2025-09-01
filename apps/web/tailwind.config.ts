import tailwindcssAnimate from "tailwindcss-animate";
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
        sans: ["Inter", "Segoe UI", "system-ui", "sans-serif"],
        serif: ["Lora", "Georgia", "serif"],
        mono: ["JetBrains Mono", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      colors: {
        // Core shadcn/ui colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          dark: "hsl(var(--primary-dark))",
          light: "hsl(var(--primary-light))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Enhanced status colors
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },

        // Healthcare status colors - Critical for patient safety
        "status-critical": "hsl(var(--status-critical))",
        "status-urgent": "hsl(var(--status-urgent))",
        "status-normal": "hsl(var(--status-normal))",
        "status-inactive": "hsl(var(--status-inactive))",

        // LGPD compliance colors - Brazilian legal requirements
        "lgpd-compliant": "hsl(var(--lgpd-compliant))",
        "lgpd-warning": "hsl(var(--lgpd-warning))",
        "lgpd-violation": "hsl(var(--lgpd-violation))",

        // Chart colors - Enhanced healthcare analytics
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
          "6": "hsl(var(--chart-6))",
        },

        // Sidebar colors - Professional healthcare navigation
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },

      borderRadius: {
        "2xs": "0.25rem",
        xs: "0.375rem",
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "2rem",
        "3xl": "3rem",
      },

      spacing: {
        // Healthcare touch targets - WCAG 2.1 AA minimum
        "touch": "44px",
        "touch-lg": "56px", // Emergency mode
        "touch-xl": "64px", // Extra large for accessibility
      },

      fontSize: {
        // Responsive typography optimized for Portuguese medical content
        "xs": ["0.75rem", { lineHeight: "1.4" }],
        "sm": ["0.875rem", { lineHeight: "1.5" }],
        "base": ["1rem", { lineHeight: "1.6" }],
        "lg": ["1.125rem", { lineHeight: "1.6" }],
        "xl": ["1.25rem", { lineHeight: "1.5" }],
        "2xl": ["1.5rem", { lineHeight: "1.4" }],
        "3xl": ["1.875rem", { lineHeight: "1.3" }],
        "4xl": ["2.25rem", { lineHeight: "1.2" }],
        "5xl": ["3rem", { lineHeight: "1.1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
        "7xl": ["4.5rem", { lineHeight: "1" }],
        "8xl": ["6rem", { lineHeight: "1" }],
        "9xl": ["8rem", { lineHeight: "1" }],
      },

      backgroundImage: {
        "gradient-primary":
          "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-light)))",
        "gradient-secondary": "linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--accent)))",
        "gradient-accent": "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))",
        "gradient-card": "linear-gradient(135deg, hsl(var(--card)), hsl(var(--muted)))",

        // TweakCN NEONPRO Healthcare Gradients
        "neonpro-gradient": "linear-gradient(135deg, hsl(var(--background)), hsl(var(--primary)))",
        "healthcare-gradient": "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
        "emergency-gradient":
          "linear-gradient(135deg, hsl(var(--status-critical)), hsl(var(--warning)))",
        "success-gradient":
          "linear-gradient(135deg, hsl(var(--success)), hsl(var(--lgpd-compliant)))",
      },

      boxShadow: {
        // Healthcare shadows using CSS variables
        "healthcare-2xs": "var(--shadow-2xs)",
        "healthcare-xs": "var(--shadow-xs)",
        "healthcare-sm": "var(--shadow-sm)",
        "healthcare": "var(--shadow)",
        "healthcare-md": "var(--shadow-md)",
        "healthcare-lg": "var(--shadow-lg)",
        "healthcare-xl": "var(--shadow-xl)",
        "healthcare-2xl": "var(--shadow-2xl)",

        // TweakCN NEONPRO specific shadows
        "neonpro-glow": "0 0 20px hsl(var(--primary) / 0.3), 0 0 40px hsl(var(--primary) / 0.1)",
        "neonpro-card":
          "0 10px 25px -3px hsl(var(--foreground) / 0.1), 0 4px 6px -2px hsl(var(--foreground) / 0.05)",
        "emergency-glow":
          "0 0 20px hsl(var(--status-critical) / 0.5), 0 0 40px hsl(var(--status-critical) / 0.2)",

        // Focus shadows for accessibility
        "focus": "0 0 0 var(--focus-ring-width) hsl(var(--ring) / 0.5)",
        "focus-visible": "0 0 0 var(--focus-ring-width) hsl(var(--ring))",
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

        // Healthcare-specific animations
        "pulse-healthcare": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.02)" },
        },
        "pulse-emergency": {
          "0%, 100%": { opacity: "1", backgroundColor: "hsl(var(--status-critical))" },
          "50%": { opacity: "0.8", backgroundColor: "hsl(var(--status-urgent))" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-down": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in-down": {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "glow": {
          "0%, 100%": { boxShadow: "0 0 5px hsl(var(--primary) / 0.5)" },
          "50%": {
            boxShadow: "0 0 20px hsl(var(--primary) / 0.8), 0 0 40px hsl(var(--primary) / 0.3)",
          },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",

        // Healthcare-specific animations with motion considerations
        "pulse-healthcare": "pulse-healthcare 2s ease-in-out infinite",
        "pulse-emergency": "pulse-emergency 1s ease-in-out infinite",
        "slide-in-right": "slide-in-right var(--animation-duration-normal) var(--animation-easing)",
        "slide-in-left": "slide-in-left var(--animation-duration-normal) var(--animation-easing)",
        "slide-in-up": "slide-in-up var(--animation-duration-normal) var(--animation-easing)",
        "slide-in-down": "slide-in-down var(--animation-duration-normal) var(--animation-easing)",
        "fade-in-up": "fade-in-up var(--animation-duration-normal) var(--animation-easing)",
        "fade-in-down": "fade-in-down var(--animation-duration-normal) var(--animation-easing)",
        "scale-in": "scale-in var(--animation-duration-fast) var(--animation-easing)",
        "glow": "glow 2s ease-in-out infinite",
      },

      // Healthcare-specific utilities
      transitionDuration: {
        "fast": "var(--animation-duration-fast)",
        "normal": "var(--animation-duration-normal)",
        "slow": "var(--animation-duration-slow)",
      },

      transitionTimingFunction: {
        "healthcare": "var(--animation-easing)",
      },

      // Accessibility enhancements
      outlineWidth: {
        "focus": "var(--focus-ring-width)",
      },

      outlineOffset: {
        "focus": "var(--focus-ring-offset)",
      },

      // Container queries for responsive healthcare design
      screens: {
        "xs": "475px",
        "3xl": "1680px",
        "4xl": "2000px",
      },

      // Healthcare grid system
      gridTemplateColumns: {
        "healthcare": "1fr auto 1fr",
        "medical-form": "160px 1fr",
        "patient-card": "auto 1fr auto",
        "dashboard": "280px 1fr 320px",
      },

      // Healthcare-specific z-index layers
      zIndex: {
        "modal": "50",
        "popover": "30",
        "dropdown": "20",
        "sticky": "10",
        "emergency": "100", // Highest priority for emergency interfaces
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
  ],
};

export default config;
