/**
 * Enhanced Client Agent Service Tests
 *
 * Comprehensive test suite for the Enhanced Client Agent service including
 * LGPD compliance, client registration, profile management, and predictive analytics
 */

import { describe, it, expect, beforeEach, jest, afterEach } from "vitest";
import { EnhancedClientAgentService } from "../../services/enhanced-client-agent.service";
import { LGPDCompliantDataHandler } from "../../services/lgpd-compliant-data-handler";
import { IntelligentClientRegistrationService } from "../../services/intelligent-client-registration.service";
import { PredictiveClientAnalyticsService } from "../../services/predictive-client-analytics.service";
import {
  AguiMessageType,
  // AguiErrorCode,
} from "../../services/agui-protocol/types";

// Mock dependencies
const mockLGPDService = {
  detectAndRedactPII: jest.fn(),
  validateConsentForProcessing: jest.fn(),
  processDataRetention: jest.fn(),
  createAuditLog: jest.fn(),
} as unknown as LGPDCompliantDataHandler;

const mockRegistrationService = {
  processDocument: jest.fn(),
  processRegistrationStep: jest.fn(),
  generateAISuggestions: jest.fn(),
  validateClientData: jest.fn(),
} as unknown as IntelligentClientRegistrationService;

const mockAnalyticsService = {
  predictClientRetention: jest.fn(),
  generateClientAnalytics: jest.fn(),
  generateBatchAnalytics: jest.fn(),
  getHealthCheck: jest.fn(),
} as unknown as PredictiveClientAnalyticsService;

describe("EnhancedClientAgentService", () => {
  let agentService: EnhancedClientAgentService;
  let mockWebSocket: { send: jest.Mock; close: jest.Mock; readyState: number };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock WebSocket
    mockWebSocket = {
      send: jest.fn(),
      close: jest.fn(),
      readyState: 1, // OPEN
    };

    // Create service instance
    agentService = new EnhancedClientAgentService(
      mockLGPDService,
      mockRegistrationService,
      mockAnalyticsService,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Service Initialization", () => {
    it("should initialize with correct dependencies", () => {
      expect(agentService).toBeInstanceOf(EnhancedClientAgentService);
      expect(agentService["lgpdService"]).toBe(mockLGPDService);
      expect(agentService["registrationService"]).toBe(mockRegistrationService);
      expect(agentService["analyticsService"]).toBe(mockAnalyticsService);
    });

    it("should have default configuration", () => {
      expect(agentService["config"]).toEqual({
        maxSessionDuration: 1800000,
        maxMessageSize: 10485760,
        supportedMessageTypes: expect.arrayContaining([
          "client_registration",
          "client_profile_update",
          "client_search",
          "client_analytics",
          "client_retention_prediction",
          "client_communication",
          "document_ocr",
          "consent_management",
          "client_validation",
        ]),
        enablePIIDetection: true,
        enableConsentValidation: true,
        enableAnalytics: true,
        enableOCR: true,
        enablePredictions: true,
      });
    });
  });

  describe("Client Registration Processing", () => {
    const mockClientRegistrationMessage = {
      id: "test-registration-123",
      type: "client_registration" as AguiMessageType,
      timestamp: "2024-01-01T10:00:00Z",
      sessionId: "session-123",
      _payload: {
        clientData: {
          fullName: "João Silva",
          cpf: "123.456.789-00",
          dateOfBirth: "1990-01-01",
          email: "joao.silva@email.com",
          phone: "+5511999999999",
        },
        documents: [],
        consent: {
          treatmentConsent: true,
          dataSharingConsent: false,
          marketingConsent: false,
          emergencyContactConsent: true,
        },
      },
      metadata: {
        _userId: "user-123",
        version: "1.0.0",
      },
    };

    it("should process client registration successfully", async () => {
      // Mock LGPD validation
      mockLGPDService.validateConsentForProcessing.mockResolvedValue({
        isValid: true,
        consentRecords: ["consent-123"],
      });

      // Mock PII detection
      mockLGPDService.detectAndRedactPII.mockResolvedValue({
        processedData: mockClientRegistrationMessage._payload,
        detectedPII: ["cpf", "email", "phone"],
        redactionCount: 0,
      });

      // Mock registration service
      mockRegistrationService.processRegistrationStep.mockResolvedValue({
        success: true,
        clientId: "client-123",
        step: "personal_info",
        validationResults: [],
        aiSuggestions: [],
      });

      const result = await agentService.processClientRegistration(
        mockClientRegistrationMessage,
        mockWebSocket as any,
      );

      expect(result).toEqual({
        success: true,
        clientId: "client-123",
        validationResults: [],
        aiSuggestions: [],
        processingTime: expect.any(Number),
      });

      expect(mockLGPDService.validateConsentForProcessing).toHaveBeenCalledWith(
        "user-123",
        ["treatment", "emergency_contact"],
        mockClientRegistrationMessage._payload,
      );

      expect(mockLGPDService.detectAndRedactPII).toHaveBeenCalledWith(
        mockClientRegistrationMessage._payload,
      );

      expect(
        mockRegistrationService.processRegistrationStep,
      ).toHaveBeenCalledWith({
        step: "personal_info",
        data: mockClientRegistrationMessage._payload.clientData,
        documents: [],
        consent: mockClientRegistrationMessage._payload.consent,
      });
    });

    it("should handle LGPD consent validation failure", async () => {
      mockLGPDService.validateConsentForProcessing.mockResolvedValue({
        isValid: false,
        missingConsents: ["treatment"],
        consentRecords: [],
      });

      const result = await agentService.processClientRegistration(
        mockClientRegistrationMessage,
        mockWebSocket as any,
      );

      expect(result).toEqual({
        success: false,
        error: {
          code: "CONSENT_VALIDATION_FAILED",
          message: "Missing required consents: treatment",
          details: { missingConsents: ["treatment"] },
        },
        processingTime: expect.any(Number),
      });

      expect(mockLGPDService.createAuditLog).toHaveBeenCalledWith(
        "CONSENT_VALIDATION_FAILED",
        "client_registration",
        expect.objectContaining({
          userId: "user-123",
          reason: "Missing required consents: treatment",
        }),
      );
    });

    it("should handle registration service errors", async () => {
      mockLGPDService.validateConsentForProcessing.mockResolvedValue({
        isValid: true,
        consentRecords: ["consent-123"],
      });

      mockLGPDService.detectAndRedactPII.mockResolvedValue({
        processedData: mockClientRegistrationMessage._payload,
        detectedPII: [],
        redactionCount: 0,
      });

      mockRegistrationService.processRegistrationStep.mockRejectedValue(
        new Error("Database connection failed"),
      );

      const result = await agentService.processClientRegistration(
        mockClientRegistrationMessage,
        mockWebSocket as any,
      );

      expect(result).toEqual({
        success: false,
        error: {
          code: "REGISTRATION_SERVICE_ERROR",
          message: "Database connection failed",
        },
        processingTime: expect.any(Number),
      });

      expect(mockLGPDService.createAuditLog).toHaveBeenCalledWith(
        "REGISTRATION_FAILED",
        "client_registration",
        expect.objectContaining({
          userId: "user-123",
          error: "Database connection failed",
        }),
      );
    });
  });

  describe("Client Profile Update Processing", () => {
    const mockProfileUpdateMessage = {
      id: "test-update-123",
      type: "client_profile_update" as AguiMessageType,
      timestamp: "2024-01-01T10:00:00Z",
      sessionId: "session-123",
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

    it("should process profile update successfully", async () => {
      mockLGPDService.detectAndRedactPII.mockResolvedValue({
        processedData: mockProfileUpdateMessage._payload.updates,
        detectedPII: ["email", "phone"],
        redactionCount: 0,
      });

      const result = await agentService.processClientProfileUpdate(
        mockProfileUpdateMessage,
        mockWebSocket as any,
      );

      expect(result).toEqual({
        success: true,
        clientId: "client-123",
        updateResults: expect.objectContaining({
          email: { success: true },
          phone: { success: true },
        }),
        validationResults: [],
        aiRecommendations: [],
        processingTime: expect.any(Number),
      });
    });

    it("should validate client ID format", async () => {
      const invalidMessage = {
        ...mockProfileUpdateMessage,
        _payload: {
          ...mockProfileUpdateMessage._payload,
          clientId: "invalid-id",
        },
      };

      const result = await agentService.processClientProfileUpdate(
        invalidMessage,
        mockWebSocket as any,
      );

      expect(result).toEqual({
        success: false,
        error: {
          code: "INVALID_CLIENT_ID",
          message: "Invalid client ID format",
        },
        processingTime: expect.any(Number),
      });
    });
  });

  describe("Client Search Processing", () => {
    const mockSearchMessage = {
      id: "test-search-123",
      type: "client_search" as AguiMessageType,
      timestamp: "2024-01-01T10:00:00Z",
      sessionId: "session-123",
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

    it("should process client search successfully", async () => {
      const mockSearchResults = [
        {
          id: "client-123",
          fullName: "João Silva",
          email: "joao.silva@email.com",
          registrationDate: "2024-01-01T00:00:00Z",
          appointmentCount: 5,
          retentionRisk: "low" as const,
          status: "active" as const,
        },
      ];

      // Mock database search
      jest
        .spyOn(agentService as any, "searchClientsInDatabase")
        .mockResolvedValue({
          clients: mockSearchResults,
          totalResults: 1,
          searchTime: 50,
        });

      const result = await agentService.processClientSearch(
        mockSearchMessage,
        mockWebSocket as any,
      );

      expect(result).toEqual({
        success: true,
        clients: mockSearchResults,
        totalResults: 1,
        pagination: {
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
        filters: mockSearchMessage._payload.filters,
        searchTime: 50,
        aiInsights: expect.stringContaining("Found 1 client"),
        processingTime: expect.any(Number),
      });
    });

    it("should handle empty search results", async () => {
      jest
        .spyOn(agentService as any, "searchClientsInDatabase")
        .mockResolvedValue({
          clients: [],
          totalResults: 0,
          searchTime: 25,
        });

      const result = await agentService.processClientSearch(
        mockSearchMessage,
        mockWebSocket as any,
      );

      expect(result).toEqual({
        success: true,
        clients: [],
        totalResults: 0,
        pagination: {
          page: 1,
          limit: 10,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        filters: mockSearchMessage._payload.filters,
        searchTime: 25,
        aiInsights: "No clients found matching search criteria",
        processingTime: expect.any(Number),
      });
    });
  });

  describe("Client Analytics Processing", () => {
    const mockAnalyticsMessage = {
      id: "test-analytics-123",
      type: "client_analytics" as AguiMessageType,
      timestamp: "2024-01-01T10:00:00Z",
      sessionId: "session-123",
      _payload: {
        clientId: "client-123",
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

    it("should process client analytics successfully", async () => {
      const mockAnalyticsData = {
        metrics: {
          appointmentAttendance: 0.85,
          responseRate: 0.92,
          paymentReliability: 0.78,
          treatmentProgress: 0.65,
        },
        trends: [{ date: "2024-01-01", value: 0.8, label: "Engagement" }],
        comparisons: {
          current: 0.8,
          previous: 0.75,
          change: 0.05,
          changePercent: 6.67,
        },
      };

      mockAnalyticsService.generateClientAnalytics.mockResolvedValue({
        success: true,
        analyticsType: "retention_risk",
        data: mockAnalyticsData,
        insights: ["Strong engagement patterns detected"],
        recommendations: [
          {
            id: "rec-1",
            type: "communication" as const,
            priority: "medium" as const,
            title: "Maintain engagement",
            description: "Continue current communication strategy",
            actionItems: ["Send monthly follow-ups"],
            expectedImpact: "Maintain high retention rate",
            timeline: "Ongoing",
          },
        ],
        processingTime: 150,
      });

      const result = await agentService.processClientAnalytics(
        mockAnalyticsMessage,
        mockWebSocket as any,
      );

      expect(result).toEqual({
        success: true,
        analyticsType: "retention_risk",
        data: mockAnalyticsData,
        insights: ["Strong engagement patterns detected"],
        recommendations: [
          expect.objectContaining({
            type: "communication",
            priority: "medium",
            title: "Maintain engagement",
          }),
        ],
        processingTime: expect.any(Number),
      });

      expect(mockAnalyticsService.generateClientAnalytics).toHaveBeenCalledWith(
        "client-123",
        "retention_risk",
        expect.objectContaining({
          start: "2024-01-01T00:00:00Z",
          end: "2024-12-31T23:59:59Z",
        }),
        {},
      );
    });

    it("should handle analytics service errors", async () => {
      mockAnalyticsService.generateClientAnalytics.mockRejectedValue(
        new Error("Analytics service unavailable"),
      );

      const result = await agentService.processClientAnalytics(
        mockAnalyticsMessage,
        mockWebSocket as any,
      );

      expect(result).toEqual({
        success: false,
        error: {
          code: "ANALYTICS_SERVICE_ERROR",
          message: "Analytics service unavailable",
        },
        processingTime: expect.any(Number),
      });
    });
  });

  describe("Client Retention Prediction Processing", () => {
    const mockRetentionMessage = {
      id: "test-retention-123",
      type: "client_retention_prediction" as AguiMessageType,
      timestamp: "2024-01-01T10:00:00Z",
      sessionId: "session-123",
      _payload: {
        clientId: "client-123",
        features: {
          appointmentHistory: {
            totalAppointments: 12,
            noShowCount: 1,
            cancellationCount: 2,
          },
          communicationHistory: {
            totalMessages: 24,
            responseRate: 0.92,
          },
        },
      },
      metadata: {
        _userId: "user-123",
        version: "1.0.0",
      },
    };

    it("should process retention prediction successfully", async () => {
      const mockPrediction = {
        clientId: "client-123",
        prediction: {
          riskLevel: "low" as const,
          riskScore: 0.15,
          confidence: 0.89,
          factors: [
            {
              factor: "High appointment attendance",
              impact: "positive" as const,
              weight: 0.3,
              description: "Client has attended 11 out of 12 appointments",
            },
          ],
        },
        recommendations: [
          {
            id: "rec-1",
            type: "communication" as const,
            priority: "low" as const,
            title: "Maintain current engagement",
            description: "Client shows strong engagement patterns",
            actionItems: ["Continue regular follow-ups"],
            expectedImpact: "Maintain low retention risk",
            timeline: "Ongoing",
          },
        ],
        nextReviewDate: "2024-02-01T00:00:00Z",
        modelVersion: "retention-v2.1",
        processingTime: 200,
      };

      mockAnalyticsService.predictClientRetention.mockResolvedValue(
        mockPrediction,
      );

      const result = await agentService.processClientRetentionPrediction(
        mockRetentionMessage,
        mockWebSocket as any,
      );

      expect(result).toEqual({
        success: true,
        ...mockPrediction,
        processingTime: expect.any(Number),
      });

      expect(mockAnalyticsService.predictClientRetention).toHaveBeenCalledWith(
        "client-123",
        expect.objectContaining({
          appointmentHistory: expect.objectContaining({
            totalAppointments: 12,
          }),
          communicationHistory: expect.objectContaining({
            responseRate: 0.92,
          }),
        }),
        undefined,
      );
    });
  });

  describe("Error Handling and Validation", () => {
    it("should validate message format", () => {
      const invalidMessage = {
        id: "test-123",
        // Missing required type field
        timestamp: "2024-01-01T10:00:00Z",
        sessionId: "session-123",
        _payload: {},
      };

      expect(() => {
        (agentService as any).validateMessage(invalidMessage);
      }).toThrow("Invalid message format: missing required fields");
    });

    it("should handle WebSocket connection errors", async () => {
      const mockClosedWebSocket = {
        send: jest.fn(),
        close: jest.fn(),
        readyState: 3, // CLOSED
      };

      const mockMessage = {
        id: "test-123",
        type: "client_registration" as AguiMessageType,
        timestamp: "2024-01-01T10:00:00Z",
        sessionId: "session-123",
        _payload: {},
        metadata: {},
      };

      await expect(
        agentService.processClientRegistration(
          mockMessage as any,
          mockClosedWebSocket as any,
        ),
      ).rejects.toThrow("WebSocket connection closed");
    });

    it("should handle message size limits", async () => {
      const largePayload = "x".repeat(11 * 1024 * 1024); // 11MB
      const mockMessage = {
        id: "test-123",
        type: "client_registration" as AguiMessageType,
        timestamp: "2024-01-01T10:00:00Z",
        sessionId: "session-123",
        _payload: { data: largePayload },
        metadata: {},
      };

      await expect(
        agentService.processClientRegistration(
          mockMessage as any,
          mockWebSocket as any,
        ),
      ).rejects.toThrow("Message size exceeds limit");
    });
  });

  describe("Health Check and Monitoring", () => {
    it("should perform health check successfully", async () => {
      mockAnalyticsService.getHealthCheck.mockResolvedValue({
        status: "healthy",
        components: {
          database: "healthy",
          aiService: "healthy",
          analyticsEngine: "healthy",
        },
        metrics: {
          uptime: 86400,
          requestCount: 1250,
          errorRate: 0.02,
          averageResponseTime: 150,
        },
        lastCheck: "2024-01-01T10:00:00Z",
      });

      const health = await agentService.getHealthCheck();

      expect(health).toEqual({
        status: "healthy",
        components: expect.objectContaining({
          enhancedClientAgent: "healthy",
        }),
        metrics: expect.objectContaining({
          uptime: expect.any(Number),
          requestCount: expect.any(Number),
          errorRate: expect.any(Number),
          averageResponseTime: expect.any(Number),
        }),
        lastCheck: expect.any(String),
      });
    });

    it("should handle health check failures", async () => {
      mockAnalyticsService.getHealthCheck.mockRejectedValue(
        new Error("Analytics service down"),
      );

      const health = await agentService.getHealthCheck();

      expect(health.status).toBe("degraded");
      expect(health.components.enhancedClientAgent).toBe("degraded");
      expect(health.issues).toContain("Analytics service down");
    });
  });

  describe("Session Management", () => {
    it("should create and manage sessions", () => {
      const sessionId = agentService.createSession("user-123", "test-session");

      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe("string");

      const session = (agentService as any).sessions.get(sessionId);
      expect(session).toBeDefined();
      expect(session._userId).toBe("user-123");
      expect(session.sessionId).toBe("test-session");
    });

    it("should clean up expired sessions", () => {
      // Create expired session
      const expiredSessionId = "expired-session";
      (agentService as any).sessions.set(expiredSessionId, {
        createdAt: Date.now() - 2000000, // 33 minutes ago
        expiresAt: Date.now() - 1000000, // 16 minutes ago
        _userId: "user-123",
      });

      // Create active session
      const activeSessionId = agentService.createSession(
        "user-456",
        "active-session",
      );

      // Clean up expired sessions
      (agentService as any).cleanupExpiredSessions();

      expect((agentService as any).sessions.has(expiredSessionId)).toBe(false);
      expect((agentService as any).sessions.has(activeSessionId)).toBe(true);
    });
  });

  describe("Metrics Collection", () => {
    it("should track request metrics", async () => {
      const mockMessage = {
        id: "test-metrics-123",
        type: "client_registration" as AguiMessageType,
        timestamp: "2024-01-01T10:00:00Z",
        sessionId: "session-123",
        _payload: {},
        metadata: {},
      };

      mockLGPDService.validateConsentForProcessing.mockResolvedValue({
        isValid: true,
        consentRecords: [],
      });

      mockLGPDService.detectAndRedactPII.mockResolvedValue({
        processedData: {},
        detectedPII: [],
        redactionCount: 0,
      });

      mockRegistrationService.processRegistrationStep.mockResolvedValue({
        success: true,
        clientId: "client-123",
      });

      await agentService.processClientRegistration(
        mockMessage as any,
        mockWebSocket as any,
      );

      const metrics = agentService.getMetrics();
      expect(metrics.requests.total).toBeGreaterThan(0);
      expect(metrics.requests.byType.client_registration).toBe(1);
      expect(metrics.performance.averageResponseTime).toBeGreaterThan(0);
    });

    it("should track error rates", async () => {
      const mockMessage = {
        id: "test-error-123",
        type: "client_registration" as AguiMessageType,
        timestamp: "2024-01-01T10:00:00Z",
        sessionId: "session-123",
        _payload: {},
        metadata: {},
      };

      mockLGPDService.validateConsentForProcessing.mockResolvedValue({
        isValid: false,
        missingConsents: ["treatment"],
      });

      await agentService.processClientRegistration(
        mockMessage as any,
        mockWebSocket as any,
      );

      const metrics = agentService.getMetrics();
      expect(metrics.errors.total).toBeGreaterThan(0);
      expect(metrics.errors.byCode.CONSENT_VALIDATION_FAILED).toBe(1);
      expect(metrics.errors.rate).toBeGreaterThan(0);
    });
  });
});
