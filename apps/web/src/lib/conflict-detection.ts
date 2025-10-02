// Conflict Detection Service for Healthcare Appointment Scheduling
// Advanced conflict detection and resolution for healthcare appointments

export interface ConflictDetectionRequest {
  appointmentId?: string
  practitionerId: string
  startTime: string
  endTime: string
  roomId?: string
  equipmentIds?: string[]
  patientId?: string
  priority: 'low' | 'medium' | 'high' | 'emergency'
}

export interface ConflictDetectionResult {
  hasConflicts: boolean
  conflicts: AppointmentConflict[]
  suggestions: ConflictResolutionSuggestion[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

export interface AppointmentConflict {
  id: string
  type: 'time_overlap' | 'resource_conflict' | 'practitioner_unavailable' | 'patient_double_booking' | 'room_unavailable' | 'equipment_conflict'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  conflictingAppointmentId?: string
  conflictingResourceId?: string
  suggestedResolution?: string
  impact: string
}

export interface ConflictResolutionSuggestion {
  id: string
  type: 'reschedule' | 'change_practitioner' | 'change_room' | 'extend_duration' | 'cancel_conflicting' | 'override_with_approval'
  description: string
  confidence: number // 0-1
  effort: 'low' | 'medium' | 'high'
  estimatedTime: string
  pros: string[]
  cons: string[]
}

export interface ScheduleOptimizationResult {
  optimizedSchedule: OptimizedAppointment[]
  totalConflictsResolved: number
  efficiencyGain: number
  patientSatisfaction: number
  practitionerUtilization: number
}

export interface OptimizedAppointment {
  appointmentId: string
  originalStart?: string
  originalEnd?: string
  optimizedStart: string
  optimizedEnd: string
  practitionerId: string
  roomId?: string
  confidence: number
  reason: string
}

export class ConflictDetector {
  private appointmentService: any
  private resourceService: any
  private businessRules: BusinessRuleEngine

  constructor(appointmentService?: any, resourceService?: any) {
    this.appointmentService = appointmentService
    this.resourceService = resourceService
    this.businessRules = new BusinessRuleEngine()
  }

  async detectSchedulingConflicts(request: ConflictDetectionRequest): Promise<ConflictDetectionResult> {
    const conflicts: AppointmentConflict[] = []
    
    // Check for time overlaps with same practitioner
    const timeConflicts = await this.detectTimeOverlaps(request)
    conflicts.push(...timeConflicts)

    // Check for resource conflicts (rooms, equipment)
    const resourceConflicts = await this.detectResourceConflicts(request)
    conflicts.push(...resourceConflicts)

    // Check for practitioner availability
    const availabilityConflicts = await this.detectPractitionerConflicts(request)
    conflicts.push(...availabilityConflicts)

    // Check for patient double-booking
    const patientConflicts = await this.detectPatientConflicts(request)
    conflicts.push(...patientConflicts)

    // Generate resolution suggestions
    const suggestions = this.generateResolutionSuggestions(conflicts, request)

    // Determine overall risk level
    const riskLevel = this.calculateRiskLevel(conflicts)

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
      suggestions,
      riskLevel
    }
  }

  async resolveConflicts(conflicts: AppointmentConflict[], request: ConflictDetectionRequest): Promise<ConflictResolutionResult> {
    const resolvedConflicts: AppointmentConflict[] = []
    const appliedResolutions: string[] = []

    for (const conflict of conflicts) {
      const resolution = await this.applyResolutionStrategy(conflict, request)
      if (resolution.resolved) {
        resolvedConflicts.push(conflict)
        appliedResolutions.push(resolution.strategy)
      }
    }

    return {
      totalConflicts: conflicts.length,
      resolvedConflicts: resolvedConflicts.length,
      unresolvedConflicts: conflicts.length - resolvedConflicts.length,
      appliedStrategies: appliedResolutions,
      successRate: conflicts.length > 0 ? (resolvedConflicts.length / conflicts.length) * 100 : 100
    }
  }

  async optimizeSchedule(practitionerId: string, dateRange: { start: string; end: string }): Promise<ScheduleOptimizationResult> {
    const appointments = await this.getAppointmentsForPeriod(practitionerId, dateRange)
    const conflicts = await this.detectScheduleConflicts(appointments)
    
    const optimizations: OptimizedAppointment[] = []
    let totalEfficiencyGain = 0

    // Apply optimization algorithms
    for (const appointment of appointments) {
      const optimization = await this.optimizeSingleAppointment(appointment, conflicts)
      if (optimization) {
        optimizations.push(optimization)
        totalEfficiencyGain += optimization.confidence
      }
    }

    return {
      optimizedSchedule: optimizations,
      totalConflictsResolved: conflicts.length,
      efficiencyGain: totalEfficiencyGain / optimizations.length || 0,
      patientSatisfaction: this.calculatePatientSatisfaction(optimizations),
      practitionerUtilization: this.calculatePractitionerUtilization(optimizations)
    }
  }

  private async detectTimeOverlaps(request: ConflictDetectionRequest): Promise<AppointmentConflict[]> {
    const conflicts: AppointmentConflict[] = []
    
    if (!this.appointmentService) {
      return conflicts
    }

    try {
      // Get existing appointments for the same practitioner
      const existingAppointments = await this.appointmentService.getAppointmentsByPractitionerAndTimeRange(
        request.practitionerId,
        request.startTime,
        request.endTime
      )

      for (const existing of existingAppointments) {
        if (existing.id === request.appointmentId) continue

        if (this.isTimeOverlap(
          { start: request.startTime, end: request.endTime },
          { start: existing.startTime, end: existing.endTime }
        )) {
          conflicts.push({
            id: this.generateConflictId(),
            type: 'time_overlap',
            severity: this.determineSeverity(request.priority, 'time_overlap'),
            description: `Horário conflitante com agendamento existente (${existing.startTime} - ${existing.endTime})`,
            conflictingAppointmentId: existing.id,
            suggestedResolution: 'Considerar reagendamento para horário disponível',
            impact: 'Impede agendamento simultâneo com mesmo profissional'
          })
        }
      }
    } catch (error) {
      console.error('Error detecting time overlaps:', error)
    }

    return conflicts
  }

  private async detectResourceConflicts(request: ConflictDetectionRequest): Promise<AppointmentConflict[]> {
    const conflicts: AppointmentConflict[] = []
    
    if (!this.resourceService) {
      return conflicts
    }

    try {
      // Check room availability
      if (request.roomId) {
        const roomConflicts = await this.resourceService.checkRoomAvailability(
          request.roomId,
          request.startTime,
          request.endTime
        )

        if (!roomConflicts.isAvailable) {
          conflicts.push({
            id: this.generateConflictId(),
            type: 'room_unavailable',
            severity: this.determineSeverity(request.priority, 'room_unavailable'),
            description: `Sala ${request.roomId} não está disponível no horário solicitado`,
            conflictingResourceId: request.roomId,
            suggestedResolution: 'Selecionar sala alternativa ou ajustar horário',
            impact: 'Impede utilização do espaço físico necessário'
          })
        }
      }

      // Check equipment availability
      if (request.equipmentIds && request.equipmentIds.length > 0) {
        for (const equipmentId of request.equipmentIds) {
          const equipmentConflicts = await this.resourceService.checkEquipmentAvailability(
            equipmentId,
            request.startTime,
            request.endTime
          )

          if (!equipmentConflicts.isAvailable) {
            conflicts.push({
              id: this.generateConflictId(),
              type: 'equipment_conflict',
              severity: this.determineSeverity(request.priority, 'equipment_conflict'),
              description: `Equipamento ${equipmentId} não está disponível no horário solicitado`,
              conflictingResourceId: equipmentId,
              suggestedResolution: 'Selecionar equipamento alternativo ou ajustar horário',
              impact: 'Impede utilização de equipamento necessário para procedimento'
            })
          }
        }
      }
    } catch (error) {
      console.error('Error detecting resource conflicts:', error)
    }

    return conflicts
  }

  private async detectPractitionerConflicts(request: ConflictDetectionRequest): Promise<AppointmentConflict[]> {
    const conflicts: AppointmentConflict[] = []

    // Check if practitioner is working during the requested time
    const isWorkingHours = await this.businessRules.checkWorkingHours(
      request.practitionerId,
      request.startTime
    )

    if (!isWorkingHours) {
      conflicts.push({
        id: this.generateConflictId(),
        type: 'practitioner_unavailable',
        severity: this.determineSeverity(request.priority, 'practitioner_unavailable'),
        description: 'Profissional não está em horário de trabalho',
        suggestedResolution: 'Agendar durante horário comercial do profissional',
        impact: 'Profissional não disponível para atendimento'
      })
    }

    // Check for practitioner leave/vacation
    const onLeave = await this.businessRules.checkPractitionerLeave(
      request.practitionerId,
      request.startTime
    )

    if (onLeave) {
      conflicts.push({
        id: this.generateConflictId(),
        type: 'practitioner_unavailable',
        severity: 'high',
        description: 'Profissional está de folha/férias no período solicitado',
        suggestedResolution: 'Selecionar outro profissional ou agendar para data disponível',
        impact: 'Profissional indisponível por período prolongado'
      })
    }

    return conflicts
  }

  private async detectPatientConflicts(request: ConflictDetectionRequest): Promise<AppointmentConflict[]> {
    const conflicts: AppointmentConflict[] = []

    if (!request.patientId || !this.appointmentService) {
      return conflicts
    }

    try {
      // Check for patient double-booking
      const patientAppointments = await this.appointmentService.getPatientAppointmentsByTimeRange(
        request.patientId,
        request.startTime,
        request.endTime
      )

      for (const existing of patientAppointments) {
        if (existing.id === request.appointmentId) continue

        if (this.isTimeOverlap(
          { start: request.startTime, end: request.endTime },
          { start: existing.startTime, end: existing.endTime }
        )) {
          conflicts.push({
            id: this.generateConflictId(),
            type: 'patient_double_booking',
            severity: 'medium',
            description: `Paciente já possui agendamento no mesmo horário (${existing.startTime} - ${existing.endTime})`,
            conflictingAppointmentId: existing.id,
            suggestedResolution: 'Confirmar com paciente qual agendamento deve ser mantido',
            impact: 'Paciente não pode estar em dois lugares ao mesmo tempo'
          })
        }
      }
    } catch (error) {
      console.error('Error detecting patient conflicts:', error)
    }

    return conflicts
  }

  private generateResolutionSuggestions(conflicts: AppointmentConflict[], request: ConflictDetectionRequest): ConflictResolutionSuggestion[] {
    const suggestions: ConflictResolutionSuggestion[] = []

    for (const conflict of conflicts) {
      switch (conflict.type) {
        case 'time_overlap':
          suggestions.push({
            id: this.generateSuggestionId(),
            type: 'reschedule',
            description: 'Reagendar para próximo horário disponível',
            confidence: 0.8,
            effort: 'medium',
            estimatedTime: '5-10 minutos',
            pros: ['Resolve conflito de horário', 'Mantém mesmo profissional'],
            cons: ['Paciente precisa remarcar', 'Pode causar insatisfação']
          })
          break

        case 'room_unavailable':
          suggestions.push({
            id: this.generateSuggestionId(),
            type: 'change_room',
            description: 'Mudar para sala disponível',
            confidence: 0.9,
            effort: 'low',
            estimatedTime: '2-5 minutos',
            pros: ['Resolvido rapidamente', 'Mantém horário original'],
            cons: ['Pode ser sala diferente da planejada', 'Pode não ter equipamentos necessários']
          })
          break

        case 'practitioner_unavailable':
          suggestions.push({
            id: this.generateSuggestionId(),
            type: 'change_practitioner',
            description: 'Atribuir a outro profissional disponível',
            confidence: 0.7,
            effort: 'medium',
            estimatedTime: '10-15 minutos',
            pros: ['Mantém horário original', 'Alternativa quando profissional preferido indisponível'],
            cons: ['Paciente pode preferir profissional específico', 'Diferentes especialidades']
          })
          break

        case 'patient_double_booking':
          suggestions.push({
            id: this.generateSuggestionId(),
            type: 'cancel_conflicting',
            description: 'Cancelar agendamento conflitante após confirmação',
            confidence: 0.6,
            effort: 'high',
            estimatedTime: '15-20 minutos',
            pros: ['Resolvi conflito definitivamente', 'Mantém agendamento atual'],
            cons: ['Pode causar insatisfação', 'Necessita confirmação com paciente']
          })
          break
      }
    }

    return suggestions
  }

  private isTimeOverlap(slot1: { start: string; end: string }, slot2: { start: string; end: string }): boolean {
    const start1 = new Date(slot1.start)
    const end1 = new Date(slot1.end)
    const start2 = new Date(slot2.start)
    const end2 = new Date(slot2.end)

    return start1 < end2 && end1 > start2
  }

  private determineSeverity(priority: string, conflictType: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMatrix = {
      emergency: {
        time_overlap: 'critical',
        resource_conflict: 'high',
        practitioner_unavailable: 'critical',
        patient_double_booking: 'high'
      },
      high: {
        time_overlap: 'high',
        resource_conflict: 'medium',
        practitioner_unavailable: 'high',
        patient_double_booking: 'medium'
      },
      medium: {
        time_overlap: 'medium',
        resource_conflict: 'low',
        practitioner_unavailable: 'medium',
        patient_double_booking: 'low'
      },
      low: {
        time_overlap: 'low',
        resource_conflict: 'low',
        practitioner_unavailable: 'medium',
        patient_double_booking: 'low'
      }
    }

    return (severityMatrix as any)[priority]?.[conflictType] || 'medium'
  }

  private calculateRiskLevel(conflicts: AppointmentConflict[]): 'low' | 'medium' | 'high' | 'critical' {
    if (conflicts.length === 0) return 'low'
    
    const severityScores = { critical: 4, high: 3, medium: 2, low: 1 }
    const totalScore = conflicts.reduce((sum, conflict) => sum + (severityScores as any)[conflict.severity], 0)
    const averageScore = totalScore / conflicts.length

    if (averageScore >= 3.5) return 'critical'
    if (averageScore >= 2.5) return 'high'
    if (averageScore >= 1.5) return 'medium'
    return 'low'
  }

  private async applyResolutionStrategy(conflict: AppointmentConflict, request: ConflictDetectionRequest): Promise<{ resolved: boolean; strategy: string }> {
    // This would implement the actual resolution logic
    // For now, return a mock resolution
    return {
      resolved: true,
      strategy: 'reschedule'
    }
  }

  private async getAppointmentsForPeriod(practitionerId: string, dateRange: { start: string; end: string }): Promise<any[]> {
    // Mock implementation - would integrate with appointment service
    return []
  }

  private async detectScheduleConflicts(appointments: any[]): Promise<any[]> {
    // Mock implementation
    return []
  }

  private async optimizeSingleAppointment(appointment: any, conflicts: any[]): Promise<OptimizedAppointment | null> {
    // Mock implementation
    return null
  }

  private calculatePatientSatisfaction(optimizations: OptimizedAppointment[]): number {
    // Mock calculation
    return 0.85
  }

  private calculatePractitionerUtilization(optimizations: OptimizedAppointment[]): number {
    // Mock calculation
    return 0.78
  }

  private generateConflictId(): string {
    return `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateSuggestionId(): string {
    return `suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Business Rule Engine for healthcare scheduling rules
class BusinessRuleEngine {
  async checkWorkingHours(practitionerId: string, dateTime: string): Promise<boolean> {
    // Mock implementation - would check practitioner's working hours
    const hour = new Date(dateTime).getHours()
    return hour >= 8 && hour <= 18
  }

  async checkPractitionerLeave(practitionerId: string, date: string): Promise<boolean> {
    // Mock implementation - would check practitioner's leave schedule
    return false
  }
}

// Static methods for convenience
export const ConflictDetectorService = {
  detectSchedulingConflicts: async (request: ConflictDetectionRequest): Promise<ConflictDetectionResult> => {
    const detector = new ConflictDetector()
    return detector.detectSchedulingConflicts(request)
  },

  resolveConflicts: async (conflicts: AppointmentConflict[], request: ConflictDetectionRequest): Promise<ConflictResolutionResult> => {
    const detector = new ConflictDetector()
    return detector.resolveConflicts(conflicts, request)
  },

  optimizeSchedule: async (practitionerId: string, dateRange: { start: string; end: string }): Promise<ScheduleOptimizationResult> => {
    const detector = new ConflictDetector()
    return detector.optimizeSchedule(practitionerId, dateRange)
  }
}

// Export singleton instance
export const conflictDetector = new ConflictDetector()