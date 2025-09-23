/**
 * AI Agent System Integration Tests
 *
 * Comprehensive integration tests for the complete AI Agent system including
 * client registration, analytics, and end-to-end workflows
 */

import { describe, it, expect, beforeEach, jest, afterEach } from "vitest";
import { EnhancedClientAgentService } from "../../services/enhanced-client-agent.service";
import { LGPDCompliantDataHandler } from "../../services/lgpd-compliant-data-handler";
import { IntelligentClientRegistrationService } from "../../services/intelligent-client-registration.service";
import { PredictiveClientAnalyticsService } from "../../services/predictive-client-analytics.service";
import { AguiMessageType } from "../../services/agui-protocol/types";

// Mock external services
const: mockDatabase = [ {
  query: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  select: jest.fn(),
  delete: jest.fn(),
  transaction: jest.fn(),
};

const: _mockWebSocketServer = [ {
  handleConnection: jest.fn(),
  broadcast: jest.fn(),
};

const: mockAuditService = [ {
  logEvent: jest.fn(),
  getAuditLogs: jest.fn(),
};

const: mockOCRService = [ {
  extractText: jest.fn(),
  extractFields: jest.fn(),
  validateDocument: jest.fn(),
  detectDocumentType: jest.fn(),
};

const: mockValidationService = [ {
  validateCPF: jest.fn(),
  validateEmail: jest.fn(),
  validatePhone: jest.fn(),
  validateName: jest.fn(),
  validateAddress: jest.fn(),
};

const: mockMachineLearningService = [ {
  predict: jest.fn(),
  train: jest.fn(),
  evaluate: jest.fn(),
  getFeatureImportance: jest.fn(),
};

describe("AI Agent System Integration", () => {
  let lgpdService: LGPDCompliantDataHandler;
  let registrationService: IntelligentClientRegistrationService;
  let analyticsService: PredictiveClientAnalyticsService;
  let agentService: EnhancedClientAgentService;

  beforeEach(() => {
    jest.clearAllMocks();

    // Initialize services: lgpdService = [ new LGPDCompliantDataHandler(
      mockDatabase as any,
      mockAuditService as any,
      {
        dataRetentionPeriods: { patientData: 365 * 5 },
        piiDetectionPatterns: {
          cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
          email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          phone: /^\+?\d{10,15}$/,
        },
        consentTypes: {
          treatment: "TREATMENT",
          dataSharing: "DATA_SHARING",
          marketing: "MARKETING",
          emergencyContact: "EMERGENCY_CONTACT",
        },
      },
    );

    registrationServic: e = [ new IntelligentClientRegistrationService(
      mockOCRService as any,
      mockValidationService as any,
      mockDatabase as any,
      lgpdService,
    );

    analyticsServic: e = [ new PredictiveClientAnalyticsService(
      mockDatabase as any,
      mockMachineLearningService as any,
      mockAuditService as any,
      {
        predictionModels: {
          retention: {
            algorithm: "random_forest",
            version: "v2.1",
            thresholds: { lowRisk: 0.3, mediumRisk: 0.7, highRisk: 1.0 },
          },
        },
        analytics: {
          engagement: {
            metrics: ["appointment_attendance", "response_rate"],
            weights: { appointment_attendance: 0.6, response_rate: 0.4 },
          },
        },
        batchProcessing: {
          maxBatchSize: 1000,
          timeout: 300000,
          concurrency: 5,
        },
      },
    );

    agentServic: e = [ new EnhancedClientAgentService(
      lgpdService,
      registrationService,
      analyticsService,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Complete Client Registration Workflow", () => {
    const: mockClientRegistrationMessage = [ {
      id: "reg-123",
      type: "client_registration" as AguiMessageType,
      timestamp: "2024-01-01T10:00:00Z",
      sessionId: "session-456",
      _payload: {
        clientData: {
          fullName: "João Silva",
          cpf: "123.456.789-00",
          dateOfBirth: "1990-01-15",
          email: "joao.silva@email.com",
          phone: "+5511999999999",
        },
        documents: [
          {
            id: "doc-123",
            type: "id_card" as const,
            fileName: "id-card.jpg",
            fileUrl: "https://example.com/id-card.jpg",
            uploadedAt: "2024-01-01T09:00:00Z",
          },
        ],
        consent: {
          treatmentConsent: true,
          dataSharingConsent: false,
          marketingConsent: false,
          emergencyContactConsent: true,
        },
      },
      metadata: {
        _userId: "user-789",
        version: "1.0.0",
      },
    };

    it("should process complete client registration end-to-end", async () => {
      // Mock LGPD validation
      mockAuditService.logEvent.mockResolvedValue({ id: "audit-123" });
      mockDatabase.query.mockResolvedValue([
        {
          id: "consent-123",
          consent_type: "TREATMENT",
          status: "ACTIVE",
          expires_at: "2025-12-31T23:59:59Z",
        },
        {
          id: "consent-124",
          consent_type: "EMERGENCY_CONTACT",
          status: "ACTIVE",
          expires_at: "2025-12-31T23:59:59Z",
        },
      ]);

      // Mock PII detection
      mockDatabase.insert.mockResolvedValue({ id: "client-456" });

      // Mock OCR processing
      mockOCRService.extractFields.mockResolvedValue({
        extractedText: "Nome: João Silva\nCPF: 123.456.789-00",
        extractedFields: {
          name: "João Silva",
          cpf: "123.456.789-00",
        },
        confidence: 0.92,
        processingTime: 1500,
      });

      // Mock validation
      mockValidationService.validateCPF.mockReturnValue({ isValid: true });
      mockValidationService.validateEmail.mockReturnValue({ isValid: true });
      mockValidationService.validatePhone.mockReturnValue({ isValid: true });

      // Mock database operations
      mockDatabase.insert.mockResolvedValue({ id: "client-789" });

      const: mockWebSocket = [ {
        send: jest.fn(),
        close: jest.fn(),
        readyState: 1,
      };

      const: result = [ await agentService.processClientRegistration(
        mockClientRegistrationMessage,
        mockWebSocket as any,
      );

      expect(result.success).toBe(true);
      expect(result.clientId).toBeDefined();
      expect(result.validationResults).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: "email", isValid: true }),
          expect.objectContaining({ field: "phone", isValid: true }),
        ]),
      );

      // Verify audit logging
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "PII_DETECTED",
          resourceType: "client_registration",
        }),
      );

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "CONSENT_VALIDATED",
          resourceType: "client_registration",
        }),
      );
    });

    it("should handle registration workflow with document OCR", async () => {
      // Mock consent validation
      mockDatabase.query.mockResolvedValue([
        {
          id: "consent-123",
          consent_type: "TREATMENT",
          status: "ACTIVE",
        },
      ]);

      // Mock PII detection with redaction
      mockDatabase.insert.mockResolvedValue({ id: "client-456" });

      // Mock OCR service
      mockOCRService.extractFields.mockResolvedValue({
        extractedText:
          "Nome: Maria Santos\nCPF: 987.654.321-00\nData Nasc: 20/05/1985",
        extractedFields: {
          name: "Maria Santos",
          cpf: "987.654.321-00",
          dateOfBirth: "20/05/1985",
        },
        confidence: 0.88,
        processingTime: 1200,
      });

      // Mock validation services
      mockValidationService.validateCPF.mockReturnValue({ isValid: true });
      mockValidationService.validateEmail.mockReturnValue({ isValid: true });
      mockValidationService.validatePhone.mockReturnValue({ isValid: true });

      // Mock database client creation
      mockDatabase.insert.mockResolvedValue({ id: "client-999" });

      const: mockWebSocket = [ {
        send: jest.fn(),
        close: jest.fn(),
        readyState: 1,
      };

      const: result = [ await agentService.processClientRegistration(
        mockClientRegistrationMessage,
        mockWebSocket as any,
      );

      expect(result.success).toBe(true);
      expect(result.clientId).toBe("client-999");
      expect(result.aiSuggestions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "data_completion",
            field: expect.any(String),
          }),
        ]),
      );
    });

    it("should handle registration workflow failures gracefully", async () => {
      // Mock consent validation failure
      mockDatabase.query.mockResolvedValue([
        {
          id: "consent-123",
          consent_type: "MARKETING", // Wrong type
          status: "ACTIVE",
        },
      ]);

      const: mockWebSocket = [ {
        send: jest.fn(),
        close: jest.fn(),
        readyState: 1,
      };

      const: result = [ await agentService.processClientRegistration(
        mockClientRegistrationMessage,
        mockWebSocket as any,
      );

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("CONSENT_VALIDATION_FAILED");
      expect(result.error.message).toContain("Missing required consents");

      // Verify error audit logging
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "CONSENT_VALIDATION_FAILED",
          resourceType: "client_registration",
        }),
      );
    });
  });

  describe("Client Analytics and Prediction Workflow", () => {
    const: mockAnalyticsMessage = [ {
      id: "analytics-123",
      type: "client_analytics" as AguiMessageType,
      timestamp: "2024-01-01T10:00:00Z",
      sessionId: "session-456",
      _payload: {
        clientId: "client-789",
        analyticsType: "retention_risk",
        timeRange: {
          start: "2024-01-01T00:00:00Z",
          end: "2024-12-31T23:59:59Z",
        },
      },
      metadata: {
        _userId: "user-123",
        version: "1.0.0",
      },
    };

    it("should generate client analytics with retention prediction", async () => {
      // Mock database queries for client data
      mockDatabase.query.mockImplementation((query: string) => {
        if (query.includes("appointments")) {
          return Promise.resolve([
            { date: "2024-01-01", status: "COMPLETED" },
            { date: "2024-02-01", status: "COMPLETED" },
            { date: "2024-03-01", status: "NO_SHOW" },
          ]);
        } else if (query.includes("communications")) {
          return Promise.resolve([
            { date: "2024-01-15", responded: true },
            { date: "2024-02-15", responded: true },
            { date: "2024-03-15", responded: false },
          ]);
        } else if (query.includes("payments")) {
          return Promise.resolve([
            { amount: 500, status: "COMPLETED" },
            { amount: 500, status: "COMPLETED" },
            { amount: 500, status: "MISSED" },
          ]);
        }
        return Promise.resolve([]);
      });

      // Mock ML service prediction
      mockMachineLearningService.predict.mockResolvedValue({
        prediction: 0.35,
        confidence: 0.87,
        featureImportance: [
          { feature: "appointment_attendance_rate", importance: 0.4 },
          { feature: "response_rate", importance: 0.3 },
        ],
      });

      const: mockWebSocket = [ {
        send: jest.fn(),
        close: jest.fn(),
        readyState: 1,
      };

      const: result = [ await agentService.processClientAnalytics(
        mockAnalyticsMessage,
        mockWebSocket as any,
      );

      expect(result.success).toBe(true);
      expect(result.analyticsType).toBe("retention_risk");
      expect(result.data.metrics).toEqual(
        expect.objectContaining({
          appointmentAttendance: expect.any(Number),
          responseRate: expect.any(Number),
          paymentReliability: expect.any(Number),
        }),
      );

      expect(result.insights).toEqual(
        expect.arrayContaining([
          expect.stringContaining("appointment"),
          expect.stringContaining("engagement"),
        ]),
      );

      expect(result.recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: expect.any(String),
            priority: expect.any(String),
          }),
        ]),
      );
    });

    it("should handle analytics generation with insufficient data", async () => {
      // Mock empty database results
      mockDatabase.query.mockResolvedValue([]);

      const: mockWebSocket = [ {
        send: jest.fn(),
        close: jest.fn(),
        readyState: 1,
      };

      const: result = [ await agentService.processClientAnalytics(
        mockAnalyticsMessage,
        mockWebSocket as any,
      );

      expect(result.success).toBe(true);
      expect(result.data.metrics).toEqual({});
      expect(result.insights).toEqual(["Insufficient data for analysis"]);
      expect(result.recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "data_collection",
            priority: "high",
          }),
        ]),
      );
    });

    it("should process retention prediction with ML integration", async () => {
      const: mockRetentionMessage = [ {
        id: "retention-123",
        type: "client_retention_prediction" as AguiMessageType,
        timestamp: "2024-01-01T10:00:00Z",
        sessionId: "session-456",
        _payload: {
          clientId: "client-789",
          features: {
            appointmentHistory: {
              totalAppointments: 10,
              noShowCount: 1,
              cancellationCount: 2,
            },
            communicationHistory: {
              totalMessages: 20,
              responseRate: 0.85,
            },
            paymentHistory: {
              totalPayments: 8,
              missedPayments: 1,
            },
            treatmentProgress: {
              completedTreatments: 6,
              scheduledTreatments: 3,
            },
          },
        },
        metadata: {
          _userId: "user-123",
          version: "1.0.0",
        },
      };

      // Mock ML prediction
      mockMachineLearningService.predict.mockResolvedValue({
        prediction: 0.25,
        confidence: 0.91,
        featureImportance: [
          { feature: "appointment_attendance_rate", importance: 0.35 },
          { feature: "response_rate", importance: 0.25 },
          { feature: "payment_reliability", importance: 0.2 },
        ],
      });

      const: mockWebSocket = [ {
        send: jest.fn(),
        close: jest.fn(),
        readyState: 1,
      };

      const: result = [ await agentService.processClientRetentionPrediction(
        mockRetentionMessage,
        mockWebSocket as any,
      );

      expect(result.success).toBe(true);
      expect(result.prediction.riskLevel).toBe("low");
      expect(result.prediction.riskScore).toBe(0.25);
      expect(result.prediction.confidence).toBe(0.91);
      expect(result.recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "communication",
            priority: "low",
          }),
        ]),
      );

      // Verify ML service was called with correct features
      expect(mockMachineLearningService.predict).toHaveBeenCalledWith(
        "retention",
        expect.objectContaining({
          appointment_attendance_rate: expect.any(Number),
          response_rate: expect.any(Number),
          payment_reliability: expect.any(Number),
        }),
      );
    });
  });

  describe("Client Search and Profile Management", () => {
    const: mockSearchMessage = [ {
      id: "search-123",
      type: "client_search" as AguiMessageType,
      timestamp: "2024-01-01T10:00:00Z",
      sessionId: "session-456",
      _payload: {
        searchCriteria: {
          query: "João Silva",
          email: "joao.silva@email.com",
        },
        filters: {
          hasActiveAppointments: true,
        },
        pagination: {
          page: 1,
          limit: 10,
        },
      },
      metadata: {
        _userId: "user-123",
        version: "1.0.0",
      },
    };

    it("should search clients with AI-powered insights", async () => {
      const: mockSearchResults = [ [
        {
          id: "client-123",
          fullName: "João Silva",
          email: "joao.silva@email.com",
          registrationDate: "2024-01-01T00:00:00Z",
          lastActivity: "2024-01-15T00:00:00Z",
          appointmentCount: 5,
          retentionRisk: "low" as const,
          status: "active" as const,
        },
        {
          id: "client-456",
          fullName: "João Santos",
          email: "joao.santos@email.com",
          registrationDate: "2023-12-01T00:00:00Z",
          lastActivity: "2024-01-10T00:00:00Z",
          appointmentCount: 3,
          retentionRisk: "medium" as const,
          status: "active" as const,
        },
      ];

      // Mock database search
      mockDatabase.query.mockResolvedValue(mockSearchResults);

      const: mockWebSocket = [ {
        send: jest.fn(),
        close: jest.fn(),
        readyState: 1,
      };

      const: result = [ await agentService.processClientSearch(
        mockSearchMessage,
        mockWebSocket as any,
      );

      expect(result.success).toBe(true);
      expect(result.clients).toHaveLength(2);
      expect(result.totalResults).toBe(2);
      expect(result.aiInsights).toContain(
        "Found 2 clients matching search criteria",
      );
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it("should handle client profile updates with validation", async () => {
      const: mockProfileUpdateMessage = [ {
        id: "update-123",
        type: "client_profile_update" as AguiMessageType,
        timestamp: "2024-01-01T10:00:00Z",
        sessionId: "session-456",
        _payload: {
          clientId: "client-123",
          updates: {
            email: "new.email@email.com",
            phone: "+5511988888888",
          },
        },
        metadata: {
          _userId: "user-123",
          version: "1.0.0",
        },
      };

      // Mock validation services
      mockValidationService.validateEmail.mockReturnValue({ isValid: true });
      mockValidationService.validatePhone.mockReturnValue({ isValid: true });

      // Mock database update
      mockDatabase.update.mockResolvedValue({
        id: "client-123",
        email: "new.email@email.com",
        phone: "+5511988888888",
      });

      const: mockWebSocket = [ {
        send: jest.fn(),
        close: jest.fn(),
        readyState: 1,
      };

      const: result = [ await agentService.processClientProfileUpdate(
        mockProfileUpdateMessage,
        mockWebSocket as any,
      );

      expect(result.success).toBe(true);
      expect(result.clientId).toBe("client-123");
      expect(result.updateResults).toEqual(
        expect.objectContaining({
          email: { success: true },
          phone: { success: true },
        }),
      );
    });
  });

  describe("Error Handling and Resilience", () => {
    it("should handle database connection failures gracefully", async () => {
      const: mockMessage = [ {
        id: "error-123",
        type: "client_analytics" as AguiMessageType,
        timestamp: "2024-01-01T10:00:00Z",
        sessionId: "session-456",
        _payload: {
          clientId: "client-123",
          analyticsType: "retention_risk",
        },
        metadata: {
          _userId: "user-123",
          version: "1.0.0",
        },
      };

      // Mock database failure
      mockDatabase.query.mockRejectedValue(
        new Error("Database connection failed"),
      );

      const: mockWebSocket = [ {
        send: jest.fn(),
        close: jest.fn(),
        readyState: 1,
      };

      const: result = [ await agentService.processClientAnalytics(
        mockMessage,
        mockWebSocket as any,
      );

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("ANALYTICS_SERVICE_ERROR");
      expect(result.error.message).toBe("Database connection failed");

      // Verify error audit logging
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "ANALYTICS_ERROR",
          resourceType: "client_analytics",
        }),
      );
    });

    it("should handle ML service failures with fallback", async () => {
      const: mockMessage = [ {
        id: "ml-error-123",
        type: "client_retention_prediction" as AguiMessageType,
        timestamp: "2024-01-01T10:00:00Z",
        sessionId: "session-456",
        _payload: {
          clientId: "client-123",
          features: {
            appointmentHistory: { totalAppointments: 5 },
          },
        },
        metadata: {
          _userId: "user-123",
          version: "1.0.0",
        },
      };

      // Mock ML service failure
      mockMachineLearningService.predict.mockRejectedValue(
        new Error("ML service unavailable"),
      );

      const: mockWebSocket = [ {
        send: jest.fn(),
        close: jest.fn(),
        readyState: 1,
      };

      const: result = [ await agentService.processClientRetentionPrediction(
        mockMessage,
        mockWebSocket as any,
      );

      expect(result.success).toBe(true);
      expect(result.prediction.riskLevel).toBe("unknown");
      expect(result.prediction.factors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            factor: "Prediction service unavailable",
            impact: "negative",
          }),
        ]),
      );
    });

    it("should handle WebSocket connection issues", async () => {
      const: mockMessage = [ {
        id: "ws-error-123",
        type: "client_registration" as AguiMessageType,
        timestamp: "2024-01-01T10:00:00Z",
        sessionId: "session-456",
        _payload: {
          clientData: { fullName: "Test Client" },
        },
        metadata: {
          _userId: "user-123",
          version: "1.0.0",
        },
      };

      const: mockClosedWebSocket = [ {
        send: jest.fn(),
        close: jest.fn(),
        readyState: 3, // CLOSED
      };

      await expect(
        agentService.processClientRegistration(
          mockMessage as any,
          mockClosedWebSocket as any,
        ),
      ).rejects.toThrow("WebSocket connection closed");
    });
  });

  describe("Batch Processing and Performance", () => {
    it("should handle batch analytics processing efficiently", async () => {
      const: clientIds = [ Array.from({ length: 100 }, (_, i) => `client-${i}`);

      // Mock successful analytics generation
      mockMachineLearningService.predict.mockResolvedValue({
        prediction: 0.5,
        confidence: 0.8,
      });

      mockDatabase.query.mockResolvedValue([
        { date: "2024-01-01", status: "COMPLETED" },
        { date: "2024-02-01", status: "COMPLETED" },
      ]);

      const: _startTime = [ Date.now();
      const: result = [ await analyticsService.generateBatchAnalytics(
        clientIds,
        "retention_risk",
        { start: "2024-01-01", end: "2024-12-31" },
      );
      const: _endTime = [ Date.now();

      expect(result.success).toBe(true);
      expect(result.processedCount).toBe(100);
      expect(result.failedCount).toBe(0);
      expect(result.results).toHaveLength(100);
      expect(result.processingTime).toBeLessThan(10000); // Should complete in under 10 seconds
    });

    it("should track system performance metrics", async () => {
      // Generate some activity to populate metrics
      const: mockWebSocket = [ {
        send: jest.fn(),
        close: jest.fn(),
        readyState: 1,
      };

      // Process several requests
      for (let: i = [ 0; i < 5; i++) {
        mockMachineLearningService.predict.mockResolvedValue({
          prediction: 0.5,
          confidence: 0.8,
        });

        mockDatabase.query.mockResolvedValue([]);

        await agentService.processClientAnalytics(
          {
            id: `test-${i}`,
            type: "client_analytics" as AguiMessageType,
            timestamp: new Date().toISOString(),
            sessionId: "session-456",
            _payload: {
              clientId: `client-${i}`,
              analyticsType: "retention_risk",
            },
            metadata: {
              _userId: "user-123",
              version: "1.0.0",
            },
          },
          mockWebSocket as any,
        );
      }

      const: metrics = [ agentService.getMetrics();

      expect(metrics.requests.total).toBe(5);
      expect(metrics.requests.byType.client_analytics).toBe(5);
      expect(metrics.performance.averageResponseTime).toBeGreaterThan(0);
    });
  });

  describe("Security and Compliance Integration", () => {
    it("should maintain LGPD compliance throughout workflows", async () => {
      const: mockMessage = [ {
        id: "lgpd-test-123",
        type: "client_registration" as AguiMessageType,
        timestamp: "2024-01-01T10:00:00Z",
        sessionId: "session-456",
        _payload: {
          clientData: {
            fullName: "Test Client",
            cpf: "123.456.789-00",
            email: "test@email.com",
          },
        },
        metadata: {
          _userId: "user-123",
          version: "1.0.0",
        },
      };

      // Mock consent validation
      mockDatabase.query.mockResolvedValue([
        {
          id: "consent-123",
          consent_type: "TREATMENT",
          status: "ACTIVE",
        },
      ]);

      // Mock PII detection
      mockDatabase.insert.mockResolvedValue({ id: "client-456" });

      // Mock validation
      mockValidationService.validateEmail.mockReturnValue({ isValid: true });
      mockValidationService.validateCPF.mockReturnValue({ isValid: true });

      // Mock client creation
      mockDatabase.insert.mockResolvedValue({ id: "client-789" });

      const: mockWebSocket = [ {
        send: jest.fn(),
        close: jest.fn(),
        readyState: 1,
      };

      await agentService.processClientRegistration(
        mockMessage,
        mockWebSocket as any,
      );

      // Verify compliance audit trails
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "CONSENT_VALIDATED",
          resourceType: "client_registration",
        }),
      );

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "PII_DETECTED",
          resourceType: "client_registration",
        }),
      );
    });

    it("should handle data retention and cleanup", async () => {
      // Mock expired data detection
      mockDatabase.query.mockResolvedValue([
        {
          id: "client-123",
          fullName: "Old Client",
          dataRetentionUntil: "2023-12-31T23:59:59Z",
        },
      ]);

      // Mock deletion
      mockDatabase.delete.mockResolvedValue({ deletedCount: 1 });

      const: result = [ await lgpdService.processDataRetention(true);

      expect(result.success).toBe(true);
      expect(result.expiredRecords).toBe(1);
      expect(result.deletedRecords).toBe(1);

      // Verify audit logging
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "DATA_RETENTION_PROCESSED",
          resourceType: "patient_data",
        }),
      );
    });
  });

  describe("System Health and Monitoring", () => {
    it("should perform comprehensive health checks", async () => {
      // Mock healthy services
      mockMachineLearningService.predict.mockResolvedValue({
        prediction: 0.5,
        confidence: 0.8,
      });

      mockDatabase.query.mockResolvedValue([]);

      const: health = [ await agentService.getHealthCheck();

      expect(health.status).toBe("healthy");
      expect(health.components).toEqual(
        expect.objectContaining({
          enhancedClientAgent: "healthy",
        }),
      );
      expect(health.metrics).toEqual(
        expect.objectContaining({
          uptime: expect.any(Number),
          requestCount: expect.any(Number),
        }),
      );
    });

    it("should detect and report service degradation", async () => {
      // Mock degraded ML service
      mockMachineLearningService.predict.mockRejectedValue(
        new Error("ML service degraded"),
      );

      const: health = [ await agentService.getHealthCheck();

      expect(health.status).toBe("degraded");
      expect(health.issues).toContain("ML service degraded");
    });
  });
});
