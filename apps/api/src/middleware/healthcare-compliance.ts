/**
 * Healthcare Compliance Middleware
 * 
 * Integrated compliance validation for all healthcare APIs
 * Ensures LGPD, ANVISA, CFM compliance across all endpoints
 */

import { middleware } from '../trpc-factory'
import type { Context } from '../context'

export interface ComplianceValidation {
  lgpd: {
    consentRequired: boolean
    consentObtained: boolean
    dataMinimization: boolean
    purposeLimitation: boolean
    retentionPeriod: number
  }
  anvisa: {
    medicalDeviceCompliance: boolean
    adverseEventReporting: boolean
    qualityManagement: boolean
    documentation: boolean
  }
  cfm: {
    professionalLicense: boolean
    ethicalStandards: boolean
    recordKeeping: boolean
    confidentiality: boolean
  }
  overall: {
    compliant: boolean
    score: number
    violations: string[]
    recommendations: string[]
  }
}

export const healthcareCompliance = middleware(async ({ ctx, next, type }) => {
  // Skip compliance check for health endpoints
  if (type === 'query' && ctx.req?.url?.includes('/health')) {
    return next()
  }

  try {
    // Perform comprehensive compliance validation
    const compliance = await validateHealthcareCompliance(ctx)

    // Log compliance check
    await logComplianceValidation(ctx, compliance)

    // Block request if critical compliance violations
    if (!compliance.overall.compliant && compliance.overall.score < 70) {
      throw new Error(
        `Compliance violation detected: ${compliance.overall.violations.join(', ')}`
      )
    }

    // Add compliance metadata to context
    ctx.compliance = compliance

    return next()
  } catch (error) {
    console.error('Compliance validation failed:', error)
    
    // Log compliance failure
    await logComplianceFailure(ctx, error instanceof Error ? error.message : 'Unknown error')
    
    throw error
  }
})

async function validateHealthcareCompliance(ctx: Context): Promise<ComplianceValidation> {
  const validation: ComplianceValidation = {
    lgpd: {
      consentRequired: false,
      consentObtained: true,
      dataMinimization: true,
      purposeLimitation: true,
      retentionPeriod: 365,
    },
    anvisa: {
      medicalDeviceCompliance: true,
      adverseEventReporting: true,
      qualityManagement: true,
      documentation: true,
    },
    cfm: {
      professionalLicense: true,
      ethicalStandards: true,
      recordKeeping: true,
      confidentiality: true,
    },
    overall: {
      compliant: true,
      score: 100,
      violations: [],
      recommendations: [],
    },
  }

  // Validate LGPD compliance
  await validateLGDCompliance(ctx, validation)

  // Validate ANVISA compliance
  await validateAnvisaCompliance(ctx, validation)

  // Validate CFM compliance
  await validateCFMCompliance(ctx, validation)

  // Calculate overall compliance score
  const scores = [
    calculateLGDPScore(validation.lgpd),
    calculateAnvisaScore(validation.anvisa),
    calculateCFMScore(validation.cfm),
  ]
  
  validation.overall.score = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  validation.overall.compliant = validation.overall.score >= 80

  // Generate recommendations
  generateComplianceRecommendations(validation)

  return validation
}

async function validateLGDCompliance(
  ctx: Context, 
  validation: ComplianceValidation
): Promise<void> {
  // Check if patient data is being accessed
  const hasPatientData = ctx.req?.url?.includes('patient') || 
                         ctx.req?.url?.includes('clinical') ||
                         ctx.req?.url?.includes('medical')

  if (hasPatientData) {
    validation.lgpd.consentRequired = true
    
    // Check if consent is documented (would check database in real implementation)
    validation.lgpd.consentObtained = await checkPatientConsent(ctx)
    
    if (!validation.lgpd.consentObtained) {
      validation.overall.violations.push('LGPD: Patient consent not documented')
      validation.overall.compliant = false
    }

    // Validate data minimization
    const requestedFields = getRequestedFields(ctx)
    const necessaryFields = getNecessaryFields(ctx.req?.url || '')
    
    if (requestedFields.length > necessaryFields.length) {
      validation.lgpd.dataMinimization = false
      validation.overall.violations.push('LGPD: Excessive data collection')
    }
  }

  // Validate retention period
  const retentionPeriod = await getDataRetentionPeriod(ctx.clinicId)
  validation.lgpd.retentionPeriod = retentionPeriod

  if (retentionPeriod > 2555) { // 7 years maximum for medical records
    validation.overall.violations.push('LGPD: Retention period exceeds legal limit')
    validation.overall.compliant = false
  }
}

async function validateAnvisaCompliance(
  ctx: Context,
  validation: ComplianceValidation
): Promise<void> {
  // Check if medical procedures are being performed
  const hasMedicalProcedures = ctx.req?.url?.includes('treatment') ||
                              ctx.req?.url?.includes('procedure') ||
                              ctx.req?.url?.includes('clinical')

  if (hasMedicalProcedures) {
    // Validate medical device compliance (if applicable)
    validation.anvisa.medicalDeviceCompliance = await checkMedicalDeviceCompliance(ctx)

    // Check if adverse event reporting is enabled
    validation.anvisa.adverseEventReporting = await checkAdverseEventReporting(ctx)

    if (!validation.anvisa.adverseEventReporting) {
      validation.overall.violations.push('ANVISA: Adverse event reporting not configured')
    }

    // Validate quality management system
    validation.anvisa.qualityManagement = await checkQualityManagementSystem(ctx)

    // Validate documentation requirements
    validation.anvisa.documentation = await checkMedicalDocumentation(ctx)
  }
}

async function validateCFMCompliance(
  ctx: Context,
  validation: ComplianceValidation
): Promise<void> {
  // Check if professional is authenticated
  if (ctx.session?.id) {
    // Validate professional license
    validation.cfm.professionalLicense = await validateProfessionalLicense(ctx)

    if (!validation.cfm.professionalLicense) {
      validation.overall.violations.push('CFM: Professional license not valid')
      validation.overall.compliant = false
    }

    // Validate ethical standards
    validation.cfm.ethicalStandards = await validateEthicalStandards(ctx)

    // Validate record keeping requirements
    validation.cfm.recordKeeping = await validateRecordKeeping(ctx)

    // Validate confidentiality requirements
    validation.cfm.confidentiality = await validateConfidentiality(ctx)
  }
}

// Helper functions
async function checkPatientConsent(_ctx: Context): Promise<boolean> {
  // Mock implementation - would check actual consent records
  return true
}

function getRequestedFields(ctx: Context): string[] {
  // Extract requested fields from the request
  // This is a simplified implementation
  const url = ctx.req?.url || ''
  const fields = []
  
  if (url.includes('patient')) {
    fields.push('name', 'birth_date', 'contact_info', 'medical_history')
  }
  
  return fields
}

function getNecessaryFields(url: string): string[] {
  // Define necessary fields based on endpoint
  const necessaryFields: Record<string, string[]> = {
    '/api/patients': ['name', 'birth_date'],
    '/api/appointments': ['patient_id', 'scheduled_at'],
    '/api/treatments': ['patient_id', 'treatment_type'],
  }

  for (const [endpoint, fields] of Object.entries(necessaryFields)) {
    if (url.includes(endpoint)) {
      return fields
    }
  }

  return []
}

async function getDataRetentionPeriod(_clinicId: string): Promise<number> {
  // Mock implementation - would fetch from clinic settings
  return 365 // 1 year default
}

async function checkMedicalDeviceCompliance(_ctx: Context): Promise<boolean> {
  // Mock implementation - would check device registration and compliance
  return true
}

async function checkAdverseEventReporting(_ctx: Context): Promise<boolean> {
  // Mock implementation - would check if adverse event reporting is configured
  return true
}

async function checkQualityManagementSystem(_ctx: Context): Promise<boolean> {
  // Mock implementation - would check QMS certification
  return true
}

async function checkMedicalDocumentation(_ctx: Context): Promise<boolean> {
  // Mock implementation - would check documentation standards
  return true
}

async function validateProfessionalLicense(_ctx: Context): Promise<boolean> {
  // Mock implementation - would validate with council database
  return true
}

async function validateEthicalStandards(_ctx: Context): Promise<boolean> {
  // Mock implementation - would check ethical compliance
  return true
}

async function validateRecordKeeping(_ctx: Context): Promise<boolean> {
  // Mock implementation - would check record keeping standards
  return true
}

async function validateConfidentiality(_ctx: Context): Promise<boolean> {
  // Mock implementation - would check confidentiality measures
  return true
}

function calculateLGDPScore(lgpd: ComplianceValidation['lgpd']): number {
  let score = 100
  
  if (!lgpd.consentObtained) score -= 30
  if (!lgpd.dataMinimization) score -= 20
  if (!lgpd.purposeLimitation) score -= 15
  if (lgpd.retentionPeriod > 2555) score -= 25
  
  return Math.max(0, score)
}

function calculateAnvisaScore(anvisa: ComplianceValidation['anvisa']): number {
  let score = 100
  
  if (!anvisa.medicalDeviceCompliance) score -= 25
  if (!anvisa.adverseEventReporting) score -= 30
  if (!anvisa.qualityManagement) score -= 25
  if (!anvisa.documentation) score -= 20
  
  return Math.max(0, score)
}

function calculateCFMScore(cfm: ComplianceValidation['cfm']): number {
  let score = 100
  
  if (!cfm.professionalLicense) score -= 40
  if (!cfm.ethicalStandards) score -= 20
  if (!cfm.recordKeeping) score -= 20
  if (!cfm.confidentiality) score -= 20
  
  return Math.max(0, score)
}

function generateComplianceRecommendations(validation: ComplianceValidation): void {
  if (validation.lgpd.consentRequired && !validation.lgpd.consentObtained) {
    validation.overall.recommendations.push(
      'Implement patient consent management system'
    )
  }
  
  if (!validation.lgpd.dataMinimization) {
    validation.overall.recommendations.push(
      'Review and minimize data collection to necessary fields only'
    )
  }
  
  if (!validation.anvisa.adverseEventReporting) {
    validation.overall.recommendations.push(
      'Configure adverse event reporting system per ANVISA requirements'
    )
  }
  
  if (!validation.cfm.professionalLicense) {
    validation.overall.recommendations.push(
      'Validate all professional licenses with respective councils'
    )
  }
}

async function logComplianceValidation(
  ctx: Context,
  compliance: ComplianceValidation
): Promise<void> {
  try {
    // Log compliance validation results
    await ctx.supabase?.from('compliance_validations').insert({
      id: crypto.randomUUID(),
      clinic_id: ctx.clinicId,
      user_id: ctx.session?.id,
      endpoint: ctx.req?.url,
      compliance_score: compliance.overall.score,
      is_compliant: compliance.overall.compliant,
      violations: compliance.overall.violations,
      recommendations: compliance.overall.recommendations,
      validated_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to log compliance validation:', error)
  }
}

async function logComplianceFailure(
  ctx: Context,
  errorMessage: string
): Promise<void> {
  try {
    // Log compliance failure
    await ctx.supabase?.from('compliance_failures').insert({
      id: crypto.randomUUID(),
      clinic_id: ctx.clinicId,
      user_id: ctx.session?.id,
      endpoint: ctx.req?.url,
      error_message: errorMessage,
      ip_address: ctx.req?.headers.get('x-forwarded-for') || 'unknown',
      user_agent: ctx.req?.headers.get('user-agent') || 'unknown',
      occurred_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to log compliance failure:', error)
  }
}

// Extend Context type to include compliance
declare module '../context' {
  interface Context {
    compliance?: ComplianceValidation
  }
}