// Healthcare-specific utilities for Brazilian aesthetic clinics
// LGPD compliance, data validation, and healthcare operations

import { LGPD_CONFIG, HEALTHCARE_VALIDATION_RULES, AUDIT_CONFIG } from '@/config/healthcare'
import type { BrazilianPersonalInfo, LGPDConsent, HealthcareValidationLevel } from '@/types/healthcare'

// CPF Validation (Brazilian personal identifier)
export const validateCPF = (cpf: string): boolean => {
  if (!cpf) return false
  
  // Remove non-numeric characters
  const cleanCPF = cpf.replace(/[^\d]/g, '')
  
  // Check basic length
  if (cleanCPF.length !== 11) return false
  
  // Check if all digits are the same
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false
  
  // Calculate first verification digit
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  const digit1 = remainder === 10 ? 0 : remainder
  
  // Calculate second verification digit
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i)
  }
  remainder = (sum * 10) % 11
  const digit2 = remainder === 10 ? 0 : remainder
  
  // Check verification digits
  return (
    parseInt(cleanCPF[9]) === digit1 &&
    parseInt(cleanCPF[10]) === digit2
  )
}

// Phone number validation for Brazilian format
export const validatePhone = (phone: string): boolean => {
  if (!phone) return false
  
  // Brazilian phone format: (11) 99999-9999 or (11) 9999-9999
  const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/
  return phoneRegex.test(phone)
}

// Brazilian date validation
export const validateBrazilianDate = (date: string): boolean => {
  if (!date) return false
  
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/
  if (!dateRegex.test(date)) return false
  
  const [day, month, year] = date.split('/').map(Number)
  
  // Basic validation
  if (
    year < 1900 || year > new Date().getFullYear() ||
    month < 1 || month > 12 ||
    day < 1 || day > 31
  ) {
    return false
  }
  
  // More precise validation
  const dateObj = new Date(year, month - 1, day)
  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day
  )
}

// Brazilian ZIP code validation
export const validateCEP = (cep: string): boolean => {
  if (!cep) return false
  
  const cepRegex = /^\d{5}-\d{3}$/
  return cepRegex.test(cep)
}

// Brazilian RG validation (basic format check)
export const validateRG = (rg: string): boolean => {
  if (!rg) return true // RG is optional
  
  // Remove non-alphanumeric characters
  const cleanRG = rg.replace(/[^a-zA-Z0-9]/g, '')
  
  // RG can vary by state, basic validation
  return cleanRG.length >= 7 && cleanRG.length <= 14
}

// Email validation with Brazilian domain preference
export const validateEmail = (email: string): boolean => {
  if (!email) return false
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return false
  
  // Prefer Brazilian domains
  const brazilianDomains = ['.com.br', '.br', '.gov.br', '.org.br']
  return brazilianDomains.some(domain => email.toLowerCase().includes(domain))
}

// Patient data validation
export const validatePatientData = (data: any, validationLevel: HealthcareValidationLevel = 'basic'): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!data.personalInfo) {
    errors.push('Informações pessoais são obrigatórias')
    return { isValid: false, errors }
  }
  
  const { personalInfo } = data
  
  // Required fields validation
  if (!personalInfo.fullName || personalInfo.fullName.trim().length < 3) {
    errors.push('Nome completo é obrigatório e deve ter pelo menos 3 caracteres')
  }
  
  if (!validateBrazilianDate(personalInfo.dateOfBirth)) {
    errors.push('Data de nascimento inválida (use formato DD/MM/AAAA)')
  }
  
  if (!validatePhone(personalInfo.phone)) {
    errors.push('Telefone inválido (use formato (11) 99999-9999)')
  }
  
  // Age validation
  if (personalInfo.dateOfBirth) {
    const [day, month, year] = personalInfo.dateOfBirth.split('/').map(Number)
    const birthDate = new Date(year, month - 1, day)
    const age = Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    
    const { minAge, maxAge } = HEALTHCARE_VALIDATION_RULES.patient
    if (age < minAge || age > maxAge) {
      errors.push(`Idade deve estar entre ${minAge} e ${maxAge} anos`)
    }
  }
  
  // Document validation
  if (personalInfo.cpf && !validateCPF(personalInfo.cpf)) {
    errors.push('CPF inválido')
  }
  
  if (personalInfo.email && !validateEmail(personalInfo.email)) {
    errors.push('Email inválido')
  }
  
  // Strict validation level
  if (validationLevel === 'strict' || validationLevel === 'healthcare_critical') {
    if (!data.address) {
      errors.push('Endereço é obrigatório')
    } else {
      if (!data.address.street || data.address.street.trim().length < 3) {
        errors.push('Rua é obrigatória')
      }
      if (!data.address.city || data.address.city.trim().length < 2) {
        errors.push('Cidade é obrigatória')
      }
      if (!data.address.state || data.address.state.length !== 2) {
        errors.push('Estado é obrigatório (2 caracteres)')
      }
      if (!validateCEP(data.address.zipCode)) {
        errors.push('CEP inválido (use formato 00000-000)')
      }
    }
    
    if (!data.emergencyContact) {
      errors.push('Contato de emergência é obrigatório')
    } else {
      if (!data.emergencyContact.name || data.emergencyContact.name.trim().length < 3) {
        errors.push('Nome do contato de emergência é obrigatório')
      }
      if (!validatePhone(data.emergencyContact.phone)) {
        errors.push('Telefone do contato de emergência é inválido')
      }
      if (!data.emergencyContact.relationship || data.emergencyContact.relationship.trim().length < 2) {
        errors.push('Relação com o paciente é obrigatória')
      }
    }
  }
  
  // Healthcare critical validation
  if (validationLevel === 'healthcare_critical') {
    if (!data.consent) {
      errors.push('Consentimento LGPD é obrigatório')
    } else {
      const requiredConsentFields = ['treatmentConsent', 'dataSharingConsent', 'emergencyContactConsent']
      requiredConsentFields.forEach(field => {
        if (data.consent[field] !== true) {
          errors.push(`Consentimento ${field} é obrigatório`)
        }
      })
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// LGPD consent validation
export const validateLGPDConsent = (consent: LGPDConsent): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!consent.consentDate) {
    errors.push('Data do consentimento é obrigatória')
  } else {
    const consentDate = new Date(consent.consentDate)
    const now = new Date()
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    
    if (consentDate > now) {
      errors.push('Data do consentimento não pode ser no futuro')
    }
    if (consentDate < oneYearAgo) {
      errors.push('Consentimento expirou (mais de 1 ano)')
    }
  }
  
  if (!consent.consentVersion || consent.consentVersion.length < 1) {
    errors.push('Versão do consentimento é obrigatória')
  }
  
  if (typeof consent.treatmentConsent !== 'boolean') {
    errors.push('Consentimento de tratamento é obrigatório')
  }
  
  if (typeof consent.dataSharingConsent !== 'boolean') {
    errors.push('Consentimento de compartilhamento de dados é obrigatório')
  }
  
  if (typeof consent.emergencyContactConsent !== 'boolean') {
    errors.push('Consentimento de contato de emergência é obrigatório')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Data anonymization for LGPD compliance
export const anonymizePatientData = (data: any): any => {
  if (!data || typeof data !== 'object') return data
  
  const anonymized = { ...data }
  
  // Anonymize personal information
  if (anonymized.personalInfo) {
    anonymized.personalInfo = {
      ...anonymized.personalInfo,
      fullName: anonymizeText(anonymized.personalInfo.fullName),
      cpf: anonymizeText(anonymized.personalInfo.cpf),
      email: anonymizeEmail(anonymized.personalInfo.email),
      phone: anonymizeText(anonymized.personalInfo.phone),
      rg: anonymizeText(anonymized.personalInfo.rg),
    }
  }
  
  // Anonymize address
  if (anonymized.address) {
    anonymized.address = {
      ...anonymized.address,
      street: anonymizeText(anonymized.address.street),
      number: anonymizeText(anonymized.address.number),
      complement: anonymizeText(anonymized.address.complement),
      neighborhood: anonymizeText(anonymized.address.neighborhood),
    }
  }
  
  // Anonymize emergency contact
  if (anonymized.emergencyContact) {
    anonymized.emergencyContact = {
      ...anonymized.emergencyContact,
      name: anonymizeText(anonymized.emergencyContact.name),
      phone: anonymizeText(anonymized.emergencyContact.phone),
      email: anonymizeEmail(anonymized.emergencyContact.email),
    }
  }
  
  return anonymized
}

// Helper functions for anonymization
const anonymizeText = (text: string): string => {
  if (!text || typeof text !== 'string') return 'ANONYMIZED'
  
  // Keep first character and length, replace rest with asterisks
  if (text.length <= 2) return '***'
  
  const firstChar = text[0]
  const lastChar = text[text.length - 1]
  const middleLength = Math.max(text.length - 2, 3)
  
  return `${firstChar}${'*'.repeat(middleLength)}${lastChar}`
}

const anonymizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return 'anonymized@example.com'
  
  const [username, domain] = email.split('@')
  if (!username || !domain) return 'anonymized@example.com'
  
  const anonymizedUsername = anonymizeText(username)
  return `${anonymizedUsername}@${domain}`
}

// Healthcare date formatting
export const formatHealthcareDate = (date: string | Date): string => {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return ''
  
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Healthcare time formatting
export const formatHealthcareTime = (time: string | Date): string => {
  if (!time) return ''
  
  const timeObj = typeof time === 'string' ? new Date(`1970-01-01T${time}`) : time
  if (isNaN(timeObj.getTime())) return ''
  
  return timeObj.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Generate audit trail entries
export const generateAuditTrail = (action: string, userId: string, details: any = {}): any => {
  return {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    action,
    userId,
    ipAddress: '192.168.1.1', // Would be captured from request
    userAgent: navigator.userAgent,
    details,
    complianceFramework: ['LGPD', 'ANVISA', 'CFM'],
    environment: process.env.NODE_ENV || 'development'
  }
}

// Data retention validation
export const validateDataRetention = (data: any, dataType: string): boolean => {
  if (!data || !data.createdAt) return false
  
  const createdAt = new Date(data.createdAt)
  const retentionDays = LGPD_CONFIG.dataRetentionDays
  const expirationDate = new Date(createdAt.getTime() + retentionDays * 24 * 60 * 60 * 1000)
  
  return new Date() < expirationDate
}

// Healthcare risk assessment
export const assessTreatmentRisk = (treatment: any, patient: any): { riskLevel: 'low' | 'medium' | 'high'; recommendations: string[] } => {
  const riskFactors: string[] = []
  const recommendations: string[] = []
  
  // Age-based risk assessment
  if (patient.age > 65) {
    riskFactors.push('elderly_patient')
    recommendations.push('Consider additional monitoring for elderly patients')
  }
  
  if (patient.age < 18) {
    riskFactors.push('minor_patient')
    recommendations.push('Parental consent required')
  }
  
  // Treatment-specific risks
  if (treatment.category === 'invasive') {
    riskFactors.push('invasive_procedure')
    recommendations.push('Pre-treatment assessment required')
    recommendations.push('Informed consent mandatory')
  }
  
  // Medication risks
  if (treatment.medications && treatment.medications.length > 0) {
    riskFactors.push('medication_involved')
    recommendations.push('Allergy screening required')
    recommendations.push('Drug interaction check required')
  }
  
  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'low'
  if (riskFactors.length >= 3) {
    riskLevel = 'high'
    recommendations.push('Senior professional supervision required')
    recommendations.push('Enhanced monitoring protocol')
  } else if (riskFactors.length >= 1) {
    riskLevel = 'medium'
    recommendations.push('Standard monitoring protocol')
  }
  
  return { riskLevel, recommendations }
}

// Export validation utilities
export const HEALTHCARE_VALIDATION_UTILS = {
  validateCPF,
  validatePhone,
  validateBrazilianDate,
  validateCEP,
  validateRG,
  validateEmail,
  validatePatientData,
  validateLGPDConsent,
  anonymizePatientData,
  formatHealthcareDate,
  formatHealthcareTime,
  generateAuditTrail,
  validateDataRetention,
  assessTreatmentRisk,
}