/**
 * Unified Security Base for NeonPro Platform
 *
 * Consolidates common security patterns, validation utilities,
 * and error handling across all security services.
 *
 * @version 2.0.0
 */

import { randomUUID, createHash } from '../crypto-utils'

// Common security interfaces
export interface SecurityResult {
  success: boolean
  error?: string
  errorCode?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  metadata?: Record<string, unknown>
}

export interface SecurityConfig {
  environment: 'development' | 'staging' | 'production'
  enableRateLimiting: boolean
  maxAuthAttempts: number
  rateLimitWindowMs: number
  enableAuditLogging: boolean
  strictMode: boolean
}

export interface ValidationContext {
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  userId?: string
  timestamp: number
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

// Common validation utilities
export class SecurityValidator {
  /**
   * Validate IP address format
   * @param ip - The IP address string to validate
   * @returns true if the IP address is valid IPv4 format, false otherwise
   */
  static isValidIP(ip: string): boolean {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    return ipv4Regex.test(ip)
  }

  /**
   * Extract IP subnet for mobile network tolerance
   * @param ip - The IP address to extract subnet from
   * @returns The first 3 octets of the IP address (subnet) or empty string if invalid
   */
  static extractIPSubnet(ip: string): string {
    if (!this.isValidIP(ip)) return ''
    const parts = ip.split('.')
    return parts.slice(0, 3).join('.')
  }

  /**
   * Validate session ID format and entropy
   * @param sessionId - The session ID to validate (must be 32-character hex string)
   * @returns SecurityResult indicating validation success/failure with severity level
   */
  static validateSessionId(sessionId: string): SecurityResult {
    // Check format (32 character hex string)
    if (!/^[a-f0-9]{32}$/i.test(sessionId)) {
      return {
        success: false,
        error: 'Invalid session ID format',
        errorCode: SECURITY_ERROR_CODES.VALIDATION_FAILED,
        severity: 'medium',
      }
    }

    // Check entropy
    const entropy = this.calculateEntropy(sessionId)
    if (entropy < 3.5) {
      return {
        success: false,
        error: 'Session ID entropy too low',
        errorCode: SECURITY_ERROR_CODES.VALIDATION_FAILED,
        severity: 'medium',
      }
    }

    return { success: true, severity: 'low' }
  }

  /**
   * Calculate entropy of a string
   * @param str - The input string to calculate entropy for
   * @returns The Shannon entropy value (higher values indicate more randomness)
   */
  static calculateEntropy(str: string): number {
    const chars = str.split('')
    const charCounts: { [key: string]: number } = {}

    chars.forEach(char => {
      charCounts[char] = (charCounts[char] || 0) + 1
    })

    const entropy = Object.values(charCounts).reduce((sum, count) => {
      const probability = count / chars.length
      return sum - probability * Math.log2(probability)
    }, 0)

    return entropy
  }

  /**
   * Generate secure random token with specified length
   * @param length - The desired length of the token (default: 32)
   * @returns A cryptographically secure random token string
   */
  static generateSecureToken(length: number = 32): string {
    return randomUUID().replace(/-/g, '').substring(0, length)
  }

  /**
   * Generate secure nonce
   * @param length - The desired length of the nonce (default: 16)
   * @returns A random alphanumeric nonce string
   */
  static generateNonce(length: number = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * Hash data for comparison
   * @param data - The data string to hash
   * @returns SHA-256 hex-encoded hash of the input data
   */
  static hashData(data: string): string {
    return createHash('sha256').update(data, 'utf8').digest('hex')
  }

  /**
   * Compare hashed data with plaintext
   * @param plaintext - The plaintext data to compare
   * @param hash - The hash to compare against
   * @returns true if the plaintext hash matches the provided hash, false otherwise
   */
  static compareHash(plaintext: string, hash: string): boolean {
    return this.hashData(plaintext) === hash
  }
}

// Enhanced rate limiting with security context
export class SecurityRateLimiter {
  private attempts = new Map<string, {
    count: number
    firstAttempt: number
    blockedUntil?: number
    context: ValidationContext
  }>()

  constructor(private config: SecurityConfig) {}

  /**
   * Check if request is allowed with security context
   * @param key - Unique identifier for rate limiting (e.g., user ID, IP address)
   * @param context - Security context with IP, user agent, and other metadata
   * @returns SecurityResult indicating if request is allowed or rate limited
   */
  checkLimit(key: string, context: ValidationContext): SecurityResult {
    if (!this.config.enableRateLimiting) {
      return { success: true, severity: 'low' }
    }

    const now = Date.now()
    const record = this.attempts.get(key)

    if (!record) {
      this.attempts.set(key, {
        count: 1,
        firstAttempt: now,
        context,
      })
      return { success: true, severity: 'low' }
    }

    // Check if currently blocked
    if (record.blockedUntil && record.blockedUntil > now) {
      return {
        success: false,
        error: 'Rate limit exceeded',
        errorCode: SECURITY_ERROR_CODES.RATE_LIMIT_EXCEEDED,
        severity: 'high',
        metadata: {
          resetTime: record.blockedUntil,
          attempts: record.count,
        },
      }
    }

    // Check if window has expired
    if (now - record.firstAttempt > this.config.rateLimitWindowMs) {
      this.attempts.set(key, {
        count: 1,
        firstAttempt: now,
        context,
      })
      return { success: true, severity: 'low' }
    }

    // Check if limit exceeded
    if (record.count >= this.config.maxAuthAttempts) {
      record.blockedUntil = now + this.config.rateLimitWindowMs
      return {
        success: false,
        error: 'Rate limit exceeded',
        errorCode: SECURITY_ERROR_CODES.RATE_LIMIT_EXCEEDED,
        severity: 'high',
        metadata: {
          resetTime: record.blockedUntil,
          attempts: record.count,
        },
      }
    }

    // Increment counter
    record.count++
    return { success: true, severity: 'low' }
  }

  /**
   * Get remaining attempts
   * @param key - Unique identifier to check remaining attempts for
   * @returns Number of attempts remaining before rate limit is triggered
   */
  getRemainingAttempts(key: string): number {
    const record = this.attempts.get(key)
    if (!record) return this.config.maxAuthAttempts

    return Math.max(0, this.config.maxAuthAttempts - record.count)
  }

  /**
   * Reset rate limit for a key
   * @param key - Unique identifier to reset rate limit for
   */
  reset(key: string): void {
    this.attempts.delete(key)
  }

  /**
   * Clean up expired records
   */
  cleanup(): void {
    const now = Date.now()
    const cutoffTime = now - (this.config.rateLimitWindowMs * 2)

    for (const [key, record] of this.attempts.entries()) {
      if (record.firstAttempt < cutoffTime) {
        this.attempts.delete(key)
      }
    }
  }
}

// Security event logging
export class SecurityEventLogger {
  private static instance: SecurityEventLogger

  static getInstance(): SecurityEventLogger {
    if (!SecurityEventLogger.instance) {
      SecurityEventLogger.instance = new SecurityEventLogger()
    }
    return SecurityEventLogger.instance
  }

  /**
   * Log security event
   * @param eventType - Type of security event (e.g., 'login_attempt', 'session_created')
   * @param severity - Event severity level
   * @param details - Detailed event information including user context and metadata
   */
  logEvent(
    eventType: string,
    severity: 'info' | 'warn' | 'error',
    details: SecurityEventDetails,
  ): void {
    const event: SecurityEvent = {
      id: SecurityValidator.generateSecureToken(),
      eventType,
      severity,
      timestamp: Date.now(),
      details,
    }

    // In production, this would integrate with the audit log system
    // For now, we use structured logging that respects security requirements
    if (process.env.NODE_ENV === 'production') {
      // Only log essential security events in production to avoid sensitive data exposure
      const sanitizedEvent = {
        id: event.id,
        eventType: event.eventType,
        severity: event.severity,
        timestamp: event.timestamp,
        action: event.details.action,
        result: event.details.result
      }
      // TODO: Integrate with proper audit log system (e.g., Winston, structured logging service)
      process.stdout.write(JSON.stringify(sanitizedEvent) + '\n')
    } else {
      // Development logging with full context for debugging
      process.stdout.write(`[${severity.toUpperCase()}] ${eventType}: ${JSON.stringify(event)}\n`)
    }
  }
}

// Security event types
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

// Export common utilities
export const securityValidator = SecurityValidator
export const securityEventLogger = SecurityEventLogger.getInstance()