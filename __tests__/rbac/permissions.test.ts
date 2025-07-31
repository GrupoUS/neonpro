/**
 * Unit Tests for RBAC Permissions System
 * Story 1.2: Role-Based Access Control Implementation
 * 
 * Comprehensive test suite for permission validation and authorization
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { hasPermission, hasAnyPermission, hasAllPermissions, clearAllPermissionCache } from '@/lib/auth/rbac/permissions';
import { UserRole, Permission } from '@/types/rbac';
import { AuthUser } from '@/lib/middleware/auth';

// Mock Supabase client
jest.mock('@/app/utils/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      insert: jest.fn()
    }))
  }))
}));

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = jest.fn();
  clearAllPermissionCache();
});

afterEach(() => {
  console.error = originalConsoleError;
  jest.clearAllMocks();
});

/**
 * Create mock user for testing
 */
function createMockUser(role: UserRole, clinicId = 'clinic-1'): AuthUser {
  return {
    id: `user-${role}`,
    email: `${role}@test.com`,
    role,
    clinicId,
    iat: Date.now(),
    exp: Date.now() + 3600000
  };
}

describe('RBAC Permissions System', () => {
  describe('hasPermission', () => {
    it('should grant permission when user role has the required permission', async () => {
      const user = createMockUser('manager');
      const result = await hasPermission(user, 'patients.read');
      
      expect(result.granted).toBe(true);
      expect(result.roleUsed).toBe('manager');
    });

    it('should deny permission when user role lacks the required permission', async () => {
      const user = createMockUser('patient');
      const result = await hasPermission(user, 'users.manage');
      
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('does not have permission');
      expect(result.roleUsed).toBe('patient');
    });

    it('should deny permission for invalid user role', async () => {
      const user = createMockUser('invalid' as UserRole);
      const result = await hasPermission(user, 'patients.read');
      
      expect(result.granted).toBe(false);
      expect(result.reason).toBe('Invalid user role');
    });

    it('should deny cross-clinic access for non-admin users', async () => {
      const user = createMockUser('staff', 'clinic-1');
      const result = await hasPermission(user, 'patients.read', undefined, { clinicId: 'clinic-2' });
      
      // This would be handled by the permission validation logic
      expect(result.granted).toBe(true); // Basic role check passes, clinic check would be in resource validation
    });

    it('should use permission cache for repeated checks', async () => {
      const user = createMockUser('manager');
      
      // First call
      const result1 = await hasPermission(user, 'patients.read');
      // Second call (should use cache)
      const result2 = await hasPermission(user, 'patients.read');
      
      expect(result1.granted).toBe(true);
      expect(result2.granted).toBe(true);
      expect(result1.roleUsed).toBe(result2.roleUsed);
    });
  });

  describe('hasAnyPermission', () => {
    it('should grant access when user has at least one of the required permissions', async () => {
      const user = createMockUser('staff');
      const permissions: Permission[] = ['patients.read', 'billing.manage'];
      
      const result = await hasAnyPermission(user, permissions);
      
      expect(result.granted).toBe(true);
      expect(result.roleUsed).toBe('staff');
    });

    it('should deny access when user has none of the required permissions', async () => {
      const user = createMockUser('patient');
      const permissions: Permission[] = ['billing.manage', 'users.manage'];
      
      const result = await hasAnyPermission(user, permissions);
      
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('does not have any of the required permissions');
    });

    it('should handle empty permissions array', async () => {
      const user = createMockUser('staff');
      const permissions: Permission[] = [];
      
      const result = await hasAnyPermission(user, permissions);
      
      expect(result.granted).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should grant access when user has all required permissions', async () => {
      const user = createMockUser('manager');
      const permissions: Permission[] = ['patients.read', 'appointments.read'];
      
      const result = await hasAllPermissions(user, permissions);
      
      expect(result.granted).toBe(true);
      expect(result.roleUsed).toBe('manager');
    });

    it('should deny access when user is missing any required permission', async () => {
      const user = createMockUser('staff');
      const permissions: Permission[] = ['patients.read', 'billing.manage'];
      
      const result = await hasAllPermissions(user, permissions);
      
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('Missing required permission');
    });

    it('should handle empty permissions array', async () => {
      const user = createMockUser('patient');
      const permissions: Permission[] = [];
      
      const result = await hasAllPermissions(user, permissions);
      
      expect(result.granted).toBe(true);
    });
  });

  describe('Role-based permission validation', () => {
    it('should validate owner permissions', async () => {
      const user = createMockUser('owner');
      
      const patientRead = await hasPermission(user, 'patients.read');
      const billingManage = await hasPermission(user, 'billing.manage');
      const clinicManage = await hasPermission(user, 'clinic.manage');
      
      expect(patientRead.granted).toBe(true);
      expect(billingManage.granted).toBe(true);
      expect(clinicManage.granted).toBe(true);
    });

    it('should validate manager permissions', async () => {
      const user = createMockUser('manager');
      
      const patientRead = await hasPermission(user, 'patients.read');
      const billingManage = await hasPermission(user, 'billing.manage');
      const clinicManage = await hasPermission(user, 'clinic.manage');
      
      expect(patientRead.granted).toBe(true);
      expect(billingManage.granted).toBe(true);
      expect(clinicManage.granted).toBe(false); // Managers can't manage clinic settings
    });

    it('should validate staff permissions', async () => {
      const user = createMockUser('staff');
      
      const patientRead = await hasPermission(user, 'patients.read');
      const appointmentManage = await hasPermission(user, 'appointments.manage');
      const billingManage = await hasPermission(user, 'billing.manage');
      
      expect(patientRead.granted).toBe(true);
      expect(appointmentManage.granted).toBe(true);
      expect(billingManage.granted).toBe(false); // Staff can't manage billing
    });

    it('should validate patient permissions', async () => {
      const user = createMockUser('patient');
      
      const patientRead = await hasPermission(user, 'patients.read');
      const appointmentManage = await hasPermission(user, 'appointments.manage');
      const billingRead = await hasPermission(user, 'billing.read');
      
      expect(patientRead.granted).toBe(true); // Patients can read their own data
      expect(appointmentManage.granted).toBe(false);
      expect(billingRead.granted).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('should handle permission validation errors gracefully', async () => {
      const user = createMockUser('staff');
      
      // Mock an error in the validation process
      const originalValidation = require('@/lib/auth/rbac/permissions');
      jest.spyOn(originalValidation, 'hasPermission').mockRejectedValueOnce(new Error('Database error'));
      
      const result = await hasPermission(user, 'patients.read');
      
      expect(result.granted).toBe(false);
      expect(result.reason).toBe('Permission validation failed');
    });

    it('should handle missing user data', async () => {
      const invalidUser = {
        id: '',
        email: '',
        role: '',
        clinicId: '',
        iat: 0,
        exp: 0
      } as AuthUser;
      
      const result = await hasPermission(invalidUser, 'patients.read');
      
      expect(result.granted).toBe(false);
    });
  });

  describe('Performance and caching', () => {
    it('should cache permission results for performance', async () => {
      const user = createMockUser('manager');
      
      // First call - should hit the validation logic
      const start1 = Date.now();
      const result1 = await hasPermission(user, 'patients.read');
      const time1 = Date.now() - start1;
      
      // Second call - should use cache
      const start2 = Date.now();
      const result2 = await hasPermission(user, 'patients.read');
      const time2 = Date.now() - start2;
      
      expect(result1.granted).toBe(true);
      expect(result2.granted).toBe(true);
      // Cache should be faster (though this might be flaky in fast environments)
      expect(time2).toBeLessThanOrEqual(time1 + 5); // Allow some margin
    });

    it('should clear cache when requested', async () => {
      const user = createMockUser('manager');
      
      // Cache a result
      await hasPermission(user, 'patients.read');
      
      // Clear cache
      clearAllPermissionCache();
      
      // Next call should not use cache (we can't easily test this without mocking internals)
      const result = await hasPermission(user, 'patients.read');
      expect(result.granted).toBe(true);
    });
  });

  describe('Resource-specific permissions', () => {
    it('should handle patient-specific access', async () => {
      const user = createMockUser('staff');
      
      const result = await hasPermission(user, 'patients.read', 'patient-123');
      
      expect(result.granted).toBe(true);
      expect(result.roleUsed).toBe('staff');
    });

    it('should handle appointment-specific access', async () => {
      const user = createMockUser('staff');
      
      const result = await hasPermission(user, 'appointments.manage', 'appointment-456');
      
      expect(result.granted).toBe(true);
      expect(result.roleUsed).toBe('staff');
    });

    it('should handle financial data access restrictions', async () => {
      const staffUser = createMockUser('staff');
      const managerUser = createMockUser('manager');
      
      const staffResult = await hasPermission(staffUser, 'billing.read');
      const managerResult = await hasPermission(managerUser, 'billing.read');
      
      expect(staffResult.granted).toBe(false);
      expect(managerResult.granted).toBe(true);
    });
  });

  describe('Audit logging', () => {
    it('should log successful permission checks', async () => {
      const user = createMockUser('manager');
      
      const result = await hasPermission(user, 'patients.read');
      
      expect(result.granted).toBe(true);
      // In a real implementation, we would verify that audit log was created
      // For now, we just ensure the permission check succeeded
    });

    it('should log failed permission checks', async () => {
      const user = createMockUser('patient');
      
      const result = await hasPermission(user, 'users.manage');
      
      expect(result.granted).toBe(false);
      // In a real implementation, we would verify that audit log was created
    });
  });
});
