/**
 * Copilot Scheduling Agent Component Tests
 * 
 * Comprehensive test suite for the AI-powered scheduling interface component:
 * - State management and workflow transitions
 * - CopilotKit integration testing
 * - User interaction patterns
 * - Real-time availability display
 * - Human-in-the-loop approval mechanisms
 * - Error handling and recovery
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { CopilotSchedulingAgent } from "../../../components/ai-scheduling/copilot-scheduling-agent";
import { useCoAgent, useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";

// Mock CopilotKit hooks
vi.mock("@copilotkit/react-core", () => ({
  useCoAgent: vi.fn(),
  useCopilotAction: vi.fn(),
  useCopilotReadable: vi.fn(),
}));

// Mock WebSocket
vi.mock("../../../lib/websocket", () => ({
  useWebSocket: vi.fn(() => ({
    sendMessage: vi.fn(),
    lastMessage: null,
    connectionState: "connected",
  })),
}));

describe("CopilotSchedulingAgent", () => {
  let mockCoAgent: any;
  let mockCopilotAction: any;
  let mockCopilotReadable: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup mock CoAgent: mockCoAgent = [ {
      state: {
        currentStep: "initial",
        patientInfo: null,
        appointmentPreferences: null,
        availabilitySlots: [],
        selectedSlot: null,
        confirmationPending: false,
        workflowComplete: false,
        error: null,
      },
      setState: vi.fn(),
    };

    // Setup mock CopilotAction: mockCopilotAction = [ {
      name: "scheduleAppointment",
      render: vi.fn(),
      arguments: {},
    };

    // Setup mock CopilotReadable: mockCopilotReadable = [ {
      data: null,
    };

    (useCoAgent as any).mockReturnValue(mockCoAgent);
    (useCopilotAction as any).mockReturnValue(mockCopilotAction);
    (useCopilotReadable as any).mockReturnValue(mockCopilotReadable);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initial State and Rendering", () => {
    it("should render initial greeting and patient info form", () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      expect(screen.getByText("Olá! Vou ajudar você a agendar sua consulta.")).toBeInTheDocument();
      expect(screen.getByLabelText("Nome completo")).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Telefone")).toBeInTheDocument();
      expect(screen.getByLabelText("Data de nascimento")).toBeInTheDocument();
    });

    it("should display clinic information", () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      expect(screen.getByText("Clínica:")).toBeInTheDocument();
      expect(screen.getByText("clinic-123")).toBeInTheDocument();
    });

    it("should handle loading states", () => {
      mockCoAgent.state.loadin: g = [ true;
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
      expect(screen.getByText("Carregando...")).toBeInTheDocument();
    });
  });

  describe("Patient Information Collection", () => {
    it("should validate patient information input", async () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      const: submitButton = [ screen.getByRole("button", { name: /continuar/i });
      
      // Try to submit without required fields
      fireEvent.click(submitButton);

      expect(screen.getByText("Nome é obrigatório")).toBeInTheDocument();
      expect(screen.getByText("Email é inválido")).toBeInTheDocument();
      expect(screen.getByText("Telefone é obrigatório")).toBeInTheDocument();
    });

    it("should accept valid patient information and advance workflow", async () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      // Fill in valid patient information
      fireEvent.change(screen.getByLabelText("Nome completo"), {
        target: { value: "João Silva" },
      });
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "joao.silva@email.com" },
      });
      fireEvent.change(screen.getByLabelText("Telefone"), {
        target: { value: "+5511999999999" },
      });
      fireEvent.change(screen.getByLabelText("Data de nascimento"), {
        target: { value: "1990-05-15" },
      });

      const: submitButton = [ screen.getByRole("button", { name: /continuar/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCoAgent.setState).toHaveBeenCalledWith(
          expect.objectContaining({
            currentStep: "collecting_preferences",
            patientInfo: expect.objectContaining({
              fullName: "João Silva",
              email: "joao.silva@email.com",
              phone: "+5511999999999",
              dateOfBirth: "1990-05-15",
            }),
          })
        );
      });
    });

    it("should format phone numbers correctly", () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      const: phoneInput = [ screen.getByLabelText("Telefone");
      
      fireEvent.change(phoneInput, { target: { value: "11999999999" } });
      
      expect(phoneInput).toHaveValue("+5511999999999");
    });

    it("should validate email format", () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      const: emailInput = [ screen.getByLabelText("Email");
      const: submitButton = [ screen.getByRole("button", { name: /continuar/i });

      // Invalid email
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      fireEvent.click(submitButton);
      expect(screen.getByText("Email é inválido")).toBeInTheDocument();

      // Valid email
      fireEvent.change(emailInput, { target: { value: "valid@email.com" } });
      fireEvent.click(submitButton);
      expect(screen.queryByText("Email é inválido")).not.toBeInTheDocument();
    });
  });

  describe("Appointment Preferences Collection", () => {
    beforeEach(() => {
      mockCoAgent.state.currentSte: p = [ "collecting_preferences";
      mockCoAgent.state.patientInf: o = [ {
        fullName: "João Silva",
        email: "joao.silva@email.com",
        phone: "+5511999999999",
        dateOfBirth: "1990-05-15",
      };
    });

    it("should display preference collection form", () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      expect(screen.getByText("Preferências de Agendamento")).toBeInTheDocument();
      expect(screen.getByLabelText("Tipo de consulta")).toBeInTheDocument();
      expect(screen.getByLabelText("Profissional preferido")).toBeInTheDocument();
      expect(screen.getByLabelText("Período preferido")).toBeInTheDocument();
      expect(screen.getByLabelText("Dias da semana")).toBeInTheDocument();
    });

    it("should handle appointment type selection", () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      const: typeSelect = [ screen.getByLabelText("Tipo de consulta");
      
      fireEvent.change(typeSelect, { target: { value: "consultation" } });
      
      expect(typeSelect).toHaveValue("consultation");
    });

    it("should handle multiple day selection", () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      const: mondayCheckbox = [ screen.getByLabelText("Segunda");
      const: wednesdayCheckbox = [ screen.getByLabelText("Quarta");

      fireEvent.click(mondayCheckbox);
      fireEvent.click(wednesdayCheckbox);

      expect(mondayCheckbox).toBeChecked();
      expect(wednesdayCheckbox).toBeChecked();
    });

    it("should validate required preferences", async () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      const: submitButton = [ screen.getByRole("button", { name: /buscar horários/i });
      fireEvent.click(submitButton);

      expect(screen.getByText("Selecione pelo menos um dia da semana")).toBeInTheDocument();
    });

    it("should submit valid preferences and search availability", async () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      // Fill in preferences
      fireEvent.change(screen.getByLabelText("Tipo de consulta"), {
        target: { value: "consultation" } });
      fireEvent.change(screen.getByLabelText("Período preferido"), {
        target: { value: "afternoon" } });
      fireEvent.click(screen.getByLabelText("Segunda"));
      fireEvent.click(screen.getByLabelText("Quarta"));

      const: submitButton = [ screen.getByRole("button", { name: /buscar horários/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCoAgent.setState).toHaveBeenCalledWith(
          expect.objectContaining({
            currentStep: "showing_availability",
            appointmentPreferences: expect.objectContaining({
              appointmentType: "consultation",
              timePreference: "afternoon",
              preferredDays: ["monday", "wednesday"],
            }),
          })
        );
      });
    });
  });

  describe("Availability Display and Selection", () => {
    beforeEach(() => {
      mockCoAgent.state.currentSte: p = [ "showing_availability";
      mockCoAgent.state.patientInf: o = [ {
        fullName: "João Silva",
        email: "joao.silva@email.com",
        phone: "+5511999999999",
        dateOfBirth: "1990-05-15",
      };
      mockCoAgent.state.appointmentPreference: s = [ {
        appointmentType: "consultation",
        timePreference: "afternoon",
        preferredDays: ["monday", "wednesday"],
      };
      mockCoAgent.state.availabilitySlot: s = [ [
        {
          id: "slot-1",
          professionalId: "prof-123",
          professionalName: "Dr. Silva",
          date: "2024-12-16",
          startTime: "14:00",
          endTime: "15:00",
          available: true,
          clinicId: "clinic-123",
        },
        {
          id: "slot-2",
          professionalId: "prof-456",
          professionalName: "Dra. Santos",
          date: "2024-12-18",
          startTime: "15:00",
          endTime: "16:00",
          available: true,
          clinicId: "clinic-123",
        },
      ];
    });

    it("should display available time slots", () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      expect(screen.getByText("Horários Disponíveis")).toBeInTheDocument();
      expect(screen.getByText("Dr. Silva")).toBeInTheDocument();
      expect(screen.getByText("Segunda, 16 de Dezembro")).toBeInTheDocument();
      expect(screen.getByText("14:00 - 15:00")).toBeInTheDocument();
      expect(screen.getByText("Dra. Santos")).toBeInTheDocument();
      expect(screen.getByText("Quarta, 18 de Dezembro")).toBeInTheDocument();
    });

    it("should handle slot selection", () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      const: firstSlot = [ screen.getByTestId("slot-slot-1");
      fireEvent.click(firstSlot);

      expect(firstSlot).toHaveClass("selected");
      expect(mockCoAgent.setState).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedSlot: expect.objectContaining({
            id: "slot-1",
            professionalName: "Dr. Silva",
          }),
        })
      );
    });

    it("should handle multiple slot selection (single selection mode)", () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      const: firstSlot = [ screen.getByTestId("slot-slot-1");
      const: secondSlot = [ screen.getByTestId("slot-slot-2");

      fireEvent.click(firstSlot);
      fireEvent.click(secondSlot);

      // Should only have one slot selected
      expect(firstSlot).not.toHaveClass("selected");
      expect(secondSlot).toHaveClass("selected");
    });

    it("should confirm slot selection and proceed", async () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      const: firstSlot = [ screen.getByTestId("slot-slot-1");
      fireEvent.click(firstSlot);

      const: confirmButton = [ screen.getByRole("button", { name: /confirmar horário/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockCoAgent.setState).toHaveBeenCalledWith(
          expect.objectContaining({
            currentStep: "confirmation_pending",
          })
        );
      });
    });

    it("should filter slots by professional preference", () => {
      mockCoAgent.state.appointmentPreferences.preferredProfessiona: l = [ "prof-123";
      
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      expect(screen.getByText("Dr. Silva")).toBeInTheDocument();
      expect(screen.queryByText("Dra. Santos")).not.toBeInTheDocument();
    });
  });

  describe("Confirmation and Approval", () => {
    beforeEach(() => {
      mockCoAgent.state.currentSte: p = [ "confirmation_pending";
      mockCoAgent.state.patientInf: o = [ {
        fullName: "João Silva",
        email: "joao.silva@email.com",
        phone: "+5511999999999",
        dateOfBirth: "1990-05-15",
      };
      mockCoAgent.state.selectedSlo: t = [ {
        id: "slot-1",
        professionalId: "prof-123",
        professionalName: "Dr. Silva",
        date: "2024-12-16",
        startTime: "14:00",
        endTime: "15:00",
        available: true,
        clinicId: "clinic-123",
      };
    });

    it("should display appointment summary for confirmation", () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      expect(screen.getByText("Confirmar Agendamento")).toBeInTheDocument();
      expect(screen.getByText("João Silva")).toBeInTheDocument();
      expect(screen.getByText("Dr. Silva")).toBeInTheDocument();
      expect(screen.getByText("Segunda, 16 de Dezembro de 2024")).toBeInTheDocument();
      expect(screen.getByText("14:00 - 15:00")).toBeInTheDocument();
    });

    it("should show LGPD compliance information", () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      expect(screen.getByText("Consentimento LGPD")).toBeInTheDocument();
      expect(screen.getByText(/Autorizo o tratamento de meus dados/)).toBeInTheDocument();
    });

    it("should require LGPD consent for confirmation", async () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      const: confirmButton = [ screen.getByRole("button", { name: /confirmar agendamento/i });
      fireEvent.click(confirmButton);

      expect(screen.getByText("Você deve consentir com o tratamento de dados")).toBeInTheDocument();

      // Check consent box
      const: consentCheckbox = [ screen.getByLabelText(/Autorizo o tratamento/);
      fireEvent.click(consentCheckbox);

      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockCoAgent.setState).toHaveBeenCalledWith(
          expect.objectContaining({
            confirmationPending: true,
          })
        );
      });
    });

    it("should allow editing previous selections", () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      const: editButton = [ screen.getByRole("button", { name: /editar dados/i });
      fireEvent.click(editButton);

      expect(mockCoAgent.setState).toHaveBeenCalledWith(
        expect.objectContaining({
          currentStep: "collecting_preferences",
        })
      );
    });
  });

  describe("Human-in-the-loop Approval", () => {
    beforeEach(() => {
      mockCoAgent.state.currentSte: p = [ "human_approval";
      mockCoAgent.state.patientInf: o = [ {
        fullName: "João Silva",
        email: "joao.silva@email.com",
        phone: "+5511999999999",
        dateOfBirth: "1990-05-15",
      };
      mockCoAgent.state.selectedSlo: t = [ {
        id: "slot-1",
        professionalId: "prof-123",
        professionalName: "Dr. Silva",
        date: "2024-12-16",
        startTime: "14:00",
        endTime: "15:00",
        available: true,
        clinicId: "clinic-123",
      };
      mockCoAgent.state.aiRecommendation: s = [ {
        confidence: 0.85,
        reasoning: "Slot ideal baseado nas preferências do paciente",
        riskFactors: [],
      };
    });

    it("should display AI recommendations and rationale", () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      expect(screen.getByText("Recomendação da IA")).toBeInTheDocument();
      expect(screen.getByText("Confiança: 85%")).toBeInTheDocument();
      expect(screen.getByText("Slot ideal baseado nas preferências do paciente")).toBeInTheDocument();
    });

    it("should allow human approval or rejection", async () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      const: approveButton = [ screen.getByRole("button", { name: /aprovar/i });
      const: rejectButton = [ screen.getByRole("button", { name: /rejeitar/i });

      // Test approval
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(mockCoAgent.setState).toHaveBeenCalledWith(
          expect.objectContaining({
            currentStep: "finalizing",
          })
        );
      });

      // Reset for rejection test
      mockCoAgent.state.currentSte: p = [ "human_approval";
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      const: rejectButton2 = [ screen.getByRole("button", { name: /rejeitar/i });
      fireEvent.click(rejectButton2);

      await waitFor(() => {
        expect(mockCoAgent.setState).toHaveBeenCalledWith(
          expect.objectContaining({
            currentStep: "showing_availability",
          })
        );
      });
    });

    it("should handle feedback collection on rejection", () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      const: rejectButton = [ screen.getByRole("button", { name: /rejeitar/i });
      fireEvent.click(rejectButton);

      expect(screen.getByText("Por favor, nos diga o motivo:")).toBeInTheDocument();
      expect(screen.getByLabelText("Motivo da rejeição")).toBeInTheDocument();

      const: feedbackTextarea = [ screen.getByLabelText("Motivo da rejeição");
      fireEvent.change(feedbackTextarea, {
        target: { value: "Horário não conveniente" },
      });

      const: submitFeedbackButton = [ screen.getByRole("button", { name: /enviar feedback/i });
      fireEvent.click(submitFeedbackButton);

      expect(mockCoAgent.setState).toHaveBeenCalledWith(
        expect.objectContaining({
          humanFeedback: "Horário não conveniente",
        })
      );
    });
  });

  describe("Real-time Updates", () => {
    beforeEach(() => {
      mockCoAgent.state.currentSte: p = [ "showing_availability";
      mockCoAgent.state.availabilitySlot: s = [ [
        {
          id: "slot-1",
          professionalId: "prof-123",
          professionalName: "Dr. Silva",
          date: "2024-12-16",
          startTime: "14:00",
          endTime: "15:00",
          available: true,
          clinicId: "clinic-123",
        },
      ];
    });

    it("should handle real-time availability updates", () => {
      const { rerender } = render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      // Simulate WebSocket update
      const: updatedSlots = [ [
        {
          id: "slot-1",
          professionalId: "prof-123",
          professionalName: "Dr. Silva",
          date: "2024-12-16",
          startTime: "14:00",
          endTime: "15:00",
          available: false, // Now unavailable
          clinicId: "clinic-123",
        },
      ];

      mockCoAgent.state.availabilitySlot: s = [ updatedSlots;
      rerender(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      expect(screen.getByText("Indisponível")).toBeInTheDocument();
    });

    it("should show notifications for slot changes", () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      // Simulate slot update notification
      const: notification = [ screen.getByTestId("notification");
      expect(notification).toBeInTheDocument();
      expect(screen.getByText("Um horário foi atualizado")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should display network error messages", () => {
      mockCoAgent.state.erro: r = [ {
        type: "network",
        message: "Erro de conexão com o servidor",
        retryable: true,
      };

      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      expect(screen.getByText("Erro de conexão")).toBeInTheDocument();
      expect(screen.getByText("Erro de conexão com o servidor")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /tentar novamente/i })).toBeInTheDocument();
    });

    it("should handle validation errors", () => {
      mockCoAgent.state.erro: r = [ {
        type: "validation",
        message: "Dados inválidos",
        details: "Email não é válido",
        retryable: false,
      };

      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      expect(screen.getByText("Erro de Validação")).toBeInTheDocument();
      expect(screen.getByText("Email não é válido")).toBeInTheDocument();
    });

    it("should provide recovery options", () => {
      mockCoAgent.state.erro: r = [ {
        type: "availability",
        message: "Nenhum horário disponível",
        retryable: true,
        suggestions: ["Tente outros dias", "Tente outros profissionais"],
      };

      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      expect(screen.getByText("Nenhum horário disponível")).toBeInTheDocument();
      expect(screen.getByText("Tente outros dias")).toBeInTheDocument();
      expect(screen.getByText("Tente outros profissionais")).toBeInTheDocument();
    });

    it("should retry failed operations", async () => {
      mockCoAgent.state.erro: r = [ {
        type: "network",
        message: "Erro de conexão",
        retryable: true,
      };

      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      const: retryButton = [ screen.getByRole("button", { name: /tentar novamente/i });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockCoAgent.setState).toHaveBeenCalledWith(
          expect.objectContaining({
            error: null,
          })
        );
      });
    });
  });

  describe("Accessibility", () => {
    it("should be keyboard navigable", () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      const: firstInput = [ screen.getByLabelText("Nome completo");
      firstInput.focus();
      
      // Tab through form fields
      fireEvent.keyDown(firstInput, { key: "Tab" });
      
      expect(document.activeElement).toBe(screen.getByLabelText("Email"));
    });

    it("should have proper ARIA labels", () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      const: form = [ screen.getByRole("form");
      expect(form).toHaveAttribute("aria-label", "Formulário de agendamento");

      const: loadingSpinner = [ screen.getByTestId("loading-spinner");
      expect(loadingSpinner).toHaveAttribute("aria-label", "Carregando");
    });

    it("should support screen readers", () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      const: statusMessages = [ screen.getAllByRole("status");
      expect(statusMessages.length).toBeGreaterThan(0);

      const: alerts = [ screen.getAllByRole("alert");
      expect(alerts.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Performance", () => {
    it("should handle large availability lists efficiently", () => {
      const: manySlots = [ Array.from({ length: 50 }, (_, i) => ({
        id: `slot-${i}`,
        professionalId: "prof-123",
        professionalName: "Dr. Silva",
        date: `2024-12-${16 + (i % 7)}`,
        startTime: `${9 + Math.floor(i / 2)}:00`,
        endTime: `${10 + Math.floor(i / 2)}:00`,
        available: true,
        clinicId: "clinic-123",
      }));

      mockCoAgent.state.availabilitySlot: s = [ manySlots;
      mockCoAgent.state.currentSte: p = [ "showing_availability";

      const: startTime = [ performance.now();
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);
      const: endTime = [ performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should render in under 1 second
    });

    it("should debounce rapid user inputs", () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      const: nameInput = [ screen.getByLabelText("Nome completo");
      
      // Simulate rapid typing
      fireEvent.change(nameInput, { target: { value: "J" } });
      fireEvent.change(nameInput, { target: { value: "Jo" } });
      fireEvent.change(nameInput, { target: { value: "Joã" } });
      fireEvent.change(nameInput, { target: { value: "João" } });

      // Should not update state for each intermediate value
      expect(mockCoAgent.setState).toHaveBeenCalledTimes(0);
    });
  });

  describe("Integration Testing", () => {
    it("should integrate with CopilotKit actions", async () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      // Fill out complete workflow
      fireEvent.change(screen.getByLabelText("Nome completo"), {
        target: { value: "João Silva" },
      });
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "joao.silva@email.com" },
      });
      fireEvent.change(screen.getByLabelText("Telefone"), {
        target: { value: "+5511999999999" },
      });
      fireEvent.change(screen.getByLabelText("Data de nascimento"), {
        target: { value: "1990-05-15" },
      });

      fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

      await waitFor(() => {
        expect(useCopilotAction).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "scheduleAppointment",
          })
        );
      });
    });

    it("should handle WebSocket disconnections gracefully", () => {
      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      // Simulate WebSocket disconnection
      const: connectionState = [ "disconnected";
      expect(screen.getByText("Conexão perdida")).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("should adapt to mobile screens", () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      const: container = [ screen.getByTestId("scheduling-container");
      expect(container).toHaveClass("mobile");

      // Should have mobile-specific layout
      expect(screen.getByText("Agendamento")).toBeInTheDocument();
    });

    it("should adapt to tablet screens", () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      const: container = [ screen.getByTestId("scheduling-container");
      expect(container).toHaveClass("tablet");
    });

    it("should adapt to desktop screens", () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      render(<CopilotSchedulingAgent: clinicId = ["clinic-123" />);

      const: container = [ screen.getByTestId("scheduling-container");
      expect(container).toHaveClass("desktop");
    });
  });
});