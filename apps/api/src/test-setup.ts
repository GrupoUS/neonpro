/**
 * Test Setup and Utilities
 * Shared test utilities and mock middleware for consistent testing
 */

import { Context, Next } from 'hono';

// Mock middleware for testing
export const mockAuthMiddleware = (c: Context, next: Next) => {
  const authHeader = c.req.header('authorization');
  if (!authHeader) {
    return c.json(
      {
        success: false,
        error: 'Não autorizado. Token de acesso necessário.',
      },
      401,
    );
  }
  c.set('user', { id: 'user-123', _role: 'healthcare_professional' });
  c.set('userId', 'user-123');
  return next();
};

// Mock LGPD middleware for testing
export const mockLGPDMiddleware = (c: Context, next: Next) => {
  c.set('lgpdConsent', { isActive: true });
  c.set('hasLGPDConsent', true);
  return next();
};

// Mock healthcare professional middleware for testing
export const mockHealthcareMiddleware = (c: Context, next: Next) => {
  c.set('healthcareProfessional', {
    id: 'hp-123',
    crmNumber: '12345-SP',
    specialty: 'Cardiology',
    licenseStatus: 'active',
  });
  c.set('isHealthcareProfessional', true);
  return next();
};

// Mock AI access middleware for testing
export const mockAIAccessMiddleware = (c: Context, next: Next) => {
  c.set('hasAIAccess', true);
  return next();
};

// Test user object
export const testUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  _role: 'healthcare_professional',
  name: 'Test User',
};

// Test healthcare professional object
export const testHealthcareProfessional = {
  id: 'test-hp-123',
  crmNumber: '12345-SP',
  specialty: 'Cardiology',
  licenseStatus: 'active',
  permissions: {
    canAccessAI: true,
    canViewPatientData: true,
    canModifyPatientData: true,
    canAccessReports: true,
  },
};

// Test LGPD consent object
export const testLGPDConsent = {
  _userId: 'test-user-123',
  consentDate: new Date(),
  consentVersion: '1.0',
  purposes: ['healthcare_service', 'ai_assistance'],
  dataCategories: ['personal_data', 'health_data'],
  retentionPeriod: 365,
  canWithdraw: true,
  isActive: true,
};
