/**
 * Shared Schemas Package (T084 - Code duplication removal)
 * Centralized validation schemas for the NeonPro platform
 */

import { z } from 'zod';

// Patient schemas
export * from './patient/base-patient.schema';
export * from './patient/brazilian-patient.schema';

// Re-export commonly used types and schemas from base-patient.schema
export {
  BasePatient,
  PatientAddress,
  PatientHealthInsurance,
  EmergencyContact,
  LGPDConsent,
  CompletePatient,
} from './patient/base-patient.schema';
export {
  CPFSchema,
  CNPJSchema,
  BrazilianPhoneSchema,
  BrazilianCEPSchema,
  BrazilianPatientRegistrationSchema,
  BrazilianPatientUpdateSchema,
  PatientSearchSchema,
  PatientExportSchema,
} from './patient/brazilian-patient.schema';

// Utility schemas
export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  total: z.number().optional(),
  totalPages: z.number().optional(),
});

export const ResponseSchema = <T>(dataSchema: z.ZodType<T>) => z.object({
  success: z.boolean(),
  data: dataSchema.optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
    timestamp: z.string().datetime(),
    requestId: z.string(),
  }).optional(),
  meta: z.object({
    pagination: PaginationSchema.optional(),
    requestId: z.string(),
    timestamp: z.string().datetime(),
  }).optional(),
});

// Export utility types
export type Pagination = z.infer<typeof PaginationSchema>;
export type ApiResponse<T> = z.infer<ReturnType<typeof ResponseSchema<T>>>;