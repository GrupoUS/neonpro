/**
 * Accessibility Testing Utilities
 * T081 - WCAG 2.1 AA+ Accessibility Compliance
 *
 * Features:
 * - axe-core integration for automated accessibility testing
 * - Healthcare-specific accessibility validation
 * - Color contrast analysis
 * - Screen reader testing utilities
 * - Keyboard navigation validation
 */

import { AxeResults, Result } from 'axe-core';
import {
  calculateContrastRatio,
  meetsContrastRequirement,
  WCAG_CONTRAST_RATIOS,
} from './accessibility';

export interface AccessibilityIssue {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor' | 'info';
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary: string;
    any: Array<{
      id: string;
      impact: string;
      message: string;
      data: any;
    }>;
  }>;
  healthcareSpecific?: boolean;
  lgpdRelevant?: boolean;
}

export interface AccessibilityTestingOptions {
  includeHealthcareRules?: boolean;
  context?: string;
}

export interface AccessibilityTestResult {
  passes: number;
  violations: AccessibilityIssue[];
  incomplete: Result[];
  timestamp: Date;
  url: string;
  healthcareCompliance: {
    lgpd: boolean;
    healthcareData: boolean;
    emergencyFeatures: boolean;
  };
}

export interface HealthcareAccessibilityRule {
  id: string;
  name: string;
  description: string;
  impact: 'critical' | 'serious' | 'moderate';
  check: (element: HTMLElement) => boolean;
  help: string;
}

/**
 * Healthcare-specific accessibility rules
 */
const HEALTHCARE_ACCESSIBILITY_RULES: HealthcareAccessibilityRule[] = [
  {
    id: 'healthcare-emergency-contact',
    name: 'Emergency Contact Accessibility',
    description: 'Emergency contact information must be accessible to screen readers',
    impact: 'critical',
    check: element => {
      const emergencyContacts = element.querySelectorAll('[data-emergency-contact]');
      return Array.from(emergencyContacts).every(contact => {
        const hasAriaLabel = contact.hasAttribute('aria-label');
        const hasScreenReaderText = contact.querySelector('.sr-only') !== null;
        return hasAriaLabel || hasScreenReaderText;
      });
    },
    help: 'Ensure emergency contacts have proper ARIA labels or screen reader text',
  },
  {
    id: 'healthcare-medical-data',
    name: 'Medical Data Privacy',
    description: 'Medical data must have proper privacy indicators',
    impact: 'critical',
    check: element => {
      const medicalData = element.querySelectorAll('[data-medical-data]');
      return Array.from(medicalData).every(data => {
        const hasPrivacyIndicator = data.hasAttribute('aria-describedby')
          || data.hasAttribute('data-privacy-level');
        return hasPrivacyIndicator;
      });
    },
    help: 'Medical data must include privacy indicators and descriptions',
  },
  {
    id: 'healthcare-form-validation',
    name: 'Healthcare Form Validation',
    description: 'Healthcare forms must have accessible error messages',
    impact: 'serious',
    check: element => {
      const forms = element.querySelectorAll('form[data-healthcare-form]');
      return Array.from(forms).every(form => {
        const errorContainers = form.querySelectorAll('[role="alert"], [aria-live="assertive"]');
        return errorContainers.length > 0;
      });
    },
    help: 'Healthcare forms must have accessible error message containers',
  },
  {
    id: 'healthcare-time-sensitive',
    name: 'Time-Sensitive Information',
    description: 'Time-sensitive medical information must have proper timing indicators',
    impact: 'serious',
    check: element => {
      const timeSensitive = element.querySelectorAll('[data-time-sensitive]');
      return Array.from(timeSensitive).every(element => {
        const hasTimingInfo = element.hasAttribute('aria-label')
          || element.hasAttribute('data-deadline')
          || element.querySelector('time') !== null;
        return hasTimingInfo;
      });
    },
    help: 'Time-sensitive information must include timing indicators',
  },
];

/**
 * Convert axe-core results to standardized accessibility issues
 */
export function convertAxeResults(axeResults: AxeResults): AccessibilityIssue[] {
  const violations: AccessibilityIssue[] = [];

  axeResults.violations.forEach((violation: Result) => {
    const accessibilityIssue: AccessibilityIssue = {
      id: violation.id,
      impact: violation.impact as AccessibilityIssue['impact'],
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      tags: violation.tags,
      nodes: violation.nodes.map((node: any) => ({
        html: node.html,
        target: node.target,
        failureSummary: node.failureSummary,
        any: node.any,
      })),
      healthcareSpecific: isHealthcareSpecificViolation(violation),
      lgpdRelevant: isLgpdRelevantViolation(violation),
    };

    violations.push(accessibilityIssue);
  });

  return violations;
}

/**
 * Check if violation is healthcare-specific
 */
function isHealthcareSpecificViolation(violation: Result): boolean {
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

  return healthcareKeywords.some(keyword =>
    violation.description.toLowerCase().includes(keyword)
    || violation.help.toLowerCase().includes(keyword)
    || violation.tags.some((tag: string) => tag.toLowerCase().includes(keyword))
  );
}

/**
 * Check if violation is LGPD-relevant
 */
function isLgpdRelevantViolation(violation: Result): boolean {
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

  return lgpdKeywords.some(keyword =>
    violation.description.toLowerCase().includes(keyword)
    || violation.help.toLowerCase().includes(keyword)
    || violation.tags.some((tag: string) => tag.toLowerCase().includes(keyword))
  );
}

/**
 * Run accessibility tests on a given element
 */
export async function runAccessibilityTest(
  element: HTMLElement | Document = document.documentElement,
  options: AccessibilityTestingOptions = {},
): Promise<AccessibilityTestResult> {
  const axeModule = await import('axe-core');
  const axe = (axeModule as any).default || axeModule;

  const axeResults: AxeResults = await axe(element, {
    runOnly: {
      type: 'tag',
      values: ['wcag21aa', 'wcag21aaa', 'best-practice'],
    },
    resultTypes: ['violations', 'passes', 'incomplete'],
  });

  const violations = convertAxeResults(axeResults);

  // Run healthcare-specific rules
  if (options.includeHealthcareRules) {
    const healthcareViolations = runHealthcareRules(element as HTMLElement);
    violations.push(...healthcareViolations);
  }

  return {
    passes: axeResults.passes.length,
    violations,
    incomplete: axeResults.incomplete,
    timestamp: new Date(),
    url: window.location.href,
    healthcareCompliance: {
      lgpd: !violations.some(v => v.lgpdRelevant),
      healthcareData: !violations.some(v => v.healthcareSpecific),
      emergencyFeatures: validateEmergencyFeatures(
        element instanceof Document ? element.documentElement : element,
      ),
    },
  };
}

/**
 * Run healthcare-specific accessibility rules
 */
function runHealthcareRules(element: HTMLElement): AccessibilityIssue[] {
  const violations: AccessibilityIssue[] = [];

  HEALTHCARE_ACCESSIBILITY_RULES.forEach(rule => {
    if (!rule.check(element)) {
      violations.push({
        id: rule.id,
        impact: rule.impact,
        description: rule.description,
        help: rule.help,
        helpUrl: '',
        tags: ['healthcare', 'custom'],
        nodes: [{
          html: element.outerHTML,
          target: ['body'],
          failureSummary: rule.description,
          any: [{
            id: rule.id,
            impact: rule.impact,
            message: rule.help,
            data: {},
          }],
        }],
        healthcareSpecific: true,
        lgpdRelevant: rule.id.includes('lgpd') || rule.id.includes('privacy'),
      });
    }
  });

  return violations;
}

/**
 * Validate emergency features accessibility
 */
function validateEmergencyFeatures(element: HTMLElement): boolean {
  const emergencyElements = element.querySelectorAll('[data-emergency], [role="alert"]');
  return Array.from(emergencyElements).every(el => {
    return el.hasAttribute('aria-live')
      || el.hasAttribute('role')
      || el.querySelector('.sr-only') !== null;
  });
}

/**
 * Color contrast validation for healthcare applications
 */
export interface ColorContrastResult {
  passes: boolean;
  ratio: number;
  required: number;
  elements: Array<{
    element: string;
    foreground: string;
    background: string;
    ratio: number;
    passes: boolean;
  }>;
}

/**
 * Validate color contrast for healthcare elements
 */
export function validateHealthcareColorContrast(): ColorContrastResult {
  const results: ColorContrastResult['elements'] = [];
  let allPass = true;

  // Test critical healthcare elements
  const healthcareElements = [
    { selector: '[data-patient-info]', name: 'patient information' },
    { selector: '[data-medical-alert]', name: 'medical alerts' },
    { selector: '[data-emergency-contact]', name: 'emergency contacts' },
    { selector: '[data-medication-info]', name: 'medication information' },
    { selector: '[data-diagnosis]', name: 'diagnosis information' },
  ];

  healthcareElements.forEach(({ selector, name }) => {
    const elements = document.querySelectorAll(selector);

    elements.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      const foreground = rgbToHex(computedStyle.color);
      const background = rgbToHex(computedStyle.backgroundColor);

      if (foreground && background) {
        const ratio = calculateContrastRatio(foreground, background);
        const passes = meetsContrastRequirement(foreground, background, 'AA');

        results.push({
          element: name,
          foreground,
          background,
          ratio,
          passes,
        });

        if (!passes) {
          allPass = false;
        }
      }
    });
  });

  return {
    passes: allPass,
    ratio: results.length > 0 ? Math.min(...results.map(r => r.ratio)) : 0,
    required: WCAG_CONTRAST_RATIOS.AA_NORMAL,
    elements: results,
  };
}

/**
 * Convert RGB to HEX
 */
function rgbToHex(rgb: string): string {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return rgb;

  const [, r, g, b] = match;
  return `#${
    [r, g, b].map(x => {
      const hex = parseInt(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('')
  }`;
}

/**
 * Generate accessibility report
 */
export function generateAccessibilityReport(result: AccessibilityTestResult): string {
  const { passes, violations, incomplete, healthcareCompliance } = result;

  let report = `# Accessibility Test Report
Generated: ${result.timestamp.toISOString()}
URL: ${result.url}

## Summary
- ✅ Passed: ${passes}
- ❌ Violations: ${violations.length}
- ⚠️  Needs Review: ${incomplete.length}

## Healthcare Compliance
- 🇧🇷 LGPD Compliance: ${healthcareCompliance.lgpd ? '✅' : '❌'}
- 🏥 Healthcare Data: ${healthcareCompliance.healthcareData ? '✅' : '❌'}
- 🚨 Emergency Features: ${healthcareCompliance.emergencyFeatures ? '✅' : '❌'}

`;

  if (violations.length > 0) {
    report += '\n## Violations\n\n';

    violations.forEach(violation => {
      report += `### ${violation.impact.toUpperCase()}: ${violation.id}\n`;
      report += `**Description:** ${violation.description}\n`;
      report += `**Help:** ${violation.help}\n`;

      if (violation.healthcareSpecific) {
        report += `**Healthcare Specific:** Yes\n`;
      }

      if (violation.lgpdRelevant) {
        report += `**LGPD Relevant:** Yes\n`;
      }

      report += `**Help URL:** ${violation.helpUrl}\n\n`;
    });
  }

  return report;
}

/**
 * Check if an element meets WCAG 2.1 AA+ requirements
 */
export function meetsWCAGRequirements(element: HTMLElement): {
  passes: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check for proper ARIA attributes
  if (element.hasAttribute('aria-label') && !element.getAttribute('aria-label')?.trim()) {
    issues.push('Empty aria-label attribute');
  }

  // Check for proper alt text on images
  if (element.tagName === 'IMG') {
    const alt = element.getAttribute('alt');
    if (!alt) {
      issues.push('Missing alt text');
    } else if (alt.length === 0 && !element.hasAttribute('role')) {
      issues.push('Empty alt text without role="presentation"');
    }
  }

  // Check for proper form labels
  if (
    element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT'
  ) {
    const hasLabel = element.hasAttribute('aria-label')
      || element.hasAttribute('aria-labelledby')
      || element.id && document.querySelector(`label[for="${element.id}"]`);

    if (!hasLabel) {
      issues.push('Form element missing label');
    }
  }

  // Check for proper button text
  if (element.tagName === 'BUTTON' && !element.textContent?.trim()) {
    const hasAriaLabel = element.hasAttribute('aria-label');
    if (!hasAriaLabel) {
      issues.push('Button missing text or aria-label');
    }
  }

  return {
    passes: issues.length === 0,
    issues,
  };
}

export default {
  runAccessibilityTest,
  validateHealthcareColorContrast,
  generateAccessibilityReport,
  meetsWCAGRequirements,
  convertAxeResults,
};
