/**
 * Healthcare-compliant error tracking middleware for Hono API
 * Integrates with Sentry and includes automatic healthcare data redaction
 */

import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { captureHealthcareApiError } from '../lib/sentry';

// Sensitive data patterns for redaction
const SENSITIVE_DATA_PATTERNS = [
  // Brazilian documents
  /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g,           // CPF
  /\b\d{2}\.\d{3}\.\d{3}-\d{1}\b/g,           // RG
  /\b\d{3}\.\d{2}\.\d{3}-\d{2}\b/g,           // CNPJ
  
  // Healthcare identifiers
  /\b\d{15}\b/g,                               // SUS card
  /\bCRM[A-Z]{2}\s?\d{4,6}\b/gi,              // CRM (medical license)
  /\bCRO[A-Z]{2}\s?\d{4,6}\b/gi,              // CRO (dental license)
  
  // Contact information
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
  /\b\(?(\d{2})\)?\s?9?\d{4}-?\d{4}\b/g,      // Brazilian phone
  
  // Medical codes
  /\b[A-Z]\d{2}\.?\d{1,2}\b/g,                // CID-10
  /\b\d{8}\.\d{2}\.\d{2}\b/g,                 // TUSS procedures
];

// Field names that contain sensitive data
const SENSITIVE_FIELD_NAMES = [
  'cpf', 'rg', 'cnpj', 'email', 'phone', 'telefone', 'celular',
  'endereco', 'address', 'cep', 'birthdate', 'nascimento',
  'password', 'senha', 'token', 'secret', 'chave',
  'medical_history', 'historico_medico', 'diagnosis', 'diagnostico',
  'prescription', 'receita', 'treatment', 'tratamento',
  'patient_name', 'nome_paciente', 'patient_data', 'dados_paciente',
  'health_record', 'prontuario', 'sus_card', 'cartao_sus',
  'crm', 'cro', 'professional_id', 'id_profissional',
];

// Error classification for healthcare operations
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  BUSINESS_LOGIC = 'business_logic',
  DATABASE = 'database',
  EXTERNAL_SERVICE = 'external_service',
  CONFIGURATION = 'configuration',
  HEALTHCARE_COMPLIANCE = 'healthcare_compliance',
  PATIENT_DATA = 'patient_data',
  SYSTEM = 'system',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Healthcare-specific error types
export class HealthcareError extends Error {
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly statusCode: number;
  public readonly isPatientDataInvolved: boolean;
  public readonly complianceImpact: boolean;
  public readonly metadata: Record<string, any>;

  constructor(
    message: string,
    category: ErrorCategory,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    statusCode: number = 500,
    options: {
      isPatientDataInvolved?: boolean;
      complianceImpact?: boolean;
      metadata?: Record<string, any>;
    } = {}
  ) {
    super(message);
    this.name = 'HealthcareError';
    this.category = category;
    this.severity = severity;
    this.statusCode = statusCode;
    this.isPatientDataInvolved = options.isPatientDataInvolved || false;
    this.complianceImpact = options.complianceImpact || false;
    this.metadata = options.metadata || {};
  }
}

// Predefined healthcare errors
export class PatientDataAccessError extends HealthcareError {
  constructor(message: string, metadata?: Record<string, any>) {
    super(
      message,
      ErrorCategory.PATIENT_DATA,
      ErrorSeverity.HIGH,
      403,
      {
        isPatientDataInvolved: true,
        complianceImpact: true,
        metadata,
      }
    );
    this.name = 'PatientDataAccessError';
  }
}

export class LGPDComplianceError extends HealthcareError {
  constructor(message: string, metadata?: Record<string, any>) {
    super(
      message,
      ErrorCategory.HEALTHCARE_COMPLIANCE,
      ErrorSeverity.CRITICAL,
      400,
      {
        complianceImpact: true,
        metadata,
      }
    );
    this.name = 'LGPDComplianceError';
  }
}

export class MedicalDataValidationError extends HealthcareError {
  constructor(message: string, metadata?: Record<string, any>) {
    super(
      message,
      ErrorCategory.VALIDATION,
      ErrorSeverity.HIGH,
      400,
      {
        isPatientDataInvolved: true,
        metadata,
      }
    );
    this.name = 'MedicalDataValidationError';
  }
}

// Sanitize error data to remove sensitive information
function sanitizeErrorData(data: any): any {
  if (!data) return data;
  
  if (typeof data === 'string') {
    let sanitized = data;
    // Apply regex patterns to redact sensitive data
    SENSITIVE_DATA_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED_HEALTHCARE_DATA]');
    });
    return sanitized;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeErrorData(item));
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      const isSensitiveField = SENSITIVE_FIELD_NAMES.some(field => lowerKey.includes(field));
      
      if (isSensitiveField) {
        sanitized[key] = '[REDACTED_HEALTHCARE_DATA]';
      } else {
        sanitized[key] = sanitizeErrorData(value);
      }
    }
    
    return sanitized;
  }
  
  return data;
}

// Extract error context from request
function extractErrorContext(c: Context): Record<string, any> {
  const url = c.req.url;
  const method = c.req.method;
  const headers = c.req.header();
  
  return {
    method,
    url: sanitizeUrl(url),
    userAgent: headers['user-agent'],
    clinicId: headers['x-clinic-id'],
    userId: headers['x-user-id'],
    requestId: headers['x-request-id'] || generateRequestId(),
    timestamp: new Date().toISOString(),
    isPatientDataRoute: url.includes('/patient') || 
                        url.includes('/medical-record') ||
                        url.includes('/appointment'),
  };
}

// Sanitize URL for error reporting
function sanitizeUrl(url: string): string {
  return url
    .replace(/\/patient\/[a-zA-Z0-9-]+/g, '/patient/[ID]')
    .replace(/\/clinic\/[a-zA-Z0-9-]+/g, '/clinic/[ID]')
    .replace(/\/appointment\/[a-zA-Z0-9-]+/g, '/appointment/[ID]')
    .replace(/\/medical-record\/[a-zA-Z0-9-]+/g, '/medical-record/[ID]')
    .replace(/[?&](cpf|rg|email|phone)=[^&]*/gi, '&$1=[REDACTED]');
}

// Generate unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Map error to appropriate HTTP status code
function getErrorStatusCode(error: Error): number {
  if (error instanceof HealthcareError) {
    return error.statusCode;
  }
  
  if (error instanceof HTTPException) {
    return error.status;
  }
  
  // Map common error types to status codes
  if (error.name === 'ValidationError') return 400;
  if (error.name === 'UnauthorizedError') return 401;
  if (error.name === 'ForbiddenError') return 403;
  if (error.name === 'NotFoundError') return 404;
  if (error.name === 'ConflictError') return 409;
  if (error.name === 'RateLimitError') return 429;
  
  // Database errors
  if (error.message.includes('duplicate key')) return 409;
  if (error.message.includes('foreign key')) return 400;
  if (error.message.includes('not found')) return 404;
  
  // Default to 500 for unknown errors
  return 500;
}

// Create standardized error response
function createErrorResponse(error: Error, context: Record<string, any>) {
  const statusCode = getErrorStatusCode(error);
  const isHealthcareError = error instanceof HealthcareError;
  
  // Base error response
  const errorResponse: any = {
    success: false,
    error: {
      type: error.name || 'UnknownError',
      message: error.message,
      code: statusCode,
      timestamp: new Date().toISOString(),
      requestId: context.requestId,
    },
  };
  
  // Add healthcare-specific error details
  if (isHealthcareError) {
    const healthcareError = error as HealthcareError;
    errorResponse.error.category = healthcareError.category;
    errorResponse.error.severity = healthcareError.severity;
    errorResponse.error.complianceImpact = healthcareError.complianceImpact;
    
    // Add sanitized metadata if present
    if (Object.keys(healthcareError.metadata).length > 0) {
      errorResponse.error.metadata = sanitizeErrorData(healthcareError.metadata);
    }
  }
  
  // Add development information in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.error.stack = error.stack;
    errorResponse.error.context = sanitizeErrorData(context);
  }
  
  return errorResponse;
}

// Log error for compliance audit trail
function logComplianceError(error: Error, context: Record<string, any>) {
  const isHealthcareError = error instanceof HealthcareError;
  const isPatientDataInvolved = context.isPatientDataRoute || 
                                (isHealthcareError && (error as HealthcareError).isPatientDataInvolved);
  
  // Only log compliance-relevant errors
  if (isPatientDataInvolved || (isHealthcareError && (error as HealthcareError).complianceImpact)) {
    const auditLog = {
      type: 'healthcare_error',
      timestamp: new Date().toISOString(),
      errorType: error.name,
      errorCategory: isHealthcareError ? (error as HealthcareError).category : 'unknown',
      severity: isHealthcareError ? (error as HealthcareError).severity : ErrorSeverity.MEDIUM,
      statusCode: getErrorStatusCode(error),
      method: context.method,
      url: context.url,
      userId: context.userId || 'anonymous',
      clinicId: context.clinicId || 'unknown',
      requestId: context.requestId,
      patientDataInvolved: isPatientDataInvolved,
      complianceImpact: isHealthcareError ? (error as HealthcareError).complianceImpact : false,
      message: sanitizeErrorData(error.message),
    };
    
    console.log('[HEALTHCARE_ERROR_AUDIT]', JSON.stringify(auditLog));
  }
}

// Main error tracking middleware
export function errorTrackingMiddleware() {
  return async (c: Context, next: Next) => {
    try {
      await next();
    } catch (error) {
      const err = error as Error;
      const context = extractErrorContext(c);
      const statusCode = getErrorStatusCode(err);
      
      // Log compliance audit if necessary
      logComplianceError(err, context);
      
      // Report to Sentry with healthcare data redaction
      try {
        await captureHealthcareApiError(err, {
          route: c.req.path,
          method: context.method,
          status: statusCode,
          requestId: context.requestId,
          hasPatientData: context.isPatientDataRoute,
          durationMs: undefined,
          feature: undefined,
          clinicId: context.clinicId,
        });
      } catch (sentryError) {
        console.error('Failed to report error to Sentry:', sentryError);
      }
      
      // Create and return error response
      const errorResponse = createErrorResponse(err, context);
      
      return c.json(errorResponse, statusCode as any);
    }
  };
}

// Global error handler for uncaught errors
export function globalErrorHandler() {
  return (error: Error, c: Context) => {
    const context = extractErrorContext(c);
    
    // Log the uncaught error
    console.error('Uncaught error in API:', error);
    
    // Log compliance audit
    logComplianceError(error, context);
    
    // Report to Sentry
    captureHealthcareApiError(error, {
      route: c.req.path,
      method: context.method,
      status: 500,
      requestId: context.requestId,
      hasPatientData: context.isPatientDataRoute,
      durationMs: undefined,
      feature: undefined,
      clinicId: context.clinicId,
    }).catch(sentryError => {
      console.error('Failed to report uncaught error to Sentry:', sentryError);
    });
    
    // Return generic error response
    const errorResponse = {
      success: false,
      error: {
        type: 'InternalServerError',
        message: 'An unexpected error occurred',
        code: 500,
        timestamp: new Date().toISOString(),
        requestId: context.requestId,
      },
    };
    
    return c.json(errorResponse, 500);
  };
}

// Utility function to create healthcare-specific errors
export function createHealthcareError(
  message: string,
  category: ErrorCategory,
  options?: {
    severity?: ErrorSeverity;
    statusCode?: number;
    isPatientDataInvolved?: boolean;
    complianceImpact?: boolean;
    metadata?: Record<string, any>;
  }
) {
  return new HealthcareError(message, category, options?.severity, options?.statusCode, options);
}

// Export error classes and utilities
export {
  sanitizeErrorData,
  extractErrorContext,
  sanitizeUrl,
  getErrorStatusCode,
  createErrorResponse,
  logComplianceError,
};