// RBAC Manager Tests
// Story 1.2: Role-Based Permissions Enhancement

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RBACPermissionManager } from '@/lib/auth/rbac/permissions';
import { createClient } from '@/lib/supabase/client';
import {
  UserRole,
  Permission,
  PermissionCheck,
  RoleDefinition,
  DEFAULT_ROLES
} from '@/types/rbac';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(() => ({ data: [], error: null }))
        })),
        order: vi.fn(() => ({ data: [], error: null }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({ data: [], error: null }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({ data: [], error: null }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({ data: [], error: null }))
      }))
    }))
  }))
}));

describe('RBACPermissionManager', () => {
  let rbacManager: RBACPermissionManager;
  let mockSupabase: any;
  
  const mockUserId = 'user-123';
  const mockClinicId = 'clinic-456';
  const mockRoleId = 'role-789';
  
  const mockOwnerRole: RoleDefinition = {
    id: 'role-owner',
    name: 'owner',
    display_name: 'Proprietário',
    description: 'Proprietário da clínica',
    permissions: ['manage_clinic', 'manage_users', 'view_users'] as Permission[],
    hierarchy: 1,
    is_system_role: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const mockStaffRole: RoleDefinition = {
    id: 'role-staff',
    name: 'staff',
    display_name: 'Funcionário',
    description: 'Funcionário da clínica',
    permissions: ['view_patients', 'create_patients'] as Permission[],
    hierarchy: 3,
    is_system_role: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = createClient();
    rbacManager = new RBACPermissionManager();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  describe('checkPermission', () => {
    it('should grant permission when user has the required permission', async () => {
      // Mock user role assignment
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    user_id: mockUserId,
                    role_id: mockOwnerRole.id,
                    clinic_id: mockClinicId,
                    is_active: true,
                    role: mockOwnerRole
                  },
                  error: null
                })
              })
            })
          })
        })
      });
      
      const permissionCheck: PermissionCheck = {
        userId: mockUserId,
        permission: 'manage_users',
        clinicId: mockClinicId
      };
      
      const result = await rbacManager.checkPermission(permissionCheck);
      
      expect(result.granted).toBe(true);
      expect(result.reason).toContain('Permission granted');
    });
    
    it('should deny permission when user does not have the required permission', async () => {
      // Mock user role assignment with staff role
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    user_id: mockUserId,
                    role_id: mockStaffRole.id,
                    clinic_id: mockClinicId,
                    is_active: true,
                    role: mockStaffRole
                  },
                  error: null
                })
              })
            })
          })
        })
      });
      
      const permissionCheck: PermissionCheck = {
        userId: mockUserId,
        permission: 'manage_users',
        clinicId: mockClinicId
      };
      
      const result = await rbacManager.checkPermission(permissionCheck);
      
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('Permission denied');
    });
    
    it('should deny permission when user has no role assignment', async () => {
      // Mock no role assignment found
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'No role assignment found' }
                })
              })
            })
          })
        })
      });
      
      const permissionCheck: PermissionCheck = {
        userId: mockUserId,
        permission: 'view_users',
        clinicId: mockClinicId
      };
      
      const result = await rbacManager.checkPermission(permissionCheck);
      
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('No active role assignment');
    });
    
    it('should validate time-based restrictions', async () => {
      // Mock user role assignment
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    user_id: mockUserId,
                    role_id: mockOwnerRole.id,
                    clinic_id: mockClinicId,
                    is_active: true,
                    role: mockOwnerRole
                  },
                  error: null
                })
              })
            })
          })
        })
      });
      
      const permissionCheck: PermissionCheck = {
        userId: mockUserId,
        permission: 'manage_users',
        clinicId: mockClinicId,
        context: {
          timeRestriction: {
            allowedHours: [9, 10, 11, 12, 13, 14, 15, 16, 17], // 9 AM to 5 PM
            timezone: 'America/Sao_Paulo'
          }
        }
      };
      
      // Mock current time to be outside allowed hours (e.g., 2 AM)
      const mockDate = new Date();
      mockDate.setHours(2, 0, 0, 0);
      vi.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      
      const result = await rbacManager.checkPermission(permissionCheck);
      
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('Time restriction');
    });
    
    it('should validate IP-based restrictions', async () => {
      // Mock user role assignment
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    user_id: mockUserId,
                    role_id: mockOwnerRole.id,
                    clinic_id: mockClinicId,
                    is_active: true,
                    role: mockOwnerRole
                  },
                  error: null
                })
              })
            })
          })
        })
      });
      
      const permissionCheck: PermissionCheck = {
        userId: mockUserId,
        permission: 'manage_users',
        clinicId: mockClinicId,
        context: {
          ipAddress: '192.168.1.100',
          ipRestriction: {
            allowedIPs: ['192.168.1.1', '192.168.1.50'],
            blockedIPs: ['192.168.1.100']
          }
        }
      };
      
      const result = await rbacManager.checkPermission(permissionCheck);
      
      expect(result.granted).toBe(false);
      expect(result.reason).toContain('IP restriction');
    });
  });
  
  describe('assignRole', () => {
    it('should successfully assign a role to a user', async () => {
      // Mock successful role assignment
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: [{
              id: 'assignment-123',
              user_id: mockUserId,
              role_id: mockRoleId,
              clinic_id: mockClinicId,
              assigned_by: 'admin-user',
              is_active: true
            }],
            error: null
          })
        })
      });
      
      const result = await rbacManager.assignRole(
        mockUserId,
        mockRoleId,
        mockClinicId,
        {
          assignedBy: 'admin-user',
          notes: 'Initial role assignment'
        }
      );
      
      expect(result).toBeDefined();
      expect(mockSupabase.from).toHaveBeenCalledWith('user_role_assignments');
    });
    
    it('should handle role assignment errors', async () => {
      // Mock role assignment error
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Role assignment failed' }
          })
        })
      });
      
      await expect(
        rbacManager.assignRole(mockUserId, mockRoleId, mockClinicId)
      ).rejects.toThrow('Role assignment failed');
    });
  });
  
  describe('removeRole', () => {
    it('should successfully remove a role from a user', async () => {
      // Mock successful role removal
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ id: 'assignment-123' }],
                error: null
              })
            })
          })
        })
      });
      
      const result = await rbacManager.removeRole(mockUserId, mockClinicId);
      
      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('user_role_assignments');
    });
  });
  
  describe('getUserPermissions', () => {
    it('should return user permissions based on their role', async () => {
      // Mock user role assignment
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    user_id: mockUserId,
                    role_id: mockOwnerRole.id,
                    clinic_id: mockClinicId,
                    is_active: true,
                    role: mockOwnerRole
                  },
                  error: null
                })
              })
            })
          })
        })
      });
      
      const permissions = await rbacManager.getUserPermissions(mockUserId, mockClinicId);
      
      expect(permissions).toEqual(mockOwnerRole.permissions);
    });
    
    it('should return empty array when user has no role', async () => {
      // Mock no role assignment
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'No role found' }
                })
              })
            })
          })
        })
      });
      
      const permissions = await rbacManager.getUserPermissions(mockUserId, mockClinicId);
      
      expect(permissions).toEqual([]);
    });
  });
  
  describe('canManageUser', () => {
    it('should allow higher hierarchy user to manage lower hierarchy user', async () => {
      // Mock manager role for current user
      const mockManagerRole = {
        ...mockOwnerRole,
        name: 'manager',
        hierarchy: 2
      };
      
      // Mock current user (manager) and target user (staff)
      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      user_id: mockUserId,
                      role_id: mockManagerRole.id,
                      clinic_id: mockClinicId,
                      is_active: true,
                      role: mockManagerRole
                    },
                    error: null
                  })
                })
              })
            })
          })
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      user_id: 'target-user',
                      role_id: mockStaffRole.id,
                      clinic_id: mockClinicId,
                      is_active: true,
                      role: mockStaffRole
                    },
                    error: null
                  })
                })
              })
            })
          })
        });
      
      const canManage = await rbacManager.canManageUser(mockUserId, 'target-user', mockClinicId);
      
      expect(canManage).toBe(true);
    });
    
    it('should not allow lower hierarchy user to manage higher hierarchy user', async () => {
      // Mock staff role for current user and manager role for target user
      const mockManagerRole = {
        ...mockOwnerRole,
        name: 'manager',
        hierarchy: 2
      };
      
      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      user_id: mockUserId,
                      role_id: mockStaffRole.id,
                      clinic_id: mockClinicId,
                      is_active: true,
                      role: mockStaffRole
                    },
                    error: null
                  })
                })
              })
            })
          })
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      user_id: 'target-user',
                      role_id: mockManagerRole.id,
                      clinic_id: mockClinicId,
                      is_active: true,
                      role: mockManagerRole
                    },
                    error: null
                  })
                })
              })
            })
          })
        });
      
      const canManage = await rbacManager.canManageUser(mockUserId, 'target-user', mockClinicId);
      
      expect(canManage).toBe(false);
    });
  });
  
  describe('auditPermissionCheck', () => {
    it('should log permission checks for audit purposes', async () => {
      // Mock audit log insertion
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          data: [{ id: 'audit-log-123' }],
          error: null
        })
      });
      
      await rbacManager.auditPermissionCheck({
        userId: mockUserId,
        clinicId: mockClinicId,
        permission: 'view_users',
        granted: true,
        reason: 'User has required permission',
        context: {
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...'
        }
      });
      
      expect(mockSupabase.from).toHaveBeenCalledWith('permission_audit_logs');
    });
  });
  
  describe('DEFAULT_ROLES validation', () => {
    it('should have valid default roles structure', () => {
      expect(DEFAULT_ROLES.owner).toBeDefined();
      expect(DEFAULT_ROLES.manager).toBeDefined();
      expect(DEFAULT_ROLES.staff).toBeDefined();
      expect(DEFAULT_ROLES.patient).toBeDefined();
      
      // Check hierarchy order
      expect(DEFAULT_ROLES.owner.hierarchy).toBeLessThan(DEFAULT_ROLES.manager.hierarchy);
      expect(DEFAULT_ROLES.manager.hierarchy).toBeLessThan(DEFAULT_ROLES.staff.hierarchy);
      expect(DEFAULT_ROLES.staff.hierarchy).toBeLessThan(DEFAULT_ROLES.patient.hierarchy);
      
      // Check that owner has the most permissions
      expect(DEFAULT_ROLES.owner.permissions.length).toBeGreaterThan(DEFAULT_ROLES.manager.permissions.length);
      expect(DEFAULT_ROLES.manager.permissions.length).toBeGreaterThan(DEFAULT_ROLES.staff.permissions.length);
    });
    
    it('should have unique permissions across roles', () => {
      const allPermissions = new Set();
      
      Object.values(DEFAULT_ROLES).forEach(role => {
        role.permissions.forEach(permission => {
          allPermissions.add(permission);
        });
      });
      
      // Should have a reasonable number of unique permissions
      expect(allPermissions.size).toBeGreaterThan(10);
    });
  });
});
