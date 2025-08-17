/**
 * @fileoverview Audit Services for NeonPro Healthcare Compliance
 * Constitutional Brazilian Healthcare Audit Framework
 *
 * Quality Standard: ≥9.9/10
 */

export * from './audit-service';
// Re-export for convenience
export { AuditService } from './audit-service';
export * from './compliance-audit';
export { ComplianceAuditService } from './compliance-audit';
export type {
  AuditConfig,
  AuditEvent,
  AuditFilters,
  AuditLog,
  ComplianceAuditReport,
} from './types';
export * from './types';

/**
 * Audit Service Factory
 * Constitutional service initialization with Supabase integration
 */
export function createAuditServices(supabaseClient: any) {
  return {
    audit: new AuditService(supabaseClient),
    complianceAudit: new ComplianceAuditService(supabaseClient),
  };
}

/**
 * Constitutional Audit Compliance Validator
 * Validates overall audit compliance for healthcare operations
 */
export async function validateAuditCompliance(
  tenantId: string,
  supabaseClient: any
): Promise<{
  isCompliant: boolean;
  score: number;
  violations: string[];
  recommendations: string[];
}> {
  try {
    const auditService = new AuditService(supabaseClient);
    const complianceAuditService = new ComplianceAuditService(supabaseClient);

    // Validate audit trail completeness
    const auditTrailCompliance = await auditService.validateAuditTrail(tenantId);

    // Validate compliance audit requirements
    const complianceAuditReport = await complianceAuditService.generateComplianceReport(tenantId);

    const violations: string[] = [];
    const recommendations: string[] = [];
    let score = 10;

    // Check audit trail completeness
    if (!auditTrailCompliance.isComplete) {
      violations.push('Incomplete audit trail detected');
      recommendations.push('Ensure all healthcare operations are properly logged');
      score -= 2;
    }

    // Check compliance audit frequency
    if (
      complianceAuditReport.lastAuditDate &&
      Date.now() - complianceAuditReport.lastAuditDate.getTime() > 30 * 24 * 60 * 60 * 1000
    ) {
      violations.push('Compliance audit overdue (>30 days)');
      recommendations.push('Schedule regular compliance audits');
      score -= 1;
    }

    return {
      isCompliant: violations.length === 0 && score >= 9.9,
      score: Math.max(0, score),
      violations,
      recommendations,
    };
  } catch (_error) {
    return {
      isCompliant: false,
      score: 0,
      violations: ['Audit compliance validation system failure'],
      recommendations: ['Contact system administrator to resolve audit validation issues'],
    };
  }
}
