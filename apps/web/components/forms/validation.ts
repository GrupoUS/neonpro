/**
 * Healthcare Form Validation Utilities
 * LGPD and healthcare compliance validation rules
 */

import { validateCPF, validateEmail, validatePhone, } from '@neonpro/utils/validation'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: unknown,) => string | null
  message?: string
}

export interface ValidationSchema {
  [field: string]: ValidationRule | ValidationRule[]
}

export interface ValidationErrors {
  [field: string]: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationErrors
}

// Healthcare specific patterns
export const HEALTHCARE_PATTERNS = {
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  phone: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  cep: /^\d{5}-\d{3}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  medicalLicense: /^[A-Z]{2}\d{4,6}$/,
  rg: /^[\d.]{7,12}$/,
  susCard: /^\d{15}$/,
  bloodType: /^(A|B|AB|O)[+-]$/,
}

// CPF validation now imported from @neonpro/utils/validation

// CNPJ validation algorithm
export const validateCNPJ = (cnpj: string,): boolean => {
  const digits = cnpj.replace(/\D/g, '',)

  if (digits.length !== 14) return false

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2,]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2,]

  const calculateDigit = (digits: string, weights: number[],) => {
    const sum = digits.split('',).reduce((acc, digit, index,) => {
      return acc + parseInt(digit,) * weights[index]
    }, 0,)
    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }

  const digit1 = calculateDigit(digits.slice(0, 12,), weights1,)
  const digit2 = calculateDigit(digits.slice(0, 13,), weights2,)

  return parseInt(digits[12],) === digit1 && parseInt(digits[13],) === digit2
}

// Healthcare specific validators
export const healthcareValidators = {
  cpf: (value: string,) => {
    if (!value) return null
    if (!HEALTHCARE_PATTERNS.cpf.test(value,)) {
      return 'CPF deve estar no formato: 000.000.000-00'
    }
    if (!validateCPF(value,)) {
      return 'CPF inválido'
    }
    return null
  },

  cnpj: (value: string,) => {
    if (!value) return null
    if (!HEALTHCARE_PATTERNS.cnpj.test(value,)) {
      return 'CNPJ deve estar no formato: 00.000.000/0000-00'
    }
    if (!validateCNPJ(value,)) {
      return 'CNPJ inválido'
    }
    return null
  },

  email: (value: string,) => {
    if (!value) return null
    if (!validateEmail(value,)) {
      return 'Email inválido'
    }
    return null
  },

  phone: (value: string,) => {
    if (!value) return null
    const digitsOnly = value.replace(/\D/g, '',)
    if (!validatePhone(digitsOnly,)) {
      return 'Telefone deve estar no formato brasileiro: (00) 00000-0000 ou (00) 0000-0000'
    }
    return null
  },

  medicalLicense: (value: string,) => {
    if (!value) return null
    if (!HEALTHCARE_PATTERNS.medicalLicense.test(value,)) {
      return 'CRM deve estar no formato: SP123456'
    }
    return null
  },

  birthDate: (value: string,) => {
    if (!value) return null
    const date = new Date(value,)
    const today = new Date()
    const age = today.getFullYear() - date.getFullYear()

    if (age < 0 || age > 150) {
      return 'Data de nascimento inválida'
    }
    return null
  },

  bloodType: (value: string,) => {
    if (!value) return null
    if (!HEALTHCARE_PATTERNS.bloodType.test(value,)) {
      return 'Tipo sanguíneo deve ser: A+, A-, B+, B-, AB+, AB-, O+, O-'
    }
    return null
  },

  weight: (value: number,) => {
    if (!value) return null
    if (value < 0.5 || value > 500) {
      return 'Peso deve estar entre 0.5kg e 500kg'
    }
    return null
  },

  height: (value: number,) => {
    if (!value) return null
    if (value < 30 || value > 250) {
      return 'Altura deve estar entre 30cm e 250cm'
    }
    return null
  },

  lgpdConsent: (value: boolean,) => {
    if (!value) {
      return 'Consentimento LGPD é obrigatório para processamento de dados de saúde'
    }
    return null
  },

  hipaaConsent: (value: boolean,) => {
    if (!value) {
      return 'Consentimento para uso de dados médicos é obrigatório'
    }
    return null
  },
}

// Main validation function
export const validateField = (
  value: unknown,
  rules: ValidationRule | ValidationRule[],
): string | null => {
  const ruleArray = Array.isArray(rules,) ? rules : [rules,]

  for (const rule of ruleArray) {
    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return rule.message || 'Este campo é obrigatório'
    }

    // Skip other validations if value is empty and not required
    if (!value) continue

    // Length validation
    if (rule.minLength && value.toString().length < rule.minLength) {
      return rule.message || `Mínimo de ${rule.minLength} caracteres`
    }

    if (rule.maxLength && value.toString().length > rule.maxLength) {
      return rule.message || `Máximo de ${rule.maxLength} caracteres`
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value,)) {
      return rule.message || 'Formato inválido'
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value,)
      if (customError) return customError
    }
  }

  return null
}

// Validate entire form schema
export const validateSchema = (
  data: Record<string, unknown>,
  schema: ValidationSchema,
): ValidationResult => {
  const errors: ValidationErrors = {}

  for (const [field, rules,] of Object.entries(schema,)) {
    const error = validateField(data[field], rules,)
    if (error) {
      errors[field] = error
    }
  }

  return {
    isValid: Object.keys(errors,).length === 0,
    errors,
  }
}

// Pre-defined healthcare schemas
export const HEALTHCARE_SCHEMAS = {
  patient: {
    given_names: { required: true, minLength: 2, maxLength: 100, },
    family_name: { required: true, minLength: 2, maxLength: 100, },
    email: { custom: healthcareValidators.email, },
    cpf: { custom: healthcareValidators.cpf, },
    birth_date: { required: true, custom: healthcareValidators.birthDate, },
    phone: { custom: healthcareValidators.phone, },
    lgpd_consent_given: { custom: healthcareValidators.lgpdConsent, },
    medical_consent_given: { custom: healthcareValidators.hipaaConsent, },
  } as ValidationSchema,

  professional: {
    full_name: { required: true, minLength: 2, maxLength: 100, },
    email: { required: true, custom: healthcareValidators.email, },
    medical_license: { required: true, custom: healthcareValidators.medicalLicense, },
    specialty: { required: true, minLength: 2, },
    phone: { custom: healthcareValidators.phone, },
  } as ValidationSchema,

  appointment: {
    patient_id: { required: true, },
    professional_id: { required: true, },
    scheduled_at: { required: true, },
    duration_minutes: { required: true, },
    appointment_type: { required: true, },
    reason: { required: true, minLength: 10, maxLength: 500, },
  } as ValidationSchema,

  clinic: {
    name: { required: true, minLength: 2, maxLength: 200, },
    cnpj: { custom: healthcareValidators.cnpj, },
    email: { required: true, custom: healthcareValidators.email, },
    phone: { required: true, custom: healthcareValidators.phone, },
    address: { required: true, minLength: 10, },
  } as ValidationSchema,
}
