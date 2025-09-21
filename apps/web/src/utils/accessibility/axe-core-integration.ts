/**
 * Axe-core Accessibility Testing Integration
 *
 * Comprehensive accessibility testing integration for healthcare applications
 * with WCAG 2.1 AA+ compliance validation and Brazilian healthcare standards.
 */

import * as axe from 'axe-core';
import { type AxeResults, type Result } from 'axe-core';
import * as React from 'react';

// Brazilian healthcare specific rules configuration
const HEALTHCARE_RULES = {
  'color-contrast': {
    enabled: true,
    // Healthcare specific: higher contrast requirements for medical information
    options: {
      minimumAA: '4.5',
      minimumAAA: '7.0',
      minimumLargeAA: '3.0',
      minimumLargeAAA: '4.5',
    },
  },
  'form-field-multiple-labels': {
    enabled: true,
  },
  'landmark-one-main': {
    enabled: true,
  },
  'page-has-heading-one': {
    enabled: true,
  },
  'duplicate-id': {
    enabled: true,
  },
  'label-title-only': {
    enabled: true,
  },
  'link-in-text-block': {
    enabled: true,
  },
};

// Healthcare-specific impact levels
const HEALTHCARE_IMPACT_LEVELS = {
  critical: {
    description: 'Critical barrier for healthcare professionals and patients',
    impact: 'critical',
  },
  serious: {
    description: 'Serious problem affecting medical information accessibility',
    impact: 'serious',
  },
  moderate: {
    description: 'Moderate issue affecting user experience in healthcare context',
    impact: 'moderate',
  },
  minor: {
    description: 'Minor improvement opportunity for healthcare application',
    impact: 'minor',
  },
};

/**
 * Initialize axe-core with healthcare-specific configuration
 */
export function initializeAxeCore(): void {
  axe.configure({
    rules: Object.entries(HEALTHCARE_RULES).map(([id, config]) => ({
      id,
      ...config,
    })),
    // Add healthcare-specific checks
    checks: [
      {
        id: 'healthcare-data-sensitivity',
        evaluate: (_node: any) => {
          // Check if sensitive healthcare data has proper ARIA labeling
          const sensitiveSelectors = [
            '[data-sensitive="medical"]',
            '[data-sensitivity="high"]',
            '[data-category="phi"]',
          ];

          return sensitiveSelectors.some(selector => {
            const elements = document.querySelectorAll(selector);
            return Array.from(elements).every(el => {
              const hasLabel = el.hasAttribute('aria-label')
                || el.hasAttribute('aria-labelledby')
                || el.getAttribute('role') === 'alert';
              return hasLabel;
            });
          });
        },
        metadata: {
          impact: 'serious',
          messages: {
            pass: 'Sensitive healthcare data has proper accessibility labels',
            fail: 'Sensitive healthcare data lacks proper accessibility labels',
          },
        },
      },
    ],
  });
}

/**
 * Run accessibility scan on specific element or entire page
 */
export async function runAccessibilityScan(
  context?: string | Element | axe.ElementContext,
  options?: axe.RunOptions,
): Promise<AxeResults> {
  try {
    const results = await axe.run(context || document, {
      ...options,
      reporter: 'v2',
      resultTypes: ['violations', 'passes', 'incomplete', 'inapplicable'],
    });

    // Process and categorize results for healthcare context
    return processHealthcareResults(results);
  } catch (error) {
    console.error('Accessibility scan failed:', error);
    throw new Error(`Accessibility scan failed: ${error}`);
  }
}

/**
 * Process results with healthcare-specific categorization
 */
function processHealthcareResults(results: AxeResults): AxeResults {
  // Add healthcare-specific metadata
  results.violations = results.violations.map(violation => {
    const healthcareImpact = assessHealthcareImpact(violation);

    return {
      ...violation,
      healthcareImpact,
      requiresImmediateAttention: healthcareImpact.impact === 'critical',
      category: categorizeHealthcareViolation(violation),
    };
  });

  return results;
}

/**
 * Assess the impact level for healthcare context
 */
function assessHealthcareImpact(
  violation: Result,
): (typeof HEALTHCARE_IMPACT_LEVELS)[keyof typeof HEALTHCARE_IMPACT_LEVELS] {
  const criticalHealthcareRules = [
    'color-contrast',
    'name-role-value',
    'label',
    'button-name',
    'link-name',
    'aria-command-name',
    'aria-input-field-name',
  ];

  if (criticalHealthcareRules.includes(violation.id)) {
    return HEALTHCARE_IMPACT_LEVELS.critical;
  }

  if (violation.impact === 'serious') {
    return HEALTHCARE_IMPACT_LEVELS.serious;
  }

  return (
    HEALTHCARE_IMPACT_LEVELS[
      violation.impact as keyof typeof HEALTHCARE_IMPACT_LEVELS
    ] || HEALTHCARE_IMPACT_LEVELS.moderate
  );
}

/**
 * Categorize violations for healthcare context
 */
function categorizeHealthcareViolation(violation: Result): string {
  const categories = {
    'patient-safety': ['color-contrast', 'name-role-value', 'label'],
    'medical-forms': ['form-field-multiple-labels', 'label-title-only'],
    navigation: ['landmark-one-main', 'duplicate-id'],
    'content-structure': ['page-has-heading-one', 'link-in-text-block'],
    'interactive-elements': ['button-name', 'link-name', 'aria-command-name'],
  };

  for (const [category, rules] of Object.entries(categories)) {
    if (rules.includes(violation.id)) {
      return category;
    }
  }

  return 'general';
}

/**
 * Generate healthcare-specific accessibility report
 */
export function generateAccessibilityReport(results: AxeResults): {
  summary: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    total: number;
    wcagCompliance: string;
  };
  recommendations: string[];
  violations: Array<{
    rule: string;
    impact: string;
    description: string;
    elements: number;
    category: string;
    requiresImmediateAttention: boolean;
  }>;
} {
  const violations = results.violations as Array<
    Result & {
      healthcareImpact: (typeof HEALTHCARE_IMPACT_LEVELS)[keyof typeof HEALTHCARE_IMPACT_LEVELS];
      category: string;
      requiresImmediateAttention: boolean;
    }
  >;

  const summary = {
    critical: violations.filter(v => v.healthcareImpact.impact === 'critical')
      .length,
    serious: violations.filter(v => v.healthcareImpact.impact === 'serious')
      .length,
    moderate: violations.filter(v => v.healthcareImpact.impact === 'moderate')
      .length,
    minor: violations.filter(v => v.healthcareImpact.impact === 'minor')
      .length,
    total: violations.length,
    wcagCompliance: violations.length === 0
      ? '100% WCAG 2.1 AA+ Compliant'
      : `${Math.max(0, 100 - violations.length * 10)}% WCAG 2.1 AA+ Compliant`,
  };

  const recommendations = generateHealthcareRecommendations(violations);

  const violationDetails = violations.map(v => ({
    rule: v.id,
    impact: v.healthcareImpact.impact,
    description: v.description,
    elements: v.nodes.length,
    category: v.category,
    requiresImmediateAttention: v.requiresImmediateAttention,
  }));

  return {
    summary,
    recommendations,
    violations: violationDetails,
  };
}

/**
 * Generate healthcare-specific recommendations
 */
function generateHealthcareRecommendations(
  violations: Array<
    Result & {
      healthcareImpact: (typeof HEALTHCARE_IMPACT_LEVELS)[keyof typeof HEALTHCARE_IMPACT_LEVELS];
      category: string;
    }
  >,
): string[] {
  const recommendations: string[] = [];

  if (violations.some(v => v.category === 'patient-safety')) {
    recommendations.push(
      '🏥 CRITICAL: Patient safety violations detected - immediate attention required',
      'Ensure all medical information is accessible to healthcare professionals',
      'Verify color contrast meets healthcare standards (minimum 4.5:1)',
    );
  }

  if (violations.some(v => v.category === 'medical-forms')) {
    recommendations.push(
      '📋 Medical form accessibility issues detected',
      'Ensure all form fields have proper labels and instructions',
      'Provide clear error messages for medical data validation',
    );
  }

  if (violations.some(v => v.healthcareImpact.impact === 'critical')) {
    recommendations.push(
      '🚨 Critical accessibility violations require immediate fix',
      'Schedule urgent accessibility review with healthcare compliance team',
    );
  }

  return recommendations;
}

/**
 * React Hook for accessibility testing
 */
export function useAccessibilityTesting() {
  const [isScanning, setIsScanning] = React.useState(false);
  const [lastScan, setLastScan] = React.useState<AxeResults | null>(null);
  const [report, setReport] = React.useState<
    ReturnType<
      typeof generateAccessibilityReport
    > | null
  >(null);

  const scan = React.useCallback(async (context?: string | Element) => {
    setIsScanning(true);
    try {
      const results = await runAccessibilityScan(context);
      setLastScan(results);
      const generatedReport = generateAccessibilityReport(results);
      setReport(generatedReport);
      return results;
    } catch (error) {
      console.error('Accessibility scan failed:', error);
      throw error;
    } finally {
      setIsScanning(false);
    }
  }, []);

  return {
    scan,
    isScanning,
    lastScan,
    report,
    generateAccessibilityReport,
  };
}

// Export types for TypeScript
export type AccessibilityReport = ReturnType<
  typeof generateAccessibilityReport
>;
export type HealthcareImpactLevel = keyof typeof HEALTHCARE_IMPACT_LEVELS;
