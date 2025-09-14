/**
 * OpenAPI Route Definitions for NeonPro Aesthetic Clinic API
 * 
 * This module defines OpenAPI route specifications using @hono/zod-openapi
 * for automatic documentation generation and type-safe API contracts.
 */

import { createRoute } from '@hono/zod-openapi'
import { z } from '@hono/zod-openapi'
import {
  HealthResponseSchema,
  DetailedHealthResponseSchema,
  ApiInfoResponseSchema,
  ClientsListResponseSchema,
  ClientDetailResponseSchema,
  ClientIdParamSchema,
  AppointmentsListResponseSchema,
  AuthStatusResponseSchema,
  CommonResponses
} from '../schemas/openapi-schemas'

// Parameter schemas
export const PatientIdParamSchema = z.object({
  patientId: z.string().min(1).openapi({
    param: {
      name: 'patientId',
      in: 'path',
      description: 'Patient unique identifier'
    },
    example: 'patient_123',
    description: 'Must be a valid patient ID'
  })
}).openapi('PatientIdParam')

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

// Client management routes (LGPD compliant)
export const listClientsRoute = createRoute({
  method: 'get',
  path: '/v1/clients',
  summary: 'List Clients',
  description: 'Get a list of active aesthetic clinic clients with LGPD consent (professionals only)',
  tags: ['Clients'],
  security: [
    {
      BearerAuth: []
    }
  ],
  responses: {
    200: {
      description: 'List of clients with LGPD consent',
      content: {
        'application/json': {
          schema: ClientsListResponseSchema
        }
      }
    },
    ...CommonResponses
  }
})

export const getClientByIdRoute = createRoute({
  method: 'get',
  path: '/v1/clients/{clientId}',
  summary: 'Get Client Details',
  description: 'Retrieve detailed information about a specific aesthetic clinic client (requires LGPD consent)',
  tags: ['Clients'],
  security: [
    {
      BearerAuth: []
    }
  ],
  request: {
    params: ClientIdParamSchema
  },
  responses: {
    200: {
      description: 'Client details',
      content: {
        'application/json': {
          schema: ClientDetailResponseSchema
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

export const getClientAppointmentsRoute = createRoute({
  method: 'get',
  path: '/v1/appointments/client/{clientId}',
  summary: 'Get Client Appointments',
  description: 'Retrieve appointments for a specific aesthetic clinic client (requires LGPD consent)',
  tags: ['Appointments'],
  security: [
    {
      BearerAuth: []
    }
  ],
  request: {
    params: ClientIdParamSchema
  },
  responses: {
    200: {
      description: 'Client appointments',
      content: {
        'application/json': {
          schema: AppointmentsListResponseSchema
        }
      }
    },
    ...CommonResponses
  }
})