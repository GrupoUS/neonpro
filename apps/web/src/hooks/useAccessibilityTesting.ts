/**
 * Accessibility Testing Hook
 * T081 - WCAG 2.1 AA+ Accessibility Compliance
 *
 * Features:
 * - Real-time accessibility testing with axe-core
 * - Healthcare-specific validation
 * - Automated testing on component mount
 * - Performance-optimized testing
 */

import { AxeResults } from '@axe-core/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityIssue,
  AccessibilityTestResult,
  ColorContrastResult,
  runAccessibilityTest,
  validateHealthcareColorContrast,
} from '../utils/accessibility-testing';

export interface AccessibilityTestingOptions {
  enabled?: boolean;
  runOnMount?: boolean;
  runOnChanges?: boolean;
  includeHealthcareRules?: boolean;
  debounceMs?: number;
  threshold?: {
    maxViolations?: number;
    maxCriticalIssues?: number;
  };
}

export interface AccessibilityTestingResult {
  issues: AccessibilityIssue[];
  criticalIssues: number;
  seriousIssues: number;
  moderateIssues: number;
  minorIssues: number;
  colorContrast: ColorContrastResult;
  lastTested: Date | null;
  isTesting: boolean;
  healthcareCompliance: {
    lgpd: boolean;
    healthcareData: boolean;
    emergencyFeatures: boolean;
  };
  testAccessibility: () => Promise<void>;
  clearResults: () => void;
}

const DEFAULT_OPTIONS: Required<AccessibilityTestingOptions> = {
  enabled: process.env.NODE_ENV === 'development',
  runOnMount: true,
  runOnChanges: true,
  includeHealthcareRules: true,
  debounceMs: 1000,
  threshold: {
    maxViolations: 0,
    maxCriticalIssues: 0,
  },
};

/**
 * Hook for automated accessibility testing
 */
export function useAccessibilityTesting(
  targetElement?: HTMLElement | null,
  options: AccessibilityTestingOptions = {},
): AccessibilityTestingResult {
  const [isTesting, setIsTesting] = useState(false);
  const [lastTested, setLastTested] = useState<Date | null>(null);
  const [testResult, setTestResult] = useState<AccessibilityTestResult | null>(
    null,
  );
  const [colorContrast, setColorContrast] = useState<ColorContrastResult>({
    passes: true,
    ratio: 0,
    required: 4.5,
    elements: [],
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const optionsRef = useRef({ ...DEFAULT_OPTIONS, ...options });

  // Group issues by impact level
  const issues = testResult?.violations || [];
  const criticalIssues = issues.filter(
    issue => issue.impact === 'critical',
  ).length;
  const seriousIssues = issues.filter(
    issue => issue.impact === 'serious',
  ).length;
  const moderateIssues = issues.filter(
    issue => issue.impact === 'moderate',
  ).length;
  const minorIssues = issues.filter(issue => issue.impact === 'minor').length;

  const healthcareCompliance = testResult?.healthcareCompliance || {
    lgpd: true,
    healthcareData: true,
    emergencyFeatures: true,
  };

  /**
   * Run accessibility test
   */
  const testAccessibility = useCallback(async () => {
    if (!optionsRef.current.enabled) return;

    setIsTesting(true);

    try {
      const element = targetElement || document.documentElement;
      const result = await runAccessibilityTest(element, {
        includeHealthcareRules: optionsRef.current.includeHealthcareRules,
      });

      const contrastResult = validateHealthcareColorContrast();

      setTestResult(result);
      setColorContrast(contrastResult);
      setLastTested(new Date());

      // Log issues in development
      if (
        process.env.NODE_ENV === 'development'
        && result.violations.length > 0
      ) {
        console.group('🔍 Accessibility Issues Found');
        result.violations.forEach(_violation => {
          console.warn(
            `[${violation.impact.toUpperCase()}] ${violation.description}`,
          );
          console.log(`  Help: ${violation.help}`);
          console.log(`  URL: ${violation.helpUrl}`);
          if (violation.healthcareSpecific) {
            console.log('  🏥 Healthcare Specific: Yes');
          }
          if (violation.lgpdRelevant) {
            console.log('  🇧🇷 LGPD Relevant: Yes');
          }
        });
        console.groupEnd();
      }

      // Check thresholds
      const { threshold } = optionsRef.current;
      if (
        threshold.maxViolations !== undefined
        && result.violations.length > threshold.maxViolations
      ) {
        console.error(
          `Accessibility threshold exceeded: ${result.violations.length} violations (max: ${threshold.maxViolations})`,
        );
      }

      if (
        threshold.maxCriticalIssues !== undefined
        && criticalIssues > threshold.maxCriticalIssues
      ) {
        console.error(
          `Critical issues threshold exceeded: ${criticalIssues} critical issues (max: ${threshold.maxCriticalIssues})`,
        );
      }
    } catch (_error) {
      console.error('Accessibility testing failed:', error);
    } finally {
      setIsTesting(false);
    }
  }, [targetElement]);

  /**
   * Debounced test runner
   */
  const debouncedTest = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      testAccessibility();
    }, optionsRef.current.debounceMs);
  }, [testAccessibility]);

  /**
   * Clear test results
   */
  const clearResults = useCallback(() => {
    setTestResult(null);
    setLastTested(null);
    setColorContrast({
      passes: true,
      ratio: 0,
      required: 4.5,
      elements: [],
    });
  }, []);

  // Run test on mount
  useEffect(() => {
    if (optionsRef.current.runOnMount && optionsRef.current.enabled) {
      testAccessibility();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [testAccessibility]);

  // Watch for DOM changes and re-run tests
  useEffect(() => {
    if (!optionsRef.current.runOnChanges || !optionsRef.current.enabled) return;

    const observer = new MutationObserver(() => {
      debouncedTest();
    });

    const element = targetElement || document.documentElement;
    observer.observe(element, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-label', 'role', 'alt', 'disabled'],
    });

    return () => {
      observer.disconnect();
    };
  }, [targetElement, debouncedTest]);

  return {
    issues,
    criticalIssues,
    seriousIssues,
    moderateIssues,
    minorIssues,
    colorContrast,
    lastTested,
    isTesting,
    healthcareCompliance,
    testAccessibility,
    clearResults,
  };
}

/**
 * Hook for testing specific components
 */
export function useComponentAccessibility<T extends HTMLElement>(
  componentRef: React.RefObject<T>,
  options: AccessibilityTestingOptions = {},
) {
  const [element, setElement] = useState<T | null>(null);

  useEffect(() => {
    if (componentRef.current) {
      setElement(componentRef.current);
    }
  }, [componentRef]);

  return useAccessibilityTesting(element, options);
}

/**
 * Hook for accessibility monitoring with real-time feedback
 */
export function useAccessibilityMonitor() {
  const [isActive, setIsActive] = useState(false);
  const [summary, setSummary] = useState<{
    totalIssues: number;
    criticalIssues: number;
    healthcareViolations: number;
    lgpdViolations: number;
  }>({
    totalIssues: 0,
    criticalIssues: 0,
    healthcareViolations: 0,
    lgpdViolations: 0,
  });

  const startMonitoring = useCallback(() => {
    setIsActive(true);

    // Run initial test
    const testAll = async () => {
      try {
        const result = await runAccessibilityTest(document.documentElement, {
          includeHealthcareRules: true,
        });

        const healthcareViolations = result.violations.filter(
          v => v.healthcareSpecific,
        ).length;
        const lgpdViolations = result.violations.filter(
          v => v.lgpdRelevant,
        ).length;
        const criticalIssues = result.violations.filter(
          v => v.impact === 'critical',
        ).length;

        setSummary({
          totalIssues: result.violations.length,
          criticalIssues,
          healthcareViolations,
          lgpdViolations,
        });
      } catch (_error) {
        console.error('Accessibility monitoring failed:', error);
      }
    };

    testAll();

    // Set up periodic testing
    const interval = setInterval(testAll, 30000); // Test every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsActive(false);
  }, []);

  return {
    isActive,
    summary,
    startMonitoring,
    stopMonitoring,
  };
}

/**
 * Hook for keyboard navigation testing
 */
export function useKeyboardNavigationTest() {
  const [results, setResults] = useState<{
    tabOrder: string[];
    focusableElements: number;
    issues: string[];
  }>({
    tabOrder: [],
    focusableElements: 0,
    issues: [],
  });

  const testKeyboardNavigation = useCallback(() => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    const tabOrder: string[] = [];
    const issues: string[] = [];

    // Check each focusable element
    focusableElements.forEach((element, _index) => {
      const tabIndex = element.getAttribute('tabindex');
      const ariaLabel = element.getAttribute('aria-label');
      const role = element.getAttribute('role');
      const textContent = element.textContent?.trim();

      tabOrder.push(`${element.tagName.toLowerCase()}${index}`);

      // Check for missing labels
      if (
        (element.tagName === 'BUTTON' || element.tagName === 'INPUT')
        && !ariaLabel
        && !textContent
      ) {
        issues.push(
          `Element ${index} (${element.tagName}) missing label or text`,
        );
      }

      // Check for positive tabindex (should be avoided)
      if (tabIndex && parseInt(tabIndex) > 0) {
        issues.push(`Element ${index} has positive tabindex: ${tabIndex}`);
      }

      // Check for interactive elements with proper roles
      if (element.tagName === 'BUTTON' && !role) {
        // Buttons don't need explicit roles, but we should check they're accessible
        if (!element.textContent?.trim() && !ariaLabel) {
          issues.push(`Button ${index} lacks accessible name`);
        }
      }
    });

    // Check for skip links
    const skipLinks = document.querySelectorAll(
      '[href^="#"], [data-skip-link]',
    );
    if (skipLinks.length === 0) {
      issues.push('No skip links found for keyboard navigation');
    }

    setResults({
      tabOrder,
      focusableElements: focusableElements.length,
      issues,
    });

    // Log results in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🎹 Keyboard Navigation Test');
      console.log(`Focusable elements: ${focusableElements.length}`);
      console.log(`Tab order: ${tabOrder.join(' → ')}`);

      if (issues.length > 0) {
        console.warn('Issues found:');
        issues.forEach(_issue => console.warn(`  ❌ ${issue}`));
      } else {
        console.log('✅ No keyboard navigation issues found');
      }

      console.groupEnd();
    }

    return issues.length === 0;
  }, []);

  return {
    ...results,
    testKeyboardNavigation,
    hasIssues: results.issues.length > 0,
  };
}

export default useAccessibilityTesting;
