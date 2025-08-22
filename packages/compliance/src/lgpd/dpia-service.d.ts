/**
 * @fileoverview DPIA (Data Protection Impact Assessment) Service
 * Automated LGPD Article 38 compliance for healthcare systems
 *
 * Constitutional Healthcare Principle: Patient Privacy First
 * Quality Standard: ≥9.9/10
 */
import { z } from 'zod';
import type { ConstitutionalResponse, DPIAAssessment } from '../types';
import { LGPDLegalBasis, PatientDataClassification } from '../types';
/**
 * DPIA Assessment Input Schema
 */
export declare const DPIAInputSchema: z.ZodObject<{
    processName: z.ZodString;
    description: z.ZodString;
    dataTypes: z.ZodArray<z.ZodNativeEnum<typeof PatientDataClassification>, "many">;
    legalBasis: z.ZodArray<z.ZodNativeEnum<typeof LGPDLegalBasis>, "many">;
    processingPurpose: z.ZodString;
    dataSubjects: z.ZodObject<{
        patients: z.ZodDefault<z.ZodBoolean>;
        minors: z.ZodDefault<z.ZodBoolean>;
        vulnerableGroups: z.ZodDefault<z.ZodBoolean>;
        employees: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        patients: boolean;
        minors: boolean;
        vulnerableGroups: boolean;
        employees: boolean;
    }, {
        patients?: boolean | undefined;
        minors?: boolean | undefined;
        vulnerableGroups?: boolean | undefined;
        employees?: boolean | undefined;
    }>;
    dataProcessing: z.ZodObject<{
        collection: z.ZodDefault<z.ZodBoolean>;
        storage: z.ZodDefault<z.ZodBoolean>;
        analysis: z.ZodDefault<z.ZodBoolean>;
        sharing: z.ZodDefault<z.ZodBoolean>;
        transfer: z.ZodDefault<z.ZodBoolean>;
        deletion: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        collection: boolean;
        storage: boolean;
        analysis: boolean;
        sharing: boolean;
        transfer: boolean;
        deletion: boolean;
    }, {
        collection?: boolean | undefined;
        storage?: boolean | undefined;
        analysis?: boolean | undefined;
        sharing?: boolean | undefined;
        transfer?: boolean | undefined;
        deletion?: boolean | undefined;
    }>;
    technologyUsed: z.ZodArray<z.ZodString, "many">;
    retentionPeriod: z.ZodNumber;
    tenantId: z.ZodString;
    assessorId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    description: string;
    tenantId: string;
    legalBasis: LGPDLegalBasis[];
    processName: string;
    dataTypes: PatientDataClassification[];
    retentionPeriod: number;
    processingPurpose: string;
    dataSubjects: {
        patients: boolean;
        minors: boolean;
        vulnerableGroups: boolean;
        employees: boolean;
    };
    dataProcessing: {
        collection: boolean;
        storage: boolean;
        analysis: boolean;
        sharing: boolean;
        transfer: boolean;
        deletion: boolean;
    };
    technologyUsed: string[];
    assessorId: string;
}, {
    description: string;
    tenantId: string;
    legalBasis: LGPDLegalBasis[];
    processName: string;
    dataTypes: PatientDataClassification[];
    retentionPeriod: number;
    processingPurpose: string;
    dataSubjects: {
        patients?: boolean | undefined;
        minors?: boolean | undefined;
        vulnerableGroups?: boolean | undefined;
        employees?: boolean | undefined;
    };
    dataProcessing: {
        collection?: boolean | undefined;
        storage?: boolean | undefined;
        analysis?: boolean | undefined;
        sharing?: boolean | undefined;
        transfer?: boolean | undefined;
        deletion?: boolean | undefined;
    };
    technologyUsed: string[];
    assessorId: string;
}>;
export type DPIAInput = z.infer<typeof DPIAInputSchema>;
/**
 * DPIA Service for Constitutional Healthcare Compliance
 */
export declare class DPIAService {
    private readonly constitutionalQualityStandard;
    /**
     * Automated DPIA Assessment
     * Implements LGPD Art. 38 requirements with constitutional healthcare validation
     */
    conductDPIA(input: DPIAInput): Promise<ConstitutionalResponse<DPIAAssessment>>; /**
     * Assess if DPIA is required according to LGPD Art. 38
     */
    private assessDPIARequirement;
    /**
     * Conduct comprehensive risk assessment
     */
    private conductRiskAssessment; /**
     * Generate mitigation measures based on risk assessment
     */
    private generateMitigationMeasures;
    /**
     * Calculate constitutional compliance score
     */
    private calculateConstitutionalScore;
    /**
     * Store DPIA assessment in database
     */
    private storeDPIAAssessment;
    /**
     * Create audit event for DPIA activities
     */
    private createAuditEvent;
    /**
     * Get DPIA assessment by ID
     */
    getDPIAAssessment(assessmentId: string, _tenantId: string): Promise<ConstitutionalResponse<DPIAAssessment | null>>;
    /**
     * Review and approve DPIA assessment
     */
    reviewDPIAAssessment(assessmentId: string, reviewerId: string, approved: boolean, comments?: string): Promise<ConstitutionalResponse<DPIAAssessment>>;
}
