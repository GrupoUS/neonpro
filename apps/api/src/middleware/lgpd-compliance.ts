/**
 * LGPD Compliance Middleware
 * T030 - Implement LGPD compliance middleware for healthcare platform
 *
 * Implements Brazilian LGPD (Lei Geral de Proteção de Dados) compliance
 * for healthcare data processing with automated privacy protection
 */

import { Context, Next } from "hono";

// ============================================================================
// LGPD Data Categories & Classification
// ============================================================================

export enum LGPDDataCategory {
  PERSONAL = "personal", // CPF, nome, endereço
  SENSITIVE = "sensitive", // Dados de saúde, biométricos
  MEDICAL = "medical", // Prontuários, exames
  FINANCIAL = "financial", // Dados de pagamento
  BIOMETRIC = "biometric", // Impressões digitais, reconhecimento facial
  BEHAVIORAL = "behavioral", // Padrões de uso, preferências
  ANONYMOUS = "anonymous", // Dados anonimizados
}

export enum LGPDLegalBasis {
  CONSENT = "consent", // Consentimento (Art. 7, I)
  CONTRACT = "contract", // Execução de contrato (Art. 7, V)
  LEGAL_OBLIGATION = "legal_obligation", // Cumprimento de obrigação legal (Art. 7, II)
  VITAL_INTERESTS = "vital_interests", // Proteção da vida (Art. 7, IV)
  PUBLIC_INTEREST = "public_interest", // Execução de políticas públicas (Art. 7, III)
  LEGITIMATE_INTERESTS = "legitimate_interests", // Interesse legítimo (Art. 7, IX)
}

// ============================================================================
// LGPD Context & Metadata
// ============================================================================

export interface LGPDContext {
  // Data subject information
  dataSubjectId?: string;
  dataSubjectType:
    | "patient"
    | "healthcare_professional"
    | "employee"
    | "visitor";

  // Data processing details
  processingPurpose: string[];
  legalBasis: LGPDLegalBasis;
  dataCategories: LGPDDataCategory[];

  // Consent information
  consentId?: string;
  consentObtained: boolean;
  consentDate?: string;
  consentVersion?: string;

  // Processing metadata
  dataController: string;
  dataProcessor?: string;
  retentionPeriod: number; // Days

  // Healthcare specific
  healthcareContext?: {
    clinicId?: string;
    patientId?: string;
    professionalId?: string;
    medicalPurpose?: boolean;
    emergencyAccess?: boolean;
  };

  // Audit information
  auditRequired: boolean;
  auditLevel: "minimal" | "standard" | "detailed";
}

// ============================================================================
// LGPD Request Enrichment
// ============================================================================

export interface LGPDEnrichedRequest {
  lgpdContext: LGPDContext;
  personalDataDetected: boolean;
  sensitiveDataDetected: boolean;
  medicalDataDetected: boolean;
  consentRequired: boolean;
  auditRequired: boolean;
  dataMinimizationApplied: boolean;
  anonymizationRequired: boolean;
}

// ============================================================================
// LGPD Data Patterns & Detection
// ============================================================================

const PERSONAL_DATA_PATTERNS = {
  // Brazilian CPF pattern (11 digits)
  cpf: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,

  // Brazilian phone numbers
  phone: /\b(?:\+55\s?)?\(?[1-9]{2}\)?\s?9?\d{4}-?\d{4}\b/g,

  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,

  // Brazilian postal code (CEP)
  cep: /\b\d{5}-?\d{3}\b/g,

  // Brazilian RG (identity card)
  rg: /\b\d{1,2}\.?\d{3}\.?\d{3}-?[0-9X]\b/g,

  // Credit card numbers (basic pattern)
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
};

const MEDICAL_DATA_PATTERNS = {
  // Medical record numbers
  medicalRecord: /\b(?:prontuário|paciente|registro)[\s:]*\d+\b/gi,

  // CID-10 codes
  cid10: /\b[A-Z]\d{2}\.?\d?\b/g,

  // Common medical terms indicating health data
  medicalTerms:
    /\b(?:diagnóstico|sintoma|tratamento|medicamento|alergia|cirurgia|exame|doença|patologia|CRM)\b/gi,

  // Blood type
  bloodType: /\b(?:A|B|AB|O)[+-]?\b/g,
};

// ============================================================================
// LGPD Compliance Middleware Implementation
// ============================================================================

export interface LGPDMiddlewareConfig {
  // Compliance enforcement
  enforcement: {
    blockNonCompliantRequests: boolean;
    warnOnViolations: boolean;
    auditAllRequests: boolean;
    anonymizeLogging: boolean;
  };

  // Data detection
  dataDetection: {
    enablePersonalDataDetection: boolean;
    enableMedicalDataDetection: boolean;
    enableSensitiveDataDetection: boolean;
    enableRealTimeScanning: boolean;
  };

  // Consent management
  consentManagement: {
    requireExplicitConsent: boolean;
    validateConsentScope: boolean;
    trackConsentWithdrawal: boolean;
    consentGracePeriod: number; // Days
  };

  // Data minimization
  dataMinimization: {
    enableAutomaticMinimization: boolean;
    removeUnnecessaryFields: boolean;
    pseudonymizeIdentifiers: boolean;
    limitDataCollection: boolean;
  };

  // Audit and logging
  audit: {
    logAllDataAccess: boolean;
    logConsentDecisions: boolean;
    logDataProcessingActivities: boolean;
    retentionPeriod: number; // Days
  };

  // Healthcare specific
  healthcare: {
    enableEmergencyOverride: boolean;
    emergencyAccessAudit: boolean;
    medicalDataClassification: boolean;
    patientDataIsolation: boolean;
  };
}

export const defaultLGPDConfig: LGPDMiddlewareConfig = {
  enforcement: {
    blockNonCompliantRequests: true,
    warnOnViolations: true,
    auditAllRequests: true,
    anonymizeLogging: true,
  },
  dataDetection: {
    enablePersonalDataDetection: true,
    enableMedicalDataDetection: true,
    enableSensitiveDataDetection: true,
    enableRealTimeScanning: true,
  },
  consentManagement: {
    requireExplicitConsent: true,
    validateConsentScope: true,
    trackConsentWithdrawal: true,
    consentGracePeriod: 30,
  },
  dataMinimization: {
    enableAutomaticMinimization: true,
    removeUnnecessaryFields: true,
    pseudonymizeIdentifiers: true,
    limitDataCollection: true,
  },
  audit: {
    logAllDataAccess: true,
    logConsentDecisions: true,
    logDataProcessingActivities: true,
    retentionPeriod: 1825, // 5 years for healthcare
  },
  healthcare: {
    enableEmergencyOverride: true,
    emergencyAccessAudit: true,
    medicalDataClassification: true,
    patientDataIsolation: true,
  },
};

// ============================================================================
// LGPD Data Detection Engine
// ============================================================================

export class LGPDDataDetector {
  /**
   * Detect personal data in request payload
   */
  static detectPersonalData(data: any): {
    detected: boolean;
    categories: LGPDDataCategory[];
    patterns: string[];
    sensitiveFields: string[];
  } {
    const dataString = JSON.stringify(data);
    const categories: LGPDDataCategory[] = [];
    const patterns: string[] = [];
    const sensitiveFields: string[] = [];

    // Check for personal data patterns
    Object.entries(PERSONAL_DATA_PATTERNS).forEach(([pattern, regex]) => {
      if (regex.test(dataString)) {
        categories.push(LGPDDataCategory.PERSONAL);
        patterns.push(pattern);
      }
    });

    // Check for medical data patterns
    Object.entries(MEDICAL_DATA_PATTERNS).forEach(([pattern, regex]) => {
      if (regex.test(dataString)) {
        categories.push(LGPDDataCategory.MEDICAL);
        categories.push(LGPDDataCategory.SENSITIVE);
        patterns.push(pattern);
      }
    });

    // Check for sensitive field names
    const sensitiveFieldNames = [
      "cpf",
      "rg",
      "password",
      "email",
      "phone",
      "address",
      "medical_record",
      "diagnosis",
      "treatment",
      "medication",
      "allergy",
      "biometric",
      "financial_data",
      "credit_card",
    ];

    this.findSensitiveFields(data, sensitiveFieldNames, "", sensitiveFields);

    return {
      detected: categories.length > 0 || sensitiveFields.length > 0,
      categories: [...new Set(categories)],
      patterns,
      sensitiveFields,
    };
  }

  /**
   * Recursively find sensitive fields in nested objects
   */
  private static findSensitiveFields(
    obj: any,
    sensitiveNames: string[],
    path: string,
    found: string[],
  ): void {
    if (typeof obj !== "object" || obj === null) return;

    Object.keys(obj).forEach((key) => {
      const fullPath = path ? `${path}.${key}` : key;

      // Check if field name indicates sensitive data
      if (
        sensitiveNames.some((name) =>
          key.toLowerCase().includes(name.toLowerCase()),
        )
      ) {
        found.push(fullPath);
      }

      // Recurse into nested objects
      if (typeof obj[key] === "object" && obj[key] !== null) {
        this.findSensitiveFields(obj[key], sensitiveNames, fullPath, found);
      }
    });
  }

  /**
   * Classify data sensitivity level
   */
  static classifyDataSensitivity(
    categories: LGPDDataCategory[],
  ): "low" | "medium" | "high" | "critical" {
    if (
      categories.includes(LGPDDataCategory.MEDICAL) ||
      categories.includes(LGPDDataCategory.BIOMETRIC)
    ) {
      return "critical";
    }

    if (
      categories.includes(LGPDDataCategory.SENSITIVE) ||
      categories.includes(LGPDDataCategory.FINANCIAL)
    ) {
      return "high";
    }

    if (categories.includes(LGPDDataCategory.PERSONAL)) {
      return "medium";
    }

    return "low";
  }
}

// ============================================================================
// LGPD Consent Manager
// ============================================================================

export class LGPDConsentManager {
  /**
   * Validate consent for data processing
   */
  static async validateConsent(
    dataSubjectId: string,
    processingPurpose: string[],
    dataCategories: LGPDDataCategory[],
  ): Promise<{
    valid: boolean;
    consentId?: string;
    consentDate?: string;
    scope: string[];
    violations: string[];
  }> {
    // This would integrate with your consent management system
    // For now, return a mock implementation
    const violations: string[] = [];

    // Check if consent is required for the data categories
    const requiresConsent = dataCategories.some((category) =>
      [
        LGPDDataCategory.PERSONAL,
        LGPDDataCategory.SENSITIVE,
        LGPDDataCategory.MEDICAL,
      ].includes(category),
    );

    if (requiresConsent) {
      // Mock consent validation - replace with actual consent DB lookup
      const consentRecord = await this.lookupConsent(dataSubjectId);

      if (!consentRecord) {
        violations.push("No consent found for data subject");
        return { valid: false, scope: [], violations };
      }

      // Validate consent scope covers the processing purposes
      const uncoveredPurposes = processingPurpose.filter(
        (purpose) => !consentRecord.scope.includes(purpose),
      );

      if (uncoveredPurposes.length > 0) {
        violations.push(
          `Consent does not cover purposes: ${uncoveredPurposes.join(", ")}`,
        );
      }

      // Check consent is not withdrawn
      if (consentRecord.withdrawn) {
        violations.push("Consent has been withdrawn");
      }

      // Check consent is not expired
      if (
        consentRecord.expiresAt &&
        new Date() > new Date(consentRecord.expiresAt)
      ) {
        violations.push("Consent has expired");
      }

      return {
        valid: violations.length === 0,
        consentId: consentRecord.id,
        consentDate: consentRecord.obtainedAt,
        scope: consentRecord.scope,
        violations,
      };
    }

    return { valid: true, scope: [], violations: [] };
  }

  /**
   * Mock consent lookup - replace with actual database implementation
   */
  private static async lookupConsent(dataSubjectId: string): Promise<{
    id: string;
    scope: string[];
    obtainedAt: string;
    expiresAt?: string;
    withdrawn: boolean;
  } | null> {
    // Mock implementation - replace with actual database lookup
    return {
      id: `consent_${dataSubjectId}`,
      scope: [
        "healthcare_treatment",
        "appointment_management",
        "communication",
      ],
      obtainedAt: new Date().toISOString(),
      expiresAt: undefined,
      withdrawn: false,
    };
  }
}

// ============================================================================
// LGPD Data Minimizer
// ============================================================================

export class LGPDDataMinimizer {
  /**
   * Apply data minimization to request/response data
   */
  static minimizeData(
    data: any,
    purpose: string[],
    sensitiveFields: string[],
  ): {
    minimizedData: any;
    removedFields: string[];
    pseudonymizedFields: string[];
  } {
    const minimizedData = JSON.parse(JSON.stringify(data));
    const removedFields: string[] = [];
    const pseudonymizedFields: string[] = [];

    // Define fields necessary for each purpose
    const purposeFieldMap: Record<string, string[]> = {
      healthcare_treatment: [
        "name",
        "cpf",
        "birth_date",
        "medical_record",
        "allergies",
        "medications",
      ],
      appointment_management: ["name", "phone", "email", "preferred_time"],
      communication: ["name", "email", "phone", "communication_preferences"],
      billing: ["name", "cpf", "address", "payment_method"],
      emergency_contact: ["name", "phone", "emergency_contact_info"],
    };

    // Get all allowed fields for the given purposes
    const allowedFields = new Set<string>();
    purpose.forEach((p) => {
      purposeFieldMap[p]?.forEach((field) => allowedFields.add(field));
    });

    // Remove unnecessary fields and pseudonymize sensitive data
    this.processDataMinimization(
      minimizedData,
      "",
      allowedFields,
      sensitiveFields,
      removedFields,
      pseudonymizedFields,
    );

    return {
      minimizedData,
      removedFields,
      pseudonymizedFields,
    };
  }

  /**
   * Recursively process data minimization
   */
  private static processDataMinimization(
    obj: any,
    path: string,
    allowedFields: Set<string>,
    sensitiveFields: string[],
    removedFields: string[],
    pseudonymizedFields: string[],
  ): void {
    if (typeof obj !== "object" || obj === null) return;

    Object.keys(obj).forEach((key) => {
      const fullPath = path ? `${path}.${key}` : key;

      // Check if field should be removed (not in allowed fields)
      if (!allowedFields.has(key) && !allowedFields.has(fullPath)) {
        delete obj[key];
        removedFields.push(fullPath);
        return;
      }

      // Check if field should be pseudonymized
      if (sensitiveFields.includes(fullPath)) {
        if (typeof obj[key] === "string") {
          obj[key] = this.pseudonymize(obj[key]);
          pseudonymizedFields.push(fullPath);
        }
      }

      // Recurse into nested objects
      if (typeof obj[key] === "object" && obj[key] !== null) {
        this.processDataMinimization(
          obj[key],
          fullPath,
          allowedFields,
          sensitiveFields,
          removedFields,
          pseudonymizedFields,
        );
      }
    });
  }

  /**
   * Pseudonymize sensitive data
   */
  private static pseudonymize(value: string): string {
    // Simple pseudonymization - in production, use proper crypto libraries
    if (value.length <= 4) return "***";

    const start = value.substring(0, 2);
    const end = value.substring(value.length - 2);
    const middle = "*".repeat(Math.max(1, value.length - 4));

    return `${start}${middle}${end}`;
  }
}

// ============================================================================
// LGPD Audit Logger
// ============================================================================

export class LGPDAuditLogger {
  /**
   * Log LGPD compliance event
   */
  static async logComplianceEvent(
    eventType:
      | "data_access"
      | "consent_validation"
      | "data_processing"
      | "violation"
      | "emergency_access",
    context: LGPDContext,
    details: {
      userId?: string;
      sessionId?: string;
      ipAddress?: string;
      userAgent?: string;
      endpoint?: string;
      dataCategories?: LGPDDataCategory[];
      action?: string;
      result?: "allowed" | "blocked" | "warning";
      violations?: string[];
      emergencyJustification?: string;
    },
  ): Promise<void> {
    const auditEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      eventType,
      context: {
        ...context,
        // Anonymize sensitive identifiers for audit logs
        dataSubjectId: context.dataSubjectId
          ? this.hashId(context.dataSubjectId)
          : undefined,
      },
      details: {
        ...details,
        // Remove sensitive data from audit logs
        userAgent: details.userAgent
          ? this.sanitizeUserAgent(details.userAgent)
          : undefined,
      },
      lgpdCompliance: {
        auditRequired: true,
        retentionPeriod: 1825, // 5 years
        dataClassification: "internal",
        legalBasis: LGPDLegalBasis.LEGAL_OBLIGATION,
      },
    };

    // In production, this would write to your audit log system
    console.log("[LGPD Audit]", JSON.stringify(auditEntry, null, 2));
  }

  /**
   * Hash identifier for audit logs
   */
  private static hashId(id: string): string {
    // Simple hash for demo - use proper crypto in production
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `hashed_${Math.abs(hash).toString(16)}`;
  }

  /**
   * Sanitize user agent for audit logs
   */
  private static sanitizeUserAgent(userAgent: string): string {
    // Remove potentially identifying information
    return userAgent
      .replace(/\d+\.\d+\.\d+/g, "x.x.x") // Version numbers
      .replace(/\([^)]+\)/g, "(...)"); // Detailed OS/browser info
  }
}

// ============================================================================
// Main LGPD Compliance Middleware
// ============================================================================

export function lgpdComplianceMiddleware(
  config: Partial<LGPDMiddlewareConfig> = {},
) {
  const mergedConfig = { ...defaultLGPDConfig, ...config };

  return async (c: Context, next: Next) => {
    const startTime = Date.now();

    try {
      // Extract request information
      const method = c.req.method;
      const url = c.req.url;
      const body = method !== "GET" ? await c.req.json().catch(() => ({})) : {};
      const query = Object.fromEntries(new URL(url).searchParams);
      const headers = Object.fromEntries(c.req.headers.entries());

      // Build LGPD context
      const lgpdContext = await buildLGPDContext(c, body, query);

      // Detect personal and sensitive data
      const requestData = { ...body, ...query };
      const dataDetection = LGPDDataDetector.detectPersonalData(requestData);

      // Validate consent if required
      const consentValidation =
        lgpdContext.dataSubjectId && dataDetection.detected
          ? await LGPDConsentManager.validateConsent(
              lgpdContext.dataSubjectId,
              lgpdContext.processingPurpose,
              dataDetection.categories,
            )
          : { valid: true, scope: [], violations: [] };

      // Check for emergency access
      const isEmergencyAccess =
        lgpdContext.healthcareContext?.emergencyAccess || false;
      const emergencyOverrideAllowed =
        mergedConfig.healthcare.enableEmergencyOverride && isEmergencyAccess;

      // Apply data minimization
      let minimizationResult = {
        minimizedData: requestData,
        removedFields: [],
        pseudonymizedFields: [],
      };
      if (
        mergedConfig.dataMinimization.enableAutomaticMinimization &&
        dataDetection.detected
      ) {
        minimizationResult = LGPDDataMinimizer.minimizeData(
          requestData,
          lgpdContext.processingPurpose,
          dataDetection.sensitiveFields,
        );
      }

      // Determine if request should be blocked
      const shouldBlock =
        mergedConfig.enforcement.blockNonCompliantRequests &&
        !consentValidation.valid &&
        !emergencyOverrideAllowed &&
        dataDetection.detected;

      // Create enriched request context
      const lgpdEnrichedRequest: LGPDEnrichedRequest = {
        lgpdContext,
        personalDataDetected: dataDetection.categories.includes(
          LGPDDataCategory.PERSONAL,
        ),
        sensitiveDataDetected: dataDetection.categories.includes(
          LGPDDataCategory.SENSITIVE,
        ),
        medicalDataDetected: dataDetection.categories.includes(
          LGPDDataCategory.MEDICAL,
        ),
        consentRequired: dataDetection.detected,
        auditRequired: lgpdContext.auditRequired || dataDetection.detected,
        dataMinimizationApplied: minimizationResult.removedFields.length > 0,
        anonymizationRequired: dataDetection.categories.includes(
          LGPDDataCategory.MEDICAL,
        ),
      };

      // Add LGPD context to request
      c.set("lgpdContext", lgpdEnrichedRequest);

      // Log compliance event
      if (mergedConfig.audit.logAllDataAccess || dataDetection.detected) {
        await LGPDAuditLogger.logComplianceEvent(
          dataDetection.detected ? "data_access" : "data_processing",
          lgpdContext,
          {
            userId: headers["x-user-id"] || "anonymous",
            sessionId: headers["x-session-id"],
            ipAddress:
              c.req.header("x-forwarded-for") || c.req.header("x-real-ip"),
            userAgent: headers["user-agent"],
            endpoint: `${method} ${new URL(url).pathname}`,
            dataCategories: dataDetection.categories,
            action: method,
            result: shouldBlock
              ? "blocked"
              : consentValidation.violations.length > 0
                ? "warning"
                : "allowed",
            violations: consentValidation.violations,
            emergencyJustification: isEmergencyAccess
              ? "Emergency medical access"
              : undefined,
          },
        );
      }

      // Block request if non-compliant
      if (shouldBlock) {
        return c.json(
          {
            error: "LGPD_COMPLIANCE_VIOLATION",
            message: "Request blocked due to LGPD compliance violations",
            violations: consentValidation.violations,
            dataSubjectRights: {
              access: "You can request access to your personal data",
              rectification: "You can request correction of your personal data",
              deletion: "You can request deletion of your personal data",
              portability: "You can request a copy of your personal data",
              objection:
                "You can object to the processing of your personal data",
            },
            contact: {
              dpo: "dpo@neonpro.com.br",
              phone: "+55 11 9999-9999",
              address: "Data Protection Officer, NeonPro Healthcare Platform",
            },
          },
          403,
        );
      }

      // Add compliance headers
      c.header("X-LGPD-Compliant", "true");
      c.header("X-LGPD-Data-Detected", dataDetection.detected.toString());
      c.header(
        "X-LGPD-Consent-Required",
        lgpdEnrichedRequest.consentRequired.toString(),
      );
      c.header(
        "X-LGPD-Processing-Purpose",
        lgpdContext.processingPurpose.join(","),
      );
      c.header("X-LGPD-Legal-Basis", lgpdContext.legalBasis);

      if (emergencyOverrideAllowed) {
        c.header("X-LGPD-Emergency-Access", "true");
      }

      // Proceed with request
      await next();

      // Log processing completion
      const _processingTime = Date.now() - startTime;

      if (lgpdEnrichedRequest.auditRequired) {
        await LGPDAuditLogger.logComplianceEvent(
          "data_processing",
          lgpdContext,
          {
            userId: headers["x-user-id"] || "anonymous",
            sessionId: headers["x-session-id"],
            endpoint: `${method} ${new URL(url).pathname}`,
            action: "processing_completed",
            result: "allowed",
            violations: [],
          },
        );
      }
    } catch (error) {
      // Log compliance error
      await LGPDAuditLogger.logComplianceEvent(
        "violation",
        {
          dataSubjectType: "unknown",
          processingPurpose: ["error_handling"],
          legalBasis: LGPDLegalBasis.LEGITIMATE_INTERESTS,
          dataCategories: [],
          consentObtained: false,
          dataController: "neonpro",
          retentionPeriod: 30,
          auditRequired: true,
          auditLevel: "detailed",
        },
        {
          endpoint: c.req.url,
          action: "middleware_error",
          result: "blocked",
          violations: [
            error instanceof Error ? error.message : "Unknown error",
          ],
        },
      );

      console.error("[LGPD Middleware Error]", error);

      // Don't block request on middleware errors unless configured to do so
      if (mergedConfig.enforcement.blockNonCompliantRequests) {
        return c.json(
          {
            error: "LGPD_MIDDLEWARE_ERROR",
            message: "LGPD compliance check failed",
          },
          500,
        );
      }

      await next();
    }
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build LGPD context from request
 */
async function buildLGPDContext(
  c: Context,
  body: any,
  query: any,
): Promise<LGPDContext> {
  const headers = Object.fromEntries(c.req.headers.entries());
  const url = new URL(c.req.url);

  // Extract healthcare context
  const patientId =
    body.patientId || query.patientId || headers["x-patient-id"];
  const clinicId = body.clinicId || query.clinicId || headers["x-clinic-id"];
  const professionalId = headers["x-professional-id"] || headers["x-user-id"];

  // Determine data subject type
  let dataSubjectType:
    | "patient"
    | "healthcare_professional"
    | "employee"
    | "visitor" = "visitor";
  if (patientId) dataSubjectType = "patient";
  else if (professionalId) dataSubjectType = "healthcare_professional";

  // Determine processing purpose based on endpoint
  const processingPurpose = determineProcessingPurpose(
    url.pathname,
    c.req.method,
  );

  // Determine legal basis
  const legalBasis = determineLegalBasis(processingPurpose, dataSubjectType);

  // Determine data categories
  const dataCategories = determineDataCategories(url.pathname, body, query);

  return {
    dataSubjectId: patientId || professionalId,
    dataSubjectType,
    processingPurpose,
    legalBasis,
    dataCategories,
    consentObtained: false, // Will be validated separately
    dataController: "neonpro",
    retentionPeriod: getRetentionPeriod(dataCategories),
    healthcareContext: {
      clinicId,
      patientId,
      professionalId,
      medicalPurpose: processingPurpose.includes("healthcare_treatment"),
      emergencyAccess: headers["x-emergency-access"] === "true",
    },
    auditRequired: true,
    auditLevel: dataCategories.includes(LGPDDataCategory.MEDICAL)
      ? "detailed"
      : "standard",
  };
}

/**
 * Determine processing purpose from endpoint
 */
function determineProcessingPurpose(
  pathname: string,
  method: string,
): string[] {
  const purposes: string[] = [];

  if (pathname.includes("/patients")) {
    purposes.push("healthcare_treatment");
    if (method === "POST" || method === "PUT") {
      purposes.push("medical_record_management");
    }
  }

  if (pathname.includes("/appointments")) {
    purposes.push("appointment_management");
  }

  if (pathname.includes("/billing") || pathname.includes("/payment")) {
    purposes.push("billing");
  }

  if (
    pathname.includes("/communication") ||
    pathname.includes("/notification")
  ) {
    purposes.push("communication");
  }

  if (pathname.includes("/emergency")) {
    purposes.push("emergency_care");
  }

  // Default purpose
  if (purposes.length === 0) {
    purposes.push("platform_operation");
  }

  return purposes;
}

/**
 * Determine legal basis for processing
 */
function determineLegalBasis(
  purposes: string[],
  _dataSubjectType: string,
): LGPDLegalBasis {
  // Emergency care - vital interests
  if (purposes.includes("emergency_care")) {
    return LGPDLegalBasis.VITAL_INTERESTS;
  }

  // Healthcare treatment - consent or vital interests
  if (purposes.includes("healthcare_treatment")) {
    return LGPDLegalBasis.CONSENT;
  }

  // Legal obligations for healthcare compliance
  if (purposes.includes("medical_record_management")) {
    return LGPDLegalBasis.LEGAL_OBLIGATION;
  }

  // Contract execution for billing
  if (purposes.includes("billing")) {
    return LGPDLegalBasis.CONTRACT;
  }

  // Default to consent
  return LGPDLegalBasis.CONSENT;
}

/**
 * Determine data categories from endpoint and data
 */
function determineDataCategories(
  pathname: string,
  body: any,
  query: any,
): LGPDDataCategory[] {
  const categories: LGPDDataCategory[] = [];

  // Medical endpoints always involve medical data
  if (pathname.includes("/patients") || pathname.includes("/medical")) {
    categories.push(LGPDDataCategory.MEDICAL, LGPDDataCategory.SENSITIVE);
  }

  // Financial endpoints
  if (pathname.includes("/billing") || pathname.includes("/payment")) {
    categories.push(LGPDDataCategory.FINANCIAL);
  }

  // Check for personal data in request
  const allData = { ...body, ...query };
  if (allData.cpf || allData.email || allData.phone) {
    categories.push(LGPDDataCategory.PERSONAL);
  }

  // Check for biometric data
  if (allData.biometric || allData.fingerprint || allData.facial_recognition) {
    categories.push(LGPDDataCategory.BIOMETRIC, LGPDDataCategory.SENSITIVE);
  }

  return [...new Set(categories)];
}

/**
 * Get retention period based on data categories
 */
function getRetentionPeriod(categories: LGPDDataCategory[]): number {
  // Medical data - 20 years (Brazilian healthcare requirement)
  if (categories.includes(LGPDDataCategory.MEDICAL)) {
    return 7300; // 20 years
  }

  // Financial data - 5 years
  if (categories.includes(LGPDDataCategory.FINANCIAL)) {
    return 1825; // 5 years
  }

  // Personal data - 2 years default
  if (categories.includes(LGPDDataCategory.PERSONAL)) {
    return 730; // 2 years
  }

  // Default retention
  return 365; // 1 year
}

// ============================================================================
// Export Middleware and Utilities
// ============================================================================

export { lgpdComplianceMiddleware as default };
