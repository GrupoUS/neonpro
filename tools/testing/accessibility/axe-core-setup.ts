// tools/testing/accessibility/axe-core-setup.ts
import { configureAxe, getViolations } from "jest-axe";
import type { Result } from "jest-axe";
import {
  HEALTHCARE_A11Y_SCENARIOS,
  WCAG_AA_CONFIG,
} from "./accessibility-audit-config";

/**
 * NEONPRO HEALTHCARE - AXE-CORE TEST SETUP
 *
 * Automated accessibility testing setup with healthcare-specific configurations
 * for comprehensive WCAG 2.1 AA compliance validation.
 */

// Configure axe-core with our healthcare-specific settings
export const axeConfig = configureAxe(WCAG_AA_CONFIG);

/**
 * Healthcare-specific accessibility test utilities
 */
export class HealthcareAccessibilityTester {
  private readonly axe: any;

  constructor() {
    this.axe = axeConfig;
  }

  /**
   * Run comprehensive accessibility audit on a component
   */
  async auditComponent(
    container: HTMLElement,
    scenario?: keyof typeof HEALTHCARE_A11Y_SCENARIOS,
  ): Promise<HealthcareAccessibilityResult> {
    const results = await this.axe(container);
    const violations = getViolations(results);

    // Enhanced reporting for healthcare context
    const healthcareResult: HealthcareAccessibilityResult = {
      violations,
      passes: results.passes || [],
      incomplete: results.incomplete || [],
      inapplicable: results.inapplicable || [],

      // Healthcare-specific metrics
      healthcareCompliance: this.assessHealthcareCompliance(results, scenario),
      lgpdCompliance: this.assessLGPDCompliance(results),
      emergencyAccessibility: this.assessEmergencyAccessibility(results),

      // Summary
      score: this.calculateAccessibilityScore(results),
      criticalIssues: violations.filter((v) => v.impact === "critical"),
      seriousIssues: violations.filter((v) => v.impact === "serious"),
      moderateIssues: violations.filter((v) => v.impact === "moderate"),
      minorIssues: violations.filter((v) => v.impact === "minor"),
    };

    return healthcareResult;
  }

  /**
   * Assess healthcare-specific accessibility compliance
   */
  private assessHealthcareCompliance(
    results: Result,
    scenario?: keyof typeof HEALTHCARE_A11Y_SCENARIOS,
  ): HealthcareComplianceResult {
    if (!scenario) {
      return { compliant: true, issues: [] };
    }

    const scenarioConfig = HEALTHCARE_A11Y_SCENARIOS[scenario];
    const issues: string[] = [];

    // Check scenario-specific requirements
    Object.entries(scenarioConfig.requirements).forEach(
      ([requirement, enabled]) => {
        if (enabled) {
          const hasIssue = this.checkSpecificRequirement(results, requirement);
          if (hasIssue) {
            issues.push(`Healthcare requirement "${requirement}" not met`);
          }
        }
      },
    );

    return {
      compliant: issues.length === 0,
      issues,
      scenario,
      requirements: scenarioConfig.requirements,
    };
  }

  /**
   * Assess LGPD-specific accessibility compliance
   */
  private assessLGPDCompliance(results: Result): LGPDComplianceResult {
    const issues: string[] = [];

    // Check for LGPD-related accessibility issues
    results.violations?.forEach((violation) => {
      violation.nodes.forEach((node) => {
        const element = node.element;
        if (
          element?.hasAttribute("data-lgpd") ||
          element?.hasAttribute("data-sensitive")
        ) {
          issues.push(
            `LGPD-protected element has accessibility violation: ${violation.description}`,
          );
        }
      });
    });

    return {
      compliant: issues.length === 0,
      issues,
      protectedElementsCount: this.countLGPDElements(results),
      requiresPrivacyAnnouncement: issues.length > 0,
    };
  }

  /**
   * Assess emergency interface accessibility
   */
  private assessEmergencyAccessibility(
    results: Result,
  ): EmergencyAccessibilityResult {
    const issues: string[] = [];
    let emergencyElementsCount = 0;

    results.violations?.forEach((violation) => {
      violation.nodes.forEach((node) => {
        const element = node.element;
        if (
          element?.hasAttribute("data-emergency") ||
          (element?.hasAttribute("data-priority") &&
            element.getAttribute("data-priority") === "critical")
        ) {
          emergencyElementsCount++;
          issues.push(
            `Emergency element has accessibility violation: ${violation.description}`,
          );
        }
      });
    });

    return {
      compliant: issues.length === 0,
      issues,
      emergencyElementsCount,
      hasMultiModalSupport: this.checkMultiModalSupport(results),
      meetsCriticalContrastRatio: this.checkCriticalContrast(results),
    };
  }

  /**
   * Calculate overall accessibility score (0-100)
   */
  private calculateAccessibilityScore(results: Result): number {
    const totalRules =
      results.passes.length +
      results.violations.length +
      results.incomplete.length;
    if (totalRules === 0) {
      return 100;
    }

    const _passedRules = results.passes.length;
    const violationWeight = results.violations.reduce((weight, violation) => {
      switch (violation.impact) {
        case "critical": {
          return weight + 4;
        }
        case "serious": {
          return weight + 3;
        }
        case "moderate": {
          return weight + 2;
        }
        case "minor": {
          return weight + 1;
        }
        default: {
          return weight + 1;
        }
      }
    }, 0);

    const maxPossibleScore = totalRules * 4; // Assuming critical violations are the worst
    const actualScore = Math.max(0, maxPossibleScore - violationWeight);

    return Math.round((actualScore / maxPossibleScore) * 100);
  }

  /**
   * Helper methods for specific compliance checks
   */
  private checkSpecificRequirement(
    results: Result,
    requirement: string,
  ): boolean {
    // Implementation depends on specific requirement
    switch (requirement) {
      case "colorContrast": {
        return results.violations.some((v) => v.id === "color-contrast");
      }
      case "focusManagement": {
        return results.violations.some((v) => v.id.includes("focus"));
      }
      case "screenReaderSupport": {
        return results.violations.some((v) => v.tags.includes("screen-reader"));
      }
      case "keyboardNavigation": {
        return results.violations.some((v) => v.tags.includes("keyboard"));
      }
      default: {
        return false;
      }
    }
  }

  private countLGPDElements(_results: Result): number {
    // Count elements with LGPD attributes
    const allElements = document.querySelectorAll(
      "[data-lgpd], [data-sensitive]",
    );
    return allElements.length;
  }

  private checkMultiModalSupport(_results: Result): boolean {
    // Check for visual, audio, and haptic feedback support
    const hasAriaLive = document.querySelector("[aria-live]") !== null;
    const hasRoleAlert = document.querySelector('[role="alert"]') !== null;
    return hasAriaLive && hasRoleAlert;
  }

  private checkCriticalContrast(results: Result): boolean {
    // Check if critical elements meet enhanced contrast ratio
    return !results.violations.some(
      (v) =>
        v.id === "color-contrast" &&
        v.nodes.some((node) => node.element?.hasAttribute("data-emergency")),
    );
  }
}

/**
 * Specialized test functions for different healthcare scenarios
 */
export const healthcareA11yTests = {
  /**
   * Test emergency interface accessibility
   */
  async testEmergencyInterface(
    container: HTMLElement,
  ): Promise<HealthcareAccessibilityResult> {
    const tester = new HealthcareAccessibilityTester();
    return await tester.auditComponent(container, "emergency");
  },

  /**
   * Test patient data interface accessibility
   */
  async testPatientDataInterface(
    container: HTMLElement,
  ): Promise<HealthcareAccessibilityResult> {
    const tester = new HealthcareAccessibilityTester();
    return await tester.auditComponent(container, "patientData");
  },

  /**
   * Test form accessibility
   */
  async testFormAccessibility(
    container: HTMLElement,
  ): Promise<HealthcareAccessibilityResult> {
    const tester = new HealthcareAccessibilityTester();
    return await tester.auditComponent(container, "forms");
  },

  /**
   * Test navigation accessibility
   */
  async testNavigationAccessibility(
    container: HTMLElement,
  ): Promise<HealthcareAccessibilityResult> {
    const tester = new HealthcareAccessibilityTester();
    return await tester.auditComponent(container, "navigation");
  },

  /**
   * Test table accessibility
   */
  async testTableAccessibility(
    container: HTMLElement,
  ): Promise<HealthcareAccessibilityResult> {
    const tester = new HealthcareAccessibilityTester();
    return await tester.auditComponent(container, "tables");
  },
};

/**
 * Jest matcher for healthcare accessibility testing
 */
export const toBeAccessibleForHealthcare = (
  container: HTMLElement,
  scenario?: keyof typeof HEALTHCARE_A11Y_SCENARIOS,
) => {
  return new Promise(async (resolve) => {
    const tester = new HealthcareAccessibilityTester();
    const result = await tester.auditComponent(container, scenario);

    const pass =
      result.violations.length === 0 && result.healthcareCompliance.compliant;

    resolve({
      pass,
      message: () => {
        if (pass) {
          return "Expected element to have accessibility violations, but none were found.";
        }

        const violationMessages = result.violations
          .map((violation) => `${violation.id}: ${violation.description}`)
          .join("\n");

        const healthcareIssues = result.healthcareCompliance.issues.join("\n");

        return (
          "Expected element to be accessible but found violations:\n\n" +
          `WCAG Violations:\n${violationMessages}\n\n` +
          `Healthcare Compliance Issues:\n${healthcareIssues}\n\n` +
          `Accessibility Score: ${result.score}/100`
        );
      },
    });
  });
};

// Type definitions
export interface HealthcareAccessibilityResult {
  violations: any[];
  passes: any[];
  incomplete: any[];
  inapplicable: any[];
  healthcareCompliance: HealthcareComplianceResult;
  lgpdCompliance: LGPDComplianceResult;
  emergencyAccessibility: EmergencyAccessibilityResult;
  score: number;
  criticalIssues: any[];
  seriousIssues: any[];
  moderateIssues: any[];
  minorIssues: any[];
}

export interface HealthcareComplianceResult {
  compliant: boolean;
  issues: string[];
  scenario?: keyof typeof HEALTHCARE_A11Y_SCENARIOS;
  requirements?: Record<string, boolean>;
}

export interface LGPDComplianceResult {
  compliant: boolean;
  issues: string[];
  protectedElementsCount: number;
  requiresPrivacyAnnouncement: boolean;
}

export interface EmergencyAccessibilityResult {
  compliant: boolean;
  issues: string[];
  emergencyElementsCount: number;
  hasMultiModalSupport: boolean;
  meetsCriticalContrastRatio: boolean;
}

// Export configured axe instance
export { axeConfig as axe };
export default HealthcareAccessibilityTester;
