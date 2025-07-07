"use client";

import type React from "react";

import { createClient } from "@/app/utils/supabase/client";
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
  signUp: (
    email: string,
    password: string,
    name?: string
  ) => Promise<{ error: any }>;
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
        console.log("🔄 Initializing auth context...");
        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log("📊 Initial session check:", !!session);
        if (session) {
          console.log("✅ Initial session found, setting user");
          setSession(session as Session);
          setUser(session.user as User);
        } else {
          console.log("❌ No initial session found");
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up real auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      console.log("🔄 Auth state change:", event, !!session);

      if (session) {
        console.log("✅ Session detected, setting user:", session.user?.email);
        setSession(session as Session);
        setUser(session.user as User);
      } else {
        console.log("❌ No session, clearing user");
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    });

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

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      console.log("=== Starting Sign Up ===");
      console.log("Email:", email);
      console.log("Redirect URL:", `${window.location.origin}/auth/callback`);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: name
            ? {
                full_name: name,
                name: name, // Fallback para compatibilidade
              }
            : undefined,
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

  const signInWithGoogle = async (): Promise<{ error: any }> => {
    try {
      console.log("=== Initiating Google OAuth (Popup) ===");

      // Correção: Usar /auth/popup-callback para modo popup em vez de /auth/callback
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/popup-callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          skipBrowserRedirect: true, // Evita redirecionamento da página inteira
        },
      });

      if (error) {
        console.error("Error initiating OAuth:", error);
        return { error };
      }

      if (data?.url) {
        // Calcular posição central do popup
        const width = 500;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        // Abrir popup
        const popup = window.open(
          data.url,
          "neonpro-google-oauth",
          `popup,width=${width},height=${height},left=${left},top=${top}`
        );

        if (!popup) {
          console.error("Popup blocked by browser");
          return {
            error: new Error(
              "Por favor, permita popups para este site fazer login com Google"
            ),
          };
        }

        // Monitorar o popup e a sessão
        return new Promise<{ error: any }>((resolve) => {
          let resolved = false;

          const checkInterval = setInterval(async () => {
            try {
              // Verificar se popup foi fechado
              if (popup.closed) {
                clearInterval(checkInterval);

                if (!resolved) {
                  // Aguardar um pouco para a sessão ser sincronizada
                  console.log("🔄 Popup closed, waiting for session sync...");
                  await new Promise((resolve) => setTimeout(resolve, 1000));

                  // Verificar se o usuário foi autenticado
                  const {
                    data: { session },
                  } = await supabase.auth.getSession();

                  if (session) {
                    console.log("✅ Authentication successful via popup");
                    resolved = true;
                    resolve({ error: null });
                  } else {
                    console.log("❌ Popup closed without authentication");
                    resolved = true;
                    resolve({
                      error: new Error("Authentication cancelled"),
                    });
                  }
                }
              } else {
                // Verificar se recebemos uma sessão enquanto o popup ainda está aberto
                const {
                  data: { session },
                } = await supabase.auth.getSession();
                if (session && !resolved) {
                  clearInterval(checkInterval);
                  console.log("✅ Authentication successful, closing popup");

                  // Aguardar um pouco antes de fechar para garantir sincronização
                  setTimeout(() => {
                    popup.close();
                  }, 500);

                  resolved = true;
                  resolve({ error: null });
                }
              }
            } catch (err) {
              console.error("❌ Error checking popup status:", err);
            }
          }, 500);

          // Timeout após 5 minutos
          setTimeout(() => {
            clearInterval(checkInterval);
            if (popup && !popup.closed) {
              popup.close();
            }
            resolve({
              error: new Error("Authentication timeout"),
            });
          }, 5 * 60 * 1000);
        });
      }

      return { error: new Error("No authentication URL received") };
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
