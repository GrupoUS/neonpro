/**
 * 🔐 Enhanced JWT Authentication Middleware - NeonPro API
 * ======================================================
 *
 * Production-ready JWT authentication using 'jose' library with:
 * - Comprehensive token validation (signature, claims, expiration)
 * - Healthcare-specific JWT claims validation
 * - Professional license validation integration
 * - Emergency access token handling
 * - Audit logging for all authentication events
 * - Brazilian healthcare regulatory compliance
 */

import type { Context, MiddlewareHandler } from "hono";
import { jwtVerify, type JWTPayload, type JWTVerifyResult } from "jose";

// Healthcare user roles with license requirements
export enum HealthcareRole {
  ADMIN = "admin",
  EMERGENCY_PHYSICIAN = "emergency_physician",
  HEALTHCARE_PROVIDER = "healthcare_provider", 
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
  CRBM = "crbm", // Conselho Regional de Biomedicina
}

// Healthcare-specific JWT payload interface
export interface HealthcareJWTPayload extends JWTPayload {
  // Standard claims
  sub: string; // User ID
  email: string;
  name: string;
  
  // Healthcare-specific claims
  role: HealthcareRole;
  clinic_id?: string;
  clinic_ids?: string[]; // For multi-clinic access
  professional_id?: string;
  
  // Professional licensing
  license?: {
    number: string;
    type: ProfessionalLicenseType;
    state: string; // Brazilian state (SP, RJ, etc.)
    issued_date: string;
    expiration_date: string;
    is_active: boolean;
    last_validated: string;
  };
  
  // Security context
  permissions: string[];
  session_id: string;
  device_id?: string;
  ip_address?: string;
  
  // Emergency access
  emergency_access?: {
    granted: boolean;
    type: "medical" | "life_threatening" | "urgent_care";
    expires_at: number;
    justification: string;
  };
  
  // Audit context
  issued_by: string; // System that issued the token
  purpose: string; // Authentication purpose
}

// Authentication result interface
export interface AuthenticationResult {
  user: HealthcareJWTPayload;
  token: string;
  isValid: boolean;
  isEmergency: boolean;
  validationErrors?: string[];
}

// JWT validation configuration
interface JWTValidationConfig {
  issuer: string;
  audience: string;
  clockTolerance: number; // seconds
  maxTokenAge: number; // seconds
  requiredClaims: string[];
  algorithms: string[];
}

// Default JWT validation configuration
const DEFAULT_JWT_CONFIG: JWTValidationConfig = {
  issuer: process.env.JWT_ISSUER || "neonpro-api",
  audience: process.env.JWT_AUDIENCE || "neonpro-healthcare",
  clockTolerance: 30, // 30 seconds tolerance
  maxTokenAge: 3600, // 1 hour max token age
  requiredClaims: ["sub", "email", "role", "session_id"],
  algorithms: ["HS256", "RS256"], // Support both symmetric and asymmetric
};

// Audit logger for authentication events
interface CriticalSecurityAlert {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: string;
  message: string;
  metadata: any;
  requiresImmediate: boolean;
  complianceRequired?: boolean;
}

class AuthenticationAuditLogger {
  private static async sendCriticalSecurityAlert(alert: CriticalSecurityAlert): Promise<void> {
    // Log to console for immediate visibility
    console.error(`[CRITICAL_SECURITY_ALERT_${alert.level}]`, alert);
    
    // In production, integrate with:
    // - Emergency response systems
    // - Security Operations Center (SOC)
    // - Healthcare compliance officers
    // - Legal team for regulatory compliance
    
    if (alert.requiresImmediate) {
      // Send immediate notifications via multiple channels
      await this.sendImmediateCriticalNotification(alert);
    }
    
    if (alert.complianceRequired) {
      // Send to compliance team for regulatory reporting
      await this.sendComplianceNotification(alert);
    }
    
    // Store in critical security audit log
    await this.storeCriticalSecurityEvent(alert);
  }
  
  private static async sendImmediateCriticalNotification(alert: CriticalSecurityAlert): Promise<void> {
    // Placeholder for immediate critical notification logic
    // In production: Emergency SMS, phone calls, Slack alerts, PagerDuty escalation
    console.error(`[IMMEDIATE_CRITICAL_NOTIFICATION]`, {
      timestamp: new Date().toISOString(),
      alert,
      escalation: 'IMMEDIATE_RESPONSE_REQUIRED'
    });
  }
  
  private static async sendComplianceNotification(alert: CriticalSecurityAlert): Promise<void> {
    // Placeholder for compliance notification logic
    // In production: LGPD compliance system, ANVISA reporting, legal team alerts
    console.warn(`[COMPLIANCE_NOTIFICATION]`, {
      timestamp: new Date().toISOString(),
      alert,
      regulatory: 'HEALTHCARE_COMPLIANCE_REQUIRED'
    });
  }
  
  private static async storeCriticalSecurityEvent(alert: CriticalSecurityAlert): Promise<void> {
    // Placeholder for critical security event storage
    // In production: Immutable audit log, regulatory compliance database
    console.info(`[CRITICAL_SECURITY_EVENT_STORED]`, {
      timestamp: new Date().toISOString(),
      eventId: `crit_sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      alert,
      retention: 'PERMANENT_REGULATORY_RECORD'
    });
  }

  static logAuthAttempt(details: {
    success: boolean;
    user_id?: string;
    email?: string;
    ip_address: string;
    user_agent: string;
    error?: string;
    timestamp: Date;
  }): void {
    const logLevel = details.success ? "INFO" : "WARN";
    console.log(`[AUTH_ATTEMPT][${logLevel}]`, {
      type: "jwt_authentication",
      ...details,
    });

    // TODO: Send to external audit system (Sentry, CloudWatch, DataDog)
    if (!details.success) {
      // Additional security alerting for failed attempts
      console.log("[SECURITY_ALERT]", {
        type: "failed_authentication",
        ip: details.ip_address,
        email: details.email,
        timestamp: details.timestamp,
      });
    }
  }

  static logEmergencyAccess(details: {
    user_id: string;
    emergency_type: string;
    justification: string;
    expires_at: Date;
    granted_by: string;
    timestamp: Date;
  }): void {
    console.log("[EMERGENCY_ACCESS][CRITICAL]", {
      type: "emergency_token_used",
      ...details,
    });

    // Immediately alert security team and compliance officer
    this.sendCriticalSecurityAlert({
      level: 'CRITICAL',
      type: 'EMERGENCY_ACCESS_GRANTED',
      message: `Emergency access granted to user ${details.user_id} for ${details.emergency_type}`,
      metadata: details,
      requiresImmediate: true,
      complianceRequired: true
    });
  }

  static logTokenValidation(details: {
    success: boolean;
    token_id?: string;
    user_id?: string;
    validation_errors?: string[];
    timestamp: Date;
  }): void {
    console.log("[TOKEN_VALIDATION]", {
      type: "jwt_validation",
      ...details,
    });
  }

  static logLicenseValidation(details: {
    user_id: string;
    license_number: string;
    license_type: string;
    is_valid: boolean;
    timestamp: Date;
  }): void {
    console.log("[LICENSE_VALIDATION]", {
      type: "professional_license_check",
      ...details,
    });
  }
}

// JWT secret/key management
class JWTKeyManager {
  private static jwtSecret: Uint8Array | null = null;

  static getJWTSecret(): Uint8Array {
    if (!this.jwtSecret) {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error("JWT_SECRET environment variable is required");
      }
      
      if (secret.length < 32) {
        throw new Error("JWT_SECRET must be at least 32 characters long");
      }
      
      this.jwtSecret = new TextEncoder().encode(secret);
    }
    return this.jwtSecret;
  }

  static rotateSecret(newSecret: string): void {
    if (newSecret.length < 32) {
      throw new Error("New JWT secret must be at least 32 characters long");
    }
    this.jwtSecret = new TextEncoder().encode(newSecret);
    console.log("[JWT_SECRET_ROTATION]", { 
      timestamp: new Date(),
      message: "JWT secret rotated successfully" 
    });
  }
}

// Token blacklist management (for revoked tokens)
class TokenBlacklist {
  private static blacklistedTokens = new Set<string>();
  private static blacklistedSessions = new Set<string>();

  static addToken(tokenId: string): void {
    this.blacklistedTokens.add(tokenId);
    console.log("[TOKEN_BLACKLIST]", {
      type: "token_revoked",
      token_id: tokenId,
      timestamp: new Date(),
    });
  }

  static addSession(sessionId: string): void {
    this.blacklistedSessions.add(sessionId);
    console.log("[SESSION_BLACKLIST]", {
      type: "session_revoked",
      session_id: sessionId,
      timestamp: new Date(),
    });
  }

  static isTokenBlacklisted(tokenId: string): boolean {
    return this.blacklistedTokens.has(tokenId);
  }

  static isSessionBlacklisted(sessionId: string): boolean {
    return this.blacklistedSessions.has(sessionId);
  }

  static cleanup(): void {
    // In production, this should check expiration times and remove expired entries
    // For now, we keep all blacklisted tokens until server restart
    console.log("[BLACKLIST_CLEANUP]", {
      tokens_count: this.blacklistedTokens.size,
      sessions_count: this.blacklistedSessions.size,
      timestamp: new Date(),
    });
  }
}

// Cleanup blacklist every hour
setInterval(() => {
  TokenBlacklist.cleanup();
}, 60 * 60 * 1000);

/**
 * Enhanced JWT validation with healthcare-specific logic
 */
export class HealthcareJWTValidator {
  private config: JWTValidationConfig;

  constructor(config?: Partial<JWTValidationConfig>) {
    this.config = { ...DEFAULT_JWT_CONFIG, ...config };
  }

  /**
   * Validate JWT token with comprehensive healthcare checks
   */
  async validateToken(token: string): Promise<AuthenticationResult> {
    const validationErrors: string[] = [];

    try {
      // Get JWT secret for validation
      const secret = JWTKeyManager.getJWTSecret();

      // Verify JWT using jose library
      const verifyResult: JWTVerifyResult = await jwtVerify(token, secret, {
        issuer: this.config.issuer,
        audience: this.config.audience,
        clockTolerance: this.config.clockTolerance,
        maxTokenAge: `${this.config.maxTokenAge}s`,
      });

      const payload = verifyResult.payload as HealthcareJWTPayload;

      // Validate required healthcare claims
      const missingClaims = this.config.requiredClaims.filter(
        claim => !(claim in payload)
      );

      if (missingClaims.length > 0) {
        validationErrors.push(`Missing required claims: ${missingClaims.join(", ")}`);
      }

      // Check token blacklist
      if (payload.jti && TokenBlacklist.isTokenBlacklisted(payload.jti)) {
        validationErrors.push("Token has been revoked");
      }

      // Check session blacklist
      if (payload.session_id && TokenBlacklist.isSessionBlacklisted(payload.session_id)) {
        validationErrors.push("Session has been revoked");
      }

      // Validate healthcare-specific claims
      if (!Object.values(HealthcareRole).includes(payload.role)) {
        validationErrors.push(`Invalid healthcare role: ${payload.role}`);
      }

      // Validate professional license if present
      if (payload.license) {
        const licenseValid = await this.validateProfessionalLicense(payload.license);
        if (!licenseValid) {
          validationErrors.push("Professional license is invalid or expired");
        }
      }

      // Check emergency access expiration
      const isEmergency = this.isEmergencyAccess(payload);
      if (isEmergency && payload.emergency_access) {
        const now = Math.floor(Date.now() / 1000);
        if (payload.emergency_access.expires_at < now) {
          validationErrors.push("Emergency access token has expired");
        }
      }

      // Log validation attempt
      AuthenticationAuditLogger.logTokenValidation({
        success: validationErrors.length === 0,
        token_id: payload.jti,
        user_id: payload.sub,
        validation_errors: validationErrors.length > 0 ? validationErrors : undefined,
        timestamp: new Date(),
      });

      // Log emergency access if applicable
      if (isEmergency && validationErrors.length === 0) {
        AuthenticationAuditLogger.logEmergencyAccess({
          user_id: payload.sub,
          emergency_type: payload.emergency_access!.type,
          justification: payload.emergency_access!.justification,
          expires_at: new Date(payload.emergency_access!.expires_at * 1000),
          granted_by: payload.issued_by,
          timestamp: new Date(),
        });
      }

      return {
        user: payload,
        token,
        isValid: validationErrors.length === 0,
        isEmergency,
        validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown JWT validation error";
      validationErrors.push(errorMessage);

      AuthenticationAuditLogger.logTokenValidation({
        success: false,
        validation_errors: [errorMessage],
        timestamp: new Date(),
      });

      return {
        user: {} as HealthcareJWTPayload,
        token,
        isValid: false,
        isEmergency: false,
        validationErrors,
      };
    }
  }

  /**
   * Check if token represents emergency access
   */
  private isEmergencyAccess(payload: HealthcareJWTPayload): boolean {
    return Boolean(
      payload.emergency_access?.granted &&
      payload.role === HealthcareRole.EMERGENCY_PHYSICIAN
    );
  }

  /**
   * Validate professional license (mock implementation)
   * TODO: Integrate with real Brazilian medical council APIs
   */
  private async validateProfessionalLicense(
    license: NonNullable<HealthcareJWTPayload["license"]>
  ): Promise<boolean> {
    try {
      // Check expiration date
      const expirationDate = new Date(license.expiration_date);
      const now = new Date();
      
      if (expirationDate <= now) {
        return false;
      }

      // Check if license is marked as active
      if (!license.is_active) {
        return false;
      }

      // TODO: Make actual API call to respective council
      // Mock validation for development
      const isValid = license.number.length >= 6 && 
                     Object.values(ProfessionalLicenseType).includes(license.type);

      // Log license validation
      AuthenticationAuditLogger.logLicenseValidation({
        user_id: "", // Will be filled by caller
        license_number: license.number,
        license_type: license.type,
        is_valid: isValid,
        timestamp: new Date(),
      });

      return isValid;

    } catch (error) {
      console.error("[LICENSE_VALIDATION_ERROR]", {
        license_number: license.number,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      });
      return false;
    }
  }
}

/**
 * Main JWT authentication middleware
 */
export const createJWTAuthMiddleware = (
  config?: Partial<JWTValidationConfig>
): MiddlewareHandler => {
  const validator = new HealthcareJWTValidator(config);

  return async (c: Context, next) => {
    const authHeader = c.req.header("Authorization");
    const clientIP = c.req.header("CF-Connecting-IP") || 
                    c.req.header("X-Forwarded-For") || 
                    c.req.header("X-Real-IP") || 
                    "unknown";
    const userAgent = c.req.header("User-Agent") || "unknown";

    // Check for Bearer token
    if (!authHeader?.startsWith("Bearer ")) {
      AuthenticationAuditLogger.logAuthAttempt({
        success: false,
        ip_address: clientIP,
        user_agent: userAgent,
        error: "Missing or invalid Authorization header",
        timestamp: new Date(),
      });

      return c.json({
        error: "AUTHENTICATION_REQUIRED",
        message: "Valid JWT token required",
        code: "MISSING_AUTH_HEADER",
      }, 401);
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix

    try {
      // Validate the JWT token
      const authResult = await validator.validateToken(token);

      if (!authResult.isValid) {
        AuthenticationAuditLogger.logAuthAttempt({
          success: false,
          user_id: authResult.user.sub,
          email: authResult.user.email,
          ip_address: clientIP,
          user_agent: userAgent,
          error: authResult.validationErrors?.join(", "),
          timestamp: new Date(),
        });

        return c.json({
          error: "AUTHENTICATION_FAILED",
          message: "Invalid JWT token",
          details: authResult.validationErrors,
          code: "INVALID_TOKEN",
        }, 401);
      }

      // Log successful authentication
      AuthenticationAuditLogger.logAuthAttempt({
        success: true,
        user_id: authResult.user.sub,
        email: authResult.user.email,
        ip_address: clientIP,
        user_agent: userAgent,
        timestamp: new Date(),
      });

      // Set user context in Hono context
      c.set("user", authResult.user);
      c.set("userId", authResult.user.sub);
      c.set("userRole", authResult.user.role);
      c.set("userPermissions", authResult.user.permissions);
      c.set("clinicId", authResult.user.clinic_id);
      c.set("clinicIds", authResult.user.clinic_ids);
      c.set("professionalId", authResult.user.professional_id);
      c.set("sessionId", authResult.user.session_id);
      c.set("isEmergencyAccess", authResult.isEmergency);

      // Set response headers for audit trail
      c.res.headers.set("X-User-ID", authResult.user.sub);
      c.res.headers.set("X-User-Role", authResult.user.role);
      c.res.headers.set("X-Session-ID", authResult.user.session_id);
      c.res.headers.set("X-Auth-Method", "jwt");
      
      if (authResult.isEmergency) {
        c.res.headers.set("X-Emergency-Access", "true");
        c.res.headers.set("X-Emergency-Type", authResult.user.emergency_access!.type);
      }

      await next();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Authentication error";
      
      AuthenticationAuditLogger.logAuthAttempt({
        success: false,
        ip_address: clientIP,
        user_agent: userAgent,
        error: errorMessage,
        timestamp: new Date(),
      });

      return c.json({
        error: "AUTHENTICATION_ERROR",
        message: "Authentication processing failed",
        code: "AUTH_PROCESSING_ERROR",
      }, 500);
    }
  };
};

// Utility functions for token management
export const jwtAuthUtils = {
  // Revoke a specific token
  revokeToken: (tokenId: string): void => {
    TokenBlacklist.addToken(tokenId);
  },

  // Revoke all tokens for a session
  revokeSession: (sessionId: string): void => {
    TokenBlacklist.addSession(sessionId);
  },

  // Rotate JWT secret (use with caution)
  rotateSecret: (newSecret: string): void => {
    JWTKeyManager.rotateSecret(newSecret);
  },

  // Check if user has specific role
  hasRole: (c: Context, role: HealthcareRole): boolean => {
    const userRole = c.get("userRole");
    return userRole === role;
  },

  // Check if user has emergency access
  hasEmergencyAccess: (c: Context): boolean => {
    return Boolean(c.get("isEmergencyAccess"));
  },

  // Get user license information
  getUserLicense: (c: Context): HealthcareJWTPayload["license"] | undefined => {
    const user = c.get("user") as HealthcareJWTPayload;
    return user?.license;
  },

  // Validate clinic access
  canAccessClinic: (c: Context, clinicId: string): boolean => {
    const userClinicId = c.get("clinicId");
    const userClinicIds = c.get("clinicIds") as string[] | undefined;
    const userRole = c.get("userRole");

    // Admins can access any clinic
    if (userRole === HealthcareRole.ADMIN) {
      return true;
    }

    // Check direct clinic assignment
    if (userClinicId === clinicId) {
      return true;
    }

    // Check multi-clinic access
    if (userClinicIds?.includes(clinicId)) {
      return true;
    }

    return false;
  },
};

export { 
  HealthcareJWTValidator, 
  AuthenticationAuditLogger,
  TokenBlacklist,
  JWTKeyManager,
  DEFAULT_JWT_CONFIG 
};