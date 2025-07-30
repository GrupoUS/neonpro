// useRBAC Hook Tests
// Story 1.2: Role-Based Permissions Enhancement

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRBAC, usePermissionCheck, useRoleGuard, usePermissionGuard } from '@/hooks/use-rbac';
import { RBACPermissionManager } from '@/lib/auth/rbac/permissions';
import { useUser } from '@/hooks/use-user';
import { UserRole, Permission } from '@/types/rbac';

// Mock dependencies
vi.mock('@/lib/auth/rbac/permissions', () => ({
  RBACPermissionManager: vi.fn(() => ({
    getUserRole: vi.fn(),
    getUserPermissions: vi.fn(),
    checkPermission: vi.fn(),
    canManageUser: vi.fn(),
    getRoleHierarchyLevel: vi.fn()
  }))
}));

vi.mock('@/hooks/use-user', () => ({
  useUser: vi.fn()
}));

const mockUser = {
  id: 'user-123',
  email: 'test@example.com'
};

const mockClinicId = 'clinic-456';

const mockOwnerRole: UserRole = {
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

const mockStaffRole: UserRole = {
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

describe('useRBAC Hook', () => {
  let mockRBACManager: any;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockRBACManager = {
      getUserRole: vi.fn(),
      getUserPermissions: vi.fn(),
      checkPermission: vi.fn(),
      canManageUser: vi.fn(),
      getRoleHierarchyLevel: vi.fn()
    };
    
    (RBACPermissionManager as any).mockReturnValue(mockRBACManager);
    (useUser as any).mockReturnValue({ user: mockUser });
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  describe('Basic Hook Functionality', () => {
    it('should initialize with loading state', () => {
      mockRBACManager.getUserRole.mockResolvedValue(mockOwnerRole);
      mockRBACManager.getUserPermissions.mockResolvedValue(mockOwnerRole.permissions);
      
      const { result } = renderHook(() => useRBAC(mockClinicId));
      
      expect(result.current.loading).toBe(true);
      expect(result.current.role).toBeNull();
      expect(result.current.permissions).toEqual([]);
    });
    
    it('should load user role and permissions', async () => {
      mockRBACManager.getUserRole.mockResolvedValue(mockOwnerRole);
      mockRBACManager.getUserPermissions.mockResolvedValue(mockOwnerRole.permissions);
      
      const { result } = renderHook(() => useRBAC(mockClinicId));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.role).toEqual(mockOwnerRole);
      expect(result.current.permissions).toEqual(mockOwnerRole.permissions);
      expect(mockRBACManager.getUserRole).toHaveBeenCalledWith(mockUser.id, mockClinicId);
      expect(mockRBACManager.getUserPermissions).toHaveBeenCalledWith(mockUser.id, mockClinicId);
    });
    
    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockRBACManager.getUserRole.mockRejectedValue(new Error('Failed to load role'));
      mockRBACManager.getUserPermissions.mockRejectedValue(new Error('Failed to load permissions'));
      
      const { result } = renderHook(() => useRBAC(mockClinicId));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.role).toBeNull();
      expect(result.current.permissions).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading RBAC data:', expect.any(Error));
      
      consoleErrorSpy.mockRestore();
    });
    
    it('should not load data when user is not available', () => {
      (useUser as any).mockReturnValue({ user: null });
      
      const { result } = renderHook(() => useRBAC(mockClinicId));
      
      expect(result.current.loading).toBe(false);
      expect(result.current.role).toBeNull();
      expect(result.current.permissions).toEqual([]);
      expect(mockRBACManager.getUserRole).not.toHaveBeenCalled();
    });
    
    it('should not load data when clinic ID is not provided', () => {
      const { result } = renderHook(() => useRBAC(undefined));
      
      expect(result.current.loading).toBe(false);
      expect(result.current.role).toBeNull();
      expect(result.current.permissions).toEqual([]);
      expect(mockRBACManager.getUserRole).not.toHaveBeenCalled();
    });
  });
  
  describe('Permission Checking', () => {
    beforeEach(async () => {
      mockRBACManager.getUserRole.mockResolvedValue(mockOwnerRole);
      mockRBACManager.getUserPermissions.mockResolvedValue(mockOwnerRole.permissions);
    });
    
    it('should check single permission correctly', async () => {
      mockRBACManager.checkPermission.mockResolvedValue({
        granted: true,
        reason: 'Permission granted'
      });
      
      const { result } = renderHook(() => useRBAC(mockClinicId));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      const hasPermission = await result.current.checkPermission('manage_users');
      
      expect(hasPermission).toBe(true);
      expect(mockRBACManager.checkPermission).toHaveBeenCalledWith({
        userId: mockUser.id,
        permission: 'manage_users',
        clinicId: mockClinicId
      });
    });
    
    it('should check multiple permissions correctly', async () => {
      mockRBACManager.checkPermission
        .mockResolvedValueOnce({ granted: true, reason: 'Permission granted' })
        .mockResolvedValueOnce({ granted: false, reason: 'Permission denied' });
      
      const { result } = renderHook(() => useRBAC(mockClinicId));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      const hasPermissions = await result.current.checkMultiplePermissions([
        'manage_users',
        'delete_users'
      ]);
      
      expect(hasPermissions).toEqual({
        'manage_users': true,
        'delete_users': false
      });
    });
    
    it('should check if user can manage another user', async () => {
      mockRBACManager.canManageUser.mockResolvedValue(true);
      
      const { result } = renderHook(() => useRBAC(mockClinicId));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      const canManage = await result.current.canManageUser('target-user-id');
      
      expect(canManage).toBe(true);
      expect(mockRBACManager.canManageUser).toHaveBeenCalledWith(
        mockUser.id,
        'target-user-id',
        mockClinicId
      );
    });
  });
  
  describe('Role Hierarchy', () => {
    beforeEach(async () => {
      mockRBACManager.getUserRole.mockResolvedValue(mockOwnerRole);
      mockRBACManager.getUserPermissions.mockResolvedValue(mockOwnerRole.permissions);
      mockRBACManager.getRoleHierarchyLevel.mockReturnValue(mockOwnerRole.hierarchy);
    });
    
    it('should get role hierarchy level', async () => {
      const { result } = renderHook(() => useRBAC(mockClinicId));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      const hierarchyLevel = result.current.getRoleHierarchyLevel();
      
      expect(hierarchyLevel).toBe(mockOwnerRole.hierarchy);
      expect(mockRBACManager.getRoleHierarchyLevel).toHaveBeenCalledWith(mockOwnerRole.name);
    });
    
    it('should return null hierarchy level when no role', () => {
      mockRBACManager.getUserRole.mockResolvedValue(null);
      
      const { result } = renderHook(() => useRBAC(mockClinicId));
      
      const hierarchyLevel = result.current.getRoleHierarchyLevel();
      
      expect(hierarchyLevel).toBeNull();
    });
  });
  
  describe('Role Checking', () => {
    beforeEach(async () => {
      mockRBACManager.getUserRole.mockResolvedValue(mockOwnerRole);
      mockRBACManager.getUserPermissions.mockResolvedValue(mockOwnerRole.permissions);
    });
    
    it('should check if user is in specific role', async () => {
      const { result } = renderHook(() => useRBAC(mockClinicId));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.isInRole('owner')).toBe(true);
      expect(result.current.isInRole('staff')).toBe(false);
    });
    
    it('should check if user is at minimum role level', async () => {
      const { result } = renderHook(() => useRBAC(mockClinicId));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.isAtLeastRole('owner')).toBe(true);
      expect(result.current.isAtLeastRole('manager')).toBe(true); // owner > manager
      expect(result.current.isAtLeastRole('staff')).toBe(true); // owner > staff
    });
    
    it('should handle role checking when no role is loaded', () => {
      mockRBACManager.getUserRole.mockResolvedValue(null);
      
      const { result } = renderHook(() => useRBAC(mockClinicId));
      
      expect(result.current.isInRole('owner')).toBe(false);
      expect(result.current.isAtLeastRole('staff')).toBe(false);
    });
  });
  
  describe('Refresh Functionality', () => {
    it('should refresh role and permissions', async () => {
      mockRBACManager.getUserRole
        .mockResolvedValueOnce(mockStaffRole)
        .mockResolvedValueOnce(mockOwnerRole);
      mockRBACManager.getUserPermissions
        .mockResolvedValueOnce(mockStaffRole.permissions)
        .mockResolvedValueOnce(mockOwnerRole.permissions);
      
      const { result } = renderHook(() => useRBAC(mockClinicId));
      
      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.role).toEqual(mockStaffRole);
      
      // Refresh
      await act(async () => {
        await result.current.refresh();
      });
      
      expect(result.current.role).toEqual(mockOwnerRole);
      expect(mockRBACManager.getUserRole).toHaveBeenCalledTimes(2);
      expect(mockRBACManager.getUserPermissions).toHaveBeenCalledTimes(2);
    });
  });
});

describe('usePermissionCheck Hook', () => {
  let mockRBACManager: any;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockRBACManager = {
      checkPermission: vi.fn()
    };
    
    (RBACPermissionManager as any).mockReturnValue(mockRBACManager);
    (useUser as any).mockReturnValue({ user: mockUser });
  });
  
  it('should check permission and return result', async () => {
    mockRBACManager.checkPermission.mockResolvedValue({
      granted: true,
      reason: 'Permission granted'
    });
    
    const { result } = renderHook(() => 
      usePermissionCheck('view_users', mockClinicId)
    );
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.hasPermission).toBe(true);
    expect(mockRBACManager.checkPermission).toHaveBeenCalledWith({
      userId: mockUser.id,
      permission: 'view_users',
      clinicId: mockClinicId
    });
  });
  
  it('should handle permission denied', async () => {
    mockRBACManager.checkPermission.mockResolvedValue({
      granted: false,
      reason: 'Insufficient permissions'
    });
    
    const { result } = renderHook(() => 
      usePermissionCheck('manage_users', mockClinicId)
    );
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.hasPermission).toBe(false);
  });
  
  it('should not check when user or clinic ID is missing', () => {
    (useUser as any).mockReturnValue({ user: null });
    
    const { result } = renderHook(() => 
      usePermissionCheck('view_users', mockClinicId)
    );
    
    expect(result.current.loading).toBe(false);
    expect(result.current.hasPermission).toBe(false);
    expect(mockRBACManager.checkPermission).not.toHaveBeenCalled();
  });
});

describe('useRoleGuard Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useUser as any).mockReturnValue({ user: mockUser });
  });
  
  it('should render children when user has required role', () => {
    const mockUseRBAC = {
      loading: false,
      role: mockOwnerRole,
      isInRole: vi.fn().mockReturnValue(true)
    };
    
    vi.doMock('@/hooks/use-rbac', () => ({
      useRBAC: () => mockUseRBAC
    }));
    
    const TestComponent = () => {
      const { shouldRender } = useRoleGuard('owner', mockClinicId);
      return shouldRender ? <div>Protected Content</div> : null;
    };
    
    const { container } = renderHook(() => {
      const { shouldRender } = useRoleGuard('owner', mockClinicId);
      return { shouldRender };
    });
    
    // This test would need proper React Testing Library setup for component rendering
    // For now, we'll test the hook logic
    expect(mockUseRBAC.isInRole).toHaveBeenCalledWith('owner');
  });
});

describe('usePermissionGuard Hook', () => {
  let mockRBACManager: any;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockRBACManager = {
      checkPermission: vi.fn()
    };
    
    (RBACPermissionManager as any).mockReturnValue(mockRBACManager);
    (useUser as any).mockReturnValue({ user: mockUser });
  });
  
  it('should render children when user has required permission', async () => {
    mockRBACManager.checkPermission.mockResolvedValue({
      granted: true,
      reason: 'Permission granted'
    });
    
    const { result } = renderHook(() => 
      usePermissionGuard('view_users', mockClinicId)
    );
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.shouldRender).toBe(true);
  });
  
  it('should not render children when user lacks permission', async () => {
    mockRBACManager.checkPermission.mockResolvedValue({
      granted: false,
      reason: 'Permission denied'
    });
    
    const { result } = renderHook(() => 
      usePermissionGuard('manage_users', mockClinicId)
    );
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.shouldRender).toBe(false);
  });
  
  it('should show loading state initially', () => {
    mockRBACManager.checkPermission.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ granted: true }), 100))
    );
    
    const { result } = renderHook(() => 
      usePermissionGuard('view_users', mockClinicId)
    );
    
    expect(result.current.loading).toBe(true);
    expect(result.current.shouldRender).toBe(false);
  });
});
