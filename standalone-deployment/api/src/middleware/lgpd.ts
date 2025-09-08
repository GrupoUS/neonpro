/**
 * ⚖️ LGPD Middleware - NeonPro API
 * ================================
 *
 * Middleware para compliance LGPD (Lei Geral de Proteção de Dados)
 * com validação de consentimento, rastreamento e proteção de dados.
 */

import type { Context, MiddlewareHandler } from "hono";
import { createRouteRegex } from "../lib/regex-constants";
import { createError } from "./error-handler";

// LGPD consent types
export enum ConsentType {
  DATA_PROCESSING = "data_processing", // Essential data processing
  MARKETING = "marketing", // Marketing communications
  ANALYTICS = "analytics", // Usage analytics
  THIRD_PARTY_SHARING = "third_party_sharing", // Data sharing with partners
  RESEARCH = "research", // Medical/academic research
  PHOTOS = "photos", // Photo/video for procedures
  BIOMETRIC = "biometric", // Biometric data collection
}

// Data categories under LGPD
export enum DataCategory {
  IDENTIFYING = "identifying", // Name, documents, contact
  SENSITIVE = "sensitive", // Health data, biometric
  BEHAVIORAL = "behavioral", // Usage patterns, preferences
  FINANCIAL = "financial", // Payment data, billing
  BIOMETRIC = "biometric", // Fingerprints, facial recognition
  GENETIC = "genetic", // Genetic information
  HEALTH = "health", // Medical records, procedures
  LOCATION = "location", // Geographic location data
}

// LGPD lawful basis for processing (Article 7)
export enum LawfulBasis {
  CONSENT = "consent", // Article 7, I
  CONTRACT = "contract", // Article 7, II
  LEGAL_OBLIGATION = "legal_obligation", // Article 7, III
  VITAL_INTERESTS = "vital_interests", // Article 7, IV
  PUBLIC_TASK = "public_task", // Article 7, V
  LEGITIMATE_INTEREST = "legitimate_interest", // Article 7, VI
}

// Route-specific LGPD configuration
interface LGPDRouteConfig {
  requiresConsent: ConsentType[];
  dataCategories: DataCategory[];
  lawfulBasis: LawfulBasis[];
  retentionPeriod?: number; // days
  allowAnonymous?: boolean;
  requireExplicitConsent?: boolean;
  description: string;
}

// LGPD configuration per endpoint
const LGPD_ROUTE_CONFIG: Record<string, LGPDRouteConfig> = {
  // Patient data endpoints
  "POST /api/v1/patients": {
    requiresConsent: [ConsentType.DATA_PROCESSING],
    dataCategories: [DataCategory.IDENTIFYING, DataCategory.HEALTH],
    lawfulBasis: [LawfulBasis.CONSENT, LawfulBasis.CONTRACT],
    retentionPeriod: 3650, // 10 years for medical records
    requireExplicitConsent: true,
    description: "Patient registration with personal and health data",
  },

  "GET /api/v1/patients": {
    requiresConsent: [ConsentType.DATA_PROCESSING],
    dataCategories: [DataCategory.IDENTIFYING, DataCategory.HEALTH],
    lawfulBasis: [LawfulBasis.LEGITIMATE_INTEREST],
    description: "Patient data access for healthcare providers",
  },

  "PUT /api/v1/patients/:id": {
    requiresConsent: [ConsentType.DATA_PROCESSING],
    dataCategories: [DataCategory.IDENTIFYING, DataCategory.HEALTH],
    lawfulBasis: [LawfulBasis.CONSENT, LawfulBasis.CONTRACT],
    description: "Patient data modification",
  },

  // Appointment endpoints
  "POST /api/v1/appointments": {
    requiresConsent: [ConsentType.DATA_PROCESSING],
    dataCategories: [DataCategory.HEALTH, DataCategory.IDENTIFYING],
    lawfulBasis: [LawfulBasis.CONTRACT],
    description: "Appointment booking with health data",
  },

  // Photo/video consent for procedures
  "POST /api/v1/appointments/:id/photos": {
    requiresConsent: [ConsentType.PHOTOS],
    dataCategories: [DataCategory.BIOMETRIC, DataCategory.HEALTH],
    lawfulBasis: [LawfulBasis.CONSENT],
    requireExplicitConsent: true,
    description: "Photo/video documentation of procedures",
  },

  // Analytics endpoints
  "GET /api/v1/analytics": {
    requiresConsent: [ConsentType.ANALYTICS],
    dataCategories: [DataCategory.BEHAVIORAL],
    lawfulBasis: [LawfulBasis.LEGITIMATE_INTEREST],
    allowAnonymous: true,
    description: "Usage analytics for business intelligence",
  },

  // Marketing endpoints
  "POST /api/v1/marketing/campaigns": {
    requiresConsent: [ConsentType.MARKETING],
    dataCategories: [DataCategory.IDENTIFYING, DataCategory.BEHAVIORAL],
    lawfulBasis: [LawfulBasis.CONSENT],
    requireExplicitConsent: true,
    description: "Marketing campaign targeting",
  },

  // Data export (LGPD Article 15 - Right to portability)
  "GET /api/v1/compliance/export": {
    requiresConsent: [],
    dataCategories: [
      DataCategory.IDENTIFYING,
      DataCategory.HEALTH,
      DataCategory.BEHAVIORAL,
    ],
    lawfulBasis: [LawfulBasis.LEGAL_OBLIGATION],
    description: "Personal data export for data portability",
  },
};

// Mock consent store (production should use database)
class ConsentStore {
  private readonly consents = new Map<
    string,
    Map<
      ConsentType,
      {
        granted: boolean;
        timestamp: string;
        version: string;
        ipAddress?: string;
        userAgent?: string;
      }
    >
  >();

  getConsent(patientId: string, consentType: ConsentType) {
    return this.consents.get(patientId)?.get(consentType);
  }

  hasValidConsent(patientId: string, consentTypes: ConsentType[]): boolean {
    const patientConsents = this.consents.get(patientId);
    if (!patientConsents) {
      return false;
    }

    return consentTypes.every((type) => {
      const consent = patientConsents.get(type);
      return consent?.granted === true;
    });
  }

  grantConsent(
    patientId: string,
    consentType: ConsentType,
    version = "1.0",
    ipAddress?: string,
    userAgent?: string,
  ) {
    if (!this.consents.has(patientId)) {
      this.consents.set(patientId, new Map());
    }

    this.consents.get(patientId)?.set(consentType, {
      granted: true,
      timestamp: new Date().toISOString(),
      version,
      ipAddress,
      userAgent,
    });
  }

  revokeConsent(patientId: string, consentType: ConsentType) {
    const patientConsents = this.consents.get(patientId);
    if (patientConsents) {
      patientConsents.set(consentType, {
        granted: false,
        timestamp: new Date().toISOString(),
        version: "1.0",
      });
    }
  }

  getAllConsents(patientId: string) {
    return this.consents.get(patientId) || new Map();
  }
}

// Global consent store
const consentStore = new ConsentStore();

// Initialize some mock consents for development
consentStore.grantConsent("pat_123", ConsentType.DATA_PROCESSING, "1.0");
consentStore.grantConsent("pat_123", ConsentType.MARKETING, "1.0");
consentStore.grantConsent("pat_456", ConsentType.DATA_PROCESSING, "1.0");

/**
 * Extract patient ID from request
 */
const extractPatientId = async (c: Context): Promise<string | null> => {
  // Try to get from URL parameters
  const pathPatientId = c.req.param("id");
  if (pathPatientId) {
    return pathPatientId;
  }

  // Try to get from request body
  try {
    const body = await c.req.json();
    if (body?.patientId) {
      return body.patientId;
    }
    if (body?.id) {
      return body.id;
    }
  } catch {
    // Ignore JSON parsing errors
  }

  // Try to get from query parameters
  const queryPatientId = c.req.query("patientId");
  if (queryPatientId) {
    return queryPatientId;
  }

  // Try to get from authenticated user context
  const userId = c.get("userId");
  if (userId?.startsWith("pat_")) {
    return userId;
  }

  return null;
};

/**
 * Check if route matches LGPD configuration
 */
const getRouteConfig = (
  method: string,
  path: string,
): LGPDRouteConfig | null => {
  const operationKey = `${method} ${path}`;

  // Check exact match
  if (LGPD_ROUTE_CONFIG[operationKey]) {
    return LGPD_ROUTE_CONFIG[operationKey];
  }

  // Check pattern matches (for parameterized routes)
  for (const [pattern, config] of Object.entries(LGPD_ROUTE_CONFIG)) {
    const regex = createRouteRegex(pattern);
    if (regex.test(operationKey)) {
      return config;
    }
  }

  return null;
};

/**
 * Validate data retention compliance
 */
const validateDataRetention = (
  config: LGPDRouteConfig,
  _patientId: string,
): boolean => {
  if (!config.retentionPeriod) {
    return true;
  }

  // TODO: Implement actual retention period check
  // This would check when the data was first collected
  // and compare against the retention period

  return true; // For now, assume compliant
};

/**
 * Main LGPD compliance middleware
 */
export const lgpdMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const { method, path } = c.req;

    // Get route configuration
    const routeConfig = getRouteConfig(method, path);

    // Guard against missing routeConfig - LGPD compliance requires configuration
    if (!routeConfig) {
      throw createError.internal(
        `LGPD configuration missing for route ${method} ${path}. All routes must have LGPD configuration.`,
      );
    }

    // Extract patient ID for consent checking
    const patientId = await extractPatientId(c);

    // Check consent requirements (honor allowAnonymous)
    let consentValidated = false;
    const requiredConsents = routeConfig.requiresConsent || [];
    const allowsAnonymous = routeConfig.allowAnonymous === true;

    if (requiredConsents.length === 0) {
      consentValidated = true;
    } else if (patientId) {
      const hasValidConsent = consentStore.hasValidConsent(
        patientId,
        requiredConsents,
      );

      if (!hasValidConsent) {
        const missingConsents = requiredConsents.filter(
          (consent) => !consentStore.getConsent(patientId, consent)?.granted,
        );

        throw createError.lgpdCompliance(
          "Consentimento LGPD obrigatório não fornecido",
          {
            requiredConsents,
            missingConsents,
            patientId,
            article: "LGPD Art. 8º",
          },
        );
      }
      consentValidated = true;
    } else {
      if (!allowsAnonymous) {
        throw createError.lgpdCompliance(
          "Paciente não identificado para operação que exige consentimento",
          {
            requiredConsents,
            missingConsents: requiredConsents,
            patientId: null,
            article: "LGPD Art. 8º",
          },
        );
      }
      // Anonymous access allowed; proceed without consent
      consentValidated = false;
    }

    // Check data retention compliance
    if (patientId && !validateDataRetention(routeConfig, patientId)) {
      throw createError.lgpdCompliance(
        "Dados fora do período de retenção permitido",
        {
          retentionPeriod: routeConfig.retentionPeriod,
          article: "LGPD Art. 15º",
        },
      );
    }

    // Set LGPD compliance headers
    c.res.headers.set("X-LGPD-Compliant", "true");
    c.res.headers.set("X-LGPD-Basis", routeConfig.lawfulBasis.join(","));
    c.res.headers.set(
      "X-LGPD-Categories",
      routeConfig.dataCategories.join(","),
    );

    if (routeConfig.retentionPeriod) {
      c.res.headers.set(
        "X-LGPD-Retention-Days",
        routeConfig.retentionPeriod.toString(),
      );
    }

    // Additional LGPD headers
    c.res.headers.set(
      "X-LGPD-Explicit-Consent",
      String(Boolean(routeConfig?.requireExplicitConsent)),
    );
    c.res.headers.set(
      "X-LGPD-Allow-Anonymous",
      String(Boolean(routeConfig?.allowAnonymous)),
    );
    c.res.headers.set(
      "X-LGPD-Consent-Validated",
      String(consentValidated),
    );

    // Store LGPD context for audit
    c.set("lgpdContext", {
      config: routeConfig,
      patientId,
      consentValidated,
    });
    await next();
  };
};

/**
 * LGPD utilities for route handlers
 */
export const lgpdUtils = {
  // Check if user has specific consent
  hasConsent: (patientId: string, consentType: ConsentType): boolean => {
    const consent = consentStore.getConsent(patientId, consentType);
    return consent?.granted === true;
  },

  // Grant consent
  grantConsent: (
    patientId: string,
    consentType: ConsentType,
    version = "1.0",
    ipAddress?: string,
    userAgent?: string,
  ) => {
    consentStore.grantConsent(
      patientId,
      consentType,
      version,
      ipAddress,
      userAgent,
    );
  },

  // Revoke consent
  revokeConsent: (patientId: string, consentType: ConsentType) => {
    consentStore.revokeConsent(patientId, consentType);
  },

  // Get all consents for a patient
  getConsents: (patientId: string) => {
    return Object.fromEntries(consentStore.getAllConsents(patientId));
  },

  // Validate explicit consent requirement
  requiresExplicitConsent: (method: string, path: string): boolean => {
    const config = getRouteConfig(method, path);
    return config?.requireExplicitConsent === true;
  },

  // Get lawful basis for processing
  getLawfulBasis: (method: string, path: string): LawfulBasis[] => {
    const config = getRouteConfig(method, path);
    return config?.lawfulBasis || [];
  },

  // Data minimization helper
  minimizeData<T extends Record<string, unknown>>(
    data: T,
    allowedFields: (keyof T)[],
  ): Partial<T> {
    const minimized: Partial<T> = {};
    for (const field of allowedFields) {
      if (field in data) {
        minimized[field] = data[field];
      }
    }
    return minimized;
  },

  // Anonymize data for analytics
  anonymizeData<T extends Record<string, unknown>>(data: T): T {
    const anonymized: Record<string, unknown> = { ...data };

    // Remove direct identifiers
    const identifyingFields = [
      "id",
      "email",
      "phone",
      "cpf",
      "rg",
      "name",
      "fullName",
    ] as const;
    for (const field of identifyingFields) {
      if (Object.prototype.hasOwnProperty.call(anonymized, field)) {
        delete (anonymized as Record<string, unknown>)[field];
      }
    }

    // Safe base64 helper that works in Node and browser-like environments
    const toBase64 = (value: string): string => {
      try {
        // Prefer Node Buffer when available (use globalThis to avoid TS issues)
        const g = globalThis as unknown;
        const maybeBuffer =
          (g as { Buffer?: { from: (input: string) => { toString: (enc?: string) => string; }; }; })
            .Buffer;
        if (typeof maybeBuffer !== "undefined" && typeof maybeBuffer.from === "function") {
          return maybeBuffer.from(value).toString("base64");
        }
      } catch {}

      // Fallback to btoa if available in the global scope (browser-like)
      try {
        const g = globalThis as unknown;
        const maybeBtoa = (g as { btoa?: unknown; }).btoa;
        if (typeof maybeBtoa === "function") {
          return (maybeBtoa as (s: string) => string)(value);
        }
      } catch {}

      // Last resort: simple hex encoding
      return Array.from(value)
        .map((c) => c.charCodeAt(0).toString(16))
        .join("");
    };

    // Generate anonymous ID for analytics correlation
    const originalId = data?.id as unknown;
    if (typeof originalId === "string" || typeof originalId === "number") {
      (anonymized as Record<string, unknown>).anonymousId = `anon_${
        toBase64(String(originalId)).replace(/[^a-zA-Z0-9]/g, "").slice(0, 8)
      }`;
    }

    return anonymized as T;
  },
};

// Export consent store for admin/testing purposes
export { consentStore };
