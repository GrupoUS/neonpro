import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import { logger } from '@/lib/logger'

type Tables = Database['public']['Tables']
type Appointment = Tables['appointments']['Row']
type Staff = Tables['staff']['Row']
type Room = Tables['rooms']['Row']
type Equipment = Tables['equipment']['Row']

// Tipos para detecção de conflitos
export interface ConflictDetectionResult {
  hasConflicts: boolean
  conflicts: DetectedConflict[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  affectedResources: AffectedResource[]
  suggestedActions: string[]
}

export interface DetectedConflict {
  id: string
  type: ConflictType
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affectedAppointments: string[]
  affectedResources: AffectedResource[]
  detectedAt: Date
  autoResolvable: boolean
}

export interface AffectedResource {
  id: string
  type: 'staff' | 'room' | 'equipment'
  name: string
  conflictReason: string
  availability: ResourceAvailability[]
}

export interface ResourceAvailability {
  start: Date
  end: Date
  available: boolean
  reason?: string
}

export enum ConflictType {
  STAFF_DOUBLE_BOOKING = 'staff_double_booking',
  ROOM_OVERLAP = 'room_overlap',
  EQUIPMENT_UNAVAILABLE = 'equipment_unavailable',
  STAFF_SKILL_MISMATCH = 'staff_skill_mismatch',
  ROOM_CAPACITY_EXCEEDED = 'room_capacity_exceeded',
  EQUIPMENT_MAINTENANCE = 'equipment_maintenance',
  STAFF_BREAK_VIOLATION = 'staff_break_violation',
  OVERTIME_VIOLATION = 'overtime_violation'
}

export interface ConflictDetectionConfig {
  enableRealTimeDetection: boolean
  checkStaffAvailability: boolean
  checkRoomAvailability: boolean
  checkEquipmentAvailability: boolean
  validateSkillMatching: boolean
  enforceBreakTimes: boolean
  maxOvertimeHours: number
  bufferTimeMinutes: number
}

/**
 * Core Conflict Detection Engine
 * Detecta conflitos de agendamento em tempo real
 */
export class ConflictDetectionEngine {
  private supabase = createClient()
  private config: ConflictDetectionConfig

  constructor(config: Partial<ConflictDetectionConfig> = {}) {
    this.config = {
      enableRealTimeDetection: true,
      checkStaffAvailability: true,
      checkRoomAvailability: true,
      checkEquipmentAvailability: true,
      validateSkillMatching: true,
      enforceBreakTimes: true,
      maxOvertimeHours: 8,
      bufferTimeMinutes: 15,
      ...config
    }
  }

  /**
   * Detecta conflitos para um novo agendamento
   */
  async detectConflictsForNewAppointment(
    appointmentData: Partial<Appointment>,
    clinicId: string
  ): Promise<ConflictDetectionResult> {
    try {
      logger.info('Starting conflict detection for new appointment', {
        appointmentData,
        clinicId
      })

      const conflicts: DetectedConflict[] = []
      const affectedResources: AffectedResource[] = []

      // Validar dados obrigatórios
      if (!appointmentData.start_time || !appointmentData.end_time) {
        throw new Error('Start time and end time are required')
      }

      const startTime = new Date(appointmentData.start_time)
      const endTime = new Date(appointmentData.end_time)

      // 1. Verificar conflitos de staff
      if (this.config.checkStaffAvailability && appointmentData.staff_id) {
        const staffConflicts = await this.detectStaffConflicts(
          appointmentData.staff_id,
          startTime,
          endTime,
          clinicId,
          appointmentData.id
        )
        conflicts.push(...staffConflicts.conflicts)
        affectedResources.push(...staffConflicts.resources)
      }

      // 2. Verificar conflitos de sala
      if (this.config.checkRoomAvailability && appointmentData.room_id) {
        const roomConflicts = await this.detectRoomConflicts(
          appointmentData.room_id,
          startTime,
          endTime,
          clinicId,
          appointmentData.id
        )
        conflicts.push(...roomConflicts.conflicts)
        affectedResources.push(...roomConflicts.resources)
      }

      // 3. Verificar conflitos de equipamentos
      if (this.config.checkEquipmentAvailability && appointmentData.required_equipment) {
        const equipmentConflicts = await this.detectEquipmentConflicts(
          appointmentData.required_equipment as string[],
          startTime,
          endTime,
          clinicId,
          appointmentData.id
        )
        conflicts.push(...equipmentConflicts.conflicts)
        affectedResources.push(...equipmentConflicts.resources)
      }

      // 4. Validar matching de habilidades
      if (this.config.validateSkillMatching && appointmentData.staff_id && appointmentData.service_id) {
        const skillConflicts = await this.detectSkillMismatch(
          appointmentData.staff_id,
          appointmentData.service_id,
          clinicId
        )
        conflicts.push(...skillConflicts)
      }

      // 5. Verificar violações de break time
      if (this.config.enforceBreakTimes && appointmentData.staff_id) {
        const breakConflicts = await this.detectBreakTimeViolations(
          appointmentData.staff_id,
          startTime,
          endTime,
          clinicId
        )
        conflicts.push(...breakConflicts)
      }

      // Calcular severidade geral
      const severity = this.calculateOverallSeverity(conflicts)

      // Gerar ações sugeridas
      const suggestedActions = this.generateSuggestedActions(conflicts)

      const result: ConflictDetectionResult = {
        hasConflicts: conflicts.length > 0,
        conflicts,
        severity,
        affectedResources,
        suggestedActions
      }

      // Log do resultado
      logger.info('Conflict detection completed', {
        hasConflicts: result.hasConflicts,
        conflictCount: conflicts.length,
        severity: result.severity
      })

      return result

    } catch (error) {
      logger.error('Error in conflict detection', { error, appointmentData, clinicId })
      throw error
    }
  }

  /**
   * Detecta conflitos de staff (double booking, overtime, etc.)
   */
  private async detectStaffConflicts(
    staffId: string,
    startTime: Date,
    endTime: Date,
    clinicId: string,
    excludeAppointmentId?: string
  ): Promise<{ conflicts: DetectedConflict[], resources: AffectedResource[] }> {
    const conflicts: DetectedConflict[] = []
    const resources: AffectedResource[] = []

    try {
      // Buscar agendamentos conflitantes do staff
      let query = this.supabase
        .from('appointments')
        .select(`
          id, start_time, end_time, service_id,
          staff:staff_id(id, name, specialties),
          service:service_id(name, duration_minutes)
        `)
        .eq('staff_id', staffId)
        .eq('clinic_id', clinicId)
        .neq('status', 'cancelled')
        .or(`and(start_time.lte.${endTime.toISOString()},end_time.gte.${startTime.toISOString()})`)

      if (excludeAppointmentId) {
        query = query.neq('id', excludeAppointmentId)
      }

      const { data: conflictingAppointments, error } = await query

      if (error) {
        logger.error('Error fetching staff conflicts', { error, staffId })
        throw error
      }

      if (conflictingAppointments && conflictingAppointments.length > 0) {
        // Buscar dados do staff
        const { data: staffData } = await this.supabase
          .from('staff')
          .select('id, name, specialties')
          .eq('id', staffId)
          .single()

        const staffName = staffData?.name || 'Unknown Staff'

        conflicts.push({
          id: `staff_conflict_${staffId}_${Date.now()}`,
          type: ConflictType.STAFF_DOUBLE_BOOKING,
          severity: 'high',
          description: `Staff member ${staffName} has conflicting appointments`,
          affectedAppointments: conflictingAppointments.map(apt => apt.id),
          affectedResources: [{
            id: staffId,
            type: 'staff',
            name: staffName,
            conflictReason: 'Double booking detected'
          }],
          detectedAt: new Date(),
          autoResolvable: true
        })

        resources.push({
          id: staffId,
          type: 'staff',
          name: staffName,
          conflictReason: 'Double booking detected',
          availability: conflictingAppointments.map(apt => ({
            start: new Date(apt.start_time),
            end: new Date(apt.end_time),
            available: false,
            reason: 'Existing appointment'
          }))
        })
      }

      return { conflicts, resources }

    } catch (error) {
      logger.error('Error detecting staff conflicts', { error, staffId })
      throw error
    }
  }

  /**
   * Detecta conflitos de sala
   */
  private async detectRoomConflicts(
    roomId: string,
    startTime: Date,
    endTime: Date,
    clinicId: string,
    excludeAppointmentId?: string
  ): Promise<{ conflicts: DetectedConflict[], resources: AffectedResource[] }> {
    const conflicts: DetectedConflict[] = []
    const resources: AffectedResource[] = []

    try {
      // Buscar agendamentos conflitantes da sala
      let query = this.supabase
        .from('appointments')
        .select(`
          id, start_time, end_time,
          room:room_id(id, name, capacity)
        `)
        .eq('room_id', roomId)
        .eq('clinic_id', clinicId)
        .neq('status', 'cancelled')
        .or(`and(start_time.lte.${endTime.toISOString()},end_time.gte.${startTime.toISOString()})`)

      if (excludeAppointmentId) {
        query = query.neq('id', excludeAppointmentId)
      }

      const { data: conflictingAppointments, error } = await query

      if (error) {
        logger.error('Error fetching room conflicts', { error, roomId })
        throw error
      }

      if (conflictingAppointments && conflictingAppointments.length > 0) {
        // Buscar dados da sala
        const { data: roomData } = await this.supabase
          .from('rooms')
          .select('id, name, capacity')
          .eq('id', roomId)
          .single()

        const roomName = roomData?.name || 'Unknown Room'

        conflicts.push({
          id: `room_conflict_${roomId}_${Date.now()}`,
          type: ConflictType.ROOM_OVERLAP,
          severity: 'medium',
          description: `Room ${roomName} is already booked`,
          affectedAppointments: conflictingAppointments.map(apt => apt.id),
          affectedResources: [{
            id: roomId,
            type: 'room',
            name: roomName,
            conflictReason: 'Room overlap detected'
          }],
          detectedAt: new Date(),
          autoResolvable: true
        })

        resources.push({
          id: roomId,
          type: 'room',
          name: roomName,
          conflictReason: 'Room overlap detected',
          availability: conflictingAppointments.map(apt => ({
            start: new Date(apt.start_time),
            end: new Date(apt.end_time),
            available: false,
            reason: 'Room occupied'
          }))
        })
      }

      return { conflicts, resources }

    } catch (error) {
      logger.error('Error detecting room conflicts', { error, roomId })
      throw error
    }
  }

  /**
   * Detecta conflitos de equipamentos
   */
  private async detectEquipmentConflicts(
    equipmentIds: string[],
    startTime: Date,
    endTime: Date,
    clinicId: string,
    excludeAppointmentId?: string
  ): Promise<{ conflicts: DetectedConflict[], resources: AffectedResource[] }> {
    const conflicts: DetectedConflict[] = []
    const resources: AffectedResource[] = []

    try {
      for (const equipmentId of equipmentIds) {
        // Verificar se equipamento está em manutenção
        const { data: maintenanceData } = await this.supabase
          .from('equipment_maintenance')
          .select('*')
          .eq('equipment_id', equipmentId)
          .or(`and(start_time.lte.${endTime.toISOString()},end_time.gte.${startTime.toISOString()})`)
          .eq('status', 'active')

        if (maintenanceData && maintenanceData.length > 0) {
          const { data: equipmentData } = await this.supabase
            .from('equipment')
            .select('id, name')
            .eq('id', equipmentId)
            .single()

          const equipmentName = equipmentData?.name || 'Unknown Equipment'

          conflicts.push({
            id: `equipment_maintenance_${equipmentId}_${Date.now()}`,
            type: ConflictType.EQUIPMENT_MAINTENANCE,
            severity: 'high',
            description: `Equipment ${equipmentName} is under maintenance`,
            affectedAppointments: [],
            affectedResources: [{
              id: equipmentId,
              type: 'equipment',
              name: equipmentName,
              conflictReason: 'Equipment under maintenance'
            }],
            detectedAt: new Date(),
            autoResolvable: false
          })
        }

        // Verificar conflitos de uso
        let query = this.supabase
          .from('appointments')
          .select(`
            id, start_time, end_time, required_equipment,
            equipment:required_equipment(id, name)
          `)
          .eq('clinic_id', clinicId)
          .neq('status', 'cancelled')
          .contains('required_equipment', [equipmentId])
          .or(`and(start_time.lte.${endTime.toISOString()},end_time.gte.${startTime.toISOString()})`)

        if (excludeAppointmentId) {
          query = query.neq('id', excludeAppointmentId)
        }

        const { data: conflictingAppointments, error } = await query

        if (error) {
          logger.error('Error fetching equipment conflicts', { error, equipmentId })
          continue
        }

        if (conflictingAppointments && conflictingAppointments.length > 0) {
          const { data: equipmentData } = await this.supabase
            .from('equipment')
            .select('id, name')
            .eq('id', equipmentId)
            .single()

          const equipmentName = equipmentData?.name || 'Unknown Equipment'

          conflicts.push({
            id: `equipment_conflict_${equipmentId}_${Date.now()}`,
            type: ConflictType.EQUIPMENT_UNAVAILABLE,
            severity: 'medium',
            description: `Equipment ${equipmentName} is already in use`,
            affectedAppointments: conflictingAppointments.map(apt => apt.id),
            affectedResources: [{
              id: equipmentId,
              type: 'equipment',
              name: equipmentName,
              conflictReason: 'Equipment already in use'
            }],
            detectedAt: new Date(),
            autoResolvable: true
          })

          resources.push({
            id: equipmentId,
            type: 'equipment',
            name: equipmentName,
            conflictReason: 'Equipment already in use',
            availability: conflictingAppointments.map(apt => ({
              start: new Date(apt.start_time),
              end: new Date(apt.end_time),
              available: false,
              reason: 'Equipment in use'
            }))
          })
        }
      }

      return { conflicts, resources }

    } catch (error) {
      logger.error('Error detecting equipment conflicts', { error, equipmentIds })
      throw error
    }
  }

  /**
   * Detecta incompatibilidade de habilidades
   */
  private async detectSkillMismatch(
    staffId: string,
    serviceId: string,
    clinicId: string
  ): Promise<DetectedConflict[]> {
    const conflicts: DetectedConflict[] = []

    try {
      // Buscar habilidades do staff
      const { data: staffData } = await this.supabase
        .from('staff')
        .select('id, name, specialties')
        .eq('id', staffId)
        .single()

      // Buscar requisitos do serviço
      const { data: serviceData } = await this.supabase
        .from('services')
        .select('id, name, required_specialties')
        .eq('id', serviceId)
        .single()

      if (staffData && serviceData) {
        const staffSpecialties = staffData.specialties as string[] || []
        const requiredSpecialties = serviceData.required_specialties as string[] || []

        const missingSpecialties = requiredSpecialties.filter(
          specialty => !staffSpecialties.includes(specialty)
        )

        if (missingSpecialties.length > 0) {
          conflicts.push({
            id: `skill_mismatch_${staffId}_${serviceId}_${Date.now()}`,
            type: ConflictType.STAFF_SKILL_MISMATCH,
            severity: 'high',
            description: `Staff ${staffData.name} lacks required specialties: ${missingSpecialties.join(', ')}`,
            affectedAppointments: [],
            affectedResources: [{
              id: staffId,
              type: 'staff',
              name: staffData.name,
              conflictReason: `Missing specialties: ${missingSpecialties.join(', ')}`
            }],
            detectedAt: new Date(),
            autoResolvable: true
          })
        }
      }

      return conflicts

    } catch (error) {
      logger.error('Error detecting skill mismatch', { error, staffId, serviceId })
      return []
    }
  }

  /**
   * Detecta violações de break time
   */
  private async detectBreakTimeViolations(
    staffId: string,
    startTime: Date,
    endTime: Date,
    clinicId: string
  ): Promise<DetectedConflict[]> {
    const conflicts: DetectedConflict[] = []

    try {
      // Buscar horários de break do staff
      const { data: breakTimes } = await this.supabase
        .from('staff_break_times')
        .select('*')
        .eq('staff_id', staffId)
        .eq('clinic_id', clinicId)

      if (breakTimes) {
        for (const breakTime of breakTimes) {
          const breakStart = new Date(breakTime.start_time)
          const breakEnd = new Date(breakTime.end_time)

          // Verificar se o agendamento conflita com o break
          if (startTime < breakEnd && endTime > breakStart) {
            const { data: staffData } = await this.supabase
              .from('staff')
              .select('name')
              .eq('id', staffId)
              .single()

            conflicts.push({
              id: `break_violation_${staffId}_${Date.now()}`,
              type: ConflictType.STAFF_BREAK_VIOLATION,
              severity: 'medium',
              description: `Appointment conflicts with ${staffData?.name || 'staff'} break time`,
              affectedAppointments: [],
              affectedResources: [{
                id: staffId,
                type: 'staff',
                name: staffData?.name || 'Unknown Staff',
                conflictReason: 'Conflicts with break time'
              }],
              detectedAt: new Date(),
              autoResolvable: true
            })
          }
        }
      }

      return conflicts

    } catch (error) {
      logger.error('Error detecting break time violations', { error, staffId })
      return []
    }
  }

  /**
   * Calcula severidade geral dos conflitos
   */
  private calculateOverallSeverity(conflicts: DetectedConflict[]): 'low' | 'medium' | 'high' | 'critical' {
    if (conflicts.length === 0) return 'low'

    const severityScores = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4
    }

    const maxSeverity = Math.max(...conflicts.map(c => severityScores[c.severity]))
    const criticalCount = conflicts.filter(c => c.severity === 'critical').length
    const highCount = conflicts.filter(c => c.severity === 'high').length

    if (criticalCount > 0 || highCount >= 3) return 'critical'
    if (maxSeverity >= 3) return 'high'
    if (maxSeverity >= 2) return 'medium'
    return 'low'
  }

  /**
   * Gera ações sugeridas baseadas nos conflitos
   */
  private generateSuggestedActions(conflicts: DetectedConflict[]): string[] {
    const actions: string[] = []
    const conflictTypes = new Set(conflicts.map(c => c.type))

    if (conflictTypes.has(ConflictType.STAFF_DOUBLE_BOOKING)) {
      actions.push('Reassign staff member to available time slot')
      actions.push('Find alternative qualified staff member')
    }

    if (conflictTypes.has(ConflictType.ROOM_OVERLAP)) {
      actions.push('Assign alternative room')
      actions.push('Reschedule to available time slot')
    }

    if (conflictTypes.has(ConflictType.EQUIPMENT_UNAVAILABLE)) {
      actions.push('Use alternative equipment if available')
      actions.push('Reschedule when equipment is available')
    }

    if (conflictTypes.has(ConflictType.STAFF_SKILL_MISMATCH)) {
      actions.push('Assign qualified staff member')
      actions.push('Provide additional training if needed')
    }

    if (conflictTypes.has(ConflictType.EQUIPMENT_MAINTENANCE)) {
      actions.push('Wait for maintenance completion')
      actions.push('Use backup equipment if available')
    }

    if (conflictTypes.has(ConflictType.STAFF_BREAK_VIOLATION)) {
      actions.push('Reschedule outside break time')
      actions.push('Adjust break schedule if possible')
    }

    return actions
  }

  /**
   * Detecta conflitos para múltiplos agendamentos
   */
  async detectBatchConflicts(
    appointments: Partial<Appointment>[],
    clinicId: string
  ): Promise<ConflictDetectionResult[]> {
    const results: ConflictDetectionResult[] = []

    for (const appointment of appointments) {
      try {
        const result = await this.detectConflictsForNewAppointment(appointment, clinicId)
        results.push(result)
      } catch (error) {
        logger.error('Error in batch conflict detection', { error, appointment })
        results.push({
          hasConflicts: true,
          conflicts: [{
            id: `error_${Date.now()}`,
            type: ConflictType.STAFF_DOUBLE_BOOKING,
            severity: 'critical',
            description: 'Error during conflict detection',
            affectedAppointments: [],
            affectedResources: [],
            detectedAt: new Date(),
            autoResolvable: false
          }],
          severity: 'critical',
          affectedResources: [],
          suggestedActions: ['Review appointment data and try again']
        })
      }
    }

    return results
  }

  /**
   * Atualiza configuração do engine
   */
  updateConfig(newConfig: Partial<ConflictDetectionConfig>): void {
    this.config = { ...this.config, ...newConfig }
    logger.info('Conflict detection config updated', { config: this.config })
  }

  /**
   * Obtém configuração atual
   */
  getConfig(): ConflictDetectionConfig {
    return { ...this.config }
  }
}

// Instância singleton para uso global
export const conflictDetectionEngine = new ConflictDetectionEngine()

// Função utilitária para detecção rápida
export async function detectConflicts(
  appointmentData: Partial<Appointment>,
  clinicId: string,
  config?: Partial<ConflictDetectionConfig>
): Promise<ConflictDetectionResult> {
  const engine = config ? new ConflictDetectionEngine(config) : conflictDetectionEngine
  return engine.detectConflictsForNewAppointment(appointmentData, clinicId)
}

export default ConflictDetectionEngine