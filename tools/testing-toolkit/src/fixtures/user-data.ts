/**
 * User Test Data
 *
 * Provides user-related test data for authentication and authorization testing.
 */

import { TEST_IDS } from './index';

export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'professional' | 'patient' | 'staff';
  clinicId?: string;
  active: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface MockSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * Create mock user data
 */
export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    id: TEST_IDS.USER,
    email: 'test@example.com',
    name: 'Test User',
    role: 'professional',
    clinicId: TEST_IDS.CLINIC,
    active: true,
    createdAt: new Date(),
    lastLoginAt: new Date(),
    ...overrides,
  };
}

/**
 * Create mock session data
 */
export function createMockSession(overrides: Partial<MockSession> = {}): MockSession {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

  return {
    id: 'session-123',
    userId: TEST_IDS.USER,
    token: 'mock-jwt-token',
    expiresAt,
    createdAt: now,
    ...overrides,
  };
}

/**
 * Create test users for different roles
 */
export function createTestUsers() {
  return {
    admin: createMockUser({
      id: 'admin-123',
      email: 'admin@neonpro.com',
      name: 'Admin User',
      role: 'admin',
    }),
    professional: createMockUser({
      id: TEST_IDS.PROFESSIONAL,
      email: 'doctor@clinic.com',
      name: 'Dr. Professional',
      role: 'professional',
      clinicId: TEST_IDS.CLINIC,
    }),
    patient: createMockUser({
      id: TEST_IDS.PATIENT,
      email: 'patient@email.com',
      name: 'Patient User',
      role: 'patient',
    }),
    staff: createMockUser({
      id: 'staff-123',
      email: 'staff@clinic.com',
      name: 'Staff Member',
      role: 'staff',
      clinicId: TEST_IDS.CLINIC,
    }),
  };
}
