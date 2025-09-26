/**
 * Local healthcare logging utilities
 * Simple implementations to avoid dependency issues
 */
import { createLogger } from '@neonpro/utils'

// Database-specific logger
export const databaseLogger = createLogger('database')

// Audit event logging
export const logAuditEvent = (action: string, details: any) => {
  console.log(`[AUDIT] ${action}:`, details)
}

// Healthcare error logging
export const logHealthcareError = (error: Error, context: any) => {
  console.error(`[HEALTHCARE_ERROR] ${error.message}:`, context)
}

// Performance metric logging
export const logPerformanceMetric = (metric: string, value: number, unit: string) => {
  console.log(`[PERFORMANCE] ${metric}: ${value}${unit}`)
}
