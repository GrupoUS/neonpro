// Appointment Service for Brazilian Aesthetic Clinics
// Comprehensive appointment scheduling and management system

export interface Appointment {
  id: string
  patientId: string
  practitionerId: string
  serviceId: string
  startTime: string
  endTime: string
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  notes?: string
  createdAt: string
  updatedAt: string
  price: number
  insuranceInfo?: {
    provider: string
    plan: string
    authorizationNumber?: string
  }
}

export interface AppointmentSlot {
  id: string
  practitionerId: string
  startTime: string
  endTime: string
  isAvailable: boolean
  maxCapacity?: number
  currentBookings?: number
}

export interface SchedulingRule {
  id: string
  practitionerId: string
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  startTime: string
  endTime: string
  slotDuration: number // in minutes
  maxAppointments: number
  isActive: boolean
}

export interface AppointmentConflict {
  type: 'overlapping' | 'practitioner_unavailable' | 'room_conflict' | 'resource_conflict'
  appointmentId: string
  conflictingAppointmentId?: string
  description: string
  severity: 'low' | 'medium' | 'high'
}

export class AppointmentService {
  private appointments: Map<string, Appointment> = new Map()
  private schedulingRules: Map<string, SchedulingRule[]> = new Map()
  private realTimeService: any // Will be injected

  constructor(realTimeService?: any) {
    this.realTimeService = realTimeService
  }

  async scheduleAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    // Validate appointment data
    const validation = this.validateAppointmentData(appointmentData)
    if (!validation.isValid) {
      throw new Error(`Invalid appointment data: ${validation.errors.join(', ')}`)
    }

    // Check for conflicts
    const conflicts = await this.checkSchedulingConflicts(appointmentData)
    if (conflicts.length > 0) {
      throw new Error(`Scheduling conflicts detected: ${conflicts.map(c => c.description).join(', ')}`)
    }

    // Create appointment
    const appointment: Appointment = {
      ...appointmentData,
      id: this.generateAppointmentId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Store appointment
    this.appointments.set(appointment.id, appointment)

    // Send real-time update
    if (this.realTimeService) {
      this.realTimeService.sendAppointmentUpdate({
        appointmentId: appointment.id,
        status: appointment.status,
        timestamp: appointment.updatedAt,
        practitionerId: appointment.practitionerId,
        patientId: appointment.patientId
      })
    }

    return appointment
  }

  async updateAppointment(appointmentId: string, updates: Partial<Appointment>): Promise<Appointment> {
    const appointment = this.appointments.get(appointmentId)
    if (!appointment) {
      throw new Error('Appointment not found')
    }

    // Check for conflicts if time is being updated
    if (updates.startTime || updates.endTime) {
      const updatedAppointment = { ...appointment, ...updates }
      const conflicts = await this.checkSchedulingConflicts(updatedAppointment)
      if (conflicts.length > 0) {
        throw new Error(`Scheduling conflicts detected: ${conflicts.map(c => c.description).join(', ')}`)
      }
    }

    // Update appointment
    const updatedAppointment: Appointment = {
      ...appointment,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.appointments.set(appointmentId, updatedAppointment)

    // Send real-time update
    if (this.realTimeService) {
      this.realTimeService.sendAppointmentUpdate({
        appointmentId: updatedAppointment.id,
        status: updatedAppointment.status,
        timestamp: updatedAppointment.updatedAt,
        practitionerId: updatedAppointment.practitionerId,
        patientId: updatedAppointment.patientId,
        notes: updatedAppointment.notes
      })
    }

    return updatedAppointment
  }

  async cancelAppointment(appointmentId: string, reason?: string): Promise<Appointment> {
    const appointment = this.appointments.get(appointmentId)
    if (!appointment) {
      throw new Error('Appointment not found')
    }

    const updatedAppointment: Appointment = {
      ...appointment,
      status: 'cancelled',
      notes: reason ? `${appointment.notes || ''} - Cancelled: ${reason}`.trim() : appointment.notes,
      updatedAt: new Date().toISOString()
    }

    this.appointments.set(appointmentId, updatedAppointment)

    // Send real-time update
    if (this.realTimeService) {
      this.realTimeService.sendAppointmentUpdate({
        appointmentId: updatedAppointment.id,
        status: updatedAppointment.status,
        timestamp: updatedAppointment.updatedAt,
        practitionerId: updatedAppointment.practitionerId,
        patientId: updatedAppointment.patientId,
        notes: updatedAppointment.notes
      })
    }

    return updatedAppointment
  }

  async checkAvailability(practitionerId: string, date: string): Promise<AppointmentSlot[]> {
    const targetDate = new Date(date)
    const dayOfWeek = targetDate.getDay()
    const rules = this.schedulingRules.get(practitionerId) || []
    
    const availableSlots: AppointmentSlot[] = []

    for (const rule of rules) {
      if (rule.dayOfWeek === dayOfWeek && rule.isActive) {
        const slots = this.generateSlotsForRule(rule, date)
        availableSlots.push(...slots)
      }
    }

    // Filter out slots that have existing appointments
    return availableSlots.filter(slot => this.isSlotAvailable(slot))
  }

  async checkSchedulingConflicts(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<AppointmentConflict[]> {
    const conflicts: AppointmentConflict[] = []

    // Check for overlapping appointments with same practitioner
    const practitionerAppointments = Array.from(this.appointments.values()).filter(
      apt => apt.practitionerId === appointmentData.practitionerId &&
             apt.status !== 'cancelled' &&
             apt.id !== (appointmentData as any).id
    )

    for (const existingAppointment of practitionerAppointments) {
      if (this.isTimeOverlap(
        { start: appointmentData.startTime, end: appointmentData.endTime },
        { start: existingAppointment.startTime, end: existingAppointment.endTime }
      )) {
        conflicts.push({
          type: 'overlapping',
          appointmentId: (appointmentData as any).id || 'pending',
          conflictingAppointmentId: existingAppointment.id,
          description: 'Overlapping appointment with same practitioner',
          severity: 'high'
        })
      }
    }

    return conflicts
  }

  async sendRealTimeUpdates(appointmentId: string): Promise<void> {
    const appointment = this.appointments.get(appointmentId)
    if (!appointment) {
      throw new Error('Appointment not found')
    }

    if (this.realTimeService) {
      this.realTimeService.sendAppointmentUpdate({
        appointmentId: appointment.id,
        status: appointment.status,
        timestamp: appointment.updatedAt,
        practitionerId: appointment.practitionerId,
        patientId: appointment.patientId,
        notes: appointment.notes
      })
    }
  }

  private validateAppointmentData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.patientId) errors.push('Patient ID is required')
    if (!data.practitionerId) errors.push('Practitioner ID is required')
    if (!data.serviceId) errors.push('Service ID is required')
    if (!data.startTime) errors.push('Start time is required')
    if (!data.endTime) errors.push('End time is required')
    
    if (data.startTime && data.endTime) {
      const start = new Date(data.startTime)
      const end = new Date(data.endTime)
      
      if (start >= end) {
        errors.push('Start time must be before end time')
      }
      
      if (start < new Date()) {
        errors.push('Start time must be in the future')
      }
    }

    if (!data.price || data.price <= 0) {
      errors.push('Price must be greater than 0')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  private isTimeOverlap(slot1: { start: string; end: string }, slot2: { start: string; end: string }): boolean {
    const start1 = new Date(slot1.start)
    const end1 = new Date(slot1.end)
    const start2 = new Date(slot2.start)
    const end2 = new Date(slot2.end)

    return start1 < end2 && end1 > start2
  }

  private generateSlotsForRule(rule: SchedulingRule, date: string): AppointmentSlot[] {
    const slots: AppointmentSlot[] = []
    const ruleDate = new Date(date)
    
    // Set the start time
    const [startHour, startMinute] = rule.startTime.split(':').map(Number)
    const [endHour, endMinute] = rule.endTime.split(':').map(Number)
    
    let currentSlotStart = new Date(ruleDate)
    currentSlotStart.setHours(startHour, startMinute, 0, 0)
    
    const slotEnd = new Date(ruleDate)
    slotEnd.setHours(endHour, endMinute, 0, 0)

    while (currentSlotStart < slotEnd) {
      const slotEndTime = new Date(currentSlotStart.getTime() + rule.slotDuration * 60000)
      
      if (slotEndTime <= slotEnd) {
        slots.push({
          id: this.generateSlotId(),
          practitionerId: rule.practitionerId,
          startTime: currentSlotStart.toISOString(),
          endTime: slotEndTime.toISOString(),
          isAvailable: true,
          maxCapacity: rule.maxAppointments,
          currentBookings: 0
        })
      }
      
      currentSlotStart = slotEndTime
    }

    return slots
  }

  private isSlotAvailable(slot: AppointmentSlot): boolean {
    const overlappingAppointments = Array.from(this.appointments.values()).filter(
      apt => apt.practitionerId === slot.practitionerId &&
             apt.status !== 'cancelled' &&
             this.isTimeOverlap(
               { start: slot.startTime, end: slot.endTime },
               { start: apt.startTime, end: apt.endTime }
             )
    )

    if (slot.maxCapacity) {
      return overlappingAppointments.length < slot.maxCapacity
    }

    return overlappingAppointments.length === 0
  }

  private generateAppointmentId(): string {
    return `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateSlotId(): string {
    return `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Public methods for managing scheduling rules
  addSchedulingRule(rule: SchedulingRule): void {
    const rules = this.schedulingRules.get(rule.practitionerId) || []
    rules.push(rule)
    this.schedulingRules.set(rule.practitionerId, rules)
  }

  removeSchedulingRule(ruleId: string, practitionerId: string): void {
    const rules = this.schedulingRules.get(practitionerId) || []
    const filteredRules = rules.filter(rule => rule.id !== ruleId)
    this.schedulingRules.set(practitionerId, filteredRules)
  }

  // Static methods for convenience
  static scheduleAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    const service = new AppointmentService()
    return service.scheduleAppointment(appointmentData)
  }

  static updateAppointment(appointmentId: string, updates: Partial<Appointment>): Promise<Appointment> {
    const service = new AppointmentService()
    return service.updateAppointment(appointmentId, updates)
  }

  static cancelAppointment(appointmentId: string, reason?: string): Promise<Appointment> {
    const service = new AppointmentService()
    return service.cancelAppointment(appointmentId, reason)
  }

  static checkAvailability(practitionerId: string, date: string): Promise<AppointmentSlot[]> {
    const service = new AppointmentService()
    return service.checkAvailability(practitionerId, date)
  }

  static sendRealTimeUpdates(appointmentId: string): Promise<void> {
    const service = new AppointmentService()
    return service.sendRealTimeUpdates(appointmentId)
  }
}

// Export singleton instance
export const appointmentService = new AppointmentService()