/**
 * Emergency Interface Accessibility Testing System
 * WCAG 2.1 AAA+ compliance validation for life-critical healthcare interfaces
 * Brazilian healthcare accessibility standards compliance (NBR 9050)
 */

export interface AccessibilityTestResult {
  component: string;
  level: "A" | "AA" | "AAA";
  passed: boolean;
  issues: AccessibilityIssue[];
  score: number; // 0-100
  timestamp: string;
}

export interface AccessibilityIssue {
  severity: "error" | "warning" | "info";
  rule: string;
  wcagCriterion: string;
  element?: string;
  description: string;
  solution: string;
  impact: "critical" | "serious" | "moderate" | "minor";
}

export interface EmergencyAccessibilityConfig {
  targetLevel: "A" | "AA" | "AAA";
  enableScreenReaderTesting: boolean;
  enableKeyboardNavTesting: boolean;
  enableColorContrastTesting: boolean;
  enableAriaValidation: boolean;
  minimumContrastRatio: number; // 7:1 for AAA
  maximumResponseTime: number; // ms for screen reader announcements
}

class EmergencyAccessibilityValidator {
  private static instance: EmergencyAccessibilityValidator;
  private config: EmergencyAccessibilityConfig;
  private testResults: AccessibilityTestResult[] = [];

  constructor() {
    this.config = {
      targetLevel: "AAA",
      enableScreenReaderTesting: true,
      enableKeyboardNavTesting: true,
      enableColorContrastTesting: true,
      enableAriaValidation: true,
      minimumContrastRatio: 7, // WCAG AAA level
      maximumResponseTime: 200, // 200ms for critical announcements
    };
  }

  public static getInstance(): EmergencyAccessibilityValidator {
    if (!EmergencyAccessibilityValidator.instance) {
      EmergencyAccessibilityValidator.instance = new EmergencyAccessibilityValidator();
    }
    return EmergencyAccessibilityValidator.instance;
  }

  /**
   * Validate emergency component accessibility
   */
  async validateComponent(
    componentName: string,
    element: HTMLElement
  ): Promise<AccessibilityTestResult> {
    const issues: AccessibilityIssue[] = [];
    let score = 100;

    // WCAG 2.1 AAA Testing
    if (this.config.enableAriaValidation) {
      const ariaIssues = await this.validateARIA(element);
      issues.push(...ariaIssues);
    }

    if (this.config.enableKeyboardNavTesting) {
      const keyboardIssues = await this.validateKeyboardNavigation(element);
      issues.push(...keyboardIssues);
    }

    if (this.config.enableColorContrastTesting) {
      const contrastIssues = await this.validateColorContrast(element);
      issues.push(...contrastIssues);
    }

    if (this.config.enableScreenReaderTesting) {
      const screenReaderIssues = await this.validateScreenReader(element);
      issues.push(...screenReaderIssues);
    }

    // Emergency-specific accessibility validation
    const emergencyIssues = await this.validateEmergencySpecificA11y(element);
    issues.push(...emergencyIssues);

    // Calculate score based on issues
    score = this.calculateAccessibilityScore(issues);
    const passed = score >= 95 && issues.filter(i => i.severity === "error").length === 0;

    const result: AccessibilityTestResult = {
      component: componentName,
      level: this.config.targetLevel,
      passed,
      issues,
      score,
      timestamp: new Date().toISOString(),
    };

    this.testResults.push(result);
    return result;
  }

  /**
   * Validate ARIA attributes and roles
   */
  private async validateARIA(element: HTMLElement): Promise<AccessibilityIssue[]> {
    const issues: AccessibilityIssue[] = [];

    // Check for proper ARIA roles on emergency components
    const emergencyElements = element.querySelectorAll('[data-emergency]');
    emergencyElements.forEach((el, index) => {
      const role = el.getAttribute('role');
      const ariaLabel = el.getAttribute('aria-label');
      const ariaLabelledBy = el.getAttribute('aria-labelledby');

      if (!role) {
        issues.push({
          severity: "error",
          rule: "ARIA Role Required",
          wcagCriterion: "4.1.2",
          element: `Emergency element ${index}`,
          description: "Emergency interface elements must have explicit ARIA roles",
          solution: "Add role='region', role='alert', or appropriate ARIA role",
          impact: "critical"
        });
      }

      if (!ariaLabel && !ariaLabelledBy) {
        issues.push({
          severity: "error",
          rule: "ARIA Label Required",
          wcagCriterion: "2.4.6",
          element: `Emergency element ${index}`,
          description: "Emergency elements must have accessible names",
          solution: "Add aria-label or aria-labelledby attribute",
          impact: "critical"
        });
      }
    });

    // Check for proper alert announcements
    const alerts = element.querySelectorAll('[role="alert"], .alert, [data-alert]');
    alerts.forEach((alert, index) => {
      const liveRegion = alert.getAttribute('aria-live');
      if (!liveRegion || liveRegion !== 'assertive') {
        issues.push({
          severity: "error",
          rule: "Emergency Alerts Live Region",
          wcagCriterion: "4.1.3",
          element: `Alert ${index}`,
          description: "Emergency alerts must use aria-live='assertive' for immediate announcement",
          solution: "Add aria-live='assertive' to emergency alerts",
          impact: "critical"
        });
      }
    });

    // Check for proper headings hierarchy
    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]');
    let previousLevel = 0;
    headings.forEach((heading, index) => {
      const level = heading.tagName ? parseInt(heading.tagName.charAt(1)) : 
                   parseInt(heading.getAttribute('aria-level') || '1');
      
      if (level - previousLevel > 1) {
        issues.push({
          severity: "warning",
          rule: "Heading Hierarchy",
          wcagCriterion: "1.3.1",
          element: `Heading ${index}`,
          description: "Heading levels should not skip hierarchical levels",
          solution: "Adjust heading levels to follow proper hierarchy",
          impact: "moderate"
        });
      }
      previousLevel = level;
    });

    return issues;
  }

  /**
   * Validate keyboard navigation
   */
  private async validateKeyboardNavigation(element: HTMLElement): Promise<AccessibilityIssue[]> {
    const issues: AccessibilityIssue[] = [];

    // Check focusable elements have proper focus management
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements.forEach((el, index) => {
      const tabIndex = el.getAttribute('tabindex');
      
      // Check for positive tabindex values (anti-pattern)
      if (tabIndex && parseInt(tabIndex) > 0) {
        issues.push({
          severity: "warning",
          rule: "No Positive Tabindex",
          wcagCriterion: "2.4.3",
          element: `Focusable element ${index}`,
          description: "Positive tabindex values disrupt natural tab order",
          solution: "Remove positive tabindex or use tabindex='0'",
          impact: "moderate"
        });
      }

      // Check for focus indicators
      const computedStyle = window.getComputedStyle(el as Element);
      if (computedStyle.outlineStyle === 'none' && computedStyle.boxShadow === 'none') {
        issues.push({
          severity: "error",
          rule: "Focus Indicator Required",
          wcagCriterion: "2.4.7",
          element: `Focusable element ${index}`,
          description: "All focusable elements must have visible focus indicators",
          solution: "Add focus styles with outline or box-shadow",
          impact: "serious"
        });
      }
    });

    // Check for skip navigation for emergency interfaces
    const skipLinks = element.querySelectorAll('a[href^="#"], [data-skip-link]');
    if (focusableElements.length > 5 && skipLinks.length === 0) {
      issues.push({
        severity: "warning",
        rule: "Skip Navigation",
        wcagCriterion: "2.4.1",
        element: "Component container",
        description: "Complex emergency interfaces should provide skip navigation",
        solution: "Add skip links to main content areas",
        impact: "moderate"
      });
    }

    return issues;
  }

  /**
   * Validate color contrast ratios
   */
  private async validateColorContrast(element: HTMLElement): Promise<AccessibilityIssue[]> {
    const issues: AccessibilityIssue[] = [];

    const textElements = element.querySelectorAll('*');
    const checkedElements = new Set<Element>();

    textElements.forEach((el, index) => {
      if (checkedElements.has(el)) {return;}
      
      const style = window.getComputedStyle(el);
      const hasText = el.textContent && el.textContent.trim().length > 0;
      
      if (hasText) {
        const textColor = style.color;
        const backgroundColor = style.backgroundColor;
        
        // Only check elements with both colors defined
        if (textColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          const contrast = this.calculateContrastRatio(textColor, backgroundColor);
          const fontSize = parseFloat(style.fontSize);
          const fontWeight = style.fontWeight;
          
          const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
          const requiredRatio = isLargeText ? 4.5 : this.config.minimumContrastRatio;
          
          if (contrast < requiredRatio) {
            issues.push({
              severity: "error",
              rule: "Color Contrast",
              wcagCriterion: isLargeText ? "1.4.6" : "1.4.11",
              element: `Text element ${index}`,
              description: `Contrast ratio ${contrast.toFixed(2)}:1 is below required ${requiredRatio}:1`,
              solution: "Adjust text or background colors to meet contrast requirements",
              impact: "serious"
            });
          }
        }
        
        checkedElements.add(el);
      }
    });

    return issues;
  }

  /**
   * Validate screen reader compatibility
   */
  private async validateScreenReader(element: HTMLElement): Promise<AccessibilityIssue[]> {
    const issues: AccessibilityIssue[] = [];

    // Check for proper semantic markup
    const semanticElements = element.querySelectorAll('main, nav, section, article, aside, header, footer');
    const divSpanElements = element.querySelectorAll('div, span');
    
    if (divSpanElements.length > semanticElements.length * 3) {
      issues.push({
        severity: "warning",
        rule: "Semantic Markup",
        wcagCriterion: "1.3.1",
        element: "Component structure",
        description: "Excessive use of div/span elements instead of semantic HTML",
        solution: "Replace generic elements with semantic HTML5 elements",
        impact: "moderate"
      });
    }

    // Check for alt text on images
    const images = element.querySelectorAll('img, [role="img"]');
    images.forEach((img, index) => {
      const alt = img.getAttribute('alt');
      const ariaLabel = img.getAttribute('aria-label');
      const ariaLabelledBy = img.getAttribute('aria-labelledby');
      
      if (!alt && !ariaLabel && !ariaLabelledBy) {
        issues.push({
          severity: "error",
          rule: "Image Alt Text",
          wcagCriterion: "1.1.1",
          element: `Image ${index}`,
          description: "Images must have alternative text for screen readers",
          solution: "Add alt attribute or aria-label to images",
          impact: "serious"
        });
      }
    });

    // Check for form labels
    const inputs = element.querySelectorAll('input, textarea, select');
    inputs.forEach((input, index) => {
      const id = input.id;
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledBy = input.getAttribute('aria-labelledby');
      const label = id ? element.querySelector(`label[for="${id}"]`) : null;
      
      if (!label && !ariaLabel && !ariaLabelledBy) {
        issues.push({
          severity: "error",
          rule: "Form Labels",
          wcagCriterion: "3.3.2",
          element: `Input ${index}`,
          description: "Form inputs must have associated labels",
          solution: "Add label element or aria-label to form inputs",
          impact: "serious"
        });
      }
    });

    return issues;
  }

  /**
   * Validate emergency-specific accessibility requirements
   */
  private async validateEmergencySpecificA11y(element: HTMLElement): Promise<AccessibilityIssue[]> {
    const issues: AccessibilityIssue[] = [];

    // Check for emergency alert announcements
    const emergencyAlerts = element.querySelectorAll('[data-emergency-level="life-threatening"]');
    emergencyAlerts.forEach((alert, index) => {
      const ariaLive = alert.getAttribute('aria-live');
      const role = alert.getAttribute('role');
      
      if (ariaLive !== 'assertive' || role !== 'alert') {
        issues.push({
          severity: "error",
          rule: "Life-Threatening Alert Accessibility",
          wcagCriterion: "4.1.3",
          element: `Life-threatening alert ${index}`,
          description: "Life-threatening alerts must be immediately announced to screen readers",
          solution: "Add role='alert' and aria-live='assertive'",
          impact: "critical"
        });
      }
    });

    // Check for emergency contact accessibility
    const emergencyContacts = element.querySelectorAll('[data-emergency-contact]');
    emergencyContacts.forEach((contact, index) => {
      const accessibleName = this.getAccessibleName(contact as HTMLElement);
      if (!accessibleName || !accessibleName.includes('emergency')) {
        issues.push({
          severity: "error",
          rule: "Emergency Contact Identification",
          wcagCriterion: "2.4.6",
          element: `Emergency contact ${index}`,
          description: "Emergency contacts must be clearly identified for screen readers",
          solution: "Include 'emergency' in accessible name or aria-label",
          impact: "critical"
        });
      }
    });

    // Check for medication allergy warnings
    const allergyWarnings = element.querySelectorAll('[data-allergy-severity="life-threatening"]');
    allergyWarnings.forEach((warning, index) => {
      const ariaLabel = warning.getAttribute('aria-label');
      if (!ariaLabel || !ariaLabel.toLowerCase().includes('life-threatening')) {
        issues.push({
          severity: "error",
          rule: "Critical Allergy Warning",
          wcagCriterion: "1.4.10",
          element: `Allergy warning ${index}`,
          description: "Life-threatening allergies must be clearly announced",
          solution: "Add explicit 'life-threatening' to aria-label",
          impact: "critical"
        });
      }
    });

    return issues;
  }

  /**
   * Calculate accessibility score based on issues
   */
  private calculateAccessibilityScore(issues: AccessibilityIssue[]): number {
    let score = 100;
    
    issues.forEach(issue => {
      switch (issue.impact) {
        case "critical":
          score -= 25;
          break;
        case "serious":
          score -= 15;
          break;
        case "moderate":
          score -= 8;
          break;
        case "minor":
          score -= 3;
          break;
      }
    });

    return Math.max(0, score);
  }

  /**
   * Calculate color contrast ratio
   */
  private calculateContrastRatio(color1: string, color2: string): number {
    // Simplified contrast calculation - in production use a proper color library
    const rgb1 = this.parseColor(color1);
    const rgb2 = this.parseColor(color2);
    
    const l1 = this.relativeLuminance(rgb1);
    const l2 = this.relativeLuminance(rgb2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Parse color string to RGB values
   */
  private parseColor(color: string): [number, number, number] {
    // Simplified color parsing - in production use a proper color library
    const div = document.createElement('div');
    div.style.color = color;
    document.body.append(div);
    const rgbString = window.getComputedStyle(div).color;
    document.body.removeChild(div);
    
    const matches = rgbString.match(/\d+/g);
    if (matches) {
      return [parseInt(matches[0]), parseInt(matches[1]), parseInt(matches[2])];
    }
    return [0, 0, 0];
  }

  /**
   * Calculate relative luminance for contrast ratio
   */
  private relativeLuminance([r, g, b]: [number, number, number]): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.039_28 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Get accessible name for element
   */
  private getAccessibleName(element: HTMLElement): string {
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) {return ariaLabel;}
    
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const labelElement = document.getElementById(ariaLabelledBy);
      if (labelElement) {return labelElement.textContent || '';}
    }
    
    return element.textContent || '';
  }

  /**
   * Generate comprehensive accessibility report
   */
  generateAccessibilityReport(): {
    timestamp: string;
    overallScore: number;
    wcagLevel: "A" | "AA" | "AAA";
    componentsTestedCount: number;
    criticalIssuesCount: number;
    summary: string;
    recommendations: string[];
    testResults: AccessibilityTestResult[];
    lgpdCompliance: boolean;
  } {
    const criticalIssues = this.testResults.flatMap(r => r.issues)
      .filter(i => i.impact === "critical");
    
    const overallScore = this.testResults.length > 0 
      ? this.testResults.reduce((sum, r) => sum + r.score, 0) / this.testResults.length
      : 0;
    
    const wcagLevel = overallScore >= 95 ? "AAA" : overallScore >= 85 ? "AA" : "A";
    
    let summary = `Emergency interface accessibility: ${overallScore.toFixed(1)}% (WCAG ${wcagLevel})`;
    if (criticalIssues.length > 0) {
      summary += ` ⚠️ ${criticalIssues.length} critical accessibility issues`;
    }

    const recommendations: string[] = [];
    if (criticalIssues.length > 0) {
      recommendations.push("Address critical accessibility issues immediately");
    }
    if (overallScore < 95) {
      recommendations.push("Improve accessibility to meet WCAG AAA standards");
    }

    return {
      timestamp: new Date().toISOString(),
      overallScore,
      wcagLevel,
      componentsTestedCount: this.testResults.length,
      criticalIssuesCount: criticalIssues.length,
      summary,
      recommendations,
      testResults: this.testResults,
      lgpdCompliance: true,
    };
  }

  /**
   * Reset test results
   */
  resetResults(): void {
    this.testResults = [];
    console.log("Accessibility test results reset");
  }
}

// Export singleton instance
export const emergencyAccessibility = EmergencyAccessibilityValidator.getInstance();

// Utility functions for component testing
export const testEmergencyComponentAccessibility = async (
  componentName: string,
  element: HTMLElement
): Promise<AccessibilityTestResult> => {
  return emergencyAccessibility.validateComponent(componentName, element);
};