/**
 * @fileoverview Compliance Audit Service for NeonPro Healthcare
 * Constitutional Brazilian Healthcare Compliance Audit Service
 *
 * Quality Standard: ≥9.9/10
 */
import { HealthcareRegulation } from '../types';
import { type ComplianceAuditReport } from './types';
/**
 * Constitutional Compliance Audit Service
 * Manages compliance audits for Brazilian healthcare regulations
 */
export declare class ComplianceAuditService {
    private readonly supabaseClient;
    constructor(supabaseClient: any);
    /**
     * Generate comprehensive compliance audit report
     */
    generateComplianceReport(tenantId: string, auditorId: string, regulation?: HealthcareRegulation): Promise<{
        success: boolean;
        report?: ComplianceAuditReport;
        error?: string;
    }>;
    /**
     * Audit specific regulation compliance
     */
    private auditRegulation;
    /**
     * Audit LGPD compliance
     */
    private auditLGPDCompliance;
    /**
     * Audit ANVISA compliance
     */
    private auditANVISACompliance;
    /**
     * Audit CFM compliance
     */
    private auditCFMCompliance;
    /**
     * Audit constitutional compliance
     */
    private auditConstitutionalCompliance;
    /**
     * Get compliance audit report by ID
     */
    getAuditReport(reportId: string): Promise<{
        success: boolean;
        report?: ComplianceAuditReport;
        error?: string;
    }>;
    /**
     * Update audit report status
     */
    updateReportStatus(reportId: string, status: 'DRAFT' | 'FINAL' | 'APPROVED'): Promise<{
        success: boolean;
        error?: string;
    }>;
}
