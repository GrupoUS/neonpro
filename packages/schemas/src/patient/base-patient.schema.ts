import { z } from "zod";

/**
 * Base patient schema (T084 - Code duplication removal)
 * Core patient fields used across all layers
 */
export const BasePatientSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome não pode ter mais de 100 caracteres")
    .transform((val) => val.trim()),
  email: z.string().email("Email inválido").optional().nullable(),
  phone: z.string().optional().nullable(),
  gender: z
    .enum(["male", "female", "other"], {
      errorMap: () => ({ message: "Gênero inválido" }),
    })
    .optional(),
  birthDate: z
    .string()
    .datetime("Data de nascimento inválida")
    .optional()
    .nullable(),
  status: z
    .enum(["active", "inactive", "pending"], {
      errorMap: () => ({ message: "Status inválido" }),
    })
    .default("active"),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

/**
 * Patient address schema
 */
export const PatientAddressSchema = z.object({
  street: z
    .string()
    .min(1, "Rua é obrigatória")
    .max(100, "Rua não pode ter mais de 100 caracteres"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z
    .string()
    .min(1, "Bairro é obrigatório")
    .max(50, "Bairro não pode ter mais de 50 caracteres"),
  city: z
    .string()
    .min(1, "Cidade é obrigatória")
    .max(50, "Cidade não pode ter mais de 50 caracteres"),
  state: z.string().length(2, "Estado deve ter 2 caracteres").toUpperCase(),
  cep: z
    .string()
    .regex(/^\d{5}-\d{3}$/, "CEP inválido. Use o formato 00000-000"),
});

/**
 * Patient health insurance schema
 */
export const PatientHealthInsuranceSchema = z.object({
  provider: z
    .string()
    .min(1, "Plano de saúde é obrigatório")
    .max(50, "Nome do plano não pode ter mais de 50 caracteres"),
  plan: z
    .string()
    .min(1, "Plano é obrigatório")
    .max(30, "Nome do plano não pode ter mais de 30 caracteres"),
  cardNumber: z
    .string()
    .min(10, "Número do cartão inválido")
    .max(20, "Número do cartão não pode ter mais de 20 caracteres")
    .optional(),
  validity: z
    .string()
    .regex(/^\d{2}\/\d{4}$/, "Validade inválida. Use o formato MM/AAAA")
    .optional(),
});

/**
 * Emergency contact schema
 */
export const EmergencyContactSchema = z.object({
  name: z
    .string()
    .min(1, "Nome do contato é obrigatório")
    .max(100, "Nome não pode ter mais de 100 caracteres"),
  relationship: z
    .string()
    .min(1, "Grau de parentesco é obrigatório")
    .max(30, "Grau de parentesco não pode ter mais de 30 caracteres"),
  phone: z.string().min(1, "Telefone do contato é obrigatório"),
});

/**
 * LGPD consent schema
 */
export const LGPDConsentSchema = z.object({
  dataProcessing: z.boolean(),
  dataSharing: z.boolean(),
  marketing: z.boolean().default(false),
  retentionPeriod: z.enum(["5_years", "10_years", "25_years"], {
    errorMap: () => ({ message: "Período de retenção inválido" }),
  }),
  consentedAt: z.string().datetime().optional(),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
});

/**
 * Complete patient schema with all optional fields
 */
export const CompletePatientSchema = BasePatientSchema.extend({
  address: PatientAddressSchema.optional(),
  healthInsurance: PatientHealthInsuranceSchema.optional(),
  emergencyContact: EmergencyContactSchema.optional(),
  lgpdConsent: LGPDConsentSchema.optional(),
  notes: z
    .string()
    .max(500, "Anotações não podem ter mais de 500 caracteres")
    .optional(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).optional(),
});

// Export types
export type BasePatient = z.infer<typeof BasePatientSchema>;
export type PatientAddress = z.infer<typeof PatientAddressSchema>;
export type PatientHealthInsurance = z.infer<
  typeof PatientHealthInsuranceSchema
>;
export type EmergencyContact = z.infer<typeof EmergencyContactSchema>;
export type LGPDConsent = z.infer<typeof LGPDConsentSchema>;
export type CompletePatient = z.infer<typeof CompletePatientSchema>;
