/**
 * Security Event Logging
 *
 * Security event logging system for NeonPro Platform.
 *
 * @version 2.0.0
 */

import { SecurityEvent, SecurityEventDetails } from './security-interfaces'
import { SecurityValidator } from './security-validator'

/**
 * Security event logging with production-safe structured logging
 */
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