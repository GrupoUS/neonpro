/**
 * Row Level Security (RLS) Policy Validator for NeonPro Healthcare
 * Ensures LGPD/ANVISA/CFM compliance through proper data isolation
 * Validates clinic-level data segregation and professional access controls
 */

import { createAdminClient, } from './client'
// Removed unused Database type import

// RLS validation result types
export interface RLSValidationResult {
  status: 'compliant' | 'non_compliant' | 'error'
  timestamp: string
  tables: TableRLSStatus[]
  summary: {
    totalTables: number
    compliantTables: number
    nonCompliantTables: number
    errorTables: number
  }
  recommendations: string[]
}

export interface TableRLSStatus {
  tableName: string
  rlsEnabled: boolean
  policies: PolicyInfo[]
  complianceStatus: 'compliant' | 'non_compliant' | 'error'
  issues: string[]
}

export interface PolicyInfo {
  policyName: string
  command: string
  roles: string[]
  expression: string
  isHealthcareCompliant: boolean
}

// Critical healthcare tables that MUST have RLS enabled
const CRITICAL_HEALTHCARE_TABLES = [
  'patients',
  'appointments',
  'medical_records',
  'professionals',
  'audit_logs',
  'compliance_tracking',
  'consent_records',
  'treatments',
  'payments',
  'clinic_settings',
] as const

/**
 * Comprehensive RLS validation for healthcare compliance
 */
export async function validateRLSPolicies(): Promise<RLSValidationResult> {
  const result: RLSValidationResult = {
    status: 'compliant',
    timestamp: new Date().toISOString(),
    tables: [],
    summary: {
      totalTables: 0,
      compliantTables: 0,
      nonCompliantTables: 0,
      errorTables: 0,
    },
    recommendations: [],
  }

  try {
    const adminClient = createAdminClient()

    // Validate each critical table
    for (const tableName of CRITICAL_HEALTHCARE_TABLES) {
      const tableStatus = await validateTableRLS(adminClient, tableName,)
      result.tables.push(tableStatus,)

      // Update summary
      result.summary.totalTables++
      switch (tableStatus.complianceStatus) {
        case 'compliant':
          result.summary.compliantTables++
          break
        case 'non_compliant':
          result.summary.nonCompliantTables++
          break
        case 'error':
          result.summary.errorTables++
          break
      }
    }

    // Generate recommendations
    result.recommendations = generateRecommendations(result.tables,)

    // Determine overall status
    result.status = result.summary.nonCompliantTables > 0 || result.summary.errorTables > 0
      ? 'non_compliant'
      : 'compliant'
  } catch (error) {
    result.status = 'error'
    result.recommendations.push(
      `Critical error during RLS validation: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    )
  }

  return result
}

/**
 * Validate RLS for a specific table
 */
async function validateTableRLS(
  adminClient: ReturnType<typeof createAdminClient>,
  tableName: string,
): Promise<TableRLSStatus> {
  const tableStatus: TableRLSStatus = {
    tableName,
    rlsEnabled: false,
    policies: [],
    complianceStatus: 'error',
    issues: [],
  }

  try {
    // Check if RLS is enabled
    const { data: rlsInfo, error, } = await (adminClient as any)
      .rpc('check_table_rls', { table_name: tableName, },)

    if (error) {
      tableStatus.issues.push(`Failed to check RLS status: ${error.message}`,)
      return tableStatus
    }
    tableStatus.rlsEnabled = (rlsInfo as { rls_enabled: boolean } | null)?.rls_enabled || false

    if (!tableStatus.rlsEnabled) {
      tableStatus.issues.push('RLS is not enabled - CRITICAL SECURITY ISSUE',)
      tableStatus.complianceStatus = 'non_compliant'
      return tableStatus
    }

    // Get policies for the table
    const { data: policiesData, error: policiesError, } =
      await (adminClient as ReturnType<typeof createAdminClient>)
        .rpc(
          'get_table_policies',
          { table_name: tableName, } as any,
        )

    if (policiesError) {
      tableStatus.issues.push(`Failed to retrieve policies: ${policiesError.message}`,)
      return tableStatus
    }

    // Validate each policy
    interface RawPolicy {
      policy_name?: string
      command?: string
      roles?: string[]
      expression?: string
    }
    const policies: RawPolicy[] = Array.isArray(policiesData,) ? (policiesData as RawPolicy[]) : []

    tableStatus.policies = policies.map((policy: RawPolicy,) => ({
      policyName: policy.policy_name ?? '',
      command: policy.command ?? '',
      roles: policy.roles ?? [],
      expression: policy.expression ?? '',
      isHealthcareCompliant: validatePolicyCompliance(policy, tableName,),
    }))

    // Check compliance
    const complianceIssues = checkTableCompliance(tableStatus, tableName,)
    tableStatus.issues.push(...complianceIssues,)

    tableStatus.complianceStatus = tableStatus.issues.length === 0 ? 'compliant' : 'non_compliant'
  } catch (error) {
    tableStatus.issues.push(
      `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
    tableStatus.complianceStatus = 'error'
  }

  return tableStatus
}

/**
 * Validate if a policy meets healthcare compliance requirements
 */
function validatePolicyCompliance(policy: { expression?: string }, tableName: string,): boolean {
  const expression = (policy.expression ?? '').toLowerCase()

  // Healthcare tables should have clinic-based isolation
  const hasClinicIsolation = expression.includes('clinic_id',)
    || expression.includes('auth.uid()',)
    || expression.includes('professional_patient_access',)

  // Check for proper authentication requirements
  const hasAuthCheck = expression.includes('auth.uid()',)
    || expression.includes('auth.role()',)

  // Patient data tables need stricter controls
  if (['patients', 'medical_records', 'treatments',].includes(tableName,)) {
    return hasClinicIsolation && hasAuthCheck
  }

  // Other healthcare tables need at least authentication
  return hasAuthCheck
}

/**
 * Check table-specific compliance requirements
 */
function checkTableCompliance(tableStatus: TableRLSStatus, tableName: string,): string[] {
  const issues: string[] = []

  // Check for required policies
  const hasSelectPolicy = tableStatus.policies.some(p => p.command === 'SELECT')
  const hasInsertPolicy = tableStatus.policies.some(p => p.command === 'INSERT')
  const hasUpdatePolicy = tableStatus.policies.some(p => p.command === 'UPDATE')
  const hasDeletePolicy = tableStatus.policies.some(p => p.command === 'DELETE')

  if (!hasSelectPolicy) {
    issues.push('Missing SELECT policy - users cannot read data',)
  }

  if (!hasInsertPolicy) {
    issues.push('Missing INSERT policy - users cannot create records',)
  }

  if (!hasUpdatePolicy) {
    issues.push('Missing UPDATE policy - users cannot modify records',)
  }

  // Delete policies are optional for some tables but required for others
  if (['audit_logs', 'compliance_tracking',].includes(tableName,) && hasDeletePolicy) {
    issues.push('DELETE policy should not exist for audit tables',)
  }

  // Check for healthcare-compliant policies
  const nonCompliantPolicies = tableStatus.policies.filter(p => !p.isHealthcareCompliant)
  if (nonCompliantPolicies.length > 0) {
    issues.push(
      `Non-compliant policies: ${nonCompliantPolicies.map(p => p.policyName).join(', ',)}`,
    )
  }

  // Patient data tables need extra validation
  if (['patients', 'medical_records',].includes(tableName,)) {
    const hasPatientAccessControl = tableStatus.policies.some(p =>
      p.expression.includes('professional_patient_access',)
      || p.expression.includes('patient_id = auth.uid()',)
    )

    if (!hasPatientAccessControl) {
      issues.push('Missing patient-specific access control',)
    }
  }

  return issues
}

/**
 * Generate recommendations based on validation results
 */
function generateRecommendations(tables: TableRLSStatus[],): string[] {
  const recommendations: string[] = []

  const tablesWithoutRLS = tables.filter(t => !t.rlsEnabled)
  if (tablesWithoutRLS.length > 0) {
    recommendations.push(
      `CRITICAL: Enable RLS on tables: ${tablesWithoutRLS.map(t => t.tableName).join(', ',)}`,
    )
  }

  const tablesWithIssues = tables.filter(t => t.issues.length > 0)
  if (tablesWithIssues.length > 0) {
    recommendations.push(
      `Review and fix policy issues on: ${tablesWithIssues.map(t => t.tableName).join(', ',)}`,
    )
  }

  // Healthcare-specific recommendations
  recommendations.push(
    'Ensure all policies implement clinic-level data isolation',
    'Verify professional license validation in access policies',
    'Implement emergency access procedures for critical patient data',
    'Regular audit of RLS policies for LGPD compliance',
  )

  return recommendations
}

/**
 * Quick RLS check for API health endpoints
 */
export async function quickRLSCheck(): Promise<{ status: string; criticalTablesSecured: number }> {
  try {
    const adminClient = createAdminClient()

    let securedCount = 0

    for (const tableName of CRITICAL_HEALTHCARE_TABLES.slice(0, 5,)) { // Check first 5 for speed
      try {
        const { data, } = await (adminClient as any).rpc(
          'check_table_rls',
          {
            table_name: tableName,
          },
        )
        const rlsInfo = data as { rls_enabled: boolean } | null
        if (rlsInfo?.rls_enabled) {
          securedCount++
        }
      } catch {
        // Skip failed checks in quick mode
      }
    }

    return {
      status: securedCount >= 4 ? 'secure' : 'insecure',
      criticalTablesSecured: securedCount,
    }
  } catch {
    return {
      status: 'error',
      criticalTablesSecured: 0,
    }
  }
}
