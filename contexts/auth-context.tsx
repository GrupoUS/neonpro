"use client";

import { createClient } from "@/utils/supabase/client";
import { createContext, useContext, useEffect, useState } from "react";

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
    // Real auth state setup
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          setSession(session as Session);
          setUser(session.user as User);
        }
      } catch (error) {
        console.log("Auth initialization:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up real auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event: string, session: any) => {
        if (session) {
          setSession(session as Session);
          setUser(session.user as User);
        } else {
          setSession(null);
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Auth state will be updated by the onAuthStateChange listener
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log("=== Starting Sign Up ===");
      console.log("Email:", email);
      console.log("Redirect URL:", `${window.location.origin}/auth/callback`);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      console.log("=== Sign Up Results ===");
      console.log("Success:", !error);
      console.log("User created:", !!data.user);
      console.log("Session created:", !!data.session);
      if (error) {
        console.error("Sign up error:", error);
      }

      // Auth state will be updated by the onAuthStateChange listener
      return { error };
    } catch (err: any) {
      console.error("Unexpected sign up error:", err);
      return { error: err };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  const signInWithGoogle = async () => {
    try {
      console.log("=== Initiating Google OAuth ===");

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("Error getting OAuth URL:", error);
        return { error };
      }

      console.log("OAuth initiated successfully");
      return { error: null };
    } catch (error: any) {
      console.error("Unexpected Google OAuth error:", error);
      return { error };
    }
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
