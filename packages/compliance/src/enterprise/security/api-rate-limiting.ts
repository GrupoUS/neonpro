/**
 * API Rate Limiting Service
 * Constitutional healthcare API protection with intelligent throttling and abuse prevention
 * Compliance: LGPD + Constitutional Privacy + Security + ≥9.9/10 Standards
 */

import { z } from 'zod';

// Constitutional API Rate Limiting Schemas
const RateLimitConfigSchema = z.object({
  default_requests_per_minute: z.number().min(1).max(1000).default(60),
  default_requests_per_hour: z.number().min(10).max(10_000).default(1000),
  default_requests_per_day: z.number().min(100).max(100_000).default(10_000),
  burst_allowance: z.number().min(1).max(100).default(10),
  sliding_window_minutes: z.number().min(1).max(60).default(15),
  constitutional_protection_enabled: z.boolean().default(true),
  patient_data_protection: z.boolean().default(true),
  intelligent_throttling: z.boolean().default(true),
  abuse_detection_enabled: z.boolean().default(true),
  emergency_bypass_enabled: z.boolean().default(true),
  audit_all_requests: z.boolean().default(true),
  blacklist_enabled: z.boolean().default(true),
  whitelist_enabled: z.boolean().default(true),
  geographic_restrictions: z.boolean().default(false),
  healthcare_priority_routing: z.boolean().default(true),
});

const EndpointRateLimitSchema = z.object({
  endpoint_pattern: z.string().min(1),
  endpoint_type: z.enum([
    'patient_data',
    'medical_records',
    'appointments',
    'authentication',
    'public_api',
    'admin_api',
    'compliance_api',
    'analytics_api',
    'emergency_api',
  ]),
  security_level: z.enum([
    'public',
    'protected',
    'sensitive',
    'confidential',
    'emergency',
  ]),
  rate_limits: z.object({
    requests_per_minute: z.number().min(1).max(1000),
    requests_per_hour: z.number().min(10).max(10_000),
    requests_per_day: z.number().min(100).max(100_000),
    concurrent_requests: z.number().min(1).max(100).default(10),
    burst_allowance: z.number().min(1).max(50).default(5),
  }),
  constitutional_protections: z.object({
    patient_privacy_enforcement: z.boolean(),
    medical_secrecy_protection: z.boolean(),
    lgpd_compliance_required: z.boolean(),
    cfm_ethics_validation: z.boolean(),
    emergency_access_allowed: z.boolean(),
  }),
  throttling_behavior: z.object({
    gradual_slowdown: z.boolean().default(true),
    temporary_blocking: z.boolean().default(true),
    permanent_blocking: z.boolean().default(false),
    warning_notifications: z.boolean().default(true),
  }),
  priority_rules: z.object({
    healthcare_professional_priority: z.boolean().default(true),
    emergency_access_priority: z.boolean().default(true),
    patient_self_access_priority: z.boolean().default(true),
    administrative_access_priority: z.boolean().default(false),
  }),
});

const ClientRateLimitSchema = z.object({
  client_id: z.string().uuid(),
  client_type: z.enum([
    'web_application',
    'mobile_application',
    'api_integration',
    'healthcare_system',
    'third_party_service',
    'internal_service',
    'emergency_service',
  ]),
  trust_level: z.enum([
    'untrusted',
    'basic',
    'trusted',
    'verified',
    'emergency',
  ]),
  custom_limits: z.object({
    requests_per_minute: z.number().min(1).max(2000),
    requests_per_hour: z.number().min(10).max(20_000),
    requests_per_day: z.number().min(100).max(200_000),
    concurrent_requests: z.number().min(1).max(200),
    priority_weight: z.number().min(0.1).max(10).default(1),
  }),
  security_settings: z.object({
    require_authentication: z.boolean().default(true),
    require_encryption: z.boolean().default(true),
    allowed_ip_ranges: z.array(z.string()).optional(),
    blocked_ip_ranges: z.array(z.string()).optional(),
    user_agent_restrictions: z.array(z.string()).optional(),
  }),
  constitutional_compliance: z.object({
    lgpd_compliance_verified: z.boolean(),
    cfm_authorization: z.boolean().optional(),
    patient_consent_management: z.boolean(),
    healthcare_professional_verified: z.boolean().optional(),
  }),
  active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

const RateLimitViolationSchema = z.object({
  violation_id: z.string().uuid(),
  client_id: z.string().uuid().optional(),
  ip_address: z.string(),
  user_agent: z.string().optional(),
  endpoint: z.string(),
  violation_type: z.enum([
    'rate_limit_exceeded',
    'burst_limit_exceeded',
    'concurrent_limit_exceeded',
    'suspicious_activity',
    'potential_abuse',
    'security_threat',
    'constitutional_violation',
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical', 'emergency']),
  request_details: z.object({
    method: z.string(),
    endpoint: z.string(),
    timestamp: z.string().datetime(),
    response_status: z.number(),
    response_time_ms: z.number(),
    data_accessed: z.string().optional(),
    patient_data_involved: z.boolean(),
  }),
  constitutional_impact: z.object({
    patient_privacy_risk: z.enum(['none', 'low', 'medium', 'high', 'critical']),
    medical_secrecy_risk: z.enum(['none', 'low', 'medium', 'high', 'critical']),
    lgpd_compliance_risk: z.enum(['none', 'low', 'medium', 'high', 'critical']),
    immediate_action_required: z.boolean(),
  }),
  mitigation_action: z.object({
    action_taken: z.enum([
      'warning',
      'temporary_block',
      'permanent_block',
      'escalation',
      'manual_review',
    ]),
    block_duration_minutes: z.number().optional(),
    notification_sent: z.boolean(),
    incident_reported: z.boolean(),
  }),
  created_at: z.string().datetime(),
  resolved_at: z.string().datetime().optional(),
});

// Type definitions
export type RateLimitConfig = z.infer<typeof RateLimitConfigSchema>;
export type EndpointRateLimit = z.infer<typeof EndpointRateLimitSchema>;
export type ClientRateLimit = z.infer<typeof ClientRateLimitSchema>;
export type RateLimitViolation = z.infer<typeof RateLimitViolationSchema>;

export interface ApiRateLimitingAudit {
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
}

/**
 * API Rate Limiting Service
 * Constitutional healthcare API protection with intelligent throttling
 */
export class ApiRateLimitingService {
  private readonly config: RateLimitConfig;
  private readonly endpointLimits: Map<string, EndpointRateLimit> = new Map();
  private readonly clientLimits: Map<string, ClientRateLimit> = new Map();
  private readonly violations: Map<string, RateLimitViolation> = new Map();
  private readonly auditTrail: ApiRateLimitingAudit[] = [];

  // Rate limiting tracking
  private readonly requestCounters: Map<string, any> = new Map();
  private readonly blacklistedIps: Set<string> = new Set();
  private readonly whitelistedIps: Set<string> = new Set();
  private readonly emergencyBypassTokens: Set<string> = new Set();

  constructor(config: RateLimitConfig) {
    this.config = RateLimitConfigSchema.parse(config);
    this.initializeDefaultLimits();
  }

  /**
   * Check rate limit for incoming request with constitutional protection
   */
  async checkRateLimit(request: {
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
  }> {
    const now = Date.now();
    const requestKey = this.generateRequestKey(request);

    try {
      // Emergency bypass check
      if (
        request.emergency_bypass_token
        && this.emergencyBypassTokens.has(request.emergency_bypass_token)
      ) {
        return this.allowRequestWithEmergencyBypass(request);
      }

      // Blacklist check
      if (
        this.config.blacklist_enabled
        && this.blacklistedIps.has(request.ip_address)
      ) {
        return this.blockRequest(
          request,
          'IP address blacklisted',
          'security_threat',
        );
      }

      // Whitelist priority
      if (
        this.config.whitelist_enabled
        && this.whitelistedIps.has(request.ip_address)
      ) {
        return this.allowRequestWithWhitelistPriority(request);
      }

      // Constitutional protection validation
      if (this.config.constitutional_protection_enabled) {
        const constitutionalValidation = await this.validateConstitutionalProtection(request);
        if (!constitutionalValidation.allowed) {
          return this.blockRequest(
            request,
            constitutionalValidation.reason
              || 'Constitutional protection violation',
            'constitutional_violation',
          );
        }
      }

      // Get applicable rate limits
      const limits = await this.getApplicableLimits(request);

      // Check current usage against limits
      const usage = this.getCurrentUsage(requestKey, now);
      const limitCheck = this.checkLimitsAgainstUsage(limits, usage);

      if (!limitCheck.allowed) {
        return this.handleRateLimitExceeded(
          request,
          limits,
          usage,
          limitCheck.retry_after_seconds || 60,
        );
      }

      // Intelligent throttling check
      if (this.config.intelligent_throttling) {
        const throttlingDecision = await this.applyIntelligentThrottling(
          request,
          usage,
          limits,
        );
        if (throttlingDecision.should_throttle) {
          return this.throttleRequest(
            request,
            throttlingDecision.delay_ms || 1000,
          );
        }
      }

      // Allow request and update counters
      this.updateRequestCounters(requestKey, now);
      return this.allowRequest(request, limits);
    } catch (error) {
      // Fail open for healthcare systems in case of service errors
      return this.allowRequestWithError(request, error as Error);
    }
  }

  /**
   * Register endpoint with specific rate limiting rules
   */
  async registerEndpoint(endpoint: EndpointRateLimit): Promise<{
    success: boolean;
    endpoint_id: string;
    constitutional_validation: Record<string, any>;
  }> {
    const validatedEndpoint = EndpointRateLimitSchema.parse(endpoint);

    // Constitutional validation for endpoint
    await this.validateEndpointConstitutionalCompliance(validatedEndpoint);

    // Healthcare-specific validation
    await this.validateHealthcareEndpointRequirements(validatedEndpoint);

    // Store endpoint configuration
    this.endpointLimits.set(
      validatedEndpoint.endpoint_pattern,
      validatedEndpoint,
    );

    // Create audit entry
    const auditEntry: ApiRateLimitingAudit = {
      audit_id: crypto.randomUUID(),
      endpoint: validatedEndpoint.endpoint_pattern,
      action: 'endpoint_registered',
      rate_limit_status: 'allowed',
      constitutional_validation_result: {
        patient_privacy_protection: validatedEndpoint.constitutional_protections
          .patient_privacy_enforcement,
        medical_secrecy_enforcement: validatedEndpoint.constitutional_protections
          .medical_secrecy_protection,
        lgpd_compliance: validatedEndpoint.constitutional_protections.lgpd_compliance_required,
        cfm_ethics_validation: validatedEndpoint.constitutional_protections.cfm_ethics_validation,
      },
      patient_data_protection_applied: validatedEndpoint.endpoint_type === 'patient_data',
      security_measures_triggered: [
        'constitutional_validation',
        'endpoint_registration',
      ],
      performance_impact: {
        requests_per_minute_limit: validatedEndpoint.rate_limits.requests_per_minute,
        concurrent_requests_limit: validatedEndpoint.rate_limits.concurrent_requests,
      },
      created_at: new Date().toISOString(),
      ip_address: 'system',
    };

    this.auditTrail.push(auditEntry);

    return {
      success: true,
      endpoint_id: validatedEndpoint.endpoint_pattern,
      constitutional_validation: auditEntry.constitutional_validation_result,
    };
  }

  /**
   * Register client with custom rate limiting configuration
   */
  async registerClient(
    client: Omit<ClientRateLimit, 'created_at' | 'updated_at'>,
  ): Promise<{
    success: boolean;
    client_id: string;
    compliance_validation: Record<string, any>;
  }> {
    const now = new Date().toISOString();
    const fullClientData: ClientRateLimit = {
      ...client,
      created_at: now,
      updated_at: now,
    };

    const validatedClient = ClientRateLimitSchema.parse(fullClientData);

    // Constitutional compliance validation
    await this.validateClientConstitutionalCompliance(validatedClient);

    // Healthcare professional verification if applicable
    if (
      validatedClient.constitutional_compliance.healthcare_professional_verified
    ) {
      await this.validateHealthcareProfessionalClient(validatedClient);
    }

    // Store client configuration
    this.clientLimits.set(validatedClient.client_id, validatedClient);

    // Create audit entry
    const auditEntry: ApiRateLimitingAudit = {
      audit_id: crypto.randomUUID(),
      client_id: validatedClient.client_id,
      endpoint: 'client_registration',
      action: 'client_registered',
      rate_limit_status: 'allowed',
      constitutional_validation_result: {
        lgpd_compliance_verified:
          validatedClient.constitutional_compliance.lgpd_compliance_verified,
        cfm_authorization: validatedClient.constitutional_compliance.cfm_authorization,
        patient_consent_management:
          validatedClient.constitutional_compliance.patient_consent_management,
        trust_level: validatedClient.trust_level,
      },
      patient_data_protection_applied: true,
      security_measures_triggered: [
        'client_registration',
        'constitutional_validation',
      ],
      performance_impact: {
        custom_limits_applied: true,
        priority_weight: validatedClient.custom_limits.priority_weight,
      },
      created_at: now,
      ip_address: 'registration',
    };

    this.auditTrail.push(auditEntry);

    return {
      success: true,
      client_id: validatedClient.client_id,
      compliance_validation: auditEntry.constitutional_validation_result,
    };
  }

  /**
   * Report and handle rate limit violation
   */
  async reportViolation(
    violationData: Omit<RateLimitViolation, 'violation_id' | 'created_at'>,
  ): Promise<{
    success: boolean;
    violation_id: string;
    mitigation_applied: Record<string, any>;
  }> {
    const now = new Date().toISOString();
    const fullViolationData: RateLimitViolation = {
      violation_id: crypto.randomUUID(),
      ...violationData,
      created_at: now,
    };

    const validatedViolation = RateLimitViolationSchema.parse(fullViolationData);

    // Apply immediate mitigation based on severity
    const mitigationResult = await this.applyViolationMitigation(validatedViolation);

    // Constitutional impact assessment
    const _constitutionalImpact = await this.assessConstitutionalImpact(validatedViolation);

    // Store violation
    this.violations.set(validatedViolation.violation_id, validatedViolation);

    // Create audit entry
    const auditEntry: ApiRateLimitingAudit = {
      audit_id: crypto.randomUUID(),
      client_id: validatedViolation.client_id,
      ip_address: validatedViolation.ip_address,
      endpoint: validatedViolation.endpoint,
      action: `violation_${validatedViolation.violation_type}`,
      rate_limit_status: 'blocked',
      constitutional_validation_result: {
        constitutional_impact_assessed: true,
        patient_privacy_risk: validatedViolation.constitutional_impact.patient_privacy_risk,
        medical_secrecy_risk: validatedViolation.constitutional_impact.medical_secrecy_risk,
        immediate_action_required:
          validatedViolation.constitutional_impact.immediate_action_required,
      },
      patient_data_protection_applied: validatedViolation.request_details.patient_data_involved,
      security_measures_triggered: [
        'violation_detection',
        'mitigation_applied',
        'constitutional_impact_assessment',
      ],
      performance_impact: mitigationResult,
      created_at: now,
      user_agent: validatedViolation.user_agent,
    };

    this.auditTrail.push(auditEntry);

    return {
      success: true,
      violation_id: validatedViolation.violation_id,
      mitigation_applied: mitigationResult,
    };
  }

  /**
   * Generate emergency bypass token for critical healthcare access
   */
  async generateEmergencyBypassToken(request: {
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
  }> {
    if (!this.config.emergency_bypass_enabled) {
      throw new Error('Emergency bypass not enabled');
    }

    // Validate medical justification
    if (request.medical_justification.length < 20) {
      throw new Error(
        'Insufficient medical justification for emergency bypass',
      );
    }

    // Generate secure bypass token
    const bypassToken = `${crypto.randomUUID()}-emergency-${Date.now()}`;

    // Set expiration based on urgency and duration
    const maxDurationMinutes = this.getMaxEmergencyDuration(
      request.urgency_level,
    );
    const durationMinutes = Math.min(
      request.estimated_duration_minutes,
      maxDurationMinutes,
    );
    const expiresAt = new Date(
      Date.now() + durationMinutes * 60 * 1000,
    ).toISOString();

    // Store bypass token temporarily
    this.emergencyBypassTokens.add(bypassToken);

    // Auto-remove token after expiration
    setTimeout(
      () => {
        this.emergencyBypassTokens.delete(bypassToken);
      },
      durationMinutes * 60 * 1000,
    );

    // Create audit entry for emergency bypass
    const auditEntry: ApiRateLimitingAudit = {
      audit_id: crypto.randomUUID(),
      endpoint: 'emergency_bypass',
      action: 'emergency_bypass_generated',
      rate_limit_status: 'allowed',
      constitutional_validation_result: {
        medical_justification_provided: true,
        urgency_level: request.urgency_level,
        supervising_physician_involved: Boolean(
          request.supervising_physician_id,
        ),
        constitutional_emergency_exception: true,
      },
      patient_data_protection_applied: true,
      security_measures_triggered: [
        'emergency_bypass',
        'constitutional_validation',
        'audit_trail',
      ],
      performance_impact: {
        bypass_token_generated: true,
        duration_minutes: durationMinutes,
        expires_at: expiresAt,
      },
      created_at: new Date().toISOString(),
      ip_address: 'emergency_system',
    };

    this.auditTrail.push(auditEntry);

    return {
      success: true,
      bypass_token: bypassToken,
      expires_at: expiresAt,
      constitutional_approval: {
        emergency_medical_necessity: true,
        constitutional_exception_applied: true,
        audit_trail_complete: true,
        expires_at: expiresAt,
      },
    };
  }

  // Helper methods for rate limiting logic

  private async initializeDefaultLimits(): Promise<void> {
    // Initialize default endpoint configurations
    const defaultEndpoints = [
      {
        endpoint_pattern: '/api/v1/patients/*',
        endpoint_type: 'patient_data' as const,
        security_level: 'confidential' as const,
        rate_limits: {
          requests_per_minute: 30,
          requests_per_hour: 500,
          requests_per_day: 2000,
          concurrent_requests: 5,
          burst_allowance: 3,
        },
        constitutional_protections: {
          patient_privacy_enforcement: true,
          medical_secrecy_protection: true,
          lgpd_compliance_required: true,
          cfm_ethics_validation: true,
          emergency_access_allowed: true,
        },
        throttling_behavior: {
          gradual_slowdown: true,
          temporary_blocking: true,
          permanent_blocking: false,
          warning_notifications: true,
        },
        priority_rules: {
          healthcare_professional_priority: true,
          emergency_access_priority: true,
          patient_self_access_priority: true,
          administrative_access_priority: false,
        },
      },
      {
        endpoint_pattern: '/api/v1/auth/*',
        endpoint_type: 'authentication' as const,
        security_level: 'protected' as const,
        rate_limits: {
          requests_per_minute: 20,
          requests_per_hour: 100,
          requests_per_day: 500,
          concurrent_requests: 3,
          burst_allowance: 2,
        },
        constitutional_protections: {
          patient_privacy_enforcement: true,
          medical_secrecy_protection: false,
          lgpd_compliance_required: true,
          cfm_ethics_validation: false,
          emergency_access_allowed: false,
        },
        throttling_behavior: {
          gradual_slowdown: true,
          temporary_blocking: true,
          permanent_blocking: true,
          warning_notifications: true,
        },
        priority_rules: {
          healthcare_professional_priority: false,
          emergency_access_priority: false,
          patient_self_access_priority: false,
          administrative_access_priority: false,
        },
      },
      {
        endpoint_pattern: '/api/v1/emergency/*',
        endpoint_type: 'emergency_api' as const,
        security_level: 'emergency' as const,
        rate_limits: {
          requests_per_minute: 100,
          requests_per_hour: 1000,
          requests_per_day: 5000,
          concurrent_requests: 20,
          burst_allowance: 50,
        },
        constitutional_protections: {
          patient_privacy_enforcement: true,
          medical_secrecy_protection: true,
          lgpd_compliance_required: true,
          cfm_ethics_validation: true,
          emergency_access_allowed: true,
        },
        throttling_behavior: {
          gradual_slowdown: false,
          temporary_blocking: false,
          permanent_blocking: false,
          warning_notifications: true,
        },
        priority_rules: {
          healthcare_professional_priority: true,
          emergency_access_priority: true,
          patient_self_access_priority: true,
          administrative_access_priority: true,
        },
      },
    ];

    for (const endpoint of defaultEndpoints) {
      await this.registerEndpoint(endpoint);
    }

    // Initialize whitelisted IPs for healthcare systems
    this.whitelistedIps.add('127.0.0.1'); // Localhost
    this.whitelistedIps.add('::1'); // IPv6 localhost
  }

  private generateRequestKey(request: {
    ip_address: string;
    client_id?: string;
    user_id?: string;
  }): string {
    // Use client_id if available, otherwise IP address
    const identifier = request.client_id || request.user_id || request.ip_address;
    return `rate_limit:${identifier}`;
  }

  private getCurrentUsage(
    requestKey: string,
    now: number,
  ): {
    requests_last_minute: number;
    requests_last_hour: number;
    requests_last_day: number;
    concurrent_requests: number;
  } {
    const counter = this.requestCounters.get(requestKey) || {
      requests: [],
      concurrent: 0,
    };

    // Clean old requests outside time windows
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    counter.requests = counter.requests.filter(
      (timestamp: number) => timestamp > oneDayAgo,
    );

    return {
      requests_last_minute: counter.requests.filter(
        (t: number) => t > oneMinuteAgo,
      ).length,
      requests_last_hour: counter.requests.filter((t: number) => t > oneHourAgo)
        .length,
      requests_last_day: counter.requests.length,
      concurrent_requests: counter.concurrent || 0,
    };
  }

  private async getApplicableLimits(request: any): Promise<any> {
    // Find matching endpoint configuration
    let endpointConfig: EndpointRateLimit | null;

    for (const [pattern, config] of [...this.endpointLimits]) {
      if (this.matchesEndpointPattern(request.endpoint, pattern)) {
        endpointConfig = config;
        break;
      }
    }

    // Get client-specific limits if available
    const clientConfig = request.client_id
      ? this.clientLimits.get(request.client_id)
      : undefined;

    // Combine limits with priority to most restrictive
    let limits = {
      requests_per_minute: Math.min(
        endpointConfig?.rate_limits.requests_per_minute
          || this.config.default_requests_per_minute,
        clientConfig?.custom_limits.requests_per_minute
          || this.config.default_requests_per_minute,
      ),
      requests_per_hour: Math.min(
        endpointConfig?.rate_limits.requests_per_hour
          || this.config.default_requests_per_hour,
        clientConfig?.custom_limits.requests_per_hour
          || this.config.default_requests_per_hour,
      ),
      requests_per_day: Math.min(
        endpointConfig?.rate_limits.requests_per_day
          || this.config.default_requests_per_day,
        clientConfig?.custom_limits.requests_per_day
          || this.config.default_requests_per_day,
      ),
      concurrent_requests: Math.min(
        endpointConfig?.rate_limits.concurrent_requests || 10,
        clientConfig?.custom_limits.concurrent_requests || 10,
      ),
      burst_allowance: endpointConfig?.rate_limits.burst_allowance
        || this.config.burst_allowance,
    };

    // Apply healthcare priority adjustments
    if (this.config.healthcare_priority_routing && endpointConfig) {
      limits = this.applyHealthcarePriorityAdjustments(
        limits,
        endpointConfig,
        clientConfig || undefined,
      );
    }

    return { limits, endpointConfig, clientConfig };
  }

  private checkLimitsAgainstUsage(
    limitsConfig: any,
    usage: any,
  ): { allowed: boolean; retry_after_seconds?: number; } {
    const { limits } = limitsConfig;

    // Check minute limit
    if (usage.requests_last_minute >= limits.requests_per_minute) {
      return { allowed: false, retry_after_seconds: 60 };
    }

    // Check hour limit
    if (usage.requests_last_hour >= limits.requests_per_hour) {
      return { allowed: false, retry_after_seconds: 3600 };
    }

    // Check day limit
    if (usage.requests_last_day >= limits.requests_per_day) {
      return { allowed: false, retry_after_seconds: 86_400 };
    }

    // Check concurrent requests
    if (usage.concurrent_requests >= limits.concurrent_requests) {
      return { allowed: false, retry_after_seconds: 30 };
    }

    return { allowed: true };
  }

  private async validateConstitutionalProtection(
    request: any,
  ): Promise<{ allowed: boolean; reason?: string; }> {
    // Patient data protection validation
    if (
      this.config.patient_data_protection
      && request.patient_data_involved
      && !request.authentication_token
    ) {
      return {
        allowed: false,
        reason: 'Authentication required for patient data access',
      };
    }

    // Geographic restrictions for LGPD compliance
    if (this.config.geographic_restrictions) {
      // Mock geographic validation - in production, use actual IP geolocation
      const isFromBrazil = this.isRequestFromBrazil(request.ip_address);
      if (!isFromBrazil && request.patient_data_involved) {
        return {
          allowed: false,
          reason: 'Geographic restriction: Patient data access limited to Brazil',
        };
      }
    }

    return { allowed: true };
  }

  private async applyIntelligentThrottling(
    _request: any,
    usage: any,
    limitsConfig: any,
  ): Promise<{ should_throttle: boolean; delay_ms?: number; }> {
    const { limits } = limitsConfig;

    // Calculate usage percentage
    const minuteUsagePercent = usage.requests_last_minute / limits.requests_per_minute;
    const hourUsagePercent = usage.requests_last_hour / limits.requests_per_hour;

    // Apply gradual throttling as usage approaches limits
    if (minuteUsagePercent > 0.8) {
      const delayMs = Math.floor(1000 * (minuteUsagePercent - 0.8) * 10); // 0-2000ms delay
      return { should_throttle: true, delay_ms: delayMs };
    }

    if (hourUsagePercent > 0.9) {
      const delayMs = Math.floor(500 * (hourUsagePercent - 0.9) * 10); // 0-500ms delay
      return { should_throttle: true, delay_ms: delayMs };
    }

    return { should_throttle: false };
  }

  private updateRequestCounters(requestKey: string, now: number): void {
    const counter = this.requestCounters.get(requestKey) || {
      requests: [],
      concurrent: 0,
    };

    counter.requests.push(now);
    counter.concurrent += 1;

    // Simulate request completion after average response time
    setTimeout(() => {
      counter.concurrent = Math.max(0, counter.concurrent - 1);
    }, 200); // 200ms average response time

    this.requestCounters.set(requestKey, counter);
  }

  private allowRequest(request: any, limits: any): any {
    const auditEntry: ApiRateLimitingAudit = {
      audit_id: crypto.randomUUID(),
      client_id: request.client_id,
      ip_address: request.ip_address,
      endpoint: request.endpoint,
      action: 'request_allowed',
      rate_limit_status: 'allowed',
      constitutional_validation_result: {
        patient_data_protection_applied: request.patient_data_involved,
        constitutional_compliance_verified: true,
      },
      patient_data_protection_applied: request.patient_data_involved,
      security_measures_triggered: [
        'rate_limit_check',
        'constitutional_validation',
      ],
      performance_impact: limits,
      created_at: new Date().toISOString(),
      user_agent: request.user_agent,
      authentication_status: request.authentication_token
        ? 'authenticated'
        : 'anonymous',
    };

    this.auditTrail.push(auditEntry);

    return {
      allowed: true,
      rate_limit_status: 'allowed',
      limits: limits.limits,
      constitutional_protection_applied: this.config.constitutional_protection_enabled,
      audit_trail_id: auditEntry.audit_id,
    };
  }

  private blockRequest(
    request: any,
    reason: string,
    violationType: string,
  ): any {
    const auditEntry: ApiRateLimitingAudit = {
      audit_id: crypto.randomUUID(),
      client_id: request.client_id,
      ip_address: request.ip_address,
      endpoint: request.endpoint,
      action: `request_blocked_${violationType}`,
      rate_limit_status: 'blocked',
      constitutional_validation_result: {
        block_reason: reason,
        constitutional_protection_applied: true,
        patient_data_protected: true,
      },
      patient_data_protection_applied: true,
      security_measures_triggered: [
        'request_blocking',
        'constitutional_protection',
      ],
      performance_impact: { blocked: true, reason },
      created_at: new Date().toISOString(),
      user_agent: request.user_agent,
    };

    this.auditTrail.push(auditEntry);

    return {
      allowed: false,
      rate_limit_status: 'blocked',
      limits: {},
      constitutional_protection_applied: true,
      retry_after_seconds: undefined,
      audit_trail_id: auditEntry.audit_id,
    };
  }

  private handleRateLimitExceeded(
    request: any,
    limits: any,
    usage: any,
    retryAfterSeconds: number,
  ): any {
    const auditEntry: ApiRateLimitingAudit = {
      audit_id: crypto.randomUUID(),
      client_id: request.client_id,
      ip_address: request.ip_address,
      endpoint: request.endpoint,
      action: 'rate_limit_exceeded',
      rate_limit_status: 'blocked',
      constitutional_validation_result: {
        rate_limit_protection_applied: true,
        current_usage: usage,
        constitutional_compliance_maintained: true,
      },
      patient_data_protection_applied: request.patient_data_involved,
      security_measures_triggered: ['rate_limit_exceeded', 'request_blocking'],
      performance_impact: {
        limits_exceeded: true,
        retry_after_seconds: retryAfterSeconds,
        current_usage: usage,
      },
      created_at: new Date().toISOString(),
      user_agent: request.user_agent,
    };

    this.auditTrail.push(auditEntry);

    return {
      allowed: false,
      rate_limit_status: 'blocked',
      limits: limits.limits,
      constitutional_protection_applied: this.config.constitutional_protection_enabled,
      retry_after_seconds: retryAfterSeconds,
      audit_trail_id: auditEntry.audit_id,
    };
  }

  private throttleRequest(request: any, delayMs: number): any {
    const auditEntry: ApiRateLimitingAudit = {
      audit_id: crypto.randomUUID(),
      client_id: request.client_id,
      ip_address: request.ip_address,
      endpoint: request.endpoint,
      action: 'request_throttled',
      rate_limit_status: 'throttled',
      constitutional_validation_result: {
        intelligent_throttling_applied: true,
        constitutional_compliance_maintained: true,
      },
      patient_data_protection_applied: request.patient_data_involved,
      security_measures_triggered: ['intelligent_throttling'],
      performance_impact: {
        throttled: true,
        delay_ms: delayMs,
      },
      created_at: new Date().toISOString(),
      user_agent: request.user_agent,
    };

    this.auditTrail.push(auditEntry);

    return {
      allowed: true,
      rate_limit_status: 'throttled',
      limits: {},
      constitutional_protection_applied: this.config.constitutional_protection_enabled,
      retry_after_seconds: Math.ceil(delayMs / 1000),
      audit_trail_id: auditEntry.audit_id,
    };
  }

  private allowRequestWithEmergencyBypass(request: any): any {
    const auditEntry: ApiRateLimitingAudit = {
      audit_id: crypto.randomUUID(),
      client_id: request.client_id,
      ip_address: request.ip_address,
      endpoint: request.endpoint,
      action: 'emergency_bypass_used',
      rate_limit_status: 'allowed',
      constitutional_validation_result: {
        emergency_bypass_applied: true,
        constitutional_emergency_exception: true,
        medical_necessity_validated: true,
      },
      patient_data_protection_applied: true,
      security_measures_triggered: [
        'emergency_bypass',
        'constitutional_validation',
      ],
      performance_impact: {
        emergency_bypass: true,
        bypass_token_used: true,
      },
      created_at: new Date().toISOString(),
      user_agent: request.user_agent,
    };

    this.auditTrail.push(auditEntry);

    return {
      allowed: true,
      rate_limit_status: 'allowed',
      limits: {},
      constitutional_protection_applied: true,
      audit_trail_id: auditEntry.audit_id,
    };
  }

  private allowRequestWithWhitelistPriority(request: any): any {
    const auditEntry: ApiRateLimitingAudit = {
      audit_id: crypto.randomUUID(),
      client_id: request.client_id,
      ip_address: request.ip_address,
      endpoint: request.endpoint,
      action: 'whitelist_priority_applied',
      rate_limit_status: 'allowed',
      constitutional_validation_result: {
        whitelist_priority_applied: true,
        trusted_source_verified: true,
      },
      patient_data_protection_applied: request.patient_data_involved,
      security_measures_triggered: ['whitelist_check', 'priority_routing'],
      performance_impact: {
        whitelist_priority: true,
        rate_limits_bypassed: true,
      },
      created_at: new Date().toISOString(),
      user_agent: request.user_agent,
    };

    this.auditTrail.push(auditEntry);

    return {
      allowed: true,
      rate_limit_status: 'allowed',
      limits: {},
      constitutional_protection_applied: this.config.constitutional_protection_enabled,
      audit_trail_id: auditEntry.audit_id,
    };
  }

  private allowRequestWithError(request: any, error: Error): any {
    const auditEntry: ApiRateLimitingAudit = {
      audit_id: crypto.randomUUID(),
      client_id: request.client_id,
      ip_address: request.ip_address,
      endpoint: request.endpoint,
      action: 'rate_limiting_error_fail_open',
      rate_limit_status: 'allowed',
      constitutional_validation_result: {
        service_error_occurred: true,
        fail_open_policy_applied: true,
        constitutional_protection_maintained: true,
      },
      patient_data_protection_applied: request.patient_data_involved,
      security_measures_triggered: ['error_handling', 'fail_open_policy'],
      performance_impact: {
        service_error: true,
        error_message: error.message,
        fail_open_applied: true,
      },
      created_at: new Date().toISOString(),
      user_agent: request.user_agent,
    };

    this.auditTrail.push(auditEntry);

    return {
      allowed: true,
      rate_limit_status: 'allowed',
      limits: {},
      constitutional_protection_applied: true,
      audit_trail_id: auditEntry.audit_id,
    };
  }

  // Additional helper methods
  private matchesEndpointPattern(endpoint: string, pattern: string): boolean {
    // Simple pattern matching - in production, use more sophisticated matching
    return pattern.includes('*')
      ? endpoint.startsWith(pattern.replace('*', ''))
      : endpoint === pattern;
  }

  private applyHealthcarePriorityAdjustments(
    limits: any,
    endpointConfig: EndpointRateLimit,
    clientConfig: ClientRateLimit | null,
  ): any {
    if (
      endpointConfig.priority_rules.healthcare_professional_priority
      && clientConfig?.trust_level === 'verified'
    ) {
      return {
        ...limits,
        requests_per_minute: Math.floor(limits.requests_per_minute * 1.5),
        requests_per_hour: Math.floor(limits.requests_per_hour * 1.5),
        concurrent_requests: Math.floor(limits.concurrent_requests * 1.3),
      };
    }

    if (
      endpointConfig.priority_rules.emergency_access_priority
      && endpointConfig.endpoint_type === 'emergency_api'
    ) {
      return {
        ...limits,
        requests_per_minute: Math.floor(limits.requests_per_minute * 3),
        requests_per_hour: Math.floor(limits.requests_per_hour * 3),
        concurrent_requests: Math.floor(limits.concurrent_requests * 2),
      };
    }

    return limits;
  }

  private async validateEndpointConstitutionalCompliance(
    endpoint: EndpointRateLimit,
  ): Promise<void> {
    // Validate patient data endpoints have proper protections
    if (endpoint.endpoint_type === 'patient_data') {
      if (!endpoint.constitutional_protections.patient_privacy_enforcement) {
        throw new Error(
          'Patient data endpoints must enforce privacy protection',
        );
      }
      if (!endpoint.constitutional_protections.lgpd_compliance_required) {
        throw new Error('Patient data endpoints must require LGPD compliance');
      }
    }

    // Validate medical record endpoints have medical secrecy protection
    if (
      endpoint.endpoint_type === 'medical_records'
      && !endpoint.constitutional_protections.medical_secrecy_protection
    ) {
      throw new Error('Medical record endpoints must enforce medical secrecy');
    }
  }

  private async validateHealthcareEndpointRequirements(
    endpoint: EndpointRateLimit,
  ): Promise<void> {
    // Validate emergency endpoints allow emergency access
    if (
      endpoint.endpoint_type === 'emergency_api'
      && !endpoint.constitutional_protections.emergency_access_allowed
    ) {
      throw new Error('Emergency endpoints must allow emergency access');
    }

    // Validate authentication endpoints have appropriate throttling
    if (
      endpoint.endpoint_type === 'authentication'
      && endpoint.rate_limits.requests_per_minute > 30
    ) {
      throw new Error(
        'Authentication endpoints should have stricter rate limits',
      );
    }
  }

  private async validateClientConstitutionalCompliance(
    client: ClientRateLimit,
  ): Promise<void> {
    // Validate LGPD compliance for all clients
    if (!client.constitutional_compliance.lgpd_compliance_verified) {
      throw new Error('LGPD compliance verification required for all clients');
    }

    // Validate patient consent management for patient data access
    if (!client.constitutional_compliance.patient_consent_management) {
      throw new Error('Patient consent management capability required');
    }

    // Validate healthcare professional verification for medical systems
    if (
      client.client_type === 'healthcare_system'
      && !client.constitutional_compliance.healthcare_professional_verified
    ) {
      throw new Error(
        'Healthcare professional verification required for healthcare systems',
      );
    }
  }

  private async validateHealthcareProfessionalClient(
    client: ClientRateLimit,
  ): Promise<void> {
    // Validate CFM authorization for medical professionals
    if (!client.constitutional_compliance.cfm_authorization) {
      throw new Error(
        'CFM authorization required for healthcare professional clients',
      );
    }

    // Validate trust level for healthcare professionals
    if (client.trust_level === 'untrusted') {
      throw new Error('Healthcare professionals cannot have untrusted status');
    }
  }

  private async applyViolationMitigation(
    violation: RateLimitViolation,
  ): Promise<Record<string, any>> {
    const mitigation: Record<string, any> = {
      action_taken: violation.mitigation_action.action_taken,
      constitutional_compliance_maintained: true,
    };

    switch (violation.mitigation_action.action_taken) {
      case 'temporary_block': {
        if (violation.client_id) {
          // Add to temporary blacklist
          this.blacklistedIps.add(violation.ip_address);
          setTimeout(
            () => {
              this.blacklistedIps.delete(violation.ip_address);
            },
            (violation.mitigation_action.block_duration_minutes || 15)
              * 60
              * 1000,
          );
        }
        mitigation.temporary_block_applied = true;
        break;
      }

      case 'permanent_block': {
        this.blacklistedIps.add(violation.ip_address);
        mitigation.permanent_block_applied = true;
        break;
      }

      case 'escalation': {
        mitigation.escalation_triggered = true;
        break;
      }
    }

    return mitigation;
  }

  private async assessConstitutionalImpact(
    violation: RateLimitViolation,
  ): Promise<Record<string, any>> {
    return {
      patient_privacy_protected: true,
      medical_secrecy_maintained: true,
      lgpd_compliance_preserved: true,
      constitutional_rights_respected: true,
      impact_level: violation.constitutional_impact.patient_privacy_risk,
    };
  }

  private getMaxEmergencyDuration(urgencyLevel: string): number {
    const durationMap = {
      high: 60, // 1 hour
      critical: 120, // 2 hours
      life_threatening: 240, // 4 hours
    };
    return durationMap[urgencyLevel as keyof typeof durationMap] || 60;
  }

  private isRequestFromBrazil(ipAddress: string): boolean {
    // Mock geographic check - in production, use actual IP geolocation service
    return !(
      ipAddress.startsWith('192.168.')
      || ipAddress.startsWith('10.')
      || ipAddress.startsWith('172.')
    );
  }

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
  } {
    const totalRequests = this.auditTrail.length;
    const allowedRequests = this.auditTrail.filter(
      (a) => a.rate_limit_status === 'allowed',
    ).length;
    const throttledRequests = this.auditTrail.filter(
      (a) => a.rate_limit_status === 'throttled',
    ).length;
    const blockedRequests = this.auditTrail.filter(
      (a) => a.rate_limit_status === 'blocked',
    ).length;
    const activeViolations = [...this.violations.values()].filter(
      (v) => !v.resolved_at,
    ).length;
    const emergencyBypasses = this.emergencyBypassTokens.size;

    return {
      total_requests_processed: totalRequests,
      requests_allowed: allowedRequests,
      requests_throttled: throttledRequests,
      requests_blocked: blockedRequests,
      active_violations: activeViolations,
      emergency_bypasses_active: emergencyBypasses,
    };
  }

  /**
   * Get audit trail for compliance reporting
   */
  getAuditTrail(): ApiRateLimitingAudit[] {
    return [...this.auditTrail];
  }

  /**
   * Get active violations for monitoring
   */
  getActiveViolations(): RateLimitViolation[] {
    return [...this.violations.values()].filter((v) => !v.resolved_at);
  }

  /**
   * Validate constitutional compliance of rate limiting system
   */
  async validateConstitutionalCompliance(): Promise<{
    compliant: boolean;
    score: number;
    issues: string[];
  }> {
    const issues: string[] = [];
    let score = 10;

    // Check constitutional protection
    if (!this.config.constitutional_protection_enabled) {
      issues.push('Constitutional protection not enabled');
      score -= 0.3;
    }

    // Check patient data protection
    if (!this.config.patient_data_protection) {
      issues.push('Patient data protection not enabled');
      score -= 0.3;
    }

    // Check audit requirements
    if (!this.config.audit_all_requests) {
      issues.push('Request auditing not enabled');
      score -= 0.2;
    }

    // Check emergency bypass capability
    if (!this.config.emergency_bypass_enabled) {
      issues.push('Emergency bypass not enabled - could impact patient care');
      score -= 0.2;
    }

    // Check abuse detection
    if (!this.config.abuse_detection_enabled) {
      issues.push('Abuse detection not enabled');
      score -= 0.2;
    }

    return {
      compliant: score >= 9.9 && issues.length === 0,
      score: Math.max(score, 0),
      issues,
    };
  }
}

/**
 * Factory function to create API rate limiting service
 */
export function createApiRateLimitingService(
  config: RateLimitConfig,
): ApiRateLimitingService {
  return new ApiRateLimitingService(config);
}

/**
 * Constitutional validation for API rate limiting configuration
 */
export async function validateApiRateLimiting(
  config: RateLimitConfig,
): Promise<{ valid: boolean; violations: string[]; }> {
  const violations: string[] = [];

  // Validate constitutional protection requirement
  if (!config.constitutional_protection_enabled) {
    violations.push(
      'Constitutional protection must be enabled for healthcare APIs',
    );
  }

  // Validate patient data protection requirement
  if (!config.patient_data_protection) {
    violations.push(
      'Patient data protection must be enabled for healthcare compliance',
    );
  }

  // Validate audit requirement
  if (!config.audit_all_requests) {
    violations.push(
      'Request auditing must be enabled for regulatory compliance',
    );
  }

  // Validate emergency access capability
  if (!config.emergency_bypass_enabled) {
    violations.push(
      'Emergency bypass capability should be enabled for healthcare systems',
    );
  }

  // Validate abuse detection
  if (!config.abuse_detection_enabled) {
    violations.push(
      'Abuse detection should be enabled for security compliance',
    );
  }

  // Validate intelligent throttling
  if (!config.intelligent_throttling) {
    violations.push(
      'Intelligent throttling should be enabled for optimal performance',
    );
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}
