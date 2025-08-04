// Temporary LGPD types for build compatibility
export interface LGPDConsent {
  id: string;
  userId: string;
  consentType: string;
  granted: boolean;
  timestamp: string;
}

export interface DataProcessingRecord {
  id: string;
  userId: string;
  dataType: string;
  purpose: string;
  legalBasis: string;
}