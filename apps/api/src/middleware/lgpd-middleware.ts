// TEMPORARY: Simple stub for LGPD middleware to bypass types import issues
import { Context, Next } from 'hono';

export interface DataProtectionOptions {
  purpose: string;
  dataCategories: string[];
  requireActiveConsent?: boolean;
}

/**
 * Simple data protection middleware for aesthetic clinic client data
 */
export function dataProtectionMiddleware(options: DataProtectionOptions) {
  return async (c: Context, next: Next) => {
    // TEMPORARY: Stub implementation for testing
    await next();
  };
}

// Pre-configured middleware for common operations
export const dataProtection = {
  // Basic client info access
  clientView: dataProtectionMiddleware({
    purpose: 'consultation',
    dataCategories: ['basic_info', 'contact_info'],
  }),

  // Treatment-related data access
  treatments: dataProtectionMiddleware({
    purpose: 'treatment',
    dataCategories: ['basic_info', 'treatment_info', 'photos'],
  }),

  // Appointment scheduling
  appointments: dataProtectionMiddleware({
    purpose: 'appointment_scheduling',
    dataCategories: ['basic_info', 'contact_info'],
  }),

  // Billing operations
  billing: dataProtectionMiddleware({
    purpose: 'billing_and_payment',
    dataCategories: ['basic_info', 'billing_info'],
  }),

  // Marketing communications
  marketing: dataProtectionMiddleware({
    purpose: 'marketing',
    dataCategories: ['basic_info', 'contact_info', 'preferences'],
  }),
};
