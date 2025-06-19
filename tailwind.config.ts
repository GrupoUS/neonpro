import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
<<<<<<< Updated upstream
        // GRUPO US Official Primary Colors - PANTONE Standards
        primary: {
          DEFAULT: "#112031", // PANTONE 5395 C - Primary Dark Blue
          dark: "#112031", // PANTONE 5395 C
          medium: "#294359", // PANTONE 2168 C
          50: "#11203110",
          100: "#11203120",
          200: "#11203130",
          300: "#11203150",
          400: "#11203170",
          500: "#112031",
          600: "#294359",
          700: "#1a2a3d",
          800: "#0d1a28",
          900: "#081218",
        },
        accent: {
          DEFAULT: "#AC9469", // PANTONE 4007 C - Gold/Bronze Accent
          gold: "#AC9469",
          50: "#AC946910",
          100: "#AC946920",
          200: "#AC946930",
          300: "#AC946950",
          400: "#AC946970",
          500: "#AC9469",
          600: "#B4AC9C",
          700: "#8a7854",
          800: "#6b5d42",
          900: "#4c4130",
        },
        neutral: {
          warm: "#B4AC9C", // PANTONE 7535 C
          light: "#D2D0C8", // PANTONE 400 C
=======
        // Primary colors
        primary: {
          DEFAULT: "#052CC9",
          50: "#052CC90D",
          100: "#052CC91A",
          200: "#052CC933",
          300: "#052CC94D",
          400: "#052CC966",
          500: "#052CC9",
          600: "#052CC9CC",
          700: "#052CC9B3",
          800: "#052CC999",
          900: "#052CC980",
>>>>>>> Stashed changes
        },
        secondary: {
          DEFAULT: "#4FD1C7",
          50: "#4FD1C70D",
          100: "#4FD1C71A",
          200: "#4FD1C733",
          300: "#4FD1C74D",
          400: "#4FD1C766",
          500: "#4FD1C7",
          600: "#4FD1C7CC",
          700: "#4FD1C7B3",
          800: "#4FD1C799",
          900: "#4FD1C780",
        },
        // Background colors
        background: "#FFFFFF",
        surface: "#F8F9FA",
        "surface-variant": "#F1F3F4",
<<<<<<< Updated upstream
        // Text colors - Updated to GRUPO US Palette
        text: {
          DEFAULT: "#112031", // Primary text using GRUPO US dark blue
          secondary: "#294359", // Secondary text using medium blue
          muted: "#B4AC9C", // Muted text using warm neutral
        },
        // Border colors - Updated to GRUPO US Palette
        border: {
          DEFAULT: "#D2D0C8", // Border using light neutral
          light: "#F3F4F6", // Light border (legacy)
=======
        // Text colors
        text: {
          DEFAULT: "#0B1437",
          secondary: "#6B7280",
          muted: "#9CA3AF",
        },
        // Border colors
        border: {
          DEFAULT: "#E5E7EB",
          light: "#F3F4F6",
>>>>>>> Stashed changes
        },
        // Status colors
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
<<<<<<< Updated upstream
        info: "#294359", // Maps to primary-medium
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
        display: [
          "Optima",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
=======
        info: "#3B82F6",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
        display: ["Inter", "system-ui", "sans-serif"],
>>>>>>> Stashed changes
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.25" }],
        sm: ["0.875rem", { lineHeight: "1.375" }],
        base: ["1rem", { lineHeight: "1.5" }],
        lg: ["1.125rem", { lineHeight: "1.5" }],
        xl: ["1.25rem", { lineHeight: "1.5" }],
        "2xl": ["1.5rem", { lineHeight: "1.25" }],
        "3xl": ["1.875rem", { lineHeight: "1.25" }],
        "4xl": ["2.25rem", { lineHeight: "1.25" }],
        "5xl": ["3rem", { lineHeight: "1.25" }],
        "6xl": ["3.75rem", { lineHeight: "1.25" }],
      },
      spacing: {
        "0": "0",
<<<<<<< Updated upstream
        px: "1px",
=======
        "px": "1px",
>>>>>>> Stashed changes
        "0.5": "{{spacing.0.5}}",
        "1": "0.25rem",
        "1.5": "{{spacing.1.5}}",
        "2": "0.5rem",
        "2.5": "{{spacing.2.5}}",
        "3": "0.75rem",
        "3.5": "{{spacing.3.5}}",
        "4": "1rem",
        "5": "1.25rem",
        "6": "1.5rem",
        "7": "1.75rem",
        "8": "2rem",
        "9": "2.25rem",
        "10": "2.5rem",
        "11": "2.75rem",
        "12": "3rem",
        "14": "3.5rem",
        "16": "4rem",
        "20": "5rem",
        "24": "6rem",
        "28": "7rem",
        "32": "8rem",
        "36": "9rem",
        "40": "10rem",
        "44": "11rem",
        "48": "12rem",
        "52": "13rem",
        "56": "14rem",
        "60": "15rem",
        "64": "16rem",
        "72": "18rem",
        "80": "20rem",
        "96": "24rem",
      },
      borderRadius: {
        none: "0",
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
      boxShadow: {
<<<<<<< Updated upstream
        xs: "0 1px 2px rgba(17, 32, 49, 0.05)",
        sm: "0 1px 3px rgba(17, 32, 49, 0.1), 0 1px 2px rgba(17, 32, 49, 0.06)",
        DEFAULT:
          "0 4px 6px rgba(17, 32, 49, 0.1), 0 2px 4px rgba(17, 32, 49, 0.06)",
        md: "0 4px 6px rgba(17, 32, 49, 0.1), 0 2px 4px rgba(17, 32, 49, 0.06)",
        lg: "0 10px 15px rgba(17, 32, 49, 0.1), 0 4px 6px rgba(17, 32, 49, 0.05)",
        xl: "0 20px 25px rgba(17, 32, 49, 0.1), 0 10px 10px rgba(17, 32, 49, 0.04)",
        card: "0 4px 6px rgba(17, 32, 49, 0.07), 0 1px 3px rgba(17, 32, 49, 0.06)",
        dropdown:
          "0 10px 15px rgba(17, 32, 49, 0.1), 0 4px 6px rgba(17, 32, 49, 0.05)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #112031 0%, #294359 100%)",
        "gradient-accent": "linear-gradient(135deg, #AC9469 0%, #B4AC9C 100%)",
=======
        xs: "0 1px 2px rgba(5, 44, 201, 0.05)",
        sm: "0 1px 3px rgba(5, 44, 201, 0.1), 0 1px 2px rgba(5, 44, 201, 0.06)",
        DEFAULT: "0 4px 6px rgba(5, 44, 201, 0.1), 0 2px 4px rgba(5, 44, 201, 0.06)",
        md: "0 4px 6px rgba(5, 44, 201, 0.1), 0 2px 4px rgba(5, 44, 201, 0.06)",
        lg: "0 10px 15px rgba(5, 44, 201, 0.1), 0 4px 6px rgba(5, 44, 201, 0.05)",
        xl: "0 20px 25px rgba(5, 44, 201, 0.1), 0 10px 10px rgba(5, 44, 201, 0.04)",
        card: "0 4px 6px rgba(5, 44, 201, 0.07), 0 1px 3px rgba(5, 44, 201, 0.06)",
        dropdown: "0 10px 15px rgba(5, 44, 201, 0.1), 0 4px 6px rgba(5, 44, 201, 0.05)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #052CC9 0%, #4FD1C7 100%)",
>>>>>>> Stashed changes
        "gradient-surface": "linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)",
        "gradient-card": "linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      animation: {
        "fade-in": "fadeIn 300ms cubic-bezier(0, 0, 0.2, 1)",
        "fade-out": "fadeOut 300ms cubic-bezier(0.4, 0, 1, 1)",
        "slide-in": "slideIn 300ms cubic-bezier(0, 0, 0.2, 1)",
        "slide-out": "slideOut 300ms cubic-bezier(0.4, 0, 1, 1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        slideIn: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideOut: {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(-10px)", opacity: "0" },
        },
      },
      zIndex: {
        "0": "0",
        "10": "10",
        "20": "20",
        "30": "30",
        "40": "40",
        "50": "50",
        auto: "auto",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
};

export default config;

// Generated by VIBECODE Theming System Universal
// Theme: Horizon UI Pro v1.0.0
// Generated: 2025-06-13T13:27:59.110553
// Source: @project-core/memory/horizon_ui_design_system.md
// Compliance: VIBECODE V4.0 + EHS V1
