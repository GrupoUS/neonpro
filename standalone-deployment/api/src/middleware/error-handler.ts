/**
 * ⚠️ Error Handler Middleware - NeonPro API
 * ==========================================
 *
 * Tratamento centralizado de erros com logging estruturado,
 * sanitização de dados sensíveis e resposta padronizada.
 */

import type { Context, ErrorHandler } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import { logger } from "../lib/logger";

// Error types for better categorization
export enum ErrorType {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
  NOT_FOUND_ERROR = "NOT_FOUND_ERROR",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR",
  BUSINESS_LOGIC_ERROR = "BUSINESS_LOGIC_ERROR",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  LGPD_COMPLIANCE_ERROR = "LGPD_COMPLIANCE_ERROR",
  ANVISA_COMPLIANCE_ERROR = "ANVISA_COMPLIANCE_ERROR",
}

// Custom error class for structured errors
export class NeonProError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: StatusCode;
  public readonly userMessage: string;
  public readonly metadata?: Record<string, unknown>;
  public readonly stack?: string;

  constructor(
    type: ErrorType,
    message: string,
    statusCode: StatusCode = 500,
    userMessage?: string,
    metadata?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "NeonProError";
    this.type = type;
    this.statusCode = statusCode;
    this.userMessage = userMessage || this.getDefaultUserMessage(type);
    this.metadata = metadata;

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NeonProError);
    }
  }

  private getDefaultUserMessage(type: ErrorType): string {
    const defaultMessages: Record<ErrorType, string> = {
      [ErrorType.VALIDATION_ERROR]: "Dados fornecidos são inválidos",
      [ErrorType.AUTHENTICATION_ERROR]: "Credenciais inválidas",
      [ErrorType.AUTHORIZATION_ERROR]: "Acesso negado",
      [ErrorType.NOT_FOUND_ERROR]: "Recurso não encontrado",
      [ErrorType.RATE_LIMIT_ERROR]: "Muitas tentativas. Tente novamente mais tarde",
      [ErrorType.DATABASE_ERROR]: "Erro interno do banco de dados",
      [ErrorType.EXTERNAL_API_ERROR]: "Erro de serviço externo",
      [ErrorType.BUSINESS_LOGIC_ERROR]: "Operação não permitida",
      [ErrorType.INTERNAL_SERVER_ERROR]: "Erro interno do servidor",
      [ErrorType.LGPD_COMPLIANCE_ERROR]: "Erro de conformidade LGPD",
      [ErrorType.ANVISA_COMPLIANCE_ERROR]: "Erro de conformidade ANVISA",
    };

    return defaultMessages[type] || "Erro interno do servidor";
  }

  toJSON() {
    return {
      type: this.type,
      message: this.message,
      userMessage: this.userMessage,
      statusCode: this.statusCode,
      metadata: this.metadata,
      timestamp: new Date().toISOString(),
    };
  }
}

// Error response structure
interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  requestId?: string;
  auditId?: string;
}

// Type guards for safer error property access
interface ErrorLike {
  status?: number;
  statusCode?: number;
  message?: string;
  code?: string;
  type?: string;
  stack?: string;
  metadata?: unknown;
  name?: string;
  errors?: unknown[]; // changed from any[] to unknown[]
  issues?: unknown[];
  meta?: unknown;
  [key: string]: unknown;
}

function isErrorLike(err: unknown): err is ErrorLike {
  return typeof err === "object" && err !== null;
}

// New helpers: safe, typed property accessors (no `any`)
function getUnknownArray(obj: unknown, keys: string[]): unknown[] {
  if (!isErrorLike(obj)) return [];
  for (const k of keys) {
    const val = obj[k];
    if (Array.isArray(val)) return val as unknown[];
  }
  return [];
}

function getNumericProp(obj: unknown, keys: string[], fallback?: number): number | undefined {
  if (!isErrorLike(obj)) return fallback;
  for (const k of keys) {
    const val = obj[k];
    if (typeof val === "number") return val;
    if (typeof val === "string" && val.trim() !== "" && !Number.isNaN(Number(val))) {
      const n = Number(val);
      if (!Number.isNaN(n)) return n;
    }
  }
  return fallback;
}

function getProp<T>(obj: unknown, key: string): T | undefined {
  if (!isErrorLike(obj)) return undefined;
  return obj[key] as T | undefined;
}

/**
 * Sanitize error data to prevent sensitive information leakage
 */
const sanitizeError = (error: unknown): unknown => {
  // List of sensitive fields that should never be exposed
  const sensitiveFields = [
    "password",
    "token",
    "secret",
    "key",
    "authorization",
    "cookie",
    "session",
    "cpf",
    "rg",
    "email",
    "phone",
  ];

  const sanitize = (obj: unknown): unknown => {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();

      // Check if key contains sensitive information
      const isSensitive = sensitiveFields.some((field) => lowerKey.includes(field));

      if (isSensitive) {
        sanitized[key] = "[REDACTED]";
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  };

  return sanitize(error);
};

/**
 * Log error with structured format
 */
const logError = (error: unknown, context: Context): void => {
  const errorId = `err_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const requestId = context.req.header("X-Request-ID") || "unknown";
  const auditId = context.req.header("X-Audit-ID") || "unknown";

  // Safe access to error properties
  const errorObj = isErrorLike(error) ? error : undefined;
  const statusFromErr = getNumericProp(errorObj, ["statusCode", "status"]);
  const logData = {
    errorId,
    requestId,
    auditId,
    timestamp: new Date().toISOString(),

    // Error details
    type: (errorObj && (typeof errorObj.type === "string")
      ? errorObj.type
      : ErrorType.INTERNAL_SERVER_ERROR),
    message: (errorObj && errorObj.message) || "Unknown error",
    stack: errorObj && errorObj.stack,
    statusCode: statusFromErr ?? 500,

    // Request context
    method: context.req.method,
    path: context.req.path,
    query: context.req.query(),

    // User context (if available)
    userId: context.get("userId"),
    userRole: context.get("userRole"),

    // Client context
    userAgent: context.req.header("User-Agent"),
    clientIP: context.req.header("CF-Connecting-IP")
      || context.req.header("X-Forwarded-For")
      || context.req.header("X-Real-IP")
      || "unknown",

    // Metadata
    metadata: errorObj && errorObj.metadata,

    // Environment
    environment: process.env.NODE_ENV,
  };

  // Sanitize sensitive data before logging
  const sanitizedLog = sanitizeError(logData) as Record<string, unknown>;

  // Log using centralized logger
  logger.error("API Error occurred", error, {
    endpoint: sanitizedLog?.endpoint as string | undefined,
    method: sanitizedLog?.method as string | undefined,
    statusCode: sanitizedLog?.statusCode as number | undefined,
    errorType: sanitizedLog?.type as string | undefined,
    requestId: sanitizedLog?.requestId as string | undefined,
  });
};

/**
 * Format error response based on error type and environment
 */
const formatErrorResponse = (
  error: unknown,
  context: Context,
): { response: ErrorResponse; statusCode: StatusCode; } => {
  const requestId = context.req.header("X-Request-ID");
  const auditId = context.req.header("X-Audit-ID");
  const isProduction = process.env.NODE_ENV === "production";

  // Handle NeonProError instances
  if (error instanceof NeonProError) {
    return {
      response: {
        success: false,
        error: error.type,
        message: error.userMessage,
        details: isProduction ? undefined : error.metadata,
        timestamp: new Date().toISOString(),
        requestId,
        auditId,
      },
      statusCode: error.statusCode,
    };
  }

  // Handle validation errors (Zod)
  const errorObj2 = isErrorLike(error) ? error : undefined;
  if (errorObj2 && (errorObj2 as { name?: string; }).name === "ZodError") {
    // Normalize possible shapes: use safe extractor for `errors` or `issues`
    const rawIssues: unknown[] = getUnknownArray(errorObj2, ["errors", "issues"]);

    // Safely normalize Zod issues without `any`
    const validationDetails = rawIssues.map((issue) => {
      if (isZodIssue(issue)) {
        const field = Array.isArray(issue.path) ? issue.path.join(".") : undefined;
        const message = typeof issue.message === "string"
          ? issue.message
          : String(issue.message ?? "");
        const code = typeof issue.code === "string" ? issue.code : undefined;
        return { field, message, code };
      }
      // fallback for unexpected shapes
      return {
        field: undefined,
        message: typeof issue === "string" ? issue : String(issue ?? ""),
        code: undefined,
      };
    });

    return {
      response: {
        success: false,
        error: ErrorType.VALIDATION_ERROR,
        message: "Dados de entrada inválidos",
        details: isProduction
          ? undefined
          : {
            validationErrors: validationDetails,
          },
        timestamp: new Date().toISOString(),
        requestId,
        auditId,
      },
      statusCode: 400,
    };
  }

  // Handle HTTP errors
  if (hasStatus(error)) {
    const statusCode = getNumericProp(error, ["status", "statusCode"], 500) as StatusCode;
    let errorType: ErrorType;
    let message: string;

    switch (statusCode) {
      case 400: {
        errorType = ErrorType.VALIDATION_ERROR;
        message = "Requisição inválida";
        break;
      }
      case 401: {
        errorType = ErrorType.AUTHENTICATION_ERROR;
        message = "Autenticação obrigatória";
        break;
      }
      case 403: {
        errorType = ErrorType.AUTHORIZATION_ERROR;
        message = "Acesso negado";
        break;
      }
      case 404: {
        errorType = ErrorType.NOT_FOUND_ERROR;
        message = "Recurso não encontrado";
        break;
      }
      case 429: {
        errorType = ErrorType.RATE_LIMIT_ERROR;
        message = "Muitas requisições";
        break;
      }
      default: {
        errorType = ErrorType.INTERNAL_SERVER_ERROR;
        message = "Erro interno do servidor";
      }
    }

    return {
      response: {
        success: false,
        error: errorType,
        message: isErrorLike(error) && error.message ? error.message : message,
        details: isProduction ? undefined : (sanitizeError(error) as Record<string, unknown>),
        timestamp: new Date().toISOString(),
        requestId,
        auditId,
      },
      statusCode,
    };
  }

  // Handle database errors
  if (
    (isErrorLike(error) && (getProp<string>(error, "name") === "PrismaClientKnownRequestError"))
    || (isErrorLike(error)
      && (getProp<string>(error, "name") === "PrismaClientUnknownRequestError"))
  ) {
    return {
      response: {
        success: false,
        error: ErrorType.DATABASE_ERROR,
        message: "Erro de banco de dados",
        details: isProduction
          ? undefined
          : {
            code: getProp<string>(error, "code"),
            meta: sanitizeError(getProp<unknown>(error, "meta")),
          },
        timestamp: new Date().toISOString(),
        requestId,
        auditId,
      },
      statusCode: 500,
    };
  }

  // Default internal server error
  return {
    response: {
      success: false,
      error: ErrorType.INTERNAL_SERVER_ERROR,
      message: isProduction
        ? "Erro interno do servidor"
        : (isErrorLike(error) && error.message)
        ? error.message
        : "Something went wrong",
      details: isProduction ? undefined : (sanitizeError(error) as Record<string, unknown>),
      timestamp: new Date().toISOString(),
      requestId,
      auditId,
    },
    statusCode: 500,
  };
};

/**
 * Main error handler middleware
 */
export const errorHandler: ErrorHandler = (error, context) => {
  // Log the error
  logError(error, context);

  // Format response
  const { response, statusCode } = formatErrorResponse(error, context);

  // Set security headers
  context.res.headers.set("X-Content-Type-Options", "nosniff");
  context.res.headers.set("X-Frame-Options", "DENY");

  // Return structured error response
  return context.json(response, statusCode as number);
};

/**
 * Error factory functions for common errors
 */
export const createError = {
  validation: (message: string, details?: Record<string, unknown>) =>
    new NeonProError(
      ErrorType.VALIDATION_ERROR,
      message,
      400,
      message,
      details,
    ),

  authentication: (message = "Credenciais inválidas") =>
    new NeonProError(ErrorType.AUTHENTICATION_ERROR, message, 401),

  authorization: (message = "Acesso negado") =>
    new NeonProError(ErrorType.AUTHORIZATION_ERROR, message, 403),

  notFound: (resource = "Recurso") =>
    new NeonProError(
      ErrorType.NOT_FOUND_ERROR,
      `${resource} não encontrado`,
      404,
    ),

  rateLimit: (message = "Muitas tentativas") =>
    new NeonProError(ErrorType.RATE_LIMIT_ERROR, message, 429),

  database: (message: string, details?: Record<string, unknown>) =>
    new NeonProError(
      ErrorType.DATABASE_ERROR,
      message,
      500,
      "Erro de banco de dados",
      details,
    ),

  businessLogic: (message: string, userMessage?: string) =>
    new NeonProError(
      ErrorType.BUSINESS_LOGIC_ERROR,
      message,
      400,
      userMessage || message,
    ),

  lgpdCompliance: (message: string, details?: Record<string, unknown>) =>
    new NeonProError(
      ErrorType.LGPD_COMPLIANCE_ERROR,
      message,
      400,
      message,
      details,
    ),

  anvisaCompliance: (message: string, details?: Record<string, unknown>) =>
    new NeonProError(
      ErrorType.ANVISA_COMPLIANCE_ERROR,
      message,
      400,
      message,
      details,
    ),

  internal: (message = "Erro interno", details?: Record<string, unknown>) =>
    new NeonProError(
      ErrorType.INTERNAL_SERVER_ERROR,
      message,
      500,
      "Erro interno do servidor",
      details,
    ),
};

// Types and utilities are already exported when defined above

// Add: type guard for Zod-like issues
function isZodIssue(obj: unknown): obj is { path?: unknown[]; message?: unknown; code?: unknown; } {
  return (
    isErrorLike(obj)
    && (
      Object.prototype.hasOwnProperty.call(obj as Record<string, unknown>, "message")
      || Object.prototype.hasOwnProperty.call(obj as Record<string, unknown>, "path")
      || Object.prototype.hasOwnProperty.call(obj as Record<string, unknown>, "code")
    )
  );
}
function hasStatus(
  error: unknown,
): error is { status?: number | string; statusCode?: number | string; } {
  if (!isErrorLike(error)) return false;
  const s = (error as { status?: unknown; }).status;
  const sc = (error as { statusCode?: unknown; }).statusCode;
  return (
    (typeof s === "number" || (typeof s === "string" && s.trim() !== ""))
    || (typeof sc === "number" || (typeof sc === "string" && sc.trim() !== ""))
  );
}
