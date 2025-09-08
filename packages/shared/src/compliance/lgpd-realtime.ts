/**
 * 🛡️ LGPD Real-time Compliance - NeonPro Healthcare
 * =================================================
 *
 * LGPD (Lei Geral de Proteção de Dados) compliance for real-time subscriptions
 * Ensures data protection, audit logging, and consent validation
 */

import type { RealtimePostgresChangesPayload, } from '@supabase/supabase-js'
import { z, } from 'zod'

// LGPD data categories for real-time processing
export enum LGPDDataCategory {
  PERSONAL = 'personal', // Nome, email, telefone
  SENSITIVE = 'sensitive', // CPF, RG, dados médicos
  ANONYMOUS = 'anonymous', // Dados totalmente anonimizados
  PSEUDONYMOUS = 'pseudonymous', // Dados pseudonimizados
  AGGREGATE = 'aggregate', // Dados agregados/estatísticos
}

// LGPD processing purposes for real-time data
export enum LGPDProcessingPurpose {
  HEALTHCARE_DELIVERY = 'healthcare_delivery',
  APPOINTMENT_MANAGEMENT = 'appointment_management',
  COMPLIANCE_MONITORING = 'compliance_monitoring',
  AUDIT_LOGGING = 'audit_logging',
  ANALYTICS = 'analytics',
  NOTIFICATION = 'notification',
}

// LGPD consent status
export enum LGPDConsentStatus {
  GRANTED = 'granted',
  REVOKED = 'revoked',
  PENDING = 'pending',
  EXPIRED = 'expired',
  NOT_REQUIRED = 'not_required', // For legitimate interest cases
}

// LGPD real-time configuration schema
export const LGPDRealtimeConfigSchema = z.object({
  enabled: z.boolean().default(true,),
  dataCategory: z.nativeEnum(LGPDDataCategory,),
  processingPurpose: z.nativeEnum(LGPDProcessingPurpose,),
  consentRequired: z.boolean().default(true,),
  auditLogging: z.boolean().default(true,),
  dataMinimization: z.boolean().default(true,),
  anonymization: z.boolean().default(false,),
  pseudonymization: z.boolean().default(false,),
  retentionPeriodDays: z.number().min(1,).max(2555,).optional(), // Max ~7 years
  sensitiveFields: z.array(z.string(),).default([],),
  allowedUsers: z.array(z.string(),).optional(),
  dataSubjectRights: z
    .object({
      accessRight: z.boolean().default(true,),
      rectificationRight: z.boolean().default(true,),
      erasureRight: z.boolean().default(true,),
      portabilityRight: z.boolean().default(true,),
      objectRight: z.boolean().default(true,),
    },)
    .default({},),
},)

export type LGPDRealtimeConfig = z.infer<typeof LGPDRealtimeConfigSchema>

// LGPD audit log entry for real-time events
export interface LGPDAuditLogEntry {
  id: string
  timestamp: string
  userId?: string
  table: string
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT'
  dataCategory: LGPDDataCategory
  processingPurpose: LGPDProcessingPurpose
  consentStatus: LGPDConsentStatus
  consentId?: string
  dataFields: string[]
  sensitiveFields: string[]
  ipAddress?: string
  userAgent?: string
  reasonForProcessing: string
  legalBasis: string
  retentionApplied: boolean
  anonymized: boolean
  pseudonymized: boolean
}

// Data anonymization/pseudonymization utilities
export class LGPDDataProcessor {
  private static readonly SENSITIVE_FIELD_PATTERNS = [
    'cpf',
    'rg',
    'email',
    'phone',
    'telefone',
    'celular',
    'address',
    'endereco',
    'cep',
    'birth_date',
    'nascimento',
    'password',
    'senha',
    'ssn',
    'passport',
    'passaporte',
  ]

  /**
   * Anonymize sensitive data in real-time payload
   */
  static anonymizePayload<T extends Record<string, unknown>,>(
    payload: RealtimePostgresChangesPayload<T>,
    config: LGPDRealtimeConfig,
  ): RealtimePostgresChangesPayload<T> {
    if (!config.anonymization) {
      return payload
    }

    const anonymized = { ...payload, }

    if (anonymized.new) {
      anonymized.new = LGPDDataProcessor.anonymizeFields(
        anonymized.new,
        config.sensitiveFields,
      ) as T
    }

    if (anonymized.old) {
      anonymized.old = LGPDDataProcessor.anonymizeFields(
        anonymized.old,
        config.sensitiveFields,
      ) as T
    }

    return anonymized
  }

  /**
   * Pseudonymize data for analytics while maintaining referential integrity
   */
  static pseudonymizePayload<T extends Record<string, unknown>,>(
    payload: RealtimePostgresChangesPayload<T>,
    config: LGPDRealtimeConfig,
  ): RealtimePostgresChangesPayload<T> {
    if (!config.pseudonymization) {
      return payload
    }

    const pseudonymized = { ...payload, }

    if (pseudonymized.new) {
      pseudonymized.new = LGPDDataProcessor.pseudonymizeFields(
        pseudonymized.new,
        config.sensitiveFields,
      ) as T
    }

    if (pseudonymized.old) {
      pseudonymized.old = LGPDDataProcessor.pseudonymizeFields(
        pseudonymized.old,
        config.sensitiveFields,
      ) as T
    }

    return pseudonymized
  }

  /**
   * Apply data minimization - only include necessary fields
   */
  static minimizeData<T extends Record<string, unknown>,>(
    payload: RealtimePostgresChangesPayload<T>,
    allowedFields: string[],
  ): RealtimePostgresChangesPayload<T> {
    const minimized = { ...payload, }

    if (minimized.new) {
      minimized.new = LGPDDataProcessor.extractFields(
        minimized.new,
        allowedFields,
      ) as T
    }

    if (minimized.old) {
      minimized.old = LGPDDataProcessor.extractFields(
        minimized.old,
        allowedFields,
      ) as T
    }

    return minimized
  }

  private static anonymizeFields(
    data: unknown,
    sensitiveFields: string[],
  ): unknown {
    if (!data || typeof data !== 'object') {
      return data
    }

    const anonymized = { ...data, }

    // Auto-detect sensitive fields
    const detectedSensitiveFields = Object.keys(data,).filter((field,) =>
      LGPDDataProcessor.SENSITIVE_FIELD_PATTERNS.some((pattern,) =>
        field.toLowerCase().includes(pattern.toLowerCase(),)
      )
    )

    const fieldsToAnonymize = [...sensitiveFields, ...detectedSensitiveFields,]

    fieldsToAnonymize.forEach((field,) => {
      if (field in anonymized) {
        ;(anonymized as Record<string, unknown>)[field] = LGPDDataProcessor.generateAnonymousValue(
          field,
          (anonymized as Record<string, unknown>)[field],
        )
      }
    },)

    return anonymized
  }

  private static pseudonymizeFields(
    data: unknown,
    sensitiveFields: string[],
  ): unknown {
    if (!data || typeof data !== 'object') {
      return data
    }

    const pseudonymized = { ...data, }

    sensitiveFields.forEach((field,) => {
      if (field in pseudonymized) {
        ;(pseudonymized as Record<string, unknown>)[field] = LGPDDataProcessor.generatePseudonym(
          field,
          (pseudonymized as Record<string, unknown>)[field],
        )
      }
    },)

    return pseudonymized
  }

  private static extractFields(
    data: unknown,
    allowedFields: string[],
  ): unknown {
    if (!data || typeof data !== 'object') {
      return data
    }

    const extracted: unknown = {}

    allowedFields.forEach((field,) => {
      if (field in data) {
        ;(extracted as Record<string, unknown>)[field] = (data as Record<string, unknown>)[field]
      }
    },)

    return extracted
  }

  private static generateAnonymousValue(
    fieldName: string,
    originalValue: unknown,
  ): string {
    const fieldLower = fieldName.toLowerCase()

    if (fieldLower.includes('email',)) {
      return '***@***.***'
    }
    if (
      fieldLower.includes('phone',)
      || fieldLower.includes('telefone',)
      || fieldLower.includes('celular',)
    ) {
      return '***-***-****'
    }
    if (fieldLower.includes('cpf',)) {
      return '***.***.**-**'
    }
    if (fieldLower.includes('rg',)) {
      return '**.***.**-*'
    }
    if (fieldLower.includes('cep',)) {
      return '*****-***'
    }
    if (fieldLower.includes('address',) || fieldLower.includes('endereco',)) {
      return '*** *** *** ***'
    }

    // Generic anonymization
    return typeof originalValue === 'string'
      ? '*'.repeat(Math.min(originalValue.length, 10,),)
      : '***PROTECTED***'
  }

  private static generatePseudonym(
    fieldName: string,
    originalValue: unknown,
  ): string {
    // Simple hash-based pseudonymization (in production, use proper cryptographic methods)
    const hash = LGPDDataProcessor.simpleHash(String(originalValue,),)
    const fieldLower = fieldName.toLowerCase()

    if (fieldLower.includes('email',)) {
      return `user${hash}@example.com`
    }
    if (fieldLower.includes('phone',) || fieldLower.includes('telefone',)) {
      return `+55${hash}`
    }
    if (fieldLower.includes('cpf',)) {
      return `${hash.slice(0, 11,)}`
    }
    if (fieldLower.includes('rg',)) {
      return `${hash.slice(0, 9,)}`
    }

    return `pseudo_${hash}`
  }

  private static simpleHash(str: string,): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.codePointAt(i,)
      hash = (hash << 5) - hash + (char || 0)
      hash &= hash // Convert to 32bit integer
    }
    return Math.abs(hash,).toString().slice(0, 8,)
  }
}

// LGPD consent validator
export class LGPDConsentValidator {
  private static consentCache = new Map<
    string,
    { status: LGPDConsentStatus; expiresAt?: Date }
  >()

  /**
   * Validate consent for real-time data processing
   */
  static async validateConsent(
    userId: string,
    processingPurpose: LGPDProcessingPurpose,
    dataCategory: LGPDDataCategory,
  ): Promise<{
    valid: boolean
    status: LGPDConsentStatus
    reason?: string
  }> {
    // Check cache first
    const cacheKey = `${userId}:${processingPurpose}:${dataCategory}`
    const cached = LGPDConsentValidator.consentCache.get(cacheKey,)

    if (cached) {
      if (cached.expiresAt && cached.expiresAt < new Date()) {
        LGPDConsentValidator.consentCache.delete(cacheKey,)
      } else {
        return {
          valid: cached.status === LGPDConsentStatus.GRANTED,
          status: cached.status,
        }
      }
    }

    // In a real implementation, this would check the database
    // For now, we'll simulate consent validation
    const result = await LGPDConsentValidator.checkConsentInDatabase(
      userId,
      processingPurpose,
      dataCategory,
    )

    // Cache the result
    LGPDConsentValidator.consentCache.set(cacheKey, {
      status: result.status,
      expiresAt: result.expiresAt || new Date(),
    },)

    return {
      valid: result.status === LGPDConsentStatus.GRANTED,
      status: result.status,
      reason: result.reason || '',
    }
  }

  private static async checkConsentInDatabase(
    _userId: string,
    processingPurpose: LGPDProcessingPurpose,
    _dataCategory: LGPDDataCategory,
  ): Promise<{
    status: LGPDConsentStatus
    expiresAt?: Date
    reason?: string
  }> {
    // Simulate database check
    // In production, this would be an actual database query

    // For healthcare delivery, consent is usually granted by default (legitimate interest)
    if (processingPurpose === LGPDProcessingPurpose.HEALTHCARE_DELIVERY) {
      return {
        status: LGPDConsentStatus.GRANTED,
      }
    }

    // For other purposes, check actual consent
    // This is a simplified simulation
    return {
      status: LGPDConsentStatus.GRANTED,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000,), // 1 year from now
    }
  }

  /**
   * Clear consent cache for a user (when consent is revoked)
   */
  static clearConsentCache(userId: string,) {
    const keysToDelete = [...LGPDConsentValidator.consentCache.keys(),].filter(
      (key,) => key.startsWith(`${userId}:`,),
    )

    keysToDelete.forEach((key,) => LGPDConsentValidator.consentCache.delete(key,))
  }
}
