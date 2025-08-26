/**
 * 🃏 Enhanced Card Component Tests - NeonPro Healthcare
 * ==================================================
 *
 * Comprehensive unit tests for Card component with:
 * - Patient information display compliance
 * - NEONPROV1 theme consistency
 * - LGPD data privacy features
 * - Healthcare-specific card variants
 * - Responsive behavior validation
 */

// Mock the Card components
import { Card, CardContent, CardHeader, CardTitle } from "@neonpro/ui";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

// Mock theme provider
const ThemeWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="neonprov1-theme">{children}</div>
);

describe("card Component - NeonPro Healthcare UI", () => {
  afterEach(() => {
    cleanup();
  });

  describe("basic Card Structure", () => {
    it("should render card with header and content", () => {
      render(
        <ThemeWrapper>
          <Card data-testid="patient-card">
            <CardHeader>
              <CardTitle>Informações do Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Maria da Silva Santos</p>
              <p>CPF: ***.***.***-00</p>
            </CardContent>
          </Card>
        </ThemeWrapper>,
      );

      const card = screen.getByTestId("patient-card");
      expect(card).toBeInTheDocument();
      expect(screen.getByText("Informações do Paciente")).toBeInTheDocument();
      expect(screen.getByText("Maria da Silva Santos")).toBeInTheDocument();
    });

    it("should support healthcare-specific card variants", () => {
      const variants = [
        "patient",
        "appointment",
        "professional",
        "alert",
      ] as const;

      variants.forEach((variant) => {
        render(
          <ThemeWrapper>
            <Card data-testid={`card-${variant}`} variant={variant}>
              <CardContent>{variant} Card Content</CardContent>
            </Card>
          </ThemeWrapper>,
        );

        const card = screen.getByTestId(`card-${variant}`);
        // Check for actual CVA classes that would be applied
        expect(card).toHaveClass("flex", "flex-col", "rounded-lg", "border");
        // Check for variant-specific classes
        if (variant === "patient") {
          expect(card).toHaveClass("border-l-4", "border-l-primary");
        }

        cleanup();
      });
    });
  });

  describe("patient Information Display", () => {
    it("should display masked sensitive patient data", () => {
      const patientData = {
        name: "João Santos Silva",
        cpf: "***.***.***-45",
        phone: "(**) ****-5678",
        email: "j***@email.com",
        bloodType: "O+",
        emergencyContact: "(**) ****-9999",
      };

      render(
        <ThemeWrapper>
          <Card data-testid="masked-patient-card" variant="patient">
            <CardHeader>
              <CardTitle>Paciente - Dados Mascarados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="patient-info">
                <p data-testid="patient-name">{patientData.name}</p>
                <p data-testid="patient-cpf">CPF: {patientData.cpf}</p>
                <p data-testid="patient-phone">Tel: {patientData.phone}</p>
                <p data-testid="patient-blood">
                  Tipo Sanguíneo: {patientData.bloodType}
                </p>
              </div>
            </CardContent>
          </Card>
        </ThemeWrapper>,
      );

      expect(screen.getByTestId("patient-cpf")).toHaveTextContent(
        "***.***.***-45",
      );
      expect(screen.getByTestId("patient-phone")).toHaveTextContent(
        "(**) ****-5678",
      );
      expect(screen.getByTestId("patient-blood")).toHaveTextContent("O+");
    });

    it("should handle emergency patient indicators", () => {
      render(
        <ThemeWrapper>
          <Card
            data-testid="emergency-card"
            priority="critical"
            variant="alert"
          >
            <CardHeader>
              <CardTitle className="text-red-600">
                🚨 EMERGÊNCIA - PRIORIDADE CRÍTICA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Paciente: Maria Silva</p>
              <p>Situação: Parada Cardíaca</p>
              <p>Hora: {new Date().toLocaleTimeString("pt-BR")}</p>
            </CardContent>
          </Card>
        </ThemeWrapper>,
      );

      const card = screen.getByTestId("emergency-card");
      // Check for actual CVA classes
      expect(card).toHaveClass("border-l-4", "border-l-destructive");
      expect(card).toHaveAttribute("data-priority", "critical");
      expect(
        screen.getByText(/EMERGÊNCIA - PRIORIDADE CRÍTICA/),
      ).toBeInTheDocument();
    });
  });

  describe("lGPD Compliance Features", () => {
    it("should handle data consent indicators", () => {
      render(
        <ThemeWrapper>
          <Card data-testid="lgpd-card">
            <CardContent>
              <p>Dados do paciente processados conforme LGPD</p>
              <div className="lgpd-indicators">
                <span className="consent-indicator processing">
                  ✓ Processamento
                </span>
                <span className="consent-indicator marketing">✗ Marketing</span>
                <span className="consent-indicator sharing">
                  ✗ Compartilhamento
                </span>
              </div>
            </CardContent>
          </Card>
        </ThemeWrapper>,
      );

      const card = screen.getByTestId("lgpd-card");
      expect(card).toHaveAttribute("data-slot", "card");
      expect(screen.getByText("✓ Processamento")).toBeInTheDocument();
    });

    it("should handle data retention warnings", () => {
      const retentionDate = new Date();
      retentionDate.setMonth(retentionDate.getMonth() + 1);

      render(
        <ThemeWrapper>
          <Card data-testid="retention-card">
            <CardContent>
              <div className="retention-warning">
                ⚠️ Dados serão excluídos em{" "}
                {retentionDate.toLocaleDateString("pt-BR")}
              </div>
            </CardContent>
          </Card>
        </ThemeWrapper>,
      );

      const warning = screen.getByText(/Dados serão excluídos/);
      expect(warning).toBeInTheDocument();
    });
  });

  describe("accessibility and Interaction", () => {
    it("should support keyboard navigation", async () => {
      const mockClick = vi.fn();
      const user = userEvent.setup();

      render(
        <ThemeWrapper>
          <Card
            data-testid="interactive-card"
            interactive
            onClick={mockClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                mockClick(e);
              }
            }}
          >
            <CardContent>Card interativo - pressione Enter</CardContent>
          </Card>
        </ThemeWrapper>,
      );

      const card = screen.getByTestId("interactive-card");
      expect(card).toHaveAttribute("role", "button");
      expect(card).toHaveAttribute("tabIndex", "0");

      card.focus();

      await user.keyboard("{Enter}");
      expect(mockClick).toHaveBeenCalled();
    });
  });
});
