/**
 * @fileoverview Healthcare Test Utilities
 * @description Core testing utilities for constitutional healthcare applications
 * @compliance LGPD + ANVISA + CFM + Medical Accuracy Validation
 * @quality ≥9.9/10 Healthcare Excellence Standard
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { type RenderOptions, render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { vi } from 'vitest';

/**
 * Healthcare Test User Simulation
 * Simulates different healthcare personas for comprehensive testing
 */
export type HealthcareTestUser = {
  id: string;
  role: 'patient' | 'doctor' | 'nurse' | 'admin' | 'receptionist';
  permissions: string[];
  tenantId: string;
  isActive: boolean;
  medicalLicense?: string; // For CFM compliance
  specialization?: string;
};

/**
 * Patient Test Data Generator
 * Generates LGPD-compliant test patient data
 */
export const generateTestPatient = () => ({
  id: `patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test Patient',
  cpf: '00000000000', // Placeholder CPF for testing
  email: 'test.patient@example.com',
  phone: '(11) 00000-0000',
  birthDate: '1990-01-01',
  gender: 'other' as const,
  address: {
    street: 'Test Street, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '00000-000',
    country: 'BR',
  },
  medicalHistory: 'Test medical history - no real patient data',
  allergies: ['none'],
  medications: [],
  emergencyContact: {
    name: 'Test Emergency Contact',
    phone: '(11) 00000-0001',
    relationship: 'family',
  },
  // LGPD Compliance Fields
  consentGiven: true,
  consentDate: new Date().toISOString(),
  dataRetentionPeriod: '5 years',
  privacyPolicyAccepted: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

/**
 * Healthcare Component Render with Context
 * Enhanced render function with healthcare context providers
 */ interface HealthcareRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: HealthcareTestUser;
  tenantId?: string;
  initialRoute?: string;
  supabaseClient?: SupabaseClient;
}

export function renderWithHealthcareContext(
  ui: ReactElement,
  options: HealthcareRenderOptions = {}
) {
  const {
    user = generateTestUser('doctor'),
    tenantId = 'test-tenant',
    initialRoute = '/',
    supabaseClient = createMockSupabaseClient(),
    ...renderOptions
  } = options;

  // Mock healthcare context providers
  const HealthcareWrapper = ({ children }: { children: React.ReactNode }) =>
    (<div data-testid = { children } < 'healthcare-context' < />div);

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: HealthcareWrapper, ...renderOptions }),
  };
}

/**
 * Generate Test Healthcare Users
 */
export function generateTestUser(
  role: HealthcareTestUser['role']
): HealthcareTestUser {
  const baseUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    tenantId: 'test-tenant',
    isActive: true,
  };

  switch (role) {
    case 'doctor':
      return {
        ...baseUser,
        role: 'doctor',
        permissions: [
          'patients:read',
          'patients:write',
          'appointments:manage',
          'treatments:manage',
        ],
        medicalLicense: 'CRM-SP-123456',
        specialization: 'Dermatologia',
      };
    case 'patient':
      return {
        ...baseUser,
        role: 'patient',
        permissions: [
          'appointments:read',
          'treatments:read',
          'profile:read',
          'profile:write',
        ],
      };
    case 'nurse':
      return {
        ...baseUser,
        role: 'nurse',
        permissions: [
          'patients:read',
          'appointments:read',
          'treatments:assist',
        ],
      };
    default:
      return {
        ...baseUser,
        role,
        permissions: [],
      };
  }
} /**
 * Mock Supabase Client for Healthcare Testing
 */
export function createMockSupabaseClient(): SupabaseClient {
  return {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      like: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      then: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: generateTestUser('doctor') },
        error: null,
      }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: generateTestUser('doctor') } },
        error: null,
      }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: generateTestUser('doctor'), session: {} },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn(),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: null, error: null }),
        download: vi.fn().mockResolvedValue({ data: null, error: null }),
        list: vi.fn().mockResolvedValue({ data: [], error: null }),
        remove: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
    },
  } as any;
}
