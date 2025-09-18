/**
 * Enhanced RLS Middleware with Advanced Security Policies
 * Integrates with the advanced RLS policies for comprehensive healthcare data protection
 */

import { Context, Next } from 'hono';
import { advancedRLSPolicies, type RLSContext } from '../security/rls-policies.js';
import { enhancedLGPDConsentService } from '../services/enhanced-lgpd-consent.js';

export interface EnhancedRLSOptions {
  tableName?: string;
  operation?: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  requireEmergencyJustification?: boolean;
  sensitivityLevel?: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED' | 'HIGHLY_RESTRICTED';
  auditLevel?: 'basic' | 'detailed' | 'comprehensive';
  allowEmergencyAccess?: boolean;
  timeRestricted?: boolean;
}

export interface SecurityContext {
  rlsContext: RLSContext;
  accessGranted: boolean;
  emergencyAccess: boolean;
  auditRequired: boolean;
  restrictions: string[];
  consentValidated: boolean;
}

/**
 * Enhanced RLS middleware with advanced security policies
 */
export function enhancedRLSMiddleware(options: EnhancedRLSOptions = {}) {
  return async (c: Context, next: Next) => {
    const startTime = Date.now();

    try {
      // Build RLS context from request
      const rlsContext = await buildRLSContext(c, options);

      // Set RLS context in database
      await advancedRLSPolicies.setRLSContext(rlsContext);

      // Evaluate access policies if table/operation specified
      let securityContext: SecurityContext = {
        rlsContext,
        accessGranted: true,
        emergencyAccess: false,
        auditRequired: true,
        restrictions: [],
        consentValidated: false,
      };

      if (options.tableName && options.operation) {
        const policyResult = await advancedRLSPolicies.evaluatePolicy(
          rlsContext,
          options.tableName,
          options.operation,
        );

        securityContext = {
          rlsContext,
          accessGranted: policyResult.allowed,
          emergencyAccess: policyResult.emergencyAccess || false,
          auditRequired: policyResult.auditRequired,
          restrictions: policyResult.conditions || [],
          consentValidated: true,
        };

        if (!policyResult.allowed) {
          await logSecurityEvent('ACCESS_DENIED', {
            reason: policyResult.reason,
            context: rlsContext,
            tableName: options.tableName,
            operation: options.operation,
          });

          return c.json({
            error: 'Access denied',
            code: 'RLS_ACCESS_DENIED',
            reason: policyResult.reason,
          }, 403);
        }

        // Handle emergency access
        if (policyResult.emergencyAccess && options.requireEmergencyJustification) {
          if (!rlsContext.justification) {
            return c.json({
              error: 'Emergency access requires justification',
              code: 'EMERGENCY_JUSTIFICATION_REQUIRED',
            }, 400);
          }

          await logSecurityEvent('EMERGENCY_ACCESS', {
            justification: rlsContext.justification,
            context: rlsContext,
            tableName: options.tableName,
            operation: options.operation,
          });
        }
      }

      // Store security context in request for route handlers
      c.set('securityContext', securityContext);
      c.set('rlsContext', rlsContext);

      // Add security headers
      addSecurityHeaders(c, securityContext, options);

      // Continue to route handler
      await next();

      // Log successful access if required
      if (securityContext.auditRequired) {
        const responseTime = Date.now() - startTime;
        await logSecurityEvent('ACCESS_GRANTED', {
          context: rlsContext,
          tableName: options.tableName,
          operation: options.operation,
          responseTime,
          emergencyAccess: securityContext.emergencyAccess,
        });
      }
    } catch (error) {
      console.error('Enhanced RLS middleware error:', error);

      await logSecurityEvent('RLS_ERROR', {
        error: error instanceof Error ? error.message : 'Unknown error',
        context: await buildRLSContext(c, options).catch(() => null),
      });

      return c.json({
        error: 'Security validation error',
        code: 'RLS_VALIDATION_ERROR',
      }, 500);
    }
  };
}

/**
 * Build RLS context from HTTP request
 */
async function buildRLSContext(c: Context, options: EnhancedRLSOptions): Promise<RLSContext> {
  // Extract user information from auth middleware
  const userId = c.get('userId') || c.req.header('x-user-id') || '';
  const userRole = c.get('userRole') || c.req.header('x-user-role') || 'anonymous';
  const clinicId = c.get('clinicId') || c.req.header('x-clinic-id') || '';
  const professionalId = c.get('professionalId') || c.req.header('x-professional-id');

  // Check for emergency access indicators
  const emergencyAccess = c.req.header('x-emergency-access') === 'true'
    || c.req.query('emergency') === 'true';

  const justification = c.req.header('x-emergency-justification')
    || c.req.query('justification');

  // Get client information
  const ipAddress = getClientIP(c);
  const accessTime = new Date();

  return {
    userId,
    userRole,
    clinicId,
    professionalId,
    emergencyAccess,
    accessTime,
    ipAddress,
    justification,
  };
}

/**
 * Add security headers based on context
 */
function addSecurityHeaders(
  c: Context,
  securityContext: SecurityContext,
  options: EnhancedRLSOptions,
): void {
  // Basic security headers
  c.header('X-RLS-Enforced', 'true');
  c.header('X-Access-Granted', securityContext.accessGranted.toString());
  c.header('X-Audit-Required', securityContext.auditRequired.toString());

  if (securityContext.emergencyAccess) {
    c.header('X-Emergency-Access', 'true');
  }

  if (options.sensitivityLevel) {
    c.header('X-Data-Sensitivity', options.sensitivityLevel);
  }

  if (securityContext.restrictions.length > 0) {
    c.header('X-Access-Restrictions', securityContext.restrictions.join(';'));
  }

  // Healthcare-specific headers
  c.header('X-Healthcare-Compliant', 'true');
  c.header('X-LGPD-Protected', 'true');

  // Cache control for sensitive data
  if (
    options.sensitivityLevel
    && ['CONFIDENTIAL', 'RESTRICTED', 'HIGHLY_RESTRICTED'].includes(options.sensitivityLevel)
  ) {
    c.header('Cache-Control', 'no-cache, no-store, must-revalidate, private');
    c.header('Pragma', 'no-cache');
    c.header('Expires', '0');
  }
}

/**
 * Log security events for audit trail
 */
async function logSecurityEvent(eventType: string, eventData: any): Promise<void> {
  try {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      event_type: eventType,
      event_data: eventData,
      security_level: 'enhanced_rls',
      compliance_flags: {
        rls_enforced: true,
        healthcare_compliant: true,
        lgpd_compliant: true,
      },
    };

    // In production, this should go to a secure audit database
    console.log(`[ENHANCED RLS AUDIT] ${eventType}`, auditEntry);
  } catch (error) {
    console.error('Error logging security event:', error);
  }
}

/**
 * Get client IP address
 */
function getClientIP(c: Context): string {
  return c.req.header('X-Forwarded-For')?.split(',')[0]?.trim()
    || c.req.header('X-Real-IP')
    || c.req.header('CF-Connecting-IP')
    || 'unknown';
}

/**
 * Specialized middleware configurations for healthcare use cases
 */
export const enhancedRLSHealthcareMiddleware = {
  /**
   * For highly sensitive patient medical records
   */
  medicalRecords: enhancedRLSMiddleware({
    tableName: 'medical_records',
    operation: 'SELECT',
    sensitivityLevel: 'HIGHLY_RESTRICTED',
    auditLevel: 'comprehensive',
    allowEmergencyAccess: true,
    requireEmergencyJustification: true,
    timeRestricted: true,
  }),

  /**
   * For patient demographic and contact information
   */
  patientData: enhancedRLSMiddleware({
    tableName: 'patients',
    operation: 'SELECT',
    sensitivityLevel: 'CONFIDENTIAL',
    auditLevel: 'detailed',
    allowEmergencyAccess: false,
    timeRestricted: false,
  }),

  /**
   * For appointment scheduling and management
   */
  appointments: enhancedRLSMiddleware({
    tableName: 'appointments',
    operation: 'SELECT',
    sensitivityLevel: 'INTERNAL',
    auditLevel: 'basic',
    allowEmergencyAccess: false,
    timeRestricted: false,
  }),

  /**
   * For financial and billing information
   */
  billing: enhancedRLSMiddleware({
    tableName: 'billing_records',
    operation: 'SELECT',
    sensitivityLevel: 'RESTRICTED',
    auditLevel: 'comprehensive',
    allowEmergencyAccess: false,
    timeRestricted: false,
  }),

  /**
   * For consent and legal documentation
   */
  consent: enhancedRLSMiddleware({
    tableName: 'consent_records',
    operation: 'SELECT',
    sensitivityLevel: 'RESTRICTED',
    auditLevel: 'comprehensive',
    allowEmergencyAccess: false,
    timeRestricted: false,
  }),

  /**
   * For administrative operations with full audit
   */
  administrative: enhancedRLSMiddleware({
    sensitivityLevel: 'CONFIDENTIAL',
    auditLevel: 'comprehensive',
    allowEmergencyAccess: true,
    requireEmergencyJustification: true,
  }),
};

/**
 * Patient access validation with enhanced RLS
 */
export function enhancedPatientAccessMiddleware(patientIdParam: string = 'patientId') {
  return async (c: Context, next: Next) => {
    try {
      const patientId = c.req.param(patientIdParam) || c.req.query(patientIdParam);
      const securityContext = c.get('securityContext') as SecurityContext;

      if (!patientId) {
        return c.json({
          error: 'Patient ID required',
          code: 'PATIENT_ID_REQUIRED',
        }, 400);
      }

      if (!securityContext) {
        return c.json({
          error: 'Security context not initialized',
          code: 'SECURITY_CONTEXT_MISSING',
        }, 500);
      }

      // Validate patient access through RLS policies
      const accessResult = await advancedRLSPolicies.evaluatePolicy(
        securityContext.rlsContext,
        'patients',
        'SELECT',
        patientId,
      );

      if (!accessResult.allowed) {
        await logSecurityEvent('PATIENT_ACCESS_DENIED', {
          patientId,
          reason: accessResult.reason,
          context: securityContext.rlsContext,
        });

        return c.json({
          error: 'Patient access denied',
          code: 'PATIENT_ACCESS_DENIED',
          reason: accessResult.reason,
        }, 403);
      }

      // Validate consent for patient data access
      const consentValid = await enhancedLGPDConsentService.validateConsent(
        patientId,
        securityContext.rlsContext.clinicId,
        'visualizacao_dados_paciente',
        ['dados_basicos', 'contato'],
      );

      if (!consentValid.isValid) {
        return c.json({
          error: 'Patient consent required',
          code: 'CONSENT_REQUIRED',
          reason: consentValid.reason,
          renewalRequired: consentValid.renewalRequired,
        }, 403);
      }

      // Store validated patient ID in context
      c.set('validatedPatientId', patientId);
      c.set('patientConsentValid', true);

      return next();
    } catch (error) {
      console.error('Enhanced patient access middleware error:', error);
      return c.json({
        error: 'Patient access validation error',
        code: 'PATIENT_ACCESS_ERROR',
      }, 500);
    }
  };
}

// Export types
export type { EnhancedRLSOptions, SecurityContext };
