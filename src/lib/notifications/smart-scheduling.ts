/**
 * Smart Scheduling Engine for NeonPro
 * 
 * Motor inteligente de agendamento com análise de padrões, otimização automática
 * e detecção de horários ideais baseado em histórico e preferências
 */

import { z } from 'zod'
import { AutomatedReminderEngine } from './reminder-engine'

export interface SchedulingRule {
  id: string
  name: string
  enabled: boolean
  priority: number
  conditions: SchedulingCondition[]
  actions: SchedulingAction[]
  clinicId: string
  professionalId?: string
  procedureTypes: string[]
  timeConstraints: TimeConstraint[]
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface SchedulingCondition {
  field: string // e.g., "patient.age", "appointment.duration", "time.dayOfWeek"
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in'
  value: any
  weight: number // influence weight for scoring
}

export interface SchedulingAction {
  type: 'suggest_time' | 'block_time' | 'adjust_duration' | 'recommend_professional' | 'add_buffer'
  parameters: Record<string, any>
  priority: number
}

export interface TimeConstraint {
  type: 'availability' | 'buffer' | 'lunch_break' | 'procedure_gap' | 'cleanup_time'
  startTime: string // HH:mm format
  endTime: string
  dayOfWeek?: number[] // 0-6, Sunday = 0
  duration?: number // in minutes
  required: boolean
}

export interface SchedulingRequest {
  patientId: string
  clinicId: string
  professionalId?: string
  procedureType: string
  estimatedDuration: number
  preferredDates?: Date[]
  preferredTimes?: string[] // e.g., ["morning", "afternoon", "evening"]
  constraints?: PatientConstraints
  urgency: 'low' | 'normal' | 'high' | 'urgent'
  metadata: Record<string, any>
}

export interface PatientConstraints {
  availableDays: number[] // 0-6, Sunday = 0
  availableTimeSlots: TimeSlot[]
  blackoutDates: Date[]
  preferredProfessional?: string
  maxWaitTime?: number // in days
  requiresSpecialAccommodation?: boolean
  notes?: string
}

export interface TimeSlot {
  start: string // HH:mm format
  end: string
  dayOfWeek?: number[]
}

export interface SchedulingSuggestion {
  id: string
  appointmentTime: Date
  endTime: Date
  professionalId: string
  score: number // 0-100, higher is better
  confidence: number // 0-100
  reasoning: string[]
  alternatives: AlternativeSlot[]
  conflicts: SchedulingConflict[]
  bufferTime: {
    before: number // minutes
    after: number
  }
  estimatedCost?: number
  patientSatisfactionScore?: number
}

export interface AlternativeSlot {
  appointmentTime: Date
  endTime: Date
  professionalId: string
  score: number
  reasoning: string[]
}

export interface SchedulingConflict {
  type: 'time_overlap' | 'resource_unavailable' | 'constraint_violation' | 'policy_violation'
  severity: 'info' | 'warning' | 'error' | 'critical'
  description: string
  suggestedResolution?: string
}

export interface SchedulingPattern {
  id: string
  patientId?: string
  professionalId?: string
  procedureType?: string
  clinicId: string
  pattern: {
    preferredDayOfWeek: number[]
    preferredTimeOfDay: string[] // morning, afternoon, evening
    averageLeadTime: number // days
    seasonalPreferences?: Record<string, any>
    cancellationRate: number
    noShowRate: number
  }
  confidence: number
  sampleSize: number
  lastUpdated: Date
}

export interface ResourceAvailability {
  resourceId: string
  resourceType: 'professional' | 'room' | 'equipment'
  date: Date
  availableSlots: TimeSlot[]
  bookedSlots: TimeSlot[]
  blockedSlots: TimeSlot[]
  capacity: number
  utilizationRate: number
}

export interface SchedulingOptimization {
  date: Date
  clinicId: string
  metrics: {
    utilizationRate: number
    patientSatisfaction: number
    revenueOptimization: number
    waitTimeReduction: number
  }
  suggestions: OptimizationSuggestion[]
  appliedOptimizations: string[]
}

export interface OptimizationSuggestion {
  type: 'schedule_compression' | 'load_balancing' | 'gap_filling' | 'overbooking_prevention'
  description: string
  impact: string
  estimatedImprovement: Record<string, number>
  riskLevel: 'low' | 'medium' | 'high'
}

const SchedulingRequestSchema = z.object({
  patientId: z.string(),
  clinicId: z.string(),
  procedureType: z.string(),
  estimatedDuration: z.number().min(1),
  urgency: z.enum(['low', 'normal', 'high', 'urgent']),
  metadata: z.record(z.any())
})

export class SmartSchedulingEngine {
  private schedulingRules: Map<string, SchedulingRule> = new Map()
  private schedulingPatterns: Map<string, SchedulingPattern> = new Map()
  private resourceAvailability: Map<string, ResourceAvailability[]> = new Map()
  private reminderEngine?: AutomatedReminderEngine
  private mlModel?: any // Machine learning model for pattern prediction

  constructor(reminderEngine?: AutomatedReminderEngine) {
    this.reminderEngine = reminderEngine
    this.initializeEngine()
  }

  private async initializeEngine(): Promise<void> {
    console.log('🧠 Initializing Smart Scheduling Engine...')
    
    // Load scheduling rules
    await this.loadSchedulingRules()
    
    // Load historical patterns
    await this.loadSchedulingPatterns()
    
    // Load resource availability
    await this.loadResourceAvailability()
    
    // Initialize ML model for pattern recognition
    await this.initializeMLModel()
    
    console.log('✅ Smart Scheduling Engine initialized successfully')
  }

  // Main Scheduling Methods
  public async findOptimalSchedule(request: SchedulingRequest): Promise<SchedulingSuggestion[]> {
    console.log(`🎯 Finding optimal schedule for patient: ${request.patientId}`)
    
    // Validate request
    SchedulingRequestSchema.parse(request)
    
    // Get applicable rules
    const applicableRules = this.getApplicableRules(request)
    
    // Get scheduling patterns
    const patterns = await this.getRelevantPatterns(request)
    
    // Get available time slots
    const availableSlots = await this.getAvailableTimeSlots(request)
    
    // Score and rank suggestions
    const suggestions = await this.scoreTimeSlots(request, availableSlots, patterns, applicableRules)
    
    // Apply optimization
    const optimizedSuggestions = await this.optimizeSuggestions(suggestions, request)
    
    // Sort by score and return top suggestions
    return optimizedSuggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 10) // Return top 10 suggestions
  }

  private getApplicableRules(request: SchedulingRequest): SchedulingRule[] {
    const applicableRules: SchedulingRule[] = []
    
    for (const rule of this.schedulingRules.values()) {
      if (!rule.enabled) continue
      
      // Check clinic
      if (rule.clinicId !== request.clinicId) continue
      
      // Check professional
      if (rule.professionalId && request.professionalId !== rule.professionalId) continue
      
      // Check procedure type
      if (rule.procedureTypes.length > 0 && !rule.procedureTypes.includes(request.procedureType)) continue
      
      // Check conditions
      if (this.evaluateSchedulingConditions(rule.conditions, request)) {
        applicableRules.push(rule)
      }
    }
    
    return applicableRules.sort((a, b) => b.priority - a.priority)
  }

  private evaluateSchedulingConditions(conditions: SchedulingCondition[], request: SchedulingRequest): boolean {
    let totalWeight = 0
    let matchedWeight = 0
    
    for (const condition of conditions) {
      totalWeight += condition.weight
      
      if (this.evaluateCondition(condition, request)) {
        matchedWeight += condition.weight
      }
    }
    
    // Return true if more than 70% of weighted conditions match
    return totalWeight === 0 || (matchedWeight / totalWeight) >= 0.7
  }

  private evaluateCondition(condition: SchedulingCondition, request: SchedulingRequest): boolean {
    const value = this.getValueFromPath(condition.field, request)
    
    switch (condition.operator) {
      case 'equals':
        return value === condition.value
      case 'not_equals':
        return value !== condition.value
      case 'contains':
        return typeof value === 'string' && value.includes(condition.value)
      case 'greater_than':
        return Number(value) > Number(condition.value)
      case 'less_than':
        return Number(value) < Number(condition.value)
      case 'between':
        const [min, max] = condition.value
        return Number(value) >= min && Number(value) <= max
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value)
      default:
        return false
    }
  }

  private getValueFromPath(path: string, obj: any): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  private async getRelevantPatterns(request: SchedulingRequest): Promise<SchedulingPattern[]> {
    const relevantPatterns: SchedulingPattern[] = []
    
    for (const pattern of this.schedulingPatterns.values()) {
      // Patient-specific pattern
      if (pattern.patientId === request.patientId) {
        relevantPatterns.push(pattern)
        continue
      }
      
      // Professional-specific pattern
      if (pattern.professionalId === request.professionalId) {
        relevantPatterns.push(pattern)
        continue
      }
      
      // Procedure-specific pattern
      if (pattern.procedureType === request.procedureType) {
        relevantPatterns.push(pattern)
        continue
      }
      
      // Clinic-wide pattern
      if (pattern.clinicId === request.clinicId && !pattern.patientId && !pattern.professionalId && !pattern.procedureType) {
        relevantPatterns.push(pattern)
      }
    }
    
    return relevantPatterns.sort((a, b) => b.confidence - a.confidence)
  }

  private async getAvailableTimeSlots(request: SchedulingRequest): Promise<TimeSlot[]> {
    const availableSlots: TimeSlot[] = []
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 90) // Look 90 days ahead
    
    // Get professionals to consider
    const professionals = request.professionalId 
      ? [request.professionalId]
      : await this.getAvailableProfessionals(request.clinicId, request.procedureType)
    
    // For each day in the range
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      // Skip if patient has constraints for this day
      if (request.constraints?.blackoutDates?.some(blackout => 
        blackout.toDateString() === date.toDateString())) {
        continue
      }
      
      // Check if day of week is available
      const dayOfWeek = date.getDay()
      if (request.constraints?.availableDays && 
          !request.constraints.availableDays.includes(dayOfWeek)) {
        continue
      }
      
      // Get available slots for each professional
      for (const professionalId of professionals) {
        const professionalSlots = await this.getProfessionalAvailability(professionalId, date)
        
        for (const slot of professionalSlots) {
          // Check if slot meets duration requirements
          const slotDuration = this.calculateSlotDuration(slot)
          if (slotDuration >= request.estimatedDuration) {
            availableSlots.push({
              ...slot,
              dayOfWeek: [dayOfWeek]
            })
          }
        }
      }
    }
    
    return availableSlots
  }

  private calculateSlotDuration(slot: TimeSlot): number {
    const start = this.parseTime(slot.start)
    const end = this.parseTime(slot.end)
    return end - start
  }

  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
  }

  private async scoreTimeSlots(
    request: SchedulingRequest,
    availableSlots: TimeSlot[],
    patterns: SchedulingPattern[],
    rules: SchedulingRule[]
  ): Promise<SchedulingSuggestion[]> {
    const suggestions: SchedulingSuggestion[] = []
    
    for (const slot of availableSlots) {
      const score = await this.calculateSlotScore(slot, request, patterns, rules)
      
      if (score.totalScore > 0) {
        const suggestion: SchedulingSuggestion = {
          id: `suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          appointmentTime: this.slotToDate(slot),
          endTime: this.slotToEndDate(slot, request.estimatedDuration),
          professionalId: await this.getBestProfessional(slot, request),
          score: score.totalScore,
          confidence: score.confidence,
          reasoning: score.reasoning,
          alternatives: [],
          conflicts: await this.detectConflicts(slot, request),
          bufferTime: this.calculateBufferTime(slot, request, rules),
          estimatedCost: await this.estimateCost(request),
          patientSatisfactionScore: await this.predictPatientSatisfaction(slot, request, patterns)
        }
        
        suggestions.push(suggestion)
      }
    }
    
    return suggestions
  }

  private async calculateSlotScore(
    slot: TimeSlot,
    request: SchedulingRequest,
    patterns: SchedulingPattern[],
    rules: SchedulingRule[]
  ): Promise<{
    totalScore: number
    confidence: number
    reasoning: string[]
  }> {
    let totalScore = 0
    let confidence = 0
    const reasoning: string[] = []
    
    // Base score for availability
    totalScore += 20
    reasoning.push('Horário disponível')
    
    // Pattern-based scoring
    for (const pattern of patterns) {
      const patternScore = this.scoreAgainstPattern(slot, pattern)
      totalScore += patternScore
      
      if (patternScore > 0) {
        reasoning.push(`Compatível com padrão histórico (+${patternScore} pontos)`)
      }
    }
    
    // Rule-based scoring
    for (const rule of rules) {
      const ruleScore = this.scoreAgainstRule(slot, rule, request)
      totalScore += ruleScore
      
      if (ruleScore > 0) {
        reasoning.push(`Segue regra: ${rule.name} (+${ruleScore} pontos)`)
      }
    }
    
    // Preference-based scoring
    const preferenceScore = this.scoreAgainstPreferences(slot, request)
    totalScore += preferenceScore
    
    if (preferenceScore > 0) {
      reasoning.push(`Compatível com preferências (+${preferenceScore} pontos)`)
    }
    
    // Urgency-based scoring
    const urgencyScore = this.scoreByUrgency(slot, request)
    totalScore += urgencyScore
    
    if (urgencyScore > 0) {
      reasoning.push(`Ajustado para urgência: ${request.urgency} (+${urgencyScore} pontos)`)
    }
    
    // Calculate confidence based on pattern match and sample size
    confidence = Math.min(100, patterns.reduce((acc, pattern) => {
      return acc + (pattern.confidence * pattern.sampleSize / 100)
    }, 50))
    
    return {
      totalScore: Math.max(0, Math.min(100, totalScore)),
      confidence,
      reasoning
    }
  }

  private scoreAgainstPattern(slot: TimeSlot, pattern: SchedulingPattern): number {
    let score = 0
    
    // Check day of week preference
    if (slot.dayOfWeek && pattern.pattern.preferredDayOfWeek.some(day => 
        slot.dayOfWeek!.includes(day))) {
      score += 15 * (pattern.confidence / 100)
    }
    
    // Check time of day preference
    const timeOfDay = this.getTimeOfDay(slot.start)
    if (pattern.pattern.preferredTimeOfDay.includes(timeOfDay)) {
      score += 10 * (pattern.confidence / 100)
    }
    
    // Adjust for cancellation/no-show rates
    const reliabilityBonus = Math.max(0, (100 - pattern.pattern.cancellationRate - pattern.pattern.noShowRate) / 10)
    score += reliabilityBonus * (pattern.confidence / 100)
    
    return Math.round(score)
  }

  private scoreAgainstRule(slot: TimeSlot, rule: SchedulingRule, request: SchedulingRequest): number {
    let score = 0
    
    for (const action of rule.actions) {
      switch (action.type) {
        case 'suggest_time':
          if (this.matchesTimeAction(slot, action)) {
            score += action.priority * 5
          }
          break
          
        case 'recommend_professional':
          if (request.professionalId === action.parameters.professionalId) {
            score += action.priority * 3
          }
          break
          
        case 'add_buffer':
          // Positive score for respecting buffer times
          score += action.priority * 2
          break
      }
    }
    
    return Math.round(score * (rule.priority / 100))
  }

  private scoreAgainstPreferences(slot: TimeSlot, request: SchedulingRequest): number {
    let score = 0
    
    if (request.constraints?.preferredProfessional) {
      // This would need to be checked against the actual professional assignment
      score += 10
    }
    
    if (request.constraints?.availableTimeSlots) {
      const matchesTimeSlot = request.constraints.availableTimeSlots.some(prefSlot =>
        this.timeSlotsOverlap(slot, prefSlot)
      )
      
      if (matchesTimeSlot) {
        score += 15
      }
    }
    
    if (request.preferredTimes) {
      const timeOfDay = this.getTimeOfDay(slot.start)
      if (request.preferredTimes.includes(timeOfDay)) {
        score += 10
      }
    }
    
    return score
  }

  private scoreByUrgency(slot: TimeSlot, request: SchedulingRequest): number {
    const now = new Date()
    const slotDate = this.slotToDate(slot)
    const daysUntil = (slotDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    
    switch (request.urgency) {
      case 'urgent':
        return Math.max(0, 20 - daysUntil * 2) // Higher score for sooner dates
      case 'high':
        return Math.max(0, 15 - daysUntil * 1.5)
      case 'normal':
        return daysUntil >= 1 && daysUntil <= 14 ? 10 : 0 // Sweet spot for normal appointments
      case 'low':
        return daysUntil >= 7 ? 5 : 0 // Prefer later dates for low urgency
      default:
        return 0
    }
  }

  private getTimeOfDay(time: string): string {
    const hour = parseInt(time.split(':')[0])
    
    if (hour >= 6 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 18) return 'afternoon'
    if (hour >= 18 && hour < 22) return 'evening'
    return 'night'
  }

  private matchesTimeAction(slot: TimeSlot, action: SchedulingAction): boolean {
    const { startTime, endTime, dayOfWeek } = action.parameters
    
    if (startTime && slot.start < startTime) return false
    if (endTime && slot.end > endTime) return false
    if (dayOfWeek && slot.dayOfWeek && !slot.dayOfWeek.some(day => dayOfWeek.includes(day))) return false
    
    return true
  }

  private timeSlotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
    const start1 = this.parseTime(slot1.start)
    const end1 = this.parseTime(slot1.end)
    const start2 = this.parseTime(slot2.start)
    const end2 = this.parseTime(slot2.end)
    
    return start1 < end2 && start2 < end1
  }

  private slotToDate(slot: TimeSlot): Date {
    // This is simplified - in reality you'd need the actual date
    const now = new Date()
    const [hours, minutes] = slot.start.split(':').map(Number)
    now.setHours(hours, minutes, 0, 0)
    return now
  }

  private slotToEndDate(slot: TimeSlot, duration: number): Date {
    const startDate = this.slotToDate(slot)
    return new Date(startDate.getTime() + duration * 60 * 1000)
  }

  private async getBestProfessional(slot: TimeSlot, request: SchedulingRequest): Promise<string> {
    // Simplified - return preferred professional or first available
    return request.professionalId || 'default_professional'
  }

  private async detectConflicts(slot: TimeSlot, request: SchedulingRequest): Promise<SchedulingConflict[]> {
    const conflicts: SchedulingConflict[] = []
    
    // Check for time overlaps
    const overlaps = await this.checkTimeOverlaps(slot, request)
    conflicts.push(...overlaps)
    
    // Check resource availability
    const resourceConflicts = await this.checkResourceConflicts(slot, request)
    conflicts.push(...resourceConflicts)
    
    return conflicts
  }

  private async checkTimeOverlaps(slot: TimeSlot, request: SchedulingRequest): Promise<SchedulingConflict[]> {
    // Mock implementation - would check against existing appointments
    return []
  }

  private async checkResourceConflicts(slot: TimeSlot, request: SchedulingRequest): Promise<SchedulingConflict[]> {
    // Mock implementation - would check room/equipment availability
    return []
  }

  private calculateBufferTime(slot: TimeSlot, request: SchedulingRequest, rules: SchedulingRule[]): {
    before: number
    after: number
  } {
    let before = 15 // default 15 minutes
    let after = 15
    
    // Apply rule-based buffer adjustments
    for (const rule of rules) {
      for (const action of rule.actions) {
        if (action.type === 'add_buffer') {
          before = Math.max(before, action.parameters.before || 0)
          after = Math.max(after, action.parameters.after || 0)
        }
      }
    }
    
    // Adjust based on procedure complexity
    if (request.estimatedDuration > 120) { // 2+ hour procedures
      before += 10
      after += 15
    }
    
    return { before, after }
  }

  private async estimateCost(request: SchedulingRequest): Promise<number> {
    // Mock implementation - would calculate based on procedure, professional, time slot
    return 100 // Base cost
  }

  private async predictPatientSatisfaction(
    slot: TimeSlot,
    request: SchedulingRequest,
    patterns: SchedulingPattern[]
  ): Promise<number> {
    // Use ML model or pattern analysis to predict satisfaction
    let satisfaction = 75 // base satisfaction
    
    // Adjust based on patterns
    for (const pattern of patterns) {
      if (pattern.patientId === request.patientId) {
        // If it matches patient's historical preferences, increase satisfaction
        const timeOfDay = this.getTimeOfDay(slot.start)
        if (pattern.pattern.preferredTimeOfDay.includes(timeOfDay)) {
          satisfaction += 15
        }
      }
    }
    
    return Math.min(100, satisfaction)
  }

  private async optimizeSuggestions(
    suggestions: SchedulingSuggestion[],
    request: SchedulingRequest
  ): Promise<SchedulingSuggestion[]> {
    // Apply optimization algorithms
    
    // Generate alternatives for top suggestions
    for (const suggestion of suggestions.slice(0, 5)) {
      suggestion.alternatives = await this.generateAlternatives(suggestion, request)
    }
    
    // Remove suggestions with critical conflicts
    const filteredSuggestions = suggestions.filter(suggestion =>
      !suggestion.conflicts.some(conflict => conflict.severity === 'critical')
    )
    
    return filteredSuggestions
  }

  private async generateAlternatives(
    suggestion: SchedulingSuggestion,
    request: SchedulingRequest
  ): Promise<AlternativeSlot[]> {
    const alternatives: AlternativeSlot[] = []
    
    // Generate time alternatives (±2 hours)
    for (let hourOffset = -2; hourOffset <= 2; hourOffset++) {
      if (hourOffset === 0) continue
      
      const altTime = new Date(suggestion.appointmentTime)
      altTime.setHours(altTime.getHours() + hourOffset)
      
      const altEndTime = new Date(altTime.getTime() + request.estimatedDuration * 60 * 1000)
      
      alternatives.push({
        appointmentTime: altTime,
        endTime: altEndTime,
        professionalId: suggestion.professionalId,
        score: suggestion.score - Math.abs(hourOffset) * 5,
        reasoning: [`Horário alternativo: ${hourOffset > 0 ? '+' : ''}${hourOffset}h`]
      })
    }
    
    // Generate professional alternatives
    const altProfessionals = await this.getAlternativeProfessionals(
      request.clinicId,
      request.procedureType,
      suggestion.professionalId
    )
    
    for (const profId of altProfessionals.slice(0, 2)) {
      alternatives.push({
        appointmentTime: suggestion.appointmentTime,
        endTime: suggestion.endTime,
        professionalId: profId,
        score: suggestion.score - 10,
        reasoning: ['Profissional alternativo disponível']
      })
    }
    
    return alternatives.sort((a, b) => b.score - a.score).slice(0, 3)
  }

  // Pattern Learning and Analysis
  public async updateSchedulingPatterns(): Promise<void> {
    console.log('📊 Updating scheduling patterns from historical data...')
    
    // Analyze completed appointments from the last 6 months
    const historicalData = await this.getHistoricalAppointments()
    
    // Group by patient, professional, procedure, and clinic
    const patternGroups = this.groupAppointmentsByPattern(historicalData)
    
    // Analyze each group and update patterns
    for (const [key, appointments] of patternGroups) {
      const pattern = this.analyzeAppointmentPattern(key, appointments)
      if (pattern && pattern.sampleSize >= 3) { // Minimum sample size
        this.schedulingPatterns.set(pattern.id, pattern)
        await this.saveSchedulingPattern(pattern)
      }
    }
    
    console.log(`📊 Updated ${this.schedulingPatterns.size} scheduling patterns`)
  }

  private async getHistoricalAppointments(): Promise<any[]> {
    // Mock implementation - would query database for completed appointments
    return []
  }

  private groupAppointmentsByPattern(appointments: any[]): Map<string, any[]> {
    const groups = new Map<string, any[]>()
    
    for (const appointment of appointments) {
      // Create different grouping keys for different pattern types
      const keys = [
        `patient_${appointment.patientId}`,
        `professional_${appointment.professionalId}`,
        `procedure_${appointment.procedureType}`,
        `clinic_${appointment.clinicId}`
      ]
      
      for (const key of keys) {
        if (!groups.has(key)) {
          groups.set(key, [])
        }
        groups.get(key)!.push(appointment)
      }
    }
    
    return groups
  }

  private analyzeAppointmentPattern(key: string, appointments: any[]): SchedulingPattern | null {
    if (appointments.length < 3) return null
    
    const [type, id] = key.split('_')
    
    // Analyze appointment times
    const dayOfWeekCounts = new Array(7).fill(0)
    const timeOfDayCounts = { morning: 0, afternoon: 0, evening: 0, night: 0 }
    let totalLeadTime = 0
    let cancellations = 0
    let noShows = 0
    
    for (const appointment of appointments) {
      const appointmentDate = new Date(appointment.scheduledAt)
      const dayOfWeek = appointmentDate.getDay()
      dayOfWeekCounts[dayOfWeek]++
      
      const timeOfDay = this.getTimeOfDay(appointmentDate.toTimeString().substr(0, 5))
      timeOfDayCounts[timeOfDay]++
      
      // Calculate lead time
      const createdAt = new Date(appointment.createdAt)
      const leadTime = (appointmentDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      totalLeadTime += leadTime
      
      // Count cancellations and no-shows
      if (appointment.status === 'cancelled') cancellations++
      if (appointment.status === 'no_show') noShows++
    }
    
    // Find preferred days and times
    const preferredDayOfWeek = dayOfWeekCounts
      .map((count, index) => ({ day: index, count }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.day)
    
    const preferredTimeOfDay = Object.entries(timeOfDayCounts)
      .filter(([_, count]) => count > 0)
      .sort(([_a, countA], [_b, countB]) => countB - countA)
      .slice(0, 2)
      .map(([time, _]) => time)
    
    const pattern: SchedulingPattern = {
      id: `pattern_${key}`,
      ...(type === 'patient' && { patientId: id }),
      ...(type === 'professional' && { professionalId: id }),
      ...(type === 'procedure' && { procedureType: id }),
      clinicId: type === 'clinic' ? id : appointments[0].clinicId,
      pattern: {
        preferredDayOfWeek,
        preferredTimeOfDay,
        averageLeadTime: totalLeadTime / appointments.length,
        cancellationRate: (cancellations / appointments.length) * 100,
        noShowRate: (noShows / appointments.length) * 100
      },
      confidence: Math.min(95, 50 + (appointments.length * 5)), // Higher confidence with more data
      sampleSize: appointments.length,
      lastUpdated: new Date()
    }
    
    return pattern
  }

  // Scheduling Optimization
  public async optimizeScheduleForDate(date: Date, clinicId: string): Promise<SchedulingOptimization> {
    console.log(`🎯 Optimizing schedule for ${date.toDateString()} at clinic ${clinicId}`)
    
    const currentSchedule = await this.getCurrentSchedule(date, clinicId)
    const optimization = await this.analyzeScheduleOptimization(currentSchedule, date, clinicId)
    
    // Apply automatic optimizations if configured
    await this.applyAutomaticOptimizations(optimization)
    
    return optimization
  }

  private async getCurrentSchedule(date: Date, clinicId: string): Promise<any[]> {
    // Mock implementation - would get actual schedule from database
    return []
  }

  private async analyzeScheduleOptimization(
    schedule: any[],
    date: Date,
    clinicId: string
  ): Promise<SchedulingOptimization> {
    const optimization: SchedulingOptimization = {
      date,
      clinicId,
      metrics: {
        utilizationRate: await this.calculateUtilizationRate(schedule),
        patientSatisfaction: await this.calculatePatientSatisfaction(schedule),
        revenueOptimization: await this.calculateRevenueOptimization(schedule),
        waitTimeReduction: await this.calculateWaitTimeReduction(schedule)
      },
      suggestions: [],
      appliedOptimizations: []
    }
    
    // Generate optimization suggestions
    optimization.suggestions = await this.generateOptimizationSuggestions(schedule, optimization.metrics)
    
    return optimization
  }

  private async calculateUtilizationRate(schedule: any[]): Promise<number> {
    // Calculate percentage of available time slots that are booked
    return 75 // Mock value
  }

  private async calculatePatientSatisfaction(schedule: any[]): Promise<number> {
    // Calculate based on appointment timing preferences and wait times
    return 85 // Mock value
  }

  private async calculateRevenueOptimization(schedule: any[]): Promise<number> {
    // Calculate revenue efficiency based on appointment mix and timing
    return 80 // Mock value
  }

  private async calculateWaitTimeReduction(schedule: any[]): Promise<number> {
    // Calculate potential wait time reduction through better scheduling
    return 70 // Mock value
  }

  private async generateOptimizationSuggestions(
    schedule: any[],
    metrics: SchedulingOptimization['metrics']
  ): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = []
    
    if (metrics.utilizationRate < 80) {
      suggestions.push({
        type: 'gap_filling',
        description: 'Preencher lacunas na agenda com procedimentos rápidos',
        impact: 'Aumentar taxa de utilização em 10-15%',
        estimatedImprovement: { utilizationRate: 12 },
        riskLevel: 'low'
      })
    }
    
    if (metrics.patientSatisfaction < 90) {
      suggestions.push({
        type: 'schedule_compression',
        description: 'Reagrupar consultas por preferência de horário dos pacientes',
        impact: 'Melhorar satisfação do paciente',
        estimatedImprovement: { patientSatisfaction: 8 },
        riskLevel: 'medium'
      })
    }
    
    return suggestions
  }

  private async applyAutomaticOptimizations(optimization: SchedulingOptimization): Promise<void> {
    // Apply low-risk optimizations automatically
    for (const suggestion of optimization.suggestions) {
      if (suggestion.riskLevel === 'low') {
        await this.applyOptimization(suggestion, optimization)
        optimization.appliedOptimizations.push(suggestion.type)
      }
    }
  }

  private async applyOptimization(
    suggestion: OptimizationSuggestion,
    optimization: SchedulingOptimization
  ): Promise<void> {
    console.log(`🔧 Applying optimization: ${suggestion.type}`)
    
    switch (suggestion.type) {
      case 'gap_filling':
        await this.fillScheduleGaps(optimization.date, optimization.clinicId)
        break
      case 'load_balancing':
        await this.balanceWorkload(optimization.date, optimization.clinicId)
        break
      case 'schedule_compression':
        await this.compressSchedule(optimization.date, optimization.clinicId)
        break
    }
  }

  private async fillScheduleGaps(date: Date, clinicId: string): Promise<void> {
    // Implementation for filling schedule gaps
    console.log('🔧 Filling schedule gaps...')
  }

  private async balanceWorkload(date: Date, clinicId: string): Promise<void> {
    // Implementation for balancing workload across professionals
    console.log('⚖️ Balancing workload...')
  }

  private async compressSchedule(date: Date, clinicId: string): Promise<void> {
    // Implementation for schedule compression
    console.log('🗜️ Compressing schedule...')
  }

  // Database Operations (Mock implementations)
  private async loadSchedulingRules(): Promise<void> {
    console.log('📋 Loading scheduling rules from database...')
    
    // Create default scheduling rules
    const defaultRules: Partial<SchedulingRule>[] = [
      {
        name: 'Regra de Buffer entre Procedimentos',
        enabled: true,
        priority: 90,
        conditions: [
          {
            field: 'procedure.duration',
            operator: 'greater_than',
            value: 60,
            weight: 100
          }
        ],
        actions: [
          {
            type: 'add_buffer',
            parameters: { before: 15, after: 20 },
            priority: 90
          }
        ],
        clinicId: 'default',
        procedureTypes: [],
        timeConstraints: [],
        metadata: {}
      }
    ]
    
    for (const ruleData of defaultRules) {
      const rule: SchedulingRule = {
        id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...ruleData as SchedulingRule,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      this.schedulingRules.set(rule.id, rule)
      await this.saveSchedulingRule(rule)
    }
  }

  private async loadSchedulingPatterns(): Promise<void> {
    console.log('📊 Loading scheduling patterns from database...')
    // In production, this would load saved patterns
  }

  private async loadResourceAvailability(): Promise<void> {
    console.log('📅 Loading resource availability from database...')
    // In production, this would load current availability
  }

  private async initializeMLModel(): Promise<void> {
    console.log('🤖 Initializing ML model for pattern prediction...')
    // In production, this would load a trained ML model
  }

  private async saveSchedulingRule(rule: SchedulingRule): Promise<void> {
    console.log(`💾 Saving scheduling rule: ${rule.name}`)
  }

  private async saveSchedulingPattern(pattern: SchedulingPattern): Promise<void> {
    console.log(`💾 Saving scheduling pattern: ${pattern.id}`)
  }

  private async getAvailableProfessionals(clinicId: string, procedureType: string): Promise<string[]> {
    // Mock: Get professionals who can perform the procedure
    return ['prof1', 'prof2', 'prof3']
  }

  private async getProfessionalAvailability(professionalId: string, date: Date): Promise<TimeSlot[]> {
    // Mock: Get professional's available time slots for the day
    return [
      { start: '09:00', end: '12:00' },
      { start: '14:00', end: '18:00' }
    ]
  }

  private async getAlternativeProfessionals(
    clinicId: string,
    procedureType: string,
    excludeProfessionalId: string
  ): Promise<string[]> {
    const all = await this.getAvailableProfessionals(clinicId, procedureType)
    return all.filter(id => id !== excludeProfessionalId)
  }

  // Public Query Methods
  public getSchedulingRules(clinicId?: string): SchedulingRule[] {
    const rules = Array.from(this.schedulingRules.values())
    return clinicId ? rules.filter(rule => rule.clinicId === clinicId) : rules
  }

  public getSchedulingPatterns(filters?: {
    patientId?: string
    professionalId?: string
    procedureType?: string
    clinicId?: string
  }): SchedulingPattern[] {
    let patterns = Array.from(this.schedulingPatterns.values())
    
    if (filters) {
      if (filters.patientId) {
        patterns = patterns.filter(p => p.patientId === filters.patientId)
      }
      if (filters.professionalId) {
        patterns = patterns.filter(p => p.professionalId === filters.professionalId)
      }
      if (filters.procedureType) {
        patterns = patterns.filter(p => p.procedureType === filters.procedureType)
      }
      if (filters.clinicId) {
        patterns = patterns.filter(p => p.clinicId === filters.clinicId)
      }
    }
    
    return patterns
  }

  public getSchedulingStats(clinicId?: string): {
    totalRules: number
    activeRules: number
    totalPatterns: number
    averageConfidence: number
    optimizationScore: number
  } {
    const rules = this.getSchedulingRules(clinicId)
    const patterns = this.getSchedulingPatterns(clinicId ? { clinicId } : undefined)
    
    const averageConfidence = patterns.length > 0
      ? patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length
      : 0
    
    return {
      totalRules: rules.length,
      activeRules: rules.filter(r => r.enabled).length,
      totalPatterns: patterns.length,
      averageConfidence,
      optimizationScore: 85 // Mock optimization score
    }
  }
}

// Singleton instance
let smartSchedulingEngineInstance: SmartSchedulingEngine | null = null

export const getSmartSchedulingEngine = (reminderEngine?: AutomatedReminderEngine): SmartSchedulingEngine => {
  if (!smartSchedulingEngineInstance) {
    smartSchedulingEngineInstance = new SmartSchedulingEngine(reminderEngine)
  }
  return smartSchedulingEngineInstance
}

export default SmartSchedulingEngine