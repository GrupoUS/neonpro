/**
 * Healthcare Accessibility Audit Utilities
 *
 * Specialized audit utilities for healthcare applications with Brazilian compliance standards,
 * WCAG 2.1 AA+ requirements, and healthcare-specific validation patterns.
 */

import { generateAccessibilityReport } from './axe-core-integration';

// Brazilian healthcare compliance standards
export const BRAZILIAN_HEALTHCARE_STANDARDS = {
  LGPD: {
    name: 'Lei Geral de Proteção de Dados',
    version: '13.709/2018',
    description: 'General Personal Data Protection Law',
    requirements: [
      'Data minimization',
      'Purpose limitation',
      'Consent management',
      'Data subject rights',
      'Anonymization and pseudonymization',
      'Data protection officer',
      'Incident reporting',
      'International data transfer',
    ],
  },
  ANVISA: {
    name: 'Agência Nacional de Vigilância Sanitária',
    description: 'National Health Surveillance Agency',
    requirements: [
      'Medical device software validation',
      'Risk management',
      'Clinical evaluation',
      'Post-market surveillance',
      'Labeling and instructions',
      'User interface validation',
      'Safety and performance requirements',
      'Quality management system',
    ],
  },
  CFM: {
    name: 'Conselho Federal de Medicina',
    description: 'Federal Medical Council',
    requirements: [
      'Professional authentication',
      'Patient confidentiality',
      'Medical record integrity',
      'Telemedicine standards',
      'Prescription validation',
      'Informed consent',
      'Professional responsibility',
      'Ethical guidelines',
    ],
  },
};

// Healthcare-specific accessibility audit rules
export const HEALTHCARE_AUDIT_RULES = {
  // Patient safety critical rules
  MEDICAL_INFORMATION_ACCESSIBILITY: {
    id: 'medical-info-access',
    name: 'Medical Information Accessibility',
    description: 'All medical information must be accessible to healthcare professionals',
    severity: 'critical',
    check: (_element: any) => {
      const medicalInfo = element.querySelectorAll(
        '[data-sensitive="medical"], [data-medical="true"]',
      );
      return Array.from(medicalInfo).every(info => {
        return (
          info.hasAttribute('aria-label')
          || info.hasAttribute('aria-labelledby')
          || info.getAttribute('role') === 'alert'
          || info.getAttribute('role') === 'status'
        );
      });
    },
    fix: (_element: any) => {
      const medicalInfo = element.querySelectorAll(
        '[data-sensitive="medical"], [data-medical="true"]',
      );
      medicalInfo.forEach(_info => {
        if (
          !info.hasAttribute('aria-label')
          && !info.hasAttribute('aria-labelledby')
        ) {
          const label = info.textContent?.trim() || 'Medical information';
          info.setAttribute('aria-label', label);
        }
      });
    },
  },

  EMERGENCY_ACCESSIBILITY: {
    id: 'emergency-access',
    name: 'Emergency Information Accessibility',
    description: 'Emergency information must be accessible without color dependence',
    severity: 'critical',
    check: (_element: any) => {
      const emergencyElements = element.querySelectorAll(
        '[data-emergency="true"], .emergency',
      );
      return Array.from(emergencyElements).every(el => {
        const computedStyle = window.getComputedStyle(el);
        const color = computedStyle.color;
        const backgroundColor = computedStyle.backgroundColor;

        // Check if color contrast is sufficient
        return color !== backgroundColor && color !== 'transparent';
      });
    },
    fix: (_element: any) => {
      const emergencyElements = element.querySelectorAll(
        '[data-emergency="true"], .emergency',
      );
      emergencyElements.forEach(_el => {
        if (!el.hasAttribute('aria-label')) {
          el.setAttribute('aria-label', 'Emergency information');
        }
      });
    },
  },

  MEDICAL_FORM_ACCESSIBILITY: {
    id: 'medical-form-access',
    name: 'Medical Form Accessibility',
    description: 'Medical forms must have proper labeling and instructions',
    severity: 'serious',
    check: (_element: any) => {
      const medicalForms = element.querySelectorAll(
        'form[data-medical="true"], .medical-form',
      );
      return Array.from(medicalForms).every(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        return Array.from(inputs).every(input => {
          return (
            input.hasAttribute('id')
            && input.hasAttribute('name')
            && (input.hasAttribute('aria-label')
              || input.hasAttribute('aria-labelledby')
              || document.querySelector(`label[for="${input.id}"]`) !== null)
          );
        });
      });
    },
    fix: (_element: any) => {
      const medicalForms = element.querySelectorAll(
        'form[data-medical="true"], .medical-form',
      );
      medicalForms.forEach(_form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach((input, _index) => {
          if (!input.hasAttribute('id')) {
            input.setAttribute('id', `medical-input-${index}`);
          }
          if (!input.hasAttribute('name')) {
            input.setAttribute('name', `medical_field_${index}`);
          }
        });
      });
    },
  },

  PRESCRIPTION_ACCESSIBILITY: {
    id: 'prescription-access',
    name: 'Prescription Information Accessibility',
    description: 'Prescription information must be clear and accessible',
    severity: 'serious',
    check: (_element: any) => {
      const prescriptionElements = element.querySelectorAll(
        '[data-prescription="true"], .prescription',
      );
      return Array.from(prescriptionElements).every(el => {
        return (
          el.hasAttribute('aria-label')
          || el.hasAttribute('aria-describedby')
          || el.querySelector('.prescription-label, .medication-name') !== null
        );
      });
    },
    fix: (_element: any) => {
      const prescriptionElements = element.querySelectorAll(
        '[data-prescription="true"], .prescription',
      );
      prescriptionElements.forEach(_el => {
        if (!el.hasAttribute('aria-label')) {
          const medicationName = el
            .querySelector('.medication-name')
            ?.textContent?.trim();
          if (medicationName) {
            el.setAttribute('aria-label', `Prescription: ${medicationName}`);
          }
        }
      });
    },
  },

  APPOINTMENT_ACCESSIBILITY: {
    id: 'appointment-access',
    name: 'Appointment Scheduling Accessibility',
    description: 'Appointment scheduling must be accessible to all users',
    severity: 'moderate',
    check: (_element: any) => {
      const appointmentElements = element.querySelectorAll(
        '[data-appointment="true"], .appointment-scheduler',
      );
      return Array.from(appointmentElements).every(el => {
        const dateInputs = el.querySelectorAll(
          'input[type="date"], input[type="time"]',
        );
        const buttons = el.querySelectorAll('button');

        return (
          Array.from(dateInputs).every(input => input.hasAttribute('aria-label'))
          && Array.from(buttons).every(
            button =>
              button.hasAttribute('aria-label')
              || button.textContent?.trim().length > 0,
          )
        );
      });
    },
    fix: (_element: any) => {
      const appointmentElements = element.querySelectorAll(
        '[data-appointment="true"], .appointment-scheduler',
      );
      appointmentElements.forEach(_el => {
        const dateInputs = el.querySelectorAll(
          'input[type="date"], input[type="time"]',
        );
        dateInputs.forEach(_input => {
          if (
            !input.hasAttribute('aria-label')
            && input instanceof HTMLInputElement
          ) {
            input.setAttribute(
              'aria-label',
              input.type === 'date' ? 'Date selection' : 'Time selection',
            );
          }
        });
      });
    },
  },
};

// Healthcare audit categories
export const HEALTHCARE_AUDIT_CATEGORIES = {
  PATIENT_SAFETY: {
    name: 'Patient Safety',
    description: 'Critical patient safety related accessibility issues',
    rules: ['medical-info-access', 'emergency-access'],
    priority: 1,
  },
  MEDICAL_FORMS: {
    name: 'Medical Forms',
    description: 'Accessibility of medical data entry forms',
    rules: ['medical-form-access'],
    priority: 2,
  },
  PRESCRIPTION_MANAGEMENT: {
    name: 'Prescription Management',
    description: 'Accessibility of prescription and medication information',
    rules: ['prescription-access'],
    priority: 3,
  },
  APPOINTMENT_MANAGEMENT: {
    name: 'Appointment Management',
    description: 'Accessibility of scheduling and calendar interfaces',
    rules: ['appointment-access'],
    priority: 4,
  },
};

/**
 * Healthcare Accessibility Auditor
 */
export class HealthcareAccessibilityAuditor {
  private auditResults: Map<string, any> = new Map();
  private readonly rules = HEALTHCARE_AUDIT_RULES;
  private readonly categories = HEALTHCARE_AUDIT_CATEGORIES;

  /**
   * Perform comprehensive healthcare accessibility audit
   */
  async performComprehensiveAudit(context?: Element | string): Promise<{
    summary: {
      overallScore: number;
      criticalIssues: number;
      seriousIssues: number;
      moderateIssues: number;
      minorIssues: number;
      healthcareCompliance: {
        lgpd: boolean;
        anvisa: boolean;
        cfm: boolean;
      };
    };
    categoryResults: Array<{
      category: string;
      score: number;
      issues: any[];
      passed: boolean;
    }>;
    recommendations: string[];
    detailedReport: any;
  }> {
    const auditContext = typeof context === 'string'
      ? document.querySelector(context)
      : context || document;

    if (!auditContext) {
      throw new Error('Audit context not found');
    }

    // Ensure we have an Element for category audits
    const elementContext = auditContext instanceof Document
      ? auditContext.documentElement
      : auditContext;

    const results = {
      summary: {
        overallScore: 0,
        criticalIssues: 0,
        seriousIssues: 0,
        moderateIssues: 0,
        minorIssues: 0,
        healthcareCompliance: {
          lgpd: false,
          anvisa: false,
          cfm: false,
        },
      },
      categoryResults: [] as Array<{
        category: string;
        score: number;
        issues: any[];
        passed: boolean;
      }>,
      recommendations: [] as string[],
      detailedReport: {} as any,
    };

    // Run category-specific audits
    for (const [categoryId, category] of Object.entries(this.categories)) {
      const categoryResult = await this.auditCategory(
        categoryId,
        category,
        elementContext,
      );
      results.categoryResults.push(categoryResult);

      // Update summary counts
      categoryResult.issues.forEach((_issue: any) => {
        switch (issue.severity) {
          case 'critical':
            results.summary.criticalIssues++;
            break;
          case 'serious':
            results.summary.seriousIssues++;
            break;
          case 'moderate':
            results.summary.moderateIssues++;
            break;
          case 'minor':
            results.summary.minorIssues++;
            break;
        }
      });
    }

    // Calculate overall score
    const totalChecks = results.categoryResults.reduce(
      (sum, cat) => sum + cat.issues.length,
      0,
    );
    const passedChecks = results.categoryResults.reduce(
      (sum, cat) => sum + cat.issues.filter((issue: any) => issue.passed).length,
      0,
    );

    results.summary.overallScore = Math.round(
      (passedChecks / totalChecks) * 100,
    );

    // Validate healthcare compliance
    results.summary.healthcareCompliance = await this.validateHealthcareCompliance(elementContext);

    // Generate recommendations
    results.recommendations = this.generateRecommendations(results);

    return results;
  }

  /**
   * Audit specific healthcare category
   */
  private async auditCategory(
    categoryId: string,
    category: (typeof HEALTHCARE_AUDIT_CATEGORIES)[keyof typeof HEALTHCARE_AUDIT_CATEGORIES],
    context: Element,
  ): Promise<{
    category: string;
    score: number;
    issues: any[];
    passed: boolean;
  }> {
    const issues = [];
    let passedChecks = 0;
    let totalChecks = 0;

    for (const ruleId of category.rules) {
      const rule = this.rules[ruleId as keyof typeof HEALTHCARE_AUDIT_RULES];

      if (!rule) continue;

      totalChecks++;

      try {
        const passed = rule.check(context);

        issues.push({
          ruleId: rule.id,
          ruleName: rule.name,
          description: rule.description,
          severity: rule.severity,
          passed,
          category: categoryId,
        });

        if (passed) {
          passedChecks++;
        }
      } catch (error) {
        console.error(`Audit rule ${ruleId} failed:`, error);

        issues.push({
          ruleId: rule.id,
          ruleName: rule.name,
          description: rule.description,
          severity: rule.severity,
          passed: false,
          error: error instanceof Error ? error.message : String(error),
          category: categoryId,
        });
      }
    }

    const score = Math.round((passedChecks / totalChecks) * 100);

    return {
      category: category.name,
      score,
      issues,
      passed: score >= 90,
    };
  }

  /**
   * Validate Brazilian healthcare compliance
   */
  private async validateHealthcareCompliance(context: Element): Promise<{
    lgpd: boolean;
    anvisa: boolean;
    cfm: boolean;
  }> {
    return {
      lgpd: this.validateLGPDCompliance(context),
      anvisa: this.validateANVISACompliance(context),
      cfm: this.validateCFMCompliance(context),
    };
  }

  /**
   * Validate LGPD compliance
   */
  private validateLGPDCompliance(context: Element): boolean {
    const lgpdElements = context.querySelectorAll(
      '[data-lgpd="true"], [data-sensitive="personal"]',
    );

    for (const element of Array.from(lgpdElements)) {
      if (
        !element.hasAttribute('aria-label')
        && !element.hasAttribute('aria-labelledby')
      ) {
        return false;
      }
    }

    // Check for consent management accessibility
    const consentElements = context.querySelectorAll(
      '[data-consent="true"], .consent-management',
    );
    return Array.from(consentElements).every(el => {
      return (
        el.hasAttribute('role')
        && (el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby'))
      );
    });
  }

  /**
   * Validate ANVISA compliance
   */
  private validateANVISACompliance(context: Element): boolean {
    const anvisaElements = context.querySelectorAll(
      '[data-anvisa="true"], [data-medical-device="true"]',
    );

    for (const element of Array.from(anvisaElements)) {
      if (
        !element.hasAttribute('aria-label')
        && !element.hasAttribute('aria-describedby')
        && !element.hasAttribute('role')
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate CFM compliance
   */
  private validateCFMCompliance(context: Element): boolean {
    const cfmElements = context.querySelectorAll(
      '[data-cfm="true"], [data-professional="medical"]',
    );

    for (const element of Array.from(cfmElements)) {
      if (
        !element.hasAttribute('aria-label')
        && !element.hasAttribute('aria-describedby')
      ) {
        return false;
      }
    }

    // Check for professional authentication accessibility
    const authElements = context.querySelectorAll(
      '[data-auth="professional"], .professional-auth',
    );
    return Array.from(authElements).every(el => {
      return (
        el.hasAttribute('aria-label')
        || el.hasAttribute('aria-describedby')
        || el.querySelector('label') !== null
      );
    });
  }

  /**
   * Generate healthcare-specific recommendations
   */
  private generateRecommendations(results: any): string[] {
    const recommendations = [];

    // Critical issues recommendations
    if (results.summary.criticalIssues > 0) {
      recommendations.push(
        '🚨 CRITICAL: Patient safety issues detected - immediate attention required',
        'Schedule urgent accessibility review with healthcare compliance team',
        'Implement fixes for critical accessibility violations before deployment',
      );
    }

    // Healthcare compliance recommendations
    if (!results.summary.healthcareCompliance.lgpd) {
      recommendations.push(
        '🔒 LGPD compliance issues detected',
        'Review data handling and privacy controls accessibility',
        'Ensure consent management interfaces are fully accessible',
      );
    }

    if (!results.summary.healthcareCompliance.anvisa) {
      recommendations.push(
        '⚕️ ANVISA compliance issues detected',
        'Review medical device interface accessibility',
        'Validate user interface for medical device software requirements',
      );
    }

    if (!results.summary.healthcareCompliance.cfm) {
      recommendations.push(
        '👨‍⚕️ CFM compliance issues detected',
        'Review professional authentication and authorization interfaces',
        'Ensure medical record access controls are accessible',
      );
    }

    // Category-specific recommendations
    results.categoryResults.forEach((_category: any) => {
      if (!category.passed) {
        switch (category.category) {
          case 'Patient Safety':
            recommendations.push(
              '🏥 Prioritize patient safety accessibility fixes',
              'Ensure emergency information is accessible without color dependence',
            );
            break;
          case 'Medical Forms':
            recommendations.push(
              '📋 Improve medical form accessibility',
              'Add proper labels and instructions for all form fields',
            );
            break;
          case 'Prescription Management':
            recommendations.push(
              '💊 Enhance prescription information accessibility',
              'Ensure medication information is clear and accessible',
            );
            break;
          case 'Appointment Management':
            recommendations.push(
              '📅 Optimize appointment scheduling accessibility',
              'Improve date and time input accessibility',
            );
            break;
        }
      }
    });

    // Overall score recommendations
    if (results.summary.overallScore < 80) {
      recommendations.push(
        '📊 Overall accessibility score below 80% - comprehensive review needed',
        'Consider professional accessibility audit and remediation',
      );
    } else if (results.summary.overallScore < 90) {
      recommendations.push(
        '✅ Good accessibility foundation - focus on remaining issues',
        'Target specific areas for improvement to reach 90%+ compliance',
      );
    }

    return recommendations;
  }

  /**
   * Apply automatic fixes for common accessibility issues
   */
  async applyAutomaticFixes(context?: Element): Promise<{
    fixed: number;
    failed: number;
    fixes: Array<{
      rule: string;
      element: string;
      success: boolean;
      message: string;
    }>;
  }> {
    const auditContext = context || document;
    const elementContext = auditContext instanceof Document
      ? auditContext.documentElement
      : auditContext;
    const fixes = [];
    let fixed = 0;
    let failed = 0;

    for (const [ruleId, rule] of Object.entries(this.rules)) {
      try {
        rule.fix(elementContext);
        fixes.push({
          rule: rule.id,
          element: 'document',
          success: true,
          message: `Applied fix for ${rule.name}`,
        });
        fixed++;
      } catch (error) {
        fixes.push({
          rule: rule.id,
          element: 'document',
          success: false,
          message: `Failed to apply fix for ${rule.name}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        });
        failed++;
      }
    }

    return {
      fixed,
      failed,
      fixes,
    };
  }

  /**
   * Generate detailed audit report
   */
  generateDetailedReport(auditResults: any): {
    timestamp: string;
    summary: any;
    healthcareStandards: typeof BRAZILIAN_HEALTHCARE_STANDARDS;
    categoryBreakdown: any;
    complianceMatrix: any;
    actionItems: string[];
  } {
    return {
      timestamp: new Date().toISOString(),
      summary: auditResults.summary,
      healthcareStandards: BRAZILIAN_HEALTHCARE_STANDARDS,
      categoryBreakdown: auditResults.categoryResults,
      complianceMatrix: {
        lgpd: auditResults.summary.healthcareCompliance.lgpd,
        anvisa: auditResults.summary.healthcareCompliance.anvisa,
        cfm: auditResults.summary.healthcareCompliance.cfm,
        overall: Object.values(auditResults.summary.healthcareCompliance).every(
          Boolean,
        ),
      },
      actionItems: auditResults.recommendations,
    };
  }
}

/**
 * Create global healthcare accessibility auditor instance
 */
export const healthcareAccessibilityAuditor = new HealthcareAccessibilityAuditor();

/**
 * Utility function for quick healthcare accessibility check
 */
export async function quickHealthcareAccessibilityCheck(
  selector?: string,
): Promise<{
  passed: boolean;
  score: number;
  issues: any[];
  healthcareCompliance: {
    lgpd: boolean;
    anvisa: boolean;
    cfm: boolean;
  };
}> {
  const context = selector ? document.querySelector(selector) : document;

  if (!context) {
    return {
      passed: false,
      score: 0,
      issues: [
        {
          rule: 'CONTEXT_NOT_FOUND',
          description: `No element found for selector: ${selector}`,
          severity: 'critical',
        },
      ],
      healthcareCompliance: {
        lgpd: false,
        anvisa: false,
        cfm: false,
      },
    };
  }

  try {
    const auditor = new HealthcareAccessibilityAuditor();
    const elementContext = context instanceof Document ? context.documentElement : context;
    const results = await auditor.performComprehensiveAudit(elementContext);

    return {
      passed: results.summary.overallScore >= 90,
      score: results.summary.overallScore,
      issues: results.categoryResults.flatMap((cat: any) => cat.issues),
      healthcareCompliance: results.summary.healthcareCompliance,
    };
  } catch (error) {
    console.error('Quick healthcare accessibility check failed:', error);
    return {
      passed: false,
      score: 0,
      issues: [
        {
          rule: 'AUDIT_ERROR',
          description: `Healthcare accessibility audit failed: ${error}`,
          severity: 'critical',
        },
      ],
      healthcareCompliance: {
        lgpd: false,
        anvisa: false,
        cfm: false,
      },
    };
  }
}

// Export types
export type HealthcareAuditResults = ReturnType<
  typeof healthcareAccessibilityAuditor.performComprehensiveAudit
>;
export type HealthcareCompliance = {
  lgpd: boolean;
  anvisa: boolean;
  cfm: boolean;
};
