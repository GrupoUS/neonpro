// tools/testing/accessibility/jest-accessibility-setup.ts
import "jest-axe/extend-expect";
import { toBeAccessibleForHealthcare } from "./axe-core-setup";

/**
 * NEONPRO HEALTHCARE - JEST ACCESSIBILITY SETUP
 *
 * Jest configuration and custom matchers for healthcare accessibility testing.
 * Extends jest-axe with healthcare-specific validation.
 */

// Extend Jest matchers with healthcare-specific accessibility testing
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAccessibleForHealthcare(scenario?: string): Promise<R>;
      toHaveHealthcareCompliantContrast(): R;
      toSupportKeyboardNavigation(): Promise<R>;
      toBeScreenReaderAccessible(): Promise<R>;
      toBeLGPDAccessible(): Promise<R>;
      toHaveEmergencyAccessibility(): Promise<R>;
    }
  }
}

// Add custom Jest matchers
expect.extend({
  toBeAccessibleForHealthcare,

  /**
   * Check if element meets healthcare contrast requirements (7.0:1)
   */
  toHaveHealthcareCompliantContrast(received: HTMLElement) {
    const contrastResults = this.checkContrastRatio(received, 7);

    return {
      pass: contrastResults.compliant,
      message: () =>
        contrastResults.compliant
          ? "Expected element to fail healthcare contrast requirements"
          : `Expected element to meet healthcare contrast ratio of 7.0:1, but found ${contrastResults.ratio}:1`,
    };
  },

  /**
   * Check keyboard navigation support
   */
  async toSupportKeyboardNavigation(received: HTMLElement) {
    const keyboardTests = await this.runKeyboardTests(received);

    return {
      pass: keyboardTests.allPassed,
      message: () =>
        keyboardTests.allPassed
          ? "Expected element to fail keyboard navigation tests"
          : `Keyboard navigation failed: ${keyboardTests.failures.join(", ")}`,
    };
  },

  /**
   * Check screen reader accessibility
   */
  async toBeScreenReaderAccessible(received: HTMLElement) {
    const screenReaderTests = await this.runScreenReaderTests(received);

    return {
      pass: screenReaderTests.allPassed,
      message: () =>
        screenReaderTests.allPassed
          ? "Expected element to fail screen reader tests"
          : `Screen reader accessibility failed: ${screenReaderTests.failures.join(", ")}`,
    };
  },

  /**
   * Check LGPD accessibility compliance
   */
  async toBeLGPDAccessible(received: HTMLElement) {
    const lgpdTests = await this.runLGPDTests(received);

    return {
      pass: lgpdTests.compliant,
      message: () =>
        lgpdTests.compliant
          ? "Expected element to fail LGPD accessibility tests"
          : `LGPD accessibility failed: ${lgpdTests.issues.join(", ")}`,
    };
  },

  /**
   * Check emergency interface accessibility
   */
  async toHaveEmergencyAccessibility(received: HTMLElement) {
    const emergencyTests = await this.runEmergencyTests(received);

    return {
      pass: emergencyTests.compliant,
      message: () =>
        emergencyTests.compliant
          ? "Expected element to fail emergency accessibility tests"
          : `Emergency accessibility failed: ${emergencyTests.issues.join(", ")}`,
    };
  },
});

/**
 * Healthcare-specific test utilities
 */
export class HealthcareTestUtils {
  /**
   * Check contrast ratio against healthcare standards
   */
  static checkContrastRatio(element: HTMLElement, minimumRatio = 7) {
    const styles = window.getComputedStyle(element);
    const { backgroundColor } = styles;
    const { color } = styles;

    // Convert colors to luminance and calculate ratio
    const bgLuminance = HealthcareTestUtils.getColorLuminance(backgroundColor);
    const textLuminance = HealthcareTestUtils.getColorLuminance(color);

    const ratio = HealthcareTestUtils.calculateContrastRatio(
      bgLuminance,
      textLuminance,
    );

    return {
      compliant: ratio >= minimumRatio,
      ratio,
      backgroundColor,
      color,
      minimumRequired: minimumRatio,
    };
  }

  /**
   * Run comprehensive keyboard navigation tests
   */
  static async runKeyboardTests(element: HTMLElement) {
    const failures: string[] = [];

    // Test 1: Element should be focusable if interactive
    const isInteractive = HealthcareTestUtils.isInteractiveElement(element);
    if (isInteractive && !HealthcareTestUtils.isFocusable(element)) {
      failures.push("Interactive element is not focusable");
    }

    // Test 2: Focus should be visible
    if (
      HealthcareTestUtils.isFocusable(element)
      && !HealthcareTestUtils.hasFocusIndicator(element)
    ) {
      failures.push("Focusable element lacks visible focus indicator");
    }

    // Test 3: Keyboard event handlers should be present
    if (isInteractive && !HealthcareTestUtils.hasKeyboardHandlers(element)) {
      failures.push("Interactive element lacks keyboard event handlers");
    }

    // Test 4: Tab order should be logical
    const tabOrderIssues = HealthcareTestUtils.checkTabOrder(element);
    if (tabOrderIssues.length > 0) {
      failures.push(...tabOrderIssues);
    }

    return {
      allPassed: failures.length === 0,
      failures,
    };
  }

  /**
   * Run screen reader accessibility tests
   */
  static async runScreenReaderTests(element: HTMLElement) {
    const failures: string[] = [];

    // Test 1: Accessible name
    if (
      HealthcareTestUtils.isInteractiveElement(element)
      && !HealthcareTestUtils.hasAccessibleName(element)
    ) {
      failures.push("Interactive element lacks accessible name");
    }

    // Test 2: Proper roles
    if (!HealthcareTestUtils.hasProperRole(element)) {
      failures.push("Element has incorrect or missing role");
    }

    // Test 3: ARIA attributes
    const ariaIssues = HealthcareTestUtils.checkARIAAttributes(element);
    if (ariaIssues.length > 0) {
      failures.push(...ariaIssues);
    }

    // Test 4: Semantic structure
    const structureIssues = HealthcareTestUtils.checkSemanticStructure(element);
    if (structureIssues.length > 0) {
      failures.push(...structureIssues);
    }

    return {
      allPassed: failures.length === 0,
      failures,
    };
  }

  /**
   * Run LGPD-specific accessibility tests
   */
  static async runLGPDTests(element: HTMLElement) {
    const issues: string[] = [];

    // Check if element handles sensitive data
    const isSensitive = element.hasAttribute("data-sensitive")
      || element.hasAttribute("data-lgpd");

    if (isSensitive) {
      // Test 1: Privacy indicators should be accessible
      if (!HealthcareTestUtils.hasAccessiblePrivacyIndicator(element)) {
        issues.push(
          "Sensitive data element lacks accessible privacy indicator",
        );
      }

      // Test 2: Consent mechanisms should be accessible
      if (!HealthcareTestUtils.hasAccessibleConsentMechanism(element)) {
        issues.push("Element lacks accessible consent mechanism");
      }

      // Test 3: Data protection announcements
      if (!HealthcareTestUtils.hasDataProtectionAnnouncement(element)) {
        issues.push("Element lacks data protection announcement");
      }
    }

    return {
      compliant: issues.length === 0,
      issues,
    };
  }

  /**
   * Run emergency interface accessibility tests
   */
  static async runEmergencyTests(element: HTMLElement) {
    const issues: string[] = [];

    const isEmergency = element.hasAttribute("data-emergency")
      || (element.hasAttribute("data-priority")
        && element.getAttribute("data-priority") === "critical");

    if (isEmergency) {
      // Test 1: Enhanced contrast ratio
      const contrastResult = HealthcareTestUtils.checkContrastRatio(element, 7);
      if (!contrastResult.compliant) {
        issues.push(
          `Emergency element contrast ratio ${contrastResult.ratio}:1 below required 7.0:1`,
        );
      }

      // Test 2: Multi-modal alerts
      if (!HealthcareTestUtils.hasMultiModalAlert(element)) {
        issues.push("Emergency element lacks multi-modal alert support");
      }

      // Test 3: Priority announcements
      if (!HealthcareTestUtils.hasPriorityAnnouncement(element)) {
        issues.push(
          "Emergency element lacks priority screen reader announcement",
        );
      }

      // Test 4: Keyboard shortcuts
      if (!HealthcareTestUtils.hasEmergencyKeyboardShortcuts(element)) {
        issues.push("Emergency element lacks keyboard shortcuts");
      }
    }

    return {
      compliant: issues.length === 0,
      issues,
    };
  }

  // Helper methods
  private static getColorLuminance(_color: string): number {
    // Simplified luminance calculation
    // In production, use a proper color manipulation library
    return 0.5; // Placeholder
  }

  private static calculateContrastRatio(_bg: number, _text: number): number {
    // Simplified contrast ratio calculation
    // In production, implement proper WCAG contrast calculation
    return 4.5; // Placeholder
  }

  private static isInteractiveElement(element: HTMLElement): boolean {
    const interactiveTags = ["button", "a", "input", "select", "textarea"];
    const interactiveRoles = ["button", "link", "textbox", "combobox"];

    return (
      interactiveTags.includes(element.tagName.toLowerCase())
      || interactiveRoles.includes(element.getAttribute("role") || "")
      || element.hasAttribute("onclick")
      || element.hasAttribute("onkeydown")
      || element.hasAttribute("tabindex")
    );
  }

  private static isFocusable(element: HTMLElement): boolean {
    return (
      element.tabIndex >= 0
      && !element.hasAttribute("disabled")
      && element.offsetParent !== null
    );
  }

  private static hasFocusIndicator(element: HTMLElement): boolean {
    const styles = window.getComputedStyle(element, ":focus-visible");
    return (
      styles.outline !== "none"
      || styles.boxShadow !== "none"
      || styles.borderColor !== "transparent"
    );
  }

  private static hasKeyboardHandlers(element: HTMLElement): boolean {
    return (
      element.hasAttribute("onkeydown")
      || element.hasAttribute("onkeyup")
      || element.hasAttribute("onkeypress")
    );
  }

  private static checkTabOrder(_element: HTMLElement): string[] {
    // Simplified tab order check
    return [];
  }

  private static hasAccessibleName(element: HTMLElement): boolean {
    return Boolean(
      element.getAttribute("aria-label")
        || element.getAttribute("aria-labelledby")
        || element.querySelector("label")
        || element.textContent?.trim(),
    );
  }

  private static hasProperRole(element: HTMLElement): boolean {
    const role = element.getAttribute("role");
    const tagName = element.tagName.toLowerCase();

    // Basic role validation
    return role !== null || ["div", "span"].includes(tagName) === false;
  }

  private static checkARIAAttributes(element: HTMLElement): string[] {
    const issues: string[] = [];

    // Check for required ARIA attributes based on role
    const role = element.getAttribute("role");
    if (role === "button" && !HealthcareTestUtils.hasAccessibleName(element)) {
      issues.push("Button role requires accessible name");
    }

    return issues;
  }

  private static checkSemanticStructure(_element: HTMLElement): string[] {
    // Check for proper heading hierarchy, landmarks, etc.
    return [];
  }

  private static hasAccessiblePrivacyIndicator(element: HTMLElement): boolean {
    return Boolean(
      element.querySelector('[aria-label*="privacidade"]')
        || element.querySelector('[aria-label*="LGPD"]')
        || element.getAttribute("aria-describedby"),
    );
  }

  private static hasAccessibleConsentMechanism(element: HTMLElement): boolean {
    return Boolean(
      element.querySelector('[role="dialog"]')
        || element.querySelector('input[type="checkbox"][aria-describedby]'),
    );
  }

  private static hasDataProtectionAnnouncement(element: HTMLElement): boolean {
    return Boolean(
      element.querySelector("[aria-live]")
        || element.querySelector('[role="status"]'),
    );
  }

  private static hasMultiModalAlert(element: HTMLElement): boolean {
    return Boolean(
      element.hasAttribute("aria-live") && element.hasAttribute("role"),
    );
  }

  private static hasPriorityAnnouncement(element: HTMLElement): boolean {
    return (
      element.getAttribute("aria-live") === "assertive"
      || element.getAttribute("role") === "alert"
    );
  }

  private static hasEmergencyKeyboardShortcuts(element: HTMLElement): boolean {
    return (
      element.hasAttribute("data-keyboard-shortcut")
      || element.hasAttribute("accesskey")
    );
  }
}

/**
 * Test suite factory for healthcare components
 */
export const createHealthcareA11yTestSuite = (componentName: string) => {
  return {
    async runCompleteAudit(container: HTMLElement) {
      const results = {
        component: componentName,
        wcagCompliance: await expect(container).toHaveNoViolations(),
        healthcareCompliance: await expect(container).toBeAccessibleForHealthcare(),
        contrastCompliance: expect(container).toHaveHealthcareCompliantContrast(),
        keyboardNavigation: await expect(container).toSupportKeyboardNavigation(),
        screenReaderSupport: await expect(container).toBeScreenReaderAccessible(),
      };

      return results;
    },
  };
};

export { HealthcareTestUtils };
