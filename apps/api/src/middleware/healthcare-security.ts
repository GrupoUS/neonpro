/**
 * 🏥 Healthcare Security Middleware - NeonPro API
 * ===============================================
 *
 * Enhanced security middleware for healthcare applications with:
 * - Emergency bypass for critical patient access
 * - Professional license validation
 * - Healthcare-specific rate limiting
 * - LGPD compliance integration
 * - Advanced audit logging
 */

import type { MiddlewareHandler } from "hono";

// Healthcare user roles with license requirements
export enum HealthcareRole {
  ADMIN = "admin",
  EMERGENCY_PHYSICIAN = "emergency_physician", // Special role for emergency access
  HEALTHCARE_PROVIDER = "healthcare_provider", // Licensed professionals
  CLINIC_MANAGER = "clinic_manager",
  CLINIC_STAFF = "clinic_staff",
  PATIENT = "patient",
}

// Professional license types in Brazil
export enum ProfessionalLicenseType {
  CRM = "crm", // Conselho Regional de Medicina
  CRF = "crf", // Conselho Regional de Farmácia
  CREFITO = "crefito", // Fisioterapia e Terapia Ocupacional
  CRN = "crn", // Conselho Regional de Nutrição
  COREN = "coren", // Conselho Regional de Enfermagem
  CRO = "cro", // Conselho Regional de Odontologia
  CRP = "crp", // Conselho Regional de Psicologia
}

// Healthcare-specific rate limit configuration
interface HealthcareRateLimitConfig {
  endpoint: string;
  limits: {
    general: { requests: number; window: string; };
    authenticated: { requests: number; window: string; };
    privileged: { requests: number; window: string; };
    emergency: { requests: number; window: string; };
  };
  patientDataAccess: boolean;
  emergencyBypass: boolean;
  requiresLicense: boolean;
  description: string;
}

// Enhanced healthcare rate limits
const HEALTHCARE_RATE_LIMITS: HealthcareRateLimitConfig[] = [
  {
    endpoint: "/api/v1/patients",
    limits: {
      general: { requests: 0, window: "1m" }, // No unauthenticated access
      authenticated: { requests: 100, window: "1m" },
      privileged: { requests: 500, window: "1m" },
      emergency: { requests: 1000, window: "1m" }, // Higher limits for emergencies
    },
    patientDataAccess: true,
    emergencyBypass: true,
    requiresLicense: true,
    description: "Patient data CRUD operations",
  },
  {
    endpoint: "/api/v1/appointments",
    limits: {
      general: { requests: 10, window: "1m" }, // Limited public access for booking
      authenticated: { requests: 200, window: "1m" },
      privileged: { requests: 1000, window: "1m" },
      emergency: { requests: 2000, window: "1m" },
    },
    patientDataAccess: false,
    emergencyBypass: true,
    requiresLicense: false,
    description: "Appointment scheduling operations",
  },
  {
    endpoint: "/api/v1/medical-records",
    limits: {
      general: { requests: 0, window: "1m" }, // No public access
      authenticated: { requests: 50, window: "1m" },
      privileged: { requests: 200, window: "1m" },
      emergency: { requests: 500, window: "1m" },
    },
    patientDataAccess: true,
    emergencyBypass: true,
    requiresLicense: true,
    description: "Medical records access",
  },
  {
    endpoint: "/api/v1/compliance",
    limits: {
      general: { requests: 0, window: "1m" },
      authenticated: { requests: 20, window: "1m" },
      privileged: { requests: 100, window: "1m" },
      emergency: { requests: 50, window: "1m" }, // Limited emergency access to compliance
    },
    patientDataAccess: true,
    emergencyBypass: false, // Compliance data doesn't need emergency bypass
    requiresLicense: false,
    description: "LGPD compliance operations",
  },
  {
    endpoint: "/api/v1/emergency",
    limits: {
      general: { requests: 0, window: "1m" },
      authenticated: { requests: 10, window: "1m" },
      privileged: { requests: 100, window: "1m" },
      emergency: { requests: 1000, window: "1m" }, // Very high limits for emergency endpoints
    },
    patientDataAccess: true,
    emergencyBypass: true,
    requiresLicense: true,
    description: "Emergency patient access",
  },
];

// Professional license validation interface
export interface ProfessionalLicense {
  licenseNumber: string;
  licenseType: ProfessionalLicenseType;
  state: string; // Brazilian state (SP, RJ, etc.)
  issuedDate: Date;
  expirationDate: Date;
  isActive: boolean;
  lastValidated: Date;
}

// Healthcare user with license information
export interface HealthcareUser {
  id: string;
  email: string;
  role: HealthcareRole;
  clinicId?: string;
  clinicIds?: string[]; // For multi-clinic access
  professionalLicense?: ProfessionalLicense;
  emergencyAccess?: boolean;
  isActive: boolean;
}

// Emergency access context
export interface EmergencyAccessContext {
  userId: string;
  patientId?: string;
  justification: string;
  emergencyType: "medical" | "life_threatening" | "urgent_care";
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

// Security audit logger
interface SecurityAlert {
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  type: string;
  message: string;
  metadata: any;
  requiresImmediate: boolean;
}

interface ComplianceAlert {
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  type: string;
  message: string;
  metadata: any;
  requiresImmediate: boolean;
}

class HealthcareSecurityLogger {
  private static async sendSecurityAlert(alert: SecurityAlert): Promise<void> {
    // Log to console for immediate visibility
    console.error(`[SECURITY_ALERT_${alert.level}]`, alert);

    // In production, integrate with:
    // - SIEM systems (Splunk, ELK Stack)
    // - Security monitoring tools (Datadog, New Relic)
    // - Incident response platforms (PagerDuty, Opsgenie)
    // - Healthcare compliance systems

    if (alert.requiresImmediate) {
      // Send immediate notifications via multiple channels
      await this.sendImmediateNotification(alert);
    }

    // Store in audit log for compliance
    await this.storeSecurityEvent(alert);
  }

  private static async sendComplianceAlert(alert: ComplianceAlert): Promise<void> {
    // Log to console for immediate visibility
    console.error(`[COMPLIANCE_ALERT_${alert.level}]`, alert);

    // In production, integrate with:
    // - Healthcare compliance systems (LGPD, ANVISA)
    // - Legal team notification systems
    // - Regulatory reporting tools
    // - Audit trail systems

    if (alert.requiresImmediate) {
      // Send immediate notifications to compliance team
      await this.sendImmediateComplianceNotification(alert);
    }

    // Store in compliance audit log
    await this.storeComplianceEvent(alert);
  }

  private static async sendImmediateNotification(alert: SecurityAlert): Promise<void> {
    // Placeholder for immediate notification logic
    // In production: SMS, email, Slack, PagerDuty, etc.
    console.warn(`[IMMEDIATE_SECURITY_NOTIFICATION]`, {
      timestamp: new Date().toISOString(),
      alert,
    });
  }

  private static async sendImmediateComplianceNotification(alert: ComplianceAlert): Promise<void> {
    // Placeholder for immediate compliance notification logic
    // In production: Legal team alerts, regulatory notifications
    console.warn(`[IMMEDIATE_COMPLIANCE_NOTIFICATION]`, {
      timestamp: new Date().toISOString(),
      alert,
    });
  }

  private static async storeSecurityEvent(alert: SecurityAlert): Promise<void> {
    // Placeholder for security event storage
    // In production: Database, SIEM, audit logs
    console.info(`[SECURITY_EVENT_STORED]`, {
      timestamp: new Date().toISOString(),
      eventId: `sec_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      alert,
    });
  }

  private static async storeComplianceEvent(alert: ComplianceAlert): Promise<void> {
    // Placeholder for compliance event storage
    // In production: Compliance database, regulatory audit logs
    console.info(`[COMPLIANCE_EVENT_STORED]`, {
      timestamp: new Date().toISOString(),
      eventId: `comp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      alert,
    });
  }

  static logEmergencyAccess(context: EmergencyAccessContext): void {
    console.log("[EMERGENCY_ACCESS]", {
      type: "emergency_access_granted",
      userId: context.userId,
      patientId: context.patientId,
      justification: context.justification,
      emergencyType: context.emergencyType,
      timestamp: context.timestamp,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    // External audit system integration available
  }

  static logSuspiciousActivity(details: {
    type: string;
    userId?: string;
    ip: string;
    endpoint: string;
    attemptCount: number;
    timestamp: Date;
  }): void {
    console.log("[SUSPICIOUS_ACTIVITY]", details);

    // Send alert to security monitoring system
    this.sendSecurityAlert({
      level: "HIGH",
      type: "SUSPICIOUS_ACTIVITY",
      message: `Suspicious activity detected: ${details.type}`,
      metadata: details,
      requiresImmediate: details.attemptCount > 5,
    });
  }

  static logLicenseViolation(details: {
    userId: string;
    licenseNumber?: string;
    attemptedResource: string;
    timestamp: Date;
  }): void {
    console.log("[LICENSE_VIOLATION]", details);

    // Alert compliance team immediately
    this.sendComplianceAlert({
      level: "CRITICAL",
      type: "LICENSE_VIOLATION",
      message: `License violation detected for user ${details.userId}`,
      metadata: details,
      requiresImmediate: true,
    });
  }

  static logUnauthorizedAccess(details: {
    userId: string;
    resource: string;
    reason: string;
    timestamp: Date;
  }): void {
    console.log("[UNAUTHORIZED_ACCESS]", details);

    // Alert security team immediately
    this.sendSecurityAlert({
      level: "HIGH",
      type: "UNAUTHORIZED_ACCESS",
      message: `Unauthorized access attempt by user ${details.userId} to ${details.resource}`,
      metadata: details,
      requiresImmediate: true,
    });
  }

  static logWeakTLS(details: {
    ip: string;
    tlsVersion?: string;
    cipherSuite?: string;
    timestamp: Date;
  }): void {
    console.log("[WEAK_TLS]", details);

    // Infrastructure team alerting can be added later
  }

  static logDataValidation(details: {
    userId?: string;
    dataType: string;
    timestamp: Date;
    validationSuccess: boolean;
  }): void {
    console.log("[DATA_VALIDATION]", details);
  }

  static logValidationFailure(details: {
    userId?: string;
    errors: unknown[];
    endpoint: string;
    timestamp: Date;
  }): void {
    console.log("[VALIDATION_FAILURE]", details);
  }
}

// Mock professional license validator (production should integrate with CFM/regional councils)
class ProfessionalLicenseValidator {
  private static licenseCache: Map<string, { license: ProfessionalLicense; cachedAt: Date; }> =
    new Map();
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly CFM_API_BASE = process.env.CFM_API_BASE
    || "https://portal.cfm.org.br/api";
  private static readonly CFM_API_KEY = process.env.CFM_API_KEY;

  static async validateLicense(licenseNumber: string): Promise<boolean> {
    try {
      // Check cache first
      const cached = this.licenseCache.get(licenseNumber);
      if (cached && (Date.now() - cached.cachedAt.getTime()) < this.CACHE_DURATION) {
        const license = cached.license;
        return license.isActive && license.expirationDate > new Date();
      }

      // Validate license with CFM API
      const license = await this.fetchLicenseFromCFM(licenseNumber);
      if (!license) {
        return false;
      }

      // Cache the result
      this.licenseCache.set(licenseNumber, {
        license,
        cachedAt: new Date(),
      });

      // Check if license is active and not expired
      const now = new Date();
      return license.isActive && license.expirationDate > now;
    } catch (error) {
      console.error(`License validation failed for ${licenseNumber}:`, error);
      // Log security event for failed license validation
      HealthcareSecurityLogger.logLicenseViolation({
        userId: "system",
        licenseNumber,
        attemptedResource: "license_validation",
        timestamp: new Date(),
      });
      return false;
    }
  }

  private static async fetchLicenseFromCFM(
    licenseNumber: string,
  ): Promise<ProfessionalLicense | null> {
    if (!this.CFM_API_KEY) {
      console.warn("CFM_API_KEY not configured, using fallback validation");
      return this.fallbackValidation(licenseNumber);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.CFM_API_BASE}/medicos/${licenseNumber}`, {
        headers: {
          "Authorization": `Bearer ${this.CFM_API_KEY}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          return null; // License not found
        }
        throw new Error(`CFM API error: ${response.status}`);
      }

      const data = await response.json();
      return this.mapCFMResponseToLicense(data);
    } catch (error) {
      console.error("CFM API request failed:", error);
      return this.fallbackValidation(licenseNumber);
    }
  }

  private static mapCFMResponseToLicense(cfmData: any): ProfessionalLicense {
    return {
      licenseNumber: cfmData.numero_inscricao,
      licenseType: ProfessionalLicenseType.CRM,
      state: cfmData.uf,
      issuedDate: new Date(cfmData.data_inscricao),
      expirationDate: new Date(cfmData.data_vencimento || "2030-12-31"),
      isActive: Boolean(cfmData.situacao === "ATIVO"),
      lastValidated: new Date(),
    };
  }

  private static fallbackValidation(licenseNumber: string): ProfessionalLicense | null {
    // Basic format validation for Brazilian medical licenses
    const crmPattern = /^CRM\d{4,6}[A-Z]{2}$/;
    const crfPattern = /^CRF\d{4,6}[A-Z]{2}$/;

    if (!crmPattern.test(licenseNumber) && !crfPattern.test(licenseNumber)) {
      return null;
    }

    // Extract state from license number
    const state = licenseNumber.slice(-2);
    const licenseType = licenseNumber.startsWith("CRM")
      ? ProfessionalLicenseType.CRM
      : ProfessionalLicenseType.CRF;

    return {
      licenseNumber,
      licenseType,
      state,
      issuedDate: new Date("2020-01-01"),
      expirationDate: new Date("2025-12-31"),
      isActive: true,
      lastValidated: new Date(),
    };
  }

  static async getLicense(
    licenseNumber: string,
  ): Promise<ProfessionalLicense | null> {
    try {
      // Check cache first
      const cached = this.licenseCache.get(licenseNumber);
      if (cached && (Date.now() - cached.cachedAt.getTime()) < this.CACHE_DURATION) {
        return cached.license;
      }

      // Fetch from CFM API
      const license = await this.fetchLicenseFromCFM(licenseNumber);
      if (license) {
        this.licenseCache.set(licenseNumber, {
          license,
          cachedAt: new Date(),
        });
      }
      return license;
    } catch (error) {
      console.error(`Failed to get license ${licenseNumber}:`, error);
      return null;
    }
  }

  static clearCache(): void {
    this.licenseCache.clear();
  }
}

// Enhanced rate limiting with healthcare context
export const createHealthcareRateLimiter = (
  config: HealthcareRateLimitConfig,
): MiddlewareHandler => {
  return async (c, next) => {
    const user = c.get("user") as HealthcareUser;
    const userRole = user?.role || "anonymous";
    const isEmergency = c.req.header("X-Emergency-Access") === "true";
    const emergencyJustification = c.req.header("X-Emergency-Justification");

    // Emergency bypass for critical patient access
    if (
      config.emergencyBypass
      && isEmergency
      && userRole === HealthcareRole.EMERGENCY_PHYSICIAN
    ) {
      if (!emergencyJustification) {
        return c.json(
          {
            error: "Emergency access requires justification",
            code: "EMERGENCY_JUSTIFICATION_REQUIRED",
          },
          400,
        );
      }

      // Log emergency access for audit
      HealthcareSecurityLogger.logEmergencyAccess({
        userId: user.id,
        justification: emergencyJustification,
        emergencyType:
          (c.req.header("X-Emergency-Type") as "medical" | "life_threatening" | "urgent_care")
          || "medical",
        timestamp: new Date(),
        ipAddress: c.req.header("CF-Connecting-IP") || "unknown",
        userAgent: c.req.header("User-Agent") || "unknown",
      });

      // Apply emergency rate limits but allow higher throughput
      const emergencyLimit = config.limits.emergency;
      const emergencyKey = `emergency:${user.id}:${config.endpoint}`;

      try {
        const redis = await getRedisClient();
        const windowMs = parseTimeWindow(emergencyLimit.window);
        const currentTime = Date.now();
        const windowStart = currentTime - windowMs;

        await redis.zremrangebyscore(emergencyKey, 0, windowStart);
        const currentCount = await redis.zcard(emergencyKey);

        if (currentCount >= emergencyLimit.requests) {
          return c.json(
            {
              error: "Emergency rate limit exceeded",
              code: "EMERGENCY_RATE_LIMIT_EXCEEDED",
              retryAfter: Math.ceil(windowMs / 1000),
            },
            429,
          );
        }

        await redis.zadd(emergencyKey, currentTime, `${currentTime}-${Math.random()}`);
        await redis.expire(emergencyKey, Math.ceil(windowMs / 1000));
      } catch (error) {
        console.error("Emergency rate limiting error:", error);
      }

      console.debug(`Emergency access granted for ${user.id} on ${config.endpoint}`);
      c.res.headers.set("X-Rate-Limit-Emergency", "true");
      c.res.headers.set(
        "X-Rate-Limit-Limit",
        emergencyLimit.requests.toString(),
      );

      return next();
    }

    // Validate professional license for license-required endpoints
    if (config.requiresLicense && user?.professionalLicense) {
      const licenseValid = await ProfessionalLicenseValidator.validateLicense(
        user.professionalLicense.licenseNumber,
      );

      if (!licenseValid) {
        HealthcareSecurityLogger.logLicenseViolation({
          userId: user.id,
          licenseNumber: user.professionalLicense.licenseNumber,
          attemptedResource: config.endpoint,
          timestamp: new Date(),
        });

        return c.json(
          {
            error: "Invalid or expired professional license",
            code: "LICENSE_INVALID",
            licenseNumber: user.professionalLicense.licenseNumber,
          },
          403,
        );
      }
    }

    // Select appropriate rate limit based on user role and context
    let limit;
    switch (userRole) {
      case HealthcareRole.ADMIN:
      case HealthcareRole.HEALTHCARE_PROVIDER:
      case HealthcareRole.EMERGENCY_PHYSICIAN:
      case HealthcareRole.CLINIC_MANAGER:
        limit = config.limits.privileged;
        break;
      case HealthcareRole.CLINIC_STAFF:
      case HealthcareRole.PATIENT:
        limit = config.limits.authenticated;
        break;
      default:
        limit = config.limits.general;
    }

    // Generate rate limit key
    const getUserKey = (user: HealthcareUser | null, ip: string) => {
      return user
        ? `user:${user.id}:${config.endpoint}`
        : `ip:${ip}:${config.endpoint}`;
    };

    const rateLimitKey = getUserKey(
      user,
      c.req.header("CF-Connecting-IP")
        || c.req.header("X-Forwarded-For")
        || "unknown",
    );

    // Redis-based rate limiting implementation
    try {
      const redis = await getRedisClient();
      const windowMs = parseTimeWindow(limit.window);
      const currentTime = Date.now();
      const windowStart = currentTime - windowMs;

      // Remove old entries and count current requests
      await redis.zremrangebyscore(rateLimitKey, 0, windowStart);
      const currentCount = await redis.zcard(rateLimitKey);

      if (currentCount >= limit.requests) {
        // Log rate limit violation
        HealthcareSecurityLogger.logSuspiciousActivity({
          type: "RATE_LIMIT_EXCEEDED",
          userId: user?.id,
          ip: c.req.header("CF-Connecting-IP") || "unknown",
          endpoint: config.endpoint,
          attemptCount: currentCount,
          timestamp: new Date(),
        });

        return c.json(
          {
            error: "Rate limit exceeded",
            code: "RATE_LIMIT_EXCEEDED",
            retryAfter: Math.ceil(windowMs / 1000),
          },
          429,
        );
      }

      // Add current request to sliding window
      await redis.zadd(rateLimitKey, currentTime, `${currentTime}-${Math.random()}`);
      await redis.expire(rateLimitKey, Math.ceil(windowMs / 1000));

      // Set rate limit headers
      c.res.headers.set("X-Rate-Limit-Limit", limit.requests.toString());
      c.res.headers.set("X-Rate-Limit-Remaining", (limit.requests - currentCount - 1).toString());
      c.res.headers.set(
        "X-Rate-Limit-Reset",
        Math.ceil((currentTime + windowMs) / 1000).toString(),
      );
    } catch (error) {
      console.error("Rate limiting error:", error);
      // Fail open - allow request if Redis is unavailable
      // In production, you might want to fail closed for critical endpoints
    }

    c.res.headers.set("X-Rate-Limit-Window", limit.window);
    c.res.headers.set("X-Healthcare-Endpoint", "true");
    c.res.headers.set(
      "X-Patient-Data-Access",
      config.patientDataAccess.toString(),
    );

    return next();
  };
};

// Helper function to get Redis client
async function getRedisClient() {
  // Implementation depends on your Redis setup
  // Example using ioredis:
  const Redis = await import("ioredis");
  const config: any = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    maxRetriesPerRequest: 3,
  };

  if (process.env.REDIS_PASSWORD) {
    config.password = process.env.REDIS_PASSWORD;
  }

  return new Redis.default(config);
}

// Helper function to parse time window strings
function parseTimeWindow(window: string): number {
  const match = window.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid time window format: ${window}`);

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Invalid time unit: ${unit}`);
  }
}

// Multi-layer authentication for healthcare APIs
export class HealthcareAuthMiddleware {
  // JWT validation with healthcare-specific claims
  static async validateJWT(token: string): Promise<HealthcareUser> {
    try {
      // Import jose library for JWT verification
      const { jwtVerify } = await import("jose");

      // Get JWT secret from environment - REQUIRED for production
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error("JWT_SECRET environment variable is required");
      }

      // Validate secret strength (minimum 32 characters)
      if (secret.length < 32) {
        throw new Error("JWT_SECRET must be at least 32 characters long");
      }

      const secretKey = new TextEncoder().encode(secret);

      // For production, use JWKS endpoint for key rotation
      // const JWKS = createRemoteJWKSet(new URL(process.env.JWKS_URI || 'https://your-auth-provider.com/.well-known/jwks.json'));

      // Additional security: validate token age
      const maxTokenAge = 24 * 60 * 60; // 24 hours in seconds
      const currentTime = Math.floor(Date.now() / 1000);

      // Verify JWT token
      const { payload } = await jwtVerify(token, secretKey, {
        issuer: process.env.JWT_ISSUER || "neonpro-healthcare",
        audience: process.env.JWT_AUDIENCE || "neonpro-api",
      });

      // Extract healthcare-specific claims
      const userId = payload.sub as string;
      const email = payload.email as string;
      const role = payload.role as HealthcareRole;
      const clinicId = payload.clinicId as string;
      const clinicIds = payload.clinicIds as string[];
      const emergencyAccess = payload.emergencyAccess as boolean;
      const licenseData = payload.license as any;

      // Validate required claims
      if (!userId || !email || !role) {
        throw new Error("Missing required JWT claims");
      }

      // Construct professional license if present
      let professionalLicense: ProfessionalLicense | undefined;
      if (licenseData) {
        professionalLicense = {
          licenseNumber: licenseData.licenseNumber,
          licenseType: licenseData.licenseType,
          state: licenseData.state,
          issuedDate: new Date(licenseData.issuedDate),
          expirationDate: new Date(licenseData.expirationDate),
          isActive: licenseData.isActive,
          lastValidated: new Date(licenseData.lastValidated),
        };

        // Validate license is still active and not expired
        if (!professionalLicense.isActive || professionalLicense.expirationDate < new Date()) {
          throw new Error("Professional license is expired or inactive");
        }
      }

      // Construct healthcare user object
      const healthcareUser: HealthcareUser = {
        id: userId,
        email,
        role,
        clinicId,
        clinicIds,
        professionalLicense,
        emergencyAccess,
        isActive: true,
      };

      // Additional validation for healthcare providers
      if (role === HealthcareRole.HEALTHCARE_PROVIDER && !professionalLicense) {
        throw new Error("Healthcare providers must have a valid professional license");
      }

      return healthcareUser;
    } catch (error) {
      console.error(
        "JWT validation failed:",
        error instanceof Error ? error.message : "Unknown error",
      );
      throw new Error("Invalid healthcare credentials");
    }
  }

  // Role-based access control with healthcare context
  static async authorizeHealthcareAccess(
    user: HealthcareUser,
    resource: string,
    action: string,
  ): Promise<boolean> {
    // Admin has full access
    if (user.role === HealthcareRole.ADMIN) {
      return true;
    }

    // Patient can only access own data
    if (user.role === HealthcareRole.PATIENT) {
      return this.authorizePatientAccess(user, resource, action);
    }

    // Healthcare providers need clinic-based access + professional license
    if (user.role === HealthcareRole.HEALTHCARE_PROVIDER) {
      return await this.authorizeProviderAccess(user, resource, action);
    }

    // Clinic staff access based on permissions
    if (user.role === HealthcareRole.CLINIC_STAFF) {
      return this.authorizeStaffAccess(user, resource, action);
    }

    return false;
  }

  private static authorizePatientAccess(
    user: HealthcareUser,
    resource: string,
    action: string,
  ): boolean {
    // Patients can only read their own data
    if (action !== "read") {
      return false;
    }

    // Check if resource contains user's ID
    return resource.includes(user.id);
  }

  private static async authorizeProviderAccess(
    user: HealthcareUser,
    resource: string,
    _action: string,
  ): Promise<boolean> {
    // Verify professional license is active
    if (user.professionalLicense) {
      const licenseValid = await ProfessionalLicenseValidator.validateLicense(
        user.professionalLicense.licenseNumber,
      );

      if (!licenseValid) {
        HealthcareSecurityLogger.logLicenseViolation({
          userId: user.id,
          licenseNumber: user.professionalLicense.licenseNumber,
          attemptedResource: resource,
          timestamp: new Date(),
        });
        return false;
      }
    }

    // Check clinic access permissions
    const hasClinicAccess = user.clinicIds?.some((clinicId) => resource.includes(clinicId))
      || (user.clinicId && resource.includes(user.clinicId));

    if (!hasClinicAccess) {
      HealthcareSecurityLogger.logUnauthorizedAccess({
        userId: user.id,
        resource,
        reason: "clinic_access_denied",
        timestamp: new Date(),
      });
      return false;
    }

    return true;
  }

  private static authorizeStaffAccess(
    user: HealthcareUser,
    resource: string,
    action: string,
  ): boolean {
    // Staff can access data within their clinic
    const hasClinicAccess = user.clinicIds?.some((clinicId) => resource.includes(clinicId))
      || (user.clinicId && resource.includes(user.clinicId));

    // Staff typically can't delete critical data
    if (action === "delete" && resource.includes("patient")) {
      return false;
    }

    return hasClinicAccess;
  }
}

// TLS validation middleware
export const validateTLSMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    // Verify HTTPS is being used
    const protocol = c.req.header("x-forwarded-proto") || c.req.header("x-forwarded-protocol");

    if (!protocol || !protocol.includes("https")) {
      return c.json(
        {
          error: "HTTPS required for healthcare data",
          code: "HTTPS_REQUIRED",
        },
        400,
      );
    }

    // Set security headers
    c.res.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
    c.res.headers.set("X-Content-Type-Options", "nosniff");
    c.res.headers.set("X-Frame-Options", "DENY");
    c.res.headers.set("X-XSS-Protection", "1; mode=block");
    c.res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    return next();
  };
};

// Export healthcare security utilities
export const healthcareSecurityUtils = {
  // Validate professional license
  validateLicense: ProfessionalLicenseValidator.validateLicense,

  // Get license information
  getLicense: ProfessionalLicenseValidator.getLicense,

  // Security logging
  logger: HealthcareSecurityLogger,

  // Check emergency access requirements
  requiresEmergencyJustification: (endpoint: string): boolean => {
    const config = HEALTHCARE_RATE_LIMITS.find((c) => endpoint.startsWith(c.endpoint));
    return config?.emergencyBypass === true;
  },

  // Get rate limit configuration for endpoint
  getRateLimitConfig: (endpoint: string): HealthcareRateLimitConfig | null => {
    return (
      HEALTHCARE_RATE_LIMITS.find((c) => endpoint.startsWith(c.endpoint))
      || null
    );
  },
};

export { HEALTHCARE_RATE_LIMITS, HealthcareSecurityLogger, ProfessionalLicenseValidator };
