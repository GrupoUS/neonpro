/**
 * 🛡️ Healthcare Security Middleware Orchestrator - NeonPro API
 * ============================================================
 *
 * Central orchestrator for all healthcare security middleware components:
 * - JWT authentication with healthcare professional validation
 * - Brazilian healthcare input validation (CPF, CNS, licenses)
 * - Rate limiting with emergency bypass functionality
 * - Security headers with LGPD compliance
 * - CORS policies for healthcare system integration
 * - Error handling with regulatory compliance
 * - Audit logging for medical data access
 * - Emergency access procedures
 */

import type { MiddlewareHandler } from "hono";

// Import all security middleware components
import { createJWTAuthMiddleware, HealthcareRole } from "./auth/jwt-validation";
import { createHealthcareErrorHandler } from "./error-handling/healthcare-error-handler";
import {
  createHealthcareCORSMiddleware,
  healthcareCORSMiddlewares,
  HealthcareCORSPolicy,
} from "./headers/healthcare-cors-middleware";
import {
  createSecurityHeadersMiddleware,
  securityHeadersMiddlewares,
} from "./headers/security-headers-middleware";
import {
  createHealthcareRateLimiter,
  createRedisHealthcareRateLimiter,
} from "./rate-limiting/healthcare-rate-limiter";
import {
  createHealthcareValidationMiddleware,
  ValidationContext,
  validationMiddlewares,
} from "./validation/healthcare-validation-middleware";

// Environment configuration types
export enum SecurityEnvironment {
  DEVELOPMENT = "development",
  STAGING = "staging",
  PRODUCTION = "production",
}

// Healthcare endpoint security levels
export enum EndpointSecurityLevel {
  PUBLIC = "public", // Marketing pages, public info
  PATIENT_PORTAL = "patient_portal", // Patient self-service
  PROVIDER_DASHBOARD = "provider_dashboard", // Healthcare provider access
  MEDICAL_RECORDS = "medical_records", // Sensitive medical data
  EMERGENCY_ACCESS = "emergency_access", // Emergency procedures
  ADMINISTRATIVE = "administrative", // System administration
}

// Security configuration interface
interface HealthcareSecurityConfig {
  environment: SecurityEnvironment;
  endpointLevel: EndpointSecurityLevel;

  // Component configurations
  authentication: {
    enabled: boolean;
    jwtSecret: string;
    emergencyBypass: boolean;
    requireHealthcareLicense: boolean;
    allowedRoles: HealthcareRole[];
  };

  rateLimiting: {
    enabled: boolean;
    storage: "memory" | "redis";
    redisClient?: any;
    emergencyBypass: boolean;
    monitoring: boolean;
    alerting: boolean;
  };

  inputValidation: {
    enabled: boolean;
    emergencyBypass: boolean;
    auditLogger?: any;
    contexts: ValidationContext[];
  };

  securityHeaders: {
    enabled: boolean;
    configName: string;
    skipPaths: string[];
  };

  cors: {
    enabled: boolean;
    policy: HealthcareCORSPolicy;
    emergencyBypass: boolean;
    auditLogger?: any;
  };

  errorHandling: {
    enabled: boolean;
    auditLogger?: any;
    monitoringSystem?: any;
    emergencyNotificationSystem?: any;
  };

  // Healthcare-specific settings
  healthcare: {
    lgpdCompliance: boolean;
    anvisaCompliance: boolean;
    emergencyAccessEnabled: boolean;
    auditAllRequests: boolean;
  };
}

/**
 * Predefined security configurations for different scenarios
 */
const HEALTHCARE_SECURITY_CONFIGURATIONS: Record<string, HealthcareSecurityConfig> = {
  // Maximum security for medical records and sensitive data
  medical_records_production: {
    environment: SecurityEnvironment.PRODUCTION,
    endpointLevel: EndpointSecurityLevel.MEDICAL_RECORDS,
    authentication: {
      enabled: true,
      jwtSecret: process.env.JWT_SECRET || "your-secret-key",
      emergencyBypass: true,
      requireHealthcareLicense: true,
      allowedRoles: [
        HealthcareRole.PHYSICIAN,
        HealthcareRole.NURSE,
        HealthcareRole.EMERGENCY_PHYSICIAN,
        HealthcareRole.ADMIN,
      ],
    },
    rateLimiting: {
      enabled: true,
      storage: "redis",
      emergencyBypass: true,
      monitoring: true,
      alerting: true,
    },
    inputValidation: {
      enabled: true,
      emergencyBypass: true,
      contexts: [
        ValidationContext.MEDICAL_RECORD_CREATE,
        ValidationContext.PATIENT_UPDATE,
      ],
    },
    securityHeaders: {
      enabled: true,
      configName: "medical_records_production",
      skipPaths: [],
    },
    cors: {
      enabled: true,
      policy: HealthcareCORSPolicy.STRICT,
      emergencyBypass: true,
    },
    errorHandling: {
      enabled: true,
    },
    healthcare: {
      lgpdCompliance: true,
      anvisaCompliance: true,
      emergencyAccessEnabled: true,
      auditAllRequests: true,
    },
  },

  // Balanced security for patient portal
  patient_portal_production: {
    environment: SecurityEnvironment.PRODUCTION,
    endpointLevel: EndpointSecurityLevel.PATIENT_PORTAL,
    authentication: {
      enabled: true,
      jwtSecret: process.env.JWT_SECRET || "your-secret-key",
      emergencyBypass: false,
      requireHealthcareLicense: false,
      allowedRoles: [HealthcareRole.PATIENT, HealthcareRole.ADMIN],
    },
    rateLimiting: {
      enabled: true,
      storage: "redis",
      emergencyBypass: false,
      monitoring: true,
      alerting: false,
    },
    inputValidation: {
      enabled: true,
      emergencyBypass: false,
      contexts: [
        ValidationContext.PATIENT_REGISTRATION,
        ValidationContext.PATIENT_UPDATE,
        ValidationContext.APPOINTMENT_BOOKING,
      ],
    },
    securityHeaders: {
      enabled: true,
      configName: "patient_portal_production",
      skipPaths: [],
    },
    cors: {
      enabled: true,
      policy: HealthcareCORSPolicy.PATIENT_PORTAL,
      emergencyBypass: false,
    },
    errorHandling: {
      enabled: true,
    },
    healthcare: {
      lgpdCompliance: true,
      anvisaCompliance: false,
      emergencyAccessEnabled: false,
      auditAllRequests: false,
    },
  },

  // Emergency access configuration
  emergency_access_production: {
    environment: SecurityEnvironment.PRODUCTION,
    endpointLevel: EndpointSecurityLevel.EMERGENCY_ACCESS,
    authentication: {
      enabled: true,
      jwtSecret: process.env.JWT_SECRET || "your-secret-key",
      emergencyBypass: true,
      requireHealthcareLicense: true,
      allowedRoles: [
        HealthcareRole.EMERGENCY_PHYSICIAN,
        HealthcareRole.PHYSICIAN,
        HealthcareRole.NURSE,
        HealthcareRole.ADMIN,
      ],
    },
    rateLimiting: {
      enabled: true,
      storage: "redis",
      emergencyBypass: true,
      monitoring: true,
      alerting: true,
    },
    inputValidation: {
      enabled: true,
      emergencyBypass: true,
      contexts: [ValidationContext.EMERGENCY_ACCESS],
    },
    securityHeaders: {
      enabled: true,
      configName: "emergency_access_production",
      skipPaths: [],
    },
    cors: {
      enabled: true,
      policy: HealthcareCORSPolicy.EMERGENCY,
      emergencyBypass: true,
    },
    errorHandling: {
      enabled: true,
    },
    healthcare: {
      lgpdCompliance: true,
      anvisaCompliance: true,
      emergencyAccessEnabled: true,
      auditAllRequests: true,
    },
  },

  // Development configuration (relaxed security)
  development: {
    environment: SecurityEnvironment.DEVELOPMENT,
    endpointLevel: EndpointSecurityLevel.PUBLIC,
    authentication: {
      enabled: false, // Disabled for development
      jwtSecret: "dev-secret",
      emergencyBypass: false,
      requireHealthcareLicense: false,
      allowedRoles: Object.values(HealthcareRole),
    },
    rateLimiting: {
      enabled: false, // Disabled for development
      storage: "memory",
      emergencyBypass: false,
      monitoring: false,
      alerting: false,
    },
    inputValidation: {
      enabled: true, // Keep enabled to catch issues early
      emergencyBypass: false,
      contexts: [
        ValidationContext.PATIENT_REGISTRATION,
        ValidationContext.PROVIDER_REGISTRATION,
      ],
    },
    securityHeaders: {
      enabled: true,
      configName: "development",
      skipPaths: [],
    },
    cors: {
      enabled: true,
      policy: HealthcareCORSPolicy.DEVELOPMENT,
      emergencyBypass: false,
    },
    errorHandling: {
      enabled: true,
    },
    healthcare: {
      lgpdCompliance: false,
      anvisaCompliance: false,
      emergencyAccessEnabled: false,
      auditAllRequests: false,
    },
  },
};

/**
 * Healthcare Security Orchestrator Class
 */
export class HealthcareSecurityOrchestrator {
  private config: HealthcareSecurityConfig;

  constructor(configName = "development", overrides?: Partial<HealthcareSecurityConfig>) {
    this.config = {
      ...HEALTHCARE_SECURITY_CONFIGURATIONS[configName],
      ...overrides,
    };
  }

  /**
   * Create complete security middleware stack
   */
  createSecurityMiddleware(): MiddlewareHandler[] {
    const middlewares: MiddlewareHandler[] = [];

    // 1. Error handling (must be first to catch all errors)
    if (this.config.errorHandling.enabled) {
      middlewares.push(this.createErrorHandlingMiddleware());
    }

    // 2. Security headers (early in the chain)
    if (this.config.securityHeaders.enabled) {
      middlewares.push(this.createSecurityHeadersMiddleware());
    }

    // 3. CORS (before authentication)
    if (this.config.cors.enabled) {
      middlewares.push(this.createCORSMiddleware());
    }

    // 4. Rate limiting (before authentication to prevent brute force)
    if (this.config.rateLimiting.enabled) {
      middlewares.push(this.createRateLimitingMiddleware());
    }

    // 5. Authentication (JWT validation)
    if (this.config.authentication.enabled) {
      middlewares.push(this.createAuthenticationMiddleware());
    }

    return middlewares;
  }

  /**
   * Create validation middleware for specific contexts
   */
  createValidationMiddleware(context: ValidationContext): MiddlewareHandler {
    if (!this.config.inputValidation.enabled) {
      // Return no-op middleware if disabled
      return async (c, next) => await next();
    }

    return createHealthcareValidationMiddleware(context, {
      auditLogger: this.config.inputValidation.auditLogger,
      allowEmergencyBypass: this.config.inputValidation.emergencyBypass,
    });
  }

  /**
   * Get predefined validation middlewares
   */
  getValidationMiddlewares() {
    const auditLogger = this.config.inputValidation.auditLogger;

    return {
      patientRegistration: validationMiddlewares.patientRegistration(auditLogger),
      patientUpdate: validationMiddlewares.patientUpdate(auditLogger),
      providerRegistration: validationMiddlewares.providerRegistration(auditLogger),
      appointmentBooking: validationMiddlewares.appointmentBooking(auditLogger),
      emergencyAccess: validationMiddlewares.emergencyAccess(auditLogger),
    };
  }

  // Private methods for creating individual middleware components

  private createErrorHandlingMiddleware(): MiddlewareHandler {
    return createHealthcareErrorHandler({
      auditLogger: this.config.errorHandling.auditLogger,
      monitoringSystem: this.config.errorHandling.monitoringSystem,
      emergencyNotificationSystem: this.config.errorHandling.emergencyNotificationSystem,
    });
  }

  private createSecurityHeadersMiddleware(): MiddlewareHandler {
    return createSecurityHeadersMiddleware(this.config.securityHeaders.configName, {
      skipPaths: this.config.securityHeaders.skipPaths,
    });
  }

  private createCORSMiddleware(): MiddlewareHandler {
    return createHealthcareCORSMiddleware(this.config.cors.policy, {
      auditLogger: this.config.cors.auditLogger,
      emergencyBypass: this.config.cors.emergencyBypass,
    });
  }

  private createRateLimitingMiddleware(): MiddlewareHandler {
    if (this.config.rateLimiting.storage === "redis" && this.config.rateLimiting.redisClient) {
      return createRedisHealthcareRateLimiter(this.config.rateLimiting.redisClient, {
        monitoring: this.config.rateLimiting.monitoring,
        alerting: this.config.rateLimiting.alerting,
      });
    } else {
      return createHealthcareRateLimiter(undefined, {
        monitoring: this.config.rateLimiting.monitoring,
        alerting: this.config.rateLimiting.alerting,
      });
    }
  }

  private createAuthenticationMiddleware(): MiddlewareHandler {
    return createJWTAuthMiddleware({
      jwtSecret: this.config.authentication.jwtSecret,
      emergencyBypass: this.config.authentication.emergencyBypass,
      requireHealthcareLicense: this.config.authentication.requireHealthcareLicense,
      allowedRoles: this.config.authentication.allowedRoles,
    });
  }
}

/**
 * Factory functions for common healthcare security scenarios
 */
export const healthcareSecurityMiddlewares = {
  /**
   * Maximum security for medical records and sensitive healthcare data
   */
  medicalRecords: (overrides?: Partial<HealthcareSecurityConfig>) => {
    const orchestrator = new HealthcareSecurityOrchestrator(
      "medical_records_production",
      overrides,
    );
    return orchestrator.createSecurityMiddleware();
  },

  /**
   * Balanced security for patient portal applications
   */
  patientPortal: (overrides?: Partial<HealthcareSecurityConfig>) => {
    const orchestrator = new HealthcareSecurityOrchestrator("patient_portal_production", overrides);
    return orchestrator.createSecurityMiddleware();
  },

  /**
   * Emergency access with enhanced logging and monitoring
   */
  emergencyAccess: (overrides?: Partial<HealthcareSecurityConfig>) => {
    const orchestrator = new HealthcareSecurityOrchestrator(
      "emergency_access_production",
      overrides,
    );
    return orchestrator.createSecurityMiddleware();
  },

  /**
   * Development environment with relaxed security for testing
   */
  development: (overrides?: Partial<HealthcareSecurityConfig>) => {
    const orchestrator = new HealthcareSecurityOrchestrator("development", overrides);
    return orchestrator.createSecurityMiddleware();
  },

  /**
   * Custom configuration
   */
  custom: (configName: string, overrides?: Partial<HealthcareSecurityConfig>) => {
    const orchestrator = new HealthcareSecurityOrchestrator(configName, overrides);
    return orchestrator.createSecurityMiddleware();
  },
};

/**
 * Individual middleware components export for fine-grained control
 */
export const securityComponents = {
  // Authentication
  jwtAuth: createJWTAuthMiddleware,

  // Rate limiting
  rateLimiting: createHealthcareRateLimiter,
  redisRateLimiting: createRedisHealthcareRateLimiter,

  // Input validation
  validation: createHealthcareValidationMiddleware,
  validationPresets: validationMiddlewares,

  // Security headers
  securityHeaders: createSecurityHeadersMiddleware,
  securityHeaderPresets: securityHeadersMiddlewares,

  // CORS
  cors: createHealthcareCORSMiddleware,
  corsPresets: healthcareCORSMiddlewares,

  // Error handling
  errorHandler: createHealthcareErrorHandler,
};

/**
 * Healthcare security configuration presets
 */
export const securityPresets = {
  MEDICAL_RECORDS_PRODUCTION: "medical_records_production",
  PATIENT_PORTAL_PRODUCTION: "patient_portal_production",
  EMERGENCY_ACCESS_PRODUCTION: "emergency_access_production",
  DEVELOPMENT: "development",
};

/**
 * Utility function to create a complete healthcare API security stack
 */
export function createHealthcareAPISecurityStack(
  environment: SecurityEnvironment = SecurityEnvironment.DEVELOPMENT,
  endpointLevel: EndpointSecurityLevel = EndpointSecurityLevel.PUBLIC,
  options?: {
    jwtSecret?: string;
    redisClient?: any;
    auditLogger?: any;
    monitoringSystem?: any;
    emergencyNotificationSystem?: any;
  },
): {
  middlewares: MiddlewareHandler[];
  orchestrator: HealthcareSecurityOrchestrator;
  validationMiddlewares: Record<string, MiddlewareHandler>;
} {
  // Determine configuration based on environment and endpoint level
  let configName = "development";

  if (environment === SecurityEnvironment.PRODUCTION) {
    switch (endpointLevel) {
      case EndpointSecurityLevel.MEDICAL_RECORDS:
        configName = "medical_records_production";
        break;
      case EndpointSecurityLevel.PATIENT_PORTAL:
        configName = "patient_portal_production";
        break;
      case EndpointSecurityLevel.EMERGENCY_ACCESS:
        configName = "emergency_access_production";
        break;
      default:
        configName = "patient_portal_production"; // Default production config
    }
  }

  // Create orchestrator with options
  const orchestrator = new HealthcareSecurityOrchestrator(configName, {
    authentication: {
      jwtSecret: options?.jwtSecret,
    },
    rateLimiting: {
      redisClient: options?.redisClient,
    },
    inputValidation: {
      auditLogger: options?.auditLogger,
    },
    errorHandling: {
      auditLogger: options?.auditLogger,
      monitoringSystem: options?.monitoringSystem,
      emergencyNotificationSystem: options?.emergencyNotificationSystem,
    },
    cors: {
      auditLogger: options?.auditLogger,
    },
  } as Partial<HealthcareSecurityConfig>);

  return {
    middlewares: orchestrator.createSecurityMiddleware(),
    orchestrator,
    validationMiddlewares: orchestrator.getValidationMiddlewares(),
  };
}

/**
 * Export all types and enums for external use
 */
export {
  HealthcareCORSPolicy,
  HealthcareRole,
  ValidationContext,
};

/**
 * Export individual middleware creation functions
 */
export * from "./auth/jwt-validation";
export * from "./error-handling/healthcare-error-handler";
export * from "./headers/healthcare-cors-middleware";
export * from "./headers/security-headers-middleware";
export * from "./rate-limiting/healthcare-rate-limiter";
export * from "./validation/brazilian-healthcare-validator";
export * from "./validation/healthcare-validation-middleware";
