"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LgpdAuditSchema =
  exports.PatientProfileUpdateSchema =
  exports.PatientProfileSchema =
    void 0;
var zod_1 = require("zod");
// LGPD-compliant validation schema for patient profile management
// Implements explicit consent and data minimization principles
exports.PatientProfileSchema = zod_1.z.object({
  // Personal Information (LGPD sensitive data)
  fullName: zod_1.z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome não pode exceder 100 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),
  dateOfBirth: zod_1.z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato AAAA-MM-DD")
    .refine(function (date) {
      var birthDate = new Date(date);
      var today = new Date();
      var age = today.getFullYear() - birthDate.getFullYear();
      return age >= 0 && age <= 120;
    }, "Data de nascimento inválida"),
  gender: zod_1.z.enum(["male", "female", "other", "prefer_not_to_say"], {
    errorMap: function () {
      return { message: "Selecione um gênero válido" };
    },
  }),
  cpf: zod_1.z
    .string()
    .regex(/^\d{11}$/, "CPF deve conter apenas 11 dígitos")
    .refine(function (cpf) {
      // Basic CPF validation (simplified for demo)
      var digits = cpf.split("").map(Number);
      return (
        digits.length === 11 &&
        !digits.every(function (d) {
          return d === digits[0];
        })
      );
    }, "CPF inválido"),
  rg: zod_1.z
    .string()
    .min(7, "RG deve ter pelo menos 7 caracteres")
    .max(12, "RG não pode exceder 12 caracteres")
    .optional(),
  // Contact Information
  phone: zod_1.z
    .string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Telefone deve estar no formato (XX) XXXXX-XXXX")
    .optional(),
  mobile: zod_1.z
    .string()
    .regex(/^\(\d{2}\)\s\d{5}-\d{4}$/, "Celular deve estar no formato (XX) XXXXX-XXXX"),
  email: zod_1.z
    .string()
    .email("Email deve ser válido")
    .max(100, "Email não pode exceder 100 caracteres")
    .optional(),
  // Address Information (LGPD personal data)
  address: zod_1.z.object({
    street: zod_1.z
      .string()
      .min(5, "Endereço deve ter pelo menos 5 caracteres")
      .max(100, "Endereço não pode exceder 100 caracteres"),
    number: zod_1.z
      .string()
      .min(1, "Número é obrigatório")
      .max(10, "Número não pode exceder 10 caracteres"),
    complement: zod_1.z.string().max(50, "Complemento não pode exceder 50 caracteres").optional(),
    neighborhood: zod_1.z
      .string()
      .min(2, "Bairro deve ter pelo menos 2 caracteres")
      .max(50, "Bairro não pode exceder 50 caracteres"),
    city: zod_1.z
      .string()
      .min(2, "Cidade deve ter pelo menos 2 caracteres")
      .max(50, "Cidade não pode exceder 50 caracteres"),
    state: zod_1.z
      .string()
      .length(2, "Estado deve ter exatamente 2 caracteres")
      .regex(/^[A-Z]{2}$/, "Estado deve ser em maiúsculas"),
    zipCode: zod_1.z.string().regex(/^\d{5}-?\d{3}$/, "CEP deve estar no formato XXXXX-XXX"),
  }),
  // Contact Preferences (LGPD consent-based)
  contactPreferences: zod_1.z.object({
    allowEmail: zod_1.z.boolean().default(false),
    allowSms: zod_1.z.boolean().default(false),
    allowWhatsapp: zod_1.z.boolean().default(false),
    allowPhone: zod_1.z.boolean().default(false),
    // Marketing preferences
    allowMarketing: zod_1.z.boolean().default(false),
    allowAppointmentReminders: zod_1.z.boolean().default(true),
    allowHealthTips: zod_1.z.boolean().default(false),
    // Preferred communication method
    preferredMethod: zod_1.z
      .enum(["email", "sms", "whatsapp", "phone"], {
        errorMap: function () {
          return { message: "Selecione um método de comunicação preferido" };
        },
      })
      .optional(),
    // Best time to contact
    bestTimeToContact: zod_1.z
      .enum(["morning", "afternoon", "evening", "anytime"], {
        errorMap: function () {
          return { message: "Selecione o melhor horário para contato" };
        },
      })
      .default("anytime"),
  }),
  // Emergency Contacts (LGPD personal data of third parties - requires consent)
  emergencyContacts: zod_1.z
    .array(
      zod_1.z.object({
        name: zod_1.z
          .string()
          .min(2, "Nome deve ter pelo menos 2 caracteres")
          .max(100, "Nome não pode exceder 100 caracteres"),
        relationship: zod_1.z
          .string()
          .min(2, "Parentesco deve ter pelo menos 2 caracteres")
          .max(50, "Parentesco não pode exceder 50 caracteres"),
        phone: zod_1.z
          .string()
          .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Telefone deve estar no formato (XX) XXXXX-XXXX"),
        email: zod_1.z
          .string()
          .email("Email deve ser válido")
          .max(100, "Email não pode exceder 100 caracteres")
          .optional(),
        isPrimary: zod_1.z.boolean().default(false),
      }),
    )
    .max(3, "Máximo de 3 contatos de emergência permitidos"),
  // LGPD Consent Management
  lgpdConsent: zod_1.z.object({
    dataProcessingConsent: zod_1.z.boolean().refine(function (val) {
      return val === true;
    }, "Consentimento para processamento de dados é obrigatório"),
    sensitiveDataConsent: zod_1.z.boolean().refine(function (val) {
      return val === true;
    }, "Consentimento para dados sensíveis de saúde é obrigatório"),
    marketingConsent: zod_1.z.boolean().default(false),
    dataRetentionAcknowledgment: zod_1.z.boolean().refine(function (val) {
      return val === true;
    }, "Reconhecimento sobre retenção de dados é obrigatório"),
    consentDate: zod_1.z.string().optional(),
    consentVersion: zod_1.z.string().default("1.0"),
  }),
  // Health Information Preferences
  healthDataPreferences: zod_1.z
    .object({
      shareWithFamily: zod_1.z.boolean().default(false),
      shareWithInsurance: zod_1.z.boolean().default(false),
      allowResearch: zod_1.z.boolean().default(false),
      allowTelemedicine: zod_1.z.boolean().default(false),
    })
    .optional(),
  // Data Subject Rights Acknowledgment
  dataRights: zod_1.z
    .object({
      acknowledgeAccessRight: zod_1.z.boolean().default(false),
      acknowledgeCorrectionRight: zod_1.z.boolean().default(false),
      acknowledgeDeletionRight: zod_1.z.boolean().default(false),
      acknowledgePortabilityRight: zod_1.z.boolean().default(false),
    })
    .optional(),
});
// Partial schema for profile updates (all fields optional except consent)
exports.PatientProfileUpdateSchema = exports.PatientProfileSchema.partial({
  fullName: true,
  dateOfBirth: true,
  gender: true,
  cpf: true,
  rg: true,
  phone: true,
  mobile: true,
  email: true,
  address: true,
  contactPreferences: true,
  emergencyContacts: true,
  healthDataPreferences: true,
  dataRights: true,
}).extend({
  // LGPD consent must be explicitly provided for updates
  lgpdConsent: exports.PatientProfileSchema.shape.lgpdConsent,
});
// Schema for LGPD audit log
exports.LgpdAuditSchema = zod_1.z.object({
  patientId: zod_1.z.string().uuid(),
  action: zod_1.z.enum(["create", "read", "update", "delete", "consent_given", "consent_revoked"]),
  dataFields: zod_1.z.array(zod_1.z.string()),
  legalBasis: zod_1.z.string(),
  userAgent: zod_1.z.string().optional(),
  ipAddress: zod_1.z.string().optional(),
  timestamp: zod_1.z.string().datetime(),
});
