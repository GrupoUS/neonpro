/**
 * Tests for GET /api/v2/ai/insights/{patientId} endpoint (T052)
 * Following TDD methodology - MUST FAIL FIRST
 * Integration with AIChatService and PatientService for AI insights
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the Backend Services
const mockAIChatService = {
  generatePatientInsights: vi.fn(),
  analyzePatientData: vi.fn(),
  validateInsightsAccess: vi.fn(),
};

const mockPatientService = {
  getPatientData: vi.fn(),
  validatePatientExists: vi.fn(),
};

const mockAuditService = {
  logActivity: vi.fn(),
};

const mockLGPDService = {
  validateDataAccess: vi.fn(),
  maskSensitiveData: vi.fn(),
};

describe("GET /api/v2/ai/insights/{patientId} endpoint (T052)", () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Inject mocked services into the endpoint
    const { setServices } = await import("../insights");
    setServices({
      aiChatService: mockAIChatService,
      patientService: mockPatientService,
      auditService: mockAuditService,
      lgpdService: mockLGPDService,
    });

    // Mock successful service responses by default
    mockAIChatService.generatePatientInsights.mockResolvedValue({
      success: true,
      data: {
        patientId: "patient-123",
        insights: {
          riskAssessment: {
            overallRisk: "low",
            riskFactors: [
              {
                factor: "Histórico de alergias",
                severity: "medium",
                confidence: 0.85,
                recommendation:
                  "Realizar teste de alergia antes de procedimentos",
              },
            ],
            riskScore: 0.25,
          },
          treatmentRecommendations: [
            {
              treatment: "Limpeza de pele profunda",
              priority: "high",
              confidence: 0.92,
              reasoning: "Baseado no histórico de acne e tipo de pele oleosa",
              estimatedCost: "R$ 150-200",
              duration: "60 minutos",
            },
            {
              treatment: "Hidratação facial",
              priority: "medium",
              confidence: 0.78,
              reasoning: "Complementar ao tratamento principal",
              estimatedCost: "R$ 80-120",
              duration: "45 minutos",
            },
          ],
          patternAnalysis: {
            treatmentHistory: {
              mostFrequent: "Limpeza de pele",
              frequency: "mensal",
              lastTreatment: "2024-01-10T14:30:00Z",
              adherence: 0.85,
            },
            seasonalPatterns: {
              preferredSeason: "inverno",
              avoidedSeason: "verão",
              reasoning: "Menor exposição solar no inverno",
            },
          },
          predictiveAnalysis: {
            nextAppointmentPrediction: {
              suggestedDate: "2024-02-15T14:30:00Z",
              confidence: 0.88,
              reasoning: "Baseado no padrão histórico de agendamentos",
            },
            treatmentOutcome: {
              expectedImprovement: 0.75,
              timeToResults: "2-3 semanas",
              confidence: 0.82,
            },
          },
        },
        metadata: {
          generatedAt: "2024-01-16T10:30:00Z",
          model: "gpt-4",
          analysisVersion: "2.1",
          dataPoints: 45,
          processingTime: 2500,
          confidence: 0.87,
        },
        complianceInfo: {
          lgpdCompliant: true,
          dataRetention: "7-years",
          consentRequired: true,
          medicalContext: true,
        },
      },
    });

    mockPatientService.getPatientData.mockResolvedValue({
      success: true,
      data: {
        id: "patient-123",
        name: "Maria Santos",
        age: 35,
        skinType: "oleosa",
        medicalHistory: ["Acne", "Melasma"],
        currentTreatments: ["Limpeza de pele"],
        allergies: ["Ácido salicílico"],
        treatmentHistory: [
          {
            date: "2024-01-10T14:30:00Z",
            treatment: "Limpeza de pele",
            outcome: "satisfatório",
          },
        ],
      },
    });

    mockPatientService.validatePatientExists.mockResolvedValue({
      success: true,
      data: { exists: true, patientId: "patient-123" },
    });

    mockAuditService.logActivity.mockResolvedValue({
      success: true,
      data: { auditId: "audit-insights-123" },
    });

    mockLGPDService.validateDataAccess.mockResolvedValue({
      success: true,
      data: { canAccess: true, accessLevel: "full" },
    });

    mockLGPDService.maskSensitiveData.mockImplementation((data) => data);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should export AI insights route handler", async () => {
    const module = await import("../insights");
    expect(module.default).toBeDefined();
  });

  describe("Successful AI Insights Generation", () => {
    it("should generate comprehensive patient insights", async () => {
      const { default: insightsRoute } = await import("../insights");

      const response = await insightsRoute.request(
        new Request("http://localhost/patient-123/insights", {
          method: "GET",
          headers: {
            authorization: "Bearer valid-token",
            "content-type": "application/json",
          },
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.patientId).toBe("patient-123");
      expect(data.data.insights.riskAssessment).toBeDefined();
      expect(data.data.insights.treatmentRecommendations).toHaveLength(2);
      expect(data.data.insights.patternAnalysis).toBeDefined();
      expect(data.data.insights.predictiveAnalysis).toBeDefined();
    });

    it("should generate insights with specific analysis type", async () => {
      const { default: insightsRoute } = await import("../insights");

      const response = await insightsRoute.request(
        new Request(
          "http://localhost/patient-123/insights?analysisType=risk_assessment",
          {
            method: "GET",
            headers: {
              authorization: "Bearer valid-token",
              "content-type": "application/json",
            },
          },
        ),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockAIChatService.generatePatientInsights).toHaveBeenCalledWith({
        patientId: "patient-123",
        userId: "user-123",
        analysisType: "risk_assessment",
        includeRecommendations: true,
      });
    });

    it("should generate insights with time range filter", async () => {
      const { default: insightsRoute } = await import("../insights");

      const response = await insightsRoute.request(
        new Request(
          "http://localhost/patient-123/insights?timeRange=6months&includeHistory=true",
          {
            method: "GET",
            headers: {
              authorization: "Bearer valid-token",
              "content-type": "application/json",
            },
          },
        ),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockAIChatService.generatePatientInsights).toHaveBeenCalledWith({
        patientId: "patient-123",
        userId: "user-123",
        timeRange: "6months",
        includeHistory: true,
        includeRecommendations: true,
      });
    });

    it("should include AI insights performance headers", async () => {
      const { default: insightsRoute } = await import("../insights");

      const response = await insightsRoute.request(
        new Request("http://localhost/patient-123/insights", {
          method: "GET",
          headers: {
            authorization: "Bearer valid-token",
            "content-type": "application/json",
          },
        }),
      );

      expect(response.status).toBe(200);
      expect(response.headers.get("X-AI-Model")).toBe("gpt-4");
      expect(response.headers.get("X-AI-Confidence")).toBe("0.87");
      expect(response.headers.get("X-AI-Data-Points")).toBe("45");
      expect(response.headers.get("X-AI-Processing-Time")).toBe("2500ms");
      expect(response.headers.get("X-Analysis-Version")).toBe("2.1");
    });

    it("should generate insights with healthcare professional context", async () => {
      const { default: insightsRoute } = await import("../insights");

      const response = await insightsRoute.request(
        new Request("http://localhost/patient-123/insights", {
          method: "GET",
          headers: {
            authorization: "Bearer valid-token",
            "content-type": "application/json",
            "X-Healthcare-Professional": "CRM-SP-123456",
            "X-Healthcare-Context": "treatment_planning",
          },
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockAIChatService.generatePatientInsights).toHaveBeenCalledWith(
        expect.objectContaining({
          healthcareProfessional: "CRM-SP-123456",
          healthcareContext: "treatment_planning",
        }),
      );
    });

    it("should cache insights for performance optimization", async () => {
      const { default: insightsRoute } = await import("../insights");

      const response = await insightsRoute.request(
        new Request("http://localhost/patient-123/insights", {
          method: "GET",
          headers: {
            authorization: "Bearer valid-token",
            "content-type": "application/json",
          },
        }),
      );

      expect(response.status).toBe(200);
      expect(response.headers.get("Cache-Control")).toBe(
        "private, max-age=1800",
      );
      expect(response.headers.get("X-Cache-Status")).toBe("miss");
    });
  });

  describe("LGPD Compliance and Data Access", () => {
    it("should validate LGPD data access for patient insights", async () => {
      const { default: insightsRoute } = await import("../insights");

      await insightsRoute.request(
        new Request("http://localhost/patient-123/insights", {
          method: "GET",
          headers: {
            authorization: "Bearer valid-token",
            "content-type": "application/json",
          },
        }),
      );

      expect(mockLGPDService.validateDataAccess).toHaveBeenCalledWith({
        userId: "user-123",
        patientId: "patient-123",
        dataType: "ai_patient_insights",
        purpose: "healthcare_analysis",
        legalBasis: "legitimate_interest",
      });
    });

    it("should log insights access for audit trail", async () => {
      const { default: insightsRoute } = await import("../insights");

      await insightsRoute.request(
        new Request(
          "http://localhost/patient-123/insights?analysisType=risk_assessment",
          {
            method: "GET",
            headers: {
              authorization: "Bearer valid-token",
              "content-type": "application/json",
              "X-Real-IP": "192.168.1.100",
              "User-Agent": "Mozilla/5.0",
            },
          },
        ),
      );

      expect(mockAuditService.logActivity).toHaveBeenCalledWith({
        userId: "user-123",
        action: "ai_patient_insights_access",
        resourceType: "ai_insights",
        resourceId: "patient-123",
        details: {
          analysisType: "risk_assessment",
          dataPoints: 45,
          confidence: 0.87,
          processingTime: 2500,
          insightsGenerated: true,
        },
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0",
        complianceContext: "LGPD",
        sensitivityLevel: "critical",
      });
    });

    it("should handle LGPD access denial for insights", async () => {
      mockLGPDService.validateDataAccess.mockResolvedValue({
        success: false,
        error: "Acesso negado para insights de IA por política LGPD",
        code: "LGPD_AI_INSIGHTS_DENIED",
      });

      const { default: insightsRoute } = await import("../insights");

      const response = await insightsRoute.request(
        new Request("http://localhost/patient-123/insights", {
          method: "GET",
          headers: {
            authorization: "Bearer valid-token",
            "content-type": "application/json",
          },
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toContain("LGPD");
      expect(data.code).toBe("LGPD_AI_INSIGHTS_DENIED");
    });

    it("should mask sensitive data in insights based on access level", async () => {
      mockLGPDService.validateDataAccess.mockResolvedValue({
        success: true,
        data: { canAccess: true, accessLevel: "limited" },
      });

      mockLGPDService.maskSensitiveData.mockReturnValue({
        riskAssessment: {
          overallRisk: "low",
          riskFactors: [
            {
              factor: "Histórico de ***",
              severity: "medium",
              confidence: 0.85,
            },
          ],
        },
        treatmentRecommendations: [
          {
            treatment: "Tratamento recomendado",
            priority: "high",
            estimatedCost: "***",
          },
        ],
      });

      const { default: insightsRoute } = await import("../insights");

      const response = await insightsRoute.request(
        new Request("http://localhost/patient-123/insights", {
          method: "GET",
          headers: {
            authorization: "Bearer limited-token",
            "content-type": "application/json",
          },
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.insights.riskAssessment.riskFactors[0].factor).toContain(
        "***",
      );
      expect(response.headers.get("X-Access-Level")).toBe("limited");
    });
  });

  describe("Error Handling", () => {
    it("should handle authentication errors", async () => {
      const { default: insightsRoute } = await import("../insights");

      const response = await insightsRoute.request(
        new Request("http://localhost/patient-123/insights", {
          method: "GET",
          headers: {
            "content-type": "application/json",
          },
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Não autorizado");
    });

    it("should handle patient not found errors", async () => {
      mockPatientService.validatePatientExists.mockResolvedValue({
        success: false,
        error: "Paciente não encontrado",
        code: "PATIENT_NOT_FOUND",
      });

      const { default: insightsRoute } = await import("../insights");

      const response = await insightsRoute.request(
        new Request("http://localhost/nonexistent-patient/insights", {
          method: "GET",
          headers: {
            authorization: "Bearer valid-token",
            "content-type": "application/json",
          },
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Paciente não encontrado");
      expect(data.code).toBe("PATIENT_NOT_FOUND");
    });

    it("should handle AI service errors gracefully", async () => {
      mockAIChatService.generatePatientInsights.mockResolvedValue({
        success: false,
        error: "Erro interno do serviço de insights de IA",
      });

      const { default: insightsRoute } = await import("../insights");

      const response = await insightsRoute.request(
        new Request("http://localhost/patient-123/insights", {
          method: "GET",
          headers: {
            authorization: "Bearer valid-token",
            "content-type": "application/json",
          },
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Erro interno");
    });

    it("should handle insufficient patient data", async () => {
      mockPatientService.getPatientData.mockResolvedValue({
        success: true,
        data: {
          id: "patient-minimal",
          name: "Paciente Novo",
          // Minimal data - insufficient for insights
        },
      });

      mockAIChatService.generatePatientInsights.mockResolvedValue({
        success: false,
        error: "Dados insuficientes para gerar insights",
        code: "INSUFFICIENT_DATA",
      });

      const { default: insightsRoute } = await import("../insights");

      const response = await insightsRoute.request(
        new Request("http://localhost/patient-minimal/insights", {
          method: "GET",
          headers: {
            authorization: "Bearer valid-token",
            "content-type": "application/json",
          },
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(422);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Dados insuficientes");
      expect(data.code).toBe("INSUFFICIENT_DATA");
    });
  });

  describe("Brazilian Healthcare Compliance", () => {
    it("should include CFM compliance headers", async () => {
      const { default: insightsRoute } = await import("../insights");

      const response = await insightsRoute.request(
        new Request("http://localhost/patient-123/insights", {
          method: "GET",
          headers: {
            authorization: "Bearer valid-token",
            "content-type": "application/json",
          },
        }),
      );

      expect(response.headers.get("X-CFM-Compliant")).toBe("true");
      expect(response.headers.get("X-AI-Medical-Insights")).toBe("generated");
      expect(response.headers.get("X-LGPD-Compliant")).toBe("true");
      expect(response.headers.get("X-Medical-AI-Logged")).toBe("true");
    });

    it("should validate healthcare professional context for medical insights", async () => {
      const { default: insightsRoute } = await import("../insights");

      const response = await insightsRoute.request(
        new Request(
          "http://localhost/patient-123/insights?analysisType=diagnostic_support",
          {
            method: "GET",
            headers: {
              authorization: "Bearer valid-token",
              "content-type": "application/json",
              "X-Healthcare-Professional": "CRM-SP-123456",
              "X-Healthcare-Context": "diagnostic_support",
            },
          },
        ),
      );

      expect(response.status).toBe(200);
      expect(mockAIChatService.generatePatientInsights).toHaveBeenCalledWith(
        expect.objectContaining({
          healthcareProfessional: "CRM-SP-123456",
          healthcareContext: "diagnostic_support",
        }),
      );
    });

    it("should include data retention policy information", async () => {
      const { default: insightsRoute } = await import("../insights");

      const response = await insightsRoute.request(
        new Request("http://localhost/patient-123/insights", {
          method: "GET",
          headers: {
            authorization: "Bearer valid-token",
            "content-type": "application/json",
          },
        }),
      );

      expect(response.status).toBe(200);
      expect(response.headers.get("X-Data-Retention-Policy")).toBe(
        "7-years-standard-20-years-medical",
      );
      expect(response.headers.get("X-Legal-Basis")).toBe("legitimate_interest");
      expect(response.headers.get("X-Consent-Required")).toBe("true");
    });
  });

  describe("Performance and Caching", () => {
    it("should include performance headers", async () => {
      const { default: insightsRoute } = await import("../insights");

      const response = await insightsRoute.request(
        new Request("http://localhost/patient-123/insights", {
          method: "GET",
          headers: {
            authorization: "Bearer valid-token",
            "content-type": "application/json",
          },
        }),
      );

      expect(response.status).toBe(200);
      expect(response.headers.get("X-Response-Time")).toBeDefined();
      expect(response.headers.get("X-AI-Processing-Time")).toBe("2500ms");
      expect(response.headers.get("X-Database-Queries")).toBeDefined();
    });

    it("should handle large datasets efficiently", async () => {
      mockAIChatService.generatePatientInsights.mockResolvedValue({
        success: true,
        data: {
          patientId: "patient-large-data",
          insights: {
            // Large dataset simulation
            riskAssessment: { overallRisk: "medium" },
            treatmentRecommendations: Array.from({ length: 20 }, (_, i) => ({
              treatment: `Tratamento ${i + 1}`,
              priority: "medium",
              confidence: 0.8,
            })),
          },
          metadata: {
            dataPoints: 500,
            processingTime: 5000,
            confidence: 0.85,
          },
        },
      });

      const { default: insightsRoute } = await import("../insights");

      const response = await insightsRoute.request(
        new Request("http://localhost/patient-large-data/insights", {
          method: "GET",
          headers: {
            authorization: "Bearer valid-token",
            "content-type": "application/json",
          },
        }),
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.insights.treatmentRecommendations).toHaveLength(20);
      expect(data.data.metadata.dataPoints).toBe(500);
      expect(response.headers.get("X-AI-Data-Points")).toBe("500");
    });
  });
});
