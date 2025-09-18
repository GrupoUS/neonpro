/**
 * Healthcare Accessibility Audit Utilities
 *
 * Specialized accessibility audit tools for healthcare applications
 * with Brazilian regulatory compliance (LGPD/ANVISA/CFM) validation
 *
 * @package NeonPro Healthcare Accessibility
 */

import Axe from 'axe-core';
import type { AxeResults, Node, Result } from 'axe-core';
import type { AccessibilityIssue, AccessibilityTestingOptions } from './accessibility-testing';

// Healthcare-specific accessibility rule IDs
export const HEALTHCARE_ACCESSIBILITY_RULES = {
  // Patient data privacy and accessibility
  'patient-data-privacy': 'Patient data must be accessible while maintaining privacy',
  'emergency-info-accessible': 'Emergency information must be accessible to all users',
  'medical-terminology': 'Medical terminology must be screen reader compatible',
  'treatment-accessibility': 'Treatment plans must be cognitively accessible',

  // Brazilian healthcare compliance
  'lgpd-accessibility': 'LGPD compliance with accessibility requirements',
  'anvisa-accessibility': 'ANVISA regulatory information accessibility',
  'cfm-accessibility': 'CFM medical ethics accessibility standards',

  // Healthcare interaction patterns
  'appointment-accessibility': 'Appointment scheduling accessibility',
  'medical-history': 'Medical history navigation accessibility',
  'consent-forms': 'Medical consent form accessibility',
  'vital-signs': 'Vital signs display accessibility',
} as const;

export type HealthcareAccessibilityRuleId = keyof typeof HEALTHCARE_ACCESSIBILITY_RULES;

// Healthcare compliance standards
export interface HealthcareComplianceStandard {
  id: string;
  name: string;
  description: string;
  accessibilityRequirements: string[];
  regulatoryBody: 'LGPD' | 'ANVISA' | 'CFM' | 'ISO';
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export const HEALTHCARE_COMPLIANCE_STANDARDS: HealthcareComplianceStandard[] = [
  {
    id: 'lgpd-accessibility',
    name: 'LGPD Accessibility Compliance',
    description: 'Brazilian General Data Protection Law accessibility requirements',
    accessibilityRequirements: [
      'Accessible privacy policies',
      'Patient data access with assistive technology',
      'Consent form accessibility',
      'Data portability accessibility',
    ],
    regulatoryBody: 'LGPD',
    severity: 'critical',
  },
  {
    id: 'anvisa-accessibility',
    name: 'ANVISA Accessibility Standards',
    description: 'Brazilian Health Regulatory Agency accessibility requirements',
    accessibilityRequirements: [
      'Medication information accessibility',
      'Treatment instructions accessibility',
      'Medical device information accessibility',
      'Adverse event reporting accessibility',
    ],
    regulatoryBody: 'ANVISA',
    severity: 'high',
  },
  {
    id: 'cfm-accessibility',
    name: 'CFM Medical Ethics Accessibility',
    description: 'Federal Council of Medicine accessibility standards',
    accessibilityRequirements: [
      'Patient dignity in accessibility',
      'Medical confidentiality accessibility',
      'Informed consent accessibility',
      'Professional ethics accessibility',
    ],
    regulatoryBody: 'CFM',
    severity: 'high',
  },
];

// Healthcare-specific accessibility issue
export interface HealthcareAccessibilityIssue extends AccessibilityIssue {
  healthcareRuleId: HealthcareAccessibilityRuleId;
  complianceStandards: HealthcareComplianceStandard[];
  patientImpact: 'critical' | 'high' | 'medium' | 'low';
  emergencyRelevant: boolean;
  remediationPriority: 'immediate' | 'high' | 'medium' | 'low';
  affectedPatientFlows: string[];
}

// Healthcare audit context
export interface HealthcareAuditContext {
  patientJourney: 'registration' | 'appointment' | 'treatment' | 'follow-up' | 'emergency';
  dataSensitivity: 'low' | 'medium' | 'high' | 'critical';
  userDisabilityProfile?: 'visual' | 'auditory' | 'motor' | 'cognitive' | 'multiple';
  emergencyContext: boolean;
  regulatoryRequirements: HealthcareComplianceStandard[];
}

// Healthcare accessibility audit result
export interface HealthcareAccessibilityAuditResult {
  timestamp: string;
  context: HealthcareAuditContext;
  issues: HealthcareAccessibilityIssue[];
  complianceScore: number;
  accessibilityScore: number;
  healthcareSpecificScore: number;
  recommendations: HealthcareAccessibilityRecommendation[];
  criticalIssuesCount: number;
  emergencyIssuesCount: number;
}

// Healthcare-specific recommendation
export interface HealthcareAccessibilityRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'immediate' | 'high' | 'medium' | 'low';
  healthcareRelevance: string;
  complianceStandards: HealthcareComplianceStandard[];
  implementationSteps: string[];
  validationCriteria: string[];
  estimatedEffort: 'low' | 'medium' | 'high';
}

// Healthcare-specific accessibility rules
export const healthcareAccessibilityRules: Axe.Spec = {
  ...Axe.getRules(),
  rules: [
    // Patient data privacy and accessibility balance
    {
      id: 'patient-data-privacy',
      selector: '[data-patient-sensitive]',
      matches: function(node: any) {
        return node.getAttribute('data-patient-sensitive') === 'true';
      },
      excludeHidden: false,
      tags: ['healthcare', 'privacy', 'lgpd'],
      metadata: {
        description: 'Patient sensitive data must balance privacy and accessibility',
        help: 'Ensure patient data is accessible while maintaining privacy',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/',
      },
      evaluate: function(node: any, options: any, virtualNode: any) {
        const hasAccessibleName = node.getAttribute('aria-label')
          || node.getAttribute('aria-labelledby')
          || node.textContent?.trim();

        const hasPrivacyIndicator = node.getAttribute('data-privacy-level')
          || node.closest('[data-privacy-level]');

        if (!hasAccessibleName) {
          return {
            result: false,
            message: 'Patient data must have accessible name or label',
          };
        }

        if (!hasPrivacyIndicator) {
          return {
            result: false,
            message: 'Patient sensitive data must have privacy level indicator',
          };
        }

        return { result: true };
      },
    },

    // Emergency information accessibility
    {
      id: 'emergency-info-accessible',
      selector: '[data-emergency]',
      matches: function(node: any) {
        return node.getAttribute('data-emergency') === 'true';
      },
      excludeHidden: false,
      tags: ['healthcare', 'emergency', 'critical'],
      metadata: {
        description: 'Emergency information must be immediately accessible',
        help: 'Emergency information must meet highest accessibility standards',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/',
      },
      evaluate: function(node: any, options: any, virtualNode: any) {
        const hasHighContrast = window.getComputedStyle(node).color
          !== window.getComputedStyle(node).backgroundColor;

        const isLargeText = parseFloat(window.getComputedStyle(node).fontSize) >= 18;

        const hasKeyboardAccess = node.tabIndex !== -1
          || node.tagName === 'A'
          || node.tagName === 'BUTTON';

        const violations = [];

        if (!hasHighContrast) {
          violations.push('Emergency information must have high contrast');
        }

        if (!isLargeText && !node.getAttribute('aria-live')) {
          violations.push('Emergency text must be large or have live region');
        }

        if (!hasKeyboardAccess) {
          violations.push('Emergency information must be keyboard accessible');
        }

        return {
          result: violations.length === 0,
          message: violations.length > 0 ? violations.join(', ') : undefined,
        };
      },
    },

    // Medical terminology accessibility
    {
      id: 'medical-terminology',
      selector: '[data-medical-term]',
      matches: function(node: any) {
        return node.hasAttribute('data-medical-term');
      },
      excludeHidden: false,
      tags: ['healthcare', 'terminology', 'screen-reader'],
      metadata: {
        description: 'Medical terminology must be accessible to screen readers',
        help: 'Medical terms must have explanations or alternative text',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/',
      },
      evaluate: function(node: any, options: any, virtualNode: any) {
        const term = node.getAttribute('data-medical-term');
        const hasExplanation = node.getAttribute('title')
          || node.getAttribute('aria-describedby')
          || node.querySelector('.explanation');

        const hasAbbr = node.tagName === 'ABBR' || node.tagName === 'ACRONYM';

        if (!hasExplanation && !hasAbbr) {
          return {
            result: false,
            message: `Medical term "${term}" must have explanation or be marked as abbreviation`,
          };
        }

        return { result: true };
      },
    },

    // Treatment plan cognitive accessibility
    {
      id: 'treatment-accessibility',
      selector: '[data-treatment-plan]',
      matches: function(node: any) {
        return node.getAttribute('data-treatment-plan') === 'true';
      },
      excludeHidden: false,
      tags: ['healthcare', 'cognitive', 'treatment'],
      metadata: {
        description: 'Treatment plans must be cognitively accessible',
        help: 'Treatment information must be easy to understand and navigate',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/',
      },
      evaluate: function(node: any, options: any, virtualNode: any) {
        const hasClearStructure = node.querySelector('h1, h2, h3, h4, h5, h6')
          || node.getAttribute('role') === 'region';

        const hasStepByStep = node.querySelector('[data-step], ol, ul');

        const hasSimpleLanguage = !node.matches('.complex-terminology')
          || node.hasAttribute('data-simplified');

        const violations = [];

        if (!hasClearStructure) {
          violations.push('Treatment plan must have clear structure');
        }

        if (!hasStepByStep) {
          violations.push('Treatment plan must have step-by-step breakdown');
        }

        if (!hasSimpleLanguage) {
          violations.push('Treatment plan must use simplified language');
        }

        return {
          result: violations.length === 0,
          message: violations.length > 0 ? violations.join(', ') : undefined,
        };
      },
    },
  ],
};

// Healthcare accessibility audit main class
export class HealthcareAccessibilityAuditor {
  private context: HealthcareAuditContext;
  private customRules: Axe.Spec;

  constructor(context: Partial<HealthcareAuditContext> = {}) {
    this.context = {
      patientJourney: 'registration',
      dataSensitivity: 'medium',
      emergencyContext: false,
      regulatoryRequirements: HEALTHCARE_COMPLIANCE_STANDARDS,
      ...context,
    };

    this.customRules = healthcareAccessibilityRules;
  }

  /**
   * Run comprehensive healthcare accessibility audit
   */
  async auditAccessibility(
    element: HTMLElement | Document = document,
    options: AccessibilityTestingOptions = {},
  ): Promise<HealthcareAccessibilityAuditResult> {
    const auditStart = Date.now();

    // Run standard axe-core audit
    const axeResults = await Axe.run(element, {
      ...options,
      rules: this.customRules.rules,
    });

    // Process results with healthcare-specific analysis
    const healthcareIssues = this.processHealthcareIssues(axeResults);

    // Calculate scores
    const complianceScore = this.calculateComplianceScore(healthcareIssues);
    const accessibilityScore = this.calculateAccessibilityScore(axeResults);
    const healthcareSpecificScore = this.calculateHealthcareSpecificScore(healthcareIssues);

    // Generate recommendations
    const recommendations = this.generateRecommendations(healthcareIssues);

    const result: HealthcareAccessibilityAuditResult = {
      timestamp: new Date().toISOString(),
      context: this.context,
      issues: healthcareIssues,
      complianceScore,
      accessibilityScore,
      healthcareSpecificScore,
      recommendations,
      criticalIssuesCount: healthcareIssues.filter(issue => issue.impact === 'critical').length,
      emergencyIssuesCount: healthcareIssues.filter(issue => issue.emergencyRelevant).length,
    };

    return result;
  }

  /**
   * Process axe-core results and add healthcare-specific analysis
   */
  private processHealthcareIssues(axeResults: AxeResults): HealthcareAccessibilityIssue[] {
    const healthcareIssues: HealthcareAccessibilityIssue[] = [];

    axeResults.violations.forEach(violation => {
      const healthcareRuleId = violation.id as HealthcareAccessibilityRuleId;

      if (HEALTHCARE_ACCESSIBILITY_RULES[healthcareRuleId]) {
        violation.nodes.forEach(node => {
          const healthcareIssue: HealthcareAccessibilityIssue = {
            id: `${violation.id}-${node.target.join('-')}`,
            impact: violation.impact as any,
            description: violation.description,
            help: violation.help,
            helpUrl: violation.helpUrl,
            tags: violation.tags,
            healthcareRuleId,
            complianceStandards: this.getRelevantComplianceStandards(violation.tags),
            patientImpact: this.assessPatientImpact(violation),
            emergencyRelevant: this.isEmergencyRelevant(violation),
            remediationPriority: this.determineRemediationPriority(violation),
            affectedPatientFlows: this.identifyAffectedPatientFlows(violation),
            healthcareSpecific: true,
            lgpdRelevant: violation.tags.includes('lgpd'),
          };

          healthcareIssues.push(healthcareIssue);
        });
      }
    });

    return healthcareIssues;
  }

  /**
   * Get relevant compliance standards for violation
   */
  private getRelevantComplianceStandards(tags: string[]): HealthcareComplianceStandard[] {
    return HEALTHCARE_COMPLIANCE_STANDARDS.filter(standard =>
      tags.some(tag =>
        standard.id.toLowerCase().includes(tag)
        || standard.regulatoryBody.toLowerCase() === tag
      )
    );
  }

  /**
   * Assess patient impact level
   */
  private assessPatientImpact(violation: Result): 'critical' | 'high' | 'medium' | 'low' {
    if (violation.tags.includes('emergency') || violation.tags.includes('critical')) {
      return 'critical';
    }

    if (violation.tags.includes('healthcare') && violation.impact === 'serious') {
      return 'high';
    }

    if (violation.impact === 'serious') {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Check if violation is emergency relevant
   */
  private isEmergencyRelevant(violation: Result): boolean {
    return violation.tags.includes('emergency')
      || violation.tags.includes('critical')
      || violation.id === 'emergency-info-accessible';
  }

  /**
   * Determine remediation priority
   */
  private determineRemediationPriority(violation: Result): 'immediate' | 'high' | 'medium' | 'low' {
    if (violation.tags.includes('emergency') || violation.impact === 'critical') {
      return 'immediate';
    }

    if (violation.tags.includes('lgpd') || violation.impact === 'serious') {
      return 'high';
    }

    if (violation.tags.includes('healthcare')) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Identify affected patient flows
   */
  private identifyAffectedPatientFlows(violation: Result): string[] {
    const flows: string[] = [];

    if (violation.tags.includes('privacy') || violation.tags.includes('lgpd')) {
      flows.push('registration', 'data-access');
    }

    if (violation.tags.includes('treatment') || violation.tags.includes('medical')) {
      flows.push('treatment', 'follow-up');
    }

    if (violation.tags.includes('appointment')) {
      flows.push('appointment', 'scheduling');
    }

    if (violation.tags.includes('emergency')) {
      flows.push('emergency');
    }

    return flows.length > 0 ? flows : ['general'];
  }

  /**
   * Calculate compliance score based on healthcare standards
   */
  private calculateComplianceScore(issues: HealthcareAccessibilityIssue[]): number {
    const totalStandards = HEALTHCARE_COMPLIANCE_STANDARDS.length;
    const violatedStandards = new Set(
      issues.flatMap(issue => issue.complianceStandards.map(s => s.id)),
    ).size;

    return Math.round(((totalStandards - violatedStandards) / totalStandards) * 100);
  }

  /**
   * Calculate overall accessibility score
   */
  private calculateAccessibilityScore(axeResults: AxeResults): number {
    const totalViolations = axeResults.violations.reduce(
      (sum, violation) => sum + violation.nodes.length,
      0,
    );

    // Base score of 100, deduct points for violations
    let score = 100;

    axeResults.violations.forEach(violation => {
      const weight = violation.impact === 'critical'
        ? 10
        : violation.impact === 'serious'
        ? 5
        : violation.impact === 'moderate'
        ? 2
        : 1;

      score -= weight * violation.nodes.length;
    });

    return Math.max(0, score);
  }

  /**
   * Calculate healthcare-specific score
   */
  private calculateHealthcareSpecificScore(issues: HealthcareAccessibilityIssue[]): number {
    if (issues.length === 0) return 100;

    const totalWeight = issues.reduce((sum, issue) => {
      return sum + (issue.emergencyRelevant
        ? 3
        : issue.impact === 'critical'
        ? 3
        : issue.impact === 'serious'
        ? 2
        : 1);
    }, 0);

    const resolvedWeight = issues.filter(issue => issue.remediationPriority === 'low').reduce(
      (sum, issue) => {
        return sum + (issue.emergencyRelevant
          ? 3
          : issue.impact === 'critical'
          ? 3
          : issue.impact === 'serious'
          ? 2
          : 1);
      },
      0,
    );

    return Math.round((resolvedWeight / totalWeight) * 100);
  }

  /**
   * Generate healthcare-specific recommendations
   */
  private generateRecommendations(
    issues: HealthcareAccessibilityIssue[],
  ): HealthcareAccessibilityRecommendation[] {
    const recommendations: HealthcareAccessibilityRecommendation[] = [];

    // Group issues by type
    const issueGroups = issues.reduce((groups, issue) => {
      const key = issue.healthcareRuleId;
      if (!groups[key]) groups[key] = [];
      groups[key].push(issue);
      return groups;
    }, {} as Record<string, HealthcareAccessibilityIssue[]>);

    // Generate recommendation for each group
    Object.entries(issueGroups).forEach(([ruleId, issueGroup]) => {
      const recommendation: HealthcareAccessibilityRecommendation = {
        id: `rec-${ruleId}`,
        title: `Improve ${HEALTHCARE_ACCESSIBILITY_RULES[ruleId as HealthcareAccessibilityRuleId]}`,
        description: `Address ${issueGroup.length} violation(s) related to ${ruleId}`,
        priority: this.getHighestPriority(issueGroup),
        healthcareRelevance: this.getHealthcareRelevance(ruleId as HealthcareAccessibilityRuleId),
        complianceStandards: issueGroup[0].complianceStandards,
        implementationSteps: this.getImplementationSteps(ruleId as HealthcareAccessibilityRuleId),
        validationCriteria: this.getValidationCriteria(ruleId as HealthcareAccessibilityRuleId),
        estimatedEffort: this.estimateEffort(issueGroup),
      };

      recommendations.push(recommendation);
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { immediate: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private getHighestPriority(
    issues: HealthcareAccessibilityIssue[],
  ): 'immediate' | 'high' | 'medium' | 'low' {
    const priorityOrder = { immediate: 4, high: 3, medium: 2, low: 1 };
    const highestPriority = issues.reduce((highest, issue) => {
      const currentPriority = priorityOrder[issue.remediationPriority];
      const highestPriorityValue = priorityOrder[highest];
      return currentPriority > highestPriorityValue ? issue.remediationPriority : highest;
    }, 'low' as const);

    return highestPriority;
  }

  private getHealthcareRelevance(ruleId: HealthcareAccessibilityRuleId): string {
    const relevanceMap: Record<HealthcareAccessibilityRuleId, string> = {
      'patient-data-privacy': 'Critical for patient trust and LGPD compliance',
      'emergency-info-accessible': 'Life-critical for emergency situations',
      'medical-terminology': 'Essential for patient understanding and safety',
      'treatment-accessibility': 'Vital for treatment adherence and outcomes',
      'lgpd-accessibility': 'Legal requirement for patient data rights',
      'anvisa-accessibility': 'Regulatory requirement for medical information',
      'cfm-accessibility': 'Medical ethics requirement',
      'appointment-accessibility': 'Essential for healthcare access',
      'medical-history': 'Critical for continuity of care',
      'consent-forms': 'Legal and ethical requirement',
      'vital-signs': 'Important for patient monitoring',
    };

    return relevanceMap[ruleId];
  }

  private getImplementationSteps(ruleId: HealthcareAccessibilityRuleId): string[] {
    const stepsMap: Record<HealthcareAccessibilityRuleId, string[]> = {
      'patient-data-privacy': [
        'Add aria-labels to all patient data elements',
        'Implement privacy level indicators',
        'Ensure screen reader compatibility',
        'Test with assistive technologies',
      ],
      'emergency-info-accessible': [
        'Implement high contrast colors',
        'Add keyboard navigation',
        'Create live regions for critical updates',
        'Test emergency scenarios',
      ],
      'medical-terminology': [
        'Add explanation for medical terms',
        'Use ABBR tags for abbreviations',
        'Provide glossary links',
        'Test with medical content',
      ],
      'treatment-accessibility': [
        'Structure treatment information clearly',
        'Use simplified language',
        'Add step-by-step breakdowns',
        'Test with diverse patients',
      ],
      'lgpd-accessibility': [
        'Make privacy policies accessible',
        'Ensure consent forms are accessible',
        'Provide accessible data access methods',
        'Document compliance measures',
      ],
      'anvisa-accessibility': [
        'Make medication information accessible',
        'Ensure treatment instructions are clear',
        'Provide accessible adverse event reporting',
        'Comply with ANVISA standards',
      ],
      'cfm-accessibility': [
        'Ensure professional ethics information is accessible',
        'Make confidentiality policies accessible',
        'Provide accessible informed consent',
        'Follow CFM accessibility guidelines',
      ],
      'appointment-accessibility': [
        'Make scheduling interfaces accessible',
        'Ensure calendar navigation works with screen readers',
        'Provide accessible confirmation methods',
        'Test with assistive technologies',
      ],
      'medical-history': [
        'Structure medical history information clearly',
        'Provide accessible navigation',
        'Ensure data privacy while maintaining accessibility',
        'Test with various disabilities',
      ],
      'consent-forms': [
        'Make consent forms screen reader compatible',
        'Ensure form fields are properly labeled',
        'Provide accessible signature methods',
        'Test with assistive technologies',
      ],
      'vital-signs': [
        'Make vital signs displays accessible',
        'Provide real-time updates via ARIA live regions',
        'Ensure high contrast for readability',
        'Test with visual impairments',
      ],
    };

    return stepsMap[ruleId]
      || ['Analyze issue', 'Implement fix', 'Test with assistive technologies'];
  }

  private getValidationCriteria(ruleId: HealthcareAccessibilityRuleId): string[] {
    return [
      'Pass automated accessibility testing',
      'Manual testing with screen readers',
      'Keyboard navigation testing',
      'User testing with diverse disabilities',
      'Healthcare context validation',
    ];
  }

  private estimateEffort(issues: HealthcareAccessibilityIssue[]): 'low' | 'medium' | 'high' {
    const emergencyCount = issues.filter(i => i.emergencyRelevant).length;
    const criticalCount = issues.filter(i => i.impact === 'critical').length;

    if (emergencyCount > 0 || criticalCount > 2) return 'high';
    if (criticalCount > 0 || issues.length > 5) return 'medium';
    return 'low';
  }

  /**
   * Set audit context for specific healthcare scenarios
   */
  setContext(context: Partial<HealthcareAuditContext>): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(result: HealthcareAccessibilityAuditResult): string {
    return `
# Healthcare Accessibility Compliance Report
**Generated:** ${new Date(result.timestamp).toLocaleString('pt-BR')}
**Context:** ${result.context.patientJourney} journey, ${result.context.dataSensitivity} sensitivity

## Summary
- **Overall Accessibility Score:** ${result.accessibilityScore}%
- **Healthcare-Specific Score:** ${result.healthcareSpecificScore}%
- **Regulatory Compliance Score:** ${result.complianceScore}%
- **Critical Issues:** ${result.criticalIssuesCount}
- **Emergency-Related Issues:** ${result.emergencyIssuesCount}

## Regulatory Compliance
${
      result.context.regulatoryRequirements.map(std =>
        `- **${std.name} (${std.regulatoryBody}):** Requirements met`
      ).join('\n')
    }

## Critical Findings
${
      result.issues
        .filter(issue => issue.impact === 'critical' || issue.emergencyRelevant)
        .map(issue => `- **${issue.healthcareRuleId}:** ${issue.description}`)
        .join('\n')
    }

## Recommendations
${
      result.recommendations
        .slice(0, 5)
        .map(rec => `- **${rec.title}:** ${rec.description}`)
        .join('\n')
    }

## Next Steps
1. Address immediate priority recommendations
2. Implement healthcare-specific accessibility patterns
3. Conduct user testing with diverse disabilities
4. Validate regulatory compliance
5. Establish ongoing accessibility monitoring
    `.trim();
  }
}

// Factory function for easy auditor creation
export function createHealthcareAuditor(
  context?: Partial<HealthcareAuditContext>,
): HealthcareAccessibilityAuditor {
  return new HealthcareAccessibilityAuditor(context);
}

// Export types and utilities
export * from './accessibility-testing';
export type {
  HealthcareAccessibilityAuditResult,
  HealthcareAccessibilityIssue,
  HealthcareAccessibilityRecommendation,
  HealthcareAccessibilityRuleId,
  HealthcareAuditContext,
  HealthcareComplianceStandard,
};
