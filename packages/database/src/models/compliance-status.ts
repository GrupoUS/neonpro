
/**
 * Compliance Status Model
 *
 * This model defines the compliance status for the NeonPro platform,
 * specifically focusing on Brazilian healthcare regulations (LGPD, ANVISA, CFM).
 * It provides comprehensive tracking of compliance metrics and audit trails.
 */

import { z } from 'zod'

// Compliance status types
export const ComplianceStatusType = z.enum([
  'compliant',
  'non_compliant',
  'needs_attention',
  'under_review',
  'exempt'
])

export type ComplianceStatusType = z.infer<typeof ComplianceStatusType>

// Compliance framework types
export const ComplianceFramework = z.enum([
  'lgpd', // Lei Geral de Proteção de Dados
  'anvisa', // Agência Nacional de Vigilância Sanitária
  'cfm', // Conselho Federal de Medicina
  'hipaa', // Health Insurance Portability and Accountability Act (for international)
  'gdpr' // General Data Protection Regulation (for EU patients)
])

export type ComplianceFramework = z.infer<typeof ComplianceFramework>

// Compliance check types
export const ComplianceCheckType = z.enum([
  'data_protection',
  'audit_trail',
  'access_control',
  'encryption',
  'backup',
  'documentation',
  'training',
  'risk_assessment'
])

export type ComplianceCheckType = z.infer<typeof ComplianceCheckType>

// Compliance severity levels
export const ComplianceSeverity = z.enum([
  'critical',
  'high',
  'medium',
  'low',
  'info'
])

export type ComplianceSeverity = z.infer<typeof ComplianceSeverity>

// Compliance check result schema
const ComplianceCheckResultSchema = z.object({
  id: z.string(),
  check_type: ComplianceCheckType,
  framework: ComplianceFramework,
  status: ComplianceStatusType,
  severity: ComplianceSeverity,
  score: z.number().min(0).max(100),
  last_checked: z.string().datetime(),
  next_check: z.string().datetime(),
  issues_found: z.number().default(0),
  issues_resolved: z.number().default(0),
  description: z.string(),
  recommendations: z.array(z.string()),
  evidence: z.array(z.string()).optional(),
  assignee: z.string().optional(),
  tags: z.array(z.string()).default([])
})

export type ComplianceCheckResult = z.infer<typeof ComplianceCheckResultSchema>

// Compliance metrics schema
const ComplianceMetricsSchema = z.object({
  overall_score: z.number().min(0).max(100),
  framework_scores: z.record(ComplianceFramework, z.number().min(0).max(100)),
  checks_passed: z.number().default(0),
  checks_failed: z.number().default(0),
  total_checks: z.number().default(0),
  critical_issues: z.number().default(0),
  high_issues: z.number().default(0),
  medium_issues: z.number().default(0),
  low_issues: z.number().default(0),
  last_audit: z.string().datetime(),
  next_audit: z.string().datetime(),
  audit_frequency_days: z.number().default(30),
  compliance_trend: z.enum(['improving', 'stable', 'declining']).default('stable')
})

export type ComplianceMetrics = z.infer<typeof ComplianceMetricsSchema>

// Healthcare-specific compliance schema
const HealthcareComplianceSchema = z.object({
  lgpd_compliance: z.object({
    data_processing_records: z.boolean(),
    consent_management: z.boolean(),
    data_subject_rights: z.boolean(),
    breach_notification: z.boolean(),
    data_protection_officer: z.boolean(),
    international_transfer: z.boolean(),
    data_retention_policy: z.boolean(),
    anonymization_process: z.boolean()
  }),
  anvisa_compliance: z.object({
    medical_device_registration: z.boolean(),
    clinical_trial_protocol: z.boolean(),
    adverse_event_reporting: z.boolean(),
    quality_management_system: z.boolean(),
    regulatory_submissions: z.boolean(),
    post_market_surveillance: z.boolean(),
    labeling_requirements: z.boolean(),
    documentation_standards: z.boolean()
  }),
  cfm_compliance: z.object({
    medical_ethics: z.boolean(),
    patient_confidentiality: z.boolean(),
    professional_conduct: z.boolean(),
    continuing_education: z.boolean(),
    record_keeping: z.boolean(),
    informed_consent: z.boolean()
  }),
  audit_trail: z.object({
    enabled: z.boolean(),
    immutable: z.boolean(),
    retention_days: z.number().default(2555), // 7 years
    encryption_at_rest: z.boolean(),
    encryption_in_transit: z.boolean(),
    access_logging: z.boolean(),
    tamper_detection: z.boolean()
  })
})

export type HealthcareCompliance = z.infer<typeof HealthcareComplianceSchema>

// Main compliance status schema
const ComplianceStatusSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string().default('1.0.0'),
  status: ComplianceStatusType,
  overall_score: z.number().min(0).max(100),
  metrics: ComplianceMetricsSchema,
  healthcare: HealthcareComplianceSchema,
  checks: z.array(ComplianceCheckResultSchema).default([]),
  last_updated: z.string().datetime(),
  next_review: z.string().datetime(),
  review_frequency_days: z.number().default(30),
  responsible_party: z.string(),
  contact_email: z.string().email(),
  escalation_contacts: z.array(z.string().email()).default([]),
  metadata: z.object({
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    created_by: z.string(),
    tags: z.array(z.string()).default(['compliance', 'healthcare']),
    version_history: z.array(z.object({
      version: z.string(),
      timestamp: z.string().datetime(),
      changes: z.array(z.string()),
      author: z.string()
    })).default([])
  })
})

export type ComplianceStatus = z.infer<typeof ComplianceStatusSchema>

// Default compliance status configuration
export const DEFAULT_COMPLIANCE_STATUS = {
  lgpd_compliance: {
    data_processing_records: true,
    consent_management: true,
    data_subject_rights: true,
    breach_notification: true,
    data_protection_officer: true,
    international_transfer: true,
    data_retention_policy: true,
    anonymization_process: true
  },
  anvisa_compliance: {
    medical_device_registration: true,
    clinical_trial_protocol: true,
    adverse_event_reporting: true,
    quality_management_system: true,
    regulatory_submissions: true,
    post_market_surveillance: true,
    labeling_requirements: true,
    documentation_standards: true
  },
  cfm_compliance: {
    medical_ethics: true,
    patient_confidentiality: true,
    professional_conduct: true,
    continuing_education: true,
    record_keeping: true,
    informed_consent: true
  },
  audit_trail: {
    enabled: true,
    immutable: true,
    retention_days: 2555,
    encryption_at_rest: true,
    encryption_in_transit: true,
    access_logging: true,
    tamper_detection: true
  }
}

// Create a new compliance status
export const createComplianceStatus = (overrides: Partial<ComplianceStatus> = {}): ComplianceStatus => {
  const now = new Date().toISOString()
  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + 30)

  return validateComplianceStatus({
    id: crypto.randomUUID(),
    name: 'NeonPro Healthcare Compliance Status',
    version: '1.0.0',
    status: 'compliant',
    overall_score: 95,
    metrics: {
      overall_score: 95,
      framework_scores: {
        lgpd: 95,
        anvisa: 90,
        cfm: 98,
        hipaa: 85,
        gdpr: 88
      },
      checks_passed: 45,
      checks_failed: 2,
      total_checks: 47,
      critical_issues: 0,
      high_issues: 1,
      medium_issues: 1,
      low_issues: 0,
      last_audit: now,
      next_audit: nextReview.toISOString(),
      audit_frequency_days: 30,
      compliance_trend: 'improving'
    },
    healthcare: DEFAULT_COMPLIANCE_STATUS,
    checks: [],
    last_updated: now,
    next_review: nextReview.toISOString(),
    review_frequency_days: 30,
    responsible_party: 'Compliance Officer',
    contact_email: 'compliance@neonpro.com.br',
    escalation_contacts: ['dpo@neonpro.com.br', 'legal@neonpro.com.br'],
    metadata: {
      created_at: now,
      updated_at: now,
      created_by: 'system',
      tags: ['compliance', 'healthcare', 'lgpd', 'anvisa', 'cfm'],
      version_history: [{
        version: '1.0.0',
        timestamp: now,
        changes: ['Initial compliance status configuration'],
        author: 'system'
      }]
    },
    ...overrides
  })
}

// Update compliance status
export const updateComplianceStatus = (
  status: ComplianceStatus,
  updates: Partial<ComplianceStatus>
): ComplianceStatus => {
  // Ensure we get a fresh timestamp that's always different
  const now = new Date()
  // Add milliseconds to ensure uniqueness if timestamps are the same
  now.setMilliseconds(now.getMilliseconds() + 1)

  return validateComplianceStatus({
    ...status,
    ...updates,
    metadata: {
      ...status.metadata,
      updated_at: now.toISOString()
    },
    last_updated: now.toISOString()
  })
}

// Add compliance check result
export const addComplianceCheck = (
  status: ComplianceStatus,
  check: Omit<ComplianceCheckResult, 'id'>
): ComplianceStatus => {
  const newCheck: ComplianceCheckResult = {
    id: crypto.randomUUID(),
    ...check
  }

  const updatedChecks = [...status.checks, newCheck]

  // Recalculate metrics based on new check
  const criticalIssues = updatedChecks.filter(c => c.severity === 'critical').length
  const highIssues = updatedChecks.filter(c => c.severity === 'high').length
  const mediumIssues = updatedChecks.filter(c => c.severity === 'medium').length
  const lowIssues = updatedChecks.filter(c => c.severity === 'low').length

  const checksPassed = updatedChecks.filter(c => c.status === 'compliant').length
  const checksFailed = updatedChecks.filter(c => c.status !== 'compliant').length

  // Calculate new overall score
  const totalScore = updatedChecks.reduce((sum, check) => sum + check.score, 0)
  const averageScore = updatedChecks.length > 0 ? totalScore / updatedChecks.length : 100

  return updateComplianceStatus(status, {
    checks: updatedChecks,
    overall_score: Math.round(averageScore),
    metrics: {
      ...status.metrics,
      overall_score: Math.round(averageScore),
      checks_passed: checksPassed,
      checks_failed: checksFailed,
      total_checks: updatedChecks.length,
      critical_issues: criticalIssues,
      high_issues: highIssues,
      medium_issues: mediumIssues,
      low_issues: lowIssues
    }
  })
}

// Validate compliance status
export const validateComplianceStatus = (status: unknown): ComplianceStatus => {
  return ComplianceStatusSchema.parse(status)
}

// Check if compliance status is valid
export const isValidComplianceStatus = (status: unknown): boolean => {
  try {
    ComplianceStatusSchema.parse(status)
    return true
  } catch {
    return false
  }
}

// Get compliance summary by framework
export const getComplianceSummaryByFramework = (status: ComplianceStatus) => {
  const frameworkChecks = status.checks.reduce((acc, check) => {
    if (!acc[check.framework]) {
      acc[check.framework] = []
    }
    acc[check.framework].push(check)
    return acc
  }, {} as Record<ComplianceFramework, ComplianceCheckResult[]>)

  const summary: Record<ComplianceFramework, {
    score: number
    status: ComplianceStatusType
    issues: number
    last_checked: string
  }> = {} as any

  Object.entries(frameworkChecks).forEach(([framework, checks]) => {
    const totalScore = checks.reduce((sum, check) => sum + check.score, 0)
    const averageScore = checks.length > 0 ? totalScore / checks.length : 0
    const issues = checks.filter(c => c.status !== 'compliant').length
    const lastChecked = checks.length > 0
      ? checks.sort((a, b) => new Date(b.last_checked).getTime() - new Date(a.last_checked).getTime())[0].last_checked
      : new Date().toISOString()

    let statusType: ComplianceStatusType = 'compliant'
    if (averageScore < 70) statusType = 'non_compliant'
    else if (averageScore < 85) statusType = 'needs_attention'
    else if (averageScore < 95) statusType = 'under_review'

    summary[framework as ComplianceFramework] = {
      score: Math.round(averageScore),
      status: statusType,
      issues,
      last_checked: lastChecked
    }
  })

  return summary
}

// Get compliance issues by severity
export const getComplianceIssuesBySeverity = (status: ComplianceStatus) => {
  return status.checks.reduce((acc, check) => {
    if (check.status !== 'compliant') {
      if (!acc[check.severity]) {
        acc[check.severity] = []
      }
      acc[check.severity].push(check)
    }
    return acc
  }, {} as Record<ComplianceSeverity, ComplianceCheckResult[]>)
}

// Check if compliance review is needed
export const isComplianceReviewNeeded = (status: ComplianceStatus): boolean => {
  const now = new Date()
  const nextReview = new Date(status.next_review)
  return now >= nextReview
}

// Get upcoming compliance tasks
export const getUpcomingComplianceTasks = (status: ComplianceStatus, daysAhead: number = 7) => {
  const now = new Date()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() + daysAhead)

  return status.checks
    .filter(check => {
      const nextCheck = new Date(check.next_check)
      return nextCheck >= now && nextCheck <= cutoff
    })
    .sort((a, b) => new Date(a.next_check).getTime() - new Date(b.next_check).getTime())
}

// Export schemas for external use
export {
  ComplianceStatusSchema,
  ComplianceCheckResultSchema,
  ComplianceMetricsSchema,
  HealthcareComplianceSchema
}
