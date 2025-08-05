/**
 * useSession Hook - React Hook for Session Management
 * Provides comprehensive session management with real-time updates and security monitoring
 */

import type { useRouter } from "next/navigation";
import type { useCallback, useEffect, useRef, useState } from "react";
import type { toast } from "sonner";
import type { SessionManager } from "@/lib/auth/session-manager";
import type {
  DeviceRegistration,
  SecurityAlert,
  SecurityEventType,
  SecuritySeverity,
  SessionSecurityEvent,
  SessionValidationResult,
  UserSession,
  UseSessionOptions,
  UseSessionReturn,
} from "@/types/session";

// Session API endpoints
const SESSION_API = {
  validate: "/api/auth/session/validate",
  refresh: "/api/auth/session/refresh",
  terminate: "/api/auth/session/terminate",
  extend: "/api/auth/session/extend",
  security: "/api/auth/session/security",
  devices: "/api/auth/session/devices",
  active: "/api/auth/session/active",
};

export function useSession(options: UseSessionOptions = {}): UseSessionReturn {
  const {
    autoRefresh = true,
    refreshInterval = 60000, // 1 minute
    onExpiry,
    onSecurityAlert,
    onDeviceChange,
  } = options;

  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());

  const router = useRouter();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionManagerRef = useRef<SessionManager | null>(null);

  // Initialize session validation
  const validateSession = useCallback(async (): Promise<SessionValidationResult> => {
    setIsValidating(true);
    setError(null);

    try {
      const response = await fetch(SESSION_API.validate, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Session validation failed: ${response.statusText}`);
      }

      const result: SessionValidationResult = await response.json();

      if (result.valid && result.session) {
        setSession(result.session);
        setLastActivity(new Date());

        // Setup session expiry warnings
        setupExpiryWarnings(result.session);

        // Handle security alerts
        if (result.warnings && result.warnings.length > 0) {
          const alerts: SecurityAlert[] = result.warnings.map((warning, index) => ({
            id: `warning-${Date.now()}-${index}`,
            type: SecurityEventType.SUSPICIOUS_ACTIVITY,
            severity: SecuritySeverity.MEDIUM,
            message: warning,
            timestamp: new Date(),
            requires_action: false,
          }));

          setSecurityAlerts((prev) => [...prev, ...alerts]);
          alerts.forEach((alert) => onSecurityAlert?.(alert));
        }
      } else {
        setSession(null);
        if (result.errors && result.errors.length > 0) {
          const errorMessage = result.errors.join(", ");
          setError(new Error(errorMessage));

          // Handle session expiry
          if (errorMessage.includes("expired")) {
            onExpiry?.();
            toast.error("Your session has expired. Please log in again.");
            router.push("/login");
          }
        }
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Session validation failed");
      setError(error);
      setSession(null);

      return {
        valid: false,
        errors: [error.message],
        security_score: 0,
      };
    } finally {
      setIsValidating(false);
      setIsLoading(false);
    }
  }, [onExpiry, onSecurityAlert, router]);

  // Refresh session
  const refresh = useCallback(async (): Promise<void> => {
    if (!session) return;

    try {
      const response = await fetch(SESSION_API.refresh, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Session refresh failed: ${response.statusText}`);
      }

      const refreshedSession: UserSession = await response.json();
      setSession(refreshedSession);
      setLastActivity(new Date());
      setupExpiryWarnings(refreshedSession);

      toast.success("Session refreshed successfully");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Session refresh failed");
      setError(error);
      toast.error("Failed to refresh session");
    }
  }, [session]);

  // Terminate session
  const terminate = useCallback(async (): Promise<void> => {
    try {
      await fetch(SESSION_API.terminate, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      setSession(null);
      setSecurityAlerts([]);
      clearAllTimeouts();

      toast.success("Session terminated successfully");
      router.push("/login");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Session termination failed");
      setError(error);
      toast.error("Failed to terminate session");
    }
  }, [router]);

  // Extend session
  const extend = useCallback(
    async (minutes?: number): Promise<void> => {
      if (!session) return;

      try {
        const response = await fetch(SESSION_API.extend, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ minutes }),
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Session extension failed: ${response.statusText}`);
        }

        const extendedSession: UserSession = await response.json();
        setSession(extendedSession);
        setLastActivity(new Date());
        setupExpiryWarnings(extendedSession);

        toast.success(`Session extended by ${minutes || 30} minutes`);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Session extension failed");
        setError(error);
        toast.error("Failed to extend session");
      }
    },
    [session],
  );

  // Register device
  const registerDevice = useCallback(
    async (deviceName: string): Promise<DeviceRegistration> => {
      try {
        const response = await fetch(SESSION_API.devices, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ deviceName }),
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Device registration failed: ${response.statusText}`);
        }

        const device: DeviceRegistration = await response.json();
        onDeviceChange?.(device);
        toast.success("Device registered successfully");

        return device;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Device registration failed");
        setError(error);
        toast.error("Failed to register device");
        throw error;
      }
    },
    [onDeviceChange],
  );

  // Get active sessions
  const getActiveSessions = useCallback(async (): Promise<UserSession[]> => {
    try {
      const response = await fetch(SESSION_API.active, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to get active sessions: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to get active sessions");
      setError(error);
      throw error;
    }
  }, []);

  // Terminate specific session
  const terminateSession = useCallback(async (sessionId: string): Promise<void> => {
    try {
      const response = await fetch(`${SESSION_API.terminate}/${sessionId}`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to terminate session: ${response.statusText}`);
      }

      toast.success("Session terminated successfully");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to terminate session");
      setError(error);
      toast.error("Failed to terminate session");
      throw error;
    }
  }, []);

  // Get security events
  const getSecurityEvents = useCallback(async (): Promise<SessionSecurityEvent[]> => {
    try {
      const response = await fetch(SESSION_API.security, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to get security events: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to get security events");
      setError(error);
      throw error;
    }
  }, []);

  // Setup expiry warnings
  const setupExpiryWarnings = useCallback(
    (currentSession: UserSession) => {
      clearTimeout(warningTimeoutRef.current!);

      const now = new Date().getTime();
      const expiresAt = new Date(currentSession.expires_at).getTime();
      const timeUntilExpiry = expiresAt - now;

      // 5-minute warning
      const fiveMinuteWarning = timeUntilExpiry - 5 * 60 * 1000;
      if (fiveMinuteWarning > 0) {
        setTimeout(() => {
          toast.warning("Your session will expire in 5 minutes", {
            action: {
              label: "Extend",
              onClick: () => extend(30),
            },
          });
        }, fiveMinuteWarning);
      }

      // 1-minute warning
      const oneMinuteWarning = timeUntilExpiry - 1 * 60 * 1000;
      if (oneMinuteWarning > 0) {
        warningTimeoutRef.current = setTimeout(() => {
          toast.error("Your session will expire in 1 minute!", {
            action: {
              label: "Extend Now",
              onClick: () => extend(30),
            },
          });
        }, oneMinuteWarning);
      }
    },
    [extend],
  );

  // Track user activity
  const trackActivity = useCallback(() => {
    setLastActivity(new Date());

    // Reset activity timeout
    clearTimeout(activityTimeoutRef.current!);
    activityTimeoutRef.current = setTimeout(() => {
      // Auto-refresh session on activity
      if (session && autoRefresh) {
        validateSession();
      }
    }, 30000); // 30 seconds after activity
  }, [session, autoRefresh, validateSession]);

  // Clear all timeouts
  const clearAllTimeouts = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
      activityTimeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
  }, []);

  // Setup activity listeners
  useEffect(() => {
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];

    const handleActivity = () => trackActivity();

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [trackActivity]);

  // Setup auto-refresh interval
  useEffect(() => {
    if (autoRefresh && session) {
      refreshIntervalRef.current = setInterval(() => {
        validateSession();
      }, refreshInterval);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, session, refreshInterval, validateSession]);

  // Initial session validation
  useEffect(() => {
    validateSession();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  // Handle visibility change (tab focus/blur)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && session) {
        // Validate session when tab becomes visible
        validateSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [session, validateSession]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (session) {
        validateSession();
      }
    };

    const handleOffline = () => {
      toast.warning("You are offline. Session validation paused.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [session, validateSession]);

  return {
    session,
    isLoading,
    isValidating,
    error,
    refresh,
    terminate,
    extend,
    validateSecurity: validateSession,
    registerDevice,
    getActiveSessions,
    terminateSession,
    getSecurityEvents,
  };
}

// Additional hooks for specific session management features

/**
 * Hook for monitoring session security events
 */
export function useSessionSecurity() {
  const [securityEvents, setSecurityEvents] = useState<SessionSecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSecurityEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(SESSION_API.security);

      if (!response.ok) {
        throw new Error("Failed to fetch security events");
      }

      const events = await response.json();
      setSecurityEvents(events);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSecurityEvents();
  }, [fetchSecurityEvents]);

  return {
    securityEvents,
    isLoading,
    error,
    refresh: fetchSecurityEvents,
  };
}

/**
 * Hook for managing user devices
 */
export function useDeviceManagement() {
  const [devices, setDevices] = useState<DeviceRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDevices = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(SESSION_API.devices);

      if (!response.ok) {
        throw new Error("Failed to fetch devices");
      }

      const deviceList = await response.json();
      setDevices(deviceList);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const trustDevice = useCallback(
    async (deviceId: string) => {
      try {
        const response = await fetch(`${SESSION_API.devices}/${deviceId}/trust`, {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to trust device");
        }

        await fetchDevices();
        toast.success("Device trusted successfully");
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        toast.error("Failed to trust device");
      }
    },
    [fetchDevices],
  );

  const revokeDevice = useCallback(
    async (deviceId: string) => {
      try {
        const response = await fetch(`${SESSION_API.devices}/${deviceId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to revoke device");
        }

        await fetchDevices();
        toast.success("Device revoked successfully");
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        toast.error("Failed to revoke device");
      }
    },
    [fetchDevices],
  );

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return {
    devices,
    isLoading,
    error,
    refresh: fetchDevices,
    trustDevice,
    revokeDevice,
  };
}

/**
 * Hook for session analytics and metrics
 */
export function useSessionAnalytics() {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/session/analytics");

      if (!response.ok) {
        throw new Error("Failed to fetch session metrics");
      }

      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();

    // Refresh metrics every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchMetrics]);

  return {
    metrics,
    isLoading,
    error,
    refresh: fetchMetrics,
  };
}
