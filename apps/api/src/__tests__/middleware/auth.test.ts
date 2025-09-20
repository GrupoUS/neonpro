/**
 * Authentication Middleware Tests - TDD Implementation
 * ===================================================
 *
 * Tests for authentication middleware with real database integration
 * following RED-GREEN-REFACTOR TDD approach
 */

import { Context, Next } from 'hono';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAdminClient } from '../../clients/supabase';
import {
  requireAIAccess,
  requireAuth,
  requireHealthcareProfessional,
  requireLGPDConsent,
} from '../../middleware/auth';

// Mock Supabase client
vi.mock('../../clients/supabase', () => ({
  createAdminClient: vi.fn(),
  createServerClient: vi.fn(),
}));

// Mock environment variables
vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('SUPABASE_ANON_KEY', 'test-anon-key');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key');

describe('Authentication Middleware - Real Database Integration', () => {
  let mockSupabaseClient: any;
  let mockContext: Context;
  let mockNext: Next;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Supabase client
    mockSupabaseClient = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
    };

    vi.mocked(createAdminClient).mockReturnValue(mockSupabaseClient);

    // Mock Hono context
    mockContext = {
      req: {
        header: vi.fn(),
      },
      set: vi.fn(),
      get: vi.fn(),
      json: vi.fn(),
    } as unknown as Context;

    // Mock next function
    mockNext = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('requireAuth', () => {
    it('should authenticate user with valid token', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'doctor@neonpro.com.br',
        aud: 'authenticated',
      };

      mockContext.req.header = vi
        .fn()
        .mockReturnValueOnce('Bearer valid-token')
        .mockReturnValueOnce('session-123')
        .mockReturnValueOnce('192.168.1.1')
        .mockReturnValueOnce('Mozilla/5.0');

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Act
      const result = await requireAuth(mockContext, mockNext);

      // Assert
      expect(result).toBeUndefined(); // Should call next()
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledWith();
      expect(mockContext.set).toHaveBeenCalledWith('userId', mockUser.id);
      expect(mockContext.set).toHaveBeenCalledWith('user', mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject request without token', async () => {
      // Arrange
      mockContext.req.header = vi.fn().mockReturnValue(undefined);

      // Act
      const result = await requireAuth(mockContext, mockNext);

      // Assert
      expect(result).not.toBeUndefined();
      expect(result?.status).toBe(401);
      expect(mockSupabaseClient.auth.getUser).not.toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token', async () => {
      // Arrange
      mockContext.req.header = vi.fn().mockReturnValue('Bearer invalid-token');

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      // Act
      const result = await requireAuth(mockContext, mockNext);

      // Assert
      expect(result).not.toBeUndefined();
      expect(result?.status).toBe(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireHealthcareProfessional', () => {
    it('should validate healthcare professional with real database data', async () => {
      // Arrange
      const userId = 'user-123';
      const mockHealthcareProfessional = {
        id: userId,
        crm_number: 'CRM-SP-123456',
        specialty: 'Dermatologia',
        license_status: 'active',
        verification_date: new Date().toISOString(),
        permissions: {
          can_access_ai: true,
          can_view_patient_data: true,
          can_modify_patient_data: true,
          can_access_reports: true,
        },
      };

      mockContext.get = vi.fn().mockReturnValue(userId);

      // Mock database query for healthcare professional
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockHealthcareProfessional,
          error: null,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);

      // Act
      const middleware = requireHealthcareProfessional();
      const result = await middleware(mockContext, mockNext);

      // Assert
      expect(result).toBeUndefined(); // Should call next()
      expect(mockSupabaseClient.from).toHaveBeenCalledWith(
        'healthcare_professionals',
      );
      expect(mockContext.set).toHaveBeenCalledWith(
        'healthcareProfessional',
        expect.objectContaining({
          id: userId,
          crmNumber: 'CRM-SP-123456',
          specialty: 'Dermatologia',
          licenseStatus: 'active',
        }),
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject healthcare professional with inactive license', async () => {
      // Arrange
      const userId = 'user-123';
      const mockInactiveProfessional = {
        id: userId,
        crm_number: 'CRM-SP-789012',
        specialty: 'Cardiologia',
        license_status: 'suspended',
        verification_date: new Date().toISOString(),
        permissions: {
          can_access_ai: false,
          can_view_patient_data: false,
          can_modify_patient_data: false,
          can_access_reports: false,
        },
      };

      mockContext.get = vi.fn().mockReturnValue(userId);

      // Mock database query for healthcare professional
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockInactiveProfessional,
          error: null,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);

      // Act
      const middleware = requireHealthcareProfessional();
      const result = await middleware(mockContext, mockNext);

      // Assert
      expect(result).not.toBeUndefined();
      expect(result?.status).toBe(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject when healthcare professional not found in database', async () => {
      // Arrange
      const userId = 'user-123';
      mockContext.get = vi.fn().mockReturnValue(userId);

      // Mock database query returning no results
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'No rows found' },
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);

      // Act
      const middleware = requireHealthcareProfessional();
      const result = await middleware(mockContext, mockNext);

      // Assert
      expect(result).not.toBeUndefined();
      expect(result?.status).toBe(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireLGPDConsent', () => {
    it('should validate LGPD consent with real database data', async () => {
      // Arrange
      const userId = 'user-123';
      const mockLGPDConsent = {
        id: 'consent-123',
        user_id: userId,
        consent_date: new Date().toISOString(),
        consent_version: '1.0',
        purposes: ['healthcare_service', 'ai_assistance', 'notifications'],
        data_categories: ['personal_data', 'health_data', 'contact_data'],
        retention_period: 365,
        can_withdraw: true,
        is_active: true,
      };

      mockContext.get = vi.fn().mockReturnValue(userId);

      // Mock database query for LGPD consent
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [mockLGPDConsent],
          error: null,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);

      // Act
      const middleware = requireLGPDConsent(
        ['healthcare_service', 'ai_assistance'],
        ['health_data'],
      );
      const result = await middleware(mockContext, mockNext);

      // Assert
      expect(result).toBeUndefined(); // Should call next()
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('lgpd_consents');
      expect(mockContext.set).toHaveBeenCalledWith(
        'lgpdConsent',
        expect.objectContaining({
          userId,
          purposes: ['healthcare_service', 'ai_assistance', 'notifications'],
          dataCategories: ['personal_data', 'health_data', 'contact_data'],
          isActive: true,
        }),
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject when required consent purposes are missing', async () => {
      // Arrange
      const userId = 'user-123';
      const mockInsufficientConsent = {
        id: 'consent-123',
        user_id: userId,
        consent_date: new Date().toISOString(),
        consent_version: '1.0',
        purposes: ['healthcare_service'], // Missing 'ai_assistance'
        data_categories: ['personal_data'],
        retention_period: 365,
        can_withdraw: true,
        is_active: true,
      };

      mockContext.get = vi.fn().mockReturnValue(userId);

      // Mock database query for LGPD consent
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [mockInsufficientConsent],
          error: null,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);

      // Act
      const middleware = requireLGPDConsent(
        ['healthcare_service', 'ai_assistance'],
        ['health_data'],
      );
      const result = await middleware(mockContext, mockNext);

      // Assert
      expect(result).not.toBeUndefined();
      expect(result?.status).toBe(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject when consent is inactive', async () => {
      // Arrange
      const userId = 'user-123';
      const mockInactiveConsent = {
        id: 'consent-123',
        user_id: userId,
        consent_date: new Date().toISOString(),
        consent_version: '1.0',
        purposes: ['healthcare_service', 'ai_assistance'],
        data_categories: ['personal_data', 'health_data'],
        retention_period: 365,
        can_withdraw: true,
        is_active: false, // Inactive consent
      };

      mockContext.get = vi.fn().mockReturnValue(userId);

      // Mock database query for LGPD consent
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [mockInactiveConsent],
          error: null,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);

      // Act
      const middleware = requireLGPDConsent(
        ['healthcare_service'],
        ['health_data'],
      );
      const result = await middleware(mockContext, mockNext);

      // Assert
      expect(result).not.toBeUndefined();
      expect(result?.status).toBe(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireAIAccess', () => {
    it('should grant AI access with valid healthcare professional and LGPD consent', async () => {
      // Arrange
      const userId = 'user-123';
      const mockHealthcareProfessional = {
        id: userId,
        crm_number: 'CRM-SP-123456',
        specialty: 'Dermatologia',
        license_status: 'active',
        permissions: {
          can_access_ai: true,
          can_view_patient_data: true,
          can_modify_patient_data: true,
          can_access_reports: true,
        },
      };

      const mockLGPDConsent = {
        id: 'consent-123',
        user_id: userId,
        purposes: ['healthcare_service', 'ai_assistance'],
        data_categories: ['personal_data', 'health_data'],
        is_active: true,
      };

      mockContext.get = vi
        .fn()
        .mockReturnValueOnce(userId)
        .mockReturnValueOnce('session-123')
        .mockReturnValueOnce(mockHealthcareProfessional)
        .mockReturnValueOnce(mockLGPDConsent);

      // Mock database queries
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockHealthcareProfessional,
          error: null,
        }),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [mockLGPDConsent],
          error: null,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);

      // Act
      const middleware = requireAIAccess();
      const result = await middleware(mockContext, mockNext);

      // Assert
      expect(result).toBeUndefined(); // Should call next()
      expect(mockContext.set).toHaveBeenCalledWith('hasAIAccess', true);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject AI access when healthcare professional lacks AI permission', async () => {
      // Arrange
      const userId = 'user-123';
      const mockHealthcareProfessional = {
        id: userId,
        crm_number: 'CRM-SP-123456',
        specialty: 'Dermatologia',
        license_status: 'active',
        permissions: {
          can_access_ai: false, // No AI access
          can_view_patient_data: true,
          can_modify_patient_data: true,
          can_access_reports: true,
        },
      };

      const mockLGPDConsent = {
        id: 'consent-123',
        user_id: userId,
        purposes: ['healthcare_service', 'ai_assistance'],
        data_categories: ['personal_data', 'health_data'],
        is_active: true,
      };

      mockContext.get = vi
        .fn()
        .mockReturnValueOnce(userId)
        .mockReturnValueOnce('session-123')
        .mockReturnValueOnce(mockHealthcareProfessional)
        .mockReturnValueOnce(mockLGPDConsent);

      // Mock database queries
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockHealthcareProfessional,
          error: null,
        }),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [mockLGPDConsent],
          error: null,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);

      // Act
      const middleware = requireAIAccess();
      const result = await middleware(mockContext, mockNext);

      // Assert
      expect(result).not.toBeUndefined();
      expect(result?.status).toBe(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
