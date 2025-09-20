/**
 * API Contract Types for NeonPro Healthcare Platform
 * tRPC v11 API contracts with comprehensive type safety
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod';

// =======================
// Base API Response Types
// =======================

export const BaseResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  timestamp: z.string().datetime(),
  requestId: z.string().uuid().optional(),
});

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  total: z.number().int().min(0).optional(),
  totalPages: z.number().int().min(0).optional(),
});

export const ErrorResponseSchema = BaseResponseSchema.extend({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.any()).optional(),
    stack: z.string().optional(),
  }),
  success: z.literal(false),
});

// =======================
// Healthcare Data Types
// =======================

export const PatientContractSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(2).max(100),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/),
  dateOfBirth: z.string().date(),
  email: z.string().email().optional(),
  phone: z
    .string()
    .regex(/^\+55\d{2}\d{8,9}$/)
    .optional(),

  // LGPD Compliance Fields
  lgpdConsent: z.boolean(),
  consentDate: z.string().datetime(),
  dataRetentionUntil: z.string().datetime(),
  consentVersion: z.string(),

  // Healthcare Metadata
  clinicId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  isActive: z.boolean().default(true),
});

export const AppointmentContractSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  clinicId: z.string().uuid(),

  // Appointment Details
  scheduledDate: z.string().datetime(),
  duration: z.number().int().min(15).max(480), // 15 min to 8 hours
  status: z.enum([
    'scheduled',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'no_show',
  ]),

  // Healthcare Specific
  treatmentType: z.string().min(1).max(100),
  priority: z.enum(['routine', 'urgent', 'emergency']).default('routine'),
  notes: z.string().max(2000).optional(),

  // AI No-Show Prediction
  noShowRisk: z.number().min(0).max(1).optional(),
  riskFactors: z.array(z.string()).optional(),

  // Audit Trail
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
});

export const ProfessionalContractSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  clinicId: z.string().uuid(),

  // Professional Details
  fullName: z.string().min(2).max(100),
  specialization: z.string().min(2).max(100),
  licenseNumber: z.string().min(5).max(20),
  licenseType: z.enum(['CRM', 'COREN', 'CRF', 'CFP', 'COFITO', 'CREF']),

  // Professional Status
  isActive: z.boolean().default(true),
  canPrescribe: z.boolean().default(false),
  emergencyContact: z.boolean().default(false),

  // Scheduling
  workingHours: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    }),
  ),

  // Audit
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// =======================
// AI Integration Types
// =======================

export const AIChatContractSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),

  // Message Content
  content: z.string().min(1).max(4000),
  role: z.enum(['user', 'assistant', 'system']),

  // Healthcare Context
  patientId: z.string().uuid().optional(),
  clinicId: z.string().uuid(),
  userId: z.string().uuid(),

  // AI Metadata
  model: z.string(),
  tokens: z.number().int().min(0),
  confidence: z.number().min(0).max(1).optional(),

  // Privacy & Compliance
  containsPHI: z.boolean().default(false),
  redactedContent: z.string().optional(),

  // Audit
  createdAt: z.string().datetime(),
  processedAt: z.string().datetime().optional(),
});

// =======================
// AI Request/Response Schemas
// =======================

export const AIRequestSchema = z.object({
  message: z.string().min(1).max(4000),
  sessionId: z.string().uuid().optional(),
  context: z.object({
    patientId: z.string().uuid().optional(),
    clinicId: z.string().uuid(),
    conversationHistory: z
      .array(
        z.object({
          role: z.enum(['user', 'assistant', 'system']),
          content: z.string(),
          timestamp: z.string().datetime(),
        }),
      )
      .optional(),
  }),
  preferences: z
    .object({
      model: z.string().default('gpt-4'),
      maxTokens: z.number().int().min(1).max(4000).default(1000),
      temperature: z.number().min(0).max(2).default(0.7),
    })
    .optional(),
});

export const AIResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    message: z.string(),
    sessionId: z.string().uuid(),
    tokens: z.object({
      prompt: z.number().int(),
      completion: z.number().int(),
      total: z.number().int(),
    }),
    model: z.string(),
    confidence: z.number().min(0).max(1).optional(),
  }),
});

export const AIChatResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    messages: z.array(AIChatContractSchema),
    sessionId: z.string().uuid(),
    totalMessages: z.number().int(),
    conversationSummary: z.string().optional(),
  }),
});

export const AIHealthcheckResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    status: z.enum(['healthy', 'degraded', 'unhealthy']),
    version: z.string(),
    models: z.array(
      z.object({
        name: z.string(),
        status: z.enum(['available', 'unavailable', 'limited']),
        responseTime: z.number().optional(),
      }),
    ),
    usage: z.object({
      requestsToday: z.number().int(),
      tokensToday: z.number().int(),
      averageResponseTime: z.number(),
    }),
    lastCheck: z.string().datetime(),
  }),
});

// =======================
// Request/Response Schemas
// =======================

export const CreatePatientRequestSchema = z.object({
  fullName: z.string().min(2).max(100),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/),
  dateOfBirth: z.string().date(),
  email: z.string().email().optional(),
  phone: z
    .string()
    .regex(/^\+55\d{2}\d{8,9}$/)
    .optional(),
  lgpdConsent: z.boolean(),
  clinicId: z.string().uuid(),
});

export const UpdatePatientRequestSchema = CreatePatientRequestSchema.partial().extend({
  id: z.string().uuid(),
});

export const GetPatientRequestSchema = z.object({
  id: z.string().uuid(),
  includeAppointments: z.boolean().default(false),
  includeMedicalHistory: z.boolean().default(false),
});

export const ListPatientsRequestSchema = PaginationSchema.extend({
  clinicId: z.string().uuid(),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'all']).default('active'),
  sortBy: z.enum(['name', 'createdAt', 'lastAppointment']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const CreateAppointmentRequestSchema = z.object({
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  clinicId: z.string().uuid(),
  scheduledDate: z.string().datetime(),
  duration: z.number().int().min(15).max(480),
  treatmentType: z.string().min(1).max(100),
  priority: z.enum(['routine', 'urgent', 'emergency']).default('routine'),
  notes: z.string().max(2000).optional(),
});

export const UpdateAppointmentRequestSchema = CreateAppointmentRequestSchema.partial().extend({
  id: z.string().uuid(),
  status: z
    .enum([
      'scheduled',
      'confirmed',
      'in_progress',
      'completed',
      'cancelled',
      'no_show',
    ])
    .optional(),
});

// =======================
// Response Schemas
// =======================

export const PatientResponseSchema = BaseResponseSchema.extend({
  data: PatientContractSchema,
  success: z.literal(true),
});

export const PatientsListResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    patients: z.array(PatientContractSchema),
    pagination: PaginationSchema,
  }),
  success: z.literal(true),
});

export const AppointmentResponseSchema = BaseResponseSchema.extend({
  data: AppointmentContractSchema,
  success: z.literal(true),
});

export const AppointmentsListResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    appointments: z.array(AppointmentContractSchema),
    pagination: PaginationSchema,
  }),
  success: z.literal(true),
});

// =======================
// Error Handling Types
// =======================

export const HealthcareErrorCodes = z.enum([
  'PATIENT_NOT_FOUND',
  'APPOINTMENT_CONFLICT',
  'LGPD_CONSENT_REQUIRED',
  'INVALID_CPF',
  'INVALID_HEALTHCARE_LICENSE',
  'CLINIC_ACCESS_DENIED',
  'PROFESSIONAL_UNAVAILABLE',
  'INVALID_TREATMENT_TYPE',
  'APPOINTMENT_PAST_DUE',
  'NO_SHOW_RISK_HIGH',
  'PHI_REDACTION_FAILED',
  'AI_PROCESSING_ERROR',
  'RATE_LIMIT_EXCEEDED',
  'TOO_MANY_REQUESTS',
  'SERVICE_UNAVAILABLE',
  'CONTENT_FILTERED',
]);

export class HealthcareTRPCError extends TRPCError {
  constructor(
    code:
      | 'BAD_REQUEST'
      | 'UNAUTHORIZED'
      | 'FORBIDDEN'
      | 'NOT_FOUND'
      | 'INTERNAL_SERVER_ERROR'
      | 'TOO_MANY_REQUESTS',
    message: string,
    healthcareCode: z.infer<typeof HealthcareErrorCodes>,
    metadata?: Record<string, any>,
  ) {
    super({
      code,
      message,
      cause: {
        healthcareCode,
        metadata,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

/**
 * Lightweight TRPC-style error used in the router implementation.
 * Replace with your project's canonical error type if/when available.
 */
export class HealthcareError extends Error {
  public status: string;
  public codeName?: string;
  public meta?: Record<string, any>;

  constructor(
    status: string,
    message: string,
    codeName?: string,
    meta?: Record<string, any>,
  ) {
    super(message);
    this.name = 'HealthcareError';
    this.status = status;
    this.codeName = codeName;
    this.meta = meta;
    // preserve prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// =======================
// Type Exports
// =======================

export type BaseResponse = z.infer<typeof BaseResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;

export type PatientContract = z.infer<typeof PatientContractSchema>;
export type AppointmentContract = z.infer<typeof AppointmentContractSchema>;
export type ProfessionalContract = z.infer<typeof ProfessionalContractSchema>;
export type AIChatContract = z.infer<typeof AIChatContractSchema>;

export type CreatePatientRequest = z.infer<typeof CreatePatientRequestSchema>;
export type UpdatePatientRequest = z.infer<typeof UpdatePatientRequestSchema>;
export type GetPatientRequest = z.infer<typeof GetPatientRequestSchema>;
export type ListPatientsRequest = z.infer<typeof ListPatientsRequestSchema>;

export type CreateAppointmentRequest = z.infer<
  typeof CreateAppointmentRequestSchema
>;
export type UpdateAppointmentRequest = z.infer<
  typeof UpdateAppointmentRequestSchema
>;

export type PatientResponse = z.infer<typeof PatientResponseSchema>;
export type PatientsListResponse = z.infer<typeof PatientsListResponseSchema>;
export type AppointmentResponse = z.infer<typeof AppointmentResponseSchema>;
export type AppointmentsListResponse = z.infer<
  typeof AppointmentsListResponseSchema
>;

export type HealthcareErrorCode = z.infer<typeof HealthcareErrorCodes>;

// =======================
// Minimal, consumable schemas and error class used by the API.
// Expand these in the types package as the real domain models evolve.
// =======================

export const MinimalPaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).default(20),
});

export const CreateClinicRequestSchema = z.object({
  name: z.string(),
  cnpj: z.string(),
  healthLicenseNumber: z.string(),
  address: z.object({
    street: z.string().optional(),
    number: z.string().optional(),
    city: z.string(),
    state: z.string().length(2),
    zip: z.string().optional(),
  }),
  settings: z.record(z.any()).optional(),
});

export const UpdateClinicRequestSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().optional(),
    cnpj: z.string().optional(),
    healthLicenseNumber: z.string().optional(),
    address: z
      .object({
        street: z.string().optional(),
        number: z.string().optional(),
        city: z.string().optional(),
        state: z.string().length(2).optional(),
        zip: z.string().optional(),
      })
      .optional(),
    settings: z.record(z.any()).optional(),
  })
  .strict();

export const ClinicResponseSchema = z.object({
  success: z.literal(true),
  data: z.any(),
  message: z.string().optional(),
  timestamp: z.string().optional(),
  requestId: z.string().optional(),
});

export const ClinicsListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    clinics: z.array(z.any()),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  }),
  timestamp: z.string().optional(),
  requestId: z.string().optional(),
});
