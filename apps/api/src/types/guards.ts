import * as valibot from 'valibot';
import { z } from 'zod';

// Enhanced type guards for API layer
export const isString = (value: unknown): value is string => typeof value === 'string';

export const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && !isNaN(value);

export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

export const isArray = <T>(
  value: unknown,
  guard?: (item: unknown) => item is T,
): value is T[] => Array.isArray(value) && (guard ? value.every(guard) : true);

export const isObject = <T extends Record<string, unknown>>(
  value: unknown,
  guard?: (obj: Record<string, unknown>) => obj is T,
): value is T =>
  typeof value === 'object'
  && value !== null
  && !Array.isArray(value)
  && (guard ? guard(value as Record<string, unknown>) : true);

export const isDefined = <T>(value: T | undefined | null): value is T =>
  value !== undefined && value !== null;

export const isNonEmptyString = (value: unknown): value is string =>
  isString(value) && value.trim().length > 0;

export const isValidEmail = (value: unknown): value is string =>
  isString(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const isValidPhone = (value: unknown): value is string =>
  isString(value) && /^\+?[\d\s\-()]{10,}$/.test(value);

export const isValidDate = (value: unknown): value is Date =>
  value instanceof Date && !isNaN(value.getTime());

export const isValidUUID = (value: unknown): value is string =>
  isString(value)
  && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

// Healthcare-specific type guards
export const isValidCPF = (value: unknown): value is string => {
  if (!isNonEmptyString(value)) return false;
  const cpf = value.replace(/[^\d]/g, '');
  if (cpf.length !== 11 || !/^\d{11}$/.test(cpf)) return false;

  // CPF validation algorithm
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i), 10) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9), 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i), 10) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;

  return remainder === parseInt(cpf.charAt(10), 10);
};

export const isValidCNPJ = (value: unknown): value is string => {
  if (!isNonEmptyString(value)) return false;
  const cnpj = value.replace(/[^\d]/g, '');
  if (cnpj.length !== 14 || !/^\d{14}$/.test(cnpj)) return false;

  // CNPJ validation algorithm
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i), 10) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(cnpj.charAt(12), 10)) return false;

  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i), 10) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;

  return digit2 === parseInt(cnpj.charAt(13), 10);
};

// API-specific type guards
export const isValidPaginationParams = (
  value: unknown,
): value is {
  page: number;
  pageSize: number;
} => {
  return isObject(
    value,
    (obj): obj is { page: number; pageSize: number } =>
      isNumber(obj.page)
      && obj.page > 0
      && isNumber(obj.pageSize)
      && obj.pageSize > 0
      && obj.pageSize <= 100,
  );
};

export const isValidSortParams = (
  value: unknown,
): value is {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
} => {
  return isObject(
    value,
    (obj): obj is { sortBy: string; sortOrder: 'asc' | 'desc' } =>
      isNonEmptyString(obj.sortBy)
      && (obj.sortOrder === 'asc' || obj.sortOrder === 'desc'),
  );
};

export const isValidFilterParams = (
  value: unknown,
): value is Record<string, unknown> => {
  return isObject(value);
};

// Safe parsing with error handling
export const safeParseValibot = <T>(
  schema: valibot.Schema<T>,
  value: unknown,
):
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: valibot.ParseError<T>;
    } =>
{
  const result = valibot.safeParse(schema, value);
  return result.success
    ? { success: true, data: result.output }
    : { success: false, error: result.issues };
};

// Assertion functions with detailed errors
export const assertString = (value: unknown, message?: string): string => {
  if (!isString(value)) {
    throw new Error(message || `Expected string, got ${typeof value}`);
  }
  return value;
};

export const assertDefined = <T>(
  value: T | undefined | null,
  message?: string,
): T => {
  if (!isDefined(value)) {
    throw new Error(message || 'Value is undefined or null');
  }
  return value;
};

export const assertUUID = (value: unknown, message?: string): string => {
  if (!isValidUUID(value)) {
    throw new Error(message || 'Invalid UUID format');
  }
  return value;
};

export const assertCPF = (value: unknown, message?: string): string => {
  if (!isValidCPF(value)) {
    throw new Error(message || 'Invalid CPF format');
  }
  return value;
};

// Runtime validation utilities
export const createValidator = <T>(schema: z.ZodSchema<T>) => {
  return (value: unknown): T => {
    const result = schema.safeParse(value);
    if (!result.success) {
      throw new Error(`Validation failed: ${result.error.message}`);
    }
    return result.data;
  };
};

export const createOptionalValidator = <T>(schema: z.ZodSchema<T>) => {
  return (value: unknown): T | undefined => {
    if (value === undefined || value === null) {
      return undefined;
    }
    const result = schema.safeParse(value);
    if (!result.success) {
      throw new Error(`Validation failed: ${result.error.message}`);
    }
    return result.data;
  };
};

// Input sanitization
export const sanitizeString = (value: unknown): string => {
  if (!isString(value)) return '';
  return value.trim().replace(/[<>]/g, '');
};

export const sanitizeHtml = (value: unknown): string => {
  if (!isString(value)) return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Security type guards
export const isSafeHeaderValue = (value: unknown): value is string => {
  if (!isString(value)) return false;
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /on\w+\s*=/i,
  ];
  return !dangerousPatterns.some(pattern => pattern.test(value));
};

export const isSafeRedirectUrl = (value: unknown): value is string => {
  if (!isString(value)) return false;
  if (value.startsWith('javascript:')) return false;
  if (value.startsWith('data:')) return false;
  if (value.startsWith('vbscript:')) return false;
  return /^https?:\/\//.test(value) || value.startsWith('/');
};
