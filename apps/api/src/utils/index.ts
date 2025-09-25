// API Utilities Index
// Centralized exports for all API utility modules

// Healthcare validation and helpers
export { BrazilianHealthcareValidator } from './brazilian-healthcare-validation';
export { HealthcareAppointmentHelper } from './healthcare-helpers';
export { LGPDComplianceHelper } from './lgpd-compliance-validator';
export { PatientDataHelper } from './healthcare-helpers';

// Security and privacy utilities
export { CryptoAudit } from './crypto-audit';
export { PrivacyAlgorithms } from './privacy-algorithms';
export { SecureLogger } from './secure-logger';

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
  ExternalHealthcareServiceError,
  HealthcareLogger
} from './healthcare-errors';
export type { ApiResponseFormat } from './responses';

// Helper functions for response creation
export const createSuccessResponse = (data: any, status: number = 200) => ({ data, status });
export const createErrorResponse = (code: string, message: string, details?: any) => ({ error: { code, message, details } });
export { QueryOptimizer } from './query-optimizer';
export { BundleOptimizer } from './bundle-optimizer';
export { HealthcarePerformance } from './healthcare-performance';

// Data handling and sanitization
export { sanitizeForAI } from './sanitize';
export { redact } from './sanitize';
export { SecretManager } from './secret-manager';

// Appointment management
export { hasConflict } from './appointments';

// Type definitions for utilities
export type { HealthcareValidationResult } from './brazilian-healthcare-validation';
export type { HealthcareError as HealthcareErrorType } from './healthcare-errors';
export type { ApiResponseFormat } from './responses';

// Utility collections for easy import
export const HealthcareUtils = {
  validation: BrazilianHealthcareValidator,
  helpers: HealthcareAppointmentHelper,
  compliance: LGPDComplianceHelper,
  errors: HealthcareError,
  performance: HealthcarePerformance,
};

export const SecurityUtils = {
  audit: CryptoAudit,
  privacy: PrivacyAlgorithms,
  logger: SecureLogger,
  secrets: SecretManager,
};

export const ApiUtils = {
  responses: { badRequest, unauthorized, forbidden, notFound, serverError, success, ok, created },
  sanitizer: { sanitizeForAI, redact },
  optimizer: QueryOptimizer,
  appointments: { hasConflict },
};