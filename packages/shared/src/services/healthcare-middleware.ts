/**
 * Healthcare Request/Response Middleware
 *
 * Comprehensive middleware system with:
 * - Healthcare context injection for all requests
 * - LGPD compliance validation and enforcement
 * - Performance monitoring and metrics collection
 * - Error handling with healthcare impact assessment
 * - Audit logging integration
 * - Rate limiting integration
 * - Security headers and validation
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @compliance LGPD, ANVISA SaMD, Healthcare Standards
 */

import { nanoid } from "nanoid";
import { z } from "zod";
import type { Context, Next, MiddlewareHandler } from "hono";

// ============================================================================
// SCHEMAS & TYPES
// ============================================================================

/**
 * Healthcare context schema for requests
 */
export const HealthcareRequestContextSchema = z.object({
  // Request identification
  requestId: z.string().describe("Unique request identifier"),
  correlationId: z
    .string()
    .optional()
    .describe("Correlation ID for request tracing"),
  sessionId: z.string().optional().describe("User session identifier"),

  // Healthcare workflow context
  workflowContext: z
    .object({
      workflowType: z
        .enum([
          "patient_registration",
          "appointment_management",
          "medical_consultation",
          "diagnosis_procedure",
          "treatment_administration",
          "medication_management",
          "laboratory_testing",
          "diagnostic_imaging",
          "emergency_response",
          "patient_discharge",
          "administrative_task",
          "system_maintenance",
          "compliance_audit",
          "data_backup",
        ])
        .optional()
        .describe("Healthcare workflow type"),

      workflowStage: z.string().optional().describe("Current workflow stage"),
      urgencyLevel: z
        .enum(["routine", "urgent", "critical", "emergency"])
        .optional()
        .describe("Request urgency"),

      // Flags for special handling
      emergencyFlag: z
        .boolean()
        .default(false)
        .describe("Emergency request flag"),
      patientSafetyFlag: z
        .boolean()
        .default(false)
        .describe("Patient safety flag"),
      criticalSystemFlag: z
        .boolean()
        .default(false)
        .describe("Critical system flag"),
      complianceFlag: z
        .boolean()
        .default(false)
        .describe("Compliance-related flag"),
    })
    .optional()
    .describe("Healthcare workflow context"),

  // User context (LGPD-compliant)
  userContext: z
    .object({
      anonymizedUserId: z
        .string()
        .optional()
        .describe("LGPD-compliant user ID"),
      userRole: z
        .enum([
          "patient",
          "doctor",
          "nurse",
          "admin",
          "technician",
          "pharmacist",
          "lab_technician",
          "radiologist",
          "system_admin",
          "compliance_officer",
          "guest",
        ])
        .optional()
        .describe("User role"),

      permissions: z.array(z.string()).optional().describe("User permissions"),
      facilityId: z.string().optional().describe("Healthcare facility ID"),
      departmentId: z.string().optional().describe("Department ID"),
      shiftId: z.string().optional().describe("Work shift ID"),

      accessLevel: z
        .enum(["public", "restricted", "confidential", "secret"])
        .optional()
        .describe("Access level"),
      consentStatus: z
        .object({
          dataProcessing: z
            .boolean()
            .default(false)
            .describe("Data processing consent"),
          communication: z
            .boolean()
            .default(false)
            .describe("Communication consent"),
          analytics: z.boolean().default(false).describe("Analytics consent"),
          thirdParty: z
            .boolean()
            .default(false)
            .describe("Third-party sharing consent"),
        })
        .optional()
        .describe("LGPD consent status"),
    })
    .optional()
    .describe("User context"),

  // Technical context
  technicalContext: z
    .object({
      clientIpAddress: z.string().describe("Client IP address (anonymized)"),
      userAgent: z.string().optional().describe("Client user agent"),
      deviceType: z
        .enum(["mobile", "tablet", "desktop", "iot", "medical_device"])
        .optional()
        .describe("Device type"),

      // Request metadata
      httpMethod: z.string().describe("HTTP method"),
      endpoint: z.string().describe("API endpoint"),
      apiVersion: z.string().optional().describe("API version"),
      contentType: z.string().optional().describe("Request content type"),

      // Geographic context
      geolocation: z
        .object({
          country: z.string().optional().describe("Country code"),
          region: z.string().optional().describe("Region"),
          timezone: z.string().optional().describe("Client timezone"),
        })
        .optional()
        .describe("Geographic context"),

      // Performance context
      performance: z
        .object({
          startTime: z.number().describe("Request start timestamp"),
          connectionType: z.string().optional().describe("Connection type"),
          bandwidth: z.number().optional().describe("Estimated bandwidth"),
        })
        .describe("Performance context"),
    })
    .describe("Technical request context"),

  // Compliance context
  complianceContext: z
    .object({
      legalBasis: z
        .enum([
          "consent",
          "contract",
          "legal_obligation",
          "vital_interests",
          "public_interest",
          "legitimate_interests",
        ])
        .describe("LGPD legal basis"),

      dataClassification: z
        .enum(["public", "internal", "confidential", "restricted"])
        .describe("Data classification"),
      auditRequired: z.boolean().describe("Audit logging required"),
      retentionPeriod: z.number().describe("Data retention period in days"),

      // Privacy settings
      privacySettings: z
        .object({
          piiRedaction: z
            .boolean()
            .default(true)
            .describe("Enable PII redaction"),
          anonymization: z
            .boolean()
            .default(false)
            .describe("Enable anonymization"),
          pseudonymization: z
            .boolean()
            .default(true)
            .describe("Enable pseudonymization"),
          encryption: z.boolean().default(true).describe("Enable encryption"),
        })
        .describe("Privacy settings"),
    })
    .describe("Compliance context"),
});

export type HealthcareRequestContext = z.infer<
  typeof HealthcareRequestContextSchema
>;

/**
 * Middleware configuration schema
 */
export const MiddlewareConfigSchema = z.object({
  // Core settings
  enabled: z.boolean().default(true).describe("Enable middleware"),
  environment: z
    .enum(["development", "staging", "production"])
    .describe("Environment"),

  // Healthcare settings
  healthcareSettings: z
    .object({
      enableWorkflowInjection: z
        .boolean()
        .default(true)
        .describe("Enable workflow context injection"),
      enableEmergencyDetection: z
        .boolean()
        .default(true)
        .describe("Enable emergency request detection"),
      enablePatientSafetyChecks: z
        .boolean()
        .default(true)
        .describe("Enable patient safety checks"),
      enableComplianceValidation: z
        .boolean()
        .default(true)
        .describe("Enable compliance validation"),
    })
    .describe("Healthcare-specific settings"),

  // Performance monitoring
  performanceMonitoring: z
    .object({
      enabled: z
        .boolean()
        .default(true)
        .describe("Enable performance monitoring"),
      slowRequestThreshold: z
        .number()
        .default(5000)
        .describe("Slow request threshold in ms"),
      metricsInterval: z
        .number()
        .default(60000)
        .describe("Metrics collection interval"),
      enableWebVitals: z
        .boolean()
        .default(true)
        .describe("Enable Web Vitals collection"),
    })
    .describe("Performance monitoring settings"),

  // Rate limiting integration
  rateLimiting: z
    .object({
      enabled: z.boolean().default(true).describe("Enable rate limiting"),
      enableHealthcareClassification: z
        .boolean()
        .default(true)
        .describe("Enable healthcare request classification"),
      bypassEmergencyRequests: z
        .boolean()
        .default(true)
        .describe("Bypass rate limits for emergency requests"),
    })
    .describe("Rate limiting settings"),

  // Error handling
  errorHandling: z
    .object({
      enableDetailedErrors: z
        .boolean()
        .default(false)
        .describe("Enable detailed error responses"),
      enableErrorTracking: z
        .boolean()
        .default(true)
        .describe("Enable error tracking"),
      enablePatientSafetyAlerts: z
        .boolean()
        .default(true)
        .describe("Enable patient safety alerts"),
      enableNotifications: z
        .boolean()
        .default(true)
        .describe("Enable error notifications"),
    })
    .describe("Error handling settings"),

  // Security settings
  security: z
    .object({
      enableSecurityHeaders: z
        .boolean()
        .default(true)
        .describe("Enable security headers"),
      enableCors: z.boolean().default(true).describe("Enable CORS"),
      enableCsrfProtection: z
        .boolean()
        .default(true)
        .describe("Enable CSRF protection"),
      enableInputValidation: z
        .boolean()
        .default(true)
        .describe("Enable input validation"),

      // LGPD compliance
      enablePiiDetection: z
        .boolean()
        .default(true)
        .describe("Enable PII detection"),
      enableDataMinimization: z
        .boolean()
        .default(true)
        .describe("Enable data minimization"),
      enableConsentValidation: z
        .boolean()
        .default(true)
        .describe("Enable consent validation"),
    })
    .describe("Security settings"),

  // Logging and audit
  logging: z
    .object({
      enableRequestLogging: z
        .boolean()
        .default(true)
        .describe("Enable request logging"),
      enableResponseLogging: z
        .boolean()
        .default(false)
        .describe("Enable response logging"),
      enableAuditLogging: z
        .boolean()
        .default(true)
        .describe("Enable audit logging"),
      logLevel: z
        .enum(["debug", "info", "warn", "error"])
        .default("info")
        .describe("Log level"),

      // LGPD compliance for logging
      enablePiiRedaction: z
        .boolean()
        .default(true)
        .describe("Enable PII redaction in logs"),
      logRetentionDays: z
        .number()
        .default(90)
        .describe("Log retention period in days"),
    })
    .describe("Logging settings"),
});

export type MiddlewareConfig = z.infer<typeof MiddlewareConfigSchema>;

/**
 * Request metrics schema
 */
export const RequestMetricsSchema = z.object({
  requestId: z.string().describe("Request ID"),
  endpoint: z.string().describe("API endpoint"),
  httpMethod: z.string().describe("HTTP method"),

  // Timing metrics
  startTime: z.number().describe("Request start time"),
  endTime: z.number().optional().describe("Request end time"),
  duration: z.number().optional().describe("Request duration in ms"),

  // Response metrics
  statusCode: z.number().optional().describe("HTTP status code"),
  responseSize: z.number().optional().describe("Response size in bytes"),

  // Healthcare metrics
  workflowType: z.string().optional().describe("Healthcare workflow type"),
  urgencyLevel: z.string().optional().describe("Request urgency level"),
  userRole: z.string().optional().describe("User role"),

  // Performance metrics
  memoryUsage: z.number().optional().describe("Memory usage in MB"),
  cpuUsage: z.number().optional().describe("CPU usage percentage"),

  // Error metrics
  errorOccurred: z.boolean().default(false).describe("Whether error occurred"),
  errorType: z.string().optional().describe("Error type"),
  errorCode: z.string().optional().describe("Error code"),

  timestamp: z.string().datetime().describe("Metrics timestamp"),
});

export type RequestMetrics = z.infer<typeof RequestMetricsSchema>;

// ============================================================================
// MIDDLEWARE IMPLEMENTATION
// ============================================================================

/**
 * Healthcare Request/Response Middleware Service
 */
export class HealthcareMiddlewareService {
  private config: MiddlewareConfig;
  private requestMetrics: Map<string, RequestMetrics> = new Map();
  private isInitialized = false;

  constructor(config: Partial<MiddlewareConfig> = {}) {
    this.config = MiddlewareConfigSchema.parse({
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
   * Initialize the middleware service
   */
  private initialize(): void {
    try {
      this.setupMetricsCollection();
      this.isInitialized = true;

      console.log(
        "🔄 [HealthcareMiddlewareService] Healthcare middleware service initialized",
      );
    } catch (_error) {
      void _error;
      console.error(
        "Failed to initialize healthcare middleware _service:",
        error,
      );
    }
  }

  /**
   * Setup metrics collection
   */
  private setupMetricsCollection(): void {
    if (this.config.performanceMonitoring.enabled) {
      setInterval(() => {
        this.collectAndReportMetrics();
      }, this.config.performanceMonitoring.metricsInterval);
    }
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): Partial<MiddlewareConfig> {
    return {
      enabled: true,
      environment: "development",

      healthcareSettings: {
        enableWorkflowInjection: true,
        enableEmergencyDetection: true,
        enablePatientSafetyChecks: true,
        enableComplianceValidation: true,
      },

      performanceMonitoring: {
        enabled: true,
        slowRequestThreshold: 3000, // 3 seconds for healthcare
        metricsInterval: 30000, // 30 seconds
        enableWebVitals: true,
      },

      rateLimiting: {
        enabled: true,
        enableHealthcareClassification: true,
        bypassEmergencyRequests: true,
      },

      errorHandling: {
        enableDetailedErrors: false, // Security consideration
        enableErrorTracking: true,
        enablePatientSafetyAlerts: true,
        enableNotifications: true,
      },

      security: {
        enableSecurityHeaders: true,
        enableCors: true,
        enableCsrfProtection: true,
        enableInputValidation: true,
        enablePiiDetection: true,
        enableDataMinimization: true,
        enableConsentValidation: true,
      },

      logging: {
        enableRequestLogging: true,
        enableResponseLogging: false, // Avoid logging sensitive data
        enableAuditLogging: true,
        logLevel: "info",
        enablePiiRedaction: true,
        logRetentionDays: 90,
      },
    };
  }

  // ============================================================================
  // CORE MIDDLEWARE FUNCTIONS
  // ============================================================================

  /**
   * Main middleware function for Hono
   */
  createMiddleware(): MiddlewareHandler {
    return async (c: Context, next: Next) => {
      if (!this.config.enabled) {
        return next();
      }

      const startTime = Date.now();
      let requestContext: HealthcareRequestContext;

      try {
        // Phase 1: Initialize request context
        requestContext = await this.initializeRequestContext(c);

        // Phase 2: Security and validation
        await this.performSecurityValidation(c, requestContext);

        // Phase 3: LGPD compliance validation
        if (this.config.security.enableConsentValidation) {
          await this.validateLGPDCompliance(c, requestContext);
        }

        // Phase 4: Rate limiting check
        if (this.config.rateLimiting.enabled) {
          await this.performRateLimitingCheck(c, requestContext);
        }

        // Phase 5: Healthcare context injection
        if (this.config.healthcareSettings.enableWorkflowInjection) {
          await this.injectHealthcareContext(c, requestContext);
        }

        // Phase 6: Performance monitoring setup
        if (this.config.performanceMonitoring.enabled) {
          this.startPerformanceMonitoring(requestContext);
        }

        // Phase 7: Request logging
        if (this.config.logging.enableRequestLogging) {
          await this.logRequest(c, requestContext);
        }

        // Store context for use in other middleware/handlers
        c.set("healthcareContext", requestContext);

        // Execute next middleware/handler
        await next();

        // Phase 8: Post-processing
        await this.performPostProcessing(c, requestContext, startTime);
      } catch (_error) {
      void _error;
        // Error handling
        await this.handleMiddlewareError(c, error, requestContext!, startTime);
      }
    };
  }

  /**
   * Initialize request context with healthcare-specific data
   */
  private async initializeRequestContext(
    _c: Context,
  ): Promise<HealthcareRequestContext> {
    const requestId = `req_${nanoid(12)}`;
    const correlationId =
      c.req.header("x-correlation-id") || `corr_${nanoid(8)}`;

    // Extract user context from headers/auth
    const userContext = await this.extractUserContext(c);

    // Extract technical context
    const technicalContext = this.extractTechnicalContext(c);

    // Determine compliance context
    const complianceContext = this.determineComplianceContext(c, userContext);

    // Detect healthcare workflow context
    const workflowContext = await this.detectWorkflowContext(c, userContext);

    const requestContext: HealthcareRequestContext = {
      requestId,
      correlationId,
      sessionId: c.req.header("x-session-id"),
      workflowContext,
      userContext,
      technicalContext,
      complianceContext,
    };

    return HealthcareRequestContextSchema.parse(requestContext);
  }

  /**
   * Extract user context from request
   */
  private async extractUserContext(
    _c: Context,
  ): Promise<HealthcareRequestContext["userContext"]> {
    // TODO: Integrate with authentication service
    const authHeader = c.req.header("authorization");

    // SECURITY FIX: Never trust user role from headers - must come from verified JWT
    // const decodedToken = await verifyAndDecodeJWT(authHeader);
    // const userRole = decodedToken?.role;
    // const facilityId = decodedToken?.facilityId;
    const userRole = "guest"; // Default to guest until proper auth is implemented
    const facilityId = c.req.header("x-facility-id");

    return {
      anonymizedUserId: authHeader ? `user_${nanoid(8)}` : undefined,
      userRole: userRole, // Role should come from a verified token, not a header
      facilityId,
      departmentId: c.req.header("x-department-id"),
      accessLevel: "public", // Default to public, should be determined by auth
      consentStatus: {
        dataProcessing: true, // Should come from user preferences
        communication: false,
        analytics: false,
        thirdParty: false,
      },
    };
  }

  /**
   * Extract technical context from request
   */
  private extractTechnicalContext(
    _c: Context,
  ): HealthcareRequestContext["technicalContext"] {
    const req = c.req;

    return {
      clientIpAddress: this.anonymizeIP(
        req.header("x-forwarded-for")?.split(",")[0].trim() ||
          req.header("x-real-ip") ||
          "unknown",
      ),
      userAgent: req.header("user-agent"),
      deviceType: this.detectDeviceType(req.header("user-agent")),
      httpMethod: req.method,
      endpoint: req.path,
      apiVersion: req.header("x-api-version"),
      contentType: req.header("content-type"),
      geolocation: {
        country: req.header("x-country-code"),
        region: req.header("x-region-code"),
        timezone: req.header("x-timezone"),
      },
      performance: {
        startTime: Date.now(),
        connectionType: req.header("x-connection-type"),
        bandwidth: req.header("x-bandwidth")
          ? parseInt(req.header("x-bandwidth")!)
          : undefined,
      },
    };
  }

  /**
   * Determine compliance context
   */
  private determineComplianceContext(
    _c: Context,
    _userContext: HealthcareRequestContext["userContext"],
  ): HealthcareRequestContext["complianceContext"] {
    // Determine legal basis based on request type and user context
    let legalBasis:
      | "consent"
      | "contract"
      | "legal_obligation"
      | "vital_interests"
      | "public_interest"
      | "legitimate_interests" = "legitimate_interests";

    // Healthcare operations are typically legitimate interest
    if (
      c.req.path.includes("/emergency") ||
      c.req.path.includes("/patient-safety")
    ) {
      legalBasis = "vital_interests";
    }

    // Determine data classification
    let dataClassification:
      | "public"
      | "internal"
      | "confidential"
      | "restricted" = "internal";

    if (c.req.path.includes("/patient") || c.req.path.includes("/medical")) {
      dataClassification = "confidential";
    }

    if (c.req.path.includes("/emergency") || c.req.path.includes("/critical")) {
      dataClassification = "restricted";
    }

    return {
      legalBasis,
      dataClassification,
      auditRequired:
        dataClassification === "restricted" ||
        dataClassification === "confidential",
      retentionPeriod: 365, // 1 year for healthcare data
      privacySettings: {
        piiRedaction: true,
        anonymization: false,
        pseudonymization: true,
        encryption: true,
      },
    };
  }

  /**
   * Detect healthcare workflow context
   */
  private async detectWorkflowContext(
    _c: Context,
    _userContext: HealthcareRequestContext["userContext"],
  ): Promise<HealthcareRequestContext["workflowContext"]> {
    const path = c.req.path.toLowerCase();
    const method = c.req.method;

    // Emergency detection
    const emergencyFlag =
      path.includes("/emergency") ||
      c.req.header("x-emergency") === "true" ||
      path.includes("/urgent");

    // Patient safety detection
    const patientSafetyFlag =
      path.includes("/patient-safety") ||
      path.includes("/medication") ||
      path.includes("/allergy") ||
      c.req.header("x-patient-safety") === "true";

    // Critical system detection
    const criticalSystemFlag =
      path.includes("/monitoring") ||
      path.includes("/alert") ||
      userContext?.userRole === "system_admin";

    // Workflow type detection
    let workflowType: HealthcareRequestContext["workflowContext"]["workflowType"] =
      "administrative_task";

    if (path.includes("/patient") && method === "POST")
      workflowType = "patient_registration";
    if (path.includes("/appointment")) workflowType = "appointment_management";
    if (path.includes("/consultation")) workflowType = "medical_consultation";
    if (path.includes("/diagnosis")) workflowType = "diagnosis_procedure";
    if (path.includes("/treatment")) workflowType = "treatment_administration";
    if (path.includes("/medication")) workflowType = "medication_management";
    if (path.includes("/lab")) workflowType = "laboratory_testing";
    if (path.includes("/imaging")) workflowType = "diagnostic_imaging";
    if (path.includes("/emergency")) workflowType = "emergency_response";
    if (path.includes("/discharge")) workflowType = "patient_discharge";
    if (path.includes("/backup")) workflowType = "data_backup";
    if (path.includes("/audit")) workflowType = "compliance_audit";

    // Urgency level determination
    let urgencyLevel: "routine" | "urgent" | "critical" | "emergency" =
      "routine";

    if (emergencyFlag) urgencyLevel = "emergency";
    else if (patientSafetyFlag) urgencyLevel = "critical";
    else if (criticalSystemFlag) urgencyLevel = "urgent";

    return {
      workflowType,
      workflowStage:
        method === "POST"
          ? "initiation"
          : method === "PUT"
            ? "update"
            : "query",
      urgencyLevel,
      emergencyFlag,
      patientSafetyFlag,
      criticalSystemFlag,
      complianceFlag: workflowType === "compliance_audit",
    };
  }

  /**
   * Perform security validation
   */
  private async performSecurityValidation(
    _c: Context,
    _context: HealthcareRequestContext,
  ): Promise<void> {
    if (!this.config.security.enableInputValidation) return;

    // Basic security headers validation
    if (this.config.security.enableSecurityHeaders) {
      this.validateSecurityHeaders(c);
    }

    // PII detection in request
    if (this.config.security.enablePiiDetection) {
      await this.detectAndRedactPII(c, _context);
    }

    // CSRF protection for state-changing operations
    if (
      this.config.security.enableCsrfProtection &&
      ["POST", "PUT", "DELETE", "PATCH"].includes(c.req.method)
    ) {
      this.validateCSRFToken(c);
    }
  }

  /**
   * Validate LGPD compliance
   */
  private async validateLGPDCompliance(
    _c: Context,
    _context: HealthcareRequestContext,
  ): Promise<void> {
    // Check if user has required consent for data processing
    if (context.complianceContext.legalBasis === "consent") {
      const hasConsent = context.userContext?.consentStatus?.dataProcessing;

      if (!hasConsent) {
        throw new Error(
          "LGPD_CONSENT_REQUIRED: User consent required for data processing",
        );
      }
    }

    // Validate data minimization
    if (this.config.security.enableDataMinimization) {
      await this.validateDataMinimization(c, _context);
    }

    // Log compliance validation
    if (this.config.logging.enableAuditLogging) {
      await this.logComplianceValidation(context);
    }
  }

  /**
   * Perform rate limiting check
   */
  private async performRateLimitingCheck(
    _c: Context,
    _context: HealthcareRequestContext,
  ): Promise<void> {
    // TODO: Integrate with API rate limiting service

    // For emergency requests, bypass rate limiting
    if (
      this.config.rateLimiting.bypassEmergencyRequests &&
      context.workflowContext?.emergencyFlag
    ) {
      console.log(
        `🚨 [HealthcareMiddlewareService] Emergency bypass for _request: ${context.requestId}`,
      );
      return;
    }

    // Simulate rate limiting check
    console.log(
      `🚦 [HealthcareMiddlewareService] Rate limiting check for _request: ${context.requestId}`,
    );
  }

  /**
   * Inject healthcare context into request
   */
  private async injectHealthcareContext(
    _c: Context,
    _context: HealthcareRequestContext,
  ): Promise<void> {
    // Add healthcare context headers to response
    c.header("x-request-id", context.requestId);
    c.header("x-correlation-id", context.correlationId!);
    c.header(
      "x-workflow-type",
      context.workflowContext?.workflowType || "unknown",
    );
    c.header(
      "x-urgency-level",
      context.workflowContext?.urgencyLevel || "routine",
    );

    // Add compliance headers
    c.header(
      "x-data-classification",
      context.complianceContext.dataClassification,
    );
    c.header(
      "x-audit-required",
      context.complianceContext.auditRequired.toString(),
    );
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(_context: HealthcareRequestContext): void {
    const metrics: RequestMetrics = {
      requestId: context.requestId,
      endpoint: context.technicalContext.endpoint,
      httpMethod: context.technicalContext.httpMethod,
      startTime: context.technicalContext.performance.startTime,
      workflowType: context.workflowContext?.workflowType,
      urgencyLevel: context.workflowContext?.urgencyLevel,
      userRole: context.userContext?.userRole,
      timestamp: new Date().toISOString(),
    };

    this.requestMetrics.set(context.requestId, metrics);
  }

  /**
   * Log request for audit purposes
   */
  private async logRequest(
    _c: Context,
    _context: HealthcareRequestContext,
  ): Promise<void> {
    const logData = {
      requestId: context.requestId,
      correlationId: context.correlationId,
      endpoint: context.technicalContext.endpoint,
      method: context.technicalContext.httpMethod,
      userRole: context.userContext?.userRole,
      facilityId: context.userContext?.facilityId,
      workflowType: context.workflowContext?.workflowType,
      urgencyLevel: context.workflowContext?.urgencyLevel,
      emergencyFlag: context.workflowContext?.emergencyFlag,
      dataClassification: context.complianceContext.dataClassification,
      legalBasis: context.complianceContext.legalBasis,
      auditRequired: context.complianceContext.auditRequired,
      timestamp: new Date().toISOString(),
    };

    // TODO: Integrate with structured logging service
    console.log("📝 [HealthcareMiddlewareService] Request logged:", logData);
  }

  /**
   * Perform post-processing after request completion
   */
  private async performPostProcessing(
    _c: Context,
    _context: HealthcareRequestContext,
    startTime: number,
  ): Promise<void> {
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Update metrics
    if (this.config.performanceMonitoring.enabled) {
      this.updateRequestMetrics(context.requestId, {
        endTime,
        duration,
        statusCode: c.res.status,
        responseSize: this.estimateResponseSize(c.res),
      });
    }

    // Check for slow requests
    if (duration > this.config.performanceMonitoring.slowRequestThreshold) {
      await this.handleSlowRequest(context, duration);
    }

    // Response logging if enabled
    if (
      this.config.logging.enableResponseLogging &&
      this.config.logging.enableAuditLogging
    ) {
      await this.logResponse(c, context, duration);
    }
  }

  /**
   * Handle middleware errors
   */
  private async handleMiddlewareError(
    _c: Context,
    error: Error & { code?: string; name?: string },
    _context: HealthcareRequestContext,
    startTime: number,
  ): Promise<void> {
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Update metrics with error
    if (this.config.performanceMonitoring.enabled && _context) {
      this.updateRequestMetrics(context.requestId, {
        endTime,
        duration,
        errorOccurred: true,
        errorType: error.name || "UnknownError",
        errorCode: error.code || "MIDDLEWARE_ERROR",
      });
    }

    // Log error
    const errorData = {
      requestId: context?.requestId || "unknown",
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code,
      },
      duration,
      workflowType: context?.workflowContext?.workflowType,
      emergencyFlag: context?.workflowContext?.emergencyFlag,
      patientSafetyFlag: context?.workflowContext?.patientSafetyFlag,
      timestamp: new Date().toISOString(),
    };

    console.error(
      "❌ [HealthcareMiddlewareService] Middleware error:",
      errorData,
    );

    // TODO: Integrate with error tracking service
    // TODO: Send patient safety alerts if applicable

    // Return appropriate error response
    if (!c.res.ok) {
      // Only if response not already sent
      const statusCode = this.determineErrorStatusCode(error);
      const errorResponse = this.createErrorResponse(error, _context);

      c.json(errorResponse, statusCode as any);
      return;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Anonymize IP address for LGPD compliance
   */
  private anonymizeIP(ip: string): string {
    if (ip === "unknown") return ip;

    // IPv4 anonymization (remove last octet)
    if (ip.includes(".")) {
      const parts = ip.split(".");
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }

    // IPv6 anonymization (remove last 64 bits)
    if (ip.includes(":")) {
      const parts = ip.split(":");
      return parts.slice(0, 4).join(":") + "::";
    }

    return "anonymized";
  }

  /**
   * Detect device type from user agent
   */
  private detectDeviceType(
    userAgent?: string,
  ): "mobile" | "tablet" | "desktop" | "iot" | "medical_device" | undefined {
    if (!userAgent) return undefined;

    const ua = userAgent.toLowerCase();

    // Medical device detection
    if (
      ua.includes("medical") ||
      ua.includes("device") ||
      ua.includes("monitor")
    ) {
      return "medical_device";
    }

    // IoT device detection
    if (ua.includes("iot") || ua.includes("sensor")) {
      return "iot";
    }

    // Mobile detection
    if (
      ua.includes("mobile") ||
      ua.includes("android") ||
      ua.includes("iphone")
    ) {
      return "mobile";
    }

    // Tablet detection
    if (ua.includes("tablet") || ua.includes("ipad")) {
      return "tablet";
    }

    return "desktop";
  }

  /**
   * Validate security headers
   */
  private validateSecurityHeaders(c: Context): void {
    // Check for required security headers in sensitive requests
    const requiresSecureHeaders =
      c.req.path.includes("/patient") ||
      c.req.path.includes("/medical") ||
      c.req.path.includes("/admin");

    if (requiresSecureHeaders) {
      const securityHeaders = ["x-requested-with", "content-type"];

      for (const header of securityHeaders) {
        if (!c.req.header(header)) {
          console.warn(
            `⚠️ [HealthcareMiddlewareService] Missing security header: ${header}`,
          );
        }
      }
    }
  }

  /**
   * Detect and redact PII in request
   */
  private async detectAndRedactPII(
    _c: Context,
    _context: HealthcareRequestContext,
  ): Promise<void> {
    // TODO: Implement PII detection and redaction
    console.log(
      `🔐 [HealthcareMiddlewareService] PII detection for _request: ${context.requestId}`,
    );
  }

  /**
   * Validate CSRF token
   */
  private validateCSRFToken(c: Context): void {
    const csrfToken = c.req.header("x-csrf-token");

    if (!csrfToken) {
      throw new Error(
        "CSRF_TOKEN_MISSING: CSRF token required for state-changing operations",
      );
    }

    // Get the expected token from session or cookie
    const expectedToken = c.req.header("cookie") || c.get("session")?.csrfToken;

    if (!expectedToken || csrfToken !== expectedToken) {
      throw new Error("CSRF_TOKEN_INVALID: Invalid CSRF token provided");
    }

    console.log("🛡️ [HealthcareMiddlewareService] CSRF token validated");
  }

  /**
   * Validate data minimization principles
   */
  private async validateDataMinimization(
    _c: Context,
    _context: HealthcareRequestContext,
  ): Promise<void> {
    // Check if request is collecting more data than necessary
    // BUGFIX: Use pre-parsed body to avoid consuming request stream
    const body = c.get("parsedBody"); // Assume body is parsed earlier and stored in context

    if (body && typeof body === "object") {
      const sensitiveFields = [
        "cpf",
        "ssn",
        "birthDate",
        "fullName",
        "address",
      ];
      const requestedFields = Object.keys(body);

      const unnecessarySensitiveFields = sensitiveFields.filter(
        (field) =>
          requestedFields.includes(field) &&
          !this.isFieldNecessary(field, _context),
      );

      if (unnecessarySensitiveFields.length > 0) {
        console.warn(
          `⚠️ [HealthcareMiddlewareService] Data minimization violation - unnecessary fields: ${unnecessarySensitiveFields.join(", ")}`,
        );
      }
    }
  }

  /**
   * Check if a field is necessary for the current workflow
   */
  private isFieldNecessary(
    field: string,
    _context: HealthcareRequestContext,
  ): boolean {
    const workflowType = context.workflowContext?.workflowType;

    // Define necessary fields per workflow type
    const necessaryFields: Record<string, string[]> = {
      patient_registration: ["cpf", "fullName", "birthDate", "address"],
      medical_consultation: ["cpf"],
      emergency_response: ["cpf", "fullName"],
      medication_management: ["cpf"],
      appointment_management: ["cpf"],
      administrative_task: [],
    };

    return (
      necessaryFields[workflowType || "administrative_task"]?.includes(field) ||
      false
    );
  }

  /**
   * Log compliance validation
   */
  private async logComplianceValidation(
    _context: HealthcareRequestContext,
  ): Promise<void> {
    const complianceLog = {
      requestId: context.requestId,
      legalBasis: context.complianceContext.legalBasis,
      dataClassification: context.complianceContext.dataClassification,
      consentStatus: context.userContext?.consentStatus,
      auditRequired: context.complianceContext.auditRequired,
      workflowType: context.workflowContext?.workflowType,
      timestamp: new Date().toISOString(),
    };

    console.log(
      "📋 [HealthcareMiddlewareService] Compliance validation:",
      complianceLog,
    );
  }

  /**
   * Update request metrics
   */
  private updateRequestMetrics(
    requestId: string,
    updates: Partial<RequestMetrics>,
  ): void {
    const metrics = this.requestMetrics.get(requestId);
    if (metrics) {
      Object.assign(metrics, updates);
    }
  }

  /**
   * Estimate response size
   */
  private estimateResponseSize(_response: Response): number {
    // TODO: Implement actual response size calculation
    return 0;
  }

  /**
   * Handle slow requests
   */
  private async handleSlowRequest(
    _context: HealthcareRequestContext,
    duration: number,
  ): Promise<void> {
    const slowRequestData = {
      requestId: context.requestId,
      endpoint: context.technicalContext.endpoint,
      duration,
      workflowType: context.workflowContext?.workflowType,
      urgencyLevel: context.workflowContext?.urgencyLevel,
      threshold: this.config.performanceMonitoring.slowRequestThreshold,
      timestamp: new Date().toISOString(),
    };

    console.warn(
      "🐌 [HealthcareMiddlewareService] Slow request detected:",
      slowRequestData,
    );

    // TODO: Send performance alerts
    // TODO: Integrate with performance monitoring service
  }

  /**
   * Log response
   */
  private async logResponse(
    _c: Context,
    _context: HealthcareRequestContext,
    duration: number,
  ): Promise<void> {
    const responseLog = {
      requestId: context.requestId,
      statusCode: c.res.status,
      duration,
      workflowType: context.workflowContext?.workflowType,
      endpoint: context.technicalContext.endpoint,
      timestamp: new Date().toISOString(),
    };

    console.log(
      "📤 [HealthcareMiddlewareService] Response logged:",
      responseLog,
    );
  }

  /**
   * Get request body safely
   */
  private async getRequestBody(c: Context): Promise<any> {
    try {
      const contentType = c.req.header("content-type");
      if (contentType?.includes("application/json")) {
        return await c.req.json();
      }
    } catch (_error) {
      void _error;
      // Ignore parsing errors
    }
    return null;
  }

  /**
   * Determine error status code
   */
  private determineErrorStatusCode(
    error: Error & { message?: string },
  ): number {
    if (error.message?.includes("LGPD_CONSENT_REQUIRED")) return 403;
    if (error.message?.includes("CSRF_TOKEN_MISSING")) return 403;
    if (error.message?.includes("RATE_LIMIT_EXCEEDED")) return 429;
    return 500;
  }

  /**
   * Create error response
   */
  private createErrorResponse(
    error: Error & { message?: string },
    _context?: HealthcareRequestContext,
  ) {
    const baseResponse = {
      error: true,
      message: this.config.errorHandling.enableDetailedErrors
        ? error.message
        : "An error occurred",
      requestId: context?.requestId,
      timestamp: new Date().toISOString(),
    };

    // Add healthcare-specific error context
    if (context?.workflowContext?.emergencyFlag) {
      return {
        ...baseResponse,
        emergencyContext: true,
        escalationRequired: true,
      };
    }

    return baseResponse;
  }

  /**
   * Collect and report metrics
   */
  private collectAndReportMetrics(): void {
    const currentTime = Date.now();
    const metricsToReport: RequestMetrics[] = [];

    // Collect completed requests (older than 1 minute)
    for (const [requestId, metrics] of this.requestMetrics.entries()) {
      if (metrics.endTime && currentTime - metrics.endTime > 60000) {
        metricsToReport.push(metrics);
        this.requestMetrics.delete(requestId);
      }
    }

    if (metricsToReport.length > 0) {
      console.log("📊 [HealthcareMiddlewareService] Metrics collected:", {
        count: metricsToReport.length,
        averageDuration:
          metricsToReport.reduce((sum, _m) => sum + (m.duration || 0), 0) /
          metricsToReport.length,
        errorRate:
          metricsToReport.filter((m) => m.errorOccurred).length /
          metricsToReport.length,
        timestamp: new Date().toISOString(),
      });

      // TODO: Send metrics to observability platform
    }
  }

  /**
   * Get service statistics
   */
  getStatistics(): {
    isInitialized: boolean;
    activeRequests: number;
    config: MiddlewareConfig;
  } {
    return {
      isInitialized: this.isInitialized,
      activeRequests: this.requestMetrics.size,
      config: this.config,
    };
  }

  /**
   * Destroy service and clean up resources
   */
  destroy(): void {
    this.requestMetrics.clear();
    this.isInitialized = false;

    console.log(
      "🔄 [HealthcareMiddlewareService] Healthcare middleware service destroyed and resources cleaned up",
    );
  }
}

// ============================================================================
// DEFAULT SERVICE INSTANCE
// ============================================================================

/**
 * Default healthcare middleware service instance
 */
export const healthcareMiddlewareService = new HealthcareMiddlewareService({
  enabled: true,
  environment: (process.env.NODE_ENV as any) || "development",

  healthcareSettings: {
    enableWorkflowInjection: true,
    enableEmergencyDetection: true,
    enablePatientSafetyChecks: true,
    enableComplianceValidation: true,
  },

  performanceMonitoring: {
    enabled: true,
    slowRequestThreshold: 3000, // 3 seconds for healthcare
    metricsInterval: 30000, // 30 seconds
    enableWebVitals: true,
  },

  rateLimiting: {
    enabled: true,
    enableHealthcareClassification: true,
    bypassEmergencyRequests: true,
  },

  errorHandling: {
    enableDetailedErrors: process.env.NODE_ENV === "development",
    enableErrorTracking: true,
    enablePatientSafetyAlerts: true,
    enableNotifications: true,
  },

  security: {
    enableSecurityHeaders: true,
    enableCors: true,
    enableCsrfProtection: true,
    enableInputValidation: true,
    enablePiiDetection: true,
    enableDataMinimization: true,
    enableConsentValidation: true,
  },

  logging: {
    enableRequestLogging: true,
    enableResponseLogging: false, // Sensitive data consideration
    enableAuditLogging: true,
    logLevel: (process.env.LOG_LEVEL as any) || "info",
    enablePiiRedaction: true,
    logRetentionDays: 90,
  },
});

/**
 * Export types for external use
 * Note: All types are already exported above with their definitions
 * No need to re-export them here to avoid TS2484 conflicts
 */
