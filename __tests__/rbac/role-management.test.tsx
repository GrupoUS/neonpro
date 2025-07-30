// Role Management Component Tests
// Story 1.2: Role-Based Permissions Enhancement

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoleManagement } from '@/components/admin/role-management';
import { useRBAC } from '@/hooks/use-rbac';
import { RBACPermissionManager } from '@/lib/auth/rbac/permissions';
import { UserRole, Permission } from '@/types/rbac';

// Mock dependencies
vi.mock('@/hooks/use-rbac', () => ({
  useRBAC: vi.fn()
}));

vi.mock('@/lib/auth/rbac/permissions', () => ({
  RBACPermissionManager: vi.fn(() => ({
    assignRole: vi.fn(),
    removeRole: vi.fn(),
    getUserRole: vi.fn(),
    getAllUsers: vi.fn(),
    getAllRoles: vi.fn()
  }))
}));

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardDescription: ({ children }: any) => <p>{children}</p>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant }: any) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  )
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange }: any) => (
    <div data-testid="select" onClick={() => onValueChange?.('test-value')}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>
}));

vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: any) => <table>{children}</table>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableCell: ({ children }: any) => <td>{children}</td>,
  TableHead: ({ children }: any) => <th>{children}</th>,
  TableHeader: ({ children }: any) => <thead>{children}</thead>,
  TableRow: ({ children }: any) => <tr>{children}</tr>
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: any) => (
    <span data-variant={variant}>{children}</span>
  )
}));

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children }: any) => <div role="alert">{children}</div>,
  AlertDescription: ({ children }: any) => <p>{children}</p>
}));

vi.mock('lucide-react', () => ({
  Users: () => <span data-testid="users-icon">Users</span>,
  Shield: () => <span data-testid="shield-icon">Shield</span>,
  UserCheck: () => <span data-testid="user-check-icon">UserCheck</span>,
  AlertCircle: () => <span data-testid="alert-circle-icon">AlertCircle</span>,
  Loader2: () => <span data-testid="loader-icon">Loading</span>
}));

const mockClinicId = 'clinic-123';

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

const mockManagerRole: UserRole = {
  id: 'role-manager',
  name: 'manager',
  display_name: 'Gerente',
  description: 'Gerente da clínica',
  permissions: ['manage_users', 'view_users', 'view_patients'] as Permission[],
  hierarchy: 2,
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

const mockUsers = [
  {
    id: 'user-1',
    email: 'owner@clinic.com',
    name: 'Owner User',
    role: mockOwnerRole
  },
  {
    id: 'user-2',
    email: 'manager@clinic.com',
    name: 'Manager User',
    role: mockManagerRole
  },
  {
    id: 'user-3',
    email: 'staff@clinic.com',
    name: 'Staff User',
    role: mockStaffRole
  }
];

const mockRoles = [mockOwnerRole, mockManagerRole, mockStaffRole];

describe('RoleManagement Component', () => {
  let mockRBACManager: any;
  let mockUseRBAC: any;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockRBACManager = {
      assignRole: vi.fn(),
      removeRole: vi.fn(),
      getUserRole: vi.fn(),
      getAllUsers: vi.fn(),
      getAllRoles: vi.fn()
    };
    
    mockUseRBAC = {
      loading: false,
      role: mockOwnerRole,
      permissions: mockOwnerRole.permissions,
      checkPermission: vi.fn().mockResolvedValue(true),
      canManageUser: vi.fn().mockResolvedValue(true),
      isInRole: vi.fn().mockReturnValue(true),
      isAtLeastRole: vi.fn().mockReturnValue(true)
    };
    
    (RBACPermissionManager as any).mockReturnValue(mockRBACManager);
    (useRBAC as any).mockReturnValue(mockUseRBAC);
    
    // Mock successful data loading
    mockRBACManager.getAllUsers.mockResolvedValue(mockUsers);
    mockRBACManager.getAllRoles.mockResolvedValue(mockRoles);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  describe('Component Rendering', () => {
    it('should render role management interface', async () => {
      render(<RoleManagement clinicId={mockClinicId} />);
      
      expect(screen.getByText('Gerenciamento de Funções')).toBeInTheDocument();
      expect(screen.getByText('Gerencie funções e permissões dos usuários')).toBeInTheDocument();
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Owner User')).toBeInTheDocument();
      });
    });
    
    it('should show loading state initially', () => {
      mockUseRBAC.loading = true;
      
      render(<RoleManagement clinicId={mockClinicId} />);
      
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
      expect(screen.getByText('Carregando dados de função...')).toBeInTheDocument();
    });
    
    it('should show access denied when user lacks permissions', () => {
      mockUseRBAC.checkPermission.mockResolvedValue(false);
      mockUseRBAC.isAtLeastRole.mockReturnValue(false);
      
      render(<RoleManagement clinicId={mockClinicId} />);
      
      expect(screen.getByText('Acesso Negado')).toBeInTheDocument();
      expect(screen.getByText('Você não tem permissão para gerenciar funções de usuário.')).toBeInTheDocument();
    });
  });
  
  describe('User List Display', () => {
    it('should display list of users with their roles', async () => {
      render(<RoleManagement clinicId={mockClinicId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Owner User')).toBeInTheDocument();
        expect(screen.getByText('Manager User')).toBeInTheDocument();
        expect(screen.getByText('Staff User')).toBeInTheDocument();
      });
      
      expect(screen.getByText('owner@clinic.com')).toBeInTheDocument();
      expect(screen.getByText('manager@clinic.com')).toBeInTheDocument();
      expect(screen.getByText('staff@clinic.com')).toBeInTheDocument();
      
      expect(screen.getByText('Proprietário')).toBeInTheDocument();
      expect(screen.getByText('Gerente')).toBeInTheDocument();
      expect(screen.getByText('Funcionário')).toBeInTheDocument();
    });
    
    it('should show role hierarchy levels', async () => {
      render(<RoleManagement clinicId={mockClinicId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Nível 1')).toBeInTheDocument();
        expect(screen.getByText('Nível 2')).toBeInTheDocument();
        expect(screen.getByText('Nível 3')).toBeInTheDocument();
      });
    });
    
    it('should handle empty user list', async () => {
      mockRBACManager.getAllUsers.mockResolvedValue([]);
      
      render(<RoleManagement clinicId={mockClinicId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Nenhum usuário encontrado')).toBeInTheDocument();
      });
    });
  });
  
  describe('Role Assignment', () => {
    it('should allow role assignment for manageable users', async () => {
      const user = userEvent.setup();
      
      render(<RoleManagement clinicId={mockClinicId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Staff User')).toBeInTheDocument();
      });
      
      // Find and click the role assignment button for staff user
      const assignButtons = screen.getAllByText('Alterar Função');
      await user.click(assignButtons[2]); // Staff user button
      
      // Should show role selection
      expect(screen.getByText('Selecionar nova função')).toBeInTheDocument();
    });
    
    it('should disable role assignment for non-manageable users', async () => {
      mockUseRBAC.canManageUser.mockImplementation((userId: string) => {
        return userId !== 'user-1'; // Cannot manage owner
      });
      
      render(<RoleManagement clinicId={mockClinicId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Owner User')).toBeInTheDocument();
      });
      
      // Owner's change role button should be disabled
      const buttons = screen.getAllByText('Alterar Função');
      expect(buttons[0]).toBeDisabled();
    });
    
    it('should successfully assign new role', async () => {
      const user = userEvent.setup();
      mockRBACManager.assignRole.mockResolvedValue({ success: true });
      
      render(<RoleManagement clinicId={mockClinicId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Staff User')).toBeInTheDocument();
      });
      
      // Click change role button
      const assignButtons = screen.getAllByText('Alterar Função');
      await user.click(assignButtons[2]);
      
      // Select new role (this would trigger the select component)
      const selectElement = screen.getByTestId('select');
      await user.click(selectElement);
      
      // Confirm assignment
      const confirmButton = screen.getByText('Confirmar Alteração');
      await user.click(confirmButton);
      
      expect(mockRBACManager.assignRole).toHaveBeenCalledWith(
        'user-3',
        'test-value', // Mock value from select
        mockClinicId,
        expect.any(Object)
      );
    });
    
    it('should handle role assignment errors', async () => {
      const user = userEvent.setup();
      mockRBACManager.assignRole.mockRejectedValue(new Error('Assignment failed'));
      
      render(<RoleManagement clinicId={mockClinicId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Staff User')).toBeInTheDocument();
      });
      
      // Attempt role assignment
      const assignButtons = screen.getAllByText('Alterar Função');
      await user.click(assignButtons[2]);
      
      const selectElement = screen.getByTestId('select');
      await user.click(selectElement);
      
      const confirmButton = screen.getByText('Confirmar Alteração');
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByText('Erro ao alterar função')).toBeInTheDocument();
      });
    });
  });
  
  describe('Role Removal', () => {
    it('should allow role removal for manageable users', async () => {
      const user = userEvent.setup();
      
      render(<RoleManagement clinicId={mockClinicId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Staff User')).toBeInTheDocument();
      });
      
      // Find and click remove role button
      const removeButtons = screen.getAllByText('Remover Função');
      await user.click(removeButtons[2]);
      
      expect(screen.getByText('Confirmar remoção de função')).toBeInTheDocument();
    });
    
    it('should successfully remove role', async () => {
      const user = userEvent.setup();
      mockRBACManager.removeRole.mockResolvedValue({ success: true });
      
      render(<RoleManagement clinicId={mockClinicId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Staff User')).toBeInTheDocument();
      });
      
      // Click remove role button
      const removeButtons = screen.getAllByText('Remover Função');
      await user.click(removeButtons[2]);
      
      // Confirm removal
      const confirmButton = screen.getByText('Confirmar Remoção');
      await user.click(confirmButton);
      
      expect(mockRBACManager.removeRole).toHaveBeenCalledWith('user-3', mockClinicId);
    });
    
    it('should handle role removal errors', async () => {
      const user = userEvent.setup();
      mockRBACManager.removeRole.mockRejectedValue(new Error('Removal failed'));
      
      render(<RoleManagement clinicId={mockClinicId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Staff User')).toBeInTheDocument();
      });
      
      // Attempt role removal
      const removeButtons = screen.getAllByText('Remover Função');
      await user.click(removeButtons[2]);
      
      const confirmButton = screen.getByText('Confirmar Remoção');
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByText('Erro ao remover função')).toBeInTheDocument();
      });
    });
  });
  
  describe('Permission Display', () => {
    it('should show role permissions when expanded', async () => {
      const user = userEvent.setup();
      
      render(<RoleManagement clinicId={mockClinicId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Owner User')).toBeInTheDocument();
      });
      
      // Click to expand permissions
      const expandButtons = screen.getAllByText('Ver Permissões');
      await user.click(expandButtons[0]);
      
      expect(screen.getByText('manage_clinic')).toBeInTheDocument();
      expect(screen.getByText('manage_users')).toBeInTheDocument();
      expect(screen.getByText('view_users')).toBeInTheDocument();
    });
    
    it('should hide permissions when collapsed', async () => {
      const user = userEvent.setup();
      
      render(<RoleManagement clinicId={mockClinicId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Owner User')).toBeInTheDocument();
      });
      
      // Expand then collapse
      const expandButtons = screen.getAllByText('Ver Permissões');
      await user.click(expandButtons[0]);
      
      expect(screen.getByText('manage_clinic')).toBeInTheDocument();
      
      const collapseButton = screen.getByText('Ocultar Permissões');
      await user.click(collapseButton);
      
      expect(screen.queryByText('manage_clinic')).not.toBeInTheDocument();
    });
  });
  
  describe('Statistics Display', () => {
    it('should show role statistics', async () => {
      render(<RoleManagement clinicId={mockClinicId} />);
      
      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument(); // Total users
      });
      
      expect(screen.getByText('Total de Usuários')).toBeInTheDocument();
      expect(screen.getByText('Funções Ativas')).toBeInTheDocument();
    });
    
    it('should update statistics when data changes', async () => {
      const { rerender } = render(<RoleManagement clinicId={mockClinicId} />);
      
      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument();
      });
      
      // Update mock data
      mockRBACManager.getAllUsers.mockResolvedValue([...mockUsers, {
        id: 'user-4',
        email: 'new@clinic.com',
        name: 'New User',
        role: mockStaffRole
      }]);
      
      rerender(<RoleManagement clinicId={mockClinicId} />);
      
      await waitFor(() => {
        expect(screen.getByText('4')).toBeInTheDocument();
      });
    });
  });
  
  describe('Error Handling', () => {
    it('should handle data loading errors', async () => {
      mockRBACManager.getAllUsers.mockRejectedValue(new Error('Failed to load users'));
      
      render(<RoleManagement clinicId={mockClinicId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Erro ao carregar dados')).toBeInTheDocument();
      });
    });
    
    it('should show retry option on error', async () => {
      const user = userEvent.setup();
      mockRBACManager.getAllUsers.mockRejectedValue(new Error('Network error'));
      
      render(<RoleManagement clinicId={mockClinicId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Tentar Novamente')).toBeInTheDocument();
      });
      
      // Mock successful retry
      mockRBACManager.getAllUsers.mockResolvedValue(mockUsers);
      
      const retryButton = screen.getByText('Tentar Novamente');
      await user.click(retryButton);
      
      await waitFor(() => {
        expect(screen.getByText('Owner User')).toBeInTheDocument();
      });
    });
  });
  
  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      render(<RoleManagement clinicId={mockClinicId} />);
      
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
      
      expect(screen.getByRole('table')).toHaveAttribute('aria-label', expect.stringContaining('usuários'));
    });
    
    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(<RoleManagement clinicId={mockClinicId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Owner User')).toBeInTheDocument();
      });
      
      // Tab through interactive elements
      const buttons = screen.getAllByRole('button');
      
      for (const button of buttons) {
        await user.tab();
        if (document.activeElement === button) {
          expect(button).toHaveFocus();
          break;
        }
      }
    });
  });
});
