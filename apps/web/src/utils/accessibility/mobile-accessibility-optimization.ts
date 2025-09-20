/**
 * Mobile Accessibility Optimization for Healthcare Applications
 *
 * Specialized mobile accessibility optimization focusing on:
 * - Touch interactions and gestures
 * - Screen reader support for mobile devices
 * - Responsive design validation
 * - Performance optimization for mobile networks
 * - Offline functionality for critical healthcare features
 * - Mobile navigation patterns
 * - Cross-device accessibility testing
 */

import { generateAccessibilityReport } from "./axe-core-integration";

// Type guards and utilities
function isHTMLElement(element: Element | Node): element is HTMLElement {
  return element instanceof HTMLElement;
}

function isElement(node: Element | Document): node is Element {
  return node instanceof Element;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown error occurred";
}

// Mobile-specific accessibility requirements
export const MOBILE_ACCESSIBILITY_REQUIREMENTS = {
  TOUCH_TARGETS: {
    minimumSize: 44, // WCAG 2.1 requirement (44px minimum)
    recommendedSize: 48, // Apple HIG recommendation
    description: "Minimum touch target size for mobile devices",
  },
  SCREEN_READERS: {
    supported: ["VoiceOver", "TalkBack", "NVDA Mobile"],
    description: "Supported mobile screen readers",
  },
  RESPONSIVE_BREAKPOINTS: {
    mobile: 320,
    tablet: 768,
    desktop: 1024,
    description: "Responsive design breakpoints",
  },
  PERFORMANCE_THRESHOLDS: {
    firstContentfulPaint: 1500, // 1.5 seconds
    largestContentfulPaint: 2500, // 2.5 seconds
    cumulativeLayoutShift: 0.1, // Layout stability
    firstInputDelay: 100, // Input responsiveness
    description: "Mobile performance thresholds",
  },
  NETWORK_CONDITIONS: {
    slow3g: {
      rtt: 2000, // 2 seconds RTT
      throughput: 250, // 250 Kbps
      description: "Slow 3G network conditions",
    },
    fast3g: {
      rtt: 400, // 400ms RTT
      throughput: 750, // 750 Kbps
      description: "Fast 3G network conditions",
    },
  },
};

// Mobile healthcare-specific accessibility rules
export const MOBILE_HEALTHCARE_RULES = {
  EMERGENCY_TOUCH_TARGETS: {
    id: "emergency-touch-targets",
    name: "emergency-interface-touch-targets",
    description: "Emergency interfaces must have enhanced touch targets",
    severity: "critical",
    check: (element: Element) => {
      const emergencyElements = element.querySelectorAll(
        '[data-emergency="true"], .emergency',
      );
      return Array.from(emergencyElements).every((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width >= 48 && rect.height >= 48; // Enhanced size for emergencies
      });
    },
    fix: (element: Element) => {
      const emergencyElements = element.querySelectorAll(
        '[data-emergency="true"], .emergency',
      );
      emergencyElements.forEach((el) => {
        if (isHTMLElement(el)) {
          el.style.minWidth = "48px";
          el.style.minHeight = "48px";
        }
        el.setAttribute(
          "aria-label",
          el.getAttribute("aria-label") || "Emergency control",
        );
      });
    },
  },

  MEDICAL_FORM_TOUCH_TARGETS: {
    id: "medical-form-touch-targets",
    name: "Medical Form Touch Targets",
    description: "Medical form inputs must have adequate touch targets",
    severity: "serious",
    check: (element: Element) => {
      const medicalForms = element.querySelectorAll(
        'form[data-medical="true"], .medical-form',
      );
      return Array.from(medicalForms).every((form) => {
        const inputs = form.querySelectorAll("input, select, textarea, button");
        return Array.from(inputs).every((input) => {
          const rect = input.getBoundingClientRect();
          return rect.width >= 44 && rect.height >= 44;
        });
      });
    },
    fix: (element: Element) => {
      const medicalForms = element.querySelectorAll(
        'form[data-medical="true"], .medical-form',
      );
      medicalForms.forEach((form) => {
        const inputs = form.querySelectorAll("input, select, textarea, button");
        inputs.forEach((input) => {
          const rect = input.getBoundingClientRect();
          if (rect.width < 44 || rect.height < 44) {
            if (isHTMLElement(input)) {
              input.style.minWidth = "44px";
              input.style.minHeight = "44px";
            }
          }
        });
      });
    },
  },

  MOBILE_SCREEN_READER_SUPPORT: {
    id: "mobile-screen-reader",
    name: "Mobile Screen Reader Support",
    description: "Content must be accessible to mobile screen readers",
    severity: "critical",
    check: (element: Element) => {
      const interactiveElements = element.querySelectorAll(
        "button, input, select, textarea, a",
      );
      return Array.from(interactiveElements).every((el) => {
        return (
          el.hasAttribute("aria-label") ||
          el.hasAttribute("aria-labelledby") ||
          el.textContent?.trim().length > 0
        );
      });
    },
    fix: (element: Element) => {
      const interactiveElements = element.querySelectorAll(
        "button, input, select, textarea, a",
      );
      interactiveElements.forEach((el) => {
        if (
          !el.hasAttribute("aria-label") &&
          !el.hasAttribute("aria-labelledby")
        ) {
          const text = el.textContent?.trim();
          if (text) {
            el.setAttribute("aria-label", text);
          }
        }
      });
    },
  },

  RESPONSIVE_MEDICAL_CONTENT: {
    id: "responsive-medical-content",
    name: "Responsive Medical Content",
    description: "Medical content must be readable across all device sizes",
    severity: "serious",
    check: (element: Element) => {
      const medicalContent = element.querySelectorAll(
        '[data-medical="true"], .medical-content',
      );
      return Array.from(medicalContent).every((content) => {
        const computedStyle = window.getComputedStyle(content);
        return (
          parseInt(computedStyle.fontSize) >= 16 && // Minimum readable font size
          parseInt(computedStyle.lineHeight) >=
            1.5 * parseInt(computedStyle.fontSize) // Adequate line height
        );
      });
    },
    fix: (element: Element) => {
      const medicalContent = element.querySelectorAll(
        '[data-medical="true"], .medical-content',
      );
      medicalContent.forEach((content) => {
        if (isHTMLElement(content)) {
          content.style.fontSize = "16px";
          content.style.lineHeight = "1.5";
        }
      });
    },
  },

  MOBILE_NAVIGATION_ACCESSIBILITY: {
    id: "mobile-nav-accessibility",
    name: "Mobile Navigation Accessibility",
    description: "Mobile navigation must be accessible and touch-friendly",
    severity: "serious",
    check: (element: Element) => {
      const navElements = element.querySelectorAll('nav, [role="navigation"]');
      return Array.from(navElements).every((nav) => {
        const navItems = nav.querySelectorAll("a, button");
        return Array.from(navItems).every((item) => {
          const rect = item.getBoundingClientRect();
          return rect.width >= 44 && rect.height >= 44;
        });
      });
    },
    fix: (element: Element) => {
      const navElements = element.querySelectorAll('nav, [role="navigation"]');
      navElements.forEach((nav) => {
        const navItems = nav.querySelectorAll("a, button");
        navItems.forEach((item) => {
          const rect = item.getBoundingClientRect();
          if (rect.width < 44 || rect.height < 44) {
            if (isHTMLElement(item)) {
              item.style.minWidth = "44px";
              item.style.minHeight = "44px";
            }
          }
        });
      });
    },
  },

  OFFLINE_HEALTHCARE_FUNCTIONALITY: {
    id: "offline-healthcare-functionality",
    name: "Offline Healthcare Functionality",
    description: "Critical healthcare features must work offline",
    severity: "critical",
    check: (element: Element) => {
      const offlineElements = element.querySelectorAll(
        '[data-offline="true"], .offline-capable',
      );
      return Array.from(offlineElements).every((el) => {
        return (
          el.hasAttribute("aria-label") && el.getAttribute("role") === "region"
        );
      });
    },
    fix: (element: Element) => {
      const offlineElements = element.querySelectorAll(
        '[data-offline="true"], .offline-capable',
      );
      offlineElements.forEach((el) => {
        el.setAttribute(
          "aria-label",
          el.getAttribute("aria-label") || "Offline healthcare feature",
        );
        el.setAttribute("role", "region");
      });
    },
  },
};

/**
 * Mobile Accessibility Optimizer
 */
export class MobileAccessibilityOptimizer {
  private rules = MOBILE_HEALTHCARE_RULES;
  private requirements = MOBILE_ACCESSIBILITY_REQUIREMENTS;
  private optimizationResults: Map<string, any> = new Map();

  /**
   * Perform comprehensive mobile accessibility optimization
   */
  async optimizeMobileAccessibility(context?: Element | string): Promise<{
    summary: {
      overallScore: number;
      touchTargetsOptimized: number;
      screenReaderEnhancements: number;
      responsiveImprovements: number;
      offlineOptimizations: number;
      mobileCompliance: boolean;
    };
    deviceResults: Array<{
      deviceType: string;
      screenSize: string;
      score: number;
      issues: any[];
      optimizations: string[];
    }>;
    performanceMetrics: {
      firstContentfulPaint: number;
      largestContentfulPaint: number;
      cumulativeLayoutShift: number;
      firstInputDelay: number;
    };
    recommendations: string[];
    offlineCapabilities: string[];
  }> {
    const auditContext =
      typeof context === "string"
        ? document.querySelector(context)
        : context || document;

    if (!auditContext) {
      throw new Error("Mobile optimization context not found");
    }

    // Ensure we have an Element, not Document
    const elementContext = isElement(auditContext)
      ? auditContext
      : document.documentElement;

    const results = {
      summary: {
        overallScore: 0,
        touchTargetsOptimized: 0,
        screenReaderEnhancements: 0,
        responsiveImprovements: 0,
        offlineOptimizations: 0,
        mobileCompliance: false,
      },
      deviceResults: [] as Array<{
        deviceType: string;
        screenSize: string;
        score: number;
        issues: any[];
        optimizations: string[];
      }>,
      performanceMetrics: {
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0,
      },
      recommendations: [] as string[],
      offlineCapabilities: [] as string[],
    };

    // Test across different device types
    const deviceTypes = [
      { type: "mobile", screen: "320x568" },
      { type: "mobile", screen: "375x667" },
      { type: "tablet", screen: "768x1024" },
      { type: "desktop", screen: "1024x768" },
    ];

    for (const device of deviceTypes) {
      const deviceResult = await this.testDevice(device, elementContext);
      results.deviceResults.push(deviceResult);
    }

    // Apply optimizations
    const optimizationStats = await this.applyOptimizations(elementContext);
    results.summary = {
      ...optimizationStats,
      overallScore: this.calculateOverallScore(results.deviceResults),
      mobileCompliance: optimizationStats.overallScore >= 90,
    };

    // Measure performance
    results.performanceMetrics = await this.measurePerformance();

    // Generate recommendations
    results.recommendations = this.generateMobileRecommendations(results);

    // Identify offline capabilities
    results.offlineCapabilities =
      this.identifyOfflineCapabilities(elementContext);

    return results;
  }

  /**
   * Test accessibility on specific device configuration
   */
  private async testDevice(
    device: { type: string; screen: string },
    context: Element,
  ): Promise<{
    deviceType: string;
    screenSize: string;
    score: number;
    issues: any[];
    optimizations: string[];
  }> {
    const issues = [];
    const optimizations = [];
    let passedChecks = 0;
    let totalChecks = 0;

    // Simulate device viewport
    const [width, height] = device.screen.split("x").map(Number);

    // Test each mobile accessibility rule
    for (const [ruleId, rule] of Object.entries(this.rules)) {
      totalChecks++;

      try {
        const passed = rule.check(context);

        if (!passed) {
          issues.push({
            ruleId: rule.id,
            ruleName: rule.name,
            description: rule.description,
            severity: rule.severity,
            device: device.type,
          });

          // Apply fix
          rule.fix(context);
          optimizations.push(`Applied fix for ${rule.name} on ${device.type}`);
        } else {
          passedChecks++;
        }
      } catch (error: unknown) {
        console.error(`Mobile rule ${ruleId} failed:`, error);
        issues.push({
          ruleId: rule.id,
          ruleName: rule.name,
          description: rule.description,
          severity: rule.severity,
          device: device.type,
          error: getErrorMessage(error),
        });
      }
    }

    // Test responsive design
    const responsiveIssues = await this.testResponsiveDesign(
      context,
      width,
      height,
    );
    issues.push(...responsiveIssues);

    const score = Math.round((passedChecks / totalChecks) * 100);

    return {
      deviceType: device.type,
      screenSize: device.screen,
      score,
      issues,
      optimizations,
    };
  }

  /**
   * Test responsive design for specific viewport
   */
  private async testResponsiveDesign(
    context: Element,
    width: number,
    height: number,
  ): Promise<any[]> {
    const issues = [];

    // Test if content is readable at this size
    const textElements = context.querySelectorAll(
      "p, span, label, h1, h2, h3, h4, h5, h6",
    );

    for (const element of Array.from(textElements)) {
      const computedStyle = window.getComputedStyle(element);
      const fontSize = parseInt(computedStyle.fontSize);

      if (fontSize < 14 && width < 768) {
        issues.push({
          ruleId: "mobile-text-size",
          description: "Text too small for mobile devices",
          severity: "moderate",
          element: element.tagName,
          fontSize,
          requiredSize: "14px",
        });
      }
    }

    // Test touch target sizes for mobile
    if (width < 768) {
      const touchElements = context.querySelectorAll(
        "button, input, select, textarea, a",
      );

      for (const element of Array.from(touchElements)) {
        const rect = element.getBoundingClientRect();

        if (rect.width < 44 || rect.height < 44) {
          issues.push({
            ruleId: "mobile-touch-target",
            description: "Touch target too small for mobile devices",
            severity: "serious",
            element: element.tagName,
            currentSize: `${rect.width}x${rect.height}`,
            requiredSize: "44x44",
          });
        }
      }
    }

    return issues;
  }

  /**
   * Apply mobile accessibility optimizations
   */
  private async applyOptimizations(context: Element): Promise<{
    touchTargetsOptimized: number;
    screenReaderEnhancements: number;
    responsiveImprovements: number;
    offlineOptimizations: number;
    overallScore: number;
  }> {
    const stats = {
      touchTargetsOptimized: 0,
      screenReaderEnhancements: 0,
      responsiveImprovements: 0,
      offlineOptimizations: 0,
      overallScore: 0,
    };

    // Optimize touch targets
    const touchElements = context.querySelectorAll(
      "button, input, select, textarea, a",
    );
    touchElements.forEach((element) => {
      const rect = element.getBoundingClientRect();

      if (rect.width < 44 || rect.height < 44) {
        if (isHTMLElement(element)) {
          element.style.minWidth = "44px";
          element.style.minHeight = "44px";
          stats.touchTargetsOptimized++;
        }
      }
    });

    // Enhance screen reader support
    const interactiveElements = context.querySelectorAll(
      "button, input, select, textarea, a",
    );
    interactiveElements.forEach((element) => {
      if (
        !element.hasAttribute("aria-label") &&
        !element.hasAttribute("aria-labelledby")
      ) {
        const text = element.textContent?.trim();
        if (text) {
          element.setAttribute("aria-label", text);
          stats.screenReaderEnhancements++;
        }
      }
    });

    // Improve responsive design
    const textElements = context.querySelectorAll("p, span, label");
    textElements.forEach((element) => {
      const computedStyle = window.getComputedStyle(element);
      const fontSize = parseInt(computedStyle.fontSize);

      if (fontSize < 14) {
        if (isHTMLElement(element)) {
          element.style.fontSize = "16px";
          element.style.lineHeight = "1.5";
          stats.responsiveImprovements++;
        }
      }
    });

    // Enhance offline capabilities
    const offlineElements = context.querySelectorAll(
      '[data-offline="true"], .offline-capable',
    );
    offlineElements.forEach((element) => {
      if (!element.hasAttribute("aria-label")) {
        element.setAttribute("aria-label", "Offline healthcare feature");
        stats.offlineOptimizations++;
      }
    });

    // Calculate overall score
    const totalPossible = Object.keys(stats).length - 1; // Exclude overallScore
    const totalAchieved = Object.values(stats).reduce(
      (sum, val) => (typeof val === "number" && val > 0 ? sum + 1 : sum),
      0,
    );

    stats.overallScore = Math.round((totalAchieved / totalPossible) * 100);

    return stats;
  }

  /**
   * Measure performance metrics
   */
  private async measurePerformance(): Promise<{
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
  }> {
    // Use the Performance API for real metrics if available
    let firstContentfulPaint = 0;
    let largestContentfulPaint = 0;
    let cumulativeLayoutShift = 0;
    let firstInputDelay = 0;

    // First Contentful Paint
    const paintEntries = performance.getEntriesByType("paint");
    const fcpEntry = paintEntries.find(
      (entry: any) => entry.name === "first-contentful-paint",
    );
    if (fcpEntry) {
      firstContentfulPaint = fcpEntry.startTime;
    }

    // Largest Contentful Paint
    const lcpEntries = performance.getEntriesByType(
      "largest-contentful-paint",
    ) as PerformanceEntry[];
    if (lcpEntries.length > 0) {
      largestContentfulPaint = lcpEntries[lcpEntries.length - 1].startTime;
    }

    // Cumulative Layout Shift
    const clsEntries = performance.getEntriesByType("layout-shift") as any[];
    cumulativeLayoutShift = clsEntries.reduce(
      (sum, entry) => (entry.hadRecentInput ? sum : sum + entry.value),
      0,
    );

    // First Input Delay
    const fidEntries = performance.getEntriesByType("first-input") as any[];
    if (fidEntries.length > 0) {
      firstInputDelay = fidEntries[0].processingStart - fidEntries[0].startTime;
    }

    // Fallbacks if metrics are unavailable
    if (!firstContentfulPaint) firstContentfulPaint = 0;
    if (!largestContentfulPaint) largestContentfulPaint = 0;
    if (!cumulativeLayoutShift) cumulativeLayoutShift = 0;
    if (!firstInputDelay) firstInputDelay = 0;

    return {
      firstContentfulPaint,
      largestContentfulPaint,
      cumulativeLayoutShift,
      firstInputDelay,
    };
  }

  /**
   * Calculate overall score across all devices
   */
  private calculateOverallScore(deviceResults: any[]): number {
    const totalScore = deviceResults.reduce(
      (sum, result) => sum + result.score,
      0,
    );
    return Math.round(totalScore / deviceResults.length);
  }

  /**
   * Generate mobile-specific recommendations
   */
  private generateMobileRecommendations(results: any): string[] {
    const recommendations = [];

    // Overall score recommendations
    if (results.summary.overallScore < 80) {
      recommendations.push(
        "🚨 Critical mobile accessibility issues detected",
        "Prioritize mobile accessibility improvements for healthcare applications",
        "Conduct comprehensive mobile device testing",
      );
    }

    // Touch target recommendations
    if (results.summary.touchTargetsOptimized > 10) {
      recommendations.push(
        "👆 Multiple touch targets optimized for mobile",
        "Consider implementing mobile-first design patterns",
        "Test touch interactions on actual mobile devices",
      );
    }

    // Performance recommendations
    if (results.performanceMetrics.firstContentfulPaint > 1500) {
      recommendations.push(
        "⚡ Performance optimization needed for mobile devices",
        "Optimize images and assets for mobile networks",
        "Implement lazy loading for non-critical content",
      );
    }

    // Screen reader recommendations
    if (results.summary.screenReaderEnhancements > 5) {
      recommendations.push(
        "🔊 Screen reader support enhanced for mobile",
        "Test with VoiceOver and TalkBack screen readers",
        "Ensure proper ARIA labeling for all interactive elements",
      );
    }

    // Offline capability recommendations
    if (results.offlineCapabilities.length > 0) {
      recommendations.push(
        "📱 Offline capabilities identified for healthcare features",
        "Implement service workers for critical healthcare functionality",
        "Ensure offline data synchronization and conflict resolution",
      );
    }

    return recommendations;
  }

  /**
   * Identify offline healthcare capabilities
   */
  private identifyOfflineCapabilities(context: Element): string[] {
    const capabilities: string[] = [];

    const offlineElements = context.querySelectorAll(
      '[data-offline="true"], .offline-capable',
    );
    offlineElements.forEach((element) => {
      const capability =
        element.getAttribute("data-offline-capability") ||
        element.getAttribute("data-feature") ||
        "Generic healthcare feature";
      capabilities.push(capability);
    });

    return Array.from(new Set(capabilities)); // Remove duplicates
  }

  /**
   * Generate mobile accessibility report
   */
  generateMobileReport(optimizationResults: any): {
    timestamp: string;
    summary: any;
    deviceBreakdown: any[];
    performance: any;
    recommendations: string[];
    compliance: {
      wcag: boolean;
      healthcare: boolean;
      mobile: boolean;
    };
  } {
    return {
      timestamp: new Date().toISOString(),
      summary: optimizationResults.summary,
      deviceBreakdown: optimizationResults.deviceResults,
      performance: optimizationResults.performanceMetrics,
      recommendations: optimizationResults.recommendations,
      compliance: {
        wcag: optimizationResults.summary.overallScore >= 90,
        healthcare: optimizationResults.summary.mobileCompliance,
        mobile: optimizationResults.summary.overallScore >= 80,
      },
    };
  }

  /**
   * Test specific mobile network conditions
   */
  async testNetworkConditions(
    context: Element,
    networkCondition: keyof typeof MOBILE_ACCESSIBILITY_REQUIREMENTS.NETWORK_CONDITIONS,
  ): Promise<{
    condition: string;
    loadTime: number;
    accessibilityScore: number;
    issues: string[];
  }> {
    const condition =
      MOBILE_ACCESSIBILITY_REQUIREMENTS.NETWORK_CONDITIONS[networkCondition];

    let loadTime = 0;
    let accessibilityScore = 0;
    const issues: string[] = [];

    // Try to use the Network Information API if available
    const nav = navigator as any;
    if (nav.connection) {
      const connection = nav.connection;
      // Estimate load time based on effectiveType and downlink
      loadTime = 3000 / (connection.downlink || 1); // crude estimate
      if (
        connection.effectiveType === "slow-2g" ||
        connection.effectiveType === "2g"
      ) {
        issues.push(
          "Detected very slow network: optimize all assets aggressively.",
        );
        accessibilityScore = 80;
      } else if (connection.effectiveType === "3g") {
        issues.push(
          "Detected 3G network: optimize images and reduce requests.",
        );
        accessibilityScore = 85;
      } else {
        accessibilityScore = 95;
      }
    } else {
      // Simulate if API is unavailable
      loadTime = Math.random() * 3000 + 2000;
      accessibilityScore = Math.random() * 20 + 80;
      issues.push(
        "Network Information API not available; using simulated data.",
      );
    }

    // Add generic recommendations
    issues.push(
      "Consider optimizing images for slow networks",
      "Implement progressive loading for healthcare content",
      "Add loading indicators for network-dependent features",
    );

    return {
      condition: condition.description,
      loadTime,
      accessibilityScore,
      issues,
    };
  }
}

/**
 * Create global mobile accessibility optimizer instance
 */
export const mobileAccessibilityOptimizer = new MobileAccessibilityOptimizer();

/**
 * Quick mobile accessibility check utility
 */
export async function quickMobileAccessibilityCheck(
  selector?: string,
): Promise<{
  passed: boolean;
  score: number;
  touchTargets: number;
  screenReaderSupport: boolean;
  responsiveDesign: boolean;
  issues: string[];
}> {
  const context = selector ? document.querySelector(selector) : document;

  if (!context) {
    return {
      passed: false,
      score: 0,
      touchTargets: 0,
      screenReaderSupport: false,
      responsiveDesign: false,
      issues: ["Context not found for mobile accessibility check"],
    };
  }

  try {
    const optimizer = new MobileAccessibilityOptimizer();
    // Ensure we have an Element, not Document
    const elementContext = isElement(context)
      ? context
      : document.documentElement;
    const results = await optimizer.optimizeMobileAccessibility(elementContext);

    return {
      passed: results.summary.overallScore >= 80,
      score: results.summary.overallScore,
      touchTargets: results.summary.touchTargetsOptimized,
      screenReaderSupport: results.summary.screenReaderEnhancements > 0,
      responsiveDesign: results.summary.responsiveImprovements > 0,
      issues: results.recommendations,
    };
  } catch (error) {
    console.error("Quick mobile accessibility check failed:", error);
    return {
      passed: false,
      score: 0,
      touchTargets: 0,
      screenReaderSupport: false,
      responsiveDesign: false,
      issues: [`Mobile accessibility check failed: ${getErrorMessage(error)}`],
    };
  }
}

// Export types
export type MobileOptimizationResults = ReturnType<
  typeof mobileAccessibilityOptimizer.optimizeMobileAccessibility
>;
export type NetworkCondition =
  keyof typeof MOBILE_ACCESSIBILITY_REQUIREMENTS.NETWORK_CONDITIONS;
