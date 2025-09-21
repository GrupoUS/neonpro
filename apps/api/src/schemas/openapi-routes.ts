/**
 * OpenAPI Route Definitions for NeonPro Aesthetic Clinic API
 *
 * This module defines OpenAPI route specifications using @hono/zod-openapi
 * for automatic documentation generation and type-safe API contracts.
 */

import { createRoute } from '@hono/zod-openapi';
import { z } from '@hono/zod-openapi';
import {
  ApiInfoResponseSchema,
  AppointmentsListResponseSchema,
  AuthStatusResponseSchema,
  ClientDetailResponseSchema,
  ClientIdParamSchema,
  ClientsListResponseSchema,
  CommonResponses,
  DetailedHealthResponseSchema,
  HealthResponseSchema,
} from '../schemas/openapi-schemas';

// Parameter schemas
export const PatientIdParamSchema = z
  .object({
    patientId: z
      .string()
      .min(1)
      .openapi({
        param: {
          name: 'patientId',
          in: 'path',
          description: 'Patient unique identifier',
        },
        example: 'patient_123',
        description: 'Must be a valid patient ID',
      }),
  })
  .openapi('PatientIdParam');

// Health and system routes
export const _healthRoute = createRoute({
  method: 'get',
  path: '/health',
  summary: 'Basic Health Check',
  description: 'Simple health check endpoint for load balancers and monitoring',
  tags: ['System'],
  responses: {
    200: {
      description: 'Service is healthy',
      content: {
        'application/json': {
          schema: HealthResponseSchema,
        },
      },
    },
    ...CommonResponses,
  },
});

export const _detailedHealthRoute = createRoute({
  method: 'get',
  path: '/v1/health',
  summary: 'Detailed Health Check',
  description: 'Comprehensive health check with system diagnostics and environment info',
  tags: ['System'],
  responses: {
    200: {
      description: 'Detailed system health information',
      content: {
        'application/json': {
          schema: DetailedHealthResponseSchema,
        },
      },
    },
    ...CommonResponses,
  },
});

export const _apiInfoRoute = createRoute({
  method: 'get',
  path: '/v1/info',
  summary: 'API Information',
  description: 'Get API version, runtime information and deployment details',
  tags: ['System'],
  responses: {
    200: {
      description: 'API information',
      content: {
        'application/json': {
          schema: ApiInfoResponseSchema,
        },
      },
    },
    ...CommonResponses,
  },
});

// Authentication routes
export const _authStatusRoute = createRoute({
  method: 'get',
  path: '/v1/auth/status',
  summary: 'Authentication Status',
  description: 'Check authentication service availability',
  tags: ['Authentication'],
  responses: {
    200: {
      description: 'Authentication service status',
      content: {
        'application/json': {
          schema: AuthStatusResponseSchema,
        },
      },
    },
    ...CommonResponses,
  },
});

// Client management routes (LGPD compliant)
export const _listClientsRoute = createRoute({
  method: 'get',
  path: '/v1/clients',
  summary: 'List Clients',
  description:
    'Get a list of active aesthetic clinic clients with LGPD consent (professionals only)',
  tags: ['Clients'],
  security: [
    {
      BearerAuth: [],
    },
  ],
  responses: {
    200: {
      description: 'List of clients with LGPD consent',
      content: {
        'application/json': {
          schema: ClientsListResponseSchema,
        },
      },
    },
    ...CommonResponses,
  },
});

export const _getClientByIdRoute = createRoute({
  method: 'get',
  path: '/v1/clients/{clientId}',
  summary: 'Get Client Details',
  description:
    'Retrieve detailed information about a specific aesthetic clinic client (requires LGPD consent)',
  tags: ['Clients'],
  security: [
    {
      BearerAuth: [],
    },
  ],
  _request: {
    params: ClientIdParamSchema,
  },
  responses: {
    200: {
      description: 'Client details',
      content: {
        'application/json': {
          schema: ClientDetailResponseSchema,
        },
      },
    },
    ...CommonResponses,
  },
});

// Appointment management routes
export const _listAppointmentsRoute = createRoute({
  method: 'get',
  path: '/v1/appointments',
  summary: 'List Appointments',
  description: 'Get a list of appointments (LGPD consent validated for patient data)',
  tags: ['Appointments'],
  security: [
    {
      BearerAuth: [],
    },
  ],
  responses: {
    200: {
      description: 'List of appointments',
      content: {
        'application/json': {
          schema: AppointmentsListResponseSchema,
        },
      },
    },
    ...CommonResponses,
  },
});

export const _getClientAppointmentsRoute = createRoute({
  method: 'get',
  path: '/v1/appointments/client/{clientId}',
  summary: 'Get Client Appointments',
  description:
    'Retrieve appointments for a specific aesthetic clinic client (requires LGPD consent)',
  tags: ['Appointments'],
  security: [
    {
      BearerAuth: [],
    },
  ],
  _request: {
    params: ClientIdParamSchema,
  },
  responses: {
    200: {
      description: 'Client appointments',
      content: {
        'application/json': {
          schema: AppointmentsListResponseSchema,
        },
      },
    },
    ...CommonResponses,
  },
});

// Patient management routes
export const _listPatientsRoute = createRoute({
  method: 'get',
  path: '/v1/patients',
  summary: 'List Patients',
  description: 'Get a list of aesthetic clinic patients with pagination and filtering',
  tags: ['Patients'],
  security: [
    {
      BearerAuth: [],
    },
  ],
  responses: {
    200: {
      description: 'List of patients with pagination data',
      content: {
        'application/json': {
          schema: z.object({
            data: z
              .array(
                z.object({
                  id: z.string(),
                  fullName: z.string(),
                  familyName: z.string(),
                  email: z.string().email().optional(),
                  phone: z.string().optional(),
                  medicalRecordNumber: z.string(),
                  lgpdConsentGiven: z.boolean(),
                  isActive: z.boolean(),
                  createdAt: z.string(),
                  updatedAt: z.string(),
                  _count: z.object({
                    appointments: z.number(),
                  }),
                }),
              )
              .openapi('Patient'),
            pagination: z.object({
              page: z.number(),
              limit: z.number(),
              total: z.number(),
              totalPages: z.number(),
            }),
          }),
        },
      },
    },
    ...CommonResponses,
  },
});

export const _getPatientByIdRoute = createRoute({
  method: 'get',
  path: '/v1/patients/{patientId}',
  summary: 'Get Patient Details',
  description: 'Retrieve detailed information about a specific aesthetic clinic patient',
  tags: ['Patients'],
  security: [
    {
      BearerAuth: [],
    },
  ],
  _request: {
    params: PatientIdParamSchema,
  },
  responses: {
    200: {
      description: 'Patient details with appointments and consent records',
      content: {
        'application/json': {
          schema: z.object({
            id: z.string(),
            clinicId: z.string(),
            fullName: z.string(),
            familyName: z.string(),
            cpf: z.string().optional(),
            birthDate: z.string().optional(),
            phone: z.string().optional(),
            email: z.string().email().optional(),
            medicalRecordNumber: z.string(),
            lgpdConsentGiven: z.boolean(),
            dataConsentDate: z.string().optional(),
            isActive: z.boolean(),
            createdAt: z.string(),
            updatedAt: z.string(),
            appointments: z.array(
              z.object({
                id: z.string(),
                startTime: z.string(),
                status: z.string(),
                professional: z.object({
                  fullName: z.string(),
                }),
              }),
            ),
            consentRecords: z.array(
              z.object({
                id: z.string(),
                purpose: z.string(),
                status: z.string(),
                consentType: z.string(),
                legalBasis: z.string(),
                createdAt: z.string(),
                expiresAt: z.string(),
              }),
            ),
            _count: z.object({
              appointments: z.number(),
            }),
          }),
        },
      },
    },
    ...CommonResponses,
  },
});

export const _createPatientRoute = createRoute({
  method: 'post',
  path: '/v1/patients',
  summary: 'Create Patient',
  description: 'Create a new patient record in the aesthetic clinic system',
  tags: ['Patients'],
  security: [
    {
      BearerAuth: [],
    },
  ],
  _request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            clinicId: z.string().uuid(),
            fullName: z.string().min(2).max(100),
            familyName: z.string().min(1).max(50),
            cpf: z.string().optional(),
            birthDate: z.string().datetime().optional(),
            phone: z.string().optional(),
            email: z.string().email().optional(),
            lgpdConsentGiven: z.boolean().default(false),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Patient successfully created',
      content: {
        'application/json': {
          schema: z.object({
            id: z.string(),
            clinicId: z.string(),
            fullName: z.string(),
            familyName: z.string(),
            cpf: z.string().optional(),
            birthDate: z.string().optional(),
            phone: z.string().optional(),
            email: z.string().email().optional(),
            medicalRecordNumber: z.string(),
            lgpdConsentGiven: z.boolean(),
            dataConsentDate: z.string().optional(),
            isActive: z.boolean(),
            createdAt: z.string(),
            updatedAt: z.string(),
            _count: z.object({
              appointments: z.number(),
            }),
          }),
        },
      },
    },
    ...CommonResponses,
  },
});

export const _updatePatientRoute = createRoute({
  method: 'put',
  path: '/v1/patients/{patientId}',
  summary: 'Update Patient',
  description: 'Update an existing patient record in the aesthetic clinic system',
  tags: ['Patients'],
  security: [
    {
      BearerAuth: [],
    },
  ],
  _request: {
    params: PatientIdParamSchema,
    body: {
      content: {
        'application/json': {
          schema: z.object({
            id: z.string().uuid(),
            clinicId: z.string().uuid(),
            fullName: z.string().min(2).max(100),
            familyName: z.string().min(1).max(50),
            cpf: z.string().optional(),
            birthDate: z.string().datetime().optional(),
            phone: z.string().optional(),
            email: z.string().email().optional(),
            lgpdConsentGiven: z.boolean().default(false),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Patient successfully updated',
      content: {
        'application/json': {
          schema: z.object({
            id: z.string(),
            clinicId: z.string(),
            fullName: z.string(),
            familyName: z.string(),
            cpf: z.string().optional(),
            birthDate: z.string().optional(),
            phone: z.string().optional(),
            email: z.string().email().optional(),
            medicalRecordNumber: z.string(),
            lgpdConsentGiven: z.boolean(),
            dataConsentDate: z.string().optional(),
            isActive: z.boolean(),
            createdAt: z.string(),
            updatedAt: z.string(),
            _count: z.object({
              appointments: z.number(),
            }),
          }),
        },
      },
    },
    ...CommonResponses,
  },
});
