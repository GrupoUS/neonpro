/**
 * Test Suite for Healthcare Errors Module
 * RED Phase: Define comprehensive test scenarios for healthcare error utilities
 */

import { describe, expect, it } from 'vitest';
import {
  createHealthcareError,
  formatHealthcareError,
  HealthcareAuthenticationError,
  HealthcareAuthorizationError,
  HealthcareComplianceError,
  HealthcareError,
  HealthcareSystemError,
  HealthcareValidationError,
  isHealthcareError,
  sanitizeErrorMessage,
  validateErrorCompliance,
} from '../../packages/utils/dist/healthcare-errors.js';
import { ErrorCategory, ErrorSeverity } from '../../src/middleware/error-handling';

describe('Healthcare Errors Module - RED Phase', () => {
  describe('HealthcareError base class', () => {
    it('should create a basic healthcare error with required properties', () => {
      const error = new HealthcareError(
        'Test error message',
        ErrorCategory.BUSINESS_LOGIC,
        ErrorSeverity.MEDIUM,
        { code: 'TEST_ERROR' },
      

      expect(error.message).toBe('Test error message')
      expect(error.category).toBe(ErrorCategory.BUSINESS_LOGIC
      expect(error.severity).toBe(ErrorSeverity.MEDIUM
      expect(error.code).toBe('TEST_ERROR')
      expect(error.healthcareContext).toBe(true);
      expect(error.lgpdCompliant).toBe(true);
      expect(error.timestamp).toBeInstanceOf(Date
    }

    it('should generate unique error IDs', () => {
      const error1 = new HealthcareError('Error 1')
      const error2 = new HealthcareError('Error 2')

      expect(error1.id).toBeDefined(
      expect(error2.id).toBeDefined(
      expect(error1.id).not.toBe(error2.id
    }

    it('should handle optional metadata', () => {
      const metadata = { patientId: '123', _userId: '456' };
      const error = new HealthcareError(
        'Error with metadata',
        ErrorCategory.BUSINESS_LOGIC,
        ErrorSeverity.HIGH,
        { metadata },
      

      expect(error.metadata).toEqual(metadata
    }

    it('should sanitize personal data in error messages', () => {
      const error = new HealthcareError(
        'Patient 123.456.789-00 has invalid CPF',
        ErrorCategory.VALIDATION,
        ErrorSeverity.LOW,
      

      expect(error.lgpdCompliant).toBe(false);
      expect(error.message).toContain('CPF')
    }
  }

  describe('HealthcareValidationError', () => {
    it('should create validation-specific errors', () => {
      const validationDetails = [
        { field: 'email', message: 'Invalid email format' },
        { field: 'cpf', message: 'Invalid CPF' },
      ];

      const error = new HealthcareValidationError(
        'Validation failed',
        validationDetails,
      

      expect(error.category).toBe(ErrorCategory.VALIDATION
      expect(error.severity).toBe(ErrorSeverity.LOW
      expect(error.validationDetails).toEqual(validationDetails
      expect(error.code).toBe('VALIDATION_ERROR')
    }

    it('should handle empty validation details', () => {
      const error = new HealthcareValidationError('No validation details')

      expect(error.validationDetails).toEqual([]
    }
  }

  describe('HealthcareAuthenticationError', () => {
    it('should create authentication-specific errors', () => {
      const error = new HealthcareAuthenticationError(
        'Invalid credentials',
        { _userId: 'user123' },
      

      expect(error.category).toBe(ErrorCategory.AUTHENTICATION
      expect(error.severity).toBe(ErrorSeverity.HIGH
      expect(error.code).toBe('AUTHENTICATION_FAILED')
    }

    it('should sanitize user IDs in metadata', () => {
      const error = new HealthcareAuthenticationError(
        'Login failed for user 123.456.789-00',
        { _userId: '123.456.789-00' },
      

      expect(error.lgpdCompliant).toBe(false);
    }
  }

  describe('HealthcareAuthorizationError', () => {
    it('should create authorization-specific errors', () => {
      const error = new HealthcareAuthorizationError(
        'Insufficient permissions',
        { requiredRole: 'doctor', userRole: 'nurse' },
      

      expect(error.category).toBe(ErrorCategory.AUTHORIZATION
      expect(error.severity).toBe(ErrorSeverity.HIGH
      expect(error.code).toBe('INSUFFICIENT_PERMISSIONS')
    }
  }

  describe('HealthcareComplianceError', () => {
    it('should create LGPD compliance errors', () => {
      const error = new HealthcareComplianceError(
        'LGPD consent required',
        'lgpd',
        { dataType: 'patient_record', operation: 'update' },
      

      expect(error.category).toBe(ErrorCategory.LGPD_COMPLIANCE
      expect(error.severity).toBe(ErrorSeverity.CRITICAL
      expect(error.complianceFramework).toBe('lgpd')
    }

    it('should create ANVISA compliance errors', () => {
      const error = new HealthcareComplianceError(
        'ANVISA regulation violation',
        'anvisa',
        { regulation: 'RDC 16/2013', violation: 'missing_documentation' },
      

      expect(error.complianceFramework).toBe('anvisa')
    }

    it('should create CFM compliance errors', () => {
      const error = new HealthcareComplianceError(
        'CFM ethical violation',
        'cfm',
        { ethicalCode: 'Article 5', violation: 'patient_confidentiality' },
      

      expect(error.complianceFramework).toBe('cfm')
    }
  }

  describe('HealthcareSystemError', () => {
    it('should create system-specific errors', () => {
      const cause = new Error('Database connection failed')
      const error = new HealthcareSystemError(
        'System unavailable',
        cause,
        { component: 'database', operation: 'connect' },
      

      expect(error.category).toBe(ErrorCategory.SYSTEM
      expect(error.severity).toBe(ErrorSeverity.CRITICAL
      expect(error.code).toBe('SYSTEM_ERROR')
      expect(error.cause).toBe(cause
    }
  }

  describe('Utility functions', () => {
    describe('createHealthcareError', () => {
      it('should create healthcare errors with proper defaults', () => {
        const error = createHealthcareError(
          'Test error',
          ErrorCategory.BUSINESS_LOGIC,
          ErrorSeverity.MEDIUM,
        

        expect(error).toBeInstanceOf(HealthcareError
        expect(error.healthcareContext).toBe(true);
        expect(error.lgpdCompliant).toBe(true);
      }

      it('should handle custom options', () => {
        const error = createHealthcareError(
          'Custom error',
          ErrorCategory.VALIDATION,
          ErrorSeverity.LOW,
          {
            code: 'CUSTOM_ERROR',
            metadata: { test: true },
          },
        

        expect(error.code).toBe('CUSTOM_ERROR')
        expect(error.metadata).toEqual({ test: true }
      }
    }

    describe('formatHealthcareError', () => {
      it('should format errors for user consumption', () => {
        const error = new HealthcareError(
          'Internal error message',
          ErrorCategory.SYSTEM,
          ErrorSeverity.HIGH,
        

        const formatted = formatHealthcareError(error

        expect(formatted).toHaveProperty('id')
        expect(formatted).toHaveProperty('message')
        expect(formatted).toHaveProperty('code')
        expect(formatted).toHaveProperty('category')
        expect(formatted).toHaveProperty('severity')
        expect(formatted).toHaveProperty('timestamp')
        expect(formatted).not.toHaveProperty('stack')
        expect(formatted).not.toHaveProperty('metadata')
      }

      it('should include stack trace in development mode', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        const error = new HealthcareError('Error with stack')
        const formatted = formatHealthcareError(error, { includeStack: true }

        expect(formatted.stack).toBeDefined(

        process.env.NODE_ENV = originalEnv;
      }

      it('should sanitize personal data in formatted output', () => {
        const error = new HealthcareError(
          'Patient 123.456.789-00 error',
          ErrorCategory.BUSINESS_LOGIC,
          ErrorSeverity.MEDIUM,
        

        const formatted = formatHealthcareError(error

        expect(formatted.message).not.toContain('123.456.789-00')
      }
    }

    describe('isHealthcareError', () => {
      it('should identify healthcare errors', () => {
        const healthcareError = new HealthcareError('Test')
        const regularError = new Error('Regular error')

        expect(isHealthcareError(healthcareError)).toBe(true);
        expect(isHealthcareError(regularError)).toBe(false);
      }
    }

    describe('sanitizeErrorMessage', () => {
      it('should remove personal data from error messages', () => {
        const message =
          'Patient 123.456.789-00 has email user@example.com and phone (11) 99999-9999';

        const sanitized = sanitizeErrorMessage(message

        expect(sanitized).not.toContain('123.456.789-00')
        expect(sanitized).not.toContain('user@example.com')
        expect(sanitized).not.toContain('(11) 99999-9999')
        expect(sanitized).toContain('Patient')
        expect(sanitized).toContain('has email')
        expect(sanitized).toContain('and phone')
      }

      it('should handle messages without personal data', () => {
        const message = 'Database connection failed';

        const sanitized = sanitizeErrorMessage(message

        expect(sanitized).toBe(message
      }
    }

    describe('validateErrorCompliance', () => {
      it('should validate LGPD compliance', () => {
        const compliantError = new HealthcareError('Generic error message')
        const nonCompliantError = new HealthcareError('Patient 123.456.789-00 has error')

        expect(validateErrorCompliance(compliantError, 'lgpd')).toBe(true);
        expect(validateErrorCompliance(nonCompliantError, 'lgpd')).toBe(false);
      }

      it('should validate ANVISA compliance', () => {
        const error = new HealthcareError('Medication error')

        expect(validateErrorCompliance(error, 'anvisa')).toBe(true);
      }

      it('should validate CFM compliance', () => {
        const error = new HealthcareError('Professional ethics violation')

        expect(validateErrorCompliance(error, 'cfm')).toBe(true);
      }

      it('should handle unknown compliance frameworks', () => {
        const error = new HealthcareError('Test error')

        expect(() => validateErrorCompliance(error, 'unknown')).toThrow(
      }
    }
  }

  describe('Error categorization and severity', () => {
    it('should properly categorize different error types', () => {
      const validationError = new HealthcareValidationError('Invalid input')
      const authError = new HealthcareAuthenticationError('Invalid token')
      const systemError = new HealthcareSystemError('Database down')

      expect(validationError.category).toBe(ErrorCategory.VALIDATION
      expect(authError.category).toBe(ErrorCategory.AUTHENTICATION
      expect(systemError.category).toBe(ErrorCategory.SYSTEM
    }

    it('should assign appropriate severity levels', () => {
      const lowSeverity = new HealthcareValidationError('Minor validation error')
      const highSeverity = new HealthcareAuthenticationError('Security breach')
      const criticalSeverity = new HealthcareSystemError('System crash')

      expect(lowSeverity.severity).toBe(ErrorSeverity.LOW
      expect(highSeverity.severity).toBe(ErrorSeverity.HIGH
      expect(criticalSeverity.severity).toBe(ErrorSeverity.CRITICAL
    }
  }

  describe('Healthcare-specific error scenarios', () => {
    it('should handle patient data errors', () => {
      const error = new HealthcareError(
        'Patient record not found',
        ErrorCategory.BUSINESS_LOGIC,
        ErrorSeverity.MEDIUM,
        { code: 'PATIENT_NOT_FOUND' },
      

      expect(error.healthcareContext).toBe(true);
      expect(error.lgpdCompliant).toBe(true);
    }

    it('should handle medical professional errors', () => {
      const error = new HealthcareError(
        'CRM verification failed',
        ErrorCategory.HEALTHCARE_COMPLIANCE,
        ErrorSeverity.HIGH,
        { code: 'INVALID_CRM' },
      

      expect(error.category).toBe(ErrorCategory.HEALTHCARE_COMPLIANCE
      expect(error.severity).toBe(ErrorSeverity.HIGH
    }

    it('should handle appointment scheduling errors', () => {
      const error = new HealthcareError(
        'Appointment conflict detected',
        ErrorCategory.BUSINESS_LOGIC,
        ErrorSeverity.MEDIUM,
        { code: 'APPOINTMENT_CONFLICT' },
      

      expect(error.code).toBe('APPOINTMENT_CONFLICT')
    }

    it('should handle medical record access errors', () => {
      const error = new HealthcareError(
        'Medical record access denied',
        ErrorCategory.AUTHORIZATION,
        ErrorSeverity.HIGH,
        { code: 'RECORD_ACCESS_DENIED' },
      

      expect(error.category).toBe(ErrorCategory.AUTHORIZATION
    }
  }

  describe('Error serialization and logging', () => {
    it('should serialize errors for logging', () => {
      const error = new HealthcareError(
        'Test error',
        ErrorCategory.SYSTEM,
        ErrorSeverity.HIGH,
        { metadata: { component: 'test' } },
      

      const serialized = error.toJSON(

      expect(serialized).toHaveProperty('id')
      expect(serialized).toHaveProperty('message')
      expect(serialized).toHaveProperty('category')
      expect(serialized).toHaveProperty('severity')
      expect(serialized).toHaveProperty('timestamp')
      expect(serialized).toHaveProperty('metadata')
    }

    it('should provide audit trail information', () => {
      const error = new HealthcareError(
        'Audit trail error',
        ErrorCategory.LGPD_COMPLIANCE,
        ErrorSeverity.CRITICAL,
      

      const auditInfo = error.getAuditInfo(

      expect(auditInfo).toHaveProperty('errorId')
      expect(auditInfo).toHaveProperty('category')
      expect(auditInfo).toHaveProperty('severity')
      expect(auditInfo).toHaveProperty('healthcareContext')
      expect(auditInfo).toHaveProperty('lgpdCompliant')
    }
  }
}
