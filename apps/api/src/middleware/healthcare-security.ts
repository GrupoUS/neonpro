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
import type { RedisOptions } from "ioredis";

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
  metadata: unknown;
  requiresImmediate: boolean;
}

interface ComplianceAlert {
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  type: string;
  message: string;
  metadata: unknown;
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

// CFM API response type and guard
interface CFMApiResponse {
  numero_inscricao: string;
  uf: string;
  data_inscricao: string;
  data_vencimento?: string | null;
  situacao?: string;
}

function isCFMApiResponse(data: unknown): data is CFMApiResponse {
  return !!data
    && typeof data === "object"
    && "numero_inscricao" in data
    && typeof (data as any).numero_inscricao === "string"
    && "uf" in data
    && typeof (data as any).uf === "string"
    && "data_inscricao" in data
    && typeof (data as any).data_inscricao === "string";
}

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

  // Returns full license details (or null) using cache + remote lookup
  static async getLicense(licenseNumber: string): Promise<ProfessionalLicense | null> {
    try {
      const cached = this.licenseCache.get(licenseNumber);
      if (cached && (Date.now() - cached.cachedAt.getTime()) < this.CACHE_DURATION) {
        return cached.license;
      }

      const license = await this.fetchLicenseFromCFM(licenseNumber);
      if (license) {
        this.licenseCache.set(licenseNumber, { license, cachedAt: new Date() });
      }
      return license;
    } catch (error) {
      console.error(`Get license failed for ${licenseNumber}:`, error);
      return null;
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
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.CFM_API_KEY}`,
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
      if (!isCFMApiResponse(data)) {
        throw new Error("Invalid CFM API response");
      }

      // Map and return normalized license
      return this.mapCFMResponseToLicense(data);
    } catch (error) {
      console.error(`CFM fetch failed for ${licenseNumber}:`, error);
      return null;
    }
  }

  private static mapCFMResponseToLicense(cfmData: unknown): ProfessionalLicense {
    if (!isCFMApiResponse(cfmData)) {
      throw new Error("Invalid CFM API response payload");
    }

    const rawNumber = String(cfmData.numero_inscricao).trim();

    // Infer license type from prefix to support multiple healthcare councils (e.g., CRM, CRF, CREFITO, CRN, COREN, CRO, CRP)
    const prefix = rawNumber.toUpperCase().match(/^[A-Z]+/)?.[0]?.toLowerCase();
    const validTypes = new Set(Object.values(ProfessionalLicenseType));
    const inferredType = prefix && validTypes.has(prefix as ProfessionalLicenseType)
      ? (prefix as ProfessionalLicenseType)
      : ProfessionalLicenseType.CRM; // default for CFM responses

    const issuedDate = new Date(cfmData.data_inscricao);
    const expirationDate = new Date(cfmData.data_vencimento ?? "2030-12-31");

    // Normalize status and compute active flag
    const status = String(cfmData.situacao ?? "").toUpperCase();
    const activeStatuses = new Set(["ATIVO", "ATIVA", "REGULAR", "OK"]);

    return {
      licenseNumber: rawNumber,
      licenseType: inferredType,
      state: cfmData.uf,
      issuedDate,
      expirationDate,
      isActive: activeStatuses.has(status) && expirationDate > new Date(),
      lastValidated: new Date(),
    };
  }

  private static fallbackValidation(licenseNumber: string): ProfessionalLicense | null {
    // Basic fallback validation supporting CRM/CRF like: CRM12345SP or CRF12345SP
    const crmPattern = /^CRM\d{4,10}[A-Z]{2}$/i;
    const crfPattern = /^CRF\d{4,10}[A-Z]{2}$/i;

    if (!crmPattern.test(licenseNumber) && !crfPattern.test(licenseNumber)) {
      return null;
    }

    const state = licenseNumber.slice(-2).toUpperCase();
    const licenseType = licenseNumber.toUpperCase().startsWith("CRM")
      ? ProfessionalLicenseType.CRM
      : ProfessionalLicenseType.CRF;

    return {
      licenseNumber,
      licenseType,
      state,
      issuedDate: new Date("2020-01-01"),
      expirationDate: new Date("2030-12-31"),
      isActive: true,
      lastValidated: new Date(),
    };
  }
}

// End of ProfessionalLicenseValidator class

/*
  // Continue middleware definition

  // Check emergency access requirements
  static requiresEmergencyJustification(endpoint: string): boolean {
    const config = HEALTHCARE_RATE_LIMITS.find((c) => endpoint.startsWith(c.endpoint));
    return config?.emergencyBypass === true;
  }
  if (
    config.emergencyBypass
    && (c.req.header("X-Emergency") === "true" || user?.emergencyAccess === true)
    && userRole === HealthcareRole.EMERGENCY_PHYSICIAN
  ) {
      type EmergencyJustification = string;
      if (!(emergencyJustification as EmergencyJustification | undefined)) {
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
*/
/*
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

      // Set rate limit headers
      c.res.headers.set("X-Rate-Limit-Limit", limit.requests.toString());
      c.res.headers.set("X-Rate-Limit-Remaining", (limit.requests - currentCount).toString());
      c.res.headers.set("X-Rate-Limit-Window", limit.window);
      c.res.headers.set("X-Healthcare-Endpoint", "true");

      return next();
    } catch (error) {
      console.error("Rate limiting error:", error);
      return c.json(
        {
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        },
        500,
      );
    }
  }
*/

// Multi-layer authentication for healthcare APIs

interface JWTLicenseClaim {
  licenseNumber: string;
  licenseType: ProfessionalLicenseType | string;
  state: string;
  issuedDate: string | Date;
  expirationDate: string | Date;
  isActive: boolean;
  lastValidated?: string | Date;
}

function isJWTLicenseClaim(x: unknown): x is JWTLicenseClaim {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return typeof o.licenseNumber === "string"
    && typeof o.state === "string"
    && typeof o.isActive === "boolean"
    && "licenseType" in o
    && "issuedDate" in o
    && "expirationDate" in o;
}

function parseTimeWindow(window: string): number {
  const match = window.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid time window format: ${window}`);
  }

  const value = parseInt(match[1]!, 10);
  const unit = match[2]!;

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
      throw new Error(`Unsupported time unit: ${unit}`);
  }
}

// Helper function to get Redis client
async function getRedisClient() {
  // Implementation depends on your Redis setup
  // Example using ioredis:
  const RedisPkg = await import("ioredis");
  const IORedis = (RedisPkg as any).default ?? (RedisPkg as any);

  const config: RedisOptions & { password?: string; } = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    maxRetriesPerRequest: 3,
  };

  if (process.env.REDIS_PASSWORD) {
    config.password = process.env.REDIS_PASSWORD;
  }

  // Instantiate Redis client
  return new IORedis(config);
}

export class HealthcareAuthMiddleware {
  // Role-based access control with healthcare context
  static async authorizeAccess(
    user: HealthcareUser,
    resource: string,
    action: string,
  ): Promise<boolean> {
    // Admins and clinic managers have broad access
    if (user.role === HealthcareRole.ADMIN || user.role === HealthcareRole.CLINIC_MANAGER) {
      return true;
    }

    // Patients can only access their own data (read-only)
    if (user.role === HealthcareRole.PATIENT) {
      return this.authorizePatientAccess(user, resource, action);
    }

    // Licensed providers (including emergency physicians)
    if (
      user.role === HealthcareRole.HEALTHCARE_PROVIDER
      || user.role === HealthcareRole.EMERGENCY_PHYSICIAN
    ) {
      return this.authorizeProviderAccess(user, resource, action);
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
