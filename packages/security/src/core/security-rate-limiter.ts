/**
 * Security Rate Limiting
 *
 * Enhanced rate limiting with security context for NeonPro Platform.
 *
 * @version 2.0.0
 */

import { SecurityConfig, SecurityResult, ValidationContext, SECURITY_ERROR_CODES } from './security-interfaces'

/**
 * Enhanced rate limiting with security context
 */
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
      return this.initializeNewRecord(key, context, now)
    }

    const blockCheck = this.checkIfCurrentlyBlocked(record, now)
    if (!blockCheck.success) {
      return blockCheck
    }

    const windowCheck = this.checkAndResetExpiredWindow(key, record, context, now)
    if (windowCheck) {
      return windowCheck
    }

    const limitCheck = this.checkAndEnforceRateLimit(record, now)
    if (!limitCheck.success) {
      return limitCheck
    }

    // Increment counter and allow request
    record.count++
    return { success: true, severity: 'low' }
  }

  /**
   * Initialize a new rate limiting record for a key
   * @param key - Unique identifier for rate limiting
   * @param context - Security context with IP, user agent, and other metadata
   * @param now - Current timestamp
   * @returns SecurityResult allowing the first request
   */
  private initializeNewRecord(key: string, context: ValidationContext, now: number): SecurityResult {
    this.attempts.set(key, {
      count: 1,
      firstAttempt: now,
      context,
    })
    return { success: true, severity: 'low' }
  }

  /**
   * Check if the record is currently blocked due to rate limiting
   * @param record - The existing rate limit record
   * @param now - Current timestamp
   * @returns SecurityResult indicating if blocked or null if not blocked
   */
  private checkIfCurrentlyBlocked(record: {
    count: number
    firstAttempt: number
    blockedUntil?: number
    context: ValidationContext
  }, now: number): SecurityResult {
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
    return { success: true, severity: 'low' }
  }

  /**
   * Check if rate limiting window has expired and reset if necessary
   * @param key - Unique identifier for rate limiting
   * @param record - The existing rate limit record
   * @param context - Security context
   * @param now - Current timestamp
   * @returns SecurityResult if window was reset, null if window is still active
   */
  private checkAndResetExpiredWindow(
    key: string,
    record: { count: number; firstAttempt: number; blockedUntil?: number; context: ValidationContext },
    context: ValidationContext,
    now: number
  ): SecurityResult | null {
    if (now - record.firstAttempt > this.config.rateLimitWindowMs) {
      this.attempts.set(key, {
        count: 1,
        firstAttempt: now,
        context,
      })
      return { success: true, severity: 'low' }
    }
    return null
  }

  /**
   * Check if rate limit is exceeded and apply blocking if necessary
   * @param record - The existing rate limit record
   * @param now - Current timestamp
   * @returns SecurityResult indicating if limit is exceeded
   */
  private checkAndEnforceRateLimit(record: {
    count: number
    firstAttempt: number
    blockedUntil?: number
    context: ValidationContext
  }, now: number): SecurityResult {
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