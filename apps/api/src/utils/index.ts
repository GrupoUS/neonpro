// API Utilities Index
// Centralized exports for all API utility modules

// Healthcare validation and helpers
export { BrazilianHealthcareSchemas } from './brazilian-healthcare-validation';
export { HealthcareAppointmentHelper } from './healthcare-helpers';
export { LGPDComplianceValidator } from './lgpd-compliance-validator';
export { PatientDataHelper } from './healthcare-helpers';

// LGPD compliance exports
export {
  LGPDLegalBasis,
  LGPDDataCategory,
  LGPDDataSubjectRights,
  LGPDProcessingPurpose,
  type DataProcessingRecord,
  type LGPDAuditEvent,
  type LGPDComplianceStatus,
} from './lgpd-compliance-validator';

// Security and privacy utilities
export { CryptographicAuditLogger as CryptoAudit, cryptographicAuditLogger } from './crypto-audit';
export { PrivacyAlgorithms } from './privacy-algorithms';
export { SecureLogger } from './secure-logger';
export { HealthcareLogger as HealthcareErrorLogger } from './healthcare-errors';

// Error handling and responses
export { badRequest, unauthorized, forbidden, notFound, serverError, success, ok, created } from './responses';
export {
  HealthcareError,
  HealthcareAuthenticationError,
  HealthcareAuthorizationError,
  LGPDComplianceError,
  BrazilianRegulatoryError,
  PatientDataValidationError,
  AppointmentSchedulingError,
  HealthcareDataIntegrityError,
  ExternalHealthcareServiceError
} from './healthcare-errors';
export { 
  ErrorHandler, 
  createErrorHandler, 
  withErrorHandling, 
  HandleErrors,
  type ErrorContext,
  type ErrorResponse,
  type ErrorHandlerConfig,
  type ErrorRecoveryStrategy
} from './error-handler';
export type { ApiResponseFormat } from './responses';

// Helper functions for response creation
export const createSuccessResponse = (data: any, status: number = 200) => ({ data, status });
export const createErrorResponse = (code: string, message: string, details?: any) => ({ error: { code, message, details } });
export { QueryPerformanceMonitor as QueryOptimizer, queryMonitor, poolOptimizer, healthcareOptimizer } from './query-optimizer';
export { HealthcareBundleAnalyzer as BundleOptimizer, healthcareBundleAnalyzer, healthcarePerformanceMonitor } from './bundle-optimizer';
export { HealthcareQueryOptimizer as HealthcarePerformance, ConnectionPoolMonitor, InMemoryQueryCache } from './healthcare-performance';

// Data handling and sanitization
export { sanitizeForAI } from './sanitize';
export { redact } from './sanitize';
export { SecretManager } from './secret-manager';

// Backup and disaster recovery
export { 
  BackupManager, 
  createBackupManager,
  type BackupConfig,
  type BackupJob,
  type RecoveryPlan,
  type RecoveryStep
} from './backup-manager';

// Configuration management
export { 
  ConfigManager, 
  createConfigManager,
  HealthcareConfigSchemas,
  type ConfigSchema,
  type ConfigChangeEvent,
  type ConfigManagerOptions
} from './config-manager';

// Observability and monitoring
export { 
  ObservabilityManager, 
  createObservabilityManager,
  withTrace,
  timeOperation,
  type MetricDefinition,
  type MetricValue,
  type HealthCheck,
  type HealthStatus,
  type AlertRule,
  type Alert,
  type PerformanceTrace,
  type ObservabilityManagerOptions
} from './observability-manager';

// Monitoring integration
export { 
  MonitoringIntegration, 
  createMonitoringIntegration,
  DEFAULT_MONITORING_CONFIGS,
  type MonitoringConfig,
  type MonitoringContext
} from './monitoring-integration';

// Appointment management
export { hasConflict } from './appointments';

// Type definitions for utilities
export type { HealthcareValidationResult } from './brazilian-healthcare-validation';
export type { HealthcareError as HealthcareErrorType } from './healthcare-errors';
export type { ApiResponseFormat } from './responses';
export type { HealthcareErrorDetails } from './healthcare-errors';

// Utility collections for easy import
export const HealthcareUtils = {
  validation: BrazilianHealthcareSchemas,
  helpers: HealthcareAppointmentHelper,
  compliance: LGPDComplianceValidator,
  errors: HealthcareError,
  performance: HealthcarePerformance,
  logger: HealthcareErrorLogger,
};

export const SecurityUtils = {
  audit: CryptoAudit,
  privacy: PrivacyAlgorithms,
  logger: SecureLogger,
  secrets: SecretManager,
  errorHandling: { ErrorHandler, createErrorHandler },
};

export const ApiUtils = {
  responses: { badRequest, unauthorized, forbidden, notFound, serverError, success, ok, created },
  sanitizer: { sanitizeForAI, redact },
  optimizer: QueryOptimizer,
  appointments: { hasConflict },
};

export const InfrastructureUtils = {
  backup: { BackupManager, createBackupManager },
  config: { ConfigManager, createConfigManager, HealthcareConfigSchemas },
  observability: { ObservabilityManager, createObservabilityManager, withTrace, timeOperation },
  monitoring: { MonitoringIntegration, createMonitoringIntegration, DEFAULT_MONITORING_CONFIGS },
};