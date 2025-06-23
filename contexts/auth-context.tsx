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
      console.log("=== Initiating Google OAuth Popup ===");

      // Get OAuth URL without browser redirect
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/popup-callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          skipBrowserRedirect: true, // Don't redirect, we'll handle the popup
        },
      });

      if (error) {
        console.error("Error getting OAuth URL:", error);
        return { error };
      }

      if (!data?.url) {
        console.error("No OAuth URL returned");
        return { error: new Error("Failed to get OAuth URL") };
      }

      // Open popup window
      const popupWidth = 500;
      const popupHeight = 700;
      const left = window.screenX + (window.outerWidth - popupWidth) / 2;
      const top = window.screenY + (window.outerHeight - popupHeight) / 2;

      const popup = window.open(
        data.url,
        "GoogleAuthPopup",
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},toolbar=no,menubar=no,location=no,status=no`
      );

      if (!popup) {
        console.error("Popup blocked");
        // Fallback to redirect if popup is blocked
        window.location.href = data.url;
        return { error: null };
      }

      // Create promise to handle popup result
      return new Promise<{ error: any }>((resolve) => {
        let popupCheckInterval: NodeJS.Timeout;

        // Listen for messages from popup
        const messageHandler = (event: MessageEvent) => {
          // Verify origin for security
          if (event.origin !== window.location.origin) {
            return;
          }

          if (event.data?.type === "GOOGLE_AUTH_SUCCESS") {
            console.log("Google auth success via popup");
            window.removeEventListener("message", messageHandler);
            if (popupCheckInterval) clearInterval(popupCheckInterval);

            // Refresh auth state
            supabase.auth.getSession().then(({ data: { session } }) => {
              if (session) {
                setSession(session as Session);
                setUser(session.user as User);
              }
            });

            resolve({ error: null });
          } else if (event.data?.type === "GOOGLE_AUTH_ERROR") {
            console.error("Google auth error via popup:", event.data.error);
            window.removeEventListener("message", messageHandler);
            if (popupCheckInterval) clearInterval(popupCheckInterval);
            resolve({ error: event.data.error });
          }
        };

        window.addEventListener("message", messageHandler);

        // Check if popup is closed
        popupCheckInterval = setInterval(() => {
          if (popup.closed) {
            console.log("Popup closed by user");
            window.removeEventListener("message", messageHandler);
            clearInterval(popupCheckInterval);
            resolve({ error: new Error("Authentication cancelled") });
          }
        }, 500);
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
