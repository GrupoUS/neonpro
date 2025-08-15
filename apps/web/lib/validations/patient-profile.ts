import { z } from 'zod';

// LGPD-compliant validation schema for patient profile management
// Implements explicit consent and data minimization principles

export const PatientProfileSchema = z.object({
  // Personal Information (LGPD sensitive data)
  fullName: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome não pode exceder 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),

  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato AAAA-MM-DD')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 0 && age <= 120;
    }, 'Data de nascimento inválida'),

  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say'], {
    errorMap: () => ({ message: 'Selecione um gênero válido' }),
  }),

  cpf: z
    .string()
    .regex(/^\d{11}$/, 'CPF deve conter apenas 11 dígitos')
    .refine((cpf) => {
      // Basic CPF validation (simplified for demo)
      const digits = cpf.split('').map(Number);
      return digits.length === 11 && !digits.every((d) => d === digits[0]);
    }, 'CPF inválido'),

  rg: z
    .string()
    .min(7, 'RG deve ter pelo menos 7 caracteres')
    .max(12, 'RG não pode exceder 12 caracteres')
    .optional(),

  // Contact Information
  phone: z
    .string()
    .regex(
      /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
      'Telefone deve estar no formato (XX) XXXXX-XXXX'
    )
    .optional(),

  mobile: z
    .string()
    .regex(
      /^\(\d{2}\)\s\d{5}-\d{4}$/,
      'Celular deve estar no formato (XX) XXXXX-XXXX'
    ),

  email: z
    .string()
    .email('Email deve ser válido')
    .max(100, 'Email não pode exceder 100 caracteres')
    .optional(),

  // Address Information (LGPD personal data)
  address: z.object({
    street: z
      .string()
      .min(5, 'Endereço deve ter pelo menos 5 caracteres')
      .max(100, 'Endereço não pode exceder 100 caracteres'),

    number: z
      .string()
      .min(1, 'Número é obrigatório')
      .max(10, 'Número não pode exceder 10 caracteres'),

    complement: z
      .string()
      .max(50, 'Complemento não pode exceder 50 caracteres')
      .optional(),

    neighborhood: z
      .string()
      .min(2, 'Bairro deve ter pelo menos 2 caracteres')
      .max(50, 'Bairro não pode exceder 50 caracteres'),

    city: z
      .string()
      .min(2, 'Cidade deve ter pelo menos 2 caracteres')
      .max(50, 'Cidade não pode exceder 50 caracteres'),

    state: z
      .string()
      .length(2, 'Estado deve ter exatamente 2 caracteres')
      .regex(/^[A-Z]{2}$/, 'Estado deve ser em maiúsculas'),

    zipCode: z
      .string()
      .regex(/^\d{5}-?\d{3}$/, 'CEP deve estar no formato XXXXX-XXX'),
  }),

  // Contact Preferences (LGPD consent-based)
  contactPreferences: z.object({
    allowEmail: z.boolean().default(false),
    allowSms: z.boolean().default(false),
    allowWhatsapp: z.boolean().default(false),
    allowPhone: z.boolean().default(false),

    // Marketing preferences
    allowMarketing: z.boolean().default(false),
    allowAppointmentReminders: z.boolean().default(true),
    allowHealthTips: z.boolean().default(false),

    // Preferred communication method
    preferredMethod: z
      .enum(['email', 'sms', 'whatsapp', 'phone'], {
        errorMap: () => ({
          message: 'Selecione um método de comunicação preferido',
        }),
      })
      .optional(),

    // Best time to contact
    bestTimeToContact: z
      .enum(['morning', 'afternoon', 'evening', 'anytime'], {
        errorMap: () => ({
          message: 'Selecione o melhor horário para contato',
        }),
      })
      .default('anytime'),
  }),

  // Emergency Contacts (LGPD personal data of third parties - requires consent)
  emergencyContacts: z
    .array(
      z.object({
        name: z
          .string()
          .min(2, 'Nome deve ter pelo menos 2 caracteres')
          .max(100, 'Nome não pode exceder 100 caracteres'),

        relationship: z
          .string()
          .min(2, 'Parentesco deve ter pelo menos 2 caracteres')
          .max(50, 'Parentesco não pode exceder 50 caracteres'),

        phone: z
          .string()
          .regex(
            /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
            'Telefone deve estar no formato (XX) XXXXX-XXXX'
          ),

        email: z
          .string()
          .email('Email deve ser válido')
          .max(100, 'Email não pode exceder 100 caracteres')
          .optional(),

        isPrimary: z.boolean().default(false),
      })
    )
    .max(3, 'Máximo de 3 contatos de emergência permitidos'),

  // LGPD Consent Management
  lgpdConsent: z.object({
    dataProcessingConsent: z
      .boolean()
      .refine(
        (val) => val === true,
        'Consentimento para processamento de dados é obrigatório'
      ),

    sensitiveDataConsent: z
      .boolean()
      .refine(
        (val) => val === true,
        'Consentimento para dados sensíveis de saúde é obrigatório'
      ),

    marketingConsent: z.boolean().default(false),

    dataRetentionAcknowledgment: z
      .boolean()
      .refine(
        (val) => val === true,
        'Reconhecimento sobre retenção de dados é obrigatório'
      ),

    consentDate: z.string().optional(),
    consentVersion: z.string().default('1.0'),
  }),

  // Health Information Preferences
  healthDataPreferences: z
    .object({
      shareWithFamily: z.boolean().default(false),
      shareWithInsurance: z.boolean().default(false),
      allowResearch: z.boolean().default(false),
      allowTelemedicine: z.boolean().default(false),
    })
    .optional(),

  // Data Subject Rights Acknowledgment
  dataRights: z
    .object({
      acknowledgeAccessRight: z.boolean().default(false),
      acknowledgeCorrectionRight: z.boolean().default(false),
      acknowledgeDeletionRight: z.boolean().default(false),
      acknowledgePortabilityRight: z.boolean().default(false),
    })
    .optional(),
});

export type PatientProfile = z.infer<typeof PatientProfileSchema>;

// Partial schema for profile updates (all fields optional except consent)
export const PatientProfileUpdateSchema = PatientProfileSchema.partial({
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
  lgpdConsent: PatientProfileSchema.shape.lgpdConsent,
});

export type PatientProfileUpdate = z.infer<typeof PatientProfileUpdateSchema>;

// Schema for LGPD audit log
export const LgpdAuditSchema = z.object({
  patientId: z.string().uuid(),
  action: z.enum([
    'create',
    'read',
    'update',
    'delete',
    'consent_given',
    'consent_revoked',
  ]),
  dataFields: z.array(z.string()),
  legalBasis: z.string(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  timestamp: z.string().datetime(),
});

export type LgpdAudit = z.infer<typeof LgpdAuditSchema>;
