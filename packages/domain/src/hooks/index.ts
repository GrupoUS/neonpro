/**
 * @fileoverview NeonPro Healthcare Domain Package - Hooks Exports
 * Placeholder exports to resolve TypeScript compilation issues
 */

// Placeholder exports for missing hooks
export const useConsentManagement = () => ({
  consent: null,
  grantConsent: async () => {},
  withdrawConsent: async () => {},
});

export const useDataSubjectRights = () => ({
  requests: [],
  createRequest: async () => {},
  downloadData: async () => {},
});

// Appointments & scheduling hooks (commented out to avoid conflicts)
// export * from './appointments/use-appointments-manager';
// export * from './appointments/use-realtime-availability';

// Auth & Session hooks (commented out to avoid conflicts)
// export * from './auth/use-mfa';
// export * from './auth/use-permissions';
// export * from './auth/use-rbac';
// export * from './auth/use-session';
// export * from './auth/use-sso';

// Billing & financial hooks
// export * from './billing/use-billing';

// Compliance & regulatory hooks (commented out to avoid conflicts)
// export * from './compliance/use-lgpd-consent';
// export * from './compliance/use-regulatory-categories';
// export * from './compliance/use-regulatory-documents';
// export * from './compliance/useLGPD';
// export * from './compliance/useLGPDCompliance';

// Patient management hooks
// export * from './patient/use-patient-search';

// System hooks
// export * from './system/use-availability-manager';
// export * from './system/use-backup-system';
// export * from './system/use-communication-realtime';
// export * from './system/use-notifications';
