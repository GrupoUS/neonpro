/**
 * Audit logging utilities for NeonPro security compliance
 * Handles structured logging for healthcare data access and operations
 */

// Supabase client is optional - only import if available
let createClient: any = null
try {
  createClient = require('@supabase/supabase-js').createClient
} catch {
  // Supabase not available - database logging will be disabled
}

// Local interface to avoid external type dependencies
interface LocalDatabase {
  public: {
    Tables: {
      audit_logs: {
        Insert: {
          id?: string
          user_id?: string
          action: string
          resource_type: string
          resource_id?: string
          new_values?: any
          details?: any
          ip_address?: string | null
          user_agent?: string
          lgpd_basis?: string | null
          created_at?: string
          [key: string]: any
        }
      }
    }
  }
}

export interface AuditLogEntry {
  id?: string
  _userId: string
  action: string
  resource: string
  resourceId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  timestamp?: Date
  success: boolean
  errorMessage?: string
  lgpdCompliant?: boolean
  dataClassification?: 'public' | 'internal' | 'sensitive' | 'restricted'
}

export interface AIMetadata {
  inputTokens?: number
  outputTokens?: number
  model?: string
  confidence?: number
  processingTimeMs?: number
  costUsd?: number
  requestType?: string
  responseFormat?: string
  errorRate?: number
}

export interface HealthcareAccessMetadata {
  dataType: string
  lgpdConsent: boolean
  patientId?: string
  encounterId?: string
  facilityId?: string
  departmentId?: string
  accessReason?: string
  retentionPeriod?: string
  dataSensitivity?: string
}

export interface AuditLoggerOptions {
  enableConsoleLogging?: boolean
  enableDatabaseLogging?: boolean
  enableFileLogging?: boolean
  logLevel?: 'debug' | 'info' | 'warn' | 'error'
  supabaseUrl?: string
  supabaseKey?: string
}

export class AuditLogger {
  private options: AuditLoggerOptions
  private supabase?: ReturnType<typeof createClient<LocalDatabase>>

  constructor(options: AuditLoggerOptions = {}) {
    this.options = {
      enableConsoleLogging: true,
      enableDatabaseLogging: false,
      enableFileLogging: false,
      logLevel: 'info',
      ...options,
    }

    // Initialize Supabase client if database logging is enabled and available
    if (
      this.options.enableDatabaseLogging &&
      createClient &&
      this.options.supabaseUrl &&
      this.options.supabaseKey
    ) {
      this.supabase = createClient(
        this.options.supabaseUrl,
        this.options.supabaseKey,
      )
    }
  }

  /**
   * Log an audit entry
   */
  async log(entry: AuditLogEntry): Promise<void> {
    // Validate and sanitize entry
    const sanitizedEntry = this.validateAndSanitizeEntry(entry)
    
    const fullEntry: AuditLogEntry = {
      ...sanitizedEntry,
      timestamp: sanitizedEntry.timestamp || new Date(),
      id: sanitizedEntry.id || this.generateId(),
    }

    // Console logging
    if (this.options.enableConsoleLogging) {
      this.logToConsole(fullEntry)
    }

    // Database logging
    if (this.options.enableDatabaseLogging && this.supabase) {
      try {
        await this.logToDatabase(fullEntry)
      } catch (error) {
        void error
        // Database logging failed but console logging will still capture the audit entry
      }
    }

    // File logging (placeholder - would need file system implementation)
    if (this.options.enableFileLogging) {
      this.logToFile(fullEntry)
    }
  }

  /**
   * Log a successful operation
   */
  async success(
    _userId: string,
    action: string,
    resource: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.log({
      _userId,
      action,
      resource,
      metadata,
      success: true,
    })
  }

  /**
   * Log a failed operation
   */
  async error(
    _userId: string,
    action: string,
    resource: string,
    errorMessage: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.log({
      _userId,
      action,
      resource,
      errorMessage,
      metadata,
      success: false,
    })
  }

  /**
   * Log healthcare data access (LGPD compliant)
   */
  async logHealthcareAccess(
    _userId: string,
    action: string,
    patientId: string,
    dataType: string,
    lgpdConsent: boolean = false,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.log({
      _userId,
      action: `healthcare_data_${action}`,
      resource: 'patient_data',
      resourceId: patientId,
      metadata: {
        ...metadata,
        dataType,
        lgpdConsent,
      },
      success: true,
      lgpdCompliant: lgpdConsent,
      dataClassification: 'sensitive',
    })
  }

  /**
   * Log AI/ML operations
   */
  async logAIOperation(
    _userId: string,
    action: string,
    model: string,
    inputTokens?: number,
    outputTokens?: number,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    // Validate AI metadata
    const aiMetadata: AIMetadata = {
      inputTokens,
      outputTokens,
      model,
    }

    // Validate additional metadata fields if present
    if (metadata) {
      if (typeof metadata.confidence === 'number') {
        aiMetadata.confidence = metadata.confidence
      }
      if (typeof metadata.processingTimeMs === 'number') {
        aiMetadata.processingTimeMs = metadata.processingTimeMs
      }
      if (typeof metadata.costUsd === 'number') {
        aiMetadata.costUsd = metadata.costUsd
      }
      if (typeof metadata.requestType === 'string') {
        aiMetadata.requestType = metadata.requestType
      }
      if (typeof metadata.responseFormat === 'string') {
        aiMetadata.responseFormat = metadata.responseFormat
      }
      if (typeof metadata.errorRate === 'number') {
        aiMetadata.errorRate = metadata.errorRate
      }
    }

    await this.log({
      _userId,
      action: `ai_${action}`,
      resource: 'ai_model',
      resourceId: model,
      metadata: aiMetadata as Record<string, unknown>,
      success: true,
      dataClassification: 'internal',
    })
  }

  private logToConsole(entry: AuditLogEntry): void {
    // Format audit entry for console output - use the exact format expected by tests
    const consoleEntry = {
      id: entry.id,
      timestamp: entry.timestamp?.toISOString(),
      userId: entry._userId, // Test expects this field name
      action: entry.action,
      resource: entry.resource,
      resourceId: entry.resourceId,
      success: entry.success,
      errorMessage: entry.errorMessage,
      lgpdCompliant: entry.lgpdCompliant,
      dataClassification: entry.dataClassification,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      metadata: entry.metadata
    }

    // Log to console for testing purposes - wrap in try-catch to ensure no throws
    try {
      console.log(JSON.stringify(consoleEntry))
    } catch (error) {
      // If JSON.stringify fails due to circular references, log a simplified version
      const safeEntry = {
        id: consoleEntry.id,
        timestamp: consoleEntry.timestamp,
        userId: consoleEntry.userId,
        action: consoleEntry.action,
        resource: consoleEntry.resource,
        success: consoleEntry.success,
        error: 'Circular reference in metadata'
      }
      try {
        console.log(JSON.stringify(safeEntry))
      } catch {
        // Ultimate fallback - ensure no throw
        console.log('{"id":"fallback","action":"log_entry"}')
      }
    }
  }

  private async logToDatabase(entry: AuditLogEntry): Promise<void> {
    if (!this.supabase) return

    // Serialize metadata safely
    const serializedMetadata = this.serializeMetadata(entry.metadata)

    // Build audit log entry compatible with current schema
    // Use type assertion to bypass strict typing issues due to schema mismatch
    const auditLogData: any = {
      user_id: entry._userId,
      action: entry.action,
      resource_type: entry.resource,
      resource_id: entry.resourceId || undefined,
      ip_address: entry.ipAddress || null,
      user_agent: entry.userAgent || undefined,
      lgpd_basis: entry.lgpdCompliant ? 'legitimate_interest' : null,
      created_at: entry.timestamp?.toISOString(),
      // Support both schema variations for compatibility
      new_values: serializedMetadata,
      details: serializedMetadata,
    }

    const { error } = await this.supabase.from('audit_logs').insert(auditLogData)

    if (error) {
      throw error
    }
  }

  /**
   * Safely serialize metadata for database storage
   */
  private serializeMetadata(metadata?: Record<string, unknown>): unknown {
    if (!metadata) return null

    try {
      // Create a safe copy of the metadata
      const safeMetadata: Record<string, unknown> = {}

      // Only include primitive types and safe objects
      for (const [key, value] of Object.entries(metadata)) {
        if (value === null || value === undefined) {
          safeMetadata[key] = null
        } else if (
          typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
        ) {
          safeMetadata[key] = value
        } else if (typeof value === 'object') {
          // For objects, try to stringify them safely
          try {
            // Check for circular references
            const seen = new WeakSet()
            const detectCircular = (obj: any): boolean => {
              if (obj && typeof obj === 'object') {
                if (seen.has(obj)) return true
                seen.add(obj)
                for (const value of Object.values(obj)) {
                  if (detectCircular(value)) return true
                }
              }
              return false
            }

            if (detectCircular(value)) {
              safeMetadata[key] = '[Circular Reference]'
            } else {
              safeMetadata[key] = JSON.stringify(value)
            }
          } catch {
            safeMetadata[key] = '[Object]'
          }
        } else {
          safeMetadata[key] = String(value)
        }
      }

      return safeMetadata
    } catch (error) {
      void error
      // Failed to serialize metadata - continuing with null metadata
      return null
    }
  }

  private logToFile(entry: AuditLogEntry): void {
    // Placeholder for file logging implementation
    // In a real implementation, this would write to a log file
    void entry
    // File logging disabled for production compliance
  }

  /**
   * Validate and sanitize audit entry to prevent errors
   */
  private validateAndSanitizeEntry(entry: AuditLogEntry): AuditLogEntry {
    const sanitized: AuditLogEntry = {
      _userId: entry._userId || 'unknown',
      action: entry.action || 'unknown_action',
      resource: entry.resource || 'unknown_resource',
      success: entry.success ?? false,
    }

    // Copy safe fields
    if (entry.id) sanitized.id = entry.id
    if (entry.timestamp) sanitized.timestamp = entry.timestamp
    if (entry.resourceId) sanitized.resourceId = entry.resourceId
    if (entry.errorMessage) sanitized.errorMessage = entry.errorMessage
    if (entry.ipAddress) sanitized.ipAddress = entry.ipAddress
    if (entry.userAgent) sanitized.userAgent = entry.userAgent
    if (entry.lgpdCompliant !== undefined) sanitized.lgpdCompliant = entry.lgpdCompliant
    if (entry.dataClassification) sanitized.dataClassification = entry.dataClassification

    // Safely handle metadata
    if (entry.metadata) {
      try {
        sanitized.metadata = this.sanitizeMetadata(entry.metadata)
      } catch {
        // If metadata sanitization fails, continue without metadata
        sanitized.metadata = undefined
      }
    }

    return sanitized
  }

  /**
   * Sanitize metadata to handle circular references and unsafe values
   */
  private sanitizeMetadata(metadata?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!metadata) return undefined

    const sanitized: Record<string, unknown> = {}
    const seen = new WeakSet()

    const sanitizeValue = (value: unknown): unknown => {
      if (value === null || value === undefined) {
        return null
      }

      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return value
      }

      if (typeof value === 'object') {
        if (seen.has(value as object)) {
          return '[Circular Reference]'
        }
        seen.add(value as object)

        if (Array.isArray(value)) {
          return value.map(sanitizeValue)
        }

        const obj: Record<string, unknown> = {}
        for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
          obj[key] = sanitizeValue(val)
        }
        return obj
      }

      return String(value)
    }

    for (const [key, value] of Object.entries(metadata)) {
      sanitized[key] = sanitizeValue(value)
    }

    return sanitized
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }
}

// Default audit logger instance
export const auditLogger = new AuditLogger({
  enableConsoleLogging: true,
  enableDatabaseLogging: false, // Enable when Supabase is configured
  logLevel: 'info',
})

// Export default for named import compatibility
export default auditLogger
