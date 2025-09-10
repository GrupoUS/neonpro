import { createClient, SupabaseClient } from '@supabase/supabase-js'
import {
  AuditTrailEntry,
  CreateAuditTrailEntry,
  KPIMetric,
  UpdateKPIMetric,
  ComplianceStatus,
  RiskAssessment,
  CreateRiskAssessment,
  AIGovernanceMetric,
  PolicyManagement,
  EscalationWorkflow,
  CreateEscalationWorkflow,
  UpdateEscalationWorkflow,
  GovernanceService,
  AuditTrailFilters,
  EscalationFilters,
  KPIOverviewData,
  ComplianceStatusData
} from '@neonpro/types/governance.types'

export class SupabaseGovernanceService implements GovernanceService {
  private supabase: SupabaseClient

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  // Audit Trail Methods
  async createAuditEntry(entry: CreateAuditTrailEntry): Promise<AuditTrailEntry> {
    const { data, error } = await this.supabase
      .from('audit_trail')
      .insert([{
        user_id: entry.userId,
        clinic_id: entry.clinicId,
        patient_id: entry.patientId,
        action: entry.action,
        resource: entry.resource,
        resource_type: entry.resourceType,
        resource_id: entry.resourceId,
        ip_address: entry.ipAddress,
        user_agent: entry.userAgent,
        session_id: entry.sessionId,
        status: entry.status,
        risk_level: entry.riskLevel || 'LOW',
        additional_info: entry.additionalInfo,
        encrypted_details: entry.encryptedDetails
      }])
      .select()
      .single()

    if (error) throw new Error(`Failed to create audit entry: ${error.message}`)
    
    return this.mapAuditTrailFromDb(data)
  }

  async getAuditTrail(filters?: AuditTrailFilters): Promise<{ 
    entries: AuditTrailEntry[]
    totalCount: number
    filteredCount: number 
  }> {
    let query = this.supabase
      .from('audit_trail')
      .select('*, users(email)', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.userId) query = query.eq('user_id', filters.userId)
    if (filters?.clinicId) query = query.eq('clinic_id', filters.clinicId)
    if (filters?.action) query = query.eq('action', filters.action)
    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.riskLevel) query = query.eq('risk_level', filters.riskLevel)
    if (filters?.dateFrom) query = query.gte('created_at', filters.dateFrom.toISOString())
    if (filters?.dateTo) query = query.lte('created_at', filters.dateTo.toISOString())
    if (filters?.searchTerm) {
      query = query.or(`resource.ilike.%${filters.searchTerm}%,additional_info.ilike.%${filters.searchTerm}%`)
    }

    const { data, error, count } = await query.limit(1000)

    if (error) throw new Error(`Failed to get audit trail: ${error.message}`)

    const entries = data?.map(item => this.mapAuditTrailFromDb(item)) || []
    
    return {
      entries,
      totalCount: count || 0,
      filteredCount: entries.length
    }
  }  // KPI Metrics Methods
  async getKPIMetrics(): Promise<KPIMetric[]> {
    const { data, error } = await this.supabase
      .from('kpi_metrics')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('category', { ascending: true })

    if (error) throw new Error(`Failed to get KPI metrics: ${error.message}`)

    return data?.map(item => this.mapKPIMetricFromDb(item)) || []
  }

  async updateKPIMetric(update: UpdateKPIMetric): Promise<KPIMetric> {
    const updateData: Record<string, unknown> = {}
    if (update.currentValue !== undefined) updateData.current_value = update.currentValue
    if (update.targetValue !== undefined) updateData.target_value = update.targetValue
    if (update.threshold !== undefined) updateData.threshold = update.threshold
    if (update.status !== undefined) updateData.status = update.status

    const { data, error } = await this.supabase
      .from('kpi_metrics')
      .update(updateData)
      .eq('id', update.id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update KPI metric: ${error.message}`)

    return this.mapKPIMetricFromDb(data)
  }

  // Compliance Status Methods
  async getComplianceStatus(clinicId: string): Promise<ComplianceStatus[]> {
    const { data, error } = await this.supabase
      .from('compliance_status')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('framework', { ascending: true })

    if (error) throw new Error(`Failed to get compliance status: ${error.message}`)

    return data?.map(item => this.mapComplianceStatusFromDb(item)) || []
  }

  async updateComplianceStatus(id: string, updates: Partial<ComplianceStatus>): Promise<ComplianceStatus> {
    const updateData: Record<string, unknown> = {}
    if (updates.score !== undefined) updateData.score = updates.score
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.violations !== undefined) updateData.violations = updates.violations
    if (updates.lastAudit !== undefined) updateData.last_audit = updates.lastAudit
    if (updates.nextAudit !== undefined) updateData.next_audit = updates.nextAudit
    if (updates.details !== undefined) updateData.details = updates.details

    const { data, error } = await this.supabase
      .from('compliance_status')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update compliance status: ${error.message}`)

    return this.mapComplianceStatusFromDb(data)
  }  // Risk Assessment Methods
  async getRiskAssessments(clinicId: string): Promise<RiskAssessment[]> {
    const { data, error } = await this.supabase
      .from('risk_assessments')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('severity', { ascending: false })

    if (error) throw new Error(`Failed to get risk assessments: ${error.message}`)

    return data?.map(item => this.mapRiskAssessmentFromDb(item)) || []
  }

  async createRiskAssessment(assessment: CreateRiskAssessment): Promise<RiskAssessment> {
    const { data, error } = await this.supabase
      .from('risk_assessments')
      .insert([{
        clinic_id: assessment.clinicId,
        category: assessment.category,
        title: assessment.title,
        description: assessment.description,
        severity: assessment.severity,
        likelihood: assessment.likelihood,
        impact: assessment.impact,
        status: assessment.status || 'Open',
        mitigation: assessment.mitigation,
        owner: assessment.owner,
        due_date: assessment.dueDate,
        metadata: assessment.metadata
      }])
      .select()
      .single()

    if (error) throw new Error(`Failed to create risk assessment: ${error.message}`)

    return this.mapRiskAssessmentFromDb(data)
  }

  // AI Governance Methods
  async getAIGovernanceMetrics(): Promise<AIGovernanceMetric[]> {
    const { data, error } = await this.supabase
      .from('ai_governance_metrics')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('model_name', { ascending: true })

    if (error) throw new Error(`Failed to get AI governance metrics: ${error.message}`)

    return data?.map(item => this.mapAIGovernanceFromDb(item)) || []
  }

  async updateAIGovernanceMetric(id: string, updates: Partial<AIGovernanceMetric>): Promise<AIGovernanceMetric> {
    const updateData: Record<string, unknown> = {}
    if (updates.hallucinationRate !== undefined) updateData.hallucination_rate = updates.hallucinationRate
    if (updates.accuracyScore !== undefined) updateData.accuracy_score = updates.accuracyScore
    if (updates.biasScore !== undefined) updateData.bias_score = updates.biasScore
    if (updates.complianceScore !== undefined) updateData.compliance_score = updates.complianceScore
    if (updates.requestsProcessed !== undefined) updateData.requests_processed = updates.requestsProcessed
    if (updates.averageResponseTime !== undefined) updateData.average_response_time = updates.averageResponseTime
    if (updates.errorRate !== undefined) updateData.error_rate = updates.errorRate
    if (updates.status !== undefined) updateData.status = updates.status

    const { data, error } = await this.supabase
      .from('ai_governance_metrics')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update AI governance metric: ${error.message}`)

    return this.mapAIGovernanceFromDb(data)
  }  // Policy Management Methods
  async getPolicies(): Promise<PolicyManagement[]> {
    const { data, error } = await this.supabase
      .from('policy_management')
      .select('*')
      .in('status', ['ACTIVE', 'UNDER_REVIEW'])
      .order('framework', { ascending: true })

    if (error) throw new Error(`Failed to get policies: ${error.message}`)

    return data?.map(item => this.mapPolicyFromDb(item)) || []
  }

  async updatePolicy(id: string, updates: Partial<PolicyManagement>): Promise<PolicyManagement> {
    const updateData: Record<string, unknown> = {}
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.enforcementRate !== undefined) updateData.enforcement_rate = updates.enforcementRate
    if (updates.violationCount !== undefined) updateData.violation_count = updates.violationCount
    if (updates.lastReview !== undefined) updateData.last_review = updates.lastReview
    if (updates.nextReview !== undefined) updateData.next_review = updates.nextReview
    if (updates.content !== undefined) updateData.content = updates.content
    if (updates.metadata !== undefined) updateData.metadata = updates.metadata

    const { data, error } = await this.supabase
      .from('policy_management')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update policy: ${error.message}`)

    return this.mapPolicyFromDb(data)
  }

  // Escalation Workflow Methods
  async getEscalations(filters?: EscalationFilters): Promise<EscalationWorkflow[]> {
    let query = this.supabase
      .from('escalation_workflows')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })

    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.priority) query = query.eq('priority', filters.priority)
    if (filters?.assignedTo) query = query.eq('assigned_to', filters.assignedTo)
    if (filters?.category) query = query.eq('category', filters.category)

    const { data, error } = await query.limit(500)

    if (error) throw new Error(`Failed to get escalations: ${error.message}`)

    return data?.map(item => this.mapEscalationFromDb(item)) || []
  }  async createEscalation(escalation: CreateEscalationWorkflow): Promise<EscalationWorkflow> {
    const { data, error } = await this.supabase
      .from('escalation_workflows')
      .insert([{
        user_id: escalation.userId,
        title: escalation.title,
        description: escalation.description,
        category: escalation.category,
        source: escalation.source,
        priority: escalation.priority,
        status: escalation.status || 'OPEN',
        assigned_to: escalation.assignedTo,
        deadline: escalation.deadline,
        notes: escalation.notes,
        metadata: escalation.metadata
      }])
      .select()
      .single()

    if (error) throw new Error(`Failed to create escalation: ${error.message}`)

    return this.mapEscalationFromDb(data)
  }

  async updateEscalation(update: UpdateEscalationWorkflow): Promise<EscalationWorkflow> {
    const updateData: Record<string, unknown> = {}
    if (update.status !== undefined) updateData.status = update.status
    if (update.assignedTo !== undefined) updateData.assigned_to = update.assignedTo
    if (update.deadline !== undefined) updateData.deadline = update.deadline
    if (update.escalatedAt !== undefined) updateData.escalated_at = update.escalatedAt
    if (update.resolvedAt !== undefined) updateData.resolved_at = update.resolvedAt
    if (update.responseTime !== undefined) updateData.response_time = update.responseTime
    if (update.resolutionTime !== undefined) updateData.resolution_time = update.resolutionTime
    if (update.notes !== undefined) updateData.notes = update.notes
    if (update.metadata !== undefined) updateData.metadata = update.metadata

    const { data, error } = await this.supabase
      .from('escalation_workflows')
      .update(updateData)
      .eq('id', update.id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update escalation: ${error.message}`)

    return this.mapEscalationFromDb(data)
  }

  // Database mapping methods
  private mapAuditTrailFromDb(data: any): AuditTrailEntry {
    return {
      id: data.id,
      userId: data.user_id,
      clinicId: data.clinic_id,
      patientId: data.patient_id,
      action: data.action,
      resource: data.resource,
      resourceType: data.resource_type,
      resourceId: data.resource_id,
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
      sessionId: data.session_id,
      status: data.status,
      riskLevel: data.risk_level,
      additionalInfo: data.additional_info,
      createdAt: new Date(data.created_at),
      encryptedDetails: data.encrypted_details
    }
  }  private mapKPIMetricFromDb(data: any): KPIMetric {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      currentValue: parseFloat(data.current_value),
      targetValue: parseFloat(data.target_value),
      direction: data.direction,
      unit: data.unit,
      status: data.status,
      threshold: data.threshold ? parseFloat(data.threshold) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }

  private mapComplianceStatusFromDb(data: any): ComplianceStatus {
    return {
      id: data.id,
      clinicId: data.clinic_id,
      framework: data.framework,
      score: parseFloat(data.score),
      status: data.status,
      violations: data.violations,
      lastAudit: data.last_audit ? new Date(data.last_audit) : undefined,
      nextAudit: data.next_audit ? new Date(data.next_audit) : undefined,
      details: data.details,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }

  private mapRiskAssessmentFromDb(data: any): RiskAssessment {
    return {
      id: data.id,
      clinicId: data.clinic_id,
      category: data.category,
      title: data.title,
      description: data.description,
      severity: data.severity,
      likelihood: data.likelihood,
      impact: data.impact,
      status: data.status,
      mitigation: data.mitigation,
      owner: data.owner,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      metadata: data.metadata,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }

  private mapAIGovernanceFromDb(data: any): AIGovernanceMetric {
    return {
      id: data.id,
      modelName: data.model_name,
      modelVersion: data.model_version,
      status: data.status,
      hallucinationRate: parseFloat(data.hallucination_rate),
      accuracyScore: parseFloat(data.accuracy_score),
      biasScore: data.bias_score ? parseFloat(data.bias_score) : undefined,
      complianceScore: parseFloat(data.compliance_score),
      requestsProcessed: data.requests_processed,
      averageResponseTime: data.average_response_time ? parseFloat(data.average_response_time) : undefined,
      errorRate: parseFloat(data.error_rate),
      lastTrainingDate: data.last_training_date ? new Date(data.last_training_date) : undefined,
      modelSize: data.model_size,
      metadata: data.metadata,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }  private mapPolicyFromDb(data: any): PolicyManagement {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      framework: data.framework,
      status: data.status,
      version: data.version,
      enforcementRate: parseFloat(data.enforcement_rate),
      violationCount: data.violation_count,
      lastReview: data.last_review ? new Date(data.last_review) : undefined,
      nextReview: data.next_review ? new Date(data.next_review) : undefined,
      content: data.content,
      metadata: data.metadata,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }

  private mapEscalationFromDb(data: any): EscalationWorkflow {
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      category: data.category,
      source: data.source,
      priority: data.priority,
      status: data.status,
      assignedTo: data.assigned_to,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      escalatedAt: data.escalated_at ? new Date(data.escalated_at) : undefined,
      resolvedAt: data.resolved_at ? new Date(data.resolved_at) : undefined,
      responseTime: data.response_time,
      resolutionTime: data.resolution_time,
      notes: data.notes,
      metadata: data.metadata,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }

  // Dashboard aggregation methods
  async getKPIOverviewData(): Promise<KPIOverviewData> {
    const metrics = await this.getKPIMetrics()
    const totalKPIs = metrics.length
    const normalizedKPIs = metrics.filter(m => m.status === 'ACTIVE').length
    const criticalKPIs = metrics.filter(m => 
      m.threshold && m.currentValue < m.threshold
    ).length

    // Calculate aggregated scores
    const qualityMetric = metrics.find(m => m.name === 'Data Quality Score')
    const dataQualityScore = qualityMetric?.currentValue || 0

    const normalizationRate = totalKPIs > 0 ? (normalizedKPIs / totalKPIs) * 100 : 0

    return {
      totalKPIs,
      normalizedKPIs,
      normalizationRate,
      dataQualityScore,
      criticalKPIs,
      trends: {
        normalizationTrend: '+2.3%',
        qualityTrend: '+0.8%',
        criticalTrend: criticalKPIs > 0 ? `-${criticalKPIs}` : '0'
      }
    }
  }

  async getComplianceStatusData(clinicId: string): Promise<ComplianceStatusData> {
    const statuses = await this.getComplianceStatus(clinicId)
    
    const hipaaCompliance = statuses.find(s => s.framework === 'HIPAA')
    const lgpdCompliance = statuses.find(s => s.framework === 'LGPD')
    
    const overallScore = statuses.length > 0 
      ? statuses.reduce((sum, s) => sum + s.score, 0) / statuses.length 
      : 0

    const criticalViolations = statuses.reduce((sum, s) => 
      s.status === 'CRITICAL' ? sum + s.violations : sum, 0
    )

    return {
      hipaaCompliance: {
        score: hipaaCompliance?.score || 0,
        status: hipaaCompliance?.status || 'UNDER_REVIEW',
        violations: hipaaCompliance?.violations || 0,
        lastAudit: hipaaCompliance?.lastAudit?.toISOString().split('T')[0] || 'Never'
      },
      lgpdCompliance: {
        score: lgpdCompliance?.score || 0,
        status: lgpdCompliance?.status || 'UNDER_REVIEW',
        violations: lgpdCompliance?.violations || 0,
        lastAudit: lgpdCompliance?.lastAudit?.toISOString().split('T')[0] || 'Never'
      },
      overallScore,
      criticalViolations,
      upcomingDeadlines: statuses.filter(s => 
        s.nextAudit && s.nextAudit > new Date() && 
        s.nextAudit < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ).length,
      auditStatus: criticalViolations > 0 ? 'critical' : 'current'
    }
  }
}