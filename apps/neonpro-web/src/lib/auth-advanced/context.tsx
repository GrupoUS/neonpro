// Session Context Provider
// Story 1.4: Session Management & Security Implementation

"use client";

import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import type { DEFAULT_SESSION_CONFIG } from "./config";
import type { DeviceManager } from "./device-manager";
import type { SecurityMonitor } from "./security-monitor";
import type { SessionManager } from "./session-manager";
import type {
  DeviceRegistration,
  SessionConfig,
  SessionMetrics,
  SessionSecurityEvent,
  SessionState,
  SessionWebSocketEvent,
  UserSession,
} from "./types";
import type { AuthUtils } from "./utils";

// Session Context State
interface SessionContextState {
  // Session data
  currentSession: UserSession | null;
  activeSessions: UserSession[];
  sessionMetrics: SessionMetrics | null;

  // Security data
  securityEvents: SessionSecurityEvent[];
  riskScore: number;
  securityAlerts: SessionSecurityEvent[];

  // Device data
  currentDevice: DeviceRegistration | null;
  registeredDevices: DeviceRegistration[];

  // State flags
  isLoading: boolean;
  isConnected: boolean;
  lastActivity: Date | null;

  // Configuration
  config: SessionConfig;
}

// Session Actions
type SessionAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_CURRENT_SESSION"; payload: UserSession | null }
  | { type: "SET_ACTIVE_SESSIONS"; payload: UserSession[] }
  | { type: "SET_SESSION_METRICS"; payload: SessionMetrics }
  | { type: "ADD_SECURITY_EVENT"; payload: SessionSecurityEvent }
  | { type: "SET_SECURITY_EVENTS"; payload: SessionSecurityEvent[] }
  | { type: "SET_RISK_SCORE"; payload: number }
  | { type: "SET_SECURITY_ALERTS"; payload: SessionSecurityEvent[] }
  | { type: "SET_CURRENT_DEVICE"; payload: DeviceRegistration | null }
  | { type: "SET_REGISTERED_DEVICES"; payload: DeviceRegistration[] }
  | { type: "SET_CONNECTED"; payload: boolean }
  | { type: "UPDATE_ACTIVITY"; payload: Date }
  | { type: "UPDATE_CONFIG"; payload: Partial<SessionConfig> }
  | { type: "RESET_STATE" };

// Initial state
const initialState: SessionContextState = {
  currentSession: null,
  activeSessions: [],
  sessionMetrics: null,
  securityEvents: [],
  riskScore: 0,
  securityAlerts: [],
  currentDevice: null,
  registeredDevices: [],
  isLoading: false,
  isConnected: false,
  lastActivity: null,
  config: DEFAULT_SESSION_CONFIG,
};

// Session reducer
function sessionReducer(state: SessionContextState, action: SessionAction): SessionContextState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_CURRENT_SESSION":
      return { ...state, currentSession: action.payload };

    case "SET_ACTIVE_SESSIONS":
      return { ...state, activeSessions: action.payload };

    case "SET_SESSION_METRICS":
      return { ...state, sessionMetrics: action.payload };

    case "ADD_SECURITY_EVENT":
      return {
        ...state,
        securityEvents: [action.payload, ...state.securityEvents].slice(0, 100), // Keep last 100 events
      };

    case "SET_SECURITY_EVENTS":
      return { ...state, securityEvents: action.payload };

    case "SET_RISK_SCORE":
      return { ...state, riskScore: action.payload };

    case "SET_SECURITY_ALERTS":
      return { ...state, securityAlerts: action.payload };

    case "SET_CURRENT_DEVICE":
      return { ...state, currentDevice: action.payload };

    case "SET_REGISTERED_DEVICES":
      return { ...state, registeredDevices: action.payload };

    case "SET_CONNECTED":
      return { ...state, isConnected: action.payload };

    case "UPDATE_ACTIVITY":
      return { ...state, lastActivity: action.payload };

    case "UPDATE_CONFIG":
      return {
        ...state,
        config: { ...state.config, ...action.payload },
      };

    case "RESET_STATE":
      return { ...initialState };

    default:
      return state;
  }
}

// Session Context
interface SessionContextValue extends SessionContextState {
  // Session methods
  createSession: (userId: string, deviceInfo: any) => Promise<UserSession>;
  extendSession: (sessionId: string) => Promise<void>;
  terminateSession: (sessionId: string) => Promise<void>;
  terminateAllSessions: (userId: string) => Promise<void>;
  refreshSession: () => Promise<void>;

  // Security methods
  reportSecurityEvent: (event: Omit<SessionSecurityEvent, "id" | "created_at">) => Promise<void>;
  clearSecurityAlerts: () => void;
  updateRiskScore: () => Promise<void>;

  // Device methods
  registerDevice: (deviceInfo: any) => Promise<DeviceRegistration>;
  trustDevice: (deviceId: string) => Promise<void>;
  blockDevice: (deviceId: string) => Promise<void>;

  // Activity methods
  updateActivity: () => void;
  startHeartbeat: () => void;
  stopHeartbeat: () => void;

  // WebSocket methods
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;

  // Utility methods
  isSessionValid: () => boolean;
  getTimeUntilExpiry: () => number;
  formatSessionDuration: () => string;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

// Session Provider Props
interface SessionProviderProps {
  children: ReactNode;
  config?: Partial<SessionConfig>;
  userId?: string;
}

// Session Provider Component
export function SessionProvider({ children, config: customConfig, userId }: SessionProviderProps) {
  const [state, dispatch] = useReducer(sessionReducer, {
    ...initialState,
    config: { ...DEFAULT_SESSION_CONFIG, ...customConfig },
  });

  // Service instances
  const sessionManager = new SessionManager();
  const securityMonitor = new SecurityMonitor();
  const deviceManager = new DeviceManager();

  // WebSocket connection
  const [ws, setWs] = React.useState<WebSocket | null>(null);
  const [heartbeatInterval, setHeartbeatInterval] = React.useState<NodeJS.Timeout | null>(null);

  // Session methods
  const createSession = useCallback(
    async (userId: string, deviceInfo: any): Promise<UserSession> => {
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const session = await sessionManager.createSession(userId, deviceInfo);
        dispatch({ type: "SET_CURRENT_SESSION", payload: session });

        // Register device if not already registered
        const device = await deviceManager.registerDevice(userId, deviceInfo);
        dispatch({ type: "SET_CURRENT_DEVICE", payload: device });

        // Start monitoring
        startHeartbeat();
        connectWebSocket();

        return session;
      } catch (error) {
        console.error("Failed to create session:", error);
        throw error;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [],
  );

  const extendSession = useCallback(async (sessionId: string): Promise<void> => {
    try {
      const extendedSession = await sessionManager.extendSession(sessionId);
      dispatch({ type: "SET_CURRENT_SESSION", payload: extendedSession });
    } catch (error) {
      console.error("Failed to extend session:", error);
      throw error;
    }
  }, []);

  const terminateSession = useCallback(
    async (sessionId: string): Promise<void> => {
      try {
        await sessionManager.terminateSession(sessionId);

        if (state.currentSession?.id === sessionId) {
          dispatch({ type: "SET_CURRENT_SESSION", payload: null });
          stopHeartbeat();
          disconnectWebSocket();
        }

        // Refresh active sessions
        if (userId) {
          const activeSessions = await sessionManager.getActiveSessions(userId);
          dispatch({ type: "SET_ACTIVE_SESSIONS", payload: activeSessions });
        }
      } catch (error) {
        console.error("Failed to terminate session:", error);
        throw error;
      }
    },
    [state.currentSession?.id, userId],
  );

  const terminateAllSessions = useCallback(async (userId: string): Promise<void> => {
    try {
      await sessionManager.terminateAllSessions(userId);
      dispatch({ type: "SET_CURRENT_SESSION", payload: null });
      dispatch({ type: "SET_ACTIVE_SESSIONS", payload: [] });
      stopHeartbeat();
      disconnectWebSocket();
    } catch (error) {
      console.error("Failed to terminate all sessions:", error);
      throw error;
    }
  }, []);

  const refreshSession = useCallback(async (): Promise<void> => {
    if (!state.currentSession) return;

    try {
      const session = await sessionManager.getSession(state.currentSession.id);
      if (session) {
        dispatch({ type: "SET_CURRENT_SESSION", payload: session });
      } else {
        // Session no longer exists
        dispatch({ type: "SET_CURRENT_SESSION", payload: null });
        stopHeartbeat();
        disconnectWebSocket();
      }
    } catch (error) {
      console.error("Failed to refresh session:", error);
    }
  }, [state.currentSession]);

  // Security methods
  const reportSecurityEvent = useCallback(
    async (event: Omit<SessionSecurityEvent, "id" | "created_at">): Promise<void> => {
      try {
        const securityEvent = await securityMonitor.reportSecurityEvent(event);
        dispatch({ type: "ADD_SECURITY_EVENT", payload: securityEvent });

        // Update risk score
        await updateRiskScore();

        // Check if this is a high-risk event that should trigger alerts
        const severity = AuthUtils.SecurityEvent.classifyEventSeverity(event.event_type);
        if (severity === "high" || severity === "critical") {
          dispatch({
            type: "SET_SECURITY_ALERTS",
            payload: [securityEvent, ...state.securityAlerts],
          });
        }
      } catch (error) {
        console.error("Failed to report security event:", error);
        throw error;
      }
    },
    [state.securityAlerts],
  );

  const clearSecurityAlerts = useCallback((): void => {
    dispatch({ type: "SET_SECURITY_ALERTS", payload: [] });
  }, []);

  const updateRiskScore = useCallback(async (): Promise<void> => {
    if (!state.currentSession) return;

    try {
      const riskScore = await securityMonitor.calculateRiskScore(
        state.currentSession.user_id,
        state.currentSession.id,
      );
      dispatch({ type: "SET_RISK_SCORE", payload: riskScore });
    } catch (error) {
      console.error("Failed to update risk score:", error);
    }
  }, [state.currentSession]);

  // Device methods
  const registerDevice = useCallback(
    async (deviceInfo: any): Promise<DeviceRegistration> => {
      if (!userId) throw new Error("User ID is required");

      try {
        const device = await deviceManager.registerDevice(userId, deviceInfo);
        dispatch({ type: "SET_CURRENT_DEVICE", payload: device });

        // Refresh registered devices
        const devices = await deviceManager.getUserDevices(userId);
        dispatch({ type: "SET_REGISTERED_DEVICES", payload: devices });

        return device;
      } catch (error) {
        console.error("Failed to register device:", error);
        throw error;
      }
    },
    [userId],
  );

  const trustDevice = useCallback(
    async (deviceId: string): Promise<void> => {
      try {
        await deviceManager.trustDevice(deviceId);

        // Refresh registered devices
        if (userId) {
          const devices = await deviceManager.getUserDevices(userId);
          dispatch({ type: "SET_REGISTERED_DEVICES", payload: devices });
        }
      } catch (error) {
        console.error("Failed to trust device:", error);
        throw error;
      }
    },
    [userId],
  );

  const blockDevice = useCallback(
    async (deviceId: string): Promise<void> => {
      try {
        await deviceManager.blockDevice(deviceId);

        // Refresh registered devices
        if (userId) {
          const devices = await deviceManager.getUserDevices(userId);
          dispatch({ type: "SET_REGISTERED_DEVICES", payload: devices });
        }
      } catch (error) {
        console.error("Failed to block device:", error);
        throw error;
      }
    },
    [userId],
  );

  // Activity methods
  const updateActivity = useCallback((): void => {
    const now = new Date();
    dispatch({ type: "UPDATE_ACTIVITY", payload: now });

    // Update session activity if session exists
    if (state.currentSession) {
      sessionManager.updateActivity(state.currentSession.id).catch((error) => {
        console.error("Failed to update session activity:", error);
      });
    }
  }, [state.currentSession]);

  const startHeartbeat = useCallback((): void => {
    if (heartbeatInterval) return;

    const interval = setInterval(() => {
      updateActivity();
    }, state.config.heartbeatInterval);

    setHeartbeatInterval(interval);
  }, [heartbeatInterval, state.config.heartbeatInterval, updateActivity]);

  const stopHeartbeat = useCallback((): void => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      setHeartbeatInterval(null);
    }
  }, [heartbeatInterval]);

  // WebSocket methods
  const connectWebSocket = useCallback((): void => {
    if (ws || !state.config.realTime.enabled) return;

    try {
      const websocket = new WebSocket(state.config.realTime.websocketUrl);

      websocket.onopen = () => {
        console.log("WebSocket connected");
        dispatch({ type: "SET_CONNECTED", payload: true });

        // Subscribe to session events
        if (state.currentSession) {
          websocket.send(
            JSON.stringify({
              type: "subscribe",
              sessionId: state.currentSession.id,
              userId: state.currentSession.user_id,
            }),
          );
        }
      };

      websocket.onmessage = (event) => {
        try {
          const data: SessionWebSocketEvent = JSON.parse(event.data);
          handleWebSocketEvent(data);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      websocket.onclose = () => {
        console.log("WebSocket disconnected");
        dispatch({ type: "SET_CONNECTED", payload: false });
        setWs(null);

        // Attempt to reconnect after delay
        setTimeout(() => {
          if (state.currentSession) {
            connectWebSocket();
          }
        }, 5000);
      };

      websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      setWs(websocket);
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
    }
  }, [ws, state.config.realTime, state.currentSession]);

  const disconnectWebSocket = useCallback((): void => {
    if (ws) {
      ws.close();
      setWs(null);
      dispatch({ type: "SET_CONNECTED", payload: false });
    }
  }, [ws]);

  // Handle WebSocket events
  const handleWebSocketEvent = useCallback(
    (event: SessionWebSocketEvent): void => {
      switch (event.type) {
        case "session_updated":
          if (event.data.session) {
            dispatch({ type: "SET_CURRENT_SESSION", payload: event.data.session });
          }
          break;

        case "session_terminated":
          if (event.data.sessionId === state.currentSession?.id) {
            dispatch({ type: "SET_CURRENT_SESSION", payload: null });
            stopHeartbeat();
            disconnectWebSocket();
          }
          break;

        case "security_alert":
          if (event.data.securityEvent) {
            dispatch({ type: "ADD_SECURITY_EVENT", payload: event.data.securityEvent });
            dispatch({
              type: "SET_SECURITY_ALERTS",
              payload: [event.data.securityEvent, ...state.securityAlerts],
            });
          }
          break;

        case "risk_score_updated":
          if (typeof event.data.riskScore === "number") {
            dispatch({ type: "SET_RISK_SCORE", payload: event.data.riskScore });
          }
          break;

        case "device_blocked":
          if (event.data.deviceId === state.currentDevice?.id) {
            // Current device was blocked, terminate session
            if (state.currentSession) {
              terminateSession(state.currentSession.id);
            }
          }
          break;
      }
    },
    [state.currentSession, state.currentDevice, state.securityAlerts, terminateSession],
  );

  // Utility methods
  const isSessionValid = useCallback((): boolean => {
    if (!state.currentSession) return false;
    return AuthUtils.Session.isSessionValid(state.currentSession);
  }, [state.currentSession]);

  const getTimeUntilExpiry = useCallback((): number => {
    if (!state.currentSession) return 0;
    return AuthUtils.Session.getTimeUntilExpiry(state.currentSession);
  }, [state.currentSession]);

  const formatSessionDuration = useCallback((): string => {
    if (!state.currentSession) return "0s";
    const duration = AuthUtils.Session.getSessionDuration(state.currentSession);
    return AuthUtils.Format.formatDuration(duration);
  }, [state.currentSession]);

  // Initialize session data on mount
  useEffect(() => {
    if (userId && state.currentSession) {
      // Load active sessions
      sessionManager
        .getActiveSessions(userId)
        .then((sessions) => {
          dispatch({ type: "SET_ACTIVE_SESSIONS", payload: sessions });
        })
        .catch((error) => {
          console.error("Failed to load active sessions:", error);
        });

      // Load registered devices
      deviceManager
        .getUserDevices(userId)
        .then((devices) => {
          dispatch({ type: "SET_REGISTERED_DEVICES", payload: devices });
        })
        .catch((error) => {
          console.error("Failed to load registered devices:", error);
        });

      // Load security events
      securityMonitor
        .getSecurityEvents(userId, { limit: 50 })
        .then((events) => {
          dispatch({ type: "SET_SECURITY_EVENTS", payload: events });
        })
        .catch((error) => {
          console.error("Failed to load security events:", error);
        });

      // Update risk score
      updateRiskScore();
    }
  }, [userId, state.currentSession?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopHeartbeat();
      disconnectWebSocket();
    };
  }, []);

  // Context value
  const contextValue: SessionContextValue = {
    ...state,
    createSession,
    extendSession,
    terminateSession,
    terminateAllSessions,
    refreshSession,
    reportSecurityEvent,
    clearSecurityAlerts,
    updateRiskScore,
    registerDevice,
    trustDevice,
    blockDevice,
    updateActivity,
    startHeartbeat,
    stopHeartbeat,
    connectWebSocket,
    disconnectWebSocket,
    isSessionValid,
    getTimeUntilExpiry,
    formatSessionDuration,
  };

  return <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>;
}

// Hook to use session context
export function useSessionContext(): SessionContextValue {
  const context = useContext(SessionContext);

  if (context === undefined) {
    throw new Error("useSessionContext must be used within a SessionProvider");
  }

  return context;
}

// Export context for advanced usage
export { SessionContext };
