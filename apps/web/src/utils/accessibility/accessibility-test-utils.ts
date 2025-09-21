/**
 * Healthcare Accessibility Test Utilities
 *
 * Comprehensive test utilities for accessibility testing in healthcare applications
 * with automated testing, validation patterns, and healthcare-specific checks.
 */

import * as axe from 'axe-core';
import { generateAccessibilityReport } from './axe-core-integration';

// Healthcare-specific test scenarios
export const HEALTHCARE_TEST_SCENARIOS = [
  {
    name: 'Patient Dashboard',
    description: 'Critical patient information display',
    selectors: ['[data-testid="patient-dashboard"]', '.patient-dashboard'],
    requiredRules: ['color-contrast', 'name-role-value', 'label'],
  },
  {
    name: 'Medical Forms',
    description: 'Patient data entry forms',
    selectors: ['form[data-medical="true"]', '.medical-form'],
    requiredRules: ['form-field-multiple-labels', 'label-title-only'],
  },
  {
    name: 'Appointment Scheduling',
    description: 'Scheduling interface for healthcare professionals',
    selectors: [
      '[data-testid="appointment-scheduler"]',
      '.appointment-scheduler',
    ],
    requiredRules: ['button-name', 'link-name', 'aria-input-field-name'],
  },
  {
    name: 'Medical Records',
    description: 'Patient medical records viewer',
    selectors: ['[data-testid="medical-records"]', '.medical-records'],
    requiredRules: ['landmark-one-main', 'page-has-heading-one'],
  },
  {
    name: 'Prescription Management',
    description: 'Prescription and medication management',
    selectors: [
      '[data-testid="prescription-manager"]',
      '.prescription-manager',
    ],
    requiredRules: ['duplicate-id', 'aria-command-name'],
  },
];

// WCAG 2.1 AA+ requirements for healthcare
export const WCAG_HEALTHCARE_REQUIREMENTS = {
  '1.1.1': {
    title: 'Non-text Content',
    description: 'All non-text content has text alternative',
    critical: true,
    test: (_element: any) => {
      if (element.tagName === 'IMG') {
        return (
          element.hasAttribute('alt')
          || element.hasAttribute('aria-label')
          || element.getAttribute('role') === 'presentation'
        );
      }
      return true;
    },
  },
  '1.3.1': {
    title: 'Info and Relationships',
    description: 'Information structure and relationships can be programmatically determined',
    critical: true,
    test: (_element: any) => {
      const forms = element.querySelectorAll('form');
      return Array.from(forms).every(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        return Array.from(inputs).every(input => {
          return (
            input.hasAttribute('id')
            && input.hasAttribute('name')
            && document.querySelector(`label[for="${input.id}"]`) !== null
          );
        });
      });
    },
  },
  '1.4.3': {
    title: 'Contrast (Minimum)',
    description: 'Text contrast ratio at least 4.5:1',
    critical: true,
    test: () => true, // Handled by axe-core
  },
  '2.4.6': {
    title: 'Headings and Labels',
    description: 'Headings and labels describe topic or purpose',
    critical: true,
    test: (_element: any) => {
      const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const labels = element.querySelectorAll('label');

      return (
        Array.from(headings).every(
          heading => heading.textContent?.trim().length > 0,
        )
        && Array.from(labels).every(
          label => label.textContent?.trim().length > 0,
        )
      );
    },
  },
  '3.3.2': {
    title: 'Labels or Instructions',
    description: 'Labels or instructions provided when content requires user input',
    critical: true,
    test: (_element: any) => {
      const inputs = element.querySelectorAll('input, select, textarea');
      return Array.from(inputs).every(input => {
        const label = document.querySelector(`label[for="${input.id}"]`);
        return (
          label !== null
          || input.hasAttribute('aria-label')
          || input.hasAttribute('title')
        );
      });
    },
  },
  '4.1.2': {
    title: 'Name, Role, Value',
    description: 'Name, role, value can be programmatically determined',
    critical: true,
    test: (_element: any) => {
      const interactive = element.querySelectorAll(
        'button, input, select, textarea, a',
      );
      return Array.from(interactive).every(el => {
        return (
          el.hasAttribute('aria-label')
          || el.hasAttribute('aria-labelledby')
          || el.textContent?.trim().length > 0
        );
      });
    },
  },
};

/**
 * Automated accessibility test runner
 */
export class HealthcareAccessibilityTester {
  private testResults: Map<string, any> = new Map();
  private scenarios: typeof HEALTHCARE_TEST_SCENARIOS = HEALTHCARE_TEST_SCENARIOS;

  /**
   * Run comprehensive accessibility tests
   */
  async runComprehensiveTests(): Promise<{
    passed: number;
    failed: number;
    total: number;
    scenarios: Array<{
      name: string;
      passed: boolean;
      violations: any[];
      score: number;
    }>;
    overallScore: number;
    healthcareCompliance: {
      lgpd: boolean;
      anvisa: boolean;
      cfm: boolean;
    };
  }> {
    const results = [];
    let totalPassed = 0;
    let totalFailed = 0;

    for (const scenario of this.scenarios) {
      const result = await this.testScenario(scenario);
      results.push(result);

      if (result.passed) {
        totalPassed++;
      } else {
        totalFailed++;
      }
    }

    const overallScore = Math.round(
      (totalPassed / this.scenarios.length) * 100,
    );

    return {
      passed: totalPassed,
      failed: totalFailed,
      total: this.scenarios.length,
      scenarios: results,
      overallScore,
      healthcareCompliance: await this.validateHealthcareCompliance(),
    };
  }

  /**
   * Test specific healthcare scenario
   */
  private async testScenario(
    scenario: (typeof HEALTHCARE_TEST_SCENARIOS)[0],
  ): Promise<{
    name: string;
    passed: boolean;
    violations: any[];
    score: number;
  }> {
    try {
      const elements = this.findScenarioElements(scenario);

      if (elements.length === 0) {
        return {
          name: scenario.name,
          passed: false,
          violations: [
            {
              rule: 'ELEMENT_NOT_FOUND',
              description: `No elements found for scenario: ${scenario.name}`,
              impact: 'critical',
            },
          ],
          score: 0,
        };
      }

      const violations = [];
      let passedChecks = 0;
      let totalChecks = 0;

      for (const element of elements) {
        // Test WCAG requirements
        for (
          const [wcagId, requirement] of Object.entries(
            WCAG_HEALTHCARE_REQUIREMENTS,
          )
        ) {
          totalChecks++;
          if (requirement.test(element)) {
            passedChecks++;
          } else {
            violations.push({
              rule: wcagId,
              description: requirement.description,
              impact: requirement.critical ? 'critical' : 'moderate',
            });
          }
        }

        // Run axe-core on element
        try {
          const axeResults = await axe.run(element);
          const report = generateAccessibilityReport(axeResults);

          if (report.summary.total > 0) {
            violations.push(...report.violations);
          }
        } catch (_error) {
          console.error(`Axe-core test failed for ${scenario.name}:`, error);
        }
      }

      const score = Math.round((passedChecks / totalChecks) * 100);

      return {
        name: scenario.name,
        passed: violations.length === 0,
        violations,
        score,
      };
    } catch (_error) {
      console.error(`Scenario test failed for ${scenario.name}:`, error);
      return {
        name: scenario.name,
        passed: false,
        violations: [
          {
            rule: 'TEST_ERROR',
            description: `Test execution failed: ${error}`,
            impact: 'critical',
          },
        ],
        score: 0,
      };
    }
  }

  /**
   * Find elements for scenario testing
   */
  private findScenarioElements(
    scenario: (typeof HEALTHCARE_TEST_SCENARIOS)[0],
  ): Element[] {
    const elements: Element[] = [];

    for (const selector of scenario.selectors) {
      const found = document.querySelectorAll(selector);
      found.forEach(_el => elements.push(el));
    }

    return elements;
  }

  /**
   * Validate healthcare compliance requirements
   */
  private async validateHealthcareCompliance(): Promise<{
    lgpd: boolean;
    anvisa: boolean;
    cfm: boolean;
  }> {
    // Simulate healthcare compliance validation
    return {
      lgpd: await this.validateLGPDCompliance(),
      anvisa: await this.validateANVISACompliance(),
      cfm: await this.validateCFMCompliance(),
    };
  }

  /**
   * Validate LGPD compliance for accessibility
   */
  private async validateLGPDCompliance(): Promise<boolean> {
    // Check for LGPD-specific accessibility requirements
    const lgpdSelectors = [
      '[data-lgpd="consent"]',
      '[data-privacy="notice"]',
      '[data-sensitive="medical"]',
    ];

    for (const selector of lgpdSelectors) {
      const elements = document.querySelectorAll(selector);

      for (const element of Array.from(elements)) {
        if (
          !element.hasAttribute('aria-label')
          && !element.hasAttribute('aria-labelledby')
        ) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Validate ANVISA compliance for accessibility
   */
  private async validateANVISACompliance(): Promise<boolean> {
    // Check for ANVISA-specific requirements
    const anvisaElements = document.querySelectorAll(
      '[data-anvisa="medical-device"]',
    );

    for (const element of Array.from(anvisaElements)) {
      if (
        !element.hasAttribute('role')
        && !element.hasAttribute('aria-label')
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate CFM compliance for accessibility
   */
  private async validateCFMCompliance(): Promise<boolean> {
    // Check for CFM-specific requirements
    const cfmElements = document.querySelectorAll('[data-cfm="professional"]');

    for (const element of Array.from(cfmElements)) {
      if (
        !element.hasAttribute('aria-label')
        && !element.hasAttribute('aria-describedby')
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(testResults: any): {
    summary: {
      overallScore: number;
      accessibilityCompliance: string;
      healthcareCompliance: {
        lgpd: boolean;
        anvisa: boolean;
        cfm: boolean;
      };
    };
    recommendations: string[];
    criticalIssues: any[];
  } {
    const recommendations = [];
    const criticalIssues = [];

    // Generate recommendations based on test results
    if (testResults.overallScore < 80) {
      recommendations.push(
        '🚨 Critical: Overall accessibility score below 80%',
      );
      criticalIssues.push({
        type: 'LOW_SCORE',
        description: 'Accessibility score requires immediate improvement',
      });
    }

    if (!testResults.healthcareCompliance.lgpd) {
      recommendations.push(
        '🔒 LGPD compliance issues detected - review sensitive data handling',
      );
      criticalIssues.push({
        type: 'LGPD_COMPLIANCE',
        description: 'LGPD accessibility requirements not met',
      });
    }

    if (!testResults.healthcareCompliance.anvisa) {
      recommendations.push(
        '⚕️ ANVISA compliance issues detected - review medical device interfaces',
      );
    }

    if (!testResults.healthcareCompliance.cfm) {
      recommendations.push(
        '👨‍⚕️ CFM compliance issues detected - review professional interfaces',
      );
    }

    return {
      summary: {
        overallScore: testResults.overallScore,
        accessibilityCompliance: testResults.overallScore >= 90
          ? 'Excellent WCAG 2.1 AA+ Compliance'
          : testResults.overallScore >= 80
          ? 'Good WCAG 2.1 AA+ Compliance'
          : 'Needs Improvement',
        healthcareCompliance: testResults.healthcareCompliance,
      },
      recommendations,
      criticalIssues,
    };
  }
}

/**
 * Create global accessibility tester instance
 */
export const _healthcareAccessibilityTester = new HealthcareAccessibilityTester();

/**
 * Utility function for quick accessibility checks
 */
export async function quickAccessibilityCheck(selector?: string): Promise<{
  passed: boolean;
  violations: any[];
  score: number;
}> {
  const context = selector ? document.querySelector(selector) : document;

  if (!_context) {
    return {
      passed: false,
      violations: [
        {
          rule: 'ELEMENT_NOT_FOUND',
          description: `No element found for selector: ${selector}`,
          impact: 'critical',
        },
      ],
      score: 0,
    };
  }

  try {
    const results = await axe.run(_context);
    const report = generateAccessibilityReport(results);

    return {
      passed: report.summary.total === 0,
      violations: report.violations,
      score: Math.max(0, 100 - report.summary.total * 10),
    };
  } catch (_error) {
    console.error('Quick accessibility check failed:', error);
    return {
      passed: false,
      violations: [
        {
          rule: 'TEST_ERROR',
          description: `Accessibility test failed: ${error}`,
          impact: 'critical',
        },
      ],
      score: 0,
    };
  }
}

// Export for React testing library
export * from '@testing-library/dom';
export { axe };
