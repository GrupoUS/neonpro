import { logger } from '@/utils/healthcare-errors'
import { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { createAdminClient } from '../services/jwt-security-service.js'

/**
 * LGPD (Lei Geral de Proteção de Dados) compliance middleware
 * Ensures Brazilian data protection law compliance
 */

/**
 * LGPD consent status
 */
type ConsentStatus = 'pending' | 'granted' | 'denied' | 'withdrawn' | 'expired'

/**
 * Data processing purpose
 */
type ProcessingPurpose =
  | 'medical_care'
  | 'appointment_scheduling'
  | 'billing'
  | 'legal_obligation'
  | 'legitimate_interest'
  | 'vital_interest'
  | 'consent'

/**
 * LGPD consent record
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
}

/**
 * LGPD middleware configuration
 */
interface LGPDConfig {
  requiredPurposes?: ProcessingPurpose[]
  strictMode?: boolean
  logAccess?: boolean
  checkExpiration?: boolean
}

/**
 * Mock consent store - replace with actual database implementation
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
 */
function getProcessingPurpose(c: Context): ProcessingPurpose {
  const path = c.req.path.toLowerCase()

  // Medical care purposes
  if (path.includes('/patients') || path.includes('/medical-records')) {
    return 'medical_care'
  }

  // Appointment purposes
  if (path.includes('/appointments')) {
    return 'appointment_scheduling'
  }

  // Billing purposes
  if (path.includes('/billing') || path.includes('/payments')) {
    return 'billing'
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
    'vital_interest',
  ]

  return !exemptPurposes.includes(purpose)
}

/**
 * LGPD compliance middleware
 */
export function lgpdMiddleware(config: LGPDConfig = {}) {
  const { strictMode = true, logAccess = true } = config

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
          timestamp: new Date().toISOString(),
        })
      }

      // Set LGPD context for downstream handlers
      c.set('lgpdPurpose', purpose)
      c.set('lgpdCompliant', true)

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
 * Healthcare-specific LGPD middleware
 */
export function healthcareLGPDMiddleware() {
  return lgpdMiddleware({
    requiredPurposes: ['medical_care', 'appointment_scheduling'],
    strictMode: true,
    logAccess: true,
    checkExpiration: true,
  })
}

/**
 * Middleware to handle consent requests
 */
export function consentMiddleware() {
  return async (c: Context, next: Next) => {
    if (c.req.method === 'POST' && c.req.path.includes('/consent')) {
      try {
        const user = c.get('user')
        const userId = user?.id || c.get('userId')

        if (!_userId) {
          throw new HTTPException(401, { message: 'Authentication required' })
        }

        const body = await c.req.json()
        const { purpose, action } = body

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
          }

          await consentStore.recordConsent(consent)

          logger.info('LGPD: Consent granted', {
            userId,
            purpose,
            ip,
            userAgent,
          })

          return c.json({
            message: 'Consent granted successfully',
            purpose,
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
 * Middleware to handle data portability requests (LGPD Article 18)
 */
export function dataPortabilityMiddleware() {
  return async (c: Context, next: Next) => {
    if (c.req.method === 'GET' && c.req.path.includes('/data-export')) {
      try {
        const user = c.get('user')
        const userId = user?.id || c.get('userId')

        if (!_userId) {
          throw new HTTPException(401, { message: 'Authentication required' })
        }

        // Implement actual data export collecting all user data from all systems
        const supabase = createAdminClient()
        const userData = await this.exportUserData(supabase, _userId)

        logger.info('LGPD: Data export requested', {
          userId,
          ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        })

        return c.json(userData)
      } catch {
        logger.error('Data portability error', {
          error: error instanceof Error ? error.message : String(error),
        })

        throw new HTTPException(500, {
          message: 'Failed to export user data',
        })
      }
    }

    await next()
  }
}

/**
 * Data deletion middleware (LGPD Article 18)
 */
export function dataErasureMiddleware() {
  return async (c: Context, next: Next) => {
    if (c.req.method === 'DELETE' && c.req.path.includes('/data-erasure')) {
      try {
        const user = c.get('user')
        const userId = user?.id || c.get('userId')

        if (!_userId) {
          throw new HTTPException(401, { message: 'Authentication required' })
        }

        // Implement actual data deletion/anonymization following LGPD requirements
        const supabase = createAdminClient()
        await this.deleteUserData(supabase, _userId)

        logger.info('LGPD: Data erasure requested', {
          userId,
          ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        })

        return c.json({
          message: 'Data erasure request processed',
          userId,
          processedAt: new Date().toISOString(),
        })
      } catch {
        logger.error('Data erasure error', {
          error: error instanceof Error ? error.message : String(error),
        })

        throw new HTTPException(500, {
          message: 'Failed to process data erasure request',
        })
      }
    }

    await next()
  }
}

/**
 * Export all user data following LGPD Article 18 requirements
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function exportUserData(_supabase: any, _userId: string): Promise<any> {
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

    // Export patient data if user is a patient
    const { data: patientData } = await _supabase
      .from('patients')
      .select('*')
      .eq('user_id', _userId)

    if (patientData && patientData.length > 0) {
      exportedData.data.patientRecords = patientData.map(patient => ({
        id: patient.id,
        full_name: patient.full_name,
        date_of_birth: patient.date_of_birth,
        phone: patient.phone,
        cpf: patient.cpf ? '[REDACTED_FOR_PRIVACY]' : undefined,
        rg: patient.rg ? '[REDACTED_FOR_PRIVACY]' : undefined,
        address: patient.address
          ? {
            street: patient.address.street,
            number: patient.address.number,
            neighborhood: patient.address.neighborhood,
            city: patient.address.city,
            state: patient.address.state,
            postal_code: patient.address.postal_code
              ? '[REDACTED_FOR_PRIVACY]'
              : undefined,
          }
          : undefined,
        created_at: patient.created_at,
        updated_at: patient.updated_at,
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

    // Export medical records (with sensitive data redacted)
    const { data: medicalRecords } = await _supabase
      .from('medical_records')
      .select(
        `
        id,
        patient_id,
        professional_id,
        record_type,
        diagnosis,
        treatment,
        notes: notes_redacted, // Use redacted view
        created_at,
        updated_at
      `,
      )
      .eq('patient_id', _userId)

    if (medicalRecords && medicalRecords.length > 0) {
      exportedData.data.medicalRecords = medicalRecords
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
      .limit(1000) // Limit to last 1000 records

    if (auditLogs && auditLogs.length > 0) {
      exportedData.data.auditLogs = auditLogs
    }

    logger.info('LGPD: User data export completed', {
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
  } catch {
    logger.error('LGPD: Data export failed', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    })
    throw new HTTPException(500, {
      message: 'Failed to export user data',
    })
  }
}

/**
 * Delete/anonymize user data following LGPD Article 18 requirements
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function deleteUserData(_supabase: any, _userId: string): Promise<void> {
  try {
    const deletionTimestamp = new Date().toISOString()
    let totalRecordsAffected = 0

    // Step 1: Anonymize sensitive data instead of hard delete where required by law
    const anonymizationOperations = [
      {
        table: 'patients',
        updates: {
          full_name: 'REDACTED',
          cpf: null,
          rg: null,
          phone: null,
          email: null,
          address: null,
          notes: 'DATA_REDACTED_LGPD_ART18',
        },
        condition: { user_id: _userId },
      },
      {
        table: 'users',
        updates: {
          email: `deleted_${userId}@redacted.local`,
          name: 'REDACTED',
        },
        condition: { id: _userId },
      },
    ]

    for (const operation of anonymizationOperations) {
      const { data, error } = await _supabase
        .from(operation.table)
        .update(operation.updates)
        .match(operation.condition)
        .select()

      if (error) {
        logger.error('LGPD: Data anonymization failed', {
          table: operation.table,
          userId,
          error: error.message,
        })
      } else if (data) {
        totalRecordsAffected += data.length
      }
    }

    // Step 2: Delete consents and audit logs (these can be permanently deleted)
    const deletionOperations = [
      { table: 'lgpd_consents', condition: { user_id: _userId } },
      { table: 'audit_events', condition: { user_id: _userId } },
    ]

    for (const operation of deletionOperations) {
      const { error } = await _supabase
        .from(operation.table)
        .delete()
        .match(operation.condition)

      if (error) {
        logger.error('LGPD: Data deletion failed', {
          table: operation.table,
          userId,
          error: error.message,
        })
      } else {
        totalRecordsAffected += 1 // Estimate
      }
    }

    // Step 3: Create audit record of the data deletion
    await _supabase.from('audit_events').insert({
      user_id: userId,
      event_type: 'data_erasure',
      resource_type: 'user',
      resource_id: userId,
      action: 'delete',
      details: {
        reason: 'LGPD Article 18 - Data Subject Request',
        method: 'anonymization_and_deletion',
        recordsAffected: totalRecordsAffected,
        timestamp: deletionTimestamp,
      },
      ip_address: 'system',
      user_agent: 'lgpd-middleware',
    })

    logger.info('LGPD: User data deletion completed', {
      userId,
      totalRecordsAffected,
      deletionTimestamp,
    })
  } catch {
    logger.error('LGPD: Data deletion failed', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    })
    throw new HTTPException(500, {
      message: 'Failed to process data erasure request',
    })
  }
}

/**
 * Data protection middleware (alias for healthcare LGPD middleware)
 * @deprecated Use healthcareLGPDMiddleware instead
 */
export const dataProtection = healthcareLGPDMiddleware
