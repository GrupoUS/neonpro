/**
 * Enhanced Session Hook
 *
 * React hook for managing OAuth session state with enhanced security features.
 * Integrates with SessionManager for secure token storage and activity tracking.
 */

import type { useRouter } from "next/navigation";
import type { useCallback, useEffect, useState } from "react";
import type { createClient } from "@/lib/supabase/client";
import type { SessionData, sessionManager } from "./SessionManager";

interface UseSessionReturn {
  session: SessionData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshSession: () => Promise<boolean>;
  destroySession: () => Promise<void>;
  updateActivity: (action?: string, metadata?: Record<string, any>) => Promise<void>;
  activeSessions: SessionData[];
  terminateSession: (sessionId: string) => Promise<boolean>;
  shouldRefreshToken: boolean;
}

export function useSession(): UseSessionReturn {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSessions, setActiveSessions] = useState<SessionData[]>([]);
  const [shouldRefreshToken, setShouldRefreshToken] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  /**
   * Initialize session management
   */
  const initializeSession = useCallback(async () => {
    try {
      setIsLoading(true);
      await sessionManager.initialize();

      const currentSession = await sessionManager.getCurrentSession();
      setSession(currentSession);

      if (currentSession) {
        const sessions = await sessionManager.getActiveSessions();
        setActiveSessions(sessions);
        setShouldRefreshToken(sessionManager.shouldRefreshToken());
      }
    } catch (error) {
      console.error("Error initializing session:", error);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handle Supabase auth state changes
   */
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, supabaseSession) => {
      if (event === "SIGNED_IN" && supabaseSession?.user) {
        // Create new session when user signs in
        try {
          const newSession = await sessionManager.createSession(supabaseSession.user);
          setSession(newSession);

          const sessions = await sessionManager.getActiveSessions();
          setActiveSessions(sessions);
        } catch (error) {
          console.error("Error creating session:", error);
        }
      } else if (event === "SIGNED_OUT") {
        // Clear session when user signs out
        setSession(null);
        setActiveSessions([]);
        setShouldRefreshToken(false);
      } else if (event === "TOKEN_REFRESHED") {
        // Update session on token refresh
        setShouldRefreshToken(false);
        await updateActivity("token_refreshed");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Initialize session on mount
   */
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  /**
   * Check for token refresh needs
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const needsRefresh = sessionManager.shouldRefreshToken();
      setShouldRefreshToken(needsRefresh);

      if (needsRefresh) {
        refreshSession();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  /**
   * Refresh session tokens
   */
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const success = await sessionManager.refreshSession();

      if (success) {
        const updatedSession = await sessionManager.getCurrentSession();
        setSession(updatedSession);
        setShouldRefreshToken(false);
        return true;
      } else {
        // Refresh failed, redirect to login
        router.push("/auth/login?reason=token_expired");
        return false;
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
      return false;
    }
  }, [router]);

  /**
   * Destroy current session
   */
  const destroySession = useCallback(async (): Promise<void> => {
    try {
      await sessionManager.destroySession();
      setSession(null);
      setActiveSessions([]);
      setShouldRefreshToken(false);
      router.push("/auth/login");
    } catch (error) {
      console.error("Error destroying session:", error);
    }
  }, [router]);

  /**
   * Update user activity
   */
  const updateActivity = useCallback(
    async (action?: string, metadata?: Record<string, any>): Promise<void> => {
      try {
        await sessionManager.updateActivity(action, metadata);

        // Update local session state
        const updatedSession = await sessionManager.getCurrentSession();
        setSession(updatedSession);
      } catch (error) {
        console.error("Error updating activity:", error);
      }
    },
    [],
  );

  /**
   * Terminate specific session
   */
  const terminateSession = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      const success = await sessionManager.terminateSession(sessionId);

      if (success) {
        const sessions = await sessionManager.getActiveSessions();
        setActiveSessions(sessions);
      }

      return success;
    } catch (error) {
      console.error("Error terminating session:", error);
      return false;
    }
  }, []);

  return {
    session,
    isLoading,
    isAuthenticated: !!session,
    refreshSession,
    destroySession,
    updateActivity,
    activeSessions,
    terminateSession,
    shouldRefreshToken,
  };
}

// Hook for session activity tracking
export function useSessionActivity() {
  const { updateActivity } = useSession();

  /**
   * Track page navigation
   */
  const trackNavigation = useCallback(
    (route: string) => {
      updateActivity("navigation", { route });
    },
    [updateActivity],
  );

  /**
   * Track user actions
   */
  const trackAction = useCallback(
    (action: string, metadata?: Record<string, any>) => {
      updateActivity(action, metadata);
    },
    [updateActivity],
  );

  /**
   * Track form submissions
   */
  const trackFormSubmission = useCallback(
    (formName: string, success: boolean) => {
      updateActivity("form_submission", { formName, success });
    },
    [updateActivity],
  );

  /**
   * Track API calls
   */
  const trackApiCall = useCallback(
    (endpoint: string, method: string, status: number) => {
      updateActivity("api_call", { endpoint, method, status });
    },
    [updateActivity],
  );

  return {
    trackNavigation,
    trackAction,
    trackFormSubmission,
    trackApiCall,
  };
}

export type { SessionData };
