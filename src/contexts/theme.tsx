"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "custom";

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary2: string;
  secondary2: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  radius: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  customColors: ThemeColors;
  setCustomColors: (colors: ThemeColors) => void;
  toggleTheme: () => void;
}

const defaultDarkColors: ThemeColors = {
  primary: "#AC9469",
  secondary: "#112031",
  background: "#0a0a0b",
  foreground: "#f9fafb",
  card: "rgba(17, 32, 49, 0.5)",
  cardForeground: "#f9fafb",
  popover: "rgba(10, 10, 11, 0.95)",
  popoverForeground: "#f9fafb",
  primary2: "#c4b084",
  secondary2: "#1a2d47",
  muted: "rgba(249, 250, 251, 0.1)",
  mutedForeground: "rgba(249, 250, 251, 0.7)",
  accent: "#AC9469",
  accentForeground: "#0a0a0b",
  destructive: "#ef4444",
  destructiveForeground: "#f9fafb",
  border: "rgba(249, 250, 251, 0.1)",
  input: "rgba(249, 250, 251, 0.1)",
  ring: "#AC9469",
  radius: "0.75rem",
};

const defaultLightColors: ThemeColors = {
  primary: "#AC9469",
  secondary: "#112031",
  background: "#ffffff",
  foreground: "#0a0a0b",
  card: "rgba(255, 255, 255, 0.8)",
  cardForeground: "#0a0a0b",
  popover: "rgba(255, 255, 255, 0.95)",
  popoverForeground: "#0a0a0b",
  primary2: "#8a7854",
  secondary2: "#1f3a5f",
  muted: "rgba(10, 10, 11, 0.05)",
  mutedForeground: "rgba(10, 10, 11, 0.6)",
  accent: "#AC9469",
  accentForeground: "#ffffff",
  destructive: "#dc2626",
  destructiveForeground: "#ffffff",
  border: "rgba(10, 10, 11, 0.1)",
  input: "rgba(10, 10, 11, 0.05)",
  ring: "#AC9469",
  radius: "0.75rem",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [customColors, setCustomColors] =
    useState<ThemeColors>(defaultDarkColors);
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const savedCustomColors = localStorage.getItem("customColors");

    if (savedTheme) {
      setTheme(savedTheme);
    }

    if (savedCustomColors) {
      try {
        setCustomColors(JSON.parse(savedCustomColors));
      } catch (e) {
        console.error("Failed to parse custom colors:", e);
      }
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    const colors =
      theme === "light"
        ? defaultLightColors
        : theme === "dark"
        ? defaultDarkColors
        : customColors;

    // Remove old theme classes
    root.classList.remove("light", "dark");

    // Add new theme class
    if (theme !== "custom") {
      root.classList.add(theme);
    }

    // Apply CSS variables
    Object.entries(colors).forEach(([key, value]) => {
      if (key === "radius") {
        root.style.setProperty("--radius", value);
      } else {
        // Convert camelCase to kebab-case
        const cssVar = key.replace(/([A-Z])/g, "-$1").toLowerCase();
        root.style.setProperty(`--${cssVar}`, value);
      }
    });

    // Save to localStorage
    localStorage.setItem("theme", theme);
    if (theme === "custom") {
      localStorage.setItem("customColors", JSON.stringify(customColors));
    }
  }, [theme, customColors, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const value = {
    theme,
    setTheme,
    customColors,
    setCustomColors,
    toggleTheme,
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
