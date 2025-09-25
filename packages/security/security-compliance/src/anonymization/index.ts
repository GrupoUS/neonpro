export function maskCPF(_cpf: string): string {
  return '***.***.***-**'
}

export function maskEmail(email: string): string {
  const parts = email.split('@')
  if (parts.length !== 2) return '*****@*****.com'
  const [local, domain] = parts
  if (!local || !domain) return '*****@*****.com'
  const maskedLocal = local[0] + '*'.repeat(local.length - 1)
  return maskedLocal + '@' + domain
}

export function maskPhone(_phone: string): string {
  return '(11) 9****-****'
}

export function maskName(_name: string): string {
  return '*** *** ***'
}

// Type definitions for LGPD compliance levels
export type LGPDComplianceLevel = 'basic' | 'enhanced' | 'strict'

interface PatientData {
  name: string
  cpf: string
  email: string
  phone: string
  address: {
    street: string
    number: string
    zipCode: string
    city: string
    state: string
  }
}

interface AnonymizedPatientResult {
  data: PatientData
  metadata: {
    complianceLevel: LGPDComplianceLevel
    fieldsAnonymized: string[]
    version: string
    anonymizedAt: string
  }
}

export function maskPatientData(
  data: PatientData,
  level: LGPDComplianceLevel,
): AnonymizedPatientResult {
  let maskedName
  if (level === 'basic') {
    maskedName = data.name.split(' ')[0] + ' ***'
  } else if (level === 'enhanced') {
    maskedName = '*** *** ***'
  } else {
    maskedName = 'ANONIMIZADO'
  }

  const maskedData: PatientData = {
    ...data,
    name: maskedName,
    cpf: maskCPF(data.cpf),
    email: maskEmail(data.email),
    phone: maskPhone(data.phone),
    address: {
      ...data.address,
      street: '***',
      number: '***',
      zipCode: '***** - ***',
      city: data.address.city, // Keep city
      state: data.address.state, // Keep state
    },
  }

  return {
    data: maskedData,
    metadata: {
      complianceLevel: level,
      fieldsAnonymized: [
        'name',
        'cpf',
        'email',
        'phone',
        'address.street',
        'address.number',
        'address.zipCode',
      ],
      version: '1.0',
      anonymizedAt: new Date().toISOString(),
    },
  }
}

// Additional anonymization utilities for LGPD compliance
export const ANONYMIZATION_VERSION = '1.0.0'

export interface AnonymizationMetadata {
  complianceLevel: LGPDComplianceLevel
  fieldsAnonymized: string[]
  anonymizedAt: string
  version: string
}

export interface MaskingOptions {
  preserveFirstChars?: number
  preserveLastChars?: number
  maskChar?: string
}

export const DEFAULT_MASKING_OPTIONS: MaskingOptions = {
  preserveFirstChars: 2,
  preserveLastChars: 2,
  maskChar: '*',
}

export function anonymizePersonalData(
  data: Record<string, unknown>,
  options: MaskingOptions = DEFAULT_MASKING_OPTIONS,
): Record<string, unknown> {
  const anonymized: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      anonymized[key] = maskString(value, options)
    } else if (typeof value === 'object' && value !== null) {
      anonymized[key] = anonymizePersonalData(value as Record<string, unknown>, options)
    } else {
      anonymized[key] = value
    }
  }
  
  return anonymized
}

function maskString(str: string, options: MaskingOptions): string {
  const { preserveFirstChars = 2, preserveLastChars = 2, maskChar = '*' } = options
  
  if (str.length <= preserveFirstChars + preserveLastChars) {
    return maskChar.repeat(str.length)
  }
  
  const firstPart = str.substring(0, preserveFirstChars)
  const lastPart = str.substring(str.length - preserveLastChars)
  const maskedLength = str.length - preserveFirstChars - preserveLastChars
  const masked = maskChar.repeat(maskedLength)
  
  return firstPart + masked + lastPart
}

export function generatePrivacyReport(
  originalData: Record<string, unknown>,
  anonymizedData: Record<string, unknown>,
  metadata: AnonymizationMetadata,
): string {
  return JSON.stringify({
    originalData,
    anonymizedData,
    metadata,
    generatedAt: new Date().toISOString(),
  }, null, 2)
}

export function isDataAnonymized(data: Record<string, unknown>): boolean {
  const sensitiveKeys = ['name', 'cpf', 'email', 'phone', 'address']
  
  return sensitiveKeys.some(key => {
    const value = data[key]
    if (typeof value === 'string') {
      return value.includes('*') || value.includes('***')
    }
    return false
  })
}

// Additional masking functions for Brazilian data
export function maskCNPJ(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, '')
  if (clean.length !== 14) return '**.***.***/****-**'
  return `${clean.substring(0, 2)}.***.***/****-**`
}

export function maskAddress(address: string): string {
  return '***, ***, *****-***, **/**' 
}

export type PatientData = PatientData