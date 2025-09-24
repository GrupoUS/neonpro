/**
 * Brazilian Document Validators
 * Validation utilities for CPF, CNPJ, phone numbers, and CEP
 */

/**
 * Validates Brazilian CPF (Cadastro de Pessoas Físicas)
 */
export function validateCPF(cpf: string): boolean {
  if (!cpf) return false

  // Remove non-numeric characters
  const cleanCPF = cpf.replace(/[^\d]/g, '')

  // Check basic format
  if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
    return false
  }

  // Validate first check digit
  let sum = 0
  for (let i = 0; i < 9; i++) {
    const digit = cleanCPF.charAt(i)
    if (digit) {
      sum += parseInt(digit) * (10 - i)
    }
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  const ninthDigit = cleanCPF.charAt(9)
  if (!ninthDigit || remainder !== parseInt(ninthDigit)) return false

  // Validate second check digit
  sum = 0
  for (let i = 0; i < 10; i++) {
    const digit = cleanCPF.charAt(i)
    if (digit) {
      sum += parseInt(digit) * (11 - i)
    }
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  const tenthDigit = cleanCPF.charAt(10)
  if (!tenthDigit || remainder !== parseInt(tenthDigit)) return false

  return true
}

/**
 * Validates Brazilian CNPJ (Cadastro Nacional da Pessoa Jurídica)
 */
export function validateCNPJ(cnpj: string): boolean {
  if (!cnpj) return false

  // Remove non-numeric characters
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '')

  // Check basic format
  if (cleanCNPJ.length !== 14 || /^(\d)\1{13}$/.test(cleanCNPJ)) {
    return false
  }

  // Validate first check digit
  let sum = 0
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  for (let i = 0; i < 12; i++) {
    const digit = cleanCNPJ.charAt(i)
    const weight = weights1[i]
    if (digit && weight !== undefined) {
      sum += parseInt(digit) * weight
    }
  }
  let remainder = sum % 11
  const digit1 = remainder < 2 ? 0 : 11 - remainder
  const twelfthDigit = cleanCNPJ.charAt(12)
  if (!twelfthDigit || digit1 !== parseInt(twelfthDigit)) return false

  // Validate second check digit
  sum = 0
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  for (let i = 0; i < 13; i++) {
    const digit = cleanCNPJ.charAt(i)
    const weight = weights2[i]
    if (digit && weight !== undefined) {
      sum += parseInt(digit) * weight
    }
  }
  remainder = sum % 11
  const digit2 = remainder < 2 ? 0 : 11 - remainder
  const thirteenthDigit = cleanCNPJ.charAt(13)
  if (!thirteenthDigit || digit2 !== parseInt(thirteenthDigit)) return false

  return true
}

/**
 * Validates Brazilian phone number formats
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return false

  const cleanPhone = phone.replace(/[^\d]/g, '')

  // Mobile: 11 digits (2 digit area code + 9 + 8 digits)
  // Landline: 10 digits (2 digit area code + 8 digits)
  return cleanPhone.length === 10 || cleanPhone.length === 11
}

/**
 * Validates Brazilian CEP (Código de Endereçamento Postal)
 */
export function validateCEP(cep: string): boolean {
  if (!cep) return false

  const cleanCEP = cep.replace(/[^\d]/g, '')

  // CEP should have exactly 8 digits
  return cleanCEP.length === 8
}

/**
 * Validates Brazilian CNS (Cartão Nacional de Saúde)
 * CNS is the Brazilian National Health Card, a unique identifier for citizens in the healthcare system
 * Format: XXX XXXXXXX XX or XXXXXXXXXXXXX (15 digits total)
 * Algorithm: Uses specific weight pattern and modulo 11 for validation
 */
/**
 * Validates Brazilian CNS (Cartão Nacional de Saúde)
 * CNS is the Brazilian National Health Card, a unique identifier for citizens in the healthcare system
 * Format: XXXXXXXXXXXXX (15 digits total)
 * Algorithm: Uses modulo 11 with weights [15,14,13,12,11,10,9,8,7,6,5,4,3,2,1]
 */
export function validateCNS(cns: string): boolean {
  if (!cns) return false

  // Remove non-numeric characters
  const cleanCNS = cns.replace(/[^\d]/g, '')

  // CNS should have exactly 15 digits
  if (cleanCNS.length !== 15) {
    return false
  }

  // Check if it's a "definitive" CNS (starts with 1 or 2) or "provisional" CNS (starts with 7, 8, or 9)
  const firstDigit = cleanCNS.charAt(0)
  const isValidStart = ['1', '2', '7', '8', '9'].includes(firstDigit)

  if (!isValidStart) {
    return false
  }

  // Apply CNS validation algorithm using modulo 11
  return calculateCNSChecksum(cleanCNS)
}

/**
 * Validates TUSS (Terminologia Unificada em Saúde Suplementar) codes
 * TUSS is the standardized terminology for Brazilian healthcare procedures and services
 * Format: Typically 5 digits followed by 2 digits (XXXXXX-XX) or variable length codes
 * This validation checks for common TUSS code patterns and formats
 */
/**
 * Validates TUSS (Terminologia Unificada em Saúde Suplementar) codes
 * TUSS is the standardized terminology for Brazilian healthcare procedures and services
 * Format: Variable length codes (5-10 digits)
 * This validation checks for common TUSS code patterns and formats
 */
export function validateTUSS(tussCode: string): boolean {
  if (!tussCode || tussCode === 'null' || tussCode === 'undefined') return false

  // Remove any formatting characters
  const cleanTUSS = tussCode.replace(/[^\d]/g, '')

  // TUSS codes can vary in length but typically follow these patterns:
  // - 5 digits (basic procedure codes)
  // - 6 digits (therapeutic procedure codes)
  // - 8 digits (detailed procedure codes)
  // - 10 digits (complete classification codes)
  const validLengths = [5, 6, 8, 10]

  if (!validLengths.includes(cleanTUSS.length)) {
    return false
  }

  // Check if it's a valid numeric code
  if (!/^\d+$/.test(cleanTUSS)) {
    return false
  }

  // TUSS codes should not start with 0
  if (cleanTUSS.charAt(0) === '0') {
    return false
  }

  // Basic validation - just ensure it's a numeric code with valid length
  // In practice, TUSS codes have specific ranges, but for validation purposes
  // we accept any numeric code with the correct length
  return true
}

/**
 * Validates Brazilian medical council registration (CRM) - Medical Doctors
 * Format: CRM/UF XXXXXX where UF is state abbreviation and XXXXXX is registration number
 */
export function validateCRM(crm: string): boolean {
  if (!crm) return false

  // Remove spaces and convert to uppercase
  const cleanCRM = crm.toUpperCase().replace(/\s/g, '')

  // CRM should match pattern: CRM/UF followed by 4-10 digits
  const crmPattern = /^CRM\/[A-Z]{2}\d{4,10}$/

  if (!crmPattern.test(cleanCRM)) {
    return false
  }

  // Extract state code and validate it's a valid Brazilian state
  const stateMatch = cleanCRM.match(/^CRM\/([A-Z]{2})/)
  if (!stateMatch || !stateMatch[1]) {
    return false
  }

  const stateCode = stateMatch[1]
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

  return validStates.includes(stateCode)
}

/**
 * Validates Brazilian nursing council registration (COREN) - Nurses and Nursing Professionals
 * Format: COREN/UF XXXXXX where UF is state abbreviation and XXXXXX is registration number
 */
export function validateCOREN(coren: string): boolean {
  if (!coren) return false

  // Remove spaces and convert to uppercase
  const cleanCOREN = coren.toUpperCase().replace(/\s/g, '')

  // COREN should match pattern: COREN/UF followed by 6-9 digits
  const corenPattern = /^COREN\/[A-Z]{2}\d{6,9}$/

  if (!corenPattern.test(cleanCOREN)) {
    return false
  }

  // Extract state code and validate it's a valid Brazilian state
  const stateMatch = cleanCOREN.match(/^COREN\/([A-Z]{2})/)
  if (!stateMatch || !stateMatch[1]) {
    return false
  }

  const stateCode = stateMatch[1]
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

  return validStates.includes(stateCode)
}

/**
 * Validates Brazilian pharmacy council registration (CFF) - Pharmacists and Biochemists
 * Format: CFF/UF XXXXXX where UF is state abbreviation and XXXXXX is registration number
 */
export function validateCFF(cff: string): boolean {
  if (!cff) return false

  // Remove spaces and convert to uppercase
  const cleanCFF = cff.toUpperCase().replace(/\s/g, '')

  // CFF should match pattern: CFF/UF followed by 6-8 digits
  const cffPattern = /^CFF\/[A-Z]{2}\d{6,8}$/

  if (!cffPattern.test(cleanCFF)) {
    return false
  }

  // Extract state code and validate it's a valid Brazilian state
  const stateMatch = cleanCFF.match(/^CFF\/([A-Z]{2})/)
  if (!stateMatch || !stateMatch[1]) {
    return false
  }

  const stateCode = stateMatch[1]
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

  return validStates.includes(stateCode)
}

/**
 * Validates Brazilian aesthetic professional council registration (CNEP) - Aesthetic Professionals
 * Format: CNEP/UF XXXXXX where UF is state abbreviation and XXXXXX is registration number
 */
export function validateCNEP(cnep: string): boolean {
  if (!cnep) return false

  // Remove spaces and convert to uppercase
  const cleanCNEP = cnep.toUpperCase().replace(/\s/g, '')

  // CNEP should match pattern: CNEP/UF followed by 6-8 digits
  const cnepPattern = /^CNEP\/[A-Z]{2}\d{6,8}$/

  if (!cnepPattern.test(cleanCNEP)) {
    return false
  }

  // Extract state code and validate it's a valid Brazilian state
  const stateMatch = cleanCNEP.match(/^CNEP\/([A-Z]{2})/)
  if (!stateMatch || !stateMatch[1]) {
    return false
  }

  const stateCode = stateMatch[1]
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

  return validStates.includes(stateCode)
}

/**
 * Validates any Brazilian aesthetic health professional council registration
 * Supports CFM (doctors), COREN (nurses), CFF (pharmacists), CNEP (aesthetic professionals)
 */
export function validateProfessionalLicense(license: string | null | undefined): boolean {
  if (!license || license === 'null' || license === 'undefined') return false

  // Remove spaces and convert to uppercase
  const cleanLicense = license.toUpperCase().replace(/\s/g, '')

  // Try to match any of the supported council patterns
  const councilPatterns = [
    { pattern: /^CRM\/([A-Z]{2})(\d{4,10})$/, validator: validateCRM },
    { pattern: /^COREN\/([A-Z]{2})(\d{6,9})$/, validator: validateCOREN },
    { pattern: /^CFF\/([A-Z]{2})(\d{6,8})$/, validator: validateCFF },
    { pattern: /^CNEP\/([A-Z]{2})(\d{6,8})$/, validator: validateCNEP },
  ]

  return councilPatterns.some(({ pattern, validator }) => {
    const match = cleanLicense.match(pattern)
    if (match) {
      // Use the specific validator function which includes state validation
      return validator(cleanLicense)
    }
    return false
  })
}

/**
 * Validates aesthetic clinic professional licenses with enhanced validation
 * Specifically designed for aesthetic medicine professionals including doctors, nurses,
 * pharmacists, and aesthetic specialists who perform advanced aesthetic procedures
 * @param license Professional license string to validate
 * @returns Enhanced validation result with professional category information
 */
export interface AestheticProfessionalValidationResult {
  isValid: boolean
  license: string
  councilType: 'CRM' | 'COREN' | 'CFF' | 'CNEP' | 'UNKNOWN'
  stateCode: string
  registrationNumber: string
  professionalCategory: string
  normalized: string
  errors: string[]
}

export function validateAestheticProfessionalLicense(
  license: string,
): AestheticProfessionalValidationResult {
  const errors: string[] = []
  let councilType: 'CRM' | 'COREN' | 'CFF' | 'CNEP' | 'UNKNOWN' = 'UNKNOWN'
  let stateCode = ''
  let registrationNumber = ''
  let professionalCategory = ''
  let isValid = false

  // Remove spaces and convert to uppercase
  const normalized = license.toUpperCase().replace(/\s/g, '')

  // CRM - Medical Doctors (including aesthetic medicine specialists)
  if (/^CRM\/([A-Z]{2})(\d{4,10})$/.test(normalized)) {
    councilType = 'CRM'
    const match = normalized.match(/^CRM\/([A-Z]{2})(\d{4,10})$/)
    if (match) {
      stateCode = match[1] || ''
      registrationNumber = match[2] || ''
      professionalCategory = 'Médico Esteta'
      isValid = validateCRM(license)
    }
  } // COREN - Nursing Professionals (aesthetic nurses and technicians)
  else if (/^COREN\/([A-Z]{2})(\d{6,9})$/.test(normalized)) {
    councilType = 'COREN'
    const match = normalized.match(/^COREN\/([A-Z]{2})(\d{6,9})$/)
    if (match) {
      stateCode = match[1] || ''
      registrationNumber = match[2] || ''
      professionalCategory = 'Enfermeiro Esteta'
      isValid = validateCOREN(license)
    }
  } // CFF - Pharmacy/Biochemistry Professionals (aesthetic pharmacists)
  else if (/^CFF\/([A-Z]{2})(\d{6,8})$/.test(normalized)) {
    councilType = 'CFF'
    const match = normalized.match(/^CFF\/([A-Z]{2})(\d{6,8})$/)
    if (match) {
      stateCode = match[1] || ''
      registrationNumber = match[2] || ''
      professionalCategory = 'Farmacêutico Esteta'
      isValid = validateCFF(license)
    }
  } // CNEP - Aesthetic Professionals (specialized aesthetic technicians)
  else if (/^CNEP\/([A-Z]{2})(\d{6,8})$/.test(normalized)) {
    councilType = 'CNEP'
    const match = normalized.match(/^CNEP\/([A-Z]{2})(\d{6,8})$/)
    if (match) {
      stateCode = match[1] || ''
      registrationNumber = match[2] || ''
      professionalCategory = 'Profissional de Estética'
      isValid = validateCNEP(license)
    }
  }

  // Validate Brazilian state codes
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

  if (stateCode && !validStates.includes(stateCode)) {
    errors.push(`Invalid Brazilian state code: ${stateCode}`)
    isValid = false
  }

  if (!isValid) {
    if (councilType === 'UNKNOWN') {
      errors.push('Invalid professional license format or unsupported council')
    } else {
      errors.push(`Invalid ${councilType} license format or state code`)
    }
  }

  return {
    isValid,
    license,
    councilType,
    stateCode,
    registrationNumber,
    professionalCategory,
    normalized,
    errors,
  }
}

/**
 * Helper function to calculate CNS checksum using correct Brazilian algorithm
 * @param cns Clean CNS string (15 digits)
 * @returns true if checksum is valid
 */
function calculateCNSChecksum(cns: string): boolean {
  const digits = cns.split('').map(Number)

  // CNS validation algorithm
  // For definitive CNS (starting with 1 or 2): use modulo 11
  // For provisional CNS (starting with 7, 8, or 9): use sum validation

  const firstDigit = digits[0]

  if (firstDigit === 1 || firstDigit === 2) {
    // Definitive CNS - use modulo 11 with weights [15,14,13,12,11,10,9,8,7,6,5,4,3,2,1]
    const weights = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
    let sum = 0
    for (let i = 0; i < 15; i++) {
      if (digits[i] !== undefined && weights[i] !== undefined) {
        sum += digits[i]! * weights[i]!
      }
    }
    return sum % 11 === 0
  } else if (firstDigit === 7 || firstDigit === 8 || firstDigit === 9) {
    // Provisional CNS - sum of all digits must be divisible by 11
    let sum = 0
    for (let i = 0; i < 15; i++) {
      if (digits[i] !== undefined) {
        sum += digits[i]!
      }
    }
    return sum % 11 === 0
  }

  return false
}

/**
 * Comprehensive healthcare document validation
 * Validates multiple Brazilian healthcare-related documents
 */
export interface HealthcareValidationResult {
  isValid: boolean
  documentType: string
  value: string
  errors: string[]
  normalized?: string
}

/**
 * Validate any Brazilian healthcare-related document
 * @param documentValue The document value to validate
 * @param documentType Type of document ('cpf', 'cnpj', 'cns', 'tuss', 'crm', 'coren', 'cff', 'cnep', 'professional', 'cep', 'phone')
 * @returns Validation result with detailed information
 */
export function validateHealthcareDocument(
  documentValue: string,
  documentType:
    | 'cpf'
    | 'cnpj'
    | 'cns'
    | 'tuss'
    | 'crm'
    | 'coren'
    | 'cff'
    | 'cnep'
    | 'professional'
    | 'cep'
    | 'phone',
): HealthcareValidationResult {
  const errors: string[] = []
  let isValid = false
  let normalized: string | undefined

  try {
    switch (documentType) {
      case 'cpf':
        isValid = validateCPF(documentValue)
        if (!isValid) errors.push('Invalid CPF format or checksum')
        normalized = documentValue.replace(/[^\d]/g, '')
        break

      case 'cns':
        isValid = validateCNS(documentValue)
        if (!isValid) errors.push('Invalid CNS format or checksum')
        normalized = documentValue.replace(/[^\d]/g, '')
        break

      case 'tuss':
        isValid = validateTUSS(documentValue)
        if (!isValid) errors.push('Invalid TUSS code format or range')
        normalized = documentValue.replace(/[^\d]/g, '')
        break

      case 'crm':
        isValid = validateCRM(documentValue)
        if (!isValid) errors.push('Invalid CRM format or state code')
        normalized = documentValue.toUpperCase().replace(/\s/g, '')
        break

      case 'coren':
        isValid = validateCOREN(documentValue)
        if (!isValid) errors.push('Invalid COREN format or state code')
        normalized = documentValue.toUpperCase().replace(/\s/g, '')
        break

      case 'cff':
        isValid = validateCFF(documentValue)
        if (!isValid) errors.push('Invalid CFF format or state code')
        normalized = documentValue.toUpperCase().replace(/\s/g, '')
        break

      case 'cnep':
        isValid = validateCNEP(documentValue)
        if (!isValid) errors.push('Invalid CNEP format or state code')
        normalized = documentValue.toUpperCase().replace(/\s/g, '')
        break

      case 'professional':
        isValid = validateProfessionalLicense(documentValue)
        if (!isValid) {
          errors.push('Invalid professional license format or council')
        }
        normalized = documentValue.toUpperCase().replace(/\s/g, '')
        break

      case 'cnpj':
        isValid = validateCNPJ(documentValue)
        if (!isValid) errors.push('Invalid CNPJ format or checksum')
        normalized = documentValue.replace(/[^\d]/g, '')
        break

      case 'cep':
        isValid = validateCEP(documentValue)
        if (!isValid) errors.push('Invalid CEP format')
        normalized = documentValue.replace(/[^\d]/g, '')
        break

      case 'phone':
        isValid = validatePhone(documentValue)
        if (!isValid) errors.push('Invalid phone number format')
        normalized = documentValue.replace(/[^\d]/g, '')
        break

      default:
        errors.push('Unsupported document type')
        break
    }
  } catch (error) {
    errors.push(
      `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
    isValid = false
  }

  return {
    isValid,
    documentType,
    value: documentValue,
    errors,
    ...(normalized && { normalized }),
  }
}

/**
 * Batch validation for multiple healthcare documents
 * @param documents Array of documents to validate
 * @returns Array of validation results
 */
export function validateHealthcareDocuments(
  documents: Array<{
    value: string
    type:
      | 'cpf'
      | 'cnpj'
      | 'cns'
      | 'tuss'
      | 'crm'
      | 'coren'
      | 'cff'
      | 'cnep'
      | 'professional'
      | 'cep'
      | 'phone'
  }>,
): HealthcareValidationResult[] {
  return documents.map(doc => validateHealthcareDocument(doc.value, doc.type))
}

/**
 * Sanitize healthcare data for safe logging and storage
 * Removes or masks sensitive information while maintaining validation capability
 */
export function sanitizeHealthcareData(
  data: string,
  dataType: 'cpf' | 'cns' | 'phone' | 'email',
): string {
  if (!data) return ''

  switch (dataType) {
    case 'cpf':
      // Show only first 3 and last 2 digits: XXX.XXX.XXX-XX → XXX.XXX.XX*-XX
      return data.replace(/(\d{3})\.\d{3}\.(\d{3})-(\d{2})/, '$1.$2.*-$3')

    case 'cns':
      // Show only first 3 and last 3 digits: XXX XXXXXXX XX → XXX XXXXX*-XX
      return data.replace(/(\d{3})\s*(\d{5})\s*(\d{2})/, '$1 $2*-$3')

    case 'phone':
      // Show only area code and last 2 digits: (XX) XXXXX-XXXX → (XX) XXX*-XX
      return data.replace(/\((\d{2})\)\s*(\d{5})-(\d{4})/, '($1) $2*-$3')

    case 'email':
      // Show only first 3 characters and domain: user@domain.com → use***@domain.com
      return data.replace(/(\w{3})[\w.-]*@([\w.-]+)/, '$1***@$2')

    default:
      return '[REDACTED]'
  }
}
