/**
 * Sensitive Field Exposure Analyzer for Healthcare Platform
 * Analyzes API responses and database queries for sensitive data exposure
 *
 * Features:
 * - Automatic detection of sensitive healthcare data
 * - Field-level exposure analysis
 * - Data masking recommendations
 * - Compliance violation detection
 * - Real-time exposure monitoring
 *
 * @version 1.0.0
 * Compliance: LGPD, HIPAA, ANVISA, CFM
 * Platform: NeonPro Healthcare Platform
 */

import { Context } from 'hono'
import { logger } from "@/utils/healthcare-errors"

// Sensitive Field Classification
export interface SensitiveFieldClassification {
  name: string
  category:
    | 'PERSONAL'
    | 'MEDICAL'
    | 'FINANCIAL'
    | 'CONTACT'
    | 'IDENTIFICATION'
    | 'HEALTH_HISTORY'
  sensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'object' | 'array'
  maskingRequired: boolean
  encryptionRequired: boolean
  retentionPolicy?: {
    duration: string
    automaticDeletion: boolean
  }
  legalBasis?: string[]
}

// Field Exposure Analysis Result
export interface ExposureAnalysisResult {
  fieldName: string
  fieldType: string
  classification: SensitiveFieldClassification
  isExposed: boolean
  exposureLevel: 'NONE' | 'PARTIAL' | 'FULL' | 'OVEREXPOSED'
  maskingApplied: boolean
  encryptionApplied: boolean
  recommendations: string[]
  complianceRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

// API Response Analysis
export interface APIResponseAnalysis {
  endpoint: string
  method: string
  statusCode: number
  responseSize: number
  sensitiveFields: ExposureAnalysisResult[]
  overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  violationCount: number
  recommendations: string[]
  timestamp: string
}

// Healthcare Data Schema
export const HEALTHCARE_SENSITIVE_FIELDS: SensitiveFieldClassification[] = [
  // Personal Identification
  {
    name: 'cpf',
    category: 'IDENTIFICATION',
    sensitivity: 'CRITICAL',
    dataType: 'string',
    maskingRequired: true,
    encryptionRequired: true,
    retentionPolicy: { duration: '10_years', automaticDeletion: true },
    legalBasis: ['consent', 'legal_obligation'],
  },
  {
    name: 'rg',
    category: 'IDENTIFICATION',
    sensitivity: 'HIGH',
    dataType: 'string',
    maskingRequired: true,
    encryptionRequired: true,
  },
  {
    name: 'passport_number',
    category: 'IDENTIFICATION',
    sensitivity: 'HIGH',
    dataType: 'string',
    maskingRequired: true,
    encryptionRequired: true,
  },
  {
    name: 'birth_date',
    category: 'PERSONAL',
    sensitivity: 'HIGH',
    dataType: 'date',
    maskingRequired: false,
    encryptionRequired: true,
  },

  // Contact Information
  {
    name: 'email',
    category: 'CONTACT',
    sensitivity: 'MEDIUM',
    dataType: 'string',
    maskingRequired: false,
    encryptionRequired: true,
  },
  {
    name: 'phone',
    category: 'CONTACT',
    sensitivity: 'MEDIUM',
    dataType: 'string',
    maskingRequired: false,
    encryptionRequired: true,
  },
  {
    name: 'address',
    category: 'CONTACT',
    sensitivity: 'HIGH',
    dataType: 'object',
    maskingRequired: false,
    encryptionRequired: true,
  },

  // Medical Information
  {
    name: 'diagnosis',
    category: 'MEDICAL',
    sensitivity: 'CRITICAL',
    dataType: 'string',
    maskingRequired: false,
    encryptionRequired: true,
    retentionPolicy: { duration: '20_years', automaticDeletion: false },
    legalBasis: ['healthcare', 'vital_interests'],
  },
  {
    name: 'medical_history',
    category: 'HEALTH_HISTORY',
    sensitivity: 'CRITICAL',
    dataType: 'object',
    maskingRequired: false,
    encryptionRequired: true,
    retentionPolicy: { duration: 'lifetime', automaticDeletion: false },
  },
  {
    name: 'medications',
    category: 'MEDICAL',
    sensitivity: 'HIGH',
    dataType: 'array',
    maskingRequired: false,
    encryptionRequired: true,
  },
  {
    name: 'allergies',
    category: 'MEDICAL',
    sensitivity: 'HIGH',
    dataType: 'array',
    maskingRequired: false,
    encryptionRequired: true,
  },
  {
    name: 'blood_type',
    category: 'MEDICAL',
    sensitivity: 'MEDIUM',
    dataType: 'string',
    maskingRequired: false,
    encryptionRequired: true,
  },

  // Financial Information
  {
    name: 'insurance_number',
    category: 'FINANCIAL',
    sensitivity: 'CRITICAL',
    dataType: 'string',
    maskingRequired: true,
    encryptionRequired: true,
  },
  {
    name: 'billing_info',
    category: 'FINANCIAL',
    sensitivity: 'HIGH',
    dataType: 'object',
    maskingRequired: false,
    encryptionRequired: true,
  },
  {
    name: 'payment_method',
    category: 'FINANCIAL',
    sensitivity: 'HIGH',
    dataType: 'object',
    maskingRequired: false,
    encryptionRequired: true,
  },

  // Genetic and Biometric Data
  {
    name: 'genetic_data',
    category: 'MEDICAL',
    sensitivity: 'CRITICAL',
    dataType: 'object',
    maskingRequired: false,
    encryptionRequired: true,
    retentionPolicy: { duration: 'lifetime', automaticDeletion: false },
    legalBasis: ['explicit_consent', 'healthcare'],
  },
  {
    name: 'biometric_data',
    category: 'IDENTIFICATION',
    sensitivity: 'CRITICAL',
    dataType: 'object',
    maskingRequired: false,
    encryptionRequired: true,
  },
]

// Healthcare Sensitive Field Analyzer
export class HealthcareSensitiveFieldAnalyzer {
  private sensitiveFields: Map<string, SensitiveFieldClassification>

  constructor(customFields?: SensitiveFieldClassification[]) {
    this.sensitiveFields = new Map()

    // Initialize with default healthcare sensitive fields
    HEALTHCARE_SENSITIVE_FIELDS.forEach(field => {
      this.sensitiveFields.set(field.name, field)
    })

    // Add custom fields
    if (customFields) {
      customFields.forEach(field => {
        this.sensitiveFields.set(field.name, field)
      })
    }
  }

  // Analyze API response for sensitive data exposure
  analyzeAPIResponse(
    response: any,
    endpoint: string,
    method: string,
    statusCode: number,
  ): APIResponseAnalysis {
    const analysis: APIResponseAnalysis = {
      endpoint,
      method,
      statusCode,
      responseSize: JSON.stringify(response).length,
      sensitiveFields: [],
      overallRiskLevel: 'LOW',
      violationCount: 0,
      recommendations: [],
      timestamp: new Date().toISOString(),
    }

    // Recursively analyze response data
    this.analyzeDataStructure(response, analysis.sensitiveFields, '')

    // Calculate overall risk level
    analysis.overallRiskLevel = this.calculateOverallRisk(
      analysis.sensitiveFields,
    )
    analysis.violationCount = analysis.sensitiveFields.filter(
      f => f.isExposed,
    ).length

    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(
      analysis.sensitiveFields,
    )

    return analysis
  }

  // Analyze data structure recursively
  private analyzeDataStructure(
    data: any,
    results: ExposureAnalysisResult[],
    path: string = '',
  ): void {
    if (data === null || data === undefined) return

    if (typeof data === 'object') {
      if (Array.isArray(data)) {
        data.forEach((item, _index) => {
          this.analyzeDataStructure(item, results, `${path}[${index}]`)
        })
      } else {
        Object.entries(data).forEach(([key, _value]) => {
          const currentPath = path ? `${path}.${key}` : key

          // Check if this field is classified as sensitive
          const classification = this.sensitiveFields.get(key)
          if (classification) {
            const result = this.analyzeField(
              key,
              value,
              currentPath,
              classification,
            )
            results.push(result)
          }

          // Recursively analyze nested objects
          this.analyzeDataStructure(value, results, currentPath)
        })
      }
    }
  }

  // Analyze individual field
  private analyzeField(
    fieldName: string,
    fieldValue: any,
    path: string,
    classification: SensitiveFieldClassification,
  ): ExposureAnalysisResult {
    const isExposed = this.isFieldExposed(fieldValue, classification)
    const exposureLevel = this.calculateExposureLevel(
      fieldValue,
      classification,
    )
    const maskingApplied = this.isMaskingApplied(fieldValue)
    const encryptionApplied = this.isEncryptionApplied(fieldValue)
    const complianceRisk = this.calculateComplianceRisk(
      isExposed,
      classification,
    )

    return {
      fieldName,
      fieldType: typeof fieldValue,
      classification,
      isExposed,
      exposureLevel,
      maskingApplied,
      encryptionApplied,
      recommendations: this.generateFieldRecommendations(
        fieldValue,
        classification,
      ),
      complianceRisk,
    }
  }

  // Check if field is exposed
  private isFieldExposed(
    value: any,
    classification: SensitiveFieldClassification,
  ): boolean {
    // Check if value is unmasked and sensitive
    if (typeof value === 'string') {
      // Check for common masking patterns
      const isMasked = value.includes('*') || value.includes('***') || value.includes('•••')
      if (isMasked) return false

      // Check for sensitive patterns
      if (classification.category === 'IDENTIFICATION') {
        return value.length > 2 // Non-empty identification data
      }

      if (classification.category === 'MEDICAL') {
        return value.length > 10 // Substantial medical information
      }
    }

    return true
  }

  // Calculate exposure level
  private calculateExposureLevel(
    value: any,
    classification: SensitiveFieldClassification,
  ): 'NONE' | 'PARTIAL' | 'FULL' | 'OVEREXPOSED' {
    if (!this.isFieldExposed(value, classification)) return 'NONE'

    if (classification.sensitivity === 'CRITICAL') return 'OVEREXPOSED'
    if (classification.sensitivity === 'HIGH') return 'FULL'
    if (classification.sensitivity === 'MEDIUM') return 'PARTIAL'
    return 'NONE'
  }

  // Check if masking is applied
  private isMaskingApplied(value: any): boolean {
    if (typeof value !== 'string') return false
    return (
      value.includes('*') || value.includes('***') || value.includes('•••')
    )
  }

  // Check if encryption is applied (placeholder for actual encryption detection)
  private isEncryptionApplied(_value: any): boolean {
    // This would integrate with actual encryption detection
    return false // Placeholder
  }

  // Calculate compliance risk
  private calculateComplianceRisk(
    isExposed: boolean,
    classification: SensitiveFieldClassification,
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (!isExposed) return 'LOW'

    if (classification.sensitivity === 'CRITICAL') return 'CRITICAL'
    if (classification.sensitivity === 'HIGH') return 'HIGH'
    if (classification.sensitivity === 'MEDIUM') return 'MEDIUM'
    return 'LOW'
  }

  // Calculate overall risk level
  private calculateOverallRisk(
    fields: ExposureAnalysisResult[],
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const criticalRisks = fields.filter(
      f => f.complianceRisk === 'CRITICAL',
    ).length
    const highRisks = fields.filter(f => f.complianceRisk === 'HIGH').length
    const mediumRisks = fields.filter(
      f => f.complianceRisk === 'MEDIUM',
    ).length

    if (criticalRisks > 0) return 'CRITICAL'
    if (highRisks > 2) return 'CRITICAL'
    if (highRisks > 0) return 'HIGH'
    if (mediumRisks > 3) return 'HIGH'
    if (mediumRisks > 0) return 'MEDIUM'
    return 'LOW'
  }

  // Generate field-specific recommendations
  private generateFieldRecommendations(
    value: any,
    classification: SensitiveFieldClassification,
  ): string[] {
    const recommendations: string[] = []

    if (classification.maskingRequired && !this.isMaskingApplied(value)) {
      recommendations.push(`Apply field masking for ${classification.name}`)
    }

    if (classification.encryptionRequired && !this.isEncryptionApplied(value)) {
      recommendations.push(`Enable encryption for ${classification.name}`)
    }

    if (classification.sensitivity === 'CRITICAL') {
      recommendations.push(
        `Implement strict access controls for ${classification.name}`,
      )
      recommendations.push(
        `Enable audit logging for ${classification.name} access`,
      )
    }

    return recommendations
  }

  // Generate overall recommendations
  private generateRecommendations(fields: ExposureAnalysisResult[]): string[] {
    const recommendations: string[] = []

    const exposedFields = fields.filter(f => f.isExposed)
    const unmaskedFields = exposedFields.filter(f => !f.maskingApplied)
    const unencryptedFields = exposedFields.filter(f => !f.encryptionApplied)

    if (unmaskedFields.length > 0) {
      recommendations.push(
        `Implement data masking for ${unmaskedFields.length} sensitive fields`,
      )
    }

    if (unencryptedFields.length > 0) {
      recommendations.push(
        `Enable encryption for ${unencryptedFields.length} sensitive fields`,
      )
    }

    if (exposedFields.length > 5) {
      recommendations.push(
        'Consider reducing the amount of sensitive data returned in API responses',
      )
    }

    const criticalExposures = fields.filter(
      f => f.complianceRisk === 'CRITICAL',
    )
    if (criticalExposures.length > 0) {
      recommendations.push(
        'Immediate action required: Critical sensitive data exposure detected',
      )
    }

    return recommendations
  }

  // Log exposure analysis for audit trail
  logExposureAnalysis(analysis: APIResponseAnalysis): void {
    if (analysis.overallRiskLevel === 'LOW') return

    logger.warn('Sensitive data exposure detected', {
      endpoint: analysis.endpoint,
      method: analysis.method,
      statusCode: analysis.statusCode,
      overallRiskLevel: analysis.overallRiskLevel,
      violationCount: analysis.violationCount,
      sensitiveFieldsCount: analysis.sensitiveFields.length,
      timestamp: analysis.timestamp,
    })

    // Log individual violations
    analysis.sensitiveFields
      .filter(f => f.isExposed)
      .forEach(field => {
        logger.security('sensitive_data_exposure', 'Field exposure detected', {
          fieldName: field.fieldName,
          fieldType: field.fieldType,
          sensitivity: field.classification.sensitivity,
          category: field.classification.category,
          exposureLevel: field.exposureLevel,
          complianceRisk: field.complianceRisk,
        })
      })
  }

  // Add custom sensitive field classification
  addSensitiveField(classification: SensitiveFieldClassification): void {
    this.sensitiveFields.set(classification.name, classification)
  }

  // Remove sensitive field classification
  removeSensitiveField(fieldName: string): void {
    this.sensitiveFields.delete(fieldName)
  }

  // Get all sensitive field classifications
  getSensitiveFields(): SensitiveFieldClassification[] {
    return Array.from(this.sensitiveFields.values())
  }
}

// Create default analyzer instance
export const sensitiveFieldAnalyzer = new HealthcareSensitiveFieldAnalyzer()

// Middleware for real-time exposure analysis
export function sensitiveDataExposureMiddleware(): (
  c: Context,
  next: () => Promise<void>,
) => Promise<void> {
  return async (c: Context, _next) => {
    // Store original response
    const originalJson = c.json

    // Override json method to analyze response
    c.json = (
      data: any,
      status?: number,
      headers?: Record<string, _string>,
    ) => {
      // Analyze response for sensitive data exposure
      const analysis = sensitiveFieldAnalyzer.analyzeAPIResponse(
        data,
        c.req.path,
        c.req.method,
        status || 200,
      )

      // Log exposure analysis
      sensitiveFieldAnalyzer.logExposureAnalysis(analysis)

      // Add security headers with exposure info
      c.header(
        'X-Sensitive-Data-Fields',
        analysis.sensitiveFields.length.toString(),
      )
      c.header('X-Sensitive-Data-Risk', analysis.overallRiskLevel)
      c.header(
        'X-Sensitive-Data-Violations',
        analysis.violationCount.toString(),
      )

      // Call original json method
      return originalJson.call(c, data, status, headers)
    }

    await next()
  }
}

// Export types and utilities
export type { APIResponseAnalysis, ExposureAnalysisResult, SensitiveFieldClassification }
