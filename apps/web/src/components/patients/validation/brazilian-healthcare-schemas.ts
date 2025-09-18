/**
 * Brazilian Healthcare Validation Schemas
 * LGPD-compliant validation for healthcare data in Brazil
 * Using Valibot for type-safe validation with Brazilian standards
 */

import * as v from 'valibot';

// =============================================
// BRAZILIAN DOCUMENT VALIDATION FUNCTIONS
// =============================================

/**
 * Validates Brazilian CPF (Cadastro de Pessoas Físicas)
 * Implements the official CPF validation algorithm
 */
export const validateCpf = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, '');

  // Check basic format
  if (numbers.length !== 11) return false;

  // Check for repeated digits (invalid CPFs like 111.111.111-11)
  if (/^(\d)\1{10}$/.test(numbers)) return false;

  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let firstDigit = 11 - (sum % 11);
  if (firstDigit >= 10) firstDigit = 0;

  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  let secondDigit = 11 - (sum % 11);
  if (secondDigit >= 10) secondDigit = 0;

  return parseInt(numbers[9]) === firstDigit && parseInt(numbers[10]) === secondDigit;
};

/**
 * Validates Brazilian CNS (Cartão Nacional de Saúde)
 * National Health Card validation according to official algorithm
 */
export const validateCns = (cns: string): boolean => {
  const numbers = cns.replace(/\D/g, '');

  if (numbers.length !== 15) return false;

  const firstDigit = parseInt(numbers[0]);

  // Temporary CNS (starts with 7, 8, or 9)
  if (firstDigit === 7 || firstDigit === 8 || firstDigit === 9) {
    return true; // Simplified validation for temporary cards
  }

  // Definitive CNS (starts with 1 or 2)
  if (firstDigit === 1 || firstDigit === 2) {
    let sum = 0;
    for (let i = 0; i < 11; i++) {
      sum += parseInt(numbers[i]) * (15 - i);
    }

    const remainder = sum % 11;
    const expectedDigit = remainder < 2 ? 0 : 11 - remainder;

    return parseInt(numbers[11]) === expectedDigit;
  }

  return false;
};

/**
 * Validates Brazilian phone numbers (mobile and landline)
 * Supports both 10 and 11 digit formats
 */
export const validateBrazilianPhone = (phone: string): boolean => {
  const numbers = phone.replace(/\D/g, '');

  // Must have 10 or 11 digits
  if (numbers.length !== 10 && numbers.length !== 11) return false;

  // Area code validation (11-99)
  const areaCode = parseInt(numbers.substring(0, 2));
  if (areaCode < 11 || areaCode > 99) return false;

  // Mobile numbers (11 digits) should start with 9
  if (numbers.length === 11) {
    const firstDigit = parseInt(numbers[2]);
    return firstDigit === 9;
  }

  // Landline numbers (10 digits) should not start with 0 or 1
  if (numbers.length === 10) {
    const firstDigit = parseInt(numbers[2]);
    return firstDigit >= 2;
  }

  return true;
};

// =============================================
// VALIBOT SCHEMAS FOR BRAZILIAN HEALTHCARE
// =============================================

// CPF Schema with custom validation
export const CpfSchema = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty('CPF é obrigatório'),
  v.regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve estar no formato 000.000.000-00'),
  v.check(validateCpf, 'CPF inválido'),
);

// CNS Schema with custom validation
export const CnsSchema = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty('CNS é obrigatório'),
  v.regex(/^\d{3} \d{4} \d{4} \d{4}$/, 'CNS deve estar no formato 000 0000 0000 0000'),
  v.check(validateCns, 'CNS inválido'),
);

// Brazilian phone schema
export const BrazilianPhoneSchema = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty('Telefone é obrigatório'),
  v.regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone deve estar no formato (00) 00000-0000'),
  v.check(validateBrazilianPhone, 'Número de telefone inválido'),
);

// Brazilian postal code (CEP)
export const CepSchema = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty('CEP é obrigatório'),
  v.regex(/^\d{5}-\d{3}$/, 'CEP deve estar no formato 00000-000'),
);

// Brazilian states enum
export const BrazilianStateSchema = v.picklist([
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
], 'Estado inválido');

// =============================================
// PATIENT DATA SCHEMAS
// =============================================

// Basic patient information schema
export const BasicPatientSchema = v.object({
  name: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty('Nome é obrigatório'),
    v.minLength(2, 'Nome deve ter pelo menos 2 caracteres'),
    v.maxLength(100, 'Nome não pode ter mais de 100 caracteres'),
    v.regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  ),

  cpf: CpfSchema,

  birthDate: v.pipe(
    v.string(),
    v.nonEmpty('Data de nascimento é obrigatória'),
    v.isoDate('Data deve estar no formato YYYY-MM-DD'),
    v.check(date => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 0 && age <= 120;
    }, 'Data de nascimento inválida'),
  ),

  gender: v.picklist(['masculino', 'feminino', 'outro'], 'Gênero inválido'),

  phone: BrazilianPhoneSchema,

  email: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty('E-mail é obrigatório'),
    v.email('E-mail inválido'),
    v.maxLength(100, 'E-mail não pode ter mais de 100 caracteres'),
  ),
});

// Address schema for Brazilian addresses
export const BrazilianAddressSchema = v.object({
  street: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty('Endereço é obrigatório'),
    v.maxLength(200, 'Endereço não pode ter mais de 200 caracteres'),
  ),

  number: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty('Número é obrigatório'),
    v.maxLength(10, 'Número não pode ter mais de 10 caracteres'),
  ),

  complement: v.optional(v.pipe(
    v.string(),
    v.trim(),
    v.maxLength(50, 'Complemento não pode ter mais de 50 caracteres'),
  )),

  neighborhood: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty('Bairro é obrigatório'),
    v.maxLength(100, 'Bairro não pode ter mais de 100 caracteres'),
  ),

  city: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty('Cidade é obrigatória'),
    v.maxLength(100, 'Cidade não pode ter mais de 100 caracteres'),
  ),

  state: BrazilianStateSchema,

  zipCode: CepSchema,
});

// LGPD consent schema
export const PatientConsentSchema = v.object({
  dataProcessing: v.boolean(),
  marketing: v.boolean(),
  thirdPartySharing: v.boolean(),
  research: v.boolean(),
  telehealth: v.boolean(),
  consentDate: v.date(),
  ipAddress: v.string(),
  userAgent: v.string(),
});

// Complete patient registration schema
export const CompletePatientRegistrationSchema = v.object({
  basicInfo: BasicPatientSchema,
  address: BrazilianAddressSchema,
  consent: PatientConsentSchema,

  // Optional health system information
  cns: v.optional(CnsSchema),
  rg: v.optional(v.pipe(
    v.string(),
    v.trim(),
    v.maxLength(20, 'RG não pode ter mais de 20 caracteres'),
  )),

  // Terms acceptance
  termsAccepted: v.pipe(
    v.boolean(),
    v.literal(true, 'Aceitar os termos é obrigatório'),
  ),

  privacyPolicyAccepted: v.pipe(
    v.boolean(),
    v.literal(true, 'Aceitar a política de privacidade é obrigatório'),
  ),
});

// =============================================
// EXPORT TYPES
// =============================================

// Infer types from schemas for TypeScript
export type BasicPatient = v.InferInput<typeof BasicPatientSchema>;
export type BrazilianAddress = v.InferInput<typeof BrazilianAddressSchema>;
export type PatientConsent = v.InferInput<typeof PatientConsentSchema>;
export type CompletePatientRegistration = v.InferInput<typeof CompletePatientRegistrationSchema>;

// Validation helper functions
export const validatePatientData = {
  basic: (data: unknown) => v.safeParse(BasicPatientSchema, data),
  address: (data: unknown) => v.safeParse(BrazilianAddressSchema, data),
  consent: (data: unknown) => v.safeParse(PatientConsentSchema, data),
  complete: (data: unknown) => v.safeParse(CompletePatientRegistrationSchema, data),
};

export default {
  schemas: {
    BasicPatientSchema,
    BrazilianAddressSchema,
    PatientConsentSchema,
    CompletePatientRegistrationSchema,
  },
  validators: {
    validateCpf,
    validateCns,
    validateBrazilianPhone,
  },
  validate: validatePatientData,
};
