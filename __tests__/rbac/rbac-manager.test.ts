// Story 1.2: Role-Based Permissions Enhancement

import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { RBACPermissionManager } from "@/lib/auth/rbac/permissions";
import type { Permission, RoleDefinition, UserRoleAssignment } from "@/types/rbac";

// Mock Supabase client
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => ({ data: [], error: null })),
        })),
        order: jest.fn(() => ({ data: [], error: null })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({ data: [], error: null })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({ data: [], error: null })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({ data: [], error: null })),
      })),
    })),
  })),
}));

describe("RBACPermissionManager", () => {
  let rbacManager: RBACPermissionManager;
  let mockSupabase: any;

  const mockUserId = "user-123";
  const mockClinicId = "clinic-456";
  const mockRoleId = "role-789";

  const mockOwnerRole: RoleDefinition = {
    id: "role-owner",
    name: "owner",
    display_name: "Owner",
    permissions: ["*"],
    hierarchy: 1,
    is_system_role: true,
    clinic_id: mockClinicId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockManagerRole: RoleDefinition = {
    id: "role-manager",
    name: "manager",
    display_name: "Manager",
    permissions: ["patients.read", "appointments.manage", "billing.manage"],
    hierarchy: 2,
    is_system_role: true,
    clinic_id: mockClinicId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockStaffRole: RoleDefinition = {
    id: "role-staff",
    name: "staff",
    display_name: "Staff",
    permissions: ["patients.read", "appointments.manage"],
    hierarchy: 3,
    is_system_role: true,
    clinic_id: mockClinicId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(),
            order: jest.fn(() => ({ data: [], error: null })),
          })),
          order: jest.fn(() => ({ data: [], error: null })),
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({ data: [], error: null })),
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({ data: [], error: null })),
        })),
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({ data: [], error: null })),
        })),
      })),
    };
    rbacManager = new RBACPermissionManager(mockSupabase);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getUserRole", () => {
    it("should retrieve user role assignment correctly", async () => {
      const mockRoleAssignment: UserRoleAssignment = {
        id: "assignment-123",
        user_id: mockUserId,
        role_id: mockRoleId,
        clinic_id: mockClinicId,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: mockOwnerRole,
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockRoleAssignment,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      const result = await rbacManager.getUserRole(mockUserId, mockClinicId);

      expect(result).toEqual(mockRoleAssignment);
      expect(mockSupabase.from).toHaveBeenCalledWith("user_roles");
    });
  });

  describe("hasPermission", () => {
    it("should grant permission when user has required permission", async () => {
      const mockRoleAssignment: UserRoleAssignment = {
        id: "assignment-123",
        user_id: mockUserId,
        role_id: mockRoleId,
        clinic_id: mockClinicId,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: mockManagerRole,
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockRoleAssignment,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      const result = await rbacManager.hasPermission(
        mockUserId,
        "patients.read" as Permission,
        mockClinicId,
      );

      expect(result.granted).toBe(true);
      expect(result.role).toBe("manager");
    });

    it("should deny permission when user lacks required permission", async () => {
      const mockRoleAssignment: UserRoleAssignment = {
        id: "assignment-123",
        user_id: mockUserId,
        role_id: mockRoleId,
        clinic_id: mockClinicId,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: mockStaffRole,
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockRoleAssignment,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      const result = await rbacManager.hasPermission(
        mockUserId,
        "billing.manage" as Permission,
        mockClinicId,
      );

      expect(result.granted).toBe(false);
      expect(result.role).toBe("staff");
    });
  });

  describe("canManageUser", () => {
    it("should allow higher hierarchy user to manage lower hierarchy user", async () => {
      // Manager can manage staff
      const mockManagerAssignment: UserRoleAssignment = {
        id: "assignment-manager",
        user_id: mockUserId,
        role_id: mockManagerRole.id,
        clinic_id: mockClinicId,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: mockManagerRole,
      };

      const mockStaffAssignment: UserRoleAssignment = {
        id: "assignment-staff",
        user_id: "target-user",
        role_id: mockStaffRole.id,
        clinic_id: mockClinicId,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: mockStaffRole,
      };

      // Mock current user (manager) and target user (staff)
      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: mockManagerAssignment,
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: mockStaffAssignment,
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        });

      const canManage = await rbacManager.canManageUser(mockUserId, "target-user", mockClinicId);

      expect(canManage).toBe(true);
    });

    it("should not allow lower hierarchy user to manage higher hierarchy user", async () => {
      // Staff cannot manage manager
      const mockStaffAssignment: UserRoleAssignment = {
        id: "assignment-staff",
        user_id: mockUserId,
        role_id: mockStaffRole.id,
        clinic_id: mockClinicId,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: mockStaffRole,
      };

      const mockManagerAssignment: UserRoleAssignment = {
        id: "assignment-manager",
        user_id: "target-user",
        role_id: mockManagerRole.id,
        clinic_id: mockClinicId,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: mockManagerRole,
      };

      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: mockStaffAssignment,
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: mockManagerAssignment,
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        });

      const canManage = await rbacManager.canManageUser(mockUserId, "target-user", mockClinicId);

      expect(canManage).toBe(false);
    });
  });

  describe("Role Management", () => {
    it("should create role assignment successfully", async () => {
      const newAssignment = {
        user_id: mockUserId,
        role_id: mockRoleId,
        clinic_id: mockClinicId,
        is_active: true,
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [{ ...newAssignment, id: "new-assignment-123" }],
            error: null,
          }),
        }),
      });

      const result = await rbacManager.assignRole(mockUserId, mockRoleId, mockClinicId, mockUserId);

      expect(result).toBeTruthy();
      expect(mockSupabase.from).toHaveBeenCalledWith("user_roles");
    });

    it("should remove role assignment successfully", async () => {
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await rbacManager.removeRole(mockUserId, mockClinicId, mockUserId);

      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith("user_roles");
    });
  });

  describe("Permission Checks with Resource Access", () => {
    it("should handle resource-specific permission checks", async () => {
      const mockRoleAssignment: UserRoleAssignment = {
        id: "assignment-123",
        user_id: mockUserId,
        role_id: mockRoleId,
        clinic_id: mockClinicId,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: mockManagerRole,
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockRoleAssignment,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      const result = await rbacManager.hasPermission(
        mockUserId,
        "patients.read" as Permission,
        mockClinicId,
        "patient-123",
      );

      expect(result.granted).toBe(true);
      expect(result.resourceId).toBe("patient-123");
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: "Database connection error" },
                }),
              }),
            }),
          }),
        }),
      });

      const result = await rbacManager.hasPermission(
        mockUserId,
        "patients.read" as Permission,
        mockClinicId,
      );

      expect(result.granted).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle missing role assignments", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      const result = await rbacManager.hasPermission(
        mockUserId,
        "patients.read" as Permission,
        mockClinicId,
      );

      expect(result.granted).toBe(false);
      expect(result.role).toBeUndefined();
    });
  });

  describe("Performance and Caching", () => {
    it("should implement permission caching for repeated checks", async () => {
      const mockRoleAssignment: UserRoleAssignment = {
        id: "assignment-123",
        user_id: mockUserId,
        role_id: mockRoleId,
        clinic_id: mockClinicId,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: mockManagerRole,
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockRoleAssignment,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      // First call
      await rbacManager.hasPermission(mockUserId, "patients.read" as Permission, mockClinicId);

      // Second call should use cache
      await rbacManager.hasPermission(mockUserId, "patients.read" as Permission, mockClinicId);

      // Should only call database once due to caching
      expect(mockSupabase.from).toHaveBeenCalledTimes(1);
    });
  });
});
