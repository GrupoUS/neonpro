"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

// Mock types for compatibility
interface User {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
  };
}

interface Session {
  access_token: string;
  refresh_token: string;
  user: User;
}

export const supabase = createClient();

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  signInWithGoogle: async () => ({ error: null }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock auth state setup for development
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          const mockSession: Session = {
            access_token: "demo-token",
            refresh_token: "demo-refresh",
            user: data.user as User,
          };
          setSession(mockSession);
          setUser(data.user as User);
        }
      } catch (error) {
        console.log("Auth initialization:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up mock auth state listener
    const { unsubscribe } = supabase.auth.onAuthStateChange((callback: any) => {
      // Mock implementation - in real app this would be handled by Augment
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (data.user) {
      const mockSession: Session = {
        access_token: "demo-token",
        refresh_token: "demo-refresh",
        user: data.user as User,
      };
      setSession(mockSession);
      setUser(data.user as User);
    }

    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      name: "Novo Usuário",
    });

    if (data.user) {
      const mockSession: Session = {
        access_token: "demo-token",
        refresh_token: "demo-refresh",
        user: data.user as User,
      };
      setSession(mockSession);
      setUser(data.user as User);
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  const signInWithGoogle = async () => {
    // Mock Google sign-in for development
    const mockUser: User = {
      id: "demo-google-user",
      email: "google@neonpro.com",
      user_metadata: {
        name: "Usuário Google",
      },
    };

    const mockSession: Session = {
      access_token: "demo-google-token",
      refresh_token: "demo-google-refresh",
      user: mockUser,
    };

    setSession(mockSession);
    setUser(mockUser);

    return { error: null };
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  return useContext(AuthContext);
};
