import type { Appointment } from '@neonpro/types';

// Simple validation utilities (temporarily avoiding valibot compatibility issues)
export const parsePatientData = (data: unknown) => {
  // Basic validation - return data as-is for now
  return data;
};

export const validateAppointment = (appointment: Partial<Appointment>): boolean => {
  return !!appointment.date && !!appointment.patientId && !!appointment.professionalId;
};

export const isValidCpf = (cpf: string): boolean => {
  // Basic CPF validation stub for Brazilian healthcare
  if (!cpf || cpf.length !== 11) return false;
  // Add full validation logic later
  return /^\d{11}$/.test(cpf);
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
