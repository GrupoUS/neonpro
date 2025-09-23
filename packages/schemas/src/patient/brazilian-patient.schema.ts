import {
  BasePatientSchema,
  CompletePatientSchema,
} from "./base-patient.schema";
import {
  validateCPF,
  validateCNPJ,
  validatePhone,
  validateCEP,
} from "@neonpro/validators";

/**
 * Brazilian patient schema (T084 - Code duplication removal)
 * Extends base patient with Brazilian-specific validations
 */

/**
 * CPF validation schema
 */
import { z } from "zod";

export const CPFSchema = z
  .string()
  .transform((val) => val.replace(/[^\d]/g, ""))
  .refine((val) => val.length === 11, "CPF deve ter 11 dígitos")
  .refine(
    (val) => !/^(\d)\1{10}$/.test(val),
    "CPF inválido - todos os dígitos iguais",
  )
  .refine((val) => validateCPF(val), "CPF inválido")
  .transform((val) => {
    // Format CPF: 123.456.789-09
    return val.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  });

/**
 * CNPJ validation schema (for legal guardian/company)
 */
export const CNPJSchema = z
  .string()
  .transform((val) => val.replace(/[^\d]/g, ""))
  .refine((val) => val.length === 14, "CNPJ deve ter 14 dígitos")
  .refine(
    (val) => !/^(\d)\1{13}$/.test(val),
    "CNPJ inválido - todos os dígitos iguais",
  )
  .refine((val) => validateCNPJ(val), "CNPJ inválido")
  .transform((val) => {
    // Format CNPJ: 12.345.678/0001-95
    return val.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  });

/**
 * Brazilian phone validation schema
 */
export const BrazilianPhoneSchema = z
  .string()
  .transform((val) => val.replace(/[^\d]/g, ""))
  .refine(
    (val) => [10, 11].includes(val.length),
    "Telefone deve ter 10 ou 11 dígitos",
  )
  .refine((val) => validatePhone(val), "Telefone inválido")
  .transform((val) => {
    // Format phone: (11) 99999-8888 or (11) 2555-1234
    if (val.length === 11) {
      return val.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return val.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  });

/**
 * Brazilian CEP validation schema
 */
export const BrazilianCEPSchema = z
  .string()
  .transform((val) => val.replace(/[^\d]/g, ""))
  .refine((val) => val.length === 8, "CEP deve ter 8 dígitos")
  .refine((val) => validateCEP(val), "CEP inválido")
  .transform((val) => {
    // Format CEP: 01310-100
    return val.replace(/(\d{5})(\d{3})/, "$1-$2");
  });

/**
 * Brazilian patient schema for registration
 */
export const BrazilianPatientRegistrationSchema = BasePatientSchema.extend({
  cpf: CPFSchema,
  phone: BrazilianPhoneSchema.nullable(),
  address: z
    .object({
      street: z.string().min(1, "Rua é obrigatória"),
      number: z.string().min(1, "Número é obrigatório"),
      complement: z.string().optional(),
      neighborhood: z.string().min(1, "Bairro é obrigatório"),
      city: z.string().min(1, "Cidade é obrigatória"),
      state: z
        .string()
        .length(2, "Estado deve ter 2 caracteres")
        .regex(/^[A-Z]{2}$/, "Use apenas letras maiúsculas"),
      cep: BrazilianCEPSchema,
    })
    .optional(),
  healthInsurance: z
    .object({
      provider: z.string().min(1, "Plano de saúde é obrigatório"),
      plan: z.string().min(1, "Plano é obrigatório"),
      cardNumber: z.string().min(10, "Número do cartão inválido"),
      validity: z
        .string()
        .regex(/^\d{2}\/\d{4}$/, "Validade inválida (MM/AAAA)"),
    })
    .optional(),
  emergencyContact: z
    .object({
      name: z.string().min(1, "Nome do contato é obrigatório"),
      relationship: z.string().min(1, "Grau de parentesco é obrigatório"),
      phone: BrazilianPhoneSchema,
    })
    .optional(),
  lgpdConsent: z.object({
    dataProcessing: z
      .boolean()
      .refine((val) => val === true, "Consentimento obrigatório"),
    dataSharing: z
      .boolean()
      .refine((val) => val === true, "Consentimento obrigatório"),
    marketing: z.boolean().default(false),
    retentionPeriod: z.enum(["5_years", "10_years", "25_years"]),
  }),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato AAAA-MM-DD")
    .refine((val) => {
      const date = new Date(val);
      const now = new Date();
      const age = now.getFullYear() - date.getFullYear();
      return age >= 0 && age <= 120;
    }, "Data de nascimento inválida"),
});

/**
 * Brazilian patient schema for updates (all fields optional)
 */
export const BrazilianPatientUpdateSchema = CompletePatientSchema.partial()
  .extend({
    cpf: CPFSchema.optional(),
    phone: BrazilianPhoneSchema.nullable(),
    address: z
      .object({
        street: z.string().min(1),
        number: z.string().min(1),
        complement: z.string().optional(),
        neighborhood: z.string().min(1),
        city: z.string().min(1),
        state: z.string().length(2),
        cep: BrazilianCEPSchema,
      })
      .optional(),
  })
  .omit({ id: true, createdAt: true, updatedAt: true });

/**
 * Patient search schema with Brazilian fields
 */
export const PatientSearchSchema = z.object({
  name: z.string().optional(),
  cpf: z
    .string()
    .transform((val) => (val ? val.replace(/[^\d]/g, "") : ""))
    .refine((val) => !val || val.length === 11, "CPF deve ter 11 dígitos")
    .optional(),
  email: z.string().email("Email inválido").optional(),
  phone: z
    .string()
    .transform((val) => (val ? val.replace(/[^\d]/g, "") : ""))
    .refine((val) => !val || [10, 11].includes(val.length), "Telefone inválido")
    .optional(),
  city: z.string().optional(),
  state: z.string().length(2).optional(),
  status: z.enum(["active", "inactive", "pending"]).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(["name", "createdAt", "lastVisit"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

/**
 * Patient export schema
 */
export const PatientExportSchema = z.object({
  patientIds: z.array(z.string().uuid()),
  format: z.enum(["csv", "xlsx", "pdf"]).default("csv"),
  fields: z
    .array(
      z.enum([
        "id",
        "name",
        "cpf",
        "email",
        "phone",
        "birthDate",
        "gender",
        "address",
        "healthInsurance",
        "status",
        "createdAt",
      ]),
    )
    .default(["name", "cpf", "email", "phone"]),
  includeSensitiveData: z.boolean().default(false),
  maskSensitiveData: z.boolean().default(true),
});

// Export types
export type CPF = z.infer<typeof CPFSchema>;
export type CNPJ = z.infer<typeof CNPJSchema>;
export type BrazilianPhone = z.infer<typeof BrazilianPhoneSchema>;
export type BrazilianCEP = z.infer<typeof BrazilianCEPSchema>;
export type BrazilianPatientRegistration = z.infer<
  typeof BrazilianPatientRegistrationSchema
>;
export type BrazilianPatientUpdate = z.infer<
  typeof BrazilianPatientUpdateSchema
>;
export type PatientSearch = z.infer<typeof PatientSearchSchema>;
export type PatientExport = z.infer<typeof PatientExportSchema>;
