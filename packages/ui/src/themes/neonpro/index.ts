/**
 * TweakCN NEONPRO Theme System
 * Healthcare-focused theme based on https://tweakcn.com/themes/cmesqts4l000r04l7bgdqfpxb
 * Optimized for Brazilian aesthetic clinics
 */

import { AppointmentCalendar } from "./components/appointment-calendar";
import { HealthcareMetricCard } from "./components/healthcare-metric-card";
import { PaymentStatusTable } from "./components/payment-status-table";
import { TeamMembersList } from "./components/team-members-list";

// NEONPRO Core Theme Configuration
export const neonproTheme = {
  name: "NEONPRO Healthcare",
  version: "1.0.0",

  // Core color system based on NEONPRO theme analysis
  colors: {
    // Primary healthcare colors
    primary: "hsl(221, 83%, 53%)", // Professional blue
    success: "hsl(142, 76%, 36%)", // Growth green (+20.1%)
    revenue: "#15231", // Revenue highlight color
    growth: "#16a34a", // Growth indicator green
    warning: "hsl(32, 95%, 44%)", // Processing orange
    danger: "hsl(0, 84%, 60%)", // Critical red

    // Brazilian-specific colors
    brasil: {
      green: "#009639", // Brazil flag green
      yellow: "#ffdf00", // Brazil flag yellow
      lgpdCompliant: "#059669", // LGPD compliance green
      cfmValidated: "#2563eb", // CFM validation blue
    },

    // Healthcare workflow colors
    healthcare: {
      emergency: "#dc2626", // Emergency red
      appointment: "#16a34a", // Appointment green
      patient: "#2563eb", // Patient info blue
      treatment: "#7c3aed", // Treatment purple
      billing: "#f59e0b", // Billing orange
    },

    // Status indicators
    status: {
      active: "#10b981", // Active/confirmed
      pending: "#f59e0b", // Pending/processing
      failed: "#ef4444", // Failed/cancelled
      completed: "#059669", // Completed/successful
    },
  },

  // Typography system
  typography: {
    // Healthcare-optimized font families
    sans: ["Inter", "Segoe UI", "sans-serif"],
    mono: ["JetBrains Mono", "Consolas", "monospace"],

    // Medical documentation font sizes
    sizes: {
      xs: "0.75rem", // Medical notes
      sm: "0.875rem", // Patient details
      base: "1rem", // Standard text
      lg: "1.125rem", // Section headers
      xl: "1.25rem", // Card titles
      "2xl": "1.5rem", // Dashboard titles
      "3xl": "1.875rem", // Emergency alerts
      "4xl": "2.25rem", // Critical notifications
    },

    // Medical documentation line heights
    lineHeights: {
      tight: "1.25", // Dense medical data
      normal: "1.5", // Standard readability
      relaxed: "1.625", // Patient instructions
      loose: "2", // Emergency protocols
    },
  },

  // Spacing system optimized for healthcare workflows
  spacing: {
    // Touch-friendly spacing for medical devices/tablets
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",

    // Medical workflow specific spacing
    medical: {
      compact: "0.75rem", // Dense patient lists
      comfortable: "1.25rem", // Standard forms
      spacious: "2rem", // Emergency interfaces
      critical: "3rem", // Life-critical alerts
    },
  },

  // Shadow system for depth hierarchy
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",

    // Healthcare-specific shadows
    healthcare: {
      card: "0 2px 8px rgb(0 0 0 / 0.06), 0 1px 3px rgb(0 0 0 / 0.08)",
      emergency: "0 8px 25px rgb(220 38 38 / 0.15), 0 4px 12px rgb(220 38 38 / 0.1)",
      success: "0 4px 14px rgb(16 185 129 / 0.12), 0 2px 6px rgb(16 185 129 / 0.08)",
    },
  },

  // Border radius system
  borderRadius: {
    none: "0px",
    sm: "0.125rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    full: "9999px",

    // Healthcare UI specific radius
    healthcare: {
      card: "0.5rem", // Standard cards
      button: "0.375rem", // Action buttons
      input: "0.25rem", // Form inputs
      emergency: "0.75rem", // Emergency components
    },
  },

  // Animation system
  animations: {
    // Healthcare workflow transitions
    fast: "150ms ease-out", // Button interactions
    normal: "250ms ease-out", // Standard transitions
    slow: "350ms ease-out", // Panel animations
    emergency: "100ms linear", // Critical alerts

    // Medical data loading states
    pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    bounce: "bounce 1s infinite",
    spin: "spin 1s linear infinite",
  },

  // Breakpoints for responsive healthcare interfaces
  breakpoints: {
    // Mobile-first approach for healthcare professionals
    sm: "640px", // Mobile devices
    md: "768px", // Tablets (common in clinics)
    lg: "1024px", // Desktop workstations
    xl: "1280px", // Large displays
    "2xl": "1536px", // Ultra-wide medical monitors

    // Healthcare-specific breakpoints
    mobile: "480px", // Smartphone in portrait
    tablet: "768px", // Tablet in portrait
    desktop: "1200px", // Standard medical workstation
    ultrawide: "1920px", // Multi-monitor setups
  },
} as const;

// NEONPRO Component System
export const neonproComponents = {
  HealthcareMetricCard,
  AppointmentCalendar,
  PaymentStatusTable,
  TeamMembersList,
} as const;

// Theme configuration utilities
export const getNeonproTheme = () => neonproTheme;
export const getNeonproComponents = () => neonproComponents;

// CSS custom properties generator
export const generateNeonproCSSProperties = () => {
  const theme = getNeonproTheme();

  return {
    // Color properties
    "--neonpro-primary": theme.colors.primary,
    "--neonpro-success": theme.colors.success,
    "--neonpro-revenue": theme.colors.revenue,
    "--neonpro-growth": theme.colors.growth,
    "--neonpro-warning": theme.colors.warning,
    "--neonpro-danger": theme.colors.danger,

    // Brazilian colors
    "--brasil-green": theme.colors.brasil.green,
    "--brasil-yellow": theme.colors.brasil.yellow,
    "--lgpd-compliant": theme.colors.brasil.lgpdCompliant,
    "--cfm-validated": theme.colors.brasil.cfmValidated,

    // Healthcare colors
    "--healthcare-emergency": theme.colors.healthcare.emergency,
    "--healthcare-appointment": theme.colors.healthcare.appointment,
    "--healthcare-patient": theme.colors.healthcare.patient,
    "--healthcare-treatment": theme.colors.healthcare.treatment,
    "--healthcare-billing": theme.colors.healthcare.billing,

    // Typography properties
    "--neonpro-font-sans": theme.typography.sans.join(", "),
    "--neonpro-font-mono": theme.typography.mono.join(", "),

    // Spacing properties
    "--neonpro-spacing-xs": theme.spacing.xs,
    "--neonpro-spacing-sm": theme.spacing.sm,
    "--neonpro-spacing-md": theme.spacing.md,
    "--neonpro-spacing-lg": theme.spacing.lg,
    "--neonpro-spacing-xl": theme.spacing.xl,

    // Medical workflow spacing
    "--medical-spacing-compact": theme.spacing.medical.compact,
    "--medical-spacing-comfortable": theme.spacing.medical.comfortable,
    "--medical-spacing-spacious": theme.spacing.medical.spacious,
    "--medical-spacing-critical": theme.spacing.medical.critical,
  };
};

// Hot reload support for development
if (typeof module !== "undefined" && module.hot) {
  module.hot.accept();
}

export default neonproTheme;
