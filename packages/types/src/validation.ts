import { Appointment, Patient } from './index.js';

// TypeScript-only validation helpers (no runtime validation library)
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

export const validatePatient = (patient: Partial<Patient>): patient is Patient => {
  return !!(
    patient.id &&
    patient.name &&
    patient.email &&
    isValidEmail(patient.email) &&
    patient.phone &&
    isValidPhone(patient.phone) &&
    typeof patient.consentGiven === 'boolean' &&
    patient.createdAt
  );
};

export const validateAppointment = (appointment: Partial<Appointment>): appointment is Appointment => {
  const validTypes = ['consultation', 'treatment', 'follow-up'];
  const validStatuses = ['scheduled', 'completed', 'cancelled'];

  return !!(
    appointment.id &&
    appointment.patientId &&
    appointment.professionalId &&
    appointment.date &&
    appointment.type &&
    validTypes.includes(appointment.type) &&
    appointment.status &&
    validStatuses.includes(appointment.status)
  );
};
