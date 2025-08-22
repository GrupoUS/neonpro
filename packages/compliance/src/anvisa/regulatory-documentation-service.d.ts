/**
 * ANVISA Regulatory Documentation Service
 * Constitutional healthcare compliance for automated regulatory documentation
 *
 * @fileoverview Automated ANVISA regulatory documentation generation and management
 * @version 1.0.0
 * @since 2025-01-17
 */
type Database = any;
import type { createClient } from '@supabase/supabase-js';
/**
 * ANVISA Regulatory Document Interface
 * Constitutional documentation standards for regulatory compliance
 */
export type RegulatoryDocument = {
    /** Unique document identifier */
    document_id: string;
    /** Type of regulatory document */
    document_type: 'compliance_report' | 'adverse_event_report' | 'inspection_response' | 'renewal_application' | 'safety_assessment';
    /** Document title (constitutional requirement) */
    title: string;
    /** Generated document content */
    generated_content: string;
    /** ANVISA regulatory references cited */
    regulatory_references: string[];
    /** Constitutional compliance score ≥9.9/10 */
    compliance_score: number;
    /** Constitutional validation status */
    constitutional_validation: boolean;
    /** Associated tenant/clinic */
    tenant_id: string;
    /** Document status */
    status: 'draft' | 'under_review' | 'approved' | 'submitted_to_anvisa' | 'rejected';
    /** Creation metadata */
    created_by: string;
    created_at: Date;
    updated_at: Date;
    /** Constitutional audit trail */
    audit_trail: DocumentAudit[];
}; /**
 * Document Audit Trail
 * Constitutional audit requirements for document changes
 */
export type DocumentAudit = {
    /** Audit entry unique identifier */
    audit_id: string;
    /** Document ID being audited */
    document_id: string;
    /** Action performed on document */
    action: 'created' | 'updated' | 'reviewed' | 'approved' | 'submitted' | 'rejected';
    /** Previous document state */
    previous_state: Partial<RegulatoryDocument>;
    /** New document state */
    new_state: Partial<RegulatoryDocument>;
    /** User who performed the action */
    user_id: string;
    /** Constitutional timestamp */
    timestamp: Date;
    /** Reason for change (constitutional requirement) */
    reason: string;
    /** Reviewer comments (if applicable) */
    reviewer_comments?: string;
};
/**
 * Document Generation Parameters
 * Constitutional parameters for automated document generation
 */
export type DocumentGenerationParams = {
    /** Type of document to generate */
    document_type: RegulatoryDocument['document_type'];
    /** Template parameters for generation */
    template_params: Record<string, any>;
    /** Source data for document content */
    source_data: {
        /** Product registrations data */
        products?: any[];
        /** Adverse events data */
        adverse_events?: any[];
        /** Inspection data */
        inspection_data?: any;
        /** Safety assessments */
        safety_assessments?: any[];
    };
    /** Constitutional compliance requirements */
    compliance_requirements: string[];
    /** Target audience (ANVISA, internal, clinic) */
    target_audience: 'anvisa' | 'internal' | 'clinic_management';
}; /**
 * ANVISA Regulatory Documentation Service Implementation
 * Constitutional healthcare compliance with automated document generation ≥9.9/10
 */
export declare class RegulatoryDocumentationService {
    private readonly supabase;
    constructor(supabaseClient: ReturnType<typeof createClient<Database>>);
    /**
     * Generate regulatory document with constitutional compliance
     * Automated ANVISA documentation with ≥9.9/10 quality standards
     */
    generateDocument(params: DocumentGenerationParams, tenantId: string, userId: string): Promise<{
        success: boolean;
        data?: RegulatoryDocument;
        error?: string;
    }>; /**
     * Generate document content based on type and parameters
     * Constitutional ANVISA documentation standards
     */
    private generateDocumentContent;
    /**
     * Generate compliance report content
     * Constitutional healthcare compliance reporting
     */
    private generateComplianceReportContent; /**
     * Generate adverse event report content
     * Constitutional patient safety reporting
     */
    private generateAdverseEventReportContent;
    /**
     * Constitutional validation of generation parameters
     * ANVISA compliance with healthcare standards ≥9.9/10
     */
    private validateGenerationParams; /**
     * Calculate constitutional compliance score for generated document
     * Healthcare quality standards ≥9.9/10
     */
    private calculateComplianceScore;
    /**
     * Extract ANVISA regulatory references for document type
     * Constitutional regulatory compliance
     */
    private extractRegulatoryReferences; /**
     * Get required regulatory references for document type
     * Constitutional reference validation
     */
    private getRequiredReferences;
    /**
     * Generate document title based on type and parameters
     * Constitutional documentation standards
     */
    private generateDocumentTitle;
    /**
     * Format products section for compliance reports
     * Constitutional product documentation
     */
    private formatProductsSection;
    /**
     * Format adverse events section
     * Constitutional patient safety documentation
     */
    private formatAdverseEventsSection;
    /**
     * Generate corrective measures based on adverse events
     * Constitutional safety measures documentation
     */
    private generateCorrectiveMeasures; /**
     * Generate inspection response content
     * Constitutional response to ANVISA inspections
     */
    private generateInspectionResponseContent;
    /**
     * Generate renewal application content
     * Constitutional product registration renewal
     */
    private generateRenewalApplicationContent;
    /**
     * Generate safety assessment content
     * Constitutional product safety evaluation
     */
    private generateSafetyAssessmentContent; /**
     * Update regulatory document with constitutional audit trail
     * ANVISA compliance with change tracking
     */
    updateDocument(documentId: string, updates: Partial<RegulatoryDocument>, userId: string, reason: string): Promise<{
        success: boolean;
        data?: RegulatoryDocument;
        error?: string;
    }>;
    /**
     * Get regulatory documents with constitutional filtering
     * LGPD compliant with tenant isolation
     */
    getDocuments(tenantId: string, filters?: {
        document_type?: RegulatoryDocument['document_type'];
        status?: RegulatoryDocument['status'];
        created_after?: Date;
        created_before?: Date;
    }): Promise<{
        success: boolean;
        data?: RegulatoryDocument[];
        error?: string;
    }>; /**
     * Submit document to ANVISA for regulatory review
     * Constitutional submission process with audit trail
     */
    submitToAnvisa(documentId: string, userId: string): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    private formatInspectionItems;
    private generateCorrectiveActionPlan;
    private generateImplementationSchedule;
    private formatProductsForRenewal;
    private formatSafetyAssessmentProducts;
    /**
     * Generate regulatory recommendations
     */
    private generateRecommendations;
}
export default RegulatoryDocumentationService;
