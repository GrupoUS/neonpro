/**
 * Enhanced LGPD Granular Consent Management System
 * Complies with Brazilian healthcare regulations (LGPD, CFM, ANVISA)
 */

// Database models will be imported when Prisma client is available

export interface ConsentCategory {
  id: string
  name: string
  description: string
  dataType: 'basic' | 'sensitive' | 'medical' | 'genetic' | 'biometric'
  legalBasis: 'consent' | 'contract' | 'legitimate_interest' | 'legal_obligation' | 'vital_interest'
  purpose: string
  retentionPeriod: number // days
  required: boolean
  withdrawalImpact: 'immediate' | 'delayed' | 'partial'
  healthcareSpecific: boolean
}

export interface GranularConsent {
  id: string
  patientId: string
  clinicId: string
  categories: ConsentCategory[]
  status: 'pending' | 'active' | 'withdrawn' | 'expired' | 'revoked'
  consentVersion: string
  consentText: string
  givenAt: Date
  expiresAt?: Date
  lastConfirmedAt?: Date
  withdrawalReason?: string
  withdrawalMethod?: string
  metadata: Record<string, any>
}

export interface ConsentWithdrawalRequest {
  patientId: string
  clinicId: string
  consentId: string
  categories: string[] // Specific categories to withdraw
  reason: string
  method: 'web' | 'mobile' | 'email' | 'phone' | 'in_person'
  requestedAt: Date
  effectiveImmediately: boolean
}

export interface DataSubjectRightsRequest {
  patientId: string
  clinicId: string
  rightType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection'
  requestData: Record<string, any>
  requestedAt: Date
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  completedAt?: Date
  rejectionReason?: string
}

/**
 * Healthcare-specific consent categories compliant with LGPD, CFM, and ANVISA
 */
export const HEALTHCARE_CONSENT_CATEGORIES: ConsentCategory[] = [
  // Basic Identity and Contact
  {
    id: 'basic_identity',
    name: 'Dados básicos de identificação',
    description: 'Nome, contato, documentos básicos para agendamento e identificação',
    dataType: 'basic',
    legalBasis: 'consent',
    purpose: 'Agendamento, identificação e contato básico',
    retentionPeriod: 3650, // 10 years
    required: true,
    withdrawalImpact: 'delayed',
    healthcareSpecific: false
  },
  
  // Medical Data Collection
  {
    id: 'medical_data_collection',
    name: 'Coleta de dados médicos',
    description: 'Informações de saúde, histórico médico, condições pré-existentes',
    dataType: 'medical',
    legalBasis: 'consent',
    purpose: 'Diagnóstico, tratamento e acompanhamento médico',
    retentionPeriod: 3650, // 10 years (may extend for legal reasons)
    required: true,
    withdrawalImpact: 'immediate',
    healthcareSpecific: true
  },

  // Treatment Recommendations
  {
    id: 'ai_treatment_recommendations',
    name: 'Recomendações de tratamento por IA',
    description: 'Análise de dados para sugestões de tratamentos personalizados usando inteligência artificial',
    dataType: 'medical',
    legalBasis: 'consent',
    purpose: 'Otimização de tratamentos e recomendações personalizadas',
    retentionPeriod: 1825, // 5 years
    required: false,
    withdrawalImpact: 'immediate',
    healthcareSpecific: true
  },

  // Professional Credentials
  {
    id: 'professional_credentials',
    name: 'Credenciais de profissionais',
    description: 'Dados de registro, especializações e qualificações de profissionais de saúde',
    dataType: 'basic',
    legalBasis: 'legitimate_interest',
    purpose: 'Validação de credenciais e garantia de qualidade do atendimento',
    retentionPeriod: 2555, // 7 years
    required: true,
    withdrawalImpact: 'delayed',
    healthcareSpecific: true
  },

  // Emergency Services
  {
    id: 'emergency_services',
    name: 'Serviços de emergência',
    description: 'Dados críticos para atendimento de emergência e cuidados urgentes',
    dataType: 'medical',
    legalBasis: 'vital_interest',
    purpose: 'Atendimento de emergências e cuidados de saúde imediatos',
    retentionPeriod: 3650, // 10 years
    required: true,
    withdrawalImpact: 'partial', // Emergency override always available
    healthcareSpecific: true
  },

  // Research and Development
  {
    id: 'research_purposes',
    name: 'Pesquisa e desenvolvimento',
    description: 'Uso de dados anonimizados para pesquisa médica e desenvolvimento de tratamentos',
    dataType: 'medical',
    legalBasis: 'consent',
    purpose: 'Pesquisa científica e desenvolvimento de novos tratamentos',
    retentionPeriod: 2555, // 7 years
    required: false,
    withdrawalImpact: 'delayed',
    healthcareSpecific: true
  },

  // Marketing and Education
  {
    id: 'marketing_communications',
    name: 'Comunicações de marketing e educação',
    description: 'Informações sobre promoções, novos tratamentos e conteúdo educativo',
    dataType: 'basic',
    legalBasis: 'consent',
    purpose: 'Marketing de serviços de saúde e educação do paciente',
    retentionPeriod: 1095, // 3 years
    required: false,
    withdrawalImpact: 'immediate',
    healthcareSpecific: true
  },

  // Genetic and Biometric Data
  {
    id: 'genetic_biometric',
    name: 'Dados genéticos e biométricos',
    description: 'Informações genéticas, biométricas e de análise facial para tratamentos personalizados',
    dataType: 'genetic',
    legalBasis: 'consent',
    purpose: 'Tratamentos personalizados e análises genéticas',
    retentionPeriod: 3650, // 10 years
    required: false,
    withdrawalImpact: 'immediate',
    healthcareSpecific: true
  },

  // Telemedicine and Digital Health
  {
    id: 'telemedicine_data',
    name: 'Dados de telemedicina',
    description: 'Gravações de consultas remotas, dados de sessões e comunicações digitais',
    dataType: 'medical',
    legalBasis: 'consent',
    purpose: 'Atendimento médico remoto e monitoramento digital',
    retentionPeriod: 1825, // 5 years
    required: false,
    withdrawalImpact: 'delayed',
    healthcareSpecific: true
  },

  // Before/After Photos
  {
    id: 'before_after_photos',
    name: 'Fotos antes e depois',
    description: 'Registros fotográficos para avaliação de resultados e documentação médica',
    dataType: 'biometric',
    legalBasis: 'consent',
    purpose: 'Documentação de tratamentos e avaliação de resultados',
    retentionPeriod: 2555, // 7 years
    required: false,
    withdrawalImpact: 'immediate',
    healthcareSpecific: true
  },

  // Financial and Insurance
  {
    id: 'financial_insurance',
    name: 'Dados financeiros e de seguro',
    description: 'Informações de pagamento, planos de saúde e faturamento',
    dataType: 'basic',
    legalBasis: 'contract',
    purpose: 'Processamento de pagamentos e gestão de convênios',
    retentionPeriod: 2555, // 7 years (fiscal requirements)
    required: true,
    withdrawalImpact: 'delayed',
    healthcareSpecific: false
  }
]

/**
 * Enhanced LGPD Consent Manager
 */
export class LGPDConsentManager {
  private categories: ConsentCategory[] = HEALTHCARE_CONSENT_CATEGORIES

  /**
   * Get available consent categories
   */
  getConsentCategories(): ConsentCategory[] {
    return [...this.categories]
  }

  /**
   * Get categories by healthcare specificity
   */
  getHealthcareSpecificCategories(): ConsentCategory[] {
    return this.categories.filter(cat => cat.healthcareSpecific)
  }

  /**
   * Get required categories for basic functionality
   */
  getRequiredCategories(): ConsentCategory[] {
    return this.categories.filter(cat => cat.required)
  }

  /**
   * Create granular consent record
   */
  async createGranularConsent(
    patientId: string,
    clinicId: string,
    selectedCategoryIds: string[],
    consentText: string,
    metadata: Record<string, any> = {}
  ): Promise<GranularConsent> {
    const selectedCategories = this.categories.filter(cat => 
      selectedCategoryIds.includes(cat.id)
    )

    // Validate required categories
    const requiredCategories = this.getRequiredCategories()
    const missingRequired = requiredCategories.filter(reqCat => 
      !selectedCategories.some(selected => selected.id === reqCat.id)
    )

    if (missingRequired.length > 0) {
      throw new Error(`Categorias obrigatórias não selecionadas: ${missingRequired.map(c => c.name).join(', ')}`)
    }

    const consent: GranularConsent = {
      id: crypto.randomUUID(),
      patientId,
      clinicId,
      categories: selectedCategories,
      status: 'active',
      consentVersion: '2.0',
      consentText,
      givenAt: new Date(),
      metadata
    }

    // Set expiration based on shortest retention period
    const shortestRetention = Math.min(...selectedCategories.map(c => c.retentionPeriod))
    consent.expiresAt = new Date(Date.now() + (shortestRetention * 24 * 60 * 60 * 1000))

    return consent
  }

  /**
   * Process consent withdrawal request
   */
  async processConsentWithdrawal(
    request: ConsentWithdrawalRequest
  ): Promise<{
    success: boolean
    processedAt: Date
    affectedCategories: string[]
    dataProcessingActions: string[]
  }> {
    const affectedCategories = request.categories
    const processingActions: string[] = []

    for (const categoryId of affectedCategories) {
      const category = this.categories.find(c => c.id === categoryId)
      if (!category) continue

      switch (category.withdrawalImpact) {
        case 'immediate':
          processingActions.push(`Parada imediata do processamento de dados: ${category.name}`)
          processingActions.push(`Início do processo de exclusão de dados: ${category.name}`)
          break
        case 'delayed':
          processingActions.push(`Parada gradual do processamento de dados: ${category.name}`)
          processingActions.push(`Agendamento de exclusão conforme período de retenção: ${category.name}`)
          break
        case 'partial':
          processingActions.push(`Restrição de uso emergencial mantida: ${category.name}`)
          processingActions.push(`Limitação de processamento para não emergências: ${category.name}`)
          break
      }
    }

    return {
      success: true,
      processedAt: new Date(),
      affectedCategories,
      dataProcessingActions: processingActions
    }
  }

  /**
   * Validate consent for data access
   */
  async validateConsentForDataAccess(
    _patientId: string,
    _clinicId: string,
    _dataType: string,
    _purpose: string,
    _isEmergency = false
  ): Promise<{
    authorized: boolean
    consentId?: string
    reason: string
    emergencyOverride?: boolean
  }> {
    // Emergency override for vital interests
    if (_isEmergency) {
      const emergencyCategory = this.categories.find(c => c.id === 'emergency_services')
      if (emergencyCategory) {
        return {
          authorized: true,
          reason: 'Acesso autorizado por interesse vital (emergência)',
          emergencyOverride: true
        }
      }
    }

    // Check if specific consent category is required and available
    const requiredCategory = this.categories.find(cat => cat.dataType === dataType)
    if (!requiredCategory) {
      return {
        authorized: false,
        reason: `Tipo de dados não reconhecido: ${dataType}`
      }
    }

    // For legitimate interest and legal obligation, basic validation
    if (requiredCategory.legalBasis === 'legitimate_interest' || 
        requiredCategory.legalBasis === 'legal_obligation') {
      return {
        authorized: true,
        reason: `Acesso autorizado por base legal: ${requiredCategory.legalBasis}`
      }
    }

    // For consent-based categories, verify active consent
    // This would query the database for active consent records
    // For now, returning placeholder response
    return {
      authorized: false,
      reason: `Consentimento não encontrado para categoria: ${requiredCategory.name}`
    }
  }

  /**
   * Generate consent withdrawal impact report
   */
  generateWithdrawalImpactReport(
    categories: string[]
  ): {
    immediateEffects: string[]
    delayedEffects: string[]
    dataRetention: string[]
    serviceImpacts: string[]
  } {
    const immediateEffects: string[] = []
    const delayedEffects: string[] = []
    const dataRetention: string[] = []
    const serviceImpacts: string[] = []

    for (const categoryId of categories) {
      const category = this.categories.find(c => c.id === categoryId)
      if (!category) continue

      switch (category.withdrawalImpact) {
        case 'immediate':
          immediateEffects.push(`Parada imediata do processamento de ${category.name}`)
          dataRetention.push(`Dados serão excluídos imediatamente: ${category.name}`)
          serviceImpacts.push(`Serviços dependentes serão interrompidos: ${category.name}`)
          break
        case 'delayed':
          delayedEffects.push(`Processamento gradualmente encerrado: ${category.name}`)
          dataRetention.push(`Dados retidos por ${category.retentionPeriod} dias: ${category.name}`)
          serviceImpacts.push(`Serviços continuarão até conclusão: ${category.name}`)
          break
        case 'partial':
          immediateEffects.push(`Restrição de uso não emergencial: ${category.name}`)
          delayedEffects.push(`Manutenção para emergências: ${category.name}`)
          dataRetention.push(`Dados emergenciais preservados: ${category.name}`)
          serviceImpacts.push(`Serviços emergenciais mantidos: ${category.name}`)
          break
      }
    }

    return {
      immediateEffects,
      delayedEffects,
      dataRetention,
      serviceImpacts
    }
  }

  /**
   * Get consent statistics for compliance reporting
   */
  async getConsentStatistics(
    _clinicId: string,
    _startDate?: Date,
    _endDate?: Date
  ): Promise<{
    totalConsents: number
    activeConsents: number
    withdrawnConsents: number
    expiredConsents: number
    categoryBreakdown: Record<string, number>
    withdrawalRate: number
  }> {
    // This would query the database for actual statistics
    // Returning placeholder data for now
    return {
      totalConsents: 0,
      activeConsents: 0,
      withdrawnConsents: 0,
      expiredConsents: 0,
      categoryBreakdown: {},
      withdrawalRate: 0
    }
  }
}

// Export singleton instance
export const lgpdConsentManager = new LGPDConsentManager()