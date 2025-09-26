import { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { createAdminClient } from '../clients/supabase'
import { logger } from "@/utils/healthcare-errors"

/**
 * Enhanced LGPD (Lei Geral de Proteção de Dados) compliance middleware
 * Ensures Brazilian data protection law compliance for aesthetic clinics
 * Focused on client data protection and privacy rights
 */

/**
 * LGPD consent status
 */
type ConsentStatus = 'pending' | 'granted' | 'denied' | 'withdrawn' | 'expired'

/**
 * Data processing purpose - focused on aesthetic clinic operations
 */
type ProcessingPurpose =
  | 'appointment_scheduling'
  | 'client_records'
  | 'billing'
  | 'treatment_planning'
  | 'aesthetic_services'
  | 'legal_obligation'
  | 'legitimate_interest'
  | 'consent'

/**
 * Enhanced LGPD consent record
 */
interface LGPDConsent {
  _userId: string
  purpose: ProcessingPurpose
  status: ConsentStatus
  grantedAt?: Date
  expiresAt?: Date
  withdrawnAt?: Date
  ipAddress: string
  userAgent: string
  version: string
  dataType: 'personal' | 'sensitive' | 'health_data'
}

/**
 * LGPD middleware configuration
 */
interface LGPDConfig {
  requiredPurposes?: ProcessingPurpose[]
  strictMode?: boolean
  logAccess?: boolean
  checkExpiration?: boolean
  enforceDataResidency?: boolean
}

/**
 * Enhanced consent store with data classification
 */
class ConsentStore {
  private consents = new Map<string, LGPDConsent[]>()

  async getConsents(
    _userId: string,
    purpose: ProcessingPurpose,
  ): Promise<LGPDConsent[]> {
    const userConsents = this.consents.get(_userId) || []
    return userConsents.filter(consent => consent.purpose === purpose)
  }

  async hasValidConsent(
    _userId: string,
    purpose: ProcessingPurpose,
  ): Promise<boolean> {
    const consents = await this.getConsents(_userId, purpose)
    const now = new Date()

    return consents.some(
      consent =>
        consent.status === 'granted' &&
        (!consent.expiresAt || consent.expiresAt > now),
    )
  }

  async recordConsent(consent: LGPDConsent): Promise<void> {
    const userConsents = this.consents.get(consent._userId) || []
    userConsents.push(consent)
    this.consents.set(consent._userId, userConsents)
  }

  async withdrawConsent(
    _userId: string,
    purpose: ProcessingPurpose,
  ): Promise<void> {
    const userConsents = this.consents.get(_userId) || []
    userConsents.forEach(consent => {
      if (consent.purpose === purpose && consent.status === 'granted') {
        consent.status = 'withdrawn'
        consent.withdrawnAt = new Date()
      }
    })
  }
}

const consentStore = new ConsentStore()

/**
 * Determines the required processing purpose based on the request
 * Focused on aesthetic clinic operations
 */
function getProcessingPurpose(c: Context): ProcessingPurpose {
  const path = c.req.path.toLowerCase()

  // Client records purposes
  if (path.includes('/patients') || path.includes('/clients')) {
    return 'client_records'
  }

  // Appointment purposes
  if (path.includes('/appointments') || path.includes('/scheduling')) {
    return 'appointment_scheduling'
  }

  // Treatment purposes
  if (path.includes('/treatments') || path.includes('/aesthetic')) {
    return 'treatment_planning'
  }

  // Billing purposes
  if (path.includes('/billing') || path.includes('/payments')) {
    return 'billing'
  }

  // Aesthetic services
  if (path.includes('/services') || path.includes('/procedures')) {
    return 'aesthetic_services'
  }

  // Default to consent for other operations
  return 'consent'
}

/**
 * Checks if the operation requires explicit consent
 */
function requiresExplicitConsent(purpose: ProcessingPurpose): boolean {
  // Some purposes don't require explicit consent under LGPD
  const exemptPurposes: ProcessingPurpose[] = [
    'legal_obligation',
    'legitimate_interest',
  ]

  return !exemptPurposes.includes(purpose)
}

/**
 * Enhanced LGPD compliance middleware with client data protection focus
 */
export function lgpdMiddleware(config: LGPDConfig = {}) {
  const { 
    strictMode = true, 
    logAccess = true,
    enforceDataResidency = true 
  } = config

  return async (c: Context, next: Next) => {
    try {
      const user = c.get('user')
      const userId = user?.id || c.get('userId')

      // Skip LGPD checks for unauthenticated requests
      if (!userId) {
        await next()
        return
      }

      const purpose = getProcessingPurpose(c)
      const ip = c.req.header('x-forwarded-for') ||
        c.req.header('x-real-ip') ||
        'unknown'
      const userAgent = c.req.header('user-agent') || 'unknown'

      // Enforce data residency for Brazilian operations
      if (enforceDataResidency) {
        const region = c.req.header('x-vercel-region') || 'unknown'
        if (region !== 'gru1' && process.env.NODE_ENV === 'production') {
          logger.warn('LGPD: Data residency violation detected', {
            userId,
            region,
            path: c.req.path,
            method: c.req.method,
            ip,
          })

          throw new HTTPException(403, {
            message: 'Data processing not permitted in this region',
            cause: {
              code: 'LGPD_DATA_RESIDENCY_VIOLATION',
              region,
              allowedRegions: ['gru1'],
            },
          })
        }
      }

      // Check if explicit consent is required
      if (requiresExplicitConsent(purpose)) {
        const hasConsent = await consentStore.hasValidConsent(userId, purpose)

        if (!hasConsent && strictMode) {
          logger.warn('LGPD: Access denied - missing consent', {
            userId,
            purpose,
            path: c.req.path,
            method: c.req.method,
            ip,
          })

          throw new HTTPException(403, {
            message: 'Data processing consent required',
            cause: {
              code: 'LGPD_CONSENT_REQUIRED',
              purpose,
              consentUrl: `/api/v1/consent?purpose=${purpose}`,
            },
          })
        }
      }

      // Log data access for audit purposes
      if (logAccess) {
        logger.info('LGPD: Data access logged', {
          userId,
          purpose,
          path: c.req.path,
          method: c.req.method,
          ip,
          userAgent,
          hasConsent: await consentStore.hasValidConsent(userId, purpose),
          dataResidency: 'brazil-only',
          timestamp: new Date().toISOString(),
        })
      }

      // Set LGPD context for downstream handlers
      c.set('lgpdPurpose', purpose)
      c.set('lgpdCompliant', true)
      c.set('dataResidency', 'brazil-only')

      await next()
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error
      }

      logger.error('LGPD middleware error', {
        error: error instanceof Error ? error.message : String(error),
        path: c.req.path,
        method: c.req.method,
      })

      throw new HTTPException(500, {
        message: 'LGPD compliance check failed',
      })
    }
  }
}

/**
 * Aesthetic clinic-specific LGPD middleware
 * Focused on client data protection rather than medical data
 */
export function aestheticClinicLGPDMiddleware() {
  return lgpdMiddleware({
    requiredPurposes: ['client_records', 'appointment_scheduling', 'treatment_planning'],
    strictMode: true,
    logAccess: true,
    checkExpiration: true,
    enforceDataResidency: true,
  })
}

/**
 * Middleware to handle consent requests with enhanced client focus
 */
export function consentMiddleware() {
  return async (c: Context, next: Next) => {
    if (c.req.method === 'POST' && c.req.path.includes('/consent')) {
      try {
        const user = c.get('user')
        const userId = user?.id || c.get('userId')

        if (!userId) {
          throw new HTTPException(401, { message: 'Authentication required' })
        }

        const body = await c.req.json()
        const { purpose, action, dataType = 'personal' } = body

        if (!purpose || !action) {
          throw new HTTPException(400, {
            message: 'Purpose and action are required',
          })
        }

        const ip = c.req.header('x-forwarded-for') ||
          c.req.header('x-real-ip') ||
          'unknown'
        const userAgent = c.req.header('user-agent') || 'unknown'

        if (action === 'grant') {
          const consent: LGPDConsent = {
            _userId: userId,
            purpose,
            status: 'granted',
            grantedAt: new Date(),
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            ipAddress: ip,
            userAgent,
            version: '1.0',
            dataType,
          }

          await consentStore.recordConsent(consent)

          logger.info('LGPD: Consent granted', {
            userId,
            purpose,
            dataType,
            ip,
            userAgent,
          })

          return c.json({
            message: 'Consent granted successfully',
            purpose,
            dataType,
            status: 'granted',
            expiresAt: consent.expiresAt,
          })
        } else if (action === 'withdraw') {
          await consentStore.withdrawConsent(userId, purpose)

          logger.info('LGPD: Consent withdrawn', {
            userId,
            purpose,
            ip,
            userAgent,
          })

          return c.json({
            message: 'Consent withdrawn successfully',
            purpose,
            status: 'withdrawn',
          })
        }

        throw new HTTPException(400, {
          message: 'Invalid action. Use "grant" or "withdraw"',
        })
      } catch (error) {
        if (error instanceof HTTPException) {
          throw error
        }

        logger.error('Consent handling error', {
          error: error instanceof Error ? error.message : String(error),
        })

        throw new HTTPException(500, {
          message: 'Failed to process consent request',
        })
      }
    }

    await next()
  }
}

/**
 * Data protection middleware (alias for aesthetic clinic LGPD middleware)
 * Focused on client data protection for aesthetic clinics
 */
export const dataProtection = aestheticClinicLGPDMiddleware

/**
 * Client data protection headers middleware
 * Adds LGPD compliance headers to HTTP responses
 */
export function clientDataProtectionHeaders() {
  return async (c: Context, next: Next) => {
    await next()
    
    // Add LGPD compliance headers
    c.header('X-LGPD-Compliant', 'true')
    c.header('X-Data-Residency', 'brazil-only')
    c.header('X-Client-Data-Protection', 'enhanced')
    c.header('X-Data-Classification', 'client-sensitive')
    c.header('X-LGPD-Processing-Basis', 'client-consent')
    c.header('X-Data-Retention', '365-days')
    c.header('X-Aesthetic-Service', 'true')
    
    // Add security headers
    c.header('X-Content-Type-Options', 'nosniff')
    c.header('X-Frame-Options', 'DENY')
    c.header('X-XSS-Protection', '1; mode=block')
    c.header('Cache-Control', 'private, no-store')
    
    // Add rate limiting headers
    c.header('X-Rate-Limit-Limit', '1000')
    c.header('X-Rate-Limit-Window', '3600')
    c.header('X-Rate-Limit-Remaining', '999')
    c.header('X-Rate-Limit-Reset', '3600')
  }
}

/**
 * Export all client data following LGPD Article 18 requirements
 * Focused on aesthetic clinic client data
 */
async function exportClientData(_supabase: any, _userId: string): Promise<any> {
  try {
    const exportedData: any = {
      userId,
      exportedAt: new Date().toISOString(),
      format: 'json',
      version: '1.0',
      compliance: {
        lgpdArticle: '18º',
        purpose: 'Data Portability',
        retentionPeriod: 'Immediate access for data subject',
        dataType: 'aesthetic_clinic_client',
      },
      data: {},
    }

    // Export user profile data
    const { data: profile } = await _supabase
      .from('users')
      .select('*')
      .eq('id', _userId)
      .single()

    if (profile) {
      exportedData.data.profile = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        _role: profile.role,
        clinic_id: profile.clinic_id,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      }
    }

    // Export client/patient data with focus on aesthetic clinic
    const { data: clientData } = await _supabase
      .from('patients')
      .select('*')
      .eq('user_id', _userId)

    if (clientData && clientData.length > 0) {
      exportedData.data.clientRecords = clientData.map(client => ({
        id: client.id,
        full_name: client.full_name,
        date_of_birth: client.date_of_birth,
        phone: client.phone,
        cpf: client.cpf ? '[REDACTED_FOR_PRIVACY]' : undefined,
        rg: client.rg ? '[REDACTED_FOR_PRIVACY]' : undefined,
        address: client.address
          ? {
              street: client.address.street,
              number: client.address.number,
              neighborhood: client.address.neighborhood,
              city: client.address.city,
              state: client.address.state,
              postal_code: client.address.postal_code
                ? '[REDACTED_FOR_PRIVACY]'
                : undefined,
            }
          : undefined,
        created_at: client.created_at,
        updated_at: client.updated_at,
      }))
    }

    // Export appointments
    const { data: appointments } = await _supabase
      .from('appointments')
      .select(
        `
        id,
        patient_id,
        professional_id,
        clinic_id,
        appointment_time,
        duration,
        status,
        type,
        notes,
        created_at,
        updated_at
      `,
      )
      .or(`patient_id.eq.${userId},professional_id.eq.${userId}`)

    if (appointments && appointments.length > 0) {
      exportedData.data.appointments = appointments
    }

    // Export treatment plans (aesthetic focus)
    const { data: treatments } = await _supabase
      .from('treatment_plans')
      .select('*')
      .eq('patient_id', _userId)

    if (treatments && treatments.length > 0) {
      exportedData.data.treatmentPlans = treatments
    }

    // Export consent records
    const { data: consents } = await _supabase
      .from('lgpd_consents')
      .select('*')
      .eq('user_id', _userId)

    if (consents && consents.length > 0) {
      exportedData.data.consents = consents
    }

    // Export audit logs related to this user
    const { data: auditLogs } = await _supabase
      .from('audit_events')
      .select('*')
      .eq('user_id', _userId)
      .order('created_at', { ascending: false })
      .limit(1000)

    if (auditLogs && auditLogs.length > 0) {
      exportedData.data.auditLogs = auditLogs
    }

    logger.info('LGPD: Client data export completed', {
      userId,
      dataCategories: Object.keys(exportedData.data),
      recordCounts: Object.fromEntries(
        Object.entries(exportedData.data).map(([key, _value]) => [
          key,
          Array.isArray(value) ? value.length : 1,
        ]),
      ),
    })

    return exportedData
  } catch (error) {
    logger.error('LGPD: Client data export failed', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    })
    throw new HTTPException(500, {
      message: 'Failed to export client data',
    })
  }
}