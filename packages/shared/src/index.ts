import { Patient, Appointment } from '@neonpro/types';

// Common error classes
export class NeonProError extends Error {
  constructor(message: string, public code: string = 'NEONPRO_ERROR') {
    super(message);
    this.name = 'NeonProError';
  }
}

export class HealthcareValidationError extends NeonProError {
  constructor(message: string) {
    super(message, 'HEALTHCARE_VALIDATION_ERROR');
  }
}

// Basic logger stub
export const logger = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string, error?: Error) => console.error(`[ERROR] ${message}`, error),
  warn: (message: string) => console.warn(`[WARN] ${message}`),
  debug: (message: string) => console.debug(`[DEBUG] ${message}`),
};

// Common constants
export const CONSTANTS = {
  APP_NAME: 'NeonPro',
  API_VERSION: 'v1',
  DEFAULT_LOCALE: 'pt-BR',
  MAX_APPOINTMENT_DURATION: 120, // minutes
  LGPD_CONSENT_REQUIRED: true,
} as const;

// Utility functions
export const isValidPatient = (patient: Partial<Patient>): patient is Patient => {
  return !!patient.id && !!patient.name && !!patient.email;
};

export const formatAppointmentDate = (appointment: Appointment): string => {
  return appointment.date.toLocaleDateString('pt-BR');
};

// Export everything - temporarily disabled for build stability
// export * from './errors'; // Placeholder - file not found
// export * from './logger'; // Placeholder - file not found 
// export * from './constants'; // Placeholder
