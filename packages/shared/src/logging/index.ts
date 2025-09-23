/**
 * Logging utilities and exports for healthcare applications
 */

export {
  createHealthcareLogger,
  databaseLogger,
  apiLogger,
  securityLogger,
  auditLogger,
  logAuditEvent,
  logHealthcareError,
  logPerformanceMetric,
} from './healthcare-logger';

// Convenience re-exports
export * from './healthcare-logger';

// Default export for easy importing
export { default as healthcareLogger } from './healthcare-logger';