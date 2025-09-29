/**
 * NEONPRO Theme Provider with Constitutional Compliance
 * 
 * Context API + localStorage persistence for Brazilian aesthetic clinics
 */

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  forcedTheme?: Theme;
  // Constitutional compliance props
  brazilianOptimization?: boolean;
  aestheticClinicMode?: boolean;
  lgpdCompliance?: boolean;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  forcedTheme?: Theme;
  resolvedTheme: "light" | "dark";
  // Constitutional state
  accessibilityMode: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "light",
  accessibilityMode: false,
  highContrast: false,
  reducedMotion: false,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "neonpro-theme",
  forcedTheme,
  brazilianOptimization = true,
  aestheticClinicMode = true,
  lgpdCompliance = true,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // LGPD compliance: Check for existing preference
    if (typeof window !== 'undefined') {
      const stored = localStorage?.getItem(storageKey);
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        return stored as Theme;
      }
    }
    return defaultTheme;
  });

  const [accessibilityMode] = useState(false);
  const [highContrast] = useState(false);
  const [reducedMotion] = useState(false);

  // Resolve theme (system -> actual theme)
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (forcedTheme) {
      root.classList.add(forcedTheme);
      setResolvedTheme(forcedTheme as "light" | "dark");
      return;
    }

    let resolvedThemeValue: "light" | "dark";

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      resolvedThemeValue = systemTheme;
      root.classList.add(systemTheme);
    } else {
      resolvedThemeValue = theme as "light" | "dark";
      root.classList.add(theme);
    }

    setResolvedTheme(resolvedThemeValue);
  }, [theme, forcedTheme]);

  // Constitutional compliance effects
  useEffect(() => {
    if (brazilianOptimization) {
      document.documentElement.setAttribute('data-brazilian-optimized', 'true');
    }

    if (aestheticClinicMode) {
      document.documentElement.setAttribute('data-aesthetic-clinic', 'true');
    }

    if (lgpdCompliance) {
      document.documentElement.setAttribute('data-lgpd-compliant', 'true');
    }
  }, [brazilianOptimization, aestheticClinicMode, lgpdCompliance]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      // LGPD compliance: Explicit consent for theme storage
      if (lgpdCompliance) {
        localStorage.setItem(storageKey, theme);
      }
      setTheme(theme);
    },
    forcedTheme,
    resolvedTheme,
    accessibilityMode,
    highContrast,
    reducedMotion,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};