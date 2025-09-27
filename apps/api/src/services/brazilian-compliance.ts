/**
 * Brazilian Healthcare Compliance Validation Service
 * T082 - Brazilian Healthcare Compliance Validation
 *
 * Orchestrates compliance validation across all Brazilian healthcare regulatory frameworks:
 * - LGPD (Lei Geral de Proteção de Dados) - Data Protection
 * - ANVISA (Agência Nacional de Vigilância Sanitária) - Medical Device Regulations
 * - CFM (Conselho Federal de Medicina) - Professional Standards
 *
 * Features:
 * - Comprehensive compliance validation
 * - Automated compliance reporting
 * - Healthcare data security validation
 * - Brazilian healthcare interoperability standards
 * - Actionable recommendations and remediation plans
 */

import ANVISAComplianceService, {
  ANVISA_COMPLIANCE_LEVELS,
  ANVISA_DEVICE_CLASSES,
  ANVISA_SOFTWARE_CATEGORIES,
  type ANVISAComplianceReport,
} from './anvisa-compliance.js'
import CFMComplianceService, {
  CFM_COMPLIANCE_LEVELS,
  type CFMComplianceReport,
} from './cfm-compliance.js'
import LGPDComplianceService, {
  LGPD_COMPLIANCE_LEVELS,
  type LGPDComplianceReport,
} from './lgpd-compliance.js'

// Brazilian Compliance Levels
export const BRAZILIAN_COMPLIANCE_LEVELS = {
  FULLY_COMPLIANT: 'fully_compliant',
  MOSTLY_COMPLIANT: 'mostly_compliant',
  PARTIALLY_COMPLIANT: 'partially_compliant',
  NON_COMPLIANT: 'non_compliant',
  UNDER_REVIEW: 'under_review',
} as const

export type BrazilianComplianceLevel =
  (typeof BRAZILIAN_COMPLIANCE_LEVELS)[keyof typeof BRAZILIAN_COMPLIANCE_LEVELS]

// Healthcare Data Security Levels
export const HEALTHCARE_SECURITY_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  CRITICAL: 'critical',
} as const

export type HealthcareSecurityLevel =
  (typeof HEALTHCARE_SECURITY_LEVELS)[keyof typeof HEALTHCARE_SECURITY_LEVELS]

// Brazilian Healthcare Compliance Configuration
export const BrazilianComplianceConfigSchema = z.object({
  organizationName: z.string(),
  organizationType: z.enum([
    'clinic',
    'hospital',
    'telemedicine',
    'health_tech',
  ]),
  anvisaDeviceClass: z.nativeEnum(ANVISA_DEVICE_CLASSES),
  anvisaSoftwareCategory: z.nativeEnum(ANVISA_SOFTWARE_CATEGORIES),
  patientDataVolume: z.enum(['low', 'medium', 'high', 'very_high']),
  telemedicineEnabled: z.boolean(),
  internationalOperations: z.boolean(),
  auditFrequency: z.enum(['monthly', 'quarterly', 'semi_annual', 'annual']),
  complianceOfficer: z.string(),
  ethicsCommittee: z.boolean(),
})

export type BrazilianComplianceConfig = z.infer<
  typeof BrazilianComplianceConfigSchema
>

// Comprehensive Brazilian Compliance Report
export interface BrazilianComplianceReport {
  overallCompliance: BrazilianComplianceLevel
  overallScore: number // 0-100
  securityLevel: HealthcareSecurityLevel
  lastAuditDate: Date
  nextAuditDate: Date

  // Individual compliance reports
  lgpdCompliance: LGPDComplianceReport
  anvisaCompliance: ANVISAComplianceReport
  cfmCompliance: CFMComplianceReport

  // Healthcare data security validation
  healthcareDataSecurity: {
    level: HealthcareSecurityLevel
    encryptionCompliance: boolean
    accessControlCompliance: boolean
    auditTrailCompliance: boolean
    backupCompliance: boolean
    incidentResponseCompliance: boolean
    issues: Array<{
      id: string
      severity: 'critical' | 'high' | 'medium' | 'low'
      title: string
      description: string
      recommendation: string
    }>
  }

  // Brazilian healthcare interoperability
  interoperabilityCompliance: {
    level: BrazilianComplianceLevel
    hl7FhirCompliance: boolean
    tissStandardsCompliance: boolean
    susIntegrationCompliance: boolean
    dataExchangeCompliance: boolean
    issues: Array<{
      id: string
      severity: 'critical' | 'high' | 'medium' | 'low'
      title: string
      description: string
      recommendation: string
    }>
  }

  // Consolidated recommendations
  priorityRecommendations: string[]
  allRecommendations: string[]

  // Compliance summary
  summary: {
    totalIssues: number
    criticalIssues: number
    highPriorityIssues: number
    mediumPriorityIssues: number
    lowPriorityIssues: number
    compliancePercentage: number
    estimatedRemediationTime: string
    estimatedRemediationCost: 'low' | 'medium' | 'high' | 'very_high'
  }

  // Regulatory status
  regulatoryStatus: {
    lgpdStatus: 'compliant' | 'non_compliant' | 'partial'
    anvisaStatus: 'compliant' | 'non_compliant' | 'partial'
    cfmStatus: 'compliant' | 'non_compliant' | 'partial'
    ethicsCommitteeReviewRequired: boolean
    regulatoryFilingRequired: boolean
    auditRecommended: boolean
  }
}

/**
 * Brazilian Healthcare Compliance Validation Service
 */
export class BrazilianComplianceService {
  private lgpdService: LGPDComplianceService
  private anvisaService: ANVISAComplianceService
  private cfmService: CFMComplianceService

  constructor() {
    this.lgpdService = new LGPDComplianceService()
    this.anvisaService = new ANVISAComplianceService()
    this.cfmService = new CFMComplianceService()
  }

  /**
   * Perform comprehensive Brazilian healthcare compliance validation
   */
  async validateCompliance(
    config: BrazilianComplianceConfig,
    patientId?: string,
  ): Promise<BrazilianComplianceReport> {
    // Run all compliance validations in parallel
    const [lgpdCompliance, anvisaCompliance, cfmCompliance] = await Promise.all(
      [
        this.lgpdService.validateCompliance(patientId),
        this.anvisaService.validateCompliance(
          config.anvisaDeviceClass,
          config.anvisaSoftwareCategory,
        ),
        this.cfmService.validateCompliance(),
      ],
    )

    // Validate healthcare data security
    const healthcareDataSecurity = await this.validateHealthcareDataSecurity()

    // Validate Brazilian healthcare interoperability
    const interoperabilityCompliance = await this.validateInteroperabilityCompliance()

    // Calculate overall compliance
    const overallCompliance = this.calculateOverallCompliance(
      lgpdCompliance,
      anvisaCompliance,
      cfmCompliance,
    )

    const overallScore = this.calculateOverallScore(
      lgpdCompliance,
      anvisaCompliance,
      cfmCompliance,
    )

    const securityLevel = this.determineSecurityLevel(healthcareDataSecurity)

    // Generate consolidated recommendations
    const { priorityRecommendations, allRecommendations } = this
      .generateConsolidatedRecommendations(
        lgpdCompliance,
        anvisaCompliance,
        cfmCompliance,
        healthcareDataSecurity,
        interoperabilityCompliance,
      )

    // Generate compliance summary
    const summary = this.generateComplianceSummary(
      lgpdCompliance,
      anvisaCompliance,
      cfmCompliance,
      healthcareDataSecurity,
      interoperabilityCompliance,
    )

    // Determine regulatory status
    const regulatoryStatus = this.determineRegulatoryStatus(
      lgpdCompliance,
      anvisaCompliance,
      cfmCompliance,
    )

    return {
      overallCompliance,
      overallScore,
      securityLevel,
      lastAuditDate: new Date(),
      nextAuditDate: this.calculateNextAuditDate(config.auditFrequency),
      lgpdCompliance,
      anvisaCompliance,
      cfmCompliance,
      healthcareDataSecurity,
      interoperabilityCompliance,
      priorityRecommendations,
      allRecommendations,
      summary,
      regulatoryStatus,
    }
  }

  /**
   * Validate healthcare data security
   */
  private async validateHealthcareDataSecurity() {
    // Mock implementation - would perform actual security validation
    const encryptionCompliance = true
    const accessControlCompliance = true
    const auditTrailCompliance = true
    const backupCompliance = true
    const incidentResponseCompliance = false // Intentionally set to false for testing

    const issues = []

    if (!incidentResponseCompliance) {
      issues.push({
        id: 'missing-incident-response',
        severity: 'high' as const,
        title: 'Plano de resposta a incidentes ausente',
        description: 'Sistema não possui plano de resposta a incidentes de segurança',
        recommendation: 'Implementar plano de resposta a incidentes de segurança de dados de saúde',
      })
    }

    const level = issues.some(i => i.severity === 'critical')
      ? HEALTHCARE_SECURITY_LEVELS.CRITICAL
      : issues.some(i => i.severity === 'high')
      ? HEALTHCARE_SECURITY_LEVELS.MEDIUM
      : issues.length > 0
      ? HEALTHCARE_SECURITY_LEVELS.LOW
      : HEALTHCARE_SECURITY_LEVELS.HIGH

    return {
      level,
      encryptionCompliance,
      accessControlCompliance,
      auditTrailCompliance,
      backupCompliance,
      incidentResponseCompliance,
      issues,
    }
  }

  /**
   * Validate Brazilian healthcare interoperability compliance
   */
  private async validateInteroperabilityCompliance() {
    // Mock implementation - would perform actual interoperability validation
    const hl7FhirCompliance = false // From ANVISA service
    const tissStandardsCompliance = true
    const susIntegrationCompliance = false // Intentionally set to false for testing
    const dataExchangeCompliance = true

    const issues = []

    if (!susIntegrationCompliance) {
      issues.push({
        id: 'missing-sus-integration',
        severity: 'medium' as const,
        title: 'Integração com SUS ausente',
        description: 'Sistema não possui integração com o Sistema Único de Saúde (SUS)',
        recommendation: 'Implementar integração com sistemas SUS conforme padrões nacionais',
      })
    }

    const level = issues.some(i => i.severity === 'critical')
      ? BRAZILIAN_COMPLIANCE_LEVELS.NON_COMPLIANT
      : issues.length > 0
      ? BRAZILIAN_COMPLIANCE_LEVELS.PARTIALLY_COMPLIANT
      : BRAZILIAN_COMPLIANCE_LEVELS.FULLY_COMPLIANT

    return {
      level,
      hl7FhirCompliance,
      tissStandardsCompliance,
      susIntegrationCompliance,
      dataExchangeCompliance,
      issues,
    }
  }

  /**
   * Calculate overall compliance level
   */
  private calculateOverallCompliance(
    lgpd: LGPDComplianceReport,
    anvisa: ANVISAComplianceReport,
    cfm: CFMComplianceReport,
  ): BrazilianComplianceLevel {
    const nonCompliantCount = [
      lgpd.overallCompliance === LGPD_COMPLIANCE_LEVELS.NON_COMPLIANT,
      anvisa.overallCompliance === ANVISA_COMPLIANCE_LEVELS.NON_COMPLIANT,
      cfm.overallCompliance === CFM_COMPLIANCE_LEVELS.NON_COMPLIANT,
    ].filter(Boolean).length

    const partialCount = [
      lgpd.overallCompliance === LGPD_COMPLIANCE_LEVELS.PARTIAL,
      anvisa.overallCompliance === ANVISA_COMPLIANCE_LEVELS.PARTIAL,
      cfm.overallCompliance === CFM_COMPLIANCE_LEVELS.PARTIAL,
    ].filter(Boolean).length

    if (nonCompliantCount > 0) {
      return BRAZILIAN_COMPLIANCE_LEVELS.NON_COMPLIANT
    }
    if (partialCount > 1) {
      return BRAZILIAN_COMPLIANCE_LEVELS.PARTIALLY_COMPLIANT
    }
    if (partialCount === 1) {
      return BRAZILIAN_COMPLIANCE_LEVELS.MOSTLY_COMPLIANT
    }
    return BRAZILIAN_COMPLIANCE_LEVELS.FULLY_COMPLIANT
  }

  /**
   * Calculate overall compliance score
   */
  private calculateOverallScore(
    lgpd: LGPDComplianceReport,
    anvisa: ANVISAComplianceReport,
    cfm: CFMComplianceReport,
  ): number {
    // Weighted average: LGPD (40%), ANVISA (35%), CFM (25%)
    return Math.round(
      lgpd.score * 0.4 + anvisa.score * 0.35 + cfm.score * 0.25,
    )
  }

  /**
   * Determine security level
   */
  private determineSecurityLevel(
    healthcareDataSecurity: any,
  ): HealthcareSecurityLevel {
    return healthcareDataSecurity.level
  }

  /**
   * Generate consolidated recommendations
   */
  private generateConsolidatedRecommendations(
    lgpd: LGPDComplianceReport,
    anvisa: ANVISAComplianceReport,
    cfm: CFMComplianceReport,
    _security: any,
    _interoperability: any,
  ) {
    const allRecommendations = [
      ...lgpd.recommendations,
      ...anvisa.recommendations,
      ...cfm.recommendations,
    ]

    // Priority recommendations (critical and high severity issues)
    const priorityRecommendations = allRecommendations.filter(
      rec =>
        rec.includes('urgentemente') ||
        rec.includes('crítico') ||
        rec.includes('alta prioridade'),
    )

    return { priorityRecommendations, allRecommendations }
  }

  /**
   * Generate compliance summary
   */
  private generateComplianceSummary(
    lgpd: LGPDComplianceReport,
    anvisa: ANVISAComplianceReport,
    cfm: CFMComplianceReport,
    _security: any,
    _interoperability: any,
  ) {
    const allIssues = [
      ...this.extractIssuesFromReport(lgpd),
      ...this.extractIssuesFromReport(anvisa),
      ...this.extractIssuesFromReport(cfm),
      ...security.issues,
      ...interoperability.issues,
    ]

    const totalIssues = allIssues.length
    const criticalIssues = allIssues.filter(
      i => i.severity === 'critical',
    ).length
    const highPriorityIssues = allIssues.filter(
      i => i.severity === 'high',
    ).length
    const mediumPriorityIssues = allIssues.filter(
      i => i.severity === 'medium',
    ).length
    const lowPriorityIssues = allIssues.filter(
      i => i.severity === 'low',
    ).length

    const compliancePercentage = Math.round(
      (lgpd.score + anvisa.score + cfm.score) / 3,
    )

    const estimatedRemediationTime = criticalIssues > 0
      ? '30-60 dias'
      : highPriorityIssues > 0
      ? '60-90 dias'
      : mediumPriorityIssues > 0
      ? '90-120 dias'
      : '30 dias'

    const estimatedRemediationCost = criticalIssues > 0
      ? 'very_high'
      : highPriorityIssues > 0
      ? 'high'
      : mediumPriorityIssues > 0
      ? 'medium'
      : 'low'

    return {
      totalIssues,
      criticalIssues,
      highPriorityIssues,
      mediumPriorityIssues,
      lowPriorityIssues,
      compliancePercentage,
      estimatedRemediationTime,
      estimatedRemediationCost: estimatedRemediationCost as
        | 'low'
        | 'medium'
        | 'high'
        | 'very_high',
    }
  }

  /**
   * Determine regulatory status
   */
  private determineRegulatoryStatus(
    lgpd: LGPDComplianceReport,
    anvisa: ANVISAComplianceReport,
    cfm: CFMComplianceReport,
  ) {
    return {
      lgpdStatus: lgpd.overallCompliance === LGPD_COMPLIANCE_LEVELS.COMPLIANT
        ? 'compliant'
        : lgpd.overallCompliance === LGPD_COMPLIANCE_LEVELS.PARTIAL
        ? 'partial'
        : 'non_compliant',
      anvisaStatus: anvisa.overallCompliance === ANVISA_COMPLIANCE_LEVELS.COMPLIANT
        ? 'compliant'
        : anvisa.overallCompliance === ANVISA_COMPLIANCE_LEVELS.PARTIAL
        ? 'partial'
        : 'non_compliant',
      cfmStatus: cfm.overallCompliance === CFM_COMPLIANCE_LEVELS.COMPLIANT
        ? 'compliant'
        : cfm.overallCompliance === CFM_COMPLIANCE_LEVELS.PARTIAL
        ? 'partial'
        : 'non_compliant',
      ethicsCommitteeReviewRequired: cfm.ethicsCommitteeReview,
      regulatoryFilingRequired: anvisa.registrationStatus === 'required',
      auditRecommended: lgpd.score < 90 || anvisa.score < 90 || cfm.score < 90,
    } as const
  }

  /**
   * Calculate next audit date
   */
  private calculateNextAuditDate(frequency: string): Date {
    const now = new Date()
    switch (frequency) {
      case 'monthly':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      case 'quarterly':
        return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
      case 'semi_annual':
        return new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000)
      case 'annual':
        return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
      default:
        return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
    }
  }

  /**
   * Extract issues from compliance reports
   */
  private extractIssuesFromReport(report: any): Array<{ severity: string }> {
    const issues = []

    // Extract issues from different compliance areas
    Object.values(report).forEach((value: any) => {
      if (value && typeof value === 'object' && Array.isArray(value.issues)) {
        issues.push(...value.issues)
      }
    })

    return issues
  }
}

export default BrazilianComplianceService
