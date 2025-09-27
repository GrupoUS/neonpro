/**
 * Unified Security Base for NeonPro Platform
 *
 * Main export file for all security components. This file serves as a convenience
 * barrel export after splitting large classes into focused modules.
 *
 * @version 2.0.0
 */

// Re-export all interfaces and types
export * from './security-interfaces'

// Re-export all classes
export { SecurityValidator } from './security-validator'
export { SecurityRateLimiter } from './security-rate-limiter'
export { SecurityEventLogger } from './security-event-logger'

// Export convenient instances
export { SecurityValidator as securityValidator } from './security-validator'

// Export singleton instance
import { SecurityEventLogger } from './security-event-logger'
export const securityEventLogger = SecurityEventLogger.getInstance()
