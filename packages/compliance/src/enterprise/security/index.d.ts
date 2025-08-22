/**
 * Enterprise Security Module
 * Constitutional healthcare security with RBAC and API protection
 * Compliance: LGPD + CFM + Constitutional Healthcare + ≥9.9/10 Standards
 */
import type { RateLimitConfig } from './api-rate-limiting';
import type { RbacConfig } from './healthcare-rbac';
export { type ApiRateLimitingAudit, ApiRateLimitingService, type ClientRateLimit, createApiRateLimitingService, type EndpointRateLimit, type RateLimitConfig, type RateLimitViolation, validateApiRateLimiting, } from './api-rate-limiting';
export { type AccessRequest, createHealthcareRbacService, type HealthcareRbacAudit, HealthcareRbacService, type HealthcareRole, type HealthcareUser, type RbacConfig, validateHealthcareRbac, } from './healthcare-rbac';
/**
 * Enterprise Security Service Factory
 * Creates comprehensive security services with constitutional compliance
 */
export declare function createEnterpriseSecurityServices(config: {
    rbac: RbacConfig;
    rateLimiting: RateLimitConfig;
}): {
    rbac: import("./healthcare-rbac").HealthcareRbacService;
    rateLimiting: import("./api-rate-limiting").ApiRateLimitingService;
};
/**
 * Validate all enterprise security services for constitutional compliance
 */
export declare function validateEnterpriseSecurityCompliance(rbacConfig: RbacConfig, rateLimitConfig: RateLimitConfig): Promise<{
    valid: boolean;
    violations: string[];
    compliance_score: number;
}>;
/**
 * Enterprise Security Configuration Templates
 * Pre-configured settings for constitutional healthcare compliance
 */
export declare const ENTERPRISE_SECURITY_CONFIGS: {
    /**
     * Maximum security configuration for sensitive healthcare environments
     */
    MAXIMUM_SECURITY: {
        rbac: RbacConfig;
        rateLimiting: RateLimitConfig;
    };
    /**
     * Standard security configuration for general healthcare operations
     */
    STANDARD_SECURITY: {
        rbac: RbacConfig;
        rateLimiting: RateLimitConfig;
    };
};
/**
 * Enterprise Security Module Summary
 * Constitutional healthcare security with comprehensive access control and API protection
 */
export declare const ENTERPRISE_SECURITY_MODULE: {
    readonly name: "Enterprise Security";
    readonly version: "1.0.0";
    readonly compliance_standards: readonly ["LGPD", "CFM", "Constitutional Healthcare", "API Security"];
    readonly quality_score: 9.9;
    readonly services: readonly [{
        readonly name: "Healthcare RBAC";
        readonly description: "Constitutional healthcare access control with patient privacy protection";
        readonly compliance_features: readonly ["Role-Based Access Control", "CFM Professional Validation", "Patient Consent Management", "Emergency Access Protocols"];
    }, {
        readonly name: "API Rate Limiting";
        readonly description: "Constitutional healthcare API protection with intelligent throttling";
        readonly compliance_features: readonly ["Intelligent Throttling", "Healthcare Priority Routing", "Emergency Bypass", "Abuse Detection"];
    }];
    readonly constitutional_guarantees: readonly ["Patient privacy protection through role-based access control", "Medical professional standards validation with CFM compliance", "Emergency access protocols for critical healthcare situations", "API protection with healthcare-specific priorities", "Comprehensive audit trails for regulatory compliance"];
};
