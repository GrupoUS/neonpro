/**
 * AI Provider Integrations Middleware Tests (T072)
 * Comprehensive test suite for multi-model AI provider management
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type AIModel,
  AIProvider,
  aiProviderManager,
  aiProviderSelection,
  aiRequestMetrics,
  healthcareContextInjection,
} from '../ai-providers';

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => '550e8400-e29b-41d4-a716-446655440000',
  },
});

describe('AI Provider Integrations Middleware (T072)', () => {
  let mockContext: any;
  let mockNext: any;

  beforeEach(() => {
    mockContext = {
      req: {
        query: vi.fn(),
        param: vi.fn(),
      },
      set: vi.fn(),
      get: vi.fn(),
      json: vi.fn(),
    };
    mockNext = vi.fn();

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('AI Provider Manager', () => {
    it('should initialize with default models', () => {
      const models = aiProviderManager.getAvailableModels();

      expect(models.length).toBeGreaterThan(0);

      // Check for expected providers
      const providers = models.map(m => m.provider);
      expect(providers).toContain(AIProvider.OPENAI);
      expect(providers).toContain(AIProvider.ANTHROPIC);
      expect(providers).toContain(AIProvider.GOOGLE);
    });

    it('should filter models by provider', () => {
      const openaiModels = aiProviderManager.getAvailableModels({
        provider: AIProvider.OPENAI,
      });

      expect(openaiModels.length).toBeGreaterThan(0);
      openaiModels.forEach(model => {
        expect(model.provider).toBe(AIProvider.OPENAI);
      });
    });

    it('should filter models by healthcare optimization', () => {
      const healthcareModels = aiProviderManager.getAvailableModels({
        healthcareOptimized: true,
      });

      expect(healthcareModels.length).toBeGreaterThan(0);
      healthcareModels.forEach(model => {
        expect(model.healthcareOptimized).toBe(true);
      });
    });

    it('should filter models by Brazilian Portuguese support', () => {
      const portugueseModels = aiProviderManager.getAvailableModels({
        supportsBrazilianPortuguese: true,
      });

      expect(portugueseModels.length).toBeGreaterThan(0);
      portugueseModels.forEach(model => {
        expect(model.supportsBrazilianPortuguese).toBe(true);
      });
    });

    it('should filter models by streaming support', () => {
      const streamingModels = aiProviderManager.getAvailableModels({
        supportsStreaming: true,
      });

      expect(streamingModels.length).toBeGreaterThan(0);
      streamingModels.forEach(model => {
        expect(model.supportsStreaming).toBe(true);
      });
    });

    it('should select best model for healthcare context', () => {
      const model = aiProviderManager.selectBestModel({
        healthcareContext: true,
        streaming: false,
      });

      expect(model).toBeDefined();
      expect(model?.healthcareOptimized).toBe(true);
      expect(model?.supportsBrazilianPortuguese).toBe(true);
    });

    it('should select best model for streaming', () => {
      const model = aiProviderManager.selectBestModel({
        streaming: true,
      });

      expect(model).toBeDefined();
      expect(model?.supportsStreaming).toBe(true);
      expect(model?.supportsBrazilianPortuguese).toBe(true);
    });

    it('should select cost-optimized model', () => {
      const model = aiProviderManager.selectBestModel({
        costOptimized: true,
      });

      expect(model).toBeDefined();
      expect(model?.supportsBrazilianPortuguese).toBe(true);

      // Should be one of the lower-cost models
      expect(model?.costPerToken).toBeLessThan(0.00005);
    });

    it('should return null when no models meet requirements', () => {
      const model = aiProviderManager.selectBestModel({
        maxTokens: 1000000, // Unrealistic requirement
      });

      expect(model).toBeNull();
    });

    it('should check rate limits', () => {
      const canMakeRequest = aiProviderManager.checkRateLimit(AIProvider.OPENAI);
      expect(canMakeRequest).toBe(true);
    });

    it('should record request metrics', () => {
      const metrics = {
        provider: AIProvider.OPENAI,
        model: 'gpt-4',
        requestId: '550e8400-e29b-41d4-a716-446655440000',
        startTime: new Date(),
        endTime: new Date(),
        responseTime: 1000,
        success: true,
      };

      aiProviderManager.recordRequest(metrics);

      const providerHealth = aiProviderManager.getProviderHealth(AIProvider.OPENAI);
      expect(providerHealth).toHaveLength(1);
      expect(providerHealth[0].requestCount).toBeGreaterThan(0);
    });

    it('should get provider health status', () => {
      const allHealth = aiProviderManager.getProviderHealth();
      expect(allHealth.length).toBeGreaterThan(0);

      const openaiHealth = aiProviderManager.getProviderHealth(AIProvider.OPENAI);
      expect(openaiHealth).toHaveLength(1);
      expect(openaiHealth[0].provider).toBe(AIProvider.OPENAI);
    });

    it('should get request metrics', () => {
      const allMetrics = aiProviderManager.getRequestMetrics();
      expect(Array.isArray(allMetrics)).toBe(true);

      const openaiMetrics = aiProviderManager.getRequestMetrics(AIProvider.OPENAI);
      expect(Array.isArray(openaiMetrics)).toBe(true);
    });
  });

  describe('AI Provider Selection Middleware', () => {
    it('should select model and add to context', async () => {
      mockContext.req.query.mockImplementation((key: string) => {
        if (key === 'streaming') return 'false';
        if (key === 'costOptimized') return 'false';
        return undefined;
      });
      mockContext.get.mockReturnValue(false); // isHealthcareProfessional

      const middleware = aiProviderSelection();
      await middleware(mockContext, mockNext);

      expect(mockContext.set).toHaveBeenCalledWith('selectedAIModel', expect.any(Object));
      expect(mockContext.set).toHaveBeenCalledWith('aiProviderManager', aiProviderManager);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle streaming requirement', async () => {
      mockContext.req.query.mockImplementation((key: string) => {
        if (key === 'streaming') return 'true';
        return undefined;
      });
      mockContext.get.mockReturnValue(false);

      const middleware = aiProviderSelection();
      await middleware(mockContext, mockNext);

      expect(mockNext).toHaveBeenCalled();

      // Check that a streaming-capable model was selected
      const setCall = mockContext.set.mock.calls.find((call: any) => call[0] === 'selectedAIModel');
      if (setCall) {
        const selectedModel = setCall[1] as AIModel;
        expect(selectedModel.supportsStreaming).toBe(true);
      }
    });

    it('should handle healthcare professional context', async () => {
      mockContext.req.query.mockReturnValue(undefined);
      mockContext.get.mockReturnValue(true); // isHealthcareProfessional

      const middleware = aiProviderSelection();
      await middleware(mockContext, mockNext);

      expect(mockNext).toHaveBeenCalled();

      // Check that a healthcare-optimized model was selected
      const setCall = mockContext.set.mock.calls.find((call: any) => call[0] === 'selectedAIModel');
      if (setCall) {
        const selectedModel = setCall[1] as AIModel;
        expect(selectedModel.healthcareOptimized).toBe(true);
      }
    });

    it('should return error when no model available', async () => {
      mockContext.req.query.mockImplementation((key: string) => {
        if (key === 'maxTokens') return '1000000'; // Unrealistic requirement
        return undefined;
      });
      mockContext.get.mockReturnValue(false);

      const middleware = aiProviderSelection();
      await middleware(mockContext, mockNext);

      expect(mockContext.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Nenhum modelo de IA disponível para os requisitos especificados',
          code: 'NO_AVAILABLE_MODEL',
        }),
        503,
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Healthcare Context Injection Middleware', () => {
    it('should inject healthcare context for healthcare professional', async () => {
      const healthcareProfessional = {
        id: 'prof-123',
        crmNumber: '12345-SP',
        specialty: 'Dermatologia',
      };

      const lgpdConsent = {
        userId: 'user-123',
        dataCategories: ['personal_data', 'health_data'],
      };

      mockContext.get.mockImplementation((key: string) => {
        if (key === 'healthcareProfessional') return healthcareProfessional;
        if (key === 'lgpdConsent') return lgpdConsent;
        return undefined;
      });

      mockContext.req.param.mockReturnValue('patient-123');

      const middleware = healthcareContextInjection();
      await middleware(mockContext, mockNext);

      expect(mockContext.set).toHaveBeenCalledWith(
        'healthcareContext',
        expect.objectContaining({
          isHealthcareProfessional: true,
          crmNumber: '12345-SP',
          specialty: 'Dermatologia',
          patientContext: expect.objectContaining({
            patientId: 'patient-123',
            hasConsent: true,
            dataCategories: ['personal_data', 'health_data'],
          }),
          complianceRequirements: expect.objectContaining({
            lgpd: true,
            anvisa: true,
            cfm: true,
          }),
        }),
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should inject context for non-healthcare professional', async () => {
      mockContext.get.mockReturnValue(undefined);
      mockContext.req.param.mockReturnValue(undefined);
      mockContext.req.query.mockReturnValue(undefined);

      const middleware = healthcareContextInjection();
      await middleware(mockContext, mockNext);

      expect(mockContext.set).toHaveBeenCalledWith(
        'healthcareContext',
        expect.objectContaining({
          isHealthcareProfessional: false,
          patientContext: undefined,
          complianceRequirements: expect.objectContaining({
            lgpd: true,
            anvisa: false,
            cfm: false,
          }),
        }),
      );
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('AI Request Metrics Middleware', () => {
    it('should track successful request metrics', async () => {
      const selectedModel: AIModel = {
        id: 'gpt-4',
        provider: AIProvider.OPENAI,
        name: 'GPT-4',
        description: 'Test model',
        maxTokens: 8192,
        costPerToken: 0.00003,
        healthcareOptimized: true,
        supportsBrazilianPortuguese: true,
        supportsStreaming: true,
        isAvailable: true,
        priority: 9,
      };

      mockContext.get.mockImplementation((key: string) => {
        if (key === 'selectedAIModel') return selectedModel;
        return undefined;
      });

      const middleware = aiRequestMetrics();
      await middleware(mockContext, mockNext);

      expect(mockContext.set).toHaveBeenCalledWith('aiRequestId', expect.any(String));
      expect(mockContext.set).toHaveBeenCalledWith('aiRequestStartTime', expect.any(Date));
      expect(mockNext).toHaveBeenCalled();
    });

    it('should track failed request metrics', async () => {
      const selectedModel: AIModel = {
        id: 'gpt-4',
        provider: AIProvider.OPENAI,
        name: 'GPT-4',
        description: 'Test model',
        maxTokens: 8192,
        costPerToken: 0.00003,
        healthcareOptimized: true,
        supportsBrazilianPortuguese: true,
        supportsStreaming: true,
        isAvailable: true,
        priority: 9,
      };

      mockContext.get.mockImplementation((key: string) => {
        if (key === 'selectedAIModel') return selectedModel;
        return undefined;
      });

      mockNext.mockImplementation(() => {
        throw new Error('Test error');
      });

      const middleware = aiRequestMetrics();

      await expect(middleware(mockContext, mockNext)).rejects.toThrow('Test error');

      expect(mockContext.set).toHaveBeenCalledWith('aiRequestId', expect.any(String));
      expect(mockContext.set).toHaveBeenCalledWith('aiRequestStartTime', expect.any(Date));
    });

    it('should skip metrics when no model selected', async () => {
      mockContext.get.mockReturnValue(undefined);

      const middleware = aiRequestMetrics();
      await middleware(mockContext, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockContext.set).not.toHaveBeenCalledWith('aiRequestId', expect.any(String));
    });
  });
});
