/**
 * Healthcare-compliant Valibot validation middleware for Hono API
 * Provides type-safe request/response validation with medical data protection
 */

import { Context, Next } from 'hono';
import * as v from 'valibot';
import { createHealthcareError, ErrorCategory, ErrorSeverity } from '../services/error-tracking-bridge';

// Validation target types
export type ValidationTarget = 'query' | 'params' | 'body' | 'headers';

// Validation configuration
export interface ValidationConfig {
  schema: v.BaseSchema<any, any, any>;
  target: ValidationTarget;
  optional?: boolean;
  sanitize?: boolean;
  auditRequired?: boolean;
  dataClassification?: 'public' | 'internal' | 'personal' | 'medical' | 'financial';
}

// Healthcare data validation rules
export const HealthcareValidationRules = {
  // Brazilian document validation with healthcare context
  cpf: v.pipe(
    v.string(),
    v.regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve estar no formato XXX.XXX.XXX-XX'),
    v.check(validateCPF, 'CPF inválido'),
  ),

  rg: v.pipe(
    v.string(),
    v.regex(/^\d{2}\.\d{3}\.\d{3}-\d{1}$/, 'RG deve estar no formato XX.XXX.XXX-X'),
  ),

  cnpj: v.pipe(
    v.string(),
    v.regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX'),
    v.check(validateCNPJ, 'CNPJ inválido'),
  ),

  cep: v.pipe(
    v.string(),
    v.regex(/^\d{5}-\d{3}$/, 'CEP deve estar no formato XXXXX-XXX'),
  ),

  // Medical professional licenses
  crm: v.pipe(
    v.string(),
    v.regex(/^CRM[A-Z]{2}\s?\d{4,6}$/, 'CRM deve estar no formato CRMXX XXXXXX'),
    v.transform(val => val.replace(/\s+/g, ' ')), // Normalize spacing
  ),

  cro: v.pipe(
    v.string(),
    v.regex(/^CRO[A-Z]{2}\s?\d{4,6}$/, 'CRO deve estar no formato CROXX XXXXXX'),
    v.transform(val => val.replace(/\s+/g, ' ')),
  ),

  // Contact information with Brazilian format
  phoneNumber: v.pipe(
    v.string(),
    v.regex(
      /^\(\d{2}\)\s?9?\d{4}-?\d{4}$/,
      'Telefone deve estar no formato (XX) 9XXXX-XXXX ou (XX) XXXX-XXXX',
    ),
  ),

  email: v.pipe(
    v.string(),
    v.email('Email inválido'),
    v.maxLength(254, 'Email muito longo'),
    v.transform(val => val.toLowerCase()),
  ),

  // Medical data validation
  bloodType: v.picklist(
    ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'Tipo sanguíneo inválido',
  ),

  // CID-10 diagnosis codes
  cidCode: v.pipe(
    v.string(),
    v.regex(/^[A-Z]\d{2}\.?\d{0,2}$/, 'Código CID-10 inválido'),
  ),

  // TUSS procedure codes
  tussCode: v.pipe(
    v.string(),
    v.regex(/^\d{8}\.\d{2}\.\d{2}$/, 'Código TUSS deve estar no formato XXXXXXXX.XX.XX'),
  ),

  // Patient age validation
  patientAge: v.pipe(
    v.number(),
    v.minValue(0, 'Idade não pode ser negativa'),
    v.maxValue(150, 'Idade inválida'),
  ),

  // Date validation for Brazilian format
  brazilianDate: v.pipe(
    v.string(),
    v.regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Data deve estar no formato DD/MM/AAAA'),
    v.check(validateBrazilianDate, 'Data inválida'),
  ),

  // SUS card number validation
  susCard: v.pipe(
    v.string(),
    v.regex(/^\d{15}$/, 'Cartão SUS deve ter 15 dígitos'),
    v.check(validateSUSCard, 'Cartão SUS inválido'),
  ),

  // Medical prescription validation
  dosage: v.pipe(
    v.string(),
    v.minLength(1, 'Dosagem é obrigatória'),
    v.maxLength(200, 'Dosagem muito longa'),
  ),

  // Patient weight and height
  weight: v.pipe(
    v.number(),
    v.minValue(0.5, 'Peso mínimo: 0.5kg'),
    v.maxValue(500, 'Peso máximo: 500kg'),
  ),

  height: v.pipe(
    v.number(),
    v.minValue(30, 'Altura mínima: 30cm'),
    v.maxValue(250, 'Altura máxima: 250cm'),
  ),

  // Healthcare facility validation
  cnes: v.pipe(
    v.string(),
    v.regex(/^\d{7}$/, 'CNES deve ter 7 dígitos'),
  ),
};

// Common validation schemas for healthcare operations
export const CommonHealthcareSchemas = {
  // Patient identification
  PatientIdentification: v.object({
    name: v.pipe(
      v.string(),
      v.minLength(2, 'Nome deve ter pelo menos 2 caracteres'),
      v.maxLength(100),
    ),
    cpf: HealthcareValidationRules.cpf,
    rg: v.optional(HealthcareValidationRules.rg),
    birthDate: HealthcareValidationRules.brazilianDate,
    susCard: v.optional(HealthcareValidationRules.susCard),
  }),

  // Professional identification
  ProfessionalIdentification: v.object({
    name: v.pipe(v.string(), v.minLength(2), v.maxLength(100)),
    cpf: HealthcareValidationRules.cpf,
    crm: v.optional(HealthcareValidationRules.crm),
    cro: v.optional(HealthcareValidationRules.cro),
    specialty: v.optional(v.pipe(v.string(), v.minLength(2), v.maxLength(100))),
  }),

  // Clinic information
  ClinicInformation: v.object({
    name: v.pipe(v.string(), v.minLength(2), v.maxLength(100)),
    cnpj: HealthcareValidationRules.cnpj,
    cnes: HealthcareValidationRules.cnes,
    address: v.object({
      street: v.pipe(v.string(), v.minLength(5), v.maxLength(200)),
      number: v.pipe(v.string(), v.minLength(1), v.maxLength(10)),
      complement: v.optional(v.pipe(v.string(), v.maxLength(50))),
      neighborhood: v.pipe(v.string(), v.minLength(2), v.maxLength(100)),
      city: v.pipe(v.string(), v.minLength(2), v.maxLength(100)),
      state: v.pipe(v.string(), v.length(2, 'Estado deve ter 2 caracteres')),
      cep: HealthcareValidationRules.cep,
    }),
  }),

  // Medical appointment
  AppointmentData: v.object({
    patientId: v.pipe(v.string(), v.uuid()),
    professionalId: v.pipe(v.string(), v.uuid()),
    appointmentDate: v.pipe(v.string(), v.isoDateTime()),
    duration: v.pipe(v.number(), v.minValue(15), v.maxValue(480)), // 15 minutes to 8 hours
    type: v.picklist(['consultation', 'followup', 'procedure', 'emergency']),
    notes: v.optional(v.pipe(v.string(), v.maxLength(1000))),
  }),

  // Medical record entry
  MedicalRecordEntry: v.object({
    patientId: v.pipe(v.string(), v.uuid()),
    professionalId: v.pipe(v.string(), v.uuid()),
    appointmentId: v.optional(v.pipe(v.string(), v.uuid())),
    chiefComplaint: v.pipe(v.string(), v.minLength(1), v.maxLength(500)),
    physicalExamination: v.optional(v.pipe(v.string(), v.maxLength(2000))),
    diagnosis: v.object({
      primary: HealthcareValidationRules.cidCode,
      secondary: v.optional(v.array(HealthcareValidationRules.cidCode)),
      description: v.pipe(v.string(), v.maxLength(500)),
    }),
    treatment: v.optional(v.pipe(v.string(), v.maxLength(1000))),
    prescription: v.optional(v.array(v.object({
      medication: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
      dosage: HealthcareValidationRules.dosage,
      frequency: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
      duration: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
      instructions: v.optional(v.pipe(v.string(), v.maxLength(500))),
    }))),
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

  return date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day
    && year >= 1900
    && year <= new Date().getFullYear() + 1;
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
    'cpf',
    'rg',
    'email',
    'phone',
    'susCard',
    'birthDate',
    'medicalHistory',
    'diagnosis',
    'prescription',
    'treatment',
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
export function valibotValidation(config: ValidationConfig) {
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
      const validatedData = v.parse(config.schema, dataToValidate);

      // Store validated data in context for later use
      c.set(`validated_${config.target}`, validatedData);

      // Log audit trail for sensitive data validation
      if (
        config.auditRequired && config.dataClassification
        && ['personal', 'medical', 'financial'].includes(config.dataClassification)
      ) {
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
      if (v.isValiError(error)) {
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
              errors: v.flatten(error).nested
                ? Object.entries(v.flatten(error).nested).map(([field, issues]) => ({
                  field,
                  message: issues?.[0] || 'Validation error',
                  code: 'validation_error',
                }))
                : [{
                  field: 'root',
                  message: v.flatten(error).root?.[0] || 'Validation error',
                  code: 'validation_error',
                }],
              // Sanitize input data for error logging
              invalidData: sanitizeHealthcareData(error),
            },
          },
        );

        throw validationError;
      }

      throw error;
    }
  };
}

// Convenience functions for common validation scenarios
export function validateQuery(
  schema: v.BaseSchema<any, any, any>,
  options?: Partial<ValidationConfig>,
) {
  return valibotValidation({
    schema,
    target: 'query',
    ...options,
  });
}

export function validateParams(
  schema: v.BaseSchema<any, any, any>,
  options?: Partial<ValidationConfig>,
) {
  return valibotValidation({
    schema,
    target: 'params',
    ...options,
  });
}

export function validateBody(
  schema: v.BaseSchema<any, any, any>,
  options?: Partial<ValidationConfig>,
) {
  return valibotValidation({
    schema,
    target: 'body',
    auditRequired: true,
    dataClassification: 'internal',
    ...options,
  });
}

export function validateHeaders(
  schema: v.BaseSchema<any, any, any>,
  options?: Partial<ValidationConfig>,
) {
  return valibotValidation({
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

// Legacy compatibility - keep old function names but use Valibot internally
export const zodValidation = valibotValidation;
