/**
 * Unified Security Base for NeonPro Platform
 *
 * Consolidates common security patterns, validation utilities,
 * and error handling across all security services.
 *
 * @version 2.0.0
 */

import { randomUUID, createHash } from 'crypto'

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
   */
  static isValidIP(ip: string): boolean {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    return ipv4Regex.test(ip)
  }

  /**
   * Extract IP subnet for mobile network tolerance
   */
  static extractIPSubnet(ip: string): string {
    if (!this.isValidIP(ip)) return ''
    const parts = ip.split('.')
    return parts.slice(0, 3).join('.')
  }

  /**
   * Validate session ID format and entropy
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
   */
  static generateSecureToken(length: number = 32): string {
    return randomUUID().replace(/-/g, '').substring(0, length)
  }

  /**
   * Generate secure nonce
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
   */
  static hashData(data: string): string {
    return createHash('sha256').update(data, 'utf8').digest('hex')
  }

  /**
   * Compare hashed data with plaintext
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
   */
  getRemainingAttempts(key: string): number {
    const record = this.attempts.get(key)
    if (!record) return this.config.maxAuthAttempts

    return Math.max(0, this.config.maxAuthAttempts - record.count)
  }

  /**
   * Reset rate limit for a key
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
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(event))
    } else {
      console.log(`[${severity.toUpperCase()}] ${eventType}:`, event)
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