/**
 * Brazilian Healthcare Validation Utilities
 * Validates healthcare-specific data according to Brazilian regulations
 */

import { z } from 'zod';

// CPF validation
export const validateCPF = (cpf: string): boolean => {
  if (!cpf) return false;
  
  // Remove non-digits
  cpf = cpf.replace(/[^\d]/g, '');
  
  // Check length
  if (cpf.length !== 11) return false;
  
  // Check if all digits are the same
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validate first digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf[i]) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  const digit1 = remainder > 9 ? 0 : remainder;
  
  if (parseInt(cpf[9]) !== digit1) return false;
  
  // Validate second digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf[i]) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  const digit2 = remainder > 9 ? 0 : remainder;
  
  return parseInt(cpf[10]) === digit2;
};

// Phone number validation (Brazilian format)
export const validatePhone = (phone: string): boolean => {
  if (!phone) return false;
  
  // Remove non-digits
  const cleaned = phone.replace(/[^\d]/g, '');
  
  // Check length (10 or 11 digits with area code)
  return cleaned.length === 10 || cleaned.length === 11;
};

// Medical license validation (CRM, CRO, etc.)
export const validateMedicalLicense = (license: string): boolean => {
  if (!license) return false;
  
  // Basic format validation
  // CRM format: CRM/UF 123456
  const crmPattern = /^CRM\/[A-Z]{2}\s*\d{4,6}$/i;
  return crmPattern.test(license);
};

// CNPJ validation
export const validateCNPJ = (cnpj: string): boolean => {
  if (!cnpj) return false;
  
  // Remove non-digits
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  // Check length
  if (cnpj.length !== 14) return false;
  
  // Check if all digits are the same
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  
  // Validate first digit
  let sum = 0;
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj[i]) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(cnpj[12]) !== digit1) return false;
  
  // Validate second digit
  sum = 0;
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj[i]) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  return parseInt(cnpj[13]) === digit2;
};

// Zod schemas for Brazilian healthcare validation
export const BrazilianHealthcareSchemas = {
  // Patient schema with Brazilian validations
  Patient: z.object({
    id: z.string().uuid(),
    full_name: z.string()
      .min(3, 'Nome deve ter pelo menos 3 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres'),
    cpf: z.string()
      .transform(val => val.replace(/[^\d]/g, ''))
      .refine(val => val.length === 11, 'CPF deve ter 11 dígitos')
      .refine(validateCPF, 'CPF inválido'),
    birth_date: z.string()
      .refine(val => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && date < new Date();
      }, 'Data de nascimento inválida'),
    phone: z.string()
      .transform(val => val.replace(/[^\d]/g, ''))
      .refine(val => val.length === 10 || val.length === 11, 'Telefone inválido'),
    email: z.string().email('E-mail inválido').optional().nullable(),
    clinic_id: z.string().uuid(),
    lgpd_consent_given: z.boolean(),
    data_retention_until: z.string().datetime().optional()
  }),

  // Professional schema with CFM validation
  Professional: z.object({
    id: z.string().uuid(),
    full_name: z.string()
      .min(3, 'Nome deve ter pelo menos 3 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres'),
    license_number: z.string()
      .min(6, 'Número da licença muito curto')
      .max(15, 'Número da licença muito longo')
      .refine(validateMedicalLicense, 'Número de registro médico inválido'),
    professional_type: z.enum(['doctor', 'dentist', 'nurse', 'aesthetician']),
    clinic_id: z.string().uuid(),
    is_active: z.boolean()
  }),

  // Clinic schema with ANVISA validation
  Clinic: z.object({
    id: z.string().uuid(),
    name: z.string()
      .min(3, 'Nome da clínica deve ter pelo menos 3 caracteres')
      .max(100, 'Nome da clínica deve ter no máximo 100 caracteres'),
    tax_id: z.string()
      .transform(val => val.replace(/[^\d]/g, ''))
      .refine(val => val.length === 14, 'CNPJ deve ter 14 dígitos')
      .refine(validateCNPJ, 'CNPJ inválido'),
    anvisa_license: z.string()
      .min(10, 'Licença da ANVISA muito curta')
      .max(20, 'Licença da ANVISA muito longa'),
    cfm_registration: z.string().min(5, 'Registro CFM muito curto'),
    lgpd_responsible_email: z.string().email('E-mail do responsável LGPD inválido'),
    is_active: z.boolean()
  }),

  // Appointment validation
  Appointment: z.object({
    id: z.string().uuid(),
    clinic_id: z.string().uuid(),
    patient_id: z.string().uuid(),
    professional_id: z.string().uuid(),
    service_id: z.string().uuid(),
    status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']),
    scheduled_at: z.string()
      .refine(val => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && date > new Date();
      }, 'Data do agendamento deve ser futura'),
    duration_hours: z.number()
      .min(0.25, 'Duração mínima de 15 minutos')
      .max(8, 'Duração máxima de 8 horas'),
    notes: z.string().max(1000, 'Observações devem ter no máximo 1000 caracteres').optional()
  }),

  // Financial transaction validation
  FinancialTransaction: z.object({
    id: z.string().uuid(),
    clinic_id: z.string().uuid(),
    patient_id: z.string().uuid(),
    appointment_id: z.string().uuid().optional(),
    service_id: z.string().uuid(),
    professional_id: z.string().uuid(),
    amount: z.number()
      .min(0, 'Valor não pode ser negativo')
      .max(100000, 'Valor máximo permitido: R$ 100.000'),
    currency: z.literal('BRL'),
    status: z.enum(['pending', 'paid', 'overdue', 'cancelled', 'refunded']),
    payment_method: z.enum(['cash', 'credit_card', 'debit_card', 'health_plan', 'bank_transfer', 'other']),
    payment_date: z.string().datetime().optional(),
    due_date: z.string().datetime().optional(),
    description: z.string().max(200, 'Descrição deve ter no máximo 200 caracteres').optional()
  })
};

// Type helpers
export type ValidatedPatient = z.infer<typeof BrazilianHealthcareSchemas.Patient>;
export type ValidatedProfessional = z.infer<typeof BrazilianHealthcareSchemas.Professional>;
export type ValidatedClinic = z.infer<typeof BrazilianHealthcareSchemas.Clinic>;
export type ValidatedAppointment = z.infer<typeof BrazilianHealthcareSchemas.Appointment>;
export type ValidatedFinancialTransaction = z.infer<typeof BrazilianHealthcareSchemas.FinancialTransaction>;

// Validation functions with Brazilian error messages
export const validateBrazilianHealthcareData = {
  patient: (data: unknown) => {
    const result = BrazilianHealthcareSchemas.Patient.safeParse(data);
    if (!result.success) {
      const errors = result.error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      throw new Error(`Validação de paciente falhou: ${errors.join(', ')}`);
    }
    return result.data;
  },

  professional: (data: unknown) => {
    const result = BrazilianHealthcareSchemas.Professional.safeParse(data);
    if (!result.success) {
      const errors = result.error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      throw new Error(`Validação de profissional falhou: ${errors.join(', ')}`);
    }
    return result.data;
  },

  clinic: (data: unknown) => {
    const result = BrazilianHealthcareSchemas.Clinic.safeParse(data);
    if (!result.success) {
      const errors = result.error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      throw new Error(`Validação de clínica falhou: ${errors.join(', ')}`);
    }
    return result.data;
  },

  appointment: (data: unknown) => {
    const result = BrazilianHealthcareSchemas.Appointment.safeParse(data);
    if (!result.success) {
      const errors = result.error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      throw new Error(`Validação de agendamento falhou: ${errors.join(', ')}`);
    }
    return result.data;
  },

  financialTransaction: (data: unknown) => {
    const result = BrazilianHealthcareSchemas.FinancialTransaction.safeParse(data);
    if (!result.success) {
      const errors = result.error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      throw new Error(`Validação de transação financeira falhou: ${errors.join(', ')}`);
    }
    return result.data;
  }
};

// Appointment conflict detection
export const checkAppointmentConflict = (
  appointments: Array<{
    professional_id: string;
    scheduled_at: string;
    duration_hours: number;
  }>,
  newAppointment: {
    professional_id: string;
    scheduled_at: string;
    duration_hours: number;
  }
): boolean => {
  const newStart = new Date(newAppointment.scheduled_at);
  const newEnd = new Date(newStart.getTime() + newAppointment.duration_hours * 60 * 60 * 1000);

  return appointments.some(apt => {
    if (apt.professional_id !== newAppointment.professional_id) return false;
    
    const aptStart = new Date(apt.scheduled_at);
    const aptEnd = new Date(aptStart.getTime() + apt.duration_hours * 60 * 60 * 1000);
    
    return (newStart < aptEnd && newEnd > aptStart);
  });
};