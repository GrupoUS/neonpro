/**
 * API Rate Limiting Service
 * Constitutional healthcare API protection with intelligent throttling and abuse prevention
 * Compliance: LGPD + Constitutional Privacy + Security + ≥9.9/10 Standards
 */
import { z } from 'zod';
declare const RateLimitConfigSchema: z.ZodObject<{
    default_requests_per_minute: z.ZodDefault<z.ZodNumber>;
    default_requests_per_hour: z.ZodDefault<z.ZodNumber>;
    default_requests_per_day: z.ZodDefault<z.ZodNumber>;
    burst_allowance: z.ZodDefault<z.ZodNumber>;
    sliding_window_minutes: z.ZodDefault<z.ZodNumber>;
    constitutional_protection_enabled: z.ZodDefault<z.ZodBoolean>;
    patient_data_protection: z.ZodDefault<z.ZodBoolean>;
    intelligent_throttling: z.ZodDefault<z.ZodBoolean>;
    abuse_detection_enabled: z.ZodDefault<z.ZodBoolean>;
    emergency_bypass_enabled: z.ZodDefault<z.ZodBoolean>;
    audit_all_requests: z.ZodDefault<z.ZodBoolean>;
    blacklist_enabled: z.ZodDefault<z.ZodBoolean>;
    whitelist_enabled: z.ZodDefault<z.ZodBoolean>;
    geographic_restrictions: z.ZodDefault<z.ZodBoolean>;
    healthcare_priority_routing: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    default_requests_per_minute: number;
    default_requests_per_hour: number;
    default_requests_per_day: number;
    burst_allowance: number;
    sliding_window_minutes: number;
    constitutional_protection_enabled: boolean;
    patient_data_protection: boolean;
    intelligent_throttling: boolean;
    abuse_detection_enabled: boolean;
    emergency_bypass_enabled: boolean;
    audit_all_requests: boolean;
    blacklist_enabled: boolean;
    whitelist_enabled: boolean;
    geographic_restrictions: boolean;
    healthcare_priority_routing: boolean;
}, {
    default_requests_per_minute?: number | undefined;
    default_requests_per_hour?: number | undefined;
    default_requests_per_day?: number | undefined;
    burst_allowance?: number | undefined;
    sliding_window_minutes?: number | undefined;
    constitutional_protection_enabled?: boolean | undefined;
    patient_data_protection?: boolean | undefined;
    intelligent_throttling?: boolean | undefined;
    abuse_detection_enabled?: boolean | undefined;
    emergency_bypass_enabled?: boolean | undefined;
    audit_all_requests?: boolean | undefined;
    blacklist_enabled?: boolean | undefined;
    whitelist_enabled?: boolean | undefined;
    geographic_restrictions?: boolean | undefined;
    healthcare_priority_routing?: boolean | undefined;
}>;
declare const EndpointRateLimitSchema: z.ZodObject<{
    endpoint_pattern: z.ZodString;
    endpoint_type: z.ZodEnum<["patient_data", "medical_records", "appointments", "authentication", "public_api", "admin_api", "compliance_api", "analytics_api", "emergency_api"]>;
    security_level: z.ZodEnum<["public", "protected", "sensitive", "confidential", "emergency"]>;
    rate_limits: z.ZodObject<{
        requests_per_minute: z.ZodNumber;
        requests_per_hour: z.ZodNumber;
        requests_per_day: z.ZodNumber;
        concurrent_requests: z.ZodDefault<z.ZodNumber>;
        burst_allowance: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        burst_allowance: number;
        requests_per_minute: number;
        requests_per_hour: number;
        requests_per_day: number;
        concurrent_requests: number;
    }, {
        requests_per_minute: number;
        requests_per_hour: number;
        requests_per_day: number;
        burst_allowance?: number | undefined;
        concurrent_requests?: number | undefined;
    }>;
    constitutional_protections: z.ZodObject<{
        patient_privacy_enforcement: z.ZodBoolean;
        medical_secrecy_protection: z.ZodBoolean;
        lgpd_compliance_required: z.ZodBoolean;
        cfm_ethics_validation: z.ZodBoolean;
        emergency_access_allowed: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        cfm_ethics_validation: boolean;
        patient_privacy_enforcement: boolean;
        medical_secrecy_protection: boolean;
        lgpd_compliance_required: boolean;
        emergency_access_allowed: boolean;
    }, {
        cfm_ethics_validation: boolean;
        patient_privacy_enforcement: boolean;
        medical_secrecy_protection: boolean;
        lgpd_compliance_required: boolean;
        emergency_access_allowed: boolean;
    }>;
    throttling_behavior: z.ZodObject<{
        gradual_slowdown: z.ZodDefault<z.ZodBoolean>;
        temporary_blocking: z.ZodDefault<z.ZodBoolean>;
        permanent_blocking: z.ZodDefault<z.ZodBoolean>;
        warning_notifications: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        gradual_slowdown: boolean;
        temporary_blocking: boolean;
        permanent_blocking: boolean;
        warning_notifications: boolean;
    }, {
        gradual_slowdown?: boolean | undefined;
        temporary_blocking?: boolean | undefined;
        permanent_blocking?: boolean | undefined;
        warning_notifications?: boolean | undefined;
    }>;
    priority_rules: z.ZodObject<{
        healthcare_professional_priority: z.ZodDefault<z.ZodBoolean>;
        emergency_access_priority: z.ZodDefault<z.ZodBoolean>;
        patient_self_access_priority: z.ZodDefault<z.ZodBoolean>;
        administrative_access_priority: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        healthcare_professional_priority: boolean;
        emergency_access_priority: boolean;
        patient_self_access_priority: boolean;
        administrative_access_priority: boolean;
    }, {
        healthcare_professional_priority?: boolean | undefined;
        emergency_access_priority?: boolean | undefined;
        patient_self_access_priority?: boolean | undefined;
        administrative_access_priority?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    endpoint_pattern: string;
    endpoint_type: "medical_records" | "authentication" | "appointments" | "patient_data" | "public_api" | "admin_api" | "compliance_api" | "analytics_api" | "emergency_api";
    security_level: "public" | "protected" | "sensitive" | "confidential" | "emergency";
    rate_limits: {
        burst_allowance: number;
        requests_per_minute: number;
        requests_per_hour: number;
        requests_per_day: number;
        concurrent_requests: number;
    };
    constitutional_protections: {
        cfm_ethics_validation: boolean;
        patient_privacy_enforcement: boolean;
        medical_secrecy_protection: boolean;
        lgpd_compliance_required: boolean;
        emergency_access_allowed: boolean;
    };
    throttling_behavior: {
        gradual_slowdown: boolean;
        temporary_blocking: boolean;
        permanent_blocking: boolean;
        warning_notifications: boolean;
    };
    priority_rules: {
        healthcare_professional_priority: boolean;
        emergency_access_priority: boolean;
        patient_self_access_priority: boolean;
        administrative_access_priority: boolean;
    };
}, {
    endpoint_pattern: string;
    endpoint_type: "medical_records" | "authentication" | "appointments" | "patient_data" | "public_api" | "admin_api" | "compliance_api" | "analytics_api" | "emergency_api";
    security_level: "public" | "protected" | "sensitive" | "confidential" | "emergency";
    rate_limits: {
        requests_per_minute: number;
        requests_per_hour: number;
        requests_per_day: number;
        burst_allowance?: number | undefined;
        concurrent_requests?: number | undefined;
    };
    constitutional_protections: {
        cfm_ethics_validation: boolean;
        patient_privacy_enforcement: boolean;
        medical_secrecy_protection: boolean;
        lgpd_compliance_required: boolean;
        emergency_access_allowed: boolean;
    };
    throttling_behavior: {
        gradual_slowdown?: boolean | undefined;
        temporary_blocking?: boolean | undefined;
        permanent_blocking?: boolean | undefined;
        warning_notifications?: boolean | undefined;
    };
    priority_rules: {
        healthcare_professional_priority?: boolean | undefined;
        emergency_access_priority?: boolean | undefined;
        patient_self_access_priority?: boolean | undefined;
        administrative_access_priority?: boolean | undefined;
    };
}>;
declare const ClientRateLimitSchema: z.ZodObject<{
    client_id: z.ZodString;
    client_type: z.ZodEnum<["web_application", "mobile_application", "api_integration", "healthcare_system", "third_party_service", "internal_service", "emergency_service"]>;
    trust_level: z.ZodEnum<["untrusted", "basic", "trusted", "verified", "emergency"]>;
    custom_limits: z.ZodObject<{
        requests_per_minute: z.ZodNumber;
        requests_per_hour: z.ZodNumber;
        requests_per_day: z.ZodNumber;
        concurrent_requests: z.ZodNumber;
        priority_weight: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        requests_per_minute: number;
        requests_per_hour: number;
        requests_per_day: number;
        concurrent_requests: number;
        priority_weight: number;
    }, {
        requests_per_minute: number;
        requests_per_hour: number;
        requests_per_day: number;
        concurrent_requests: number;
        priority_weight?: number | undefined;
    }>;
    security_settings: z.ZodObject<{
        require_authentication: z.ZodDefault<z.ZodBoolean>;
        require_encryption: z.ZodDefault<z.ZodBoolean>;
        allowed_ip_ranges: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        blocked_ip_ranges: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        user_agent_restrictions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        require_authentication: boolean;
        require_encryption: boolean;
        allowed_ip_ranges?: string[] | undefined;
        blocked_ip_ranges?: string[] | undefined;
        user_agent_restrictions?: string[] | undefined;
    }, {
        require_authentication?: boolean | undefined;
        require_encryption?: boolean | undefined;
        allowed_ip_ranges?: string[] | undefined;
        blocked_ip_ranges?: string[] | undefined;
        user_agent_restrictions?: string[] | undefined;
    }>;
    constitutional_compliance: z.ZodObject<{
        lgpd_compliance_verified: z.ZodBoolean;
        cfm_authorization: z.ZodOptional<z.ZodBoolean>;
        patient_consent_management: z.ZodBoolean;
        healthcare_professional_verified: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        lgpd_compliance_verified: boolean;
        patient_consent_management: boolean;
        cfm_authorization?: boolean | undefined;
        healthcare_professional_verified?: boolean | undefined;
    }, {
        lgpd_compliance_verified: boolean;
        patient_consent_management: boolean;
        cfm_authorization?: boolean | undefined;
        healthcare_professional_verified?: boolean | undefined;
    }>;
    active: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    active: boolean;
    created_at: string;
    updated_at: string;
    constitutional_compliance: {
        lgpd_compliance_verified: boolean;
        patient_consent_management: boolean;
        cfm_authorization?: boolean | undefined;
        healthcare_professional_verified?: boolean | undefined;
    };
    client_id: string;
    client_type: "web_application" | "mobile_application" | "api_integration" | "healthcare_system" | "third_party_service" | "internal_service" | "emergency_service";
    trust_level: "basic" | "verified" | "emergency" | "untrusted" | "trusted";
    custom_limits: {
        requests_per_minute: number;
        requests_per_hour: number;
        requests_per_day: number;
        concurrent_requests: number;
        priority_weight: number;
    };
    security_settings: {
        require_authentication: boolean;
        require_encryption: boolean;
        allowed_ip_ranges?: string[] | undefined;
        blocked_ip_ranges?: string[] | undefined;
        user_agent_restrictions?: string[] | undefined;
    };
}, {
    created_at: string;
    updated_at: string;
    constitutional_compliance: {
        lgpd_compliance_verified: boolean;
        patient_consent_management: boolean;
        cfm_authorization?: boolean | undefined;
        healthcare_professional_verified?: boolean | undefined;
    };
    client_id: string;
    client_type: "web_application" | "mobile_application" | "api_integration" | "healthcare_system" | "third_party_service" | "internal_service" | "emergency_service";
    trust_level: "basic" | "verified" | "emergency" | "untrusted" | "trusted";
    custom_limits: {
        requests_per_minute: number;
        requests_per_hour: number;
        requests_per_day: number;
        concurrent_requests: number;
        priority_weight?: number | undefined;
    };
    security_settings: {
        require_authentication?: boolean | undefined;
        require_encryption?: boolean | undefined;
        allowed_ip_ranges?: string[] | undefined;
        blocked_ip_ranges?: string[] | undefined;
        user_agent_restrictions?: string[] | undefined;
    };
    active?: boolean | undefined;
}>;
declare const RateLimitViolationSchema: z.ZodObject<{
    violation_id: z.ZodString;
    client_id: z.ZodOptional<z.ZodString>;
    ip_address: z.ZodString;
    user_agent: z.ZodOptional<z.ZodString>;
    endpoint: z.ZodString;
    violation_type: z.ZodEnum<["rate_limit_exceeded", "burst_limit_exceeded", "concurrent_limit_exceeded", "suspicious_activity", "potential_abuse", "security_threat", "constitutional_violation"]>;
    severity: z.ZodEnum<["low", "medium", "high", "critical", "emergency"]>;
    request_details: z.ZodObject<{
        method: z.ZodString;
        endpoint: z.ZodString;
        timestamp: z.ZodString;
        response_status: z.ZodNumber;
        response_time_ms: z.ZodNumber;
        data_accessed: z.ZodOptional<z.ZodString>;
        patient_data_involved: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        timestamp: string;
        patient_data_involved: boolean;
        endpoint: string;
        method: string;
        response_status: number;
        response_time_ms: number;
        data_accessed?: string | undefined;
    }, {
        timestamp: string;
        patient_data_involved: boolean;
        endpoint: string;
        method: string;
        response_status: number;
        response_time_ms: number;
        data_accessed?: string | undefined;
    }>;
    constitutional_impact: z.ZodObject<{
        patient_privacy_risk: z.ZodEnum<["none", "low", "medium", "high", "critical"]>;
        medical_secrecy_risk: z.ZodEnum<["none", "low", "medium", "high", "critical"]>;
        lgpd_compliance_risk: z.ZodEnum<["none", "low", "medium", "high", "critical"]>;
        immediate_action_required: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        patient_privacy_risk: "critical" | "low" | "high" | "medium" | "none";
        medical_secrecy_risk: "critical" | "low" | "high" | "medium" | "none";
        lgpd_compliance_risk: "critical" | "low" | "high" | "medium" | "none";
        immediate_action_required: boolean;
    }, {
        patient_privacy_risk: "critical" | "low" | "high" | "medium" | "none";
        medical_secrecy_risk: "critical" | "low" | "high" | "medium" | "none";
        lgpd_compliance_risk: "critical" | "low" | "high" | "medium" | "none";
        immediate_action_required: boolean;
    }>;
    mitigation_action: z.ZodObject<{
        action_taken: z.ZodEnum<["warning", "temporary_block", "permanent_block", "escalation", "manual_review"]>;
        block_duration_minutes: z.ZodOptional<z.ZodNumber>;
        notification_sent: z.ZodBoolean;
        incident_reported: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        action_taken: "warning" | "temporary_block" | "permanent_block" | "escalation" | "manual_review";
        notification_sent: boolean;
        incident_reported: boolean;
        block_duration_minutes?: number | undefined;
    }, {
        action_taken: "warning" | "temporary_block" | "permanent_block" | "escalation" | "manual_review";
        notification_sent: boolean;
        incident_reported: boolean;
        block_duration_minutes?: number | undefined;
    }>;
    created_at: z.ZodString;
    resolved_at: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    severity: "critical" | "low" | "high" | "medium" | "emergency";
    created_at: string;
    ip_address: string;
    violation_id: string;
    endpoint: string;
    violation_type: "constitutional_violation" | "rate_limit_exceeded" | "burst_limit_exceeded" | "concurrent_limit_exceeded" | "suspicious_activity" | "potential_abuse" | "security_threat";
    request_details: {
        timestamp: string;
        patient_data_involved: boolean;
        endpoint: string;
        method: string;
        response_status: number;
        response_time_ms: number;
        data_accessed?: string | undefined;
    };
    constitutional_impact: {
        patient_privacy_risk: "critical" | "low" | "high" | "medium" | "none";
        medical_secrecy_risk: "critical" | "low" | "high" | "medium" | "none";
        lgpd_compliance_risk: "critical" | "low" | "high" | "medium" | "none";
        immediate_action_required: boolean;
    };
    mitigation_action: {
        action_taken: "warning" | "temporary_block" | "permanent_block" | "escalation" | "manual_review";
        notification_sent: boolean;
        incident_reported: boolean;
        block_duration_minutes?: number | undefined;
    };
    resolved_at?: string | undefined;
    user_agent?: string | undefined;
    client_id?: string | undefined;
}, {
    severity: "critical" | "low" | "high" | "medium" | "emergency";
    created_at: string;
    ip_address: string;
    violation_id: string;
    endpoint: string;
    violation_type: "constitutional_violation" | "rate_limit_exceeded" | "burst_limit_exceeded" | "concurrent_limit_exceeded" | "suspicious_activity" | "potential_abuse" | "security_threat";
    request_details: {
        timestamp: string;
        patient_data_involved: boolean;
        endpoint: string;
        method: string;
        response_status: number;
        response_time_ms: number;
        data_accessed?: string | undefined;
    };
    constitutional_impact: {
        patient_privacy_risk: "critical" | "low" | "high" | "medium" | "none";
        medical_secrecy_risk: "critical" | "low" | "high" | "medium" | "none";
        lgpd_compliance_risk: "critical" | "low" | "high" | "medium" | "none";
        immediate_action_required: boolean;
    };
    mitigation_action: {
        action_taken: "warning" | "temporary_block" | "permanent_block" | "escalation" | "manual_review";
        notification_sent: boolean;
        incident_reported: boolean;
        block_duration_minutes?: number | undefined;
    };
    resolved_at?: string | undefined;
    user_agent?: string | undefined;
    client_id?: string | undefined;
}>;
export type RateLimitConfig = z.infer<typeof RateLimitConfigSchema>;
export type EndpointRateLimit = z.infer<typeof EndpointRateLimitSchema>;
export type ClientRateLimit = z.infer<typeof ClientRateLimitSchema>;
export type RateLimitViolation = z.infer<typeof RateLimitViolationSchema>;
export type ApiRateLimitingAudit = {
    audit_id: string;
    client_id?: string;
    ip_address: string;
    endpoint: string;
    action: string;
    rate_limit_status: 'allowed' | 'throttled' | 'blocked';
    constitutional_validation_result: Record<string, any>;
    patient_data_protection_applied: boolean;
    security_measures_triggered: string[];
    performance_impact: Record<string, any>;
    created_at: string;
    user_agent?: string;
    authentication_status?: string;
};
/**
 * API Rate Limiting Service
 * Constitutional healthcare API protection with intelligent throttling
 */
export declare class ApiRateLimitingService {
    private readonly config;
    private readonly endpointLimits;
    private readonly clientLimits;
    private readonly violations;
    private readonly auditTrail;
    private readonly requestCounters;
    private readonly blacklistedIps;
    private readonly whitelistedIps;
    private readonly emergencyBypassTokens;
    constructor(config: RateLimitConfig);
    /**
     * Check rate limit for incoming request with constitutional protection
     */
    checkRateLimit(request: {
        ip_address: string;
        endpoint: string;
        method: string;
        user_agent?: string;
        client_id?: string;
        user_id?: string;
        authentication_token?: string;
        emergency_bypass_token?: string;
        patient_data_involved?: boolean;
    }): Promise<{
        allowed: boolean;
        rate_limit_status: 'allowed' | 'throttled' | 'blocked';
        limits: Record<string, any>;
        constitutional_protection_applied: boolean;
        retry_after_seconds?: number;
        audit_trail_id: string;
    }>;
    /**
     * Register endpoint with specific rate limiting rules
     */
    registerEndpoint(endpoint: EndpointRateLimit): Promise<{
        success: boolean;
        endpoint_id: string;
        constitutional_validation: Record<string, any>;
    }>;
    /**
     * Register client with custom rate limiting configuration
     */
    registerClient(client: Omit<ClientRateLimit, 'created_at' | 'updated_at'>): Promise<{
        success: boolean;
        client_id: string;
        compliance_validation: Record<string, any>;
    }>;
    /**
     * Report and handle rate limit violation
     */
    reportViolation(violationData: Omit<RateLimitViolation, 'violation_id' | 'created_at'>): Promise<{
        success: boolean;
        violation_id: string;
        mitigation_applied: Record<string, any>;
    }>;
    /**
     * Generate emergency bypass token for critical healthcare access
     */
    generateEmergencyBypassToken(request: {
        requester_id: string;
        medical_justification: string;
        urgency_level: 'high' | 'critical' | 'life_threatening';
        estimated_duration_minutes: number;
        supervising_physician_id?: string;
    }): Promise<{
        success: boolean;
        bypass_token: string;
        expires_at: string;
        constitutional_approval: Record<string, any>;
    }>;
    private initializeDefaultLimits;
    private generateRequestKey;
    private getCurrentUsage;
    private getApplicableLimits;
    private checkLimitsAgainstUsage;
    private validateConstitutionalProtection;
    private applyIntelligentThrottling;
    private updateRequestCounters;
    private allowRequest;
    private blockRequest;
    private handleRateLimitExceeded;
    private throttleRequest;
    private allowRequestWithEmergencyBypass;
    private allowRequestWithWhitelistPriority;
    private allowRequestWithError;
    private matchesEndpointPattern;
    private applyHealthcarePriorityAdjustments;
    private validateEndpointConstitutionalCompliance;
    private validateHealthcareEndpointRequirements;
    private validateClientConstitutionalCompliance;
    private validateHealthcareProfessionalClient;
    private applyViolationMitigation;
    private assessConstitutionalImpact;
    private getMaxEmergencyDuration;
    private isRequestFromBrazil;
    /**
     * Get current rate limiting statistics
     */
    getRateLimitingStatistics(): {
        total_requests_processed: number;
        requests_allowed: number;
        requests_throttled: number;
        requests_blocked: number;
        active_violations: number;
        emergency_bypasses_active: number;
    };
    /**
     * Get audit trail for compliance reporting
     */
    getAuditTrail(): ApiRateLimitingAudit[];
    /**
     * Get active violations for monitoring
     */
    getActiveViolations(): RateLimitViolation[];
    /**
     * Validate constitutional compliance of rate limiting system
     */
    validateConstitutionalCompliance(): Promise<{
        compliant: boolean;
        score: number;
        issues: string[];
    }>;
}
/**
 * Factory function to create API rate limiting service
 */
export declare function createApiRateLimitingService(config: RateLimitConfig): ApiRateLimitingService;
/**
 * Constitutional validation for API rate limiting configuration
 */
export declare function validateApiRateLimiting(config: RateLimitConfig): Promise<{
    valid: boolean;
    violations: string[];
}>;
export {};
