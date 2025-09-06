"use client";

/**
 * Real Authentication Context
 *
 * Provides authentication state and methods throughout the app using React Context
 */

import type { ReactNode } from "react";
import React, { createContext, useContext } from "react";
import type { UseRealAuthReturn } from "../hooks/useRealAuth";
import { useRealAuth } from "../hooks/useRealAuth";

// Create context
const RealAuthContext = createContext<UseRealAuthReturn | undefined>(undefined);

// Provider component props
interface RealAuthProviderProps {
  children: ReactNode;
}

// Provider component
export function RealAuthProvider({ children }: RealAuthProviderProps) {
  const auth = useRealAuth();

  return (
    <RealAuthContext.Provider value={auth}>
      {children}
    </RealAuthContext.Provider>
  );
}

// Hook to use auth context
export function useRealAuthContext(): UseRealAuthReturn {
  const context = useContext(RealAuthContext);

  if (context === undefined) {
    throw new Error("useRealAuthContext must be used within a RealAuthProvider");
  }

  return context;
}

// Export types for convenience
export type { UseRealAuthReturn };
