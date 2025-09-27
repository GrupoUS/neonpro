/**
 * Enhanced LGPD Consent Audit Trail System
 * Comprehensive tracking of all consent-related activities for Brazilian healthcare compliance
 */

// Database models will be imported when Prisma client is available

export interface ConsentAuditEvent {
  id: string
  eventType: 'consent_given' | 'consent_withdrawn' | 'consent_modified' | 'consent_expired' | 'data_accessed' | 'data_processed' | 'data_deleted' | 'emergency_override' | 'compliance_check'
  patientId: string
  clinicId: string
  consentId?: string
  categories: string[]
  dataType: 'basic' | 'sensitive' | 'medical' | 'genetic' | 'biometric'
  legalBasis: string
  timestamp: Date
  performedBy: {
    userId?: string
    system?: string
    role: string
    ipAddress?: string
    userAgent?: string
  }
  details: {
    reason?: string
    method?: string
    scope?: string
    emergencyOverride?: boolean
    dataVolume?: number
    retentionPeriod?: number
  }
  compliance: {
    lgpdCompliant: boolean
    frameworkVersion: string
    validationPassed: boolean
    issues?: string[]
  }
  blockchainHash?: string // Optional cryptographic proof
}

export interface AuditReport {
  id: string
  reportType: 'consent_summary' | 'withdrawal_analysis' | 'compliance_check' | 'data_subject_requests' | 'emergency_access'
  generatedAt: Date
  period: {
    start: Date
    end: Date
  }
  clinicId: string
  data: {
    totalEvents: number
    eventsByType: Record<string, number>
    eventsByCategory: Record<string, number>
    complianceScore: number
    issues: AuditIssue[]
    recommendations: string[]
  }
  metadata: {
    generatedBy: string
    frameworkVersion: string
    exportFormat: 'json' | 'pdf' | 'csv'
  }
}

export interface AuditIssue {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'consent' | 'retention' | 'access' | 'emergency' | 'technical'
  description: string
  affectedRecords: string[]
  recommendation: string
  deadline?: Date
  status: 'open' | 'in_progress' | 'resolved' | 'dismissed'
}

export interface ComplianceMetrics {
  totalConsents: number
  activeConsents: number
  withdrawnConsents: number
  expiredConsents: number
  averageConsentDuration: number // days
  withdrawalRate: number // percentage
  complianceScore: number // 0-100
  lastAuditDate: Date
  nextAuditDate: Date
  categoryBreakdown: Record<string, {
    total: number
    active: number
    withdrawn: number
    complianceRate: number
  }>
}

/**
 * Enhanced Consent Audit Trail System
 */
export class ConsentAuditService {
  private auditEvents: ConsentAuditEvent[] = [] // In production, this would be database-backed
  private complianceMetrics: ComplianceMetrics

  constructor() {
    this.complianceMetrics = {
      totalConsents: 0,
      activeConsents: 0,
      withdrawnConsents: 0,
      expiredConsents: 0,
      averageConsentDuration: 0,
      withdrawalRate: 0,
      complianceScore: 95, // Starting with high compliance
      lastAuditDate: new Date(),
      nextAuditDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 days
      categoryBreakdown: {}
    }
  }

  /**
   * Log consent-related event
   */
  async logConsentEvent(event: Omit<ConsentAuditEvent, 'id' | 'timestamp'>): Promise<string> {
    const auditEvent: ConsentAuditEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      blockchainHash: await this.generateBlockchainHash(event)
    }

    // Store event (in production: database insert)
    this.auditEvents.push(auditEvent)
    
    // Update compliance metrics
    await this.updateComplianceMetrics(auditEvent)

    // Check for compliance issues
    await this.checkComplianceIssues(auditEvent)

    return auditEvent.id
  }

  /**
   * Generate blockchain hash for audit integrity
   */
  private async generateBlockchainHash(event: Omit<ConsentAuditEvent, 'id' | 'timestamp'>): Promise<string> {
    const eventData = JSON.stringify({
      ...event,
      timestamp: Date.now(),
      nonce: crypto.randomUUID()
    })
    
    // Simple hash generation - in production, use proper cryptographic hashing
    const encoder = new TextEncoder()
    const data = encoder.encode(eventData)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Update compliance metrics based on new events
   */
  private async updateComplianceMetrics(event: ConsentAuditEvent): Promise<void> {
    switch (event.eventType) {
      case 'consent_given':
        this.complianceMetrics.totalConsents++
        this.complianceMetrics.activeConsents++
        break
      case 'consent_withdrawn':
        this.complianceMetrics.activeConsents--
        this.complianceMetrics.withdrawnConsents++
        break
      case 'consent_expired':
        this.complianceMetrics.activeConsents--
        this.complianceMetrics.expiredConsents++
        break
    }

    // Update category breakdown
    for (const category of event.categories) {
      if (!this.complianceMetrics.categoryBreakdown[category]) {
        this.complianceMetrics.categoryBreakdown[category] = {
          total: 0,
          active: 0,
          withdrawn: 0,
          complianceRate: 100
        }
      }

      const breakdown = this.complianceMetrics.categoryBreakdown[category]
      breakdown.total++

      switch (event.eventType) {
        case 'consent_given':
          breakdown.active++
          break
        case 'consent_withdrawn':
          breakdown.active--
          breakdown.withdrawn++
          break
      }

      breakdown.complianceRate = (breakdown.active / breakdown.total) * 100
    }

    // Calculate overall compliance score
    const totalCategories = Object.values(this.complianceMetrics.categoryBreakdown)
      .reduce((sum, cat) => sum + cat.total, 0)
    
    if (totalCategories > 0) {
      const totalCompliance = Object.values(this.complianceMetrics.categoryBreakdown)
        .reduce((sum, cat) => sum + (cat.complianceRate * cat.total), 0)
      
      this.complianceMetrics.complianceScore = totalCompliance / totalCategories
    }

    // Update withdrawal rate
    if (this.complianceMetrics.totalConsents > 0) {
      this.complianceMetrics.withdrawalRate = 
        (this.complianceMetrics.withdrawnConsents / this.complianceMetrics.totalConsents) * 100
    }
  }

  /**
   * Check for compliance issues automatically
   */
  private async checkComplianceIssues(event: ConsentAuditEvent): Promise<void> {
    const issues: string[] = []

    // Check for emergency override without proper documentation
    if (event.details.emergencyOverride && !event.details.reason) {
      issues.push('Override de emergência sem documentação adequada')
    }

    // Check for data access without valid consent
    if (event.eventType === 'data_accessed' && !event.consentId) {
      const legalBasesWithoutConsent = ['vital_interest', 'legal_obligation', 'public_interest']
      if (!legalBasesWithoutConsent.includes(event.legalBasis)) {
        issues.push('Acesso a dados sem base legal válida')
      }
    }

    // Check for sensitive data processing without enhanced security
    if (event.dataType === 'genetic' || event.dataType === 'biometric') {
      if (!event.compliance.validationPassed) {
        issues.push('Processamento de dados sensíveis sem validação de segurança')
      }
    }

    // Update compliance validation
    event.compliance.validationPassed = issues.length === 0
    if (issues.length > 0) {
      event.compliance.issues = issues
    }

    // Log critical issues
    if (issues.length > 0) {
      console.warn('Compliance issues detected:', {
        eventId: event.id,
        patientId: event.patientId,
        issues
      })
    }
  }

  /**
   * Generate audit report for compliance
   */
  async generateAuditReport(
    clinicId: string,
    reportType: AuditReport['reportType'],
    period: { start: Date; end: Date }
  ): Promise<AuditReport> {
    const relevantEvents = this.auditEvents.filter(event =>
      event.clinicId === clinicId &&
      event.timestamp >= period.start &&
      event.timestamp <= period.end
    )

    const eventsByType = relevantEvents.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const eventsByCategory = relevantEvents.reduce((acc, event) => {
      for (const category of event.categories) {
        acc[category] = (acc[category] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const issues = this.identifyAuditIssues(relevantEvents)
    const recommendations = this.generateRecommendations(issues)

    return {
      id: crypto.randomUUID(),
      reportType,
      generatedAt: new Date(),
      period,
      clinicId,
      data: {
        totalEvents: relevantEvents.length,
        eventsByType,
        eventsByCategory,
        complianceScore: this.complianceMetrics.complianceScore,
        issues,
        recommendations
      },
      metadata: {
        generatedBy: 'consent_audit_service',
        frameworkVersion: '2.0',
        exportFormat: 'json'
      }
    }
  }

  /**
   * Identify compliance issues from audit events
   */
  private identifyAuditIssues(events: ConsentAuditEvent[]): AuditIssue[] {
    const issues: AuditIssue[] = []

    // Check for patterns of non-compliance
    const dataAccessWithoutConsent = events.filter(event =>
      event.eventType === 'data_accessed' && 
      !event.consentId && 
      event.legalBasis === 'consent'
    )

    if (dataAccessWithoutConsent.length > 0) {
      issues.push({
        id: crypto.randomUUID(),
        severity: 'high',
        category: 'consent',
        description: `${dataAccessWithoutConsent.length} acessos a dados sem consentimento válido`,
        affectedRecords: dataAccessWithoutConsent.map(e => e.id),
        recommendation: 'Implementar validação rigorosa de consentimento antes do acesso a dados',
        deadline: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), // 7 days
        status: 'open'
      })
    }

    // Check for emergency overuse
    const emergencyEvents = events.filter(event =>
      event.details.emergencyOverride === true
    )

    if (emergencyEvents.length > events.length * 0.1) { // More than 10% emergency usage
      issues.push({
        id: crypto.randomUUID(),
        severity: 'medium',
        category: 'emergency',
        description: 'Uso excessivo de overrides de emergência',
        affectedRecords: emergencyEvents.map(e => e.id),
        recommendation: 'Revisar procedimentos de emergência e treinamento de equipe',
        deadline: new Date(Date.now() + (14 * 24 * 60 * 60 * 1000)), // 14 days
        status: 'open'
      })
    }

    // Check for retention policy violations
    const expiredConsentsStillActive = events.filter(event =>
      event.eventType === 'data_processed' &&
      event.details.retentionPeriod &&
      new Date(event.timestamp.getTime() + (event.details.retentionPeriod * 24 * 60 * 60 * 1000)) < new Date()
    )

    if (expiredConsentsStillActive.length > 0) {
      issues.push({
        id: crypto.randomUUID(),
        severity: 'critical',
        category: 'retention',
        description: 'Processamento de dados após expiração do período de retenção',
        affectedRecords: expiredConsentsStillActive.map(e => e.id),
        recommendation: 'Implementar exclusão automática de dados expirados',
        deadline: new Date(Date.now() + (3 * 24 * 60 * 60 * 1000)), // 3 days
        status: 'open'
      })
    }

    return issues
  }

  /**
   * Generate recommendations based on identified issues
   */
  private generateRecommendations(issues: AuditIssue[]): string[] {
    const recommendations: string[] = []

    if (issues.some(issue => issue.category === 'consent')) {
      recommendations.push('Implementar validação automática de consentimento antes de qualquer processamento de dados')
      recommendations.push('Treinar equipe sobre procedimentos adequados de obtenção de consentimento')
    }

    if (issues.some(issue => issue.category === 'emergency')) {
      recommendations.push('Revisar e documentar procedimentos de emergência')
      recommendations.push('Implementar aprovação em dois níveis para overrides de emergência')
    }

    if (issues.some(issue => issue.category === 'retention')) {
      recommendations.push('Implementar sistema automatizado de exclusão de dados baseado em políticas de retenção')
      recommendations.push('Realizar auditoria mensal de dados retidos além do período legal')
    }

    if (issues.some(issue => issue.severity === 'critical')) {
      recommendations.push('Realizar revisão de compliance imediata com equipe jurídica')
      recommendations.push('Notificar autoridades competentes sobre violações críticas')
    }

    return recommendations
  }

  /**
   * Get compliance metrics for a clinic
   */
  async getComplianceMetrics(_clinicId: string): Promise<ComplianceMetrics> {
    // In production, this would filter by clinicId and calculate actual metrics
    return { ...this.complianceMetrics }
  }

  /**
   * Export audit trail for data subject access requests
   */
  async exportAuditTrail(
    patientId: string,
    clinicId: string,
    format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<{
    data: any
    filename: string
    generatedAt: Date
    recordCount: number
  }> {
    const patientEvents = this.auditEvents.filter(event =>
      event.patientId === patientId && event.clinicId === clinicId
    )

    const exportData = {
      patientId,
      clinicId,
      events: patientEvents,
      summary: {
        totalEvents: patientEvents.length,
        eventsByType: patientEvents.reduce((acc, event) => {
          acc[event.eventType] = (acc[event.eventType] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        dateRange: {
          earliest: Math.min(...patientEvents.map(e => e.timestamp.getTime())),
          latest: Math.max(...patientEvents.map(e => e.timestamp.getTime()))
        }
      }
    }

    const filename = `audit_trail_${patientId}_${new Date().toISOString().split('T')[0]}.${format}`

    return {
      data: format === 'json' ? exportData : this.convertFormat(exportData, format),
      filename,
      generatedAt: new Date(),
      recordCount: patientEvents.length
    }
  }

  /**
   * Convert export data to different formats
   */
  private convertFormat(data: any, format: string): any {
    switch (format) {
      case 'csv':
        // Convert to CSV format
        return this.convertToCSV(data)
      case 'pdf':
        // Would use PDF generation library
        return { format: 'pdf', data: 'PDF content would be generated here' }
      default:
        return data
    }
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any): string {
    const headers = [
      'Event ID', 'Event Type', 'Timestamp', 'Categories', 'Data Type', 
      'Legal Basis', 'Performed By', 'Compliance Status'
    ]
    
    const rows = data.events.map((event: ConsentAuditEvent) => [
      event.id,
      event.eventType,
      event.timestamp.toISOString(),
      event.categories.join(';'),
      event.dataType,
      event.legalBasis,
      event.performedBy.userId || event.performedBy.system,
      event.compliance.validationPassed ? 'Compliant' : 'Non-compliant'
    ])

    return [headers, ...rows]
      .map(row => row.map((cell: any) => `"${cell}"`).join(','))
      .join('\n')
  }
}

// Export singleton instance
export const consentAuditService = new ConsentAuditService()