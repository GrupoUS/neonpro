import { z } from 'zod';
import { ERROR_CODES, HEALTHCARE_CONSTANTS } from './constants.js';
import { validateCEP, validateCPF, validateEmail, validatePhone } from './utils.js';

// Custom Zod validators for Brazilian healthcare

/**
 * CPF validator
 */
export const cpfValidator = z
  .string()
  .min(11, 'CPF deve ter 11 dígitos')
  .max(14, 'CPF inválido') // with formatting
  .refine(validateCPF, 'CPF inválido');

/**
 * CEP validator
 */
export const cepValidator = z
  .string()
  .min(8, 'CEP deve ter 8 dígitos')
  .max(9, 'CEP inválido') // with formatting
  .refine(validateCEP, 'CEP inválido');

/**
 * Phone validator
 */
export const phoneValidator = z
  .string()
  .min(10, 'Telefone deve ter pelo menos 10 dígitos')
  .max(15, 'Telefone inválido') // with formatting
  .refine(validatePhone, 'Telefone inválido');

/**
 * Email validator
 */
export const emailValidator = z
  .string()
  .email('Email inválido')
  .refine(validateEmail, 'Formato de email inválido');

/**
 * CRM validator (Brazilian medical license)
 */
export const crmValidator = z
  .string()
  .regex(
    HEALTHCARE_CONSTANTS.BRAZIL.CRM_PATTERN,
    'CRM deve estar no formato NNNN/UF ou NNNNN/UF ou NNNNNN/UF'
  );

/**
 * COREN validator (Brazilian nursing license)
 */
export const corenValidator = z
  .string()
  .regex(
    HEALTHCARE_CONSTANTS.BRAZIL.COREN_PATTERN,
    'COREN deve estar no formato NNNNNN/UF'
  );

/**
 * Password validator
 */
export const passwordValidator = z
  .string()
  .min(HEALTHCARE_CONSTANTS.LIMITS.PASSWORD_MIN_LENGTH, `Senha deve ter pelo menos ${HEALTHCARE_CONSTANTS.LIMITS.PASSWORD_MIN_LENGTH} caracteres`)
  .regex(/[A-Z]/, 'Senha deve ter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Senha deve ter pelo menos uma letra minúscula')
  .regex(/\d/, 'Senha deve ter pelo menos um número')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Senha deve ter pelo menos um caractere especial');

/**
 * Date validators
 */
export const dateValidator = z.coerce.date();

export const futureDateValidator = z.coerce.date().refine(
  (date) => date > new Date(),
  'Data deve ser no futuro'
);

export const pastDateValidator = z.coerce.date().refine(
  (date) => date < new Date(),
  'Data deve ser no passado'
);

export const birthDateValidator = z.coerce.date()
  .refine(
    (date) => date < new Date(),
    'Data de nascimento deve ser no passado'
  )
  .refine(
    (date) => {
      const maxAge = 150;
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - maxAge);
      return date > minDate;
    },
    'Data de nascimento inválida'
  );

/**
 * Common entity validators
 */

// User schema
export const userSchema = z.object({
  id: z.string().uuid(),
  email: emailValidator,
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  role: z.enum(['admin', 'doctor', 'nurse', 'receptionist', 'patient', 'viewer']),
  isActive: z.boolean().default(true),
  createdAt: dateValidator,
  updatedAt: dateValidator,
});

// Patient schema
export const patientSchema = z.object({
  id: z.string().uuid(),
  cpf: cpfValidator,
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  email: emailValidator.optional(),
  phone: phoneValidator.optional(),
  birthDate: birthDateValidator,
  gender: z.enum(['M', 'F', 'O']).optional(),
  status: z.enum(['active', 'inactive', 'pending', 'archived']).default('active'),
  createdAt: dateValidator,
  updatedAt: dateValidator,
});

// Healthcare professional schema
export const healthcareProfessionalSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  email: emailValidator,
  phone: phoneValidator,
  crm: crmValidator.optional(),
  coren: corenValidator.optional(),
  specialty: z.string().max(100, 'Especialidade muito longa').optional(),
  department: z.string().max(100, 'Departamento muito longo').optional(),
  status: z.enum(['active', 'inactive', 'pending', 'archived']).default('active'),
  isActive: z.boolean().default(true),
  createdAt: dateValidator,
  updatedAt: dateValidator,
});

// Appointment schema
export const appointmentSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  datetime: futureDateValidator,
  duration: z.number().min(15, 'Duração mínima de 15 minutos').max(480, 'Duração máxima de 8 horas'),
  type: z.enum(['consultation', 'exam', 'procedure', 'follow_up', 'emergency']),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).default('scheduled'),
  notes: z.string().max(1000, 'Observações muito longas').optional(),
  createdAt: dateValidator,
  updatedAt: dateValidator,
});

// Address schema
export const addressSchema = z.object({
  street: z.string().min(1, 'Logradouro é obrigatório').max(200, 'Logradouro muito longo'),
  number: z.string().min(1, 'Número é obrigatório').max(20, 'Número muito longo'),
  complement: z.string().max(100, 'Complemento muito longo').optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório').max(100, 'Bairro muito longo'),
  city: z.string().min(1, 'Cidade é obrigatória').max(100, 'Cidade muito longa'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres'),
  zipCode: cepValidator,
  country: z.string().default('Brasil'),
});

// LGPD consent schema
export const lgpdConsentSchema = z.object({
  given: z.boolean(),
  timestamp: dateValidator,
  version: z.string().default(HEALTHCARE_CONSTANTS.LGPD.CONSENT_VERSION),
  purpose: z.string().min(1, 'Finalidade é obrigatória'),
  ipAddress: z.string().ip().optional(),
});

/**
 * API request validators
 */

// Login request
export const loginRequestSchema = z.object({
  email: emailValidator,
  password: z.string().min(1, 'Senha é obrigatória'),
});

// Create patient request
export const createPatientRequestSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  cpf: cpfValidator,
  email: emailValidator.optional(),
  phone: phoneValidator.optional(),
  birthDate: z.string().refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime()) && parsed < new Date();
  }, 'Data de nascimento inválida'),
  consent: z.object({
    given: z.boolean(),
    purpose: z.string().min(1, 'Finalidade é obrigatória'),
  }),
});

// Update patient request
export const updatePatientRequestSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo').optional(),
  email: emailValidator.optional(),
  phone: phoneValidator.optional(),
  address: addressSchema.optional(),
});

// Pagination query
export const paginationQuerySchema = z.object({
  page: z.coerce.number().min(1, 'Página deve ser maior que 0').default(1),
  limit: z.coerce.number().min(1, 'Limite deve ser maior que 0').max(HEALTHCARE_CONSTANTS.API.MAX_PAGE_SIZE, `Limite máximo é ${HEALTHCARE_CONSTANTS.API.MAX_PAGE_SIZE}`).default(HEALTHCARE_CONSTANTS.API.DEFAULT_PAGE_SIZE),
});

// Search query
export const searchQuerySchema = z.object({
  search: z.string().max(100, 'Busca muito longa').optional(),
  status: z.enum(['active', 'inactive', 'pending', 'archived']).optional(),
}).merge(paginationQuerySchema);

/**
 * Validation helper functions
 */
export function createValidationError(field: string, message: string, code = ERROR_CODES.REQUIRED_FIELD) {
  return {
    field,
    message,
    code,
  };
}

export function validateRequired<T>(value: T, fieldName: string) {
  if (value === null || value === undefined || value === '') {
    throw new Error(`${fieldName} é obrigatório`);
  }
  return value;
}

export function validateMinLength(value: string, minLength: number, fieldName: string) {
  if (value.length < minLength) {
    throw new Error(`${fieldName} deve ter pelo menos ${minLength} caracteres`);
  }
  return value;
}

export function validateMaxLength(value: string, maxLength: number, fieldName: string) {
  if (value.length > maxLength) {
    throw new Error(`${fieldName} deve ter no máximo ${maxLength} caracteres`);
  }
  return value;
}
