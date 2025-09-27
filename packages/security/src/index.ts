import { logger } from '@neonpro/shared';
import { Patient, Professional } from '@neonpro/types';
import { createHash } from 'crypto';

// Auth guards
export const isAuthenticated = (user: Patient | Professional | null): user is Patient | Professional => {
  return !!user && !!user.id;
};

export const requireProfessional = (user: Patient | Professional | null): asserts user is Professional => {
  if (!user || 'specialty' in user === false) {
    throw new Error('Professional access required');
  }
};

// Encryption stubs (use Node.js crypto for hashing)
export const hashPassword = (password: string): string => {
  return createHash('sha256').update(password).digest('hex');
};

export const encryptData = (data: string): string => {
  // Stub: In production, use proper encryption like AES
  return btoa(data); // Base64 as placeholder
};

export const decryptData = (encrypted: string): string => {
  // Stub
  return atob(encrypted);
};

// LGPD compliance helpers
export const logConsent = (patientId: string, consentType: string) => {
  logger.info(`LGPD Consent logged for patient ${patientId}: ${consentType}`);
};

export const checkLgpdCompliance = (patient: Patient): boolean => {
  return patient.consentGiven;
};

// Export everything
export * from './auth'; // Placeholder
export * from './encryption'; // Placeholder
export * from './compliance'; // Placeholder
