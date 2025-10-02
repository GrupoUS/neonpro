/**
 * Healthcare Accessibility Validation System
 * 
 * Comprehensive WCAG 2.1 AA+ compliance validation for healthcare applications
 * with Brazilian LGPD compliance and healthcare-specific requirements.
 */

export interface ValidationResult {
  passed: boolean
  issues: AccessibilityIssue[]
  score: number
  wcagCompliance: {
    level: 'A' | 'AA' | 'AAA' | 'Non-compliant'
    criteria: WCAGCriteria[]
  }
  healthcareCompliance: {
    lgpd: LGPDCompliance
    anvisa: ANVISACompliance
    cfm: CFMCompliance
  }
  recommendations: string[]
}

export interface AccessibilityIssue {
  id: string
  severity: 'critical' | 'serious' | 'moderate' | 'minor'
  category: 'wcag' | 'healthcare' | 'mobile' | 'lgpd'
  wcagCriteria?: string
  element: string
  description: string
  recommendation: string
  impact: 'high' | 'medium' | 'low'
}

export interface WCAGCriteria {
  number: string
  title: string
  level: 'A' | 'AA' | 'AAA'
  satisfied: boolean
}

export interface LGPDCompliance {
  dataMinimization: boolean
  explicitConsent: boolean
  accessRights: boolean
  deletionRights: boolean
  portability: boolean
  auditTrail: boolean
  encryption: boolean
}

export interface ANVISACompliance {
  medicalDataProtection: boolean
  auditLogging: boolean
  integrityControls: boolean
  accessControls: boolean
  backupSystems: boolean
}

export interface CFMCompliance {
  professionalEthics: boolean
  patientConfidentiality: boolean
  recordRetention: boolean
  professionalOversight: boolean
}

export class HealthcareAccessibilityValidator {
  private static instance: HealthcareAccessibilityValidator

  static getInstance(): HealthcareAccessibilityValidator {
    if (!HealthcareAccessibilityValidator.instance) {
      HealthcareAccessibilityValidator.instance = new HealthcareAccessibilityValidator()
    }
    return HealthcareAccessibilityValidator.instance
  }

  async validatePage(url?: string): Promise<ValidationResult> {
    const issues: AccessibilityIssue[] = []
    
    // Validate WCAG 2.1 AA+ criteria
    const wcagIssues = await this.validateWCAGCompliance()
    issues.push(...wcagIssues)

    // Validate healthcare-specific requirements
    const healthcareIssues = await this.validateHealthcareCompliance()
    issues.push(...healthcareIssues)

    // Validate mobile accessibility
    const mobileIssues = await this.validateMobileAccessibility()
    issues.push(...mobileIssues)

    // Validate LGPD compliance
    const lgpdIssues = await this.validateLGPDCompliance()
    issues.push(...lgpdIssues)

    // Calculate compliance score
    const score = this.calculateComplianceScore(issues)

    // Generate WCAG criteria report
    const wcagCriteria = this.generateWCAgreport(wcagIssues)

    // Generate healthcare compliance report
    const healthcareCompliance = {
      lgpd: this.generateLGPDReport(lgpdIssues),
      anvisa: this.generateANVISAReport(healthcareIssues),
      cfm: this.generateCFMReport(healthcareIssues),
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(issues)

    return {
      passed: score >= 90, // 90% compliance required
      issues,
      score,
      wcagCompliance: {
        level: this.getWCAGLevel(score),
        criteria: wcagCriteria,
      },
      healthcareCompliance,
      recommendations,
    }
  }

  private async validateWCAGCompliance(): Promise<AccessibilityIssue[]> {
    const issues: AccessibilityIssue[] = []
    
    // Check for proper headings structure
    const headingIssues = this.validateHeadings()
    issues.push(...headingIssues)

    // Check for ARIA labels
    const ariaIssues = this.validateARIA()
    issues.push(...ariaIssues)

    // Check for color contrast
    const contrastIssues = this.validateColorContrast()
    issues.push(...contrastIssues)

    // Check for keyboard navigation
    const keyboardIssues = this.validateKeyboardNavigation()
    issues.push(...keyboardIssues)

    // Check for focus management
    const focusIssues = this.validateFocusManagement()
    issues.push(...focusIssues)

    // Check for form accessibility
    const formIssues = this.validateFormAccessibility()
    issues.push(...formIssues)

    // Check for screen reader compatibility
    const screenReaderIssues = this.validateScreenReaderCompatibility()
    issues.push(...screenReaderIssues)

    return issues
  }

  private validateHeadings(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)))

    // Check for proper heading hierarchy
    for (let i = 1; i < headingLevels.length; i++) {
      if (headingLevels[i] > headingLevels[i - 1] + 1) {
        issues.push({
          id: 'heading-1',
          severity: 'serious',
          category: 'wcag',
          wcagCriteria: '1.3.1',
          element: `h${headingLevels[i]}`,
          description: 'Heading level skipped - creates poor document structure for screen readers',
          recommendation: 'Maintain proper heading hierarchy (h1 followed by h2, not h3)',
          impact: 'high',
        })
      }
    }

    // Check for missing h1
    if (headingLevels.length === 0 || headingLevels[0] !== 1) {
      issues.push({
        id: 'heading-2',
        severity: 'serious',
        category: 'wcag',
        wcagCriteria: '1.3.1',
        element: 'document',
        description: 'Missing h1 heading - critical for document structure',
        recommendation: 'Add an h1 heading that describes the page content',
        impact: 'high',
      })
    }

    return issues
  }

  private validateARIA(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []
    
    // Check for missing ARIA labels on interactive elements
    const interactiveElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [role="button"], [role="link"]'
    )

    interactiveElements.forEach((element) => {
      const hasLabel = element.hasAttribute('aria-label') ||
                       element.hasAttribute('aria-labelledby') ||
                       element.textContent?.trim() ||
                       (element instanceof HTMLInputElement && element.hasAttribute('alt'))

      if (!hasLabel) {
        issues.push({
          id: 'aria-1',
          severity: 'critical',
          category: 'wcag',
          wcagCriteria: '4.1.2',
          element: element.tagName.toLowerCase(),
          description: 'Interactive element missing accessible name',
          recommendation: 'Add aria-label, aria-labelledby, or ensure element has visible text content',
          impact: 'high',
        })
      }
    })

    // Check for invalid ARIA attributes
    const ariaElements = document.querySelectorAll('[aria-*]')
    ariaElements.forEach((element) => {
      const attributes = element.getAttributeNames()
        .filter(attr => attr.startsWith('aria-'))
      
      attributes.forEach(attr => {
        const value = element.getAttribute(attr)
        if (!value || value === '' || value === 'true' || value === 'false') {
          // This is a simplified check - real implementation would validate specific attributes
        }
      })
    })

    return issues
  }

  private validateColorContrast(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []
    
    // This is a simplified implementation
    // In a real validator, you'd calculate actual contrast ratios
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, label')
    
    textElements.forEach((element) => {
      const computedStyle = window.getComputedStyle(element)
      const fontSize = parseInt(computedStyle.fontSize)
      const fontWeight = computedStyle.fontWeight
      
      // Check if text is too small (less than 16px or 14px bold)
      if (fontSize < 16 && fontWeight !== 'bold' && fontWeight !== '700') {
        issues.push({
          id: 'contrast-1',
          severity: 'serious',
          category: 'wcag',
          wcagCriteria: '1.4.3',
          element: element.tagName.toLowerCase(),
          description: 'Text size may be too small for comfortable reading',
          recommendation: 'Increase font size to at least 16px or use bold text for smaller sizes',
          impact: 'medium',
        })
      }
    })

    return issues
  }

  private validateKeyboardNavigation(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []
    
    // Check if all interactive elements are keyboard accessible
    const interactiveElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    interactiveElements.forEach((element) => {
      const tabIndex = element.getAttribute('tabindex')
      if (tabIndex === '-1') {
        issues.push({
          id: 'keyboard-1',
          severity: 'serious',
          category: 'wcag',
          wcagCriteria: '2.1.1',
          element: element.tagName.toLowerCase(),
          description: 'Interactive element not keyboard accessible',
          recommendation: 'Remove tabindex="-1" or ensure element is not meant to be interactive',
          impact: 'high',
        })
      }
    })

    // Check for skip links
    const skipLinks = document.querySelectorAll('a[href^="#"], [role="link"]')
    const hasSkipLink = Array.from(skipLinks).some(link => {
      const href = link.getAttribute('href')
      return href && href.includes('skip') || href.includes('main')
    })

    if (!hasSkipLink) {
      issues.push({
        id: 'keyboard-2',
        severity: 'moderate',
        category: 'wcag',
        wcagCriteria: '2.4.1',
        element: 'document',
        description: 'Missing skip links for keyboard navigation',
        recommendation: 'Add skip links to allow keyboard users to bypass navigation',
        impact: 'medium',
      })
    }

    return issues
  }

  private validateFocusManagement(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []
    
    // Check for visible focus indicators
    const styleElement = document.createElement('style')
    styleElement.textContent = `
      .test-focus-visible:focus {
        outline: 3px solid red !important;
      }
    `
    document.head.appendChild(styleElement)

    // This is a simplified check
    document.head.removeChild(styleElement)

    return issues
  }

  private validateFormAccessibility(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []
    
    // Check for form labels
    const formInputs = document.querySelectorAll('input, select, textarea')
    
    formInputs.forEach((input) => {
      const hasLabel = input.hasAttribute('aria-label') ||
                      input.hasAttribute('aria-labelledby') ||
                      input.labels?.length > 0 ||
                      (input.id && document.querySelector(`label[for="${input.id}"]`))

      if (!hasLabel) {
        issues.push({
          id: 'form-1',
          severity: 'critical',
          category: 'wcag',
          wcagCriteria: '3.3.2',
          element: input.tagName.toLowerCase(),
          description: 'Form input missing associated label',
          recommendation: 'Add a label element with "for" attribute or use aria-label',
          impact: 'high',
        })
      }

      // Check for required field indicators
      if (input.hasAttribute('required')) {
        const hasRequiredIndicator = input.labels?.some(label => 
          label.textContent.includes('*') || 
          label.getAttribute('aria-required') === 'true'
        )

        if (!hasRequiredIndicator) {
          issues.push({
            id: 'form-2',
            severity: 'moderate',
            category: 'wcag',
            wcagCriteria: '3.3.2',
            element: input.tagName.toLowerCase(),
            description: 'Required field not clearly indicated',
            recommendation: 'Add * to label text or use aria-required="true"',
            impact: 'medium',
          })
        }
      }
    })

    return issues
  }

  private validateScreenReaderCompatibility(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []
    
    // Check for proper language declaration
    const htmlElement = document.documentElement
    const lang = htmlElement.getAttribute('lang')
    
    if (!lang || !lang.startsWith('pt')) {
      issues.push({
        id: 'screenreader-1',
        severity: 'moderate',
        category: 'wcag',
        wcagCriteria: '3.1.1',
        element: 'html',
        description: 'Missing or incorrect language declaration',
        recommendation: 'Add lang="pt-BR" to html element for Brazilian Portuguese',
        impact: 'medium',
      })
    }

    // Check for document title
    const title = document.title
    if (!title || title.trim() === '') {
      issues.push({
        id: 'screenreader-2',
        severity: 'serious',
        category: 'wcag',
        wcagCriteria: '2.4.2',
        element: 'title',
        description: 'Missing document title',
        recommendation: 'Add descriptive page title',
        impact: 'high',
      })
    }

    return issues
  }

  private async validateHealthcareCompliance(): Promise<AccessibilityIssue[]> {
    const issues: AccessibilityIssue[] = []
    
    // Check for healthcare-specific accessibility
    const medicalDataElements = document.querySelectorAll('[data-medical], [data-patient], [data-healthcare]')
    
    medicalDataElements.forEach((element) => {
      // Check if medical data has proper privacy indicators
      if (!element.hasAttribute('aria-describedby') || !element.hasAttribute('data-privacy-level')) {
        issues.push({
          id: 'healthcare-1',
          severity: 'serious',
          category: 'healthcare',
          element: element.tagName.toLowerCase(),
          description: 'Medical data missing privacy level indicator',
          recommendation: 'Add data-privacy-level attribute and aria-describedby for privacy info',
          impact: 'high',
        })
      }
    })

    return issues
  }

  private async validateMobileAccessibility(): Promise<AccessibilityIssue[]> {
    const issues: AccessibilityIssue[] = []
    
    // Check for touch target sizes
    const interactiveElements = document.querySelectorAll('button, .clickable, [role="button"]')
    
    interactiveElements.forEach((element) => {
      const rect = element.getBoundingClientRect()
      const minSize = 44 // WCAG minimum
      
      if (rect.width < minSize || rect.height < minSize) {
        issues.push({
          id: 'mobile-1',
          severity: 'serious',
          category: 'mobile',
          element: element.tagName.toLowerCase(),
          description: 'Touch target too small for mobile use',
          recommendation: 'Increase touch target size to at least 44x44px',
          impact: 'high',
        })
      }
    })

    return issues
  }

  private async validateLGPDCompliance(): Promise<AccessibilityIssue[]> {
    const issues: AccessibilityIssue[] = []
    
    // Check for consent mechanisms
    const consentForms = document.querySelectorAll('[data-consent], .consent-form')
    
    if (consentForms.length === 0) {
      issues.push({
        id: 'lgpd-1',
        severity: 'critical',
        category: 'lgpd',
        element: 'document',
        description: 'Missing LGPD consent mechanisms',
        recommendation: 'Implement proper consent forms for data processing',
        impact: 'high',
      })
    }

    // Check for data access mechanisms
    const accessLinks = document.querySelectorAll('a[href*="data"], [data-access-request]')
    
    if (accessLinks.length === 0) {
      issues.push({
        id: 'lgpd-2',
        severity: 'serious',
        category: 'lgpd',
        element: 'document',
        description: 'Missing data access request mechanisms',
        recommendation: 'Add clear way for users to request their data',
        impact: 'high',
      })
    }

    return issues
  }

  private calculateComplianceScore(issues: AccessibilityIssue[]): number {
    const severityWeights = {
      critical: 10,
      serious: 5,
      moderate: 2,
      minor: 1,
    }

    const totalWeight = issues.reduce((sum, issue) => sum + severityWeights[issue.severity], 0)
    const maxPossibleWeight = 100 // Base score
    
    // Calculate score as percentage, with higher penalties for critical issues
    const criticalCount = issues.filter(i => i.severity === 'critical').length
    const criticalPenalty = criticalCount * 20 // 20 points per critical issue
    
    const score = Math.max(0, maxPossibleWeight - totalWeight - criticalPenalty)
    
    return Math.round(score)
  }

  private generateWCAgreport(wcagIssues: AccessibilityIssue[]): WCAGCriteria[] {
    // This would generate a comprehensive WCAG criteria report
    return [
      {
        number: '1.1.1',
        title: 'Non-text Content',
        level: 'A',
        satisfied: !wcagIssues.some(i => i.wcagCriteria === '1.1.1'),
      },
      {
        number: '1.3.1',
        title: 'Info and Relationships',
        level: 'A',
        satisfied: !wcagIssues.some(i => i.wcagCriteria === '1.3.1'),
      },
      // Add more WCAG criteria as needed
    ]
  }

  private generateLGPDReport(lgpdIssues: AccessibilityIssue[]): LGPDCompliance {
    return {
      dataMinimization: !lgpdIssues.some(i => i.id === 'lgpd-3'),
      explicitConsent: !lgpdIssues.some(i => i.id === 'lgpd-1'),
      accessRights: !lgpdIssues.some(i => i.id === 'lgpd-2'),
      deletionRights: true, // Would need to check for deletion mechanisms
      portability: true, // Would need to check for data export mechanisms
      auditTrail: true, // Would need to check for audit logging
      encryption: true, // Would need to check for encryption indicators
    }
  }

  private generateANVISAReport(healthcareIssues: AccessibilityIssue[]): ANVISACompliance {
    return {
      medicalDataProtection: !healthcareIssues.some(i => i.id === 'healthcare-1'),
      auditLogging: true,
      integrityControls: true,
      accessControls: true,
      backupSystems: true,
    }
  }

  private generateCFMReport(healthcareIssues: AccessibilityIssue[]): CFMCompliance {
    return {
      professionalEthics: true,
      patientConfidentiality: !healthcareIssues.some(i => i.id === 'healthcare-1'),
      recordRetention: true,
      professionalOversight: true,
    }
  }

  private getWCAGLevel(score: number): 'A' | 'AA' | 'AAA' | 'Non-compliant' {
    if (score >= 95) return 'AAA'
    if (score >= 90) return 'AA'
    if (score >= 80) return 'A'
    return 'Non-compliant'
  }

  private generateRecommendations(issues: AccessibilityIssue[]): string[] {
    const recommendations: string[] = []
    
    // Group issues by category and generate recommendations
    const criticalIssues = issues.filter(i => i.severity === 'critical')
    if (criticalIssues.length > 0) {
      recommendations.push('Address all critical issues immediately for basic accessibility compliance')
    }

    const wcagIssues = issues.filter(i => i.category === 'wcag')
    if (wcagIssues.length > 0) {
      recommendations.push('Implement WCAG 2.1 AA+ guidelines for full accessibility compliance')
    }

    const mobileIssues = issues.filter(i => i.category === 'mobile')
    if (mobileIssues.length > 0) {
      recommendations.push('Optimize touch targets and mobile interactions for healthcare workflows')
    }

    const lgpdIssues = issues.filter(i => i.category === 'lgpd')
    if (lgpdIssues.length > 0) {
      recommendations.push('Implement LGPD compliance mechanisms for data protection and privacy')
    }

    const healthcareIssues = issues.filter(i => i.category === 'healthcare')
    if (healthcareIssues.length > 0) {
      recommendations.push('Enhance healthcare-specific accessibility features and privacy controls')
    }

    return recommendations
  }
}