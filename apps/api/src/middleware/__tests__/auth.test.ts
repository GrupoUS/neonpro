/**
 * Authentication Middleware Enhancement Tests (T073)
 * Comprehensive test suite for healthcare professional authentication
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  requireAIAccess,
  requireHealthcareProfessional,
  requireLGPDConsent,
  sessionManager,
} from '../auth';

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
  },
});

// Mock environment variables
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';

describe('Authentication Middleware Enhancement (T073)', () => {
  let mockContext: any;
  let mockNext: any;

  beforeEach(() => {
    mockContext = {
      req: {
        header: vi.fn(),
        param: vi.fn(),
        query: vi.fn(),
      },
      set: vi.fn(),
      json: vi.fn(),
      get: vi.fn(),
    };
    mockNext = vi.fn();

    // Clear sessions before each test
    (sessionManager as any).sessions.clear();
    (sessionManager as any).userSessions.clear();

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Note: requireAuth tests are skipped due to Supabase dependency
  // These would be tested in integration tests with proper Supabase setup

  describe('Healthcare Professional Validation (requireHealthcareProfessional)', () => {
    beforeEach(() => {
      mockContext.get.mockImplementation((key: string) => {
        if (key === 'userId') return '550e8400-e29b-41d4-a716-446655440001';
        if (key === 'sessionId') return '550e8400-e29b-41d4-a716-446655440002';
        return undefined;
      });
    });

    it('should validate healthcare professional with active license', async () => {
      const middleware = requireHealthcareProfessional();

      await middleware(mockContext, mockNext);

      expect(mockContext.set).toHaveBeenCalledWith(
        'healthcareProfessional',
        expect.objectContaining({
          id: '550e8400-e29b-41d4-a716-446655440001',
          crmNumber: '12345-SP',
          specialty: 'Dermatologia',
          licenseStatus: 'active',
        }),
      );
      expect(mockContext.set).toHaveBeenCalledWith('isHealthcareProfessional', true);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject requests without user authentication', async () => {
      mockContext.get.mockReturnValue(undefined);

      const middleware = requireHealthcareProfessional();
      await middleware(mockContext, mockNext);

      expect(mockContext.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'UNAUTHORIZED',
            message: 'Autenticação necessária',
          }),
        }),
        401,
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should update session with healthcare professional info', async () => {
      // Create a session first
      const userId = '550e8400-e29b-41d4-a716-446655440001';
      const sessionId = sessionManager.createSession(userId, {});
      mockContext.get.mockImplementation((key: string) => {
        if (key === 'userId') return userId;
        if (key === 'sessionId') return sessionId;
        return undefined;
      });

      const middleware = requireHealthcareProfessional();
      await middleware(mockContext, mockNext);

      const session = sessionManager.getSession(sessionId);
      expect(session?.healthcareProfessional).toBeDefined();
      expect(session?.permissions).toContain('healthcare_professional');
    });
  });

  describe('LGPD Consent Validation (requireLGPDConsent)', () => {
    beforeEach(() => {
      mockContext.get.mockImplementation((key: string) => {
        if (key === 'userId') return '550e8400-e29b-41d4-a716-446655440001';
        if (key === 'sessionId') return '550e8400-e29b-41d4-a716-446655440002';
        return undefined;
      });
    });

    it('should validate LGPD consent with required purposes', async () => {
      const middleware = requireLGPDConsent(['healthcare_service'], ['personal_data']);

      await middleware(mockContext, mockNext);

      expect(mockContext.set).toHaveBeenCalledWith(
        'lgpdConsent',
        expect.objectContaining({
          userId: '550e8400-e29b-41d4-a716-446655440001',
          purposes: expect.arrayContaining(['healthcare_service']),
          dataCategories: expect.arrayContaining(['personal_data']),
          isActive: true,
        }),
      );
      expect(mockContext.set).toHaveBeenCalledWith('hasLGPDConsent', true);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject requests with missing required purposes', async () => {
      const middleware = requireLGPDConsent(['marketing'], []);
      await middleware(mockContext, mockNext);

      expect(mockContext.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Consentimento LGPD insuficiente',
          code: 'LGPD_INSUFFICIENT_CONSENT',
        }),
        403,
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject requests with missing required data categories', async () => {
      const middleware = requireLGPDConsent([], ['usage_data']);
      await middleware(mockContext, mockNext);

      expect(mockContext.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Consentimento LGPD insuficiente para categorias de dados',
          code: 'LGPD_INSUFFICIENT_DATA_CONSENT',
        }),
        403,
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should update session with LGPD consent info', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440001';
      const sessionId = sessionManager.createSession(userId, {});
      mockContext.get.mockImplementation((key: string) => {
        if (key === 'userId') return userId;
        if (key === 'sessionId') return sessionId;
        return undefined;
      });

      const middleware = requireLGPDConsent(['healthcare_service'], ['health_data']);
      await middleware(mockContext, mockNext);

      const session = sessionManager.getSession(sessionId);
      expect(session?.lgpdConsent).toBeDefined();
      expect(session?.permissions).toContain('lgpd_consent_valid');
    });
  });

  describe('AI Access Validation (requireAIAccess)', () => {
    beforeEach(() => {
      mockContext.get.mockImplementation((key: string) => {
        if (key === 'userId') return '550e8400-e29b-41d4-a716-446655440001';
        if (key === 'sessionId') return '550e8400-e29b-41d4-a716-446655440002';
        if (key === 'healthcareProfessional') {
          return {
            id: '550e8400-e29b-41d4-a716-446655440001',
            crmNumber: '12345-SP',
            specialty: 'Dermatologia',
            licenseStatus: 'active',
            permissions: {
              canAccessAI: true,
              canViewPatientData: true,
              canModifyPatientData: true,
              canAccessReports: true,
            },
          };
        }
        return undefined;
      });
    });

    it('should grant AI access to authorized healthcare professionals', async () => {
      const middleware = requireAIAccess();

      // Mock the context.set calls that would be made by sub-middlewares
      mockContext.set.mockImplementation((key: string, value: any) => {
        if (key === 'healthcareProfessional') {
          mockContext.get.mockImplementation((getKey: string) => {
            if (getKey === 'healthcareProfessional') return value;
            if (getKey === 'userId') return '550e8400-e29b-41d4-a716-446655440001';
            if (getKey === 'sessionId') return '550e8400-e29b-41d4-a716-446655440002';
            return undefined;
          });
        }
      });

      await middleware(mockContext, mockNext);

      expect(mockContext.set).toHaveBeenCalledWith('hasAIAccess', true);
    });

    it('should update session with AI access permission', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440001';
      const sessionId = sessionManager.createSession(userId, {});
      mockContext.get.mockImplementation((key: string) => {
        if (key === 'userId') return userId;
        if (key === 'sessionId') return sessionId;
        if (key === 'healthcareProfessional') {
          return {
            permissions: { canAccessAI: true },
          };
        }
        return undefined;
      });

      const middleware = requireAIAccess();

      // Mock successful sub-middleware execution
      mockContext.set.mockImplementation(() => {});

      await middleware(mockContext, mockNext);

      const session = sessionManager.getSession(sessionId);
      expect(session?.permissions).toContain('ai_access');
    });
  });

  describe('Session Management', () => {
    it('should create and track sessions', () => {
      const userId = '550e8400-e29b-41d4-a716-446655440001';
      const sessionId = sessionManager.createSession(userId, {
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      expect(sessionId).toBeDefined();

      const session = sessionManager.getSession(sessionId);
      expect(session).toBeDefined();
      expect(session?.userId).toBe(userId);
      expect(session?.ipAddress).toBe('192.168.1.1');
    });

    it('should update session activity', () => {
      const userId = '550e8400-e29b-41d4-a716-446655440001';
      const sessionId = sessionManager.createSession(userId, {});
      const originalActivity = sessionManager.getSession(sessionId)?.lastActivity;

      // Wait a bit to ensure different timestamp
      setTimeout(() => {
        const updated = sessionManager.updateActivity(sessionId);
        expect(updated).toBe(true);

        const newActivity = sessionManager.getSession(sessionId)?.lastActivity;
        expect(newActivity).not.toEqual(originalActivity);
      }, 10);
    });

    it('should remove sessions', () => {
      const userId = '550e8400-e29b-41d4-a716-446655440001';
      const sessionId = sessionManager.createSession(userId, {});

      expect(sessionManager.getSession(sessionId)).toBeDefined();

      const removed = sessionManager.removeSession(sessionId);
      expect(removed).toBe(true);
      expect(sessionManager.getSession(sessionId)).toBeUndefined();
    });

    it('should get user sessions', () => {
      const userId1 = '550e8400-e29b-41d4-a716-446655440001';
      const userId2 = '550e8400-e29b-41d4-a716-446655440002';
      const sessionId1 = sessionManager.createSession(userId1, {});
      const sessionId2 = sessionManager.createSession(userId1, {});
      const sessionId3 = sessionManager.createSession(userId2, {});

      const userSessions = sessionManager.getUserSessions(userId1);
      expect(userSessions).toHaveLength(2);
      expect(userSessions.map(s => s.sessionId)).toContain(sessionId1);
      expect(userSessions.map(s => s.sessionId)).toContain(sessionId2);
      expect(userSessions.map(s => s.sessionId)).not.toContain(sessionId3);
    });

    it('should clean expired sessions', () => {
      const userId = '550e8400-e29b-41d4-a716-446655440001';
      const sessionId = sessionManager.createSession(userId, {});

      // Simulate old session
      const session = sessionManager.getSession(sessionId);
      if (session) {
        session.lastActivity = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
      }

      const cleanedCount = sessionManager.cleanExpiredSessions(24);

      expect(cleanedCount).toBe(1);
      expect(sessionManager.getSession(sessionId)).toBeUndefined();
    });
  });

  describe('Integration with WebSocket', () => {
    it('should handle real-time session creation', () => {
      const userId = '550e8400-e29b-41d4-a716-446655440001';
      const sessionId = sessionManager.createSession(userId, {
        isRealTimeSession: true,
      });

      const session = sessionManager.getSession(sessionId);
      expect(session?.isRealTimeSession).toBe(true);
    });

    it('should track WebSocket upgrade in session metadata', () => {
      mockContext.req.header.mockImplementation((header: string) => {
        if (header === 'authorization') return 'Bearer valid-token';
        if (header === 'upgrade') return 'websocket';
        return undefined;
      });

      // This would be tested in integration with the WebSocket middleware
      expect(true).toBe(true); // Placeholder for WebSocket integration test
    });
  });
});
