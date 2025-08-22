/**
 * @fileoverview Audit Services for NeonPro Healthcare Compliance
 * Constitutional Brazilian Healthcare Audit Framework
 *
 * Quality Standard: ≥9.9/10
 */
export * from './audit-service';
export { AuditService } from './audit-service';
export * from './compliance-audit';
export { ComplianceAuditService } from './compliance-audit';
export type { AuditConfig, AuditEvent, AuditFilters, AuditLog, ComplianceAuditReport, } from './types';
export * from './types';
import { AuditService } from './audit-service';
import { ComplianceAuditService } from './compliance-audit';
/**
 * Audit Service Factory
 * Constitutional service initialization with Supabase integration
 */
export declare function createAuditServices(supabaseClient: any): {
    audit: AuditService;
    complianceAudit: ComplianceAuditService;
};
/**
 * Constitutional Audit Compliance Validator
 * Validates overall audit compliance for healthcare operations
 */
export declare function validateAuditCompliance(tenantId: string, supabaseClient: any): Promise<{
    isCompliant: boolean;
    score: number;
    violations: string[];
    recommendations: string[];
}>;
