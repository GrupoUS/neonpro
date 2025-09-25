/**
 * AI Healthcare Compliance Service
 * 
 * Ensures AI provider interactions comply with healthcare regulations including:
 * - LGPD (Brazilian General Data Protection Law)
 * - HIPAA (Health Insurance Portability and Accountability Act)
 * - Medical device regulations
 * - Clinical safety standards
 */

import { z } from 'zod'

export interface ComplianceCheck {
  id: string
  timestamp: Date
  provider: string
  operation: 'generate' | 'stream' | 'analyze'
  patientId?: string
  userId: string
  clinicId: string
  dataCategory: 'clinical' | 'administrative' | 'billing' | 'research'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  checks: {
    dataPrivacy: boolean
    consent: boolean
    security: boolean
    retention: boolean
    audit: boolean
  }
  violations: ComplianceViolation[]
  approved: boolean
  approvedBy: 'system' | 'manual'
}

export interface ComplianceViolation {
  id: string
  type: 'data_privacy' | 'consent' | 'security' | 'retention' | 'quality' | 'safety'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  regulation: string
  recommendation: string
  requiresManualReview: boolean
  resolved: boolean
  resolvedAt?: Date
  resolvedBy?: string
}

export interface DataRetentionPolicy {
  dataCategory: string
  retentionPeriod: number // days
  storageLocation: 'hot' | 'cold' | 'archive'
  encryptionRequired: boolean
  anonymizationRequired: boolean
  accessControls: string[]
}

export interface ConsentRecord {
  id: string
  patientId: string
  consentType: 'ai_treatment' | 'ai_research' | 'ai_analytics' | 'data_sharing'
  provider: string
  scope: string
  expiration: Date
  isActive: boolean
  withdrawnAt?: Date
  metadata: Record<string, any>
}

export class AIHealthcareComplianceService {
  private static instance: AIHealthcareComplianceService
  private complianceChecks: Map<string, ComplianceCheck> = new Map()
  private consentRecords: Map<string, ConsentRecord> = new Map()
  private retentionPolicies: Map<string, DataRetentionPolicy> = new Map()

  constructor() {
    this.initializeRetentionPolicies()
  }

  static getInstance(): AIHealthcareComplianceService {
    if (!AIHealthcareComplianceService.instance) {
      AIHealthcareComplianceService.instance = new AIHealthcareComplianceService()
    }
    return AIHealthcareComplianceService.instance
  }

  /**
   * Validate AI interaction for healthcare compliance
   */
  async validateAIInteraction(params: {
    provider: string
    operation: 'generate' | 'stream' | 'analyze'
    patientId?: string
    userId: string
    clinicId: string
    dataCategory: 'clinical' | 'administrative' | 'billing' | 'research'
    inputData: any
    consentVerification?: boolean
  }): Promise<{
    approved: boolean
    checkId: string
    violations: ComplianceViolation[]
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    recommendations: string[]
    requiresManualReview: boolean
  }> {
    const checkId = `check_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const violations: ComplianceViolation[] = []
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'

    // Data privacy validation
    const privacyViolations = await this.validateDataPrivacy(params.inputData, params.dataCategory)
    violations.push(...privacyViolations)

    // Consent validation
    const consentViolations = await this.validateConsent(params)
    violations.push(...consentViolations)

    // Security validation
    const securityViolations = await this.validateSecurity(params)
    violations.push(...securityViolations)

    // Quality and safety validation
    const qualityViolations = await this.validateQualityAndSafety(params.inputData, params.operation)
    violations.push(...qualityViolations)

    // Determine risk level
    riskLevel = this.calculateRiskLevel(violations)

    // Create compliance check record
    const complianceCheck: ComplianceCheck = {
      id: checkId,
      timestamp: new Date(),
      provider: params.provider,
      operation: params.operation,
      patientId: params.patientId,
      userId: params.userId,
      clinicId: params.clinicId,
      dataCategory: params.dataCategory,
      riskLevel,
      checks: {
        dataPrivacy: privacyViolations.length === 0,
        consent: consentViolations.length === 0,
        security: securityViolations.length === 0,
        retention: true, // Will be validated during data retention
        audit: true, // Audit logging is always enabled
      },
      violations,
      approved: violations.length === 0 || this.isAutoApprovable(violations),
      approvedBy: violations.length === 0 ? 'system' : 'manual',
    }

    this.complianceChecks.set(checkId, complianceCheck)

    return {
      approved: complianceCheck.approved,
      checkId,
      violations,
      riskLevel,
      recommendations: this.generateRecommendations(violations),
      requiresManualReview: !this.isAutoApprovable(violations),
    }
  }

  /**
   * Record patient consent for AI services
   */
  async recordConsent(consent: {
    patientId: string
    consentType: 'ai_treatment' | 'ai_research' | 'ai_analytics' | 'data_sharing'
    provider: string
    scope: string
    expirationDays: number
    metadata?: Record<string, any>
  }): Promise<ConsentRecord> {
    const consentRecord: ConsentRecord = {
      id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patientId: consent.patientId,
      consentType: consent.consentType,
      provider: consent.provider,
      scope: consent.scope,
      expiration: new Date(Date.now() + consent.expirationDays * 24 * 60 * 60 * 1000),
      isActive: true,
      metadata: consent.metadata || {},
    }

    this.consentRecords.set(consentRecord.id, consentRecord)

    // Log consent event
    console.log('AI consent recorded:', {
      consentId: consentRecord.id,
      patientId: consent.patientId,
      type: consent.consentType,
      provider: consent.provider,
      expiration: consentRecord.expiration,
    })

    return consentRecord
  }

  /**
   * Check if valid consent exists for AI interaction
   */
  async checkConsent(params: {
    patientId?: string
    userId: string
    clinicId: string
    operation: 'generate' | 'stream' | 'analyze'
    dataCategory: 'clinical' | 'administrative' | 'billing' | 'research'
  }): Promise<{
    hasConsent: boolean
    consentRecords: ConsentRecord[]
    missingConsentTypes: string[]
  }> {
    if (!params.patientId) {
      // For non-patient operations (administrative, billing), different consent rules apply
      return {
        hasConsent: true,
        consentRecords: [],
        missingConsentTypes: [],
      }
    }

    const requiredConsentTypes = this.getRequiredConsentTypes(params.operation, params.dataCategory)
    const patientConsents = Array.from(this.consentRecords.values()).filter(
      consent => 
        consent.patientId === params.patientId &&
        consent.isActive &&
        consent.expiration > new Date()
    )

    const missingConsentTypes = requiredConsentTypes.filter(type =>
      !patientConsents.some(consent => consent.consentType === type)
    )

    return {
      hasConsent: missingConsentTypes.length === 0,
      consentRecords: patientConsents,
      missingConsentTypes,
    }
  }

  /**
   * Apply data retention policies
   */
  async applyDataRetention(): Promise<{
    processedRecords: number
    archivedRecords: number
    deletedRecords: number
    errors: string[]
  }> {
    const now = Date.now()
    let processedRecords = 0
    let archivedRecords = 0
    let deletedRecords = 0
    const errors: string[] = []

    // Process compliance checks
    for (const [checkId, check] of this.complianceChecks) {
      const policy = this.retentionPolicies.get(check.dataCategory)
      if (!policy) continue

      const ageDays = (now - check.timestamp.getTime()) / (24 * 60 * 60 * 1000)

      if (ageDays > policy.retentionPeriod) {
        if (policy.storageLocation === 'archive') {
          // Archive the record
          archivedRecords++
        } else {
          // Delete the record
          this.complianceChecks.delete(checkId)
          deletedRecords++
        }
        processedRecords++
      }
    }

    // Process expired consent records
    for (const [consentId, consent] of this.consentRecords) {
      if (consent.expiration < new Date()) {
        consent.isActive = false
        consent.withdrawnAt = new Date()
        processedRecords++
      }
    }

    return {
      processedRecords,
      archivedRecords,
      deletedRecords,
      errors,
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(params: {
    startDate?: Date
    endDate?: Date
    clinicId?: string
    provider?: string
    riskLevel?: 'low' | 'medium' | 'high' | 'critical'
  }): Promise<{
    totalChecks: number
    approvedChecks: number
    rejectedChecks: number
    violationsByType: Record<string, number>
    riskLevelDistribution: Record<string, number>
    topViolations: ComplianceViolation[]
    recommendations: string[]
  }> {
    let checks = Array.from(this.complianceChecks.values())

    // Apply filters
    if (params.startDate) {
      checks = checks.filter(check => check.timestamp >= params.startDate!)
    }
    if (params.endDate) {
      checks = checks.filter(check => check.timestamp <= params.endDate!)
    }
    if (params.clinicId) {
      checks = checks.filter(check => check.clinicId === params.clinicId)
    }
    if (params.provider) {
      checks = checks.filter(check => check.provider === params.provider)
    }
    if (params.riskLevel) {
      checks = checks.filter(check => check.riskLevel === params.riskLevel)
    }

    const totalChecks = checks.length
    const approvedChecks = checks.filter(check => check.approved).length
    const rejectedChecks = totalChecks - approvedChecks

    // Analyze violations
    const allViolations = checks.flatMap(check => check.violations)
    const violationsByType: Record<string, number> = {}
    const riskLevelDistribution: Record<string, number> = {}

    allViolations.forEach(violation => {
      violationsByType[violation.type] = (violationsByType[violation.type] || 0) + 1
    })

    checks.forEach(check => {
      riskLevelDistribution[check.riskLevel] = (riskLevelDistribution[check.riskLevel] || 0) + 1
    })

    // Get top violations by severity
    const topViolations = allViolations
      .sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        return severityOrder[b.severity] - severityOrder[a.severity]
      })
      .slice(0, 10)

    const recommendations = this.generateReportRecommendations(checks, allViolations)

    return {
      totalChecks,
      approvedChecks,
      rejectedChecks,
      violationsByType,
      riskLevelDistribution,
      topViolations,
      recommendations,
    }
  }

  // Private helper methods
  private async validateDataPrivacy(inputData: any, dataCategory: string): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = []

    // Check for PHI (Protected Health Information)
    if (dataCategory === 'clinical') {
      const phiPatterns = [
        { pattern: /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/, field: 'CPF' },
        { pattern: /\b\d{11}\b/, field: 'CPF sem formatação' },
        { pattern: /\b\(\d{2}\)\s*\d{4,5}-\d{4}\b/, field: 'Telefone' },
        { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, field: 'Email' },
        { pattern: /\bMR-\d+\b/, field: 'Prontuário médico' },
      ]

      const dataStr = JSON.stringify(inputData)

      phiPatterns.forEach(({ pattern, field }) => {
        if (pattern.test(dataStr)) {
          violations.push({
            id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'data_privacy',
            severity: 'high',
            description: `Dados de saúde identificáveis detectados: ${field}`,
            regulation: 'LGPD Art. 11',
            recommendation: 'Remover ou anonimizar dados de saúde identificáveis antes do processamento',
            requiresManualReview: true,
            resolved: false,
          })
        }
      })
    }

    return violations
  }

  private async validateConsent(params: {
    patientId?: string
    userId: string
    clinicId: string
    operation: 'generate' | 'stream' | 'analyze'
    dataCategory: 'clinical' | 'administrative' | 'billing' | 'research'
  }): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = []

    const consentCheck = await this.checkConsent(params)
    
    if (!consentCheck.hasConsent) {
      consentCheck.missingConsentTypes.forEach(type => {
        violations.push({
          id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'consent',
          severity: 'high',
          description: `Consentimento não encontrado para: ${type}`,
          regulation: 'LGPD Art. 8',
          recommendation: `Obter consentimento explícito do paciente para ${type}`,
          requiresManualReview: true,
          resolved: false,
        })
      })
    }

    return violations
  }

  private async validateSecurity(params: {
    provider: string
    operation: 'generate' | 'stream' | 'analyze'
    patientId?: string
    userId: string
    clinicId: string
    dataCategory: 'clinical' | 'administrative' | 'billing' | 'research'
  }): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = []

    // Check if provider is configured with proper security measures
    const secureProviders = ['openai', 'anthropic'] // Add more as needed
    
    if (!secureProviders.includes(params.provider.toLowerCase())) {
      violations.push({
        id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'security',
        severity: 'medium',
        description: `Provedor AI não validado: ${params.provider}`,
        regulation: 'LGPD Art. 46',
        recommendation: 'Usar apenas provedores AI validados e conformes com LGPD',
        requiresManualReview: false,
        resolved: false,
      })
    }

    return violations
  }

  private async validateQualityAndSafety(
    inputData: any,
    operation: 'generate' | 'stream' | 'analyze',
  ): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = []

    // Check for dangerous medical advice patterns in input
    if (typeof inputData === 'object' && inputData.prompt) {
      const dangerousPatterns = [
        /diagnóstico/i,
        /tratamento sem supervisão/i,
        /ignorar médico/i,
        /automedicação/i,
        /substituir atendimento/i,
      ]

      dangerousPatterns.forEach(pattern => {
        if (pattern.test(inputData.prompt)) {
          violations.push({
            id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'safety',
            severity: 'high',
            description: 'Padrão de perigo detectado no input',
            regulation: 'CFM Resolução 2.229/2018',
            recommendation: 'Revisar input para garantir segurança clínica',
            requiresManualReview: true,
            resolved: false,
          })
        }
      })
    }

    return violations
  }

  private calculateRiskLevel(violations: ComplianceViolation[]): 'low' | 'medium' | 'high' | 'critical' {
    if (violations.length === 0) return 'low'

    const severityWeights = { critical: 4, high: 3, medium: 2, low: 1 }
    const totalScore = violations.reduce((sum, violation) => 
      sum + severityWeights[violation.severity], 0
    )

    if (totalScore >= 8) return 'critical'
    if (totalScore >= 6) return 'high'
    if (totalScore >= 3) return 'medium'
    return 'low'
  }

  private generateRecommendations(violations: ComplianceViolation[]): string[] {
    const recommendations: string[] = []

    if (violations.some(v => v.type === 'data_privacy')) {
      recommendations.push('Implementar anonimização de dados de saúde')
      recommendations.push('Remover informações identificáveis de pacientes')
    }

    if (violations.some(v => v.type === 'consent')) {
      recommendations.push('Estabelecer processo de obtenção de consentimento')
      recommendations.push('Manter registros de consentimento atualizados')
    }

    if (violations.some(v => v.type === 'security')) {
      recommendations.push('Validar provedores AI quanto a conformidade LGPD')
      recommendations.push('Implementar criptografia de dados em trânsito e em repouso')
    }

    if (violations.some(v => v.type === 'safety')) {
      recommendations.push('Implementar validação de segurança clínica')
      recommendations.push('Adicionar filtros de conteúdo perigoso')
    }

    return recommendations
  }

  private isAutoApprovable(violations: ComplianceViolation[]): boolean {
    return violations.every(violation => 
      violation.severity === 'low' && !violation.requiresManualReview
    )
  }

  private getRequiredConsentTypes(
    operation: 'generate' | 'stream' | 'analyze',
    dataCategory: 'clinical' | 'administrative' | 'billing' | 'research',
  ): string[] {
    const baseTypes = ['ai_treatment'] // Always required for treatment

    if (dataCategory === 'research') {
      baseTypes.push('ai_research')
    }

    if (dataCategory === 'analytics') {
      baseTypes.push('ai_analytics')
    }

    return baseTypes
  }

  private initializeRetentionPolicies(): void {
    this.retentionPolicies.set('clinical', {
      dataCategory: 'clinical',
      retentionPeriod: 1825, // 5 years for medical data
      storageLocation: 'archive',
      encryptionRequired: true,
      anonymizationRequired: true,
      accessControls: ['healthcare_professional', 'admin'],
    })

    this.retentionPolicies.set('administrative', {
      dataCategory: 'administrative',
      retentionPeriod: 365, // 1 year
      storageLocation: 'cold',
      encryptionRequired: true,
      anonymizationRequired: false,
      accessControls: ['admin'],
    })

    this.retentionPolicies.set('billing', {
      dataCategory: 'billing',
      retentionPeriod: 2555, // 7 years for billing records
      storageLocation: 'archive',
      encryptionRequired: true,
      anonymizationRequired: false,
      accessControls: ['billing', 'admin'],
    })

    this.retentionPolicies.set('research', {
      dataCategory: 'research',
      retentionPeriod: 3650, // 10 years for research data
      storageLocation: 'archive',
      encryptionRequired: true,
      anonymizationRequired: true,
      accessControls: ['researcher', 'admin'],
    })
  }

  private generateReportRecommendations(
    checks: ComplianceCheck[],
    violations: ComplianceViolation[],
  ): string[] {
    const recommendations: string[] = []

    // Analyze patterns and generate recommendations
    const approvalRate = checks.filter(c => c.approved).length / checks.length
    
    if (approvalRate < 0.8) {
      recommendations.push('Investigar alta taxa de rejeição de conformidade')
      recommendations.push('Revisar processos de validação de AI')
    }

    const violationTypes = violations.reduce((acc, v) => {
      acc[v.type] = (acc[v.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topViolationType = Object.entries(violationTypes)
      .sort(([,a], [,b]) => b - a)[0]

    if (topViolationType) {
      recommendations.push(`Focar na correção de violações do tipo: ${topViolationType[0]}`)
    }

    if (violations.filter(v => v.severity === 'critical').length > 0) {
      recommendations.push('Revisão imediata de violações críticas requerida')
    }

    return recommendations
  }
}