/**
 * NeonPro Error Handling System
 * Comprehensive error classes for healthcare, compliance, and technical operations
 */

// Export all specific error classes
export {
  DatabaseError,
  ValidationError,
  ConflictError,
  NotFoundError,
  ComplianceError,
  // Re-exported base classes
  HealthcareError,
  GeneralHealthcareError,
  LGPDComplianceError,
  HealthcareErrorHandler,
} from './specific-errors'

// Export error mapping utilities
export {
  ErrorMapper,
  createRateLimitError,
  createConsentError,
  createAIServiceError,
  createDataProtectionError,
  type ErrorContext,
  type MappedError,
} from './error-mapper'

// Export base healthcare errors for backward compatibility
export * from './healthcare-errors'