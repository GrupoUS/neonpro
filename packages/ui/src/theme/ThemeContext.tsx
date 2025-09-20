import React, { createContext, useContext } from "react";

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProviderBridge: React.FC<{
  value: ThemeContextValue;
  children: React.ReactNode;
}> = ({ value, children }) => {
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export function useThemeBridge(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeBridge must be used within a ThemeProviderBridge");
  }
  return ctx;
}
