/**
 * Logging utilities and exports for healthcare applications
 */

export {
  apiLogger,
  auditLogger,
  createHealthcareLogger,
  databaseLogger,
  logAuditEvent,
  logHealthcareError,
  logPerformanceMetric,
  securityLogger,
} from './healthcare-logger';

// Convenience re-exports
export * from './healthcare-logger';

// Default export for easy importing
export { default as healthcareLogger } from './healthcare-logger';
