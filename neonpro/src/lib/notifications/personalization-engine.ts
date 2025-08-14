/**
 * Personalization Engine for NeonPro Notifications
 * 
 * Sistema avançado de personalização baseado em perfil do paciente,
 * histórico de resposta, machine learning e A/B testing automático
 */

import { z } from 'zod'

export interface PatientProfile {
  patientId: string
  clinicId: string
  demographics: PatientDemographics
  preferences: CommunicationPreferences
  behavior: BehaviorProfile
  responseHistory: ResponseHistory
  personalityInsights: PersonalityInsights
  segmentation: PatientSegmentation
  aiPredictions: AIPredictions
  lastUpdated: Date
}

export interface PatientDemographics {
  age: number
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  occupation?: string
  education?: 'basic' | 'medium' | 'higher' | 'postgraduate'
  income?: 'low' | 'medium' | 'high' | 'very_high'
  location: {
    city: string
    state: string
    timezone: string
  }
  language: string
  culturalBackground?: string[]
}

export interface CommunicationPreferences {
  preferredChannels: string[]
  channelPriority: Record<string, number> // channel -> priority (1-10)
  preferredTimes: {
    dayOfWeek: number[] // 0-6
    timeSlots: TimeSlot[]
    timezone: string
  }
  quietHours: {
    start: string
    end: string
  }
  frequency: 'minimal' | 'normal' | 'frequent'
  tone: 'formal' | 'casual' | 'friendly' | 'professional'
  languageStyle: 'simple' | 'detailed' | 'technical'
  visualPreferences: {
    useEmojis: boolean
    preferImages: boolean
    preferVideos: boolean
  }
  accessibilityNeeds?: AccessibilityNeeds
}

export interface AccessibilityNeeds {
  largeText: boolean
  highContrast: boolean
  audioPreferred: boolean
  screenReader: boolean
  cognitiveAssistance: boolean
  languageSimplification: boolean
}

export interface TimeSlot {
  start: string // HH:mm
  end: string
}

export interface BehaviorProfile {
  responseRates: Record<string, number> // channel -> response rate %
  averageResponseTime: Record<string, number> // channel -> minutes
  engagementLevel: 'low' | 'medium' | 'high'
  noShowHistory: {
    rate: number
    patterns: string[]
  }
  cancellationHistory: {
    rate: number
    reasons: string[]
    timing: number[] // days before appointment
  }
  appointmentPatterns: {
    preferredDayOfWeek: number[]
    preferredTimeOfDay: string[]
    averageLeadTime: number
    seasonalPreferences: Record<string, number>
  }
  digitalLiteracy: 'low' | 'medium' | 'high'
  communicationStyle: 'direct' | 'detailed' | 'visual' | 'conversational'
}

export interface ResponseHistory {
  totalNotifications: number
  totalResponses: number
  channelPerformance: Record<string, ChannelPerformance>
  contentPerformance: Record<string, ContentPerformance>
  timePerformance: TimePerformanceMetrics
  lastActivity: Date
}

export interface ChannelPerformance {
  channel: string
  sent: number
  delivered: number
  opened: number
  clicked: number
  responded: number
  avgResponseTime: number // minutes
  bestTimes: string[]
  worstTimes: string[]
}

export interface ContentPerformance {
  templateId: string
  templateName: string
  sent: number
  opened: number
  clicked: number
  responded: number
  engagementScore: number
  sentiment: 'positive' | 'neutral' | 'negative'
}

export interface TimePerformanceMetrics {
  bestDayOfWeek: number[]
  bestTimeOfDay: string[]
  worstDayOfWeek: number[]
  worstTimeOfDay: string[]
  responseTimeDistribution: Record<string, number>
}

export interface PersonalityInsights {
  communicationStyle: 'analytical' | 'expressive' | 'amiable' | 'driver'
  decisionMaking: 'quick' | 'deliberate' | 'consultative'
  informationPreference: 'summary' | 'detailed' | 'visual'
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  technologyAdoption: 'early' | 'mainstream' | 'late'
  socialInfluence: 'independent' | 'peer_influenced' | 'authority_influenced'
  confidenceLevel: number // 0-100
}

export interface PatientSegmentation {
  primarySegment: string
  secondarySegments: string[]
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum'
  lifetimeValue: number
  riskProfile: 'low' | 'medium' | 'high'
  engagementScore: number // 0-100
  satisfactionScore: number // 0-100
  recommendationLikelihood: number // 0-10 (NPS)
}

export interface AIPredictions {
  nextAppointmentProbability: number // 0-100
  cancellationRisk: number // 0-100
  noShowRisk: number // 0-100
  upsellOpportunity: number // 0-100
  churnRisk: number // 0-100
  optimalChannel: string
  optimalSendTime: Date
  contentRecommendations: string[]
  personalizedOffers: string[]
  lastPredictionUpdate: Date
}

export interface PersonalizationRule {
  id: string
  name: string
  enabled: boolean
  priority: number
  conditions: PersonalizationCondition[]
  actions: PersonalizationAction[]
  targetSegments?: string[]
  clinicId: string
  abTestConfig?: ABTestConfig
  createdAt: Date
  updatedAt: Date
}

export interface PersonalizationCondition {
  field: string // e.g., "demographics.age", "behavior.responseRates.sms"
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'between' | 'in' | 'contains'
  value: any
  weight: number
}

export interface PersonalizationAction {
  type: 'change_channel' | 'adjust_timing' | 'modify_content' | 'add_incentive' | 'escalate'
  parameters: Record<string, any>
  confidence: number // 0-100
}

export interface ABTestConfig {
  testId: string
  testName: string
  enabled: boolean
  variants: ABTestVariant[]
  splitPercentage: Record<string, number> // variant -> percentage
  metrics: string[] // metrics to track
  startDate: Date
  endDate?: Date
  minimumSampleSize: number
  statisticalSignificance: number // 0-100
}

export interface ABTestVariant {
  id: string
  name: string
  description: string
  actions: PersonalizationAction[]
  weight: number
}

export interface PersonalizationRequest {
  patientId: string
  clinicId: string
  notificationType: string
  baseTemplate: NotificationTemplate
  context: Record<string, any>
  urgency: 'low' | 'normal' | 'high' | 'urgent'
  scheduledFor?: Date
}

export interface NotificationTemplate {
  id: string
  name: string
  type: string
  channels: Record<string, TemplateContent>
  variables: string[]
  segments?: string[]
  abTestVariants?: Record<string, TemplateContent>
}

export interface TemplateContent {
  subject?: string
  title?: string
  body: string
  footer?: string
  buttons?: TemplateButton[]
  media?: TemplateMedia[]
  style?: TemplateStyle
}

export interface TemplateButton {
  text: string
  action: string
  url?: string
  style?: 'primary' | 'secondary' | 'link'
}

export interface TemplateMedia {
  type: 'image' | 'video' | 'audio' | 'document'
  url: string
  alt?: string
  caption?: string
}

export interface TemplateStyle {
  color?: string
  font?: string
  size?: string
  tone?: 'formal' | 'casual' | 'friendly' | 'urgent'
}

export interface PersonalizationResult {
  patientId: string
  personalizedTemplate: NotificationTemplate
  selectedChannel: string
  optimalSendTime: Date
  personalizationReasons: string[]
  confidenceScore: number
  abTestVariant?: string
  fallbackOptions: PersonalizationFallback[]
  metadata: Record<string, any>
}

export interface PersonalizationFallback {
  channel: string
  template: NotificationTemplate
  sendTime: Date
  reason: string
  priority: number
}

const PersonalizationRequestSchema = z.object({
  patientId: z.string(),
  clinicId: z.string(),
  notificationType: z.string(),
  baseTemplate: z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    channels: z.record(z.any()),
    variables: z.array(z.string())
  }),
  context: z.record(z.any()),
  urgency: z.enum(['low', 'normal', 'high', 'urgent'])
})

export class PersonalizationEngine {
  private patientProfiles: Map<string, PatientProfile> = new Map()
  private personalizationRules: Map<string, PersonalizationRule> = new Map()
  private abTests: Map<string, ABTestConfig> = new Map()
  private mlModel?: any // Machine learning model for predictions

  constructor() {
    this.initializeEngine()
  }

  private async initializeEngine(): Promise<void> {
    console.log('🎯 Initializing Personalization Engine...')
    
    // Load patient profiles
    await this.loadPatientProfiles()
    
    // Load personalization rules
    await this.loadPersonalizationRules()
    
    // Load active A/B tests
    await this.loadActiveABTests()
    
    // Initialize ML model
    await this.initializeMLModel()
    
    console.log('✅ Personalization Engine initialized successfully')
  }

  // Main Personalization Method
  public async personalizeNotification(request: PersonalizationRequest): Promise<PersonalizationResult> {
    console.log(`🎯 Personalizing notification for patient: ${request.patientId}`)
    
    // Validate request
    PersonalizationRequestSchema.parse(request)
    
    // Get patient profile
    const profile = await this.getPatientProfile(request.patientId)
    
    // Apply personalization rules
    const applicableRules = this.getApplicableRules(request, profile)
    
    // Determine A/B test variant
    const abTestVariant = await this.getABTestVariant(request, profile)
    
    // Select optimal channel
    const optimalChannel = await this.selectOptimalChannel(request, profile, applicableRules)
    
    // Determine optimal send time
    const optimalSendTime = await this.determineOptimalSendTime(request, profile)
    
    // Personalize content
    const personalizedTemplate = await this.personalizeContent(
      request, 
      profile, 
      applicableRules, 
      abTestVariant
    )
    
    // Calculate confidence score
    const confidenceScore = this.calculateConfidenceScore(profile, applicableRules)
    
    // Generate fallback options
    const fallbackOptions = await this.generateFallbackOptions(request, profile)
    
    const result: PersonalizationResult = {
      patientId: request.patientId,
      personalizedTemplate,
      selectedChannel: optimalChannel,
      optimalSendTime,
      personalizationReasons: this.generatePersonalizationReasons(applicableRules, profile),
      confidenceScore,
      abTestVariant: abTestVariant?.id,
      fallbackOptions,
      metadata: {
        profileLastUpdated: profile.lastUpdated,
        rulesApplied: applicableRules.map(r => r.id),
        timestamp: new Date()
      }
    }
    
    // Track personalization for learning
    await this.trackPersonalization(result)
    
    return result
  }

  private getApplicableRules(request: PersonalizationRequest, profile: PatientProfile): PersonalizationRule[] {
    const applicableRules: PersonalizationRule[] = []
    
    for (const rule of this.personalizationRules.values()) {
      if (!rule.enabled) continue
      
      // Check clinic
      if (rule.clinicId !== request.clinicId) continue
      
      // Check target segments
      if (rule.targetSegments && rule.targetSegments.length > 0) {
        const hasMatchingSegment = rule.targetSegments.some(segment =>
          segment === profile.segmentation.primarySegment ||
          profile.segmentation.secondarySegments.includes(segment)
        )
        if (!hasMatchingSegment) continue
      }
      
      // Evaluate conditions
      if (this.evaluatePersonalizationConditions(rule.conditions, profile, request)) {
        applicableRules.push(rule)
      }
    }
    
    return applicableRules.sort((a, b) => b.priority - a.priority)
  }

  private evaluatePersonalizationConditions(
    conditions: PersonalizationCondition[],
    profile: PatientProfile,
    request: PersonalizationRequest
  ): boolean {
    let totalWeight = 0
    let matchedWeight = 0
    
    for (const condition of conditions) {
      totalWeight += condition.weight
      
      const value = this.getValueFromPath(condition.field, { profile, request })
      
      if (this.evaluateCondition(condition, value)) {
        matchedWeight += condition.weight
      }
    }
    
    // Return true if more than 80% of weighted conditions match
    return totalWeight === 0 || (matchedWeight / totalWeight) >= 0.8
  }

  private evaluateCondition(condition: PersonalizationCondition, value: any): boolean {
    switch (condition.operator) {
      case 'equals':
        return value === condition.value
      case 'not_equals':
        return value !== condition.value
      case 'greater_than':
        return Number(value) > Number(condition.value)
      case 'less_than':
        return Number(value) < Number(condition.value)
      case 'between':
        const [min, max] = condition.value
        return Number(value) >= min && Number(value) <= max
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value)
      case 'contains':
        return typeof value === 'string' && value.includes(condition.value)
      default:
        return false
    }
  }

  private getValueFromPath(path: string, context: any): any {
    return path.split('.').reduce((current, key) => current?.[key], context)
  }

  private async getABTestVariant(
    request: PersonalizationRequest,
    profile: PatientProfile
  ): Promise<ABTestVariant | undefined> {
    // Find active A/B tests for this notification type
    const activeTests = Array.from(this.abTests.values()).filter(test =>
      test.enabled &&
      test.startDate <= new Date() &&
      (!test.endDate || test.endDate >= new Date())
    )
    
    for (const test of activeTests) {
      // Check if patient should be included in this test
      if (this.shouldIncludeInABTest(profile, test)) {
        return this.selectABTestVariant(profile.patientId, test)
      }
    }
    
    return undefined
  }

  private shouldIncludeInABTest(profile: PatientProfile, test: ABTestConfig): boolean {
    // Implement logic to determine if patient should be included
    // Based on segmentation, past participation, etc.
    return true // Simplified for now
  }

  private selectABTestVariant(patientId: string, test: ABTestConfig): ABTestVariant {
    // Use consistent hash to assign patient to variant
    const hash = this.hashString(patientId + test.testId)
    const percentage = hash % 100
    
    let cumulativePercentage = 0
    for (const [variantId, variantPercentage] of Object.entries(test.splitPercentage)) {
      cumulativePercentage += variantPercentage
      if (percentage < cumulativePercentage) {
        return test.variants.find(v => v.id === variantId)!
      }
    }
    
    // Fallback to first variant
    return test.variants[0]
  }

  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  private async selectOptimalChannel(
    request: PersonalizationRequest,
    profile: PatientProfile,
    rules: PersonalizationRule[]
  ): Promise<string> {
    // Start with AI prediction
    let optimalChannel = profile.aiPredictions.optimalChannel
    
    // Apply rule-based overrides
    for (const rule of rules) {
      for (const action of rule.actions) {
        if (action.type === 'change_channel' && action.confidence > 80) {
          optimalChannel = action.parameters.channel
          break
        }
      }
    }
    
    // Check availability in base template
    const availableChannels = Object.keys(request.baseTemplate.channels)
    if (!availableChannels.includes(optimalChannel)) {
      // Fallback to highest performing available channel
      const channelPerformance = profile.responseHistory.channelPerformance
      const availablePerformance = availableChannels
        .filter(channel => channelPerformance[channel])
        .sort((a, b) => channelPerformance[b].responded - channelPerformance[a].responded)
      
      optimalChannel = availablePerformance[0] || availableChannels[0]
    }
    
    // Consider urgency override
    if (request.urgency === 'urgent' && profile.preferences.preferredChannels.includes('sms')) {
      optimalChannel = 'sms'
    }
    
    return optimalChannel
  }

  private async determineOptimalSendTime(
    request: PersonalizationRequest,
    profile: PatientProfile
  ): Promise<Date> {
    // Start with scheduled time if provided
    let optimalTime = request.scheduledFor || new Date()
    
    // Use AI prediction if available
    if (profile.aiPredictions.optimalSendTime) {
      optimalTime = new Date(profile.aiPredictions.optimalSendTime)
    }
    
    // Apply behavior-based optimization
    const bestTimes = profile.responseHistory.timePerformance.bestTimeOfDay
    const currentHour = optimalTime.getHours()
    
    if (bestTimes.length > 0) {
      const bestHour = this.getOptimalHour(bestTimes, currentHour)
      optimalTime.setHours(bestHour, 0, 0, 0)
    }
    
    // Respect quiet hours
    if (this.isInQuietHours(optimalTime, profile.preferences.quietHours)) {
      optimalTime = this.adjustForQuietHours(optimalTime, profile.preferences.quietHours)
    }
    
    // Don't schedule in the past
    const now = new Date()
    if (optimalTime <= now) {
      optimalTime = new Date(now.getTime() + 5 * 60 * 1000) // 5 minutes from now
    }
    
    return optimalTime
  }

  private getOptimalHour(bestTimes: string[], currentHour: number): number {
    const hourMap: Record<string, number> = {
      'early_morning': 8,
      'morning': 10,
      'late_morning': 11,
      'noon': 12,
      'early_afternoon': 14,
      'afternoon': 16,
      'late_afternoon': 17,
      'evening': 19,
      'night': 21
    }
    
    // Find the best time closest to current hour
    let closestHour = currentHour
    let minDiff = 24
    
    for (const timeSlot of bestTimes) {
      const hour = hourMap[timeSlot] || currentHour
      const diff = Math.abs(hour - currentHour)
      if (diff < minDiff) {
        minDiff = diff
        closestHour = hour
      }
    }
    
    return closestHour
  }

  private isInQuietHours(time: Date, quietHours: { start: string; end: string }): boolean {
    const timeStr = time.toTimeString().substr(0, 5)
    return timeStr >= quietHours.start && timeStr <= quietHours.end
  }

  private adjustForQuietHours(time: Date, quietHours: { start: string; end: string }): Date {
    const [endHour, endMinute] = quietHours.end.split(':').map(Number)
    const adjustedTime = new Date(time)
    adjustedTime.setHours(endHour, endMinute, 0, 0)
    return adjustedTime
  }

  private async personalizeContent(
    request: PersonalizationRequest,
    profile: PatientProfile,
    rules: PersonalizationRule[],
    abTestVariant?: ABTestVariant
  ): Promise<NotificationTemplate> {
    let personalizedTemplate = { ...request.baseTemplate }
    
    // Apply A/B test variant first
    if (abTestVariant) {
      personalizedTemplate = this.applyABTestVariant(personalizedTemplate, abTestVariant)
    }
    
    // Apply rule-based content modifications
    for (const rule of rules) {
      for (const action of rule.actions) {
        if (action.type === 'modify_content') {
          personalizedTemplate = this.applyContentModification(personalizedTemplate, action, profile)
        }
      }
    }
    
    // Apply profile-based personalization
    personalizedTemplate = await this.applyProfilePersonalization(personalizedTemplate, profile)
    
    return personalizedTemplate
  }

  private applyABTestVariant(template: NotificationTemplate, variant: ABTestVariant): NotificationTemplate {
    const variantTemplate = { ...template }
    
    // Apply variant-specific actions
    for (const action of variant.actions) {
      if (action.type === 'modify_content') {
        // Apply content modifications from A/B test
        variantTemplate.channels = { ...variantTemplate.channels }
        
        for (const [channel, content] of Object.entries(action.parameters.channels || {})) {
          if (variantTemplate.channels[channel]) {
            variantTemplate.channels[channel] = { ...variantTemplate.channels[channel], ...content }
          }
        }
      }
    }
    
    return variantTemplate
  }

  private applyContentModification(
    template: NotificationTemplate,
    action: PersonalizationAction,
    profile: PatientProfile
  ): NotificationTemplate {
    const modifiedTemplate = { ...template }
    modifiedTemplate.channels = { ...modifiedTemplate.channels }
    
    const { modifications } = action.parameters
    
    for (const [channel, channelModifications] of Object.entries(modifications || {})) {
      if (modifiedTemplate.channels[channel]) {
        modifiedTemplate.channels[channel] = {
          ...modifiedTemplate.channels[channel],
          ...channelModifications
        }
      }
    }
    
    return modifiedTemplate
  }

  private async applyProfilePersonalization(
    template: NotificationTemplate,
    profile: PatientProfile
  ): Promise<NotificationTemplate> {
    const personalizedTemplate = { ...template }
    personalizedTemplate.channels = { ...personalizedTemplate.channels }
    
    // Apply tone preferences
    for (const [channel, content] of Object.entries(personalizedTemplate.channels)) {
      const personalizedContent = { ...content }
      
      // Adjust tone based on preferences
      if (profile.preferences.tone === 'casual' && personalizedContent.body) {
        personalizedContent.body = this.casualizeTone(personalizedContent.body)
      } else if (profile.preferences.tone === 'formal' && personalizedContent.body) {
        personalizedContent.body = this.formalizeTone(personalizedContent.body)
      }
      
      // Add emojis if preferred
      if (profile.preferences.visualPreferences.useEmojis && personalizedContent.body) {
        personalizedContent.body = this.addAppropriateEmojis(personalizedContent.body)
      }
      
      // Simplify language if needed
      if (profile.preferences.languageStyle === 'simple' && personalizedContent.body) {
        personalizedContent.body = this.simplifyLanguage(personalizedContent.body)
      }
      
      // Apply accessibility adjustments
      if (profile.preferences.accessibilityNeeds) {
        personalizedContent.body = this.applyAccessibilityAdjustments(
          personalizedContent.body,
          profile.preferences.accessibilityNeeds
        )
      }
      
      personalizedTemplate.channels[channel] = personalizedContent
    }
    
    return personalizedTemplate
  }

  private casualizeTone(text: string): string {
    return text
      .replace(/Prezado\(a\)/g, 'Oi')
      .replace(/Cordialmente,/g, 'Até logo!')
      .replace(/Por favor,/g, 'Só')
  }

  private formalizeTone(text: string): string {
    return text
      .replace(/Oi/g, 'Prezado(a)')
      .replace(/Até logo!/g, 'Cordialmente,')
      .replace(/Só/g, 'Por favor,')
  }

  private addAppropriateEmojis(text: string): string {
    return text
      .replace(/consulta/g, 'consulta 📅')
      .replace(/lembrete/g, 'lembrete 🔔')
      .replace(/obrigado/g, 'obrigado 😊')
      .replace(/importante/g, 'importante ⚠️')
  }

  private simplifyLanguage(text: string): string {
    return text
      .replace(/procedimento estético/g, 'tratamento')
      .replace(/agendamento/g, 'marcação')
      .replace(/confirmação/g, 'confirmar')
  }

  private applyAccessibilityAdjustments(text: string, needs: AccessibilityNeeds): string {
    let adjustedText = text
    
    if (needs.languageSimplification) {
      adjustedText = this.simplifyLanguage(adjustedText)
    }
    
    if (needs.cognitiveAssistance) {
      // Add more context and clearer instructions
      adjustedText = this.addCognitiveAssistance(adjustedText)
    }
    
    return adjustedText
  }

  private addCognitiveAssistance(text: string): string {
    // Add step-by-step instructions and clearer context
    return text.replace(/Clique aqui/g, 'Clique no botão abaixo para confirmar')
  }

  private calculateConfidenceScore(profile: PatientProfile, rules: PersonalizationRule[]): number {
    let confidence = 50 // Base confidence
    
    // Increase confidence based on profile completeness
    if (profile.responseHistory.totalNotifications > 10) confidence += 20
    if (profile.behavior.responseRates) confidence += 15
    if (profile.aiPredictions.lastPredictionUpdate) {
      const daysSincePrediction = (Date.now() - profile.aiPredictions.lastPredictionUpdate.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSincePrediction < 7) confidence += 15
    }
    
    // Increase confidence based on rule quality
    const highConfidenceRules = rules.filter(rule => 
      rule.actions.some(action => action.confidence > 80)
    )
    confidence += highConfidenceRules.length * 5
    
    return Math.min(100, confidence)
  }

  private generatePersonalizationReasons(
    rules: PersonalizationRule[],
    profile: PatientProfile
  ): string[] {
    const reasons: string[] = []
    
    // Profile-based reasons
    if (profile.behavior.responseRates) {
      const bestChannel = Object.entries(profile.behavior.responseRates)
        .sort(([_,a], [__,b]) => b - a)[0]
      if (bestChannel) {
        reasons.push(`Canal otimizado baseado em histórico (${bestChannel[0]}: ${bestChannel[1]}% resposta)`)
      }
    }
    
    if (profile.responseHistory.timePerformance.bestTimeOfDay.length > 0) {
      reasons.push(`Horário otimizado para melhor resposta (${profile.responseHistory.timePerformance.bestTimeOfDay.join(', ')})`)
    }
    
    // Rule-based reasons
    for (const rule of rules) {
      reasons.push(`Regra aplicada: ${rule.name}`)
    }
    
    // AI-based reasons
    if (profile.aiPredictions.nextAppointmentProbability > 70) {
      reasons.push('AI prediz alta probabilidade de agendamento')
    }
    
    return reasons
  }

  private async generateFallbackOptions(
    request: PersonalizationRequest,
    profile: PatientProfile
  ): Promise<PersonalizationFallback[]> {
    const fallbacks: PersonalizationFallback[] = []
    
    // Channel fallbacks
    const alternativeChannels = profile.preferences.preferredChannels
      .filter(channel => Object.keys(request.baseTemplate.channels).includes(channel))
      .slice(0, 2)
    
    for (const channel of alternativeChannels) {
      fallbacks.push({
        channel,
        template: request.baseTemplate,
        sendTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes later
        reason: `Canal alternativo baseado em preferência`,
        priority: profile.preferences.channelPriority[channel] || 5
      })
    }
    
    // Time fallbacks
    const alternativeTimes = [1, 2, 4].map(hours => {
      const fallbackTime = new Date()
      fallbackTime.setHours(fallbackTime.getHours() + hours)
      return fallbackTime
    })
    
    for (let i = 0; i < Math.min(2, alternativeTimes.length); i++) {
      fallbacks.push({
        channel: profile.aiPredictions.optimalChannel,
        template: request.baseTemplate,
        sendTime: alternativeTimes[i],
        reason: `Horário alternativo (+${i + 1}h)`,
        priority: 3 - i
      })
    }
    
    return fallbacks.sort((a, b) => b.priority - a.priority)
  }

  // Profile Management
  public async updatePatientProfile(
    patientId: string,
    updates: Partial<PatientProfile>
  ): Promise<PatientProfile> {
    const existingProfile = this.patientProfiles.get(patientId)
    
    const updatedProfile: PatientProfile = {
      ...existingProfile,
      ...updates,
      patientId,
      lastUpdated: new Date()
    } as PatientProfile
    
    // Save profile
    await this.savePatientProfile(updatedProfile)
    this.patientProfiles.set(patientId, updatedProfile)
    
    // Update AI predictions
    await this.updateAIPredictions(updatedProfile)
    
    console.log(`👤 Patient profile updated: ${patientId}`)
    return updatedProfile
  }

  public async trackNotificationResponse(
    patientId: string,
    notificationId: string,
    channel: string,
    action: 'delivered' | 'opened' | 'clicked' | 'responded',
    responseTime?: number
  ): Promise<void> {
    const profile = await this.getPatientProfile(patientId)
    
    // Update response history
    if (!profile.responseHistory.channelPerformance[channel]) {
      profile.responseHistory.channelPerformance[channel] = {
        channel,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        responded: 0,
        avgResponseTime: 0,
        bestTimes: [],
        worstTimes: []
      }
    }
    
    const channelPerf = profile.responseHistory.channelPerformance[channel]
    channelPerf[action]++
    
    if (action === 'responded' && responseTime) {
      const totalResponses = channelPerf.responded
      channelPerf.avgResponseTime = (channelPerf.avgResponseTime * (totalResponses - 1) + responseTime) / totalResponses
    }
    
    // Update total counters
    profile.responseHistory.lastActivity = new Date()
    
    // Save updated profile
    await this.updatePatientProfile(patientId, { responseHistory: profile.responseHistory })
    
    console.log(`📊 Tracked ${action} for patient ${patientId} on ${channel}`)
  }

  private async updateAIPredictions(profile: PatientProfile): Promise<void> {
    // Mock AI prediction updates - in production, this would call ML services
    const predictions: AIPredictions = {
      nextAppointmentProbability: this.calculateAppointmentProbability(profile),
      cancellationRisk: this.calculateCancellationRisk(profile),
      noShowRisk: this.calculateNoShowRisk(profile),
      upsellOpportunity: this.calculateUpsellOpportunity(profile),
      churnRisk: this.calculateChurnRisk(profile),
      optimalChannel: this.predictOptimalChannel(profile),
      optimalSendTime: this.predictOptimalSendTime(profile),
      contentRecommendations: this.generateContentRecommendations(profile),
      personalizedOffers: this.generatePersonalizedOffers(profile),
      lastPredictionUpdate: new Date()
    }
    
    profile.aiPredictions = predictions
    await this.savePatientProfile(profile)
  }

  private calculateAppointmentProbability(profile: PatientProfile): number {
    // Simplified calculation based on historical patterns
    const responseRate = profile.responseHistory.totalResponses / Math.max(1, profile.responseHistory.totalNotifications)
    const engagementScore = profile.segmentation.engagementScore / 100
    const loyaltyScore = this.getLoyaltyScore(profile.segmentation.loyaltyTier)
    
    return Math.min(100, (responseRate * 40 + engagementScore * 30 + loyaltyScore * 30))
  }

  private calculateCancellationRisk(profile: PatientProfile): number {
    const cancellationRate = profile.behavior.cancellationHistory.rate
    const noShowRate = profile.behavior.noShowHistory.rate
    return Math.min(100, cancellationRate + noShowRate * 0.5)
  }

  private calculateNoShowRisk(profile: PatientProfile): number {
    return Math.min(100, profile.behavior.noShowHistory.rate * 1.2)
  }

  private calculateUpsellOpportunity(profile: PatientProfile): number {
    const lifetimeValue = profile.segmentation.lifetimeValue
    const satisfactionScore = profile.segmentation.satisfactionScore
    const loyaltyScore = this.getLoyaltyScore(profile.segmentation.loyaltyTier)
    
    return Math.min(100, (lifetimeValue / 1000) * 20 + satisfactionScore * 0.3 + loyaltyScore * 0.5)
  }

  private calculateChurnRisk(profile: PatientProfile): number {
    const daysSinceLastActivity = (Date.now() - profile.responseHistory.lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    const satisfactionScore = profile.segmentation.satisfactionScore
    
    let churnRisk = 0
    if (daysSinceLastActivity > 90) churnRisk += 30
    if (daysSinceLastActivity > 180) churnRisk += 40
    if (satisfactionScore < 60) churnRisk += 30
    
    return Math.min(100, churnRisk)
  }

  private predictOptimalChannel(profile: PatientProfile): string {
    const channelPerformance = profile.responseHistory.channelPerformance
    
    let bestChannel = 'sms' // default
    let bestRate = 0
    
    for (const [channel, perf] of Object.entries(channelPerformance)) {
      const responseRate = perf.responded / Math.max(1, perf.sent)
      if (responseRate > bestRate) {
        bestRate = responseRate
        bestChannel = channel
      }
    }
    
    return bestChannel
  }

  private predictOptimalSendTime(profile: PatientProfile): Date {
    const bestTimes = profile.responseHistory.timePerformance.bestTimeOfDay
    const now = new Date()
    
    if (bestTimes.length > 0) {
      const optimalHour = this.getOptimalHour(bestTimes, now.getHours())
      const optimalTime = new Date()
      optimalTime.setHours(optimalHour, 0, 0, 0)
      
      // If it's in the past, schedule for tomorrow
      if (optimalTime <= now) {
        optimalTime.setDate(optimalTime.getDate() + 1)
      }
      
      return optimalTime
    }
    
    // Default to 2 hours from now
    return new Date(now.getTime() + 2 * 60 * 60 * 1000)
  }

  private generateContentRecommendations(profile: PatientProfile): string[] {
    const recommendations: string[] = []
    
    if (profile.preferences.visualPreferences.useEmojis) {
      recommendations.push('emoji-friendly')
    }
    
    if (profile.preferences.languageStyle === 'simple') {
      recommendations.push('simplified-language')
    }
    
    if (profile.segmentation.loyaltyTier === 'gold' || profile.segmentation.loyaltyTier === 'platinum') {
      recommendations.push('vip-treatment')
    }
    
    return recommendations
  }

  private generatePersonalizedOffers(profile: PatientProfile): string[] {
    const offers: string[] = []
    
    if (profile.segmentation.loyaltyTier === 'platinum') {
      offers.push('exclusive-procedures')
    }
    
    if (profile.aiPredictions.upsellOpportunity > 70) {
      offers.push('premium-packages')
    }
    
    if (profile.behavior.cancellationHistory.rate < 10) {
      offers.push('priority-scheduling')
    }
    
    return offers
  }

  private getLoyaltyScore(tier: string): number {
    const scores = { bronze: 25, silver: 50, gold: 75, platinum: 100 }
    return scores[tier as keyof typeof scores] || 25
  }

  private async trackPersonalization(result: PersonalizationResult): Promise<void> {
    // Track personalization decisions for learning and optimization
    console.log(`📊 Tracking personalization for patient ${result.patientId}`)
    
    // In production, this would save to analytics database
    // for machine learning model training
  }

  // Database Operations (Mock implementations)
  private async loadPatientProfiles(): Promise<void> {
    console.log('👤 Loading patient profiles from database...')
    // In production, this would load profiles from database
  }

  private async loadPersonalizationRules(): Promise<void> {
    console.log('📋 Loading personalization rules from database...')
    
    // Create default personalization rules
    const defaultRules: Partial<PersonalizationRule>[] = [
      {
        name: 'High-Value Patient Personalization',
        enabled: true,
        priority: 90,
        conditions: [
          {
            field: 'profile.segmentation.lifetimeValue',
            operator: 'greater_than',
            value: 5000,
            weight: 100
          }
        ],
        actions: [
          {
            type: 'modify_content',
            parameters: {
              modifications: {
                sms: { body: 'Prezado(a) cliente VIP {{patient.name}}...' },
                email: { subject: 'VIP: {{subject}}' }
              }
            },
            confidence: 95
          }
        ],
        targetSegments: ['gold', 'platinum'],
        clinicId: 'default'
      }
    ]
    
    for (const ruleData of defaultRules) {
      const rule: PersonalizationRule = {
        id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...ruleData as PersonalizationRule,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      this.personalizationRules.set(rule.id, rule)
    }
  }

  private async loadActiveABTests(): Promise<void> {
    console.log('🧪 Loading active A/B tests from database...')
    // In production, this would load active tests from database
  }

  private async initializeMLModel(): Promise<void> {
    console.log('🤖 Initializing ML model for personalization...')
    // In production, this would load trained ML models
  }

  private async getPatientProfile(patientId: string): Promise<PatientProfile> {
    let profile = this.patientProfiles.get(patientId)
    
    if (!profile) {
      // Create default profile
      profile = await this.createDefaultProfile(patientId)
      this.patientProfiles.set(patientId, profile)
    }
    
    return profile
  }

  private async createDefaultProfile(patientId: string): Promise<PatientProfile> {
    // Create a default profile with sensible defaults
    const defaultProfile: PatientProfile = {
      patientId,
      clinicId: 'default',
      demographics: {
        age: 35,
        gender: 'prefer_not_to_say',
        location: {
          city: 'São Paulo',
          state: 'SP',
          timezone: 'America/Sao_Paulo'
        },
        language: 'pt-BR'
      },
      preferences: {
        preferredChannels: ['sms', 'email'],
        channelPriority: { sms: 8, email: 6, whatsapp: 7, push: 5 },
        preferredTimes: {
          dayOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
          timeSlots: [{ start: '09:00', end: '18:00' }],
          timezone: 'America/Sao_Paulo'
        },
        quietHours: { start: '22:00', end: '08:00' },
        frequency: 'normal',
        tone: 'friendly',
        languageStyle: 'simple',
        visualPreferences: {
          useEmojis: true,
          preferImages: false,
          preferVideos: false
        }
      },
      behavior: {
        responseRates: { sms: 0.8, email: 0.6, whatsapp: 0.85 },
        averageResponseTime: { sms: 15, email: 120, whatsapp: 30 },
        engagementLevel: 'medium',
        noShowHistory: { rate: 5, patterns: [] },
        cancellationHistory: { rate: 10, reasons: [], timing: [] },
        appointmentPatterns: {
          preferredDayOfWeek: [1, 2, 3, 4, 5],
          preferredTimeOfDay: ['morning', 'afternoon'],
          averageLeadTime: 7,
          seasonalPreferences: {}
        },
        digitalLiteracy: 'medium',
        communicationStyle: 'conversational'
      },
      responseHistory: {
        totalNotifications: 0,
        totalResponses: 0,
        channelPerformance: {},
        contentPerformance: {},
        timePerformance: {
          bestDayOfWeek: [1, 2, 3],
          bestTimeOfDay: ['morning'],
          worstDayOfWeek: [0, 6],
          worstTimeOfDay: ['night'],
          responseTimeDistribution: {}
        },
        lastActivity: new Date()
      },
      personalityInsights: {
        communicationStyle: 'amiable',
        decisionMaking: 'deliberate',
        informationPreference: 'summary',
        riskTolerance: 'moderate',
        technologyAdoption: 'mainstream',
        socialInfluence: 'peer_influenced',
        confidenceLevel: 75
      },
      segmentation: {
        primarySegment: 'regular',
        secondarySegments: [],
        loyaltyTier: 'bronze',
        lifetimeValue: 0,
        riskProfile: 'low',
        engagementScore: 50,
        satisfactionScore: 75,
        recommendationLikelihood: 7
      },
      aiPredictions: {
        nextAppointmentProbability: 50,
        cancellationRisk: 15,
        noShowRisk: 10,
        upsellOpportunity: 30,
        churnRisk: 20,
        optimalChannel: 'sms',
        optimalSendTime: new Date(),
        contentRecommendations: [],
        personalizedOffers: [],
        lastPredictionUpdate: new Date()
      },
      lastUpdated: new Date()
    }
    
    await this.savePatientProfile(defaultProfile)
    console.log(`👤 Created default profile for patient: ${patientId}`)
    
    return defaultProfile
  }

  private async savePatientProfile(profile: PatientProfile): Promise<void> {
    console.log(`💾 Saving patient profile: ${profile.patientId}`)
    // In production, this would save to database
  }

  // Public Query Methods
  public getPersonalizationRules(clinicId?: string): PersonalizationRule[] {
    const rules = Array.from(this.personalizationRules.values())
    return clinicId ? rules.filter(rule => rule.clinicId === clinicId) : rules
  }

  public getPatientProfiles(filters?: {
    clinicId?: string
    segment?: string
    loyaltyTier?: string
  }): PatientProfile[] {
    let profiles = Array.from(this.patientProfiles.values())
    
    if (filters) {
      if (filters.clinicId) {
        profiles = profiles.filter(p => p.clinicId === filters.clinicId)
      }
      if (filters.segment) {
        profiles = profiles.filter(p => 
          p.segmentation.primarySegment === filters.segment ||
          p.segmentation.secondarySegments.includes(filters.segment)
        )
      }
      if (filters.loyaltyTier) {
        profiles = profiles.filter(p => p.segmentation.loyaltyTier === filters.loyaltyTier)
      }
    }
    
    return profiles
  }

  public getPersonalizationStats(clinicId?: string): {
    totalProfiles: number
    averageEngagement: number
    channelPerformance: Record<string, number>
    segmentDistribution: Record<string, number>
    averageConfidence: number
  } {
    const profiles = this.getPatientProfiles(clinicId ? { clinicId } : undefined)
    
    const totalProfiles = profiles.length
    const averageEngagement = profiles.reduce((sum, p) => sum + p.segmentation.engagementScore, 0) / totalProfiles || 0
    
    // Channel performance aggregation
    const channelPerformance: Record<string, number> = {}
    const segmentDistribution: Record<string, number> = {}
    
    for (const profile of profiles) {
      // Aggregate channel performance
      for (const [channel, perf] of Object.entries(profile.responseHistory.channelPerformance)) {
        const responseRate = perf.responded / Math.max(1, perf.sent)
        channelPerformance[channel] = (channelPerformance[channel] || 0) + responseRate
      }
      
      // Segment distribution
      const segment = profile.segmentation.primarySegment
      segmentDistribution[segment] = (segmentDistribution[segment] || 0) + 1
    }
    
    // Average channel performance
    for (const channel of Object.keys(channelPerformance)) {
      channelPerformance[channel] = channelPerformance[channel] / totalProfiles
    }
    
    return {
      totalProfiles,
      averageEngagement,
      channelPerformance,
      segmentDistribution,
      averageConfidence: 85 // Mock average confidence
    }
  }
}

// Singleton instance
let personalizationEngineInstance: PersonalizationEngine | null = null

export const getPersonalizationEngine = (): PersonalizationEngine => {
  if (!personalizationEngineInstance) {
    personalizationEngineInstance = new PersonalizationEngine()
  }
  return personalizationEngineInstance
}

export default PersonalizationEngine