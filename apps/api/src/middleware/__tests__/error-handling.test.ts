/**
 * Error Handling and Logging Middleware Tests (T076)
 * Comprehensive test suite for healthcare-specific error handling
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type ErrorContext, errorHandler, errorHandling } from '../error-handling';

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
  },
});

describe('Error Handling and Logging Middleware (T076)', () => {
  let mockContext: any;
  let mockNext: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    mockContext = {
      req: {
        header: vi.fn(),
        param: vi.fn(),
        query: vi.fn(),
        url: 'https://api.example.com/test',
        method: 'GET',
      },
      set: vi.fn(),
      json: vi.fn(),
      get: vi.fn(),
    };
    mockNext = vi.fn();

    // Mock console.error to capture logs
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  describe('Error Handler', () => {
    it('should handle authentication errors with Brazilian Portuguese messages', async () => {
      const error = new Error('Authentication failed');
      const context: ErrorContext = {
        requestId: 'req-123',
        userId: 'user-456',
        endpoint: '/api/patients',
        method: 'GET',
        userAgent: 'Test Agent',
        ipAddress: '192.168.1.1',
      };

      const result = await errorHandler.handleError(error, context);

      expect(result.status).toBe(401);
      expect(result.response.success).toBe(false);
      expect(result.response.error).toBe('Erro de autenticação');
      expect(result.response.code).toBe('AUTHENTICATION_ERROR');
      expect(result.response.requestId).toBe('req-123');
    });

    it('should handle LGPD compliance errors', async () => {
      const error = new Error('LGPD consent required');
      error.name = 'LGPDError';

      const context: ErrorContext = {
        requestId: 'req-124',
        endpoint: '/api/patient-data',
        method: 'GET',
      };

      const result = await errorHandler.handleError(error, context);

      expect(result.status).toBe(403);
      expect(result.response.error).toBe('Consentimento LGPD necessário');
      expect(result.response.code).toBe('LGPD_CONSENT_REQUIRED');
    });

    it('should handle healthcare compliance errors', async () => {
      const error = new Error('Invalid CRM number');
      error.name = 'HealthcareComplianceError';

      const context: ErrorContext = {
        requestId: 'req-125',
        endpoint: '/api/healthcare-professional',
        method: 'POST',
      };

      const result = await errorHandler.handleError(error, context);

      expect(result.status).toBe(400);
      expect(result.response.error).toBe('Erro de conformidade médica');
      expect(result.response.code).toBe('HEALTHCARE_COMPLIANCE_ERROR');
    });

    it('should handle AI service errors', async () => {
      const error = new Error('AI model unavailable');
      error.name = 'AIServiceError';

      const context: ErrorContext = {
        requestId: 'req-126',
        endpoint: '/api/ai/chat',
        method: 'POST',
      };

      const result = await errorHandler.handleError(error, context);

      expect(result.status).toBe(503);
      expect(result.response.error).toBe('Serviço de IA temporariamente indisponível');
      expect(result.response.code).toBe('AI_SERVICE_UNAVAILABLE');
    });

    it('should handle validation errors with field details', async () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      (error as any).issues = [
        { path: ['cpf'], message: 'CPF inválido' },
        { path: ['email'], message: 'Email obrigatório' },
      ];

      const context: ErrorContext = {
        requestId: 'req-127',
        endpoint: '/api/patients',
        method: 'POST',
      };

      const result = await errorHandler.handleError(error, context);

      expect(result.status).toBe(400);
      expect(result.response.error).toBe('Dados inválidos');
      expect(result.response.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      const error = new Error('Connection timeout');
      error.name = 'DatabaseError';

      const context: ErrorContext = {
        requestId: 'req-128',
        endpoint: '/api/patients',
        method: 'GET',
      };

      const result = await errorHandler.handleError(error, context);

      expect(result.status).toBe(500);
      expect(result.response.error).toBe('Erro interno do servidor');
      expect(result.response.code).toBe('DATABASE_ERROR');
    });

    it('should handle generic errors with fallback messages', async () => {
      const error = new Error('Unknown error');

      const context: ErrorContext = {
        requestId: 'req-129',
        endpoint: '/api/unknown',
        method: 'GET',
      };

      const result = await errorHandler.handleError(error, context);

      expect(result.status).toBe(500);
      expect(result.response.error).toBe('Erro interno do servidor');
      expect(result.response.code).toBe('INTERNAL_ERROR');
    });

    it('should log errors with appropriate severity levels', async () => {
      const criticalError = new Error('Database connection lost');
      criticalError.name = 'DatabaseError';

      const context: ErrorContext = {
        requestId: 'req-130',
        endpoint: '/api/critical',
        method: 'GET',
      };

      await errorHandler.handleError(criticalError, context);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[CRITICAL]'),
        expect.objectContaining({
          error: 'Database connection lost',
          requestId: 'req-130',
        }),
      );
    });

    it('should not expose sensitive information in error responses', async () => {
      const error = new Error('Database password incorrect for user admin');
      error.name = 'DatabaseError';

      const context: ErrorContext = {
        requestId: 'req-131',
        endpoint: '/api/sensitive',
        method: 'GET',
      };

      const result = await errorHandler.handleError(error, context);

      expect(result.response.error).toBe('Erro interno do servidor');
      expect(result.response.error).not.toContain('password');
      expect(result.response.error).not.toContain('admin');
    });

    it('should include request context in error logs', async () => {
      const error = new Error('Test error');

      const context: ErrorContext = {
        requestId: 'req-132',
        userId: 'user-789',
        endpoint: '/api/test',
        method: 'POST',
        userAgent: 'Mozilla/5.0',
        ipAddress: '10.0.0.1',
        healthcareProfessional: {
          id: 'hp-123',
          crmNumber: '12345-SP',
        },
      };

      await errorHandler.handleError(error, context);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          requestId: 'req-132',
          userId: 'user-789',
          endpoint: '/api/test',
          method: 'POST',
          userAgent: 'Mozilla/5.0',
          ipAddress: '10.0.0.1',
          healthcareProfessional: expect.objectContaining({
            crmNumber: '12345-SP',
          }),
        }),
      );
    });
  });

  describe('Error Handling Middleware', () => {
    it('should catch and handle thrown errors', async () => {
      const middleware = errorHandling();
      const testError = new Error('Middleware test error');

      mockNext.mockImplementation(() => {
        throw testError;
      });

      mockContext.get.mockImplementation((key: string) => {
        if (key === 'requestId') return 'req-middleware-1';
        return undefined;
      });

      await middleware(mockContext, mockNext);

      expect(mockContext.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Erro interno do servidor',
          code: 'INTERNAL_ERROR',
          requestId: 'req-middleware-1',
        }),
        500,
      );
    });

    it('should pass through successful requests', async () => {
      const middleware = errorHandling();
      mockNext.mockImplementation(() => Promise.resolve());

      await middleware(mockContext, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockContext.json).not.toHaveBeenCalled();
    });

    it('should handle async errors', async () => {
      const middleware = errorHandling();
      const asyncError = new Error('Async error');

      mockNext.mockImplementation(async () => {
        throw asyncError;
      });

      mockContext.get.mockImplementation((key: string) => {
        if (key === 'requestId') return 'req-async-1';
        return undefined;
      });

      await middleware(mockContext, mockNext);

      expect(mockContext.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Erro interno do servidor',
          requestId: 'req-async-1',
        }),
        500,
      );
    });

    it('should extract request context from Hono context', async () => {
      const middleware = errorHandling();
      const testError = new Error('Context test error');

      mockNext.mockImplementation(() => {
        throw testError;
      });

      mockContext.req.header.mockImplementation((header: string) => {
        if (header === 'user-agent') return 'Test Browser';
        if (header === 'x-forwarded-for') return '203.0.113.1';
        return undefined;
      });

      mockContext.get.mockImplementation((key: string) => {
        if (key === 'requestId') return 'req-context-1';
        if (key === 'userId') return 'user-context-1';
        if (key === 'healthcareProfessional') return { id: 'hp-context-1', crmNumber: '54321-RJ' };
        return undefined;
      });

      await middleware(mockContext, mockNext);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          requestId: 'req-context-1',
          userId: 'user-context-1',
          userAgent: 'Test Browser',
          ipAddress: '203.0.113.1',
          healthcareProfessional: expect.objectContaining({
            crmNumber: '54321-RJ',
          }),
        }),
      );
    });
  });
});
