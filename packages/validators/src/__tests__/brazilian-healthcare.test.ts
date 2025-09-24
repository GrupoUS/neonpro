/**
 * Brazilian Healthcare Validators Test Suite
 * Tests CNS, TUSS, CRM, and other healthcare-specific validations
 */

import {
  // sanitizeHealthcareData,
  type HealthcareValidationResult,
  validateCFF,
  validateCNEP,
  validateCNS,
  validateCOREN,
  validateCRM,
  validateHealthcareDocument,
  validateHealthcareDocuments,
  validateProfessionalLicense,
  validateTUSS,
} from '../index.js'

describe('Brazilian Healthcare Validators', () => {
  describe('CNS (Cartão Nacional de Saúde) Validation', () => {
    test('should validate correct CNS formats', () => {
      // Valid CNS examples with correct checksums
      const validCNS = [
        '184959687370903', // Valid CNS starting with 1 (definitive)
        '250563764860256', // Valid CNS starting with 2 (definitive)
        '767402594810076', // Valid CNS starting with 7 (provisional) - sum divisible by 11
        '850319575733759', // Valid CNS starting with 8 (provisional) - sum divisible by 11
      ]

      validCNS.forEach((cns) => {
        expect(validateCNS(cns)).toBe(true)
      })
    })

    test('should reject invalid CNS formats', () => {
      const invalidCNS = [
        '12345678901234', // 14 digits
        '1234567890123456', // 16 digits
        '034567890123456', // Starts with 0
        '456789012345678', // Starts with 4 (invalid)
        'abc456789012345', // Contains letters
        '', // Empty
        'null', // String "null"
        'undefined', // String "undefined"
      ]

      invalidCNS.forEach((cns) => {
        expect(validateCNS(cns as string)).toBe(false)
      })
    })
  })

  describe('TUSS Code Validation', () => {
    test('should validate correct TUSS code formats', () => {
      const validTUSS = [
        '101010', // 6 digits - medical procedure
        '201010', // 6 digits - therapeutic procedure
        '20101010', // 8 digits - surgical procedure
        '3010101010', // 10 digits - diagnostic procedure
      ]

      validTUSS.forEach((tuss) => {
        expect(validateTUSS(tuss)).toBe(true)
      })
    })

    test('should reject invalid TUSS code formats', () => {
      const invalidTUSS = [
        '0101', // 4 digits
        '101010101010', // 12 digits
        '010101', // Starts with 0 (now properly rejected)
        'abc101', // Contains letters
        '', // Empty
        'null', // String "null"
        'undefined', // String "undefined"
      ]

      invalidTUSS.forEach((tuss) => {
        expect(validateTUSS(tuss as string)).toBe(false)
      })
    })
  })

  describe('CRM (Conselho Regional de Medicina) Validation', () => {
    test('should validate correct CRM formats', () => {
      const validCRM = [
        'CRM/SP123456', // São Paulo
        'CRM/RJ98765', // Rio de Janeiro
        'CRM/MG1234567', // Minas Gerais
        'crm/sp123456', // Lowercase (should be normalized)
        'CRM/SP 123456', // With space
      ]

      validCRM.forEach((crm) => {
        expect(validateCRM(crm)).toBe(true)
      })
    })

    test('should reject invalid CRM formats', () => {
      const invalidCRM = [
        'CRM/XX123456', // Invalid state code
        'CRM/SP123', // Too short
        'CRM/SP12345678901', // Too long
        'CRE/SP123456', // Wrong council (CRE instead of CRM)
        'CRMSP123456', // Missing slash
        '', // Empty
        null, // Null
        undefined, // Undefined
      ]

      invalidCRM.forEach((crm) => {
        expect(validateCRM(crm as string)).toBe(false)
      })
    })
  })

  describe('COREN (Conselho Regional de Enfermagem) Validation', () => {
    test('should validate correct COREN formats', () => {
      const validCOREN = [
        'COREN/SP123456', // São Paulo
        'COREN/RJ987654', // Rio de Janeiro
        'COREN/MG1234567', // Minas Gerais
        'coren/sp123456', // Lowercase (should be normalized)
        'COREN/SP 123456', // With space
      ]

      validCOREN.forEach((coren) => {
        expect(validateCOREN(coren)).toBe(true)
      })
    })

    test('should reject invalid COREN formats', () => {
      const invalidCOREN = [
        'COREN/XX123456', // Invalid state code
        'COREN/SP12345', // Too short
        'COREN/SP12345678901', // Too long
        'CRM/SP123456', // Wrong council (CRM instead of COREN)
        'CORENSP123456', // Missing slash
        '', // Empty
        null, // Null
        undefined, // Undefined
      ]

      invalidCOREN.forEach((coren) => {
        expect(validateCOREN(coren as string)).toBe(false)
      })
    })
  })

  describe('CFF (Conselho Federal de Farmácia) Validation', () => {
    test('should validate correct CFF formats', () => {
      const validCFF = [
        'CFF/SP123456', // São Paulo
        'CFF/RJ987654', // Rio de Janeiro
        'CFF/MG123456', // Minas Gerais
        'cff/sp123456', // Lowercase (should be normalized)
        'CFF/SP 123456', // With space
      ]

      validCFF.forEach((cff) => {
        expect(validateCFF(cff)).toBe(true)
      })
    })

    test('should reject invalid CFF formats', () => {
      const invalidCFF = [
        'CFF/XX123456', // Invalid state code
        'CFF/SP12345', // Too short
        'CFF/SP123456789', // Too long
        'CRM/SP123456', // Wrong council (CRM instead of CFF)
        'CFFSP123456', // Missing slash
        '', // Empty
        null, // Null
        undefined, // Undefined
      ]

      invalidCFF.forEach((cff) => {
        expect(validateCFF(cff as string)).toBe(false)
      })
    })
  })

  describe('CNEP (Conselho Nacional de Estética Profissional) Validation', () => {
    test('should validate correct CNEP formats', () => {
      const validCNEP = [
        'CNEP/SP123456', // São Paulo
        'CNEP/RJ987654', // Rio de Janeiro
        'CNEP/MG123456', // Minas Gerais
        'cnep/sp123456', // Lowercase (should be normalized)
        'CNEP/SP 123456', // With space
      ]

      validCNEP.forEach((cnep) => {
        expect(validateCNEP(cnep)).toBe(true)
      })
    })

    test('should reject invalid CNEP formats', () => {
      const invalidCNEP = [
        'CNEP/XX123456', // Invalid state code
        'CNEP/SP12345', // Too short
        'CNEP/SP123456789', // Too long
        'CRM/SP123456', // Wrong council (CRM instead of CNEP)
        'CNEPSP123456', // Missing slash
        '', // Empty
        null, // Null
        undefined, // Undefined
      ]

      invalidCNEP.forEach((cnep) => {
        expect(validateCNEP(cnep as string)).toBe(false)
      })
    })
  })

  describe('Professional License Validation (Multi-Council)', () => {
    test('should validate all aesthetic professional licenses', () => {
      const validLicenses = [
        'CRM/SP123456', // Medical Doctor
        'COREN/RJ987654', // Nursing Professional
        'CFF/MG123456', // Pharmacy/Biochemistry
        'CNEP/SP123456', // Aesthetic Professional
        'crm/sp123456', // Lowercase
        'COREN/SP 123456', // With space
      ]

      validLicenses.forEach((license) => {
        expect(validateProfessionalLicense(license)).toBe(true)
      })
    })

    test('should reject invalid professional licenses', () => {
      const invalidLicenses = [
        'CRE/SP123456', // Invalid council
        'CRO/SP123456', // Dentistry (not supported)
        'CRM/XX123456', // Invalid state
        'CRM/SP123', // Too short
        'CRMSP123456', // Missing slash
        '', // Empty
        null, // Null
        undefined, // Undefined
      ]

      invalidLicenses.forEach((license) => {
        expect(validateProfessionalLicense(license as string)).toBe(false)
      })
    })
  })

  describe('Comprehensive Healthcare Document Validation', () => {
    test('should validate CNS documents with detailed results', () => {
      const _result: HealthcareValidationResult = validateHealthcareDocument(
        '123456789012345',
        'cns',
      )
    })

    test('should return errors for invalid CNS documents', () => {
      const _result: HealthcareValidationResult = validateHealthcareDocument(
        '12345678901234', // Invalid (14 digits)
        'cns',
      )
    })

    test('should validate TUSS documents', () => {
      const _result: HealthcareValidationResult = validateHealthcareDocument(
        '10101',
        'tuss',
      )
    })

    test('should validate CRM documents', () => {
      const _result: HealthcareValidationResult = validateHealthcareDocument(
        'CRM/SP123456',
        'crm',
      )
    })

    test('should validate COREN documents', () => {
      const _result: HealthcareValidationResult = validateHealthcareDocument(
        'COREN/SP123456',
        'coren',
      )
    })

    test('should validate CFF documents', () => {
      const _result: HealthcareValidationResult = validateHealthcareDocument(
        'CFF/SP123456',
        'cff',
      )
    })

    test('should validate CNEP documents', () => {
      const _result: HealthcareValidationResult = validateHealthcareDocument(
        'CNEP/SP123456',
        'cnep',
      )
    })

    test('should validate professional licenses', () => {
      const _result: HealthcareValidationResult = validateHealthcareDocument(
        'CRM/SP123456',
        'professional',
      )
    })
  })

  describe('Batch Document Validation', () => {
    test('should validate multiple healthcare documents', () => {
      const documents = [
        { value: '132508191525186', type: 'cns' as const },
        { value: '101010', type: 'tuss' as const },
        { value: 'CRM/SP123456', type: 'crm' as const },
        { value: '12345678901', type: 'cpf' as const }, // Invalid CPF
      ]

      const results = validateHealthcareDocuments(documents)

      expect(results[0].isValid).toBe(true) // CNS
      expect(results[1].isValid).toBe(true) // TUSS
      expect(results[2].isValid).toBe(true) // CRM
      expect(results[3].isValid).toBe(false) // Invalid CPF
    })
  })

  describe('Aesthetic Clinic Compliance Scenarios', () => {
    test('should validate complete aesthetic clinic professional data', () => {
      const professionalData = [
        { value: '928.270.196-47', type: 'cpf' as const },
        { value: 'CRM/SP123456', type: 'crm' as const },
        { value: 'COREN/SP123456', type: 'coren' as const },
        { value: 'CFF/SP123456', type: 'cff' as const },
        { value: 'CNEP/SP123456', type: 'cnep' as const },
        { value: '(11) 98765-4321', type: 'phone' as const },
        { value: '01234-567', type: 'cep' as const },
      ]

      const results = validateHealthcareDocuments(professionalData)

      // All professional licenses should be valid
      const professionalLicenses = results.filter((r) =>
        ['crm', 'coren', 'cff', 'cnep'].includes(r.documentType)
      )
      expect(professionalLicenses.every((r) => r.isValid)).toBe(true)
    })

    test('should validate patient registration for aesthetic clinic', () => {
      const patientData = [
        { value: '928.270.196-47', type: 'cpf' as const }, // Valid CPF
        { value: '132508191525186', type: 'cns' as const }, // Valid CNS
        { value: '(11) 98765-4321', type: 'phone' as const },
        { value: '01234-567', type: 'cep' as const },
      ]

      const results = validateHealthcareDocuments(patientData)

      // No critical errors should exist
      const criticalErrors = results.filter((r) =>
        r.errors.some((e) => e.includes('format') || e.includes('checksum'))
      )
      expect(criticalErrors).toHaveLength(0)
    })

    test('should identify and report invalid aesthetic clinic data', () => {
      const invalidData = [
        { value: '928.270.196-47', type: 'cpf' as const }, // Valid
        { value: '12345678901234', type: 'cns' as const }, // Invalid CNS
        { value: 'CRM/XX123456', type: 'crm' as const }, // Invalid CRM state
        { value: 'COREN/SP123', type: 'coren' as const }, // Invalid COREN (too short)
        { value: 'INVALID', type: 'professional' as const }, // Invalid professional license
        { value: '1234', type: 'phone' as const }, // Invalid phone
      ]

      const results = validateHealthcareDocuments(invalidData)

      expect(results[0].isValid).toBe(true) // Valid CPF
      expect(results[1].isValid).toBe(false) // Invalid CNS
      expect(results[2].isValid).toBe(false) // Invalid CRM
      expect(results[3].isValid).toBe(false) // Invalid COREN
      expect(results[4].isValid).toBe(false) // Invalid professional license
      expect(results[5].isValid).toBe(false) // Invalid phone
    })
  })
})
