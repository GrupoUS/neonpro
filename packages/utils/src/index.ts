/**
 * NeonPro Utils Package
 * 
 * Utilities and helper functions for the NeonPro platform
 * Minimal, essential utilities only
 */

// Re-export commonly used types
export type { z } from 'zod'

// Logger utility
export const createLogger = (name: string) => {
  return {
    info: (message: string, meta?: any) => console.log(`[${name}] INFO: ${message}`, meta || ''),
    warn: (message: string, meta?: any) => console.warn(`[${name}] WARN: ${message}`, meta || ''),
    error: (message: string, error?: any) => console.error(`[${name}] ERROR: ${message}`, error || ''),
    debug: (message: string, meta?: any) => console.debug(`[${name}] DEBUG: ${message}`, meta || ''),
  }
}

// Common utility functions
export const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms))

export const retry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        await sleep(delay * (i + 1))
      }
    }
  }
  
  throw lastError!
}

export const formatDate = (date: Date): string => 
  date.toISOString().split('T')[0]

export const generateId = (): string => 
  Math.random().toString(36).substring(2) + Date.now().toString(36)

// Healthcare specific utilities
export const formatCPF = (cpf: string): string => 
  cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')

export const formatPhone = (phone: string): string => 
  phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')

export const isValidEmail = (email: string): boolean => 
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const sanitizeString = (str: string): string => 
  str ? str.replace(/[<>]/g, '').trim() : ''

// Data validation helpers
export const validateRequired = (value: any, fieldName: string): void => {
  if (value === undefined || value === null || value === '') {
    throw new Error(`${fieldName} is required`)
  }
}

export const validateEmail = (email: string): void => {
  if (!isValidEmail(email)) {
    throw new Error(`Invalid email format`)
  }
}

// Error handling utilities
export class HealthcareError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'HealthcareError'
  }
}

export const isHealthcareError = (error: any): error is HealthcareError =>
  error instanceof HealthcareError

export const createErrorHandler = (serviceName: string) => 
  (error: any, context?: string) => {
    console.error(`[${serviceName}] Error:`, error)
    
    if (isHealthcareError(error)) {
      return {
        success: false,
        error: error.message,
        code: error.code,
        statusCode: error.statusCode,
        context
      }
    }
    
    return {
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
      context
    }
  }