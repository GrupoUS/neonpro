/**
 * Tests for GET /api/v2/ai/models endpoint (T054)
 * Following TDD methodology - MUST FAIL FIRST
 * Integration with AIChatService for AI model management
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the Backend Services
const mockAIChatService = {
  getAvailableModels: vi.fn(),
  getModelHealth: vi.fn(),
  getModelMetrics: vi.fn(),
  validateModelAccess: vi.fn(),
};

const mockAuditService = {
  logActivity: vi.fn(),
};

describe('GET /api/v2/ai/models endpoint (T054)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Inject mocked services into the endpoint
    const { setServices } = require('../models');
    setServices({
      aiChatService: mockAIChatService,
      auditService: mockAuditService,
    });

    // Mock successful service responses by default
    mockAIChatService.getAvailableModels.mockResolvedValue({
      success: true,
      data: {
        models: [
          {
            id: 'gpt-4',
            name: 'GPT-4',
            provider: 'openai',
            type: 'text',
            capabilities: ['chat', 'analysis', 'insights'],
            status: 'available',
            health: {
              status: 'healthy',
              uptime: 0.999,
              responseTime: 1200,
              lastCheck: '2024-01-16T10:30:00Z',
            },
            limits: {
              tokensPerMinute: 10000,
              requestsPerMinute: 60,
              maxTokens: 8192,
            },
            pricing: {
              inputTokens: 0.03,
              outputTokens: 0.06,
              currency: 'USD',
              per1000Tokens: true,
            },
            features: {
              streaming: true,
              functionCalling: true,
              multiModal: false,
              languages: ['pt-BR', 'en', 'es'],
            },
            performance: {
              averageResponseTime: 1200,
              successRate: 0.998,
              confidenceScore: 0.92,
            },
          },
          {
            id: 'gpt-4-vision',
            name: 'GPT-4 Vision',
            provider: 'openai',
            type: 'multimodal',
            capabilities: ['chat', 'image_analysis', 'medical_imaging'],
            status: 'available',
            health: {
              status: 'healthy',
              uptime: 0.995,
              responseTime: 2800,
              lastCheck: '2024-01-16T10:30:00Z',
            },
            limits: {
              tokensPerMinute: 5000,
              requestsPerMinute: 30,
              maxTokens: 4096,
              maxImageSize: '20MB',
            },
            features: {
              streaming: true,
              functionCalling: false,
              multiModal: true,
              supportedFormats: ['jpg', 'png', 'webp'],
            },
            performance: {
              averageResponseTime: 2800,
              successRate: 0.994,
              confidenceScore: 0.89,
            },
          },
          {
            id: 'claude-3-sonnet',
            name: 'Claude 3 Sonnet',
            provider: 'anthropic',
            type: 'text',
            capabilities: ['chat', 'analysis', 'reasoning'],
            status: 'available',
            health: {
              status: 'healthy',
              uptime: 0.997,
              responseTime: 1500,
              lastCheck: '2024-01-16T10:30:00Z',
            },
            limits: {
              tokensPerMinute: 8000,
              requestsPerMinute: 50,
              maxTokens: 200000,
            },
            features: {
              streaming: true,
              functionCalling: true,
              multiModal: false,
              languages: ['pt-BR', 'en'],
            },
            performance: {
              averageResponseTime: 1500,
              successRate: 0.996,
              confidenceScore: 0.94,
            },
          },
          {
            id: 'gemini-pro',
            name: 'Gemini Pro',
            provider: 'google',
            type: 'text',
            capabilities: ['chat', 'analysis'],
            status: 'limited',
            health: {
              status: 'degraded',
              uptime: 0.985,
              responseTime: 2200,
              lastCheck: '2024-01-16T10:30:00Z',
              issues: ['High latency', 'Intermittent timeouts'],
            },
            limits: {
              tokensPerMinute: 6000,
              requestsPerMinute: 40,
              maxTokens: 32768,
            },
            features: {
              streaming: false,
              functionCalling: false,
              multiModal: false,
              languages: ['pt-BR', 'en'],
            },
            performance: {
              averageResponseTime: 2200,
              successRate: 0.985,
              confidenceScore: 0.86,
            },
          },
        ],
        summary: {
          totalModels: 4,
          availableModels: 3,
          healthyModels: 3,
          degradedModels: 1,
          providers: ['openai', 'anthropic', 'google'],
          capabilities: [
            'chat',
            'analysis',
            'insights',
            'image_analysis',
            'medical_imaging',
            'reasoning',
          ],
        },
        metadata: {
          lastUpdated: '2024-01-16T10:30:00Z',
          refreshInterval: '5 minutes',
          monitoringEnabled: true,
        },
      },
    });

    mockAIChatService.getModelHealth.mockResolvedValue({
      success: true,
      data: {
        overallHealth: 'healthy',
        healthScore: 0.96,
        issues: [],
        recommendations: [
          'Consider using Claude 3 for complex reasoning tasks',
          'GPT-4 Vision recommended for image analysis',
        ],
      },
    });

    mockAIChatService.getModelMetrics.mockResolvedValue({
      success: true,
      data: {
        usage: {
          totalRequests: 15420,
          successfulRequests: 15298,
          failedRequests: 122,
          averageResponseTime: 1650,
        },
        performance: {
          topPerformingModel: 'claude-3-sonnet',
          mostUsedModel: 'gpt-4',
          averageConfidence: 0.91,
        },
        costs: {
          totalCost: 245.67,
          currency: 'USD',
          period: '30 days',
        },
      },
    });

    mockAuditService.logActivity.mockResolvedValue({
      success: true,
      data: { auditId: 'audit-models-123' },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should export AI models route handler', () => {
    expect(() => {
      const module = require('../models');
      expect(module.default).toBeDefined();
    }).not.toThrow();
  });

  describe('Successful AI Models Listing', () => {
    it('should list all available AI models', async () => {
      const { default: modelsRoute } = require('../models');

      const response = await modelsRoute.request(
        new Request('http://localhost/', {
          method: 'GET',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.models).toHaveLength(4);
      expect(data.data.summary.totalModels).toBe(4);
      expect(data.data.summary.availableModels).toBe(3);
      expect(data.data.summary.providers).toEqual(['openai', 'anthropic', 'google']);
    });

    it('should filter models by provider', async () => {
      const { default: modelsRoute } = require('../models');

      const response = await modelsRoute.request(
        new Request('http://localhost/?provider=openai', {
          method: 'GET',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockAIChatService.getAvailableModels).toHaveBeenCalledWith({
        userId: 'user-123',
        filters: { provider: 'openai' },
      });
    });

    it('should filter models by capability', async () => {
      const { default: modelsRoute } = require('../models');

      const response = await modelsRoute.request(
        new Request('http://localhost/?capability=image_analysis', {
          method: 'GET',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockAIChatService.getAvailableModels).toHaveBeenCalledWith({
        userId: 'user-123',
        filters: { capability: 'image_analysis' },
      });
    });

    it('should filter models by status', async () => {
      const { default: modelsRoute } = require('../models');

      const response = await modelsRoute.request(
        new Request('http://localhost/?status=available', {
          method: 'GET',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockAIChatService.getAvailableModels).toHaveBeenCalledWith({
        userId: 'user-123',
        filters: { status: 'available' },
      });
    });

    it('should include detailed model information', async () => {
      const { default: modelsRoute } = require('../models');

      const response = await modelsRoute.request(
        new Request('http://localhost/?includeDetails=true', {
          method: 'GET',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.models[0].health).toBeDefined();
      expect(data.data.models[0].limits).toBeDefined();
      expect(data.data.models[0].performance).toBeDefined();
      expect(data.data.models[0].features).toBeDefined();
    });

    it('should include model health information', async () => {
      const { default: modelsRoute } = require('../models');

      const response = await modelsRoute.request(
        new Request('http://localhost/?includeHealth=true', {
          method: 'GET',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.healthSummary).toBeDefined();
      expect(data.data.healthSummary.overallHealth).toBe('healthy');
      expect(mockAIChatService.getModelHealth).toHaveBeenCalled();
    });

    it('should include usage metrics', async () => {
      const { default: modelsRoute } = require('../models');

      const response = await modelsRoute.request(
        new Request('http://localhost/?includeMetrics=true', {
          method: 'GET',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.metrics).toBeDefined();
      expect(data.data.metrics.usage.totalRequests).toBe(15420);
      expect(mockAIChatService.getModelMetrics).toHaveBeenCalled();
    });

    it('should include model performance headers', async () => {
      const { default: modelsRoute } = require('../models');

      const response = await modelsRoute.request(
        new Request('http://localhost/', {
          method: 'GET',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
        }),
      );

      expect(response.status).toBe(200);
      expect(response.headers.get('X-Total-Models')).toBe('4');
      expect(response.headers.get('X-Available-Models')).toBe('3');
      expect(response.headers.get('X-Healthy-Models')).toBe('3');
      expect(response.headers.get('X-Model-Providers')).toBe('openai,anthropic,google');
      expect(response.headers.get('X-Last-Updated')).toBe('2024-01-16T10:30:00Z');
    });
  });

  describe('Model Recommendations', () => {
    it('should provide model recommendations based on use case', async () => {
      mockAIChatService.getAvailableModels.mockResolvedValueOnce({
        success: true,
        data: {
          models: [], // Simplified for this test
          recommendations: [
            {
              useCase: 'medical_image_analysis',
              recommendedModel: 'gpt-4-vision',
              reasoning: 'Melhor performance para análise de imagens médicas',
              confidence: 0.95,
            },
            {
              useCase: 'complex_reasoning',
              recommendedModel: 'claude-3-sonnet',
              reasoning: 'Excelente capacidade de raciocínio complexo',
              confidence: 0.92,
            },
          ],
        },
      });

      const { default: modelsRoute } = require('../models');

      const response = await modelsRoute.request(
        new Request('http://localhost/?useCase=medical_image_analysis', {
          method: 'GET',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.recommendations).toBeDefined();
      expect(data.data.recommendations[0].recommendedModel).toBe('gpt-4-vision');
    });

    it('should provide fallback model suggestions', async () => {
      const { default: modelsRoute } = require('../models');

      const response = await modelsRoute.request(
        new Request('http://localhost/?includeFallbacks=true', {
          method: 'GET',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockAIChatService.getAvailableModels).toHaveBeenCalledWith({
        userId: 'user-123',
        includeFallbacks: true,
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors', async () => {
      const { default: modelsRoute } = require('../models');

      const response = await modelsRoute.request(
        new Request('http://localhost/', {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
          },
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Não autorizado');
    });

    it('should handle service errors gracefully', async () => {
      mockAIChatService.getAvailableModels.mockResolvedValue({
        success: false,
        error: 'Erro interno do serviço de modelos de IA',
      });

      const { default: modelsRoute } = require('../models');

      const response = await modelsRoute.request(
        new Request('http://localhost/', {
          method: 'GET',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Erro interno');
    });

    it('should handle invalid filter parameters', async () => {
      const { default: modelsRoute } = require('../models');

      const response = await modelsRoute.request(
        new Request('http://localhost/?provider=invalid_provider', {
          method: 'GET',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Parâmetros de filtro inválidos');
    });

    it('should handle model service unavailability', async () => {
      mockAIChatService.getAvailableModels.mockRejectedValue(
        new Error('Model service unavailable'),
      );

      const { default: modelsRoute } = require('../models');

      const response = await modelsRoute.request(
        new Request('http://localhost/', {
          method: 'GET',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Serviço de modelos de IA temporariamente indisponível');
    });
  });

  describe('Audit and Logging', () => {
    it('should log model access for audit trail', async () => {
      const { default: modelsRoute } = require('../models');

      await modelsRoute.request(
        new Request('http://localhost/?includeMetrics=true', {
          method: 'GET',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
            'X-Real-IP': '192.168.1.100',
            'User-Agent': 'Mozilla/5.0',
          },
        }),
      );

      expect(mockAuditService.logActivity).toHaveBeenCalledWith({
        userId: 'user-123',
        action: 'ai_models_access',
        resourceType: 'ai_models',
        resourceId: 'models_list',
        details: {
          includeMetrics: true,
          modelsReturned: 4,
          availableModels: 3,
          providers: ['openai', 'anthropic', 'google'],
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        complianceContext: 'LGPD',
        sensitivityLevel: 'medium',
      });
    });
  });

  describe('Brazilian Healthcare Compliance', () => {
    it('should include CFM compliance headers', async () => {
      const { default: modelsRoute } = require('../models');

      const response = await modelsRoute.request(
        new Request('http://localhost/', {
          method: 'GET',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
        }),
      );

      expect(response.headers.get('X-CFM-Compliant')).toBe('true');
      expect(response.headers.get('X-AI-Models-Listed')).toBe('true');
      expect(response.headers.get('X-LGPD-Compliant')).toBe('true');
    });

    it('should filter models for healthcare context', async () => {
      const { default: modelsRoute } = require('../models');

      const response = await modelsRoute.request(
        new Request('http://localhost/?healthcareContext=true', {
          method: 'GET',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
            'X-Healthcare-Professional': 'CRM-SP-123456',
          },
        }),
      );

      expect(response.status).toBe(200);
      expect(mockAIChatService.getAvailableModels).toHaveBeenCalledWith({
        userId: 'user-123',
        healthcareContext: true,
        healthcareProfessional: 'CRM-SP-123456',
      });
    });
  });

  describe('Performance and Caching', () => {
    it('should include performance headers', async () => {
      const { default: modelsRoute } = require('../models');

      const response = await modelsRoute.request(
        new Request('http://localhost/', {
          method: 'GET',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
        }),
      );

      expect(response.status).toBe(200);
      expect(response.headers.get('X-Response-Time')).toBeDefined();
      expect(response.headers.get('Cache-Control')).toBe('public, max-age=300');
      expect(response.headers.get('X-Database-Queries')).toBeDefined();
    });

    it('should handle model status monitoring', async () => {
      const { default: modelsRoute } = require('../models');

      const response = await modelsRoute.request(
        new Request('http://localhost/?monitorHealth=true', {
          method: 'GET',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.metadata.monitoringEnabled).toBe(true);
      expect(data.data.metadata.refreshInterval).toBe('5 minutes');
    });
  });
});
