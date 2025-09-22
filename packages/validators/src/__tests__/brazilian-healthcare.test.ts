/**
 * Brazilian Healthcare Validators Test Suite
 * Tests CNS, TUSS, CRM, and other healthcare-specific validations
 */

import { 
  validateCNS, 
  validateTUSS, 
  validateCRM, 
  validateHealthcareDocument,
  validateHealthcareDocuments,
  sanitizeHealthcareData,
  type HealthcareValidationResult
} from '../index.js';

describe('Brazilian Healthcare Validators_, () => {
  describe('CNS (Cartão Nacional de Saúde) Validation', () => {
    test('should validate correct CNS formats_, () => {
      // Valid CNS examples (these are test patterns, not real CNS numbers)
      const validCNS = [
        '123456789012345', // 15 digits
        '715 123456789 12', // With spaces
        '823-456-789-012-345', // With hyphens
        '912345678901234' // Starts with valid digit
      ];

      validCNS.forEach(cns => {
        expect(validateCNS(cns)).toBe(true);
      });
    });

    test('should reject invalid CNS formats_, () => {
      const invalidCNS = [
        '12345678901234', // 14 digits
        '1234567890123456', // 16 digits
        '034567890123456', // Starts with 0
        '456789012345678', // Starts with 4 (invalid)
        'abc456789012345', // Contains letters
        '', // Empty
        null, // Null
        undefined // Undefined
      ];

      invalidCNS.forEach(cns => {
        expect(validateCNS(cns as string)).toBe(false);
      });
    });
  });

  describe('TUSS Code Validation_, () => {
    test('should validate correct TUSS code formats_, () => {
      const validTUSS = [
        '10101', // 5 digits - medical procedure
        '20101010', // 8 digits - surgical procedure  
        '3010101010', // 10 digits - diagnostic procedure
        '40101-01', // With hyphen
        '50 101 01' // With spaces
      ];

      validTUSS.forEach(tuss => {
        expect(validateTUSS(tuss)).toBe(true);
      });
    });

    test('should reject invalid TUSS code formats_, () => {
      const invalidTUSS = [
        '0101', // 4 digits
        '101010101010', // 12 digits
        '010101', // Starts with 0
        'abc101', // Contains letters
        '', // Empty
        null, // Null
        undefined // Undefined
      ];

      invalidTUSS.forEach(tuss => {
        expect(validateTUSS(tuss as string)).toBe(false);
      });
    });
  });

  describe('CRM (Conselho Regional de Medicina) Validation', () => {
    test('should validate correct CRM formats_, () => {
      const validCRM = [
        'CRM/SP123456', // São Paulo
        'CRM/RJ98765', // Rio de Janeiro
        'CRM/MG1234567', // Minas Gerais
        'crm/sp123456', // Lowercase (should be normalized)
        'CRM/SP 123456' // With space
      ];

      validCRM.forEach(crm => {
        expect(validateCRM(crm)).toBe(true);
      });
    });

    test('should reject invalid CRM formats_, () => {
      const invalidCRM = [
        'CRM/XX123456', // Invalid state code
        'CRM/SP123', // Too short
        'CRM/SP12345678901', // Too long
        'CRE/SP123456', // Wrong council (CRE instead of CRM)
        'CRMSP123456', // Missing slash
        '', // Empty
        null, // Null
        undefined // Undefined
      ];

      invalidCRM.forEach(crm => {
        expect(validateCRM(crm as string)).toBe(false);
      });
    });
  });

  describe('Comprehensive Healthcare Document Validation_, () => {
    test('should validate CNS documents with detailed results_, () => {
      const result: HealthcareValidationResult = validateHealthcareDocument(
        '123456789012345', 
        'cns'
      );

      expect(result.isValid).toBe(true);
      expect(result.documentType).toBe('cns');
      expect(result.value).toBe('123456789012345');
      expect(result.normalized).toBe('123456789012345');
      expect(result.errors).toHaveLength(0);
    });

    test('should return errors for invalid CNS documents_, () => {
      const result: HealthcareValidationResult = validateHealthcareDocument(
        '12345678901234', // Invalid (14 digits)
        'cns'
      );

      expect(result.isValid).toBe(false);
      expect(result.documentType).toBe('cns');
      expect(result.errors).toContain('Invalid CNS format or checksum');
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should validate TUSS documents_, () => {
      const result: HealthcareValidationResult = validateHealthcareDocument(
        '10101', 
        'tuss'
      );

      expect(result.isValid).toBe(true);
      expect(result.documentType).toBe('tuss');
      expect(result.normalized).toBe('10101');
    });

    test('should validate CRM documents_, () => {
      const result: HealthcareValidationResult = validateHealthcareDocument(
        'CRM/SP123456', 
        'crm'
      );

      expect(result.isValid).toBe(true);
      expect(result.documentType).toBe('crm');
      expect(result.normalized).toBe('CRM/SP123456');
    });
  });

  describe('Batch Document Validation_, () => {
    test('should validate multiple healthcare documents_, () => {
      const documents = [
        { value: '123456789012345', type: 'cns' as const },
        { value: '10101', type: 'tuss' as const },
        { value: 'CRM/SP123456', type: 'crm' as const },
        { value: '12345678901', type: 'cpf' as const }, // Invalid CPF
      ];

      const results = validateHealthcareDocuments(documents);

      expect(results).toHaveLength(4);
      expect(results[0].isValid).toBe(true); // CNS
      expect(results[1].isValid).toBe(true); // TUSS
      expect(results[2].isValid).toBe(true); // CRM
      expect(results[3].isValid).toBe(false); // Invalid CPF
    });
  });

  describe('Healthcare Data Sanitization_, () => {
    test('should sanitize CPF for safe logging_, () => {
      const sanitized = sanitizeHealthcareData('123.456.789-01', 'cpf');
      expect(sanitized).toBe('123.456.*-01');
    });

    test('should sanitize CNS for safe logging_, () => {
      const sanitized = sanitizeHealthcareData('123 45678901 23', 'cns');
      expect(sanitized).toBe('123 4567*-23');
    });

    test('should sanitize phone numbers for safe logging_, () => {
      const sanitized = sanitizeHealthcareData('(11) 98765-4321', 'phone');
      expect(sanitized).toBe('(11) 987*-21');
    });

    test('should sanitize emails for safe logging_, () => {
      const sanitized = sanitizeHealthcareData('patient@example.com', 'email');
      expect(sanitized).toBe('pat***@example.com');
    });

    test('should return redacted for unknown data types_, () => {
      const sanitized = sanitizeHealthcareData('sensitive data', 'unknown' as any);
      expect(sanitized).toBe('[REDACTED]');
    });
  });

  describe('Error Handling_, () => {
    test('should handle null/undefined inputs gracefully_, () => {
      const nullResult = validateHealthcareDocument(null as any, 'cns');
      const undefinedResult = validateHealthcareDocument(undefined as any, 'cns');

      expect(nullResult.isValid).toBe(false);
      expect(undefinedResult.isValid).toBe(false);
      expect(nullResult.errors.length).toBeGreaterThan(0);
      expect(undefinedResult.errors.length).toBeGreaterThan(0);
    });

    test('should handle unsupported document types_, () => {
      const result = validateHealthcareDocument('123456', 'unsupported' as any);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unsupported document type');
    });
  });

  describe('Healthcare Compliance Scenarios_, () => {
    test('should validate complete patient registration data_, () => {
      const patientData = [
        { value: '123.456.789-01', type: 'cpf' as const },
        { value: '715 123456789 12', type: 'cns' as const },
        { value: 'CRM/SP123456', type: 'crm' as const },
        { value: '(11) 98765-4321', type: 'phone' as const },
        { value: '01234-567', type: 'cep' as const },
      ];

      const results = validateHealthcareDocuments(patientData);
      
      // All valid documents should pass
      const validResults = results.filter(r => r.isValid);
      expect(validResults.length).toBe(5);
      
      // No critical errors should exist
      const criticalErrors = results.filter(r => 
        r.errors.some(e => e.includes('format') || e.includes('checksum'))
      );
      expect(criticalErrors.length).toBe(0);
    });

    test('should identify and report invalid healthcare data_, () => {
      const invalidData = [
        { value: '123.456.789-01', type: 'cpf' as const }, // Valid
        { value: '12345678901234', type: 'cns' as const }, // Invalid CNS
        { value: 'CRM/XX123456', type: 'crm' as const }, // Invalid CRM state
        { value: '1234', type: 'phone' as const }, // Invalid phone
      ];

      const results = validateHealthcareDocuments(invalidData);
      
      // Should identify exactly 3 invalid documents
      const invalidResults = results.filter(r => !r.isValid);
      expect(invalidResults.length).toBe(3);
      
      // Each invalid result should have meaningful error messages
      invalidResults.forEach(result => {
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0]).toMatch(/Invalid|format|checksum|state/i);
      });
    });
  });
});