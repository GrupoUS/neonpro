/**
 * Healthcare Theme Provider
 *
 * Provides healthcare-specific theming, accessibility context, and design system
 * foundations for medical applications with LGPD compliance and patient safety considerations.
 *
 * @fileoverview Healthcare theme provider and context
 */

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from "react";
import {
  HealthcareA11yContext,
  HealthcarePriority,
  announceToScreenReader
} from "../../utils/accessibility";
import { DataSensitivity } from "../../utils/healthcare-validation";

// Healthcare theme configuration
export interface HealthcareThemeConfig {
  // Visual theme settings
  colorMode: "light" | "dark" | "high-contrast";
  fontSize: "small" | "medium" | "large" | "extra-large";
  animations: "full" | "reduced" | "none";

  // Healthcare-specific settings
  emergencyMode: boolean;
  patientDataMode: boolean;
  compactMode: boolean;

  // Accessibility settings
  screenReaderOptimized: boolean;
  keyboardNavigationOnly: boolean;
  highContrast: boolean;
  reduceMotion: boolean;

  // LGPD and compliance settings
  dataSensitivityLevel: DataSensitivity;
  auditMode: boolean;
  consentRequired: boolean;
}

// Default healthcare theme configuration
export const defaultHealthcareTheme: HealthcareThemeConfig = {
  colorMode: "light",
  fontSize: "medium",
  animations: "reduced", // Conservative default for healthcare
  emergencyMode: false,
  patientDataMode: false,
  compactMode: false,
  screenReaderOptimized: false,
  keyboardNavigationOnly: false,
  highContrast: false,
  reduceMotion: true, // Default to reduced motion for healthcare
  dataSensitivityLevel: DataSensitivity.CONFIDENTIAL,
  auditMode: true, // Default to audit mode for healthcare
  consentRequired: true
};

// Healthcare theme context
export interface HealthcareThemeContextValue {
  theme: HealthcareThemeConfig;
  updateTheme: (updates: Partial<HealthcareThemeConfig>) => void;
  toggleEmergencyMode: () => void;
  togglePatientDataMode: () => void;
  setDataSensitivity: (level: DataSensitivity) => void;
  accessibility: HealthcareA11yContext;
}

const HealthcareThemeContext =
  createContext<HealthcareThemeContextValue | null>(null);

// Healthcare theme provider props
export interface HealthcareThemeProviderProps {
  children: ReactNode;
  initialTheme?: Partial<HealthcareThemeConfig>;
  onThemeChange?: (theme: HealthcareThemeConfig) => void;
  persistTheme?: boolean;
}

/**
 * Healthcare Theme Provider Component
 *
 * Provides theme context for healthcare applications with accessibility,
 * emergency mode, and patient data sensitivity handling.
 */
export function HealthcareThemeProvider({
  children,
  initialTheme = {},
  onThemeChange,
  persistTheme = true
}: HealthcareThemeProviderProps) {
  // Initialize theme from localStorage or defaults
  const [theme, setTheme] = useState<HealthcareThemeConfig>(() => {
    if (typeof window === "undefined") {
      return { ...defaultHealthcareTheme, ...initialTheme };
    }

    try {
      const stored = localStorage.getItem("healthcare-theme");
      const storedTheme = stored ? JSON.parse(stored) : {};
      return { ...defaultHealthcareTheme, ...storedTheme, ...initialTheme };
    } catch {
      return { ...defaultHealthcareTheme, ...initialTheme };
    }
  });

  // Accessibility context derived from theme
  const accessibility: HealthcareA11yContext = {
    isEmergencyMode: theme.emergencyMode,
    patientDataVisible: theme.patientDataMode,
    highContrastMode: theme.highContrast,
    reduceMotion: theme.reduceMotion,
    screenReaderMode: theme.screenReaderOptimized
  };

  // Update theme function
  const updateTheme = (updates: Partial<HealthcareThemeConfig>) => {
    const newTheme = { ...theme, ...updates };
    setTheme(newTheme);

    // Persist to localStorage if enabled
    if (persistTheme && typeof window !== "undefined") {
      try {
        localStorage.setItem("healthcare-theme", JSON.stringify(newTheme));
      } catch (error) {
        console.warn("Failed to persist healthcare theme:", error);
      }
    }

    // Notify parent component
    onThemeChange?.(newTheme);

    // Announce significant changes to screen readers
    if (updates.emergencyMode !== undefined) {
      announceToScreenReader(
        updates.emergencyMode
          ? "Modo de emergência ativado. Interface otimizada para situações críticas."
          : "Modo de emergência desativado.",
        HealthcarePriority.HIGH,
      );
    }

    if (updates.highContrast !== undefined) {
      announceToScreenReader(
        updates.highContrast
          ? "Modo de alto contraste ativado para melhor visibilidade."
          : "Modo de alto contraste desativado.",
        HealthcarePriority.MEDIUM,
      );
    }
  };

  // Emergency mode toggle
  const toggleEmergencyMode = () => {
    updateTheme({
      emergencyMode: !theme.emergencyMode,
      // Auto-enable helpful settings in emergency mode
      ...(theme.emergencyMode
        ? {}
        : {
            highContrast: true,
            reduceMotion: false, // Allow animations for emergency alerts
            screenReaderOptimized: true
          })
    });
  };

  // Patient data mode toggle
  const togglePatientDataMode = () => {
    updateTheme({
      patientDataMode: !theme.patientDataMode,
      // Ensure audit mode is enabled when viewing patient data
      auditMode: !theme.patientDataMode ? true : theme.auditMode
    });
  };

  // Data sensitivity setter
  const setDataSensitivity = (level: DataSensitivity) => {
    updateTheme({
      dataSensitivityLevel: level,
      // Auto-enable audit mode for sensitive data
      auditMode:
        level === DataSensitivity.RESTRICTED ||
        level === DataSensitivity.CONFIDENTIAL
    });
  };

  // Apply theme to document element
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    // Apply color mode
    root.classList.remove("light", "dark", "high-contrast");
    root.classList.add(theme.colorMode);

    // Apply accessibility classes
    root.classList.toggle("emergency-mode", theme.emergencyMode);
    root.classList.toggle("patient-data-mode", theme.patientDataMode);
    root.classList.toggle("high-contrast", theme.highContrast);
    root.classList.toggle("reduce-motion", theme.reduceMotion);
    root.classList.toggle(
      "screen-reader-optimized",
      theme.screenReaderOptimized,
    );
    root.classList.toggle("keyboard-navigation", theme.keyboardNavigationOnly);
    root.classList.toggle("compact-mode", theme.compactMode);

    // Apply font size
    root.style.setProperty(
      "--healthcare-font-scale",
      theme.fontSize === "small"
        ? "0.875"
        : theme.fontSize === "large"
          ? "1.125"
          : theme.fontSize === "extra-large"
            ? "1.25"
            : "1",
    );

    // Apply data sensitivity styling
    root.setAttribute("data-sensitivity", theme.dataSensitivityLevel);

    // Set up emergency mode styles
    if (theme.emergencyMode) {
      root.style.setProperty("--healthcare-emergency-bg", "hsl(0 84% 60%)");
      root.style.setProperty("--healthcare-emergency-fg", "hsl(0 0% 100%)");
    }
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (!theme.reduceMotion !== !e.matches) {
        updateTheme({ reduceMotion: e.matches });
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme.reduceMotion]);

  // Context value
  const contextValue: HealthcareThemeContextValue = {
    theme,
    updateTheme,
    toggleEmergencyMode,
    togglePatientDataMode,
    setDataSensitivity,
    accessibility
  };

  return (
    <HealthcareThemeContext.Provider value={contextValue}>
      {children}
    </HealthcareThemeContext.Provider>
  );
}

/**
 * Hook to use healthcare theme context
 */
export function useHealthcareTheme(): HealthcareThemeContextValue {
  const context = useContext(HealthcareThemeContext);

  if (!context) {
    throw new Error(
      "useHealthcareTheme must be used within a HealthcareThemeProvider",
    );
  }

  return context;
}

/**
 * Healthcare theme CSS variables and utility classes
 */
export const healthcareThemeStyles = `
  /* Healthcare-specific CSS variables */
  :root {
    /* Emergency mode colors */
    --healthcare-emergency-bg: hsl(0 84% 60%);
    --healthcare-emergency-fg: hsl(0 0% 100%);
    --healthcare-warning-bg: hsl(38 92% 60%);
    --healthcare-warning-fg: hsl(0 0% 0%);
    --healthcare-info-bg: hsl(217 91% 60%);
    --healthcare-info-fg: hsl(0 0% 100%);
    --healthcare-success-bg: hsl(142 76% 36%);
    --healthcare-success-fg: hsl(0 0% 100%);
    
    /* Patient data sensitivity indicators */
    --healthcare-public: hsl(142 76% 36%);
    --healthcare-internal: hsl(217 91% 60%);
    --healthcare-confidential: hsl(38 92% 60%);
    --healthcare-restricted: hsl(0 84% 60%);
    
    /* Accessibility enhancements */
    --healthcare-focus-ring: 3px solid hsl(217 91% 60%);
    --healthcare-font-scale: 1;
  }

  /* Emergency mode styles */
  .emergency-mode {
    --destructive: var(--healthcare-emergency-bg);
    --destructive-foreground: var(--healthcare-emergency-fg);
  }

  .emergency-mode .healthcare-alert-emergency {
    background: var(--healthcare-emergency-bg);
    color: var(--healthcare-emergency-fg);
    border: 2px solid currentColor;
    animation: emergency-pulse 1s infinite;
  }

  @keyframes emergency-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }

  /* High contrast mode */
  .high-contrast {
    --background: hsl(0 0% 0%);
    --foreground: hsl(0 0% 100%);
    --border: hsl(0 0% 100%);
    --input: hsl(0 0% 0%);
    --ring: hsl(0 0% 100%);
  }

  .high-contrast button,
  .high-contrast input,
  .high-contrast select,
  .high-contrast textarea {
    border: 2px solid currentColor !important;
  }

  /* Reduced motion */
  .reduce-motion *,
  .reduce-motion *::before,
  .reduce-motion *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Screen reader optimizations */
  .screen-reader-optimized .sr-only {
    position: static !important;
    width: auto !important;
    height: auto !important;
    padding: 0.25rem !important;
    margin: 0.25rem !important;
    overflow: visible !important;
    clip: auto !important;
    white-space: normal !important;
    background: hsl(217 91% 60%);
    color: hsl(0 0% 100%);
    border: 1px solid currentColor;
  }

  /* Font scaling */
  html {
    font-size: calc(1rem * var(--healthcare-font-scale));
  }

  /* Data sensitivity indicators */
  [data-sensitivity="public"] {
    border-left: 4px solid var(--healthcare-public);
  }

  [data-sensitivity="internal"] {
    border-left: 4px solid var(--healthcare-internal);
  }

  [data-sensitivity="confidential"] {
    border-left: 4px solid var(--healthcare-confidential);
  }

  [data-sensitivity="restricted"] {
    border-left: 4px solid var(--healthcare-restricted);
  }

  /* Compact mode */
  .compact-mode {
    --spacing: 0.125rem;
    line-height: 1.4;
  }

  .compact-mode .healthcare-form-field {
    margin-bottom: 0.5rem;
  }

  /* Focus enhancements for healthcare */
  .healthcare-focus-enhanced *:focus {
    outline: var(--healthcare-focus-ring);
    outline-offset: 2px;
  }

  /* Patient data mode indicators */
  .patient-data-mode::before {
    content: "👤 Dados do Paciente";
    display: block;
    background: var(--healthcare-confidential);
    color: var(--healthcare-warning-fg);
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    text-align: center;
    position: sticky;
    top: 0;
    z-index: 50;
  }
`;

/**
 * Install healthcare theme styles in document head
 */
export function installHealthcareThemeStyles(target?: Document) {
  if (typeof document === "undefined") return;

  const head = (target ?? document).head;
  if (!head) return;

  // Avoid duplicate injection
  if (head.querySelector("style[data-healthcare-theme]")) return;

  const style = document.createElement("style");
  style.setAttribute("data-healthcare-theme", "true");
  style.textContent = healthcareThemeStyles;
  head.appendChild(style);
}
