/**
 * OpenAPI Schema Definitions for NeonPro Aesthetic Clinic API
 * 
 * This module defines Zod schemas for all API endpoints with aesthetic clinic-specific
 * validation and OpenAPI documentation metadata for LGPD compliance.
 */

import { z } from '@hono/zod-openapi'

// Base response schemas
export const ErrorResponseSchema = z.object({
  error: z.string().openapi({
    description: 'Error message describing what went wrong',
    example: 'Client not found'
  }),
  code: z.string().optional().openapi({
    description: 'Error code for programmatic handling (e.g., LGPD_CONSENT_REQUIRED)',
    example: 'LGPD_CONSENT_REQUIRED'
  }),
  timestamp: z.string().optional().openapi({
    description: 'ISO timestamp when error occurred',
    example: '2025-01-11T12:00:00.000Z'
  })
}).openapi('ErrorResponse')

export const HealthResponseSchema = z.object({
  status: z.literal('ok').openapi({
    description: 'Health status indicator',
    example: 'ok'
  })
}).openapi('HealthResponse')

export const DetailedHealthResponseSchema = z.object({
  status: z.literal('healthy').openapi({
    description: 'Detailed health status',
    example: 'healthy'
  }),
  version: z.string().openapi({
    description: 'API version',
    example: 'v1'
  }),
  uptime: z.number().openapi({
    description: 'Server uptime in seconds',
    example: 3600.5
  }),
  timestamp: z.string().openapi({
    description: 'Current server timestamp',
    example: '2025-01-11T12:00:00.000Z'
  }),
  environment: z.object({
    isProduction: z.boolean(),
    hasDatabase: z.boolean(),
    hasSupabase: z.boolean(),
    region: z.string().optional(),
    version: z.string().optional()
  }).openapi({
    description: 'Environment information for system diagnostics'
  })
}).openapi('DetailedHealthResponse')

export const ApiInfoResponseSchema = z.object({
  name: z.string().openapi({
    description: 'API service name',
    example: 'NeonPro API'
  }),
  version: z.string().openapi({
    description: 'API version',
    example: 'v1'
  }),
  runtime: z.string().openapi({
    description: 'Runtime environment',
    example: 'node'
  }),
  environment: z.string().openapi({
    description: 'Deployment environment',
    example: 'production'
  }),
  region: z.string().openapi({
    description: 'Deployment region',
    example: 'us-east-1'
  }),
  timestamp: z.string().openapi({
    description: 'Current timestamp',
    example: '2025-01-11T12:00:00.000Z'
  })
}).openapi('ApiInfoResponse')

// Healthcare-specific schemas
export const ClinicSchema = z.object({
  id: z.string().openapi({
    description: 'Unique clinic identifier',
    example: 'clinic_123'
  }),
  name: z.string().openapi({
    description: 'Clinic name',
    example: 'Clínica Estética São Paulo'
  })
}).openapi('Clinic')

export const ProfessionalSchema = z.object({
  id: z.string().openapi({
    description: 'Unique professional identifier',
    example: 'prof_456'
  }),
  fullName: z.string().openapi({
    description: 'Professional full name',
    example: 'Dr. Maria Silva'
  }),
  specialization: z.string().optional().openapi({
    description: 'Professional specialization',
    example: 'Dermatologia Estética'
  })
}).openapi('Professional')

export const ClientSchema = z.object({
  id: z.string().openapi({
    description: 'Unique client identifier (anonymized for LGPD compliance)',
    example: 'client_789'
  }),
  fullName: z.string().openapi({
    description: 'Client full name (only accessible with LGPD consent)',
    example: 'Ana Costa'
  }),
  email: z.string().email().optional().openapi({
    description: 'Client email (LGPD protected)',
    example: 'ana.costa@email.com'
  }),
  phonePrimary: z.string().optional().openapi({
    description: 'Client primary phone (LGPD protected)',
    example: '+55 11 99999-9999'
  }),
  lgpdConsentGiven: z.boolean().openapi({
    description: 'LGPD consent status - required for data access',
    example: true
  }),
  isActive: z.boolean().openapi({
    description: 'Client active status',
    example: true
  }),
  createdAt: z.string().openapi({
    description: 'Client registration timestamp',
    example: '2025-01-01T10:00:00.000Z'
  }),
  clinic: ClinicSchema.optional().openapi({
    description: 'Associated clinic information'
  })
}).openapi('Client')

export const AppointmentSchema = z.object({
  id: z.string().openapi({
    description: 'Unique appointment identifier',
    example: 'appt_123'
  }),
  startTime: z.string().openapi({
    description: 'Appointment start time',
    example: '2025-01-15T14:30:00.000Z'
  }),
  endTime: z.string().optional().openapi({
    description: 'Appointment end time',
    example: '2025-01-15T15:30:00.000Z'
  }),
  status: z.string().openapi({
    description: 'Appointment status',
    example: 'scheduled'
  }),
  client: ClientSchema.pick({ 
    id: true, 
    fullName: true, 
    email: true, 
    phonePrimary: true, 
    lgpdConsentGiven: true 
  }).openapi({
    description: 'Client information (LGPD consent validated)'
  }),
  clinic: ClinicSchema.openapi({
    description: 'Clinic information'
  }),
  professional: ProfessionalSchema.openapi({
    description: 'Professional information'
  })
}).openapi('Appointment')

// Request parameter schemas
export const ClientIdParamSchema = z.object({
  clientId: z.string().min(1).openapi({
    param: {
      name: 'clientId',
      in: 'path',
      description: 'Client unique identifier'
    },
    example: 'client_789',
    description: 'Must be a valid client ID with LGPD consent'
  })
}).openapi('ClientIdParam')

// Response collections
export const ClientsListResponseSchema = z.object({
  items: z.array(ClientSchema).openapi({
    description: 'List of clients with LGPD consent (max 10 items)',
    example: []
  })
}).openapi('ClientsListResponse')

export const ClientDetailResponseSchema = z.object({
  client: ClientSchema.openapi({
    description: 'Client details (requires LGPD consent)'
  })
}).openapi('ClientDetailResponse')

export const AppointmentsListResponseSchema = z.object({
  items: z.array(AppointmentSchema).openapi({
    description: 'List of appointments (max 10 items, LGPD consent validated)',
    example: []
  })
}).openapi('AppointmentsListResponse')

export const AuthStatusResponseSchema = z.object({
  feature: z.literal('auth').openapi({
    description: 'Feature identifier',
    example: 'auth'
  }),
  status: z.literal('ok').openapi({
    description: 'Auth feature status',
    example: 'ok'
  })
}).openapi('AuthStatusResponse')

// Common response status codes for healthcare API
export const CommonResponses = {
  400: {
    description: 'Bad Request - Invalid request parameters',
    content: {
      'application/json': {
        schema: ErrorResponseSchema
      }
    }
  },
  403: {
    description: 'Forbidden - LGPD consent required or insufficient permissions',
    content: {
      'application/json': {
        schema: ErrorResponseSchema,
        example: {
          error: 'Client has not provided LGPD consent',
          code: 'LGPD_CONSENT_REQUIRED',
          timestamp: '2025-01-11T12:00:00.000Z'
        }
      }
    }
  },
  404: {
    description: 'Not Found - Resource does not exist',
    content: {
      'application/json': {
        schema: ErrorResponseSchema
      }
    }
  },
  500: {
    description: 'Internal Server Error - Unexpected server error',
    content: {
      'application/json': {
        schema: ErrorResponseSchema
      }
    }
  }
} as const