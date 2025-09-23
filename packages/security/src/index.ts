/**
 * @neonpro/security - Security utilities and middleware for NeonPro
 * Provides encryption, authentication, authorization, and security middleware
 */

// Version export
export const SECURITY_VERSION = '1.0.0';

// Core encryption and key management
export { EncryptionManager, encryptionManager, KeyManager, keyManager } from './encryption';

// Audit logging
export {
  type AuditLogEntry,
  AuditLogger,
  auditLogger,
  type AuditLoggerOptions,
} from './audit/logger';

// Security utilities and validation
export { RateLimiter, rateLimiter, SecurityUtils, securityUtils, SecureLogger, secureLogger } from './utils';

// LGPD anonymization and data masking utilities
export {
  ANONYMIZATION_VERSION,
  type AnonymizationMetadata,
  anonymizePersonalData,
  DEFAULT_MASKING_OPTIONS,
  generatePrivacyReport,
  isDataAnonymized,
  type LGPDComplianceLevel,
  maskAddress,
  maskCNPJ,
  maskCPF,
  maskEmail,
  type MaskingOptions,
  maskName,
  maskPatientData,
  maskPhone,
  type PatientData,
} from './anonymization';

// Security middleware for Hono framework
export {
  authentication,
  authorization,
  csrfProtection,
  getProtectedRoutesMiddleware,
  getSecurityMiddlewareStack,
  healthcareDataProtection,
  inputValidation,
  rateLimiting,
  requestId,
  securityHeaders,
  securityLogging,
} from './middleware';

// Import required classes for default export
import { EncryptionManager, encryptionManager, KeyManager, keyManager } from './encryption';

import { RateLimiter, rateLimiter, SecurityUtils, securityUtils } from './utils';

// Named facade for common usage
export function maskSensitiveData(data: string, maskChar: string = '*') {
  return SecurityUtils.maskSensitiveData(data, maskChar);
}

import {
  authentication,
  authorization,
  csrfProtection,
  getProtectedRoutesMiddleware,
  getSecurityMiddlewareStack,
  healthcareDataProtection,
  inputValidation,
  rateLimiting,
  requestId,
  securityHeaders,
  securityLogging,
} from './middleware';

// Import anonymization utilities
import {
  ANONYMIZATION_VERSION,
  anonymizePersonalData,
  DEFAULT_MASKING_OPTIONS,
  generatePrivacyReport,
  maskPatientData,
} from './anonymization';

// Default export with all components
export default {
  version: SECURITY_VERSION,

  // Core classes
  EncryptionManager,
  KeyManager,
  SecurityUtils,
  RateLimiter,

  // Singleton instances
  encryptionManager,
  keyManager,
  securityUtils,
  rateLimiter,

  // Middleware functions
  securityHeaders,
  inputValidation,
  rateLimiting,
  csrfProtection,
  authentication,
  authorization,
  requestId,
  securityLogging,
  healthcareDataProtection,
  getSecurityMiddlewareStack,
  getProtectedRoutesMiddleware,

  // Convenience exports
  utils: {
    SecurityUtils,
    RateLimiter,
    securityUtils,
    rateLimiter,
  },

  encryption: {
    EncryptionManager,
    KeyManager,
    encryptionManager,
    keyManager,
  },

  middleware: {
    securityHeaders,
    inputValidation,
    rateLimiting,
    csrfProtection,
    authentication,
    authorization,
    requestId,
    securityLogging,
    healthcareDataProtection,
    getSecurityMiddlewareStack,
    getProtectedRoutesMiddleware,
  },

  // LGPD anonymization utilities
  anonymization: {
    maskPatientData,
    anonymizePersonalData,
    generatePrivacyReport,
    DEFAULT_MASKING_OPTIONS,
    ANONYMIZATION_VERSION,
  },
};

// Re-export Hono types for convenience
export type { Context, Next } from 'hono';
