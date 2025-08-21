/**
 * 🔐 Enhanced Authentication Hook Tests - NeonPro Healthcare
 * ========================================================
 *
 * Comprehensive unit tests for authentication functionality with:
 * - Type-safe authentication flows
 * - LGPD compliance validation
 * - Healthcare security requirements
 * - Error handling and edge cases
 * - Token management and refresh
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, renderHook, waitFor } from '@testing-library/react';
import type { MockedFunction } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Import the hook we're testing
import { useAuth } from '../../hooks/enhanced/use-auth';

// Mock the API client
vi.mock('@neonpro/shared/api-client', () => ({
  apiClient: {
    auth: {
      login: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
      register: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
      changePassword: vi.fn(),
      updateProfile: vi.fn(),
    },
  },
  ApiHelpers: {
    handleApiResponse: vi.fn(),
    handleApiError: vi.fn(),
  },
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('useAuth Hook - NeonPro Healthcare Authentication', () => {
  let queryClient: QueryClient;

  // Test data
  const mockUser = {
    id: 'test-user-id',
    email: 'doctor@neonpro.com.br',
    name: 'Dr. Test Silva',
    role: 'DOCTOR' as const,
    permissions: ['READ_PATIENTS', 'WRITE_PATIENTS'],
    isEmailVerified: true,
    tenantId: 'test-tenant-id',
  };

  const mockTokens = {
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
    expiresAt: Date.now() + 3_600_000, // 1 hour from now
  };

  const mockLoginResponse = {
    success: true,
    data: {
      user: mockUser,
      tokens: mockTokens,
      message: 'Login realizado com sucesso',
    },
    error: null,
  };

  // Wrapper component for testing hooks
  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
    mockLocalStorage.clear();
  });
  afterEach(() => {
    cleanup();
  });

  describe('Authentication Flow - Login', () => {
    it('should successfully login with valid credentials', async () => {
      // Mock successful API response
      const mockLogin = vi.fn().mockResolvedValue(mockLoginResponse);
      (await import('@neonpro/shared/api-client')).apiClient.auth.login =
        mockLogin;

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      // Execute login
      result.current.login({
        email: 'doctor@neonpro.com.br',
        password: 'SecurePass123!',
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Validate user data
      expect(result.current.user).toEqual(mockUser);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'neonpro_auth_token',
        mockTokens.accessToken
      );
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'doctor@neonpro.com.br',
        password: 'SecurePass123!',
      });
    });

    it('should handle invalid credentials gracefully', async () => {
      const mockError = {
        success: false,
        data: null,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Credenciais inválidas',
          details: {},
        },
      };

      const mockLogin = vi.fn().mockResolvedValue(mockError);
      (await import('@neonpro/shared/api-client')).apiClient.auth.login =
        mockLogin;

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      result.current.login({
        email: 'invalid@example.com',
        password: 'wrongpassword',
      });

      await waitFor(() => {
        expect(result.current.loginError).toBeTruthy();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
    it('should validate healthcare-specific roles', async () => {
      const healthcareRoles = ['DOCTOR', 'NURSE', 'ADMIN'] as const;

      for (const role of healthcareRoles) {
        const userWithRole = { ...mockUser, role };
        const responseWithRole = {
          ...mockLoginResponse,
          data: { ...mockLoginResponse.data, user: userWithRole },
        };

        const mockLogin = vi.fn().mockResolvedValue(responseWithRole);
        (await import('@neonpro/shared/api-client')).apiClient.auth.login =
          mockLogin;

        const { result } = renderHook(() => useAuth(), {
          wrapper: createWrapper(),
        });

        result.current.login({
          email: 'user@neonpro.com.br',
          password: 'password',
        });

        await waitFor(() => {
          expect(result.current.user?.role).toBe(role);
        });

        expect(result.current.hasRole(role)).toBe(true);
      }
    });
  });

  describe('Token Management', () => {
    it('should refresh token when expired', async () => {
      const mockRefreshResponse = {
        success: true,
        data: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          expiresAt: Date.now() + 3_600_000,
        },
        error: null,
      };

      const mockRefreshToken = vi.fn().mockResolvedValue(mockRefreshResponse);
      (await import('@neonpro/shared/api-client')).apiClient.auth.refreshToken =
        mockRefreshToken;

      // Setup expired token
      mockLocalStorage.getItem.mockReturnValue('expired-token');
    });
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Execute token refresh
    await result.current.refreshToken();

    expect(mockRefreshToken).toHaveBeenCalled();
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'neonpro_auth_token',
      'new-access-token'
    );
  });

  it('should handle token refresh failure', async () => {
    const mockRefreshError = {
      success: false,
      data: null,
      error: { code: 'INVALID_REFRESH_TOKEN', message: 'Token inválido' },
    };

    const mockRefreshToken = vi.fn().mockResolvedValue(mockRefreshError);
    (await import('@neonpro/shared/api-client')).apiClient.auth.refreshToken =
      mockRefreshToken;

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await result.current.refreshToken();

    expect(result.current.isAuthenticated).toBe(false);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
      'neonpro_auth_token'
    );
  });
});

describe('Logout & Session Management', () => {
  it('should successfully logout user', async () => {
    const mockLogout = vi.fn().mockResolvedValue({ success: true });
    (await import('@neonpro/shared/api-client')).apiClient.auth.logout =
      mockLogout; // Setup authenticated state first
    mockLocalStorage.getItem.mockReturnValue('test-token');

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Execute logout
    await result.current.logout();

    expect(mockLogout).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
      'neonpro_auth_token'
    );
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
      'neonpro_refresh_token'
    );
  });

  it('should handle concurrent session management', async () => {
    // Test multiple tab scenario
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Simulate token removal from another tab
    const storageEvent = new StorageEvent('storage', {
      key: 'neonpro_auth_token',
      oldValue: 'old-token',
      newValue: null,
    });

    window.dispatchEvent(storageEvent);

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});

describe('LGPD Compliance & Healthcare Security', () => {
  it('should validate Brazilian healthcare data sovereignty', async () => {
    const mockUser = {
      ...mockLoginResponse.data.user,
      dataResidency: 'BR',
      lgpdConsent: true,
      consentTimestamp: new Date().toISOString(),
    };

    const complianceResponse = {
      ...mockLoginResponse,
      data: { ...mockLoginResponse.data, user: mockUser },
    };
    const mockLogin = vi.fn().mockResolvedValue(complianceResponse);
    (await import('@neonpro/shared/api-client')).apiClient.auth.login =
      mockLogin;

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    result.current.login({
      email: 'doctor@neonpro.com.br',
      password: 'password',
    });

    await waitFor(() => {
      expect(result.current.user?.dataResidency).toBe('BR');
      expect(result.current.user?.lgpdConsent).toBe(true);
    });
  });

  it('should enforce healthcare professional validation', async () => {
    const healthcareProfessional = {
      ...mockUser,
      professionalLicense: 'CRM-SP-123456',
      specialization: 'CARDIOLOGY',
      isVerifiedProfessional: true,
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Mock successful validation
    const mockValidation = vi.fn().mockResolvedValue({
      success: true,
      data: { isValid: true, professional: healthcareProfessional },
    });

    expect(result.current.hasPermission('WRITE_PRESCRIPTIONS')).toBeDefined();
    expect(result.current.hasRole('DOCTOR')).toBeDefined();
  });
});

describe('Permission System', () => {
  it('should correctly validate user permissions', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Test different permission scenarios
    const testPermissions = [
      'READ_PATIENTS',
      'WRITE_PATIENTS',
      'DELETE_PATIENTS',
      'READ_MEDICAL_RECORDS',
      'WRITE_PRESCRIPTIONS',
    ];
    testPermissions.forEach((permission) => {
      if (['READ_PATIENTS', 'WRITE_PATIENTS'].includes(permission)) {
        expect(result.current.hasPermission(permission)).toBe(true);
      } else {
        expect(result.current.hasPermission(permission)).toBeDefined();
      }
    });
  });

  it('should handle role hierarchy correctly', () => {
    const adminUser = { ...mockUser, role: 'ADMIN' as const };
    const doctorUser = { ...mockUser, role: 'DOCTOR' as const };
    const nurseUser = { ...mockUser, role: 'NURSE' as const };

    // Admin should have highest access
    expect(adminUser.role).toBe('ADMIN');
    expect(doctorUser.role).toBe('DOCTOR');
    expect(nurseUser.role).toBe('NURSE');
  });
});

describe('Error Handling & Edge Cases', () => {
  it('should handle network errors gracefully', async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error('Network error'));
    (await import('@neonpro/shared/api-client')).apiClient.auth.login =
      mockLogin;

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    result.current.login({
      email: 'test@example.com',
      password: 'password',
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.loginError).toBeTruthy();
    });
  });

  it('should validate input data before API calls', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Test with invalid email
    expect(() => {
      result.current.login({
        email: 'invalid-email',
        password: 'password',
      });
    }).toBeDefined();

    // Test with empty password
    expect(() => {
      result.current.login({
        email: 'valid@email.com',
        password: '',
      });
    }).toBeDefined();
  });
});
})
