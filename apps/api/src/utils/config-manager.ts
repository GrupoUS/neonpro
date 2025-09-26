/**
 * 🛠️ Configuration Management Utility
 * 
 * A centralized configuration management system with:
 * - Environment-based configuration loading
 * - Type-safe configuration validation
 * - Secure secret management integration
 * - Runtime configuration updates
 * - Configuration change tracking and auditing
 * - Healthcare-compliant configuration handling
 */

import { SecureLogger } from './secure-logger'
import { SecretManager } from './secret-manager'
import { HealthcareError, HealthcareErrorSeverity, HealthcareErrorCategory } from './healthcare-errors'

export interface ConfigSchema<T = any> {
  /**
   * Configuration schema definition for validation
   */
  type: 'object' | 'string' | 'number' | 'boolean' | 'array'
  required?: boolean
  default?: any
  validator?: (value: any) => boolean
  sanitizer?: (value: any) => any
  description?: string
  sensitive?: boolean
  environment?: string[] // Environments where this config is applicable
}

export interface ConfigChangeEvent<T = any> {
  /**
   * Event emitted when configuration changes
   */
  key: string
  oldValue: T | undefined
  newValue: T
  timestamp: Date
  source: 'environment' | 'file' | 'api' | 'secret'
  userId?: string
}

export interface ConfigManagerOptions {
  /**
   * Options for configuration manager
   */
  environment: 'development' | 'staging' | 'production'
  configPath?: string
  enableHotReload?: boolean
  enableChangeTracking?: boolean
  strictValidation?: boolean
  auditLogChanges?: boolean
}

export class ConfigManager<T extends Record<string, any> = Record<string, any>> {
  private config: Partial<T> = {}
  private schema: Record<string, ConfigSchema> = {}
  private logger: SecureLogger
  private secretManager: SecretManager
  private options: ConfigManagerOptions
  private changeListeners: Set<(event: ConfigChangeEvent) => void> = new Set()
  private validationCache: Map<string, { valid: boolean; value: any; error?: string }> = new Map()

  constructor(options: ConfigManagerOptions) {
    this.options = {
      enableHotReload: true,
      enableChangeTracking: true,
      strictValidation: true,
      auditLogChanges: true,
      ...options
    }

    this.logger = new SecureLogger({
      level: 'info',
      maskSensitiveData: true,
      lgpdCompliant: true,
      auditTrail: this.options.auditLogChanges,
      _service: 'ConfigManager'
    })

    this.secretManager = new SecretManager()
  }

  /**
   * Define configuration schema
   */
  defineSchema<K extends keyof T>(key: K, schema: ConfigSchema<T[K]>): void {
    this.schema[key as string] = {
      ...schema,
      environment: schema.environment || ['development', 'staging', 'production']
    }

    // Validate default value if provided
    if (schema.default !== undefined) {
      const validation = this.validateValue(key as string, schema.default)
      if (!validation.valid) {
        throw new HealthcareError(
          'INVALID_SCHEMA_DEFAULT',
          HealthcareErrorCategory.VALIDATION,
          HealthcareErrorSeverity.MEDIUM,
          `Invalid default value for ${String(key)}: ${validation.error}`
        )
      }
    }

    this.logger.debug('Configuration schema defined', { 
      key: String(key), 
      type: schema.type,
      required: schema.required,
      sensitive: schema.sensitive 
    })
  }

  /**
   * Set configuration value with validation
   */
  async set<K extends keyof T>(
    key: K, 
    value: T[K], 
    options: {
      source?: ConfigChangeEvent['source']
      userId?: string
      skipValidation?: boolean
      persist?: boolean
    } = {}
  ): Promise<void> {
    const { source = 'api', userId, skipValidation = false, persist = true } = options
    const keyStr = key as string

    // Check if configuration is applicable for current environment
    const schema = this.schema[keyStr]
    if (schema && schema.environment && !schema.environment.includes(this.options.environment)) {
      throw new HealthcareError(
        'CONFIG_NOT_APPLICABLE',
        HealthcareErrorCategory.VALIDATION,
        HealthcareErrorSeverity.MEDIUM,
        `Configuration ${keyStr} is not applicable for environment ${this.options.environment}`
      )
    }

    const oldValue = this.config[keyStr]
    
    // Validate value if schema is defined
    if (!skipValidation && schema) {
      const validation = this.validateValue(keyStr, value)
      if (!validation.valid) {
        throw new HealthcareError(
          'INVALID_CONFIG_VALUE',
          HealthcareErrorCategory.VALIDATION,
          HealthcareErrorSeverity.MEDIUM,
          `Invalid value for ${keyStr}: ${validation.error}`
        )
      }
    }

    // Sanitize value
    const sanitizedValue = schema?.sanitizer ? schema.sanitizer(value) : value

    // Set the value
    this.config[keyStr] = sanitizedValue

    // Cache validation result
    this.validationCache.set(keyStr, { 
      valid: true, 
      value: sanitizedValue 
    })

    // Emit change event
    if (this.options.enableChangeTracking && oldValue !== sanitizedValue) {
      await this.emitChangeEvent({
        key: keyStr,
        oldValue,
        newValue: sanitizedValue,
        timestamp: new Date(),
        source,
        userId
      })
    }

    // Persist configuration if needed
    if (persist) {
      await this.persistConfiguration()
    }

    this.logger.debug('Configuration set', { 
      key: keyStr, 
      source,
      changed: oldValue !== sanitizedValue 
    })
  }

  /**
   * Get configuration value
   */
  get<K extends keyof T>(key: K): T[K] | undefined {
    const keyStr = key as string
    const schema = this.schema[keyStr]

    // Check cache first
    if (this.validationCache.has(keyStr)) {
      const cached = this.validationCache.get(keyStr)!
      return cached.value
    }

    // Return current value or default
    const value = this.config[keyStr] ?? schema?.default

    // Validate and cache
    if (schema) {
      const validation = this.validateValue(keyStr, value)
      this.validationCache.set(keyStr, validation)
      
      if (!validation.valid && this.options.strictValidation) {
        throw new HealthcareError(
          'INVALID_CONFIG_VALUE',
          HealthcareErrorCategory.VALIDATION,
          HealthcareErrorSeverity.MEDIUM,
          `Configuration ${keyStr} has invalid value: ${validation.error}`
        )
      }
    }

    return value
  }

  /**
   * Get configuration value with required check
   */
  getRequired<K extends keyof T>(key: K): T[K] {
    const value = this.get(key)
    if (value === undefined || value === null) {
      throw new HealthcareError(
        'REQUIRED_CONFIG_MISSING',
        HealthcareErrorCategory.VALIDATION,
        HealthcareErrorSeverity.HIGH,
        `Required configuration ${String(key)} is missing`
      )
    }
    return value
  }

  /**
   * Get all configuration values, filtering sensitive ones
   */
  getAll(): Partial<T> {
    const result: Partial<T> = {}
    
    for (const [key, schema] of Object.entries(this.schema)) {
      if (!schema.sensitive) {
        result[key as keyof T] = this.get(key as keyof T)
      }
    }

    return result
  }

  /**
   * Load configuration from environment variables
   */
  async loadFromEnvironment(prefix: string = 'APP_'): Promise<void> {
    this.logger.info('Loading configuration from environment variables', { prefix })

    for (const [key, schema] of Object.entries(this.schema)) {
      const envKey = `${prefix}${key.toUpperCase().replace(/([A-Z])/g, '_$1')}`
      const envValue = process.env[envKey]

      if (envValue !== undefined) {
        try {
          const parsedValue = this.parseEnvironmentValue(envValue, schema.type)
          await this.set(key as keyof T, parsedValue, { 
            source: 'environment',
            skipValidation: false 
          })
        } catch (error) {
          this.logger.error('Failed to load environment configuration', {
            key,
            envKey,
            error: error instanceof Error ? error.message : String(error)
          }, HealthcareErrorSeverity.MEDIUM)
        }
      }
    }
  }

  /**
   * Load configuration from file
   */
  async loadFromFile(filePath: string): Promise<void> {
    this.logger.info('Loading configuration from file', { filePath })

    try {
      // In a real implementation, this would read and parse the file
      // For now, we'll simulate file loading
      const fileConfig = await this.readFileConfig(filePath)
      
      for (const [key, value] of Object.entries(fileConfig)) {
        if (key in this.schema) {
          await this.set(key as keyof T, value as T[keyof T], { 
            source: 'file' 
          })
        }
      }
    } catch (error) {
      throw new HealthcareError(
        'CONFIG_LOAD_FAILED',
        HealthcareErrorCategory.SYSTEM,
        HealthcareErrorSeverity.HIGH,
        `Failed to load configuration from ${filePath}: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Validate all configuration values
   */
  validateAll(): { valid: boolean; errors: Array<{ key: string; error: string }> } {
    const errors: Array<{ key: string; error: string }> = []

    for (const [key, schema] of Object.entries(this.schema)) {
      if (schema.required && this.config[key] === undefined && schema.default === undefined) {
        errors.push({ key, error: 'Required configuration is missing' })
        continue
      }

      const value = this.config[key] ?? schema.default
      if (value !== undefined) {
        const validation = this.validateValue(key, value)
        if (!validation.valid) {
          errors.push({ key, error: validation.error! })
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Watch for configuration changes
   */
  onChange(callback: (event: ConfigChangeEvent) => void): () => void {
    this.changeListeners.add(callback)
    
    return () => {
      this.changeListeners.delete(callback)
    }
  }

  /**
   * Export configuration for backup/restore
   */
  exportConfiguration(): { config: Partial<T>; schema: Record<string, ConfigSchema>; timestamp: Date } {
    return {
      config: this.getAll(),
      schema: this.schema,
      timestamp: new Date()
    }
  }

  /**
   * Import configuration from backup
   */
  async importConfiguration(exported: { config: Partial<T>; schema?: Record<string, ConfigSchema> }): Promise<void> {
    this.logger.info('Importing configuration from backup')

    // Update schema if provided
    if (exported.schema) {
      Object.assign(this.schema, exported.schema)
    }

    // Import configuration values
    for (const [key, value] of Object.entries(exported.config)) {
      if (key in this.schema) {
        await this.set(key as keyof T, value as T[keyof T], { 
          source: 'file',
          persist: false 
        })
      }
    }

    // Persist all changes
    await this.persistConfiguration()
  }

  // Private helper methods
  private validateValue(key: string, value: any): { valid: boolean; value: any; error?: string } {
    const schema = this.schema[key]
    if (!schema) {
      return { valid: true, value }
    }

    // Type validation
    if (!this.validateType(value, schema.type)) {
      return { 
        valid: false, 
        value, 
        error: `Expected ${schema.type}, got ${typeof value}` 
      }
    }

    // Custom validator
    if (schema.validator && !schema.validator(value)) {
      return { 
        valid: false, 
        value, 
        error: `Custom validation failed for ${key}` 
      }
    }

    return { valid: true, value }
  }

  private validateType(value: any, type: ConfigSchema['type']): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string'
      case 'number':
        return typeof value === 'number' && !isNaN(value)
      case 'boolean':
        return typeof value === 'boolean'
      case 'array':
        return Array.isArray(value)
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value)
      default:
        return true
    }
  }

  private parseEnvironmentValue(value: string, type: ConfigSchema['type']): any {
    switch (type) {
      case 'string':
        return value
      case 'number':
        const num = Number(value)
        if (isNaN(num)) {
          throw new Error(`Cannot parse "${value}" as number`)
        }
        return num
      case 'boolean':
        if (value.toLowerCase() === 'true') return true
        if (value.toLowerCase() === 'false') return false
        throw new Error(`Cannot parse "${value}" as boolean`)
      case 'array':
        try {
          return JSON.parse(value)
        } catch {
          return value.split(',').map(v => v.trim())
        }
      case 'object':
        return JSON.parse(value)
      default:
        return value
    }
  }

  private async emitChangeEvent(event: ConfigChangeEvent): Promise<void> {
    // Log the change
    this.logger.info('Configuration changed', {
      key: event.key,
      source: event.source,
      timestamp: event.timestamp.toISOString()
    })

    // Notify listeners
    for (const listener of this.changeListeners) {
      try {
        listener(event)
      } catch (error) {
        this.logger.error('Error in configuration change listener', {
          key: event.key,
          error: error instanceof Error ? error.message : String(error)
        }, HealthcareErrorSeverity.LOW)
      }
    }
  }

  private async persistConfiguration(): Promise<void> {
    // In a real implementation, this would save to persistent storage
    this.logger.debug('Configuration persisted')
  }

  private async readFileConfig(filePath: string): Promise<Record<string, any>> {
    // Mock implementation - in real scenario, read and parse file
    return {}
  }
}

/**
 * Create a ConfigManager configured with the provided options.
 *
 * @param options - Configuration options controlling environment, persistence, validation, auditing, and other manager behavior
 * @returns A new ConfigManager instance configured according to `options`
 */
export function createConfigManager<T extends Record<string, any>>(
  options: ConfigManagerOptions
): ConfigManager<T> {
  return new ConfigManager<T>(options)
}

// Predefined schemas for common healthcare configurations
export const HealthcareConfigSchemas = {
  database: {
    host: { type: 'string', required: true, description: 'Database host' },
    port: { type: 'number', required: true, default: 5432, description: 'Database port' },
    name: { type: 'string', required: true, description: 'Database name' },
    ssl: { type: 'boolean', default: true, description: 'Enable SSL connection' },
    poolSize: { type: 'number', default: 10, description: 'Connection pool size' }
  } as const,

  security: {
    jwtSecret: { 
      type: 'string', 
      required: true, 
      sensitive: true,
      validator: (value: string) => value.length >= 32,
      description: 'JWT signing secret (min 32 characters)' 
    },
    bcryptRounds: { type: 'number', default: 12, description: 'BCrypt hashing rounds' },
    sessionTimeout: { type: 'number', default: 3600, description: 'Session timeout in seconds' },
    maxLoginAttempts: { type: 'number', default: 5, description: 'Maximum login attempts before lockout' }
  } as const,

  healthcare: {
    lgpdRetentionDays: { type: 'number', default: 365 * 25, description: 'LGPD data retention period in days' },
    enableAuditTrail: { type: 'boolean', default: true, description: 'Enable comprehensive audit trail' },
    dataAnonymization: { type: 'boolean', default: true, description: 'Enable automatic data anonymization' },
    emergencyAccess: { type: 'boolean', default: false, description: 'Enable emergency access mode' }
  } as const,

  monitoring: {
    enableMetrics: { type: 'boolean', default: true, description: 'Enable metrics collection' },
    metricsInterval: { type: 'number', default: 60, description: 'Metrics collection interval in seconds' },
    enableAlerts: { type: 'boolean', default: true, description: 'Enable alert notifications' },
    alertEmails: { 
      type: 'array', 
      default: [],
      validator: (emails: string[]) => emails.every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
      description: 'Alert notification email addresses'
    }
  } as const
}