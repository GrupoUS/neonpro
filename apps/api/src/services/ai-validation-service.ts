/**
 * AI Agent Input Validation and Sanitization Service
 * 
 * Provides comprehensive input validation, sanitization, and security checks
 * for AI agent queries with healthcare compliance (LGPD, ANVISA, CFM)
 * 
 * Security: Input validation and sanitization
 * Compliance: LGPD, ANVISA, CFM
 * Performance: Optimized validation with caching
 */

import { z } from 'zod'
import { PermissionContext, QueryIntent, QueryParameters } from '@neonpro/types'
import { logger } from '../lib/logger'

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for validating client data queries
 */
const ClientDataQuerySchema = z.object({
  clientNames: z.array(z.string()).optional().default([]),
  patientIds: z.array(z.string()).optional().default([]),
  includeMedicalHistory: z.boolean().optional().default(false),
  includeFinancialData: z.boolean().optional().default(false),
  dateRanges: z.array(z.object({
    start: z.date(),
    end: z.date()
  })).optional().default([]),
  limit: z.number().int().min(1).max(1000).optional().default(100),
  offset: z.number().int().min(0).optional().default(0)
})

/**
 * Schema for validating appointment queries
 */
const AppointmentQuerySchema = z.object({
  dateRanges: z.array(z.object({
    start: z.date(),
    end: z.date()
  })).optional().default([]),
  status: z.array(z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'])).optional(),
  type: z.array(z.string()).optional(),
  providerIds: z.array(z.string()).optional().default([]),
  clientIds: z.array(z.string()).optional().default([]),
  includeCancelled: z.boolean().optional().default(true),
  limit: z.number().int().min(1).max(1000).optional().default(100),
  offset: z.number().int().min(0).optional().default(0)
})

/**
 * Schema for validating financial data queries
 */
const FinancialQuerySchema = z.object({
  dateRanges: z.array(z.object({
    start: z.date(),
    end: z.date()
  })).optional().default([]),
  transactionTypes: z.array(z.enum(['payment', 'refund', 'adjustment', 'credit'])).optional(),
  minAmount: z.number().positive().optional(),
  maxAmount: z.number().positive().optional(),
  clientIds: z.array(z.string()).optional().default([]),
  includeRefunds: z.boolean().optional().default(true),
  limit: z.number().int().min(1).max(1000).optional().default(100),
  offset: z.number().int().min(0).optional().default(0)
})

/**
 * Schema for validating general AI queries
 */
const GeneralQuerySchema = z.object({
  query: z.string().min(1).max(5000),
  context: z.string().optional(),
  includePII: z.boolean().optional().default(false),
  dataTypes: z.array(z.enum(['client', 'appointment', 'financial', 'medical'])).optional(),
  limit: z.number().int().min(1).max(100).optional().default(10)
})

// ============================================================================
// SECURITY AND COMPLIANCE VALIDATION
// ============================================================================

/**
 * PII Detection patterns for healthcare data
 */
const PII_PATTERNS = {
  CPF: /\d{3}\.\d{3}\.\d{3}-\d{2}/g,
  RG: /\d{2}\.\d{3}\.\d{3}-[A-Za-z0-9]/g,
  PHONE: /\(?\d{2}\)?\s*\d{4,5}-?\d{4}/g,
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  MEDICAL_RECORD: /(RM|MR)\s*\d+/gi,
  CEP: /\d{5}-?\d{3}/g,
  CNS: /\d{3}\s*\d{4}\s*\d{4}\s*\d{4}/g // Cartão Nacional de Saúde
}

/**
 * Sensitive healthcare terms that require special handling
 */
const SENSITIVE_HEALTHCARE_TERMS = [
  'hiv', 'aids', 'câncer', 'cancer', 'std', 'doença sexualmente transmissível',
  'gravidez', 'aborto', 'saúde mental', 'depressão', 'ansiedade',
  'diagnóstico', 'tratamento', 'medicação', 'cirurgia', 'exame'
]

/**
 * Input validation and sanitization service
 */
export class AIValidationService {
  private cache: Map<string, { result: any; timestamp: number }> = new Map()
  private cacheTTL = 300000 // 5 minutes

  /**
   * Validate and sanitize query parameters based on intent
   */
  validateAndSanitizeQuery(
    intent: QueryIntent,
    parameters: QueryParameters,
    permissionContext: PermissionContext
  ): QueryParameters {
    // Validate permission context first
    this.validatePermissionContext(permissionContext)

    // Rate limiting check
    this.checkRateLimit(permissionContext.userId)

    // Validate based on query intent
    let validatedParams: QueryParameters

    switch (intent) {
      case 'client_data':
        validatedParams = this.validateClientDataQuery(parameters, permissionContext)
        break
      case 'appointments':
        validatedParams = this.validateAppointmentQuery(parameters, permissionContext)
        break
      case 'financial':
        validatedParams = this.validateFinancialQuery(parameters, permissionContext)
        break
      default:
        validatedParams = this.validateGeneralQuery(parameters, permissionContext)
    }

    // Sanitize the validated parameters
    return this.sanitizeParameters(validatedParams, intent)
  }

  /**
   * Validate permission context
   */
  private validatePermissionContext(context: PermissionContext): void {
    if (!context.userId || !context.domain) {
      throw new Error('Invalid permission context: missing required fields')
    }

    if (!Array.isArray(context.permissions) || context.permissions.length === 0) {
      throw new Error('Invalid permission context: no permissions specified')
    }

    if (!['admin', 'professional', 'receptionist', 'assistant'].includes(context.role)) {
      throw new Error('Invalid permission context: invalid role')
    }
  }

  /**
   * Rate limiting check
   */
  private checkRateLimit(userId: string): void {
    const cacheKey = `rate_limit_${userId}`
    const now = Date.now()
    const cached = this.cache.get(cacheKey)

    if (cached && now - cached.timestamp < 60000) { // 1 minute window
      if (cached.result >= 100) { // Max 100 requests per minute
        throw new Error('Rate limit exceeded. Please try again later.')
      }
      cached.result++
      cached.timestamp = now
    } else {
      this.cache.set(cacheKey, { result: 1, timestamp: now })
    }
  }

  /**
   * Validate client data query parameters
   */
  private validateClientDataQuery(
    parameters: QueryParameters,
    context: PermissionContext
  ): QueryParameters {
    try {
      const validated = ClientDataQuerySchema.parse(parameters)
      
      // Role-based restrictions
      if (context.role === 'receptionist') {
        if (validated.includeFinancialData) {
          throw new Error('Receptionists cannot access financial data')
        }
        if (validated.includeMedicalHistory) {
          throw new Error('Receptionists cannot access medical history')
        }
      }

      // Date range validation
      if (validated.dateRanges) {
        validated.dateRanges = validated.dateRanges.filter(range => {
          const daysDiff = Math.abs(range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24)
          return daysDiff <= 365 // Max 1 year range
        })
      }

      return validated
    } catch (error) {
      logger.error('Client data validation failed', { error, parameters })
      throw new Error(`Invalid client data query parameters: ${error.message}`)
    }
  }

  /**
   * Validate appointment query parameters
   */
  private validateAppointmentQuery(
    parameters: QueryParameters,
    context: PermissionContext
  ): QueryParameters {
    try {
      const validated = AppointmentQuerySchema.parse(parameters)

      // Date range validation
      if (validated.dateRanges) {
        validated.dateRanges = validated.dateRanges.filter(range => {
          const daysDiff = Math.abs(range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24)
          return daysDiff <= 90 // Max 90 days for appointments
        })
      }

      // Role-based restrictions
      if (context.role === 'receptionist') {
        // Receptionists can only see basic appointment info
        delete validated.includeFinancialData
      }

      return validated
    } catch (error) {
      logger.error('Appointment validation failed', { error, parameters })
      throw new Error(`Invalid appointment query parameters: ${error.message}`)
    }
  }

  /**
   * Validate financial query parameters
   */
  private validateFinancialQuery(
    parameters: QueryParameters,
    context: PermissionContext
  ): QueryParameters {
    // Permission check for financial data
    if (!context.permissions.includes('read_financial')) {
      throw new Error('Access denied: Insufficient permissions for financial data')
    }

    try {
      const validated = FinancialQuerySchema.parse(parameters)

      // Role-based restrictions
      if (context.role === 'receptionist') {
        throw new Error('Receptionists cannot access financial data')
      }

      // Date range validation
      if (validated.dateRanges) {
        validated.dateRanges = validated.dateRanges.filter(range => {
          const daysDiff = Math.abs(range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24)
          return daysDiff <= 30 // Max 30 days for financial data
        })
      }

      return validated
    } catch (error) {
      logger.error('Financial validation failed', { error, parameters })
      throw new Error(`Invalid financial query parameters: ${error.message}`)
    }
  }

  /**
   * Validate general query parameters
   */
  private validateGeneralQuery(
    parameters: QueryParameters,
    context: PermissionContext
  ): QueryParameters {
    try {
      const validated = GeneralQuerySchema.parse(parameters)

      // Content validation for security
      if (validated.query) {
        const securityRisk = this.assessSecurityRisk(validated.query)
        if (securityRisk.level === 'high') {
          logger.warn('High security risk query detected', {
            userId: context.userId,
            query: validated.query,
            riskFactors: securityRisk.factors
          })
          
          // Additional validation for high-risk queries
          if (securityRisk.factors.includes('sql_injection') || 
              securityRisk.factors.includes('xss_attempt')) {
            throw new Error('Query contains potentially malicious content')
          }
        }
      }

      return validated
    } catch (error) {
      logger.error('General query validation failed', { error, parameters })
      throw new Error(`Invalid query parameters: ${error.message}`)
    }
  }

  /**
   * Sanitize parameters to prevent security issues
   */
  private sanitizeParameters(parameters: QueryParameters, intent: QueryIntent): QueryParameters {
    const sanitized = { ...parameters }

    // Remove any potentially dangerous properties
    const dangerousKeys = ['password', 'token', 'secret', 'key', 'auth']
    dangerousKeys.forEach(key => {
      if (key in sanitized) {
        delete (sanitized as any)[key]
      }
    })

    // Sanitize string values
    Object.keys(sanitized).forEach(key => {
      const value = (sanitized as any)[key]
      if (typeof value === 'string') {
        (sanitized as any)[key] = this.sanitizeString(value)
      } else if (Array.isArray(value)) {
        (sanitized as any)[key] = value.map(item => 
          typeof item === 'string' ? this.sanitizeString(item) : item
        )
      }
    })

    return sanitized
  }

  /**
   * Sanitize individual string values
   */
  private sanitizeString(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .trim()
  }

  /**
   * Assess security risk of query content
   */
  private assessSecurityRisk(query: string): { level: 'low' | 'medium' | 'high'; factors: string[] } {
    const factors: string[] = []
    let riskScore = 0

    // SQL injection patterns
    const sqlPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /insert\s+into/i,
      /delete\s+from/i,
      /update\s+set/i,
      /;\s*drop/i,
      /'\s*or\s*'1'\s*=\s*'1'/i,
      /'\s*or\s*1\s*=\s*1/i,
      /'\s*and\s*1\s*=\s*1/i
    ]

    sqlPatterns.forEach(pattern => {
      if (pattern.test(query)) {
        factors.push('sql_injection')
        riskScore += 10
      }
    })

    // XSS patterns
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ]

    xssPatterns.forEach(pattern => {
      if (pattern.test(query)) {
        factors.push('xss_attempt')
        riskScore += 8
      }
    })

    // Command injection patterns
    const cmdPatterns = [
      /\|\s*[^|]*\s*\|/, // Command pipeline
      /;\s*[^;]*\s*;/, // Command sequence
      /&\s*[^&]*\s*&/, // Background process
      /`[^`]*`/ // Command substitution
    ]

    cmdPatterns.forEach(pattern => {
      if (pattern.test(query)) {
        factors.push('command_injection')
        riskScore += 9
      }
    })

    // PII detection
    Object.values(PII_PATTERNS).forEach(pattern => {
      if (pattern.test(query)) {
        factors.push('pii_detected')
        riskScore += 2
      }
    })

    // Sensitive healthcare terms
    const lowerQuery = query.toLowerCase()
    SENSITIVE_HEALTHCARE_TERMS.forEach(term => {
      if (lowerQuery.includes(term)) {
        factors.push('sensitive_healthcare_term')
        riskScore += 1
      }
    })

    // Determine risk level
    let level: 'low' | 'medium' | 'high' = 'low'
    if (riskScore >= 8) level = 'high'
    else if (riskScore >= 4) level = 'medium'

    return { level, factors }
  }

  /**
   * Validate output data for sensitive information
   */
  validateOutputData(data: any, intent: QueryIntent, context: PermissionContext): any {
    if (!data || typeof data !== 'object') {
      return data
    }

    // Role-based data filtering
    if (context.role === 'receptionist') {
      return this.filterReceptionistData(data, intent)
    }

    // Remove sensitive fields based on intent
    return this.filterSensitiveData(data, intent)
  }

  /**
   * Filter data for receptionist role
   */
  private filterReceptionistData(data: any, intent: QueryIntent): any {
    if (Array.isArray(data)) {
      return data.map(item => this.filterReceptionistData(item, intent))
    }

    const filtered = { ...data }

    // Remove sensitive fields
    delete filtered.financialData
    delete filtered.medicalHistory
    delete filtered.sensitiveNotes
    delete filtered.diagnosis
    delete filtered.treatmentDetails

    return filtered
  }

  /**
   * Filter sensitive data based on intent
   */
  private filterSensitiveData(data: any, intent: QueryIntent): any {
    if (Array.isArray(data)) {
      return data.map(item => this.filterSensitiveData(item, intent))
    }

    const filtered = { ...data }

    // Always remove highly sensitive fields
    delete filtered.passwordHash
    delete filtered.apiKeys
    delete filtered.secretTokens

    // Context-based filtering
    if (intent !== 'financial') {
      delete filtered.financialData
    }

    return filtered
  }

  /**
   * Clear validation cache
   */
  clearCache(): void {
    this.cache.clear()
  }
}

// Export singleton instance
export const aiValidationService = new AIValidationService()