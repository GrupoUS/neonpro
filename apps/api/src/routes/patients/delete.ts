/**
 * DELETE /api/v2/patients/{id} endpoint (T047)
 * Soft delete with LGPD compliance (anonymization vs deletion)
 * Integration with PatientService, LGPDService, AuditService, NotificationService
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { requireAuth } from '../../middleware/authn';
import { dataProtection } from '../../middleware/lgpd-middleware';
import { LGPDService } from '../../services/lgpd-service';
import { NotificationService } from '../../services/notification-service';
import { PatientService } from '../../services/patient-service';

const app = new Hono();

// Path parameters validation schema
const DeletePatientParamsSchema = z.object({
  id: z.string().uuid('ID do paciente deve ser um UUID válido'),
});

// Query parameters validation schema
const DeletePatientQuerySchema = z.object({
  deletion_type: z
    .enum([
      'soft_delete',
      'hard_delete',
      'anonymization',
      'data_subject_request',
    ])
    .optional(),
  reason: z.string().max(200).optional(),
  schedule_anonymization: z.coerce.boolean().optional(),
});

app.delete('/:id', requireAuth, dataProtection.clientView, async c => {
  try {
    const userId = c.get('userId');
    const params = c.req.param();
    const query = c.req.query();

    // Validate path parameters
    const paramsValidation = DeletePatientParamsSchema.safeParse(params);
    if (!paramsValidation.success) {
      return c.json(
        {
          success: false,
          error: 'Parâmetros inválidos',
          errors: paramsValidation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        400,
      );
    }

    // Validate query parameters
    const queryValidation = DeletePatientQuerySchema.safeParse(query);
    if (!queryValidation.success) {
      return c.json(
        {
          success: false,
          error: 'Parâmetros de consulta inválidos',
          errors: queryValidation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        400,
      );
    }

    const { id: patientId } = paramsValidation.data;
    const { deletion_type, reason } = queryValidation.data;

    // Get client IP and User-Agent for audit logging
    const ipAddress = c.req.header('X-Real-IP') || c.req.header('X-Forwarded-For') || 'unknown';
    const userAgent = c.req.header('User-Agent') || 'unknown';
    const healthcareProfessional = c.req.header('X-Healthcare-Professional');
    const lgpdRequest = c.req.header('X-LGPD-Request');
    const _adminOverride = c.req.header('X-Admin-Override');
    const medicalDeviceData = c.req.header('X-Medical-Device-Data');

    // Get patient data first
    const patientService = new PatientService();
    const patientResult = await patientService.getPatientById({
      patientId,
      userId,
    });

    if (!patientResult.success) {
      if (patientResult.code === 'PATIENT_NOT_FOUND') {
        return c.json(
          {
            success: false,
            error: patientResult.error,
            code: patientResult.code,
          },
          404,
        );
      }

      return c.json(
        {
          success: false,
          error: patientResult.error || 'Erro interno do serviço',
        },
        500,
      );
    }

    const patient = patientResult.data;

    // Validate user access to delete specific patient
    const accessValidation = await patientService.validateAccess({
      userId,
      patientId,
      accessType: 'delete',
    });

    if (!accessValidation.success) {
      return c.json(
        {
          success: false,
          error: accessValidation.error,
          code: accessValidation.code,
        },
        403,
      );
    }

    // Determine deletion type and reason
    const deletionReason = reason
      || (lgpdRequest === 'data_subject_deletion'
        ? 'data_subject_request'
        : 'administrative_deletion');
    const requestedDeletionType = deletion_type
      || (lgpdRequest === 'data_subject_deletion'
        ? 'data_subject_request'
        : 'soft_delete');

    // Validate LGPD deletion request
    const lgpdService = new LGPDService();
    const lgpdValidation = await lgpdService.validateDeletionRequest({
      patientId,
      requestedBy: userId,
      deletionReason,
      dataCategories: ['personal_data', 'health_data', 'contact_data'],
      deletionType: requestedDeletionType,
    });

    if (!lgpdValidation.success) {
      return c.json(
        {
          success: false,
          error: lgpdValidation.error,
          code: lgpdValidation.code,
        },
        403,
      );
    }

    const {
      deletionAllowed,
      deletionType,
      retentionRequired,
      retentionPeriod,
      anonymizationDate,
    } = lgpdValidation.data;

    if (!deletionAllowed) {
      return c.json(
        {
          success: false,
          error: 'Exclusão não permitida por política LGPD',
          code: 'LGPD_DELETION_DENIED',
        },
        403,
      );
    }

    // Process deletion based on type
    let deletionResult;

    if (
      deletionType === 'anonymization'
      || deletionType === 'data_subject_request'
    ) {
      // Process anonymization
      const anonymizationResult = await lgpdService.anonymizePatientData({
        patientId,
        anonymizationLevel: 'full',
        preserveStatistics: true,
      });

      if (!anonymizationResult.success) {
        return c.json(
          {
            success: false,
            error: 'Falha na anonimização dos dados',
          },
          500,
        );
      }

      deletionResult = {
        success: true,
        data: {
          id: patientId,
          deletionType: 'anonymization',
          anonymizationId: anonymizationResult.data.anonymizationId,
          anonymizedFields: anonymizationResult.data.anonymizedFields,
          completedAt: anonymizationResult.data.completedAt,
        },
      };
    } else {
      // Process soft or hard delete
      deletionResult = await patientService.deletePatient({
        patientId,
        userId,
        deletionType,
        deletionReason,
        healthcareProfessional,
        retentionPeriod,
      });
    }

    if (!deletionResult.success) {
      return c.json(
        {
          success: false,
          error: deletionResult.error || 'Erro interno do serviço',
        },
        500,
      );
    }

    // Process LGPD data deletion
    await lgpdService
      .processDataDeletion({
        patientId,
        deletionType: requestedDeletionType,
        requestedBy: userId,
        reason: deletionReason,
      })
      .catch(err => {
        console.error('LGPD data deletion processing failed:', err);
      });

    // Log deletion activity
    const auditService = new AuditService();
    const auditAction = deletionType === 'anonymization'
      ? 'patient_anonymization'
      : 'patient_deletion';

    await auditService
      .logActivity({
        userId,
        action: auditAction,
        resourceType: 'patient',
        resourceId: patientId,
        details: {
          deletionType,
          patientName: patient.name,
          retentionPeriod,
          deletionReason,
          lgpdCompliant: true,
          auditTrailPreserved: true,
          deletionCompliant: true,
          anonymizationLevel: deletionType === 'anonymization' ? 'full' : undefined,
          healthcareProfessional,
        },
        ipAddress,
        userAgent,
        complianceContext: 'LGPD',
        sensitivityLevel: 'critical',
      })
      .catch(err => {
        console.error('Audit logging failed:', err);
      });

    // Send deletion confirmation notification
    const notificationService = new NotificationService();
    if (patient.email && patient.lgpdConsent?.marketing !== false) {
      await notificationService
        .sendNotification({
          recipientId: patientId,
          channel: 'email',
          templateId: 'patient_data_deletion',
          data: {
            patientName: patient.name,
            deletionType,
            retentionPeriod: retentionPeriod || 'N/A',
            deletionDate: new Date().toISOString(),
          },
          priority: 'high',
          lgpdConsent: true,
        })
        .catch(err => {
          console.error('Deletion notification failed:', err);
        });
    }

    // Set response headers
    c.header('X-Deletion-Type', deletionType);
    c.header('X-LGPD-Compliant', 'true');
    c.header('X-Deletion-Confirmed', 'true');
    c.header('X-CFM-Compliant', 'true');
    c.header(
      'X-Medical-Record-Retention',
      retentionRequired ? 'required' : 'not-required',
    );

    if (retentionPeriod) {
      c.header('X-Retention-Period', retentionPeriod);
    }

    if (deletionType === 'hard_delete') {
      c.header('X-Hard-Delete', 'confirmed');
    }

    if (anonymizationDate) {
      c.header('X-Anonymization-Scheduled', anonymizationDate);
    }

    if (medicalDeviceData === 'true') {
      c.header('X-ANVISA-Retention', 'required');
      c.header('X-Device-Data-Preserved', 'true');
    }

    // Determine retention period for CFM compliance
    const cfmRetentionPeriod = retentionPeriod === '20 years' ? '20 years' : '7 years';
    if (cfmRetentionPeriod === '20 years') {
      c.header('X-CFM-Retention', 'required');
    }

    return c.json({
      success: true,
      data: deletionResult.data,
      message: 'Paciente removido com sucesso',
    });
  } catch (error) {
    console.error('Error deleting patient:', error);

    return c.json(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      500,
    );
  }
});

export default app;
