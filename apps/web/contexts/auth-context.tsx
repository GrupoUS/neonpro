'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { enhancedSessionManager } from '@/lib/auth/enhanced-session-manager';
import { oauthErrorHandler } from '@/lib/auth/oauth-error-handler';
import { permissionValidator } from '@/lib/auth/permission-validator';
import { securityAuditLogger } from '@/lib/auth/security-audit-logger';

// Supabase Auth types for strict TypeScript compliance
type User = {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
  };
};

type Session = {
  access_token: string;
  refresh_token: string;
  user: User;
};

type AuthError = {
  message: string;
  status?: number;
  __isAuthError: true;
};

type AuthResponse = {
  error: AuthError | null;
  data?: {
    user?: User;
    session?: Session;
  };
};

export const supabase = createClient();

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    name?: string
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  refreshSession: () => Promise<{ error: AuthError | null }>;
  getValidSession: () => Promise<{
    session: Session | null;
    error: AuthError | null;
  }>;
  checkPermission: (resource: string, action: string) => Promise<boolean>;
  getUserPermissions: () => Promise<any>;
  hasRole: (role: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  signInWithGoogle: async () => ({ error: null }),
  refreshSession: async () => ({ error: null }),
  getValidSession: async () => ({ session: null, error: null }),
  checkPermission: async () => false,
  getUserPermissions: async () => null,
  hasRole: async () => false,
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
        } else {
        }
      } catch (_error) {
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up real auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
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

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: name
            ? {
                full_name: name,
                name, // Fallback para compatibilidade
              }
            : undefined,
        },
      });
      if (error) {
      }

      // Auth state will be updated by the onAuthStateChange listener
      return { error };
    } catch (err: unknown) {
      const authError: AuthError = {
        message: err instanceof Error ? err.message : 'Unknown error occurred',
        __isAuthError: true,
      };
      return { error: authError };
    }
  };

  const signOut = async () => {
    try {
      // Log logout attempt
      if (user) {
        await securityAuditLogger.logSessionEvent('session_logout', user.id, {
          method: 'manual',
        });
      }

      // Enhanced secure logout
      if (session) {
        await enhancedSessionManager.secureLogout(session.access_token);
      }

      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
    } catch (_error) {
      // Force logout even if enhanced logout fails
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
    }
  };

  const signInWithGoogle = async (): Promise<{ error: AuthError | null }> => {
    try {
      const startTime = Date.now();

      // Log OAuth attempt
      await securityAuditLogger.logOAuthEvent('oauth_attempt', 'google', null, {
        method: 'popup',
        userAgent: navigator.userAgent,
      });

      // Optimized OAuth call with faster settings
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/popup-callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account', // Faster than 'consent' for returning users
          },
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        // Log OAuth error
        await securityAuditLogger.logOAuthEvent('oauth_error', 'google', null, {
          error: error.message,
          step: 'initiation',
        });

        // Handle OAuth error with enhanced error handler
        const handledError = await oauthErrorHandler.handleOAuthError(error, {
          provider: 'google',
          method: 'popup',
          step: 'initiation',
        });

        return { error: handledError };
      }

      if (data?.url) {
        // Optimized popup dimensions for faster load
        const width = 480;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        // Preload popup with optimized features
        const popup = window.open(
          data.url,
          'neonpro-google-oauth',
          `popup=yes,width=${width},height=${height},left=${left},top=${top},scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no`
        );

        if (!popup) {
          const authError: AuthError = {
            message:
              'Por favor, permita popups para este site fazer login com Google',
            __isAuthError: true,
          };
          return { error: authError };
        }

        // Faster monitoring with aggressive timeout for ≤3s requirement
        return new Promise<{ error: AuthError | null }>((resolve) => {
          let resolved = false;

          const checkInterval = setInterval(async () => {
            try {
              // Check if popup was closed
              if (popup.closed) {
                clearInterval(checkInterval);

                if (!resolved) {
                  await new Promise((resolve) => setTimeout(resolve, 500));

                  // Quick session check
                  const {
                    data: { session },
                  } = await supabase.auth.getSession();

                  const _totalTime = Date.now() - startTime;

                  if (session) {
                    resolved = true;
                    resolve({ error: null });
                  } else {
                    resolved = true;
                    const authError: AuthError = {
                      message: 'Authentication cancelled',
                      __isAuthError: true,
                    };
                    resolve({ error: authError });
                  }
                }
              } else {
                // Fast session check while popup is open
                const {
                  data: { session },
                } = await supabase.auth.getSession();
                if (session && !resolved) {
                  clearInterval(checkInterval);
                  const _totalTime = Date.now() - startTime;

                  // Immediate close for faster completion
                  popup.close();
                  resolved = true;
                  resolve({ error: null });
                }
              }
            } catch (_err) {}
          }, 300); // Faster polling for quicker response

          // Aggressive timeout for ≤3s requirement (3.5s total)
          setTimeout(() => {
            clearInterval(checkInterval);
            if (popup && !popup.closed) {
              popup.close();
            }
            if (!resolved) {
              const _totalTime = Date.now() - startTime;
              resolved = true;
              const authError: AuthError = {
                message: 'Authentication timeout - try again',
                __isAuthError: true,
              };
              resolve({ error: authError });
            }
          }, 3500);
        });
      }

      const authError: AuthError = {
        message: 'No authentication URL received',
        __isAuthError: true,
      };
      return { error: authError };
    } catch (error: unknown) {
      const authError: AuthError = {
        message:
          error instanceof Error ? error.message : 'Unknown Google OAuth error',
        __isAuthError: true,
      };
      return { error: authError };
    }
  };

  // Manual refresh session method for critical operations
  const refreshSession = async (): Promise<{ error: AuthError | null }> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        return { error };
      }

      if (data?.session) {
        setSession(data.session as Session);
        setUser(data.session.user as User);
        return { error: null };
      }

      return { error: null };
    } catch (error: unknown) {
      const authError: AuthError = {
        message:
          error instanceof Error
            ? error.message
            : 'Unknown session refresh error',
        __isAuthError: true,
      };
      return { error: authError };
    }
  };

  // Get valid session with automatic refresh if needed (for critical operations)
  const getValidSession = async (): Promise<{
    session: Session | null;
    error: AuthError | null;
  }> => {
    try {
      // Get current session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        return { session: null, error };
      }

      if (!session) {
        return { session: null, error: null };
      }

      // Check if token is close to expiring (refresh if <5 minutes remaining)
      const expiresAt = session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiresAt ? expiresAt - now : 0;

      if (timeUntilExpiry < 300) {
        const refreshResult = await refreshSession();

        if (refreshResult.error) {
          return { session: null, error: refreshResult.error };
        }

        // Get the new session after refresh
        const {
          data: { session: newSession },
        } = await supabase.auth.getSession();
        return { session: newSession, error: null };
      }
      return { session, error: null };
    } catch (error: unknown) {
      const authError: AuthError = {
        message:
          error instanceof Error
            ? error.message
            : 'Unknown session validation error',
        __isAuthError: true,
      };
      return { session: null, error: authError };
    }
  };

  // Permission validation methods
  const checkPermission = async (
    resource: string,
    action: string
  ): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      const result = await permissionValidator.checkPermission(
        user.id,
        resource,
        action
      );
      return result.granted;
    } catch (_error) {
      return false;
    }
  };

  const getUserPermissions = async () => {
    if (!user) {
      return null;
    }

    try {
      return await permissionValidator.getUserPermissions(user.id);
    } catch (_error) {
      return null;
    }
  };

  const hasRole = async (role: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      const permissions = await permissionValidator.getUserPermissions(user.id);
      return permissions?.roles?.some((r: any) => r.name === role);
    } catch (_error) {
      return false;
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
    refreshSession,
    getValidSession,
    checkPermission,
    getUserPermissions,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  return useContext(AuthContext);
};
