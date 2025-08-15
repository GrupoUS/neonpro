// SSO React Hook
// Story 1.3: SSO Integration - React Hook for Frontend

import { useUser } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import type {
  SSOError,
  SSOErrorCode,
  SSOProvider,
  SSOSession,
  SSOUserInfo,
} from '@/types/sso';

export interface SSOState {
  isLoading: boolean;
  isAuthenticated: boolean;
  session: SSOSession | null;
  user: SSOUserInfo | null;
  error: SSOError | null;
  availableProviders: SSOProvider[];
}

export interface SSOActions {
  signInWithSSO: (
    providerId: string,
    options?: SSOSignInOptions
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  getDomainProvider: (email: string) => SSOProvider | null;
}

export interface SSOSignInOptions {
  redirectTo?: string;
  loginHint?: string;
  domainHint?: string;
  prompt?: 'none' | 'consent' | 'select_account' | 'login';
}

export interface UseSSOOptions {
  autoRefresh?: boolean;
  refreshThreshold?: number; // minutes before expiry to refresh
  onSessionExpired?: () => void;
  onError?: (error: SSOError) => void;
}

export function useSSO(options: UseSSOOptions = {}): SSOState & SSOActions {
  const {
    autoRefresh = true,
    refreshThreshold = 5,
    onSessionExpired,
    onError,
  } = options;

  const router = useRouter();
  const { user: currentUser, refreshUser } = useUser();

  const [state, setState] = useState<SSOState>({
    isLoading: true,
    isAuthenticated: false,
    session: null,
    user: null,
    error: null,
    availableProviders: [],
  });

  /**
   * Load available SSO providers
   */
  const loadProviders = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/sso/providers');
      if (response.ok) {
        const providers = await response.json();
        setState((prev) => ({ ...prev, availableProviders: providers }));
      }
    } catch (error) {
      logger.error('Failed to load SSO providers', { error: error.message });
    }
  }, []);

  /**
   * Load current SSO session
   */
  const loadSession = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const response = await fetch('/api/auth/sso/session', {
        credentials: 'include',
      });

      if (response.ok) {
        const session: SSOSession = await response.json();
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isAuthenticated: true,
          session,
          user: session.userInfo,
          error: null,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
          session: null,
          user: null,
        }));
      }
    } catch (error) {
      logger.error('Failed to load SSO session', { error: error.message });
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        session: null,
        user: null,
        error: {
          code: 'SESSION_LOAD_FAILED' as SSOErrorCode,
          message: 'Failed to load session',
          timestamp: new Date(),
        },
      }));
    }
  }, []);

  /**
   * Sign in with SSO provider
   */
  const signInWithSSO = useCallback(
    async (providerId: string, options: SSOSignInOptions = {}) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        // Generate auth URL
        const params = new URLSearchParams({
          provider: providerId,
          ...(options.redirectTo && { redirect_to: options.redirectTo }),
          ...(options.loginHint && { login_hint: options.loginHint }),
          ...(options.domainHint && { domain_hint: options.domainHint }),
          ...(options.prompt && { prompt: options.prompt }),
        });

        const response = await fetch(
          `/api/auth/sso/authorize?${params.toString()}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to generate auth URL');
        }

        const { authUrl } = await response.json();

        logger.info('SSO: Redirecting to provider', { providerId, authUrl });

        // Redirect to SSO provider
        window.location.href = authUrl;
      } catch (error) {
        logger.error('SSO sign-in failed', {
          providerId,
          error: error.message,
        });

        const ssoError: SSOError = {
          code: 'SIGN_IN_FAILED' as SSOErrorCode,
          message: error.message,
          timestamp: new Date(),
        };

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: ssoError,
        }));

        onError?.(ssoError);
        toast.error('Sign-in failed', {
          description: error.message,
        });
      }
    },
    [onError]
  );

  /**
   * Sign out from SSO
   */
  const signOut = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const response = await fetch('/api/auth/sso/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
          session: null,
          user: null,
          error: null,
        }));

        // Refresh user context
        await refreshUser();

        logger.info('SSO: Sign-out successful');
        toast.success('Signed out successfully');

        // Redirect to login page
        router.push('/auth/login');
      } else {
        throw new Error('Sign-out failed');
      }
    } catch (error) {
      logger.error('SSO sign-out failed', { error: error.message });

      const ssoError: SSOError = {
        code: 'SIGN_OUT_FAILED' as SSOErrorCode,
        message: error.message,
        timestamp: new Date(),
      };

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: ssoError,
      }));

      onError?.(ssoError);
      toast.error('Sign-out failed', {
        description: error.message,
      });
    }
  }, [router, refreshUser, onError]);

  /**
   * Refresh SSO session
   */
  const refreshSession = useCallback(async () => {
    try {
      if (!state.session) {
        return;
      }

      const response = await fetch('/api/auth/sso/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const session: SSOSession = await response.json();
        setState((prev) => ({
          ...prev,
          session,
          user: session.userInfo,
          error: null,
        }));

        logger.info('SSO: Session refreshed successfully');
      } else {
        // Session refresh failed, sign out
        await signOut();
        onSessionExpired?.();
      }
    } catch (error) {
      logger.error('SSO session refresh failed', { error: error.message });
      await signOut();
      onSessionExpired?.();
    }
  }, [state.session, signOut, onSessionExpired]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Get SSO provider for domain
   */
  const getDomainProvider = useCallback((email: string): SSOProvider | null => {
    const domain = email.split('@')[1];
    if (!domain) {
      return null;
    }

    // This would typically call an API to check domain mappings
    // For now, return null (no automatic domain mapping)
    return null;
  }, []);

  /**
   * Auto-refresh session when near expiry
   */
  useEffect(() => {
    if (!(autoRefresh && state.session)) {
      return;
    }

    const checkAndRefresh = () => {
      const expiresAt = new Date(state.session?.expiresAt);
      const now = new Date();
      const minutesUntilExpiry =
        (expiresAt.getTime() - now.getTime()) / (1000 * 60);

      if (minutesUntilExpiry <= refreshThreshold) {
        refreshSession();
      }
    };

    // Check immediately
    checkAndRefresh();

    // Check every minute
    const interval = setInterval(checkAndRefresh, 60_000);

    return () => clearInterval(interval);
  }, [autoRefresh, state.session, refreshThreshold, refreshSession]);

  /**
   * Load initial data
   */
  useEffect(() => {
    loadProviders();
    loadSession();
  }, [loadProviders, loadSession]);

  /**
   * Handle URL callback after SSO redirect
   */
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      if (error) {
        const errorDescription = urlParams.get('error_description');
        logger.error('SSO callback error', { error, errorDescription });

        const ssoError: SSOError = {
          code: 'CALLBACK_ERROR' as SSOErrorCode,
          message: errorDescription || error,
          timestamp: new Date(),
        };

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: ssoError,
        }));

        onError?.(ssoError);
        toast.error('Authentication failed', {
          description: errorDescription || error,
        });

        // Clean URL
        router.replace('/auth/login');
        return;
      }

      if (code && state) {
        try {
          setState((prev) => ({ ...prev, isLoading: true }));

          const response = await fetch('/api/auth/sso/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, state }),
            credentials: 'include',
          });

          if (response.ok) {
            const session: SSOSession = await response.json();
            setState((prev) => ({
              ...prev,
              isLoading: false,
              isAuthenticated: true,
              session,
              user: session.userInfo,
              error: null,
            }));

            // Refresh user context
            await refreshUser();

            logger.info('SSO: Authentication successful');
            toast.success('Signed in successfully');

            // Redirect to intended destination
            const redirectTo = urlParams.get('redirect_to') || '/dashboard';
            router.replace(redirectTo);
          } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Authentication failed');
          }
        } catch (error) {
          logger.error('SSO callback processing failed', {
            error: error.message,
          });

          const ssoError: SSOError = {
            code: 'CALLBACK_PROCESSING_FAILED' as SSOErrorCode,
            message: error.message,
            timestamp: new Date(),
          };

          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: ssoError,
          }));

          onError?.(ssoError);
          toast.error('Authentication failed', {
            description: error.message,
          });

          router.replace('/auth/login');
        }
      }
    };

    handleCallback();
  }, [router, refreshUser, onError]);

  return {
    ...state,
    signInWithSSO,
    signOut,
    refreshSession,
    clearError,
    getDomainProvider,
  };
}

/**
 * Hook for checking if user has SSO session
 */
export function useSSOSession() {
  const { isAuthenticated, session, user } = useSSO({ autoRefresh: false });

  return {
    hasSession: isAuthenticated,
    session,
    user,
  };
}

/**
 * Hook for SSO provider information
 */
export function useSSOProviders() {
  const { availableProviders } = useSSO({ autoRefresh: false });

  return {
    providers: availableProviders,
    getProvider: (id: string) => availableProviders.find((p) => p.id === id),
    isProviderEnabled: (id: string) =>
      availableProviders.some((p) => p.id === id && p.enabled),
  };
}
