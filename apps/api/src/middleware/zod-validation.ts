/**
 * Healthcare-compliant Zod validation middleware for Hono API
 * Provides type-safe request/response validation with medical data protection
 */

import { Context, Next } from 'hono';
import { z, ZodError, ZodSchema } from 'zod';
import { createHealthcareError, ErrorCategory, ErrorSeverity } from './error-tracking';

// Validation target types
export type ValidationTarget = 'query' | 'params' | 'body' | 'headers';

// Validation configuration
export interface ValidationConfig {
  schema: ZodSchema;
  target: ValidationTarget;
  optional?: boolean;
  sanitize?: boolean;
  auditRequired?: boolean;
  dataClassification?: 'public' | 'internal' | 'personal' | 'medical' | 'financial';
}

// Healthcare data validation rules
export const HealthcareValidationRules = {
  // Brazilian document validation with healthcare context
  cpf: z.string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve estar no formato XXX.XXX.XXX-XX')
    .refine(validateCPF, 'CPF inválido'),
  
  rg: z.string()
    .regex(/^\d{2}\.\d{3}\.\d{3}-\d{1}$/, 'RG deve estar no formato XX.XXX.XXX-X'),
  
  cnpj: z.string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX')
    .refine(validateCNPJ, 'CNPJ inválido'),
  
  cep: z.string()
    .regex(/^\d{5}-\d{3}$/, 'CEP deve estar no formato XXXXX-XXX'),
  
  // Medical professional licenses
  crm: z.string()
    .regex(/^CRM[A-Z]{2}\s?\d{4,6}$/, 'CRM deve estar no formato CRMXX XXXXXX')
    .transform(val => val.replace(/\s+/g, ' ')), // Normalize spacing
  
  cro: z.string()
    .regex(/^CRO[A-Z]{2}\s?\d{4,6}$/, 'CRO deve estar no formato CROXX XXXXXX')
    .transform(val => val.replace(/\s+/g, ' ')),
  
  // Contact information with Brazilian format
  phoneNumber: z.string()
    .regex(/^\(\d{2}\)\s?9?\d{4}-?\d{4}$/, 'Telefone deve estar no formato (XX) 9XXXX-XXXX ou (XX) XXXX-XXXX'),
  
  email: z.string()
    .email('Email inválido')
    .max(254, 'Email muito longo')
    .toLowerCase(),
  
  // Medical data validation
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], {
    errorMap: () => ({ message: 'Tipo sanguíneo inválido' }),
  }),
  
  // CID-10 diagnosis codes
  cidCode: z.string()
    .regex(/^[A-Z]\d{2}\.?\d{0,2}$/, 'Código CID-10 inválido'),
  
  // TUSS procedure codes
  tussCode: z.string()
    .regex(/^\d{8}\.\d{2}\.\d{2}$/, 'Código TUSS deve estar no formato XXXXXXXX.XX.XX'),
  
  // Patient age validation
  patientAge: z.number()
    .min(0, 'Idade não pode ser negativa')
    .max(150, 'Idade inválida'),
  
  // Date validation for Brazilian format
  brazilianDate: z.string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Data deve estar no formato DD/MM/AAAA')
    .refine(validateBrazilianDate, 'Data inválida'),
  
  // SUS card number validation
  susCard: z.string()
    .regex(/^\d{15}$/, 'Cartão SUS deve ter 15 dígitos')
    .refine(validateSUSCard, 'Cartão SUS inválido'),
  
  // Medical prescription validation
  dosage: z.string()
    .min(1, 'Dosagem é obrigatória')
    .max(200, 'Dosagem muito longa'),
  
  // Patient weight and height
  weight: z.number()
    .min(0.5, 'Peso mínimo: 0.5kg')
    .max(500, 'Peso máximo: 500kg'),
  
  height: z.number()
    .min(30, 'Altura mínima: 30cm')
    .max(250, 'Altura máxima: 250cm'),
  
  // Healthcare facility validation
  cnes: z.string()
    .regex(/^\d{7}$/, 'CNES deve ter 7 dígitos'),
};

// Common validation schemas for healthcare operations
export const CommonHealthcareSchemas = {
  // Patient identification
  PatientIdentification: z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
    cpf: HealthcareValidationRules.cpf,
    rg: HealthcareValidationRules.rg.optional(),
    birthDate: HealthcareValidationRules.brazilianDate,
    susCard: HealthcareValidationRules.susCard.optional(),
  }),
  
  // Professional identification
  ProfessionalIdentification: z.object({
    name: z.string().min(2).max(100),
    cpf: HealthcareValidationRules.cpf,
    crm: HealthcareValidationRules.crm.optional(),
    cro: HealthcareValidationRules.cro.optional(),
    specialty: z.string().min(2).max(100).optional(),
  }),
  
  // Clinic information
  ClinicInformation: z.object({
    name: z.string().min(2).max(100),
    cnpj: HealthcareValidationRules.cnpj,
    cnes: HealthcareValidationRules.cnes,
    address: z.object({
      street: z.string().min(5).max(200),
      number: z.string().min(1).max(10),
      complement: z.string().max(50).optional(),
      neighborhood: z.string().min(2).max(100),
      city: z.string().min(2).max(100),
      state: z.string().length(2, 'Estado deve ter 2 caracteres'),
      cep: HealthcareValidationRules.cep,
    }),
  }),
  
  // Medical appointment
  AppointmentData: z.object({
    patientId: z.string().uuid(),
    professionalId: z.string().uuid(),
    appointmentDate: z.string().datetime(),
    duration: z.number().min(15).max(480), // 15 minutes to 8 hours
    type: z.enum(['consultation', 'followup', 'procedure', 'emergency']),
    notes: z.string().max(1000).optional(),
  }),
  
  // Medical record entry
  MedicalRecordEntry: z.object({
    patientId: z.string().uuid(),
    professionalId: z.string().uuid(),
    appointmentId: z.string().uuid().optional(),
    chiefComplaint: z.string().min(1).max(500),
    physicalExamination: z.string().max(2000).optional(),
    diagnosis: z.object({
      primary: HealthcareValidationRules.cidCode,
      secondary: z.array(HealthcareValidationRules.cidCode).optional(),
      description: z.string().max(500),
    }),
    treatment: z.string().max(1000).optional(),
    prescription: z.array(z.object({
      medication: z.string().min(1).max(200),
      dosage: HealthcareValidationRules.dosage,
      frequency: z.string().min(1).max(100),
      duration: z.string().min(1).max(100),
      instructions: z.string().max(500).optional(),
    })).optional(),
  }),
};

// CPF validation algorithm
function validateCPF(cpf: string): boolean {
  const numbers = cpf.replace(/\D/g, '');
  
  if (numbers.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(numbers)) return false; // All same digits
  
  // Validate check digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let digit1 = ((sum * 10) % 11) % 10;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  let digit2 = ((sum * 10) % 11) % 10;
  
  return parseInt(numbers[9]) === digit1 && parseInt(numbers[10]) === digit2;
}

// CNPJ validation algorithm
function validateCNPJ(cnpj: string): boolean {
  const numbers = cnpj.replace(/\D/g, '');
  
  if (numbers.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(numbers)) return false; // All same digits
  
  // Validate check digits
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(numbers[i]) * weights1[i];
  }
  let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(numbers[i]) * weights2[i];
  }
  let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  return parseInt(numbers[12]) === digit1 && parseInt(numbers[13]) === digit2;
}

// Brazilian date validation
function validateBrazilianDate(dateString: string): boolean {
  const [day, month, year] = dateString.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  
  return date.getFullYear() === year &&
         date.getMonth() === month - 1 &&
         date.getDate() === day &&
         year >= 1900 &&
         year <= new Date().getFullYear() + 1;
}

// SUS card validation (basic check digit validation)
function validateSUSCard(susCard: string): boolean {
  const numbers = susCard.replace(/\D/g, '');
  if (numbers.length !== 15) return false;
  
  // Basic validation - SUS cards have a more complex algorithm
  // This is a simplified version for demonstration
  const sum = numbers.split('').reduce((acc, digit, index) => {
    return acc + parseInt(digit) * (15 - index);
  }, 0);
  
  return sum % 11 === 0;
}

// Sanitize healthcare data for logging
function sanitizeHealthcareData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = [
    'cpf', 'rg', 'email', 'phone', 'susCard', 'birthDate',
    'medicalHistory', 'diagnosis', 'prescription', 'treatment',
  ];
  
  const sanitized = { ...data };
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED_HEALTHCARE_DATA]';
    }
  }
  
  return sanitized;
}

// Create validation middleware
export function zodValidation(config: ValidationConfig) {
  return async (c: Context, next: Next) => {
    try {
      let dataToValidate: any;
      
      // Extract data based on target
      switch (config.target) {
        case 'query':
          dataToValidate = c.req.query();
          break;
        case 'params':
          dataToValidate = c.req.param();
          break;
        case 'body':
          dataToValidate = await c.req.json().catch(() => ({}));
          break;
        case 'headers':
          dataToValidate = c.req.header();
          break;
        default:
          throw new Error(`Invalid validation target: ${config.target}`);
      }
      
      // Skip validation if optional and no data present
      if (config.optional && (!dataToValidate || Object.keys(dataToValidate).length === 0)) {
        await next();
        return;
      }
      
      // Validate data
      const validatedData = config.schema.parse(dataToValidate);
      
      // Store validated data in context for later use
      c.set(`validated_${config.target}`, validatedData);
      
      // Log audit trail for sensitive data validation
      if (config.auditRequired && config.dataClassification && 
          ['personal', 'medical', 'financial'].includes(config.dataClassification)) {
        const auditEvent = {
          type: 'data_validation',
          timestamp: new Date().toISOString(),
          target: config.target,
          dataClassification: config.dataClassification,
          userId: c.req.header('x-user-id') || 'anonymous',
          clinicId: c.req.header('x-clinic-id') || 'unknown',
          requestId: c.req.header('x-request-id') || 'unknown',
          validatedFields: Object.keys(validatedData),
        };
        
        console.log('[HEALTHCARE_VALIDATION_AUDIT]', JSON.stringify(auditEvent));
      }
      
      await next();
      
    } catch (error) {
      if (error instanceof ZodError) {
        // Create healthcare-specific validation error
        const validationError = createHealthcareError(
          'Dados de entrada inválidos',
          ErrorCategory.VALIDATION,
          ErrorSeverity.MEDIUM,
          400,
          {
            metadata: {
              target: config.target,
              dataClassification: config.dataClassification,
              errors: error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code,
              })),
              // Sanitize input data for error logging
              invalidData: sanitizeHealthcareData(error.errors),
            },
          }
        );
        
        throw validationError;
      }
      
      throw error;
    }
  };
}

// Convenience functions for common validation scenarios
export function validateQuery(schema: ZodSchema, options?: Partial<ValidationConfig>) {
  return zodValidation({
    schema,
    target: 'query',
    ...options,
  });
}

export function validateParams(schema: ZodSchema, options?: Partial<ValidationConfig>) {
  return zodValidation({
    schema,
    target: 'params',
    ...options,
  });
}

export function validateBody(schema: ZodSchema, options?: Partial<ValidationConfig>) {
  return zodValidation({
    schema,
    target: 'body',
    auditRequired: true,
    dataClassification: 'internal',
    ...options,
  });
}

export function validateHeaders(schema: ZodSchema, options?: Partial<ValidationConfig>) {
  return zodValidation({
    schema,
    target: 'headers',
    ...options,
  });
}

// Healthcare-specific validation middlewares
export function validatePatientData() {
  return validateBody(CommonHealthcareSchemas.PatientIdentification, {
    dataClassification: 'medical',
    auditRequired: true,
  });
}

export function validateProfessionalData() {
  return validateBody(CommonHealthcareSchemas.ProfessionalIdentification, {
    dataClassification: 'personal',
    auditRequired: true,
  });
}

export function validateClinicData() {
  return validateBody(CommonHealthcareSchemas.ClinicInformation, {
    dataClassification: 'internal',
    auditRequired: true,
  });
}

export function validateAppointmentData() {
  return validateBody(CommonHealthcareSchemas.AppointmentData, {
    dataClassification: 'medical',
    auditRequired: true,
  });
}

export function validateMedicalRecord() {
  return validateBody(CommonHealthcareSchemas.MedicalRecordEntry, {
    dataClassification: 'medical',
    auditRequired: true,
  });
}

// Helper to get validated data from context
export function getValidatedData<T = any>(c: Context, target: ValidationTarget): T {
  return c.get(`validated_${target}`) as T;
}