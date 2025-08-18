/**
 * Compliance Helper Utilities
 * Common utilities for healthcare compliance validation
 */

import { z } from 'zod';

// CPF validation for Brazilian healthcare compliance
export function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validate first digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(9))) return false;
  
  // Validate second digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  
  return digit === parseInt(cleanCPF.charAt(10));
}

// CNPJ validation for clinic registration
export function validateCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  if (cleanCNPJ.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  
  // Validation algorithm for CNPJ
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i];
  }
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit !== parseInt(cleanCNPJ.charAt(12))) return false;
  
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i];
  }
  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  return digit === parseInt(cleanCNPJ.charAt(13));
}

// Professional registration validation (CRM, COREN, etc.)
export function validateProfessionalRegistration(
  registration: string,
  type: 'CRM' | 'COREN' | 'CRO' | 'CRF'
): boolean {
  const clean = registration.replace(/\D/g, '');
  
  switch (type) {
    case 'CRM':
      return clean.length >= 4 && clean.length <= 6;
    case 'COREN':
      return clean.length >= 6 && clean.length <= 7;
    case 'CRO':
      return clean.length >= 4 && clean.length <= 6;
    case 'CRF':
      return clean.length >= 4 && clean.length <= 6;
    default:
      return false;
  }
}

// LGPD data classification helper
export function classifyDataSensitivity(fieldName: string): 'public' | 'internal' | 'confidential' | 'restricted' {
  const sensitiveFields = [
    'cpf', 'rg', 'passport', 'medical_record', 'diagnosis', 'treatment',
    'medication', 'allergy', 'health_condition', 'laboratory_result'
  ];
  
  const confidentialFields = [
    'email', 'phone', 'address', 'birth_date', 'emergency_contact',
    'insurance_number', 'payment_method'
  ];
  
  const fieldLower = fieldName.toLowerCase();
  
  if (sensitiveFields.some(field => fieldLower.includes(field))) {
    return 'restricted';
  }
  
  if (confidentialFields.some(field => fieldLower.includes(field))) {
    return 'confidential';
  }
  
  if (fieldLower.includes('name') || fieldLower.includes('id')) {
    return 'internal';
  }
  
  return 'public';
}

// Healthcare compliance schema validators
export const HealthcareProfessionalSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: z.string().refine(validateCPF, 'CPF inválido'),
  registration_number: z.string().min(4, 'Número de registro inválido'),
  registration_type: z.enum(['CRM', 'COREN', 'CRO', 'CRF']),
  registration_state: z.string().length(2, 'Estado deve ter 2 caracteres'),
  specialty: z.string().optional(),
});

export const ClinicSchema = z.object({
  name: z.string().min(2, 'Nome da clínica deve ter pelo menos 2 caracteres'),
  cnpj: z.string().refine(validateCNPJ, 'CNPJ inválido'),
  anvisa_license: z.string().optional(),
  operating_license: z.string().min(1, 'Licença de funcionamento obrigatória'),
  address: z.object({
    street: z.string().min(1, 'Logradouro obrigatório'),
    number: z.string().min(1, 'Número obrigatório'),
    city: z.string().min(1, 'Cidade obrigatória'),
    state: z.string().length(2, 'Estado deve ter 2 caracteres'),
    postal_code: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  }),
});

export const PatientConsentSchema = z.object({
  patient_id: z.string().uuid('ID do paciente inválido'),
  consent_type: z.enum(['data_processing', 'image_use', 'treatment', 'research']),
  granted: z.boolean(),
  granted_at: z.date(),
  expires_at: z.date().optional(),
  witness_id: z.string().uuid().optional(),
  digital_signature: z.string().optional(),
});