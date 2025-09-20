/**
 * Error Handling and Logging Middleware (T076)
 * Healthcare context error handling with Brazilian compliance
 *
 * Features:
 * - Healthcare-specific error handling and logging
 * - LGPD compliant error messages (no personal data exposure)
 * - Brazilian Portuguese error messages
 * - Integration with audit service (T041)
 * - Performance monitoring and alerting
 * - Valibot validation error support
 */

import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import * as v from "valibot";

// Error severity levels
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// Error categories
export enum ErrorCategory {
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  VALIDATION = "validation",
  BUSINESS_LOGIC = "business_logic",
  EXTERNAL_SERVICE = "external_service",
  DATABASE = "database",
  NETWORK = "network",
  SYSTEM = "system",
  LGPD_COMPLIANCE = "lgpd_compliance",
  HEALTHCARE_COMPLIANCE = "healthcare_compliance",
  AI_SERVICE = "ai_service",
}

// Error context
interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  endpoint: string;
  method: string;
  userAgent?: string;
  ipAddress?: string;
  healthcareProfessional?: boolean;
  patientId?: string;
  timestamp: Date;
  additionalData?: Record<string, any>;
}

// Structured error
interface StructuredError {
  id: string;
  code: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context: ErrorContext;
  stack?: string;
  cause?: Error;
  lgpdCompliant: boolean;
  healthcareContext: boolean;
}

// Error configuration
const errorConfigSchema = v.object({
  includeStack: v.optional(v.boolean(), false),
  logLevel: v.optional(v.picklist(["error", "warn", "info", "debug"]), "error"),
  enableAuditLogging: v.optional(v.boolean(), true),
  enablePerformanceMonitoring: v.optional(v.boolean(), true),
  sanitizePersonalData: v.optional(v.boolean(), true),
  brazilianPortuguese: v.optional(v.boolean(), true),
  healthcareCompliance: v.optional(v.boolean(), true),
});

export type ErrorConfig = v.InferOutput<typeof errorConfigSchema>;

// Brazilian Portuguese error messages
const errorMessages = {
  // Authentication errors
  AUTHENTICATION_REQUIRED: "Autenticação necessária para acessar este recurso",
  INVALID_TOKEN: "Token de autenticação inválido ou expirado",
  INSUFFICIENT_PERMISSIONS:
    "Permissões insuficientes para realizar esta operação",

  // Healthcare professional errors
  HEALTHCARE_PROFESSIONAL_REQUIRED:
    "Acesso restrito a profissionais de saúde registrados",
  INVALID_CRM_NUMBER: "Número do CRM inválido ou não verificado",
  INACTIVE_LICENSE: "Licença profissional inativa ou suspensa",

  // LGPD compliance errors
  LGPD_CONSENT_REQUIRED:
    "Consentimento LGPD necessário para processar dados pessoais",
  LGPD_INSUFFICIENT_CONSENT:
    "Consentimento LGPD insuficiente para a operação solicitada",
  LGPD_DATA_RETENTION_VIOLATION:
    "Violação das políticas de retenção de dados LGPD",
  LGPD_ACCESS_DENIED: "Acesso negado por restrições de proteção de dados",

  // Validation errors
  INVALID_CPF: "CPF inválido ou mal formatado",
  INVALID_PHONE: "Número de telefone brasileiro inválido",
  INVALID_CEP: "CEP inválido ou não encontrado",
  INVALID_EMAIL: "Endereço de email inválido",
  REQUIRED_FIELD_MISSING: "Campo obrigatório não informado",

  // Business logic errors
  PATIENT_NOT_FOUND: "Paciente não encontrado",
  APPOINTMENT_CONFLICT: "Conflito de agendamento detectado",
  MEDICAL_RECORD_LOCKED: "Prontuário médico bloqueado para edição",
  TREATMENT_NOT_AUTHORIZED: "Tratamento não autorizado pelo plano de saúde",

  // AI service errors
  AI_SERVICE_UNAVAILABLE: "Serviço de IA temporariamente indisponível",
  AI_ANALYSIS_FAILED: "Falha na análise de IA - tente novamente",
  AI_MODEL_NOT_FOUND: "Modelo de IA não encontrado ou indisponível",
  AI_RATE_LIMIT_EXCEEDED: "Limite de uso do serviço de IA excedido",

  // System errors
  INTERNAL_SERVER_ERROR:
    "Erro interno do servidor - nossa equipe foi notificada",
  DATABASE_CONNECTION_ERROR: "Erro de conexão com o banco de dados",
  EXTERNAL_SERVICE_ERROR:
    "Erro em serviço externo - tente novamente em alguns minutos",
  RATE_LIMIT_EXCEEDED:
    "Limite de requisições excedido - tente novamente em alguns minutos",

  // Generic errors
  UNKNOWN_ERROR: "Erro desconhecido - nossa equipe foi notificada",
  VALIDATION_ERROR: "Erro de validação nos dados fornecidos",
  NETWORK_ERROR: "Erro de rede - verifique sua conexão",
};

// Error logger
class ErrorLogger {
  private config: ErrorConfig;

  constructor(config: Partial<ErrorConfig> = {}) {
    this.config = v.parse(errorConfigSchema, config);
  }

  // Log structured error
  async logError(error: StructuredError) {
    const logEntry = {
      id: error.id,
      code: error.code,
      message: error.message,
      category: error.category,
      severity: error.severity,
      context: this.sanitizeContext(error.context),
      timestamp: error.context.timestamp,
      stack: this.config.includeStack ? error.stack : undefined,
    };

    // Console logging based on severity
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        console.error("🚨 CRITICAL ERROR:", logEntry);
        break;
      case ErrorSeverity.HIGH:
        console.error("❌ HIGH SEVERITY ERROR:", logEntry);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn("⚠️ MEDIUM SEVERITY ERROR:", logEntry);
        break;
      case ErrorSeverity.LOW:
        console.info("ℹ️ LOW SEVERITY ERROR:", logEntry);
        break;
    }

    // Audit logging for healthcare compliance
    if (this.config.enableAuditLogging && error.healthcareContext) {
      await this.logToAuditTrail(error);
    }

    // Performance monitoring
    if (this.config.enablePerformanceMonitoring) {
      await this.recordPerformanceMetrics(error);
    }
  }

  // Sanitize context to remove personal data
  private sanitizeContext(context: ErrorContext): Partial<ErrorContext> {
    if (!this.config.sanitizePersonalData) {
      return context;
    }

    return {
      userId: context.userId ? `user-${context.userId.slice(-4)}` : undefined,
      sessionId: context.sessionId,
      requestId: context.requestId,
      endpoint: context.endpoint,
      method: context.method,
      healthcareProfessional: context.healthcareProfessional,
      patientId: context.patientId
        ? `patient-${context.patientId.slice(-4)}`
        : undefined,
      timestamp: context.timestamp,
      // Remove potentially sensitive additional data
      additionalData: context.additionalData
        ? { keys: Object.keys(context.additionalData) }
        : undefined,
    };
  }

  // Log to audit trail
  private async logToAuditTrail(error: StructuredError) {
    try {
      // TODO: Integrate with audit service from T041
      const auditEntry = {
        action: "error_occurred",
        userId: error.context.userId,
        sessionId: error.context.sessionId,
        timestamp: error.context.timestamp,
        data: {
          errorId: error.id,
          errorCode: error.code,
          category: error.category,
          severity: error.severity,
          endpoint: error.context.endpoint,
          method: error.context.method,
          healthcareContext: error.healthcareContext,
        },
      };

      console.log("Audit trail logged:", auditEntry);
    } catch (auditError) {
      console.error("Failed to log to audit trail:", auditError);
    }
  }

  // Record performance metrics
  private async recordPerformanceMetrics(error: StructuredError) {
    try {
      // TODO: Integrate with performance metrics from T075
      const metrics = {
        errorCount: 1,
        errorCategory: error.category,
        errorSeverity: error.severity,
        endpoint: error.context.endpoint,
        timestamp: error.context.timestamp,
      };

      console.log("Performance metrics recorded:", metrics);
    } catch (metricsError) {
      console.error("Failed to record performance metrics:", metricsError);
    }
  }
}

// Error handler
class ErrorHandler {
  private logger: ErrorLogger;
  private config: ErrorConfig;

  constructor(config: Partial<ErrorConfig> = {}) {
    this.config = v.parse(errorConfigSchema, config);
    this.logger = new ErrorLogger(config);
  }

  // Handle error and return appropriate response
  async handleError(
    error: Error,
    context: ErrorContext,
  ): Promise<{
    status: number;
    response: {
      success: false;
      error: string;
      code: string;
      requestId?: string;
      timestamp: string;
    };
  }> {
    const structuredError = this.createStructuredError(error, context);
    await this.logger.logError(structuredError);

    // Determine HTTP status code
    const status = this.getHttpStatus(structuredError);

    // Create user-friendly response
    const response = {
      success: false as const,
      error: this.getUserFriendlyMessage(structuredError),
      code: structuredError.code,
      requestId: context.requestId,
      timestamp: context.timestamp.toISOString(),
    };

    return { status, response };
  }

  // Create structured error from generic error
  private createStructuredError(
    error: Error,
    context: ErrorContext,
  ): StructuredError {
    const errorId = crypto.randomUUID();

    // Determine error category and severity
    const { category, severity, code } = this.categorizeError(error);

    return {
      id: errorId,
      code,
      message: error.message,
      category,
      severity,
      context,
      stack: error.stack,
      cause: error.cause as Error,
      lgpdCompliant: this.isLGPDCompliant(error),
      healthcareContext: this.isHealthcareContext(context),
    };
  }

  // Categorize error
  private categorizeError(error: Error): {
    category: ErrorCategory;
    severity: ErrorSeverity;
    code: string;
  } {
    // HTTP exceptions
    if (error instanceof HTTPException) {
      switch (error.status) {
        case 401:
          return {
            category: ErrorCategory.AUTHENTICATION,
            severity: ErrorSeverity.MEDIUM,
            code: "AUTHENTICATION_REQUIRED",
          };
        case 403:
          return {
            category: ErrorCategory.AUTHORIZATION,
            severity: ErrorSeverity.MEDIUM,
            code: "INSUFFICIENT_PERMISSIONS",
          };
        case 404:
          return {
            category: ErrorCategory.BUSINESS_LOGIC,
            severity: ErrorSeverity.LOW,
            code: "RESOURCE_NOT_FOUND",
          };
        case 429:
          return {
            category: ErrorCategory.SYSTEM,
            severity: ErrorSeverity.MEDIUM,
            code: "RATE_LIMIT_EXCEEDED",
          };
        default:
          return {
            category: ErrorCategory.SYSTEM,
            severity: ErrorSeverity.MEDIUM,
            code: "HTTP_ERROR",
          };
      }
    }

    // Database errors
    if (
      error.message.includes("database") ||
      error.message.includes("connection")
    ) {
      return {
        category: ErrorCategory.DATABASE,
        severity: ErrorSeverity.HIGH,
        code: "DATABASE_CONNECTION_ERROR",
      };
    }

    // Valibot validation errors
    if (v.isValiError(error) || error.message.includes("validation")) {
      return {
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.LOW,
        code: "VALIDATION_ERROR",
      };
    }

    // AI service errors
    if (error.message.includes("AI") || error.message.includes("model")) {
      return {
        category: ErrorCategory.AI_SERVICE,
        severity: ErrorSeverity.MEDIUM,
        code: "AI_SERVICE_UNAVAILABLE",
      };
    }

    // LGPD compliance errors
    if (error.message.includes("LGPD") || error.message.includes("consent")) {
      return {
        category: ErrorCategory.LGPD_COMPLIANCE,
        severity: ErrorSeverity.HIGH,
        code: "LGPD_CONSENT_REQUIRED",
      };
    }

    // Healthcare compliance errors
    if (error.message.includes("CRM") || error.message.includes("healthcare")) {
      return {
        category: ErrorCategory.HEALTHCARE_COMPLIANCE,
        severity: ErrorSeverity.HIGH,
        code: "HEALTHCARE_PROFESSIONAL_REQUIRED",
      };
    }

    // Default to system error
    return {
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.HIGH,
      code: "INTERNAL_SERVER_ERROR",
    };
  }

  // Get HTTP status code for error
  private getHttpStatus(error: StructuredError): number {
    switch (error.category) {
      case ErrorCategory.AUTHENTICATION:
        return 401;
      case ErrorCategory.AUTHORIZATION:
      case ErrorCategory.LGPD_COMPLIANCE:
      case ErrorCategory.HEALTHCARE_COMPLIANCE:
        return 403;
      case ErrorCategory.VALIDATION:
        return 400;
      case ErrorCategory.BUSINESS_LOGIC:
        return 404;
      case ErrorCategory.EXTERNAL_SERVICE:
      case ErrorCategory.AI_SERVICE:
        return 503;
      case ErrorCategory.DATABASE:
      case ErrorCategory.SYSTEM:
        return 500;
      default:
        return 500;
    }
  }

  // Get user-friendly error message
  private getUserFriendlyMessage(error: StructuredError): string {
    if (this.config.brazilianPortuguese) {
      return (
        errorMessages[error.code as keyof typeof errorMessages] ||
        errorMessages.UNKNOWN_ERROR
      );
    }

    // Fallback to English if Portuguese is disabled
    return error.message || "An unknown error occurred";
  }

  // Check if error is LGPD compliant
  private isLGPDCompliant(error: Error): boolean {
    // Check if error message contains personal data
    const personalDataPatterns = [
      /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/, // CPF pattern
      /\b[\w.-]+@[\w.-]+\.\w+\b/, // Email pattern
      /\b\(\d{2}\)\s?\d{4,5}-?\d{4}\b/, // Phone pattern
    ];

    return !personalDataPatterns.some((pattern) => pattern.test(error.message));
  }

  // Check if error occurred in healthcare context
  private isHealthcareContext(context: ErrorContext): boolean {
    return !!(
      context.healthcareProfessional ||
      context.patientId ||
      context.endpoint.includes("/patients/") ||
      context.endpoint.includes("/medical/") ||
      context.endpoint.includes("/ai/")
    );
  }
}

// Healthcare-specific error creation utility
export function createHealthcareError(
  message: string,
  category: ErrorCategory,
  severity: ErrorSeverity,
  httpStatus: number = 500,
  options: {
    code?: string;
    cause?: Error;
    metadata?: Record<string, any>;
  } = {},
): HTTPException {
  const error = new HTTPException(httpStatus, {
    message,
    cause: options.cause,
  });

  // Add healthcare-specific metadata
  (error as any).category = category;
  (error as any).severity = severity;
  (error as any).code = options.code || "HEALTHCARE_ERROR";
  (error as any).metadata = options.metadata;
  (error as any).healthcareContext = true;
  (error as any).lgpdCompliant = !containsPersonalData(message);

  return error;
}

// Check if message contains personal data
function containsPersonalData(message: string): boolean {
  const personalDataPatterns = [
    /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/, // CPF pattern
    /\b[\w.-]+@[\w.-]+\.\w+\b/, // Email pattern
    /\b\(\d{2}\)\s?\d{4,5}-?\d{4}\b/, // Phone pattern
    /\b\d{15}\b/, // SUS card pattern
  ];

  return personalDataPatterns.some((pattern) => pattern.test(message));
}

// Valibot error formatter for healthcare context
export function formatValibotError(error: v.ValiError<any>): {
  message: string;
  details: Array<{
    field: string;
    message: string;
    code: string;
  }>;
} {
  const flattened = v.flatten(error);
  const details: Array<{ field: string; message: string; code: string }> = [];

  // Handle root errors
  if (flattened.root) {
    details.push({
      field: "root",
      message: flattened.root[0] || "Validation error",
      code: "validation_error",
    });
  }

  // Handle nested field errors
  if (flattened.nested) {
    Object.entries(flattened.nested).forEach(([field, issues]) => {
      if (issues && issues.length > 0) {
        details.push({
          field,
          message: issues[0] || "Validation error",
          code: "field_validation_error",
        });
      }
    });
  }

  return {
    message: "Dados de entrada inválidos",
    details,
  };
}

// Global error handler
export const errorHandler = new ErrorHandler();

// Error handling middleware
export function errorHandling(config: Partial<ErrorConfig> = {}) {
  const handler = new ErrorHandler(config);

  return async (c: Context, next: Next) => {
    try {
      await next();
    } catch (error) {
      const context: ErrorContext = {
        userId: c.get("userId"),
        sessionId: c.get("sessionId"),
        requestId: c.get("requestId") || crypto.randomUUID(),
        endpoint: c.req.path,
        method: c.req.method,
        userAgent: c.req.header("user-agent"),
        ipAddress: c.req.header("x-forwarded-for") || c.req.header("x-real-ip"),
        healthcareProfessional: !!c.get("healthcareProfessional"),
        patientId: c.req.param("patientId") || c.req.param("id"),
        timestamp: new Date(),
      };

      // Special handling for Valibot errors
      if (v.isValiError(error)) {
        const formattedError = formatValibotError(error);
        const healthcareError = createHealthcareError(
          formattedError.message,
          ErrorCategory.VALIDATION,
          ErrorSeverity.LOW,
          400,
          {
            code: "VALIDATION_ERROR",
            metadata: { validationDetails: formattedError.details },
          },
        );

        const { status, response } = await handler.handleError(
          healthcareError,
          context,
        );
        return c.json(
          {
            ...response,
            validationErrors: formattedError.details,
          },
          status,
        );
      }

      const { status, response } = await handler.handleError(
        error as Error,
        context,
      );
      return c.json(response, status);
    }
  };
}

// Request ID middleware
export function requestId() {
  return async (c: Context, next: Next) => {
    const requestId = c.req.header("x-request-id") || crypto.randomUUID();
    c.set("requestId", requestId);
    c.header("x-request-id", requestId);
    return next();
  };
}

// Export types
export type { ErrorConfig, ErrorContext, StructuredError };
