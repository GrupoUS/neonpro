/**
 * Healthcare Test Validators
 * 
 * Specialized validation utilities for healthcare testing scenarios.
 * Provides validators for regulatory compliance, clinical safety, data quality,
 * and healthcare-specific business rules.
 */

import { expect } from 'vitest'

// Brazilian Healthcare Data Validators
export class BrazilianHealthcareValidators {
  // CPF Validation
  static validateCPF(cpf: string): boolean {
    if (!cpf) return false
    
    // Remove non-numeric characters
    const cleanCPF = cpf.replace(/\D/g, '')
    
    // Check basic format
    if (cleanCPF.length !== 11) return false
    
    // Check if all digits are the same
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false
    
    // Validate first digit
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF[i]) * (10 - i)
    }
    let remainder = 11 - (sum % 11)
    const digit1 = remainder >= 10 ? 0 : remainder
    
    if (parseInt(cleanCPF[9]) !== digit1) return false
    
    // Validate second digit
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF[i]) * (11 - i)
    }
    remainder = 11 - (sum % 11)
    const digit2 = remainder >= 10 ? 0 : remainder
    
    return parseInt(cleanCPF[10]) === digit2
  }

  // CRM Validation
  static validateCRM(crm: string): boolean {
    if (!crm) return false
    
    // Format: CRM/XX 123456
    const crmPattern = /^CRM\/[A-Z]{2}\s\d{4,6}$/
    return crmPattern.test(crm)
  }

  // CNPJ Validation
  static validateCNPJ(cnpj: string): boolean {
    if (!cnpj) return false
    
    // Remove non-numeric characters
    const cleanCNPJ = cnpj.replace(/\D/g, '')
    
    // Check basic format
    if (cleanCNPJ.length !== 14) return false
    
    // Check if all digits are the same
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false
    
    // Validate first digit
    let sum = 0
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanCNPJ[i]) * weights1[i]
    }
    let remainder = 11 - (sum % 11)
    const digit1 = remainder >= 10 ? 0 : remainder
    
    if (parseInt(cleanCNPJ[12]) !== digit1) return false
    
    // Validate second digit
    sum = 0
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleanCNPJ[i]) * weights2[i]
    }
    remainder = 11 - (sum % 11)
    const digit2 = remainder >= 10 ? 0 : remainder
    
    return parseInt(cleanCNPJ[13]) === digit2
  }

  // Phone Number Validation (Brazilian format)
  static validatePhoneNumber(phone: string): boolean {
    if (!phone) return false
    
    // Formats: (11) 98765-4321 or 11987654321
    const phonePattern = /^\(\d{2}\)\s\d{5}-\d{4}$|^\d{10,11}$/
    return phonePattern.test(phone)
  }

  // ZIP Code Validation (Brazilian format)
  static validateZIPCode(zipCode: string): boolean {
    if (!zipCode) return false
    
    // Format: 12345-678
    const zipPattern = /^\d{5}-\d{3}$/
    return zipPattern.test(zipCode)
  }
}

// Healthcare Data Quality Validators
export class HealthcareDataQualityValidators {
  // Patient Data Validation
  static validatePatientData(patient: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Required fields
    if (!patient.id) errors.push('Patient ID is required')
    if (!patient.name) errors.push('Patient name is required')
    if (!patient.cpf) errors.push('Patient CPF is required')
    if (!patient.dateOfBirth) errors.push('Date of birth is required')

    // Format validation
    if (patient.cpf && !BrazilianHealthcareValidators.validateCPF(patient.cpf)) {
      errors.push('Invalid CPF format')
    }

    if (patient.contact?.phone && !BrazilianHealthcareValidators.validatePhoneNumber(patient.contact.phone)) {
      errors.push('Invalid phone number format')
    }

    if (patient.contact?.emergencyContact?.phone && 
        !BrazilianHealthcareValidators.validatePhoneNumber(patient.contact.emergencyContact.phone)) {
      errors.push('Invalid emergency contact phone format')
    }

    // Age validation
    if (patient.dateOfBirth) {
      const birthDate = new Date(patient.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      
      if (age < 0 || age > 120) {
        errors.push('Invalid age: must be between 0 and 120 years')
      }
      
      // For aesthetic treatments, minimum age is typically 18
      if (age < 18) {
        errors.push('Patient must be 18 years or older for aesthetic treatments')
      }
    }

    // Contact validation
    if (!patient.contact?.email) errors.push('Patient email is required')
    if (!patient.contact?.phone) errors.push('Patient phone is required')
    if (!patient.contact?.emergencyContact) errors.push('Emergency contact is required')

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Professional Data Validation
  static validateProfessionalData(professional: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Required fields
    if (!professional.id) errors.push('Professional ID is required')
    if (!professional.name) errors.push('Professional name is required')
    if (!professional.crm) errors.push('Professional CRM is required')
    if (!professional.specialty) errors.push('Professional specialty is required')

    // Format validation
    if (professional.crm && !BrazilianHealthcareValidators.validateCRM(professional.crm)) {
      errors.push('Invalid CRM format')
    }

    // Experience validation
    if (professional.experience) {
      if (professional.experience.years < 0 || professional.experience.years > 50) {
        errors.push('Invalid experience years: must be between 0 and 50')
      }
    }

    // Contact validation
    if (!professional.contact?.email) errors.push('Professional email is required')
    if (!professional.contact?.phone) errors.push('Professional phone is required')

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Medical Record Validation
  static validateMedicalRecord(medicalRecord: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Blood type validation
    if (medicalRecord.bloodType) {
      const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
      if (!validBloodTypes.includes(medicalRecord.bloodType)) {
        errors.push(`Invalid blood type: ${medicalRecord.bloodType}`)
      }
    }

    // Allergies validation
    if (medicalRecord.allergies) {
      if (!Array.isArray(medicalRecord.allergies)) {
        errors.push('Allergies must be an array')
      }
    }

    // Medications validation
    if (medicalRecord.currentMedications) {
      if (!Array.isArray(medicalRecord.currentMedications)) {
        errors.push('Current medications must be an array')
      } else {
        medicalRecord.currentMedications.forEach((med: any, index: number) => {
          if (!med.name) errors.push(`Medication ${index} name is required`)
          if (!med.dosage) errors.push(`Medication ${index} dosage is required`)
        })
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// Regulatory Compliance Validators
export class RegulatoryComplianceValidators {
  // LGPD Compliance Validation
  static validateLGPDCompliance(data: any): { isCompliant: boolean; violations: string[] } {
    const violations: string[] = []

    // Check for explicit consent
    if (!data.consent) {
      violations.push('Missing consent information')
    } else {
      if (!data.consent.dataProcessing) violations.push('Missing data processing consent')
      if (!data.consent.timestamp) violations.push('Missing consent timestamp')
      if (!data.consent.version) violations.push('Missing consent version')
    }

    // Check for data minimization
    const sensitiveFields = ['cpf', 'medicalRecord', 'diagnosis', 'treatment']
    sensitiveFields.forEach(field => {
      if (data[field] && !data.consent?.dataProcessing) {
        violations.push(`Sensitive data ${field} without proper consent`)
      }
    })

    // Check for data retention policies
    if (!data.metadata?.createdAt) {
      violations.push('Missing data creation timestamp for retention policy')
    }

    // Check for anonymization/pseudonymization capabilities
    if (data.cpf && !data._anonymized && !data._pseudonymized) {
      violations.push('Sensitive personal data not anonymized or pseudonymized')
    }

    return {
      isCompliant: violations.length === 0,
      violations
    }
  }

  // ANVISA Compliance Validation
  static validateANVISACompliance(facility: any): { isCompliant: boolean; violations: string[] } {
    const violations: string[] = []

    // Check for ANVISA registration
    if (!facility.accreditation?.anvisa) {
      violations.push('Missing ANVISA accreditation number')
    }

    // Check for accreditation expiry
    if (facility.accreditation?.expiryDate) {
      const expiryDate = new Date(facility.accreditation.expiryDate)
      const today = new Date()
      
      if (expiryDate <= today) {
        violations.push('ANVISA accreditation has expired')
      }
    }

    // Check for required equipment
    const requiredEquipment = ['emergencyKit', 'defibrillator']
    requiredEquipment.forEach(equipment => {
      if (!facility.capabilities?.[equipment]) {
        violations.push(`Missing required equipment: ${equipment}`)
      }
    })

    // Check for emergency protocols
    if (!facility.capabilities?.emergencyProtocol) {
      violations.push('Missing emergency response protocol')
    }

    return {
      isCompliant: violations.length === 0,
      violations
    }
  }

  // CFM Compliance Validation
  static validateCFMCompliance(professional: any): { isCompliant: boolean; violations: string[] } {
    const violations: string[] = []

    // Check for valid CRM
    if (!professional.crm) {
      violations.push('Missing professional CRM')
    } else if (!BrazilianHealthcareValidators.validateCRM(professional.crm)) {
      violations.push('Invalid CRM format')
    }

    // Check for professional qualifications
    if (!professional.qualifications || professional.qualifications.length === 0) {
      violations.push('Missing professional qualifications')
    }

    // Check for experience documentation
    if (!professional.experience) {
      violations.push('Missing professional experience information')
    }

    // Check for ethical conduct record
    if (!professional.ethicsRecord) {
      violations.push('Missing ethics compliance record')
    }

    return {
      isCompliant: violations.length === 0,
      violations
    }
  }

  // HIPAA Compliance Validation (for international data)
  static validateHIPAACompliance(data: any): { isCompliant: boolean; violations: string[] } {
    const violations: string[] = []

    // Check for PHI (Protected Health Information) protection
    const phiFields = ['name', 'cpf', 'dateOfBirth', 'medicalRecord', 'contact']
    phiFields.forEach(field => {
      if (data[field] && !data._encrypted) {
        violations.push(`Unencrypted PHI in field: ${field}`)
      }
    })

    // Check for access controls
    if (!data.accessControls) {
      violations.push('Missing access controls for PHI')
    }

    // Check for audit trail
    if (!data.auditTrail) {
      violations.push('Missing audit trail for data access')
    }

    return {
      isCompliant: violations.length === 0,
      violations
    }
  }
}

// Clinical Safety Validators
export class ClinicalSafetyValidators {
  // Risk Assessment Validation
  static validateRiskAssessment(patient: any, treatment: any): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = []

    // Age-related risks
    if (patient.age > 65) {
      warnings.push('Elderly patient - increased risk for complications')
    }

    // Allergy-related risks
    if (patient.medicalRecord?.allergies && patient.medicalRecord.allergies.length > 0) {
      warnings.push(`Patient has allergies: ${patient.medicalRecord.allergies.join(', ')}`)
    }

    // Chronic condition risks
    if (patient.medicalRecord?.chronicConditions) {
      const highRiskConditions = ['Diabetes', 'Hipertensão', 'Doença cardíaca']
      const patientConditions = patient.medicalRecord.chronicConditions
      
      highRiskConditions.forEach(condition => {
        if (patientConditions.includes(condition)) {
          warnings.push(`Patient has ${condition} - requires special precautions`)
        }
      })
    }

    // Medication interaction risks
    if (patient.medicalRecord?.currentMedications) {
      const medications = patient.medicalRecord.currentMedications.map((m: any) => m.name)
      if (medications.length > 3) {
        warnings.push('Patient on multiple medications - potential interactions')
      }
      
      // Check for anticoagulants
      const anticoagulants = ['Warfarina', 'Heparina', 'Clopidogrel']
      if (medications.some(med => anticoagulants.includes(med))) {
        warnings.push('Patient on anticoagulants - bleeding risk')
      }
    }

    return {
      isValid: warnings.length === 0,
      warnings
    }
  }

  // Emergency Protocol Validation
  static validateEmergencyProtocol(protocol: any): { isValid: boolean; gaps: string[] } {
    const gaps: string[] = []

    // Check for emergency contacts
    if (!protocol.emergencyContacts || protocol.emergencyContacts.length === 0) {
      gaps.push('Missing emergency contacts')
    }

    // Check for emergency equipment
    const requiredEquipment = ['emergencyKit', 'defibrillator', 'oxygen']
    requiredEquipment.forEach(equipment => {
      if (!protocol.equipment?.[equipment]) {
        gaps.push(`Missing emergency equipment: ${equipment}`)
      }
    })

    // Check for emergency procedures
    const requiredProcedures = ['anaphylaxis', 'cardiac_arrest', 'respiratory_distress']
    requiredProcedures.forEach(procedure => {
      if (!protocol.procedures?.[procedure]) {
        gaps.push(`Missing emergency procedure: ${procedure}`)
      }
    })

    // Check for response time targets
    if (!protocol.responseTimes) {
      gaps.push('Missing emergency response time targets')
    }

    return {
      isValid: gaps.length === 0,
      gaps
    }
  }

  // Treatment Safety Validation
  static validateTreatmentSafety(treatment: any): { isValid: boolean; concerns: string[] } {
    const concerns: string[] = []

    // Check for contraindications
    if (treatment.contraindications && treatment.contraindications.length > 0) {
      concerns.push(`Treatment has contraindications: ${treatment.contraindications.join(', ')}`)
    }

    // Check for risk disclosure
    if (!treatment.risks || treatment.risks.length === 0) {
      concerns.push('Missing risk disclosure')
    }

    // Check for informed consent
    if (!treatment.consent) {
      concerns.push('Missing informed consent')
    }

    // Check for professional qualification
    if (!treatment.professionalQualification) {
      concerns.push('Missing professional qualification verification')
    }

    // Check for aftercare instructions
    if (!treatment.aftercare) {
      concerns.push('Missing aftercare instructions')
    }

    return {
      isValid: concerns.length === 0,
      concerns
    }
  }
}

// Performance Validators
export class PerformanceValidators {
  // Response Time Validation
  static validateResponseTime(actualTime: number, maxTime: number, metricName: string): void {
    expect(actualTime).toBeLessThanOrEqual(maxTime, 
      `${metricName} response time ${actualTime}ms exceeds maximum ${maxTime}ms`)
  }

  // Success Rate Validation
  static validateSuccessRate(successCount: number, totalCount: number, minRate: number, metricName: string): void {
    const actualRate = (successCount / totalCount) * 100
    expect(actualRate).toBeGreaterThanOrEqual(minRate,
      `${metricName} success rate ${actualRate.toFixed(2)}% below minimum ${minRate}%`)
  }

  // Throughput Validation
  static validateThroughput(actualThroughput: number, minThroughput: number, metricName: string): void {
    expect(actualThroughput).toBeGreaterThanOrEqual(minThroughput,
      `${metricName} throughput ${actualThroughput} below minimum ${minThroughput}`)
  }

  // Availability Validation
  static validateAvailability(uptime: number, minAvailability: number, metricName: string): void {
    expect(uptime).toBeGreaterThanOrEqual(minAvailability,
      `${metricName} availability ${uptime.toFixed(4)} below minimum ${minAvailability}`)
  }
}

// Accessibility Validators
export class AccessibilityValidators {
  // WCAG 2.1 AA Compliance Validation
  static validateWCAGCompliance(element: any): { isCompliant: boolean; violations: string[] } {
    const violations: string[] = []

    // Check for alt text on images
    if (element.type === 'img' && !element.alt) {
      violations.push('Missing alt text for image')
    }

    // Check for color contrast
    if (element.contrastRatio && element.contrastRatio < 4.5) {
      violations.push('Insufficient color contrast ratio')
    }

    // Check for keyboard navigation
    if (!element.keyboardAccessible) {
      violations.push('Element not keyboard accessible')
    }

    // Check for ARIA labels
    if (element.requiresAria && !element.ariaLabel) {
      violations.push('Missing ARIA label')
    }

    // Check for focus indicators
    if (!element.focusVisible) {
      violations.push('Missing focus indicator')
    }

    return {
      isCompliant: violations.length === 0,
      violations
    }
  }

  // Screen Reader Compatibility Validation
  static validateScreenReaderCompatibility(element: any): { isCompatible: boolean; issues: string[] } {
    const issues: string[] = []

    // Check for proper semantic HTML
    if (!element.semantic) {
      issues.push('Element uses non-semantic HTML')
    }

    // Check for reading order
    if (!element.readingOrder) {
      issues.push('Element disrupts reading order')
    }

    // Check for form labels
    if (element.type === 'input' && !element.label) {
      issues.push('Form input missing associated label')
    }

    return {
      isCompatible: issues.length === 0,
      issues
    }
  }
}

// Integration Test Validators
export class IntegrationTestValidators {
  // Data Flow Validation
  static validateDataFlow(fromSystem: string, toSystem: string, data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check data integrity
    if (!data || typeof data !== 'object') {
      errors.push('Invalid data format')
      return { isValid: false, errors }
    }

    // Check required fields
    if (!data.timestamp) errors.push('Missing timestamp')
    if (!data.source) errors.push('Missing source system')
    if (!data.destination) errors.push('Missing destination system')

    // Check data format consistency
    if (data.source !== fromSystem) {
      errors.push(`Source system mismatch: expected ${fromSystem}, got ${data.source}`)
    }

    if (data.destination !== toSystem) {
      errors.push(`Destination system mismatch: expected ${toSystem}, got ${data.destination}`)
    }

    // Check for encryption requirements
    const sensitiveFields = ['cpf', 'medicalRecord', 'diagnosis']
    sensitiveFields.forEach(field => {
      if (data[field] && !data.encrypted) {
        errors.push(`Sensitive data ${field} not encrypted during transmission`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // API Response Validation
  static validateAPIResponse(response: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check response structure
    if (!response) {
      errors.push('Empty response')
      return { isValid: false, errors }
    }

    // Check status code
    if (!response.status) {
      errors.push('Missing status code')
    } else if (response.status < 200 || response.status >= 300) {
      errors.push(`HTTP error status: ${response.status}`)
    }

    // Check response data
    if (!response.data) {
      errors.push('Missing response data')
    }

    // Check for error handling
    if (response.status >= 400 && !response.error) {
      errors.push('Error response missing error information')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// Custom Test Matchers for Healthcare
export class HealthcareTestMatchers {
  // Custom matcher for valid CPF
  static toBeValidCPF(received: string) {
    const pass = BrazilianHealthcareValidators.validateCPF(received)
    return {
      pass,
      message: () => `Expected ${received} to be a valid CPF`
    }
  }

  // Custom matcher for valid CRM
  static toBeValidCRM(received: string) {
    const pass = BrazilianHealthcareValidators.validateCRM(received)
    return {
      pass,
      message: () => `Expected ${received} to be a valid CRM`
    }
  }

  // Custom matcher for LGPD compliance
  static toBeLGPDCompliant(received: any) {
    const result = RegulatoryComplianceValidators.validateLGPDCompliance(received)
    return {
      pass: result.isCompliant,
      message: () => result.violations.length > 0 
        ? `LGPD violations: ${result.violations.join(', ')}`
        : 'Data is LGPD compliant'
    }
  }

  // Custom matcher for clinical safety
  static toBeClinicallySafe(received: any) {
    const warnings = ClinicalSafetyValidators.validateRiskAssessment(received.patient, received.treatment).warnings
    return {
      pass: warnings.length === 0,
      message: () => warnings.length > 0 
        ? `Clinical safety warnings: ${warnings.join(', ')}`
        : 'Treatment is clinically safe'
    }
  }
}

// Export all validators for easy importing
export const healthcareValidators = {
  brazilian: BrazilianHealthcareValidators,
  dataQuality: HealthcareDataQualityValidators,
  compliance: RegulatoryComplianceValidators,
  clinical: ClinicalSafetyValidators,
  performance: PerformanceValidators,
  accessibility: AccessibilityValidators,
  integration: IntegrationTestValidators,
  matchers: HealthcareTestMatchers
}

// Default export
export default healthcareValidators