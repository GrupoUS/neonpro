"use client";

import { createClient } from "@/lib/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProviderAlternative({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    console.log("=== Auth Provider Alternative Initialized ===");

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting initial session:", error);
        } else {
          console.log("Initial session:", session ? "EXISTS" : "NULL");
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error("Unexpected error getting session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change:", event, session ? "SESSION_EXISTS" : "NO_SESSION");
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle specific events
        if (event === "SIGNED_IN" && session) {
          console.log("User signed in:", session.user.email);
        } else if (event === "SIGNED_OUT") {
          console.log("User signed out");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    return { error };
  };

  const signInWithGoogle = async () => {
    try {
      console.log("=== Google OAuth Alternative Method ===");

      // Method 1: Try direct redirect (simplest approach)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback-alternative`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("OAuth initiation error:", error);
        return { error };
      }

      console.log("OAuth initiated successfully");
      return { error: null };
    } catch (error: any) {
      console.error("Unexpected Google OAuth error:", error);
      return { error };
    }
  };

  // Alternative popup method (if needed)
  const signInWithGooglePopup = async () => {
    try {
      console.log("=== Google OAuth Popup Alternative ===");

      const popup = window.open(
        "",
        "google-oauth",
        "width=500,height=600,left=" + 
        (window.screen.width / 2 - 250) + 
        ",top=" + 
        (window.screen.height / 2 - 300) + 
        ",toolbar=no,menubar=no,scrollbars=yes,resizable=yes"
      );

      if (!popup) {
        return { error: new Error("Popup blocked") };
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback-alternative`,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error || !data.url) {
        popup.close();
        return { error: error || new Error("No OAuth URL") };
      }

      popup.location.href = data.url;

      return new Promise<{ error: any }>((resolve) => {
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;

          if (event.data.type === "OAUTH_SUCCESS") {
            window.removeEventListener("message", handleMessage);
            console.log("OAuth popup success");
            resolve({ error: null });
          } else if (event.data.type === "OAUTH_ERROR") {
            window.removeEventListener("message", handleMessage);
            resolve({ error: new Error(event.data.description) });
          }
        };

        window.addEventListener("message", handleMessage);

        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener("message", handleMessage);
            resolve({ error: new Error("Authentication cancelled") });
          }
        }, 1000);
      });
    } catch (error: any) {
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

export const useAuthAlternative = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthAlternative must be used within an AuthProviderAlternative");
  }
  return context;
};
