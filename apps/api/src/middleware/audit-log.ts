import { logger } from '@/utils/healthcare-errors'
import { Context, Next } from 'hono'

/**
 * Audit log entry interface
 */
interface AuditLogEntry {
  timestamp: Date
  _userId?: string
  clinicId?: string
  action: string
  resource: string
  resourceId?: string
  method: string
  path: string
  ip: string
  userAgent: string
  sessionId?: string
  requestId?: string
  statusCode?: number
  duration?: number
  metadata?: Record<string, any>
}

/**
 * Audit log configuration
 */
interface AuditLogConfig {
  includeRequestBody?: boolean
  includeResponseBody?: boolean
  sensitiveFields?: string[]
  logLevel?: 'debug' | 'info' | 'warn' | 'error'
}

/**
 * Default sensitive fields to redact from audit logs
 */
const DEFAULT_SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'key',
  'authorization',
  'cpf',
  'rg',
  'ssn',
  'credit_card',
  'medical_record',
]

/**
 * Sanitizes sensitive data from an object
 */
function sanitizeData(
  data: any,
  sensitiveFields: string[] = DEFAULT_SENSITIVE_FIELDS,
): any {
  if (!data || typeof data !== 'object') {
    return data
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item, sensitiveFields))
  }

  const sanitized: any = {}

  for (const [key, value] of Object.entries(data)) {
    const isSensitive = sensitiveFields.some(field =>
      key.toLowerCase().includes(field.toLowerCase())
    )

    if (isSensitive) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value, sensitiveFields)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

/**
 * Extracts action and resource from the request
 */
function extractActionAndResource(
  method: string,
  path: string,
): { action: string; resource: string } {
  // Extract resource from path
  const pathParts = path
    .split('/')
    .filter(part => part && !part.match(/^v\d+$/))
  const resource = pathParts[0] || 'unknown'

  // Map HTTP methods to actions
  const actionMap: Record<string, string> = {
    GET: 'read',
    POST: 'create',
    PUT: 'update',
    PATCH: 'update',
    DELETE: 'delete',
  }

  const action = actionMap[method.toUpperCase()] || method.toLowerCase()

  return { action, resource }
}

/**
 * Creates an audit log middleware
 */
export function auditLogMiddleware(config: AuditLogConfig = {}) {
  const {
    includeRequestBody = false,
    sensitiveFields = DEFAULT_SENSITIVE_FIELDS,
    logLevel = 'info',
  } = config

  return async (c: Context, next: Next) => {
    const startTime = Date.now()

    // Extract request information
    const method = c.req.method
    const path = c.req.path
    const ip = c.req.header('x-forwarded-for') ||
      c.req.header('x-real-ip') ||
      c.req.header('cf-connecting-ip') ||
      'unknown'
    const userAgent = c.req.header('user-agent') || 'unknown'
    const requestId = c.get('requestId') || 'unknown'

    // Extract user information if available
    const user = c.get('user')
    const userId = user?.id || c.get('userId')
    const clinicId = user?.clinicId || c.get('clinicId')
    const sessionId = c.get('sessionId') || c.req.header('x-session-id')

    // Extract action and resource
    const { action, resource } = extractActionAndResource(method, path)

    // Extract resource ID from path or query params
    const resourceId = c.req.param('id') ||
      c.req.param('patientId') ||
      c.req.param('appointmentId') ||
      c.req.query('id')

    // Prepare base audit entry
    const baseAuditEntry: Partial<AuditLogEntry> = {
      timestamp: new Date(),
      _userId: userId,
      clinicId,
      action,
      resource,
      resourceId,
      method,
      path,
      ip,
      userAgent,
      sessionId,
      requestId,
    }

    // Get request body if configured
    let requestBody: any
    if (includeRequestBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        // Clone the request to read the body without consuming it
        // Note: HonoRequest may not have clone method, so we try to access body directly
        try {
          requestBody = await c.req.json()
        } catch (bodyError) {
          // If we can't read the body, continue without it
          console.warn(
            'Could not read request body for audit logging:',
            bodyError,
          )
        }
        requestBody = sanitizeData(requestBody, sensitiveFields)
      } catch {
        // Ignore errors when reading request body
      }
    }

    let auditEntry: AuditLogEntry
    let error: any

    try {
      await next()

      const duration = Date.now() - startTime
      const statusCode = c.res.status

      // Create successful audit entry
      auditEntry = {
        ...baseAuditEntry,
        statusCode,
        duration,
        metadata: {
          ...(requestBody && { requestBody }),
          success: true,
        },
      } as AuditLogEntry
    } catch (err) {
      error = err
      const duration = Date.now() - startTime

      // Create error audit entry
      auditEntry = {
        ...baseAuditEntry,
        statusCode: 500, // Default error status
        duration,
        metadata: {
          ...(requestBody && { requestBody }),
          success: false,
          error: {
            message: err instanceof Error ? err.message : String(err),
            name: err instanceof Error ? err.name : 'Unknown',
          },
        },
      } as AuditLogEntry
    }

    // Log the audit entry
    const logMessage = `${action.toUpperCase()} ${resource}`
    const logContext = {
      audit: auditEntry,
      type: 'audit',
    }

    if (error) {
      logger.error(logMessage, logContext)
    } else {
      switch (logLevel) {
        case 'debug':
          logger.debug(logMessage, logContext)
          break
        case 'warn':
          logger.warn(logMessage, logContext)
          break
        case 'error':
          logger.error(logMessage, logContext)
          break
        case 'info':
        default:
          logger.info(logMessage, logContext)
          break
      }
    }

    // Store audit entry in context for potential use by other middleware
    c.set('auditEntry', auditEntry)

    // Re-throw error if one occurred
    if (error) {
      throw error
    }
  }
}

/**
 * Healthcare-specific audit middleware with LGPD compliance
 */
export function healthcareAuditMiddleware() {
  return auditLogMiddleware({
    includeRequestBody: true,
    includeResponseBody: false, // Don't include response body to avoid logging sensitive data
    sensitiveFields: [
      ...DEFAULT_SENSITIVE_FIELDS,
      'cpf',
      'rg',
      'cns', // Cartão Nacional de Saúde
      'medical_record',
      'diagnosis',
      'medication',
      'treatment',
      'patient_data',
      'health_data',
    ],
    logLevel: 'info',
  })
}

/**
 * Financial audit middleware for billing and payment operations
 */
export function financialAuditMiddleware() {
  return auditLogMiddleware({
    includeRequestBody: true,
    includeResponseBody: false,
    sensitiveFields: [
      ...DEFAULT_SENSITIVE_FIELDS,
      'credit_card',
      'debit_card',
      'bank_account',
      'pix_key',
      'payment_method',
      'card_number',
      'cvv',
      'expiry',
    ],
    logLevel: 'info',
  })
}

/**
 * Authentication audit middleware for login/logout events
 */
export function authAuditMiddleware() {
  return auditLogMiddleware({
    includeRequestBody: false, // Don't log passwords
    includeResponseBody: false,
    sensitiveFields: [
      ...DEFAULT_SENSITIVE_FIELDS,
      'password',
      'old_password',
      'new_password',
      'confirm_password',
    ],
    logLevel: 'info',
  })
}

/**
 * Simple audit log function (alias for auditLogMiddleware)
 * @deprecated Use specific audit middleware instead
 */
export const _auditLog = auditLogMiddleware

// Export alias for backward compatibility
export const auditLog = auditLogMiddleware
