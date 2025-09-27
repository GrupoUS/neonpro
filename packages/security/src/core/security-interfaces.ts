/**
 * Security Interfaces and Common Types
 *
 * Shared interfaces, types, and constants used across all security services.
 *
 * @version 2.0.0
 */

// Common security result interface
export interface SecurityResult {
  success: boolean
  error?: string
  errorCode?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  metadata?: Record<string, unknown>
}

// Security configuration interface
export interface SecurityConfig {
  environment: 'development' | 'staging' | 'production'
  enableRateLimiting: boolean
  maxAuthAttempts: number
  rateLimitWindowMs: number
  enableAuditLogging: boolean
  strictMode: boolean
}

// Validation context interface
export interface ValidationContext {
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  userId?: string
  timestamp: number
}

// Security event interfaces
export interface SecurityEventDetails {
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  action: string
  resource?: string
  result: 'success' | 'failure' | 'blocked'
  reason?: string
  metadata?: Record<string, unknown>
}

export interface SecurityEvent {
  id: string
  eventType: string
  severity: 'info' | 'warn' | 'error'
  timestamp: number
  details: SecurityEventDetails
}

// Common security error codes
export const SECURITY_ERROR_CODES = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  AUTHORIZATION_FAILED: 'AUTHORIZATION_FAILED',
  SECURITY_VIOLATION: 'SECURITY_VIOLATION',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
} as const