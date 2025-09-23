/**
 * Predictive Client Analytics Service Tests
 *
 * Comprehensive test suite for predictive client analytics including
 * retention prediction, engagement metrics, and AI-powered recommendations
 */

import { describe, it, expect, beforeEach, jest, afterEach } from "vitest";
import { PredictiveClientAnalyticsService } from "../../services/predictive-client-analytics.service";

// Mock dependencies
const mockDatabase = {
  query: jest.fn(),
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  aggregate: jest.fn(),
};

const mockMachineLearningService = {
  predict: jest.fn(),
  train: jest.fn(),
  evaluate: jest.fn(),
  getFeatureImportance: jest.fn(),
};

const mockAuditService = {
  logEvent: jest.fn(),
};

const mockConfig = {
  predictionModels: {
    retention: {
      algorithm: "random_forest",
      version: "v2.1",
      features: [
        "appointment_attendance_rate",
        "response_rate",
        "payment_reliability",
        "treatment_progress",
        "communication_frequency",
        "satisfaction_score",
        "time_since_last_appointment",
        "cancellation_rate",
      ],
      thresholds: {
        lowRisk: 0.3,
        mediumRisk: 0.7,
        highRisk: 1.0,
      },
    },
  },
  analytics: {
    engagement: {
      metrics: [
        "appointment_attendance",
        "response_rate",
        "communication_frequency",
        "time_between_appointments",
      ],
      weights: {
        appointment_attendance: 0.4,
        response_rate: 0.3,
        communication_frequency: 0.2,
        time_between_appointments: 0.1,
      },
    },
    financial: {
      metrics: [
        "payment_reliability",
        "average_payment_amount",
        "outstanding_balance",
        "payment_frequency",
      ],
    },
  },
  batchProcessing: {
    maxBatchSize: 1000,
    timeout: 300000, // 5 minutes
    concurrency: 5,
  },
};

describe("PredictiveClientAnalyticsService", () => {
  let analyticsService: PredictiveClientAnalyticsService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    analyticsService = new PredictiveClientAnalyticsService(
      mockDatabase as any,
      mockMachineLearningService as any,
      mockAuditService as any,
      mockConfig,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  describe("Service Initialization", () => {
    it("should initialize with correct dependencies", () => {
      expect(analyticsService).toBeInstanceOf(PredictiveClientAnalyticsService);
      expect(analyticsService["database"]).toBe(mockDatabase);
      expect(analyticsService["mlService"]).toBe(mockMachineLearningService);
      expect(analyticsService["auditService"]).toBe(mockAuditService);
    });

    it("should have default configuration", () => {
      expect(analyticsService["config"]).toEqual(mockConfig);
      expect(analyticsService["models"]).toBeDefined();
      expect(analyticsService["metrics"]).toBeDefined();
    });
  });

  describe("Retention Prediction", () => {
    const mockFeatures = {
      appointmentHistory: {
        totalAppointments: 12,
        noShowCount: 1,
        cancellationCount: 2,
        rescheduleCount: 1,
        averageTimeBetweenAppointments: 30,
        lastAppointmentDate: "2024-01-01T00:00:00Z",
        nextAppointmentDate: "2024-02-01T00:00:00Z",
      },
      communicationHistory: {
        totalMessages: 24,
        responseRate: 0.92,
        averageResponseTime: 2.5,
        preferredChannel: "whatsapp",
        lastCommunicationDate: "2024-01-15T00:00:00Z",
      },
      paymentHistory: {
        totalPayments: 10,
        missedPayments: 1,
        averagePaymentAmount: 500,
        lastPaymentDate: "2024-01-10T00:00:00Z",
        outstandingBalance: 250,
      },
      treatmentProgress: {
        completedTreatments: 8,
        scheduledTreatments: 4,
        treatmentPlanAdherence: 0.85,
        satisfactionScore: 4.2,
        lastTreatmentDate: "2024-01-01T00:00:00Z",
      },
      demographicData: {
        age: 34,
        gender: "male",
        location: "São Paulo",
        socioeconomicIndicator: "B2",
      },
    };

    describe("predictClientRetention", () => {
      it("should predict low retention risk successfully", async () => {
        const mockMLPrediction = {
          prediction: 0.15,
          confidence: 0.89,
          featureImportance: [
            { feature: "appointment_attendance_rate", importance: 0.3 },
            { feature: "response_rate", importance: 0.25 },
            { feature: "payment_reliability", importance: 0.2 },
          ],
        };

        mockMachineLearningService.predict.mockResolvedValue(mockMLPrediction);

        const result = await analyticsService.predictClientRetention(
          "client-123",
          mockFeatures,
        );

        expect(result).toEqual({
          clientId: "client-123",
          prediction: {
            riskLevel: "low",
            riskScore: 0.15,
            confidence: 0.89,
            factors: expect.arrayContaining([
              expect.objectContaining({
                factor: "High appointment attendance",
                impact: "positive",
                weight: expect.any(Number),
              }),
              expect.objectContaining({
                factor: "Strong communication engagement",
                impact: "positive",
                weight: expect.any(Number),
              }),
            ]),
          },
          recommendations: expect.arrayContaining([
            expect.objectContaining({
              type: "communication",
              priority: "low",
              title: "Maintain current engagement",
            }),
          ]),
          nextReviewDate: expect.any(String),
          modelVersion: "v2.1",
          processingTime: expect.any(Number),
        });

        expect(mockMachineLearningService.predict).toHaveBeenCalledWith(
          "retention",
          expect.objectContaining({
            appointment_attendance_rate: expect.any(Number),
            response_rate: expect.any(Number),
            payment_reliability: expect.any(Number),
          }),
        );

        expect(mockAuditService.logEvent).toHaveBeenCalledWith({
          action: "RETENTION_PREDICTION_GENERATED",
          resourceType: "client_prediction",
          resourceId: "client-123",
          details: {
            riskLevel: "low",
            riskScore: 0.15,
            confidence: 0.89,
            modelVersion: "v2.1",
          },
        });
      });

      it("should predict medium retention risk", async () => {
        const mockMLPrediction = {
          prediction: 0.45,
          confidence: 0.76,
          featureImportance: [
            { feature: "cancellation_rate", importance: 0.4 },
            { feature: "time_since_last_appointment", importance: 0.3 },
          ],
        };

        mockMachineLearningService.predict.mockResolvedValue(mockMLPrediction);

        const result = await analyticsService.predictClientRetention(
          "client-123",
          mockFeatures,
        );

        expect(result.prediction.riskLevel).toBe("medium");
        expect(result.recommendations).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: "intervention",
              priority: "medium",
              title: "Increase engagement frequency",
            }),
          ]),
        );
      });

      it("should predict high retention risk", async () => {
        const mockMLPrediction = {
          prediction: 0.85,
          confidence: 0.92,
          featureImportance: [
            { feature: "no_show_rate", importance: 0.5 },
            { feature: "outstanding_balance", importance: 0.3 },
          ],
        };

        mockMachineLearningService.predict.mockResolvedValue(mockMLPrediction);

        const result = await analyticsService.predictClientRetention(
          "client-123",
          mockFeatures,
        );

        expect(result.prediction.riskLevel).toBe("high");
        expect(result.recommendations).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: "intervention",
              priority: "high",
              title: "Immediate intervention required",
            }),
          ]),
        );
      });

      it("should handle missing features gracefully", async () => {
        const incompleteFeatures = {
          appointmentHistory: {
            totalAppointments: 5,
          },
          // Missing other required feature groups
        };

        const result = await analyticsService.predictClientRetention(
          "client-123",
          incompleteFeatures,
        );

        expect(result).toEqual({
          clientId: "client-123",
          prediction: {
            riskLevel: "unknown",
            riskScore: 0.5,
            confidence: 0.5,
            factors: [
              expect.objectContaining({
                factor: "Insufficient data for prediction",
                impact: "neutral",
                weight: 1.0,
              }),
            ],
          },
          recommendations: [
            expect.objectContaining({
              type: "data_collection",
              priority: "high",
              title: "Collect more client interaction data",
            }),
          ],
          modelVersion: "v2.1",
          processingTime: expect.any(Number),
        });
      });

      it("should handle ML service errors", async () => {
        mockMachineLearningService.predict.mockRejectedValue(
          new Error("ML service unavailable"),
        );

        const result = await analyticsService.predictClientRetention(
          "client-123",
          mockFeatures,
        );

        expect(result).toEqual({
          clientId: "client-123",
          prediction: {
            riskLevel: "unknown",
            riskScore: 0.5,
            confidence: 0,
            factors: [
              expect.objectContaining({
                factor: "Prediction service unavailable",
                impact: "negative",
                weight: 1.0,
              }),
            ],
          },
          recommendations: [
            expect.objectContaining({
              type: "system_maintenance",
              priority: "high",
              title: "Restore prediction service",
            }),
          ],
          modelVersion: "v2.1",
          processingTime: expect.any(Number),
        });
      });
    });

    describe("calculateRiskFactors", () => {
      it("should analyze appointment history factors", () => {
        const appointmentHistory = {
          totalAppointments: 12,
          noShowCount: 1,
          cancellationCount: 2,
          rescheduleCount: 1,
        };

        const factors = (analyticsService as any).calculateRiskFactors({
          appointmentHistory,
        });

        expect(factors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              factor: expect.stringContaining("appointment attendance"),
              impact: "positive",
            }),
          ]),
        );
      });

      it("should analyze communication factors", () => {
        const communicationHistory = {
          totalMessages: 24,
          responseRate: 0.92,
          averageResponseTime: 2.5,
        };

        const factors = (analyticsService as any).calculateRiskFactors({
          communicationHistory,
        });

        expect(factors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              factor: expect.stringContaining("communication engagement"),
              impact: expect.any(String),
            }),
          ]),
        );
      });

      it("should analyze payment factors", () => {
        const paymentHistory = {
          totalPayments: 10,
          missedPayments: 1,
          outstandingBalance: 250,
        };

        const factors = (analyticsService as any).calculateRiskFactors({
          paymentHistory,
        });

        expect(factors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              factor: expect.stringContaining("payment reliability"),
              impact: expect.any(String),
            }),
          ]),
        );
      });
    });

    describe("generateRecommendations", () => {
      it("should generate recommendations for low risk", () => {
        const riskAssessment = {
          riskLevel: "low",
          riskScore: 0.15,
          factors: [
            {
              factor: "High appointment attendance",
              impact: "positive" as const,
            },
          ],
        };

        const recommendations = (
          analyticsService as any
        ).generateRecommendations(riskAssessment, mockFeatures);

        expect(recommendations).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: "communication",
              priority: "low",
            }),
          ]),
        );
      });

      it("should generate recommendations for high risk", () => {
        const riskAssessment = {
          riskLevel: "high",
          riskScore: 0.85,
          factors: [
            {
              factor: "Poor appointment attendance",
              impact: "negative" as const,
            },
          ],
        };

        const recommendations = (
          analyticsService as any
        ).generateRecommendations(riskAssessment, mockFeatures);

        expect(recommendations).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: "intervention",
              priority: "high",
            }),
          ]),
        );
      });
    });
  });

  describe("Client Analytics Generation", () => {
    describe("generateClientAnalytics", () => {
      it("should generate retention risk analytics successfully", async () => {
        const mockClientData = {
          appointments: [
            { date: "2024-01-01", status: "COMPLETED" },
            { date: "2024-02-01", status: "COMPLETED" },
            { date: "2024-03-01", status: "NO_SHOW" },
          ],
          communications: [
            { date: "2024-01-15", type: "whatsapp", responded: true },
            { date: "2024-02-15", type: "email", responded: false },
          ],
          payments: [
            { date: "2024-01-10", amount: 500, status: "COMPLETED" },
            { date: "2024-02-10", amount: 500, status: "MISSED" },
          ],
        };

        mockDatabase.query.mockImplementation((query: string) => {
          if (query.includes("appointments")) {
            return Promise.resolve(mockClientData.appointments);
          } else if (query.includes("communications")) {
            return Promise.resolve(mockClientData.communications);
          } else if (query.includes("payments")) {
            return Promise.resolve(mockClientData.payments);
          }
          return Promise.resolve([]);
        });

        const result = await analyticsService.generateClientAnalytics(
          "client-123",
          "retention_risk",
          { start: "2024-01-01", end: "2024-12-31" },
          {},
        );

        expect(result).toEqual({
          success: true,
          analyticsType: "retention_risk",
          data: {
            metrics: expect.objectContaining({
              appointmentAttendance: expect.any(Number),
              responseRate: expect.any(Number),
              paymentReliability: expect.any(Number),
            }),
            trends: expect.arrayContaining([
              expect.objectContaining({
                date: expect.any(String),
                value: expect.any(Number),
              }),
            ]),
            comparisons: expect.objectContaining({
              current: expect.any(Number),
              previous: expect.any(Number),
              change: expect.any(Number),
              changePercent: expect.any(Number),
            }),
          },
          insights: expect.arrayContaining([
            expect.stringContaining("appointment attendance"),
          ]),
          recommendations: expect.arrayContaining([
            expect.objectContaining({
              type: expect.any(String),
              priority: expect.any(String),
            }),
          ]),
          processingTime: expect.any(Number),
        });
      });

      it("should generate engagement analytics", async () => {
        const result = await analyticsService.generateClientAnalytics(
          "client-123",
          "engagement",
          { start: "2024-01-01", end: "2024-12-31" },
          {},
        );

        expect(result.analyticsType).toBe("engagement");
        expect(result.data.metrics).toEqual(
          expect.objectContaining({
            appointmentAttendance: expect.any(Number),
            responseRate: expect.any(Number),
            communicationFrequency: expect.any(Number),
          }),
        );
      });

      it("should generate financial analytics", async () => {
        const result = await analyticsService.generateClientAnalytics(
          "client-123",
          "financial",
          { start: "2024-01-01", end: "2024-12-31" },
          {},
        );

        expect(result.analyticsType).toBe("financial");
        expect(result.data.metrics).toEqual(
          expect.objectContaining({
            paymentReliability: expect.any(Number),
            averagePaymentAmount: expect.any(Number),
            outstandingBalance: expect.any(Number),
          }),
        );
      });

      it("should handle insufficient data", async () => {
        mockDatabase.query.mockResolvedValue([]);

        const result = await analyticsService.generateClientAnalytics(
          "client-123",
          "retention_risk",
          { start: "2024-01-01", end: "2024-12-31" },
          {},
        );

        expect(result).toEqual({
          success: true,
          analyticsType: "retention_risk",
          data: {
            metrics: {},
            trends: [],
            comparisons: {},
          },
          insights: ["Insufficient data for analysis"],
          recommendations: [
            expect.objectContaining({
              type: "data_collection",
              priority: "high",
            }),
          ],
          processingTime: expect.any(Number),
        });
      });

      it("should handle database errors", async () => {
        mockDatabase.query.mockRejectedValue(
          new Error("Database connection failed"),
        );

        const result = await analyticsService.generateClientAnalytics(
          "client-123",
          "retention_risk",
          { start: "2024-01-01", end: "2024-12-31" },
          {},
        );

        expect(result).toEqual({
          success: false,
          error: {
            code: "ANALYTICS_GENERATION_ERROR",
            message: "Database connection failed",
          },
          processingTime: expect.any(Number),
        });
      });
    });

    describe("calculateEngagementMetrics", () => {
      it("should calculate appointment attendance rate", () => {
        const appointments = [
          { status: "COMPLETED" },
          { status: "COMPLETED" },
          { status: "NO_SHOW" },
          { status: "CANCELLED" },
          { status: "COMPLETED" },
        ];

        const metrics = (analyticsService as any).calculateEngagementMetrics({
          appointments,
        });

        expect(metrics.appointmentAttendance).toBe(0.6); // 3/5 completed
      });

      it("should calculate response rate", () => {
        const communications = [
          { responded: true },
          { responded: true },
          { responded: false },
          { responded: true },
        ];

        const metrics = (analyticsService as any).calculateEngagementMetrics({
          communications,
        });

        expect(metrics.responseRate).toBe(0.75); // 3/4 responded
      });

      it("should calculate communication frequency", () => {
        const communications = [
          { date: "2024-01-01" },
          { date: "2024-01-15" },
          { date: "2024-02-01" },
        ];

        const metrics = (analyticsService as any).calculateEngagementMetrics({
          communications,
          dateRange: { start: "2024-01-01", end: "2024-02-29" },
        });

        expect(metrics.communicationFrequency).toBe(3); // 3 communications in 2 months
      });
    });

    describe("calculateFinancialMetrics", () => {
      it("should calculate payment reliability", () => {
        const payments = [
          { status: "COMPLETED", amount: 500 },
          { status: "COMPLETED", amount: 500 },
          { status: "MISSED", amount: 500 },
          { status: "COMPLETED", amount: 500 },
        ];

        const metrics = (analyticsService as any).calculateFinancialMetrics({
          payments,
        });

        expect(metrics.paymentReliability).toBe(0.75); // 3/4 completed
        expect(metrics.averagePaymentAmount).toBe(500);
      });

      it("should calculate outstanding balance", () => {
        const payments = [
          { status: "COMPLETED", amount: 500 },
          { status: "MISSED", amount: 500 },
          { status: "COMPLETED", amount: 250 },
        ];

        const metrics = (analyticsService as any).calculateFinancialMetrics({
          payments,
        });

        expect(metrics.outstandingBalance).toBe(500);
      });
    });
  });

  describe("Batch Analytics Processing", () => {
    describe("generateBatchAnalytics", () => {
      it("should process analytics for multiple clients successfully", async () => {
        const clientIds = ["client-123", "client-456", "client-789"];
        const mockAnalyticsResults = [
          {
            clientId: "client-123",
            riskScore: 0.2,
            engagement: 0.85,
            financial: 0.9,
          },
          {
            clientId: "client-456",
            riskScore: 0.6,
            engagement: 0.45,
            financial: 0.3,
          },
          {
            clientId: "client-789",
            riskScore: 0.1,
            engagement: 0.95,
            financial: 1.0,
          },
        ];

        // Mock individual analytics calls
        jest
          .spyOn(analyticsService, "generateClientAnalytics")
          .mockResolvedValue({
            success: true,
            data: { metrics: { engagement: 0.85 } },
            processingTime: 100,
          } as any);

        const result = await analyticsService.generateBatchAnalytics(
          clientIds,
          "retention_risk",
          { start: "2024-01-01", end: "2024-12-31" },
        );

        expect(result).toEqual({
          success: true,
          processedCount: 3,
          failedCount: 0,
          results: expect.arrayContaining([
            expect.objectContaining({ clientId: "client-123" }),
            expect.objectContaining({ clientId: "client-456" }),
            expect.objectContaining({ clientId: "client-789" }),
          ]),
          summary: {
            averageRiskScore: expect.any(Number),
            averageEngagement: expect.any(Number),
            riskDistribution: {
              low: expect.any(Number),
              medium: expect.any(Number),
              high: expect.any(Number),
            },
          },
          processingTime: expect.any(Number),
        });

        expect(analyticsService.generateClientAnalytics).toHaveBeenCalledTimes(
          3,
        );
      });

      it("should handle batch processing with partial failures", async () => {
        const clientIds = ["client-123", "client-456", "client-789"];

        jest
          .spyOn(analyticsService, "generateClientAnalytics")
          .mockImplementationOnce(() =>
            Promise.resolve({ success: true, data: {}, processingTime: 100 }),
          )
          .mockImplementationOnce(() =>
            Promise.reject(new Error("Client not found")),
          )
          .mockImplementationOnce(() =>
            Promise.resolve({ success: true, data: {}, processingTime: 100 }),
          );

        const result = await analyticsService.generateBatchAnalytics(
          clientIds,
          "retention_risk",
          { start: "2024-01-01", end: "2024-12-31" },
        );

        expect(result).toEqual({
          success: true,
          processedCount: 2,
          failedCount: 1,
          results: expect.arrayContaining(
            expect.objectContaining({ success: true }),
            expect.objectContaining({
              success: false,
              error: "Client not found",
            }),
          ),
          summary: expect.any(Object),
          processingTime: expect.any(Number),
        });
      });

      it("should handle large batch processing with pagination", async () => {
        const clientIds = Array.from({ length: 1500 }, (_, i) => `client-${i}`);

        jest
          .spyOn(analyticsService, "generateClientAnalytics")
          .mockResolvedValue({ success: true, data: {}, processingTime: 50 });

        const result = await analyticsService.generateBatchAnalytics(
          clientIds,
          "retention_risk",
          { start: "2024-01-01", end: "2024-12-31" },
        );

        expect(result.processedCount).toBe(1500);
        expect(result.failedCount).toBe(0);
        expect(result.results).toHaveLength(1500);
      });

      it("should handle batch processing timeout", async () => {
        const clientIds = ["client-123", "client-456"];

        jest
          .spyOn(analyticsService, "generateClientAnalytics")
          .mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 4000)),
          );

        // Fast forward timers
        jest.advanceTimersByTime(310000); // 5 minutes 10 seconds

        await expect(
          analyticsService.generateBatchAnalytics(clientIds, "retention_risk", {
            start: "2024-01-01",
            end: "2024-12-31",
          }),
        ).rejects.toThrow("Batch processing timeout");
      });
    });
  });

  describe("Health Check and Monitoring", () => {
    describe("getHealthCheck", () => {
      it("should return healthy status when all services are operational", async () => {
        mockMachineLearningService.predict.mockResolvedValue({
          prediction: 0.5,
          confidence: 0.8,
        });

        mockDatabase.query.mockResolvedValue([]);

        const health = await analyticsService.getHealthCheck();

        expect(health.status).toBe("healthy");
        expect(health.components).toEqual(
          expect.objectContaining({
            machineLearning: "healthy",
            database: "healthy",
            analyticsEngine: "healthy",
          }),
        );
        expect(health.metrics).toEqual(
          expect.objectContaining({
            uptime: expect.any(Number),
            requestCount: expect.any(Number),
            errorRate: expect.any(Number),
            averageResponseTime: expect.any(Number),
          }),
        );
      });

      it("should return degraded status when ML service is unhealthy", async () => {
        mockMachineLearningService.predict.mockRejectedValue(
          new Error("ML service down"),
        );

        const health = await analyticsService.getHealthCheck();

        expect(health.status).toBe("degraded");
        expect(health.components.machineLearning).toBe("unhealthy");
        expect(health.issues).toContain("ML service down");
      });

      it("should return unhealthy status when database is unreachable", async () => {
        mockDatabase.query.mockRejectedValue(new Error("Connection failed"));

        const health = await analyticsService.getHealthCheck();

        expect(health.status).toBe("unhealthy");
        expect(health.components.database).toBe("unhealthy");
      });
    });

    describe("getModelPerformance", () => {
      it("should retrieve model performance metrics", async () => {
        const mockPerformance = {
          accuracy: 0.89,
          precision: 0.87,
          recall: 0.91,
          f1Score: 0.89,
          sampleSize: 1000,
          evaluationPeriod: ["2024-01-01", "2024-12-31"],
        };

        mockDatabase.query.mockResolvedValue([mockPerformance]);

        const performance = await (analyticsService as any).getModelPerformance(
          "retention",
          "v2.1",
        );

        expect(performance).toEqual(mockPerformance);
      });

      it("should handle missing performance data", async () => {
        mockDatabase.query.mockResolvedValue([]);

        const performance = await (analyticsService as any).getModelPerformance(
          "retention",
          "v2.1",
        );

        expect(performance).toBeNull();
      });
    });
  });

  describe("Metrics Collection", () => {
    it("should track prediction metrics", async () => {
      mockMachineLearningService.predict.mockResolvedValue({
        prediction: 0.5,
        confidence: 0.8,
      });

      await analyticsService.predictClientRetention("client-123", mockFeatures);

      const metrics = analyticsService.getMetrics();

      expect(metrics.predictions.totalCalls).toBe(1);
      expect(metrics.predictions.averageConfidence).toBe(0.8);
      expect(metrics.predictions.riskDistribution).toEqual({
        low: 0,
        medium: 1,
        high: 0,
        unknown: 0,
      });
    });

    it("should track analytics generation metrics", async () => {
      mockDatabase.query.mockResolvedValue([]);

      await analyticsService.generateClientAnalytics(
        "client-123",
        "retention_risk",
        { start: "2024-01-01", end: "2024-12-31" },
        {},
      );

      const metrics = analyticsService.getMetrics();

      expect(metrics.analytics.totalCalls).toBe(1);
      expect(metrics.analytics.byType.retention_risk).toBe(1);
      expect(metrics.analytics.averageProcessingTime).toBeGreaterThan(0);
    });

    it("should track error rates", async () => {
      mockMachineLearningService.predict.mockRejectedValue(
        new Error("Prediction failed"),
      );

      try {
        await analyticsService.predictClientRetention(
          "client-123",
          mockFeatures,
        );
      } catch (error) {
        // Expected to fail
      }

      const metrics = analyticsService.getMetrics();

      expect(metrics.errors.total).toBe(1);
      expect(metrics.errors.byType.PREDICTION_ERROR).toBe(1);
      expect(metrics.errors.rate).toBeGreaterThan(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid client IDs", async () => {
      await expect(
        analyticsService.generateClientAnalytics("", "retention_risk", {}, {}),
      ).rejects.toThrow("Invalid client ID");
    });

    it("should handle invalid analytics types", async () => {
      await expect(
        analyticsService.generateClientAnalytics(
          "client-123",
          "invalid_type" as any,
          {},
          {},
        ),
      ).rejects.toThrow("Invalid analytics type");
    });

    it("should handle invalid date ranges", async () => {
      const invalidDateRange = {
        start: "2024-12-31",
        end: "2024-01-01", // End before start
      };

      await expect(
        analyticsService.generateClientAnalytics(
          "client-123",
          "retention_risk",
          invalidDateRange,
          {},
        ),
      ).rejects.toThrow("Invalid date range");
    });

    it("should handle malformed feature data", async () => {
      const malformedFeatures = {
        appointmentHistory: "invalid_data", // Should be object
      };

      const result = await analyticsService.predictClientRetention(
        "client-123",
        malformedFeatures as any,
      );

      expect(result.prediction.riskLevel).toBe("unknown");
      expect(result.prediction.factors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            factor: "Invalid feature data",
            impact: "negative",
          }),
        ]),
      );
    });
  });

  describe("Configuration Management", () => {
    it("should update model configuration", () => {
      const newConfig = {
        predictionModels: {
          retention: {
            algorithm: "gradient_boosting",
            version: "v3.0",
            thresholds: {
              lowRisk: 0.2,
              mediumRisk: 0.6,
              highRisk: 1.0,
            },
          },
        },
      };

      analyticsService.updateConfig(newConfig);

      expect(analyticsService["config"].predictionModels.retention).toEqual(
        newConfig.predictionModels.retention,
      );
    });

    it("should validate configuration changes", () => {
      const invalidConfig = {
        predictionModels: {
          retention: {
            algorithm: "", // Empty algorithm
            version: "v1.0",
          },
        },
      };

      expect(() => {
        analyticsService.updateConfig(invalidConfig);
      }).toThrow("Invalid configuration");
    });
  });
});
