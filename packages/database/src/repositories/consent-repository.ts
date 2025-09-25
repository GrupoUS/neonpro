import {
  ConsentFilters as ConsentFilter,
  ConsentRecord,
  ConsentRepository as IConsentRepository,
  ConsentRequest,
  ConsentStatus,
  ConsentType,
} from '@neonpro/healthcare-core'
import { SupabaseClient } from '@supabase/supabase-js'
import { DatabasePerformanceService } from '../services/database-performance.service.js'
import { databaseLogger, logHealthcareError } from '../utils/logging'

// Type aliases for missing interfaces
type ConsentQueryOptions = {
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

type ConsentSearchResult = {
  consents: ConsentRecord[]
  total: number
  limit?: number
  offset?: number
}

/**
 * Supabase implementation of ConsentRepository
 * Handles all consent data access operations with LGPD compliance
 */
export class ConsentRepository implements IConsentRepository {
  private performanceService: DatabasePerformanceService

  constructor(private supabase: SupabaseClient) {
    this.performanceService = new DatabasePerformanceService(supabase, {
      enableQueryCaching: true,
      cacheTTL: 300000, // 5 minutes
      slowQueryThreshold: 1000,
      enablePerformanceLogging: true,
    })
  }

  async findById(id: string): Promise<ConsentRecord | null> {
    try {
      return await this.performanceService.optimizedQuery(
        'consent_records',
        'select',
        async client => {
          const { data, error } = await client
            .from('consent_records')
            .select(
              `
              id, patient_id, clinic_id, consent_type, purpose, legal_basis, status,
              given_at, withdrawn_at, expires_at, collection_method, ip_address,
              user_agent, evidence, data_categories, created_at, updated_at,
              patient:patients(id, full_name, cpf)
            `,
            )
            .eq('id', id)
            .single()

          if (error) throw error
          if (!data) return null
          return this.mapDatabaseConsentToDomain(data)
        },
        {
          cacheKey: `findById:${id}`,
          columns:
            'id, patient_id, consent_type, status, expires_at, patient:patients(id, full_name, cpf)',
        },
      )
    } catch (error) {
      logHealthcareError('database', error as Error, { method: 'findById', consentId: id })
      return null
    }
  }

  async findByPatientId(patientId: string): Promise<ConsentRecord[]> {
    try {
      const { data, error } = await this.supabase
        .from('consent_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('granted_at', { ascending: false })

      if (error) {
        logHealthcareError('database', error as Error, { method: 'findByPatientId', patientId })
        return []
      }

      if (!data) return []

      return data.map(this.mapDatabaseConsentToDomain)
    } catch (error) {
      logHealthcareError('database', error as Error, { method: 'findByPatientId', patientId })
      return []
    }
  }

  async findWithFilter(
    filter: ConsentFilter,
    options?: ConsentQueryOptions,
  ): Promise<ConsentSearchResult> {
    try {
      let query = this.supabase
        .from('consent_records')
        .select('*', { count: 'exact' })

      // Apply filters
      if (filter.patientId) {
        query = query.eq('patient_id', filter.patientId)
      }

      if (filter.consentType) {
        query = query.eq('consent_type', filter.consentType)
      }

      if (filter.status) {
        query = query.eq('status', filter.status)
      }

      if (filter.createdFrom) {
        query = query.gte('granted_at', filter.createdFrom)
      }

      if (filter.createdTo) {
        query = query.lte('granted_at', filter.createdTo)
      }

      if (filter.expiresFrom) {
        query = query.gte('expires_at', filter.expiresFrom)
      }

      if (filter.expiresTo) {
        query = query.lte('expires_at', filter.expiresTo)
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit)
      }

      if (options?.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 10) - 1,
        )
      }

      // Apply sorting
      if (options?.sortBy) {
        const sortOrder = options.sortOrder === 'desc' ? false : true
        query = query.order(options.sortBy, { ascending: sortOrder })
      } else {
        query = query.order('granted_at', { ascending: false })
      }

      const { data, error, count } = await query

      if (error) {
        logHealthcareError('database', error as Error, { method: 'findWithFilter', filter })
        return { consents: [], total: 0 }
      }

      const consents = data ? data.map(this.mapDatabaseConsentToDomain) : []

      return {
        consents,
        total: count || 0,
        limit: options?.limit || 10,
        offset: options?.offset || 0,
      }
    } catch (error) {
      logHealthcareError('database', error as Error, { method: 'findWithFilter', filter })
      return { consents: [], total: 0 }
    }
  }

  async create(
    consent: Omit<ConsentRecord, 'id' | 'auditTrail'>,
  ): Promise<ConsentRecord> {
    try {
      const dbConsent = {
        patient_id: consent.patientId,
        consent_type: consent.consentType,
        purpose: consent.purpose,
        data_types: consent.dataTypes,
        expires_at: consent.expiresAt,
        metadata: consent.metadata,
        legal_basis: consent.legalBasis,
        consent_version: consent.consentVersion,
        granted_at: consent.grantedAt,
        status: consent.status,
      }

      const { data, error } = await this.supabase
        .from('consent_records')
        .insert(dbConsent)
        .select()
        .single()

      if (error) {
        logHealthcareError('database', error as Error, { method: 'create', consent })
        throw new Error(`Failed to create consent: ${error.message}`)
      }

      return this.mapDatabaseConsentToDomain(data)
    } catch (error) {
      logHealthcareError('database', error as Error, { method: 'create', consent })
      throw error
    }
  }

  async update(
    id: string,
    updateData: Partial<ConsentRecord>,
  ): Promise<ConsentRecord> {
    try {
      const dbUpdate = this.mapUpdateRequestToDatabase(updateData)

      const { data, error } = await this.supabase
        .from('consent_records')
        .update(dbUpdate)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logHealthcareError('database', error as Error, { method: 'update', consentId: id })
        throw new Error(`Failed to update consent: ${error.message}`)
      }

      return this.mapDatabaseConsentToDomain(data)
    } catch (error) {
      logHealthcareError('database', error as Error, { method: 'update', consentId: id })
      throw error
    }
  }

  async revoke(id: string, revokedBy: string): Promise<ConsentRecord> {
    try {
      const { data, error } = await this.supabase
        .from('consent_records')
        .update({
          status: ConsentStatus.REVOKED,
          revoked_at: new Date().toISOString(),
          revoked_by: revokedBy,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logHealthcareError('database', error as Error, { method: 'revoke', consentId: id })
        throw new Error(`Failed to revoke consent: ${error.message}`)
      }

      return this.mapDatabaseConsentToDomain(data)
    } catch (error) {
      logHealthcareError('database', error as Error, { method: 'revoke', consentId: id })
      throw error
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('consent_records')
        .delete()
        .eq('id', id)

      if (error) {
        logHealthcareError('database', error as Error, { method: 'delete', consentId: id })
        return false
      }

      return true
    } catch (error) {
      logHealthcareError('database', error as Error, { method: 'delete', consentId: id })
      return false
    }
  }

  async checkExpiration(): Promise<ConsentRecord[]> {
    try {
      // Use optimized single-operation expiration check
      const result = await this.performanceService.optimizeExpirationCheck(
        'consent_records',
        'expires_at',
        'status',
        ConsentStatus.ACTIVE,
        ConsentStatus.EXPIRED,
      )

      if (result.updatedCount === 0) {
        return []
      }

      // Fetch the updated records
      return await this.performanceService.optimizedQuery(
        'consent_records',
        'select',
        async client => {
          const { data, error } = await client
            .from('consent_records')
            .select(
              `
              id, patient_id, consent_type, purpose, status, 
              given_at, expires_at, withdrawn_at, created_at
            `,
            )
            .in('id', result.expiredIds)
            .order('expires_at', { ascending: false })

          if (error) throw error
          return data ? data.map(this.mapDatabaseConsentToDomain) : []
        },
        {
          cacheKey: `checkExpiration:${Date.now()}`,
          columns: 'id, patient_id, consent_type, status, expires_at',
        },
      )
    } catch (error) {
      logHealthcareError('database', error as Error, { method: 'checkExpiration' })
      return []
    }
  }

  async getActiveConsents(patientId: string): Promise<ConsentRecord[]> {
    try {
      return await this.performanceService.optimizedQuery(
        'consent_records',
        'select',
        async client => {
          const now = new Date().toISOString()
          const { data, error } = await client
            .from('consent_records')
            .select(
              `
              id, patient_id, consent_type, purpose, status, 
              granted_at, expires_at, created_at, data_types
            `,
            )
            .eq('patient_id', patientId)
            .eq('status', ConsentStatus.ACTIVE)
            .or('expires_at.is.null,expires_at.gt.' + now)
            .order('granted_at', { ascending: false })

          if (error) throw error
          return data ? data.map(this.mapDatabaseConsentToDomain) : []
        },
        {
          cacheKey: `getActiveConsents:${patientId}`,
          columns: 'id, patient_id, consent_type, status, expires_at, granted_at',
        },
      )
    } catch (error) {
      logHealthcareError('database', error as Error, { method: 'getActiveConsents', patientId })
      return []
    }
  }

  async hasActiveConsent(
    patientId: string,
    consentType: ConsentType,
  ): Promise<boolean> {
    try {
      return await this.performanceService.optimizedQuery(
        'consent_records',
        'select',
        async client => {
          const now = new Date().toISOString()
          const { data, error } = await client
            .from('consent_records')
            .select('id')
            .eq('patient_id', patientId)
            .eq('consent_type', consentType)
            .eq('status', ConsentStatus.ACTIVE)
            .or('expires_at.is.null,expires_at.gt.' + now)
            .single()

          if (error && error.code !== 'PGRST116') {
            // PGRST116 = not found
            throw error
          }

          return !!data
        },
        {
          cacheKey: `hasActiveConsent:${patientId}:${consentType}`,
          columns: 'id',
        },
      )
    } catch (error) {
      logHealthcareError('database', error as Error, {
        method: 'hasActiveConsent',
        patientId,
        consentType,
      })
      return false
    }
  }

  /**
   * Maps database consent to domain consent
   */
  private mapDatabaseConsentToDomain(dbConsent: any): ConsentRecord {
    return {
      id: dbConsent.id,
      patientId: dbConsent.patient_id,
      consentType: dbConsent.consent_type as ConsentType,
      status: dbConsent.status as ConsentStatus,
      purpose: dbConsent.purpose,
      dataTypes: dbConsent.data_types || [],
      grantedAt: dbConsent.granted_at,
      expiresAt: dbConsent.expires_at,
      revokedAt: dbConsent.revoked_at,
      // grantedBy: dbConsent.granted_by, // This field is not in ConsentRecord interface
      legalBasis: dbConsent.legal_basis,
      consentVersion: dbConsent.consent_version || '1.0.0',
      revokedBy: dbConsent.revoked_by,
      metadata: dbConsent.metadata || {},
      auditTrail: dbConsent.audit_trail || [],
    }
  }

  /**
   * Maps update request to database format
   */
  private mapUpdateRequestToDatabase(updateData: Partial<ConsentRecord>): any {
    const dbUpdate: any = {}

    if (updateData.purpose !== undefined) dbUpdate.purpose = updateData.purpose
    if (updateData.dataTypes !== undefined) {
      dbUpdate.data_types = updateData.dataTypes
    }
    if (updateData.expiresAt !== undefined) {
      dbUpdate.expires_at = updateData.expiresAt
    }
    if (updateData.metadata !== undefined) {
      dbUpdate.metadata = updateData.metadata
    }
    if (updateData.status !== undefined) dbUpdate.status = updateData.status

    return dbUpdate
  }
}
