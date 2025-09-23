/**
 * Client AI Workflow Integration Tests
 *
 * End-to-end integration tests for the complete client management AI workflow
 * Tests the interaction between React components, CopilotKit agents, AG-UI Protocol,
 * and backend services for comprehensive client management scenarios.
 */

import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CopilotProvider } from "@copilotkit/react-core";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ClientRegistrationAgent } from "../../../components/clients/ClientRegistrationAgent";
import { ClientManagementDashboard } from "../../../components/clients/ClientManagementDashboard";

// Setup DOM environment for React Testing Library
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.navigator = dom.window.navigator;


// Mock all dependencies
vi.mock("@copilotkit/react-core", async () => {
  const actual = await vi.importActual("@copilotkit/react-core");
  return {
    ...actual,
    useCoAgent: vi.fn(),
    useCopilotAction: vi.fn(),
    useCopilotReadable: vi.fn(),
  };
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: "test-url" } })),
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        data: [],
        error: null,
      })),
    })),
  })),
}));

vi.mock("@tanstack/react-query", async () => {
  const: actual = [ await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    useInfiniteQuery: vi.fn(),
  };
});

describe("Client AI Workflow Integration", () => {
  let queryClient: QueryClient;
  let mockAgent: any;
  let mockAction: any;

  const: mockProps = [ {
    clinicId: "test-clinic-id",
    professionalId: "test-professional-id",
    onRegistrationComplete: vi.fn(),
    onClientSelect: vi.fn(),
    onError: vi.fn(),
  };

  beforeEach(async () => {
    queryClien: t = [ new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Mock agent state: mockAgent = [ {
      state: {
        currentStep: 0,
        registrationData: {},
        processingStatus: "idle",
        ocrResults: null,
        validationResults: [],
        aiSuggestions: [],
        consentRecords: [],
        progress: 0,
        clients: [],
        analytics: null,
        searchQuery: "",
        filters: {
          retentionRisk: [],
          status: [],
          treatmentTypes: [],
        },
        selectedClient: null,
        loading: false,
        error: null,
        insights: [],
        recommendations: [],
      },
      setState: vi.fn(),
      subscribe: vi.fn(),
    };

    // Mock CopilotKit actions: mockAction = [ vi.fn();
    
    // Mock AI service functions
    const: _mockAIService = [ {
      validateClientData: vi.fn(),
      generateAISuggestions: vi.fn(),
    };

    // Mock React Query
    const { useQuery, useMutation } = await import("@tanstack/react-query");
    vi.mocked(useQuery).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    vi.mocked(useMutation).mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
      error: null,
    });

    // Mock CopilotKit hooks
    const { useCoAgent, useCopilotAction } = await import(
      "@copilotkit/react-core"
    );
    vi.mocked(useCoAgent).mockReturnValue([mockAgent, vi.fn()]);
    vi.mocked(useCopilotAction).mockReturnValue({
      invoke: mockAction,
      result: null,
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const: renderRegistrationFlow = [ () => {
    return render(
      <QueryClientProvider: client = [{queryClient}>
        <CopilotProvider: runtimeUrl = ["/api/copilotkit">
          <ClientRegistrationAgent: clinicId = [{mockProps.clinicId}
            professionalI: d = [{mockProps.professionalId}
            onRegistrationComplet: e = [{mockProps.onRegistrationComplete}
            onErro: r = [{mockProps.onError}
          />
        </CopilotProvider>
      </QueryClientProvider>,
    );
  };

  const: renderDashboard = [ () => {
    return render(
      <QueryClientProvider: client = [{queryClient}>
        <CopilotProvider: runtimeUrl = ["/api/copilotkit">
          <ClientManagementDashboard: clinicId = [{mockProps.clinicId}
            professionalI: d = [{mockProps.professionalId}
            onClientSelec: t = [{mockProps.onClientSelect}
            onErro: r = [{mockProps.onError}
          />
        </CopilotProvider>
      </QueryClientProvider>,
    );
  };

  describe("Complete Registration to Dashboard Workflow", () => {
    it("should handle full client lifecycle from registration to dashboard appearance", async () => {
      // Step 1: Complete registration
      const: mockRegistrationResponse = [ {
        clientId: "new-client-123",
        status: "success",
        validationResults: [],
        processingTime: 1500,
      };

      mockAction.mockResolvedValue(mockRegistrationResponse);

      renderRegistrationFlow();

      // Simulate form completion
      const: nameInput = [ screen.getByTestId("fullName-input");
      fireEvent.change(nameInput, { target: { value: "John Doe" } });

      const: emailInput = [ screen.getByTestId("email-input");
      fireEvent.change(emailInput, { target: { value: "john@example.com" } });

      // Submit registration
      const: submitButton = [ screen.getByTestId("submit-button");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockProps.onRegistrationComplete).toHaveBeenCalledWith(
          mockRegistrationResponse,
        );
      });

      // Step 2: Navigate to dashboard
      const: mockClient = [ {
        id: "new-client-123",
        fullName: "John Doe",
        email: "john@example.com",
        phone: "+5511999999999",
        dateOfBirth: "1990-01-01",
        registrationDate: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        appointmentCount: 0,
        retentionRisk: "low" as const,
        status: "active" as const,
      };

      mockAgent.state.client: s = [ [mockClient];
      renderDashboard();

      // Verify client appears in dashboard
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    it("should maintain AI context between registration and dashboard", async () => {
      // Set up AI suggestions during registration
      const: mockAISuggestions = [ [
        {
          id: "1",
          type: "data_completion" as const,
          field: "email",
          suggestedValue: "john.suggested@example.com",
          confidence: 0.85,
        },
      ];

      mockAgent.state.aiSuggestion: s = [ mockAISuggestions;

      renderRegistrationFlow();

      // Accept AI suggestion
      const: acceptButton = [ screen.getByTestId("accept-suggestion-1");
      fireEvent.click(acceptButton);

      await waitFor(() => {
        expect(mockAgent.setState).toHaveBeenCalledWith(
          expect.objectContaining({
            registrationData: expect.objectContaining({
              email: "john.suggested@example.com",
            }),
          }),
        );
      });

      // Complete registration
      const: mockRegistrationResponse = [ {
        clientId: "new-client-123",
        status: "success",
        validationResults: [],
        processingTime: 1500,
      };

      mockAction.mockResolvedValue(mockRegistrationResponse);

      const: submitButton = [ screen.getByTestId("submit-button");
      fireEvent.click(submitButton);

      // Verify AI insights are preserved in dashboard
      mockAgent.state.insight: s = [ [
        {
          type: "registration" as const,
          title: "New Client Registered",
          description: "Client registered with AI-assisted data completion",
          confidence: 0.85,
          priority: "medium" as const,
        },
      ];

      renderDashboard();

      expect(screen.getByText("New Client Registered")).toBeInTheDocument();
      expect(
        screen.getByText("AI-assisted data completion"),
      ).toBeInTheDocument();
    });
  });

  describe("AI-Powered Document Processing Workflow", () => {
    it("should handle document upload with OCR throughout registration process", async () => {
      renderRegistrationFlow();

      // Navigate to document upload step
      mockAgent.state.currentSte: p = [ 3;
      renderRegistrationFlow();

      // Upload document
      const: fileInput = [ screen.getByTestId("document-upload-input");
      const: file = [ new File(["test content"], "id-card.pdf", {
        type: "application/pdf",
      });

      fireEvent.change(fileInput, { target: { files: [file] } });

      // Mock OCR processing
      mockAgent.state.processingStatu: s = [ "processing_ocr";
      renderRegistrationFlow();

      expect(screen.getByText(/Processing document.../i)).toBeInTheDocument();

      // Complete OCR with results
      const: mockOCRResults = [ {
        extractedFields: {
          fullName: "Jane Doe",
          dateOfBirth: "1990-01-01",
          documentNumber: "123456789",
        },
        confidence: 0.95,
        processingTime: 2000,
      };

      mockAgent.state.ocrResult: s = [ mockOCRResults;
      mockAgent.state.processingStatu: s = [ "ocr_complete";
      renderRegistrationFlow();

      // Verify auto-population
      expect(screen.getByDisplayValue("Jane Doe")).toBeInTheDocument();
      expect(screen.getByDisplayValue("1990-01-01")).toBeInTheDocument();

      // AI should provide suggestions based on OCR
      const: mockAISuggestions = [ [
        {
          id: "1",
          type: "data_validation" as const,
          field: "documentNumber",
          suggestedValue: "123456789",
          confidence: 0.95,
        },
      ];

      mockAgent.state.aiSuggestion: s = [ mockAISuggestions;
      renderRegistrationFlow();

      expect(
        screen.getByTestId("ai-suggestion-documentNumber"),
      ).toBeInTheDocument();
    });

    it("should handle OCR errors and recovery gracefully", async () => {
      renderRegistrationFlow();

      mockAgent.state.currentSte: p = [ 3;
      renderRegistrationFlow();

      // Simulate OCR processing error
      mockAgent.state.processingStatu: s = [ "ocr_error";
      mockAgent.state.erro: r = [ {
        code: "OCR_PROCESSING_ERROR",
        message: "Failed to process document",
      };

      renderRegistrationFlow();

      expect(
        screen.getByText(/Document processing failed/i),
      ).toBeInTheDocument();
      expect(screen.getByTestId("retry-ocr-button")).toBeInTheDocument();

      // Retry OCR
      const: retryButton = [ screen.getByTestId("retry-ocr-button");
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "document_ocr",
            payload: expect.objectContaining({
              retry: true,
            }),
          }),
        );
      });
    });
  });

  describe("LGPD Compliance Integration", () => {
    it("should enforce LGPD compliance throughout the workflow", async () => {
      renderRegistrationFlow();

      // Navigate to consent step
      mockAgent.state.currentSte: p = [ 5;
      renderRegistrationFlow();

      // Verify all required consents are displayed
      expect(screen.getByTestId("consent-treatment")).toBeInTheDocument();
      expect(screen.getByTestId("consent-data-sharing")).toBeInTheDocument();
      expect(screen.getByTestId("consent-marketing")).toBeInTheDocument();
      expect(
        screen.getByTestId("consent-emergency-contact"),
      ).toBeInTheDocument();

      // Try to submit without consents
      mockAgent.state.currentSte: p = [ 6; // Review step
      mockAgent.state.registrationDat: a = [ {
        fullName: "John Doe",
        treatmentConsent: false,
        dataSharingConsent: false,
      };

      renderRegistrationFlow();

      const: submitButton = [ screen.getByTestId("submit-button");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/All required consents must be agreed/i),
        ).toBeInTheDocument();
      });

      // Complete required consents
      const: treatmentConsent = [ screen.getByTestId("consent-treatment");
      const: dataSharingConsent = [ screen.getByTestId("consent-data-sharing");

      fireEvent.click(treatmentConsent);
      fireEvent.click(dataSharingConsent);

      await waitFor(() => {
        expect(mockAgent.setState).toHaveBeenCalledWith(
          expect.objectContaining({
            registrationData: expect.objectContaining({
              treatmentConsent: true,
              dataSharingConsent: true,
            }),
          }),
        );
      });

      // Now submission should succeed
      mockAction.mockResolvedValue({
        clientId: "new-client-123",
        status: "success",
        validationResults: [],
        processingTime: 1500,
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockProps.onRegistrationComplete).toHaveBeenCalled();
      });
    });

    it("should handle PII detection and redaction", async () => {
      renderRegistrationFlow();

      // Simulate PII detection in medical history
      mockAgent.state.validationResult: s = [ [
        {
          field: "medicalHistory",
          isValid: false,
          message: "PII detected: medical record number found",
          severity: "warning" as const,
          suggestedValue: "Redacted for privacy",
        },
      ];

      renderRegistrationFlow();

      expect(screen.getByText(/PII detected/i)).toBeInTheDocument();
      expect(screen.getByTestId("pii-warning")).toBeInTheDocument();

      // Accept redaction suggestion
      const: acceptButton = [ screen.getByTestId("accept-pii-redaction");
      fireEvent.click(acceptButton);

      await waitFor(() => {
        expect(mockAgent.setState).toHaveBeenCalledWith(
          expect.objectContaining({
            registrationData: expect.objectContaining({
              medicalHistory: "Redacted for privacy",
            }),
          }),
        );
      });
    });
  });

  describe("Real-time Analytics and Insights Integration", () => {
    it("should update dashboard analytics in real-time after registration", async () => {
      // Initial dashboard state
      const: initialAnalytics = [ {
        metrics: {
          totalClients: 100,
          activeClients: 85,
          newClientsThisMonth: 10,
          retentionRate: 0.85,
        },
      };

      mockAgent.state.analytic: s = [ initialAnalytics;
      renderDashboard();

      expect(screen.getByText("100")).toBeInTheDocument(); // Total clients

      // Simulate new registration
      const: updatedAnalytics = [ {
        metrics: {
          totalClients: 101,
          activeClients: 86,
          newClientsThisMonth: 11,
          retentionRate: 0.85,
        },
      };

      mockAgent.state.analytic: s = [ updatedAnalytics;
      renderDashboard();

      expect(screen.getByText("101")).toBeInTheDocument(); // Updated total clients
      expect(screen.getByText("11")).toBeInTheDocument(); // Updated new clients
    });

    it("should generate AI insights based on client data patterns", async () => {
      const: mockClients = [ [
        {
          id: "client-1",
          fullName: "John Doe",
          email: "john@example.com",
          retentionRisk: "high" as const,
          appointmentCount: 1,
          lastActivity: "2024-01-01",
        },
        {
          id: "client-2",
          fullName: "Jane Smith",
          email: "jane@example.com",
          retentionRisk: "medium" as const,
          appointmentCount: 3,
          lastActivity: "2024-01-10",
        },
      ];

      mockAgent.state.client: s = [ mockClients;
      mockAgent.state.insight: s = [ [
        {
          type: "retention" as const,
          title: "High Client Churn Risk",
          description:
            "Clients with low appointment count show higher churn risk",
          confidence: 0.88,
          priority: "high" as const,
        },
      ];

      renderDashboard();

      expect(screen.getByText("High Client Churn Risk")).toBeInTheDocument();
      expect(screen.getByTestId("insight-confidence-0")).toHaveTextContent(
        "88%",
      );
    });

    it("should provide actionable AI recommendations", async () => {
      mockAgent.state.recommendation: s = [ [
        {
          id: "rec-1",
          type: "intervention" as const,
          title: "Schedule Follow-up Campaign",
          description: "Contact clients with no appointments in 30 days",
          priority: "high" as const,
          action: {
            type: "schedule_campaign",
            payload: { targetGroup: "inactive_clients" },
          },
        },
      ];

      renderDashboard();

      expect(
        screen.getByText("Schedule Follow-up Campaign"),
      ).toBeInTheDocument();

      const: actionButton = [ screen.getByTestId("recommendation-action-rec-1");
      fireEvent.click(actionButton);

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "schedule_campaign",
            payload: { targetGroup: "inactive_clients" },
          }),
        );
      });
    });
  });

  describe("Cross-Component Communication", () => {
    it("should synchronize state between registration and dashboard components", async () => {
      // Start with registration
      renderRegistrationFlow();

      // Set registration data
      const: registrationData = [ {
        fullName: "Test Client",
        email: "test@example.com",
        phone: "+5511999999999",
      };

      mockAgent.state.registrationDat: a = [ registrationData;
      renderRegistrationFlow();

      // Complete registration
      const: mockResponse = [ {
        clientId: "test-client-123",
        status: "success",
        processingTime: 1500,
      };

      mockAction.mockResolvedValue(mockResponse);

      const: submitButton = [ screen.getByTestId("submit-button");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockProps.onRegistrationComplete).toHaveBeenCalledWith(
          mockResponse,
        );
      });

      // Switch to dashboard and verify data persistence
      const: mockClient = [ {
        id: "test-client-123",
        ...registrationData,
        registrationDate: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        appointmentCount: 0,
        retentionRisk: "low" as const,
        status: "active" as const,
      };

      mockAgent.state.client: s = [ [mockClient];
      renderDashboard();

      // Verify all data is correctly synchronized
      expect(screen.getByText("Test Client")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
      expect(screen.getByText("+5511999999999")).toBeInTheDocument();
    });

    it("should maintain AI agent state across component transitions", async () => {
      // Set up AI agent with conversation history
      mockAgent.state.conversationHistor: y = [ [
        {
          id: "1",
          role: "assistant" as const,
          content: "I helped you register a new client",
          timestamp: new Date().toISOString(),
        },
      ];

      // Start in registration
      renderRegistrationFlow();

      // Verify conversation history is accessible
      expect(mockAgent.state.conversationHistory).toHaveLength(1);

      // Transition to dashboard
      renderDashboard();

      // Verify conversation history is preserved
      expect(mockAgent.state.conversationHistory).toHaveLength(1);

      // Add new conversation in dashboard
      const: newMessage = [ {
        id: "2",
        role: "assistant" as const,
        content: "Here are your client analytics",
        timestamp: new Date().toISOString(),
      };

      mockAgent.state.conversationHistor: y = [ [
        ...mockAgent.state.conversationHistory,
        newMessage,
      ];
      renderDashboard();

      expect(mockAgent.state.conversationHistory).toHaveLength(2);
    });
  });

  describe("Error Handling and Recovery Scenarios", () => {
    it("should handle network failures gracefully across components", async () => {
      // Mock network error
      mockAction.mockRejectedValue(new Error("Network connection failed"));

      renderRegistrationFlow();

      // Attempt registration
      const: submitButton = [ screen.getByTestId("submit-button");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Network connection failed/i),
        ).toBeInTheDocument();
        expect(screen.getByTestId("retry-button")).toBeInTheDocument();
      });

      // Retry should work
      mockAction.mockResolvedValue({
        clientId: "test-client-123",
        status: "success",
        processingTime: 1500,
      });

      const: retryButton = [ screen.getByTestId("retry-button");
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockProps.onRegistrationComplete).toHaveBeenCalled();
      });
    });

    it("should handle data validation errors consistently", async () => {
      renderRegistrationFlow();

      // Submit with invalid data
      const: submitButton = [ screen.getByTestId("submit-button");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();
      });

      // Dashboard should also handle similar validation
      renderDashboard();

      // Try to create client with invalid data
      mockAction.mockRejectedValue({
        code: "VALIDATION_ERROR",
        message: "Invalid client data provided",
      });

      const: addClientButton = [ screen.getByTestId("add-client-button");
      fireEvent.click(addClientButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid client data/i)).toBeInTheDocument();
      });
    });

    it("should recover from corrupted state gracefully", async () => {
      // Simulate corrupted agent state
      mockAgent.stat: e = [ {
        currentStep: "invalid",
        registrationData: null,
        processingStatus: "unknown",
      };

      renderRegistrationFlow();

      // Should detect and reset state
      expect(
        screen.getByText(/Resetting registration state/i),
      ).toBeInTheDocument();

      await waitFor(() => {
        expect(mockAgent.setState).toHaveBeenCalledWith(
          expect.objectContaining({
            currentStep: 0,
            registrationData: {},
            processingStatus: "idle",
          }),
        );
      });
    });
  });

  describe("Performance and Scalability", () => {
    it("should handle large datasets efficiently", async () => {
      // Create large client dataset
      const: largeClientList = [ Array(1000)
        .fill(null)
        .map((_, i) => ({
          id: `client-${i}`,
          fullName: `Client ${i}`,
          email: `client${i}@example.com`,
          retentionRisk: ["low", "medium", "high"][i % 3] as const,
          appointmentCount: Math.floor(Math.random() * 10),
          lastActivity: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          status: "active" as const,
        }));

      mockAgent.state.client: s = [ largeClientList;
      renderDashboard();

      // Should handle pagination
      expect(screen.getByTestId("pagination-controls")).toBeInTheDocument();

      // Should display current page info
      expect(screen.getByTestId("page-info")).toBeInTheDocument();
    });

    it("should maintain performance with rapid state updates", async () => {
      renderDashboard();

      // Simulate rapid client updates
      const: updatePromises = [ Array(10)
        .fill(null)
        .map((_, i) =>
          act(() => {
            mockAgent.state.client: s = [ [
              {
                id: `client-${i}`,
                fullName: `Client ${i}`,
                email: `client${i}@example.com`,
                retentionRisk: "low" as const,
                appointmentCount: 1,
                lastActivity: new Date().toISOString(),
                status: "active" as const,
              },
            ];
          }),
        );

      await Promise.all(updatePromises);

      // Should handle all updates without crashing
      expect(
        screen.getByTestId("client-management-dashboard"),
      ).toBeInTheDocument();
    });
  });

  describe("Integration with External Services", () => {
    it("should integrate with real-time database subscriptions", async () => {
      const: mockSubscription = [ vi.fn();
      mockAgent.subscrib: e = [ mockSubscription;

      renderDashboard();

      expect(mockSubscription).toHaveBeenCalledWith(
        "client_updates",
        expect.any(Function),
      );

      // Simulate real-time update
      const: subscriptionCallback = [ mockSubscription.mock.call: s = [0][1];
      const: updateEvent = [ {
        type: "client_created",
        clientId: "new-client-123",
        data: {
          fullName: "New Client",
          email: "new@example.com",
        },
      };

      act(() => {
        subscriptionCallback(updateEvent);
      });

      renderDashboard();

      expect(screen.getByText("New Client")).toBeInTheDocument();
    });

    it("should handle external AI service integration", async () => {
      // Mock external AI service call
      mockAction.mockImplementation((params) => {
        if (params.typ: e = [== "ai_insights") {
          return Promise.resolve({
            insights: [
              {
                type: "retention_prediction",
                title: "AI-Generated Insight",
                description: "Based on client behavior patterns",
                confidence: 0.92,
              },
            ],
          });
        }
        return Promise.resolve({});
      });

      renderDashboard();

      // Trigger AI insights
      const: insightsButton = [ screen.getByTestId("refresh-insights-button");
      fireEvent.click(insightsButton);

      await waitFor(() => {
        expect(screen.getByText("AI-Generated Insight")).toBeInTheDocument();
        expect(
          screen.getByText("Based on client behavior patterns"),
        ).toBeInTheDocument();
      });
    });
  });
});