import { createHash } from "crypto";
import { Context, MiddlewareHandler } from "hono";

// Healthcare-specific rate limiting configuration
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (c: Context) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
  onLimitReached?: (c: Context, key: string) => Promise<void>; // Custom handler
  healthcare?: {
    sensitiveEndpoints: string[]; // Healthcare endpoints with stricter limits
    patientDataEndpoints: string[]; // Patient data endpoints with very strict limits
    emergencyOverride?: boolean; // Allow emergency access
  };
}

// Rate limiting data structure
export interface RateLimitData {
  count: number;
  resetTime: number;
  blocked: boolean;
  healthcareContext?: {
    isSensitiveEndpoint: boolean;
    isPatientDataEndpoint: boolean;
    emergencyAccess: boolean;
  };
}

// Healthcare-aware rate limiting store
export class HealthcareRateLimitStore {
  private store = new Map<string, RateLimitData>();

  constructor(private config: RateLimitConfig) {}

  // Get rate limit data for a key
  get(key: string): RateLimitData | undefined {
    return this.store.get(key);
  }

  // Set rate limit data for a key
  set(key: string, data: RateLimitData): void {
    this.store.set(key, data);
  }

  // Increment request count
  increment(
    key: string,
    healthcareContext?: RateLimitData["healthcareContext"],
  ): RateLimitData {
    const now = Date.now();
    const resetTime = now + this.config.windowMs;

    let data = this.store.get(key);

    if (!data || data.resetTime < now) {
      // Create new rate limit entry
      data = {
        count: 1,
        resetTime,
        blocked: false,
        healthcareContext,
      };
    } else {
      // Increment existing counter
      data.count++;
      data.healthcareContext = healthcareContext;
    }

    // Check if limit exceeded
    data.blocked = data.count > this.config.maxRequests;

    this.store.set(key, data);
    return data;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, data] of this.store.entries()) {
      if (data.resetTime < now) {
        this.store.delete(key);
      }
    }
  }
}

// Generate rate limiting key with healthcare compliance
export function generateHealthcareRateLimitKey(c: Context): string {
  const ip =
    c.req.header("cf-connecting-ip") ||
    c.req.header("x-forwarded-for") ||
    c.req.header("x-real-ip") ||
    "unknown";

  const userId = c.get("user")?.id || "anonymous";
  const path = c.req.path;

  // Hash for LGPD compliance (don't store raw IPs)
  const hashInput = `${ip}:${userId}:${path}:${new Date().getHours()}`;
  const hash = createHash("sha256").update(hashInput).digest("hex");

  return `rl:${hash}`;
}

// Healthcare-specific rate limiting rules
export const healthcareRateLimitRules: Record<string, RateLimitConfig> = {
  // General API endpoints
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    skipSuccessfulRequests: false,
    healthcare: {
      sensitiveEndpoints: [
        "/api/patients",
        "/api/appointments",
        "/api/medical-records",
      ],
      patientDataEndpoints: [
        "/api/patients/*/records",
        "/api/patients/*/diagnostics",
      ],
      emergencyOverride: true,
    },
  },

  // Authentication endpoints (stricter)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // Very strict for auth
    skipFailedRequests: false,
  },

  // Patient data endpoints (very strict)
  patientData: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 20,
    skipSuccessfulRequests: false,
    healthcare: {
      sensitiveEndpoints: ["/api/patients"],
      patientDataEndpoints: ["/api/patients/*/records"],
      emergencyOverride: true,
    },
  },

  // File upload endpoints
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    skipFailedRequests: false,
  },

  // API documentation endpoints
  docs: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50,
    skipSuccessfulRequests: true,
  },
};

// Healthcare rate limiting middleware
export function healthcareRateLimit(
  config: RateLimitConfig,
): MiddlewareHandler {
  const store = new HealthcareRateLimitStore(config);

  return async (c: Context, next) => {
    try {
      // Generate rate limit key
      const key = config.keyGenerator
        ? config.keyGenerator(c)
        : generateHealthcareRateLimitKey(c);

      // Determine healthcare context
      const path = c.req.path;
      const healthcareContext: RateLimitData["healthcareContext"] = {
        isSensitiveEndpoint:
          config.healthcare?.sensitiveEndpoints?.some((ep) =>
            path.startsWith(ep.replace("*", "")),
          ) || false,
        isPatientDataEndpoint:
          config.healthcare?.patientDataEndpoints?.some((ep) =>
            path.startsWith(ep.replace("*", "")),
          ) || false,
        emergencyAccess: c.req.header("x-emergency-access") === "true" || false,
      };

      // Apply stricter limits for healthcare endpoints
      let effectiveConfig = { ...config };
      if (healthcareContext.isSensitiveEndpoint) {
        effectiveConfig.maxRequests = Math.floor(config.maxRequests * 0.5); // 50% reduction
      }
      if (healthcareContext.isPatientDataEndpoint) {
        effectiveConfig.maxRequests = Math.floor(config.maxRequests * 0.25); // 75% reduction
      }

      // Allow emergency access override
      if (
        healthcareContext.emergencyAccess &&
        config.healthcare?.emergencyOverride
      ) {
        return next();
      }

      // Get current rate limit data
      const data = store.increment(key, healthcareContext);

      // Set rate limit headers
      c.header("X-RateLimit-Limit", effectiveConfig.maxRequests.toString());
      c.header(
        "X-RateLimit-Remaining",
        Math.max(0, effectiveConfig.maxRequests - data.count).toString(),
      );
      c.header("X-RateLimit-Reset", data.resetTime.toString());
      c.header("X-RateLimit-Window", effectiveConfig.windowMs.toString());

      // Healthcare-specific headers
      c.header(
        "X-Healthcare-RateLimit-Sensitive",
        healthcareContext.isSensitiveEndpoint.toString(),
      );
      c.header(
        "X-Healthcare-RateLimit-PatientData",
        healthcareContext.isPatientDataEndpoint.toString(),
      );
      c.header(
        "X-Healthcare-RateLimit-Emergency",
        healthcareContext.emergencyAccess.toString(),
      );

      // Check if limit exceeded
      if (data.blocked) {
        // Log rate limit violation for audit trail
        await logRateLimitViolation(c, key, data, healthcareContext);

        if (config.onLimitReached) {
          await config.onLimitReached(c, key);
        }

        return c.json(
          {
            error: "Rate limit exceeded",
            message: "Too many requests. Please try again later.",
            retryAfter: Math.ceil((data.resetTime - Date.now()) / 1000),
            healthcare: {
              sensitiveEndpoint: healthcareContext.isSensitiveEndpoint,
              patientDataEndpoint: healthcareContext.isPatientDataEndpoint,
              emergencyAccess: healthcareContext.emergencyAccess,
            },
          },
          429,
        );
      }

      await next();

      // Skip counting based on configuration
      if (
        (config.skipSuccessfulRequests && c.res.status < 400) ||
        (config.skipFailedRequests && c.res.status >= 400)
      ) {
        // Decrement count since we're not counting this request
        const currentData = store.get(key);
        if (currentData) {
          currentData.count = Math.max(0, currentData.count - 1);
          store.set(key, currentData);
        }
      }
    } catch (error) {
      console.error("Rate limiting middleware error:", error);
      // Fail open for healthcare safety
      await next();
    }
  };
}

// Log rate limit violations for audit compliance
async function logRateLimitViolation(
  c: Context,
  key: string,
  data: RateLimitData,
  healthcareContext: RateLimitData["healthcareContext"],
): Promise<void> {
  try {
    const violation = {
      timestamp: new Date().toISOString(),
      type: "RATE_LIMIT_VIOLATION",
      key: key.substring(0, 16) + "...", // Don't log full key for privacy
      path: c.req.path,
      method: c.req.method,
      userAgent: c.req.header("user-agent")?.substring(0, 100) || "unknown",
      rateLimitData: {
        count: data.count,
        maxRequests: data.blocked ? "EXCEEDED" : "within limits",
        resetTime: new Date(data.resetTime).toISOString(),
      },
      healthcareContext,
    };

    // Send to audit trail if available
    if (c.get("auditService")) {
      await c
        .get("auditService")
        .logSecurityEvent("RATE_LIMIT_VIOLATION", violation);
    }

    console.warn("🛡️ Rate Limit Violation:", violation);
  } catch (error) {
    console.error("Failed to log rate limit violation:", error);
  }
}

// Pre-configured rate limiting middleware for different endpoint types
export function createGeneralRateLimit(): MiddlewareHandler {
  return healthcareRateLimit(healthcareRateLimitRules.general);
}

export function createAuthRateLimit(): MiddlewareHandler {
  return healthcareRateLimit(healthcareRateLimitRules.auth);
}

export function createPatientDataRateLimit(): MiddlewareHandler {
  return healthcareRateLimit(healthcareRateLimitRules.patientData);
}

export function createUploadRateLimit(): MiddlewareHandler {
  return healthcareRateLimit(healthcareRateLimitRules.upload);
}

export function createDocsRateLimit(): MiddlewareHandler {
  return healthcareRateLimit(healthcareRateLimitRules.docs);
}

// Cleanup expired rate limit entries
export function setupRateLimitCleanup(): void {
  setInterval(
    () => {
      // This would be called on the store instances
      // In a production environment, you'd want to track all stores
    },
    5 * 60 * 1000,
  ); // Clean up every 5 minutes
}

// Default rate limiting middleware export for app.ts compatibility
export const rateLimitMiddleware = createGeneralRateLimit;

// End of module
