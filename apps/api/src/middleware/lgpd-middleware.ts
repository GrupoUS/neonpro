import { Context, Next } from 'hono';
import { validateLGPDConsent, HEALTHCARE_DATA_CATEGORIES, HEALTHCARE_PURPOSES } from '../lib/lgpd-compliance';

export interface LGPDMiddlewareOptions {
  purpose: string;
  dataCategories: string[];
  requireActiveConsent?: boolean;
  skipForRoles?: string[]; // Skip validation for certain roles (e.g., emergency access)
}

/**
 * LGPD Consent Validation Middleware
 * Validates that proper consent exists before allowing access to patient data
 */
export function lgpdConsentMiddleware(options: LGPDMiddlewareOptions) {
  return async (c: Context, next: Next) => {
    try {
      // Extract patient ID from request (could be from params, query, or body)
      const patientId = c.req.param('patientId') || 
                       c.req.query('patientId') || 
                       (await c.req.json().catch(() => ({})))?.patientId;

      if (!patientId) {
        return c.json({ 
          error: 'Patient ID is required for LGPD compliance validation',
          code: 'LGPD_PATIENT_ID_REQUIRED'
        }, 400);
      }

      // Check if user role should skip validation (e.g., emergency access)
      const userRole = c.get('userRole'); // Assuming role is set by auth middleware
      if (options.skipForRoles && userRole && options.skipForRoles.includes(userRole)) {
        // Log the bypass for audit purposes
        console.log(`LGPD validation bypassed for role: ${userRole}, patient: ${patientId}`);
        return next();
      }

      // Validate LGPD consent
      const consentResult = await validateLGPDConsent({
        patientId,
        purpose: options.purpose,
        dataCategories: options.dataCategories,
        requireActiveConsent: options.requireActiveConsent,
      });

      if (!consentResult.isValid) {
        return c.json({
          error: 'LGPD consent validation failed',
          reason: consentResult.reason,
          code: 'LGPD_CONSENT_INVALID',
          patientId,
          purpose: options.purpose,
          dataCategories: options.dataCategories,
        }, 403);
      }

      // Store consent info in context for potential use in route handlers
      c.set('lgpdConsent', consentResult);
      c.set('patientId', patientId);

      return next();
    } catch (error) {
      console.error('LGPD middleware error:', error);
      return c.json({
        error: 'LGPD compliance validation error',
        code: 'LGPD_VALIDATION_ERROR'
      }, 500);
    }
  };
}

/**
 * Pre-configured middleware for common healthcare scenarios
 */
export const lgpdMiddleware = {
  /**
   * For viewing patient basic information
   */
  patientView: lgpdConsentMiddleware({
    purpose: HEALTHCARE_PURPOSES.MEDICAL_TREATMENT,
    dataCategories: [
      HEALTHCARE_DATA_CATEGORIES.PERSONAL_IDENTIFICATION,
      HEALTHCARE_DATA_CATEGORIES.CONTACT_INFORMATION,
    ],
  }),

  /**
   * For accessing medical records and health data
   */
  medicalRecords: lgpdConsentMiddleware({
    purpose: HEALTHCARE_PURPOSES.MEDICAL_TREATMENT,
    dataCategories: [
      HEALTHCARE_DATA_CATEGORIES.PERSONAL_IDENTIFICATION,
      HEALTHCARE_DATA_CATEGORIES.HEALTH_DATA,
      HEALTHCARE_DATA_CATEGORIES.MEDICAL_RECORDS,
    ],
  }),

  /**
   * For appointment scheduling and management
   */
  appointments: lgpdConsentMiddleware({
    purpose: HEALTHCARE_PURPOSES.APPOINTMENT_SCHEDULING,
    dataCategories: [
      HEALTHCARE_DATA_CATEGORIES.PERSONAL_IDENTIFICATION,
      HEALTHCARE_DATA_CATEGORIES.CONTACT_INFORMATION,
      HEALTHCARE_DATA_CATEGORIES.APPOINTMENT_DATA,
    ],
  }),

  /**
   * For patient communication (SMS, WhatsApp, email)
   */
  communication: lgpdConsentMiddleware({
    purpose: HEALTHCARE_PURPOSES.PATIENT_COMMUNICATION,
    dataCategories: [
      HEALTHCARE_DATA_CATEGORIES.PERSONAL_IDENTIFICATION,
      HEALTHCARE_DATA_CATEGORIES.CONTACT_INFORMATION,
      HEALTHCARE_DATA_CATEGORIES.COMMUNICATION_PREFERENCES,
    ],
  }),

  /**
   * For marketing and promotional communications
   */
  marketing: lgpdConsentMiddleware({
    purpose: HEALTHCARE_PURPOSES.MARKETING,
    dataCategories: [
      HEALTHCARE_DATA_CATEGORIES.PERSONAL_IDENTIFICATION,
      HEALTHCARE_DATA_CATEGORIES.CONTACT_INFORMATION,
      HEALTHCARE_DATA_CATEGORIES.COMMUNICATION_PREFERENCES,
    ],
    requireActiveConsent: true, // Marketing requires explicit consent
  }),

  /**
   * For research and analytics
   */
  research: lgpdConsentMiddleware({
    purpose: HEALTHCARE_PURPOSES.MEDICAL_RESEARCH,
    dataCategories: [
      HEALTHCARE_DATA_CATEGORIES.HEALTH_DATA,
      HEALTHCARE_DATA_CATEGORIES.MEDICAL_RECORDS,
    ],
    requireActiveConsent: true, // Research requires explicit consent
  }),
};

/**
 * Audit logging middleware for LGPD compliance
 * Logs all data access for audit trail purposes
 */
export function lgpdAuditMiddleware() {
  return async (c: Context, next: Next) => {
    const startTime = Date.now();
    const patientId = c.get('patientId');
    const lgpdConsent = c.get('lgpdConsent');
    
    // Execute the request
    await next();
    
    // Log the access for audit purposes
    if (patientId && lgpdConsent) {
      const endTime = Date.now();
      const auditLog = {
        timestamp: new Date().toISOString(),
        patientId,
        userId: c.get('userId'), // Assuming user ID is set by auth middleware
        action: `${c.req.method} ${c.req.path}`,
        consentId: lgpdConsent.consentRecord?.id,
        purpose: lgpdConsent.consentRecord?.purpose,
        ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        userAgent: c.req.header('user-agent'),
        responseTime: endTime - startTime,
        statusCode: c.res.status,
      };
      
      // In a production environment, you would send this to your audit logging system
      console.log('LGPD Audit Log:', JSON.stringify(auditLog));
    }
  };
}
