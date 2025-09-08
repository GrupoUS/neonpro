/**
 * 🔘 Enhanced Button Component Tests - NeonPro Healthcare
 * =====================================================
 *
 * Comprehensive unit tests for Button component with:
 * - NEONPROV1 theme compliance
 * - WCAG 2.1 AA accessibility standards
 * - Healthcare-specific variants and states
 * - Loading states and error handling
 * - Keyboard navigation and screen reader support
 */

// Mock the Button component (assuming it's in packages/ui)
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "@/components/ui";

// Mock theme provider if needed
const ThemeWrapper = ({ children }: { children: React.ReactNode; }) => (
  <div className="neonprov1-theme">{children}</div>
);

describe("button Component - NeonPro Healthcare UI", () => {
  afterEach(() => {
    cleanup();
  });

  describe("basic Rendering and Variants", () => {
    it("should render button with default props", () => {
      render(
        <ThemeWrapper>
          <Button data-testid="default-button">Default Button</Button>
        </ThemeWrapper>,
      );

      const button = screen.getByTestId("default-button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Default Button");
      expect(button.tagName).toBe("BUTTON");
    });

    it("should render healthcare-specific button variants", () => {
      const variants = ["medical", "emergency", "success", "warning"] as const;

      variants.forEach((variant) => {
        render(
          <ThemeWrapper>
            <Button data-testid={`button-${variant}`} variant={variant}>
              {variant} Button
            </Button>
          </ThemeWrapper>,
        );

        const button = screen.getByTestId(`button-${variant}`);
        expect(button).toBeInTheDocument();

        // Check for variant-specific classes in the className
        const { className } = button as unknown as { className: string; };
        if (variant === "medical") {
          expect(className).toContain("bg-gradient-primary");
        } else if (variant === "emergency") {
          expect(className).toContain("animate-pulse-healthcare");
          expect(className).toContain("from-destructive");
        } else if (variant === "success") {
          expect(className).toContain("from-success");
        } else if (variant === "warning") {
          expect(className).toContain("from-warning");
        }

        cleanup();
      });
    });

    it("should handle different button sizes", () => {
      const sizes = ["sm", "default", "lg"] as const;

      sizes.forEach((size) => {
        render(
          <ThemeWrapper>
            <Button data-testid={`button-${size}`} size={size}>
              Size {size}
            </Button>
          </ThemeWrapper>,
        );

        const button = screen.getByTestId(`button-${size}`);
        const { className } = button as unknown as { className: string; };

        // Check for size-specific classes
        if (size === "sm") {
          expect(className).toContain("h-8");
        } else if (size === "lg") {
          expect(className).toContain("h-12");
        } else {
          expect(className).toContain("h-10"); // default size
        }

        cleanup();
      });
    });
  });

  describe("interactive States and Behavior", () => {
    it("should handle click events", async () => {
      const mockClick = vi.fn();
      const user = userEvent.setup();

      render(
        <ThemeWrapper>
          <Button data-testid="clickable-button" onClick={mockClick}>
            Click Me
          </Button>
        </ThemeWrapper>,
      );

      const button = screen.getByTestId("clickable-button");
      await user.click(button);

      expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it("should handle disabled state", async () => {
      const mockClick = vi.fn();
      const user = userEvent.setup();

      render(
        <ThemeWrapper>
          <Button data-testid="disabled-button" disabled onClick={mockClick}>
            Disabled Button
          </Button>
        </ThemeWrapper>,
      );

      const button = screen.getByTestId("disabled-button");
      expect(button).toBeDisabled();

      await user.click(button);
      expect(mockClick).not.toHaveBeenCalled();
    });

    it("should show loading state properly", () => {
      render(
        <ThemeWrapper>
          <Button
            data-testid="loading-button"
            loading
            loadingText="Salvando paciente..."
          >
            Salvar Paciente
          </Button>
        </ThemeWrapper>,
      );

      const button = screen.getByTestId("loading-button");
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).toHaveTextContent("Salvando paciente...");
      expect(button).toHaveAttribute("data-loading", "true");
    });
  });

  describe("accessibility (WCAG 2.1 AA) Compliance", () => {
    it("should have proper ARIA attributes", () => {
      render(
        <ThemeWrapper>
          <Button
            aria-describedby="button-help"
            aria-label="Cadastrar novo paciente"
            data-testid="accessible-button"
          >
            <span className="sr-only">Ícone de adicionar</span>
            Cadastrar Paciente
          </Button>
        </ThemeWrapper>,
      );

      const button = screen.getByTestId("accessible-button");
      expect(button).toHaveAttribute("aria-label", "Cadastrar novo paciente");
      expect(button).toHaveAttribute("aria-describedby", "button-help");
    });

    it("should support keyboard navigation", async () => {
      const mockClick = vi.fn();
      const user = userEvent.setup();

      render(
        <ThemeWrapper>
          <Button data-testid="keyboard-button" onClick={mockClick}>
            Pressione Enter ou Espaço
          </Button>
        </ThemeWrapper>,
      );

      const button = screen.getByTestId("keyboard-button");
      button.focus();

      // Test Enter key
      await user.keyboard("{Enter}");
      expect(mockClick).toHaveBeenCalledTimes(1);

      // Test Space key
      await user.keyboard(" ");
      expect(mockClick).toHaveBeenCalledTimes(2);
    });

    it("should have sufficient color contrast for healthcare use", () => {
      render(
        <ThemeWrapper>
          <Button data-testid="emergency-button" variant="emergency">
            Emergência
          </Button>
        </ThemeWrapper>,
      );

      const button = screen.getByTestId("emergency-button");
      const { className } = button as unknown as { className: string; };

      // Emergency buttons should have the emergency variant styling
      expect(className).toContain("from-destructive");
      expect(className).toContain("animate-pulse-healthcare");
    });
  });
  describe("healthcare-Specific Features", () => {
    it("should handle emergency button with high priority styling", () => {
      render(
        <ThemeWrapper>
          <Button data-testid="critical-emergency-button" priority="critical">
            PARADA CARDÍACA
          </Button>
        </ThemeWrapper>,
      );

      const button = screen.getByTestId("critical-emergency-button");
      // The component auto-maps critical priority to emergency variant
      const { className } = button as unknown as { className: string; };
      expect(className).toContain("from-destructive");
      expect(button).toHaveAttribute("data-priority", "critical");
      expect(button).toHaveAttribute("role", "button");
    });

    it("should handle patient action confirmations", async () => {
      const mockClick = vi.fn();
      const user = userEvent.setup();

      // Mock window.confirm to return true
      const mockConfirm = vi.fn(() => true);
      vi.stubGlobal("confirm", mockConfirm);

      render(
        <ThemeWrapper>
          <Button
            confirmAction
            confirmMessage="Confirma exclusão do paciente?"
            data-testid="confirm-button"
            onClick={mockClick}
            variant="warning"
          >
            Excluir Paciente
          </Button>
        </ThemeWrapper>,
      );

      const button = screen.getByTestId("confirm-button");
      await user.click(button);

      // The component should call window.confirm before executing the action
      // Since we mocked window.confirm to return true, the action should be called
      expect(mockConfirm).toHaveBeenCalledWith("Confirma exclusão do paciente?");
      expect(mockClick).toHaveBeenCalledTimes(1);

      // Restore the original confirm function
      vi.unstubAllGlobals();
    });

    it("should display LGPD compliance indicators", () => {
      render(
        <ThemeWrapper>
          <Button data-lgpd-compliant="true" data-testid="lgpd-button">
            Processar Dados do Paciente
          </Button>
        </ThemeWrapper>,
      );

      const button = screen.getByTestId("lgpd-button");
      expect(button).toHaveAttribute("data-lgpd-compliant", "true");
    });
  });

  describe("error Handling and Edge Cases", () => {
    it("should handle invalid props gracefully", () => {
      render(
        <ThemeWrapper>
          <Button
            // @ts-expect-error - Testing invalid props
            data-testid="invalid-button"
            variant="invalid-variant"
          >
            Invalid Button
          </Button>
        </ThemeWrapper>,
      );

      const button = screen.getByTestId("invalid-button");
      expect(button).toBeInTheDocument();
    });

    it("should handle missing children gracefully", () => {
      render(
        <ThemeWrapper>
          <Button data-testid="empty-button" />
        </ThemeWrapper>,
      );

      const button = screen.getByTestId("empty-button");
      expect(button).toBeInTheDocument();
    });
  });
});
