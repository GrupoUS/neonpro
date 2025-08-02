import { describe, test, expect } from '@jest/globals'
import { 
  cpfSchema, 
  phoneSchema, 
  personalDataSchema, 
  treatmentSchema,
  financialDataSchema,
  validateData,
  healthcareValidators 
} from '@/lib/schemas'

describe('Medical Schemas Validation', () => {
  describe('CPF Validation', () => {
    test('should validate correct CPF format with dots and dash', () => {
      const validCPF = '123.456.789-09'
      const result = cpfSchema.safeParse(validCPF)
      expect(result.success).toBe(true)
    })

    test('should validate correct CPF format with numbers only', () => {
      const validCPF = '12345678909'
      const result = cpfSchema.safeParse(validCPF)
      expect(result.success).toBe(true)
    })

    test('should reject invalid CPF format', () => {
      const invalidCPF = '123.456.789'
      const result = cpfSchema.safeParse(invalidCPF)
      expect(result.success).toBe(false)
    })

    test('should reject CPF with all equal digits', () => {
      const invalidCPF = '111.111.111-11'
      const result = cpfSchema.safeParse(invalidCPF)
      expect(result.success).toBe(false)
    })
  })

  describe('Phone Validation', () => {
    test('should validate correct phone format with parentheses', () => {
      const validPhone = '(11) 99999-9999'
      const result = phoneSchema.safeParse(validPhone)
      expect(result.success).toBe(true)
    })

    test('should validate correct phone format with numbers only', () => {
      const validPhone = '11999999999'
      const result = phoneSchema.safeParse(validPhone)
      expect(result.success).toBe(true)
    })

    test('should reject invalid phone format', () => {
      const invalidPhone = '(11) 9999-999'
      const result = phoneSchema.safeParse(invalidPhone)
      expect(result.success).toBe(false)
    })
  })

  describe('Personal Data Validation', () => {
    const validPersonalData = {
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '(11) 99999-9999',
      cpf: '123.456.789-09',
      birthDate: '1990-01-01',
      address: {
        street: 'Rua das Flores, 123',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567'
      }
    }

    test('should validate complete personal data', () => {
      const result = personalDataSchema.safeParse(validPersonalData)
      expect(result.success).toBe(true)
    })

    test('should reject incomplete personal data', () => {
      const incompleteData = { ...validPersonalData }
      delete incompleteData.email
      
      const result = personalDataSchema.safeParse(incompleteData)
      expect(result.success).toBe(false)
    })

    test('should reject invalid birth date', () => {
      const invalidData = {
        ...validPersonalData,
        birthDate: '2030-01-01' // Future date
      }
      
      const result = personalDataSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('Treatment Schema Validation', () => {
    const validTreatment = {
      name: 'Botox Facial',
      category: 'facial' as const,
      description: 'Aplicação de toxina botulínica',
      duration: 60,
      price: 500.00,
      requiresConsent: true,
      contraindications: ['Gravidez', 'Amamentação'],
      postTreatmentCare: ['Evitar exercícios por 24h']
    }

    test('should validate correct treatment data', () => {
      const result = treatmentSchema.safeParse(validTreatment)
      expect(result.success).toBe(true)
    })

    test('should reject treatment with invalid duration', () => {
      const invalidTreatment = {
        ...validTreatment,
        duration: 10 // Less than minimum 15 minutes
      }
      
      const result = treatmentSchema.safeParse(invalidTreatment)
      expect(result.success).toBe(false)
    })

    test('should reject treatment with negative price', () => {
      const invalidTreatment = {
        ...validTreatment,
        price: -100
      }
      
      const result = treatmentSchema.safeParse(invalidTreatment)
      expect(result.success).toBe(false)
    })
  })

  describe('Financial Data Validation', () => {
    const validFinancialData = {
      amount: 500.00,
      currency: 'BRL',
      paymentMethod: 'credit_card' as const,
      installments: 3,
      description: 'Tratamento Botox Facial',
      category: 'treatment' as const
    }

    test('should validate correct financial data', () => {
      const result = financialDataSchema.safeParse(validFinancialData)
      expect(result.success).toBe(true)
    })

    test('should reject zero or negative amount', () => {
      const invalidData = {
        ...validFinancialData,
        amount: 0
      }
      
      const result = financialDataSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should reject invalid installments', () => {
      const invalidData = {
        ...validFinancialData,
        installments: 15 // More than maximum 12
      }
      
      const result = financialDataSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('Utility Functions', () => {
    test('validateData should return success for valid data', () => {
      const data = { name: 'Test', email: 'test@email.com' }
      const schema = personalDataSchema.pick({ name: true, email: true })
      
      const result = validateData(schema, data)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(data)
    })

    test('validateData should return errors for invalid data', () => {
      const data = { name: '', email: 'invalid-email' }
      const schema = personalDataSchema.pick({ name: true, email: true })
      
      const result = validateData(schema, data)
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors!.length).toBeGreaterThan(0)
    })
  })

  describe('Healthcare Validators', () => {
    test('isAdult should validate adult age correctly', () => {
      const adultBirthDate = '1990-01-01'
      expect(healthcareValidators.isAdult(adultBirthDate)).toBe(true)
    })

    test('isAdult should reject minor age', () => {
      const minorBirthDate = '2010-01-01'
      expect(healthcareValidators.isAdult(minorBirthDate)).toBe(false)
    })

    test('isBusinessHours should validate business hours', () => {
      expect(healthcareValidators.isBusinessHours('09:00')).toBe(true)
      expect(healthcareValidators.isBusinessHours('17:30')).toBe(true)
      expect(healthcareValidators.isBusinessHours('07:00')).toBe(false)
      expect(healthcareValidators.isBusinessHours('19:00')).toBe(false)
    })

    test('isFutureDate should validate future dates', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
      
      expect(healthcareValidators.isFutureDate(futureDate)).toBe(true)
      expect(healthcareValidators.isFutureDate(pastDate)).toBe(false)
    })

    test('isValidTreatmentDuration should validate treatment duration', () => {
      expect(healthcareValidators.isValidTreatmentDuration(30)).toBe(true)
      expect(healthcareValidators.isValidTreatmentDuration(120)).toBe(true)
      expect(healthcareValidators.isValidTreatmentDuration(10)).toBe(false) // Too short
      expect(healthcareValidators.isValidTreatmentDuration(500)).toBe(false) // Too long
    })
  })
})