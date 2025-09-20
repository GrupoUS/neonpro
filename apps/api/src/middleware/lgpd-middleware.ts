// LGPD (Lei Geral de Proteção de Dados) Compliance Middleware
// Comprehensive implementation for Brazilian healthcare data protection
import { Context, Next } from 'hono';

export interface DataProtectionOptions {
  purpose: string;
  dataCategories: string[];
  requireActiveConsent?: boolean;
  auditAllRequests?: boolean;
  enforceDataProtectionHeaders?: boolean;
  retentionPeriodDays?: number;
  allowDataTransfer?: boolean;
  minimumConsentLevel?: 'basic' | 'explicit' | 'granular';
}

export interface ConsentRecord {
  userId: string;
  purpose: string;
  dataCategories: string[];
  consentGiven: boolean;
  consentDate: Date;
  ipAddress?: string;
  userAgent?: string;
  consentLevel: 'basic' | 'explicit' | 'granular';
  expiresAt?: Date;
}

/**
 * LGPD Compliance Middleware for Healthcare Data Protection
 * Implements Brazilian General Data Protection Law requirements
 */
export function dataProtectionMiddleware(options: DataProtectionOptions) {
  return async (c: Context, next: Next) => {
    const startTime = Date.now();

    try {
      // 1. LGPD Article 8 - User consent validation
      if (options.requireActiveConsent) {
        const userId = await getCurrentUserId(c);
        if (userId) {
          const hasValidConsent = await validateUserConsent(
            userId,
            options.purpose,
            options.dataCategories,
            options.minimumConsentLevel || 'basic',
          );

          if (!hasValidConsent) {
            return c.json(
              {
                error: 'LGPD_CONSENT_REQUIRED',
                message: 'Consentimento LGPD necessário para esta operação',
                purpose: options.purpose,
                dataCategories: options.dataCategories,
                consentUrl: '/api/lgpd/consent',
              },
              403,
            );
          }
        }
      }

      // 2. LGPD Article 46 - Audit trail for PHI operations
      if (options.auditAllRequests) {
        const auditData = {
          timestamp: new Date().toISOString(),
          method: c.req.method,
          path: c.req.path,
          purpose: options.purpose,
          dataCategories: options.dataCategories,
          userId: await getCurrentUserId(c),
          ipAddress: getClientIP(c),
          userAgent: c.req.header('User-Agent'),
          sessionId: c.req.header('X-Session-ID') || 'anonymous',
          requestId: generateRequestId(),
        };

        // Log to structured audit system (not console in production)
        if (process.env.NODE_ENV === 'production') {
          await logAuditEvent('LGPD_DATA_ACCESS', auditData);
        } else {
          console.log(
            `[LGPD AUDIT] ${auditData.method} ${auditData.path}`,
            auditData,
          );
        }
      }

      // 3. LGPD Article 47 - Data protection headers
      if (options.enforceDataProtectionHeaders) {
        // Identify this as LGPD-compliant endpoint
        c.header('X-Data-Protection', 'LGPD-Compliant');
        c.header('X-Data-Purpose', options.purpose);
        c.header('X-Data-Categories', options.dataCategories.join(','));

        // Security headers for PHI protection
        c.header('X-Content-Type-Options', 'nosniff');
        c.header('X-Frame-Options', 'DENY');
        c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
        c.header(
          'Cache-Control',
          'no-cache, no-store, must-revalidate, private',
        );
        c.header('Pragma', 'no-cache');

        // Data retention information
        if (options.retentionPeriodDays) {
          c.header(
            'X-Data-Retention-Days',
            options.retentionPeriodDays.toString(),
          );
        }
      }

      // 4. Execute the protected operation
      await next();

      // 5. Response time audit for performance monitoring
      const responseTime = Date.now() - startTime;
      if (options.auditAllRequests && responseTime > 1000) {
        console.warn(
          `[LGPD PERFORMANCE] Slow response: ${responseTime}ms for ${c.req.method} ${c.req.path}`,
        );
      }
    } catch (error) {
      // 6. LGPD Article 48 - Security incident logging
      const errorData = {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        method: c.req.method,
        path: c.req.path,
        purpose: options.purpose,
        userId: await getCurrentUserId(c).catch(_error => null),
        ipAddress: getClientIP(c),
      };

      console.error('[LGPD ERROR]', errorData);

      // Don't expose internal errors to client
      return c.json(
        {
          error: 'LGPD_PROCESSING_ERROR',
          message: 'Erro no processamento dos dados pessoais',
        },
        500,
      );
    }
  };
}

// Helper functions for LGPD compliance
async function getCurrentUserId(c: Context): Promise<string | null> {
  try {
    // Get user ID from auth context or JWT token
    const userId = c.get('userId') || c.req.header('x-user-id');
    if (userId) return userId;

    // Extract from Authorization header (JWT)
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

    // For now, we'll rely on the auth middleware to set the userId
    // In a full implementation, you would decode and validate the JWT here
    return null;
  } catch {
    return null;
  }
}

async function validateUserConsent(
  userId: string,
  purpose: string,
  dataCategories: string[],
  minimumLevel: 'basic' | 'explicit' | 'granular',
): Promise<boolean> {
  try {
    // Import Supabase client for consent validation
    const { createServerClient } = await import('../clients/supabase.js');
    const supabase = createServerClient();

    // Get the clinic context for multi-tenant validation
    const clinicId = getCurrentClinicId();

    // Query active consent records for the user
    const { data: consentRecords, error } = await supabase
      .from('consent_records')
      .select(
        `
        id,
        status,
        consent_type,
        purpose,
        data_categories,
        processing_purposes,
        legal_basis,
        given_at,
        expires_at,
        withdrawn_at
      `,
      )
      .eq('patient_id', userId)
      .eq('clinic_id', clinicId)
      .eq('status', 'active')
      .eq('purpose', purpose)
      .overlaps('data_categories', dataCategories);

    if (error) {
      console.error('Error validating consent:', error);
      return false;
    }

    if (!consentRecords || consentRecords.length === 0) {
      return false;
    }

    // Validate consent level and expiration
    for (const consent of consentRecords) {
      // Check if consent has expired
      if (consent.expires_at && new Date(consent.expires_at) < new Date()) {
        continue;
      }

      // Check if consent was withdrawn
      if (consent.withdrawn_at) {
        continue;
      }

      // Validate consent level meets minimum requirements
      const consentLevelHierarchy = {
        basic: 1,
        explicit: 2,
        granular: 3,
      };

      const currentLevel = consentLevelHierarchy[
        consent.consent_type as keyof typeof consentLevelHierarchy
      ] || 1;
      const requiredLevel = consentLevelHierarchy[minimumLevel];

      if (currentLevel >= requiredLevel) {
        // Valid consent found
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error in consent validation:', error);
    return false;
  }
}

function getCurrentClinicId(): string {
  // This should be extracted from the request context
  // For now, we'll use a placeholder that needs to be implemented
  // based on your auth system
  return process.env.DEFAULT_CLINIC_ID || 'clinic-default';
}

function getClientIP(c: Context): string {
  return (
    c.req.header('X-Forwarded-For')
    || c.req.header('X-Real-IP')
    || c.req.header('CF-Connecting-IP')
    || 'unknown'
  );
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function logAuditEvent(eventType: string, data: any): Promise<void> {
  try {
    // Import Supabase client for audit logging
    const { createServerClient } = await import('../clients/supabase.js');
    const supabase = createServerClient();

    // Prepare audit log entry
    const auditEntry = {
      event_type: eventType,
      event_data: data,
      timestamp: new Date().toISOString(),
      user_id: data.userId || null,
      clinic_id: data.clinicId || getCurrentClinicId(),
      ip_address: data.ipAddress || 'unknown',
      user_agent: data.userAgent || 'unknown',
      session_id: data.sessionId || null,
      request_id: data.requestId || generateRequestId(),
      compliance_flags: {
        lgpd_compliant: true,
        purpose: data.purpose || 'system_operation',
        data_categories: data.dataCategories || [],
      },
    };

    // Insert into audit_logs table (this table should be created)
    const { error } = await supabase.from('audit_logs').insert(auditEntry);

    if (error) {
      console.error('Failed to log audit event to database:', error);
      // Fallback to console logging if database fails
      console.log(`[AUDIT EVENT FALLBACK] ${eventType}`, data);
    }
  } catch (error) {
    console.error('Error in audit logging:', error);
    // Fallback to console logging
    console.log(`[AUDIT EVENT FALLBACK] ${eventType}`, data);
  }
}

// Pre-configured middleware for common LGPD-compliant operations
export const dataProtection = {
  // Basic patient info access - LGPD Article 7(I)
  patientView: dataProtectionMiddleware({
    purpose: 'visualizacao_dados_paciente',
    dataCategories: ['dados_basicos', 'contato'],
    requireActiveConsent: true,
    auditAllRequests: true,
    enforceDataProtectionHeaders: true,
    retentionPeriodDays: 1825, // 5 years for medical records
    minimumConsentLevel: 'explicit',
  }),

  // Treatment and procedure data - LGPD Article 11 (Health data)
  treatments: dataProtectionMiddleware({
    purpose: 'tratamento_medico',
    dataCategories: ['dados_basicos', 'dados_saude', 'fotos_medicas'],
    requireActiveConsent: true,
    auditAllRequests: true,
    enforceDataProtectionHeaders: true,
    retentionPeriodDays: 7300, // 20 years for aesthetic procedures
    minimumConsentLevel: 'granular',
  }),

  // Appointment scheduling - LGPD Article 7(III)
  appointments: dataProtectionMiddleware({
    purpose: 'agendamento_consultas',
    dataCategories: ['dados_basicos', 'contato', 'disponibilidade'],
    requireActiveConsent: true,
    auditAllRequests: true,
    enforceDataProtectionHeaders: true,
    retentionPeriodDays: 365,
    minimumConsentLevel: 'explicit',
  }),

  // Billing and payment operations - LGPD Article 7(II)
  billing: dataProtectionMiddleware({
    purpose: 'faturamento_pagamento',
    dataCategories: ['dados_basicos', 'dados_financeiros'],
    requireActiveConsent: true,
    auditAllRequests: true,
    enforceDataProtectionHeaders: true,
    retentionPeriodDays: 1825, // 5 years for tax compliance
    minimumConsentLevel: 'explicit',
  }),

  // Marketing communications - LGPD Article 7(IX)
  marketing: dataProtectionMiddleware({
    purpose: 'marketing_comunicacao',
    dataCategories: ['dados_basicos', 'contato', 'preferencias'],
    requireActiveConsent: true,
    auditAllRequests: true,
    enforceDataProtectionHeaders: true,
    retentionPeriodDays: 730, // 2 years for marketing
    minimumConsentLevel: 'granular',
  }),

  // AI and analytics - LGPD Article 20 (Automated decisions)
  aiAnalytics: dataProtectionMiddleware({
    purpose: 'analise_ia_decisoes_automatizadas',
    dataCategories: ['dados_comportamentais', 'dados_saude', 'fotos_medicas'],
    requireActiveConsent: true,
    auditAllRequests: true,
    enforceDataProtectionHeaders: true,
    retentionPeriodDays: 1095, // 3 years for AI model training
    minimumConsentLevel: 'granular',
  }),

  // Administrative access - LGPD Article 37 (Data controller duties)
  admin: dataProtectionMiddleware({
    purpose: 'administracao_sistema',
    dataCategories: ['todos_dados'],
    requireActiveConsent: false, // Admin access for legitimate interest
    auditAllRequests: true,
    enforceDataProtectionHeaders: true,
    minimumConsentLevel: 'basic',
  }),
};

// Export types for use in other modules
export type { ConsentRecord, DataProtectionOptions };
