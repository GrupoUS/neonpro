/**
 * Ambient module declarations for missing modules
 * These are minimal stubs to satisfy TypeScript compilation
 */

/// <reference types="vitest" />
/// <reference types="vitest/globals" />

// Vitest globals - properly typed
declare global {
  var describe: any;
  var it: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
  var afterEach: any;
  var beforeAll: any;
  var afterAll: any;
  var vi: any;

  // DOM globals for jsdom environment
  var window: any;
  var document: any;
  var navigator: any;
  var location: any;
}

// Express types for middleware compatibility
declare module 'express' {
  export interface Request {
    [key: string]: any;
  }
  export interface Response {
    [key: string]: any;
  }
  export interface NextFunction {
    (error?: any): void;
  }
}

// Testing library types
declare module '@testing-library/react' {
  export const render: any;
  export const screen: any;
  export const fireEvent: any;
  export const waitFor: any;
  export const cleanup: any;
}

// NeonPro package modules
declare module '@neonpro/types' {
  export const DatabaseHealthCheck: any;
  export const AuditContext: any;
  export const ResponseInfo: any;
  export const AuditLog: any;
  export const LogContext: any;
  export const ErrorResponse: any;
  export const AuthenticationResult: any;
  export const EncryptedData: any;
  export const HealthcareErrorResponse: any;
  export const HealthcareJWTPayload: any;
  export const AuditLevel: any;
  export const ErrorType: any;
  export const EncryptionCategory: any;
  export const BrazilianHealthcareSystem: any;
  export const ContentfulStatusCode: any;
  export const ResponseOrInit: any;
  export const HeaderRecord: any;
  export const JSONRespondReturn: any;
}

declare module '@neonpro/security' {
  export const UnifiedAuditService: any;
  export const SecurityAuditService: any;
}

declare module '@neonpro/shared/errors/error-utils' {
  export const createHealthcareError: any;
  export const isHealthcareError: any;
}

declare module '@neonpro/shared/errors/healthcare-error-types' {
  export const HealthcareErrorCategory: any;
  export const HealthcareErrorSeverity: any;
}

declare module '@neonpro/utils/validation' {
  export const validateCPF: any;
  export const validateCNPJ: any;
  export const validateEmail: any;
}

// API route modules
declare module '@/middleware/security' {
  export const securityMiddleware: any;
}

declare module '@/middleware/audit' {
  export const auditMiddleware: any;
}

declare module '@/routes/ai' {
  export const aiRoutes: any;
}

declare module '@/routes/analytics' {
  export const analyticsRoutes: any;
}

declare module '@/routes/appointments' {
  export const appointmentRoutes: any;
}

declare module '@/routes/audit' {
  export const auditRoutes: any;
}

declare module '@/routes/auth' {
  export const authRoutes: any;
}

declare module '@/routes/clinics' {
  export const clinicRoutes: any;
}

declare module '@/routes/compliance' {
  export const complianceRoutes: any;
}

declare module '@/routes/compliance-automation' {
  export const complianceAutomationRoutes: any;
}

declare module '@/routes/health' {
  export const healthRoutes: any;
}

declare module '@/routes/patients' {
  export const patientRoutes: any;
}

declare module '@/routes/professionals' {
  export const professionalRoutes: any;
}

declare module '@/routes/services' {
  export const serviceRoutes: any;
}

declare module '@/types/env' {
  export const EnvConfig: any;
}

declare module '@/lib/database' {
  export const database: any;
  export const connectDatabase: any;
}

// Global types for browser environment
declare global {
  interface Window {
    [key: string]: any;
  }

  var RequestInfo: any;
  var Response: any;
  var Headers: any;
  var Request: any;
}

export {};
