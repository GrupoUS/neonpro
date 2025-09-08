/**
 * EvidenceCollector - Systematic audit evidence collection and management system
 * Organizes, validates, and manages evidence for compliance audits across all frameworks
 */

import type { ComplianceFramework, } from '../types'

export interface EvidenceTemplate {
  id: string
  framework: ComplianceFramework
  category: string
  type: 'document' | 'screenshot' | 'log' | 'report' | 'certificate' | 'policy'
  title: string
  description: string
  required: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  tags: string[]
  acceptedFormats: string[]
  validationRules: EvidenceValidationRule[]
  examples: EvidenceExample[]
  relatedRequirements: string[]
}

export interface EvidenceValidationRule {
  id: string
  type: 'format' | 'content' | 'metadata' | 'timestamp' | 'signature'
  description: string
  rule: string
  required: boolean
  errorMessage: string
}

export interface EvidenceExample {
  title: string
  description: string
  samplePath?: string
  checklist: string[]
}

export interface EvidenceCollection {
  id: string
  name: string
  framework: ComplianceFramework
  auditPreparationId: string
  status: 'planning' | 'collecting' | 'review' | 'complete'
  createdAt: Date
  updatedAt: Date
  targetEvidence: EvidenceTarget[]
  collectedEvidence: CollectedEvidence[]
  progress: {
    required: number
    collected: number
    validated: number
    percentage: number
  }
  gaps: EvidenceGap[]
  qualityScore: number // 0-100
}

export interface EvidenceTarget {
  templateId: string
  required: boolean
  dueDate?: Date
  assignedTo?: string
  notes?: string
  status: 'pending' | 'in_progress' | 'collected' | 'validated'
}

export interface CollectedEvidence {
  id: string
  type: 'document' | 'screenshot' | 'log' | 'report' | 'certificate' | 'policy'
  title: string
  description: string
  framework: ComplianceFramework
  category: string
  templateId?: string
  collectionMethod: 'manual_upload' | 'automated_capture' | 'system_export' | 'api_import'
  validationStatus: 'pending' | 'valid' | 'invalid' | 'warning'
  validationErrors: string[]
  metadata: Record<string, unknown>
  backupCopies?: string[]
  digitalSignature?: string
  witnessedBy?: string
  createdAt: Date
  updatedAt: Date
  verified: boolean
  filePath?: string
  confidentialityLevel?: 'public' | 'internal' | 'confidential' | 'restricted'
  tags: string[]
  relatedRequirements: string[]
}

export interface EvidenceGap {
  templateId: string
  requirement: string
  impact: 'low' | 'medium' | 'high' | 'critical'
  recommendation: string
  alternativeEvidence?: string[]
  deadline?: Date
}

export interface EvidenceValidationResult {
  evidenceId: string
  valid: boolean
  score: number // 0-100
  errors: string[]
  warnings: string[]
  recommendations: string[]
  validatedAt: Date
  validatedBy: string
}

export class EvidenceCollector {
  private templates: Map<string, EvidenceTemplate> = new Map()
  private collections: Map<string, EvidenceCollection> = new Map()

  constructor() {
    this.initializeEvidenceTemplates()
  }

  /**
   * Create new evidence collection for audit preparation
   */
  async createEvidenceCollection(
    name: string,
    framework: ComplianceFramework,
    auditPreparationId: string,
    scope?: string[],
  ): Promise<EvidenceCollection> {
    console.log(`📁 Creating evidence collection: ${name} for ${framework}`,)

    // Get relevant evidence templates
    const relevantTemplates = Array.from(this.templates.values(),).filter(template =>
      template.framework === framework
      && (scope ? scope.some(s => template.category.includes(s,)) : true)
    )

    const collection: EvidenceCollection = {
      id: `collection_${Date.now()}`,
      name,
      framework,
      auditPreparationId,
      status: 'planning',
      createdAt: new Date(),
      updatedAt: new Date(),
      targetEvidence: relevantTemplates.map(template => ({
        templateId: template.id,
        required: template.required,
        status: 'pending' as const,
      })),
      collectedEvidence: [],
      progress: {
        required: relevantTemplates.filter(t => t.required).length,
        collected: 0,
        validated: 0,
        percentage: 0,
      },
      gaps: [],
      qualityScore: 0,
    }

    this.collections.set(collection.id, collection,)

    console.log(
      `✅ Evidence collection created: ${collection.id} (${collection.targetEvidence.length} targets)`,
    )
    return collection
  }

  /**
   * Add evidence to collection
   */
  async addEvidence(
    collectionId: string,
    evidence: Omit<
      CollectedEvidence,
      'id' | 'createdAt' | 'updatedAt' | 'verified' | 'validationStatus' | 'validationErrors'
    >,
  ): Promise<CollectedEvidence> {
    const collection = this.collections.get(collectionId,)
    if (!collection) {
      throw new Error(`Evidence collection not found: ${collectionId}`,)
    }

    const newEvidence: CollectedEvidence = {
      ...evidence,
      id: `evidence_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      verified: false,
      validationStatus: 'pending',
      validationErrors: [],
    }

    // Auto-validate evidence
    const validationResult = await this.validateEvidence(newEvidence,)
    newEvidence.validationStatus = validationResult.valid ? 'valid' : 'invalid'
    newEvidence.validationErrors = validationResult.errors

    collection.collectedEvidence.push(newEvidence,)

    // Update target status if applicable
    if (evidence.templateId) {
      const target = collection.targetEvidence.find(t => t.templateId === evidence.templateId)
      if (target) {
        target.status = validationResult.valid ? 'collected' : 'in_progress'
      }
    }

    // Update collection progress
    await this.updateCollectionProgress(collection,)

    console.log(
      `📄 Evidence added: ${evidence.title} (${validationResult.valid ? 'valid' : 'needs review'})`,
    )
    return newEvidence
  }

  /**
   * Validate evidence against template rules
   */
  async validateEvidence(evidence: CollectedEvidence,): Promise<EvidenceValidationResult> {
    console.log(`🔍 Validating evidence: ${evidence.title}`,)

    const errors: string[] = []
    const warnings: string[] = []
    const recommendations: string[] = []
    let score = 100

    // Get template if available
    const template = evidence.templateId ? this.templates.get(evidence.templateId,) : null

    if (template) {
      // Validate against template rules
      for (const rule of template.validationRules) {
        const ruleResult = await this.applyValidationRule(evidence, rule,)
        if (!ruleResult.passed) {
          if (rule.required) {
            errors.push(rule.errorMessage,)
            score -= 20
          } else {
            warnings.push(rule.errorMessage,)
            score -= 5
          }
        }
      }

      // Check format acceptance
      if (evidence.filePath && template.acceptedFormats.length > 0) {
        const fileExtension = evidence.filePath.split('.',).pop()?.toLowerCase()
        if (fileExtension && !template.acceptedFormats.includes(fileExtension,)) {
          warnings.push(
            `File format .${fileExtension} not in preferred formats: ${
              template.acceptedFormats.join(', ',)
            }`,
          )
          score -= 10
        }
      }
    }

    // General validation checks
    if (!evidence.title || evidence.title.length < 5) {
      errors.push('Evidence title must be at least 5 characters',)
      score -= 15
    }

    if (!evidence.description || evidence.description.length < 20) {
      warnings.push('Evidence description should be more detailed',)
      score -= 5
    }

    if (
      evidence.confidentialityLevel === 'public'
      && evidence.tags.some(tag => tag.includes('sensitive',))
    ) {
      warnings.push('Confidentiality level may be incorrect for sensitive evidence',)
      score -= 10
    }

    // Generate recommendations
    if (evidence.relatedRequirements.length === 0) {
      recommendations.push('Link this evidence to specific audit requirements',)
    }

    if (!evidence.digitalSignature && evidence.type === 'document') {
      recommendations.push('Consider adding digital signature for document authenticity',)
    }

    const result: EvidenceValidationResult = {
      evidenceId: evidence.id,
      valid: errors.length === 0,
      score: Math.max(0, score,),
      errors,
      warnings,
      recommendations,
      validatedAt: new Date(),
      validatedBy: 'system',
    }

    console.log(
      `${
        result.valid ? '✅' : '❌'
      } Evidence validation: ${result.score}% (${errors.length} errors, ${warnings.length} warnings)`,
    )
    return result
  }

  /**
   * Generate evidence collection report
   */
  async generateCollectionReport(collectionId: string,): Promise<{
    summary: {
      totalTargets: number
      requiredTargets: number
      collectedCount: number
      validatedCount: number
      completionPercentage: number
      qualityScore: number
    }
    byCategory: Record<string, {
      targets: number
      collected: number
      percentage: number
    }>
    gaps: EvidenceGap[]
    qualityIssues: {
      evidenceId: string
      title: string
      issues: string[]
      recommendations: string[]
    }[]
    recommendations: string[]
  }> {
    const collection = this.collections.get(collectionId,)
    if (!collection) {
      throw new Error(`Evidence collection not found: ${collectionId}`,)
    }

    console.log(`📊 Generating collection report for ${collection.name}`,)

    // Calculate summary metrics
    const summary = {
      totalTargets: collection.targetEvidence.length,
      requiredTargets: collection.targetEvidence.filter(t => t.required).length,
      collectedCount: collection.collectedEvidence.length,
      validatedCount:
        collection.collectedEvidence.filter(e => e.validationStatus === 'valid').length,
      completionPercentage: collection.progress.percentage,
      qualityScore: collection.qualityScore,
    }

    // Group by category
    const byCategory: Record<string, { targets: number; collected: number; percentage: number }> =
      {}

    for (const target of collection.targetEvidence) {
      const template = this.templates.get(target.templateId,)
      if (template) {
        if (!byCategory[template.category]) {
          byCategory[template.category] = { targets: 0, collected: 0, percentage: 0, }
        }
        byCategory[template.category].targets++

        if (target.status === 'collected' || target.status === 'validated') {
          byCategory[template.category].collected++
        }
      }
    }

    // Calculate category percentages
    for (const category of Object.keys(byCategory,)) {
      const data = byCategory[category]
      data.percentage = data.targets > 0 ? Math.round((data.collected / data.targets) * 100,) : 0
    }

    // Identify quality issues
    const qualityIssues = []
    for (const evidence of collection.collectedEvidence) {
      if (evidence.validationStatus !== 'valid') {
        const validation = await this.validateEvidence(evidence,)
        qualityIssues.push({
          evidenceId: evidence.id,
          title: evidence.title,
          issues: [...validation.errors, ...validation.warnings,],
          recommendations: validation.recommendations,
        },)
      }
    }

    // Generate overall recommendations
    const recommendations = this.generateCollectionRecommendations(collection,)

    const report = {
      summary,
      byCategory,
      gaps: collection.gaps,
      qualityIssues,
      recommendations,
    }

    console.log(
      `✅ Collection report generated: ${summary.completionPercentage}% complete, ${qualityIssues.length} quality issues`,
    )
    return report
  }

  /**
   * Suggest missing evidence based on audit requirements
   */
  async suggestMissingEvidence(collectionId: string,): Promise<EvidenceGap[]> {
    const collection = this.collections.get(collectionId,)
    if (!collection) {
      throw new Error(`Evidence collection not found: ${collectionId}`,)
    }

    const gaps: EvidenceGap[] = []

    // Check for uncollected required evidence
    for (const target of collection.targetEvidence) {
      if (target.required && target.status === 'pending') {
        const template = this.templates.get(target.templateId,)
        if (template) {
          gaps.push({
            templateId: template.id,
            requirement: template.title,
            impact: template.priority === 'critical'
              ? 'critical'
              : template.priority === 'high'
              ? 'high'
              : 'medium',
            recommendation: `Collect: ${template.description}`,
            alternativeEvidence: this.suggestAlternativeEvidence(template,),
            deadline: target.dueDate,
          },)
        }
      }
    }

    // Update collection gaps
    collection.gaps = gaps

    console.log(`🔍 Found ${gaps.length} evidence gaps`,)
    return gaps
  }

  /**
   * Auto-collect evidence from system
   */
  async autoCollectEvidence(
    collectionId: string,
    evidenceTypes: string[],
  ): Promise<CollectedEvidence[]> {
    const collection = this.collections.get(collectionId,)
    if (!collection) {
      throw new Error(`Evidence collection not found: ${collectionId}`,)
    }

    console.log(`🤖 Auto-collecting evidence types: ${evidenceTypes.join(', ',)}`,)

    const autoCollected: CollectedEvidence[] = []

    for (const type of evidenceTypes) {
      try {
        const evidence = await this.performAutoCollection(collection.framework, type,)
        if (evidence) {
          const addedEvidence = await this.addEvidence(collectionId, evidence as any,)
          autoCollected.push(addedEvidence,)
        }
      } catch (error) {
        console.error(`Error auto-collecting ${type}:`, error,)
      }
    }

    console.log(`✅ Auto-collected ${autoCollected.length} evidence items`,)
    return autoCollected
  }

  /**
   * Get evidence collection by ID
   */
  getEvidenceCollection(collectionId: string,): EvidenceCollection | undefined {
    return this.collections.get(collectionId,)
  }

  /**
   * Get all evidence collections
   */
  getAllEvidenceCollections(): EvidenceCollection[] {
    return Array.from(this.collections.values(),)
  }

  /**
   * Get evidence templates by framework
   */
  getEvidenceTemplates(framework?: ComplianceFramework,): EvidenceTemplate[] {
    const allTemplates = Array.from(this.templates.values(),)
    return framework ? allTemplates.filter(t => t.framework === framework) : allTemplates
  }

  /**
   * Initialize built-in evidence templates
   */
  private initializeEvidenceTemplates(): void {
    // WCAG Evidence Templates
    this.templates.set('wcag_accessibility_policy', {
      id: 'wcag_accessibility_policy',
      framework: 'WCAG',
      category: 'Policies & Procedures',
      type: 'document',
      title: 'Accessibility Policy Document',
      description: 'Organizational policy defining accessibility commitments and procedures',
      required: true,
      priority: 'critical',
      tags: ['policy', 'accessibility', 'wcag',],
      acceptedFormats: ['pdf', 'doc', 'docx',],
      validationRules: [
        {
          id: 'policy_approval',
          type: 'metadata',
          description: 'Policy must be approved and dated',
          rule: 'has_approval_date',
          required: true,
          errorMessage: 'Policy document must include approval date and signature',
        },
      ],
      examples: [
        {
          title: 'Corporate Accessibility Policy',
          description: 'Example of comprehensive accessibility policy',
          checklist: [
            'Executive commitment',
            'WCAG 2.1 AA standard adoption',
            'Training requirements',
          ],
        },
      ],
      relatedRequirements: ['WCAG 2.1 Level AA compliance',],
    },)

    this.templates.set('wcag_testing_reports', {
      id: 'wcag_testing_reports',
      framework: 'WCAG',
      category: 'Testing Evidence',
      type: 'report',
      title: 'Accessibility Testing Reports',
      description: 'Automated and manual accessibility testing results',
      required: true,
      priority: 'high',
      tags: ['testing', 'accessibility', 'validation',],
      acceptedFormats: ['pdf', 'html', 'json',],
      validationRules: [
        {
          id: 'testing_date',
          type: 'timestamp',
          description: 'Reports must be recent (within 30 days)',
          rule: 'within_30_days',
          required: true,
          errorMessage: 'Testing reports must be from within the last 30 days',
        },
      ],
      examples: [],
      relatedRequirements: ['Regular accessibility testing',],
    },)

    // LGPD Evidence Templates
    this.templates.set('lgpd_privacy_policy', {
      id: 'lgpd_privacy_policy',
      framework: 'LGPD',
      category: 'Privacy Documentation',
      type: 'policy',
      title: 'Privacy Policy (LGPD Compliant)',
      description: 'Public privacy policy detailing data processing activities',
      required: true,
      priority: 'critical',
      tags: ['privacy', 'lgpd', 'policy',],
      acceptedFormats: ['pdf', 'html',],
      validationRules: [
        {
          id: 'lgpd_elements',
          type: 'content',
          description: 'Must contain all LGPD required elements',
          rule: 'contains_lgpd_elements',
          required: true,
          errorMessage: 'Privacy policy must contain all LGPD Article 9 required elements',
        },
      ],
      examples: [],
      relatedRequirements: ['LGPD Art. 9 - Information to data subject',],
    },)

    this.templates.set('lgpd_consent_records', {
      id: 'lgpd_consent_records',
      framework: 'LGPD',
      category: 'Consent Management',
      type: 'log',
      title: 'Consent Records and Logs',
      description: 'Records of consent collection, withdrawal, and management',
      required: true,
      priority: 'critical',
      tags: ['consent', 'lgpd', 'records',],
      acceptedFormats: ['csv', 'json', 'xlsx',],
      validationRules: [
        {
          id: 'consent_fields',
          type: 'content',
          description: 'Must contain required consent fields',
          rule: 'has_consent_fields',
          required: true,
          errorMessage:
            'Consent records must include date, purpose, legal basis, and withdrawal option',
        },
      ],
      examples: [],
      relatedRequirements: ['LGPD Art. 8 - Consent requirements',],
    },)

    console.log(`📚 Initialized ${this.templates.size} evidence templates`,)
  }

  // Helper methods
  private async applyValidationRule(
    evidence: CollectedEvidence,
    rule: EvidenceValidationRule,
  ): Promise<{ passed: boolean }> {
    // Mock validation logic - would implement actual rule checking
    switch (rule.type) {
      case 'format':
        return { passed: evidence.filePath ? true : !rule.required, }
      case 'content':
        return { passed: evidence.description.length > 10, }
      case 'metadata':
        return { passed: Object.keys(evidence.metadata || {},).length > 0, }
      case 'timestamp':
        return { passed: Date.now() - evidence.createdAt.getTime() < 30 * 24 * 60 * 60 * 1000, } // 30 days
      default:
        return { passed: true, }
    }
  }

  private async updateCollectionProgress(collection: EvidenceCollection,): Promise<void> {
    const required = collection.targetEvidence.filter(t => t.required).length
    const collected =
      collection.collectedEvidence.filter(e => e.validationStatus === 'valid').length
    const validated = collection.collectedEvidence.filter(e => e.verified).length

    collection.progress = {
      required,
      collected,
      validated,
      percentage: required > 0 ? Math.round((collected / required) * 100,) : 0,
    }

    // Calculate quality score
    const validEvidence = collection.collectedEvidence.filter(e => e.validationStatus === 'valid')
    collection.qualityScore = validEvidence.length > 0
      ? Math.round(validEvidence.reduce((sum,) => sum + 85, 0,) / validEvidence.length,)
      : 0 // Mock quality scoring

    collection.updatedAt = new Date()
  }

  private suggestAlternativeEvidence(template: EvidenceTemplate,): string[] {
    // Mock alternative evidence suggestions
    const alternatives = {
      'document': ['Screenshot with explanation', 'Video demonstration', 'Expert attestation',],
      'policy': ['Procedure document', 'Standard operating procedure', 'Process documentation',],
      'certificate': ['Third-party assessment', 'Internal audit report', 'Compliance statement',],
      'screenshot': ['Screen recording', 'Manual documentation', 'Third-party verification',],
      'log': ['Manual audit trail', 'System export', 'Process documentation',],
      'report': ['Summary document', 'Expert analysis', 'Compliance assessment',],
    }

    return (alternatives as any)[template.type]
      || ['Consult with compliance expert for alternatives',]
  }

  private async performAutoCollection(
    framework: ComplianceFramework,
    evidenceType: string,
  ): Promise<Partial<CollectedEvidence> | null> {
    // Mock auto-collection - would implement actual system integration
    const autoCollectionMap = {
      'system_logs': {
        title: 'System Access Logs',
        description: 'Automated collection of system access and audit logs',
        type: 'log' as const,
        collectionMethod: 'system_export' as const,
        tags: ['logs', 'access', 'audit',],
        confidentialityLevel: 'internal' as const,
      },
      'compliance_reports': {
        title: 'Automated Compliance Reports',
        description: 'System-generated compliance status reports',
        type: 'report' as const,
        collectionMethod: 'automated_capture' as const,
        tags: ['compliance', 'automated', 'status',],
        confidentialityLevel: 'internal' as const,
      },
    }

    return (autoCollectionMap as any)[evidenceType] || null
  }

  private generateCollectionRecommendations(collection: EvidenceCollection,): string[] {
    const recommendations = []

    if (collection.progress.percentage < 70) {
      recommendations.push(
        'Focus on collecting required evidence to reach 70% completion threshold',
      )
    }

    if (collection.qualityScore < 80) {
      recommendations.push('Review and improve evidence quality by addressing validation errors',)
    }

    const invalidEvidence = collection.collectedEvidence.filter(e =>
      e.validationStatus === 'invalid'
    )
    if (invalidEvidence.length > 0) {
      recommendations.push(`Fix ${invalidEvidence.length} invalid evidence items before audit`,)
    }

    return recommendations
  }
}

// Export singleton instance
export const evidenceCollector = new EvidenceCollector()
