/**
 * ⚖️ LGPD Middleware - NeonPro API
 * ================================
 *
 * Middleware para compliance LGPD (Lei Geral de Proteção de Dados)
 * com validação de consentimento, rastreamento e proteção de dados.
 */

import type { MiddlewareHandler } from 'hono';
import { createError, ErrorType } from './error-handler';

// LGPD consent types
export enum ConsentType {
  DATA_PROCESSING = 'data_processing', // Essential data processing
  MARKETING = 'marketing', // Marketing communications
  ANALYTICS = 'analytics', // Usage analytics
  THIRD_PARTY_SHARING = 'third_party_sharing', // Data sharing with partners
  RESEARCH = 'research', // Medical/academic research
  PHOTOS = 'photos', // Photo/video for procedures
  BIOMETRIC = 'biometric', // Biometric data collection
}

// Data categories under LGPD
export enum DataCategory {
  IDENTIFYING = 'identifying', // Name, documents, contact
  SENSITIVE = 'sensitive', // Health data, biometric
  BEHAVIORAL = 'behavioral', // Usage patterns, preferences
  FINANCIAL = 'financial', // Payment data, billing
  BIOMETRIC = 'biometric', // Fingerprints, facial recognition
  GENETIC = 'genetic', // Genetic information
  HEALTH = 'health', // Medical records, procedures
  LOCATION = 'location', // Geographic location data
}

// LGPD lawful basis for processing (Article 7)
export enum LawfulBasis {
  CONSENT = 'consent', // Article 7, I
  CONTRACT = 'contract', // Article 7, II
  LEGAL_OBLIGATION = 'legal_obligation', // Article 7, III
  VITAL_INTERESTS = 'vital_interests', // Article 7, IV
  PUBLIC_TASK = 'public_task', // Article 7, V
  LEGITIMATE_INTEREST = 'legitimate_interest', // Article 7, VI
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
  'POST /api/v1/patients': {
    requiresConsent: [ConsentType.DATA_PROCESSING],
    dataCategories: [DataCategory.IDENTIFYING, DataCategory.HEALTH],
    lawfulBasis: [LawfulBasis.CONSENT, LawfulBasis.CONTRACT],
    retentionPeriod: 3650, // 10 years for medical records
    requireExplicitConsent: true,
    description: 'Patient registration with personal and health data',
  },

  'GET /api/v1/patients': {
    requiresConsent: [ConsentType.DATA_PROCESSING],
    dataCategories: [DataCategory.IDENTIFYING, DataCategory.HEALTH],
    lawfulBasis: [LawfulBasis.LEGITIMATE_INTEREST],
    description: 'Patient data access for healthcare providers',
  },

  'PUT /api/v1/patients/:id': {
    requiresConsent: [ConsentType.DATA_PROCESSING],
    dataCategories: [DataCategory.IDENTIFYING, DataCategory.HEALTH],
    lawfulBasis: [LawfulBasis.CONSENT, LawfulBasis.CONTRACT],
    description: 'Patient data modification',
  },

  // Appointment endpoints
  'POST /api/v1/appointments': {
    requiresConsent: [ConsentType.DATA_PROCESSING],
    dataCategories: [DataCategory.HEALTH, DataCategory.IDENTIFYING],
    lawfulBasis: [LawfulBasis.CONTRACT],
    description: 'Appointment booking with health data',
  },

  // Photo/video consent for procedures
  'POST /api/v1/appointments/:id/photos': {
    requiresConsent: [ConsentType.PHOTOS],
    dataCategories: [DataCategory.BIOMETRIC, DataCategory.HEALTH],
    lawfulBasis: [LawfulBasis.CONSENT],
    requireExplicitConsent: true,
    description: 'Photo/video documentation of procedures',
  },

  // Analytics endpoints
  'GET /api/v1/analytics': {
    requiresConsent: [ConsentType.ANALYTICS],
    dataCategories: [DataCategory.BEHAVIORAL],
    lawfulBasis: [LawfulBasis.LEGITIMATE_INTEREST],
    allowAnonymous: true,
    description: 'Usage analytics for business intelligence',
  },

  // Marketing endpoints
  'POST /api/v1/marketing/campaigns': {
    requiresConsent: [ConsentType.MARKETING],
    dataCategories: [DataCategory.IDENTIFYING, DataCategory.BEHAVIORAL],
    lawfulBasis: [LawfulBasis.CONSENT],
    requireExplicitConsent: true,
    description: 'Marketing campaign targeting',
  },

  // Data export (LGPD Article 15 - Right to portability)
  'GET /api/v1/compliance/export': {
    requiresConsent: [],
    dataCategories: [
      DataCategory.IDENTIFYING,
      DataCategory.HEALTH,
      DataCategory.BEHAVIORAL,
    ],
    lawfulBasis: [LawfulBasis.LEGAL_OBLIGATION],
    description: 'Personal data export for data portability',
  },
};

// Mock consent store (production should use database)
class ConsentStore {
  private consents = new Map<
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
    if (!patientConsents) return false;

    return consentTypes.every((type) => {
      const consent = patientConsents.get(type);
      return consent?.granted === true;
    });
  }

  grantConsent(
    patientId: string,
    consentType: ConsentType,
    version = '1.0',
    ipAddress?: string,
    userAgent?: string
  ) {
    if (!this.consents.has(patientId)) {
      this.consents.set(patientId, new Map());
    }

    this.consents.get(patientId)!.set(consentType, {
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
        version: '1.0',
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
consentStore.grantConsent('pat_123', ConsentType.DATA_PROCESSING, '1.0');
consentStore.grantConsent('pat_123', ConsentType.MARKETING, '1.0');
consentStore.grantConsent('pat_456', ConsentType.DATA_PROCESSING, '1.0');

/**
 * Extract patient ID from request
 */
const extractPatientId = (c: any): string | null => {
  // Try to get from URL parameters
  const pathPatientId = c.req.param('id');
  if (pathPatientId) return pathPatientId;

  // Try to get from request body
  try {
    const body = c.req.json();
    if (body?.patientId) return body.patientId;
    if (body?.id) return body.id;
  } catch {
    // Ignore JSON parsing errors
  }

  // Try to get from query parameters
  const queryPatientId = c.req.query('patientId');
  if (queryPatientId) return queryPatientId;

  // Try to get from authenticated user context
  const userId = c.get('userId');
  if (userId && userId.startsWith('pat_')) return userId;

  return null;
};

/**
 * Check if route matches LGPD configuration
 */
const getRouteConfig = (
  method: string,
  path: string
): LGPDRouteConfig | null => {
  const operationKey = `${method} ${path}`;

  // Check exact match
  if (LGPD_ROUTE_CONFIG[operationKey]) {
    return LGPD_ROUTE_CONFIG[operationKey];
  }

  // Check pattern matches (for parameterized routes)
  for (const [pattern, config] of Object.entries(LGPD_ROUTE_CONFIG)) {
    const regex = new RegExp('^' + pattern.replace(/:\w+/g, '[^/]+') + '$');
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
  patientId: string
): boolean => {
  if (!config.retentionPeriod) return true;

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
    const method = c.req.method;
    const path = c.req.path;

    // Get route configuration
    const routeConfig = getRouteConfig(method, path);

    if (routeConfig) {
      // Extract patient ID for consent checking
      const patientId = extractPatientId(c);

      // Check consent requirements
      if (routeConfig.requiresConsent.length > 0 && patientId) {
        const hasValidConsent = consentStore.hasValidConsent(
          patientId,
          routeConfig.requiresConsent
        );

        if (!hasValidConsent) {
          const missingConsents = routeConfig.requiresConsent.filter(
            (consent) => !consentStore.getConsent(patientId, consent)?.granted
          );

          throw createError.lgpdCompliance(
            'Consentimento LGPD obrigatório não fornecido',
            {
              requiredConsents: routeConfig.requiresConsent,
              missingConsents,
              patientId,
              article: 'LGPD Art. 8º',
            }
          );
        }
      }

      // Check data retention compliance
      if (patientId && !validateDataRetention(routeConfig, patientId)) {
        throw createError.lgpdCompliance(
          'Dados fora do período de retenção permitido',
          {
            retentionPeriod: routeConfig.retentionPeriod,
            article: 'LGPD Art. 15º',
          }
        );
      }

      // Set LGPD compliance headers
      c.res.headers.set('X-LGPD-Compliant', 'true');
      c.res.headers.set('X-LGPD-Basis', routeConfig.lawfulBasis.join(','));
      c.res.headers.set(
        'X-LGPD-Categories',
        routeConfig.dataCategories.join(',')
      );

      if (routeConfig.retentionPeriod) {
        c.res.headers.set(
          'X-LGPD-Retention-Days',
          routeConfig.retentionPeriod.toString()
        );
      }

      // Store LGPD context for audit
      c.set('lgpdContext', {
        config: routeConfig,
        patientId,
        consentValidated:
          routeConfig.requiresConsent.length === 0 ||
          (patientId &&
            consentStore.hasValidConsent(
              patientId,
              routeConfig.requiresConsent
            )),
      });
    }

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
    version = '1.0',
    ipAddress?: string,
    userAgent?: string
  ) => {
    consentStore.grantConsent(
      patientId,
      consentType,
      version,
      ipAddress,
      userAgent
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
  minimizeData: <T extends Record<string, any>>(
    data: T,
    allowedFields: (keyof T)[]
  ): Partial<T> => {
    const minimized: Partial<T> = {};
    for (const field of allowedFields) {
      if (field in data) {
        minimized[field] = data[field];
      }
    }
    return minimized;
  },

  // Anonymize data for analytics
  anonymizeData: <T extends Record<string, any>>(data: T): T => {
    const anonymized = { ...data };

    // Remove direct identifiers
    const identifyingFields = [
      'id',
      'email',
      'phone',
      'cpf',
      'rg',
      'name',
      'fullName',
    ];
    for (const field of identifyingFields) {
      if (field in anonymized) {
        delete anonymized[field];
      }
    }

    // Generate anonymous ID for analytics correlation
    if (data.id) {
      anonymized.anonymousId = `anon_${btoa(data.id.toString())
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 8)}`;
    }

    return anonymized;
  },
};

// Export consent store for admin/testing purposes
export { consentStore, ConsentType, DataCategory, LawfulBasis };
