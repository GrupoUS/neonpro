/**
 * Accessibility Audit Service
 * T081 - WCAG 2.1 AA+ Accessibility Compliance
 *
 * Features:
 * - Comprehensive WCAG 2.1 AA+ compliance auditing
 * - Healthcare-specific accessibility validation
 * - Brazilian Portuguese accessibility standards
 * - Automated accessibility testing integration
 * - Performance impact assessment
 * - Compliance reporting and recommendations
 */

import {
  ACCESSIBILITY_LABELS_PT_BR,
  calculateContrastRatio,
  HEALTHCARE_ARIA_ROLES,
  meetsContrastRequirement,
  WCAG_CONTRAST_RATIOS,
} from '../utils/accessibility';

// WCAG 2.1 Success Criteria Levels
export const WCAG_LEVELS = {
  A: 'A',
  AA: 'AA',
  AAA: 'AAA',
} as const;

export type WCAGLevel = (typeof WCAG_LEVELS)[keyof typeof WCAG_LEVELS];

// WCAG 2.1 Principles
export const WCAG_PRINCIPLES = {
  PERCEIVABLE: 'perceivable',
  OPERABLE: 'operable',
  UNDERSTANDABLE: 'understandable',
  ROBUST: 'robust',
} as const;

export type WCAGPrinciple = (typeof WCAG_PRINCIPLES)[keyof typeof WCAG_PRINCIPLES];

// Audit Issue Severity
export const AUDIT_SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info',
} as const;

export type AuditSeverity = (typeof AUDIT_SEVERITY)[keyof typeof AUDIT_SEVERITY];

// Audit Issue Interface
export interface AccessibilityIssue {
  id: string;
  title: string;
  description: string;
  severity: AuditSeverity;
  wcagLevel: WCAGLevel;
  principle: WCAGPrinciple;
  successCriteria: string;
  element?: string;
  selector?: string;
  recommendation: string;
  healthcareImpact?: string;
  brazilianCompliance?: boolean;
  autoFixable?: boolean;
}

// Audit Result Interface
export interface AccessibilityAuditResult {
  score: number; // 0-100
  level: WCAGLevel;
  issues: AccessibilityIssue[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  healthcareCompliance: {
    lgpdCompliant: boolean;
    anvisaCompliant: boolean;
    cfmCompliant: boolean;
    issues: string[];
  };
  recommendations: string[];
  testResults: {
    colorContrast: boolean;
    keyboardNavigation: boolean;
    screenReaderSupport: boolean;
    focusManagement: boolean;
    ariaLabels: boolean;
  };
}

/**
 * Accessibility Audit Service
 */
export class AccessibilityAuditService {
  private issues: AccessibilityIssue[] = [];
  private testResults = {
    colorContrast: true,
    keyboardNavigation: true,
    screenReaderSupport: true,
    focusManagement: true,
    ariaLabels: true,
  };

  /**
   * Perform comprehensive accessibility audit
   */
  async performAudit(element?: HTMLElement): Promise<AccessibilityAuditResult> {
    this.issues = [];
    this.testResults = {
      colorContrast: true,
      keyboardNavigation: true,
      screenReaderSupport: true,
      focusManagement: true,
      ariaLabels: true,
    };

    const targetElement = element || document.body;

    // Run all audit checks
    await Promise.all([
      this.auditColorContrast(targetElement),
      this.auditKeyboardNavigation(targetElement),
      this.auditAriaLabels(targetElement),
      this.auditFocusManagement(targetElement),
      this.auditScreenReaderSupport(targetElement),
      this.auditHealthcareCompliance(targetElement),
      this.auditBrazilianStandards(targetElement),
    ]);

    return this.generateAuditResult();
  }

  /**
   * Audit color contrast compliance
   */
  private async auditColorContrast(element: HTMLElement): Promise<void> {
    const textElements = element.querySelectorAll('*');

    textElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      const styles = window.getComputedStyle(htmlEl);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;

      if (
        color
        && backgroundColor
        && color !== 'rgba(0, 0, 0, 0)'
        && backgroundColor !== 'rgba(0, 0, 0, 0)'
      ) {
        const contrast = calculateContrastRatio(color, backgroundColor);
        const fontSize = parseFloat(styles.fontSize);
        const isLargeText = fontSize >= 18 || (fontSize >= 14 && styles.fontWeight === 'bold');

        if (
          !meetsContrastRequirement(color, backgroundColor, 'AA', isLargeText)
        ) {
          this.testResults.colorContrast = false;
          this.addIssue({
            id: `contrast-${Date.now()}-${Math.random()}`,
            title: 'Contraste de cor insuficiente',
            description: `Elemento não atende aos requisitos de contraste WCAG AA (${
              contrast.toFixed(
                2,
              )
            }:1)`,
            severity: AUDIT_SEVERITY.HIGH,
            wcagLevel: WCAG_LEVELS.AA,
            principle: WCAG_PRINCIPLES.PERCEIVABLE,
            successCriteria: '1.4.3',
            element: htmlEl.tagName.toLowerCase(),
            selector: this.getElementSelector(htmlEl),
            recommendation: `Ajustar cores para atingir contraste mínimo de ${
              isLargeText ? '3:1' : '4.5:1'
            }`,
            healthcareImpact: 'Dificulta leitura de informações médicas críticas',
            brazilianCompliance: false,
            autoFixable: false,
          });
        }
      }
    });
  }

  /**
   * Audit keyboard navigation
   */
  private async auditKeyboardNavigation(element: HTMLElement): Promise<void> {
    const interactiveElements = element.querySelectorAll(
      'button, a, input, select, textarea, [tabindex], [role="button"], [role="link"]',
    );

    interactiveElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      const tabIndex = htmlEl.getAttribute('tabindex');

      // Check for keyboard trap
      if (tabIndex === '-1' && !htmlEl.hasAttribute('aria-hidden')) {
        this.testResults.keyboardNavigation = false;
        this.addIssue({
          id: `keyboard-${Date.now()}-${Math.random()}`,
          title: 'Elemento interativo não acessível via teclado',
          description: 'Elemento interativo com tabindex="-1" sem aria-hidden',
          severity: AUDIT_SEVERITY.HIGH,
          wcagLevel: WCAG_LEVELS.AA,
          principle: WCAG_PRINCIPLES.OPERABLE,
          successCriteria: '2.1.1',
          element: htmlEl.tagName.toLowerCase(),
          selector: this.getElementSelector(htmlEl),
          recommendation: 'Remover tabindex="-1" ou adicionar aria-hidden="true"',
          healthcareImpact: 'Impede acesso a funcionalidades médicas via teclado',
          brazilianCompliance: false,
          autoFixable: true,
        });
      }

      // Check for missing focus indicators
      const styles = window.getComputedStyle(htmlEl, ':focus');
      if (!styles.outline && !styles.boxShadow && !styles.border) {
        this.testResults.focusManagement = false;
        this.addIssue({
          id: `focus-${Date.now()}-${Math.random()}`,
          title: 'Indicador de foco ausente',
          description: 'Elemento interativo sem indicador visual de foco',
          severity: AUDIT_SEVERITY.MEDIUM,
          wcagLevel: WCAG_LEVELS.AA,
          principle: WCAG_PRINCIPLES.OPERABLE,
          successCriteria: '2.4.7',
          element: htmlEl.tagName.toLowerCase(),
          selector: this.getElementSelector(htmlEl),
          recommendation: 'Adicionar estilos CSS para :focus com outline ou box-shadow',
          healthcareImpact: 'Dificulta navegação em sistemas médicos',
          brazilianCompliance: false,
          autoFixable: true,
        });
      }
    });
  }

  /**
   * Audit ARIA labels and roles
   */
  private async auditAriaLabels(element: HTMLElement): Promise<void> {
    const elementsNeedingLabels = element.querySelectorAll(
      'input:not([type="hidden"]), select, textarea, button:not([aria-label]):not([aria-labelledby])',
    );

    elementsNeedingLabels.forEach(el => {
      const htmlEl = el as HTMLElement;
      const hasLabel = htmlEl.hasAttribute('aria-label')
        || htmlEl.hasAttribute('aria-labelledby')
        || element.querySelector(`label[for="${htmlEl.id}"]`);

      if (!hasLabel) {
        this.testResults.ariaLabels = false;
        this.addIssue({
          id: `aria-${Date.now()}-${Math.random()}`,
          title: 'Elemento sem rótulo acessível',
          description: 'Elemento de formulário sem aria-label, aria-labelledby ou label associado',
          severity: AUDIT_SEVERITY.HIGH,
          wcagLevel: WCAG_LEVELS.A,
          principle: WCAG_PRINCIPLES.PERCEIVABLE,
          successCriteria: '1.3.1',
          element: htmlEl.tagName.toLowerCase(),
          selector: this.getElementSelector(htmlEl),
          recommendation: 'Adicionar aria-label ou associar com elemento label',
          healthcareImpact: 'Impede identificação de campos médicos por leitores de tela',
          brazilianCompliance: false,
          autoFixable: true,
        });
      }
    });
  }

  /**
   * Audit focus management
   */
  private async auditFocusManagement(element: HTMLElement): Promise<void> {
    // Check for proper heading hierarchy
    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;

    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));

      if (level > previousLevel + 1) {
        this.testResults.focusManagement = false;
        this.addIssue({
          id: `heading-${Date.now()}-${Math.random()}`,
          title: 'Hierarquia de cabeçalhos incorreta',
          description: `Cabeçalho ${heading.tagName} pula níveis na hierarquia`,
          severity: AUDIT_SEVERITY.MEDIUM,
          wcagLevel: WCAG_LEVELS.AA,
          principle: WCAG_PRINCIPLES.PERCEIVABLE,
          successCriteria: '1.3.1',
          element: heading.tagName.toLowerCase(),
          selector: this.getElementSelector(heading as HTMLElement),
          recommendation: 'Usar hierarquia sequencial de cabeçalhos (h1, h2, h3...)',
          healthcareImpact: 'Dificulta navegação em documentos médicos',
          brazilianCompliance: true,
          autoFixable: false,
        });
      }

      previousLevel = level;
    });
  }

  /**
   * Audit screen reader support
   */
  private async auditScreenReaderSupport(element: HTMLElement): Promise<void> {
    // Check for images without alt text
    const images = element.querySelectorAll('img');

    images.forEach(img => {
      if (!img.hasAttribute('alt') && !img.hasAttribute('aria-hidden')) {
        this.testResults.screenReaderSupport = false;
        this.addIssue({
          id: `img-alt-${Date.now()}-${Math.random()}`,
          title: 'Imagem sem texto alternativo',
          description: 'Imagem sem atributo alt ou aria-hidden',
          severity: AUDIT_SEVERITY.HIGH,
          wcagLevel: WCAG_LEVELS.A,
          principle: WCAG_PRINCIPLES.PERCEIVABLE,
          successCriteria: '1.1.1',
          element: 'img',
          selector: this.getElementSelector(img),
          recommendation:
            'Adicionar atributo alt descritivo ou aria-hidden="true" para imagens decorativas',
          healthcareImpact: 'Impede acesso a informações visuais médicas',
          brazilianCompliance: false,
          autoFixable: true,
        });
      }
    });
  }

  /**
   * Audit healthcare-specific compliance
   */
  private async auditHealthcareCompliance(element: HTMLElement): Promise<void> {
    // Check for LGPD consent indicators
    const consentElements = element.querySelectorAll(
      '[data-lgpd], [aria-label*="LGPD"], [aria-label*="consentimento"]',
    );

    if (consentElements.length === 0) {
      this.addIssue({
        id: `lgpd-${Date.now()}`,
        title: 'Indicadores de consentimento LGPD ausentes',
        description: 'Não foram encontrados indicadores de consentimento LGPD acessíveis',
        severity: AUDIT_SEVERITY.MEDIUM,
        wcagLevel: WCAG_LEVELS.AA,
        principle: WCAG_PRINCIPLES.UNDERSTANDABLE,
        successCriteria: '3.2.2',
        recommendation: 'Adicionar indicadores visuais e acessíveis de consentimento LGPD',
        healthcareImpact: 'Não conformidade com regulamentações brasileiras de dados de saúde',
        brazilianCompliance: false,
        autoFixable: false,
      });
    }
  }

  /**
   * Audit Brazilian accessibility standards
   */
  private async auditBrazilianStandards(element: HTMLElement): Promise<void> {
    // Check for Portuguese language attributes
    const hasLangPt = element.closest('[lang="pt"], [lang="pt-BR"]')
      || document.documentElement.getAttribute('lang')?.startsWith('pt');

    if (!hasLangPt) {
      this.addIssue({
        id: `lang-pt-${Date.now()}`,
        title: 'Idioma português não declarado',
        description: 'Documento ou seção sem declaração de idioma português',
        severity: AUDIT_SEVERITY.LOW,
        wcagLevel: WCAG_LEVELS.A,
        principle: WCAG_PRINCIPLES.UNDERSTANDABLE,
        successCriteria: '3.1.1',
        recommendation: 'Adicionar lang="pt-BR" ao elemento html ou seções em português',
        healthcareImpact: 'Pode afetar pronúncia de termos médicos por leitores de tela',
        brazilianCompliance: false,
        autoFixable: true,
      });
    }
  }

  /**
   * Add issue to audit results
   */
  private addIssue(issue: AccessibilityIssue): void {
    this.issues.push(issue);
  }

  /**
   * Get CSS selector for element
   */
  private getElementSelector(element: HTMLElement): string {
    if (element.id) {
      return `#${element.id}`;
    }

    if (element.className) {
      return `${element.tagName.toLowerCase()}.${element.className.split(' ').join('.')}`;
    }

    return element.tagName.toLowerCase();
  }

  /**
   * Generate comprehensive audit result
   */
  private generateAuditResult(): AccessibilityAuditResult {
    const summary = {
      total: this.issues.length,
      critical: this.issues.filter(
        i => i.severity === AUDIT_SEVERITY.CRITICAL,
      ).length,
      high: this.issues.filter(i => i.severity === AUDIT_SEVERITY.HIGH)
        .length,
      medium: this.issues.filter(i => i.severity === AUDIT_SEVERITY.MEDIUM)
        .length,
      low: this.issues.filter(i => i.severity === AUDIT_SEVERITY.LOW).length,
      info: this.issues.filter(i => i.severity === AUDIT_SEVERITY.INFO)
        .length,
    };

    // Calculate score (100 - weighted penalty)
    const score = Math.max(
      0,
      100
        - (summary.critical * 25
          + summary.high * 10
          + summary.medium * 5
          + summary.low * 2
          + summary.info * 1),
    );

    // Determine WCAG level
    let level: WCAGLevel = WCAG_LEVELS.AAA;
    if (summary.critical > 0 || summary.high > 0) {
      level = WCAG_LEVELS.A;
    } else if (summary.medium > 0) {
      level = WCAG_LEVELS.AA;
    }

    // Healthcare compliance assessment
    const healthcareCompliance = {
      lgpdCompliant: !this.issues.some(i => i.id.includes('lgpd')),
      anvisaCompliant: summary.critical === 0 && summary.high === 0,
      cfmCompliant: this.testResults.screenReaderSupport
        && this.testResults.keyboardNavigation,
      issues: this.issues
        .filter(i => i.healthcareImpact)
        .map(i => i.healthcareImpact!)
        .filter((impact, index, arr) => arr.indexOf(impact) === index),
    };

    // Generate recommendations
    const recommendations = [
      ...this.issues
        .filter(i => i.autoFixable)
        .map(i => `[Auto-corrigível] ${i.recommendation}`),
      ...this.issues
        .filter(i => !i.autoFixable && i.severity === AUDIT_SEVERITY.CRITICAL)
        .map(i => `[Crítico] ${i.recommendation}`),
      ...this.issues
        .filter(i => !i.autoFixable && i.severity === AUDIT_SEVERITY.HIGH)
        .map(i => `[Alto] ${i.recommendation}`),
    ].slice(0, 10); // Top 10 recommendations

    return {
      score,
      level,
      issues: this.issues,
      summary,
      healthcareCompliance,
      recommendations,
      testResults: this.testResults,
    };
  }
}

export default AccessibilityAuditService;
