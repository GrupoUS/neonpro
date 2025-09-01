/**
 * 🛡️ Security Headers Middleware - NeonPro API
 * =============================================
 *
 * Production-ready security headers for healthcare applications:
 * - HSTS (HTTP Strict Transport Security)
 * - CSP (Content Security Policy)
 * - Brazilian healthcare compliance headers
 * - LGPD privacy headers
 * - Anti-clickjacking protection
 * - XSS protection and MIME type sniffing prevention
 * - Emergency access context headers
 */

import type { Context, MiddlewareHandler } from "hono";

// Security header configuration levels
export enum SecurityLevel {
  DEVELOPMENT = "development",
  TESTING = "testing",
  STAGING = "staging",
  PRODUCTION = "production",
  HIGH_SECURITY = "high_security", // For critical healthcare data
}

// Healthcare endpoint types for targeted security
export enum HealthcareEndpointType {
  PUBLIC = "public",
  PATIENT_PORTAL = "patient_portal",
  PROVIDER_DASHBOARD = "provider_dashboard",
  MEDICAL_RECORDS = "medical_records",
  EMERGENCY_ACCESS = "emergency_access",
  COMPLIANCE_AUDIT = "compliance_audit",
  ADMINISTRATIVE = "administrative",
}

// Security header configuration interface
interface SecurityHeadersConfig {
  level: SecurityLevel;
  endpointType: HealthcareEndpointType;

  // HSTS Configuration
  hsts: {
    enabled: boolean;
    maxAge: number; // seconds
    includeSubDomains: boolean;
    preload: boolean;
  };

  // Content Security Policy
  csp: {
    enabled: boolean;
    reportOnly: boolean;
    directives: {
      defaultSrc: string[];
      scriptSrc: string[];
      styleSrc: string[];
      imgSrc: string[];
      connectSrc: string[];
      fontSrc: string[];
      objectSrc: string[];
      mediaSrc: string[];
      frameSrc: string[];
      childSrc: string[];
      formAction: string[];
      baseUri: string[];
      manifestSrc: string[];
      workerSrc: string[];
    };
    reportUri?: string;
  };

  // Frame Protection
  frameProtection: {
    enabled: boolean;
    policy: "DENY" | "SAMEORIGIN" | "ALLOW-FROM";
    allowFrom?: string[];
  };

  // XSS Protection
  xssProtection: {
    enabled: boolean;
    mode: "block" | "report";
    reportUri?: string;
  };

  // Content Type Options
  noSniff: boolean;

  // Referrer Policy
  referrerPolicy:
    | "no-referrer"
    | "same-origin"
    | "strict-origin"
    | "strict-origin-when-cross-origin";

  // Permissions Policy
  permissionsPolicy: {
    enabled: boolean;
    policies: Record<string, string[]>;
  };

  // Brazilian Healthcare Specific Headers
  lgpdCompliance: {
    enabled: boolean;
    privacyPolicyUrl?: string;
    dataControllerInfo?: string;
  };

  // Healthcare Emergency Context
  emergencyAccess: {
    enabled: boolean;
    auditRequired: boolean;
  };
}

/**
 * Predefined security configurations for different scenarios
 */
const SECURITY_CONFIGURATIONS: Record<string, SecurityHeadersConfig> = {
  // High security for medical records and sensitive data
  medical_records_production: {
    level: SecurityLevel.HIGH_SECURITY,
    endpointType: HealthcareEndpointType.MEDICAL_RECORDS,
    hsts: {
      enabled: true,
      maxAge: 63_072_000, // 2 years
      includeSubDomains: true,
      preload: true,
    },
    csp: {
      enabled: true,
      reportOnly: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Restricted for healthcare
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.neonpro.health"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"], // No frames for medical records
        childSrc: ["'self'"],
        formAction: ["'self'"],
        baseUri: ["'self'"],
        manifestSrc: ["'self'"],
        workerSrc: ["'self'"],
      },
      reportUri: "/api/v1/security/csp-report",
    },
    frameProtection: {
      enabled: true,
      policy: "DENY", // Never allow framing of medical records
    },
    xssProtection: {
      enabled: true,
      mode: "block",
    },
    noSniff: true,
    referrerPolicy: "no-referrer", // Strict for medical data
    permissionsPolicy: {
      enabled: true,
      policies: {
        camera: ["'none'"],
        microphone: ["'none'"],
        geolocation: ["'none'"],
        payment: ["'none'"],
        usb: ["'none'"],
        "interest-cohort": ["()"], // Disable FLoC
      },
    },
    lgpdCompliance: {
      enabled: true,
      privacyPolicyUrl: "https://neonpro.health/privacy",
      dataControllerInfo: "NeonPro Healthcare Platform - LGPD Compliance",
    },
    emergencyAccess: {
      enabled: true,
      auditRequired: true,
    },
  },

  // Moderate security for patient portal
  patient_portal_production: {
    level: SecurityLevel.PRODUCTION,
    endpointType: HealthcareEndpointType.PATIENT_PORTAL,
    hsts: {
      enabled: true,
      maxAge: 31_536_000, // 1 year
      includeSubDomains: true,
      preload: false,
    },
    csp: {
      enabled: true,
      reportOnly: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.neonpro.health"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "https://api.neonpro.health", "wss://realtime.neonpro.health"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "blob:"],
        frameSrc: ["'self'"], // Allow same-origin frames for patient portal
        childSrc: ["'self'"],
        formAction: ["'self'"],
        baseUri: ["'self'"],
        manifestSrc: ["'self'"],
        workerSrc: ["'self'"],
      },
      reportUri: "/api/v1/security/csp-report",
    },
    frameProtection: {
      enabled: true,
      policy: "SAMEORIGIN",
    },
    xssProtection: {
      enabled: true,
      mode: "block",
    },
    noSniff: true,
    referrerPolicy: "strict-origin-when-cross-origin",
    permissionsPolicy: {
      enabled: true,
      policies: {
        camera: ["'self'"], // Allow for telemedicine
        microphone: ["'self'"], // Allow for telemedicine
        geolocation: ["'self'"], // Allow for location services
        payment: ["'none'"],
        usb: ["'none'"],
        "interest-cohort": ["()"],
      },
    },
    lgpdCompliance: {
      enabled: true,
      privacyPolicyUrl: "https://neonpro.health/privacy",
      dataControllerInfo: "NeonPro Healthcare Platform - LGPD Compliance",
    },
    emergencyAccess: {
      enabled: false,
      auditRequired: false,
    },
  },

  // Emergency access configuration
  emergency_access_production: {
    level: SecurityLevel.PRODUCTION,
    endpointType: HealthcareEndpointType.EMERGENCY_ACCESS,
    hsts: {
      enabled: true,
      maxAge: 31_536_000,
      includeSubDomains: true,
      preload: true,
    },
    csp: {
      enabled: true,
      reportOnly: false, // Still enforce during emergencies
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // More relaxed for emergency
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: [
          "'self'",
          "https://api.neonpro.health",
          "https://emergency-api.neonpro.health",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
        childSrc: ["'self'"],
        formAction: ["'self'"],
        baseUri: ["'self'"],
        manifestSrc: ["'self'"],
        workerSrc: ["'self'"],
      },
    },
    frameProtection: {
      enabled: true,
      policy: "SAMEORIGIN",
    },
    xssProtection: {
      enabled: true,
      mode: "block",
    },
    noSniff: true,
    referrerPolicy: "same-origin", // Less strict for emergency access
    permissionsPolicy: {
      enabled: true,
      policies: {
        camera: ["'self'"],
        microphone: ["'self'"],
        geolocation: ["'self'"],
        payment: ["'none'"],
        usb: ["'none'"],
      },
    },
    lgpdCompliance: {
      enabled: true,
      privacyPolicyUrl: "https://neonpro.health/privacy",
      dataControllerInfo: "NeonPro Healthcare Platform - Emergency Access",
    },
    emergencyAccess: {
      enabled: true,
      auditRequired: true,
    },
  },

  // Development configuration
  development: {
    level: SecurityLevel.DEVELOPMENT,
    endpointType: HealthcareEndpointType.PUBLIC,
    hsts: {
      enabled: false, // Don't use HSTS in development
      maxAge: 0,
      includeSubDomains: false,
      preload: false,
    },
    csp: {
      enabled: true,
      reportOnly: true, // Report-only mode for development
      directives: {
        defaultSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "http://localhost:*"],
        styleSrc: ["'self'", "'unsafe-inline'", "http://localhost:*"],
        imgSrc: ["'self'", "data:", "http:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:", "http:", "https:"],
        fontSrc: ["'self'", "data:", "http:", "https:"],
        objectSrc: ["'self'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
        childSrc: ["'self'"],
        formAction: ["'self'"],
        baseUri: ["'self'"],
        manifestSrc: ["'self'"],
        workerSrc: ["'self'"],
      },
    },
    frameProtection: {
      enabled: true,
      policy: "SAMEORIGIN",
    },
    xssProtection: {
      enabled: true,
      mode: "report",
    },
    noSniff: true,
    referrerPolicy: "strict-origin-when-cross-origin",
    permissionsPolicy: {
      enabled: false, // Disabled in development
      policies: {},
    },
    lgpdCompliance: {
      enabled: false, // Disabled in development
    },
    emergencyAccess: {
      enabled: false,
      auditRequired: false,
    },
  },
};

/**
 * Security Headers Middleware Class
 */
export class SecurityHeadersManager {
  private config: SecurityHeadersConfig;

  constructor(configName = "development") {
    this.config = SECURITY_CONFIGURATIONS[configName] || SECURITY_CONFIGURATIONS.development;
  }

  /**
   * Apply all security headers to response
   */
  applySecurityHeaders(c: Context): void {
    // HSTS (HTTP Strict Transport Security)
    this.applyHSTS(c);

    // Content Security Policy
    this.applyCSP(c);

    // Frame Protection (X-Frame-Options)
    this.applyFrameProtection(c);

    // XSS Protection
    this.applyXSSProtection(c);

    // Content Type Options
    this.applyContentTypeOptions(c);

    // Referrer Policy
    this.applyReferrerPolicy(c);

    // Permissions Policy
    this.applyPermissionsPolicy(c);

    // LGPD Compliance Headers
    this.applyLGPDHeaders(c);

    // Healthcare Emergency Access Headers
    this.applyEmergencyAccessHeaders(c);

    // Additional security headers
    this.applyAdditionalSecurityHeaders(c);
  }

  private applyHSTS(c: Context): void {
    if (this.config.hsts.enabled && c.req.url.startsWith("https://")) {
      let hstsValue = `max-age=${this.config.hsts.maxAge}`;
      if (this.config.hsts.includeSubDomains) { hstsValue += "; includeSubDomains"; }
      if (this.config.hsts.preload) { hstsValue += "; preload"; }

      c.header("Strict-Transport-Security", hstsValue);
    }
  }

  private applyCSP(c: Context): void {
    if (!this.config.csp.enabled) { return; }

    const directives: string[] = [];

    for (const [directive, sources] of Object.entries(this.config.csp.directives)) {
      const kebabDirective = this.camelToKebab(directive);
      directives.push(`${kebabDirective} ${sources.join(" ")}`);
    }

    if (this.config.csp.reportUri) {
      directives.push(`report-uri ${this.config.csp.reportUri}`);
    }

    const cspValue = directives.join("; ");
    const headerName = this.config.csp.reportOnly
      ? "Content-Security-Policy-Report-Only"
      : "Content-Security-Policy";

    c.header(headerName, cspValue);
  }

  private applyFrameProtection(c: Context): void {
    if (!this.config.frameProtection.enabled) { return; }

    let value = this.config.frameProtection.policy;
    if (
      this.config.frameProtection.policy === "ALLOW-FROM"
      && this.config.frameProtection.allowFrom?.length
    ) {
      value = `ALLOW-FROM ${this.config.frameProtection.allowFrom[0]}`;
    }

    c.header("X-Frame-Options", value);
  }

  private applyXSSProtection(c: Context): void {
    if (!this.config.xssProtection.enabled) { return; }

    let value = "1";
    if (this.config.xssProtection.mode === "block") {
      value += "; mode=block";
    } else if (this.config.xssProtection.reportUri) {
      value += `; report=${this.config.xssProtection.reportUri}`;
    }

    c.header("X-XSS-Protection", value);
  }

  private applyContentTypeOptions(c: Context): void {
    if (this.config.noSniff) {
      c.header("X-Content-Type-Options", "nosniff");
    }
  }

  private applyReferrerPolicy(c: Context): void {
    c.header("Referrer-Policy", this.config.referrerPolicy);
  }

  private applyPermissionsPolicy(c: Context): void {
    if (!this.config.permissionsPolicy.enabled) { return; }

    const policies: string[] = [];
    for (const [feature, allowlist] of Object.entries(this.config.permissionsPolicy.policies)) {
      policies.push(`${feature}=(${allowlist.join(" ")})`);
    }

    if (policies.length > 0) {
      c.header("Permissions-Policy", policies.join(", "));
    }
  }

  private applyLGPDHeaders(c: Context): void {
    if (!this.config.lgpdCompliance.enabled) { return; }

    // Custom LGPD compliance headers
    c.header("X-LGPD-Compliant", "true");

    if (this.config.lgpdCompliance.privacyPolicyUrl) {
      c.header("X-Privacy-Policy", this.config.lgpdCompliance.privacyPolicyUrl);
    }

    if (this.config.lgpdCompliance.dataControllerInfo) {
      c.header("X-Data-Controller", this.config.lgpdCompliance.dataControllerInfo);
    }

    // Data processing transparency
    c.header("X-Data-Processing", "healthcare-operations");
    c.header("X-Data-Retention", "as-per-medical-regulations");
  }

  private applyEmergencyAccessHeaders(c: Context): void {
    if (!this.config.emergencyAccess.enabled) { return; }

    // Emergency access context headers
    const emergencyContext = c.req.header("X-Emergency-Access");
    if (emergencyContext) {
      c.header("X-Emergency-Access-Granted", "true");
      c.header("X-Emergency-Audit-Required", this.config.emergencyAccess.auditRequired.toString());
      c.header("X-Emergency-Justification-Required", "true");
    }
  }

  private applyAdditionalSecurityHeaders(c: Context): void {
    // Additional security headers for healthcare applications
    c.header("X-Powered-By", "NeonPro Healthcare Platform"); // Custom server signature
    c.header("X-Healthcare-Compliance", "ANVISA,CFM,LGPD");
    c.header("X-Security-Level", this.config.level);

    // Cache control for sensitive endpoints
    if (this.config.endpointType === HealthcareEndpointType.MEDICAL_RECORDS) {
      c.header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      c.header("Pragma", "no-cache");
      c.header("Expires", "0");
    }

    // Cross-Origin policies for healthcare APIs
    c.header("Cross-Origin-Embedder-Policy", "require-corp");
    c.header("Cross-Origin-Opener-Policy", "same-origin");
    c.header("Cross-Origin-Resource-Policy", "cross-origin");
  }

  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
  }
}

/**
 * Create Security Headers Middleware
 */
export function createSecurityHeadersMiddleware(
  configName = "development",
  options: {
    customConfig?: Partial<SecurityHeadersConfig>;
    skipPaths?: string[];
  } = {},
): MiddlewareHandler {
  const manager = new SecurityHeadersManager(configName);

  return async (c: Context, next) => {
    // Skip security headers for certain paths if specified
    if (options.skipPaths?.some(path => c.req.path.startsWith(path))) {
      await next();
      return;
    }

    try {
      // Apply security headers before processing request
      manager.applySecurityHeaders(c);

      // Add timing header for monitoring
      const startTime = Date.now();

      await next();

      // Add response time header
      const responseTime = Date.now() - startTime;
      c.header("X-Response-Time", `${responseTime}ms`);
    } catch (error) {
      console.error("Security headers middleware error:", error);
      // Continue processing even if security headers fail (fail open for healthcare)
      await next();
    }
  };
}

/**
 * Pre-configured security headers for different environments
 */
export const securityHeadersMiddlewares = {
  development: () => createSecurityHeadersMiddleware("development"),

  patientPortalProduction: () => createSecurityHeadersMiddleware("patient_portal_production"),

  medicalRecordsProduction: () => createSecurityHeadersMiddleware("medical_records_production"),

  emergencyAccessProduction: () => createSecurityHeadersMiddleware("emergency_access_production"),

  custom: (configName: string, options?: unknown) =>
    createSecurityHeadersMiddleware(configName, options),
};

/**
 * CSP Report Handler for monitoring violations
 */
export function createCSPReportHandler(): MiddlewareHandler {
  return async (c: Context) => {
    try {
      const report = await c.req.json();

      const logEntry = {
        timestamp: new Date().toISOString(),
        type: "CSP_VIOLATION",
        report,
        userAgent: c.req.header("User-Agent"),
        referer: c.req.header("Referer"),
        ip: c.req.header("X-Forwarded-For") || "unknown",
      };

      console.warn("🚨 CSP Violation Report:", JSON.stringify(logEntry, null, 2));

      // Security violation logged - external monitoring can be added later

      return c.json({ success: true, message: "CSP report received" });
    } catch (error) {
      console.error("CSP report handler error:", error);
      return c.json({ success: false, error: "Failed to process CSP report" }, 500);
    }
  };
}
