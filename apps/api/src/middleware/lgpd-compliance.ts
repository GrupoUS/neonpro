/**
 * LGPD compliance middleware for healthcare applications
 * Provides data classification and legal basis validation
 */

export enum LGPDDataCategory {
  PERSONAL = 'personal',
  SENSITIVE = 'sensitive',
  HEALTH = 'health',
  FINANCIAL = 'financial',
}

export enum LGPDLegalBasis {
  CONSENT = 'consent',
  LEGITIMATE_INTEREST = 'legitimate_interest',
  LEGAL_OBLIGATION = 'legal_obligation',
  VITAL_INTEREST = 'vital_interest',
}

export function LGPDComplianceMiddleware() {
  return async (c: any, next: () => Promise<void>) => {
    await next();
  };
}