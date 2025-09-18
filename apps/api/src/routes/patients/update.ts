/**
 * PUT /api/v2/patients/{id} endpoint (T046)
 * Update patient information with change tracking
 * Integration with PatientService, AuditService, NotificationService
 */

import { validateBrazilianPhone as validatePhone, validateCEP, validateCPF } from '@neonpro/shared';
import { Hono } from 'hono';
import { z } from 'zod';
import { requireAuth } from '../../middleware/authn';
import { dataProtection } from '../../middleware/lgpd-middleware';
import { ComprehensiveAuditService } from '../../services/audit-service';
import { LGPDService } from '../../services/lgpd-service';
import { NotificationService } from '../../services/notification-service';
import { PatientService } from '../../services/patient-service';

const app = new Hono();

// Path parameters validation schema
const UpdatePatientParamsSchema = z.object({
  id: z.string().uuid('ID do paciente deve ser um UUID válido'),
});

// Address update validation schema
const AddressUpdateSchema = z.object({
  street: z.string().min(5).max(200).optional(),
  city: z.string().min(2).max(100).optional(),
  state: z.string().length(2).optional(),
  zipCode: z.string().refine(validateCEP, 'CEP inválido').optional(),
  complement: z.string().max(100).optional(),
}).optional();

// Healthcare info update validation schema
const HealthcareInfoUpdateSchema = z.object({
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  medicalHistory: z.array(z.string()).optional(),
  emergencyContact: z.object({
    name: z.string().min(2).max(100),
    phone: z.string().refine(validatePhone, 'Telefone inválido'),
    relationship: z.string().min(2).max(50),
  }).optional(),
}).optional();

// LGPD consent update validation schema
const LGPDConsentUpdateSchema = z.object({
  marketing: z.boolean().optional(),
  dataProcessing: z.boolean().optional(),
  dataSharing: z.boolean().optional(),
}).optional();

// Patient update validation schema
const UpdatePatientSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  cpf: z.string().refine(validateCPF, 'CPF inválido').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().refine(validatePhone, 'Telefone inválido').optional(),
  birthDate: z.string().datetime().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  address: AddressUpdateSchema,
  healthcareInfo: HealthcareInfoUpdateSchema,
  lgpdConsent: LGPDConsentUpdateSchema,
  notes: z.string().max(1000).optional(),
});

app.put('/:id', requireAuth, dataProtection.clientView, async c => {
  try {
    const userId = c.get('userId');
    const params = c.req.param();
    const body = await c.req.json();

    // Validate path parameters
    const paramsValidation = UpdatePatientParamsSchema.safeParse(params);
    if (!paramsValidation.success) {
      return c.json({
        success: false,
        error: 'Parâmetros inválidos',
        errors: paramsValidation.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      }, 400);
    }

    // Validate request body
    const bodyValidation = UpdatePatientSchema.safeParse(body);
    if (!bodyValidation.success) {
      return c.json({
        success: false,
        error: 'Dados de entrada inválidos',
        errors: bodyValidation.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      }, 400);
    }

    const { id: patientId } = paramsValidation.data;
    const updateData = bodyValidation.data;

    // Get client IP and User-Agent for audit logging
    const ipAddress = c.req.header('X-Real-IP') || c.req.header('X-Forwarded-For') || 'unknown';
    const userAgent = c.req.header('User-Agent') || 'unknown';
    const healthcareProfessional = c.req.header('X-Healthcare-Professional');
    const healthcareContext = c.req.header('X-Healthcare-Context');

    // Get changed fields for validation and audit
    const changedFields = Object.keys(updateData).filter(key => updateData[key] !== undefined);

    // Validate user access to update specific patient fields
    const patientService = new PatientService();
    const accessValidation = await patientService.validateAccess({
      userId,
      patientId,
      accessType: 'update',
      fields: changedFields,
    });

    if (!accessValidation.success) {
      return c.json({
        success: false,
        error: accessValidation.error,
        code: accessValidation.code,
      }, 403);
    }

    // Validate LGPD data update permissions
    const lgpdService = new LGPDService();
    if (
      updateData.lgpdConsent
      || changedFields.some(field => ['cpf', 'healthcareInfo'].includes(field))
    ) {
      const lgpdValidation = await lgpdService.validateDataUpdate({
        patientId,
        updateData,
        consentChanges: updateData.lgpdConsent,
      });

      if (!lgpdValidation.success) {
        return c.json({
          success: false,
          error: lgpdValidation.error,
          code: lgpdValidation.code,
        }, 403);
      }
    }

    // Get current patient data for change tracking
    const currentPatientResult = await patientService.getPatientById({
      patientId,
      userId,
    });

    if (!currentPatientResult.success) {
      if (currentPatientResult.code === 'PATIENT_NOT_FOUND') {
        return c.json({
          success: false,
          error: currentPatientResult.error,
          code: currentPatientResult.code,
        }, 404);
      }

      return c.json({
        success: false,
        error: currentPatientResult.error || 'Erro interno do serviço',
      }, 500);
    }

    const currentPatient = currentPatientResult.data;

    // Update patient using PatientService
    const result = await patientService.updatePatient({
      patientId,
      userId,
      updateData,
      healthcareProfessional,
      healthcareContext,
    });

    if (!result.success) {
      return c.json({
        success: false,
        error: result.error || 'Erro interno do serviço',
      }, 500);
    }

    const updatedPatient = result.data;

    // Track changes for audit
    const oldValues: Record<string, any> = {};
    const newValues: Record<string, any> = {};

    changedFields.forEach(field => {
      oldValues[field] = currentPatient[field];
      newValues[field] = updatedPatient[field];
    });

    // Determine sensitivity level based on changed fields
    const sensitiveFields = ['cpf', 'healthcareInfo', 'lgpdConsent'];
    const sensitivityLevel = changedFields.some(field => sensitiveFields.includes(field))
      ? 'critical'
      : 'high';

    // Log patient update activity
    const auditService = new AuditService();
    await auditService.logActivity({
      userId,
      action: 'patient_data_update',
      resourceType: 'patient',
      resourceId: patientId,
      details: {
        changedFields,
        oldValues,
        newValues,
        reason: 'Patient data update',
        sensitiveDataChanged: changedFields.some(field => sensitiveFields.includes(field)),
        healthcareProfessional,
        healthcareContext,
      },
      ipAddress,
      userAgent,
      complianceContext: 'LGPD',
      sensitivityLevel,
    }).catch(err => {
      console.error('Audit logging failed:', err);
    });

    // Update LGPD consent record if consent was changed
    if (updateData.lgpdConsent) {
      await lgpdService.updateConsentRecord({
        patientId,
        consentChanges: updateData.lgpdConsent,
        reason: 'Patient consent update',
        updatedBy: userId,
      }).catch(err => {
        console.error('Failed to update consent record:', err);
      });
    }

    // Send update notification
    const notificationService = new NotificationService();
    if (updatedPatient.email && updatedPatient.lgpdConsent?.marketing !== false) {
      await notificationService.sendNotification({
        recipientId: patientId,
        channel: 'email',
        templateId: 'patient_data_updated',
        data: {
          patientName: updatedPatient.name,
          updatedFields: changedFields,
          updateDate: new Date().toISOString(),
        },
        priority: 'medium',
        lgpdConsent: true,
      }).catch(err => {
        console.error('Update notification failed:', err);
      });
    }

    // Set response headers
    c.header('Last-Modified', updatedPatient.updatedAt);
    c.header('X-Updated-Fields', changedFields.join(','));
    c.header('X-CFM-Compliant', 'true');
    c.header('X-Medical-Record-Updated', 'true');
    c.header('X-LGPD-Compliant', 'true');

    // Handle consent withdrawal
    if (updateData.lgpdConsent?.dataProcessing === false) {
      c.header('X-Consent-Withdrawn', 'data_processing');
      c.header('X-Data-Retention-Review', 'required');
    }

    return c.json({
      success: true,
      data: updatedPatient,
      message: 'Paciente atualizado com sucesso',
    });
  } catch (error) {
    console.error('Error updating patient:', error);

    return c.json({
      success: false,
      error: 'Erro interno do servidor',
    }, 500);
  }
});

export default app;
