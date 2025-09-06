/**
 * 🏥 Healthcare Data Validation - NeonPro API
 * ===========================================
 *
 * Healthcare-specific input validation schemas with:
 * - Brazilian healthcare data formats (CPF, phone, etc.)
 * - LGPD compliance validation
 * - Medical data constraints
 * - Professional license validation
 * - Audit logging integration
 */

import { validateCEP, validateCPF, validateEmail, validatePhone } from "@neonpro/utils/validation";
import type { Context, MiddlewareHandler } from "hono";
import { z } from "zod";
import { createError } from "./error-handler";
import { HealthcareSecurityLogger } from "./healthcare-security";

// Brazilian CPF validation now imported from @neonpro/utils/validation
// const validateBrazilianCPF = validateCPF; // Use centralized validation

// Brazilian RG validation
const validateBrazilianRG = (rg: string): boolean => {
  // Basic validation - RG formats vary by state
  const cleanRG = rg.replace(/\D/g, "");
  return cleanRG.length >= 7 && cleanRG.length <= 9;
};

// Brazilian phone validation
const brazilianPhoneRegex = /^\+55\s\([1-9]{2}\)\s9?[0-9]{4}-[0-9]{4}$/;

// Brazilian postal code validation
const cepRegex = /^[0-9]{5}-[0-9]{3}$/;

// Medical professional license formats
const licenseRegexes = {
  CRM: /^CRM\/[A-Z]{2}\s\d{4,6}$/,
  CRF: /^CRF\/[A-Z]{2}\s\d{4,6}$/,
  CREFITO: /^CREFITO-\d{1,2}\/\d{5,6}-F$/,
  CRN: /^CRN-\d{1}\s\d{4,6}$/,
  COREN: /^COREN-[A-Z]{2}\s\d{5,6}$/,
  CRO: /^CRO-[A-Z]{2}\s\d{4,6}$/,
  CRP: /^CRP\s\d{2}\/\d{5,6}$/,
};

// Blood type validation
const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// Emergency contact relationship types
const relationshipTypes = [
  "pai",
  "mae",
  "irmao",
  "irma",
  "filho",
  "filha",
  "conjuge",
  "companheiro",
  "companheira",
  "responsavel",
  "outro",
];

// Brazilian states
const brazilianStates = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

// Patient data validation schemas
export const PatientDataSchemas = {
  // Personal information with Brazilian healthcare constraints
  personalInfo: z.object({
    // Required personal data
    firstName: z
      .string()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(50, "Nome muito longo (máximo 50 caracteres)")
      .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, "Nome contém caracteres inválidos"),

    lastName: z
      .string()
      .min(2, "Sobrenome deve ter pelo menos 2 caracteres")
      .max(100, "Sobrenome muito longo (máximo 100 caracteres)")
      .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, "Sobrenome contém caracteres inválidos"),

    // Brazilian specific documents
    cpf: z
      .string()
      .regex(
        /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
        "CPF deve estar no formato 000.000.000-00",
      )
      .refine(validateCPF, "CPF inválido"),

    rg: z
      .string()
      .optional()
      .refine((val) => !val || validateBrazilianRG(val), "RG inválido"),

    // Date of birth with age validation
    dateOfBirth: z.string().refine((date) => {
      const parsedDate = new Date(date);
      const now = new Date();
      const age = now.getFullYear() - parsedDate.getFullYear();
      const monthDiff = now.getMonth() - parsedDate.getMonth();
      const actualAge = monthDiff < 0
          || (monthDiff === 0 && now.getDate() < parsedDate.getDate())
        ? age - 1
        : age;
      return actualAge >= 0 && actualAge <= 150;
    }, "Data de nascimento inválida"),

    // Contact information
    email: z
      .string()
      .email("Email inválido")
      .max(255, "Email muito longo")
      .transform((email) => email.toLowerCase()),

    phone: z
      .string()
      .regex(
        brazilianPhoneRegex,
        "Telefone deve estar no formato +55 (00) 90000-0000",
      ),

    alternativePhone: z
      .string()
      .regex(
        brazilianPhoneRegex,
        "Telefone alternativo deve estar no formato +55 (00) 90000-0000",
      )
      .optional(),

    // Address (Brazilian format)
    address: z
      .object({
        street: z
          .string()
          .min(5, "Endereço muito curto")
          .max(200, "Endereço muito longo"),
        number: z.string().max(10, "Número muito longo"),
        complement: z.string().max(100, "Complemento muito longo").optional(),
        neighborhood: z
          .string()
          .min(2, "Bairro obrigatório")
          .max(100, "Bairro muito longo"),
        city: z
          .string()
          .min(2, "Cidade obrigatória")
          .max(100, "Cidade muito longa"),
        state: z.enum(brazilianStates as [string, ...string[]], {
          errorMap: () => ({ message: "Estado brasileiro inválido" }),
        }),
        cep: z.string().regex(cepRegex, "CEP deve estar no formato 00000-000"),
      })
      .optional(),

    // Gender (following Brazilian healthcare standards)
    gender: z
      .enum(["masculino", "feminino", "outro", "nao_informar"], {
        errorMap: () => ({
          message: "Gênero deve ser: masculino, feminino, outro, ou nao_informar",
        }),
      })
      .optional(),

    // Marital status
    maritalStatus: z
      .enum(["solteiro", "casado", "divorciado", "viuvo", "uniao_estavel"], {
        errorMap: () => ({ message: "Estado civil inválido" }),
      })
      .optional(),

    // Profession
    profession: z.string().max(100, "Profissão muito longa").optional(),

    // Nationality
    nationality: z
      .string()
      .max(50, "Nacionalidade muito longa")
      .default("brasileira"),
  }),

  // Medical information with Brazilian healthcare context
  medicalInfo: z.object({
    // Blood type
    bloodType: z
      .enum(bloodTypes as [string, ...string[]], {
        errorMap: () => ({ message: "Tipo sanguíneo inválido" }),
      })
      .optional(),

    // Allergies (limited for safety)
    allergies: z
      .array(
        z.object({
          substance: z.string().max(100, "Nome da substância muito longo"),
          severity: z.enum(["leve", "moderada", "grave"], {
            errorMap: () => ({
              message: "Gravidade deve ser: leve, moderada, ou grave",
            }),
          }),
          reaction: z
            .string()
            .max(200, "Descrição da reação muito longa")
            .optional(),
        }),
      )
      .max(20, "Máximo 20 alergias permitidas"),

    // Current medications
    medications: z
      .array(
        z.object({
          name: z
            .string()
            .min(2, "Nome do medicamento muito curto")
            .max(100, "Nome do medicamento muito longo"),
          dosage: z.string().max(50, "Dosagem muito longa"),
          frequency: z.string().max(100, "Frequência muito longa"),
          prescribingDoctor: z
            .string()
            .max(100, "Nome do médico muito longo")
            .optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        }),
      )
      .max(30, "Máximo 30 medicamentos permitidos"),

    // Chronic conditions
    chronicConditions: z
      .array(
        z.object({
          condition: z.string().max(100, "Nome da condição muito longo"),
          diagnosisDate: z.string().optional(),
          status: z.enum(["ativa", "controlada", "remissao"], {
            errorMap: () => ({
              message: "Status deve ser: ativa, controlada, ou remissao",
            }),
          }),
        }),
      )
      .max(15, "Máximo 15 condições crônicas"),

    // Previous surgeries
    surgeries: z
      .array(
        z.object({
          procedure: z.string().max(150, "Nome do procedimento muito longo"),
          date: z.string(),
          hospital: z
            .string()
            .max(150, "Nome do hospital muito longo")
            .optional(),
          surgeon: z
            .string()
            .max(100, "Nome do cirurgião muito longo")
            .optional(),
          complications: z
            .string()
            .max(300, "Descrição das complicações muito longa")
            .optional(),
        }),
      )
      .max(20, "Máximo 20 cirurgias"),

    // Family history
    familyHistory: z
      .array(
        z.object({
          condition: z.string().max(100, "Condição muito longa"),
          relation: z.string().max(50, "Parentesco muito longo"),
          ageAtDiagnosis: z.number().min(0).max(150).optional(),
        }),
      )
      .max(25, "Máximo 25 itens de histórico familiar"),

    // Habits and lifestyle
    lifestyle: z
      .object({
        smoker: z
          .enum(["nunca", "ex_fumante", "fumante_ocasional", "fumante_regular"])
          .optional(),
        alcohol: z
          .enum(["nunca", "ocasionalmente", "moderadamente", "frequentemente"])
          .optional(),
        physicalActivity: z
          .enum(["sedentario", "leve", "moderada", "intensa"])
          .optional(),
        diet: z
          .enum(["normal", "vegetariana", "vegana", "restricoes_medicas"])
          .optional(),
      })
      .optional(),

    // Emergency contact (required for healthcare)
    emergencyContact: z.object({
      name: z
        .string()
        .min(2, "Nome do contato de emergência obrigatório")
        .max(100, "Nome muito longo"),
      phone: z
        .string()
        .regex(
          brazilianPhoneRegex,
          "Telefone deve estar no formato +55 (00) 90000-0000",
        ),
      relationship: z.enum(relationshipTypes as [string, ...string[]], {
        errorMap: () => ({ message: "Tipo de parentesco inválido" }),
      }),
      alternativePhone: z
        .string()
        .regex(brazilianPhoneRegex, "Telefone alternativo inválido")
        .optional(),
    }),

    // Healthcare plan information
    healthcarePlan: z
      .object({
        provider: z.string().max(100, "Nome da operadora muito longo"),
        planName: z.string().max(100, "Nome do plano muito longo"),
        cardNumber: z.string().max(50, "Número da carteirinha muito longo"),
        validity: z.string().optional(),
      })
      .optional(),
  }),

  // LGPD consent validation (enhanced)
  lgpdConsent: z.object({
    // Essential consents (required)
    dataProcessing: z.literal(true, {
      errorMap: () => ({
        message: "Consentimento para processamento de dados obrigatório (LGPD Art. 7º)",
      }),
    }),
    medicalTreatment: z.literal(true, {
      errorMap: () => ({
        message: "Consentimento para tratamento médico obrigatório",
      }),
    }),

    // Optional consents
    dataSharing: z.boolean().default(false),
    marketing: z.boolean().default(false),
    research: z.boolean().default(false),
    photos: z.boolean().default(false),

    // Consent metadata (for audit)
    consentDate: z.string().refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, "Data de consentimento inválida"),
    consentVersion: z.string().min(1, "Versão do consentimento obrigatória"),
    ipAddress: z.string().ip("Endereço IP inválido"),
    userAgent: z.string().max(500, "User agent muito longo"),

    // Explicit consent confirmation
    confirmUnderstanding: z.literal(true, {
      errorMap: () => ({ message: "Confirmação de entendimento obrigatória" }),
    }),

    // Data subject rights acknowledgment
    rightsAcknowledged: z.literal(true, {
      errorMap: () => ({
        message: "Reconhecimento dos direitos do titular obrigatório",
      }),
    }),
  }),

  // Professional data validation
  professionalInfo: z.object({
    licenseNumber: z
      .string()
      .min(5, "Número da licença muito curto")
      .max(20, "Número da licença muito longo")
      .refine((license) => {
        // Validate against known license formats
        return Object.values(licenseRegexes).some((regex) => regex.test(license));
      }, "Formato de licença profissional inválido"),

    licenseType: z.enum(
      ["CRM", "CRF", "CREFITO", "CRN", "COREN", "CRO", "CRP"],
      {
        errorMap: () => ({ message: "Tipo de licença inválido" }),
      },
    ),

    state: z.enum(brazilianStates as [string, ...string[]], {
      errorMap: () => ({ message: "Estado de registro inválido" }),
    }),

    specializations: z
      .array(z.string().max(100, "Especialização muito longa"))
      .max(10, "Máximo 10 especializações"),

    clinicAffiliations: z
      .array(z.string().uuid("ID da clínica inválido"))
      .max(5, "Máximo 5 afiliações"),
  }),
};

// Appointment data validation
export const AppointmentDataSchemas = {
  booking: z.object({
    patientId: z.string().uuid("ID do paciente inválido"),
    professionalId: z.string().uuid("ID do profissional inválido"),
    serviceId: z.string().uuid("ID do serviço inválido"),
    clinicId: z.string().uuid("ID da clínica inválido"),

    scheduledDate: z.string().refine((date) => {
      const scheduledDate = new Date(date);
      const now = new Date();
      // Must be in the future and within 1 year
      return (
        scheduledDate > now
        && scheduledDate
          < new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
      );
    }, "Data de agendamento deve estar no futuro e dentro de 1 ano"),

    duration: z
      .number()
      .min(15, "Duração mínima 15 minutos")
      .max(480, "Duração máxima 8 horas"),

    notes: z.string().max(500, "Observações muito longas").optional(),

    priority: z.enum(["baixa", "normal", "alta", "urgente"]).default("normal"),

    // LGPD consent for appointment
    lgpdConsent: z.object({
      appointmentData: z.literal(true),
      consentTimestamp: z.string(),
      ipAddress: z.string().ip(),
    }),
  }),

  update: z.object({
    scheduledDate: z.string().optional(),
    duration: z.number().min(15).max(480).optional(),
    status: z
      .enum([
        "agendado",
        "confirmado",
        "em_andamento",
        "concluido",
        "cancelado",
        "falta",
      ])
      .optional(),
    notes: z.string().max(500).optional(),
    cancellationReason: z.string().max(200).optional(),
  }),
};

// Validation middleware with healthcare context
export function validateHealthcareInput(
  schema: z.ZodSchema,
): MiddlewareHandler {
  return async (c, next) => {
    try {
      const body = await c.req.json();

      // Validate input against schema
      const validatedData = schema.parse(body);

      // Additional healthcare-specific validations
      if (schema === PatientDataSchemas.personalInfo) {
        await validatePatientDataCompliance(validatedData, c);
      }

      // Set validated data in context
      c.set("validatedData", validatedData);

      // Log data validation for audit trail
      HealthcareSecurityLogger.logDataValidation({
        userId: c.get("user")?.id,
        dataType: getSchemaType(schema),
        timestamp: new Date(),
        validationSuccess: true,
      });

      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Log validation failure for healthcare security
        HealthcareSecurityLogger.logValidationFailure({
          userId: c.get("user")?.id,
          errors: error.errors,
          endpoint: c.req.url,
          timestamp: new Date(),
        });

        return c.json(
          {
            success: false,
            error: "VALIDATION_FAILED",
            message: "Dados inválidos fornecidos",
            details: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
              code: err.code,
            })),
            lgpdCompliance: "Data validation protects patient information quality",
          },
          400,
        );
      }

      throw error;
    }
  };
}

// Additional patient data compliance validation
async function validatePatientDataCompliance(
  data: unknown,
  c: Context,
): Promise<void> {
  const user = c.get("user");

  // Log patient data processing attempt
  console.log("[PATIENT_DATA_PROCESSING]", {
    userId: user?.id,
    dataFields: Object.keys(data),
    timestamp: new Date(),
    ip: c.req.header("CF-Connecting-IP"),
  });

  // Validate age restrictions for certain procedures
  if (data.dateOfBirth) {
    const birthDate = new Date(data.dateOfBirth);
    const age = new Date().getFullYear() - birthDate.getFullYear();

    if (age < 18) {
      // Additional validation for minors
      console.log("[MINOR_PATIENT]", { age, userId: user?.id });
    }
  }

  // Validate professional license for data modification
  if (user?.role === "healthcare_provider" && !user?.professionalLicense) {
    throw createError.authorization(
      "Licença profissional obrigatória para modificar dados de pacientes",
    );
  }
}

// Get schema type for logging
function getSchemaType(schema: z.ZodSchema): string {
  // Simple way to identify schema type
  if (schema === PatientDataSchemas.personalInfo) {
    return "patient_personal_info";
  }
  if (schema === PatientDataSchemas.medicalInfo) {
    return "patient_medical_info";
  }
  if (schema === PatientDataSchemas.lgpdConsent) {
    return "lgpd_consent";
  }
  if (schema === PatientDataSchemas.professionalInfo) {
    return "professional_info";
  }
  if (schema === AppointmentDataSchemas.booking) {
    return "appointment_booking";
  }
  if (schema === AppointmentDataSchemas.update) {
    return "appointment_update";
  }
  return "unknown";
}

// Export validation utilities
export const healthcareValidationUtils = {
  // Validate Brazilian documents
  validateCPF,
  validateRG: validateBrazilianRG,

  // Format validation
  isBrazilianPhone: (phone: string) => brazilianPhoneRegex.test(phone),
  isBrazilianCEP: (cep: string) => cepRegex.test(cep),

  // Professional license validation
  validateLicenseFormat: (
    license: string,
    type: keyof typeof licenseRegexes,
  ) => {
    return licenseRegexes[type]?.test(license) || false;
  },

  // Data sanitization
  sanitizeName: (name: string): string => {
    return name
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  },

  sanitizePhone: (phone: string): string => {
    return phone
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/, "+55 ($1) $3-$4");
  },

  sanitizeCPF: (cpf: string): string => {
    return cpf
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  },
};

export { brazilianPhoneRegex, cepRegex, validateBrazilianRG, validateCPF };
