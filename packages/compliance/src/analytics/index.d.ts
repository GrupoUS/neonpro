/**
 * @fileoverview Compliance Analytics Module for NeonPro Healthcare
 * Constitutional Brazilian Healthcare Compliance Analytics
 *
 * Quality Standard: ≥9.9/10
 */
export declare class ComplianceAnalyticsService {
    readonly _supabaseClient: any;
    constructor(_supabaseClient: any);
    getComplianceMetrics(_tenantId: string): Promise<{
        success: boolean;
        metrics: {
            complianceScore: number;
            dataProtection: number;
            accessControl: number;
            auditTrail: number;
            encryption: number;
            overallScore: number;
            dataQualityScore: number;
            auditFrequency: number;
        };
    }>;
    generateReport(_tenantId: string): Promise<{
        success: boolean;
        report: {
            summary: string;
            recommendations: string[];
        };
    }>;
}
/**
 * Create compliance analytics services
 */
export declare function createAnalyticsServices(supabaseClient: any): {
    analytics: ComplianceAnalyticsService;
};
/**
 * Validate analytics compliance
 */
export declare function validateAnalyticsCompliance(tenantId: string, supabaseClient: any): Promise<{
    isCompliant: boolean;
    score: number;
    issues: string[];
    recommendations: string[];
}>;
