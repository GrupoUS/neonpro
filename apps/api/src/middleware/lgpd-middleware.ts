import {
  AESTHETIC_PURPOSES,
  type AestheticPurpose,
  CLIENT_DATA_CATEGORIES,
  type ClientDataCategory,
} from '@neonpro/types';
import { Context, Next } from 'hono';
import { lgpdCompliance } from '../lib/lgpd-compliance';

export interface DataProtectionOptions {
  purpose: AestheticPurpose;
  dataCategories: ClientDataCategory[];
  requireActiveConsent?: boolean;
}

/**
 * Simple data protection middleware for aesthetic clinic client data
 */
export function dataProtectionMiddleware(options: DataProtectionOptions) {
  return async (c: Context, next: Next) => {
    try {
      // Extract client ID from request
      const clientId = c.req.param('clientId')
        || c.req.query('clientId')
        || c.req.param('patientId') // backward compatibility
        || c.req.query('patientId');

      if (!clientId) {
        return c.json({ error: 'Client ID required for data access' }, 400);
      }

      // Simple consent validation for client data access
      const consentResult = await lgpdCompliance.validateConsent(
        clientId,
        options.purpose,
        options.dataCategories,
      );

      if (!consentResult.isValid) {
        return c.json({
          error: 'Data access consent required',
          missingConsents: consentResult.missingConsents,
        }, 403);
      }

      // Log data access for audit trail
      await lgpdCompliance.logDataAccess({
        action: 'data_access',
        clientId,
        purpose: options.purpose,
        dataCategories: options.dataCategories,
        userId: c.get('userId') || 'anonymous',
        timestamp: new Date(),
      });

      await next();

      // Successful completion
      return;
    } catch (error) {
      console.error('Data protection middleware error:', error);
      return c.json({ error: 'Data protection validation failed' }, 500);
    }
  };
}

// Pre-configured middleware for common operations
export const dataProtection = {
  // Basic client info access
  clientView: dataProtectionMiddleware({
    purpose: AESTHETIC_PURPOSES.CONSULTATION,
    dataCategories: [
      CLIENT_DATA_CATEGORIES.BASIC_INFO,
      CLIENT_DATA_CATEGORIES.CONTACT_INFO,
    ],
  }),

  // Treatment-related data access
  treatments: dataProtectionMiddleware({
    purpose: AESTHETIC_PURPOSES.TREATMENT,
    dataCategories: [
      CLIENT_DATA_CATEGORIES.BASIC_INFO,
      CLIENT_DATA_CATEGORIES.TREATMENT_INFO,
      CLIENT_DATA_CATEGORIES.PHOTOS,
    ],
  }),

  // Appointment scheduling
  appointments: dataProtectionMiddleware({
    purpose: AESTHETIC_PURPOSES.APPOINTMENT_SCHEDULING,
    dataCategories: [
      CLIENT_DATA_CATEGORIES.BASIC_INFO,
      CLIENT_DATA_CATEGORIES.CONTACT_INFO,
    ],
  }),

  // Billing operations
  billing: dataProtectionMiddleware({
    purpose: AESTHETIC_PURPOSES.BILLING_AND_PAYMENT,
    dataCategories: [
      CLIENT_DATA_CATEGORIES.BASIC_INFO,
      CLIENT_DATA_CATEGORIES.BILLING_INFO,
    ],
  }),

  // Marketing communications
  marketing: dataProtectionMiddleware({
    purpose: AESTHETIC_PURPOSES.MARKETING,
    dataCategories: [
      CLIENT_DATA_CATEGORIES.BASIC_INFO,
      CLIENT_DATA_CATEGORIES.CONTACT_INFO,
      CLIENT_DATA_CATEGORIES.PREFERENCES,
    ],
  }),
};
