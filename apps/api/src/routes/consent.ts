/**
 * Consent Management Routes
 * LGPD compliance - consent lifecycle management
 * Handles consent expiration, renewal, and monitoring
 */

import { prisma } from '@neonpro/database';
import { Hono } from 'hono';
import type { Context } from 'hono';
import { badRequest, ok, serverError } from '../utils/responses';
import { requireAuth } from '../middleware/authn';

// Define context variables interface
interface Variables {
  userId: string;
}

// Create typed Hono instance
const app = new Hono<{ Variables: Variables }>();

/**
 * POST /consent/check-expired
 * Check for expired consents and update their status
 */
app.post(
  '/check-expired',
  requireAuth,
  async (c: Context) => {
    try {
      // const { clinicId } = c.req.valid('json');
      // const userId = c.get('userId');

      // Execute the stored procedure to check expired consents
      const result = await prisma.$queryRaw<
        Array<{
          patient_id: string;
          consent_id: string;
          expired_at: Date;
          action_taken: string;
        }>
      >`SELECT * FROM check_expired_consents()`;

      // Filter by clinic if needed (add clinic validation)
      // In production, validate user has access to this clinic

      c.header('X-Data-Classification', 'sensitive');
      c.header('X-LGPD-Compliance', 'true');

      return ok(c, {
        success: true,
        expiredCount: result.length,
        checkedAt: new Date().toISOString(),
        details: result,
      });
    } catch (error) {
      console.error('Error checking expired consents:', error);
      return serverError(c, 'Failed to check expired consents');
    }
  }
);

/**
 * GET /consent/expiring
 * Get list of consents expiring within specified days
 */
app.get(
  '/expiring',
  requireAuth,
  async (c: Context) => {
    try {
      const daysAhead = parseInt(c.req.query('daysAhead') || '30');
      // const userId = c.get('userId');

      // Execute stored procedure
      const result = await prisma.$queryRaw<
        Array<{
          patient_id: string;
          patient_name: string;
          consent_id: string;
          purpose: string;
          expires_at: Date;
          days_until_expiration: number;
        }>
      >`SELECT * FROM get_expiring_consents(${daysAhead})`;

      // Filter by clinic (add RLS validation in production)

      c.header('X-Data-Classification', 'sensitive');

      return ok(c, {
        success: true,
        daysAhead,
        count: result.length,
        consents: result,
      });
    } catch (error) {
      console.error('Error getting expiring consents:', error);
      return serverError(c, 'Failed to get expiring consents');
    }
  }
);

/**
 * POST /consent/renew
 * Renew a patient's consent
 */
app.post(
  '/renew',
  requireAuth,
  async (c: Context) => {
    try {
      const body = await c.req.json();
      const { patientId, consentType, durationDays = 365 } = body;
      const userId = c.get('userId');

      // Execute stored procedure to renew consent
      const result = await prisma.$queryRaw<Array<{ renew_patient_consent: string }>>`
        SELECT renew_patient_consent(
          ${patientId}::UUID,
          ${consentType}::TEXT,
          ${durationDays}::INTEGER
        )
      `;

      const newConsentId = result[0]?.renew_patient_consent;

      if (!newConsentId) {
        throw new Error('Failed to renew consent');
      }

      // Log audit trail (using raw query as auditLog model may not be available)
      await prisma.$executeRaw`
        INSERT INTO audit_logs (operation, user_id, table_name, record_id, metadata, created_at)
        VALUES (
          'RENEW_CONSENT',
          ${userId}::UUID,
          'consent_records',
          ${newConsentId}::UUID,
          ${JSON.stringify({ patientId, consentType, durationDays })}::JSONB,
          NOW()
        )
      `;

      c.header('X-Data-Classification', 'sensitive');
      c.header('X-LGPD-Compliance', 'true');

      return ok(c, {
        success: true,
        consentId: newConsentId,
        patientId,
        consentType,
        expiresAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
      });
    } catch (error) {
      console.error('Error renewing consent:', error);
      return serverError(c, 'Failed to renew consent');
    }
  }
);

/**
 * GET /consent/stats/:clinicId
 * Get consent expiration statistics for a clinic
 */
app.get(
  '/stats/:clinicId',
  requireAuth,
  async (c: Context) => {
    try {
      const clinicId = c.req.param('clinicId');
      // const userId = c.get('userId');

      // Validate clinic access (add proper RLS in production)

      // Execute stored procedure
      const result = await prisma.$queryRaw<
        Array<{
          total_patients: number;
          active_consents: number;
          expired_consents: number;
          expiring_30_days: number;
          expiring_60_days: number;
          expiring_90_days: number;
        }>
      >`SELECT * FROM get_consent_expiration_stats(${clinicId}::UUID)`;

      const stats = result[0] || {
        total_patients: 0,
        active_consents: 0,
        expired_consents: 0,
        expiring_30_days: 0,
        expiring_60_days: 0,
        expiring_90_days: 0,
      };

      return ok(c, {
        success: true,
        clinicId,
        stats,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error getting consent stats:', error);
      return serverError(c, 'Failed to get consent statistics');
    }
  }
);

/**
 * POST /consent/auto-check-job
 * Manual trigger for automated consent expiration check
 * Typically called by cron or scheduler
 */
app.post(
  '/auto-check-job',
  requireAuth, // In production, use service role or API key
  async (c: Context) => {
    try {
      // const userId = c.get('userId');

      // Execute automated job
      const result = await prisma.$queryRaw<Array<{ auto_check_expired_consents_job: any }>>`
        SELECT auto_check_expired_consents_job()
      `;

      const jobResult = result[0]?.auto_check_expired_consents_job;

      return ok(c, {
        success: true,
        jobResult,
        executedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error executing auto-check job:', error);
      return serverError(c, 'Failed to execute auto-check job');
    }
  }
);

/**
 * GET /consent/anonymization/eligible
 * Get list of patients eligible for anonymization
 * LGPD Article 16 - Right to erasure
 */
app.get(
  '/anonymization/eligible',
  requireAuth,
  async (c: Context) => {
    try {
      // const userId = c.get('userId');

      const result = await prisma.$queryRaw<
        Array<{
          patient_id: string;
          full_name: string;
          deletion_requested_at: Date;
          days_since_request: number;
          reason: string;
        }>
      >`SELECT * FROM get_patients_eligible_for_anonymization()`;

      c.header('X-Data-Classification', 'sensitive');
      c.header('X-LGPD-Compliance', 'true');

      return ok(c, {
        success: true,
        count: result.length,
        patients: result,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error getting eligible patients:', error);
      return serverError(c, 'Failed to get eligible patients for anonymization');
    }
  }
);

/**
 * POST /consent/anonymization/patient/:patientId
 * Anonymize a single patient manually
 * LGPD Article 16 - Right to erasure
 */
app.post(
  '/anonymization/patient/:patientId',
  requireAuth,
  async (c: Context) => {
    try {
      const patientId = c.req.param('patientId');
      // const userId = c.get('userId');

      // Execute anonymization
      const result = await prisma.$queryRaw<Array<{ anonymize_patient_data: any }>>`
        SELECT anonymize_patient_data(${patientId}::UUID)
      `;

      const anonymizationResult = result[0]?.anonymize_patient_data;

      if (!anonymizationResult?.success) {
        return badRequest(
          c,
          'ANONYMIZATION_FAILED',
          anonymizationResult?.error || 'Failed to anonymize patient'
        );
      }

      c.header('X-Data-Classification', 'sensitive');
      c.header('X-LGPD-Compliance', 'true');
      c.header('X-LGPD-Erasure', 'true');

      return ok(c, {
        success: true,
        result: anonymizationResult,
        executedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error anonymizing patient:', error);
      return serverError(c, 'Failed to anonymize patient');
    }
  }
);

/**
 * POST /consent/anonymization/auto-job
 * Run automatic anonymization batch job
 * LGPD compliance - processes eligible patients in batches
 */
app.post(
  '/anonymization/auto-job',
  requireAuth, // In production, use service role or API key
  async (c: Context) => {
    try {
      // const userId = c.get('userId');
      const batchSize = 10; // Default batch size

      // Execute automated anonymization job
      const result = await prisma.$queryRaw<Array<{ auto_anonymize_patients_job: any }>>`
        SELECT auto_anonymize_patients_job(${batchSize})
      `;

      const jobResult = result[0]?.auto_anonymize_patients_job;

      c.header('X-Data-Classification', 'sensitive');
      c.header('X-LGPD-Compliance', 'true');

      return ok(c, {
        success: true,
        jobResult,
        executedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error executing auto-anonymization job:', error);
      return serverError(c, 'Failed to execute auto-anonymization job');
    }
  }
);

export default app;
