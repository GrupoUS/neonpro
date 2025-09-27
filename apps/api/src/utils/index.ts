// API Utilities Index
// Centralized exports for all API utility modules

// Healthcare validation and helpers
export { BrazilianHealthcareSchemas } from './brazilian-healthcare-validation'
export { HealthcareAppointmentHelper } from './healthcare-helpers'
export { PatientDataHelper } from './healthcare-helpers'
export { LGPDComplianceValidator } from './lgpd-compliance-validator'

// LGPD compliance exports
export {
  type DataProcessingRecord,
  type LGPDAuditEvent,
  type LGPDComplianceStatus,
  LGPDDataCategory,
  LGPDDataSubjectRights,
  LGPDLegalBasis,
  LGPDProcessingPurpose,
} from './lgpd-compliance-validator'

// Security and privacy utilities
export { HealthcareLogger as HealthcareErrorLogger } from '../logging/healthcare-logger'
export { CryptographicAuditLogger as CryptoAudit, cryptographicAuditLogger } from './crypto-audit'
export { PrivacyAlgorithms } from './privacy-algorithms'
export { SecureLogger } from './secure-logger'

// Error handling and responses
export {
  createErrorHandler,
  type ErrorContext,
  ErrorHandler,
  type ErrorHandlerConfig,
  type ErrorRecoveryStrategy,
  type ErrorResponse,
  HandleErrors,
  withErrorHandling,
} from './error-handler'
export {
  AppointmentSchedulingError,
  BrazilianRegulatoryError,
  ExternalHealthcareServiceError,
  HealthcareAuthenticationError,
  HealthcareAuthorizationError,
  HealthcareDataIntegrityError,
  HealthcareError,
  LGPDComplianceError,
  PatientDataValidationError,
} from './healthcare-errors'
export {
  badRequest,
  created,
  forbidden,
  notFound,
  ok,
  serverError,
  success,
  unauthorized,
} from './responses'
export type { ApiResponseFormat } from './responses'

// Helper functions for response creation
export const createSuccessResponse = (data: any, status: number = 200) => ({ data, status })
export const createErrorResponse = (code: string, message: string, details?: any) => ({
  error: { code, message, details },
})
export {
  HealthcareBundleAnalyzer as BundleOptimizer,
  healthcareBundleAnalyzer,
  healthcarePerformanceMonitor,
} from './bundle-optimizer'
export {
  ConnectionPoolMonitor,
  HealthcareQueryOptimizer as HealthcarePerformance,
  InMemoryQueryCache,
} from './healthcare-performance'
export {
  healthcareOptimizer,
  poolOptimizer,
  queryMonitor,
  QueryPerformanceMonitor as QueryOptimizer,
} from './query-optimizer'

// Data handling and sanitization
export { sanitizeForAI } from './sanitize'
export { redact } from './sanitize'
export { SecretManager } from './secret-manager'

// Backup and disaster recovery
export {
  type BackupConfig,
  type BackupJob,
  BackupManager,
  createBackupManager,
  type RecoveryPlan,
  type RecoveryStep,
} from './backup-manager'

// Configuration management
export {
  type ConfigChangeEvent,
  ConfigManager,
  type ConfigManagerOptions,
  type ConfigSchema,
  createConfigManager,
  HealthcareConfigSchemas,
} from './config-manager'

// Observability and monitoring
export {
  type Alert,
  type AlertRule,
  createObservabilityManager,
  type HealthCheck,
  type HealthStatus,
  type MetricDefinition,
  type MetricValue,
  ObservabilityManager,
  type ObservabilityManagerOptions,
  type PerformanceTrace,
  timeOperation,
  withTrace,
} from './observability-manager'

// Monitoring integration
export {
  createMonitoringIntegration,
  DEFAULT_MONITORING_CONFIGS,
  type MonitoringConfig,
  type MonitoringContext,
  MonitoringIntegration,
} from './monitoring-integration'

// Appointment management
export { hasConflict } from './appointments'

// Type definitions for utilities
export type { HealthcareValidationResult } from './brazilian-healthcare-validation'
export type { HealthcareError as HealthcareErrorType } from './healthcare-errors'
export type { HealthcareErrorDetails } from './healthcare-errors'
export type { ApiResponseFormat } from './responses'

// Utility collections for easy import
export const HealthcareUtils = {
  validation: BrazilianHealthcareSchemas,
  helpers: HealthcareAppointmentHelper,
  compliance: LGPDComplianceValidator,
  errors: HealthcareError,
  performance: HealthcarePerformance,
  logger: HealthcareErrorLogger,
}

export const SecurityUtils = {
  audit: CryptoAudit,
  privacy: PrivacyAlgorithms,
  logger: SecureLogger,
  secrets: SecretManager,
  errorHandling: { ErrorHandler, createErrorHandler },
}

export const ApiUtils = {
  responses: { badRequest, unauthorized, forbidden, notFound, serverError, success, ok, created },
  sanitizer: { sanitizeForAI, redact },
  optimizer: QueryOptimizer,
  appointments: { hasConflict },
}

export const InfrastructureUtils = {
  backup: { BackupManager, createBackupManager },
  config: { ConfigManager, createConfigManager, HealthcareConfigSchemas },
  observability: { ObservabilityManager, createObservabilityManager, withTrace, timeOperation },
  monitoring: { MonitoringIntegration, createMonitoringIntegration, DEFAULT_MONITORING_CONFIGS },
}
