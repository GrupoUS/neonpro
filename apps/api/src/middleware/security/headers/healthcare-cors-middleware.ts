/**
 * 🌐 Healthcare CORS (Cross-Origin Resource Sharing) Middleware - NeonPro API
 * ==========================================================================
 *
 * Production-ready CORS configuration for Brazilian healthcare applications:
 * - Medical system integration support
 * - ANVISA/CFM regulatory compliance
 * - LGPD-compliant cross-origin data sharing
 * - Emergency access CORS policies
 * - Telemedicine platform integration
 * - Healthcare provider API access control
 * - Patient portal security policies
 */

import type { Context, MiddlewareHandler } from "hono";
import { cors } from "hono/cors";

// Healthcare CORS policy types
export enum HealthcareCORSPolicy {
  STRICT = "strict", // Medical records, high-security endpoints
  MEDICAL = "medical", // General medical system integration
  PATIENT_PORTAL = "patient_portal", // Patient-facing applications
  TELEMEDICINE = "telemedicine", // Video calls, real-time communication
  EMERGENCY = "emergency", // Emergency access scenarios
  DEVELOPMENT = "development", // Development environment
  INTEROPERABILITY = "interoperability", // HL7 FHIR, healthcare standards
}

// Brazilian healthcare system types
export enum BrazilianHealthcareSystem {
  SUS = "sus", // Sistema Único de Saúde
  PRIVATE_HOSPITAL = "private_hospital",
  CLINIC = "clinic",
  LABORATORY = "laboratory",
  PHARMACY = "pharmacy",
  TELEMEDICINE_PLATFORM = "telemedicine_platform",
  HEALTH_INSURANCE = "health_insurance",
  REGULATORY_BODY = "regulatory_body", // ANVISA, CFM, CRM, etc.
  EMERGENCY_SERVICES = "emergency_services",
}

// CORS configuration interface
interface HealthcareCORSConfig {
  policy: HealthcareCORSPolicy;

  // Origin configuration
  origins: {
    allowed: string[];
    blocked: string[];
    dynamicValidation: boolean;
  };

  // Methods and headers
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];

  // Credentials and timing
  credentials: boolean;
  maxAge: number; // Preflight cache duration in seconds

  // Brazilian healthcare compliance
  lgpdCompliance: {
    enabled: boolean;
    dataProcessingConsent: boolean;
    auditCrossOriginRequests: boolean;
  };

  // Emergency access configuration
  emergencyAccess: {
    enabled: boolean;
    emergencyOrigins: string[];
    bypassRestrictions: boolean;
  };

  // Healthcare system integration
  systemIntegration: {
    healthcareSystemTypes: BrazilianHealthcareSystem[];
    requiresAuthentication: boolean;
    apiKeyRequired: boolean;
  };
}

/**
 * Predefined CORS configurations for different healthcare scenarios
 */
const HEALTHCARE_CORS_CONFIGURATIONS: Record<HealthcareCORSPolicy, HealthcareCORSConfig> = {
  [HealthcareCORSPolicy.STRICT]: {
    policy: HealthcareCORSPolicy.STRICT,
    origins: {
      allowed: [
        "https://medical-records.neonpro.health",
        "https://admin.neonpro.health",
        "https://compliance.neonpro.health",
      ],
      blocked: [],
      dynamicValidation: true,
    },
    methods: ["GET", "POST", "PUT", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Medical-License",
      "X-Emergency-Access",
      "X-LGPD-Consent",
      "X-Audit-Context",
      "X-Healthcare-Provider-ID",
    ],
    exposedHeaders: [
      "X-RateLimit-Limit",
      "X-RateLimit-Remaining",
      "X-Emergency-Bypass",
      "X-LGPD-Processing-Status",
      "X-Audit-ID",
    ],
    credentials: true,
    maxAge: 300, // 5 minutes - short for high security
    lgpdCompliance: {
      enabled: true,
      dataProcessingConsent: true,
      auditCrossOriginRequests: true,
    },
    emergencyAccess: {
      enabled: true,
      emergencyOrigins: [
        "https://emergency.neonpro.health",
        "https://mobile-emergency.neonpro.health",
      ],
      bypassRestrictions: false, // Still maintain some restrictions even in emergency
    },
    systemIntegration: {
      healthcareSystemTypes: [
        BrazilianHealthcareSystem.PRIVATE_HOSPITAL,
        BrazilianHealthcareSystem.REGULATORY_BODY,
      ],
      requiresAuthentication: true,
      apiKeyRequired: true,
    },
  },

  [HealthcareCORSPolicy.MEDICAL]: {
    policy: HealthcareCORSPolicy.MEDICAL,
    origins: {
      allowed: [
        "https://portal.neonpro.health",
        "https://provider-dashboard.neonpro.health",
        "https://integration.neonpro.health",
        "https://*.hospital.gov.br", // Brazilian hospital domains
        "https://*.sus.gov.br", // SUS system domains
      ],
      blocked: [
        "http://*", // Block all HTTP origins in production
      ],
      dynamicValidation: true,
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Medical-License",
      "X-Provider-Credentials",
      "X-Patient-Consent",
      "X-LGPD-Consent",
      "X-Healthcare-System-ID",
      "X-Integration-Token",
      "X-FHIR-Version", // For HL7 FHIR interoperability
    ],
    exposedHeaders: [
      "X-RateLimit-Limit",
      "X-RateLimit-Remaining",
      "X-Medical-Record-Version",
      "X-LGPD-Processing-Status",
      "X-Healthcare-Compliance",
      "X-Integration-Status",
    ],
    credentials: true,
    maxAge: 600, // 10 minutes
    lgpdCompliance: {
      enabled: true,
      dataProcessingConsent: true,
      auditCrossOriginRequests: true,
    },
    emergencyAccess: {
      enabled: true,
      emergencyOrigins: [
        "https://emergency.neonpro.health",
        "https://*.emergency.gov.br",
      ],
      bypassRestrictions: true,
    },
    systemIntegration: {
      healthcareSystemTypes: [
        BrazilianHealthcareSystem.SUS,
        BrazilianHealthcareSystem.PRIVATE_HOSPITAL,
        BrazilianHealthcareSystem.CLINIC,
        BrazilianHealthcareSystem.LABORATORY,
      ],
      requiresAuthentication: true,
      apiKeyRequired: false,
    },
  },

  [HealthcareCORSPolicy.PATIENT_PORTAL]: {
    policy: HealthcareCORSPolicy.PATIENT_PORTAL,
    origins: {
      allowed: [
        "https://app.neonpro.health",
        "https://patient-portal.neonpro.health",
        "https://mobile.neonpro.health",
        "https://www.neonpro.health",
      ],
      blocked: [],
      dynamicValidation: false,
    },
    methods: ["GET", "POST", "PUT", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Patient-ID",
      "X-Session-Token",
      "X-LGPD-Consent",
      "X-Device-Info",
      "X-Location-Consent", // For location-based services
    ],
    exposedHeaders: [
      "X-RateLimit-Limit",
      "X-RateLimit-Remaining",
      "X-Session-Expires",
      "X-LGPD-Rights-Info",
      "X-Privacy-Settings",
    ],
    credentials: true,
    maxAge: 3600, // 1 hour
    lgpdCompliance: {
      enabled: true,
      dataProcessingConsent: true,
      auditCrossOriginRequests: false, // Less strict for patient portal
    },
    emergencyAccess: {
      enabled: false, // Patients don't need emergency bypass
      emergencyOrigins: [],
      bypassRestrictions: false,
    },
    systemIntegration: {
      healthcareSystemTypes: [BrazilianHealthcareSystem.PATIENT_PORTAL],
      requiresAuthentication: true,
      apiKeyRequired: false,
    },
  },

  [HealthcareCORSPolicy.TELEMEDICINE]: {
    policy: HealthcareCORSPolicy.TELEMEDICINE,
    origins: {
      allowed: [
        "https://telemedicine.neonpro.health",
        "https://video-call.neonpro.health",
        "https://webrtc.neonpro.health",
        "https://*.telehealth.gov.br", // Brazilian telehealth domains
      ],
      blocked: [],
      dynamicValidation: true,
    },
    methods: ["GET", "POST", "PUT", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Medical-License",
      "X-Video-Session-ID",
      "X-Patient-Consent",
      "X-Recording-Consent",
      "X-LGPD-Consent",
      "X-Telemedicine-Platform",
      "X-WebRTC-Config",
    ],
    exposedHeaders: [
      "X-Session-ID",
      "X-Recording-Status",
      "X-Consultation-ID",
      "X-LGPD-Recording-Policy",
      "X-Telemedicine-Compliance",
    ],
    credentials: true,
    maxAge: 1800, // 30 minutes
    lgpdCompliance: {
      enabled: true,
      dataProcessingConsent: true,
      auditCrossOriginRequests: true, // Important for recording compliance
    },
    emergencyAccess: {
      enabled: true,
      emergencyOrigins: [
        "https://emergency-telemedicine.neonpro.health",
      ],
      bypassRestrictions: true,
    },
    systemIntegration: {
      healthcareSystemTypes: [BrazilianHealthcareSystem.TELEMEDICINE_PLATFORM],
      requiresAuthentication: true,
      apiKeyRequired: false,
    },
  },

  [HealthcareCORSPolicy.EMERGENCY]: {
    policy: HealthcareCORSPolicy.EMERGENCY,
    origins: {
      allowed: [
        "*", // Allow all origins in emergency situations
      ],
      blocked: [],
      dynamicValidation: false, // Skip validation for speed
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "*", // Allow all headers in emergency
    ],
    exposedHeaders: [
      "X-Emergency-Access-Granted",
      "X-Emergency-Session-ID",
      "X-Audit-Required",
      "X-Emergency-Justification-Required",
    ],
    credentials: true,
    maxAge: 0, // No caching for emergency requests
    lgpdCompliance: {
      enabled: true, // Still maintain LGPD compliance
      dataProcessingConsent: false, // Waived for emergency
      auditCrossOriginRequests: true, // Critical for emergency audit trail
    },
    emergencyAccess: {
      enabled: true,
      emergencyOrigins: ["*"], // All origins allowed
      bypassRestrictions: true,
    },
    systemIntegration: {
      healthcareSystemTypes: Object.values(BrazilianHealthcareSystem),
      requiresAuthentication: false, // Relaxed for emergency
      apiKeyRequired: false,
    },
  },

  [HealthcareCORSPolicy.INTEROPERABILITY]: {
    policy: HealthcareCORSPolicy.INTEROPERABILITY,
    origins: {
      allowed: [
        "https://fhir.neonpro.health",
        "https://hl7.neonpro.health",
        "https://interop.neonpro.health",
        "https://*.datasus.gov.br", // DATASUS integration
        "https://*.anvisa.gov.br", // ANVISA integration
      ],
      blocked: [],
      dynamicValidation: true,
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-FHIR-Version",
      "X-HL7-Message-Type",
      "X-Healthcare-Standard",
      "X-Interoperability-Token",
      "X-System-Identifier",
      "Accept",
      "Content-Encoding",
    ],
    exposedHeaders: [
      "X-FHIR-Version",
      "X-Resource-Count",
      "X-Bundle-Total",
      "X-Interoperability-Status",
      "Location", // For resource creation
    ],
    credentials: true,
    maxAge: 7200, // 2 hours
    lgpdCompliance: {
      enabled: true,
      dataProcessingConsent: false, // Handled at system level for interoperability
      auditCrossOriginRequests: true,
    },
    emergencyAccess: {
      enabled: false,
      emergencyOrigins: [],
      bypassRestrictions: false,
    },
    systemIntegration: {
      healthcareSystemTypes: [
        BrazilianHealthcareSystem.SUS,
        BrazilianHealthcareSystem.REGULATORY_BODY,
        BrazilianHealthcareSystem.PRIVATE_HOSPITAL,
      ],
      requiresAuthentication: true,
      apiKeyRequired: true,
    },
  },

  [HealthcareCORSPolicy.DEVELOPMENT]: {
    policy: HealthcareCORSPolicy.DEVELOPMENT,
    origins: {
      allowed: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173", // Vite dev server
        "http://127.0.0.1:*",
        "https://*.ngrok.io", // Ngrok tunnels for mobile testing
        "https://*.vercel.app", // Vercel preview deployments
      ],
      blocked: [],
      dynamicValidation: false,
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["*"],
    exposedHeaders: ["*"],
    credentials: true,
    maxAge: 86_400, // 24 hours
    lgpdCompliance: {
      enabled: false, // Disabled in development
      dataProcessingConsent: false,
      auditCrossOriginRequests: false,
    },
    emergencyAccess: {
      enabled: false,
      emergencyOrigins: [],
      bypassRestrictions: false,
    },
    systemIntegration: {
      healthcareSystemTypes: [],
      requiresAuthentication: false,
      apiKeyRequired: false,
    },
  },
};

/**
 * Healthcare CORS Manager Class
 */
export class HealthcareCORSManager {
  private config: HealthcareCORSConfig;

  constructor(policy: HealthcareCORSPolicy = HealthcareCORSPolicy.DEVELOPMENT) {
    this.config = HEALTHCARE_CORS_CONFIGURATIONS[policy];
  }

  /**
   * Dynamic origin validation for healthcare systems
   */
  async validateOrigin(origin: string): Promise<boolean> {
    if (!this.config.origins.dynamicValidation) {
      return this.config.origins.allowed.some(allowed => this.matchOrigin(origin, allowed));
    }

    // Check blocked origins first
    if (this.config.origins.blocked.some(blocked => this.matchOrigin(origin, blocked))) {
      return false;
    }

    // Static allowed origins
    if (this.config.origins.allowed.some(allowed => this.matchOrigin(origin, allowed))) {
      return true;
    }

    // Dynamic validation for healthcare systems
    return await this.validateHealthcareOrigin(origin);
  }

  /**
   * Validate healthcare system origins dynamically
   */
  private async validateHealthcareOrigin(origin: string): Promise<boolean> {
    try {
      // Check if origin matches known healthcare domain patterns
      const healthcareDomainPatterns = [
        /\.hospital\.gov\.br$/, // Brazilian hospital domains
        /\.sus\.gov\.br$/, // SUS system domains
        /\.anvisa\.gov\.br$/, // ANVISA domains
        /\.cfm\.org\.br$/, // CFM domains
        /\.telehealth\.gov\.br$/, // Telehealth domains
        /\.neonpro\.health$/, // NeonPro subdomains
      ];

      const urlObj = new URL(origin);
      const hostname = urlObj.hostname;

      // Check against healthcare domain patterns
      for (const pattern of healthcareDomainPatterns) {
        if (pattern.test(hostname)) {
          // Additional validation could be added here (DNS verification, certificate validation, etc.)
          return true;
        }
      }

      return false;
    } catch (error) {
      console.warn("Healthcare CORS origin validation error:", error);
      return false;
    }
  }

  /**
   * Match origin against pattern (supports wildcards)
   */
  private matchOrigin(origin: string, pattern: string): boolean {
    if (pattern === "*") return true;
    if (pattern === origin) return true;

    // Handle wildcard patterns like "https://*.example.com"
    if (pattern.includes("*")) {
      const regexPattern = pattern
        .replace(/\*/g, "[^.]*")
        .replace(/\./g, "\\.");
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(origin);
    }

    return false;
  }

  /**
   * Get CORS configuration for Hono
   */
  getHonoCORSConfig() {
    return {
      origin: async (origin: string) => {
        if (!origin) return false; // Reject requests without origin
        return await this.validateOrigin(origin);
      },
      allowMethods: this.config.methods,
      allowHeaders: this.config.allowedHeaders,
      exposeHeaders: this.config.exposedHeaders,
      credentials: this.config.credentials,
      maxAge: this.config.maxAge,
    };
  }
}

/**
 * Create Healthcare CORS Middleware
 */
export function createHealthcareCORSMiddleware(
  policy: HealthcareCORSPolicy = HealthcareCORSPolicy.DEVELOPMENT,
  options: {
    auditLogger?: any;
    emergencyBypass?: boolean;
  } = {},
): MiddlewareHandler {
  const corsManager = new HealthcareCORSManager(policy);
  const config = HEALTHCARE_CORS_CONFIGURATIONS[policy];

  return async (c: Context, next) => {
    try {
      // Check for emergency bypass
      const emergencyAccess = c.req.header("X-Emergency-Access");
      if (emergencyAccess && config.emergencyAccess.enabled && options.emergencyBypass) {
        // Switch to emergency CORS policy
        const emergencyCorsManager = new HealthcareCORSManager(HealthcareCORSPolicy.EMERGENCY);
        const emergencyConfig = emergencyCorsManager.getHonoCORSConfig();

        // Log emergency CORS usage
        const emergencyLogEntry = {
          timestamp: new Date().toISOString(),
          event: "EMERGENCY_CORS_BYPASS",
          origin: c.req.header("Origin"),
          emergencyContext: emergencyAccess,
          userAgent: c.req.header("User-Agent"),
        };

        console.warn("🚨 Emergency CORS Bypass:", JSON.stringify(emergencyLogEntry, null, 2));

        if (options.auditLogger) {
          await options.auditLogger.log(emergencyLogEntry);
        }

        return cors(emergencyConfig)(c, next);
      }

      // Standard CORS handling
      const corsConfig = corsManager.getHonoCORSConfig();

      // Log LGPD-sensitive cross-origin requests
      if (config.lgpdCompliance.enabled && config.lgpdCompliance.auditCrossOriginRequests) {
        const origin = c.req.header("Origin");
        if (origin) {
          const lgpdLogEntry = {
            timestamp: new Date().toISOString(),
            event: "LGPD_CROSS_ORIGIN_REQUEST",
            origin,
            method: c.req.method,
            path: c.req.path,
            hasConsent: !!c.req.header("X-LGPD-Consent"),
          };

          if (options.auditLogger) {
            await options.auditLogger.log(lgpdLogEntry);
          }
        }
      }

      return cors(corsConfig)(c, next);
    } catch (error) {
      console.error("Healthcare CORS middleware error:", error);
      // Fall back to restrictive CORS in case of error
      return cors({
        origin: false,
        credentials: false,
      })(c, next);
    }
  };
}

/**
 * Pre-configured CORS middlewares for different healthcare scenarios
 */
export const healthcareCORSMiddlewares = {
  strict: (auditLogger?: any) =>
    createHealthcareCORSMiddleware(HealthcareCORSPolicy.STRICT, { auditLogger }),

  medical: (auditLogger?: any) =>
    createHealthcareCORSMiddleware(HealthcareCORSPolicy.MEDICAL, { auditLogger }),

  patientPortal: (auditLogger?: any) =>
    createHealthcareCORSMiddleware(HealthcareCORSPolicy.PATIENT_PORTAL, { auditLogger }),

  telemedicine: (auditLogger?: any) =>
    createHealthcareCORSMiddleware(HealthcareCORSPolicy.TELEMEDICINE, {
      auditLogger,
      emergencyBypass: true,
    }),

  emergency: (auditLogger?: any) =>
    createHealthcareCORSMiddleware(HealthcareCORSPolicy.EMERGENCY, { auditLogger }),

  interoperability: (auditLogger?: any) =>
    createHealthcareCORSMiddleware(HealthcareCORSPolicy.INTEROPERABILITY, { auditLogger }),

  development: () => createHealthcareCORSMiddleware(HealthcareCORSPolicy.DEVELOPMENT),
};

/**
 * CORS preflight optimization for healthcare APIs
 */
export function createCORSPreflightHandler(
  policy: HealthcareCORSPolicy = HealthcareCORSPolicy.MEDICAL,
): MiddlewareHandler {
  const config = HEALTHCARE_CORS_CONFIGURATIONS[policy];

  return async (c: Context) => {
    if (c.req.method !== "OPTIONS") {
      return; // Not a preflight request
    }

    // Set preflight response headers
    c.header("Access-Control-Max-Age", config.maxAge.toString());
    c.header("Access-Control-Allow-Methods", config.methods.join(", "));
    c.header("Access-Control-Allow-Headers", config.allowedHeaders.join(", "));

    if (config.credentials) {
      c.header("Access-Control-Allow-Credentials", "true");
    }

    // Healthcare-specific preflight headers
    if (config.lgpdCompliance.enabled) {
      c.header("X-LGPD-Compliance", "required");
    }

    if (config.systemIntegration.requiresAuthentication) {
      c.header("X-Authentication-Required", "true");
    }

    return c.text("", 204);
  };
}
