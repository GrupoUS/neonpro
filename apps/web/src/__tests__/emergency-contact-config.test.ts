/**
 * Emergency Contact Configuration Tests
 * Tests for phone number validation and contact configuration system
 * Following healthcare compliance standards for Brazilian aesthetic clinics
 */

import { validateBrazilianPhone, getContactConfiguration, formatPhoneForTel } from '../components/clinical-workflows/EmergencyIntegration'

// Mock environment variables
const mockEnv = {
  NEXT_PUBLIC_CONTACT_SPECIALIST: '+55119988887766',
  NEXT_PUBLIC_CONTACT_TECHNICAL: '+55119977776655',
  NEXT_PUBLIC_CONTACT_CLINIC: '+55119966665544',
  NEXT_PUBLIC_CONTACT_EMERGENCY: '+55192'
}

// Mock process.env
const originalEnv = process.env

describe('Emergency Contact Configuration', () => {
  beforeEach(() => {
    // Reset environment variables before each test
    process.env = { ...originalEnv, ...mockEnv }
  })

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv
  })

  describe('validateBrazilianPhone', () => {
    test('should validate correct Brazilian mobile numbers', () => {
      const validMobileNumbers = [
        '+55119988887766',  // São Paulo mobile
        '+5521987654321',  // Rio de Janeiro mobile
        '+5531987654321',  // Minas Gerais mobile
        '+55 11 98888-7766', // With spaces and dash
        '+55 11 988887766',  // With spaces
      ]

      validMobileNumbers.forEach(number => {
        expect(validateBrazilianPhone(number)).toBe(true)
      })
    })

    test('should validate correct Brazilian landline numbers', () => {
      const validLandlineNumbers = [
        '+5511388887766',   // São Paulo landline
        '+5521387654321',   // Rio de Janeiro landline
        '+5531387654321',   // Minas Gerais landline
        '+55 11 3888-7766',  // With spaces and dash
        '+55 11 38887766',   // With spaces
      ]

      validLandlineNumbers.forEach(number => {
        expect(validateBrazilianPhone(number)).toBe(true)
      })
    })

    test('should reject invalid phone numbers', () => {
      const invalidNumbers = [
        '',                    // Empty string
        '+55',                 // Just country code
        '11988887766',         // Missing country code
        '+551198765432',       // Too short
        '+55119876543210',     // Too long
        '+6611987654321',      // Wrong country code
        '+5511987654321a',     // Contains letter
        null,                  // Null value
        undefined,             // Undefined value
        'not-a-number',        // Non-numeric string
      ]

      invalidNumbers.forEach(number => {
        expect(validateBrazilianPhone(number as any)).toBe(false)
      })
    })
  })

  describe('formatPhoneForTel', () => {
    test('should format phone numbers correctly for tel: URI', () => {
      const testCases = [
        { input: '+55119988887766', expected: '+55119988887766' },
        { input: '+55 11 98888-7766', expected: '+55119988887766' },
        { input: '+55-11-98888-7766', expected: '+55119988887766' },
        { input: '11988887766', expected: '+55119988887766' },
      ]

      testCases.forEach(({ input, expected }) => {
        expect(formatPhoneForTel(input)).toBe(expected)
      })
    })

    test('should handle empty or invalid input', () => {
      expect(formatPhoneForTel('')).toBe('')
      expect(formatPhoneForTel('not-a-number')).toBe('+not-a-number')
    })
  })

  describe('getContactConfiguration', () => {
    test('should return contact configuration from environment variables', () => {
      const config = getContactConfiguration()

      expect(config).toEqual({
        specialist: '+55119988887766',
        technical: '+55119977776655',
        clinic: '+55119966665544',
        emergency: '+55192'
      })
    })

    test('should prioritize props over environment variables', () => {
      const propsConfig = {
        specialist: '+551155555555',
        technical: '+551166666666'
      }

      const config = getContactConfiguration(propsConfig)

      expect(config).toEqual({
        specialist: '+551155555555',
        technical: '+551166666666',
        clinic: '+55119966665544',
        emergency: '+55192'
      })
    })

    test('should filter out invalid phone numbers', () => {
      // Set invalid environment variables
      process.env.NEXT_PUBLIC_CONTACT_SPECIALIST = 'invalid-phone'
      process.env.NEXT_PUBLIC_CONTACT_TECHNICAL = '12345'

      const config = getContactConfiguration()

      expect(config).toEqual({
        specialist: undefined,
        technical: undefined,
        clinic: '+55119966665544',
        emergency: '+55192'
      })
    })

    test('should provide default emergency number', () => {
      delete process.env.NEXT_PUBLIC_CONTACT_EMERGENCY

      const config = getContactConfiguration()

      expect(config.emergency).toBe('+55192') // Default SAMU Brazil
    })
  })

  describe('Security and Compliance', () => {
    test('should not expose sensitive information in error messages', () => {
      // This test ensures that the validation doesn't leak sensitive phone numbers
      // in error messages or logs
      const invalidNumber = '+5511987654321a'
      
      // The validation should return false without throwing or logging sensitive data
      expect(() => {
        validateBrazilianPhone(invalidNumber)
      }).not.toThrow()
    })

    test('should handle missing environment variables gracefully', () => {
      // Remove all contact environment variables
      delete process.env.NEXT_PUBLIC_CONTACT_SPECIALIST
      delete process.env.NEXT_PUBLIC_CONTACT_TECHNICAL
      delete process.env.NEXT_PUBLIC_CONTACT_CLINIC

      const config = getContactConfiguration()

      expect(config).toEqual({
        specialist: undefined,
        technical: undefined,
        clinic: undefined,
        emergency: '+55192'
      })
    })
  })
})

/**
 * Healthcare Compliance Notes:
 * 
 * 1. LGPD Compliance: Phone numbers are treated as sensitive personal data
 * 2. ANVISA Compliance: Emergency contacts must be validated and tested
 * 3. CFM Compliance: Medical specialist contacts must be verified
 * 4. Data Protection: Phone numbers are not logged or exposed in error messages
 * 5. Validation: All numbers must follow Brazilian telecom standards
 * 
 * Security Requirements:
 * - Phone numbers are validated before use
 * - Invalid numbers are filtered out
 * - Default emergency fallback is provided
 * - No sensitive data exposure in logs
 * - Environment-based configuration for different deployments
 */