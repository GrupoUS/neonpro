/**
 * - Security utilities and middleware for NeonPro
 * Provides encryption, authentication, authorization, and security middleware
 */

// Version export
export const SECURITY_VERSION = '1.0.0'

/**
 * Healthcare Security Logger for structured compliance logging
 * Implements LGPD, ANVISA, and CFM compliance requirements
 */

import { AuditLogger, HealthcareAccessMetadata } from './audit/logger'
import { SecurityUtils } from './utils'
import { consoleManager } from './console-manager'

export interface HealthcareLogEntry {
  id: string
  timestamp: Date
  level: 'debug' | 'info' | 'warn' | 'error' | 'security'
  category: 'system' | 'security' | 'compliance' | 'healthcare' | 'performance' | 'audit'
  message: string
  metadata?: Record<string, unknown>
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  traceId?: string
  lgpdCompliant?: boolean
  anvisaCompliant?: boolean
  cfmCompliant?: boolean
  dataClassification?: 'public' | 'internal' | 'sensitive' | 'restricted'
  retentionPeriod?: string
}

export interface HealthcareSecurityLoggerOptions {
  enableConsoleLogging?: boolean
  enableDatabaseLogging?: boolean
  enableFileLogging?: boolean
  enableAuditLogging?: boolean
  logLevel?: 'debug' | 'info' | 'warn' | 'error'
  supabaseUrl?: string
  supabaseKey?: string
  retentionPeriod?: string
  sanitizeSensitiveData?: boolean
  complianceLevel?: 'basic' | 'standard' | 'enhanced'
}

export class HealthcareSecurityLogger {
  private options: HealthcareSecurityLoggerOptions
  private auditLogger: AuditLogger
  private retentionPeriod: string = '90d'

  constructor(options: HealthcareSecurityLoggerOptions = {}) {
    this.options = {
      enableConsoleLogging: true,
      enableDatabaseLogging: false,
      enableFileLogging: false,
      enableAuditLogging: true,
      logLevel: 'info',
      retentionPeriod: '90d',
      sanitizeSensitiveData: true,
      complianceLevel: 'standard',
      ...options,
    }

    this.retentionPeriod = this.options.retentionPeriod || '90d'

    // Initialize audit logger
    this.auditLogger = new AuditLogger({
      enableConsoleLogging: this.options.enableConsoleLogging,
      enableDatabaseLogging: this.options.enableDatabaseLogging,
      enableFileLogging: this.options.enableFileLogging,
      logLevel: this.options.logLevel,
      supabaseUrl: this.options.supabaseUrl,
      supabaseKey: this.options.supabaseKey,
    })
  }

  /**
   * Create structured healthcare log entry
   */
  private createLogEntry(
    level: HealthcareLogEntry['level'],
    category: HealthcareLogEntry['category'],
    message: string,
    metadata?: Record<string, unknown>,
    options?: {
      userId?: string
      sessionId?: string
      ipAddress?: string
      userAgent?: string
      traceId?: string
      dataClassification?: HealthcareLogEntry['dataClassification']
      lgpdCompliant?: boolean
      anvisaCompliant?: boolean
      cfmCompliant?: boolean
    }
  ): HealthcareLogEntry {
    const entry: HealthcareLogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      category,
      message,
      metadata: this.options.sanitizeSensitiveData ? this.sanitizeMetadata(metadata) : metadata,
      retentionPeriod: this.retentionPeriod,
      dataClassification: options?.dataClassification || this.classifyData(message, metadata),
      lgpdCompliant: options?.lgpdCompliant ?? this.checkLGPDCompliance(message, metadata),
      anvisaCompliant: options?.anvisaCompliant ?? this.checkANVISACompliance(message, metadata),
      cfmCompliant: options?.cfmCompliant ?? this.checkCFMCompliance(message, metadata),
    }

    // Add optional fields
    if (options?.userId) entry.userId = options.userId
    if (options?.sessionId) entry.sessionId = options.sessionId
    if (options?.ipAddress) entry.ipAddress = options.ipAddress
    if (options?.userAgent) entry.userAgent = options.userAgent
    if (options?.traceId) entry.traceId = options.traceId

    return entry
  }

  /**
   * Log debug information
   */
  debug(message: string, metadata?: Record<string, unknown>, options?: HealthcareLogEntry): void {
    this.log('debug', 'system', message, metadata, options)
  }

  /**
   * Log information
   */
  info(message: string, metadata?: Record<string, unknown>, options?: HealthcareLogEntry): void {
    this.log('info', 'system', message, metadata, options)
  }

  /**
   * Log warning
   */
  warn(message: string, metadata?: Record<string, unknown>, options?: HealthcareLogEntry): void {
    this.log('warn', 'system', message, metadata, options)
  }

  /**
   * Log error
   */
  error(message: string, metadata?: Record<string, unknown>, options?: HealthcareLogEntry): void {
    this.log('error', 'system', message, metadata, options)
  }

  /**
   * Log security event
   */
  security(message: string, metadata?: Record<string, unknown>, options?: HealthcareLogEntry): void {
    this.log('security', 'security', message, metadata, {
      ...options,
      dataClassification: 'restricted',
    })
  }

  /**
   * Log compliance event
   */
  compliance(message: string, metadata?: Record<string, unknown>, options?: HealthcareLogEntry): void {
    this.log('info', 'compliance', message, metadata, options)
  }

  /**
   * Log healthcare data access
   */
  healthcareAccess(
    message: string,
    metadata: HealthcareAccessMetadata & Record<string, unknown>,
    options?: HealthcareLogEntry
  ): void {
    this.log('info', 'healthcare', message, metadata, {
      ...options,
      dataClassification: 'sensitive',
      lgpdCompliant: metadata.lgpdConsent,
    })

    // Also log to audit system
    if (this.options.enableAuditLogging && options?.userId) {
      ;(async () => {
        try {
          await this.auditLogger.logHealthcareAccess(
            options.userId || 'system',
            'access',
            metadata.patientId || '',
            metadata.dataType || 'unknown',
            metadata.lgpdConsent || false,
            metadata
          )
        } catch (error) {
          // Silent fail for audit logging to prevent disrupting main functionality
          void error
        }
      })()
    }
  }

  /**
   * Log performance metrics
   */
  performance(message: string, metadata?: Record<string, unknown>, options?: HealthcareLogEntry): void {
    this.log('info', 'performance', message, metadata, options)
  }

  /**
   * Log audit event
   */
  audit(message: string, metadata?: Record<string, unknown>, options?: HealthcareLogEntry): void {
    this.log('info', 'audit', message, metadata, {
      ...options,
      dataClassification: 'restricted',
    })

    // Also log to audit system
    if (this.options.enableAuditLogging && options?.userId) {
      ;(async () => {
        try {
          await this.auditLogger.success(
            options.userId || 'system',
            'audit_event',
            'system',
            { ...metadata, message: message || '' }
          )
        } catch (error) {
          // Silent fail for audit logging to prevent disrupting main functionality
          void error
        }
      })()
    }
  }

  /**
   * Core logging method
   */
  private log(
    level: HealthcareLogEntry['level'],
    category: HealthcareLogEntry['category'],
    message: string,
    metadata?: Record<string, unknown>,
    options?: {
      userId?: string
      sessionId?: string
      ipAddress?: string
      userAgent?: string
      traceId?: string
      dataClassification?: HealthcareLogEntry['dataClassification']
      lgpdCompliant?: boolean
      anvisaCompliant?: boolean
      cfmCompliant?: boolean
    }
  ): void {
    // Check log level filter
    if (!this.shouldLog(level)) {
      return
    }

    const entry = this.createLogEntry(level, category, message, metadata, options)

    // Console logging
    if (this.options.enableConsoleLogging) {
      this.logToConsole(entry)
    }

    // Database logging (future implementation)
    if (this.options.enableDatabaseLogging) {
      ;(async () => {
        try {
          await this.logToDatabase(entry)
        } catch (error) {
          // Silent fail for database logging
          void error
        }
      })()
    }

    // File logging (future implementation)
    if (this.options.enableFileLogging) {
      this.logToFile(entry)
    }
  }

  /**
   * Check if message should be logged based on level
   */
  private shouldLog(level: HealthcareLogEntry['level']): boolean {
    const levels = ['debug', 'info', 'warn', 'error', 'security']
    const currentLevel = levels.indexOf(this.options.logLevel || 'info')
    const messageLevel = levels.indexOf(level)
    return messageLevel >= currentLevel
  }

  /**
   * Log to console with structured format
   */
  private logToConsole(entry: HealthcareLogEntry): void {
    const timestamp = entry.timestamp.toISOString()
    const level = entry.level.toUpperCase()
    const category = entry.category.toUpperCase()

    const logEntry = {
      timestamp,
      level,
      category,
      message: entry.message,
      id: entry.id,
      traceId: entry.traceId,
      userId: entry.userId,
      classification: entry.dataClassification,
      lgpd: entry.lgpdCompliant,
      anvisa: entry.anvisaCompliant,
      cfm: entry.cfmCompliant,
      metadata: entry.metadata,
    }

    // Use structured output to appropriate stream (healthcare compliant)
    const logOutput = JSON.stringify(logEntry) + '\n'

    switch (entry.level) {
      case 'error':
      case 'security':
        process.stderr.write(logOutput)
        break
      case 'warn':
        process.stderr.write(logOutput)
        break
      case 'debug':
        process.stdout.write(logOutput)
        break
      default:
        process.stdout.write(logOutput)
    }
  }

  /**
   * Log to database (placeholder implementation)
   */
  private async logToDatabase(entry: HealthcareLogEntry): Promise<void> {
    // Future implementation would store logs in database
    // For now, this is a placeholder
    void entry
  }

  /**
   * Log to file (placeholder implementation)
   */
  private logToFile(entry: HealthcareLogEntry): void {
    // Future implementation would write logs to file
    // For now, this is a placeholder
    void entry
  }

  /**
   * Sanitize metadata for logging
   */
  private sanitizeMetadata(metadata?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!metadata) return undefined

    const sanitized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === 'string') {
        sanitized[key] = SecurityUtils.sanitizeInput(value)
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeMetadata(value as Record<string, unknown>)
      } else {
        sanitized[key] = value
      }
    }
    return sanitized
  }

  /**
   * Classify data based on content and context
   */
  private classifyData(message: string, metadata?: Record<string, unknown>): HealthcareLogEntry['dataClassification'] {
    const sensitiveKeywords = [
      'patient', 'cpf', 'rg', 'cnh', 'medical', 'health', 'diagnosis', 'treatment', 'medication', 'symptom', 'doctor', 'physician', 'nurse', 'hospital', 'clinic'
    ]

    const restrictedKeywords = [
      'password', 'secret', 'token', 'key', 'authorization', 'credential', 'social security', 'credit card', 'financial'
    ]

    const text = (message + ' ' + JSON.stringify(metadata || {})).toLowerCase()

    if (restrictedKeywords.some(keyword => text.includes(keyword))) {
      return 'restricted'
    }

    if (sensitiveKeywords.some(keyword => text.includes(keyword))) {
      return 'sensitive'
    }

    return 'internal'
  }

  /**
   * Check LGPD compliance
   */
  private checkLGPDCompliance(message: string, metadata?: Record<string, unknown>): boolean {
    // Check for data processing consent
    const hasConsent = metadata?.lgpdConsent === true || metadata?.consent === true

    // Check for data minimization
    const minimalData = !message.includes('unnecessary_data_collection')

    // Check for purpose specification
    const hasPurpose = metadata?.purpose !== undefined || metadata?.reason !== undefined

    return hasConsent && minimalData && hasPurpose
  }

  /**
   * Check ANVISA compliance
   */
  private checkANVISACompliance(message: string, metadata?: Record<string, unknown>): boolean {
    // Check for medical device security
    const isMedicalDevice = message.toLowerCase().includes('device') || message.toLowerCase().includes('equipment')

    // Check for quality management
    const hasQualityCheck = metadata?.qualityChecked === true || metadata?.anvisaApproved === true

    // For non-medical device events, assume compliance
    if (!isMedicalDevice) return true

    return hasQualityCheck
  }

  /**
   * Check CFM compliance
   */
  private checkCFMCompliance(message: string, metadata?: Record<string, unknown>): boolean {
    // Check for professional license validation
    const hasLicense = metadata?.licenseNumber !== undefined || metadata?.crm !== undefined || metadata?.cfn !== undefined

    // Check for professional ethics
    const hasEthics = metadata?.ethicalConsideration === true || !message.includes('unethical_practice')

    // For non-medical professional events, assume compliance
    if (!message.toLowerCase().includes('medical') && !message.toLowerCase().includes('professional')) {
      return true
    }

    return hasLicense && hasEthics
  }

  /**
   * Generate unique ID for log entries
   */
  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  /**
   * Replace console methods with healthcare-compliant logging
   */
  static initialize(logger: HealthcareSecurityLogger): void {
    // Store original console methods before replacement
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug,
    }

    // Create healthcare-compliant console methods
    const healthcareMethods = consoleManager.createHealthcareMethods(logger)

    // Replace console methods
    consoleManager.replaceMethods(healthcareMethods)

    // Store original console methods for restoration
    ;(logger as any).originalConsole = originalConsole
  }

  /**
   * Restore original console methods
   */
  static restore(logger: HealthcareSecurityLogger): void {
    if (!logger) {
      throw new Error('HealthcareSecurityLogger instance is required for restoration')
    }

    const originalConsole = (logger as any).originalConsole
    if (originalConsole) {
      // Directly restore the stored original methods
      console.log = originalConsole.log
      console.error = originalConsole.error
      console.warn = originalConsole.warn
      console.info = originalConsole.info
      console.debug = originalConsole.debug
    }
  }
}

// Export default instance
export const healthcareSecurityLogger = new HealthcareSecurityLogger()

// Export for easy importing
// export default HealthcareSecurityLogger // Disabled to avoid multiple default exports

// Core encryption and key management
export { EncryptionManager, encryptionManager, KeyManager, keyManager } from './encryption'

// Unified security core
export {
  SecurityValidator,
  SecurityRateLimiter,
  SecurityEventLogger,
  securityValidator,
  securityEventLogger,
  type SecurityResult,
  type SecurityConfig,
  type ValidationContext,
  SECURITY_ERROR_CODES,
} from './core/security-base'

export {
  BaseSessionManager,
  type SessionMetadata,
  type SessionConfig,
  type ValidationResult,
} from './core/session-base'

// Audit logging
export {
  type AuditLogEntry,
  AuditLogger,
  auditLogger,
  type AuditLoggerOptions,
} from './audit/logger'

// Security utilities and validation
export {
  RateLimiter,
  rateLimiter,
  SecureLogger,
  secureLogger,
  SecurityUtils,
  securityUtils,
} from './utils'

// LGPD anonymization and data masking utilities
export {
  ANONYMIZATION_VERSION,
  type AnonymizationMetadata,
  anonymizePersonalData,
  DEFAULT_MASKING_OPTIONS,
  generatePrivacyReport,
  isDataAnonymized,
  type LGPDComplianceLevel,
  maskAddress,
  maskCNPJ,
  maskCPF,
  maskEmail,
  type MaskingOptions,
  maskName,
  maskPatientData,
  maskPhone,
  type PatientData,
} from './anonymization'

// Security middleware for Hono framework
export {
  authentication,
  authorization,
  csrfProtection,
  getProtectedRoutesMiddleware,
  getSecurityMiddlewareStack,
  healthcareDataProtection,
  inputValidation,
  rateLimiting,
  requestId,
  securityHeaders,
  securityLogging,
} from './middleware'

// Named facade for common usage
export function maskSensitiveData(data: string, maskChar: string = '*') {
  return SecurityUtils.maskSensitiveData(data, maskChar)
}

// Default export with all components
// Default export disabled to avoid conflicts
// export default {
//   version: SECURITY_VERSION,
//   // ... all the exports would go here
// }

// Governance and compliance services
export {
  HealthcareGovernanceService,
  HealthcareGovernanceServiceImpl,
  type KPIMetric,
  type CreateKPIMetric,
  type UpdateKPIMetric,
  type RiskAssessment,
  type CreateRiskAssessment,
  type AIGovernanceMetric,
  type CreateAIGovernanceMetric,
  type PolicyManagement,
  type AuditTrailEntry,
  type CreateAuditTrailEntry,
  type ComplianceStatus,
  type EscalationWorkflow,
  type CreateEscalationWorkflow,
  type UpdateEscalationWorkflow,
  type AuditTrailFilters,
  type EscalationFilters,
  type HealthcareDashboardData,
} from './governance/services/healthcare-governance.service'

// Re-export Hono types for convenience
export type { Context, Next } from 'hono'
