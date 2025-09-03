"use client";

"use client";

import { createClient } from "@/app/utils/supabase/client";
import type { AuthError, Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

// Types
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    data: unknown;
    error: AuthError | null;
  }>;
  signUp: (
    email: string,
    password: string,
    additionalData?: {
      fullName: string;
      cpf: string;
      phone: string;
      clinicName: string;
      userType: string;
    },
  ) => Promise<{
    data: unknown;
    error: AuthError | null;
  }>;
  signInWithGoogle: () => Promise<{
    data: unknown;
    error: AuthError | null;
  }>;
  signOut: () => Promise<{ error: AuthError | null; }>;
  resetPassword: (email: string) => Promise<{
    data: unknown;
    error: AuthError | null;
  }>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>();
  const [session, setSession] = useState<Session | null>();
  const [loading, setLoading] = useState(true);

  // Initialize Supabase client
  const supabase = createClient();

  // Initialize session on mount
  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
        } else {
          setSession(session);
          setUser(session?.user ?? undefined);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? undefined);

      if (event === "SIGNED_IN") {
        // Redirect to dashboard after successful sign in
        window.location.href = "/dashboard";
      } else if (event === "SIGNED_OUT") {
        // Redirect to login after sign out
        window.location.href = "/login";
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]); // Auth methods
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { data, error };
    } catch (error) {
      return { data: undefined, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    additionalData?: {
      fullName: string;
      cpf: string;
      phone: string;
      clinicName: string;
      userType: string;
    },
  ) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: additionalData
            ? {
              full_name: additionalData.fullName,
              cpf: additionalData.cpf,
              phone: additionalData.phone,
              clinic_name: additionalData.clinicName,
              user_type: additionalData.userType,
            }
            : undefined,
        },
      });

      // If signup successful and we have additional data, save to profiles table
      if (data?.user && !error && additionalData) {
        try {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              full_name: additionalData.fullName,
              cpf: additionalData.cpf,
              phone: additionalData.phone,
              clinic_name: additionalData.clinicName,
              user_type: additionalData.userType,
              email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (profileError) {
            // Don't fail the signup for profile errors
          }
        } catch {
          // Don't fail the signup for profile errors
        }
      }

      return { data, error };
    } catch (error) {
      return { data: undefined, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // Use Supabase's signInWithOAuth but in popup mode
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/popup-callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        throw error;
      }

      // If we have a URL, open it in a popup
      if (data?.url) {
        const left = window.screen.width / 2 - 250;
        const top = window.screen.height / 2 - 300;
        const features =
          `width=500,height=600,scrollbars=yes,resizable=yes,left=${left},top=${top}`;
        const popup = window.open(
          data.url,
          "google-oauth",
          features,
        );

        if (!popup) {
          throw new Error("Popup blocked. Please allow popups for this site.");
        }

        // Return a promise that resolves when authentication completes
        return new Promise((resolve, reject) => {
          // Listen for messages from popup
          const messageListener = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) {
              return;
            }

            if (event.data.type === "OAUTH_SUCCESS") {
              popup.close();
              window.removeEventListener("message", messageListener);
              clearInterval(checkClosed);

              // Get the fresh session and update our state
              supabase.auth
                .getSession()
                .then(({ data: sessionData, error: sessionError }) => {
                  if (sessionError) {
                    reject(sessionError);
                    return;
                  }

                  if (sessionData?.session) {
                    // Update the local state immediately
                    setSession(sessionData.session);
                    setUser(sessionData.session.user);

                    // Redirect to dashboard immediately
                    window.location.href = "/dashboard";
                  }

                  resolve({ data: sessionData, error: undefined });
                });
            } else if (event.data.type === "OAUTH_ERROR") {
              popup.close();
              window.removeEventListener("message", messageListener);
              clearInterval(checkClosed);
              reject(new Error(event.data.error || "Authentication failed"));
            }
          };

          window.addEventListener("message", messageListener);

          // Check if popup was closed manually
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed);
              window.removeEventListener("message", messageListener);
              reject(new Error("Authentication was cancelled"));
            }
          }, 1000);
        });
      }

      return { data, error };
    } catch (error) {
      return { data: undefined, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      return { data, error };
    } catch (error) {
      return { data: undefined, error: error as AuthError };
    }
  }; // Context value
  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Export types for use in other files
export type { AuthContextType, AuthError, Session, User };
