/**
 * Compliance Status Model
 * Hybrid Architecture: Bun + Vercel Edge + Supabase Functions
 * Healthcare Compliance: LGPD, ANVISA, CFM
 */

import { z } from 'zod'

// Compliance Framework Schema
export const ComplianceFrameworkSchema = z.enum(['LGPD', 'ANVISA', 'CFM', 'HIPAA', 'GDPR'])

// Compliance Check Type Schema
export const ComplianceCheckTypeSchema = z.enum([
  'audit_trail',
  'documentation',
  'risk_assessment',
  'data_protection',
  'access_control',
  'encryption',
  'backup',
  'training',
])

// Compliance Status Type Schema
export const ComplianceStatusTypeSchema = z.enum([
  'compliant',
  'non_compliant',
  'in_progress',
  'not_applicable',
])

// Compliance Severity Schema
export const ComplianceSeveritySchema = z.enum([
  'low',
  'medium',
  'high',
  'critical',
])

// Compliance Check Schema
export const ComplianceCheckSchema = z.object({
  id: z.string().uuid(),
  checkType: ComplianceCheckTypeSchema,
  framework: ComplianceFrameworkSchema,
  status: ComplianceStatusTypeSchema,
  severity: ComplianceSeveritySchema,
  score: z.number().min(0).max(100, 'Score must be between 0 and 100'),
  lastChecked: z.date(),
  nextCheck: z.date(),
  issuesFound: z.number().min(0, 'Issues found must be non-negative'),
  issuesResolved: z.number().min(0, 'Issues resolved must be non-negative'),
  description: z.string(),
  recommendations: z.array(z.string()),
  tags: z.array(z.string()).optional(),
  assignee: z.string().optional(),
})

// Compliance Framework Status Schema
export const ComplianceFrameworkStatusSchema = z.object({
  framework: ComplianceFrameworkSchema,
  compliant: z.boolean(),
  lastAudit: z.date(),
  nextAudit: z.date(),
  score: z.number().min(0).max(100, 'Score must be between 0 and 100'),
  checks: z.array(ComplianceCheckSchema),
  issues: z.array(z.object({
    id: z.string().uuid(),
    regulation: ComplianceFrameworkSchema,
    requirement: z.string(),
    description: z.string(),
    severity: ComplianceSeveritySchema,
    status: z.enum(['open', 'in-progress', 'resolved', 'closed']),
    createdAt: z.date(),
    resolvedAt: z.date().optional(),
  })),
})

// WCAG Compliance Schema
export const WCAGComplianceSchema = z.object({
  level: z.enum(['2.1 AA+', '2.1 AAA']),
  compliant: z.boolean(),
  lastAudit: z.date(),
  score: z.number().min(0).max(100, 'Score must be between 0 and 100'),
  checks: z.array(ComplianceCheckSchema),
  issues: z.array(z.object({
    id: z.string().uuid(),
    guideline: z.string(),
    description: z.string(),
    severity: ComplianceSeveritySchema,
    status: z.enum(['open', 'in-progress', 'resolved', 'closed']),
    createdAt: z.date(),
    resolvedAt: z.date().optional(),
  })),
})

// Compliance Status Schema
export const ComplianceStatusSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  environment: z.enum(['development', 'staging', 'production']),
  lgpd: ComplianceFrameworkStatusSchema,
  anvisa: ComplianceFrameworkStatusSchema,
  cfm: ComplianceFrameworkStatusSchema,
  wcag: WCAGComplianceSchema,
  overallScore: z.number().min(0).max(100, 'Overall score must be between 0 and 100'),
  lastUpdated: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Compliance Status Update Schema
export const ComplianceStatusUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  lgpd: ComplianceFrameworkStatusSchema.optional(),
  anvisa: ComplianceFrameworkStatusSchema.optional(),
  cfm: ComplianceFrameworkStatusSchema.optional(),
  wcag: WCAGComplianceSchema.optional(),
})

// Types
export type ComplianceFramework = z.infer<typeof ComplianceFrameworkSchema>
export type ComplianceCheckType = z.infer<typeof ComplianceCheckTypeSchema>
export type ComplianceStatusType = z.infer<typeof ComplianceStatusTypeSchema>
export type ComplianceSeverity = z.infer<typeof ComplianceSeveritySchema>
export type ComplianceCheck = z.infer<typeof ComplianceCheckSchema>
export type ComplianceFrameworkStatus = z.infer<typeof ComplianceFrameworkStatusSchema>
export type WCAGCompliance = z.infer<typeof WCAGComplianceSchema>
export type ComplianceStatus = z.infer<typeof ComplianceStatusSchema>
export type ComplianceStatusUpdate = z.infer<typeof ComplianceStatusUpdateSchema>

// Default values
export const defaultComplianceCheck: Omit<ComplianceCheck, 'id' | 'lastChecked' | 'nextCheck'> = {
  checkType: 'audit_trail',
  framework: 'LGPD',
  status: 'compliant',
  severity: 'low',
  score: 100,
  issuesFound: 0,
  issuesResolved: 0,
  description: 'No issues found',
  recommendations: [],
  tags: [],
  assignee: undefined,
}

export const defaultComplianceFrameworkStatus: Omit<ComplianceFrameworkStatus, 'framework'> = {
  compliant: true,
  lastAudit: new Date(),
  nextAudit: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
  score: 100,
  checks: [],
  issues: [],
}

export const defaultWCAGCompliance: Omit<WCAGCompliance, 'level'> = {
  compliant: true,
  lastAudit: new Date(),
  score: 100,
  checks: [],
  issues: [],
}

export const defaultComplianceStatus: Omit<ComplianceStatus, 'id' | 'name' | 'environment' | 'createdAt' | 'updatedAt'> = {
  lgpd: {
    ...defaultComplianceFrameworkStatus,
    framework: 'LGPD',
  },
  anvisa: {
    ...defaultComplianceFrameworkStatus,
    framework: 'ANVISA',
  },
  cfm: {
    ...defaultComplianceFrameworkStatus,
    framework: 'CFM',
  },
  wcag: {
    ...defaultWCAGCompliance,
    level: '2.1 AA+',
  },
  overallScore: 100,
  lastUpdated: new Date(),
}

// Validation functions
export const validateComplianceStatus = (status: unknown): ComplianceStatus => {
  return ComplianceStatusSchema.parse(status)
}

export const validateComplianceStatusUpdate = (update: unknown): ComplianceStatusUpdate => {
  return ComplianceStatusUpdateSchema.parse(update)
}

export const validateComplianceCheck = (check: unknown): ComplianceCheck => {
  return ComplianceCheckSchema.parse(check)
}

export const validateComplianceFrameworkStatus = (status: unknown): ComplianceFrameworkStatus => {
  return ComplianceFrameworkStatusSchema.parse(status)
}

export const validateWCAGCompliance = (compliance: unknown): WCAGCompliance => {
  return WCAGComplianceSchema.parse(compliance)
}

// Healthcare compliance validation
export const validateHealthcareCompliance = (status: ComplianceStatus): boolean => {
  return (
    status.lgpd.compliant &&
    status.anvisa.compliant &&
    status.cfm.compliant &&
    status.wcag.compliant
  )
}

// Calculate overall compliance score
export const calculateOverallComplianceScore = (status: ComplianceStatus): number => {
  const frameworkScores = [
    status.lgpd.score,
    status.anvisa.score,
    status.cfm.score,
    status.wcag.score,
  ]

  return Math.round(frameworkScores.reduce((sum, score) => sum + score, 0) / frameworkScores.length)
}

// Update compliance status
export const updateComplianceStatus = async (
  supabase: any,
  id: string,
  update: ComplianceStatusUpdate
): Promise<ComplianceStatus> => {
  const now = new Date()
  const updatedStatus = {
    ...update,
    updatedAt: now,
    lastUpdated: now,
  }

  // Recalculate overall score if frameworks were updated
  if (update.lgpd || update.anvisa || update.cfm || update.wcag) {
    const currentStatus = await getComplianceStatus(supabase, 'development') // Simplified for now
    if (currentStatus && currentStatus.id === id) {
      const mergedStatus = {
        ...currentStatus,
        ...updatedStatus,
      }

      updatedStatus.overallScore = calculateOverallComplianceScore(mergedStatus as ComplianceStatus)
    }
  }

  const { data, error } = await supabase
    .from('compliance_statuses')
    .update(updatedStatus)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update compliance status: ${error.message}`)
  }

  return validateComplianceStatus(data)
}

// Add compliance check
export const addComplianceCheck = async (
  supabase: any,
  _statusId: string,
  check: Omit<ComplianceCheck, 'id'>
): Promise<ComplianceCheck> => {
  const newCheck = {
    ...check,
    id: crypto.randomUUID(),
  }

  const { data, error } = await supabase
    .from('compliance_checks')
    .insert(newCheck)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to add compliance check: ${error.message}`)
  }

  return validateComplianceCheck(data)
}

// Database operations
export const createComplianceStatus = async (
  supabase: any,
  status: Omit<ComplianceStatus, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ComplianceStatus> => {
  const now = new Date()
  const newStatus = {
    ...status,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    lastUpdated: now,
  }

  const { data, error } = await supabase
    .from('compliance_statuses')
    .insert(newStatus)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create compliance status: ${error.message}`)
  }

  return validateComplianceStatus(data)
}

export const getComplianceStatus = async (
  supabase: any,
  environment: string
): Promise<ComplianceStatus | null> => {
  const { data, error } = await supabase
    .from('compliance_statuses')
    .select('*')
    .eq('environment', environment)
    .order('createdAt', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    throw new Error(`Failed to get compliance status: ${error.message}`)
  }

  return validateComplianceStatus(data)
}

export const deleteComplianceStatus = async (
  supabase: any,
  id: string
): Promise<void> => {
  const { error } = await supabase
    .from('compliance_statuses')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete compliance status: ${error.message}`)
  }
}

// Get compliance checks
export const getComplianceChecks = async (
  supabase: any,
  statusId: string,
  framework?: ComplianceFramework
): Promise<ComplianceCheck[]> => {
  let query = supabase
    .from('compliance_checks')
    .select('*')
    .eq('status_id', statusId)

  if (framework) {
    query = query.eq('framework', framework)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to get compliance checks: ${error.message}`)
  }

  return data.map((check: any) => validateComplianceCheck(check))
}

// Get compliance issues
export const getComplianceIssues = async (
  supabase: any,
  statusId: string,
  framework?: ComplianceFramework,
  severity?: ComplianceSeverity
): Promise<any[]> => {
  let query = supabase
    .from('compliance_issues')
    .select('*')
    .eq('status_id', statusId)

  if (framework) {
    query = query.eq('regulation', framework)
  }

  if (severity) {
    query = query.eq('severity', severity)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to get compliance issues: ${error.message}`)
  }

  return data
}

// Schedule compliance audit
export const scheduleComplianceAudit = async (
  supabase: any,
  statusId: string,
  framework: ComplianceFramework,
  scheduledDate: Date
): Promise<void> => {
  const { error } = await supabase
    .from('compliance_audits')
    .insert({
      status_id: statusId,
      framework,
      scheduled_date: scheduledDate,
      status: 'scheduled',
      created_at: new Date(),
    })

  if (error) {
    throw new Error(`Failed to schedule compliance audit: ${error.message}`)
  }
}

// Get compliance audit history
export const getComplianceAuditHistory = async (
  supabase: any,
  statusId: string,
  framework?: ComplianceFramework
): Promise<any[]> => {
  let query = supabase
    .from('compliance_audits')
    .select('*')
    .eq('status_id', statusId)
    .order('created_at', { ascending: false })

  if (framework) {
    query = query.eq('framework', framework)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to get compliance audit history: ${error.message}`)
  }

  return data
}

// Generate compliance report
export const generateComplianceReport = async (
  supabase: any,
  statusId: string
): Promise<{
  overallScore: number
  frameworkScores: Record<string, number>
  issuesByFramework: Record<string, number>
  issuesBySeverity: Record<string, number>
  upcomingAudits: any[]
  lastAuditDate: Date | null
  nextAuditDate: Date | null
}> => {
  const status = await getComplianceStatus(supabase, 'development') // Simplified for now

  if (!status || status.id !== statusId) {
    throw new Error('Compliance status not found')
  }

  // Get framework scores
  const frameworkScores = {
    LGPD: status.lgpd.score,
    ANVISA: status.anvisa.score,
    CFM: status.cfm.score,
    WCAG: status.wcag.score,
  }

  // Get issues by framework
  const issuesByFramework = {
    LGPD: status.lgpd.issues.length,
    ANVISA: status.anvisa.issues.length,
    CFM: status.cfm.issues.length,
    WCAG: status.wcag.issues.length,
  }

  // Get issues by severity
  const allIssues = [
    ...status.lgpd.issues,
    ...status.anvisa.issues,
    ...status.cfm.issues,
    ...status.wcag.issues,
  ]

  const issuesBySeverity = {
    low: allIssues.filter(issue => issue.severity === 'low').length,
    medium: allIssues.filter(issue => issue.severity === 'medium').length,
    high: allIssues.filter(issue => issue.severity === 'high').length,
    critical: allIssues.filter(issue => issue.severity === 'critical').length,
  }

  // Get upcoming audits
  const upcomingAudits = await getComplianceAuditHistory(supabase, statusId)
    .then(audits => audits.filter(audit => audit.status === 'scheduled'))

  // Get last and next audit dates
  const allFrameworkDates = [
    { lastAudit: status.lgpd.lastAudit, nextAudit: status.lgpd.nextAudit },
    { lastAudit: status.anvisa.lastAudit, nextAudit: status.anvisa.nextAudit },
    { lastAudit: status.cfm.lastAudit, nextAudit: status.cfm.nextAudit },
    { lastAudit: status.wcag.lastAudit, nextAudit: status.wcag.nextAudit },
  ]

  const lastAuditDate = allFrameworkDates
    .map(d => d.lastAudit)
    .filter(date => date !== null)
    .sort((a, b) => b.getTime() - a.getTime())[0] || null

  const nextAuditDate = allFrameworkDates
    .map(d => d.nextAudit)
    .filter(date => date !== null)
    .sort((a, b) => a.getTime() - b.getTime())[0] || null

  return {
    overallScore: status.overallScore,
    frameworkScores,
    issuesByFramework,
    issuesBySeverity,
    upcomingAudits,
    lastAuditDate,
    nextAuditDate,
  }
}
