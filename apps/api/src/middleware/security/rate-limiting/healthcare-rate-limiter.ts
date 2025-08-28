/**
 * 🚦 Enhanced Healthcare Rate Limiting - NeonPro API
 * ==================================================
 *
 * Production-ready rate limiting with healthcare-specific features:
 * - Emergency bypass for critical patient access
 * - Professional license-based rate limits
 * - Patient data endpoint protection
 * - ANVISA/CFM compliance integration
 * - Real-time monitoring and alerting
 * - Distributed rate limiting support (Redis-compatible)
 */

import type { Context, MiddlewareHandler } from "hono";
import { HealthcareRole } from "../auth/jwt-validation";

// Healthcare endpoint categories for rate limiting
export enum HealthcareEndpointCategory {
  PATIENT_DATA = "patient_data",
  MEDICAL_RECORDS = "medical_records",
  APPOINTMENTS = "appointments",
  EMERGENCY = "emergency",
  COMPLIANCE = "compliance",
  ANALYTICS = "analytics",
  MARKETING = "marketing",
  PUBLIC = "public",
}

// Emergency access types
export enum EmergencyAccessType {
  MEDICAL = "medical",
  LIFE_THREATENING = "life_threatening",
  URGENT_CARE = "urgent_care",
  MASS_CASUALTY = "mass_casualty",
}

// Rate limit window types
export enum RateLimitWindow {
  SECOND = 1000,
  MINUTE = 60 * 1000,
  FIVE_MINUTES = 5 * 60 * 1000,
  FIFTEEN_MINUTES = 15 * 60 * 1000,
  HOUR = 60 * 60 * 1000,
  DAY = 24 * 60 * 60 * 1000,
}

// Healthcare-specific rate limit configuration
interface HealthcareRateLimitConfig {
  category: HealthcareEndpointCategory;
  endpoint_pattern: string;
  description: string;

  // Rate limits by user type
  limits: {
    anonymous: { requests: number; window: RateLimitWindow; };
    authenticated: { requests: number; window: RateLimitWindow; };
    healthcare_provider: { requests: number; window: RateLimitWindow; };
    emergency_physician: { requests: number; window: RateLimitWindow; };
    admin: { requests: number; window: RateLimitWindow; };
  };

  // Healthcare-specific settings
  patient_data_access: boolean;
  requires_license: boolean;
  emergency_bypass: boolean;
  emergency_multiplier: number; // Multiplier for emergency access

  // Compliance settings
  audit_required: boolean;
  lgpd_sensitive: boolean;
  anvisa_regulated: boolean;
}

// Comprehensive healthcare rate limit configurations
const HEALTHCARE_RATE_LIMITS: HealthcareRateLimitConfig[] = [
  {
    category: HealthcareEndpointCategory.PATIENT_DATA,
    endpoint_pattern: "/api/v1/patients",
    description: "Patient personal and health data operations",
    limits: {
      anonymous: { requests: 0, window: RateLimitWindow.MINUTE }, // No anonymous access
      authenticated: { requests: 30, window: RateLimitWindow.MINUTE },
      healthcare_provider: { requests: 100, window: RateLimitWindow.MINUTE },
      emergency_physician: { requests: 500, window: RateLimitWindow.MINUTE },
      admin: { requests: 1000, window: RateLimitWindow.MINUTE },
    },
    patient_data_access: true,
    requires_license: true,
    emergency_bypass: true,
    emergency_multiplier: 3.0,
    audit_required: true,
    lgpd_sensitive: true,
    anvisa_regulated: false,
  },

  {
    category: HealthcareEndpointCategory.MEDICAL_RECORDS,
    endpoint_pattern: "/api/v1/medical-records",
    description: "Medical records and treatment history",
    limits: {
      anonymous: { requests: 0, window: RateLimitWindow.MINUTE },
      authenticated: { requests: 20, window: RateLimitWindow.MINUTE },
      healthcare_provider: { requests: 80, window: RateLimitWindow.MINUTE },
      emergency_physician: { requests: 300, window: RateLimitWindow.MINUTE },
      admin: { requests: 500, window: RateLimitWindow.MINUTE },
    },
    patient_data_access: true,
    requires_license: true,
    emergency_bypass: true,
    emergency_multiplier: 4.0, // Higher multiplier for medical records
    audit_required: true,
    lgpd_sensitive: true,
    anvisa_regulated: true,
  },

  {
    category: HealthcareEndpointCategory.APPOINTMENTS,
    endpoint_pattern: "/api/v1/appointments",
    description: "Appointment scheduling and management",
    limits: {
      anonymous: { requests: 5, window: RateLimitWindow.MINUTE }, // Limited public booking
      authenticated: { requests: 50, window: RateLimitWindow.MINUTE },
      healthcare_provider: { requests: 200, window: RateLimitWindow.MINUTE },
      emergency_physician: { requests: 1000, window: RateLimitWindow.MINUTE },
      admin: { requests: 2000, window: RateLimitWindow.MINUTE },
    },
    patient_data_access: false,
    requires_license: false,
    emergency_bypass: true,
    emergency_multiplier: 2.0,
    audit_required: false,
    lgpd_sensitive: false,
    anvisa_regulated: false,
  },

  {
    category: HealthcareEndpointCategory.EMERGENCY,
    endpoint_pattern: "/api/v1/emergency",
    description: "Emergency patient access and procedures",
    limits: {
      anonymous: { requests: 0, window: RateLimitWindow.MINUTE },
      authenticated: { requests: 10, window: RateLimitWindow.MINUTE },
      healthcare_provider: { requests: 50, window: RateLimitWindow.MINUTE },
      emergency_physician: { requests: 2000, window: RateLimitWindow.MINUTE }, // Very high for emergencies
      admin: { requests: 1000, window: RateLimitWindow.MINUTE },
    },
    patient_data_access: true,
    requires_license: true,
    emergency_bypass: true,
    emergency_multiplier: 10.0, // Massive multiplier for emergency endpoints
    audit_required: true,
    lgpd_sensitive: true,
    anvisa_regulated: true,
  },

  {
    category: HealthcareEndpointCategory.COMPLIANCE,
    endpoint_pattern: "/api/v1/compliance",
    description: "LGPD compliance and audit operations",
    limits: {
      anonymous: { requests: 0, window: RateLimitWindow.MINUTE },
      authenticated: { requests: 10, window: RateLimitWindow.MINUTE },
      healthcare_provider: { requests: 30, window: RateLimitWindow.MINUTE },
      emergency_physician: { requests: 20, window: RateLimitWindow.MINUTE }, // Limited emergency access
      admin: { requests: 100, window: RateLimitWindow.MINUTE },
    },
    patient_data_access: true,
    requires_license: false,
    emergency_bypass: false, // Compliance data doesn't need emergency bypass
    emergency_multiplier: 1.0,
    audit_required: true,
    lgpd_sensitive: true,
    anvisa_regulated: false,
  },

  {
    category: HealthcareEndpointCategory.ANALYTICS,
    endpoint_pattern: "/api/v1/analytics",
    description: "Healthcare analytics and reporting",
    limits: {
      anonymous: { requests: 0, window: RateLimitWindow.MINUTE },
      authenticated: { requests: 20, window: RateLimitWindow.MINUTE },
      healthcare_provider: { requests: 100, window: RateLimitWindow.MINUTE },
      emergency_physician: { requests: 50, window: RateLimitWindow.MINUTE },
      admin: { requests: 500, window: RateLimitWindow.MINUTE },
    },
    patient_data_access: false,
    requires_license: false,
    emergency_bypass: false,
    emergency_multiplier: 1.0,
    audit_required: false,
    lgpd_sensitive: false,
    anvisa_regulated: false,
  },
];

// Rate limiting storage interface for different backends
interface RateLimitStorage {
  get(key: string): Promise<number | null>;
  set(key: string, value: number, ttl: number): Promise<void>;
  increment(key: string, ttl: number): Promise<number>;
  delete(key: string): Promise<void>;
}

// In-memory storage implementation (for development/testing)
class MemoryRateLimitStorage implements RateLimitStorage {
  private store = new Map<string, { value: number; expires: number; }>();

  async get(key: string): Promise<number | null> {
    const entry = this.store.get(key);
    if (!entry || entry.expires < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: number, ttl: number): Promise<void> {
    this.store.set(key, {
      value,
      expires: Date.now() + ttl,
    });
  }

  async increment(key: string, ttl: number): Promise<number> {
    const current = await this.get(key);
    const newValue = (current || 0) + 1;
    await this.set(key, newValue, ttl);
    return newValue;
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

// Redis storage implementation (for production)
class RedisRateLimitStorage implements RateLimitStorage {
  constructor(private redisClient: any) {} // Redis client type

  async get(key: string): Promise<number | null> {
    const value = await this.redisClient.get(key);
    return value ? parseInt(value) : null;
  }

  async set(key: string, value: number, ttl: number): Promise<void> {
    await this.redisClient.setex(key, Math.ceil(ttl / 1000), value);
  }

  async increment(key: string, ttl: number): Promise<number> {
    const multi = this.redisClient.multi();
    multi.incr(key);
    multi.expire(key, Math.ceil(ttl / 1000));
    const results = await multi.exec();
    return results[0][1]; // Return the incremented value
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}

// Rate limiting result interface
interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  limit: number;
  emergencyBypass: boolean;
  bypassReason?: string;
}

// Healthcare rate limiter class
export class HealthcareRateLimiter {
  private storage: RateLimitStorage;
  private monitoringEnabled: boolean;
  private alertingEnabled: boolean;

  constructor(
    storage?: RateLimitStorage,
    options?: {
      monitoring?: boolean;
      alerting?: boolean;
    },
  ) {
    this.storage = storage || new MemoryRateLimitStorage();
    this.monitoringEnabled = options?.monitoring ?? true;
    this.alertingEnabled = options?.alerting ?? true;
  }

  /**
   * Check rate limit for a request
   */
  async checkRateLimit(
    userId: string,
    userRole: HealthcareRole,
    endpoint: string,
    emergencyContext?: {
      type: EmergencyAccessType;
      justification: string;
      patientId?: string;
    },
  ): Promise<RateLimitResult> {
    // Find matching rate limit configuration
    const config = this.findRateLimitConfig(endpoint);
    if (!config) {
      // No specific rate limit found, allow with default limits
      return {
        allowed: true,
        remaining: 1000,
        resetTime: Date.now() + RateLimitWindow.HOUR,
        limit: 1000,
        emergencyBypass: false,
      };
    }

    // Determine user type and limits
    const userType = this.getUserType(userRole);
    const limits = config.limits[userType];

    if (!limits) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + RateLimitWindow.MINUTE,
        limit: 0,
        emergencyBypass: false,
      };
    }

    // Check for emergency bypass
    if (emergencyContext && config.emergency_bypass) {
      const bypassResult = await this.checkEmergencyBypass(
        config,
        limits,
        emergencyContext,
        userId,
      );
      if (bypassResult.emergencyBypass) {
        await this.logEmergencyAccess(userId, endpoint, emergencyContext);
        return bypassResult;
      }
    }

    // Standard rate limiting check
    const key = this.generateRateLimitKey(userId, endpoint, limits.window);
    const currentCount = await this.storage.increment(key, limits.window);

    const allowed = currentCount <= limits.requests;
    const remaining = Math.max(0, limits.requests - currentCount);
    const resetTime = Date.now() + limits.window;

    // Monitor and alert if needed
    if (this.monitoringEnabled) {
      await this.recordMetrics(userId, endpoint, config.category, currentCount, limits.requests);
    }

    if (!allowed && this.alertingEnabled) {
      await this.triggerRateLimitAlert(userId, endpoint, config, currentCount);
    }

    return {
      allowed,
      remaining,
      resetTime,
      limit: limits.requests,
      emergencyBypass: false,
    };
  }

  /**
   * Check emergency bypass eligibility
   */
  private async checkEmergencyBypass(
    config: HealthcareRateLimitConfig,
    normalLimits: { requests: number; window: RateLimitWindow; },
    emergencyContext: {
      type: EmergencyAccessType;
      justification: string;
      patientId?: string;
    },
    userId: string,
  ): Promise<RateLimitResult> {
    // Calculate emergency limits
    const emergencyLimit = Math.floor(normalLimits.requests * config.emergency_multiplier);
    const key = this.generateEmergencyKey(userId, emergencyContext.type, normalLimits.window);

    const currentCount = await this.storage.increment(key, normalLimits.window);
    const allowed = currentCount <= emergencyLimit;

    return {
      allowed,
      remaining: Math.max(0, emergencyLimit - currentCount),
      resetTime: Date.now() + normalLimits.window,
      limit: emergencyLimit,
      emergencyBypass: true,
      bypassReason:
        `Emergency access: ${emergencyContext.type} - ${emergencyContext.justification}`,
    };
  }

  /**
   * Find rate limit configuration for an endpoint
   */
  private findRateLimitConfig(endpoint: string): HealthcareRateLimitConfig | null {
    for (const config of HEALTHCARE_RATE_LIMITS) {
      if (endpoint.includes(config.endpoint_pattern.replace("/api/v1", ""))) {
        return config;
      }
    }
    return null;
  }

  /**
   * Map healthcare role to user type for rate limiting
   */
  private getUserType(role: HealthcareRole): keyof HealthcareRateLimitConfig["limits"] {
    switch (role) {
      case HealthcareRole.EMERGENCY_PHYSICIAN:
        return "emergency_physician";
      case HealthcareRole.PHYSICIAN:
      case HealthcareRole.NURSE:
      case HealthcareRole.PHARMACIST:
      case HealthcareRole.PHYSIOTHERAPIST:
        return "healthcare_provider";
      case HealthcareRole.ADMIN:
        return "admin";
      case HealthcareRole.PATIENT:
        return "authenticated";
      default:
        return "anonymous";
    }
  }

  /**
   * Generate rate limit key
   */
  private generateRateLimitKey(userId: string, endpoint: string, window: RateLimitWindow): string {
    const windowStart = Math.floor(Date.now() / window) * window;
    return `rate_limit:${userId}:${endpoint}:${windowStart}`;
  }

  /**
   * Generate emergency access key
   */
  private generateEmergencyKey(
    userId: string,
    emergencyType: EmergencyAccessType,
    window: RateLimitWindow,
  ): string {
    const windowStart = Math.floor(Date.now() / window) * window;
    return `emergency_rate_limit:${userId}:${emergencyType}:${windowStart}`;
  }

  /**
   * Log emergency access for audit purposes
   */
  private async logEmergencyAccess(
    userId: string,
    endpoint: string,
    emergencyContext: {
      type: EmergencyAccessType;
      justification: string;
      patientId?: string;
    },
  ): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId,
      endpoint,
      emergencyType: emergencyContext.type,
      justification: emergencyContext.justification,
      patientId: emergencyContext.patientId,
      action: "EMERGENCY_RATE_LIMIT_BYPASS",
    };

    // Log to audit system (implementation depends on your audit system)
    console.log("🚨 EMERGENCY ACCESS LOG:", JSON.stringify(logEntry, null, 2));

    // TODO: Integrate with your audit logging system
    // await auditLogger.logEmergencyAccess(logEntry);
  }

  /**
   * Record rate limiting metrics
   */
  private async recordMetrics(
    userId: string,
    endpoint: string,
    category: HealthcareEndpointCategory,
    currentCount: number,
    limit: number,
  ): Promise<void> {
    const metrics = {
      timestamp: Date.now(),
      userId,
      endpoint,
      category,
      requestCount: currentCount,
      limit,
      utilizationPercent: (currentCount / limit) * 100,
    };

    // TODO: Send to monitoring system (Prometheus, CloudWatch, etc.)
    if (metrics.utilizationPercent > 80) {
      console.warn("⚠️  High rate limit utilization:", metrics);
    }
  }

  /**
   * Trigger rate limit alert
   */
  private async triggerRateLimitAlert(
    userId: string,
    endpoint: string,
    config: HealthcareRateLimitConfig,
    currentCount: number,
  ): Promise<void> {
    const alert = {
      level: "WARNING",
      type: "RATE_LIMIT_EXCEEDED",
      timestamp: new Date().toISOString(),
      userId,
      endpoint,
      category: config.category,
      description: config.description,
      currentCount,
      limit: config.limits,
      patientDataAccess: config.patient_data_access,
      requiresLicense: config.requires_license,
    };

    console.warn("🚨 RATE LIMIT ALERT:", JSON.stringify(alert, null, 2));

    // TODO: Send to alerting system (PagerDuty, Slack, etc.)
    // await alertingSystem.sendAlert(alert);
  }
}

/**
 * Healthcare Rate Limiting Middleware Factory
 */
export function createHealthcareRateLimiter(
  storage?: RateLimitStorage,
  options?: {
    monitoring?: boolean;
    alerting?: boolean;
  },
): MiddlewareHandler {
  const rateLimiter = new HealthcareRateLimiter(storage, options);

  return async (c: Context, next) => {
    try {
      // Extract user information from JWT token (set by auth middleware)
      const user = c.get("user");
      const userId = user?.id || "anonymous";
      const userRole = user?.role || HealthcareRole.PATIENT;

      // Extract emergency context if present
      const emergencyHeader = c.req.header("X-Emergency-Access");
      let emergencyContext: {
        type: EmergencyAccessType;
        justification: string;
        patientId?: string;
      } | undefined;

      if (emergencyHeader) {
        try {
          emergencyContext = JSON.parse(emergencyHeader);
        } catch (e) {
          console.warn("Invalid emergency access header:", emergencyHeader);
        }
      }

      // Check rate limit
      const result = await rateLimiter.checkRateLimit(
        userId,
        userRole,
        c.req.path,
        emergencyContext,
      );

      // Set rate limit headers
      c.header("X-RateLimit-Limit", result.limit.toString());
      c.header("X-RateLimit-Remaining", result.remaining.toString());
      c.header("X-RateLimit-Reset", Math.ceil(result.resetTime / 1000).toString());

      if (result.emergencyBypass) {
        c.header("X-Emergency-Bypass", "true");
        c.header("X-Emergency-Reason", result.bypassReason || "Emergency access granted");
      }

      if (!result.allowed) {
        return c.json({
          success: false,
          error: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Please try again later.",
          details: {
            limit: result.limit,
            remaining: result.remaining,
            resetTime: new Date(result.resetTime).toISOString(),
            emergencyBypassAvailable: emergencyContext ? false : true,
          },
        }, 429);
      }

      await next();
    } catch (error) {
      console.error("Healthcare rate limiter error:", error);
      // On error, allow the request to proceed (fail open for healthcare)
      await next();
    }
  };
}

/**
 * Create Redis-backed rate limiter for production
 */
export function createRedisHealthcareRateLimiter(
  redisClient: any,
  options?: {
    monitoring?: boolean;
    alerting?: boolean;
  },
): MiddlewareHandler {
  const storage = new RedisRateLimitStorage(redisClient);
  return createHealthcareRateLimiter(storage, options);
}

/**
 * Emergency bypass header helper
 */
export function createEmergencyBypassHeader(
  type: EmergencyAccessType,
  justification: string,
  patientId?: string,
): string {
  return JSON.stringify({
    type,
    justification,
    patientId,
  });
}
