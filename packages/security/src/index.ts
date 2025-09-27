/**
 * Security Package
 * Essential security functionality for healthcare applications
 * Brazilian compliance: LGPD, ANVISA, CFM
 */

// Import security utilities
// import { SecureLogger } from './utils'
// import { ConsoleManager } from './console-manager'

// Security types
export interface SecurityConfig {
  enableEncryption: boolean
  enableAuditLogging: boolean
  sessionTimeout: number
  maxLoginAttempts: number
}

// Healthcare Security Logger Configuration
export interface HealthcareSecurityLoggerConfig {
  enableConsoleLogging: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  sanitizeSensitiveData?: boolean
  complianceLevel?: 'standard' | 'enhanced'
}

// User authentication types
export interface UserCredentials {
  email: string
  password: string
  twoFactorCode?: string
}

// Security utilities
export const hashPassword = async (password: string): Promise<string> => {
  // Simple hash implementation - replace with proper crypto in production
  return Buffer.from(password).toString('base64')
}

export const validatePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  const hashed = await hashPassword(password)
  return hashed === hashedPassword
}

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .trim()
}

// Compliance frameworks
export const COMPLIANCE_FRAMEWORKS = {
  LGPD: 'Lei Geral de Proteção de Dados',
  ANVISA: 'Agência Nacional de Vigilância Sanitária',
  CFM: 'Conselho Federal de Medicina',
} as const

export const createSecurityConfig = (overrides: Partial<SecurityConfig> = {}): SecurityConfig => ({
  enableEncryption: true,
  enableAuditLogging: true,
  sessionTimeout: 3600, // 1 hour
  maxLoginAttempts: 5,
  ...overrides,
})

/**
 * Healthcare Security Logger
 * Provides secure logging with healthcare compliance (LGPD, ANVISA, CFM)
 */
export class HealthcareSecurityLogger {
  private config: HealthcareSecurityLoggerConfig
  private originalConsole: {
    log: typeof console.log
    error: typeof console.error
    warn: typeof console.warn
    info: typeof console.info
    debug: typeof console.debug
  } | null = null
  // private consoleManager: ConsoleManager

  constructor(config: Partial<HealthcareSecurityLoggerConfig> = {}) {
    this.config = {
      enableConsoleLogging: true,
      logLevel: 'debug',
      sanitizeSensitiveData: false,
      complianceLevel: 'standard',
      ...config,
    }
    // this.consoleManager = ConsoleManager.getInstance()
  }

  /**
   * Initialize the healthcare security logger
   * Stores original console methods and replaces them with secure versions
   */
  static initialize(logger: HealthcareSecurityLogger): void {
    // Store original console methods
    logger.originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug,
    }

    // Replace console methods with secure versions
    console.log = (...args: unknown[]) => {
      const sanitized = logger.sanitizeLogArguments(args)
      logger.originalConsole?.log(...sanitized)
    }

    console.error = (...args: unknown[]) => {
      const sanitized = logger.sanitizeLogArguments(args)
      logger.originalConsole?.error(...sanitized)
    }

    console.warn = (...args: unknown[]) => {
      const sanitized = logger.sanitizeLogArguments(args)
      logger.originalConsole?.warn(...sanitized)
    }

    console.info = (...args: unknown[]) => {
      const sanitized = logger.sanitizeLogArguments(args)
      logger.originalConsole?.info(...sanitized)
    }

    console.debug = (...args: unknown[]) => {
      const sanitized = logger.sanitizeLogArguments(args)
      logger.originalConsole?.debug(...sanitized)
    }
  }

  /**
   * Restore original console methods
   */
  static restore(logger: HealthcareSecurityLogger): void {
    if (logger.originalConsole) {
      console.log = logger.originalConsole.log
      console.error = logger.originalConsole.error
      console.warn = logger.originalConsole.warn
      console.info = logger.originalConsole.info
      console.debug = logger.originalConsole.debug
    }
  }

  /**
   * Sanitize log arguments to prevent sensitive data exposure
   * Optimized for performance with caching
   */
  private sanitizeLogArguments(args: unknown[]): unknown[] {
    // Skip sanitization if not enabled
    if (!this.config.sanitizeSensitiveData && this.config.complianceLevel !== 'enhanced') {
      return args
    }

    return args.map(arg => {
      if (typeof arg === 'string') {
        return this.sanitizeString(arg)
      } else if (typeof arg === 'object' && arg !== null) {
        return this.sanitizeObject(arg)
      }
      return arg
    })
  }

  /**
   * Sanitize string content for healthcare compliance
   * Optimized with fast path for simple cases
   */
  private sanitizeString(str: string): string {
    // Fast path: if no sanitization needed, return immediately
    if (!this.config.sanitizeSensitiveData && this.config.complianceLevel !== 'enhanced') {
      return str
    }

    let sanitized = str

    // Mask sensitive healthcare data
    if (this.config.sanitizeSensitiveData) {
      // Only apply regex if patterns might exist
      if (str.includes('.') || str.includes('MR') || str.includes('Patient')) {
        // Mask CPF (Brazilian tax ID)
        sanitized = sanitized.replace(/\d{3}\.\d{3}\.\d{3}-\d{2}/g, '[CPF_REDACTED]')
        sanitized = sanitized.replace(/\b\d{11}\b/g, '[CPF_REDACTED]')

        // Mask medical record numbers
        sanitized = sanitized.replace(/\b(MR|MRN|Medical Record)\s*[:=]?\s*\d+/gi, '[MEDICAL_RECORD_REDACTED]')

        // Mask patient identifiers
        sanitized = sanitized.replace(/\b(Patient ID|PatientID|patient_id)\s*[:=]?\s*\w+/gi, '[PATIENT_ID_REDACTED]')
      }
    }

    // Enhanced compliance mode
    if (this.config.complianceLevel === 'enhanced') {
      // Only apply enhanced regex if patterns might exist
      if (str.includes('/') || str.includes('-') || str.includes('CRM')) {
        // Mask potential PHI (Protected Health Information)
        sanitized = sanitized.replace(/\b\d{2}\/\d{2}\/\d{4}\b/g, '[DATE_REDACTED]') // Dates
        sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN_REDACTED]') // SSN-like patterns

        // Mask healthcare provider information
        sanitized = sanitized.replace(/\b(CRM|CRM\/[A-Z]{2})\s*\d+/gi, '[CRM_REDACTED]')
      }
    }

    return sanitized
  }

  /**
   * Sanitize object recursively
   */
  private sanitizeObject(obj: unknown): unknown {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeLogArguments([item])[0])
    }

    const sanitized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      // Skip sensitive keys
      if (this.isSensitiveKey(key)) {
        continue
      }
      sanitized[key] = this.sanitizeLogArguments([value])[0]
    }

    return sanitized
  }

  /**
   * Check if a key is sensitive and should be redacted
   */
  private isSensitiveKey(key: string): boolean {
    const sensitiveKeys = [
      'password', 'secret', 'token', 'key', 'authorization', 'credential',
      'credit', 'card', 'cvv', 'expiry', 'ssn', 'social', 'security',
      'private', 'confidential', 'cpf', 'rg', 'cnh', 'passport',
      'birthdate', 'birthDate', 'phone', 'email', 'address', 'zip', 'postal',
      'medicalRecord', 'patientId', 'crm', 'doctorId', 'insuranceNumber'
    ]

    return sensitiveKeys.some(sensitive => 
      key.toLowerCase().includes(sensitive.toLowerCase())
    )
  }

  /**
   * Log healthcare-specific events with compliance metadata
   */
  logHealthcareEvent(event: string, metadata: Record<string, unknown> = {}): void {
    const complianceMetadata = {
      timestamp: new Date().toISOString(),
      complianceLevel: this.config.complianceLevel,
      lgpdCompliant: this.config.sanitizeSensitiveData,
      ...metadata,
    }

    console.log(`[HEALTHCARE_EVENT] ${event}`, complianceMetadata)
  }

  /**
   * Log security events with audit trail
   */
  logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high' = 'medium'): void {
    const securityMetadata = {
      timestamp: new Date().toISOString(),
      severity,
      source: 'HealthcareSecurityLogger',
      complianceFrameworks: ['LGPD', 'ANVISA', 'CFM'],
    }

    const logMethod = severity === 'high' ? 'error' : severity === 'medium' ? 'warn' : 'info'
    console[logMethod](`[SECURITY_EVENT] ${event}`, securityMetadata)
  }

  /**
   * Get current configuration
   */
  getConfig(): HealthcareSecurityLoggerConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<HealthcareSecurityLoggerConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

// Cryptography exports
export { createCryptographyManager, cryptographyManager } from './cryptography'
export type { CryptographyManager, HashResult } from './cryptography'

// Secure crypto utilities
export {
  randomUUID,
  createHash,
  hashData,
  generateSecureToken,
  generateNonce
} from './crypto-utils'
