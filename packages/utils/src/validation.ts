import * as v from 'valibot';
import type { Appointment } from '@neonpro/types';

const patientDataSchema = v.object({
  name: v.string(),
  email: v.pipe(v.string(), v.email()),
  phone: v.string(),
  medicalHistory: v.optional(v.string()),
});

export const parsePatientData = (data: unknown) => {
  return v.parse(patientDataSchema, data);
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

// Export valibot for use in other modules if needed
export { v };
