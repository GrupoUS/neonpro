/**
 * OpenAPI Route Definitions for NeonPro Healthcare API
 * 
 * This module defines OpenAPI route specifications using @hono/zod-openapi
 * for automatic documentation generation and type-safe API contracts.
 */

import { createRoute } from '@hono/zod-openapi'
import {
  HealthResponseSchema,
  DetailedHealthResponseSchema,
  ApiInfoResponseSchema,
  PatientsListResponseSchema,
  PatientDetailResponseSchema,
  PatientIdParamSchema,
  AppointmentsListResponseSchema,
  AuthStatusResponseSchema,
  CommonResponses
} from '../schemas/openapi-schemas'

// Health and system routes
export const healthRoute = createRoute({
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
          schema: HealthResponseSchema
        }
      }
    },
    ...CommonResponses
  }
})

export const detailedHealthRoute = createRoute({
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
          schema: DetailedHealthResponseSchema
        }
      }
    },
    ...CommonResponses
  }
})

export const apiInfoRoute = createRoute({
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
          schema: ApiInfoResponseSchema
        }
      }
    },
    ...CommonResponses
  }
})

// Authentication routes
export const authStatusRoute = createRoute({
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
          schema: AuthStatusResponseSchema
        }
      }
    },
    ...CommonResponses
  }
})

// Patient management routes (LGPD compliant)
export const listPatientsRoute = createRoute({
  method: 'get',
  path: '/v1/patients',
  summary: 'List Patients',
  description: 'Get a list of active patients with LGPD consent (healthcare professionals only)',
  tags: ['Patients'],
  security: [
    {
      BearerAuth: []
    }
  ],
  responses: {
    200: {
      description: 'List of patients with LGPD consent',
      content: {
        'application/json': {
          schema: PatientsListResponseSchema
        }
      }
    },
    ...CommonResponses
  }
})

export const getPatientByIdRoute = createRoute({
  method: 'get',
  path: '/v1/patients/{patientId}',
  summary: 'Get Patient Details',
  description: 'Retrieve detailed information about a specific patient (requires LGPD consent)',
  tags: ['Patients'],
  security: [
    {
      BearerAuth: []
    }
  ],
  request: {
    params: PatientIdParamSchema
  },
  responses: {
    200: {
      description: 'Patient details',
      content: {
        'application/json': {
          schema: PatientDetailResponseSchema
        }
      }
    },
    ...CommonResponses
  }
})

// Appointment management routes
export const listAppointmentsRoute = createRoute({
  method: 'get',
  path: '/v1/appointments',
  summary: 'List Appointments',
  description: 'Get a list of appointments (LGPD consent validated for patient data)',
  tags: ['Appointments'],
  security: [
    {
      BearerAuth: []
    }
  ],
  responses: {
    200: {
      description: 'List of appointments',
      content: {
        'application/json': {
          schema: AppointmentsListResponseSchema
        }
      }
    },
    ...CommonResponses
  }
})

export const getPatientAppointmentsRoute = createRoute({
  method: 'get',
  path: '/v1/appointments/patient/{patientId}',
  summary: 'Get Patient Appointments',
  description: 'Retrieve appointments for a specific patient (requires LGPD consent)',
  tags: ['Appointments'],
  security: [
    {
      BearerAuth: []
    }
  ],
  request: {
    params: PatientIdParamSchema
  },
  responses: {
    200: {
      description: 'Patient appointments',
      content: {
        'application/json': {
          schema: AppointmentsListResponseSchema
        }
      }
    },
    ...CommonResponses
  }
})