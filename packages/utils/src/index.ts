import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { v, createParser } from 'valibot';
import { Patient, Appointment } from '@neonpro/types';

// Date formatting utils
export const formatAppointmentDate = (date: string | Date): string => {
  if (typeof date === 'string') {
    date = parseISO(date);
  }
  return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
};

export const formatPatientBirthDate = (date: string | Date): string => {
  if (typeof date === 'string') {
    date = parseISO(date);
  }
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
};

// Validation helpers
export const parsePatientData = createParser(
  v.object({
    name: v.string(),
    email: v.string([v.email()]),
    phone: v.string(),
    medicalHistory: v.optional(v.string()),
  })
);

export const validateAppointment = (appointment: Partial<Appointment>): boolean => {
  return !!appointment.date && !!appointment.patientId && !!appointment.professionalId;
};

export const isValidCpf = (cpf: string): boolean => {
  // Basic CPF validation stub for Brazilian healthcare
  if (!cpf || cpf.length !== 11) return false;
  // Add full validation logic later
  return /^\d{11}$/.test(cpf);
};

// General helpers
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncateText = (text: string, maxLength: number = 100): string => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

// Export everything
export * from './date'; // Placeholder
export * from './validation'; // Placeholder
