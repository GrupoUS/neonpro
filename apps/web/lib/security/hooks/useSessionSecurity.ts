'use client';

import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Session Security Hooks for React Components
 * Provides client-side session security functionality
 */

type SessionSecurityState = {
  isSecure: boolean;
  riskScore: number;
  warnings: string[];
  timeoutWarning?: string;
  csrfToken?: string;
  sessionId?: string;
  lastActivity: Date;
};

type SessionTimeoutConfig = {
  timeoutMinutes: number;
  warningMinutes: number[];
  extendOnActivity: boolean;
  showWarnings: boolean;
};

type UseSessionSecurityOptions = {
  enableCSRF?: boolean;
  enableTimeout?: boolean;
  enableActivityTracking?: boolean;
  timeoutConfig?: Partial<SessionTimeoutConfig>;
  onSecurityWarning?: (warning: string) => void;
  onSessionTimeout?: () => void;
  onCSRFError?: () => void;
};

const DEFAULT_TIMEOUT_CONFIG: SessionTimeoutConfig = {
  timeoutMinutes: 30,
  warningMinutes: [5, 2, 1],
  extendOnActivity: true,
  showWarnings: true,
};

/**
 * Main session security hook
 */
export function useSessionSecurity(options: UseSessionSecurityOptions = {}) {
  const {
    enableCSRF = true,
    enableTimeout = true,
    enableActivityTracking = true,
    timeoutConfig = {},
    onSecurityWarning,
    onSessionTimeout,
    onCSRFError,
  } = options;

  const _supabase = useSupabaseClient();
  const user = useUser();

  const [securityState, setSecurityState] = useState<SessionSecurityState>({
    isSecure: true,
    riskScore: 0,
    warnings: [],
    lastActivity: new Date(),
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const activityListenerRef = useRef<(() => void) | null>(null);
  const config = { ...DEFAULT_TIMEOUT_CONFIG, ...timeoutConfig };

  /**
   * Initialize session security
   */
  const initializeSecurity = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      // Generate session ID if not exists
      let sessionId = sessionStorage.getItem('session-id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('session-id', sessionId);
      }

      // Get CSRF token if enabled
      let csrfToken;
      if (enableCSRF) {
        csrfToken = await fetchCSRFToken(sessionId);
      }

      // Initialize session timeout if enabled
      if (enableTimeout) {
        await initializeSessionTimeout(sessionId);
      }

      // Setup activity tracking if enabled
      if (enableActivityTracking) {
        setupActivityTracking(sessionId);
      }

      setSecurityState((prev) => ({
        ...prev,
        sessionId,
        csrfToken,
        lastActivity: new Date(),
      }));
    } catch (_error) {
      setSecurityState((prev) => ({
        ...prev,
        isSecure: false,
        warnings: [...prev.warnings, 'Failed to initialize security'],
      }));
    }
  }, [
    user,
    enableCSRF,
    enableTimeout,
    enableActivityTracking,
    fetchCSRFToken,
    initializeSessionTimeout,
    setupActivityTracking,
  ]);

  /**
   * Fetch CSRF token from server
   */
  const fetchCSRFToken = async (sessionId: string): Promise<string> => {
    try {
      const response = await fetch('/api/security/csrf-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      onCSRFError?.();
      throw error;
    }
  };

  /**
   * Initialize session timeout
   */
  const initializeSessionTimeout = async (sessionId: string) => {
    try {
      await fetch('/api/security/session-timeout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
        },
        body: JSON.stringify({
          sessionId,
          config: {
            timeoutMinutes: config.timeoutMinutes,
            warningMinutes: config.warningMinutes,
            extendOnActivity: config.extendOnActivity,
          },
        }),
      });

      // Setup timeout monitoring
      setupTimeoutMonitoring(sessionId);
    } catch (_error) {}
  };

  /**
   * Setup timeout monitoring
   */
  const setupTimeoutMonitoring = (sessionId: string) => {
    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    warningTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    warningTimeoutsRef.current = [];

    const timeoutMs = config.timeoutMinutes * 60 * 1000;
    const _now = Date.now();

    // Setup warning timeouts
    config.warningMinutes.forEach((warningMinutes) => {
      const warningMs = (config.timeoutMinutes - warningMinutes) * 60 * 1000;
      const warningTimeout = setTimeout(() => {
        const warning = `Session will expire in ${warningMinutes} minute${warningMinutes !== 1 ? 's' : ''}`;

        setSecurityState((prev) => ({
          ...prev,
          timeoutWarning: warning,
          warnings: [...prev.warnings, warning],
        }));

        if (config.showWarnings) {
          onSecurityWarning?.(warning);
        }
      }, warningMs);

      warningTimeoutsRef.current.push(warningTimeout);
    });

    // Setup final timeout
    timeoutRef.current = setTimeout(() => {
      handleSessionTimeout(sessionId);
    }, timeoutMs);
  };

  /**
   * Handle session timeout
   */
  const handleSessionTimeout = async (sessionId: string) => {
    try {
      // Force timeout on server
      await fetch('/api/security/session-timeout/force', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
        },
        body: JSON.stringify({ sessionId }),
      });

      // Clear local session data
      sessionStorage.removeItem('session-id');
      localStorage.clear();

      setSecurityState((prev) => ({
        ...prev,
        isSecure: false,
        warnings: [...prev.warnings, 'Session has expired'],
      }));

      onSessionTimeout?.();
    } catch (_error) {}
  };

  /**
   * Setup activity tracking
   */
  const setupActivityTracking = (sessionId: string) => {
    // Remove existing listener
    if (activityListenerRef.current) {
      activityListenerRef.current();
    }

    const activities = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ];
    let lastActivityTime = Date.now();
    const throttleMs = 30_000; // 30 seconds throttle

    const handleActivity = async () => {
      const now = Date.now();
      if (now - lastActivityTime < throttleMs) {
        return;
      }

      lastActivityTime = now;

      try {
        // Update activity on server
        await fetch('/api/security/session-activity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Session-ID': sessionId,
          },
          body: JSON.stringify({
            sessionId,
            activityType: 'user_interaction',
            timestamp: new Date().toISOString(),
          }),
        });

        // Update local state
        setSecurityState((prev) => ({
          ...prev,
          lastActivity: new Date(),
        }));

        // Extend session if configured
        if (config.extendOnActivity && enableTimeout) {
          setupTimeoutMonitoring(sessionId);
        }
      } catch (_error) {}
    };

    // Add event listeners
    activities.forEach((activity) => {
      document.addEventListener(activity, handleActivity, { passive: true });
    });

    // Store cleanup function
    activityListenerRef.current = () => {
      activities.forEach((activity) => {
        document.removeEventListener(activity, handleActivity);
      });
    };
  };

  /**
   * Extend session manually
   */
  const extendSession = useCallback(
    async (minutes: number = config.timeoutMinutes) => {
      if (!securityState.sessionId) {
        return;
      }

      try {
        await fetch('/api/security/session-timeout/extend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Session-ID': securityState.sessionId,
          },
          body: JSON.stringify({
            sessionId: securityState.sessionId,
            extensionMinutes: minutes,
          }),
        });

        // Reset timeout monitoring
        if (enableTimeout) {
          setupTimeoutMonitoring(securityState.sessionId);
        }

        setSecurityState((prev) => ({
          ...prev,
          timeoutWarning: undefined,
          warnings: prev.warnings.filter((w) => !w.includes('expire')),
        }));
      } catch (_error) {}
    },
    [
      securityState.sessionId,
      config.timeoutMinutes,
      enableTimeout,
      setupTimeoutMonitoring,
    ]
  );

  /**
   * Refresh CSRF token
   */
  const refreshCSRFToken = useCallback(async () => {
    if (!(enableCSRF && securityState.sessionId)) {
      return;
    }

    try {
      const newToken = await fetchCSRFToken(securityState.sessionId);
      setSecurityState((prev) => ({
        ...prev,
        csrfToken: newToken,
      }));
      return newToken;
    } catch (_error) {
      return null;
    }
  }, [enableCSRF, securityState.sessionId, fetchCSRFToken]);

  /**
   * Get headers for secure requests
   */
  const getSecureHeaders = useCallback(() => {
    const headers: Record<string, string> = {};

    if (securityState.sessionId) {
      headers['X-Session-ID'] = securityState.sessionId;
    }

    if (enableCSRF && securityState.csrfToken) {
      headers['X-CSRF-Token'] = securityState.csrfToken;
    }

    return headers;
  }, [securityState.sessionId, securityState.csrfToken, enableCSRF]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      warningTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      if (activityListenerRef.current) {
        activityListenerRef.current();
      }
    };
  }, []);

  /**
   * Initialize on mount and user change
   */
  useEffect(() => {
    if (user) {
      initializeSecurity();
    }
  }, [user, initializeSecurity]);

  return {
    securityState,
    extendSession,
    refreshCSRFToken,
    getSecureHeaders,
    isSecure: securityState.isSecure,
    warnings: securityState.warnings,
    timeoutWarning: securityState.timeoutWarning,
    csrfToken: securityState.csrfToken,
    sessionId: securityState.sessionId,
    lastActivity: securityState.lastActivity,
  };
}

/**
 * Hook for CSRF token management
 */
export function useCSRFToken(sessionId?: string) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchToken = useCallback(async () => {
    if (!sessionId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/security/csrf-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }

      const data = await response.json();
      setToken(data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  return { token, loading, error, refetch: fetchToken };
}

/**
 * Hook for session timeout warnings
 */
export function useSessionTimeout(sessionId?: string, onTimeout?: () => void) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const checkTimeout = async () => {
      try {
        const response = await fetch(
          `/api/security/session-timeout/status?sessionId=${sessionId}`
        );
        if (response.ok) {
          const data = await response.json();
          setTimeRemaining(data.timeRemaining);
          setWarning(data.warning);

          if (data.shouldTimeout) {
            onTimeout?.();
          }
        }
      } catch (_error) {}
    };

    // Check immediately
    checkTimeout();

    // Check every minute
    const interval = setInterval(checkTimeout, 60_000);

    return () => clearInterval(interval);
  }, [sessionId, onTimeout]);

  return { timeRemaining, warning };
}
