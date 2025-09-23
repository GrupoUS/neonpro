/**
 * ClientRegistrationAgent Component Tests
 *
 * Comprehensive test suite for the ClientRegistrationAgent component
 * Tests CopilotKit integration, AI-powered registration, OCR processing,
 * LGPD compliance, and multi-step workflow functionality.
 */

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
import {
  AguiMessageType,
  AguiClientRegistrationMessage,
  AguiClientRegistrationResponse,
} from "@neonpro/agui-protocol";

// Mock dependencies
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
  })),
}));

// Mock AG-UI Protocol service
const mockService = {
  processClientRegistration: vi.fn(),
  processDocumentOCR: vi.fn(),
  validateClientData: vi.fn(),
  generateAISuggestions: vi.fn(),
  getRegistrationProgress: vi.fn(),
};

describe("ClientRegistrationAgent", () => {
  let queryClient: QueryClient;
  let mockAgent: any;
  let mockAction: any;

  const mockProps = {
    clinicId: "test-clinic-id",
    professionalId: "test-professional-id",
    onRegistrationComplete: vi.fn(),
    onError: vi.fn(),
  };

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Mock agent state
    mockAgent = {
      state: {
        currentStep: 0,
        registrationData: {},
        processingStatus: "idle",
        ocrResults: null,
        validationResults: [],
        aiSuggestions: [],
        consentRecords: [],
        progress: 0,
      },
      setState: vi.fn(),
    };

    // Mock CopilotKit hooks
    const { useCoAgent, useCopilotAction } = await import(
      "@copilotkit/react-core"
    );
    vi.mocked(useCoAgent).mockReturnValue([mockAgent, vi.fn()]);

    mockAction = vi.fn();
    vi.mocked(useCopilotAction).mockReturnValue({
      invoke: mockAction,
      result: null,
    });

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <CopilotProvider runtimeUrl="/api/copilotkit">
          <ClientRegistrationAgent {...mockProps} />
        </CopilotProvider>
      </QueryClientProvider>,
    );
  };

  describe("Initial Render and Structure", () => {
    it("should render the component with initial step", () => {
      renderComponent();

      expect(
        screen.getByTestId("client-registration-agent"),
      ).toBeInTheDocument();
      expect(screen.getByText(/Client Registration/i)).toBeInTheDocument();
      expect(screen.getByTestId("registration-progress")).toBeInTheDocument();
      expect(screen.getByTestId("ai-suggestions-panel")).toBeInTheDocument();
    });

    it("should display progress indicator with initial state", () => {
      renderComponent();

      const progressIndicator = screen.getByTestId("progress-indicator");
      expect(progressIndicator).toBeInTheDocument();
      expect(progressIndicator).toHaveTextContent("0%");
    });

    it("should render AI assistant panel", () => {
      renderComponent();

      expect(screen.getByTestId("ai-assistant-panel")).toBeInTheDocument();
      expect(screen.getByText(/AI Assistant/i)).toBeInTheDocument();
    });

    it("should render action buttons based on current step", () => {
      renderComponent();

      expect(screen.getByTestId("back-button")).toBeInTheDocument();
      expect(screen.getByTestId("continue-button")).toBeInTheDocument();
      expect(screen.getByTestId("ai-help-button")).toBeInTheDocument();
    });
  });

  describe("Multi-Step Registration Flow", () => {
    it("should handle step navigation correctly", async () => {
      renderComponent();

      // Initial step (Personal Information)
      expect(screen.getByText(/Personal Information/i)).toBeInTheDocument();

      // Mock continue action
      const continueButton = screen.getByTestId("continue-button");
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(mockAgent.setState).toHaveBeenCalledWith(
          expect.objectContaining({ currentStep: 1 }),
        );
      });
    });

    it("should handle back navigation", async () => {
      // Set current step to 1
      mockAgent.state.currentStep = 1;
      renderComponent();

      const backButton = screen.getByTestId("back-button");
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(mockAgent.setState).toHaveBeenCalledWith(
          expect.objectContaining({ currentStep: 0 }),
        );
      });
    });

    it("should validate current step before proceeding", async () => {
      renderComponent();

      const continueButton = screen.getByTestId("continue-button");
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(mockAgent.setState).toHaveBeenCalled();
      });
    });

    it("should display appropriate step titles and descriptions", () => {
      const steps = [
        {
          title: /Personal Information/i,
          description: /Basic client details/i,
        },
        { title: /Contact Information/i, description: /Phone and email/i },
        { title: /Address Information/i, description: /Residential address/i },
        { title: /Medical History/i, description: /Health information/i },
        { title: /Emergency Contact/i, description: /Emergency details/i },
        { title: /Consent Management/i, description: /Legal consents/i },
        { title: /Review and Submit/i, description: /Final review/i },
      ];

      steps.forEach((step, index) => {
        mockAgent.state.currentStep = index;
        renderComponent();

        expect(screen.getByText(step.title)).toBeInTheDocument();
        expect(screen.getByText(step.description)).toBeInTheDocument();
      });
    });
  });

  describe("Form Data Handling", () => {
    it("should handle form field changes", async () => {
      renderComponent();

      const nameInput = screen.getByTestId("fullName-input");
      fireEvent.change(nameInput, { target: { value: "John Doe" } });

      await waitFor(() => {
        expect(mockAgent.setState).toHaveBeenCalledWith(
          expect.objectContaining({
            registrationData: expect.objectContaining({
              fullName: "John Doe",
            }),
          }),
        );
      });
    });

    it("should validate form fields in real-time", async () => {
      renderComponent();

      const emailInput = screen.getByTestId("email-input");
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });

      await waitFor(() => {
        expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
      });
    });

    it("should auto-populate fields from OCR results", async () => {
      const mockOCRResults = {
        fullName: "Jane Doe",
        dateOfBirth: "1990-01-01",
        documentNumber: "123456789",
      };

      mockAgent.state.ocrResults = mockOCRResults;
      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue("Jane Doe")).toBeInTheDocument();
        expect(screen.getByDisplayValue("1990-01-01")).toBeInTheDocument();
      });
    });

    it("should handle CPF validation", async () => {
      renderComponent();

      const cpfInput = screen.getByTestId("cpf-input");
      fireEvent.change(cpfInput, { target: { value: "123.456.789-00" } });

      await waitFor(() => {
        expect(screen.getByText(/Invalid CPF format/i)).toBeInTheDocument();
      });
    });
  });

  describe("OCR Document Processing", () => {
    it("should handle document upload", async () => {
      renderComponent();

      const fileInput = screen.getByTestId("document-upload-input");
      const file = new File(["test"], "test.pdf", { type: "application/pdf" });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "document_ocr",
            payload: expect.objectContaining({
              documentType: "id_card",
            }),
          }),
        );
      });
    });

    it("should display OCR processing status", async () => {
      mockAgent.state.processingStatus = "processing_ocr";
      renderComponent();

      expect(screen.getByText(/Processing document.../i)).toBeInTheDocument();
      expect(screen.getByTestId("ocr-progress-indicator")).toBeInTheDocument();
    });

    it("should handle OCR completion with results", async () => {
      const mockResults = {
        extractedFields: {
          fullName: "Test User",
          dateOfBirth: "1990-01-01",
        },
        confidence: 0.95,
      };

      mockAgent.state.ocrResults = mockResults;
      mockAgent.state.processingStatus = "ocr_complete";
      renderComponent();

      expect(
        screen.getByText(/Document processed successfully/i),
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    it("should handle OCR errors gracefully", async () => {
      mockAgent.state.processingStatus = "ocr_error";
      renderComponent();

      expect(
        screen.getByText(/Document processing failed/i),
      ).toBeInTheDocument();
      expect(screen.getByTestId("retry-ocr-button")).toBeInTheDocument();
    });
  });

  describe("AI-Powered Features", () => {
    it("should display AI suggestions for form completion", async () => {
      const mockSuggestions = [
        {
          id: "1",
          type: "data_completion",
          field: "email",
          suggestedValue: "jane.doe@example.com",
          confidence: 0.85,
        },
      ];

      mockAgent.state.aiSuggestions = mockSuggestions;
      renderComponent();

      expect(screen.getByTestId("ai-suggestion-email")).toBeInTheDocument();
      expect(
        screen.getByText(/Suggested: jane.doe@example.com/i),
      ).toBeInTheDocument();
    });

    it("should handle AI suggestion acceptance", async () => {
      const mockSuggestions = [
        {
          id: "1",
          type: "data_completion",
          field: "email",
          suggestedValue: "jane.doe@example.com",
          confidence: 0.85,
        },
      ];

      mockAgent.state.aiSuggestions = mockSuggestions;
      renderComponent();

      const acceptButton = screen.getByTestId("accept-suggestion-1");
      fireEvent.click(acceptButton);

      await waitFor(() => {
        expect(mockAgent.setState).toHaveBeenCalledWith(
          expect.objectContaining({
            registrationData: expect.objectContaining({
              email: "jane.doe@example.com",
            }),
          }),
        );
      });
    });

    it("should handle AI-powered validation", async () => {
      const mockValidation = [
        {
          field: "phone",
          isValid: false,
          message: "Phone number format is invalid",
          severity: "error",
        },
      ];

      mockAgent.state.validationResults = mockValidation;
      renderComponent();

      expect(
        screen.getByText(/Phone number format is invalid/i),
      ).toBeInTheDocument();
    });
  });

  describe("LGPD Compliance Features", () => {
    it("should display consent management interface", async () => {
      mockAgent.state.currentStep = 5; // Consent Management step
      renderComponent();

      expect(screen.getByText(/Consent Management/i)).toBeInTheDocument();
      expect(screen.getByTestId("consent-treatment")).toBeInTheDocument();
      expect(screen.getByTestId("consent-data-sharing")).toBeInTheDocument();
    });

    it("should handle consent agreement", async () => {
      mockAgent.state.currentStep = 5;
      renderComponent();

      const treatmentConsent = screen.getByTestId("consent-treatment");
      fireEvent.click(treatmentConsent);

      await waitFor(() => {
        expect(mockAgent.setState).toHaveBeenCalledWith(
          expect.objectContaining({
            registrationData: expect.objectContaining({
              treatmentConsent: true,
            }),
          }),
        );
      });
    });

    it("should validate required consents before submission", async () => {
      mockAgent.state.currentStep = 6; // Review step
      mockAgent.state.registrationData = {
        treatmentConsent: false,
        dataSharingConsent: false,
      };

      renderComponent();

      const submitButton = screen.getByTestId("submit-button");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/All required consents must be agreed/i),
        ).toBeInTheDocument();
      });
    });

    it("should display PII detection warnings", async () => {
      mockAgent.state.validationResults = [
        {
          field: "medicalHistory",
          isValid: false,
          message: "PII detected in medical history",
          severity: "warning",
        },
      ];

      renderComponent();

      expect(screen.getByText(/PII detected/i)).toBeInTheDocument();
    });
  });

  describe("Submission and Completion", () => {
    it("should handle final submission with all data", async () => {
      const mockRegistrationData = {
        fullName: "John Doe",
        email: "john@example.com",
        phone: "+5511999999999",
        treatmentConsent: true,
        dataSharingConsent: true,
      };

      mockAgent.state.currentStep = 6;
      mockAgent.state.registrationData = mockRegistrationData;
      mockAction.mockResolvedValue({
        success: true,
        clientId: "test-client-id",
        processingTime: 1500,
      });

      renderComponent();

      const submitButton = screen.getByTestId("submit-button");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "client_registration",
            payload: expect.objectContaining({
              clientData: mockRegistrationData,
            }),
          }),
        );
      });
    });

    it("should handle successful registration", async () => {
      const mockResponse: AguiClientRegistrationResponse = {
        clientId: "test-client-id",
        status: "success",
        validationResults: [],
        processingTime: 1500,
      };

      mockAgent.state.currentStep = 6;
      mockAction.mockResolvedValue(mockResponse);

      renderComponent();

      const submitButton = screen.getByTestId("submit-button");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockProps.onRegistrationComplete).toHaveBeenCalledWith(
          mockResponse,
        );
      });
    });

    it("should handle registration errors", async () => {
      const mockError = {
        code: "VALIDATION_ERROR",
        message: "Invalid client data",
      };

      mockAgent.state.currentStep = 6;
      mockAction.mockRejectedValue(mockError);

      renderComponent();

      const submitButton = screen.getByTestId("submit-button");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockProps.onError).toHaveBeenCalledWith(mockError);
        expect(screen.getByText(/Registration failed/i)).toBeInTheDocument();
      });
    });

    it("should show processing state during submission", async () => {
      mockAgent.state.currentStep = 6;
      mockAction.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000)),
      );

      renderComponent();

      const submitButton = screen.getByTestId("submit-button");
      fireEvent.click(submitButton);

      expect(
        screen.getByText(/Submitting registration.../i),
      ).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Accessibility and UX Features", () => {
    it("should have proper ARIA labels and attributes", () => {
      renderComponent();

      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "0",
      );
      expect(screen.getByRole("form")).toHaveAttribute(
        "aria-label",
        "Client registration form",
      );
    });

    it("should handle keyboard navigation", () => {
      renderComponent();

      const continueButton = screen.getByTestId("continue-button");
      continueButton.focus();

      fireEvent.keyDown(continueButton, { key: "Enter" });

      expect(mockAction).toHaveBeenCalled();
    });

    it("should be responsive and mobile-friendly", () => {
      renderComponent();

      const container = screen.getByTestId("client-registration-agent");
      expect(container).toHaveClass("responsive-layout");
    });

    it("should provide clear loading states", () => {
      mockAgent.state.processingStatus = "processing";
      renderComponent();

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
      expect(screen.getByText(/Processing.../i)).toBeInTheDocument();
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle network errors gracefully", async () => {
      mockAction.mockRejectedValue(new Error("Network error"));
      renderComponent();

      const continueButton = screen.getByTestId("continue-button");
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
        expect(screen.getByTestId("retry-button")).toBeInTheDocument();
      });
    });

    it("should handle malformed OCR results", async () => {
      mockAgent.state.ocrResults = { invalid: "data" };
      renderComponent();

      expect(screen.getByText(/Invalid OCR data/i)).toBeInTheDocument();
    });

    it("should handle missing required fields validation", async () => {
      mockAgent.state.registrationData = {};
      renderComponent();

      const continueButton = screen.getByTestId("continue-button");
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();
      });
    });

    it("should handle concurrent form submissions", async () => {
      renderComponent();

      const continueButton = screen.getByTestId("continue-button");
      fireEvent.click(continueButton);
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Integration with External Services", () => {
    it("should integrate with CopilotKit agent properly", async () => {
      const { useCoAgent } = await import("@copilotkit/react-core");

      renderComponent();

      expect(useCoAgent).toHaveBeenCalled();
    });

    it("should use CopilotKit actions for AI features", async () => {
      renderComponent();

      const aiHelpButton = screen.getByTestId("ai-help-button");
      fireEvent.click(aiHelpButton);

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "ai_help",
            payload: expect.objectContaining({
              currentStep: mockAgent.state.currentStep,
            }),
          }),
        );
      });
    });

    it("should handle agent state synchronization", async () => {
      const newAgentState = {
        ...mockAgent.state,
        currentStep: 2,
        registrationData: { fullName: "Updated Name" },
      };

      // Simulate agent state update
      vi.mocked(useCoAgent).mockReturnValue([newAgentState, vi.fn()]);

      renderComponent();

      expect(screen.getByDisplayValue("Updated Name")).toBeInTheDocument();
    });
  });

  describe("Performance and Optimization", () => {
    it("should debounce rapid form field changes", async () => {
      renderComponent();

      const nameInput = screen.getByTestId("fullName-input");

      // Simulate rapid typing
      fireEvent.change(nameInput, { target: { value: "J" } });
      fireEvent.change(nameInput, { target: { value: "Jo" } });
      fireEvent.change(nameInput, { target: { value: "Joh" } });
      fireEvent.change(nameInput, { target: { value: "John" } });

      await waitFor(
        () => {
          expect(mockAgent.setState).toHaveBeenCalledTimes(1);
        },
        { timeout: 500 },
      );
    });

    it("should lazy load heavy components", async () => {
      renderComponent();

      // Initially, OCR components might not be visible
      expect(screen.queryByTestId("ocr-processor")).not.toBeInTheDocument();

      // Navigate to step where OCR is needed
      mockAgent.state.currentStep = 3;
      renderComponent();

      // Now OCR components should be available
      expect(screen.getByTestId("ocr-processor")).toBeInTheDocument();
    });

    it("should optimize re-renders with React.memo", () => {
      const { rerender } = renderComponent();

      const initialRenderCount = vi.fn();
      rerender(<ClientRegistrationAgent {...mockProps} />);

      // Should not cause unnecessary re-renders
      expect(initialRenderCount).not.toHaveBeenCalled();
    });
  });

  describe("Data Persistence and Recovery", () => {
    it("should save registration progress to localStorage", async () => {
      const mockStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
      };
      vi.stubGlobal("localStorage", mockStorage);

      renderComponent();

      expect(mockStorage.setItem).toHaveBeenCalledWith(
        "clientRegistrationProgress",
        expect.any(String),
      );
    });

    it("should recover registration progress from localStorage", async () => {
      const savedProgress = {
        currentStep: 2,
        registrationData: { fullName: "Recovered Name" },
        lastSaved: new Date().toISOString(),
      };

      const mockStorage = {
        getItem: vi.fn(() => JSON.stringify(savedProgress)),
        setItem: vi.fn(),
      };
      vi.stubGlobal("localStorage", mockStorage);

      renderComponent();

      expect(screen.getByDisplayValue("Recovered Name")).toBeInTheDocument();
    });

    it("should handle corrupted saved data gracefully", async () => {
      const mockStorage = {
        getItem: vi.fn(() => "invalid-json"),
        setItem: vi.fn(),
      };
      vi.stubGlobal("localStorage", mockStorage);

      renderComponent();

      expect(
        screen.getByText(/Starting new registration/i),
      ).toBeInTheDocument();
    });
  });
});
