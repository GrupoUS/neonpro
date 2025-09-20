/**
 * Tests for POST /api/v2/ai/chat endpoint (T051)
 * Following TDD methodology - MUST FAIL FIRST
 * Integration with AIChatService for multi-model AI support
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the Backend Services
const mockAIChatService = {
  sendMessage: vi.fn(),
  streamMessage: vi.fn(),
  getConversationHistory: vi.fn(),
  validateModelAccess: vi.fn(),
  generateResponse: vi.fn(),
};

const mockAuditService = {
  logActivity: vi.fn(),
};

const mockLGPDService = {
  validateDataAccess: vi.fn(),
  maskSensitiveData: vi.fn(),
};

const mockPatientService = {
  getPatientContext: vi.fn(),
};

describe('POST /api/v2/ai/chat endpoint (T051)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Inject mocked services into the endpoint
    const { setServices } = await import('../chat.js');
    setServices({
      aiChatService: mockAIChatService,
      auditService: mockAuditService,
      lgpdService: mockLGPDService,
      patientService: mockPatientService,
    });

    // Mock successful service responses by default
    mockAIChatService.sendMessage.mockResolvedValue({
      success: true,
      data: {
        conversationId: 'conv-123',
        messageId: 'msg-456',
        response: {
          content: 'Olá! Como posso ajudá-lo com questões relacionadas à estética e saúde hoje?',
          model: 'gpt-4',
          confidence: 0.95,
          tokens: {
            input: 25,
            output: 18,
            total: 43,
          },
          processingTime: 1250,
        },
        context: {
          healthcareContext: true,
          medicalTerminology: 'portuguese',
          complianceLevel: 'LGPD',
        },
        metadata: {
          timestamp: '2024-01-16T10:30:00Z',
          model: 'gpt-4',
          provider: 'openai',
          fallbackUsed: false,
        },
      },
    });

    mockAIChatService.streamMessage.mockResolvedValue({
      success: true,
      data: {
        streamId: 'stream-789',
        conversationId: 'conv-123',
        websocketUrl: 'wss://api.example.com/ai/stream/stream-789',
        estimatedTokens: 150,
      },
    });

    mockAIChatService.getConversationHistory.mockResolvedValue({
      success: true,
      data: {
        conversationId: 'conv-123',
        messages: [
          {
            id: 'msg-001',
            role: 'user',
            content: 'Olá, preciso de ajuda com tratamentos estéticos.',
            timestamp: '2024-01-16T10:25:00Z',
          },
          {
            id: 'msg-002',
            role: 'assistant',
            content:
              'Olá! Posso ajudá-lo com informações sobre tratamentos estéticos. Qual é sua dúvida específica?',
            timestamp: '2024-01-16T10:25:30Z',
            model: 'gpt-4',
            confidence: 0.92,
          },
        ],
        totalMessages: 2,
        createdAt: '2024-01-16T10:25:00Z',
        updatedAt: '2024-01-16T10:25:30Z',
      },
    });

    mockAIChatService.validateModelAccess.mockResolvedValue({
      success: true,
      data: {
        hasAccess: true,
        availableModels: ['gpt-4', 'claude-3', 'gemini-pro'],
      },
    });

    mockAIChatService.generateResponse.mockResolvedValue({
      success: true,
      data: {
        conversationId: 'conv-123',
        messageId: 'msg-456',
        // Fields that the route handler expects directly
        model: 'gpt-4',
        confidence: 0.95,
        tokensUsed: 43,
        responseTime: 1250,
        provider: 'openai',
        // Nested response object that the test expects
        response: {
          content: 'Olá! Como posso ajudá-lo com questões relacionadas à estética e saúde hoje?',
          model: 'gpt-4',
          confidence: 0.95,
          tokens: {
            input: 25,
            output: 18,
            total: 43,
          },
          processingTime: 1250,
        },
        context: {
          healthcareContext: true,
          medicalTerminology: 'portuguese',
          complianceLevel: 'LGPD',
        },
        metadata: {
          timestamp: '2024-01-16T10:30:00Z',
          model: 'gpt-4',
          provider: 'openai',
          fallbackUsed: false,
        },
      },
    });

    mockAuditService.logActivity.mockResolvedValue({
      success: true,
      data: { auditId: 'audit-ai-123' },
    });

    mockLGPDService.validateDataAccess.mockResolvedValue({
      success: true,
      data: { canAccess: true, accessLevel: 'full' },
    });

    mockLGPDService.maskSensitiveData.mockImplementation(data => data);

    mockPatientService.getPatientContext.mockResolvedValue({
      success: true,
      data: {
        patientId: 'patient-123',
        name: 'Maria Santos',
        age: 35,
        medicalHistory: ['Botox anterior', 'Preenchimento labial'],
        currentTreatments: ['Limpeza de pele'],
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should export AI chat route handler', async () => {
    const module = await import('../chat.js');
    expect(module.default).toBeDefined();
  });

  describe('Successful AI Chat Operations', () => {
    it('should send message to AI with default model', async () => {
      const { default: chatRoute } = await import('../chat.js');

      const chatData = {
        message: 'Olá, preciso de informações sobre tratamentos de rejuvenescimento facial.',
        conversationId: 'conv-123',
        context: {
          healthcareContext: true,
          language: 'pt-BR',
        },
      };

      const response = await chatRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(chatData),
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.conversationId).toBe('conv-123');
      expect(data.data.response.content).toContain('estética');
      expect(data.data.response.model).toBe('gpt-4');
      expect(data.data.response.confidence).toBeGreaterThan(0.9);
    });

    it('should send message with specific model preference', async () => {
      const { default: chatRoute } = await import('../chat.js');

      const chatData = {
        message: 'Quais são os riscos do preenchimento labial?',
        conversationId: 'conv-456',
        modelPreference: 'claude-3',
        context: {
          healthcareContext: true,
          medicalContext: true,
          language: 'pt-BR',
        },
      };

      const response = await chatRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(chatData),
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockAIChatService.generateResponse).toHaveBeenCalledWith({
        provider: 'claude-3',
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: 'Quais são os riscos do preenchimento labial?',
          },
        ],
        patientId: undefined,
        temperature: 0.7,
        maxTokens: 1000,
      });
    });

    it('should initiate streaming chat response', async () => {
      const { default: chatRoute } = await import('../chat.js');

      const chatData = {
        message: 'Explique o processo de aplicação de botox passo a passo.',
        conversationId: 'conv-789',
        streaming: true,
        context: {
          healthcareContext: true,
          detailedResponse: true,
        },
      };

      const response = await chatRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(chatData),
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.streamId).toBe('stream-789');
      expect(data.data.websocketUrl).toContain('wss://');
      expect(mockAIChatService.streamMessage).toHaveBeenCalled();
    });

    it('should include patient context when provided', async () => {
      const { default: chatRoute } = await import('../chat.js');

      const chatData = {
        message: 'Com base no histórico da paciente, qual tratamento você recomendaria?',
        conversationId: 'conv-patient-123',
        patientId: 'patient-123',
        context: {
          healthcareContext: true,
          includePatientHistory: true,
        },
      };

      const response = await chatRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
            'X-Healthcare-Professional': 'CRM-SP-123456',
          },
          body: JSON.stringify(chatData),
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPatientService.getPatientContext).toHaveBeenCalledWith({
        patientId: 'patient-123',
        userId: 'user-123',
        includeHistory: true,
      });
    });

    it('should include AI performance headers', async () => {
      const { default: chatRoute } = await import('../chat.js');

      const chatData = {
        message: 'Teste de performance',
        conversationId: 'conv-perf',
      };

      const response = await chatRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(chatData),
        }),
      );

      expect(response.status).toBe(200);
      expect(response.headers.get('X-AI-Model')).toBe('gpt-4');
      expect(response.headers.get('X-AI-Confidence')).toBe('0.95');
      expect(response.headers.get('X-AI-Tokens')).toBe('43');
      expect(response.headers.get('X-AI-Processing-Time')).toBe('1250ms');
      expect(response.headers.get('X-AI-Provider')).toBe('openai');
    });

    it('should handle model fallback scenarios', async () => {
      mockAIChatService.generateResponse.mockResolvedValueOnce({
        success: true,
        data: {
          conversationId: 'conv-fallback',
          messageId: 'msg-fallback',
          // Fields that the route handler expects directly
          model: 'gpt-3.5-turbo',
          confidence: 0.88,
          tokensUsed: 35,
          responseTime: 800,
          provider: 'openai',
          // Nested response object that the test expects
          response: {
            content: 'Resposta usando modelo de fallback.',
            model: 'gpt-3.5-turbo',
            confidence: 0.88,
            tokens: { input: 20, output: 15, total: 35 },
            processingTime: 800,
          },
          metadata: {
            model: 'gpt-3.5-turbo',
            provider: 'openai',
            fallbackUsed: true,
            originalModel: 'gpt-4',
            fallbackReason: 'rate_limit_exceeded',
          },
        },
      });

      const { default: chatRoute } = await import('../chat.js');

      const chatData = {
        message: 'Teste de fallback',
        modelPreference: 'gpt-4',
      };

      const response = await chatRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(chatData),
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.metadata.fallbackUsed).toBe(true);
      expect(data.data.metadata.originalModel).toBe('gpt-4');
      expect(response.headers.get('X-AI-Fallback-Used')).toBe('true');
    });
  });

  describe('LGPD Compliance and Data Access', () => {
    it('should validate LGPD data access for AI chat', async () => {
      const { default: chatRoute } = await import('../chat.js');

      const chatData = {
        message: 'Preciso de informações sobre tratamentos.',
        patientId: 'patient-123',
      };

      await chatRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(chatData),
        }),
      );

      expect(mockLGPDService.validateDataAccess).toHaveBeenCalledWith({
        userId: 'user-123',
        dataType: 'ai_chat',
        purpose: 'healthcare_assistance',
        legalBasis: 'legitimate_interest',
        patientId: 'patient-123',
      });
    });

    it('should log AI chat activity for audit trail', async () => {
      const { default: chatRoute } = await import('../chat.js');

      const chatData = {
        message: 'Quais são os cuidados pós-botox?',
        conversationId: 'conv-audit',
      };

      await chatRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
            'X-Real-IP': '192.168.1.100',
            'User-Agent': 'Mozilla/5.0',
          },
          body: JSON.stringify(chatData),
        }),
      );

      expect(mockAuditService.logActivity).toHaveBeenCalledWith({
        userId: 'user-123',
        action: 'ai_chat_message',
        resourceType: 'ai_conversation',
        resourceId: 'conv-audit',
        details: {
          messageLength: chatData.message.length,
          model: 'gpt-4',
          confidence: 0.95,
          tokens: 43,
          processingTime: 1250,
          healthcareContext: true,
          streaming: false,
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        complianceContext: 'LGPD',
        sensitivityLevel: 'high',
      });
    });

    it('should handle LGPD access denial for AI chat', async () => {
      // Reset and set up the mock for this specific test
      const { setServices } = await import('../chat.js');
      setServices({
        aiChatService: mockAIChatService,
        auditService: mockAuditService,
        lgpdService: {
          validateDataAccess: vi.fn().mockResolvedValue({
            success: false,
            error: 'Acesso negado para chat com IA por política LGPD',
            code: 'LGPD_AI_CHAT_DENIED',
          }),
          maskSensitiveData: vi.fn(),
        },
        patientService: mockPatientService,
      });

      const { default: chatRoute } = await import('../chat.js');

      const chatData = {
        message: 'Teste de acesso negado',
      };

      const response = await chatRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(chatData),
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toContain('LGPD');
      expect(data.code).toBe('LGPD_AI_CHAT_DENIED');
    });

    it('should mask sensitive data in chat responses', async () => {
      // Reset and set up the mock for this specific test
      const { setServices } = await import('../chat.js');
      setServices({
        aiChatService: mockAIChatService,
        auditService: mockAuditService,
        lgpdService: {
          validateDataAccess: vi.fn().mockResolvedValue({
            success: true,
            data: { canAccess: true, accessLevel: 'limited' },
          }),
          maskSensitiveData: vi.fn().mockReturnValue({
            conversationId: 'conv-123',
            messageId: 'msg-456',
            response: {
              content: 'Informações sobre tratamento com dados sensíveis mascarados: ***',
              model: 'gpt-4',
              confidence: 0.95,
              tokens: { input: 25, output: 18, total: 43 },
              processingTime: 1250,
            },
            metadata: {
              model: 'gpt-4',
              provider: 'openai',
              fallbackUsed: false,
            },
          }),
        },
        patientService: mockPatientService,
      });

      const { default: chatRoute } = await import('../chat.js');

      const chatData = {
        message: 'Informações sobre paciente específico',
        patientId: 'patient-123',
      };

      const response = await chatRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer limited-token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(chatData),
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.response.content).toContain('***');
      expect(response.headers.get('X-Access-Level')).toBe('limited');
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors', async () => {
      const { default: chatRoute } = await import('../chat.js');

      const response = await chatRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({ message: 'test' }),
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Não autorizado');
    });

    it('should handle validation errors for chat data', async () => {
      const { default: chatRoute } = await import('../chat.js');

      const invalidChatData = {
        // Missing required message
        conversationId: 'conv-invalid',
      };

      const response = await chatRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(invalidChatData),
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      // Zod validation errors are returned in different format
      expect(data.error || data.message).toBeDefined();
    });

    it('should handle AI service errors gracefully', async () => {
      mockAIChatService.sendMessage.mockResolvedValue({
        success: false,
        error: 'Erro interno do serviço de IA',
        code: 'AI_SERVICE_ERROR',
      });

      const { default: chatRoute } = await import('../chat.js');

      const chatData = {
        message: 'Teste de erro do serviço',
      };

      const response = await chatRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(chatData),
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Erro interno');
    });

    it('should handle AI model unavailability', async () => {
      mockAIChatService.sendMessage.mockRejectedValue(
        new Error('All AI models unavailable'),
      );

      const { default: chatRoute } = await import('../chat.js');

      const chatData = {
        message: 'Teste de indisponibilidade',
      };

      const response = await chatRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(chatData),
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.success).toBe(false);
      expect(data.error).toContain(
        'Serviço de IA temporariamente indisponível',
      );
    });
  });

  describe('Brazilian Healthcare Compliance', () => {
    it('should include CFM compliance headers', async () => {
      const { default: chatRoute } = await import('../chat.js');

      const chatData = {
        message: 'Informações médicas sobre tratamento',
        context: { medicalContext: true },
      };

      const response = await chatRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(chatData),
        }),
      );

      expect(response.headers.get('X-CFM-Compliant')).toBe('true');
      expect(response.headers.get('X-AI-Healthcare-Context')).toBe('true');
      expect(response.headers.get('X-LGPD-Compliant')).toBe('true');
      expect(response.headers.get('X-Medical-AI-Logged')).toBe('true');
    });

    it('should validate healthcare professional context for medical AI', async () => {
      const { default: chatRoute } = await import('../chat.js');

      const chatData = {
        message: 'Diagnóstico diferencial para sintomas apresentados',
        context: {
          medicalContext: true,
          diagnosticAssistance: true,
        },
      };

      const response = await chatRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
            'X-Healthcare-Professional': 'CRM-SP-123456',
            'X-Healthcare-Context': 'diagnostic_assistance',
          },
          body: JSON.stringify(chatData),
        }),
      );

      expect(response.status).toBe(200);
      expect(mockAIChatService.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            healthcareProfessional: 'CRM-SP-123456',
            healthcareContext: 'diagnostic_assistance',
          }),
        }),
      );
    });
  });

  describe('Performance and Streaming', () => {
    it('should include performance metrics in response', async () => {
      const { default: chatRoute } = await import('../chat.js');

      const chatData = {
        message: 'Teste de métricas de performance',
      };

      const response = await chatRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(chatData),
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.response.processingTime).toBeDefined();
      expect(data.data.response.tokens).toBeDefined();
      expect(response.headers.get('X-Response-Time')).toBeDefined();
      expect(response.headers.get('X-AI-Processing-Time')).toBe('1250ms');
    });

    it('should handle streaming requests properly', async () => {
      const { default: chatRoute } = await import('../chat.js');

      const chatData = {
        message: 'Resposta longa que precisa de streaming',
        streaming: true,
        context: {
          expectedLength: 'long',
        },
      };

      const response = await chatRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(chatData),
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.streamId).toBeDefined();
      expect(data.data.websocketUrl).toContain('wss://');
      expect(response.headers.get('X-AI-Streaming')).toBe('true');
    });
  });
});

// Additional tests for comprehensive coverage will be added after implementation
