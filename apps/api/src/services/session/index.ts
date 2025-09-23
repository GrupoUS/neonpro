/**
 * Session Services Index
 *
 * Exports all session-related services and utilities
 */

export { AgentSessionService } from "./agent-session-service";
export type {
  SessionConfig,
  SessionContext,
  SessionCreateOptions,
  SessionData,
} from "./agent-session-service";

// Default session configurations
export const DEFAULT_SESSION_CONFIG = {
  defaultExpirationMs: 24 * 60 * 60 * 1000, // 24 hours
  maxSessionLengthMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  cleanupIntervalMs: 15 * 60 * 1000, // 15 minutes
  maxConcurrentSessions: 10,
} as const;

// Healthcare-specific session configurations
export const HEALTHCARE_SESSION_CONFIG = {
  ...DEFAULT_SESSION_CONFIG,
  defaultExpirationMs: 4 * 60 * 60 * 1000, // 4 hours for healthcare
  maxConcurrentSessions: 5, // Lower limit for healthcare compliance
} as const;

// Session event types
export const SESSION_EVENTS = {
  CREATED: "session_created",
  UPDATED: "session_updated",
  EXPIRED: "session_expired",
  DELETED: "session_deleted",
  ACTIVITY: "session_activity",
  CLEANUP: "session_cleanup",
} as const;

// Helper functions for session management
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const isValidSessionId = (sessionId: string): boolean => {
  return /^session_\d+_[a-z0-9]{9}$/.test(sessionId);
};

export const formatSessionDuration = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

export const getSessionHealth = (
  session: SessionData,
): "healthy" | "expiring_soon" | "expired" => {
  const now = new Date();
  const expiresAt = new Date(session.expiresAt);
  const timeUntilExpiration = expiresAt.getTime() - now.getTime();

  if (timeUntilExpiration <= 0) {
    return "expired";
  } else if (timeUntilExpiration <= 5 * 60 * 1000) {
    // 5 minutes
    return "expiring_soon";
  } else {
    return "healthy";
  }
};
