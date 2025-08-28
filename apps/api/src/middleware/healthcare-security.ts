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

import type { Context, MiddlewareHandler } from "hono";
import { createError } from "./error-handler";

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
    general: { requests: number; window: string };
    authenticated: { requests: number; window: string };
    privileged: { requests: number; window: string };
    emergency: { requests: number; window: string };
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
class HealthcareSecurityLogger {
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

    // TODO: Send to external audit system (Sentry, CloudWatch, etc.)
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

    // TODO: Integrate with security monitoring system
  }

  static logLicenseViolation(details: {
    userId: string;
    licenseNumber?: string;
    attemptedResource: string;
    timestamp: Date;
  }): void {
    console.log("[LICENSE_VIOLATION]", details);

    // TODO: Alert compliance team
  }

  static logUnauthorizedAccess(details: {
    userId: string;
    resource: string;
    reason: string;
    timestamp: Date;
  }): void {
    console.log("[UNAUTHORIZED_ACCESS]", details);

    // TODO: Alert security team
  }

  static logWeakTLS(details: {
    ip: string;
    tlsVersion?: string;
    cipherSuite?: string;
    timestamp: Date;
  }): void {
    console.log("[WEAK_TLS]", details);

    // TODO: Alert infrastructure team
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
  private static mockLicenses: Map<string, ProfessionalLicense> = new Map([
    [
      "CRM123456SP",
      {
        licenseNumber: "CRM123456SP",
        licenseType: ProfessionalLicenseType.CRM,
        state: "SP",
        issuedDate: new Date("2020-01-01"),
        expirationDate: new Date("2025-12-31"),
        isActive: true,
        lastValidated: new Date(),
      },
    ],
    [
      "CRF789012RJ",
      {
        licenseNumber: "CRF789012RJ",
        licenseType: ProfessionalLicenseType.CRF,
        state: "RJ",
        issuedDate: new Date("2019-03-15"),
        expirationDate: new Date("2024-03-14"),
        isActive: true,
        lastValidated: new Date(),
      },
    ],
  ]);

  static async validateLicense(licenseNumber: string): Promise<boolean> {
    const license = this.mockLicenses.get(licenseNumber);

    if (!license) {
      return false;
    }

    // Check if license is active and not expired
    const now = new Date();
    const isValid = license.isActive && license.expirationDate > now;

    if (isValid) {
      // Update last validated timestamp
      license.lastValidated = now;
      this.mockLicenses.set(licenseNumber, license);
    }

    return isValid;
  }

  static async getLicense(
    licenseNumber: string,
  ): Promise<ProfessionalLicense | null> {
    return this.mockLicenses.get(licenseNumber) || null;
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
      config.emergencyBypass &&
      isEmergency &&
      userRole === HealthcareRole.EMERGENCY_PHYSICIAN
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
        emergencyType: (c.req.header("X-Emergency-Type") as "medical" | "life_threatening" | "urgent_care") || "medical",
        timestamp: new Date(),
        ipAddress: c.req.header("CF-Connecting-IP") || "unknown",
        userAgent: c.req.header("User-Agent") || "unknown",
      });

      // Apply emergency rate limits but allow higher throughput
      const emergencyLimit = config.limits.emergency;
      const key = `emergency:${user.id}:${config.endpoint}`;

      // TODO: Implement actual rate limit checking with Redis/memory store
      // For now, just log and continue
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

    const key = getUserKey(
      user,
      c.req.header("CF-Connecting-IP") ||
        c.req.header("X-Forwarded-For") ||
        "unknown",
    );

    // TODO: Implement actual rate limiting with Redis
    // For now, set headers and continue
    c.res.headers.set("X-Rate-Limit-Limit", limit.requests.toString());
    c.res.headers.set("X-Rate-Limit-Window", limit.window);
    c.res.headers.set("X-Healthcare-Endpoint", "true");
    c.res.headers.set(
      "X-Patient-Data-Access",
      config.patientDataAccess.toString(),
    );

    return next();
  };
};

// Multi-layer authentication for healthcare APIs
export class HealthcareAuthMiddleware {
  // JWT validation with healthcare-specific claims
  static async validateJWT(token: string): Promise<HealthcareUser> {
    try {
      // TODO: Implement proper JWT verification with jose library
      // Mock implementation for now
      if (token === "mock-healthcare-token") {
        return {
          id: "user_123",
          email: "doctor@neonpro.com",
          role: HealthcareRole.HEALTHCARE_PROVIDER,
          clinicId: "clinic_123",
          professionalLicense: {
            licenseNumber: "CRM123456SP",
            licenseType: ProfessionalLicenseType.CRM,
            state: "SP",
            issuedDate: new Date("2020-01-01"),
            expirationDate: new Date("2025-12-31"),
            isActive: true,
            lastValidated: new Date(),
          },
          isActive: true,
        };
      }

      throw new Error("Invalid token");
    } catch (error) {
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
    action: string,
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
    const hasClinicAccess =
      user.clinicIds?.some((clinicId) => resource.includes(clinicId)) ||
      (user.clinicId && resource.includes(user.clinicId));

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
    const hasClinicAccess =
      user.clinicIds?.some((clinicId) => resource.includes(clinicId)) ||
      (user.clinicId && resource.includes(user.clinicId));

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
    const protocol =
      c.req.header("x-forwarded-proto") || c.req.header("x-forwarded-protocol");

    if (!protocol?.includes("https")) {
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
    const config = HEALTHCARE_RATE_LIMITS.find((c) =>
      endpoint.startsWith(c.endpoint),
    );
    return config?.emergencyBypass === true;
  },

  // Get rate limit configuration for endpoint
  getRateLimitConfig: (endpoint: string): HealthcareRateLimitConfig | null => {
    return (
      HEALTHCARE_RATE_LIMITS.find((c) => endpoint.startsWith(c.endpoint)) ||
      null
    );
  },
};

export {
  HEALTHCARE_RATE_LIMITS,
  ProfessionalLicenseValidator,
  HealthcareSecurityLogger,
};
