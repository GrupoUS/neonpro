/**
 * Core Utilities Import Validation Tests
 *
 * RED-002: Core Utilities Import Validation Test
 * Validates that all utility modules can be imported correctly from index.ts
 */

import { beforeEach, describe, expect, it } from '@jest/globals'

// Test imports from the new utils index
import {
  type ApiResponseFormat,
  ApiUtils,
  // Error handling and responses
  badRequest,
  // Healthcare validation and helpers
  BrazilianHealthcareValidator,
  BundleOptimizer,
  created,
  // Security and privacy utilities
  CryptoAudit,
  forbidden,
  // Appointment management
  hasConflict,
  HealthcareAppointmentHelper,
  HealthcareAuthenticationError,
  HealthcareError,
  type HealthcareError as HealthcareErrorType,
  HealthcarePerformance,
  // Utility collections
  HealthcareUtils,
  // Type exports
  type HealthcareValidationResult,
  LGPDComplianceError,
  LGPDComplianceHelper,
  notFound,
  ok,
  PatientDataHelper,
  PrivacyAlgorithms,
  // Performance and optimization
  QueryOptimizer,
  redact,
  // Data handling and sanitization
  sanitizeForAI,
  SecureLogger,
  SecurityUtils,
  serverError,
  success,
  unauthorized,
} from '../utils'

describe('Core Utilities Import Validation', () => {
  describe('Healthcare Utilities', () => {
    it('should import BrazilianHealthcareValidator', () => {
      expect(BrazilianHealthcareValidator).toBeDefined()
      expect(typeof BrazilianHealthcareValidator).toBe('function')
    })

    it('should import HealthcareAppointmentHelper', () => {
      expect(HealthcareAppointmentHelper).toBeDefined()
      expect(typeof HealthcareAppointmentHelper).toBe('function')
    })

    it('should import LGPDComplianceHelper', () => {
      expect(LGPDComplianceHelper).toBeDefined()
      expect(typeof LGPDComplianceHelper).toBe('function')
    })

    it('should import PatientDataHelper', () => {
      expect(PatientDataHelper).toBeDefined()
      expect(typeof PatientDataHelper).toBe('function')
    })

    it('should provide HealthcareUtils collection', () => {
      expect(HealthcareUtils).toBeDefined()
      expect(HealthcareUtils.validation).toBe(BrazilianHealthcareValidator)
      expect(HealthcareUtils.helpers).toBe(HealthcareAppointmentHelper)
      expect(HealthcareUtils.compliance).toBe(LGPDComplianceHelper)
    })
  })

  describe('Security Utilities', () => {
    it('should import CryptoAudit', () => {
      expect(CryptoAudit).toBeDefined()
      expect(typeof CryptoAudit).toBe('function')
    })

    it('should import PrivacyAlgorithms', () => {
      expect(PrivacyAlgorithms).toBeDefined()
      expect(typeof PrivacyAlgorithms).toBe('function')
    })

    it('should import SecureLogger', () => {
      expect(SecureLogger).toBeDefined()
      expect(typeof SecureLogger).toBe('function')
    })

    it('should provide SecurityUtils collection', () => {
      expect(SecurityUtils).toBeDefined()
      expect(SecurityUtils.audit).toBe(CryptoAudit)
      expect(SecurityUtils.privacy).toBe(PrivacyAlgorithms)
      expect(SecurityUtils.logger).toBe(SecureLogger)
    })
  })

  describe('Response Utilities', () => {
    it('should import all response helper functions', () => {
      expect(badRequest).toBeDefined()
      expect(unauthorized).toBeDefined()
      expect(forbidden).toBeDefined()
      expect(notFound).toBeDefined()
      expect(serverError).toBeDefined()
      expect(success).toBeDefined()
      expect(ok).toBeDefined()
      expect(created).toBeDefined()

      // Verify they are functions
      expect(typeof badRequest).toBe('function')
      expect(typeof unauthorized).toBe('function')
      expect(typeof forbidden).toBe('function')
      expect(typeof notFound).toBe('function')
      expect(typeof serverError).toBe('function')
      expect(typeof success).toBe('function')
      expect(typeof ok).toBe('function')
      expect(typeof created).toBe('function')
    })

    it('should provide ApiUtils collection', () => {
      expect(ApiUtils).toBeDefined()
      expect(ApiUtils.responses).toBeDefined()
      expect(ApiUtils.responses.badRequest).toBe(badRequest)
      expect(ApiUtils.responses.unauthorized).toBe(unauthorized)
    })
  })

  describe('Error Handling', () => {
    it('should import healthcare error classes', () => {
      expect(HealthcareError).toBeDefined()
      expect(HealthcareAuthenticationError).toBeDefined()
      expect(LGPDComplianceError).toBeDefined()

      // Verify they are constructor functions
      expect(typeof HealthcareError).toBe('function')
      expect(typeof HealthcareAuthenticationError).toBe('function')
      expect(typeof LGPDComplianceError).toBe('function')

      // Verify inheritance
      const error = new HealthcareError('Test error')
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(HealthcareError)
    })
  })

  describe('Data Handling', () => {
    it('should import sanitization functions', () => {
      expect(sanitizeForAI).toBeDefined()
      expect(redact).toBeDefined()
      expect(typeof sanitizeForAI).toBe('function')
      expect(typeof redact).toBe('function')
    })
  })

  describe('Performance Utilities', () => {
    it('should import performance optimization classes', () => {
      expect(QueryOptimizer).toBeDefined()
      expect(BundleOptimizer).toBeDefined()
      expect(HealthcarePerformance).toBeDefined()

      expect(typeof QueryOptimizer).toBe('function')
      expect(typeof BundleOptimizer).toBe('function')
      expect(typeof HealthcarePerformance).toBe('function')
    })
  })

  describe('Appointment Utilities', () => {
    it('should import appointment conflict detection', () => {
      expect(hasConflict).toBeDefined()
      expect(typeof hasConflict).toBe('function')
    })
  })

  describe('Type Exports', () => {
    it('should export types without runtime errors', () => {
      // This test ensures that type exports don't cause runtime errors
      expect(() => {
        // These type imports should not cause runtime errors
        type TestValidationResult = HealthcareValidationResult
        type TestHealthcareError = HealthcareErrorType
        type TestApiResponseFormat = ApiResponseFormat

        // If we get here without errors, types are properly exported
        expect(true).toBe(true)
      }).not.toThrow()
    })
  })

  describe('Import Consistency', () => {
    it('should maintain consistent import patterns', () => {
      // Verify that all imported utilities are properly defined
      const imports = [
        BrazilianHealthcareValidator,
        HealthcareAppointmentHelper,
        LGPDComplianceHelper,
        PatientDataHelper,
        CryptoAudit,
        PrivacyAlgorithms,
        SecureLogger,
        badRequest,
        unauthorized,
        HealthcareError,
        sanitizeForAI,
        redact,
        QueryOptimizer,
        hasConflict,
      ]

      imports.forEach(imported => {
        expect(imported).toBeDefined()
        expect(typeof imported).toBe('function')
      })
    })

    it('should provide utility collections with expected structure', () => {
      // Verify collection structure
      expect(HealthcareUtils).toHaveProperty('validation')
      expect(HealthcareUtils).toHaveProperty('helpers')
      expect(HealthcareUtils).toHaveProperty('compliance')

      expect(SecurityUtils).toHaveProperty('audit')
      expect(SecurityUtils).toHaveProperty('privacy')
      expect(SecurityUtils).toHaveProperty('logger')

      expect(ApiUtils).toHaveProperty('responses')
      expect(ApiUtils).toHaveProperty('sanitizer')
      expect(ApiUtils).toHaveProperty('optimizer')
    })
  })
})
