/**
 * Anti-No-Show Engine Test Suite
 * Tests AI-powered prediction and intervention system for aesthetic clinics
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AntiNoShowEngine } from "../services/anti-no-show-engine";
import type {
  NoShowPredictionInput,
  NoShowRiskResult,
  InterventionConfig,
  InterventionResult,
  AestheticProcedureCategory,
  RiskLevel,
} from "../services/anti-no-show-engine";

// Mock ML Provider
const mockMLProvider = {
  predict: vi.fn(),
  batchPredict: vi.fn(),
  validateInput: vi.fn(),
  healthCheck: vi.fn().mockResolvedValue({ status: "healthy" }),
  initialize: vi.fn(),
  dispose: vi.fn(),
  metadata: {
    id: "test-no-show-model",
    name: "No-Show Prediction Model",
    version: "1.0.0",
    type: "random_forest",
    description: "Predicts no-show risk for aesthetic clinic appointments",
    trainedAt: new Date(),
    supportedTypes: ["no_show_risk"],
    requiredFeatures: ["appointment_history", "procedure_category", "time_until_appointment"],
  },
};

// Mock WhatsApp Service
const mockWhatsAppService = {
  sendAppointmentReminder: vi.fn(),
  sendRescheduleOption: vi.fn(),
  sendPreAppointmentInstructions: vi.fn(),
  sendPostAppointmentFollowUp: vi.fn(),
  healthCheck: vi.fn().mockResolvedValue({ status: "healthy" }),
};

// Mock Analytics Service
const mockAnalyticsService = {
  trackEvent: vi.fn(),
  trackMetrics: vi.fn(),
  calculateEffectiveness: vi.fn(),
};

describe("AntiNoShowEngine", () => {
  let antiNoShowEngine: AntiNoShowEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    antiNoShowEngine = new AntiNoShowEngine(
      mockMLProvider as any,
      mockWhatsAppService as any,
      mockAnalyticsService as any,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Constructor", () => {
    it("should initialize with required services", () => {
      expect(antiNoShowEngine).toBeInstanceOf(AntiNoShowEngine);
    });

    it("should throw error if ML provider is missing", () => {
      expect(() => {
        new AntiNoShowEngine(
          null as any,
          mockWhatsAppService as any,
          mockAnalyticsService as any,
        );
      }).toThrow("ML provider is required");
    });
  });

  describe("predictNoShowRisk", () => {
    const validInput: NoShowPredictionInput = {
      patientId: "patient-123",
      appointmentId: "appointment-456",
      procedureCategory: "botox" as AestheticProcedureCategory,
      scheduledDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      patientHistory: {
        totalAppointments: 10,
        noShows: 2,
        cancellations: 1,
        lastVisit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        preferredContactMethod: "whatsapp",
      },
      appointmentDetails: {
        duration: 60, // minutes
        cost: 1500, // BRL
        isFirstVisit: false,
        requiresPreparation: true,
      },
    };

    it("should predict no-show risk successfully", async () => {
      const mockPrediction = {
        prediction: 0.35,
        confidence: 0.85,
        confidenceLevel: "high" as const,
        featureImportance: [
          { feature: "appointment_history", importance: 0.4, description: "Patient's past appointment behavior" },
          { feature: "time_until_appointment", importance: 0.3, description: "Time until scheduled appointment" },
        ],
        timestamp: new Date(),
      };

      mockMLProvider.predict.mockResolvedValue(mockPrediction);

      const result = await antiNoShowEngine.predictNoShowRisk(validInput);

      expect(result).toMatchObject({
        patientId: "patient-123",
        appointmentId: "appointment-456",
        riskScore: 0.35,
        riskLevel: "medium",
        confidence: 0.85,
        contributingFactors: expect.arrayContaining([
          expect.objectContaining({ factor: "appointment_history", impact: 0.4 }),
        ]),
        recommendations: expect.arrayContaining([
          expect.stringContaining("enviar lembrete via WhatsApp"),
        ]),
        timestamp: expect.any(Date),
      });

      expect(mockMLProvider.predict).toHaveBeenCalledWith({
        type: "no_show_risk",
        features: expect.objectContaining({
          appointment_history: expect.any(Object),
          procedure_category: "botox",
          time_until_appointment: expect.any(Number),
        }),
        patientId: "patient-123",
        metadata: expect.objectContaining({
          procedure_category: "botox",
          cost_brl: 1500,
        }),
      });
    });

    it("should handle high risk scenarios", async () => {
      const highRiskInput = {
        ...validInput,
        patientHistory: {
          ...validInput.patientHistory,
          totalAppointments: 5,
          noShows: 4, // 80% no-show rate
          lastVisit: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        },
        scheduledDateTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      };

      const mockPrediction = {
        prediction: 0.85,
        confidence: 0.90,
        confidenceLevel: "high" as const,
        timestamp: new Date(),
      };

      mockMLProvider.predict.mockResolvedValue(mockPrediction);

      const result = await antiNoShowEngine.predictNoShowRisk(highRiskInput);

      expect(result.riskLevel).toBe("high");
      expect(result.riskScore).toBe(0.85);
      expect(result.recommendations).toEqual([
          'enviar lembrete via WhatsApp 24 horas antes do atendimento',
          'Ligação telefônica pessoal recomendada',
          'Enviar confirmação imediata',
          'Considerar oferecer reembolso parcial em caso de cancelamento',
        ]);
    });

    it("should handle low risk scenarios", async () => {
      const lowRiskInput = {
        ...validInput,
        patientHistory: {
          ...validInput.patientHistory,
          totalAppointments: 20,
          noShows: 0, // Perfect attendance
          cancellations: 0,
          lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        },
      };

      const mockPrediction = {
        prediction: 0.10,
        confidence: 0.80,
        confidenceLevel: "high" as const,
        timestamp: new Date(),
      };

      mockMLProvider.predict.mockResolvedValue(mockPrediction);

      const result = await antiNoShowEngine.predictNoShowRisk(lowRiskInput);

      expect(result.riskLevel).toBe("low");
      expect(result.riskScore).toBe(0.10);
      expect(result.recommendations).toEqual([
          'Lembrete padrão via WhatsApp'
        ]);
    });

    it("should handle ML prediction errors gracefully", async () => {
      mockMLProvider.predict.mockRejectedValue(new Error("ML service unavailable"));

      const result = await antiNoShowEngine.predictNoShowRisk(validInput);

      expect(result.riskScore).toBe(0.5); // Default fallback
      expect(result.riskLevel).toBe("medium");
      expect(result.recommendations).toEqual(
        expect.arrayContaining([
          expect.stringContaining("erro na previsão"),
        ]),
      );
    });

    it("should validate required input fields", async () => {
      const invalidInput = {
        ...validInput,
        patientId: "",
      };

      await expect(antiNoShowEngine.predictNoShowRisk(invalidInput as any)).rejects.toThrow(
        "Patient ID is required",
      );
    });
  });

  describe("getInterventionConfig", () => {
    it("should return low risk intervention config", () => {
      const config = antiNoShowEngine["getInterventionConfig"]("low");

      expect(config).toMatchObject({
        riskLevel: "low",
        enabledChannels: expect.arrayContaining(["whatsapp", "sms"]),
        timing: expect.objectContaining({
          initialReminder: expect.any(Number),
          followUp: expect.any(Number),
        }),
        interventions: expect.arrayContaining([
          expect.objectContaining({ type: "whatsapp_reminder" }),
        ]),
      });
    });

    it("should return medium risk intervention config", () => {
      const config = antiNoShowEngine["getInterventionConfig"]("medium");

      expect(config.riskLevel).toBe("medium");
      expect(config.enabledChannels).toEqual(expect.arrayContaining(["whatsapp", "sms", "email"]));
      expect(config.interventions.length).toBeGreaterThan(3);
    });

    it("should return high risk intervention config", () => {
      const config = antiNoShowEngine["getInterventionConfig"]("high");

      expect(config.riskLevel).toBe("high");
      expect(config.enabledChannels).toEqual(expect.arrayContaining(["whatsapp", "sms", "email", "phone"]));
      expect(config.interventions.length).toBeGreaterThan(4);
    });
  });

  describe("executeInterventions", () => {
    const riskResult: NoShowRiskResult = {
      patientId: "patient-123",
      appointmentId: "appointment-456",
      riskScore: 0.25,
      riskLevel: "low", // Changed from high to low for basic intervention test
      confidence: 0.90,
      contributingFactors: [
        { factor: "low_no_show_history", impact: 0.2, description: "Patient has good attendance" },
      ],
      recommendations: ["Lembrete padrão via WhatsApp"],
      optimalInterventionTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      timestamp: new Date(),
    };

    // High risk variant for tests that need it
    const highRiskResult: NoShowRiskResult = {
      patientId: "patient-123",
      appointmentId: "appointment-456",
      riskScore: 0.75,
      riskLevel: "high",
      confidence: 0.90,
      contributingFactors: [
        { factor: "high_no_show_history", impact: 0.4, description: "Patient has missed 80% of appointments" },
        { factor: "last_minute_scheduling", impact: 0.3, description: "Appointment scheduled very recently" },
      ],
      recommendations: ["Ligação telefônica pessoal recomendada", "Enviar lembrete via WhatsApp"],
      optimalInterventionTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      timestamp: new Date(),
    };

    const patientContact = {
      phone: "+5511987654321",
      email: "patient@example.com",
      whatsapp: "+5511987654321",
    };

    it("should execute interventions successfully", async () => {
      mockWhatsAppService.sendAppointmentReminder.mockResolvedValue({ success: true, messageId: "msg-123" });

      const results = await antiNoShowEngine.executeInterventions(riskResult, patientContact);

      expect(results).toHaveLength(1); // Low risk only has WhatsApp intervention
      expect(results[0]).toMatchObject({
        type: "whatsapp_reminder",
        status: "success",
        cost: expect.any(Number),
      });

      expect(mockWhatsAppService.sendAppointmentReminder).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "+5511987654321",
          appointmentId: "appointment-456",
          procedureCategory: expect.any(String),
        }),
      );
    });

    it("should handle intervention failures gracefully", async () => {
      mockWhatsAppService.sendAppointmentReminder.mockRejectedValue(new Error("WhatsApp service unavailable"));

      const results = await antiNoShowEngine.executeInterventions(riskResult, patientContact);

      expect(results[0]).toMatchObject({
        type: "whatsapp_reminder",
        status: "failed",
        error: expect.stringContaining("WhatsApp service unavailable"),
      });
    });

    it("should track intervention effectiveness", async () => {
      mockWhatsAppService.sendAppointmentReminder.mockResolvedValue({ success: true, messageId: "msg-123" });

      await antiNoShowEngine.executeInterventions(riskResult, patientContact);

      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "intervention_executed",
          interventionType: "whatsapp_reminder",
          riskLevel: "low",
          successCount: 1,
        }),
      );
    });

    it("should skip channels not in config", async () => {
      const config = antiNoShowEngine["config"];
      config.enabledChannels = ["email"]; // Only email enabled (but using low risk which has no email)

      const results = await antiNoShowEngine.executeInterventions(riskResult, patientContact);

      expect(results).toHaveLength(0); // No email service configured for low risk
      expect(mockWhatsAppService.sendAppointmentReminder).not.toHaveBeenCalled();
    });
  });

  describe("analyzeEffectiveness", () => {
    it("should calculate intervention effectiveness", async () => {
      const interventions: InterventionResult[] = [
        {
          type: "whatsapp_reminder",
          status: "success",
          cost: 0.50,
          timestamp: new Date(),
        },
        {
          type: "phone_call",
          status: "success",
          cost: 5.00,
          timestamp: new Date(),
        },
      ];

      const outcome = {
        patientShowed: true,
        onTime: true,
        satisfaction: 5,
      };

      mockAnalyticsService.calculateEffectiveness.mockResolvedValue({
        totalCost: 5.50,
        successRate: 1.0,
        roi: 1450, // Based on appointment value
      });

      const effectiveness = await antiNoShowEngine.analyzeEffectiveness(
        interventions,
        outcome,
        1500, // Appointment value
      );

      expect(effectiveness).toMatchObject({
        totalCost: 5.50,
        successRate: 1.0,
        roi: expect.any(Number),
        recommendations: expect.arrayContaining([
          "Continuar usando as estratégias atuais de intervenção",
        ]),
      });
    });

    it("should handle failed interventions", async () => {
      const interventions: InterventionResult[] = [
        {
          type: "whatsapp_reminder",
          status: "failed",
          cost: 0,
          timestamp: new Date(),
          error: "Service unavailable",
        },
      ];

      const outcome = {
        patientShowed: false,
        onTime: false,
        satisfaction: 0,
      };

      const effectiveness = await antiNoShowEngine.analyzeEffectiveness(
        interventions,
        outcome,
        1500,
      );

      expect(effectiveness.successRate).toBe(0);
      expect(effectiveness.recommendations).toEqual(
        expect.arrayContaining([
          expect.stringContaining("alternativas de comunicação"),
        ]),
      );
    });
  });

  describe("getOptimalInterventionTime", () => {
    it("should return optimal time for low risk", () => {
      const appointmentTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      const optimalTime = antiNoShowEngine["getOptimalInterventionTime"]("low", appointmentTime);

      const hoursDiff = (appointmentTime.getTime() - optimalTime.getTime()) / (1000 * 60 * 60);
      expect(hoursDiff).toBeCloseTo(24, 1); // 24 hours before
    });

    it("should return optimal time for high risk", () => {
      const appointmentTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      const optimalTime = antiNoShowEngine["getOptimalInterventionTime"]("high", appointmentTime);

      const hoursDiff = (appointmentTime.getTime() - optimalTime.getTime()) / (1000 * 60 * 60);
      expect(hoursDiff).toBeCloseTo(72, 1); // 72 hours before for high risk
    });
  });

  describe("calculateCost", () => {
    it("should calculate intervention cost correctly", () => {
      const cost = antiNoShowEngine["calculateCost"]("whatsapp", "success");
      expect(cost).toBe(0.50);

      const phoneCost = antiNoShowEngine["calculateCost"]("phone_call", "success");
      expect(phoneCost).toBe(5.00);

      const failedCost = antiNoShowEngine["calculateCost"]("whatsapp", "failed");
      expect(failedCost).toBe(0); // No cost for failed interventions
    });
  });

  describe("healthCheck", () => {
    it("should return healthy status when all services are healthy", async () => {
      const health = await antiNoShowEngine.healthCheck();

      expect(health.status).toBe("healthy");
      expect(health.services.ml).toBe("healthy");
      expect(health.services.whatsapp).toBe("healthy");
      expect(health.timestamp).toBeInstanceOf(Date);
    });

    it("should return degraded status when ML service is unhealthy", async () => {
      mockMLProvider.healthCheck.mockResolvedValue({ status: "degraded" });

      const health = await antiNoShowEngine.healthCheck();

      expect(health.status).toBe("degraded");
      expect(health.services.ml).toBe("degraded");
    });

    it("should return unhealthy status when WhatsApp service is unhealthy", async () => {
      mockWhatsAppService.healthCheck.mockResolvedValue({ status: "unhealthy" });

      const health = await antiNoShowEngine.healthCheck();

      expect(health.status).toBe("unhealthy");
      expect(health.services.whatsapp).toBe("unhealthy");
    });
  });

  describe("Error Handling", () => {
    it("should handle missing patient contact information", async () => {
      const riskResult: NoShowRiskResult = {
        patientId: "patient-123",
        appointmentId: "appointment-456",
        riskScore: 0.75,
        riskLevel: "high",
        confidence: 0.90,
        contributingFactors: [],
        recommendations: [],
        timestamp: new Date(),
      };

      const invalidContact = {
        phone: "",
        email: "",
      };

      const results = await antiNoShowEngine.executeInterventions(riskResult, invalidContact);

      expect(results).toHaveLength(0);
    });

    it("should handle invalid appointment dates", async () => {
      const invalidInput: NoShowPredictionInput = {
        patientId: "patient-123",
        appointmentId: "appointment-456",
        procedureCategory: "botox" as AestheticProcedureCategory,
        scheduledDateTime: new Date(Date.now() - 60 * 60 * 1000), // Past date
        patientHistory: {
          totalAppointments: 10,
          noShows: 2,
          cancellations: 1,
          lastVisit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          preferredContactMethod: "whatsapp",
        },
        appointmentDetails: {
          duration: 60,
          cost: 1500,
          isFirstVisit: false,
          requiresPreparation: true,
        },
      };

      await expect(antiNoShowEngine.predictNoShowRisk(invalidInput)).rejects.toThrow(
        "Appointment must be in the future",
      );
    });
  });

  describe("Integration Scenarios", () => {
    it("should handle complete workflow from prediction to intervention", async () => {
      // Setup prediction
      const input: NoShowPredictionInput = {
        patientId: "patient-123",
        appointmentId: "appointment-456",
        procedureCategory: "fillers" as AestheticProcedureCategory,
        scheduledDateTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
        patientHistory: {
          totalAppointments: 8,
          noShows: 3,
          cancellations: 1,
          lastVisit: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          preferredContactMethod: "whatsapp",
        },
        appointmentDetails: {
          duration: 90,
          cost: 2500,
          isFirstVisit: false,
          requiresPreparation: true,
        },
      };

      const mockPrediction = {
        prediction: 0.25,
        confidence: 0.88,
        confidenceLevel: "high" as const,
        featureImportance: [],
        timestamp: new Date(),
      };

      mockMLProvider.predict.mockResolvedValue(mockPrediction);
      mockWhatsAppService.sendAppointmentReminder.mockResolvedValue({ success: true, messageId: "msg-123" });

      // Execute workflow
      const riskResult = await antiNoShowEngine.predictNoShowRisk(input);
      const interventions = await antiNoShowEngine.executeInterventions(riskResult, {
        phone: "+5511987654321",
        whatsapp: "+5511987654321",
      });

      // Verify complete workflow
      expect(riskResult.riskLevel).toBe("low");
      expect(interventions).toHaveLength(1);
      expect(interventions[0].status).toBe("success");
      expect(mockAnalyticsService.trackEvent).toHaveBeenCalled();
    });

    it("should handle aesthetic procedure specific logic", async () => {
      const botoxInput: NoShowPredictionInput = {
        patientId: "patient-123",
        appointmentId: "appointment-456",
        procedureCategory: "botox" as AestheticProcedureCategory,
        scheduledDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        patientHistory: {
          totalAppointments: 15,
          noShows: 1,
          cancellations: 2,
          lastVisit: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          preferredContactMethod: "whatsapp",
        },
        appointmentDetails: {
          duration: 30,
          cost: 800,
          isFirstVisit: false,
          requiresPreparation: false,
        },
      };

      const mockPrediction = {
        prediction: 0.25,
        confidence: 0.82,
        confidenceLevel: "high" as const,
        timestamp: new Date(),
      };

      mockMLProvider.predict.mockResolvedValue(mockPrediction);

      const result = await antiNoShowEngine.predictNoShowRisk(botoxInput);

      // Botox should have lower risk due to quick procedure and lower cost
      expect(result.riskScore).toBe(0.25);
      expect(result.riskLevel).toBe("low");
      expect(result.recommendations).toEqual([
          'Lembrete padrão via WhatsApp'
        ]);
    });
  });
});