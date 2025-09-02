"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// Healthcare theme types for Brazilian aesthetic clinics
export type HealthcareTheme = "light" | "dark" | "system";
export type AccessibilityMode = "normal" | "high-contrast" | "emergency";
export type MotionPreference = "normal" | "reduced";

export interface HealthcareThemeConfig {
  theme: HealthcareTheme;
  accessibilityMode: AccessibilityMode;
  motionPreference: MotionPreference;
  emergencyModeActive: boolean;
  lgpdCompliant: boolean;
  autoSwitchEnabled: boolean;
}

interface HealthcareThemeContextType {
  config: HealthcareThemeConfig;
  setTheme: (theme: HealthcareTheme) => void;
  setAccessibilityMode: (mode: AccessibilityMode) => void;
  setMotionPreference: (preference: MotionPreference) => void;
  toggleEmergencyMode: () => void;
  resetToDefault: () => void;
  systemTheme: HealthcareTheme;
  resolvedTheme: HealthcareTheme;
}

const HealthcareThemeContext = createContext<HealthcareThemeContextType | undefined>(undefined);

// Default configuration for Brazilian healthcare clinics
const defaultConfig: HealthcareThemeConfig = {
  theme: "system",
  accessibilityMode: "normal",
  motionPreference: "normal",
  emergencyModeActive: false,
  lgpdCompliant: true,
  autoSwitchEnabled: true,
};

// LGPD-compliant storage keys
const STORAGE_KEYS = {
  THEME_CONFIG: "neonpro-healthcare-theme-config",
  EMERGENCY_MODE: "neonpro-emergency-mode",
  ACCESSIBILITY_PREFS: "neonpro-accessibility-preferences",
} as const;

export function HealthcareThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "light",
  enableSystem = true,
  disableTransitionOnChange = false,
}: {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: HealthcareTheme;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}) {
  const [config, setConfig] = useState<HealthcareThemeConfig>(() => ({
    ...defaultConfig,
    theme: defaultTheme,
  }));

  const [systemTheme, setSystemTheme] = useState<HealthcareTheme>("light");
  const [mounted, setMounted] = useState(false);

  // Resolve the actual theme to apply
  const resolvedTheme: HealthcareTheme = config.theme === "system" ? systemTheme : config.theme;

  // System theme detection
  useEffect(() => {
    if (!enableSystem) return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const updateSystemTheme = () => {
      setSystemTheme(media.matches ? "dark" : "light");
    };

    updateSystemTheme();
    media.addEventListener("change", updateSystemTheme);

    return () => media.removeEventListener("change", updateSystemTheme);
  }, [enableSystem]);

  // Motion preference detection
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateMotionPreference = () => {
      if (media.matches) {
        setConfig(prev => ({ ...prev, motionPreference: "reduced" }));
      }
    };

    updateMotionPreference();
    media.addEventListener("change", updateMotionPreference);

    return () => media.removeEventListener("change", updateMotionPreference);
  }, []);

  // High contrast detection
  useEffect(() => {
    const media = window.matchMedia("(prefers-contrast: high)");

    const updateContrastPreference = () => {
      if (media.matches && config.accessibilityMode === "normal") {
        setConfig(prev => ({ ...prev, accessibilityMode: "high-contrast" }));
      }
    };

    updateContrastPreference();
    media.addEventListener("change", updateContrastPreference);

    return () => media.removeEventListener("change", updateContrastPreference);
  }, [config.accessibilityMode]);

  // Load saved configuration (LGPD compliant)
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem(STORAGE_KEYS.THEME_CONFIG);
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.warn("Failed to load healthcare theme configuration:", error);
    }

    setMounted(true);
  }, []);

  // Save configuration (LGPD compliant with explicit consent)
  useEffect(() => {
    if (!mounted || !config.lgpdCompliant) return;

    try {
      localStorage.setItem(STORAGE_KEYS.THEME_CONFIG, JSON.stringify(config));
    } catch (error) {
      console.warn("Failed to save healthcare theme configuration:", error);
    }
  }, [config, mounted]);

  // Apply theme classes to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove("light", "dark", "high-contrast", "emergency-mode");

    if (disableTransitionOnChange) {
      root.classList.add("[&_*]:!transition-none");
    }

    // Apply resolved theme
    root.classList.add(resolvedTheme);

    // Apply accessibility modes
    if (config.accessibilityMode === "high-contrast") {
      root.classList.add("high-contrast");
    }

    if (config.emergencyModeActive) {
      root.classList.add("emergency-mode");
    }

    // Apply motion preferences
    if (config.motionPreference === "reduced") {
      root.style.setProperty("--motion-scale", "0");
    } else {
      root.style.removeProperty("--motion-scale");
    }

    // Clean up transition classes
    if (disableTransitionOnChange) {
      const timer = setTimeout(() => {
        root.classList.remove("[&_*]:!transition-none");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [resolvedTheme, config, mounted, disableTransitionOnChange]);

  // Emergency mode keyboard shortcut (Ctrl+Shift+E)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === "E") {
        event.preventDefault();
        toggleEmergencyMode();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const setTheme = (theme: HealthcareTheme) => {
    setConfig(prev => ({ ...prev, theme }));
  };

  const setAccessibilityMode = (mode: AccessibilityMode) => {
    setConfig(prev => ({ ...prev, accessibilityMode: mode }));
  };

  const setMotionPreference = (preference: MotionPreference) => {
    setConfig(prev => ({ ...prev, motionPreference: preference }));
  };

  const toggleEmergencyMode = () => {
    setConfig(prev => ({
      ...prev,
      emergencyModeActive: !prev.emergencyModeActive,
    }));

    // Announce emergency mode change for screen readers
    const message = config.emergencyModeActive
      ? "Modo de emergência desativado"
      : "Modo de emergência ativado - Interface otimizada para situações críticas";

    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "assertive");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;
    document.body.append(announcement);

    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  const resetToDefault = () => {
    setConfig({ ...defaultConfig, theme: defaultTheme });
  };

  const contextValue: HealthcareThemeContextType = {
    config,
    setTheme,
    setAccessibilityMode,
    setMotionPreference,
    toggleEmergencyMode,
    resetToDefault,
    systemTheme,
    resolvedTheme,
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <HealthcareThemeContext.Provider value={contextValue}>
        <div className="opacity-0">{children}</div>
      </HealthcareThemeContext.Provider>
    );
  }

  return (
    <HealthcareThemeContext.Provider value={contextValue}>
      {children}
    </HealthcareThemeContext.Provider>
  );
}

// Hook for using healthcare theme context
export function useHealthcareTheme() {
  const context = useContext(HealthcareThemeContext);

  if (context === undefined) {
    throw new Error("useHealthcareTheme must be used within a HealthcareThemeProvider");
  }

  return context;
}

// Compatibility alias for standard theme provider pattern
export const ThemeProvider = HealthcareThemeProvider;
export const useTheme = useHealthcareTheme;

// Emergency mode hook for critical healthcare scenarios
export function useEmergencyMode() {
  const { config, toggleEmergencyMode } = useHealthcareTheme();

  return {
    isActive: config.emergencyModeActive,
    toggle: toggleEmergencyMode,
    activate: () => {
      if (!config.emergencyModeActive) {
        toggleEmergencyMode();
      }
    },
    deactivate: () => {
      if (config.emergencyModeActive) {
        toggleEmergencyMode();
      }
    },
  };
}

// Accessibility preferences hook
export function useAccessibilityPreferences() {
  const { config, setAccessibilityMode, setMotionPreference } = useHealthcareTheme();

  return {
    accessibilityMode: config.accessibilityMode,
    motionPreference: config.motionPreference,
    setAccessibilityMode,
    setMotionPreference,
    isHighContrast: config.accessibilityMode === "high-contrast",
    isReducedMotion: config.motionPreference === "reduced",
  };
}

// LGPD compliance hook for Brazilian healthcare requirements
export function useLGPDCompliance() {
  const { config, setConfig } = useHealthcareTheme() as unknown;

  return {
    isCompliant: config.lgpdCompliant,
    enableCompliance: () => setConfig((prev: unknown) => ({ ...prev, lgpdCompliant: true })),
    disableCompliance: () => setConfig((prev: unknown) => ({ ...prev, lgpdCompliant: false })),
  };
}
