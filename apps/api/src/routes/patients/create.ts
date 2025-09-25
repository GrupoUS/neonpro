/**
 * POST /api/v2/patients endpoint (T044)
 * Create new patient with comprehensive validation
 * Integration with PatientService, AuditService, NotificationService
 * OpenAPI documented with healthcare compliance
 */

import { OpenAPIHono } from '@hono/zod-openapi'
import { validateBrazilianPhone as validatePhone, validateCEP, validateCPF } from '@neonpro/shared'
import { createHealthcareRoute, HealthcareSchemas } from '../../lib/openapi-generator'
import { requireAuth } from '../../middleware/authn'
import { dataProtection } from '../../middleware/lgpd-middleware'
import { ComprehensiveAuditService } from '../../services/audit-service'
import { LGPDService } from '../../services/lgpd-service'
import { NotificationService } from '../../services/notification-service'
import { PatientService } from '../../services/patient-service'
import * as v from 'valibot'

const app = new OpenAPIHono()

// Address validation schema
const AddressSchema = v.object({
  street: v.string([v.minLength(5), v.maxLength(200)]),
  city: v.string([v.minLength(2), v.maxLength(100)]),
  state: v.string([v.minLength(2), v.maxLength(2)]),
  zipCode: v.string([v.custom(validateCEP, 'CEP inválido')]),
  complement: v.optional(v.string([v.maxLength(100)])),
})

// Healthcare info validation schema
const HealthcareInfoSchema = v.object({
  allergies: v.optional(v.array(v.string())),
  medications: v.optional(v.array(v.string())),
  medicalHistory: v.optional(v.array(v.string())),
  emergencyContact: v.optional(
    v.object({
      name: v.string([v.minLength(2), v.maxLength(100)]),
      phone: v.string([v.custom(validatePhone, 'Telefone inválido')]),
      relationship: v.string([v.minLength(2), v.maxLength(50)]),
    }),
  ),
})

// LGPD consent validation schema
const LGPDConsentSchema = v.object({
  dataProcessing: v.boolean([
    v.custom(
      val => val === true,
      'Consentimento para processamento de dados é obrigatório',
    ),
  ]),
  marketing: v.optional(v.boolean()),
  dataSharing: v.optional(v.boolean()),
  consentDate: v.optional(v.string([v.datetime()])),
})

// Patient creation validation schema
const CreatePatientSchema = v.object({
  name: v.string([v.minLength(2), v.maxLength(100)]),
  cpf: v.optional(v.string([v.custom(validateCPF, 'CPF inválido')])),
  email: v.string([v.email('Email inválido')]),
  phone: v.optional(v.string([v.custom(validatePhone, 'Telefone inválido')])),
  birthDate: v.optional(v.string([v.datetime()])),
  gender: v.optional(v.picklist(['male', 'female', 'other'])),
  address: v.optional(AddressSchema),
  healthcareInfo: v.optional(HealthcareInfoSchema),
  lgpdConsent: LGPDConsentSchema,
  notes: v.optional(v.string([v.maxLength(1000)])),
})

// Patient response schema
const PatientResponseSchema = v.object({
  id: v.string([v.uuid()]),
  name: v.string(),
  email: v.string([v.email()]),
  phone: v.optional(v.string()),
  cpf: v.optional(v.string()),
  birthDate: v.optional(v.string([v.datetime()])),
  gender: v.optional(v.picklist(['male', 'female', 'other'])),
  address: v.optional(AddressSchema),
  healthcareInfo: v.optional(HealthcareInfoSchema),
  lgpdConsent: LGPDConsentSchema,
  notes: v.optional(v.string()),
  createdAt: v.string([v.datetime()]),
  updatedAt: v.string([v.datetime()]),
})

// OpenAPI route definition
const createPatientRoute = createHealthcareRoute({
  method: 'post',
  path: '/',
  tags: ['Patients'],
  summary: 'Create new patient',
  description: 'Create a new patient record with comprehensive validation and LGPD compliance',
  dataClassification: 'medical',
  auditRequired: true,
  _request: {
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
          schema: v.object({
            success: v.literal(true),
            data: PatientResponseSchema,
            message: v.string(),
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
})

app.openapi(
  createPatientRoute,
  requireAuth,
  dataProtection.clientView,
  async c => {
    try {
      const userId = c.get('userId')
      // TODO: Implement patient creation logic
      // const body = await c.req.json();

      // Get validated data from OpenAPI request
      const patientData = c.req.valid('json')

      // Get client IP and User-Agent for audit logging
      const ipAddress = c.req.header('X-Real-IP') ||
        c.req.header('X-Forwarded-For') ||
        'unknown'
      const userAgent = c.req.header('User-Agent') || 'unknown'
      const healthcareProfessional = c.req.header('X-Healthcare-Professional')

      // Validate LGPD consent
      const lgpdService = new LGPDService()
      const consentValidation = await lgpdService.validateConsent({
        consentData: patientData.lgpdConsent,
        dataCategories: ['personal_data', 'health_data'],
        purpose: 'healthcare_management',
      })

      if (!consentValidation.success) {
        return c.json(
          {
            success: false,
            error: 'Consentimento LGPD inválido',
            details: consentValidation.error,
          },
          400,
        )
      }

      // Create patient using PatientService
      const patientService = new PatientService()
      const result = await patientService.createPatient({
        userId,
        patientData,
        healthcareProfessional,
      })

      if (!result.success) {
        if (result.code === 'DUPLICATE_CPF') {
          return c.json(
            {
              success: false,
              error: result.error,
              code: result.code,
            },
            409,
          )
        }

        return c.json(
          {
            success: false,
            error: result.error || 'Erro interno do serviço',
          },
          500,
        )
      }

      const createdPatient = result.data

      // Create LGPD consent record
      await lgpdService
        .createConsentRecord({
          patientId: createdPatient.id,
          consentData: patientData.lgpdConsent,
          legalBasis: 'consent',
          collectionMethod: 'online_form',
        })
        .catch(err => {
          console.error('Failed to create consent record:', err)
        })

      // Log patient creation activity
      const auditService = new ComprehensiveAuditService()
      await auditService
        .logEvent(
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
        )
        .catch(err => {
          console.error('Audit logging failed:', err)
        })

      // Send welcome notification
      const notificationService = new NotificationService()
      if (createdPatient.email && patientData.lgpdConsent.marketing !== false) {
        await notificationService
          .sendNotification({
            recipientId: createdPatient.id,
            channel: 'email',
            templateId: 'patient_welcome',
            data: {
              patientName: createdPatient.name,
              clinicName: 'NeonPro Clinic', // This should come from clinic settings
            },
            priority: 'medium',
            lgpdConsent: true,
          })
          .catch(err => {
            console.error('Welcome notification failed:', err)
          })
      }

      // Set response headers
      c.header('Location', `/api/v2/patients/${createdPatient.id}`)
      c.header('X-CFM-Compliant', 'true')
      c.header('X-Medical-Record-Created', 'true')
      c.header('X-LGPD-Compliant', 'true')

      return c.json(
        {
          success: true,
          data: createdPatient,
          message: 'Paciente criado com sucesso',
        },
        201,
      )
    } catch (error) {
      console.error('Error creating patient:', error)

      return c.json(
        {
          success: false,
          error: 'Erro interno do servidor',
        },
        500,
      )
    }
  },
)

export default app
