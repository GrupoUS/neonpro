/**
 * POST /api/v2/patients endpoint (T044)
 * Create new patient with comprehensive validation
 * Integration with PatientService, AuditService, NotificationService
 * OpenAPI documented with healthcare compliance
 */

import { OpenAPIHono } from '@hono/zod-openapi';
import { validateBrazilianPhone as validatePhone, validateCEP, validateCPF } from '@neonpro/shared';
import { z } from 'zod';
import { createHealthcareRoute, HealthcareSchemas } from '../../lib/openapi-generator';
import { requireAuth } from '../../middleware/authn';
import { dataProtection } from '../../middleware/lgpd-middleware';
import { ComprehensiveAuditService } from '../../services/audit-service';
import { LGPDService } from '../../services/lgpd-service';
import { NotificationService } from '../../services/notification-service';
import { PatientService } from '../../services/patient-service';

const app = new OpenAPIHono();

// Address validation schema
const AddressSchema = z.object({
  street: z.string().min(5).max(200),
  city: z.string().min(2).max(100),
  state: z.string().length(2),
  zipCode: z.string().refine(validateCEP, 'CEP inválido'),
  complement: z.string().max(100).optional(),
});

// Healthcare info validation schema
const HealthcareInfoSchema = z.object({
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  medicalHistory: z.array(z.string()).optional(),
  emergencyContact: z.object({
    name: z.string().min(2).max(100),
    phone: z.string().refine(validatePhone, 'Telefone inválido'),
    relationship: z.string().min(2).max(50),
  }).optional(),
});

// LGPD consent validation schema
const LGPDConsentSchema = z.object({
  dataProcessing: z.boolean().refine(
    val => val === true,
    'Consentimento para processamento de dados é obrigatório',
  ),
  marketing: z.boolean().optional(),
  dataSharing: z.boolean().optional(),
  consentDate: z.string().datetime().optional(),
});

// Patient creation validation schema
const CreatePatientSchema = z.object({
  name: z.string().min(2).max(100),
  cpf: z.string().refine(validateCPF, 'CPF inválido').optional(),
  email: z.string().email('Email inválido'),
  phone: z.string().refine(validatePhone, 'Telefone inválido').optional(),
  birthDate: z.string().datetime().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  address: AddressSchema.optional(),
  healthcareInfo: HealthcareInfoSchema.optional(),
  lgpdConsent: LGPDConsentSchema,
  notes: z.string().max(1000).optional(),
});

// Patient response schema
const PatientResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  birthDate: z.string().datetime().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  address: AddressSchema.optional(),
  healthcareInfo: HealthcareInfoSchema.optional(),
  lgpdConsent: LGPDConsentSchema,
  notes: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// OpenAPI route definition
const createPatientRoute = createHealthcareRoute({
  method: 'post',
  path: '/',
  tags: ['Patients'],
  summary: 'Create new patient',
  description: 'Create a new patient record with comprehensive validation and LGPD compliance',
  dataClassification: 'medical',
  auditRequired: true,
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreatePatientSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Patient created successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: PatientResponseSchema,
            message: z.string(),
          }),
        },
      },
    },
    400: {
      description: 'Validation error',
      content: {
        'application/json': {
          schema: HealthcareSchemas.ErrorResponse,
        },
      },
    },
    409: {
      description: 'Patient already exists (duplicate CPF)',
      content: {
        'application/json': {
          schema: HealthcareSchemas.ErrorResponse,
        },
      },
    },
  },
});

app.openapi(createPatientRoute, requireAuth, dataProtection.clientView, async c => {
  try {
    const userId = c.get('userId');
    // TODO: Implement patient creation logic
    // const body = await c.req.json();

    // Get validated data from OpenAPI request
    const patientData = c.req.valid('json');

    // Get client IP and User-Agent for audit logging
    const ipAddress = c.req.header('X-Real-IP') || c.req.header('X-Forwarded-For') || 'unknown';
    const userAgent = c.req.header('User-Agent') || 'unknown';
    const healthcareProfessional = c.req.header('X-Healthcare-Professional');

    // Validate LGPD consent
    const lgpdService = new LGPDService();
    const consentValidation = await lgpdService.validateConsent({
      consentData: patientData.lgpdConsent,
      dataCategories: ['personal_data', 'health_data'],
      purpose: 'healthcare_management',
    });

    if (!consentValidation.success) {
      return c.json({
        success: false,
        error: 'Consentimento LGPD inválido',
        details: consentValidation.error,
      }, 400);
    }

    // Create patient using PatientService
    const patientService = new PatientService();
    const result = await patientService.createPatient({
      userId,
      patientData,
      healthcareProfessional,
    });

    if (!result.success) {
      if (result.code === 'DUPLICATE_CPF') {
        return c.json({
          success: false,
          error: result.error,
          code: result.code,
        }, 409);
      }

      return c.json({
        success: false,
        error: result.error || 'Erro interno do serviço',
      }, 500);
    }

    const createdPatient = result.data;

    // Create LGPD consent record
    await lgpdService.createConsentRecord({
      patientId: createdPatient.id,
      consentData: patientData.lgpdConsent,
      legalBasis: 'consent',
      collectionMethod: 'online_form',
    }).catch(err => {
      console.error('Failed to create consent record:', err);
    });

    // Log patient creation activity
    const auditService = new ComprehensiveAuditService();
    await auditService.logEvent(
      'patient_create',
      {
        patientName: createdPatient.name,
        dataCategories: [
          'personal_data',
          'contact_data',
          ...(patientData.healthcareInfo ? ['health_data'] : []),
        ],
        consentGiven: true,
        healthcareProfessional,
      },
      {
        userId,
        ipAddress,
        userAgent,
        patientId: createdPatient.id,
        complianceFlags: {
          lgpd_compliant: true,
          rls_enforced: true,
          consent_validated: true,
        },
      },
    ).catch(err => {
      console.error('Audit logging failed:', err);
    });

    // Send welcome notification
    const notificationService = new NotificationService();
    if (createdPatient.email && patientData.lgpdConsent.marketing !== false) {
      await notificationService.sendNotification({
        recipientId: createdPatient.id,
        channel: 'email',
        templateId: 'patient_welcome',
        data: {
          patientName: createdPatient.name,
          clinicName: 'NeonPro Clinic', // This should come from clinic settings
        },
        priority: 'medium',
        lgpdConsent: true,
      }).catch(err => {
        console.error('Welcome notification failed:', err);
      });
    }

    // Set response headers
    c.header('Location', `/api/v2/patients/${createdPatient.id}`);
    c.header('X-CFM-Compliant', 'true');
    c.header('X-Medical-Record-Created', 'true');
    c.header('X-LGPD-Compliant', 'true');

    return c.json({
      success: true,
      data: createdPatient,
      message: 'Paciente criado com sucesso',
    }, 201);
  } catch (error) {
    console.error('Error creating patient:', error);

    return c.json({
      success: false,
      error: 'Erro interno do servidor',
    }, 500);
  }
});

export default app;
