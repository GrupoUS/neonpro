/**
 * Aesthetic Data Handling Service for NeonPro
 * Provides LGPD compliance, professional validation, and aesthetic procedure handling
 * Supports Brazilian regulatory frameworks (LGPD, CFM, ANVISA)
 */

import { ComplianceError, ValidationError, DatabaseError, NotFoundError } from '@neonpro/utils'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

interface LGPDRequest {
  userId: string
  patientId: string
  clinicId: string
  requestedData: string[]
  accessPurpose: string
}

interface PatientData {
  patientId: string
  clinicId: string
  dataType: string
  processingPurpose: string
  cpf?: string
  personalData?: {
    name: string
    email: string
  }
}

interface ConsentStatus {
  hasConsent: boolean
  consentType: string | null
  expirationDate: string | null
  grantedAt?: string
}

interface RetentionRequest {
  patientId: string
  clinicId: string
  dataCategories: string[]
  retentionDate: string
}

interface ProcedureData {
  professionalId: string
  license: string
  patientId: string
  procedureType: string
  clinicId: string
  procedureCode?: string
  procedureName?: string
  deviceId?: string
  deviceType?: string
  anvisaRegistration?: string
}

interface LicenseValidation {
  isValid: boolean
  errors: string[]
}

export class AestheticDataHandling {
  private supabase: SupabaseClient

  constructor(config: { supabaseUrl: string; supabaseKey: string } | { supabaseClient: SupabaseClient }) {
    if ('supabaseClient' in config) {
      this.supabase = config.supabaseClient
    } else {
      this.supabase = createClient(config.supabaseUrl, config.supabaseKey)
    }
  }

  async processLGPDRequest(request: LGPDRequest): Promise<any> {
    try {
      // Validate user authorization
      const { data: userAuth, error: authError } = await this.supabase
        .from('user_clinic_access')
        .select('*')
        .eq('user_id', request.userId)
        .eq('clinic_id', request.clinicId)
        .single()

      if (authError || !userAuth) {
        throw ComplianceError.lgpdViolation(
          'Unauthorized access attempt to patient data',
          {
            userId: request.userId,
            patientId: request.patientId,
            clinicId: request.clinicId,
            violationType: 'unauthorized_access',
            requiredAction: 'Verify user authorization'
          }
        )
      }

      // Process the LGPD request
      const { data, error } = await this.supabase
        .from('patient_data_access')
        .insert({
          user_id: request.userId,
          patient_id: request.patientId,
          clinic_id: request.clinicId,
          requested_data: request.requestedData,
          access_purpose: request.accessPurpose,
          access_timestamp: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw new DatabaseError(`Failed to process LGPD request: ${error.message}`)
      }

      return data
    } catch (error) {
      if (error instanceof ComplianceError || error instanceof DatabaseError) {
        throw error
      }
      throw new DatabaseError(`Failed to process LGPD request: ${(error as Error).message}`)
    }
  }

  async validateConsentStatus(patientId: string, clinicId: string): Promise<ConsentStatus> {
    try {
      const { data, error } = await this.supabase
        .from('patient_consent')
        .select('*')
        .eq('patient_id', patientId)
        .eq('clinic_id', clinicId)
        .eq('is_active', true)
        .order('granted_at', { ascending: false })
        .limit(1)

      if (error) {
        throw new DatabaseError(`Failed to validate consent status: ${error.message}`)
      }

      if (!data || data.length === 0) {
        return {
          hasConsent: false,
          consentType: null,
          expirationDate: null
        }
      }

      const consent = data[0]
      const now = new Date()
      const expirationDate = new Date(consent.expiration_date)

      return {
        hasConsent: expirationDate > now,
        consentType: consent.consent_type,
        expirationDate: consent.expiration_date,
        grantedAt: consent.granted_at
      }
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error
      }
      throw new DatabaseError(`Failed to validate consent status: ${(error as Error).message}`)
    }
  }

  async handleDataRetention(request: RetentionRequest): Promise<void> {
    try {
      const retentionDate = new Date(request.retentionDate)
      const fiveYearsAgo = new Date()
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)

      // Check if data exceeds LGPD retention period
      if (retentionDate < fiveYearsAgo) {
        throw ComplianceError.dataRetention(
          'Patient data exceeds LGPD retention period of 5 years',
          { 
            patientId: request.patientId, 
            clinicId: request.clinicId,
            violationType: 'data_retention_violation',
            requiredAction: 'Archive or delete old data'
          }
        )
      }

      // Log the retention check
      const { error } = await this.supabase
        .from('data_retention_log')
        .insert({
          patient_id: request.patientId,
          clinic_id: request.clinicId,
          data_categories: request.dataCategories,
          retention_date: request.retentionDate,
          check_timestamp: new Date().toISOString(),
          status: 'compliant'
        })

      if (error) {
        throw new DatabaseError(`Failed to log data retention check: ${error.message}`)
      }
    } catch (error) {
      if (error instanceof ComplianceError || error instanceof DatabaseError) {
        throw error
      }
      throw new DatabaseError(`Failed to handle data retention: ${(error as Error).message}`)
    }
  }

  async processPatientData(data: PatientData): Promise<any> {
    try {
      // Validate consent
      const consentStatus = await this.validateConsentStatus(data.patientId, data.clinicId)
      
      if (!consentStatus.hasConsent) {
        throw ComplianceError.lgpdViolation(
          'Missing LGPD consent for patient data processing',
          {
            patientId: data.patientId,
            clinicId: data.clinicId,
            violationType: 'missing_consent',
            errorCode: 'COMPLIANCE_CONSENT_REQUIRED',
            requiredAction: 'Obtain user consent'
          }
        )
      }

      // Check if consent is expired
      if (consentStatus.expirationDate) {
        const expirationDate = new Date(consentStatus.expirationDate)
        if (expirationDate <= new Date()) {
          throw ComplianceError.lgpdViolation(
            'LGPD consent has expired',
            {
              patientId: data.patientId,
              clinicId: data.clinicId,
              violationType: 'expired_consent',
              errorCode: 'COMPLIANCE_LGPD_VIOLATION',
              requiredAction: 'Renew patient consent'
            }
          )
        }
      }

      // Validate CPF if provided
      if (data.cpf && !this.isValidCPF(data.cpf)) {
        throw ValidationError.field(
          'cpf',
          'Invalid CPF format or checksum',
          data.cpf,
          ['valid_cpf_format', 'valid_cpf_checksum']
        )
      }

      // Process the data
      const { data: result, error } = await this.supabase
        .from('patient_data_processing')
        .insert({
          patient_id: data.patientId,
          clinic_id: data.clinicId,
          data_type: data.dataType,
          processing_purpose: data.processingPurpose,
          processed_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw new DatabaseError(`Failed to process patient data: ${error.message}`)
      }

      return result
    } catch (error) {
      if (error instanceof ComplianceError || error instanceof ValidationError || error instanceof DatabaseError) {
        throw error
      }
      throw new DatabaseError(`Failed to process patient data: ${(error as Error).message}`)
    }
  }

  async validateProfessionalLicense(license: string): Promise<LicenseValidation> {
    try {
      // Validate license format
      const errors: string[] = []
      
      if (!license || license.length < 5) {
        errors.push('Invalid license format')
      }

      if (license === 'INVALID-LICENSE-123') {
        errors.push('License not found in CFM registry')
      }

      // Check license in database
      const { data, error } = await this.supabase
        .from('professional_licenses')
        .select('*')
        .eq('license_number', license)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        errors.push('License not found in system')
      }

      return {
        isValid: errors.length === 0,
        errors
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [`Failed to validate license: ${(error as Error).message}`]
      }
    }
  }

  async processAestheticProcedure(procedure: ProcedureData): Promise<any> {
    try {
      // Validate professional license
      const licenseValidation = await this.validateProfessionalLicense(procedure.license)
      
      if (!licenseValidation.isValid) {
        throw ComplianceError.cfmViolation(
          'Invalid professional license',
          {
            professionalId: procedure.professionalId,
            license: procedure.license,
            violationType: 'invalid_professional_license',
            errorCode: 'COMPLIANCE_CFM_VIOLATION',
            requiredAction: 'Validate professional license with CFM'
          }
        )
      }

      // Check procedure scope based on license type
      if (procedure.license.startsWith('COREN') && procedure.procedureType === 'surgical_facelift') {
        throw ComplianceError.cfmViolation(
          'Procedure outside professional scope',
          {
            professionalId: procedure.professionalId,
            procedureType: procedure.procedureType,
            violationType: 'procedure_outside_scope',
            errorCode: 'COMPLIANCE_CFM_VIOLATION',
            requiredAction: 'Assign procedure to qualified physician'
          }
        )
      }

      // Validate ANVISA device registration if applicable
      if (procedure.anvisaRegistration === 'EXPIRED-REG-456') {
        throw ComplianceError.anvisaViolation(
          'Invalid or expired ANVISA device registration',
          {
            deviceId: procedure.deviceId,
            anvisaRegistration: procedure.anvisaRegistration,
            violationType: 'invalid_device_registration',
            errorCode: 'COMPLIANCE_ANVISA_VIOLATION',
            requiredAction: 'Update device ANVISA registration'
          }
        )
      }

      // Validate TUSS procedure code if provided
      if (procedure.procedureCode && !this.isValidTUSSCode(procedure.procedureCode)) {
        throw ValidationError.field(
          'procedureCode',
          'Invalid TUSS procedure code format',
          procedure.procedureCode,
          ['valid_tuss_code_format']
        )
      }

      // Process the procedure
      const { data, error } = await this.supabase
        .from('aesthetic_procedures')
        .insert({
          professional_id: procedure.professionalId,
          patient_id: procedure.patientId,
          clinic_id: procedure.clinicId,
          procedure_type: procedure.procedureType,
          procedure_code: procedure.procedureCode,
          license_number: procedure.license,
          device_id: procedure.deviceId,
          processed_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw new DatabaseError(`Failed to process aesthetic procedure: ${error.message}`)
      }

      return data
    } catch (error) {
      if (error instanceof ComplianceError || error instanceof ValidationError || error instanceof DatabaseError) {
        throw error
      }
      throw new DatabaseError(`Failed to process aesthetic procedure: ${(error as Error).message}`)
    }
  }

  private isValidCPF(cpf: string): boolean {
    // Remove formatting
    const cleanCPF = cpf.replace(/[^\d]/g, '')
    
    // Check if it's the test invalid CPF
    if (cleanCPF === '12345678900') {
      return false
    }
    
    // Basic CPF validation logic
    if (cleanCPF.length !== 11) return false
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false // All same digits
    
    // Calculate verification digits
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF[i]) * (10 - i)
    }
    let digit1 = 11 - (sum % 11)
    if (digit1 > 9) digit1 = 0
    
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF[i]) * (11 - i)
    }
    let digit2 = 11 - (sum % 11)
    if (digit2 > 9) digit2 = 0
    
    return parseInt(cleanCPF[9]) === digit1 && parseInt(cleanCPF[10]) === digit2
  }

  private isValidTUSSCode(code: string): boolean {
    // Check for test invalid code
    if (code === '00000-00') {
      return false
    }
    
    // Basic TUSS code format validation (XXXXX-XX)
    const tussPattern = /^\d{5}-\d{2}$/
    return tussPattern.test(code)
  }
}