/**
 * Tests for POST /api/v2/ai/analyze endpoint (T053)
 * Following TDD methodology - MUST FAIL FIRST
 * Integration with AIChatService for multi-modal AI analysis
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the Backend Services
const mockAIChatService = {
  analyzeData: vi.fn(),
  analyzeImage: vi.fn(),
  analyzeText: vi.fn(),
  analyzeMultiModal: vi.fn(),
};

const mockAuditService = {
  logActivity: vi.fn(),
};

const mockLGPDService = {
  validateDataAccess: vi.fn(),
  maskSensitiveData: vi.fn(),
};

describe('POST /api/v2/ai/analyze endpoint (T053)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Inject mocked services into the endpoint
    const { setServices } = await import('../analyze');
    setServices({
      aiChatService: mockAIChatService,
      auditService: mockAuditService,
      lgpdService: mockLGPDService,
    });

    // Mock successful service responses by default
    mockAIChatService.analyzeData.mockResolvedValue({
      success: true,
      data: {
        analysisId: 'analysis-123',
        analysisType: 'structured_data',
        results: {
          summary: 'Análise dos dados estruturados do paciente revela padrões consistentes',
          insights: [
            {
              category: 'treatment_effectiveness',
              finding: 'Melhora significativa após tratamentos de limpeza de pele',
              confidence: 0.89,
              evidence: [
                'Redução de 40% em acne',
                'Satisfação do paciente: 9/10',
              ],
            },
            {
              category: 'risk_factors',
              finding: 'Sensibilidade a produtos com ácido salicílico',
              confidence: 0.95,
              evidence: [
                'Reações alérgicas documentadas',
                'Histórico familiar',
              ],
            },
          ],
          recommendations: [
            {
              action: 'Continuar tratamentos de limpeza de pele',
              priority: 'high',
              reasoning: 'Resultados consistentemente positivos',
            },
            {
              action: 'Evitar produtos com ácido salicílico',
              priority: 'critical',
              reasoning: 'Histórico de reações alérgicas',
            },
          ],
        },
        metadata: {
          model: 'gpt-4',
          processingTime: 1800,
          dataPoints: 25,
          confidence: 0.87,
          analysisVersion: '3.2',
        },
      },
    });

    mockAIChatService.analyzeImage.mockResolvedValue({
      success: true,
      data: {
        analysisId: 'img-analysis-456',
        analysisType: 'medical_image',
        results: {
          imageAnalysis: {
            findings: [
              {
                region: 'face_left_cheek',
                condition: 'acne_comedonal',
                severity: 'moderate',
                confidence: 0.92,
                coordinates: { x: 150, y: 200, width: 50, height: 40 },
              },
              {
                region: 'face_forehead',
                condition: 'melasma',
                severity: 'mild',
                confidence: 0.78,
                coordinates: { x: 200, y: 100, width: 80, height: 30 },
              },
            ],
            overallAssessment: 'Pele com sinais de acne comedonal moderada e melasma leve',
            treatmentSuggestions: [
              'Limpeza de pele profunda',
              'Peeling químico suave',
              'Protetor solar diário',
            ],
          },
        },
        metadata: {
          model: 'gpt-4-vision',
          processingTime: 3200,
          imageSize: '1024x768',
          confidence: 0.85,
        },
      },
    });

    mockAIChatService.analyzeText.mockResolvedValue({
      success: true,
      data: {
        analysisId: 'text-analysis-789',
        analysisType: 'patient_feedback',
        results: {
          sentimentAnalysis: {
            overall: 'positive',
            score: 0.75,
            emotions: {
              satisfaction: 0.8,
              concern: 0.2,
              excitement: 0.6,
            },
          },
          keyTopics: [
            {
              topic: 'treatment_satisfaction',
              mentions: 5,
              sentiment: 'positive',
              confidence: 0.9,
            },
            {
              topic: 'pain_level',
              mentions: 2,
              sentiment: 'neutral',
              confidence: 0.7,
            },
          ],
          actionableInsights: [
            'Paciente muito satisfeita com resultados',
            'Menciona leve desconforto durante procedimento',
            'Interesse em tratamentos adicionais',
          ],
        },
        metadata: {
          model: 'gpt-4',
          processingTime: 1200,
          textLength: 450,
          confidence: 0.82,
        },
      },
    });

    mockAuditService.logActivity.mockResolvedValue({
      success: true,
      data: { auditId: 'audit-analysis-123' },
    });

    mockLGPDService.validateDataAccess.mockResolvedValue({
      success: true,
      data: { canAccess: true, accessLevel: 'full' },
    });

    mockLGPDService.maskSensitiveData.mockImplementation(data => data);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should export AI analyze route handler', async () => {
    const module = await import('../analyze');
    expect(module.default).toBeDefined();
  });

  describe('Successful AI Analysis Operations', () => {
    it('should analyze structured patient data', async () => {
      const { default: analyzeRoute } = await import('../analyze');

      const analysisData = {
        analysisType: 'structured_data',
        data: {
          patientId: 'patient-123',
          treatmentHistory: [
            {
              date: '2024-01-10',
              treatment: 'Limpeza de pele',
              outcome: 'satisfatório',
            },
            {
              date: '2024-01-15',
              treatment: 'Hidratação',
              outcome: 'excelente',
            },
          ],
          vitals: {
            skinType: 'oleosa',
            allergies: ['ácido salicílico'],
            currentMedications: [],
          },
        },
        options: {
          includeRecommendations: true,
          confidenceThreshold: 0.8,
        },
      };

      const response = await analyzeRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(analysisData),
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.analysisId).toBe('analysis-123');
      expect(data.data.analysisType).toBe('structured_data');
      expect(data.data.results.insights).toHaveLength(2);
      expect(data.data.results.recommendations).toHaveLength(2);
    });

    it('should analyze medical images', async () => {
      const { default: analyzeRoute } = await import('../analyze');

      const analysisData = {
        analysisType: 'medical_image',
        data: {
          imageUrl: 'https://storage.example.com/images/patient-face-123.jpg',
          imageType: 'facial_analysis',
          patientId: 'patient-123',
        },
        options: {
          detectConditions: ['acne', 'melasma', 'wrinkles'],
          includeCoordinates: true,
          confidenceThreshold: 0.7,
        },
      };

      const response = await analyzeRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(analysisData),
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.analysisType).toBe('medical_image');
      expect(data.data.results.imageAnalysis.findings).toHaveLength(2);
      expect(
        data.data.results.imageAnalysis.findings[0].coordinates,
      ).toBeDefined();
      expect(mockAIChatService.analyzeImage).toHaveBeenCalled();
    });

    it('should analyze patient feedback text', async () => {
      const { default: analyzeRoute } = await import('../analyze');

      const analysisData = {
        analysisType: 'patient_feedback',
        data: {
          text:
            'Estou muito satisfeita com o tratamento de limpeza de pele. Os resultados foram excelentes e superaram minhas expectativas. Houve um leve desconforto durante o procedimento, mas nada insuportável. Gostaria de saber sobre outros tratamentos disponíveis.',
          patientId: 'patient-123',
          context: 'post_treatment_feedback',
        },
        options: {
          analyzeSentiment: true,
          extractTopics: true,
          identifyActionItems: true,
        },
      };

      const response = await analyzeRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(analysisData),
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results.sentimentAnalysis.overall).toBe('positive');
      expect(data.data.results.keyTopics).toHaveLength(2);
      expect(data.data.results.actionableInsights).toHaveLength(3);
    });

    it('should include AI analysis performance headers', async () => {
      const { default: analyzeRoute } = await import('../analyze');

      const analysisData = {
        analysisType: 'structured_data',
        data: { test: 'data' },
      };

      const response = await analyzeRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(analysisData),
        }),
      );

      expect(response.status).toBe(200);
      expect(response.headers.get('X-AI-Model')).toBe('gpt-4');
      expect(response.headers.get('X-AI-Confidence')).toBe('0.87');
      expect(response.headers.get('X-AI-Processing-Time')).toBe('1800ms');
      expect(response.headers.get('X-Analysis-Type')).toBe('structured_data');
      expect(response.headers.get('X-Analysis-Version')).toBe('3.2');
    });

    it('should handle multi-modal analysis', async () => {
      mockAIChatService.analyzeMultiModal.mockResolvedValue({
        success: true,
        data: {
          analysisId: 'multimodal-123',
          analysisType: 'multi_modal',
          results: {
            combinedInsights: [
              'Análise combinada de imagem e dados estruturados confirma diagnóstico',
              'Correlação entre feedback do paciente e observações visuais',
            ],
            crossModalConfidence: 0.91,
          },
          metadata: {
            models: ['gpt-4', 'gpt-4-vision'],
            processingTime: 4500,
          },
        },
      });

      const { default: analyzeRoute } = await import('../analyze');

      const analysisData = {
        analysisType: 'multi_modal',
        data: {
          image: 'https://storage.example.com/images/patient-123.jpg',
          structuredData: { skinType: 'oleosa', age: 35 },
          text: 'Feedback do paciente sobre o tratamento',
        },
      };

      const response = await analyzeRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(analysisData),
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.analysisType).toBe('multi_modal');
      expect(data.data.results.crossModalConfidence).toBe(0.91);
      expect(mockAIChatService.analyzeMultiModal).toHaveBeenCalled();
    });
  });

  describe('LGPD Compliance and Data Access', () => {
    it('should validate LGPD data access for AI analysis', async () => {
      const { default: analyzeRoute } = await import('../analyze');

      const analysisData = {
        analysisType: 'structured_data',
        data: { patientId: 'patient-123', test: 'data' },
      };

      await analyzeRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(analysisData),
        }),
      );

      expect(mockLGPDService.validateDataAccess).toHaveBeenCalledWith({
        userId: 'user-123',
        dataType: 'ai_data_analysis',
        purpose: 'healthcare_analysis',
        legalBasis: 'legitimate_interest',
        analysisType: 'structured_data',
      });
    });

    it('should log analysis activity for audit trail', async () => {
      const { default: analyzeRoute } = await import('../analyze');

      const analysisData = {
        analysisType: 'medical_image',
        data: { imageUrl: 'test.jpg' },
      };

      await analyzeRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
            'X-Real-IP': '192.168.1.100',
            'User-Agent': 'Mozilla/5.0',
          },
          body: JSON.stringify(analysisData),
        }),
      );

      expect(mockAuditService.logActivity).toHaveBeenCalledWith({
        userId: 'user-123',
        action: 'ai_data_analysis',
        resourceType: 'ai_analysis',
        resourceId: 'img-analysis-456',
        details: {
          analysisType: 'medical_image',
          model: 'gpt-4-vision',
          confidence: 0.85,
          processingTime: 3200,
          dataSize: expect.any(Number),
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        complianceContext: 'LGPD',
        sensitivityLevel: 'high',
      });
    });

    it('should handle LGPD access denial for analysis', async () => {
      mockLGPDService.validateDataAccess.mockResolvedValue({
        success: false,
        error: 'Acesso negado para análise de IA por política LGPD',
        code: 'LGPD_AI_ANALYSIS_DENIED',
      });

      const { default: analyzeRoute } = await import('../analyze');

      const analysisData = {
        analysisType: 'structured_data',
        data: { test: 'data' },
      };

      const response = await analyzeRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(analysisData),
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toContain('LGPD');
      expect(data.code).toBe('LGPD_AI_ANALYSIS_DENIED');
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors', async () => {
      const { default: analyzeRoute } = await import('../analyze');

      const response = await analyzeRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({ analysisType: 'test', data: {} }),
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Não autorizado');
    });

    it('should handle validation errors for analysis data', async () => {
      const { default: analyzeRoute } = await import('../analyze');

      const invalidAnalysisData = {
        // Missing required fields
        analysisType: 'invalid_type',
      };

      const response = await analyzeRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(invalidAnalysisData),
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      // Zod validation errors are returned in different format
      expect(data.error || data.message).toBeDefined();
    });

    it('should handle AI service errors gracefully', async () => {
      mockAIChatService.analyzeData.mockResolvedValue({
        success: false,
        error: 'Erro interno do serviço de análise de IA',
      });

      const { default: analyzeRoute } = await import('../analyze');

      const analysisData = {
        analysisType: 'structured_data',
        data: { test: 'data' },
      };

      const response = await analyzeRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(analysisData),
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Erro interno');
    });

    it('should handle unsupported analysis types', async () => {
      const { default: analyzeRoute } = await import('../analyze');

      const analysisData = {
        analysisType: 'unsupported_type',
        data: { test: 'data' },
      };

      const response = await analyzeRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(analysisData),
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      // Zod validation error for invalid enum
      expect(data.error).toBeDefined();
    });
  });

  describe('Brazilian Healthcare Compliance', () => {
    it('should include CFM compliance headers', async () => {
      const { default: analyzeRoute } = await import('../analyze');

      const analysisData = {
        analysisType: 'medical_image',
        data: { imageUrl: 'test.jpg' },
      };

      const response = await analyzeRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(analysisData),
        }),
      );

      expect(response.headers.get('X-CFM-Compliant')).toBe('true');
      expect(response.headers.get('X-AI-Medical-Analysis')).toBe('performed');
      expect(response.headers.get('X-LGPD-Compliant')).toBe('true');
      expect(response.headers.get('X-Medical-AI-Logged')).toBe('true');
    });

    it('should validate healthcare professional context for medical analysis', async () => {
      const { default: analyzeRoute } = await import('../analyze');

      const analysisData = {
        analysisType: 'diagnostic_support',
        data: { patientData: 'medical_data' },
      };

      const response = await analyzeRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
            'X-Healthcare-Professional': 'CRM-SP-123456',
            'X-Healthcare-Context': 'diagnostic_support',
          },
          body: JSON.stringify(analysisData),
        }),
      );

      expect(response.status).toBe(200);
      expect(mockAIChatService.analyzeData).toHaveBeenCalledWith(
        expect.objectContaining({
          healthcareProfessional: 'CRM-SP-123456',
          healthcareContext: 'diagnostic_support',
        }),
      );
    });
  });

  describe('Performance and Data Handling', () => {
    it('should include performance headers', async () => {
      const { default: analyzeRoute } = await import('../analyze');

      const analysisData = {
        analysisType: 'structured_data',
        data: { test: 'data' },
      };

      const response = await analyzeRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(analysisData),
        }),
      );

      expect(response.status).toBe(200);
      expect(response.headers.get('X-Response-Time')).toBeDefined();
      expect(response.headers.get('X-AI-Processing-Time')).toBe('1800ms');
      expect(response.headers.get('X-Database-Queries')).toBeDefined();
    });

    it('should handle large data analysis efficiently', async () => {
      const largeData = {
        analysisType: 'structured_data',
        data: {
          patientHistory: Array.from({ length: 100 }, (_, i) => ({
            date: `2024-01-${String(i + 1).padStart(2, '0')}`,
            treatment: `Tratamento ${i + 1}`,
            outcome: 'satisfatório',
          })),
        },
      };

      mockAIChatService.analyzeData.mockResolvedValue({
        success: true,
        data: {
          analysisId: 'large-analysis-123',
          results: { summary: 'Análise de grande volume de dados concluída' },
          metadata: {
            dataPoints: 100,
            processingTime: 8000,
            confidence: 0.88,
          },
        },
      });

      const { default: analyzeRoute } = await import('../analyze');

      const response = await analyzeRoute.request(
        new Request('http://localhost/', {
          method: 'POST',
          headers: {
            authorization: 'Bearer valid-token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(largeData),
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.metadata.dataPoints).toBe(100);
      expect(response.headers.get('X-AI-Data-Points')).toBe('100');
    });
  });
});
