import React, { createContext, useContext, useMemo, useState } from "react";

export type Role = "admin" | "user" | "healthcare_professional" | "guest";

export interface AuthUser {
  id: string;
  email: string;
  _role: Role;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // extend as needed
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Minimal stub; in real app, wire to Supabase/SSR auth
  const [user] = useState<AuthUser | null>(null);
<<<<<<< HEAD
  const value = useMemo<AuthContextValue>(() => ({ user, isAuthenticated: !!user, isLoading: false }),
=======
  const value = useMemo<AuthContextValue>(_() => ({ user, isAuthenticated: !!user, isLoading: false }),
>>>>>>> origin/main
    [user],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
