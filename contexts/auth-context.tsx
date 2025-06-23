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
    } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (session) {
        setSession(session as Session);
        setUser(session.user as User);
      } else {
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
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
      console.log("=== Initiating Google OAuth (Popup Method) ===");

      // Create popup window
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        "",
        "google-oauth",
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
      );

      if (!popup) {
        console.error("Popup blocked");
        return {
          error: new Error("Popup blocked. Please allow popups for this site."),
        };
      }

      // Get OAuth URL from Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/popup-callback`,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("Error getting OAuth URL:", error);
        popup.close();
        return { error };
      }

      if (!data?.url) {
        console.error("No OAuth URL returned");
        popup.close();
        return { error: new Error("Failed to get OAuth URL") };
      }

      console.log("Opening OAuth URL in popup:", data.url);
      popup.location.href = data.url;

      // Listen for messages from popup
      return new Promise<{ error: any }>((resolve) => {
        let resolved = false;

        const handleMessage = async (event: MessageEvent) => {
          // Verify origin
          if (event.origin !== window.location.origin) {
            console.log(
              "Ignoring message from different origin:",
              event.origin
            );
            return;
          }

          if (resolved) return;

          console.log("Received message from popup:", event.data);

          if (event.data.type === "OAUTH_SUCCESS") {
            resolved = true;
            window.removeEventListener("message", handleMessage);

            console.log(
              "OAuth successful - session established by popup callback"
            );

            // Wait a moment for session to propagate, then check
            setTimeout(async () => {
              const {
                data: { session },
              } = await supabase.auth.getSession();

              if (session) {
                console.log("Session confirmed, redirecting to dashboard");
                setSession(session as Session);
                setUser(session.user as User);
                window.location.href = "/dashboard";
                resolve({ error: null });
              } else {
                console.log(
                  "Session not found immediately, waiting for auth state change..."
                );
                // The onAuthStateChange listener should handle the session update
                // Just resolve successfully and let the auth state listener handle the redirect
                resolve({ error: null });
              }
            }, 1000);
          } else if (event.data.type === "OAUTH_ERROR") {
            resolved = true;
            window.removeEventListener("message", handleMessage);
            popup.close();
            console.error("OAuth error from popup:", event.data);
            resolve({
              error: new Error(event.data.description || event.data.error),
            });
          }
        };

        window.addEventListener("message", handleMessage);

        // Check if popup is closed manually
        const checkPopup = setInterval(() => {
          if (popup.closed && !resolved) {
            resolved = true;
            clearInterval(checkPopup);
            window.removeEventListener("message", handleMessage);
            console.log("Popup closed manually");
            resolve({ error: new Error("Authentication cancelled") });
          }
        }, 1000);

        // Timeout after 5 minutes
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            clearInterval(checkPopup);
            window.removeEventListener("message", handleMessage);
            if (!popup.closed) {
              popup.close();
            }
            resolve({ error: new Error("Authentication timeout") });
          }
        }, 300000);
      });
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
