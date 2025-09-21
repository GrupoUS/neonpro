/**
 * Accessibility Initialization for Healthcare Applications
 * T081 - WCAG 2.1 AA+ Accessibility Compliance
 *
 * Features:
 * - axe-core configuration initialization
 * - Healthcare-specific accessibility setup
 * - Mobile accessibility optimization
 * - Real-time accessibility monitoring
 */

import * as Axe from 'axe-core';
import { prefersHighContrast, prefersReducedMotion } from './accessibility';
import { runAccessibilityTest } from './accessibility-testing';
import { validateHealthcareColorContrast } from './accessibility-testing';
import { healthcareAxeConfig } from './healthcare-accessibility-audit';

/**
 * Accessibility configuration interface
 */
export interface AccessibilityConfig {
  enableAxeCore: boolean;
  enableContinuousMonitoring: boolean;
  enableHealthcareRules: boolean;
  enableMobileOptimization: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  reportInterval?: number;
}

/**
 * Default accessibility configuration for healthcare applications
 */
const DEFAULT_ACCESSIBILITY_CONFIG: AccessibilityConfig = {
  enableAxeCore: true,
  enableContinuousMonitoring: false,
  enableHealthcareRules: true,
  enableMobileOptimization: true,
  logLevel: process.env.NODE_ENV === 'development' ? 'info' : 'error',
  reportInterval: 30000, // 30 seconds
};

/**
 * Accessibility monitoring state
 */
interface AccessibilityState {
  isInitialized: boolean;
  monitoringInterval?: NodeJS.Timeout;
  lastReportTime?: Date;
  violations: any[];
  config: AccessibilityConfig;
}

let accessibilityState: AccessibilityState = {
  isInitialized: false,
  violations: [],
  config: DEFAULT_ACCESSIBILITY_CONFIG,
};

/**
 * Initialize axe-core with healthcare-specific configuration
 */
function initializeAxeCore(): void {
  if (!accessibilityState.config.enableAxeCore) {
    return;
  }

  try {
    // Configure axe-core for healthcare applications
    Axe.configure({
      ...healthcareAxeConfig,
      // Additional healthcare-specific configuration
      reporter: 'v2',
      checks: [
        // Custom healthcare checks
        {
          id: 'healthcare-emergency-accessible',
          evaluate: function(node: any) {
            // Emergency elements must be accessible
            if (node.hasAttribute('data-emergency')) {
              const hasAriaLabel = node.hasAttribute('aria-label');
              const hasScreenReaderText = node.querySelector('.sr-only') !== null;
              return hasAriaLabel || hasScreenReaderText;
            }
            return true;
          },
        },
        {
          id: 'healthcare-patient-data-private',
          evaluate: function(node: any) {
            // Patient data must have privacy indicators
            if (node.hasAttribute('data-patient-data')) {
              const hasPrivacyIndicator = node.hasAttribute('aria-describedby')
                || node.hasAttribute('data-privacy-level');
              return hasPrivacyIndicator;
            }
            return true;
          },
        },
      ],
    });

    console.log('[Accessibility] axe-core initialized with healthcare configuration');
  } catch {
    console.error('[Accessibility] Failed to initialize axe-core:', error);
  }
}

/**
 * Setup mobile accessibility optimizations
 */
function setupMobileAccessibility(): void {
  if (!accessibilityState.config.enableMobileOptimization) {
    return;
  }

  try {
    // Add mobile-specific accessibility attributes
    const html = document.documentElement;

    // Detect touch capabilities
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      html.setAttribute('data-touch-device', 'true');
      html.setAttribute('data-input-method', 'touch');
    }

    // Set up responsive breakpoints
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      let breakpoint = 'desktop';

      if (width < 640) breakpoint = 'mobile';
      else if (width < 768) breakpoint = 'mobile-large';
      else if (width < 1024) breakpoint = 'tablet';
      else if (width < 1280) breakpoint = 'tablet-large';

      html.setAttribute('data-breakpoint', breakpoint);
    };

    // Initial breakpoint detection
    updateBreakpoint();

    // Listen for resize events
    window.addEventListener('resize', updateBreakpoint);

    // Set up user preference detection
    if (prefersReducedMotion()) {
      html.setAttribute('data-prefers-reduced-motion', 'true');
    }

    if (prefersHighContrast()) {
      html.setAttribute('data-prefers-high-contrast', 'true');
    }

    console.log('[Accessibility] Mobile accessibility optimizations initialized');
  } catch {
    console.error('[Accessibility] Failed to setup mobile accessibility:', error);
  }
}

/**
 * Run initial accessibility audit
 */
async function runInitialAudit(): Promise<void> {
  try {
    console.log('[Accessibility] Running initial accessibility audit...');

    const result = await runAccessibilityTest(
      document.documentElement,
      {
        includeHealthcareRules: accessibilityState.config.enableHealthcareRules,
        _context: 'initial-audit',
      },
    );

    // Log results
    if (result.violations.length > 0) {
      console.warn('[Accessibility] Initial audit found violations:', result.violations.length);

      // Group violations by impact
      const violationsByImpact = result.violations.reduce(_(acc,_violation) => {
        if (!acc[violation.impact]) {
          acc[violation.impact] = [];
        }
        acc[violation.impact].push(violation);
        return acc;
      }, {} as Record<string, any[]>);

      Object.entries(violationsByImpact).forEach(_([impact,_violations]) => {
        console.warn(`[Accessibility] ${impact.toUpperCase()}: ${violations.length} violations`);
        violations.forEach(violation => {
          console.warn(`  - ${violation.id}: ${violation.description}`);
        });
      });
    } else {
      console.log('[Accessibility] Initial audit passed - no violations found');
    }

    // Store violations for monitoring
    accessibilityState.violations = result.violations;
    accessibilityState.lastReportTime = new Date();

    // Log healthcare compliance
    console.log('[Accessibility] Healthcare Compliance Status:', {
      lgpd: result.healthcareCompliance.lgpd ? '✅' : '❌',
      healthcareData: result.healthcareCompliance.healthcareData ? '✅' : '❌',
      emergencyFeatures: result.healthcareCompliance.emergencyFeatures ? '✅' : '❌',
    });

    // Run color contrast validation
    const contrastResult = validateHealthcareColorContrast();
    console.log('[Accessibility] Color Contrast Validation:', {
      passes: contrastResult.passes,
      ratio: contrastResult.ratio.toFixed(2),
      required: contrastResult.required,
      elementsTested: contrastResult.elements.length,
    });
  } catch {
    console.error('[Accessibility] Initial audit failed:', error);
  }
}

/**
 * Setup continuous accessibility monitoring
 */
function setupContinuousMonitoring(): void {
  if (!accessibilityState.config.enableContinuousMonitoring) {
    return;
  }

  try {
    const interval = accessibilityState.config.reportInterval || 30000;

    accessibilityState.monitoringInterval = setInterval(_async () => {
      try {
        const result = await runAccessibilityTest(
          document.documentElement,
          {
            includeHealthcareRules: accessibilityState.config.enableHealthcareRules,
            _context: 'continuous-monitoring',
          },
        );

        // Check for new violations
        const newViolations = result.violations.filter(violation =>
          !accessibilityState.violations.some(existing =>
            existing.id === violation.id
            && existing.nodes[0]?.target === violation.nodes[0]?.target
          )
        );

        if (newViolations.length > 0) {
          console.warn('[Accessibility] New violations detected:', newViolations.length);
          newViolations.forEach(violation => {
            console.warn(`  - ${violation.impact}: ${violation.description}`);
          });

          // Update stored violations
          accessibilityState.violations = result.violations;
        }

        accessibilityState.lastReportTime = new Date();
      } catch {
        console.error('[Accessibility] Continuous monitoring error:', error);
      }
    }, interval);

    console.log(`[Accessibility] Continuous monitoring enabled (${interval}ms interval)`);
  } catch {
    console.error('[Accessibility] Failed to setup continuous monitoring:', error);
  }
}

/**
 * Setup global accessibility helpers
 */
function setupAccessibilityHelpers(): void {
  try {
    // Add global accessibility helper function
    (window as any).__NEONPRO_ACCESSIBILITY__ = {
      runAudit: async () => {
        const result = await runAccessibilityTest(document.documentElement, {
          includeHealthcareRules: true,
          _context: 'manual-audit',
        });
        console.log('[Accessibility] Manual audit completed:', result);
        return result;
      },

      validateContrast: () => {
        return validateHealthcareColorContrast();
      },

      getConfig: () => accessibilityState.config,

      getViolations: () => accessibilityState.violations,

      isMonitoring: () => !!accessibilityState.monitoringInterval,
    };

    // Add keyboard shortcut for accessibility audit (Ctrl+Shift+A)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        (window as any).__NEONPRO_ACCESSIBILITY__.runAudit();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    console.log('[Accessibility] Global helpers initialized (Ctrl+Shift+A for audit)');
  } catch {
    console.error('[Accessibility] Failed to setup accessibility helpers:', error);
  }
}

/**
 * Initialize accessibility features
 */
export async function initializeAccessibility(
  config?: Partial<AccessibilityConfig>,
): Promise<void> {
  if (accessibilityState.isInitialized) {
    console.log('[Accessibility] Already initialized');
    return;
  }

  try {
    // Merge configuration
    accessibilityState.config = {
      ...DEFAULT_ACCESSIBILITY_CONFIG,
      ...config,
    };

    console.log('[Accessibility] Initializing with config:', accessibilityState.config);

    // Initialize axe-core
    initializeAxeCore();

    // Setup mobile accessibility
    setupMobileAccessibility();

    // Setup global helpers
    setupAccessibilityHelpers();

    // Run initial audit
    await runInitialAudit();

    // Setup continuous monitoring if enabled
    setupContinuousMonitoring();

    // Mark as initialized
    accessibilityState.isInitialized = true;

    console.log('[Accessibility] ✅ Accessibility initialization completed');

    // Log final status
    console.log('[Accessibility] Final Status:', {
      initialized: accessibilityState.isInitialized,
      monitoring: !!accessibilityState.monitoringInterval,
      violations: accessibilityState.violations.length,
      healthcareRules: accessibilityState.config.enableHealthcareRules,
      mobileOptimized: accessibilityState.config.enableMobileOptimization,
    });
  } catch {
    console.error('[Accessibility] ❌ Initialization failed:', error);
    throw error;
  }
}

/**
 * Cleanup accessibility features
 */
export function cleanupAccessibility(): void {
  try {
    // Clear monitoring interval
    if (accessibilityState.monitoringInterval) {
      clearInterval(accessibilityState.monitoringInterval);
      accessibilityState.monitoringInterval = undefined;
    }

    // Remove global helpers
    if (typeof window !== 'undefined') {
      delete (window as any).__NEONPRO_ACCESSIBILITY__;
    }

    // Reset state
    accessibilityState = {
      isInitialized: false,
      violations: [],
      config: DEFAULT_ACCESSIBILITY_CONFIG,
    };

    console.log('[Accessibility] Cleanup completed');
  } catch {
    console.error('[Accessibility] Cleanup failed:', error);
  }
}

/**
 * Get current accessibility status
 */
export function getAccessibilityStatus() {
  return {
    initialized: accessibilityState.isInitialized,
    monitoring: !!accessibilityState.monitoringInterval,
    violations: accessibilityState.violations,
    config: accessibilityState.config,
    lastReportTime: accessibilityState.lastReportTime,
  };
}

export default {
  initialize: initializeAccessibility,
  cleanup: cleanupAccessibility,
  getStatus: getAccessibilityStatus,
};
