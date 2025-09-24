/**
 * Comprehensive Security Headers Service for Healthcare Platform
 * Implements OWASP security best practices with healthcare-specific requirements
 * LGPD compliance, Brazilian healthcare security standards, and medical data protection
 */

// ============================================================================
// Security Header Configuration Types
// ============================================================================

export interface SecurityHeaderConfig {
  // Content Security Policy
  csp: {
    enabled: boolean
    reportOnly: boolean
    defaultSrc: string[]
    scriptSrc: string[]
    styleSrc: string[]
    imgSrc: string[]
    fontSrc: string[]
    connectSrc: string[]
    mediaSrc: string[]
    objectSrc: string[]
    childSrc: string[]
    formAction: string[]
    frameAncestors: string[]
    sandbox?: string
    reportUri?: string
    reportTo?: string
    nonce?: string
  }

  // HTTP Strict Transport Security
  hsts: {
    enabled: boolean
    maxAge: number // seconds
    includeSubDomains: boolean
    preload: boolean
  }

  // Other Security Headers
  xContentTypeOptions: 'nosniff'
  xFrameOptions: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM'
  xXssProtection: '0' | '1; mode=block' | '1'
  referrerPolicy: string
  permissionsPolicy: string
  crossOriginEmbedderPolicy: 'require-corp' | 'credentialless' | 'unsafe-none'
  crossOriginOpenerPolicy:
    | 'same-origin'
    | 'same-origin-allow-popups'
    | 'unsafe-none'
  crossOriginResourcePolicy: 'same-origin' | 'same-site' | 'cross-origin'
}

export interface HealthcareSecurityContext {
  isHealthcareEndpoint: boolean
  handlesMedicalData: boolean
  requiresPatientAuth: boolean
  isEmergencyAccess: boolean
  userRole: string
  patientId?: string
  sensitivityLevel: 'low' | 'medium' | 'high' | 'critical'
}

export interface SecurityHeadersResult {
  headers: Record<string, string>
  cspPolicy?: string
  recommendations: string[]
  securityScore: number // 0-100
  appliedHeaders: string[]
  missingHeaders: string[]
  warnings: string[]
}

// ============================================================================
// Healthcare-Specific Security Header Configurations
// ============================================================================

const HEALTHCARE_SECURITY_CONFIGS: Record<string, SecurityHeaderConfig> = {
  // High-security configuration for medical data endpoints
  medical_data: {
    csp: {
      enabled: true,
      reportOnly: false,
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for legacy compatibility
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'https:'],
      connectSrc: ["'self'", 'wss:', 'https:'],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      childSrc: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      sandbox: 'allow-scripts allow-same-origin allow-forms',
      reportUri: '/api/security/csp-reports',
    },
    hsts: {
      enabled: true,
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    xContentTypeOptions: 'nosniff',
    xFrameOptions: 'DENY',
    xXssProtection: '1; mode=block',
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: 'geolocation=(), microphone=(), camera=(), payment=()',
    crossOriginEmbedderPolicy: 'require-corp',
    crossOriginOpenerPolicy: 'same-origin',
    crossOriginResourcePolicy: 'same-origin',
  },

  // Moderate security for general healthcare endpoints
  general_healthcare: {
    csp: {
      enabled: true,
      reportOnly: false,
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'https:'],
      connectSrc: ["'self'", 'wss:', 'https:'],
      mediaSrc: ["'self'", 'https:'],
      objectSrc: ["'none'"],
      childSrc: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      reportUri: '/api/security/csp-reports',
    },
    hsts: {
      enabled: true,
      maxAge: 31536000,
      includeSubDomains: true,
      preload: false,
    },
    xContentTypeOptions: 'nosniff',
    xFrameOptions: 'SAMEORIGIN',
    xXssProtection: '1; mode=block',
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: 'geolocation=(), microphone=(), camera=()',
    crossOriginEmbedderPolicy: 'require-corp',
    crossOriginOpenerPolicy: 'same-origin',
    crossOriginResourcePolicy: 'same-site',
  },

  // Public-facing endpoints with relaxed security
  public: {
    csp: {
      enabled: true,
      reportOnly: false,
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https:'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
      imgSrc: ["'self'", 'data:', 'https:', 'http:'],
      fontSrc: ["'self'", 'https:'],
      connectSrc: ["'self'", 'wss:', 'https:', 'http:'],
      mediaSrc: ["'self'", 'https:', 'http:'],
      objectSrc: ["'self'"],
      childSrc: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      reportUri: '/api/security/csp-reports',
    },
    hsts: {
      enabled: true,
      maxAge: 31536000,
      includeSubDomains: false,
      preload: false,
    },
    xContentTypeOptions: 'nosniff',
    xFrameOptions: 'SAMEORIGIN',
    xXssProtection: '1; mode=block',
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: 'geolocation=(), microphone=(), camera=()',
    crossOriginEmbedderPolicy: 'unsafe-none',
    crossOriginOpenerPolicy: 'unsafe-none',
    crossOriginResourcePolicy: 'cross-origin',
  },
}

// ============================================================================
// Security Headers Service Implementation
// ============================================================================

export class SecurityHeadersService {
  private configs: Record<string, SecurityHeaderConfig> = HEALTHCARE_SECURITY_CONFIGS
  private cspReports: Array<{
    id: string
    timestamp: Date
    blockedUri: string
    violatedDirective: string
    originalPolicy: string
    userAgent: string
    ipAddress: string
  }> = []

  /**
   * Generate security headers based on healthcare context
   */
  generateSecurityHeaders(
    _context: HealthcareSecurityContext,
  ): SecurityHeadersResult {
    try {
      const config = this.selectConfig(context)
      const headers: Record<string, string> = {}
      const appliedHeaders: string[] = []
      const missingHeaders: string[] = []
      const warnings: string[] = []
      const recommendations: string[] = []

      // Content Security Policy
      if (config.csp.enabled) {
        const cspPolicy = this.buildCSP(config.csp)
        if (config.csp.reportOnly) {
          headers['Content-Security-Policy-Report-Only'] = cspPolicy
        } else {
          headers['Content-Security-Policy'] = cspPolicy
        }
        appliedHeaders.push('CSP')
      } else {
        missingHeaders.push('CSP')
        recommendations.push(
          'Enable Content Security Policy for enhanced security',
        )
      }

      // HTTP Strict Transport Security
      if (config.hsts.enabled) {
        const hstsValue = this.buildHSTS(config.hsts)
        headers['Strict-Transport-Security'] = hstsValue
        appliedHeaders.push('HSTS')
      } else {
        missingHeaders.push('HSTS')
        recommendations.push('Enable HSTS for HTTPS enforcement')
      }

      // X-Content-Type-Options
      headers['X-Content-Type-Options'] = config.xContentTypeOptions
      appliedHeaders.push('X-Content-Type-Options')

      // X-Frame-Options
      headers['X-Frame-Options'] = config.xFrameOptions
      appliedHeaders.push('X-Frame-Options')

      // X-XSS-Protection
      headers['X-XSS-Protection'] = config.xXssProtection
      appliedHeaders.push('X-XSS-Protection')

      // Referrer Policy
      headers['Referrer-Policy'] = config.referrerPolicy
      appliedHeaders.push('Referrer-Policy')

      // Permissions Policy
      headers['Permissions-Policy'] = config.permissionsPolicy
      appliedHeaders.push('Permissions-Policy')

      // Cross-Origin Embedder Policy
      headers['Cross-Origin-Embedder-Policy'] = config.crossOriginEmbedderPolicy
      appliedHeaders.push('Cross-Origin-Embedder-Policy')

      // Cross-Origin Opener Policy
      headers['Cross-Origin-Opener-Policy'] = config.crossOriginOpenerPolicy
      appliedHeaders.push('Cross-Origin-Opener-Policy')

      // Cross-Origin Resource Policy
      headers['Cross-Origin-Resource-Policy'] = config.crossOriginResourcePolicy
      appliedHeaders.push('Cross-Origin-Resource-Policy')

      // Healthcare-specific headers
      if (context.handlesMedicalData) {
        headers['X-Healthcare-Security'] = 'enabled'
        headers['X-LGPD-Compliant'] = 'true'
        headers['X-Data-Sensitivity'] = context.sensitivityLevel
        appliedHeaders.push('Healthcare-Security')
      }

      // Additional security headers
      headers['X-Content-Security-Policy'] = "default-src 'self'"
      headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
      headers['Pragma'] = 'no-cache'
      headers['Expires'] = '0'

      // Calculate security score
      const securityScore = this.calculateSecurityScore(
        appliedHeaders,
        missingHeaders,
        context,
      )

      // Generate context-specific recommendations
      const contextRecommendations = this.generateContextRecommendations(context)
      recommendations.push(...contextRecommendations)

      return {
        headers,
        cspPolicy: config.csp.enabled ? this.buildCSP(config.csp) : undefined,
        recommendations,
        securityScore,
        appliedHeaders,
        missingHeaders,
        warnings,
      }
    } catch {
      console.error('Error generating security headers:', error)
      return {
        headers: {},
        recommendations: ['Error generating security headers'],
        securityScore: 0,
        appliedHeaders: [],
        missingHeaders: ['All security headers'],
        warnings: [error instanceof Error ? error.message : 'Unknown error'],
      }
    }
  }

  /**
   * Select appropriate security configuration based on context
   */
  private selectConfig(
    _context: HealthcareSecurityContext,
  ): SecurityHeaderConfig {
    if (context.sensitivityLevel === 'critical' || context.handlesMedicalData) {
      return this.configs.medical_data
    }

    if (context.isHealthcareEndpoint || context.requiresPatientAuth) {
      return this.configs.general_healthcare
    }

    return this.configs.public
  }

  /**
   * Build Content Security Policy string
   */
  private buildCSP(csp: SecurityHeaderConfig['csp']): string {
    const directives: string[] = []

    // Default-src
    if (csp.defaultSrc.length > 0) {
      directives.push(`default-src ${csp.defaultSrc.join(' ')}`)
    }

    // Script-src
    if (csp.scriptSrc.length > 0) {
      directives.push(`script-src ${csp.scriptSrc.join(' ')}`)
    }

    // Style-src
    if (csp.styleSrc.length > 0) {
      directives.push(`style-src ${csp.styleSrc.join(' ')}`)
    }

    // Img-src
    if (csp.imgSrc.length > 0) {
      directives.push(`img-src ${csp.imgSrc.join(' ')}`)
    }

    // Font-src
    if (csp.fontSrc.length > 0) {
      directives.push(`font-src ${csp.fontSrc.join(' ')}`)
    }

    // Connect-src
    if (csp.connectSrc.length > 0) {
      directives.push(`connect-src ${csp.connectSrc.join(' ')}`)
    }

    // Media-src
    if (csp.mediaSrc.length > 0) {
      directives.push(`media-src ${csp.mediaSrc.join(' ')}`)
    }

    // Object-src
    if (csp.objectSrc.length > 0) {
      directives.push(`object-src ${csp.objectSrc.join(' ')}`)
    }

    // Child-src
    if (csp.childSrc.length > 0) {
      directives.push(`child-src ${csp.childSrc.join(' ')}`)
    }

    // Form-action
    if (csp.formAction.length > 0) {
      directives.push(`form-action ${csp.formAction.join(' ')}`)
    }

    // Frame-ancestors
    if (csp.frameAncestors.length > 0) {
      directives.push(`frame-ancestors ${csp.frameAncestors.join(' ')}`)
    }

    // Sandbox
    if (csp.sandbox) {
      directives.push(`sandbox ${csp.sandbox}`)
    }

    // Report-uri / Report-to
    if (csp.reportUri) {
      directives.push(`report-uri ${csp.reportUri}`)
    }

    if (csp.reportTo) {
      directives.push(`report-to ${csp.reportTo}`)
    }

    return directives.join('; ')
  }

  /**
   * Build HSTS header value
   */
  private buildHSTS(hsts: SecurityHeaderConfig['hsts']): string {
    let value = `max-age=${hsts.maxAge}`

    if (hsts.includeSubDomains) {
      value += '; includeSubDomains'
    }

    if (hsts.preload) {
      value += '; preload'
    }

    return value
  }

  /**
   * Calculate security score based on applied headers
   */
  private calculateSecurityScore(
    appliedHeaders: string[],
    missingHeaders: string[],
    _context: HealthcareSecurityContext,
  ): number {
    let score = 100

    // Deduct for missing critical headers
    const criticalHeaders = ['CSP', 'HSTS']
    criticalHeaders.forEach((header) => {
      if (!appliedHeaders.includes(header)) {
        score -= 20
      }
    })

    // Deduct for missing important headers
    const importantHeaders = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection',
    ]
    importantHeaders.forEach((header) => {
      if (!appliedHeaders.includes(header)) {
        score -= 10
      }
    })

    // Bonus for healthcare-specific security
    if (
      context.handlesMedicalData
      && appliedHeaders.includes('Healthcare-Security')
    ) {
      score += 5
    }

    // Penalty for missing headers in high-sensitivity contexts
    if (context.sensitivityLevel === 'critical' && missingHeaders.length > 0) {
      score -= 15
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Generate context-specific security recommendations
   */
  private generateContextRecommendations(
    _context: HealthcareSecurityContext,
  ): string[] {
    const recommendations: string[] = []

    if (context.handlesMedicalData) {
      recommendations.push(
        'Implement additional encryption for medical data in transit',
      )
      recommendations.push(
        'Consider additional monitoring for medical data endpoints',
      )
    }

    if (context.sensitivityLevel === 'critical') {
      recommendations.push(
        'Enable advanced threat detection for critical endpoints',
      )
      recommendations.push('Implement additional authentication factors')
    }

    if (context.isEmergencyAccess) {
      recommendations.push('Maintain detailed audit logs for emergency access')
      recommendations.push(
        'Consider temporary security relaxation for emergency scenarios',
      )
    }

    return recommendations
  }

  /**
   * Handle CSP violation reports
   */
  async handleCSPViolation(
    report: {
      'csp-report': {
        'blocked-uri': string
        'violated-directive': string
        'original-policy': string
        'document-uri': string
        referrer: string
      }
    },
    _request: {
      headers: Record<string, string>
      ip: string
    },
  ): Promise<void> {
    try {
      const cspReport = report['csp-report']

      const violation = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        blockedUri: cspReport['blocked-uri'],
        violatedDirective: cspReport['violated-directive'],
        originalPolicy: cspReport['original-policy'],
        userAgent: request.headers['user-agent'] || 'unknown',
        ipAddress: request.ip,
      }

      this.cspReports.push(violation)

      // Log violation for security monitoring
      console.log('[CSP Violation]', JSON.stringify(violation, null, 2))

      // Store in database for analysis
      // In production, this would write to your security monitoring system
      await this.storeCSPViolation(violation)

      // Trigger alerts for high-risk violations
      if (this.isHighRiskViolation(violation)) {
        await this.triggerSecurityAlert(violation)
      }
    } catch {
      console.error('Error handling CSP violation:', error)
    }
  }

  /**
   * Check if CSP violation is high-risk
   */
  private isHighRiskViolation(violation: any): boolean {
    const highRiskDirectives = [
      'script-src',
      'object-src',
      'default-src',
      'connect-src',
    ]

    const highRiskBlockedUris = ['data:', 'javascript:', 'http:']

    return (
      highRiskDirectives.includes(violation.violatedDirective)
      || highRiskBlockedUris.some((uri) => violation.blockedUri.startsWith(uri))
    )
  }

  /**
   * Store CSP violation in database
   */
  private async storeCSPViolation(_violation: any): Promise<void> {
    // Mock implementation - would integrate with your security monitoring system
    console.log('Storing CSP violation in security monitoring system')
  }

  /**
   * Trigger security alert for high-risk violations
   */
  private async triggerSecurityAlert(violation: any): Promise<void> {
    // Mock implementation - would integrate with your alerting system
    console.log('Security Alert: High-risk CSP violation detected', violation)
  }

  /**
   * Get CSP violation statistics
   */
  getCSPStatistics(): {
    totalViolations: number
    violationsLast24h: number
    topViolatedDirectives: Array<{ directive: string; count: number }>
    topBlockedUris: Array<{ uri: string; count: number }>
    riskLevel: 'low' | 'medium' | 'high'
  } {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const violationsLast24h = this.cspReports.filter(
      (v) => v.timestamp >= yesterday,
    ).length

    // Count violated directives
    const directiveCounts: Record<string, number> = {}
    this.cspReports.forEach((v) => {
      directiveCounts[v.violatedDirective] = (directiveCounts[v.violatedDirective] || 0) + 1
    })

    const topViolatedDirectives = Object.entries(directiveCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([directive, count]) => ({ directive, count }))

    // Count blocked URIs
    const uriCounts: Record<string, number> = {}
    this.cspReports.forEach((v) => {
      uriCounts[v.blockedUri] = (uriCounts[v.blockedUri] || 0) + 1
    })

    const topBlockedUris = Object.entries(uriCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([uri, count]) => ({ uri, count }))

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low'
    if (violationsLast24h > 10) riskLevel = 'high'
    else if (violationsLast24h > 3) riskLevel = 'medium'

    return {
      totalViolations: this.cspReports.length,
      violationsLast24h,
      topViolatedDirectives,
      topBlockedUris,
      riskLevel,
    }
  }

  /**
   * Validate security headers configuration
   */
  validateConfig(config: SecurityHeaderConfig): Array<{
    type: 'error' | 'warning' | 'info'
    message: string
    field?: string
  }> {
    const validationErrors: Array<{
      type: 'error' | 'warning' | 'info'
      message: string
      field?: string
    }> = []

    // Validate CSP configuration
    if (config.csp.enabled) {
      if (!config.csp.defaultSrc || config.csp.defaultSrc.length === 0) {
        validationErrors.push({
          type: 'error',
          message: 'CSP default-src must be specified when CSP is enabled',
          field: 'csp.defaultSrc',
        })
      }

      if (
        config.csp.scriptSrc
        && config.csp.scriptSrc.includes("'unsafe-inline'")
      ) {
        validationErrors.push({
          type: 'warning',
          message: "CSP script-src contains 'unsafe-inline' which reduces security",
          field: 'csp.scriptSrc',
        })
      }
    }

    // Validate HSTS configuration
    if (config.hsts.enabled) {
      if (config.hsts.maxAge < 31536000) {
        // Less than 1 year
        validationErrors.push({
          type: 'warning',
          message: 'HSTS max-age should be at least 1 year for optimal security',
          field: 'hsts.maxAge',
        })
      }
    }

    return validationErrors
  }

  /**
   * Add custom security configuration
   */
  addCustomConfig(name: string, config: SecurityHeaderConfig): void {
    const validationErrors = this.validateConfig(config)
    if (validationErrors.some((e) => e.type === 'error')) {
      throw new Error('Configuration validation failed')
    }

    this.configs[name] = config
  }

  /**
   * Get all available configurations
   */
  getConfigurations(): Record<string, SecurityHeaderConfig> {
    return { ...this.configs }
  }

  /**
   * Generate middleware for security headers
   */
  generateMiddleware() {
    return async (c: any, next: any) => {
      try {
        // Extract healthcare context from request
        const _context: HealthcareSecurityContext = {
          isHealthcareEndpoint: this.isHealthcareEndpoint(c.req.url),
          handlesMedicalData: this.handlesMedicalData(c.req.url),
          requiresPatientAuth: this.requiresPatientAuth(c.req.url),
          isEmergencyAccess: c.req.header('x-emergency-access') === 'true',
          userRole: c.req.header('x-user-role') || 'anonymous',
          patientId: c.req.header('x-patient-id'),
          sensitivityLevel: this.assessSensitivityLevel(
            c.req.url,
            c.req.method,
          ),
        }

        // Generate security headers
        const securityResult = this.generateSecurityHeaders(context)

        // Apply headers to response
        Object.entries(securityResult.headers).forEach(([key, _value]) => {
          c.header(key, value)
        })

        // Add security scoring header (for internal monitoring)
        c.header('X-Security-Score', securityResult.securityScore.toString())

        await next()
      } catch {
        console.error('Error in security headers middleware:', error)
        // Don't block requests on security header errors
        await next()
      }
    }
  }

  /**
   * Check if endpoint is healthcare-related
   */
  private isHealthcareEndpoint(url: string): boolean {
    const healthcarePaths = [
      '/api/patients',
      '/api/medical',
      '/api/appointments',
      '/api/consents',
      '/api/lgpd',
    ]

    return healthcarePaths.some((path) => url.startsWith(path))
  }

  /**
   * Check if endpoint handles medical data
   */
  private handlesMedicalData(url: string): boolean {
    const medicalDataPaths = [
      '/api/patients/',
      '/api/medical/',
      '/api/diagnoses',
      '/api/treatments',
    ]

    return medicalDataPaths.some((path) => url.includes(path))
  }

  /**
   * Check if endpoint requires patient authentication
   */
  private requiresPatientAuth(url: string): boolean {
    const protectedPaths = [
      '/api/patients/',
      '/api/medical-records',
      '/api/consents/',
      '/api/privacy',
    ]

    return protectedPaths.some((path) => url.includes(path))
  }

  /**
   * Assess sensitivity level of endpoint
   */
  private assessSensitivityLevel(
    url: string,
    method: string,
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (url.includes('/medical-records') || url.includes('/diagnoses')) {
      return 'critical'
    }

    if (url.includes('/patients/') && method !== 'GET') {
      return 'high'
    }

    if (this.isHealthcareEndpoint(url)) {
      return 'medium'
    }

    return 'low'
  }
}

export default SecurityHeadersService
