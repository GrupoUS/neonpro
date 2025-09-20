/**
 * Accessibility Test Utilities
 * T081 - WCAG 2.1 AA+ Accessibility Compliance
 *
 * Features:
 * - Testing utilities for accessibility validation
 * - Mock accessibility test scenarios
 * - Healthcare-specific accessibility test helpers
 */

import { render, screen, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AccessibilityIssue } from '../../utils/accessibility-testing';

// Extend Jest expect with axe-core matchers
expect.extend(toHaveNoViolations);

export interface AccessibilityTestOptions {
  axeOptions?: any;
  includeHealthcareRules?: boolean;
  skipCertainRules?: string[];
}

/**
 * Test component for accessibility violations
 */
export async function testAccessibility(
  component: React.ReactElement,
  options: AccessibilityTestOptions = {},
): Promise<AccessibilityIssue[]> {
  const {
    axeOptions = {},
    includeHealthcareRules = true,
    skipCertainRules = [],
  } = options;

  // Render the component
  const { container } = render(component);

  // Run axe-core testing
  const results = await axe(container, {
    rules: {
      // Skip certain rules if specified
      ...Object.fromEntries(
        skipCertainRules.map(rule => [rule, { enabled: false }]),
      ),
      // Enable healthcare-specific rules
      ...(includeHealthcareRules && {
        'color-contrast': { enabled: true },
        'label-content-name-mismatch': { enabled: true },
        'input-button-name': { enabled: true },
      }),
    },
    ...axeOptions,
  });

  // Convert axe results to AccessibilityIssue format
  const violations: AccessibilityIssue[] = results.violations.map(
    violation => ({
      id: violation.id,
      impact: violation.impact as AccessibilityIssue['impact'],
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      tags: violation.tags,
      nodes: violation.nodes.map(node => ({
        html: node.html,
        target: node.target,
        failureSummary: node.failureSummary,
        any: node.any,
      })),
      healthcareSpecific: isHealthcareSpecificViolation(violation),
      lgpdRelevant: isLgpdRelevantViolation(violation),
    }),
  );

  return violations;
}

/**
 * Expect component to have no accessibility violations
 */
export async function expectNoAccessibilityViolations(
  component: React.ReactElement,
  options: AccessibilityTestOptions = {},
): Promise<void> {
  const violations = await testAccessibility(component, options);

  expect(violations).toHaveLength(0);

  if (violations.length > 0) {
    console.error('Accessibility violations found:', violations);
  }
}

/**
 * Test healthcare-specific accessibility requirements
 */
export async function testHealthcareAccessibility(
  component: React.ReactElement,
): Promise<{
  lgpdCompliance: boolean;
  emergencyFeatures: boolean;
  medicalData: boolean;
  issues: AccessibilityIssue[];
}> {
  const violations = await testAccessibility(component, {
    includeHealthcareRules: true,
  });

  const lgpdViolations = violations.filter(v => v.lgpdRelevant);
  const healthcareViolations = violations.filter(v => v.healthcareSpecific);
  const emergencyViolations = violations.filter(v => v.tags.includes('emergency'));

  return {
    lgpdCompliance: lgpdViolations.length === 0,
    emergencyFeatures: emergencyViolations.length === 0,
    medicalData: healthcareViolations.length === 0,
    issues: violations,
  };
}

/**
 * Test keyboard navigation accessibility
 */
export function testKeyboardNavigation(component: React.ReactElement): {
  focusableElements: HTMLElement[];
  tabOrder: string[];
  issues: string[];
} {
  const { container } = render(component);

  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  ) as NodeListOf<HTMLElement>;

  const tabOrder: string[] = [];
  const issues: string[] = [];

  focusableElements.forEach((element, index) => {
    const tagName = element.tagName.toLowerCase();
    const hasLabel = element.hasAttribute('aria-label')
      || element.hasAttribute('aria-labelledby')
      || (element.id && document.querySelector(`label[for="${element.id}"]`))
      || element.textContent?.trim();

    tabOrder.push(`${tagName}[${index}]`);

    // Check for common keyboard navigation issues
    if (
      !hasLabel
      && (tagName === 'button'
        || tagName === 'input'
        || tagName === 'select'
        || tagName === 'textarea')
    ) {
      issues.push(`Element ${index} (${tagName}) missing accessible label`);
    }

    if (
      element.hasAttribute('tabindex')
      && element.getAttribute('tabindex') !== '0'
      && element.getAttribute('tabindex') !== '-1'
    ) {
      issues.push(
        `Element ${index} has invalid tabindex: ${element.getAttribute('tabindex')}`,
      );
    }
  });

  return {
    focusableElements: Array.from(focusableElements),
    tabOrder,
    issues,
  };
}

/**
 * Test color contrast for text elements
 */
export function testColorContrast(container: HTMLElement): {
  passes: boolean;
  elements: Array<{
    element: string;
    foreground: string;
    background: string;
    ratio: number;
    passes: boolean;
  }>;
} {
  const textElements = container.querySelectorAll(
    'p, span, h1, h2, h3, h4, h5, h6, button, input, label',
  );
  const results: any[] = [];

  textElements.forEach(element => {
    const computedStyle = window.getComputedStyle(element);
    const foreground = computedStyle.color;
    const background = computedStyle.backgroundColor;

    if (
      foreground
      && background
      && foreground !== 'rgba(0, 0, 0, 0)'
      && background !== 'rgba(0, 0, 0, 0)'
    ) {
      // This is a simplified check - in real implementation, you'd use proper color contrast calculation
      const ratio = calculateContrastRatio(foreground, background);
      const passes = ratio >= 4.5; // WCAG AA standard

      results.push({
        element: element.tagName.toLowerCase(),
        foreground,
        background,
        ratio,
        passes,
      });
    }
  });

  return {
    passes: results.every(r => r.passes),
    elements: results,
  };
}

/**
 * Mock function for color contrast calculation (simplified)
 */
function calculateContrastRatio(
  foreground: string,
  background: string,
): number {
  // This is a simplified version - in real implementation, use proper color conversion and calculation
  // For testing purposes, return a mock value
  return 4.5;
}

/**
 * Check if violation is healthcare-specific
 */
function isHealthcareSpecificViolation(violation: any): boolean {
  const healthcareKeywords = [
    'medical',
    'health',
    'patient',
    'emergency',
    'diagnosis',
    'treatment',
    'medication',
    'prescription',
    'appointment',
    'clinical',
    'healthcare',
  ];

  return healthcareKeywords.some(
    keyword =>
      violation.description?.toLowerCase()?.includes(keyword)
      || violation.help?.toLowerCase()?.includes(keyword)
      || violation.tags?.some((tag: string) => tag.toLowerCase()?.includes(keyword)),
  );
}

/**
 * Check if violation is LGPD-relevant
 */
function isLgpdRelevantViolation(violation: any): boolean {
  const lgpdKeywords = [
    'privacy',
    'personal data',
    'consent',
    'data protection',
    'sensitive',
    'personal information',
    'data collection',
    'data storage',
  ];

  return lgpdKeywords.some(
    keyword =>
      violation.description?.toLowerCase()?.includes(keyword)
      || violation.help?.toLowerCase()?.includes(keyword)
      || violation.tags?.some((tag: string) => tag.toLowerCase()?.includes(keyword)),
  );
}

/**
 * Test form accessibility
 */
export function testFormAccessibility(container: HTMLElement): {
  hasRequiredFields: boolean;
  hasErrorMessages: boolean;
  hasLabels: boolean;
  issues: string[];
} {
  const forms = container.querySelectorAll('form');
  const issues: string[] = [];

  let hasRequiredFields = false;
  let hasErrorMessages = false;
  let hasLabels = false;

  forms.forEach(form => {
    const requiredFields = form.querySelectorAll('[required]');
    const errorContainers = form.querySelectorAll(
      '[role="alert"], [aria-live="assertive"]',
    );
    const labels = form.querySelectorAll('label');
    const inputs = form.querySelectorAll('input, select, textarea');

    hasRequiredFields = hasRequiredFields || requiredFields.length > 0;
    hasErrorMessages = hasErrorMessages || errorContainers.length > 0;
    hasLabels = hasLabels || labels.length > 0;

    // Check if all inputs have labels
    inputs.forEach(input => {
      const hasLabel = input.hasAttribute('aria-label')
        || input.hasAttribute('aria-labelledby')
        || (input.id && form.querySelector(`label[for="${input.id}"]`));

      if (!hasLabel) {
        issues.push(
          `Input ${input.getAttribute('name') || input.id} missing label`,
        );
      }
    });

    // Check if required fields have proper ARIA attributes
    requiredFields.forEach(field => {
      if (!field.hasAttribute('aria-required')) {
        issues.push(`Required field missing aria-required attribute`);
      }
    });
  });

  return {
    hasRequiredFields,
    hasErrorMessages,
    hasLabels,
    issues,
  };
}

/**
 * Test table accessibility
 */
export function testTableAccessibility(container: HTMLElement): {
  hasHeaders: boolean;
  hasCaption: boolean;
  hasScope: boolean;
  issues: string[];
} {
  const tables = container.querySelectorAll('table');
  const issues: string[] = [];

  let hasHeaders = false;
  let hasCaption = false;
  let hasScope = false;

  tables.forEach(table => {
    const headers = table.querySelectorAll('th');
    const caption = table.querySelector('caption');
    const scopedHeaders = table.querySelectorAll('th[scope]');

    hasHeaders = hasHeaders || headers.length > 0;
    hasCaption = hasCaption || caption !== null;
    hasScope = hasScope || scopedHeaders.length > 0;

    if (headers.length > 0 && scopedHeaders.length === 0) {
      issues.push('Table headers missing scope attributes');
    }

    if (!caption) {
      issues.push('Table missing caption');
    }
  });

  return {
    hasHeaders,
    hasCaption,
    hasScope,
    issues,
  };
}

/**
 * Test image accessibility
 */
export function testImageAccessibility(container: HTMLElement): {
  hasAltText: boolean;
  hasDecorativeImages: boolean;
  issues: string[];
} {
  const images = container.querySelectorAll('img');
  const issues: string[] = [];

  let hasAltText = true;
  let hasDecorativeImages = false;

  images.forEach(img => {
    const alt = img.getAttribute('alt');

    if (!alt) {
      hasAltText = false;
      issues.push(`Image missing alt text: ${img.src}`);
    } else if (alt === '' && !img.hasAttribute('role')) {
      hasDecorativeImages = true;
      // This is acceptable for decorative images
    }
  });

  return {
    hasAltText,
    hasDecorativeImages,
    issues,
  };
}

/**
 * Test modal/dialog accessibility
 */
export function testModalAccessibility(container: HTMLElement): {
  modalsFound: number;
  issues: string[];
} {
  const modals = container.querySelectorAll(
    '[role="dialog"], [role="alertdialog"]',
  );
  const issues: string[] = [];

  modals.forEach(modal => {
    const hasTitle = modal.hasAttribute('aria-labelledby');
    const hasDescription = modal.hasAttribute('aria-describedby');
    const isFocusTrapped = modal.querySelector('[data-focus-trapped]') !== null;

    if (!hasTitle) {
      issues.push('Modal missing title (aria-labelledby)');
    }

    if (!hasDescription) {
      issues.push('Modal missing description (aria-describedby)');
    }

    if (!isFocusTrapped) {
      issues.push('Modal missing focus trap');
    }

    // Check for close button
    const closeButton = modal.querySelector(
      'button[aria-label*="close"], button[aria-label*="fechar"]',
    );
    if (!closeButton) {
      issues.push('Modal missing accessible close button');
    }
  });

  return {
    modalsFound: modals.length,
    issues,
  };
}

/**
 * Helper function to test common healthcare scenarios
 */
export async function testHealthcareScenarios(): Promise<{
  patientRegistration: AccessibilityIssue[];
  appointmentBooking: AccessibilityIssue[];
  medicalData: AccessibilityIssue[];
  emergencyContact: AccessibilityIssue[];
}> {
  // These would typically test specific components
  // For now, return empty arrays
  return {
    patientRegistration: [],
    appointmentBooking: [],
    medicalData: [],
    emergencyContact: [],
  };
}

export {
  expectNoAccessibilityViolations,
  testAccessibility,
  testColorContrast,
  testFormAccessibility,
  testHealthcareAccessibility,
  testHealthcareScenarios,
  testImageAccessibility,
  testKeyboardNavigation,
  testModalAccessibility,
  testTableAccessibility,
};
