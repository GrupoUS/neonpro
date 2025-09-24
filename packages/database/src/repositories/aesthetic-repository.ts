/**
 * Aesthetic Clinic Repository Implementation
 * Specialized for aesthetic clinic data models and Brazilian healthcare compliance
 */

import { databaseLogger, logHealthcareError } from '../../../shared/src/logging/healthcare-logger'
import { prisma, supabase } from '../client'
import {
  AestheticAnalyticsQuery,
  AestheticClientEngagementMetrics,
  AestheticClientProfile,
  AestheticClientRetentionMetrics,
  AestheticClientSearchCriteria,
  AestheticComplianceValidation,
  AestheticTreatment,
  AestheticTreatmentCatalog,
  AestheticTreatmentRecommendation,
  AestheticTreatmentSearchCriteria,
  ANVISAComplianceData,
  CFMComplianceData,
  CreateAestheticClientProfileRequest,
  CreateAestheticTreatmentPlanRequest,
  CreateAestheticTreatmentRequest,
  CreateAestheticTreatmentSessionRequest,
  LGPDDataHandlingConfig,
  UpdateAestheticClientProfileRequest,
  UpdateAestheticTreatmentRequest,
} from '../types/aesthetic-types'

// Database result interfaces
export interface AestheticClientSearchResult {
  clients: AestheticClientProfile[]
  total: number
  page: number
  limit: number
  hasMore: boolean
  filters: {
    skinType?: string
    treatmentType?: string
    retentionRisk?: 'low' | 'medium' | 'high'
  }
}

export interface AestheticTreatmentSearchResult {
  treatments: AestheticTreatment[]
  total: number
  page: number
  limit: number
  hasMore: boolean
  filters: {
    category?: string
    provider?: string
    status?: string
    dateRange?: {
      start: Date
      end: Date
    }
  }
}

export interface AestheticAnalyticsResult {
  metrics: {
    totalClients: number
    activeTreatments: number
    revenue: number
    clientRetention: number
    treatmentSuccess: number
    popularTreatments: Array<{
      treatment: string
      count: number
      revenue: number
    }>
  }
  trends: Array<{
    period: string
    metric: string
    value: number
    change: number
  }>
  compliance: {
    lgpdScore: number
    anvisaScore: number
    cfmScore: number
  }
}

export class AestheticRepository {
  private supabase = supabase
  private prisma = prisma
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  // Cache management
  private getCacheKey(prefix: string, params: any): string {
    return `${prefix}:${JSON.stringify(params)}`
  }

  private setCache(key: string, data: any, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  private getCache(key: string): any {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  // Client Management
  async createAestheticClient(
    data: CreateAestheticClientProfileRequest,
    clinicId: string,
  ): Promise<AestheticClientProfile> {
    try {
      // LGPD compliance validation
      const compliance = await this.validateClientDataForLGPD(data)
      if (!compliance.isValid) {
        throw new Error(`LGPD compliance violation: ${compliance.errors.join(', ')}`)
      }

      // Create patient record first
      const patient = await this.prisma.patient.create({
        data: {
          clinicId,
          fullName: data.personalInfo.fullName,
          email: data.personalInfo.email,
          phonePrimary: data.personalInfo.phone,
          birthDate: data.personalInfo.dateOfBirth,
          cpf: data.personalInfo.cpf,
          lgpdConsentGiven: true,
          lgpdConsentVersion: '1.0',
          dataConsentStatus: 'given',
          dataConsentDate: new Date(),
        },
      })

      // Create aesthetic client profile
      const [aestheticProfile] = await this.supabase
        .from('aesthetic_client_profiles')
        .insert([{
          patient_id: patient.id,
          clinic_id: clinicId,
          personal_info: data.personalInfo,
          treatment_preferences: data.treatmentPreferences,
          skin_analysis: data.skinAnalysis,
          medical_history: data.medicalHistory,
          aesthetic_concerns: data.aestheticConcerns,
          communication_preferences: data.communicationPreferences,
          financial_data: data.financialData,
          privacy_settings: data.privacySettings,
          retention_metrics: this.calculateInitialRetentionMetrics(data),
          created_at: new Date().toISOString(),
        }])
        .select()
        .single()

      // Log audit trail
      await this.logAuditTrail({
        userId: data.createdBy || 'system',
        clinicId,
        patientId: patient.id,
        action: 'CREATE_AESTHETIC_CLIENT',
        resourceType: 'AESTHETIC_CLIENT',
        resourceId: aestheticProfile.id,
        riskLevel: 'LOW',
        additionalInfo: { clientProfile: data },
      })

      return aestheticProfile
    } catch (error) {
      logHealthcareError('database', error, { method: 'createAestheticClient', clinicId })
      throw this.handleError(error, 'createAestheticClient')
    }
  }

  async getAestheticClientById(
    clientId: string,
    clinicId: string,
  ): Promise<AestheticClientProfile | null> {
    try {
      const cacheKey = this.getCacheKey('aesthetic_client', { clientId, clinicId })
      const cached = this.getCache(cacheKey)
      if (cached) return cached

      const { data, error } = await this.supabase
        .from('aesthetic_client_profiles')
        .select(`
          *,
          patient:patients(*)
        `)
        .eq('id', clientId)
        .eq('clinic_id', clinicId)
        .single()

      if (error) throw error
      if (!data) return null

      this.setCache(cacheKey, data, 300000) // 5 minutes cache
      return data
    } catch (error) {
      logHealthcareError('database', error, {
        method: 'getAestheticClientById',
        clientId,
        clinicId,
      })
      throw this.handleError(error, 'getAestheticClientById')
    }
  }

  async searchAestheticClients(
    criteria: AestheticClientSearchCriteria,
    clinicId: string,
    pagination: { page: number; limit: number } = { page: 1, limit: 20 },
  ): Promise<AestheticClientSearchResult> {
    try {
      const cacheKey = this.getCacheKey('aesthetic_client_search', {
        criteria,
        clinicId,
        pagination,
      })
      const cached = this.getCache(cacheKey)
      if (cached) return cached

      let query = this.supabase
        .from('aesthetic_client_profiles')
        .select('*', { count: 'exact' })
        .eq('clinic_id', clinicId)

      // Apply search filters
      if (criteria.query) {
        query = query.or(
          `personal_info->fullName.ilike.%${criteria.query}%,`
            + `personal_info->email.ilike.%${criteria.query}%,`
            + `personal_info->phone.ilike.%${criteria.query}%`,
        )
      }

      if (criteria.skinType) {
        query = query.eq('skin_analysis->skinType', criteria.skinType)
      }

      if (criteria.treatmentType) {
        query = query.contains('treatment_preferences->preferredTreatments', [
          criteria.treatmentType,
        ])
      }

      if (criteria.retentionRisk) {
        query = query.eq('retention_metrics->riskLevel', criteria.retentionRisk)
      }

      if (criteria.registrationDateRange) {
        query = query.gte('created_at', criteria.registrationDateRange.start.toISOString())
          .lte('created_at', criteria.registrationDateRange.end.toISOString())
      }

      // Apply pagination
      const offset = (pagination.page - 1) * pagination.limit
      query = query.range(offset, offset + pagination.limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      const result: AestheticClientSearchResult = {
        clients: data || [],
        total: count || 0,
        page: pagination.page,
        limit: pagination.limit,
        hasMore: (count || 0) > offset + pagination.limit,
        filters: {
          skinType: criteria.skinType,
          treatmentType: criteria.treatmentType,
          retentionRisk: criteria.retentionRisk,
        },
      }

      this.setCache(cacheKey, result, 120000) // 2 minutes cache
      return result
    } catch (error) {
      logHealthcareError('database', error, {
        method: 'searchAestheticClients',
        criteria,
        clinicId,
      })
      throw this.handleError(error, 'searchAestheticClients')
    }
  }

  async updateAestheticClient(
    clientId: string,
    clinicId: string,
    updates: UpdateAestheticClientProfileRequest,
  ): Promise<AestheticClientProfile> {
    try {
      // LGPD compliance validation
      const compliance = await this.validateClientDataForLGPD(updates)
      if (!compliance.isValid) {
        throw new Error(`LGPD compliance violation: ${compliance.errors.join(', ')}`)
      }

      const { data, error } = await this.supabase
        .from('aesthetic_client_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clientId)
        .eq('clinic_id', clinicId)
        .select()
        .single()

      if (error) throw error

      // Clear cache
      this.cache.delete(this.getCacheKey('aesthetic_client', { clientId, clinicId }))

      // Log audit trail
      await this.logAuditTrail({
        userId: updates.updatedBy || 'system',
        clinicId,
        patientId: data.patient_id,
        action: 'UPDATE_AESTHETIC_CLIENT',
        resourceType: 'AESTHETIC_CLIENT',
        resourceId: clientId,
        riskLevel: 'LOW',
        additionalInfo: { updates },
      })

      return data
    } catch (error) {
      logHealthcareError('database', error, {
        method: 'updateAestheticClient',
        clientId,
        clinicId,
      })
      throw this.handleError(error, 'updateAestheticClient')
    }
  }

  // Treatment Management
  async createAestheticTreatment(
    data: CreateAestheticTreatmentRequest,
    clinicId: string,
  ): Promise<AestheticTreatment> {
    try {
      const { data: treatment, error } = await this.supabase
        .from('aesthetic_treatments')
        .insert([{
          clinic_id: clinicId,
          client_id: data.clientId,
          treatment_type: data.treatmentType,
          treatment_category: data.treatmentCategory,
          provider_id: data.providerId,
          scheduled_date: data.scheduledDate.toISOString(),
          status: data.status || 'scheduled',
          treatment_plan: data.treatmentPlan,
          before_photo: data.beforePhoto,
          expected_outcomes: data.expectedOutcomes,
          contraindications: data.contraindications,
          cost: data.cost,
          payment_status: data.paymentStatus || 'pending',
          anvisa_protocol: data.anvisaProtocol,
          compliance_data: this.validateTreatmentCompliance(data),
          created_at: new Date().toISOString(),
        }])
        .select()
        .single()

      if (error) throw error

      // Update client retention metrics
      await this.updateClientRetentionMetrics(data.clientId)

      // Log audit trail
      await this.logAuditTrail({
        userId: data.createdBy || 'system',
        clinicId,
        patientId: data.clientId,
        action: 'CREATE_AESTHETIC_TREATMENT',
        resourceType: 'AESTHETIC_TREATMENT',
        resourceId: treatment.id,
        riskLevel: 'MEDIUM',
        additionalInfo: { treatmentData: data },
      })

      return treatment
    } catch (error) {
      logHealthcareError('database', error, { method: 'createAestheticTreatment', clinicId })
      throw this.handleError(error, 'createAestheticTreatment')
    }
  }

  async getAestheticTreatmentById(
    treatmentId: string,
    clinicId: string,
  ): Promise<AestheticTreatment | null> {
    try {
      const { data, error } = await this.supabase
        .from('aesthetic_treatments')
        .select(`
          *,
          client:aesthetic_client_profiles(*),
          provider:aesthetic_provider_specializations(*)
        `)
        .eq('id', treatmentId)
        .eq('clinic_id', clinicId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      logHealthcareError('database', error, {
        method: 'getAestheticTreatmentById',
        treatmentId,
        clinicId,
      })
      throw this.handleError(error, 'getAestheticTreatmentById')
    }
  }

  async getAestheticClientTreatments(
    clientId: string,
    clinicId: string,
    options: {
      status?: string
      limit?: number
      offset?: number
    } = {},
  ): Promise<AestheticTreatment[]> {
    try {
      let query = this.supabase
        .from('aesthetic_treatments')
        .select(`
          *,
          provider:aesthetic_provider_specializations(name, specializations)
        `)
        .eq('client_id', clientId)
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })

      if (options.status) {
        query = query.eq('status', options.status)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      logHealthcareError('database', error, {
        method: 'getAestheticClientTreatments',
        clientId,
        clinicId,
      })
      throw this.handleError(error, 'getAestheticClientTreatments')
    }
  }

  // Treatment Catalog Management
  async getAestheticTreatmentCatalog(
    clinicId: string,
    category?: string,
  ): Promise<AestheticTreatmentCatalog[]> {
    try {
      const cacheKey = this.getCacheKey('aesthetic_catalog', { clinicId, category })
      const cached = this.getCache(cacheKey)
      if (cached) return cached

      let query = this.supabase
        .from('aesthetic_treatment_catalog')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('is_active', true)

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query.order('popularity_score', { ascending: false })

      if (error) throw error

      this.setCache(cacheKey, data, 600000) // 10 minutes cache
      return data || []
    } catch (error) {
      logHealthcareError('database', error, {
        method: 'getAestheticTreatmentCatalog',
        clinicId,
        category,
      })
      throw this.handleError(error, 'getAestheticTreatmentCatalog')
    }
  }

  // Analytics and Reporting
  async getAestheticClinicAnalytics(
    clinicId: string,
    query: AestheticAnalyticsQuery,
  ): Promise<AestheticAnalyticsResult> {
    try {
      const cacheKey = this.getCacheKey('aesthetic_analytics', { clinicId, query })
      const cached = this.getCache(cacheKey)
      if (cached) return cached

      // Get basic metrics
      const [clientCount, treatmentCount, revenueData] = await Promise.all([
        this.supabase
          .from('aesthetic_client_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('clinic_id', clinicId),
        this.supabase
          .from('aesthetic_treatments')
          .select('*', { count: 'exact', head: true })
          .eq('clinic_id', clinicId)
          .gte('created_at', query.dateRange.start.toISOString())
          .lte('created_at', query.dateRange.end.toISOString()),
        this.supabase
          .from('aesthetic_financial_transactions')
          .select('amount')
          .eq('clinic_id', clinicId)
          .eq('status', 'completed')
          .gte('created_at', query.dateRange.start.toISOString())
          .lte('created_at', query.dateRange.end.toISOString()),
      ])

      const totalRevenue = revenueData.data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0

      // Get popular treatments
      const { data: popularTreatments } = await this.supabase
        .from('aesthetic_treatments')
        .select('treatment_type, count')
        .eq('clinic_id', clinicId)
        .gte('created_at', query.dateRange.start.toISOString())
        .lte('created_at', query.dateRange.end.toISOString())

      // Get compliance scores
      const compliance = await this.getComplianceScores(clinicId)

      const result: AestheticAnalyticsResult = {
        metrics: {
          totalClients: clientCount.count || 0,
          activeTreatments: treatmentCount.count || 0,
          revenue: totalRevenue,
          clientRetention: 85, // TODO: Calculate actual retention
          treatmentSuccess: 92, // TODO: Calculate actual success rate
          popularTreatments: (popularTreatments || []).map((t) => ({
            treatment: t.treatment_type,
            count: t.count,
            revenue: t.count * 500, // TODO: Get actual revenue per treatment
          })),
        },
        trends: [], // TODO: Implement trend calculation
        compliance,
      }

      this.setCache(cacheKey, result, 300000) // 5 minutes cache
      return result
    } catch (error) {
      logHealthcareError('database', error, { method: 'getAestheticClinicAnalytics', clinicId })
      throw this.handleError(error, 'getAestheticClinicAnalytics')
    }
  }

  // Compliance and Validation
  async validateClientDataForLGPD(
    data: CreateAestheticClientProfileRequest | UpdateAestheticClientProfileRequest,
  ): Promise<AestheticComplianceValidation> {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate required consent
    if (!data.privacySettings?.consentGiven) {
      errors.push('Client consent is required for LGPD compliance')
    }

    // Validate sensitive data handling
    if (data.personalInfo.cpf && !this.validateCPF(data.personalInfo.cpf)) {
      errors.push('Invalid CPF format')
    }

    // Validate data retention policies
    if (data.privacySettings?.dataRetention && data.privacySettings.dataRetention > 365 * 5) {
      warnings.push('Data retention period exceeds 5 years, may violate LGPD')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      complianceScore: errors.length === 0 ? 100 : Math.max(0, 100 - (errors.length * 25)),
    }
  }

  async validateTreatmentCompliance(
    data: CreateAestheticTreatmentRequest,
  ): Promise<ANVISAComplianceData> {
    return {
      anvisaRegistered: true, // TODO: Validate against ANVISA database
      protocolFollowed: !!data.anvisaProtocol,
      safetyChecks: data.contraindications ? data.contraindications.length > 0 : true,
      documentationComplete: !!data.treatmentPlan,
      providerQualified: true, // TODO: Validate provider qualifications
      lastValidated: new Date().toISOString(),
      validationScore: 95, // TODO: Calculate actual score
    }
  }

  async getComplianceScores(clinicId: string): Promise<{
    lgpdScore: number
    anvisaScore: number
    cfmScore: number
  }> {
    try {
      // Calculate LGPD compliance score
      const { data: lgpdData } = await this.supabase
        .from('aesthetic_client_profiles')
        .select('privacy_settings')
        .eq('clinic_id', clinicId)

      const lgpdCompliant = lgpdData?.filter((client) =>
        client.privacy_settings?.consentGiven
        && client.privacy_settings?.dataProcessingAccepted
      ).length || 0

      const lgpdScore = lgpdData?.length ? (lgpdCompliant / lgpdData.length) * 100 : 100

      // Calculate ANVISA compliance score
      const { data: anvisaData } = await this.supabase
        .from('aesthetic_treatments')
        .select('compliance_data')
        .eq('clinic_id', clinicId)

      const anvisaScore = anvisaData?.length
        ? anvisaData.reduce((sum, t) => sum + (t.compliance_data?.validationScore || 0), 0)
          / anvisaData.length
        : 100

      // Calculate CFM compliance score
      const { data: cfmData } = await this.supabase
        .from('aesthetic_treatments')
        .select('provider_id')
        .eq('clinic_id', clinicId)

      const cfmScore = 95 // TODO: Implement CFM validation

      return {
        lgpdScore: Math.round(lgdpScore),
        anvisaScore: Math.round(anvisaScore),
        cfmScore,
      }
    } catch (error) {
      logHealthcareError('database', error, { method: 'getComplianceScores', clinicId })
      return {
        lgpdScore: 85,
        anvisaScore: 85,
        cfmScore: 85,
      }
    }
  }

  // Utility Methods
  private calculateInitialRetentionMetrics(
    data: CreateAestheticClientProfileRequest,
  ): AestheticClientRetentionMetrics {
    return {
      riskLevel: 'medium' as const,
      riskScore: 50,
      factors: {
        demographics: this.getDemographicRiskScore(data),
        behavior: this.getBehavioralRiskScore(data),
        treatment: 0, // No treatment history yet
        financial: this.getFinancialRiskScore(data),
      },
      nextAssessmentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      interventions: [],
      engagementScore: 70,
    }
  }

  private getDemographicRiskScore(data: CreateAestheticClientProfileRequest): number {
    let score = 50
    // TODO: Implement demographic risk assessment
    return score
  }

  private getBehavioralRiskScore(data: CreateAestheticClientProfileRequest): number {
    let score = 50
    // TODO: Implement behavioral risk assessment
    return score
  }

  private getFinancialRiskScore(data: CreateAestheticClientProfileRequest): number {
    let score = 50
    // TODO: Implement financial risk assessment
    return score
  }

  private async updateClientRetentionMetrics(clientId: string): Promise<void> {
    // TODO: Implement retention metrics update
  }

  private async logAuditTrail(auditData: {
    userId: string
    clinicId: string
    patientId?: string
    action: string
    resourceType: string
    resourceId: string
    riskLevel: string
    additionalInfo?: any
  }): Promise<void> {
    try {
      await this.supabase
        .from('audit_logs')
        .insert([{
          user_id: auditData.userId,
          clinic_id: auditData.clinicId,
          patient_id: auditData.patientId,
          action: auditData.action,
          resource_type: auditData.resourceType,
          resource_id: auditData.resourceId,
          risk_level: auditData.riskLevel,
          additional_info: auditData.additionalInfo,
          created_at: new Date().toISOString(),
        }])
    } catch (error) {
      logHealthcareError('database', error, { method: 'logAuditTrail', auditData })
    }
  }

  private validateCPF(cpf: string): boolean {
    // Basic CPF validation
    const cleanCPF = cpf.replace(/[^\d]/g, '')
    return cleanCPF.length === 11 && !/^(\d)\1{10}$/.test(cleanCPF)
  }

  private handleError(error: any, operation: string): Error {
    logHealthcareError('database', error, { method: 'handleError', operation })

    if (error.code === 'PGRST116') {
      return new Error('Resource not found')
    }

    if (error.code === 'PGRST301') {
      return new Error('Permission denied')
    }

    return new Error(`Database operation failed: ${error.message}`)
  }

  // Health Check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    database: boolean
    cache: boolean
    compliance: boolean
    timestamp: string
  }> {
    try {
      const database = await this.checkDatabaseConnection()
      const cache = this.checkCacheHealth()
      const compliance = await this.checkComplianceHealth()

      const status = database && cache && compliance ? 'healthy' : 'degraded'

      return {
        status,
        database,
        cache,
        compliance,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        database: false,
        cache: false,
        compliance: false,
        timestamp: new Date().toISOString(),
      }
    }
  }

  private async checkDatabaseConnection(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return true
    } catch {
      return false
    }
  }

  private checkCacheHealth(): boolean {
    try {
      // Simple cache test
      this.setCache('health_check', { test: true }, 1000)
      const cached = this.getCache('health_check')
      this.cache.delete('health_check')
      return cached?.test === true
    } catch {
      return false
    }
  }

  private async checkComplianceHealth(): Promise<boolean> {
    try {
      // Check if compliance tables are accessible
      const { error } = await this.supabase
        .from('aesthetic_client_profiles')
        .select('id')
        .limit(1)

      return !error
    } catch {
      return false
    }
  }
}
