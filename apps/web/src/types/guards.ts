import * as v from 'valibot'
import { z } from 'zod'

// Type guards for common patterns
export const isString = (value: unknown): value is string => typeof value === 'string'

export const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && !isNaN(value)

export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'

export const isArray = <T>(
  value: unknown,
  guard?: (item: unknown) => item is T,
): value is T[] => Array.isArray(value) && (guard ? value.every(guard) : true)

export const isObject = <T extends Record<string, unknown>>(
  value: unknown,
  guard?: (obj: Record<string, unknown>) => obj is T,
): value is T =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  (guard ? guard(value as Record<string, unknown>) : true)

export const isDefined = <T>(value: T | undefined | null): value is T =>
  value !== undefined && value !== null

export const isNonEmptyString = (value: unknown): value is string =>
  isString(value) && value.trim().length > 0

export const isValidEmail = (value: unknown): value is string =>
  isString(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export const isValidPhone = (value: unknown): value is string =>
  isString(value) && /^\+?[\d\s-()]{10,}$/.test(value)

export const isValidDate = (value: unknown): value is Date =>
  value instanceof Date && !isNaN(value.getTime())

// Healthcare-specific type guards
export const isValidCPF = (value: unknown): value is string => {
  if (!isNonEmptyString(value)) return false
  const cpf = value.replace(/[^\d]/g, '')
  return cpf.length === 11 && /^\d{11}$/.test(cpf)
}

export const isValidCNPJ = (value: unknown): value is string => {
  if (!isNonEmptyString(value)) return false
  const cnpj = value.replace(/[^\d]/g, '')
  return cnpj.length === 14 && /^\d{14}$/.test(cnpj)
}

// Type-safe parsing functions
export const safeParse = <T>(
  schema: z.ZodSchema<T>,
  value: unknown,
): T | null => {
  try {
    const result = schema.safeParse(value)
    return result.success ? result.data : null
  } catch {
    return null
  }
}

export const safeParseValibot = <T>(
  schema: v.GenericSchema,
  value: unknown,
): T | null => {
  try {
    const result = v.safeParse(schema, value)
    return result.success ? (result.output as T) : null
  } catch {
    return null
  }
}

// Assertion functions
export const assertString = (value: unknown, message?: string): string => {
  if (!isString(value)) {
    throw new Error(message || `Expected string, got ${typeof value}`)
  }
  return value
}

export const assertDefined = <T>(
  value: T | undefined | null,
  message?: string,
): T => {
  if (!isDefined(value)) {
    throw new Error(message || 'Value is undefined or null')
  }
  return value
}

// Runtime type checking utilities
export const createTypeGuard = <T>(checker: (value: unknown) => value is T) => checker

export const combineGuards = <T>(
  guards: Array<(value: unknown) => value is T>,
): (value: unknown) => value is T => {
  return (value: unknown): value is T => guards.some(guard => guard(value))
}

// Sanitization functions for security
export const sanitizeString = (value: unknown): string => {
  if (!isString(value)) return ''
  return value
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/, '') // Remove quotes
    .replace(/[\n\r]/g, ' ') // Replace newlines with spaces
    .trim()
}

export const sanitizeHtml = (value: unknown): string => {
  if (!isString(value)) return ''
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/['"]/, '\\$&') // Escape quotes
    .trim()
}

// Brand types for compile-time safety
export type Brand<T, B> = T & { __brand: B }

export const brand = <T, B>(value: T, _brand: B): Brand<T, B> => value as Brand<T, B>

export const isBranded = <T, B>(
  value: unknown,
  checker: (value: unknown) => value is T,
): value is Brand<T, B> => checker(value)
