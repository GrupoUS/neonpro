import { z } from 'zod';

/**
 * 🩺 Patient Schemas - NeonPro Healthcare
 * =====================================
 * 
 * Schemas Zod para validação de dados de pacientes
 * com compliance LGPD e validações específicas do domínio médico.
 */

// Base patient information
export const PatientBaseSchema = z.object({
  // Personal Information
  fullName: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  email: z.string()
    .email('Email inválido')
    .max(100, 'Email deve ter no máximo 100 caracteres'),
  
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Telefone inválido')
    .transform((val) => val.replace(/\D/g, '')),
  
  // Document numbers (Brazil specific)
  cpf: z.string()
    .regex(/^\d{11}$/, 'CPF deve conter 11 dígitos')
    .refine((val) => {
      // Basic CPF validation
      if (val.length !== 11) return false;
      if (/^(.)\1*$/.test(val)) return false; // All same digits
      return true;
    }, 'CPF inválido'),
  
  rg: z.string()
    .min(7, 'RG deve ter pelo menos 7 caracteres')
    .max(20, 'RG deve ter no máximo 20 caracteres')
    .optional(),
  
  // Birth and demographics
  birthDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .refine((date) => {
      const parsed = new Date(date);
      const now = new Date();
      const age = now.getFullYear() - parsed.getFullYear();
      return age >= 0 && age <= 120;
    }, 'Data de nascimento inválida'),
  
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say'], {
    errorMap: () => ({ message: 'Gênero deve ser male, female, other ou prefer_not_to_say' })
  }),
  
  // Address
  address: z.object({
    street: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres').max(200),
    number: z.string().max(20),
    complement: z.string().max(100).optional(),
    neighborhood: z.string().max(100),
    city: z.string().max(100),
    state: z.string().length(2, 'Estado deve ter 2 caracteres'),
    zipCode: z.string().regex(/^\d{8}$/, 'CEP deve conter 8 dígitos'),
  }),
  
  // Emergency contact
  emergencyContact: z.object({
    name: z.string().min(2).max(100),
    relationship: z.string().max(50),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  }).optional(),
});

// Medical information schema
export const PatientMedicalSchema = z.object({
  // Medical history
  allergies: z.array(z.string().max(200)).default([]),
  chronicConditions: z.array(z.string().max(200)).default([]),
  currentMedications: z.array(z.string().max(200)).default([]),
  
  // Health metrics
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  height: z.number().min(50).max(300).optional(), // cm
  weight: z.number().min(10).max(500).optional(), // kg
  
  // Insurance
  insuranceProvider: z.string().max(100).optional(),
  insuranceNumber: z.string().max(50).optional(),
  
  // LGPD Consent
  consentGiven: z.boolean(),
  consentDate: z.string().datetime(),
  dataProcessingConsent: z.boolean(),
  marketingConsent: z.boolean().default(false),
});

// Create patient schema
export const CreatePatientSchema = PatientBaseSchema.merge(
  PatientMedicalSchema.partial().omit({
    consentGiven: true,
    consentDate: true,
    dataProcessingConsent: true,
  }).extend({
    consentGiven: z.literal(true),
    dataProcessingConsent: z.literal(true),
  })
);

// Update patient schema (all fields optional except ID)
export const UpdatePatientSchema = PatientBaseSchema
  .merge(PatientMedicalSchema)
  .partial()
  .extend({
    id: z.string().uuid('ID deve ser um UUID válido'),
  });

// Patient response schema
export const PatientResponseSchema = PatientBaseSchema
  .merge(PatientMedicalSchema)
  .extend({
    id: z.string().uuid(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    // Remove sensitive data from response
    cpf: z.string().transform((val) => `***.***.${val.slice(-3)}-**`),
    phone: z.string().transform((val) => `${val.slice(0, 5)}****${val.slice(-2)}`),
  });

// Search/filter schema
export const PatientSearchSchema = z.object({
  query: z.string().max(100).optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  ageRange: z.object({
    min: z.number().min(0).max(120),
    max: z.number().min(0).max(120),
  }).optional(),
  city: z.string().max(100).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// Export types
export type PatientBase = z.infer<typeof PatientBaseSchema>;
export type PatientMedical = z.infer<typeof PatientMedicalSchema>;
export type CreatePatient = z.infer<typeof CreatePatientSchema>;
export type UpdatePatient = z.infer<typeof UpdatePatientSchema>;
export type PatientResponse = z.infer<typeof PatientResponseSchema>;
export type PatientSearch = z.infer<typeof PatientSearchSchema>;