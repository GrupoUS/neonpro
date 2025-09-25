/**
 * Security Utilities Package Exports
 *
 * Comprehensive security features for healthcare applications:
 * - Cryptographic operations
 * - Data masking and anonymization
 * - Security audit logging
 * - Input validation and sanitization
 * - Session management
 * - Password utilities
 * - Security headers
 *
 * @version 2.0.0
 * @author NeonPro Development Team
 * Compliance: LGPD, ANVISA, Healthcare Standards
 */

// Core security services
export {
  CryptoService,
  DataMaskingService,
  SecurityAuditLogger,
  InputValidationService,
  SessionManager,
  defaultCryptoService,
  defaultDataMaskingService,
  defaultSecurityAuditLogger,
  defaultInputValidationService,
  defaultSessionManager,
  createHealthcareSecurityServices,
  generateSecurePassword,
  validatePasswordStrength,
  createSecurityHeaders,
} from './security-utils'

// Type exports
export type {
  HashAlgorithm,
  EncryptionAlgorithm,
  MaskingStrategy,
  SecurityAuditEvent,
  SecurityEventType,
  ValidationResult,
  SessionConfig,
  SessionData,
} from './security-utils'

// Type exports for convenience
export type {
  HashAlgorithm as CryptoHashAlgorithm,
  EncryptionAlgorithm as CryptoEncryptionAlgorithm,
  SecurityAuditEvent as SecurityAuditLog,
  SessionData as UserSession,
  ValidationResult as InputValidationResult,
}