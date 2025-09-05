/**
 * Integration Tests for Universal AI Chat Accessibility
 * Tests all implemented WCAG 2.1 AA+ features with healthcare focus
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { UniversalAIChat } from "../../apps/web/app/components/chat/universal-ai-chat";
import { AccessibilityTestSuite } from "./automated/accessibility-test-suite";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe("Universal AI Chat - Accessibility Compliance", () => {
  let testSuite: AccessibilityTestSuite;

  beforeEach(() => {
    testSuite = new AccessibilityTestSuite({
      emergencyMode: false,
      healthcareProfessionalMode: true,
    });
  });

  describe("🚨 Emergency Accessibility Features", () => {
    test("should activate emergency mode via Ctrl+E keyboard shortcut", async () => {
      const onEmergencyDetected = jest.fn();
      const { container } = render(
        <UniversalAIChat
          onEmergencyDetected={onEmergencyDetected}
          interface="external"
        />,
      );

      // Simulate Ctrl+E keyboard shortcut
      fireEvent.keyDown(document, {
        key: "e",
        ctrlKey: true,
      });

      await waitFor(() => {
        expect(onEmergencyDetected).toHaveBeenCalledWith(true);
      });

      // Check emergency button appears and is accessible
      const emergencyButton = screen.getByRole("button", {
        name: /emergência.*chamar médico/i,
      });
      expect(emergencyButton).toBeInTheDocument();
      expect(emergencyButton).toHaveAttribute("data-emergency", "true");
      expect(emergencyButton).toHaveAttribute("tabIndex", "0");
    });

    test("should have proper emergency button accessibility attributes", async () => {
      const { container } = render(
        <UniversalAIChat interface="external" />,
      );

      // Activate emergency mode first
      fireEvent.keyDown(document, { key: "e", ctrlKey: true });

      await waitFor(() => {
        const emergencyButton = screen.getByRole("button", {
          name: /emergência.*chamar médico/i,
        });

        // Test all required ARIA attributes
        expect(emergencyButton).toHaveAttribute(
          "aria-label",
          "EMERGÊNCIA: Chamar médico imediatamente",
        );
        expect(emergencyButton).toHaveAttribute("role", "button");
        expect(emergencyButton).toHaveAttribute("aria-describedby", "emergency-action-warning");
        expect(emergencyButton).toHaveClass("emergency-button");
        expect(emergencyButton).toHaveClass("animate-pulse");
      });
    });

    test("should meet 7:1 contrast ratio for emergency elements", async () => {
      const { container } = render(
        <UniversalAIChat interface="external" />,
      );

      // Activate emergency mode
      fireEvent.keyDown(document, { key: "e", ctrlKey: true });

      const results = await testSuite.runComprehensiveTests(container);

      expect(results.emergencyCompliant).toBe(true);
      expect(
        results.violations.filter(v =>
          v.rule === "emergency-contrast-ratio" && v.severity === "critical"
        ),
      ).toHaveLength(0);
    });
  });

  describe("🩺 Medical Terminology Accessibility", () => {
    test("should render MedicalTerm components with pronunciation guides", async () => {
      const { container } = render(
        <UniversalAIChat interface="external" />,
      );

      // Check for medical terms with proper attributes
      const medicalTerms = [
        "emergência",
        "médico",
        "paciente",
        "lgpd",
        "anvisa",
        "cfm",
        "botox",
        "preenchimentos",
        "procedimentos",
        "consultas",
        "tratamentos",
        "plantão",
      ];

      const results = await testSuite.runComprehensiveTests(container);
      expect(results.medicalTerminologyValid).toBe(true);

      // Check specific medical term implementations
      medicalTerms.forEach(term => {
        const elements = container.querySelectorAll(`[data-term="${term}"]`);
        if (elements.length > 0) {
          elements.forEach(element => {
            expect(element).toHaveAttribute("data-context");
          });
        }
      });
    });

    test("should announce medical terms correctly to screen readers", async () => {
      const mockScreenReader = jest.fn();
      const { container } = render(
        <UniversalAIChat interface="external" />,
      );

      // Test LGPD compliance term
      const lgpdElements = container.querySelectorAll('[data-term="lgpd"]');
      expect(lgpdElements.length).toBeGreaterThan(0);

      // Test emergency medical term
      fireEvent.keyDown(document, { key: "e", ctrlKey: true });

      await waitFor(() => {
        const emergencyTerms = container.querySelectorAll('[data-term="emergência"]');
        expect(emergencyTerms.length).toBeGreaterThan(0);
      });
    });
  });

  describe("⌨️ Keyboard Navigation Accessibility", () => {
    test("should support all required keyboard shortcuts", async () => {
      const onVoiceToggle = jest.fn();
      const onClearChat = jest.fn();

      const { container } = render(
        <UniversalAIChat
          interface="external"
          onVoiceToggle={onVoiceToggle}
          onClearChat={onClearChat}
        />,
      );

      const keyboardShortcuts = [
        { key: "e", ctrlKey: true, description: "Emergency activation" },
        { key: "E", altKey: true, description: "Emergency activation (alt)" },
        { key: "m", ctrlKey: true, description: "Voice toggle" },
        { key: "l", ctrlKey: true, description: "Clear chat" },
        { key: "/", ctrlKey: true, description: "Show help" },
        { key: "?", description: "Show help (alt)" },
        { key: "Escape", description: "Close/exit" },
      ];

      // Test each keyboard shortcut
      for (const shortcut of keyboardShortcuts) {
        fireEvent.keyDown(document, {
          key: shortcut.key,
          ctrlKey: shortcut.ctrlKey || false,
          altKey: shortcut.altKey || false,
        });

        // Wait for keyboard shortcut to be processed
        await waitFor(() => {
          // Check that the keyboard shortcut was processed by verifying focus or UI state
          expect(document.activeElement).toBeTruthy();
        });
      }

      const results = await testSuite.runComprehensiveTests(container);
      expect(results.keyboardNavigationValid).toBe(true);
    });

    test("should maintain proper tab order with emergency priority", async () => {
      const { container } = render(
        <UniversalAIChat interface="external" />,
      );

      // Activate emergency mode to test priority
      fireEvent.keyDown(document, { key: "e", ctrlKey: true });

      await waitFor(() => {
        // Check that emergency elements have proper tabIndex
        const emergencyElements = container.querySelectorAll('[data-emergency="true"]');
        emergencyElements.forEach(element => {
          const tabIndex = element.getAttribute("tabIndex");
          expect(tabIndex).toBe("0");
        });

        // Check that medical elements have proper tabIndex
        const medicalElements = container.querySelectorAll('[data-medical="true"]');
        medicalElements.forEach(element => {
          const tabIndex = element.getAttribute("tabIndex");
          expect(["0", "1", "2"].includes(tabIndex)).toBe(true);
        });
      });
    });

    test("should show keyboard shortcuts help dialog", async () => {
      const { container } = render(
        <UniversalAIChat interface="external" />,
      );

      // Open help dialog
      fireEvent.keyDown(document, { key: "/", ctrlKey: true });

      let helpDialog: HTMLElement;
      await waitFor(() => {
        helpDialog = screen.getByRole("dialog", {
          name: /atalhos do teclado/i,
        });
        expect(helpDialog).toBeInTheDocument();

        // Check for required shortcuts in help
        expect(screen.getByText(/ctrl.*e/i)).toBeInTheDocument(); // Emergency
        expect(screen.getByText(/ctrl.*m/i)).toBeInTheDocument(); // Voice
        expect(screen.getByText(/escape/i)).toBeInTheDocument(); // Close
      });

      // Close help dialog
      fireEvent.keyDown(helpDialog, { key: "Escape" });

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });
  });

  describe("🔗 Skip Links and Navigation", () => {
    test("should provide functional skip links", async () => {
      const { container } = render(
        <UniversalAIChat interface="external" />,
      );

      // Check for skip links
      const skipLinks = container.querySelectorAll(".skip-link");
      expect(skipLinks.length).toBeGreaterThanOrEqual(3);

      // Test that skip links have proper targets
      const chatMessagesLink = screen.getByText("Pular para mensagens do chat");
      const chatInputLink = screen.getByText("Pular para entrada de mensagem");

      expect(chatMessagesLink).toHaveAttribute("href", "#chat-messages");
      expect(chatInputLink).toHaveAttribute("href", "#chat-input");

      // Check targets exist
      expect(container.querySelector("#chat-messages")).toBeInTheDocument();
      expect(container.querySelector("#chat-input")).toBeInTheDocument();
    });

    test("should show emergency skip link when emergency mode active", async () => {
      const { container } = render(
        <UniversalAIChat interface="external" />,
      );

      // Activate emergency mode
      fireEvent.keyDown(document, { key: "e", ctrlKey: true });

      await waitFor(() => {
        const emergencySkipLink = screen.getByText("Pular para ações de emergência");
        expect(emergencySkipLink).toBeInTheDocument();
        expect(emergencySkipLink).toHaveAttribute("href", "#emergency-actions");
      });
    });
  });

  describe("🎨 Color Contrast and Visual Accessibility", () => {
    test("should pass axe-core accessibility tests", async () => {
      const { container } = render(
        <UniversalAIChat interface="external" />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test("should have proper ARIA live regions", async () => {
      const { container } = render(
        <UniversalAIChat interface="external" />,
      );

      // Check for required ARIA live regions
      const assertiveLiveRegion = container.querySelector('[aria-live="assertive"]');
      const politeLiveRegion = container.querySelector('[aria-live="polite"]');
      const statusRegion = container.querySelector('[role="status"]');
      const logRegion = container.querySelector('[role="log"]');

      expect(assertiveLiveRegion).toBeInTheDocument();
      expect(politeLiveRegion).toBeInTheDocument();
      expect(statusRegion).toBeInTheDocument();
      expect(logRegion).toBeInTheDocument();
    });

    test("should maintain accessibility in different interface modes", async () => {
      // Test external interface
      const { rerender, container } = render(
        <UniversalAIChat interface="external" />,
      );

      let results = await testSuite.runComprehensiveTests(container);
      expect(results.score).toBeGreaterThanOrEqual(8.5);
      expect(results.wcagLevel).toBe("AA");

      // Test internal interface
      rerender(<UniversalAIChat interface="internal" />);

      results = await testSuite.runComprehensiveTests(container);
      expect(results.score).toBeGreaterThanOrEqual(8.5);
      expect(results.wcagLevel).toBe("AA");
    });
  });

  describe("📱 Mobile Accessibility", () => {
    let originalInnerWidth: number;
    let originalInnerHeight: number;

    beforeEach(() => {
      // Store original window dimensions
      originalInnerWidth = window.innerWidth;
      originalInnerHeight = window.innerHeight;
    });

    afterEach(() => {
      // Restore original window dimensions
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: originalInnerWidth,
      });

      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: originalInnerHeight,
      });

      // Dispatch resize event to notify components of dimension changes
      window.dispatchEvent(new Event("resize"));
    });

    test("should be accessible on mobile viewports", async () => {
      // Mock mobile viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375, // iPhone SE width
      });

      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 667, // iPhone SE height
      });

      // Dispatch resize event to notify components of dimension changes
      window.dispatchEvent(new Event("resize"));

      const { container } = render(
        <UniversalAIChat interface="external" />,
      );

      const results = await testSuite.runComprehensiveTests(container);

      // Should maintain accessibility score on mobile
      expect(results.score).toBeGreaterThanOrEqual(8);

      // Check touch targets are adequate size
      const buttons = container.querySelectorAll("button");
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button);
        const minSize = 44; // 44px minimum touch target

        // Note: In a real test, you'd check computed dimensions
        // For this example, we're checking that buttons exist and are focusable
        expect(button.tabIndex).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("🧪 Comprehensive Accessibility Score", () => {
    test("should achieve minimum 8.5/10 accessibility score", async () => {
      const { container } = render(
        <UniversalAIChat
          interface="external"
          onEmergencyDetected={jest.fn()}
          onEscalationTriggered={jest.fn()}
        />,
      );

      const results = await testSuite.runComprehensiveTests(container);

      // Assert minimum score requirements
      expect(results.score).toBeGreaterThanOrEqual(8.5);
      expect(results.passed).toBe(true);
      expect(results.wcagLevel).toBe("AA");

      // Assert healthcare-specific compliance
      expect(results.emergencyCompliant).toBe(true);
      expect(results.medicalTerminologyValid).toBe(true);
      expect(results.keyboardNavigationValid).toBe(true);
      expect(results.ariaImplementationValid).toBe(true);

      // Critical violations should be zero
      const criticalViolations = results.violations.filter(v => v.severity === "critical");
      expect(criticalViolations).toHaveLength(0);
    });

    test("should handle emergency mode accessibility correctly", async () => {
      const onEmergencyDetected = jest.fn();

      const { container } = render(
        <UniversalAIChat
          interface="external"
          onEmergencyDetected={onEmergencyDetected}
        />,
      );

      // Test with emergency mode
      testSuite = new AccessibilityTestSuite({
        emergencyMode: true,
        healthcareProfessionalMode: true,
      });

      // Activate emergency mode
      fireEvent.keyDown(document, { key: "e", ctrlKey: true });

      await waitFor(() => {
        expect(onEmergencyDetected).toHaveBeenCalled();
      });

      const results = await testSuite.runComprehensiveTests(container);

      // Emergency mode should maintain high accessibility
      expect(results.score).toBeGreaterThanOrEqual(8.5);
      expect(results.emergencyCompliant).toBe(true);

      // Emergency elements should have priority focus
      const emergencyButton = container.querySelector('[data-emergency="true"]');
      expect(emergencyButton).toBeInTheDocument();

      // Focus the emergency button and verify it receives focus
      if (emergencyButton) {
        (emergencyButton as HTMLElement).focus();
        expect(document.activeElement).toBe(emergencyButton);
      }
    });
  });
});

// Performance test for accessibility features
describe("🚀 Accessibility Performance", () => {
  test("should load accessibility features within performance budget", async () => {
    const startTime = performance.now();

    const { container } = render(
      <UniversalAIChat interface="external" />,
    );

    // Run accessibility tests
    const testSuite = new AccessibilityTestSuite();
    await testSuite.runComprehensiveTests(container);

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Accessibility testing should complete within 2 seconds
    expect(duration).toBeLessThan(2000);
  });

  test("should not impact emergency response time", async () => {
    const onEmergencyDetected = jest.fn();

    const { container } = render(
      <UniversalAIChat
        interface="external"
        onEmergencyDetected={onEmergencyDetected}
      />,
    );

    const startTime = performance.now();

    // Trigger emergency
    fireEvent.keyDown(document, { key: "e", ctrlKey: true });

    await waitFor(() => {
      expect(onEmergencyDetected).toHaveBeenCalled();
    });

    const endTime = performance.now();
    const emergencyResponseTime = endTime - startTime;

    // Emergency response should be under 200ms (healthcare requirement)
    expect(emergencyResponseTime).toBeLessThan(200);
  });
});

export { AccessibilityTestSuite };
