import { Context, Next } from 'hono';
import { logger } from '../lib/logger';

/**
 * List of sensitive field patterns to redact from error messages
 */
const SENSITIVE_PATTERNS = [
  // Authentication & Security
  /password/i,
  /passwd/i,
  /token/i,
  /secret/i,
  /key/i,
  /authorization/i,
  /auth/i,

  // Healthcare & Personal Data (LGPD)
  /cpf/i,
  /cnpj/i,
  /rg/i,
  /cns/i, // Cartão Nacional de Saúde
  /email/i,
  /phone/i,
  /telefone/i,
  /celular/i,
  /address/i,
  /endereco/i,
  /nascimento/i,
  /birth/i,

  // Medical Information
  /prontuario/i,
  /medical/i,
  /diagnosis/i,
  /diagnostico/i,
  /medication/i,
  /medicamento/i,
  /treatment/i,
  /tratamento/i,

  // Financial
  /credit/i,
  /debit/i,
  /card/i,
  /cartao/i,
  /bank/i,
  /banco/i,
  /pix/i,
];

/**
 * Redacts sensitive information from strings
 */
function sanitizeString(str: string): string {
  let sanitized = str;

  SENSITIVE_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(
      new RegExp(`(${pattern.source})\\s*[:=]\\s*[^\\s,}]+`, 'gi'),
      '$1: [REDACTED]',
    );
  });

  // Redact common patterns like emails, CPF, phone numbers
  sanitized = sanitized
    // Email addresses
    .replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      '[EMAIL_REDACTED]',
    )
    // CPF (XXX.XXX.XXX-XX)
    .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[CPF_REDACTED]')
    // Phone numbers (various Brazilian formats)
    .replace(
      /\b(?:\+55\s?)?\(?\d{2}\)?\s?\d{4,5}-?\d{4}\b/g,
      '[PHONE_REDACTED]',
    )
    // Credit card numbers (any sequence of 13-19 digits)
    .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{3,4}\b/g, '[CARD_REDACTED]');

  return sanitized;
}

/**
 * Recursively sanitizes an object, redacting sensitive information
 */
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};

    for (const [key, value] of Object.entries(obj)) {
      // Check if the key itself is sensitive
      const isSensitiveKey = SENSITIVE_PATTERNS.some(pattern => pattern.test(key));

      if (isSensitiveKey) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeObject(value);
      }
    }

    return sanitized;
  }

  return obj;
}

/**
 * Error sanitization middleware that removes sensitive data from error responses
 */
export function errorSanitizationMiddleware() {
  return async (c: Context, next: Next) => {
    try {
      await next();
    } catch {
      // Sanitize the error before logging or responding
      const sanitizedError = sanitizeObject({
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown',
      });

      // Log the sanitized error
      logger.error('Sanitized error caught by middleware', {
        sanitizedError,
        path: c.req.path,
        method: c.req.method,
        userAgent: c.req.header('user-agent'),
      });

      // Re-throw the original error for other error handlers to process
      throw error;
    }
  };
}
