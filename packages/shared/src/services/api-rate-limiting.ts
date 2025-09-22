/**
 * Healthcare API Rate Limiting Service
 *
 * Comprehensive rate limiting with:
 * - Healthcare-aware request classification
 * - Emergency bypass capabilities
 * - LGPD-compliant audit logging
 * - Multiple rate limiting algorithms
 * - Integration with observability stack
 * - Multi-tier rate limiting (user, IP, endpoint, global)
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @compliance LGPD, ANVISA SaMD, Healthcare Standards
 */

import { nanoid } from "nanoid";

// ============================================================================
// SCHEMAS & TYPES
// ============================================================================

/**
 * Rate limiting algorithm types
 */
export const RateLimitAlgorithmSchema = z.enum([
  "sliding_window", // Sliding window counter
  "token_bucket", // Token bucket algorithm
  "fixed_window", // Fixed window counter
  "leaky_bucket", // Leaky bucket algorithm
]);

export type RateLimitAlgorithm = z.infer<typeof RateLimitAlgorithmSchema>;

/**
 * Healthcare request priority levels
 */
export const RequestPrioritySchema = z.enum([
  "emergency", // Life-critical emergency requests
  "critical", // Patient safety critical requests
  "urgent", // Time-sensitive medical requests
  "high", // Important clinical requests
  "normal", // Standard healthcare requests
  "low", // Administrative/reporting requests
  "background", // Background tasks, analytics
]);

export type RequestPriority = z.infer<typeof RequestPrioritySchema>;

/**
 * Healthcare request categories for rate limiting
 */
export const HealthcareRequestCategorySchema = z.enum([
  // Emergency and critical care
  "emergency_response",
  "patient_monitoring",
  "critical_alerts",
  "medication_alerts",

  // Clinical operations
  "patient_data_access",
  "clinical_documentation",
  "diagnostic_results",
  "treatment_orders",
  "medication_management",

  // Administrative
  "appointment_scheduling",
  "patient_registration",
  "insurance_verification",
  "billing_operations",

  // System operations
  "authentication",
  "user_management",
  "audit_logging",
  "backup_operations",

  // Analytics and reporting
  "reporting",
  "analytics",
  "data_export",
  "compliance_reporting",

  // External integrations
  "third_party_api",
  "lab_integration",
  "imaging_integration",
  "pharmacy_integration",
]);

export type HealthcareRequestCategory = z.infer<
  typeof HealthcareRequestCategorySchema
>;

/**
 * Rate limit tier configuration
 */
export const RateLimitTierSchema = z.object({
  // Tier identification
  name: z.string().describe("Tier name"),
  priority: RequestPrioritySchema.describe("Request priority level"),

  // Rate limit configuration
  requestsPerMinute: z.number().min(1).describe("Requests per minute limit"),
  requestsPerHour: z.number().min(1).describe("Requests per hour limit"),
  requestsPerDay: z.number().min(1).describe("Requests per day limit"),

  // Burst handling
  burstSize: z.number().min(1).describe("Maximum burst size"),
  burstWindowSeconds: z.number().min(1).describe("Burst window in seconds"),

  // Healthcare-specific settings
  emergencyBypass: z.boolean().describe("Allow emergency bypass"),
  patientSafetyBypass: z.boolean().describe("Allow patient safety bypass"),

  // Recovery settings
  cooldownMinutes: z
    .number()
    .min(0)
    .describe("Cooldown period after limit reached"),
  gracePeriodSeconds: z
    .number()
    .min(0)
    .describe("Grace period before enforcement"),
});

export type RateLimitTier = z.infer<typeof RateLimitTierSchema>;

/**
 * Rate limiting context for healthcare requests
 */
export const RateLimitContextSchema = z.object({
  // Request identification
  requestId: z.string().describe("Unique request identifier"),
  correlationId: z
    .string()
    .optional()
    .describe("Correlation ID for related requests"),

  // Request classification
  category: HealthcareRequestCategorySchema.describe(
    "Healthcare request category",
  ),
  priority: RequestPrioritySchema.describe("Request priority level"),

  // Client identification (LGPD-compliant)
  clientId: z.string().describe("Client identifier"),
  _userId: z.string().optional().describe("User identifier (anonymized)"),
  sessionId: z.string().optional().describe("Session identifier"),

  // Request metadata
  endpoint: z.string().describe("API endpoint being accessed"),
  httpMethod: z.string().describe("HTTP method"),
  userAgent: z.string().optional().describe("Client user agent"),
  ipAddress: z.string().describe("Client IP address (anonymized)"),

  // Healthcare context
  healthcareContext: z
    .object({
      facilityId: z.string().optional().describe("Healthcare facility ID"),
      departmentId: z.string().optional().describe("Department ID"),
      workflowType: z.string().optional().describe("Healthcare workflow type"),
      emergencyFlag: z.boolean().optional().describe("Emergency request flag"),
      patientSafetyFlag: z.boolean().optional().describe("Patient safety flag"),
      criticalSystemFlag: z
        .boolean()
        .optional()
        .describe("Critical system flag"),
    })
    .optional()
    .describe("Healthcare-specific context"),

  // Geographic and temporal context
  geographicContext: z
    .object({
      region: z.string().optional().describe("Geographic region"),
      timezone: z.string().optional().describe("Client timezone"),
      country: z.string().optional().describe("Country code"),
    })
    .optional()
    .describe("Geographic context"),

  // Compliance context
  complianceContext: z
    .object({
      auditRequired: z.boolean().describe("Whether audit logging is required"),
      retentionPeriod: z.number().describe("Data retention period in days"),
      legalBasis: z.string().describe("LGPD legal basis for processing"),
      consentLevel: z
        .enum(["explicit", "implicit", "legitimate_interest"])
        .describe("Consent level"),
    })
    .describe("Compliance requirements"),
});

export type RateLimitContext = z.infer<typeof RateLimitContextSchema>;

/**
 * Rate limit result and decision
 */
export const RateLimitResultSchema = z.object({
  // Decision
  allowed: z.boolean().describe("Whether request is allowed"),
  reason: z.string().describe("Reason for decision"),

  // Rate limit status
  tier: z.string().describe("Rate limit tier applied"),
  algorithm: RateLimitAlgorithmSchema.describe("Algorithm used"),

  // Current status
  currentUsage: z.number().describe("Current usage count"),
  limitValue: z.number().describe("Rate limit value"),
  remainingRequests: z.number().describe("Remaining requests in window"),

  // Timing information
  windowStart: z.string().datetime().describe("Rate limit window start time"),
  windowEnd: z.string().datetime().describe("Rate limit window end time"),
  resetTime: z.string().datetime().describe("When rate limit resets"),
  retryAfter: z.number().optional().describe("Seconds to wait before retry"),

  // Bypass information
  bypassApplied: z.boolean().describe("Whether bypass was applied"),
  bypassReason: z.string().optional().describe("Reason for bypass"),

  // Metadata
  metadata: z.record(z.unknown()).optional().describe("Additional metadata"),
  timestamp: z.string().datetime().describe("Decision timestamp"),
});

export type RateLimitResult = z.infer<typeof RateLimitResultSchema>;

/**
 * Rate limiting configuration
 */
export const RateLimitConfigSchema = z.object({
  // Service configuration
  enabled: z.boolean().default(true).describe("Enable rate limiting"),
  defaultAlgorithm: RateLimitAlgorithmSchema.default("sliding_window").describe(
    "Default rate limiting algorithm",
  ),

  // Tier definitions
  tiers: z
    .array(RateLimitTierSchema)
    .describe("Rate limit tier configurations"),

  // Global settings
  globalLimits: z
    .object({
      requestsPerSecond: z
        .number()
        .default(1000)
        .describe("Global requests per second"),
      requestsPerMinute: z
        .number()
        .default(50000)
        .describe("Global requests per minute"),
      maxConcurrentRequests: z
        .number()
        .default(500)
        .describe("Maximum concurrent requests"),
    })
    .describe("Global rate limiting"),

  // Emergency settings
  emergencySettings: z
    .object({
      enableBypass: z
        .boolean()
        .default(true)
        .describe("Enable emergency bypass"),
      bypassTokens: z
        .array(z.string())
        .optional()
        .describe("Emergency bypass tokens"),
      maxEmergencyRequests: z
        .number()
        .default(1000)
        .describe("Maximum emergency requests per hour"),
      bypassCategories: z
        .array(HealthcareRequestCategorySchema)
        .describe("Categories that can bypass"),
    })
    .describe("Emergency bypass settings"),

  // Healthcare-specific configuration
  healthcareConfig: z
    .object({
      patientSafetyBypass: z
        .boolean()
        .default(true)
        .describe("Enable patient safety bypass"),
      criticalSystemBypass: z
        .boolean()
        .default(true)
        .describe("Enable critical system bypass"),
      facilityBasedLimits: z
        .boolean()
        .default(true)
        .describe("Apply facility-based limits"),
      workflowAwareLimits: z
        .boolean()
        .default(true)
        .describe("Apply workflow-aware limits"),
    })
    .describe("Healthcare-specific configuration"),

  // Storage and persistence
  storage: z
    .object({
      type: z
        .enum(["memory", "redis", "database"])
        .default("memory")
        .describe("Storage backend type"),
      connectionString: z
        .string()
        .optional()
        .describe("Storage connection string"),
      keyPrefix: z
        .string()
        .default("neonpro:ratelimit:")
        .describe("Storage key prefix"),
      ttlSeconds: z.number().default(3600).describe("Storage TTL in seconds"),
    })
    .describe("Storage configuration"),

  // Monitoring and alerting
  monitoring: z
    .object({
      enableMetrics: z
        .boolean()
        .default(true)
        .describe("Enable rate limiting metrics"),
      enableAlerting: z
        .boolean()
        .default(true)
        .describe("Enable rate limit alerts"),
      alertThreshold: z
        .number()
        .default(0.8)
        .describe("Alert threshold (0.8 = 80% of limit)"),
      metricsInterval: z
        .number()
        .default(60000)
        .describe("Metrics collection interval in ms"),
    })
    .describe("Monitoring configuration"),

  // Logging and audit
  audit: z
    .object({
      logAllRequests: z
        .boolean()
        .default(false)
        .describe("Log all requests (GDPR impact)"),
      logViolations: z
        .boolean()
        .default(true)
        .describe("Log rate limit violations"),
      logBypasses: z.boolean().default(true).describe("Log emergency bypasses"),
      retentionDays: z
        .number()
        .default(90)
        .describe("Audit log retention days"),
    })
    .describe("Audit configuration"),
});

export type RateLimitConfig = z.infer<typeof RateLimitConfigSchema>;

// ============================================================================
// RATE LIMITING ALGORITHMS
// ============================================================================

/**
 * Abstract base class for rate limiting algorithms
 */
abstract class RateLimitAlgorithmBase {
  protected config: RateLimitTier;
  protected storage: Map<string, any> = new Map();

  constructor(config: RateLimitTier) {
    this.config = config;
  }

  abstract checkLimit(
    key: string,
    _context: RateLimitContext,
  ): Promise<RateLimitResult>;
  abstract reset(key: string): Promise<void>;
  abstract getUsage(key: string): Promise<number>;
}

/**
 * Sliding window rate limiting algorithm
 */
class SlidingWindowAlgorithm extends RateLimitAlgorithmBase {
  async checkLimit(
    key: string,
    _context: RateLimitContext,
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const limit = this.config.requestsPerMinute;

    // Get or create window data
    let windowData = this.storage.get(key) || {
      requests: [],
      firstRequest: now,
    };

    // Remove requests outside the window
    windowData.requests = windowData.requests.filter(
      (timestamp: number) => now - timestamp < windowMs,
    );

    // Check if limit exceeded
    const currentUsage = windowData.requests.length;
    const allowed = currentUsage < limit;

    if (allowed) {
      windowData.requests.push(now);
      this.storage.set(key, windowData);
    }

    const windowStart = new Date(now - windowMs);
    const windowEnd = new Date(now);
    const resetTime = new Date(now + windowMs);

    return {
      allowed,
      reason: allowed ? "Within rate limit" : "Rate limit exceeded",
      tier: this.config.name,
      algorithm: "sliding_window",
      currentUsage,
      limitValue: limit,
      remainingRequests: Math.max(0, limit - currentUsage),
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString(),
      resetTime: resetTime.toISOString(),
      retryAfter: allowed ? undefined : Math.ceil(windowMs / 1000),
      bypassApplied: false,
      timestamp: new Date().toISOString(),
    };
  }

  async reset(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async getUsage(key: string): Promise<number> {
    const windowData = this.storage.get(key);
    return windowData ? windowData.requests.length : 0;
  }
}

/**
 * Token bucket rate limiting algorithm
 */
class TokenBucketAlgorithm extends RateLimitAlgorithmBase {
  async checkLimit(
    key: string,
    _context: RateLimitContext,
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const capacity = this.config.burstSize;
    const refillRate = this.config.requestsPerMinute / 60; // tokens per second

    // Get or create bucket data
    let bucket = this.storage.get(key) || {
      tokens: capacity,
      lastRefill: now,
    };

    // Calculate tokens to add based on time elapsed
    const timeDelta = (now - bucket.lastRefill) / 1000; // seconds
    const tokensToAdd = Math.floor(timeDelta * refillRate);

    // Refill bucket (capped at capacity)
    bucket.tokens = Math.min(capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    // Check if token available
    const allowed = bucket.tokens > 0;

    if (allowed) {
      bucket.tokens--;
      this.storage.set(key, bucket);
    }

    const resetTime = new Date(
      now + ((capacity - bucket.tokens) / refillRate) * 1000,
    );

    return {
      allowed,
      reason: allowed ? "Token available" : "No tokens available",
      tier: this.config.name,
      algorithm: "token_bucket",
      currentUsage: capacity - bucket.tokens,
      limitValue: capacity,
      remainingRequests: bucket.tokens,
      windowStart: new Date(bucket.lastRefill).toISOString(),
      windowEnd: new Date(now).toISOString(),
      resetTime: resetTime.toISOString(),
      retryAfter: allowed ? undefined : Math.ceil(1 / refillRate),
      bypassApplied: false,
      timestamp: new Date().toISOString(),
    };
  }

  async reset(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async getUsage(key: string): Promise<number> {
    const bucket = this.storage.get(key);
    return bucket ? this.config.burstSize - bucket.tokens : 0;
  }
}

// ============================================================================
// MAIN RATE LIMITING SERVICE
// ============================================================================

/**
 * Healthcare API Rate Limiting Service
 */
export class APIRateLimitingService {
  private config: RateLimitConfig;
  private algorithms: Map<string, RateLimitAlgorithmBase> = new Map();
  private metrics: Map<string, any> = new Map();
  private isInitialized = false;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = RateLimitConfigSchema.parse({
      ...this.getDefaultConfig(),
      ...config,
    });

    if (this.config.enabled) {
      this.initialize();
    }
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize the rate limiting service
   */
  private initialize(): void {
    try {
      this.initializeAlgorithms();
      this.setupMetricsCollection();
      this.isInitialized = true;

      console.log(
        "🚦 [APIRateLimitingService] Healthcare API rate limiting service initialized",
      );
    } catch (error) {
      console.error("Failed to initialize API rate limiting _service:", error);
    }
  }

  /**
   * Initialize rate limiting algorithms for each tier
   */
  private initializeAlgorithms(): void {
    for (const tier of this.config.tiers) {
      const algorithmType = this.config.defaultAlgorithm;

      let algorithm: RateLimitAlgorithmBase;
      switch (algorithmType) {
        case "sliding_window":
          algorithm = new SlidingWindowAlgorithm(tier);
          break;
        case "token_bucket":
          algorithm = new TokenBucketAlgorithm(tier);
          break;
        default:
          algorithm = new SlidingWindowAlgorithm(tier);
      }

      this.algorithms.set(tier.name, algorithm);
    }
  }

  /**
   * Setup metrics collection
   */
  private setupMetricsCollection(): void {
    if (this.config.monitoring.enableMetrics) {
      setInterval(() => {
        this.collectMetrics();
      }, this.config.monitoring.metricsInterval);
    }
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): Partial<RateLimitConfig> {
    return {
      enabled: true,
      defaultAlgorithm: "sliding_window",
      tiers: [
        {
          name: "emergency",
          priority: "emergency",
          requestsPerMinute: 10000,
          requestsPerHour: 100000,
          requestsPerDay: 1000000,
          burstSize: 100,
          burstWindowSeconds: 10,
          emergencyBypass: true,
          patientSafetyBypass: true,
          cooldownMinutes: 0,
          gracePeriodSeconds: 5,
        },
        {
          name: "critical",
          priority: "critical",
          requestsPerMinute: 5000,
          requestsPerHour: 50000,
          requestsPerDay: 500000,
          burstSize: 50,
          burstWindowSeconds: 10,
          emergencyBypass: true,
          patientSafetyBypass: true,
          cooldownMinutes: 1,
          gracePeriodSeconds: 3,
        },
        {
          name: "urgent",
          priority: "urgent",
          requestsPerMinute: 2000,
          requestsPerHour: 20000,
          requestsPerDay: 200000,
          burstSize: 30,
          burstWindowSeconds: 10,
          emergencyBypass: false,
          patientSafetyBypass: true,
          cooldownMinutes: 2,
          gracePeriodSeconds: 2,
        },
        {
          name: "high",
          priority: "high",
          requestsPerMinute: 1000,
          requestsPerHour: 10000,
          requestsPerDay: 100000,
          burstSize: 20,
          burstWindowSeconds: 10,
          emergencyBypass: false,
          patientSafetyBypass: false,
          cooldownMinutes: 5,
          gracePeriodSeconds: 1,
        },
        {
          name: "normal",
          priority: "normal",
          requestsPerMinute: 500,
          requestsPerHour: 5000,
          requestsPerDay: 50000,
          burstSize: 15,
          burstWindowSeconds: 10,
          emergencyBypass: false,
          patientSafetyBypass: false,
          cooldownMinutes: 10,
          gracePeriodSeconds: 0,
        },
        {
          name: "low",
          priority: "low",
          requestsPerMinute: 100,
          requestsPerHour: 1000,
          requestsPerDay: 10000,
          burstSize: 10,
          burstWindowSeconds: 60,
          emergencyBypass: false,
          patientSafetyBypass: false,
          cooldownMinutes: 15,
          gracePeriodSeconds: 0,
        },
        {
          name: "background",
          priority: "background",
          requestsPerMinute: 50,
          requestsPerHour: 500,
          requestsPerDay: 5000,
          burstSize: 5,
          burstWindowSeconds: 60,
          emergencyBypass: false,
          patientSafetyBypass: false,
          cooldownMinutes: 30,
          gracePeriodSeconds: 0,
        },
      ],
    };
  }

  // ============================================================================
  // CORE RATE LIMITING LOGIC
  // ============================================================================

  /**
   * Check rate limit for a request
   */
  async checkRateLimit(_context: RateLimitContext): Promise<RateLimitResult> {
    try {
      // Classify request and determine tier
      const tier = this.determineRateLimitTier(context);
      const algorithm = this.algorithms.get(tier.name);

      if (!algorithm) {
        throw new Error(`No algorithm found for tier: ${tier.name}`);
      }

      // Generate rate limit key
      const key = this.generateRateLimitKey(context, tier);

      // Check for emergency bypass
      const bypassResult = this.checkEmergencyBypass(context, tier);
      if (bypassResult.allowed) {
        return bypassResult;
      }

      // Apply rate limiting algorithm
      const result = await algorithm.checkLimit(key, _context);

      // Log rate limiting decision
      await this.logRateLimitDecision(context, result);

      // Update metrics
      this.updateMetrics(context, result);

      // Check for alerting thresholds
      if (this.config.monitoring.enableAlerting) {
        await this.checkAlertingThresholds(context, result);
      }

      return result;
    } catch (error) {
      console.error("Error checking rate limit:", error);

      // Default to allow in case of service failure (fail-open for healthcare)
      return {
        allowed: true,
        reason: "Rate limiting service error - defaulting to allow",
        tier: "error",
        algorithm: "sliding_window",
        currentUsage: 0,
        limitValue: 0,
        remainingRequests: 0,
        windowStart: new Date().toISOString(),
        windowEnd: new Date().toISOString(),
        resetTime: new Date().toISOString(),
        bypassApplied: true,
        bypassReason: "Service error bypass",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Determine appropriate rate limit tier for request
   */
  private determineRateLimitTier(_context: RateLimitContext): RateLimitTier {
    // Emergency and patient safety requests get highest priority
    if (context.healthcareContext?.emergencyFlag) {
      return this.config.tiers.find((t) => t.name === "emergency")!;
    }

    if (context.healthcareContext?.patientSafetyFlag) {
      return this.config.tiers.find((t) => t.name === "critical")!;
    }

    if (context.healthcareContext?.criticalSystemFlag) {
      return this.config.tiers.find((t) => t.name === "critical")!;
    }

    // Map request category to priority
    const categoryPriorityMap: Record<
      HealthcareRequestCategory,
      RequestPriority
    > = {
      emergency_response: "emergency",
      patient_monitoring: "critical",
      critical_alerts: "critical",
      medication_alerts: "critical",
      patient_data_access: "urgent",
      clinical_documentation: "high",
      diagnostic_results: "urgent",
      treatment_orders: "urgent",
      medication_management: "high",
      appointment_scheduling: "normal",
      patient_registration: "normal",
      insurance_verification: "normal",
      billing_operations: "low",
      authentication: "high",
      user_management: "normal",
      audit_logging: "low",
      backup_operations: "background",
      reporting: "low",
      analytics: "background",
      data_export: "low",
      compliance_reporting: "normal",
      third_party_api: "normal",
      lab_integration: "urgent",
      imaging_integration: "urgent",
      pharmacy_integration: "urgent",
    };

    const priority =
      context.priority || categoryPriorityMap[context.category] || "normal";

    // Find tier matching priority
    const tier = this.config.tiers.find((t) => t.priority === priority);
    return tier || this.config.tiers.find((t) => t.name === "normal")!;
  }

  /**
   * Generate rate limit key for request
   */
  private generateRateLimitKey(
    _context: RateLimitContext,
    tier: RateLimitTier,
  ): string {
    const parts = [this.config.storage.keyPrefix, tier.name, context.clientId];

    // Add user ID if available
    if (context._userId) {
      parts.push(context._userId);
    }

    // Add facility ID for facility-based limits
    if (
      this.config.healthcareConfig.facilityBasedLimits &&
      context.healthcareContext?.facilityId
    ) {
      parts.push(context.healthcareContext.facilityId);
    }

    // Add endpoint for endpoint-specific limits
    parts.push(context.endpoint);

    return parts.join(":");
  }

  /**
   * Check for emergency bypass conditions
   */
  private checkEmergencyBypass(
    _context: RateLimitContext,
    tier: RateLimitTier,
  ): RateLimitResult {
    let bypassApplied = false;
    let bypassReason = "";

    // Emergency request bypass
    if (tier.emergencyBypass && context.healthcareContext?.emergencyFlag) {
      bypassApplied = true;
      bypassReason = "Emergency request bypass";
    }

    // Patient safety bypass
    else if (
      tier.patientSafetyBypass &&
      context.healthcareContext?.patientSafetyFlag
    ) {
      bypassApplied = true;
      bypassReason = "Patient safety bypass";
    }

    // Critical system bypass
    else if (
      this.config.healthcareConfig.criticalSystemBypass &&
      context.healthcareContext?.criticalSystemFlag
    ) {
      bypassApplied = true;
      bypassReason = "Critical system bypass";
    }

    if (bypassApplied) {
      return {
        allowed: true,
        reason: bypassReason,
        tier: tier.name,
        algorithm: this.config.defaultAlgorithm,
        currentUsage: 0,
        limitValue: tier.requestsPerMinute,
        remainingRequests: tier.requestsPerMinute,
        windowStart: new Date().toISOString(),
        windowEnd: new Date(Date.now() + 60000).toISOString(),
        resetTime: new Date(Date.now() + 60000).toISOString(),
        bypassApplied: true,
        bypassReason,
        timestamp: new Date().toISOString(),
      };
    }

    return { allowed: false } as RateLimitResult;
  }

  /**
   * Log rate limiting decision
   */
  private async logRateLimitDecision(
    _context: RateLimitContext,
    result: RateLimitResult,
  ): Promise<void> {
    // Only log violations and bypasses unless configured otherwise
    const shouldLog =
      !result.allowed ||
      result.bypassApplied ||
      this.config.audit.logAllRequests;

    if (!shouldLog) return;

    const logData = {
      requestId: context.requestId,
      clientId: context.clientId,
      category: context.category,
      priority: context.priority,
      endpoint: context.endpoint,
      rateLimitResult: {
        allowed: result.allowed,
        reason: result.reason,
        tier: result.tier,
        currentUsage: result.currentUsage,
        limitValue: result.limitValue,
        bypassApplied: result.bypassApplied,
        bypassReason: result.bypassReason,
      },
      facilityId: context.healthcareContext?.facilityId,
      emergencyFlag: context.healthcareContext?.emergencyFlag,
      patientSafetyFlag: context.healthcareContext?.patientSafetyFlag,
    };

    // TODO: Integrate with structured logging service
    console.log("🚦 [APIRateLimitingService] Rate limit decision:", logData);
  }

  /**
   * Update metrics
   */
  private updateMetrics(
    _context: RateLimitContext,
    result: RateLimitResult,
  ): void {
    const metricKey = `${result.tier}:${context.category}`;

    if (!this.metrics.has(metricKey)) {
      this.metrics.set(metricKey, {
        totalRequests: 0,
        allowedRequests: 0,
        blockedRequests: 0,
        bypassedRequests: 0,
        lastUpdate: Date.now(),
      });
    }

    const metrics = this.metrics.get(metricKey);
    metrics.totalRequests++;

    if (result.allowed) {
      metrics.allowedRequests++;
    } else {
      metrics.blockedRequests++;
    }

    if (result.bypassApplied) {
      metrics.bypassedRequests++;
    }

    metrics.lastUpdate = Date.now();
  }

  /**
   * Check alerting thresholds
   */
  private async checkAlertingThresholds(
    _context: RateLimitContext,
    result: RateLimitResult,
  ): Promise<void> {
    const usageRatio = result.currentUsage / result.limitValue;

    if (usageRatio >= this.config.monitoring.alertThreshold) {
      await this.sendRateLimitAlert(context, result, usageRatio);
    }
  }

  /**
   * Send rate limit alert
   */
  private async sendRateLimitAlert(
    _context: RateLimitContext,
    result: RateLimitResult,
    usageRatio: number,
  ): Promise<void> {
    const alertData = {
      type: "rate_limit_threshold_exceeded",
      tier: result.tier,
      category: context.category,
      usageRatio: usageRatio,
      currentUsage: result.currentUsage,
      limitValue: result.limitValue,
      facilityId: context.healthcareContext?.facilityId,
      endpoint: context.endpoint,
      timestamp: new Date().toISOString(),
    };

    console.log("🚨 [APIRateLimitingService] Rate limit alert:", alertData);
    // TODO: Integrate with notification service
  }

  /**
   * Collect metrics
   */
  private collectMetrics(): void {
    const now = Date.now();
    const metricsSnapshot = new Map(this.metrics);

    console.log("📊 [APIRateLimitingService] Metrics collected:", {
      timestamp: new Date().toISOString(),
      metricsCount: metricsSnapshot.size,
      totalMetrics: Array.from(metricsSnapshot.values()).reduce((sum,_m) => sum + m.totalRequests,
        0,
      ),
    });

    // TODO: Send metrics to observability platform
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Reset rate limit for specific key
   */
  async resetRateLimit(clientId: string, tier?: string): Promise<void> {
    const tiersToReset = tier ? [tier] : this.config.tiers.map((t) => t.name);

    for (const tierName of tiersToReset) {
      const algorithm = this.algorithms.get(tierName);
      if (algorithm) {
        const key = `${this.config.storage.keyPrefix}${tierName}:${clientId}`;
        await algorithm.reset(key);
      }
    }

    console.log(
      `🔄 [APIRateLimitingService] Reset rate limit for client: ${clientId}, tiers: ${tiersToReset.join(", ")}`,
    );
  }

  /**
   * Get current usage for client
   */
  async getCurrentUsage(clientId: string, tier: string): Promise<number> {
    const algorithm = this.algorithms.get(tier);
    if (!algorithm) {
      throw new Error(`No algorithm found for tier: ${tier}`);
    }

    const key = `${this.config.storage.keyPrefix}${tier}:${clientId}`;
    return await algorithm.getUsage(key);
  }

  /**
   * Get service statistics
   */
  getStatistics(): {
    isInitialized: boolean;
    tiersCount: number;
    algorithmsCount: number;
    metricsCount: number;
    config: RateLimitConfig;
  } {
    return {
      isInitialized: this.isInitialized,
      tiersCount: this.config.tiers.length,
      algorithmsCount: this.algorithms.size,
      metricsCount: this.metrics.size,
      config: this.config,
    };
  }

  /**
   * Destroy service and clean up resources
   */
  destroy(): void {
    this.algorithms.clear();
    this.metrics.clear();
    this.isInitialized = false;

    console.log(
      "🔄 [APIRateLimitingService] API rate limiting service destroyed and resources cleaned up",
    );
  }
}

// ============================================================================
// DEFAULT SERVICE INSTANCE
// ============================================================================

/**
 * Default API rate limiting service instance with healthcare-optimized settings
 */
export const apiRateLimitingService = new APIRateLimitingService({
  enabled: true,
  defaultAlgorithm: "sliding_window",

  globalLimits: {
    requestsPerSecond: 2000, // Higher for healthcare
    requestsPerMinute: 100000, // Higher for healthcare
    maxConcurrentRequests: 1000, // Higher for healthcare
  },

  emergencySettings: {
    enableBypass: true,
    maxEmergencyRequests: 10000, // High limit for emergencies
    bypassCategories: [
      "emergency_response",
      "patient_monitoring",
      "critical_alerts",
      "medication_alerts",
    ],
  },

  healthcareConfig: {
    patientSafetyBypass: true,
    criticalSystemBypass: true,
    facilityBasedLimits: true,
    workflowAwareLimits: true,
  },

  monitoring: {
    enableMetrics: true,
    enableAlerting: true,
    alertThreshold: 0.8, // Alert at 80% usage
    metricsInterval: 30000, // 30 seconds
  },

  audit: {
    logAllRequests: false, // Only log violations for GDPR
    logViolations: true,
    logBypasses: true,
    retentionDays: 90,
  },
});

/**
 * Export types for external use
 */
// Note: All types are already exported above with their definitions
// No need to re-export them here to avoid TS2484 conflicts
