/**
 * Healthcare Data Validation Utilities
 *
 * Provides validation functions specifically designed for healthcare data entry
 * with LGPD compliance and medical data sensitivity considerations.
 *
 * @file Healthcare-specific validation patterns and utilities
 */

import { z } from 'zod'

// Healthcare-specific validation schemas
export const healthcareValidationSchemas = {
  // Patient identifier validation (CPF format for Brazil)
  cpf: z
    .string()
    .regex(
      /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
      'CPF deve estar no formato 000.000.000-00',
    )
    .refine((cpf: string) => {
      // CPF validation algorithm
      const cleanCpf = cpf.replace(/[^\d]/g, '')
      if (cleanCpf.length !== 11) return false

      // Check for repeated digits
      if (/^(\d)\1{10}$/.test(cleanCpf)) return false

      // Validate check digits
      let sum = 0
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCpf[i] || '0') * (10 - i)
      }
      let remainder = (sum * 10) % 11
      if (remainder === 10 || remainder === 11) remainder = 0
      if (remainder !== parseInt(cleanCpf[9] || '0')) return false

      sum = 0
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCpf[i] || '0') * (11 - i)
      }
      remainder = (sum * 10) % 11
      if (remainder === 10 || remainder === 11) remainder = 0
      if (remainder !== parseInt(cleanCpf[10] || '0')) return false

      return true
    }, 'CPF inválido'),

  // Medical record number validation
  medicalRecordNumber: z
    .string()
    .min(6, 'Número do prontuário deve ter pelo menos 6 caracteres')
    .max(20, 'Número do prontuário deve ter no máximo 20 caracteres')
    .regex(
      /^[A-Za-z0-9-]+$/,
      'Número do prontuário deve conter apenas letras, números e hífens',
    ),

  // Healthcare professional registration (CRM for Brazil)
  crm: z
    .string()
    .regex(
      /^CRM\/[A-Z]{2}\s\d{4,6}$/,
      'CRM deve estar no formato CRM/UF 0000000',
    )
    .refine((crm: string) => {
      const match = crm.match(/^CRM\/([A-Z]{2})\s(\d{4,6})$/)
      if (!match) return false

      const [, state, number] = match
      const validStates = [
        'AC',
        'AL',
        'AP',
        'AM',
        'BA',
        'CE',
        'DF',
        'ES',
        'GO',
        'MA',
        'MT',
        'MS',
        'MG',
        'PA',
        'PB',
        'PR',
        'PE',
        'PI',
        'RJ',
        'RN',
        'RS',
        'RO',
        'RR',
        'SC',
        'SP',
        'SE',
        'TO',
      ]

      return state && number && validStates.includes(state) && number.length >= 4
    }, 'Estado inválido no CRM'),

  // Phone number validation (Brazilian format)
  phoneNumber: z
    .string()
    .regex(
      /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
      'Telefone deve estar no formato (00) 00000-0000',
    )
    .refine((phone: string) => {
      const digits = phone.replace(/[^\d]/g, '')
      return digits.length === 10 || digits.length === 11
    }, 'Número de telefone inválido'),

  // Medical specialty validation
  medicalSpecialty: z
    .string()
    .min(3, 'Especialidade deve ter pelo menos 3 caracteres')
    .max(100, 'Especialidade deve ter no máximo 100 caracteres')
    .regex(
      /^[A-Za-zÀ-ÿ\s-]+$/,
      'Especialidade deve conter apenas letras, espaços e hífens',
    ),

  // Date of birth validation (healthcare _context)
  dateOfBirth: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Data deve estar no formato DD/MM/AAAA')
    .refine((dateStr: string) => {
      const [day, month, year] = dateStr.split('/').map(Number)
      if (!day || !month || !year) return false
      const date = new Date(year, month - 1, day)
      const now = new Date()

      // Check if date is valid
      if (
        date.getDate() !== day ||
        date.getMonth() !== month - 1 ||
        date.getFullYear() !== year
      ) {
        return false
      }

      // Check if date is not in the future
      if (date > now) return false

      // Check reasonable age limits (0-150 years)
      const age = now.getFullYear() - year
      return age >= 0 && age <= 150
    }, 'Data de nascimento inválida'),

  // Emergency contact validation
  emergencyContact: z.object({
    name: z
      .string()
      .min(2, 'Nome deve ter pelo menos 2 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres')
      .regex(/^[A-Za-zÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
    relationship: z
      .string()
      .min(2, 'Parentesco deve ter pelo menos 2 caracteres')
      .max(50, 'Parentesco deve ter no máximo 50 caracteres'),
    phone: z
      .string()
      .regex(
        /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
        'Telefone deve estar no formato (00) 00000-0000',
      ),
  }),

  // Allergy information validation
  allergy: z.object({
    allergen: z
      .string()
      .min(2, 'Alérgeno deve ter pelo menos 2 caracteres')
      .max(100, 'Alérgeno deve ter no máximo 100 caracteres'),
    severity: z.enum(['leve', 'moderada', 'grave'], {
      message: 'Selecione uma severidade válida',
    }),
    notes: z
      .string()
      .max(500, 'Observações devem ter no máximo 500 caracteres')
      .optional(),
  }),

  // Medication validation
  medication: z.object({
    name: z
      .string()
      .min(2, 'Nome do medicamento deve ter pelo menos 2 caracteres')
      .max(200, 'Nome do medicamento deve ter no máximo 200 caracteres'),
    dosage: z
      .string()
      .min(1, 'Dosagem é obrigatória')
      .max(100, 'Dosagem deve ter no máximo 100 caracteres')
      .regex(
        /^[\d,.\s]+(mg|ml|g|mcg|UI|%)\s*.*$/,
        'Dosagem deve incluir unidade válida',
      ),
    frequency: z
      .string()
      .min(1, 'Frequência é obrigatória')
      .max(100, 'Frequência deve ter no máximo 100 caracteres'),
    prescribedBy: z
      .string()
      .regex(
        /^CRM\/[A-Z]{2}\s\d{4,6}$/,
        'CRM do prescritor deve estar no formato CRM/UF 0000000',
      ),
  }),
}

// Data sensitivity classification for LGPD compliance
export enum DataSensitivity {
  PUBLIC = 'public', // Non-sensitive data
  INTERNAL = 'internal', // Internal use only
  CONFIDENTIAL = 'confidential', // Patient data
  RESTRICTED = 'restricted', // Highly sensitive medical data
}

// Healthcare data classification helper
export function classifyHealthcareData(fieldType: string): DataSensitivity {
  const classifications: Record<string, DataSensitivity> = {
    // Public data
    clinic_name: DataSensitivity.PUBLIC,
    service_type: DataSensitivity.PUBLIC,
    appointment_slots: DataSensitivity.PUBLIC,

    // Internal data
    professional_name: DataSensitivity.INTERNAL,
    department: DataSensitivity.INTERNAL,
    room_number: DataSensitivity.INTERNAL,

    // Confidential patient data
    patient_name: DataSensitivity.CONFIDENTIAL,
    patient_cpf: DataSensitivity.CONFIDENTIAL,
    patient_phone: DataSensitivity.CONFIDENTIAL,
    patient_email: DataSensitivity.CONFIDENTIAL,
    patient_address: DataSensitivity.CONFIDENTIAL,
    emergency_contact: DataSensitivity.CONFIDENTIAL,

    // Restricted medical data
    medical_record: DataSensitivity.RESTRICTED,
    diagnosis: DataSensitivity.RESTRICTED,
    treatment_plan: DataSensitivity.RESTRICTED,
    medications: DataSensitivity.RESTRICTED,
    allergies: DataSensitivity.RESTRICTED,
    medical_history: DataSensitivity.RESTRICTED,
    lab_results: DataSensitivity.RESTRICTED,
    images: DataSensitivity.RESTRICTED,
  }

  return classifications[fieldType] || DataSensitivity.CONFIDENTIAL
}

// Validation error message localization (Portuguese for Brazil)
export const healthcareValidationMessages = {
  required: 'Este campo é obrigatório',
  invalid: 'Valor inválido',
  tooShort: 'Muito curto',
  tooLong: 'Muito longo',
  invalidFormat: 'Formato inválido',
  invalidCpf: 'CPF inválido',
  invalidCrm: 'CRM inválido',
  invalidPhone: 'Telefone inválido',
  invalidDate: 'Data inválida',
  futureDate: 'Data não pode ser no futuro',
  pastDate: 'Data não pode ser no passado',
  invalidAge: 'Idade inválida',
  missingConsent: 'Consentimento LGPD necessário',
  dataRetentionExpired: 'Período de retenção de dados expirado',
}

// LGPD consent validation
export const lgpdConsentSchema = z.object({
  dataProcessingConsent: z
    .boolean()
    .refine(
      (val: boolean) => val === true,
      'Consentimento para processamento de dados é obrigatório',
    ),
  marketingConsent: z.boolean(),
  analyticsConsent: z.boolean(),
  consentTimestamp: z.string().datetime(),
  consentVersion: z.string().min(1),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
})

// Patient safety validation helpers
export function validateEmergencyData(data: Record<string, unknown>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Emergency contact validation
  if (!data.emergencyContact) {
    errors.push('Contato de emergência é obrigatório')
  }

  // Critical allergy validation
  if (data.allergies && Array.isArray(data.allergies)) {
    const criticalAllergies = data.allergies.filter(
      (a: Record<string, unknown>) => a.severity === 'grave',
    )
    if (criticalAllergies.length > 0 && !data.allergyAlert) {
      errors.push('Alerta de alergia grave deve estar ativo')
    }
  }

  // Medical record completeness
  if (!data.medicalRecordNumber) {
    errors.push('Número do prontuário é obrigatório')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Accessibility validation helpers
export function validateAccessibilityRequirements(element: HTMLElement): {
  isValid: boolean
  violations: string[]
} {
  const violations: string[] = []

  // Check for proper labeling
  if (
    element.tagName === 'INPUT' ||
    element.tagName === 'SELECT' ||
    element.tagName === 'TEXTAREA'
  ) {
    const label = element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      document.querySelector(`label[for="${element.id}"]`)

    if (!label) {
      violations.push('Campo sem rótulo acessível')
    }
  }

  // Check for error messages
  if (element.getAttribute('aria-invalid') === 'true') {
    const errorElement = element.getAttribute('aria-describedby')
    if (!errorElement) {
      violations.push('Erro sem descrição acessível')
    }
  }

  // Check for required field indication
  if (
    element.hasAttribute('required') &&
    !element.getAttribute('aria-required')
  ) {
    violations.push('Campo obrigatório sem indicação acessível')
  }

  return {
    isValid: violations.length === 0,
    violations,
  }
}

// Medical data anonymization helper
export function anonymizePatientData(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const anonymized = { ...data }

  // Remove or hash sensitive identifiers
  const sensitiveFields = ['cpf', 'name', 'phone', 'email', 'address']

  sensitiveFields.forEach(field => {
    if (anonymized[field]) {
      // Replace with anonymized placeholder
      anonymized[field] = `[ANONIMIZADO_${field.toUpperCase()}]`
    }
  })

  // Keep only essential medical information
  const allowedFields = [
    'age_range',
    'gender',
    'medical_specialty',
    'diagnosis_category',
    'treatment_type',
    'outcome',
    'duration',
  ]

  Object.keys(anonymized).forEach(key => {
    if (!allowedFields.includes(key) && sensitiveFields.includes(key)) {
      delete anonymized[key]
    }
  })

  return anonymized
}
