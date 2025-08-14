/**
 * Unit Tests for RBAC Permission Guard Components
 * Story 1.2: Role-Based Access Control Implementation
 * 
 * Test suite for React components that control access based on permissions
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  PermissionGuard,
  RoleGuard,
  FeatureGuard,
  ConditionalRender,
  PermissionButton,
  PermissionLink
} from '@/components/rbac/PermissionGuard';
import { UserRole } from '@/types/rbac';
import { AuthUser } from '@/lib/middleware/auth';
import React from 'react';

// Mock the usePermissions hook
const mockUsePermissions = {
  hasPermission: jest.fn(),
  hasAnyPermission: jest.fn(),
  hasAllPermissions: jest.fn(),
  hasRole: jest.fn(),
  hasMinimumRole: jest.fn(),
  canAccess: jest.fn(),
  canManage: jest.fn(),
  canView: jest.fn(),
  isLoading: false,
  error: null,
  clearCache: jest.fn()
};

jest.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => mockUsePermissions
}));

// Mock the useAuth hook
const mockUser: AuthUser = {
  id: 'user-1',
  email: 'test@example.com',
  role: 'manager',
  clinicId: 'clinic-1',
  iat: Date.now(),
  exp: Date.now() + 3600000
};

const mockUseAuth = {
  user: mockUser,
  isLoading: false,
  isAuthenticated: true
};

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth
}));

// Test components
const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;
const FallbackComponent = () => <div data-testid="fallback-content">Access Denied</div>;
const LoadingComponent = () => <div data-testid="loading-content">Loading...</div>;

describe('RBAC Permission Guard Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    mockUsePermissions.hasPermission.mockResolvedValue(true);
    mockUsePermissions.hasAnyPermission.mockResolvedValue(true);
    mockUsePermissions.hasAllPermissions.mockResolvedValue(true);
    mockUsePermissions.hasRole.mockReturnValue(true);
    mockUsePermissions.hasMinimumRole.mockReturnValue(true);
    mockUsePermissions.canAccess.mockResolvedValue(true);
    mockUsePermissions.canManage.mockResolvedValue(true);
    mockUsePermissions.canView.mockResolvedValue(true);
    mockUsePermissions.isLoading = false;
    mockUsePermissions.error = null;
  });

  describe('PermissionGuard', () => {
    it('should render children when user has required permission', async () => {
      mockUsePermissions.hasPermission.mockResolvedValue(true);
      
      render(
        <PermissionGuard permission="patients.read">
          <TestComponent />
        </PermissionGuard>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
      
      expect(mockUsePermissions.hasPermission).toHaveBeenCalledWith(
        'patients.read',
        undefined,
        undefined
      );
    });

    it('should not render children when user lacks permission', async () => {
      mockUsePermissions.hasPermission.mockResolvedValue(false);
      
      render(
        <PermissionGuard permission="billing.manage">
          <TestComponent />
        </PermissionGuard>
      );
      
      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      });
    });

    it('should render fallback component when access is denied', async () => {
      mockUsePermissions.hasPermission.mockResolvedValue(false);
      
      render(
        <PermissionGuard 
          permission="billing.manage"
          fallback={<FallbackComponent />}
        >
          <TestComponent />
        </PermissionGuard>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('fallback-content')).toBeInTheDocument();
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      });
    });

    it('should render loading component while checking permissions', () => {
      mockUsePermissions.isLoading = true;
      
      render(
        <PermissionGuard 
          permission="patients.read"
          loading={<LoadingComponent />}
        >
          <TestComponent />
        </PermissionGuard>
      );
      
      expect(screen.getByTestId('loading-content')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should pass resource ID to permission check', async () => {
      mockUsePermissions.hasPermission.mockResolvedValue(true);
      
      render(
        <PermissionGuard 
          permission="patients.read" 
          resourceId="patient-123"
        >
          <TestComponent />
        </PermissionGuard>
      );
      
      await waitFor(() => {
        expect(mockUsePermissions.hasPermission).toHaveBeenCalledWith(
          'patients.read',
          'patient-123',
          undefined
        );
      });
    });

    it('should pass context to permission check', async () => {
      const context = { clinicId: 'clinic-2' };
      mockUsePermissions.hasPermission.mockResolvedValue(true);
      
      render(
        <PermissionGuard 
          permission="patients.read" 
          context={context}
        >
          <TestComponent />
        </PermissionGuard>
      );
      
      await waitFor(() => {
        expect(mockUsePermissions.hasPermission).toHaveBeenCalledWith(
          'patients.read',
          undefined,
          context
        );
      });
    });

    it('should handle multiple permissions with AND logic', async () => {
      mockUsePermissions.hasAllPermissions.mockResolvedValue(true);
      
      render(
        <PermissionGuard 
          permissions={['patients.read', 'appointments.read']}
          requireAll={true}
        >
          <TestComponent />
        </PermissionGuard>
      );
      
      await waitFor(() => {
        expect(mockUsePermissions.hasAllPermissions).toHaveBeenCalledWith(
          ['patients.read', 'appointments.read']
        );
      });
    });

    it('should handle multiple permissions with OR logic', async () => {
      mockUsePermissions.hasAnyPermission.mockResolvedValue(true);
      
      render(
        <PermissionGuard 
          permissions={['patients.read', 'billing.read']}
          requireAll={false}
        >
          <TestComponent />
        </PermissionGuard>
      );
      
      await waitFor(() => {
        expect(mockUsePermissions.hasAnyPermission).toHaveBeenCalledWith(
          ['patients.read', 'billing.read']
        );
      });
    });
  });

  describe('RoleGuard', () => {
    it('should render children when user has required role', () => {
      mockUsePermissions.hasRole.mockReturnValue(true);
      
      render(
        <RoleGuard role="manager">
          <TestComponent />
        </RoleGuard>
      );
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockUsePermissions.hasRole).toHaveBeenCalledWith('manager');
    });

    it('should not render children when user lacks role', () => {
      mockUsePermissions.hasRole.mockReturnValue(false);
      
      render(
        <RoleGuard role="owner">
          <TestComponent />
        </RoleGuard>
      );
      
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should handle multiple roles', () => {
      mockUsePermissions.hasRole.mockImplementation((role) => 
        ['manager', 'staff'].includes(role)
      );
      
      render(
        <RoleGuard roles={['manager', 'staff']}>
          <TestComponent />
        </RoleGuard>
      );
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should check minimum role level', () => {
      mockUsePermissions.hasMinimumRole.mockReturnValue(true);
      
      render(
        <RoleGuard minimumRole="staff">
          <TestComponent />
        </RoleGuard>
      );
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockUsePermissions.hasMinimumRole).toHaveBeenCalledWith('staff');
    });

    it('should render fallback for insufficient role', () => {
      mockUsePermissions.hasRole.mockReturnValue(false);
      
      render(
        <RoleGuard 
          role="owner"
          fallback={<FallbackComponent />}
        >
          <TestComponent />
        </RoleGuard>
      );
      
      expect(screen.getByTestId('fallback-content')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('FeatureGuard', () => {
    it('should render children when user can access feature', async () => {
      mockUsePermissions.canAccess.mockResolvedValue(true);
      
      render(
        <FeatureGuard feature="patient-management">
          <TestComponent />
        </FeatureGuard>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
      
      expect(mockUsePermissions.canAccess).toHaveBeenCalledWith('patient-management');
    });

    it('should not render children when user cannot access feature', async () => {
      mockUsePermissions.canAccess.mockResolvedValue(false);
      
      render(
        <FeatureGuard feature="billing-management">
          <TestComponent />
        </FeatureGuard>
      );
      
      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      });
    });

    it('should render loading state while checking feature access', () => {
      mockUsePermissions.isLoading = true;
      
      render(
        <FeatureGuard 
          feature="patient-management"
          loading={<LoadingComponent />}
        >
          <TestComponent />
        </FeatureGuard>
      );
      
      expect(screen.getByTestId('loading-content')).toBeInTheDocument();
    });
  });

  describe('ConditionalRender', () => {
    it('should render children when condition is true', () => {
      render(
        <ConditionalRender condition={true}>
          <TestComponent />
        </ConditionalRender>
      );
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should not render children when condition is false', () => {
      render(
        <ConditionalRender condition={false}>
          <TestComponent />
        </ConditionalRender>
      );
      
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should render fallback when condition is false', () => {
      render(
        <ConditionalRender 
          condition={false}
          fallback={<FallbackComponent />}
        >
          <TestComponent />
        </ConditionalRender>
      );
      
      expect(screen.getByTestId('fallback-content')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('PermissionButton', () => {
    it('should render enabled button when user has permission', async () => {
      mockUsePermissions.hasPermission.mockResolvedValue(true);
      
      render(
        <PermissionButton 
          permission="patients.create"
          onClick={() => {}}
        >
          Create Patient
        </PermissionButton>
      );
      
      await waitFor(() => {
        const button = screen.getByRole('button', { name: 'Create Patient' });
        expect(button).toBeInTheDocument();
        expect(button).toBeEnabled();
      });
    });

    it('should render disabled button when user lacks permission', async () => {
      mockUsePermissions.hasPermission.mockResolvedValue(false);
      
      render(
        <PermissionButton 
          permission="billing.create"
          onClick={() => {}}
        >
          Create Invoice
        </PermissionButton>
      );
      
      await waitFor(() => {
        const button = screen.getByRole('button', { name: 'Create Invoice' });
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
      });
    });

    it('should call onClick when clicked and permission is granted', async () => {
      const mockOnClick = jest.fn();
      mockUsePermissions.hasPermission.mockResolvedValue(true);
      
      render(
        <PermissionButton 
          permission="patients.create"
          onClick={mockOnClick}
        >
          Create Patient
        </PermissionButton>
      );
      
      await waitFor(() => {
        const button = screen.getByRole('button', { name: 'Create Patient' });
        expect(button).toBeEnabled();
      });
      
      const user = userEvent.setup();
      const button = screen.getByRole('button', { name: 'Create Patient' });
      await user.click(button);
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when clicked and permission is denied', async () => {
      const mockOnClick = jest.fn();
      mockUsePermissions.hasPermission.mockResolvedValue(false);
      
      render(
        <PermissionButton 
          permission="billing.create"
          onClick={mockOnClick}
        >
          Create Invoice
        </PermissionButton>
      );
      
      await waitFor(() => {
        const button = screen.getByRole('button', { name: 'Create Invoice' });
        expect(button).toBeDisabled();
      });
      
      const user = userEvent.setup();
      const button = screen.getByRole('button', { name: 'Create Invoice' });
      await user.click(button);
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should show loading state while checking permissions', () => {
      mockUsePermissions.isLoading = true;
      
      render(
        <PermissionButton 
          permission="patients.create"
          onClick={() => {}}
        >
          Create Patient
        </PermissionButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Loading...');
    });

    it('should pass additional props to button element', async () => {
      mockUsePermissions.hasPermission.mockResolvedValue(true);
      
      render(
        <PermissionButton 
          permission="patients.create"
          onClick={() => {}}
          className="custom-button"
          data-testid="permission-button"
        >
          Create Patient
        </PermissionButton>
      );
      
      await waitFor(() => {
        const button = screen.getByTestId('permission-button');
        expect(button).toHaveClass('custom-button');
      });
    });
  });

  describe('PermissionLink', () => {
    it('should render enabled link when user has permission', async () => {
      mockUsePermissions.hasPermission.mockResolvedValue(true);
      
      render(
        <PermissionLink 
          permission="patients.read"
          href="/patients"
        >
          View Patients
        </PermissionLink>
      );
      
      await waitFor(() => {
        const link = screen.getByRole('link', { name: 'View Patients' });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/patients');
        expect(link).not.toHaveAttribute('aria-disabled');
      });
    });

    it('should render disabled link when user lacks permission', async () => {
      mockUsePermissions.hasPermission.mockResolvedValue(false);
      
      render(
        <PermissionLink 
          permission="billing.read"
          href="/billing"
        >
          View Billing
        </PermissionLink>
      );
      
      await waitFor(() => {
        const link = screen.getByText('View Billing');
        expect(link).toBeInTheDocument();
        expect(link).not.toHaveAttribute('href');
        expect(link).toHaveAttribute('aria-disabled', 'true');
      });
    });

    it('should show loading state while checking permissions', () => {
      mockUsePermissions.isLoading = true;
      
      render(
        <PermissionLink 
          permission="patients.read"
          href="/patients"
        >
          View Patients
        </PermissionLink>
      );
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should handle permission check errors gracefully', async () => {
      mockUsePermissions.error = 'Permission check failed';
      
      render(
        <PermissionGuard permission="patients.read">
          <TestComponent />
        </PermissionGuard>
      );
      
      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      });
    });

    it('should render error fallback when provided', async () => {
      mockUsePermissions.error = 'Permission check failed';
      
      const ErrorComponent = () => <div data-testid="error-content">Error occurred</div>;
      
      render(
        <PermissionGuard 
          permission="patients.read"
          errorFallback={<ErrorComponent />}
        >
          <TestComponent />
        </PermissionGuard>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('error-content')).toBeInTheDocument();
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should handle nested permission guards', async () => {
      mockUsePermissions.hasPermission.mockImplementation((permission) => {
        return Promise.resolve(permission === 'patients.read' || permission === 'patients.manage');
      });
      
      render(
        <PermissionGuard permission="patients.read">
          <div data-testid="outer-content">
            <PermissionGuard permission="patients.manage">
              <div data-testid="inner-content">Manage Patients</div>
            </PermissionGuard>
          </div>
        </PermissionGuard>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('outer-content')).toBeInTheDocument();
        expect(screen.getByTestId('inner-content')).toBeInTheDocument();
      });
    });

    it('should handle complex permission combinations', async () => {
      mockUsePermissions.hasAllPermissions.mockResolvedValue(true);
      mockUsePermissions.hasRole.mockReturnValue(true);
      
      render(
        <RoleGuard role="manager">
          <PermissionGuard 
            permissions={['patients.read', 'appointments.read']}
            requireAll={true}
          >
            <TestComponent />
          </PermissionGuard>
        </RoleGuard>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });
  });
});
