/**
 * Healthcare Form Validation Utilities
 * 
 * Comprehensive validation system for healthcare forms with LGPD compliance,
 * accessibility features, and Brazilian healthcare standards integration.
 *
 * @fileoverview Healthcare form validation with Brazilian standards compliance
 */

import { z } from 'zod';
import type { HealthcareFormContext } from '@neonpro/ui';

// Brazilian healthcare data validation schemas
export const brazilianHealthcareSchemas = {
  // CPF validation (Brazilian tax ID)
  cpf: z.string()
    .refine((val) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(val) || /^\d{11}$/.test(val), {
      message: 'CPF deve estar no formato 000.000.000-00 ou 11 dígitos',
    })
    .refine((val) => {
      const cleanCPF = val.replace(/\D/g, '');
      if (cleanCPF.length !== 11) return false;
      
      // CPF validation algorithm
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCPF[i]) * (10 - i);
      }
      let remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cleanCPF[9])) return false;
      
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCPF[i]) * (11 - i);
      }
      remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      
      return remainder === parseInt(cleanCPF[10]);
    }, {
      message: 'CPF inválido',
    }),

  // CRM validation (Brazilian medical council registration)
  crm: z.string()
    .min(4, 'CRM deve ter no mínimo 4 dígitos')
    .max(10, 'CRM deve ter no máximo 10 dígitos')
    .refine((val) => /^\d+$/.test(val), {
      message: 'CRM deve conter apenas números',
    }),

  // Phone number validation (Brazilian format)
  phoneNumber: z.string()
    .refine((val) => {
      const cleanPhone = val.replace(/\D/g, '');
      return cleanPhone.length === 10 || cleanPhone.length === 11;
    }, {
      message: 'Telefone deve ter 10 ou 11 dígitos',
    })
    .refine((val) => {
      const cleanPhone = val.replace(/\D/g, '');
      if (cleanPhone.length === 11) {
        return cleanPhone[2] === '9'; // Mobile numbers start with 9
      }
      return true;
    }, {
      message: 'Número de celular inválido (deve começar com 9)',
    }),

  // Medical record number validation
  medicalRecordNumber: z.string()
    .min(1, 'Número do prontuário é obrigatório')
    .max(50, 'Número do prontuário deve ter no máximo 50 caracteres')
    .refine((val) => /^[A-Za-z0-9\-/]+$/.test(val), {
      message: 'Número do prontuário deve conter apenas letras, números, hífens e barras',
    }),

  // Date of birth validation
  dateOfBirth: z.string()
    .refine((val) => {
      // Support multiple date formats: DD/MM/YYYY, YYYY-MM-DD
      return /^\d{2}\/\d{2}\/\d{4}$/.test(val) || /^\d{4}-\d{2}-\d{2}$/.test(val);
    }, {
      message: 'Data deve estar no formato DD/MM/YYYY ou YYYY-MM-DD',
    })
    .refine((val) => {
      let date: Date;
      if (val.includes('/')) {
        const [day, month, year] = val.split('/');
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        date = new Date(val);
      }
      
      const now = new Date();
      const minDate = new Date(now.getFullYear() - 120, 0, 1); // Max 120 years old
      
      return !isNaN(date.getTime()) && date <= now && date >= minDate;
    }, {
      message: 'Data de nascimento inválida',
    }),

  // Medical specialty validation
  medicalSpecialty: z.enum([
    'cardiologia',
    'pediatria', 
    'ginecologia',
    'neurologia',
    'ortopedia',
    'psiquiatria',
    'dermatologia',
    'oftalmologia',
    'medicina-geral',
  ], {
    errorMap: () => ({ message: 'Especialidade médica inválida' }),
  }),

  // Patient name validation
  patientName: z.string()
    .min(2, 'Nome do paciente deve ter no mínimo 2 caracteres')
    .max(100, 'Nome do paciente deve ter no máximo 100 caracteres')
    .refine((val) => /^[A-Za-zÀ-ÿ\s\-']+$/.test(val), {
      message: 'Nome do paciente deve conter apenas letras, espaços, hífens e apóstrofos',
    }),

  // Email validation
  email: z.string()
    .email('Email inválido'),

  // Blood type validation
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], {
    errorMap: () => ({ message: 'Tipo sanguíneo inválido' }),
  }),

  // Urgency level validation
  urgencyLevel: z.enum(['emergencia', 'urgencia', 'prioridade', 'normal', 'baixa'], {
    errorMap: () => ({ message: 'Nível de urgência inválido' }),
  }),

  // Consultation type validation
  consultationType: z.enum([
    'primeira-consulta',
    'retorno', 
    'consulta-urgencia',
    'teleconsulta',
    'consulta-especializada',
    'segunda-opiniao',
  ], {
    errorMap: () => ({ message: 'Tipo de consulta inválido' }),
  }),
};

// Healthcare data sensitivity levels
export enum HealthcareDataSensitivity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum DataSensitivity {
  PUBLIC = 'public',
  INTERNAL = 'internal', 
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
}

// LGPD consent types
export interface LGPDConsent {
  id: string;
  version: string;
  purpose: string;
  scope: string[];
  retentionPeriod: string;
  givenAt: Date;
  expiresAt?: Date;
  revokedAt?: Date;
}

// Healthcare form validation context
export interface HealthcareValidationContext {
  dataSensitivity: DataSensitivity;
  emergencyForm: boolean;
  patientDataForm: boolean;
  consentRequired: boolean;
  consentGiven: boolean;
  lgpdCompliant: boolean;
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  dataSensitivity: DataSensitivity;
  requiresConsent: boolean;
}

// Healthcare form field configuration
export interface HealthcareFieldConfig {
  name: string;
  type: keyof typeof brazilianHealthcareSchemas;
  required: boolean;
  dataSensitivity: DataSensitivity;
  emergencyField?: boolean;
  customValidation?: (value: string, context: HealthcareValidationContext) => string | null;
  mask?: string;
  placeholder?: string;
  helperText?: string;
}

// Form validation result
export interface FormValidationResult {
  isValid: boolean;
  fieldResults: Record<string, ValidationResult>;
  globalErrors: string[];
  consentRequired: boolean;
  lgpdCompliance: {
    valid: boolean;
    issues: string[];
  };
  accessibility: {
    valid: boolean;
    issues: string[];
  };
}

/**
 * Validate a healthcare form field
 */
export function validateHealthcareField(
  value: string,
  config: HealthcareFieldConfig,
  context: HealthcareValidationContext
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Required validation
  if (config.required && !value.trim()) {
    errors.push('Campo obrigatório');
  }

  // Skip other validations if empty and not required
  if (!value.trim() && !config.required) {
    return {
      isValid: true,
      errors: [],
      warnings,
      suggestions,
      dataSensitivity: config.dataSensitivity,
      requiresConsent: config.dataSensitivity !== DataSensitivity.PUBLIC,
    };
  }

  // Schema validation
  const schema = brazilianHealthcareSchemas[config.type];
  try {
    schema.parse(value);
  } catch (validationError) {
    if (validationError instanceof z.ZodError) {
      errors.push(...validationError.errors.map(err => err.message));
    }
  }

  // Custom validation
  if (config.customValidation) {
    const customError = config.customValidation(value, context);
    if (customError) {
      errors.push(customError);
    }
  }

  // Emergency field validation
  if (config.emergencyField && !context.emergencyForm) {
    warnings.push('Campo de emergência em formulário não emergencial');
  }

  // Data sensitivity warnings
  if (config.dataSensitivity === DataSensitivity.RESTRICTED && !context.consentGiven) {
    warnings.push('Dados altamente sensíveis sem consentimento LGPD');
    suggestions.push('Obter consentimento explícito do paciente');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
    dataSensitivity: config.dataSensitivity,
    requiresConsent: config.dataSensitivity !== DataSensitivity.PUBLIC,
  };
}

/**
 * Validate complete healthcare form
 */
export function validateHealthcareForm(
  formData: Record<string, string>,
  fieldConfigs: HealthcareFieldConfig[],
  context: HealthcareValidationContext
): FormValidationResult {
  const fieldResults: Record<string, ValidationResult> = {};
  const globalErrors: string[] = [];
  const lgpdIssues: string[] = [];
  const accessibilityIssues: string[] = [];

  // Validate each field
  fieldConfigs.forEach(config => {
    const value = formData[config.name] || '';
    const result = validateHealthcareField(value, config, context);
    fieldResults[config.name] = result;
  });

  // LGPD compliance validation
  if (context.consentRequired && !context.consentGiven) {
    globalErrors.push('Consentimento LGPD é obrigatório');
    lgpdIssues.push('Consentimento LGPD não fornecido');
  }

  // Check for sensitive data handling
  const hasSensitiveData = Object.values(fieldResults).some(
    result => result.dataSensitivity === DataSensitivity.RESTRICTED
  );
  
  if (hasSensitiveData && !context.lgpdCompliant) {
    lgpdIssues.push('Dados sensíveis sem tratamento LGPD adequado');
  }

  // Emergency form validation
  if (context.emergencyForm) {
    const requiredFields = fieldConfigs.filter(config => config.emergencyField);
    const missingEmergencyFields = requiredFields.filter(config => {
      const value = formData[config.name] || '';
      return !value.trim();
    });
    
    if (missingEmergencyFields.length > 0) {
      globalErrors.push('Campos de emergência obrigatórios não preenchidos');
    }
  }

  // Accessibility validation
  const hasRequiredFields = fieldConfigs.some(config => config.required);
  if (hasRequiredFields && !formData['accessibility-mode']) {
    accessibilityIssues.push('Formulário não possui modo de acessibilidade indicado');
  }

  // Check overall validity
  const isValid = 
    Object.values(fieldResults).every(result => result.isValid) &&
    globalErrors.length === 0;

  return {
    isValid,
    fieldResults,
    globalErrors,
    consentRequired: Object.values(fieldResults).some(result => result.requiresConsent),
    lgpdCompliance: {
      valid: lgpdIssues.length === 0,
      issues: lgpdIssues,
    },
    accessibility: {
      valid: accessibilityIssues.length === 0,
      issues: accessibilityIssues,
    },
  };
}

/**
 * Generate LGPD consent object
 */
export function generateLGPDConsent(
  purposes: string[],
  retentionPeriod: string = '10 anos'
): LGPDConsent {
  return {
    id: `consent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    version: '1.0',
    purpose: purposes.join(', '),
    scope: ['patient-data', 'medical-treatment', 'billing'],
    retentionPeriod,
    givenAt: new Date(),
  };
}

/**
 * Classify healthcare data sensitivity
 */
export function classifyHealthcareData(fieldType: string): DataSensitivity {
  const sensitiveFields = [
    'cpf', 'medical-record', 'date-of-birth', 'patient-name'
  ];
  
  const restrictedFields = [
    'medical-history', 'diagnosis', 'treatment', 'medication'
  ];

  if (restrictedFields.includes(fieldType)) {
    return DataSensitivity.RESTRICTED;
  }
  
  if (sensitiveFields.includes(fieldType)) {
    return DataSensitivity.CONFIDENTIAL;
  }
  
  return DataSensitivity.INTERNAL;
}

/**
 * Get healthcare validation messages in Portuguese
 */
export const healthcareValidationMessages = {
  required: 'Campo obrigatório',
  invalid: 'Valor inválido',
  tooShort: 'Valor muito curto',
  tooLong: 'Valor muito longo',
  invalidFormat: 'Formato inválido',
  invalidEmail: 'Email inválido',
  invalidPhone: 'Telefone inválido',
  invalidCPF: 'CPF inválido',
  invalidDate: 'Data inválida',
  futureDate: 'Data não pode ser no futuro',
  pastDateLimit: 'Data muito antiga',
  consentRequired: 'Consentimento obrigatório',
  emergencyField: 'Campo de emergência requerido',
  sensitiveData: 'Dados sensíveis detectados',
};

/**
 * Apply Brazilian formatting masks
 */
export function applyBrazilianMask(value: string, mask: string): string {
  const cleanValue = value.replace(/\D/g, '');
  let masked = '';
  let valueIndex = 0;

  for (let i = 0; i < mask.length && valueIndex < cleanValue.length; i++) {
    if (mask[i] === '0') {
      masked += cleanValue[valueIndex];
      valueIndex++;
    } else {
      masked += mask[i];
    }
  }

  return masked;
}

// Common Brazilian masks
export const brazilianMasks = {
  cpf: '000.000.000-00',
  phone: '(00) 00000-0000',
  cep: '00000-000',
  crm: '000000',
  date: '00/00/0000',
};

// Healthcare form data validation for auth forms
export function validateHealthcareFormData(data: {
  professionalName: string;
  professionalEmail: string;
  dataSensitivity: DataSensitivity;
}): ValidationResult {
  const errors: string[] = [];

  // Validate professional name
  if (!data.professionalName || data.professionalName.trim() === '') {
    errors.push('Nome profissional é obrigatório');
  } else if (data.professionalName.trim().length < 3) {
    errors.push('Nome profissional deve ter no mínimo 3 caracteres');
  }

  // Validate professional email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.professionalEmail || !emailRegex.test(data.professionalEmail)) {
    errors.push('Email profissional inválido');
  }

  // Validate data sensitivity
  if (!Object.values(DataSensitivity).includes(data.dataSensitivity)) {
    errors.push('Nível de sensibilidade de dados inválido');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      professionalName: data.professionalName.trim(),
      professionalEmail: data.professionalEmail.toLowerCase(),
      dataSensitivity: data.dataSensitivity,
    },
  };
}

// Brazilian professional data validation
export function validateBrazilianProfessionalData(data: {
  professionalType: string;
  name: string;
  email: string;
  crm?: string;
}): ValidationResult {
  const errors: string[] = [];

  // Validate professional type
  if (!data.professionalType || data.professionalType.trim() === '') {
    errors.push('Tipo de profissional é obrigatório');
  }

  // Validate name
  if (!data.name || data.name.trim() === '') {
    errors.push('Nome é obrigatório');
  } else if (data.name.trim().length < 3) {
    errors.push('Nome deve ter no mínimo 3 caracteres');
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push('Email inválido');
  }

  // Validate CRM if provided
  if (data.crm) {
    const crmSchema = brazilianHealthcareSchemas.crm;
    const crmResult = crmSchema.safeParse(data.crm);
    if (!crmResult.success) {
      errors.push(crmResult.error.errors[0].message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      professionalType: data.professionalType,
      name: data.name.trim(),
      email: data.email.toLowerCase(),
      crm: data.crm?.trim() || null,
    },
  };
}

export default {
  validateHealthcareField,
  validateHealthcareForm,
  generateLGPDConsent,
  classifyHealthcareData,
  healthcareValidationMessages,
  applyBrazilianMask,
  brazilianMasks,
  brazilianHealthcareSchemas,
  DataSensitivity,
};