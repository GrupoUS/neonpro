/**
 * LGPD Report Generator
 * Constitutional compliance reporting with privacy protection
 * Compliance: LGPD + Constitutional Privacy + ≥9.9/10 Standards
 */
import type { Database } from '@neonpro/types';
import { z } from 'zod';
export declare const LGPDReportConfigSchema: z.ZodObject<{
    report_type: z.ZodEnum<["compliance_audit", "data_mapping", "consent_status", "breach_report"]>;
    date_range: z.ZodObject<{
        start_date: z.ZodString;
        end_date: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        start_date: string;
        end_date: string;
    }, {
        start_date: string;
        end_date: string;
    }>;
    include_personal_data: z.ZodDefault<z.ZodBoolean>;
    anonymization_level: z.ZodDefault<z.ZodEnum<["basic", "advanced", "k_anonymity"]>>;
    constitutional_validation: z.ZodDefault<z.ZodBoolean>;
    audit_trail: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    audit_trail: boolean;
    constitutional_validation: boolean;
    report_type: "compliance_audit" | "data_mapping" | "consent_status" | "breach_report";
    date_range: {
        start_date: string;
        end_date: string;
    };
    include_personal_data: boolean;
    anonymization_level: "basic" | "advanced" | "k_anonymity";
}, {
    report_type: "compliance_audit" | "data_mapping" | "consent_status" | "breach_report";
    date_range: {
        start_date: string;
        end_date: string;
    };
    audit_trail?: boolean | undefined;
    constitutional_validation?: boolean | undefined;
    include_personal_data?: boolean | undefined;
    anonymization_level?: "basic" | "advanced" | "k_anonymity" | undefined;
}>;
export declare const LGPDReportSchema: z.ZodObject<{
    report_id: z.ZodString;
    report_type: z.ZodString;
    generated_at: z.ZodString;
    date_range: z.ZodObject<{
        start_date: z.ZodString;
        end_date: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        start_date: string;
        end_date: string;
    }, {
        start_date: string;
        end_date: string;
    }>;
    summary: z.ZodObject<{
        total_data_subjects: z.ZodNumber;
        total_processing_activities: z.ZodNumber;
        consent_compliance_rate: z.ZodNumber;
        constitutional_compliance_score: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        total_data_subjects: number;
        total_processing_activities: number;
        consent_compliance_rate: number;
        constitutional_compliance_score: number;
    }, {
        total_data_subjects: number;
        total_processing_activities: number;
        consent_compliance_rate: number;
        constitutional_compliance_score: number;
    }>;
    findings: z.ZodArray<z.ZodObject<{
        category: z.ZodString;
        description: z.ZodString;
        severity: z.ZodEnum<["low", "medium", "high", "critical"]>;
        recommendation: z.ZodString;
        constitutional_impact: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        severity: "low" | "medium" | "high" | "critical";
        constitutional_impact: boolean;
        category: string;
        description: string;
        recommendation: string;
    }, {
        severity: "low" | "medium" | "high" | "critical";
        constitutional_impact: boolean;
        category: string;
        description: string;
        recommendation: string;
    }>, "many">;
    constitutional_validation: z.ZodObject<{
        privacy_rights_protected: z.ZodBoolean;
        data_minimization_applied: z.ZodBoolean;
        purpose_limitation_respected: z.ZodBoolean;
        transparency_maintained: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        privacy_rights_protected: boolean;
        data_minimization_applied: boolean;
        purpose_limitation_respected: boolean;
        transparency_maintained: boolean;
    }, {
        privacy_rights_protected: boolean;
        data_minimization_applied: boolean;
        purpose_limitation_respected: boolean;
        transparency_maintained: boolean;
    }>;
    audit_trail: z.ZodObject<{
        generated_by: z.ZodString;
        validation_steps: z.ZodArray<z.ZodString, "many">;
        quality_score: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        quality_score: number;
        generated_by: string;
        validation_steps: string[];
    }, {
        quality_score: number;
        generated_by: string;
        validation_steps: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    audit_trail: {
        quality_score: number;
        generated_by: string;
        validation_steps: string[];
    };
    constitutional_validation: {
        privacy_rights_protected: boolean;
        data_minimization_applied: boolean;
        purpose_limitation_respected: boolean;
        transparency_maintained: boolean;
    };
    report_id: string;
    report_type: string;
    date_range: {
        start_date: string;
        end_date: string;
    };
    generated_at: string;
    summary: {
        total_data_subjects: number;
        total_processing_activities: number;
        consent_compliance_rate: number;
        constitutional_compliance_score: number;
    };
    findings: {
        severity: "low" | "medium" | "high" | "critical";
        constitutional_impact: boolean;
        category: string;
        description: string;
        recommendation: string;
    }[];
}, {
    audit_trail: {
        quality_score: number;
        generated_by: string;
        validation_steps: string[];
    };
    constitutional_validation: {
        privacy_rights_protected: boolean;
        data_minimization_applied: boolean;
        purpose_limitation_respected: boolean;
        transparency_maintained: boolean;
    };
    report_id: string;
    report_type: string;
    date_range: {
        start_date: string;
        end_date: string;
    };
    generated_at: string;
    summary: {
        total_data_subjects: number;
        total_processing_activities: number;
        consent_compliance_rate: number;
        constitutional_compliance_score: number;
    };
    findings: {
        severity: "low" | "medium" | "high" | "critical";
        constitutional_impact: boolean;
        category: string;
        description: string;
        recommendation: string;
    }[];
}>;
export type LGPDReportConfig = z.infer<typeof LGPDReportConfigSchema>;
export type LGPDReport = z.infer<typeof LGPDReportSchema>;
/**
 * LGPD Report Generator Service
 * Generates constitutional compliance reports with privacy protection
 */
export declare class LGPDReportGenerator {
    private readonly config;
    private readonly db;
    constructor(config: LGPDReportConfig, db: Database);
    /**
     * Generate LGPD compliance report
     */
    generateReport(): Promise<LGPDReport>;
    /**
     * Validate constitutional compliance
     */
    private validateConstitutionalCompliance;
    /**
     * Generate report summary
     */
    private generateSummary;
    /**
     * Generate compliance findings
     */
    private generateFindings;
    /**
     * Export report to different formats
     */
    exportReport(report: LGPDReport, format: 'json' | 'pdf' | 'csv'): Promise<string>;
    /**
     * Generate PDF report
     */
    private generatePdfReport;
    /**
     * Format content for PDF
     */
    private formatPdfContent;
    /**
     * Generate CSV report
     */
    private generateCsvReport;
}
/**
 * Create LGPD Report Generator service
 */
export declare function createLGPDReportGenerator(config: LGPDReportConfig, db: Database): LGPDReportGenerator;
/**
 * Validate LGPD report configuration
 */
export declare function validateLGPDReportConfig(config: LGPDReportConfig): Promise<{
    valid: boolean;
    violations: string[];
}>;
