/**
 * Patient Identity Service with LGPD Compliance
 *
 * Comprehensive patient identity management for Brazilian aesthetic clinics
 * following Lei Geral de Proteção de Dados (LGPD) requirements.
 *
 * Features:
 * - LGPD-compliant patient registration
 * - Identity verification and validation
 * - Consent management
 * - Data retention and anonymization
 * - Multi-factor authentication ready
 * - Integration with aesthetic clinic workflows
 */

import { logger } from '@/utils/healthcare-errors.js'
import { z } from 'zod'
import { createAdminClient } from '../clients/supabase.js'
import { sanitizeForAI } from './ai-security-service'

// LGPD Consent Types
export const LGPD_CONSENT_TYPES = {
  TREATMENT: 'treatment',
  DATA_SHARING: 'data_sharing',
  MARKETING: 'marketing',
  RESEARCH: 'research',
  EMERGENCY_CONTACT: 'emergency_contact',
  PHOTOGRAPHY: 'photography',
  FINANCIAL: 'financial',
} as const

export type LGPDConsentType = keyof typeof LGPD_CONSENT_TYPES

// LGPD Consent Status
export const CONSENT_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
  SUSPENDED: 'suspended',
} as const

export type ConsentStatus = keyof typeof CONSENT_STATUS

// Data Retention Policies (in days)
export const RETENTION_POLICIES = {
  MEDICAL_RECORDS: 365 * 20, // 20 years
  APPOINTMENTS: 365 * 10, // 10 years
  FINANCIAL_DATA: 365 * 5, // 5 years
  MARKETING_CONSENT: 365 * 2, // 2 years
  CONVERSATIONS: 365, // 1 year
  ANALYTICS: 90, // 90 days
} as const

// Service Interfaces
export interface PatientIdentity {
  id: string
  clinicId: string
  userId?: string
  fullName: string
  cpf?: string
  dateOfBirth?: Date
  email?: string
  phone: string
  lgpdConsentGiven: boolean
  lgpdConsentDate: Date
  dataRetentionUntil: Date
  isActive: boolean
  riskProfile: {
    noShowRisk: number
    sensitivityLevel: 'low' | 'medium' | 'high'
    specialNeeds?: string[]
  }
  preferences: {
    contactMethod: 'email' | 'phone' | 'whatsapp'
    language: 'pt-BR' | 'en-US'
    timezone: string
    marketingOptIn: boolean
  }
  demographics: {
    skinType?: string
    concerns: string[]
    previousTreatments: string[]
    allergies: string[]
    medications: string[]
    pregnancyStatus?: 'none' | 'possible' | 'confirmed'
  }
  createdAt: Date
  updatedAt: Date
}

export interface CreatePatientInput {
  clinicId: string
  fullName: string
  cpf?: string
  dateOfBirth?: string
  email?: string
  phone: string
  skinType?: string
  concerns?: string[]
  allergies?: string[]
  medications?: string[]
  pregnancyStatus?: 'none' | 'possible' | 'confirmed'
  consentTypes: LGPDConsentType[]
  marketingOptIn?: boolean
  contactMethod?: 'email' | 'phone' | 'whatsapp'
}

export interface ConsentRecord {
  id: string
  patientId: string
  consentType: LGPDConsentType
  status: ConsentStatus
  purpose: string
  dataRecipients: string[]
  retentionPeriod: number // days
  expiresAt?: Date
  givenAt: Date
  ipAddress?: string
  userAgent?: string
  version: string
}

export interface PatientSearchOptions {
  query?: string
  clinicId: string
  includeInactive?: boolean
  limit?: number
  offset?: number
}

export interface ServiceResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Validation Schemas
const CreatePatientSchema = z.object({
  clinicId: z.string().uuid(),
  fullName: z.string().min(3, 'Name must be at least 3 characters'),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'Invalid CPF format').optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Invalid phone format'),
  skinType: z.string().optional(),
  concerns: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  pregnancyStatus: z.enum('none', 'possible', 'confirmed']).optional(),
  consentTypes: z.array(z.enum(Object.values(LGPD_CONSENT_TYPES) as [string, ...string[]]))
    .min(1, 'At least one consent type is required'),
  marketingOptIn: z.boolean().optional(),
  contactMethod: z.enum('email', 'phone', 'whatsapp']).optional(),
})

class PatientIdentityService {
  private supabase = createAdminClient()

  /**
   * Create new patient with LGPD compliance
   */
  async createPatient(input: CreatePatientInput): Promise<ServiceResponse<PatientIdentity>> {
    try {
      // Validate input
      const validated = CreatePatientSchema.parse(input)

      // Check for existing patient
      const existingPatient = await this.findExistingPatient(validated.clinicId, validated)
      if (existingPatient) {
        return {
          success: false,
          error: 'Patient with this information already exists',
        }
      }

      // Calculate data retention date
      const maxRetention = Math.max(
        ...validated.consentTypes.map(type =>
          RETENTION_POLICIES[type.toUpperCase() as keyof typeof RETENTION_POLICIES] || 365
        ),
      )
      const dataRetentionUntil = new Date()
      dataRetentionUntil.setDate(dataRetentionUntil.getDate() + maxRetention)

      // Create patient record
      const { data: patient, error } = await this.supabase
        .from('patients')
        .insert({
          clinic_id: validated.clinicId,
          full_name: validated.fullName,
          cpf: validated.cpf,
          date_of_birth: validated.dateOfBirth,
          email: validated.email,
          phone: validated.phone,
          lgpd_consent_given: true,
          lgpd_consent_date: new Date().toISOString(),
          data_retention_until: dataRetentionUntil.toISOString(),
        })
        .select()
        .single()

      if (error) {
        logger.error('Failed to create patient', { error })
        return {
          success: false,
          error: error.message,
        }
      }

      // Create consent records
      await this.createConsentRecords(patient.id, validated.consentTypes)

      // Update patient demographics and preferences
      await this.updatePatientProfile(patient.id, {
        skinType: validated.skinType,
        concerns: validated.concerns || [],
        allergies: validated.allergies || [],
        medications: validated.medications || [],
        pregnancyStatus: validated.pregnancyStatus,
        contactMethod: validated.contactMethod || 'whatsapp',
        marketingOptIn: validated.marketingOptIn || false,
      })

      // Calculate initial risk profile
      const riskProfile = await this.calculateRiskProfile(patient.id)

      return {
        success: true,
        data: {
          ...this.mapPatientFromDb(patient),
          riskProfile,
          demographics: {
            skinType: validated.skinType,
            concerns: validated.concerns || [],
            previousTreatments: [],
            allergies: validated.allergies || [],
            medications: validated.medications || [],
            pregnancyStatus: validated.pregnancyStatus,
          },
          preferences: {
            contactMethod: validated.contactMethod || 'whatsapp',
            language: 'pt-BR',
            timezone: 'America/Sao_Paulo',
            marketingOptIn: validated.marketingOptIn || false,
          },
        },
        message: 'Patient created successfully with LGPD compliance',
      }
    } catch (error) {
      logger.error('Create patient error', { error })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Get patient by ID with full identity information
   */
  async getPatientById(patientId: string): Promise<ServiceResponse<PatientIdentity>> {
    try {
      const { data: patient, error } = await this.supabase
        .from('patients')
        .select(`
          *,
          clinic:clinics(name, cnpj),
          lgpd_consents:lgpd_consents(
            id,
            consent_type,
            status,
            purpose,
            expires_at,
            given_at
          )
        `)
        .eq('id', patientId)
        .single()

      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      const riskProfile = await this.calculateRiskProfile(patientId)
      const demographics = await this.getPatientDemographics(patientId)
      const preferences = await this.getPatientPreferences(patientId)

      return {
        success: true,
        data: {
          ...this.mapPatientFromDb(patient),
          riskProfile,
          demographics,
          preferences,
        },
      }
    } catch (error) {
      logger.error('Get patient error', { error, patientId })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Search patients with LGPD-compliant filtering
   */
  async searchPatients(options: PatientSearchOptions): Promise<
    ServiceResponse<{
      patients: PatientIdentity[]
      total: number
      page: number
      limit: number
    }>
  > {
    try {
      let query = this.supabase
        .from('patients')
        .select('*', { count: 'exact' })
        .eq('clinic_id', options.clinicId)

      if (!options.includeInactive) {
        // For LGPD compliance, only show active patients by default
        query = query.eq('is_active', true)
      }

      if (options.query) {
        // Search across multiple fields with LGPD compliance
        query = query.or(
          `full_name.ilike.%${options.query}%,phone.ilike.%${options.query}%,email.ilike.%${options.query}%`,
        )
      }

      const limit = options.limit || 20
      const offset = options.offset || 0

      const { data: patients, error, count } = await query
        .order('full_name')
        .range(offset, offset + limit - 1)

      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      // Enrich patient data
      const enrichedPatients = await Promise.all(
        (patients || []).map(async patient => {
          const riskProfile = await this.calculateRiskProfile(patient.id)
          const demographics = await this.getPatientDemographics(patient.id)
          const preferences = await this.getPatientPreferences(patient.id)

          return {
            ...this.mapPatientFromDb(patient),
            riskProfile,
            demographics,
            preferences,
          }
        }),
      )

      return {
        success: true,
        data: {
          patients: enrichedPatients,
          total: count || 0,
          page: Math.floor(offset / limit) + 1,
          limit,
        },
      }
    } catch (error) {
      logger.error('Search patients error', { error, options })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Update patient consent (LGPD compliance requirement)
   */
  async updateConsent(
    patientId: string,
    consentType: LGPDConsentType,
    action: 'grant' | 'revoke',
  ): Promise<ServiceResponse<ConsentRecord>> {
    try {
      const status = action === 'grant' ? CONSENT_STATUS.ACTIVE : CONSENT_STATUS.REVOKED
      const expiresAt = action === 'grant' ? this.calculateConsentExpiry(consentType) : undefined

      const { data: consent, error } = await this.supabase
        .from('lgpd_consents')
        .upsert({
          patient_id: patientId,
          consent_type: consentType,
          status,
          purpose: this.getConsentPurpose(consentType),
          retention_period:
            RETENTION_POLICIES[consentType.toUpperCase() as keyof typeof RETENTION_POLICIES],
          expires_at: expiresAt?.toISOString(),
          version: '1.0',
        })
        .select()
        .single()

      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      // Update patient data retention
      await this.updateDataRetention(patientId)

      return {
        success: true,
        data: this.mapConsentFromDb(consent),
        message: `Consent ${action}ed successfully`,
      }
    } catch (error) {
      logger.error('Update consent error', { error, patientId, consentType, action })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Anonymize patient data (LGPD right to be forgotten)
   */
  async anonymizePatient(patientId: string): Promise<ServiceResponse<void>> {
    try {
      // Get patient data before anonymization
      const { data: patient } = await this.supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single()

      if (!patient) {
        return {
          success: false,
          error: 'Patient not found',
        }
      }

      // Create audit log
      await this.supabase
        .from('audit_logs')
        .insert({
          patient_id: patientId,
          action: 'ANONYMIZE',
          resource_type: 'PATIENT_DATA',
          details: { reason: 'LGPD right to be forgotten' },
        })

      // Anonymize sensitive data
      const { error } = await this.supabase
        .from('patients')
        .update({
          full_name: 'ANONYMIZED',
          cpf: null,
          email: null,
          phone: 'ANONYMIZED',
          lgpd_consent_given: false,
          lgpd_consent_date: null,
          is_active: false,
          data_retention_until: new Date().toISOString(),
        })
        .eq('id', patientId)

      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: true,
        message: 'Patient data anonymized successfully',
      }
    } catch (error) {
      logger.error('Anonymize patient error', { error, patientId })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Get patient consent status
   */
  async getPatientConsents(patientId: string): Promise<ServiceResponse<ConsentRecord[]>> {
    try {
      const { data: consents, error } = await this.supabase
        .from('lgpd_consents')
        .select('*')
        .eq('patient_id', patientId)
        .order('given_at', { ascending: false })

      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: true,
        data: consents.map(c => this.mapConsentFromDb(c)),
      }
    } catch (error) {
      logger.error('Get patient consents error', { error, patientId })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Sanitize patient data for AI processing
   */
  async sanitizeForAIProcessing(patientId: string): Promise<ServiceResponse<string>> {
    try {
      const { data: patient, error } = await this.supabase
        .from('patients')
        .select('full_name, cpf, email, phone, date_of_birth')
        .eq('id', patientId)
        .single()

      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      const sanitized = sanitizeForAI(patient)

      return {
        success: true,
        data: sanitized,
      }
    } catch (error) {
      logger.error('Sanitize for AI error', { error, patientId })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Helper methods
  private async findExistingPatient(clinicId: string, input: any): Promise<any> {
    // Check by CPF if provided
    if (input.cpf) {
      const { data: patient } = await this.supabase
        .from('patients')
        .select('id')
        .eq('clinic_id', clinicId)
        .eq('cpf', input.cpf)
        .single()

      if (patient) return patient
    }

    // Check by phone
    const { data: phonePatient } = await this.supabase
      .from('patients')
      .select('id')
      .eq('clinic_id', clinicId)
      .eq('phone', input.phone)
      .single()

    return phonePatient
  }

  private async createConsentRecords(
    patientId: string,
    consentTypes: LGPDConsentType[],
  ): Promise<void> {
    const consentRecords = consentTypes.map(type => ({
      patient_id: patientId,
      consent_type: type,
      status: CONSENT_STATUS.ACTIVE,
      purpose: this.getConsentPurpose(type),
      data_recipients: ['clinic_staff'],
      retention_period: RETENTION_POLICIES[type.toUpperCase() as keyof typeof RETENTION_POLICIES],
      expires_at: this.calculateConsentExpiry(type)?.toISOString(),
      version: '1.0',
    }))

    await this.supabase
      .from('lgpd_consents')
      .insert(consentRecords)
  }

  private async updatePatientProfile(patientId: string, profile: any): Promise<void> {
    // This would typically update patient profile tables
    // For now, we'll just log the update
    logger.info('Updating patient profile', { patientId, profile })
  }

  private async calculateRiskProfile(patientId: string): Promise<any> {
    // Simple risk calculation based on appointment history
    const { data: appointments } = await this.supabase
      .from('appointments')
      .select('status')
      .eq('patient_id', patientId)

    const totalAppointments = appointments?.length || 0
    const noShows = appointments?.filter(apt => apt.status === 'NO_SHOW').length || 0
    const noShowRisk = totalAppointments > 0 ? (noShows / totalAppointments) * 100 : 0

    return {
      noShowRisk,
      sensitivityLevel: noShowRisk > 30 ? 'high' : noShowRisk > 15 ? 'medium' : 'low',
    }
  }

  private async getPatientDemographics(patientId: string): Promise<any> {
    // Mock implementation - would fetch from patient demographics table
    return {
      skinType: undefined,
      concerns: [],
      previousTreatments: [],
      allergies: [],
      medications: [],
      pregnancyStatus: 'none',
    }
  }

  private async getPatientPreferences(patientId: string): Promise<any> {
    // Mock implementation - would fetch from patient preferences table
    return {
      contactMethod: 'whatsapp',
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      marketingOptIn: false,
    }
  }

  private async updateDataRetention(patientId: string): Promise<void> {
    // Calculate new retention date based on active consents
    const { data: consents } = await this.supabase
      .from('lgpd_consents')
      .select('consent_type, status')
      .eq('patient_id', patientId)
      .eq('status', 'active')

    if (!consents || consents.length === 0) {
      // No active consents - set retention to minimum
      const retentionDate = new Date()
      retentionDate.setDate(retentionDate.getDate() + RETENTION_POLICIES.ANALYTICS)

      await this.supabase
        .from('patients')
        .update({ data_retention_until: retentionDate.toISOString() })
        .eq('id', patientId)
      return
    }

    // Calculate max retention period from active consents
    const maxRetention = Math.max(
      ...consents.map(c =>
        RETENTION_POLICIES[c.consent_type.toUpperCase() as keyof typeof RETENTION_POLICIES]
      ),
    )

    const retentionDate = new Date()
    retentionDate.setDate(retentionDate.getDate() + maxRetention)

    await this.supabase
      .from('patients')
      .update({ data_retention_until: retentionDate.toISOString() })
      .eq('id', patientId)
  }

  private getConsentPurpose(consentType: LGPDConsentType): string {
    const purposes = {
      TREATMENT: 'Medical treatment and healthcare delivery',
      DATA_SHARING: 'Sharing with healthcare providers for coordinated care',
      MARKETING: 'Marketing communications about services and promotions',
      RESEARCH: 'Anonymized medical research and studies',
      EMERGENCY_CONTACT: 'Emergency contact and notification purposes',
      PHOTOGRAPHY: 'Before/after treatment photography for medical records',
      FINANCIAL: 'Billing and financial transaction processing',
    }
    return purposes[consentType]
  }

  private calculateConsentExpiry(consentType: LGPDConsentType): Date | undefined {
    const days = RETENTION_POLICIES[consentType.toUpperCase() as keyof typeof RETENTION_POLICIES]
    if (!days) return undefined

    const expiry = new Date()
    expiry.setDate(expiry.getDate() + days)
    return expiry
  }

  private mapPatientFromDb(dbPatient: any): PatientIdentity {
    return {
      id: dbPatient.id,
      clinicId: dbPatient.clinic_id,
      userId: dbPatient.user_id,
      fullName: dbPatient.full_name,
      cpf: dbPatient.cpf,
      dateOfBirth: dbPatient.date_of_birth ? new Date(dbPatient.date_of_birth) : undefined,
      email: dbPatient.email,
      phone: dbPatient.phone,
      lgpdConsentGiven: dbPatient.lgpd_consent_given,
      lgpdConsentDate: new Date(dbPatient.lgpd_consent_date),
      dataRetentionUntil: new Date(dbPatient.data_retention_until),
      isActive: dbPatient.is_active,
      riskProfile: {
        noShowRisk: 0,
        sensitivityLevel: 'low',
      },
      preferences: {
        contactMethod: 'whatsapp',
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        marketingOptIn: false,
      },
      demographics: {
        skinType: undefined,
        concerns: [],
        previousTreatments: [],
        allergies: [],
        medications: [],
        pregnancyStatus: 'none',
      },
      createdAt: new Date(dbPatient.created_at),
      updatedAt: new Date(dbPatient.updated_at),
    }
  }

  private mapConsentFromDb(dbConsent: any): ConsentRecord {
    return {
      id: dbConsent.id,
      patientId: dbConsent.patient_id,
      consentType: dbConsent.consent_type,
      status: dbConsent.status,
      purpose: dbConsent.purpose,
      dataRecipients: dbConsent.data_recipients || [],
      retentionPeriod: dbConsent.retention_period,
      expiresAt: dbConsent.expires_at ? new Date(dbConsent.expires_at) : undefined,
      givenAt: new Date(dbConsent.given_at),
      ipAddress: dbConsent.ip_address,
      userAgent: dbConsent.user_agent,
      version: dbConsent.version,
    }
  }
}

// Export singleton instance
export const patientIdentityService = new PatientIdentityService()
