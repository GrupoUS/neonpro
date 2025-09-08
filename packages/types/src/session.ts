/**
 * Session Types
 * Definições de tipos para gerenciamento de sessão
 */

export interface UserSession {
  id: string
  userId: string
  deviceId?: string
  ipAddress?: string
  userAgent?: string
  createdAt?: Date
  expiresAt?: Date
  lastActivity?: Date
  isActive?: boolean
}

export interface CreateSessionRequest {
  userId: string
  deviceId?: string
  ipAddress?: string
  userAgent?: string
  rememberMe?: boolean
}

export interface UpdateSessionRequest {
  lastActivity?: Date
  expiresAt?: Date
  metadata?: Record<string, unknown>
}

export interface DeviceRegistration {
  id: string
  userId: string
  deviceId: string
  deviceName?: string
  deviceType?: string
  isTrusted?: boolean
  lastUsed?: Date
  registeredAt?: Date
}

export interface SessionSecurityEvent {
  id: string
  sessionId: string
  eventType: SessionSecurityEventType
  severity: 'low' | 'medium' | 'high' | 'critical'
  details?: Record<string, unknown>
  timestamp: Date
  resolved?: boolean
}

export type SessionSecurityEventType =
  | 'suspicious_login'
  | 'multiple_failed_attempts'
  | 'unusual_location'
  | 'device_change'
  | 'concurrent_sessions'
  | 'session_hijack_attempt'
  | 'privilege_escalation'
  | 'data_access_violation'

export interface SessionAnalytics {
  totalSessions: number
  activeSessions: number
  averageSessionDuration: number
  securityEvents: number
  deviceCount: number
  lastActivity?: Date
}
