/**
 * Brazilian Healthcare Context Processor
 * Processes and enhances healthcare context for Brazilian market
 */

import { templateManager, } from '@neonpro/shared/templates'
import type { ServiceContext, } from '../base/EnhancedServiceBase'

export interface BrazilianHealthcareContext {
  // Geographic and cultural context
  region: 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul' | 'Nacional'
  state?: string
  city?: string
  culturalFactors: {
    socialEconomicLevel: 'A' | 'B' | 'C' | 'D' | 'E'
    educationLevel: 'fundamental' | 'medio' | 'superior' | 'pos-graduacao'
    healthLiteracy: 'baixo' | 'medio' | 'alto'
    digitalLiteracy: 'baixo' | 'medio' | 'alto'
  }

  // Healthcare system context
  healthcareAccess: {
    susUser: boolean
    hasPrivateInsurance: boolean
    preferredProvider: 'sus' | 'private' | 'mixed'
    accessBarriers: string[]
  }

  // Communication preferences
  communicationStyle: {
    formality: 'formal' | 'informal' | 'mixed'
    preferredLanguage: 'pt-BR'
    regionalDialect?: string
    communicationChannel: 'whatsapp' | 'web' | 'phone' | 'in-person'
    responseExpectation: 'immediate' | 'same-day' | 'next-day' | 'flexible'
  }

  // Regulatory compliance
  compliance: {
    lgpdConsent: {
      dataProcessing: boolean
      marketing: boolean
      photoUsage: boolean
      consentDate?: string
      consentMethod: 'digital' | 'physical' | 'verbal'
    }
    cfmCompliance: {
      medicalAdviceDisclaimer: boolean
      professionalIdentification: boolean
      scopeLimitations: boolean
    }
    anvisaCompliance: {
      productRecommendations: boolean
      adverseEventReporting: boolean
      regulatoryWarnings: boolean
    }
  }

  // Clinical context
  clinicalContext: {
    clinicType: 'aesthetic' | 'general' | 'specialized'
    specialties: string[]
    treatmentHistory: {
      previousTreatments: string[]
      allergies: string[]
      contraindications: string[]
      currentMedications: string[]
    }
    riskFactors: {
      age: number
      chronicConditions: string[]
      pregnancyStatus?: 'pregnant' | 'breastfeeding' | 'planning' | 'none'
      immunocompromised: boolean
    }
  }
}

export interface ContextEnhancementResult {
  enhancedPrompt: string
  culturalAdaptations: string[]
  complianceNotes: string[]
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'critical'
    factors: string[]
    recommendations: string[]
  }
  communicationGuidelines: {
    tone: string
    vocabulary: string
    structure: string
    disclaimers: string[]
  }
}

export class BrazilianHealthcareContextProcessor {
  /**
   * Process and enhance Brazilian healthcare context
   */
  processContext(
    baseContext: Partial<BrazilianHealthcareContext>,
    messageContent: string,
    serviceContext: ServiceContext,
  ): ContextEnhancementResult {
    // Build complete context with defaults
    const context = this.buildCompleteContext(baseContext,)

    // Analyze message for context clues
    const messageAnalysis = this.analyzeMessage(messageContent,)

    // Generate cultural adaptations
    const culturalAdaptations = this.generateCulturalAdaptations(context, messageAnalysis,)

    // Generate compliance notes
    const complianceNotes = this.generateComplianceNotes(context,)

    // Assess risk level
    const riskAssessment = this.assessRisk(context, messageAnalysis,)

    // Generate communication guidelines
    const communicationGuidelines = this.generateCommunicationGuidelines(context, riskAssessment,)

    // Build enhanced prompt
    const enhancedPrompt = this.buildEnhancedPrompt(
      context,
      culturalAdaptations,
      complianceNotes,
      communicationGuidelines,
    )

    return {
      enhancedPrompt,
      culturalAdaptations,
      complianceNotes,
      riskAssessment,
      communicationGuidelines,
    }
  }

  /**
   * Build complete context with defaults
   */
  private buildCompleteContext(
    baseContext: Partial<BrazilianHealthcareContext>,
  ): BrazilianHealthcareContext {
    return {
      region: baseContext.region || 'Sudeste',
      state: baseContext.state || 'SP',
      city: baseContext.city || 'São Paulo',
      culturalFactors: {
        socialEconomicLevel: baseContext.culturalFactors?.socialEconomicLevel || 'C',
        educationLevel: baseContext.culturalFactors?.educationLevel || 'medio',
        healthLiteracy: baseContext.culturalFactors?.healthLiteracy || 'medio',
        digitalLiteracy: baseContext.culturalFactors?.digitalLiteracy || 'medio',
        ...baseContext.culturalFactors,
      },
      healthcareAccess: {
        susUser: baseContext.healthcareAccess?.susUser ?? true,
        hasPrivateInsurance: baseContext.healthcareAccess?.hasPrivateInsurance ?? false,
        preferredProvider: baseContext.healthcareAccess?.preferredProvider || 'mixed',
        accessBarriers: baseContext.healthcareAccess?.accessBarriers || [],
        ...baseContext.healthcareAccess,
      },
      communicationStyle: {
        formality: baseContext.communicationStyle?.formality || 'informal',
        preferredLanguage: 'pt-BR',
        communicationChannel: baseContext.communicationStyle?.communicationChannel || 'whatsapp',
        responseExpectation: baseContext.communicationStyle?.responseExpectation || 'same-day',
        ...baseContext.communicationStyle,
      },
      compliance: {
        lgpdConsent: {
          dataProcessing: false,
          marketing: false,
          photoUsage: false,
          consentMethod: 'digital',
          ...baseContext.compliance?.lgpdConsent,
        },
        cfmCompliance: {
          medicalAdviceDisclaimer: true,
          professionalIdentification: true,
          scopeLimitations: true,
          ...baseContext.compliance?.cfmCompliance,
        },
        anvisaCompliance: {
          productRecommendations: true,
          adverseEventReporting: true,
          regulatoryWarnings: true,
          ...baseContext.compliance?.anvisaCompliance,
        },
        ...baseContext.compliance,
      },
      clinicalContext: {
        clinicType: baseContext.clinicalContext?.clinicType || 'aesthetic',
        specialties: baseContext.clinicalContext?.specialties || ['estética',],
        treatmentHistory: {
          previousTreatments: [],
          allergies: [],
          contraindications: [],
          currentMedications: [],
          ...baseContext.clinicalContext?.treatmentHistory,
        },
        riskFactors: {
          age: baseContext.clinicalContext?.riskFactors?.age || 30,
          chronicConditions: [],
          pregnancyStatus: 'none',
          immunocompromised: false,
          ...baseContext.clinicalContext?.riskFactors,
        },
        ...baseContext.clinicalContext,
      },
    }
  }

  /**
   * Analyze message for context clues
   */
  private analyzeMessage(content: string,): {
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
    topicCategory: 'aesthetic' | 'medical' | 'administrative' | 'emergency'
    emotionalTone: 'neutral' | 'anxious' | 'excited' | 'concerned' | 'frustrated'
    formalityLevel: 'formal' | 'informal'
    keywords: string[]
  } {
    const contentLower = content.toLowerCase()

    // Analyze urgency
    const urgencyKeywords = {
      critical: ['emergência', 'urgente', 'socorro', 'grave',],
      high: ['rápido', 'logo', 'hoje', 'agora',],
      medium: ['breve', 'possível', 'quando',],
      low: ['futuro', 'depois', 'qualquer hora',],
    }

    let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
    for (const [level, keywords,] of Object.entries(urgencyKeywords,)) {
      if (keywords.some(keyword => contentLower.includes(keyword,))) {
        urgencyLevel = level as 'low' | 'medium' | 'high' | 'critical'
        break
      }
    }

    // Analyze topic category
    const topicKeywords = {
      emergency: ['emergência', 'urgente', 'socorro', 'dor forte',],
      medical: ['sintoma', 'dor', 'problema', 'saúde', 'médico',],
      aesthetic: ['estética', 'beleza', 'procedimento', 'tratamento',],
      administrative: ['agendar', 'marcar', 'horário', 'consulta',],
    }

    let topicCategory: 'aesthetic' | 'medical' | 'administrative' | 'emergency' = 'aesthetic'
    for (const [category, keywords,] of Object.entries(topicKeywords,)) {
      if (keywords.some(keyword => contentLower.includes(keyword,))) {
        topicCategory = category as 'aesthetic' | 'medical' | 'administrative' | 'emergency'
        break
      }
    }

    // Analyze emotional tone
    const emotionalKeywords = {
      anxious: ['preocupado', 'nervoso', 'ansioso', 'medo',],
      excited: ['animado', 'feliz', 'ótimo', 'perfeito',],
      concerned: ['dúvida', 'questão', 'problema', 'cuidado',],
      frustrated: ['irritado', 'chateado', 'difícil', 'complicado',],
    }

    let emotionalTone: 'neutral' | 'anxious' | 'excited' | 'concerned' | 'frustrated' = 'neutral'
    for (const [tone, keywords,] of Object.entries(emotionalKeywords,)) {
      if (keywords.some(keyword => contentLower.includes(keyword,))) {
        emotionalTone = tone as 'neutral' | 'anxious' | 'excited' | 'concerned' | 'frustrated'
        break
      }
    }

    // Analyze formality
    const formalIndicators = ['senhor', 'senhora', 'doutor', 'doutora', 'gostaria',]
    const informalIndicators = ['oi', 'olá', 'tudo bem', 'beleza', 'valeu',]

    const formalityLevel = formalIndicators.some(indicator => contentLower.includes(indicator,))
      ? 'formal'
      : informalIndicators.some(indicator => contentLower.includes(indicator,))
      ? 'informal'
      : 'informal' // Default to informal for WhatsApp

    return {
      urgencyLevel,
      topicCategory,
      emotionalTone,
      formalityLevel,
      keywords: contentLower.split(' ',).filter(word => word.length > 3),
    }
  }

  /**
   * Generate cultural adaptations
   */
  private generateCulturalAdaptations(
    context: BrazilianHealthcareContext,
    messageAnalysis: any,
  ): string[] {
    const adaptations: string[] = []

    // Regional adaptations
    if (context.region === 'Nordeste') {
      adaptations.push('Use expressões regionais nordestinas quando apropriado',)
    } else if (context.region === 'Sul') {
      adaptations.push('Considere influências culturais do Sul do Brasil',)
    }

    // Social economic adaptations
    if (
      context.culturalFactors.socialEconomicLevel === 'D'
      || context.culturalFactors.socialEconomicLevel === 'E'
    ) {
      adaptations.push('Use linguagem simples e acessível',)
      adaptations.push('Considere limitações financeiras nas recomendações',)
    }

    // Education level adaptations
    if (context.culturalFactors.educationLevel === 'fundamental') {
      adaptations.push('Evite termos técnicos complexos',)
      adaptations.push('Use analogias simples para explicar conceitos',)
    }

    // Communication channel adaptations
    if (context.communicationStyle.communicationChannel === 'whatsapp') {
      adaptations.push('Use emojis apropriados para o contexto',)
      adaptations.push('Mantenha mensagens concisas',)
    }

    return adaptations
  }

  /**
   * Generate compliance notes
   */
  private generateComplianceNotes(context: BrazilianHealthcareContext,): string[] {
    const notes: string[] = []

    if (!context.compliance.lgpdConsent.dataProcessing) {
      notes.push('Solicitar consentimento LGPD para processamento de dados',)
    }

    if (context.compliance.cfmCompliance.medicalAdviceDisclaimer) {
      notes.push('Incluir disclaimer sobre limitações de orientação médica',)
    }

    if (context.compliance.anvisaCompliance.productRecommendations) {
      notes.push('Incluir avisos regulatórios para produtos recomendados',)
    }

    return notes
  }

  /**
   * Assess risk level
   */
  private assessRisk(
    context: BrazilianHealthcareContext,
    messageAnalysis: any,
  ): {
    level: 'low' | 'medium' | 'high' | 'critical'
    factors: string[]
    recommendations: string[]
  } {
    const factors: string[] = []
    const recommendations: string[] = []

    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'

    // Age-based risk
    if (context.clinicalContext.riskFactors.age > 65) {
      factors.push('Paciente idoso',)
      riskLevel = 'medium'
    }

    // Pregnancy risk
    if (context.clinicalContext.riskFactors.pregnancyStatus === 'pregnant') {
      factors.push('Gestante',)
      riskLevel = 'high'
      recommendations.push('Consulta médica obrigatória',)
    }

    // Chronic conditions
    if (context.clinicalContext.riskFactors.chronicConditions.length > 0) {
      factors.push('Condições crônicas',)
      riskLevel = 'medium'
    }

    // Message urgency
    if (messageAnalysis.urgencyLevel === 'critical') {
      riskLevel = 'critical'
      factors.push('Situação de emergência',)
      recommendations.push('Encaminhamento imediato',)
    }

    return { level: riskLevel, factors, recommendations, }
  }

  /**
   * Generate communication guidelines
   */
  private generateCommunicationGuidelines(
    context: BrazilianHealthcareContext,
    riskAssessment: any,
  ): {
    tone: string
    vocabulary: string
    structure: string
    disclaimers: string[]
  } {
    const disclaimers: string[] = []

    // Base disclaimers
    disclaimers.push('Esta orientação não substitui consulta médica presencial',)

    if (context.compliance.cfmCompliance.medicalAdviceDisclaimer) {
      disclaimers.push('Não fornecemos diagnósticos ou prescrições por mensagem',)
    }

    if (riskAssessment.level === 'high' || riskAssessment.level === 'critical') {
      disclaimers.push('Recomendamos avaliação médica presencial',)
    }

    return {
      tone: context.communicationStyle.formality === 'formal'
        ? 'respeitoso e profissional'
        : 'amigável e acolhedor',
      vocabulary: context.culturalFactors.educationLevel === 'fundamental'
        ? 'simples e acessível'
        : 'técnico quando necessário',
      structure: context.communicationStyle.communicationChannel === 'whatsapp'
        ? 'concisa e direta'
        : 'detalhada',
      disclaimers,
    }
  }

  /**
   * Build enhanced prompt
   */
  private buildEnhancedPrompt(
    context: BrazilianHealthcareContext,
    culturalAdaptations: string[],
    complianceNotes: string[],
    communicationGuidelines: any,
  ): string {
    const basePrompt = templateManager.getWhatsAppSystemPrompt() || ''

    const contextualPrompt = `
CONTEXTO BRASILEIRO DE SAÚDE:
- Região: ${context.region} (${context.state})
- Nível socioeconômico: ${context.culturalFactors.socialEconomicLevel}
- Educação: ${context.culturalFactors.educationLevel}
- Canal: ${context.communicationStyle.communicationChannel}
- Tipo de clínica: ${context.clinicalContext.clinicType}

ADAPTAÇÕES CULTURAIS:
${culturalAdaptations.map(a => `- ${a}`).join('\n',)}

DIRETRIZES DE COMUNICAÇÃO:
- Tom: ${communicationGuidelines.tone}
- Vocabulário: ${communicationGuidelines.vocabulary}
- Estrutura: ${communicationGuidelines.structure}

COMPLIANCE:
${complianceNotes.map(n => `- ${n}`).join('\n',)}

DISCLAIMERS OBRIGATÓRIOS:
${communicationGuidelines.disclaimers.map((d: string,) => `- ${d}`).join('\n',)}
`

    return basePrompt + '\n\n' + contextualPrompt
  }
}

export default BrazilianHealthcareContextProcessor
