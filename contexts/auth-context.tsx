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

      // NEW APPROACH: Use popup window to avoid redirect URI restrictions
      const redirectTo = `${window.location.origin}/auth/callback`;
      console.log(
        "Final redirect URL (after Supabase processing):",
        redirectTo
      );

      // Create a popup window for OAuth
      const popup = window.open(
        "",
        "google-oauth",
        "width=500,height=600,scrollbars=yes,resizable=yes"
      );

      if (!popup) {
        throw new Error("Popup blocked. Please allow popups for this site.");
      }

      // Build Google OAuth URL for popup using our popup callback
      const googleOAuthUrl = new URL(
        "https://accounts.google.com/o/oauth2/v2/auth"
      );
      googleOAuthUrl.searchParams.set(
        "client_id",
        "995596459059-7klijp94opars55ak54q2ekl4mfqcafd.apps.googleusercontent.com"
      );
      googleOAuthUrl.searchParams.set(
        "redirect_uri",
        `${window.location.origin}/auth/popup-callback`
      );
      googleOAuthUrl.searchParams.set("response_type", "code");
      googleOAuthUrl.searchParams.set("scope", "openid email profile");
      googleOAuthUrl.searchParams.set("access_type", "offline");
      googleOAuthUrl.searchParams.set("prompt", "consent");

      // Add state with our redirect URL
      const state = btoa(
        JSON.stringify({
          redirectTo,
          popup: true,
        })
      );
      googleOAuthUrl.searchParams.set("state", state);

      console.log("=== Opening OAuth Popup ===");
      console.log("OAuth URL:", googleOAuthUrl.toString());

      // Navigate popup to Google OAuth
      popup.location.href = googleOAuthUrl.toString();

      // Listen for messages from popup
      return new Promise<{ error: any }>((resolve) => {
        const messageListener = async (event: MessageEvent) => {
          // Verify origin for security
          if (event.origin !== window.location.origin) {
            return;
          }

          console.log("Received message from popup:", event.data);

          if (event.data.type === "OAUTH_SUCCESS") {
            // Handle successful OAuth
            const { code, state } = event.data;

            try {
              // Exchange code for session using Supabase
              const response = await fetch(
                `https://gfkskrkbnawkuppazkpt.supabase.co/auth/v1/callback?code=${code}&state=${state}`,
                {
                  method: "GET",
                  credentials: "include",
                }
              );

              if (response.ok) {
                // Check for session
                const {
                  data: { session },
                } = await supabase.auth.getSession();
                if (session) {
                  console.log("OAuth successful - session created");
                  setSession(session as Session);
                  setUser(session.user as User);
                  resolve({ error: null });
                } else {
                  resolve({ error: { message: "Failed to create session" } });
                }
              } else {
                resolve({ error: { message: "Failed to exchange code" } });
              }
            } catch (error: any) {
              resolve({ error: { message: error.message } });
            }
          } else if (event.data.type === "OAUTH_ERROR") {
            // Handle OAuth error
            resolve({ error: { message: event.data.error } });
          }

          // Clean up
          window.removeEventListener("message", messageListener);
          if (!popup.closed) {
            popup.close();
          }
        };

        // Add message listener
        window.addEventListener("message", messageListener);

        // Check if popup is closed manually
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener("message", messageListener);
            console.log("OAuth popup closed manually");
            resolve({ error: { message: "OAuth cancelled" } });
          }
        }, 1000);

        // Timeout after 5 minutes
        setTimeout(() => {
          if (!popup.closed) {
            popup.close();
          }
          clearInterval(checkClosed);
          window.removeEventListener("message", messageListener);
          resolve({ error: { message: "OAuth timeout" } });
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
