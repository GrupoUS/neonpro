"use client";

/**
 * Layout Components Index
 * FASE 4: Frontend Components - Layout System
 * Compliance: LGPD/ANVISA/CFM + WCAG 2.1 AA
 */

export {
  AuthLayout,
  DashboardPageLayout,
  ErrorLayout,
  MainLayout,
  PrintLayout,
} from "./MainLayout";

// Layout types
export interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export interface PageLayoutProps extends LayoutProps {
  title: string;
  description?: string;
  compliance?: string[];
}

// Layout configurations for different page types
export const LAYOUT_CONFIGS = {
  dashboard: {
    showMobileNav: true,
    showAccessibilityPanel: true,
    maxWidth: "full",
    padding: "md",
  },

  form: {
    showMobileNav: true,
    showAccessibilityPanel: true,
    maxWidth: "2xl",
    padding: "lg",
  },

  auth: {
    showMobileNav: false,
    showAccessibilityPanel: true,
    maxWidth: "md",
    padding: "xl",
  },

  error: {
    showMobileNav: false,
    showAccessibilityPanel: true,
    maxWidth: "md",
    padding: "xl",
  },

  print: {
    showMobileNav: false,
    showAccessibilityPanel: false,
    maxWidth: "full",
    padding: "none",
  },
} as const;

export type LayoutType = keyof typeof LAYOUT_CONFIGS;
