// T028: Standard error mapper to neutral responses
// Purpose: Map internal errors to neutral user-facing responses for security and LGPD compliance
// File: packages/core-services/src/errors/map.ts

export interface ErrorContext {
  _userId?: string
  clinicId?: string
  sessionId?: string
  action?: string
  timestamp?: string
}

export interface MappedError {
  code: string
  message: string
  userMessage: string
  statusCode: number
  logLevel: 'error' | 'warn' | 'info'
  shouldLog: boolean
  metadata?: Record<string, any>
}

export class ErrorMapper {
  private static readonly DEFAULT_USER_MESSAGE =
    'Um erro inesperado ocorreu. Nossa equipe foi notificada.'

  /**
   * Maps internal errors to user-safe responses
   */
  static mapError(
    error: Error | unknown,
    _context?: ErrorContext,
  ): MappedError {
    const timestamp = new Date().toISOString()

    // Handle known error types
    if (error instanceof Error) {
      return this.mapKnownError(error, _context, timestamp)
    }

    // Handle unknown errors
    return this.mapUnknownError(error, _context, timestamp)
  }

  private static mapKnownError(
    error: Error,
    _context?: ErrorContext,
    timestamp?: string,
  ): MappedError {
    const errorName = error.name.toLowerCase()
    const errorMessage = error.message.toLowerCase()

    // Rate limiting errors
    if (errorName.includes('rate') || errorMessage.includes('rate limit')) {
      return {
        code: 'RATE_LIMIT_EXCEEDED',
        message: error.message,
        userMessage: 'Você excedeu o limite de consultas. Tente novamente em alguns minutos.',
        statusCode: 429,
        logLevel: 'warn',
        shouldLog: true,
        metadata: {
          _userId: _context?._userId,
          timestamp,
          originalError: 'Rate limit exceeded',
        },
      }
    }

    // Validation errors
    if (errorName.includes('validation') || errorMessage.includes('invalid')) {
      return {
        code: 'VALIDATION_ERROR',
        message: this.sanitizeValidationMessage(error.message),
        userMessage: 'Os dados fornecidos são inválidos. Verifique e tente novamente.',
        statusCode: 400,
        logLevel: 'info',
        shouldLog: false,
        metadata: {
          _userId: _context?._userId,
          timestamp,
        },
      }
    }

    // Permission/Authorization errors
    if (
      errorName.includes('permission') ||
      errorName.includes('auth') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('forbidden')
    ) {
      return {
        code: 'PERMISSION_DENIED',
        message: 'Access denied',
        userMessage: 'Você não tem permissão para realizar esta ação.',
        statusCode: 403,
        logLevel: 'warn',
        shouldLog: true,
        metadata: {
          _userId: _context?._userId,
          clinicId: _context?.clinicId,
          action: _context?.action,
          timestamp,
        },
      }
    }

    // LGPD/Consent errors
    if (errorMessage.includes('consent') || errorMessage.includes('lgpd')) {
      return {
        code: 'CONSENT_REQUIRED',
        message: 'Consent required',
        userMessage:
          'É necessário seu consentimento para continuar. Verifique as configurações de privacidade.',
        statusCode: 400,
        logLevel: 'info',
        shouldLog: true,
        metadata: {
          _userId: _context?._userId,
          clinicId: _context?.clinicId,
          timestamp,
          complianceIssue: true,
        },
      }
    }

    // AI/LLM service errors
    if (
      errorMessage.includes('openai') ||
      errorMessage.includes('ai service') ||
      errorMessage.includes('model') ||
      errorMessage.includes('llm')
    ) {
      return {
        code: 'AI_SERVICE_ERROR',
        message: 'AI service temporarily unavailable',
        userMessage:
          'O assistente IA está temporariamente indisponível. Tente novamente em alguns minutos.',
        statusCode: 503,
        logLevel: 'error',
        shouldLog: true,
        metadata: {
          _userId: _context?._userId,
          sessionId: _context?.sessionId,
          timestamp,
          serviceType: 'ai',
        },
      }
    }

    // Database/Network errors
    if (
      errorMessage.includes('database') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('network') ||
      errorMessage.includes('timeout')
    ) {
      return {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Service temporarily unavailable',
        userMessage: 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.',
        statusCode: 503,
        logLevel: 'error',
        shouldLog: true,
        metadata: {
          _userId: _context?._userId,
          clinicId: _context?.clinicId,
          timestamp,
          serviceType: 'database',
        },
      }
    }

    // PII/Data protection errors
    if (
      errorMessage.includes('pii') ||
      errorMessage.includes('redaction') ||
      errorMessage.includes('sensitive')
    ) {
      return {
        code: 'DATA_PROTECTION_ERROR',
        message: 'Data protection violation detected',
        userMessage:
          'Dados sensíveis detectados. Sua mensagem foi processada de acordo com as normas de proteção de dados.',
        statusCode: 400,
        logLevel: 'warn',
        shouldLog: true,
        metadata: {
          _userId: _context?._userId,
          sessionId: _context?.sessionId,
          timestamp,
          complianceIssue: true,
          dataProtection: true,
        },
      }
    }

    // Default for unrecognized errors
    return this.mapUnknownError(error, _context, timestamp)
  }

  private static mapUnknownError(
    error: any,
    _context?: ErrorContext,
    timestamp?: string,
  ): MappedError {
    return {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      userMessage: this.DEFAULT_USER_MESSAGE,
      statusCode: 500,
      logLevel: 'error',
      shouldLog: true,
      metadata: {
        _userId: _context?._userId,
        clinicId: _context?.clinicId,
        sessionId: _context?.sessionId,
        timestamp,
        errorType: typeof error,
        hasStack: error instanceof Error && !!error.stack,
      },
    }
  }

  /**
   * Sanitizes validation messages to remove sensitive information
   */
  private static sanitizeValidationMessage(message: string): string {
    // Remove potential PII patterns from validation messages
    return message
      .replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, '[CPF]') // CPF numbers
      .replace(/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, '[CNPJ]') // CNPJ numbers
      .replace(
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        '[EMAIL]',
      ) // Email addresses
      .replace(/\b\(\d{2}\)\s*\d{4,5}-?\d{4}\b/g, '[PHONE]') // Phone numbers
      .replace(/\b\d{5}-?\d{3}\b/g, '[CEP]') // CEP codes
  }

  /**
   * Creates a safe error response for API endpoints
   */
  static createAPIResponse(error: Error | unknown, _context?: ErrorContext) {
    const mapped = this.mapError(error, _context)

    return {
      success: false,
      error: {
        code: mapped.code,
        message: mapped.userMessage,
        timestamp: new Date().toISOString(),
      },
      // Include request ID if available for support debugging
      ...(_context?.sessionId && { requestId: _context.sessionId }),
    }
  }

  /**
   * Creates structured log entry for internal error tracking
   */
  static createLogEntry(error: Error | unknown, _context?: ErrorContext) {
    const mapped = this.mapError(error, _context)

    if (!mapped.shouldLog) {
      return null
    }

    return {
      level: mapped.logLevel,
      message: mapped.message,
      code: mapped.code,
      statusCode: mapped.statusCode,
      _context: {
        _userId: _context?._userId,
        clinicId: _context?.clinicId,
        sessionId: _context?.sessionId,
        action: _context?.action,
        timestamp: mapped.metadata?.timestamp,
      },
      metadata: mapped.metadata,
      // Include stack trace only for server errors
      ...(mapped.statusCode >= 500 &&
        error instanceof Error &&
        { stack: error.stack }),
    }
  }
}

// Predefined error creators for common scenarios
export const createRateLimitError = (userId?: string) => {
  const error = new Error('Rate limit exceeded for user')
  error.name = 'RateLimitError'
  return ErrorMapper.mapError(error, {
    _userId: userId,
    action: 'rate_limit_check',
  })
}

export const createConsentError = (userId?: string, clinicId?: string) => {
  const error = new Error('LGPD consent required for data processing')
  error.name = 'ConsentError'
  return ErrorMapper.mapError(error, {
    _userId: userId,
    clinicId,
    action: 'consent_validation',
  })
}

export const createAIServiceError = (sessionId?: string) => {
  const error = new Error('AI service temporarily unavailable')
  error.name = 'AIServiceError'
  return ErrorMapper.mapError(error, { sessionId, action: 'ai_query' })
}

export const createDataProtectionError = (
  userId?: string,
  sessionId?: string,
) => {
  const error = new Error('PII detected in user input')
  error.name = 'DataProtectionError'
  return ErrorMapper.mapError(error, {
    _userId: userId,
    sessionId,
    action: 'pii_detection',
  })
}

// Export for middleware usage
export default ErrorMapper
