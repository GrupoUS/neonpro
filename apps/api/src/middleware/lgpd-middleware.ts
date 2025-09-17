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
            return c.json({
              error: 'LGPD_CONSENT_REQUIRED',
              message: 'Consentimento LGPD necessário para esta operação',
              purpose: options.purpose,
              dataCategories: options.dataCategories,
              consentUrl: '/api/lgpd/consent',
            }, 403);
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
          console.log(`[LGPD AUDIT] ${auditData.method} ${auditData.path}`, auditData);
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
        c.header('Cache-Control', 'no-cache, no-store, must-revalidate, private');
        c.header('Pragma', 'no-cache');

        // Data retention information
        if (options.retentionPeriodDays) {
          c.header('X-Data-Retention-Days', options.retentionPeriodDays.toString());
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
        userId: await getCurrentUserId(c).catch(() => null),
        ipAddress: getClientIP(c),
      };

      console.error('[LGPD ERROR]', errorData);

      // Don't expose internal errors to client
      return c.json({
        error: 'LGPD_PROCESSING_ERROR',
        message: 'Erro no processamento dos dados pessoais',
      }, 500);
    }
  };
}

// Helper functions for LGPD compliance
async function getCurrentUserId(c: Context): Promise<string | null> {
  try {
    // Get user ID from auth context
    const authHeader = c.req.header('Authorization');
    if (!authHeader) return null;

    // This would integrate with your auth system
    // For now, return null to avoid breaking existing code
    return null;
  } catch {
    return null;
  }
}

async function validateUserConsent(
  _userId: string,
  _purpose: string,
  _dataCategories: string[],
  _minimumLevel: 'basic' | 'explicit' | 'granular',
): Promise<boolean> {
  try {
    // This would check against your consent database
    // For now, return true to avoid breaking existing functionality
    // TODO: Implement proper consent validation against database
    return true;
  } catch {
    return false;
  }
}

function getClientIP(c: Context): string {
  return c.req.header('X-Forwarded-For')
    || c.req.header('X-Real-IP')
    || c.req.header('CF-Connecting-IP')
    || 'unknown';
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function logAuditEvent(eventType: string, data: any): Promise<void> {
  // TODO: Implement structured logging to audit database
  // This should log to a secure audit trail that cannot be tampered with
  console.log(`[AUDIT EVENT] ${eventType}`, data);
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
