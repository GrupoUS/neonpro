/**
 * Brazilian Validation Schemas (T037)
 * Centralized validation utilities for Brazilian healthcare
 *
 * Features:
 * - CPF, CNPJ, phone, CEP validation with proper algorithms
 * - Healthcare-specific validations (CRM, ANVISA codes, SUS)
 * - Error messages in Portuguese
 * - Integration with existing data models
 * - Comprehensive address and patient data validation
 */

// Brazilian states
export const BRAZILIAN_STATES = [
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

// Healthcare specialties
export const HEALTHCARE_SPECIALTIES = [
  'Clínica Médica',
  'Cardiologia',
  'Dermatologia',
  'Endocrinologia',
  'Gastroenterologia',
  'Ginecologia',
  'Neurologia',
  'Oftalmologia',
  'Ortopedia',
  'Pediatria',
  'Psiquiatria',
  'Urologia',
  'Anestesiologia',
  'Cirurgia Geral',
  'Medicina Estética',
]

// Validation error interface
export interface ValidationError {
  field: string
  message: string
  code: string
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Patient data interface
export interface PatientData {
  name?: string
  cpf?: string
  phone?: string
  email?: string
  birthDate?: string
  gender?: string
  cep?: string
  crm_state?: string
  crmv_state?: string
  [key: string]: unknown
}

// Brazilian address interface
export interface BrazilianAddress {
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  cep?: string
  [key: string]: unknown
}

// Clean document numbers (remove formatting)
export function cleanDocument(document: string): string {
  return document.replace(/[^\d]/g, '')
}

// CPF Validation
export function validateCPF(cpf: string): boolean {
  if (!cpf) return false

  const cleanCPF = cleanDocument(cpf)

  // Check length
  if (cleanCPF.length !== 11) return false

  // Check for known invalid CPFs
  const invalidCPFs = [
    '00000000000',
    '11111111111',
    '22222222222',
    '33333333333',
    '44444444444',
    '55555555555',
    '66666666666',
    '77777777777',
    '88888888888',
    '99999999999',
  ]

  if (invalidCPFs.includes(cleanCPF)) return false

  // Validate check digits
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
  }

  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
  }

  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false

  return true
}

// Format CPF
export function formatCPF(cpf: string): string {
  const cleanCPF = cleanDocument(cpf)
  if (cleanCPF.length !== 11) return cpf
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

// CNPJ Validation
export function validateCNPJ(cnpj: string): boolean {
  if (!cnpj) return false

  const cleanCNPJ = cleanDocument(cnpj)

  // Check length
  if (cleanCNPJ.length !== 14) return false

  // Check for known invalid CNPJs
  if (cleanCNPJ === '00000000000000') return false
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false // All same digits

  // Validate first check digit
  let sum = 0
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i) || '0') * (weights1[i] || 0)
  }

  let remainder = sum % 11
  const digit1 = remainder < 2 ? 0 : 11 - remainder

  if (digit1 !== parseInt(cleanCNPJ.charAt(12))) return false

  // Validate second check digit
  sum = 0
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i) || '0') * (weights2[i] || 0)
  }

  remainder = sum % 11
  const digit2 = remainder < 2 ? 0 : 11 - remainder

  if (digit2 !== parseInt(cleanCNPJ.charAt(13))) return false

  return true
}

// Format CNPJ
export function formatCNPJ(cnpj: string): string {
  const cleanCNPJ = cleanDocument(cnpj)
  if (cleanCNPJ.length !== 14) return cnpj
  return cleanCNPJ.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    '$1.$2.$3/$4-$5',
  )
}

// Brazilian phone validation
export function validateBrazilianPhone(phone: string): boolean {
  if (!phone) return false

  const cleanPhone = cleanDocument(phone)

  // Check length (10 or 11 digits)
  if (cleanPhone.length !== 10 && cleanPhone.length !== 11) return false

  // Check area code (11-99)
  const areaCode = parseInt(cleanPhone.substring(0, 2))
  if (areaCode < 11 || areaCode > 99) return false

  // Check mobile number format (9 digits starting with 9)
  if (cleanPhone.length === 11) {
    const firstDigit = parseInt(cleanPhone.charAt(2))
    if (firstDigit !== 9) return false
  }

  return true
}

// Format Brazilian phone
export function formatBrazilianPhone(phone: string): string {
  const cleanPhone = cleanDocument(phone)

  if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  } else if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  return phone
}

// CEP validation
export function validateCEP(cep: string): boolean {
  if (!cep) return false

  const cleanCEP = cleanDocument(cep)

  // Check length
  if (cleanCEP.length !== 8) return false

  // Check for valid pattern (not all zeros)
  if (cleanCEP === '00000000') return false

  return true
}

// Format CEP
export function formatCEP(cep: string): string {
  const cleanCEP = cleanDocument(cep)
  if (cleanCEP.length !== 8) return cep
  return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2')
}

// CRM validation is handled by the more comprehensive function later in the file
// ANVISA code validation is handled by the more comprehensive function later in the file

// SUS card validation
export function validateSUSCard(card: string): boolean {
  if (!card) return false

  const cleanCard = cleanDocument(card)

  // SUS card has 15 digits
  if (cleanCard.length !== 15) return false

  return true
}

// Brazilian state validation
export function validateBrazilianState(state: string): boolean {
  if (!state) return false
  return BRAZILIAN_STATES.includes(state.toUpperCase())
}

// Email validation
export function validateEmail(email: string): boolean {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Get validation message in Portuguese
export function getValidationMessage(field: string, errorType: string): string {
  const messages: Record<string, Record<string, string>> = {
    cpf: {
      required: 'CPF é obrigatório',
      invalid: 'CPF inválido',
      format: 'Formato do CPF inválido',
    },
    cnpj: {
      required: 'CNPJ é obrigatório',
      invalid: 'CNPJ inválido',
      format: 'Formato do CNPJ inválido',
    },
    phone: {
      required: 'Telefone é obrigatório',
      invalid: 'Número de telefone inválido',
      format: 'formato do telefone inválido',
    },
    cep: {
      required: 'CEP é obrigatório',
      invalid: 'CEP inválido',
      format: 'Formato do CEP inválido',
      not_found: 'CEP não encontrado',
    },
    email: {
      required: 'E-mail é obrigatório',
      invalid: 'E-mail inválido',
      format: 'Formato do e-mail inválido',
    },
    name: {
      required: 'Nome é obrigatório',
      invalid: 'Nome inválido',
      min_length: 'Nome deve ter pelo menos 2 caracteres',
    },
    crm: {
      required: 'CRM é obrigatório',
      invalid: 'CRM inválido. Formato esperado: 123456/UF',
      format: 'Formato do CRM inválido',
      state_required: 'Estado do CRM é obrigatório',
    },
    crmv: {
      required: 'CRMV é obrigatório',
      invalid: 'CRMV inválido. Formato esperado: 123456/UF',
      format: 'Formato do CRMV inválido',
      state_required: 'Estado do CRMV é obrigatório',
    },
    cns: {
      required: 'CNS é obrigatório',
      invalid: 'Cartão Nacional de Saúde (CNS) inválido',
      format: 'Formato do CNS inválido. Deve conter 15 dígitos',
    },
    anvisa_code: {
      required: 'Código ANVISA é obrigatório',
      invalid: 'Código ANVISA inválido. Formato esperado: 12345678901234567-X',
      format: 'Formato do código ANVISA inválido',
    },
    medical_procedure: {
      required: 'Código do procedimento é obrigatório',
      invalid: 'Código do procedimento médico inválido',
      format: 'Formato do código de procedimento inválido',
    },
  }

  return messages[field]?.[errorType] || `Campo ${field} inválido`
}

// Validate patient data
export function validatePatientData(data: PatientData): ValidationResult {
  const errors: ValidationError[] = []

  // Name validation
  if (!data.name || data.name.trim() === '') {
    errors.push({
      field: 'name',
      message: getValidationMessage('name', 'required'),
      code: 'REQUIRED',
    })
  } else if (data.name.trim().length < 2) {
    errors.push({
      field: 'name',
      message: getValidationMessage('name', 'min_length'),
      code: 'MIN_LENGTH',
    })
  }

  // CPF validation
  if (!data.cpf) {
    errors.push({
      field: 'cpf',
      message: getValidationMessage('cpf', 'required'),
      code: 'REQUIRED',
    })
  } else if (!validateCPF(data.cpf)) {
    errors.push({
      field: 'cpf',
      message: getValidationMessage('cpf', 'invalid'),
      code: 'INVALID',
    })
  }

  // Phone validation
  if (!data.phone) {
    errors.push({
      field: 'phone',
      message: getValidationMessage('phone', 'required'),
      code: 'REQUIRED',
    })
  } else if (!validateBrazilianPhone(data.phone)) {
    errors.push({
      field: 'phone',
      message: getValidationMessage('phone', 'invalid'),
      code: 'INVALID',
    })
  }

  // Email validation (optional)
  if (data.email && !validateEmail(data.email)) {
    errors.push({
      field: 'email',
      message: getValidationMessage('email', 'invalid'),
      code: 'INVALID',
    })
  }

  // CEP validation (optional)
  if (data.cep && !validateCEP(data.cep)) {
    errors.push({
      field: 'cep',
      message: getValidationMessage('cep', 'invalid'),
      code: 'INVALID',
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Validate Brazilian address
export function validateBrazilianAddress(
  address: BrazilianAddress,
): ValidationResult {
  const errors: ValidationError[] = []

  // Required fields
  const requiredFields = ['street', 'neighborhood', 'city', 'state', 'cep']

  requiredFields.forEach((field) => {
    const fieldValue = address[field as keyof BrazilianAddress]
    if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
      errors.push({
        field,
        message: `${field} é obrigatório`,
        code: 'REQUIRED',
      })
    }
  })

  // State validation
  if (address.state && !validateBrazilianState(address.state)) {
    errors.push({
      field: 'state',
      message: 'Estado inválido',
      code: 'INVALID',
    })
  }

  // CEP validation
  if (address.cep && !validateCEP(address.cep)) {
    errors.push({
      field: 'cep',
      message: getValidationMessage('cep', 'invalid'),
      code: 'INVALID',
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Create validation schema
export function createValidationSchema(fields: Record<string, any>): {
  validate: (data: PatientData | BrazilianAddress) => ValidationResult
} {
  return {
    validate: (data: PatientData | BrazilianAddress): ValidationResult => {
      const errors: ValidationError[] = []

      Object.entries(fields).forEach(([fieldName, config]) => {
        const value = data[fieldName as keyof (PatientData | BrazilianAddress)]

        // Required field validation
        if (
          config.required
          && (!value || (typeof value === 'string' && value.trim() === ''))
        ) {
          errors.push({
            field: fieldName,
            message: getValidationMessage(fieldName, 'required'),
            code: 'REQUIRED',
          })
          return
        }

        // Skip validation if field is empty and not required
        if (!value) return

        // Field-specific validation
        switch (fieldName) {
          case 'cpf':
            if (typeof value === 'string' && !validateCPF(value)) {
              errors.push({
                field: fieldName,
                message: getValidationMessage(fieldName, 'invalid'),
                code: 'INVALID',
              })
            }
            break
          case 'cnpj':
            if (typeof value === 'string' && !validateCNPJ(value)) {
              errors.push({
                field: fieldName,
                message: getValidationMessage(fieldName, 'invalid'),
                code: 'INVALID',
              })
            }
            break
          case 'phone':
            if (typeof value === 'string' && !validateBrazilianPhone(value)) {
              errors.push({
                field: fieldName,
                message: getValidationMessage(fieldName, 'invalid'),
                code: 'INVALID',
              })
            }
            break
          case 'cep':
            if (typeof value === 'string' && !validateCEP(value)) {
              errors.push({
                field: fieldName,
                message: getValidationMessage(fieldName, 'invalid'),
                code: 'INVALID',
              })
            }
            break
          case 'email':
            if (typeof value === 'string' && !validateEmail(value)) {
              errors.push({
                field: fieldName,
                message: getValidationMessage(fieldName, 'invalid'),
                code: 'INVALID',
              })
            }
            break
          case 'crm':
            if (
              typeof value === 'string'
              && typeof data.crm_state === 'string'
              && !validateCRM(value, data.crm_state)
            ) {
              errors.push({
                field: fieldName,
                message: getValidationMessage(fieldName, 'invalid'),
                code: 'INVALID',
              })
            }
            break
          case 'crmv':
            if (
              typeof value === 'string'
              && typeof data.crmv_state === 'string'
              && !validateCRMV(value, data.crmv_state)
            ) {
              errors.push({
                field: fieldName,
                message: getValidationMessage(fieldName, 'invalid'),
                code: 'INVALID',
              })
            }
            break
          case 'cns':
            if (typeof value === 'string' && !validateCNS(value)) {
              errors.push({
                field: fieldName,
                message: getValidationMessage(fieldName, 'invalid'),
                code: 'INVALID',
              })
            }
            break
          case 'anvisa_code':
            if (typeof value === 'string' && !validateANVISACode(value)) {
              errors.push({
                field: fieldName,
                message: getValidationMessage(fieldName, 'invalid'),
                code: 'INVALID',
              })
            }
            break
        }
      })

      return {
        isValid: errors.length === 0,
        errors,
      }
    },
  }
}

// ============================================
// HEALTHCARE-SPECIFIC VALIDATIONS
// ============================================

/**
 * Validate CRM (Conselho Regional de Medicina) number
 * Format: 123456/UF
 */
export function validateCRM(crm: string, state?: string): boolean {
  if (!crm) return false

  const cleanCRM = crm.replace(/[^\d/]/g, '')
  const parts = cleanCRM.split('/')

  if (parts.length !== 2) return false

  const number = parts[0]
  const uf = parts[1]

  // Check number length (typically 4-6 digits)
  if (!number || number.length < 4 || number.length > 6) return false
  if (!/^\d+$/.test(number)) return false

  // Check UF
  if (!uf || !BRAZILIAN_STATES.includes(uf)) return false

  // If state provided, verify consistency
  if (state && state !== uf) return false

  return true
}

/**
 * Validate CRMV (Conselho Regional de Medicina Veterinária) number
 * Format: 123456/UF
 */
export function validateCRMV(crmv: string, state?: string): boolean {
  if (!crmv) return false

  const cleanCRMV = crmv.replace(/[^\d/]/g, '')
  const parts = cleanCRMV.split('/')

  if (parts.length !== 2) return false

  const number = parts[0]
  const uf = parts[1]

  // Check number length (typically 4-6 digits)
  if (!number || number.length < 4 || number.length > 6) return false
  if (!/^\d+$/.test(number)) return false

  // Check UF
  if (!uf || !BRAZILIAN_STATES.includes(uf)) return false

  // If state provided, verify consistency
  if (state && state !== uf) return false

  return true
}

/**
 * Validate CNS (Cartão Nacional de Saúde) number
 * Brazilian National Health Card - 15 digits with specific algorithm
 */
export function validateCNS(cns: string): boolean {
  if (!cns) return false

  const cleanCNS = cleanDocument(cns)

  // Check length
  if (cleanCNS.length !== 15) return false

  // CNS numbers starting with 1 or 2
  if (cleanCNS.startsWith('1') || cleanCNS.startsWith('2')) {
    return validateCNSType1(cleanCNS)
  }

  // CNS numbers starting with 7, 8 or 9
  if (
    cleanCNS.startsWith('7')
    || cleanCNS.startsWith('8')
    || cleanCNS.startsWith('9')
  ) {
    return validateCNSType2(cleanCNS)
  }

  return false
}

// Validate CNS type 1 (starts with 1 or 2)
function validateCNSType1(cns: string): boolean {
  const weights = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
  let sum = 0

  for (let i = 0; i < 15; i++) {
    sum += parseInt(cns[i] || '0') * (weights[i] || 0)
  }

  const remainder = sum % 11
  return remainder < 2
}

// Validate CNS type 2 (starts with 7, 8 or 9)
function validateCNSType2(cns: string): boolean {
  const weights = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
  let sum = 0

  for (let i = 0; i < 15; i++) {
    sum += parseInt(cns[i] || '0') * (weights[i] || 0)
  }

  return sum % 11 === 0
}

/**
 * Validate ANVISA registration code for medical devices
 * Format: 12345678901234567-X (17 digits + check digit)
 */
export function validateANVISACode(code: string): boolean {
  if (!code) return false

  const cleanCode = code.replace(/[^\d-]/g, '')
  const parts = cleanCode.split('-')

  if (parts.length !== 2) return false

  const number = parts[0]
  const checkDigit = parts[1]

  // Ensure both parts exist
  if (!number || !checkDigit) return false

  // Check number length (17 digits)
  if (number.length !== 17) return false
  if (!/^\d+$/.test(number)) return false

  // Check digit validation (simplified - real ANVISA uses specific algorithm)
  if (checkDigit.length !== 1 || !/^\d$/.test(checkDigit)) return false

  return true
}

/**
 * Validate medical procedure code (TUSS/CBHPM)
 * TUSS format: 12345678 (8 digits)
 * CBHPM format: 1.23.45.67-8
 */
export function validateMedicalProcedureCode(
  code: string,
  type: 'TUSS' | 'CBHPM' = 'TUSS',
): boolean {
  if (!code) return false

  if (type === 'TUSS') {
    const cleanCode = cleanDocument(code)
    return cleanCode.length === 8 && /^\d{8}$/.test(cleanCode)
  }

  if (type === 'CBHPM') {
    const cleanCode = code.replace(/[^\d.-]/g, '')
    return /^\d\.\d{2}\.\d{2}\.\d{2}-\d$/.test(cleanCode)
  }

  return false
}

/**
 * Format healthcare document numbers
 */
export function formatCRM(crm: string, state: string): string {
  const cleanNumber = cleanDocument(crm)
  return `${cleanNumber}/${state}`
}

export function formatCRMV(crmv: string, state: string): string {
  const cleanNumber = cleanDocument(crmv)
  return `${cleanNumber}/${state}`
}

export function formatCNS(cns: string): string {
  const cleanCNS = cleanDocument(cns)
  if (cleanCNS.length !== 15) return cns
  return cleanCNS.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4')
}

export function formatANVISACode(code: string): string {
  const cleanCode = cleanDocument(code)
  if (cleanCode.length !== 18) return code
  const number = cleanCode.slice(0, 17)
  const check = cleanCode.slice(17)
  return `${number}-${check}`
}
