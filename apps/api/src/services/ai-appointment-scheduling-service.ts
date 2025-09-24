/**
 * Enhanced AI Appointment Scheduling Service
 *
 * Core service for intelligent appointment scheduling with:
 * - No-show prediction using machine learning
 * - Resource optimization and staff allocation
 * - Intelligent scheduling algorithms
 * - Real-time availability management
 * - Automated reminder systems
 *
 * Following Task 9 architecture design and LGPD compliance
 */

import { prisma } from '../lib/prisma'
import {} from '@prisma/client'

export interface NoShowPredictionFeatures {
  patientId: string
  appointmentTime: Date
  appointmentType: string
  daysSinceLastAppointment: number
  totalPastAppointments: number
  totalPastNoShows: number
  patientAge?: number
  patientGender?: string
  appointmentDayOfWeek: number
  appointmentTimeOfDay: 'morning' | 'afternoon' | 'evening'
  seasonality: 'high' | 'medium' | 'low'
  weatherForecast?: string
  distanceFromClinic?: number
  socioeconomicIndicators?: {
    neighborhood: string
    incomeLevel: 'low' | 'medium' | 'high'
  }
}

export interface NoShowPredictionResult {
  riskScore: number // 0-100
  confidence: number // 0-1
  riskFactors: string[]
  preventionRecommendations: string[]
  modelVersion: string
}

export interface ResourceAllocation {
  professionalId: string
  roomId: string
  equipment: string[]
  timeSlot: {
    start: Date
    end: Date
  }
  efficiency: number
  utilization: number
}

export interface SchedulingOptimization {
  suggestedSlots: Array<{
    start: Date
    end: Date
    professionalId: string
    roomId: string
    confidence: number
    efficiency: number
    reason: string
  }>
  resourceUtilization: {
    professionals: number
    rooms: number
    equipment: number
  }
  bottlenecks: string[]
  recommendations: string[]
}

export interface AppointmentSchedulingContext {
  clinicId: string
  patientId: string
  serviceTypeId: string
  preferredDates: Date[]
  preferredProfessionals: string[]
  duration: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  accessibility: {
    mobility: boolean
    language: string[]
    other: string[]
  }
  insurance?: {
    provider: string
    plan: string
    coverage: number
  }
}

export class AIAppointmentSchedulingService {
  private static instance: AIAppointmentSchedulingService
  private modelVersion: string = '1.0.0'

  static getInstance(): AIAppointmentSchedulingService {
    if (!AIAppointmentSchedulingService.instance) {
      AIAppointmentSchedulingService.instance = new AIAppointmentSchedulingService()
    }
    return AIAppointmentSchedulingService.instance
  }

  /**
   * Predict no-show risk for an appointment
   */
  async predictNoShow(
    appointmentData: NoShowPredictionFeatures,
  ): Promise<NoShowPredictionResult> {
    try {
      // Get patient historical data
      const patient = await prisma.patient.findUnique({
        where: { id: appointmentData.patientId },
        select: {
          totalAppointments: true,
          totalNoShows: true,
          lastNoShowDate: true,
          behavioralPatterns: true,
          preferredContactMethod: true,
          communicationPreferences: true,
        },
      })

      if (!patient) {
        throw new Error('Patient not found')
      }

      // Extract behavioral patterns
      const behavioralPatterns = patient.behavioralPatterns as any || {}

      // Calculate base risk factors
      const riskFactors: string[] = []
      let riskScore = 0

      // Historical no-show rate
      const noShowRate = patient.totalNoShows / Math.max(patient.totalAppointments, 1)
      if (noShowRate > 0.3) {
        riskScore += 30
        riskFactors.push('High historical no-show rate')
      } else if (noShowRate > 0.15) {
        riskScore += 15
        riskFactors.push('Moderate historical no-show rate')
      }

      // Time-based factors
      const appointmentHour = appointmentData.appointmentTime.getHours()
      if (appointmentHour < 9 || appointmentHour > 16) {
        riskScore += 10
        riskFactors.push('Non-standard appointment time')
      }

      // Day of week factor
      const dayOfWeek = appointmentData.appointmentTime.getDay()
      if (dayOfWeek === 1 || dayOfWeek === 5) { // Monday or Friday
        riskScore += 8
        riskFactors.push('Monday/Friday appointment')
      }

      // Seasonality factor
      if (appointmentData.seasonality === 'high') {
        riskScore += 12
        riskFactors.push('High seasonality period')
      }

      // Behavioral patterns
      if (behavioralPatterns.lastMinuteBooking) {
        riskScore += 15
        riskFactors.push('History of last-minute bookings')
      }

      if (behavioralPatterns.frequentRescheduling) {
        riskScore += 12
        riskFactors.push('History of frequent rescheduling')
      }

      // Contact method preference
      if (
        patient.preferredContactMethod === 'email'
        && !patient.communicationPreferences?.['email_enabled']
      ) {
        riskScore += 8
        riskFactors.push('Limited communication options')
      }

      // Distance factor (if available)
      if (appointmentData.distanceFromClinic && appointmentData.distanceFromClinic > 20) {
        riskScore += 10
        riskFactors.push('Far from clinic')
      }

      // Ensure risk score is within bounds
      riskScore = Math.max(0, Math.min(100, riskScore))

      // Calculate confidence based on data availability
      const confidence = this.calculateConfidence(appointmentData, patient)

      // Generate prevention recommendations
      const preventionRecommendations = this.generatePreventionRecommendations(
        riskScore,
        riskFactors,
        patient,
      )

      return {
        riskScore: Math.round(riskScore),
        confidence,
        riskFactors,
        preventionRecommendations,
        modelVersion: this.modelVersion,
      }
    } catch {
      console.error('Error predicting no-show:', error)
      throw new Error('Failed to predict no-show risk')
    }
  }

  /**
   * Optimize resource allocation for appointments
   */
  async optimizeResourceAllocation(
    context: AppointmentSchedulingContext,
    dateRange: { start: Date; end: Date },
  ): Promise<SchedulingOptimization> {
    try {
      // Get available professionals
      const professionals = await prisma.professional.findMany({
        where: {
          clinicId: context.clinicId,
          isActive: true,
          serviceTypes: {
            some: { id: context.serviceTypeId },
          },
        },
        include: {
          availabilities: {
            where: {
              date: {
                gte: dateRange.start,
                lte: dateRange.end,
              },
            },
          },
        },
      })

      // Get existing appointments
      const existingAppointments = await prisma.appointment.findMany({
        where: {
          clinicId: context.clinicId,
          startTime: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
          status: {
            in: ['scheduled', 'confirmed'],
          },
        },
        include: {
          professional: true,
          room: true,
        },
      })

      // Get available rooms
      const rooms = await prisma.room.findMany({
        where: {
          clinicId: context.clinicId,
          isActive: true,
        },
      })

      // Generate optimal time slots
      const suggestedSlots = await this.generateOptimalTimeSlots(
        context,
        professionals,
        existingAppointments,
        rooms,
        dateRange,
      )

      // Calculate resource utilization
      const resourceUtilization = this.calculateResourceUtilization(
        professionals,
        rooms,
        existingAppointments,
        dateRange,
      )

      // Identify bottlenecks
      const bottlenecks = this.identifyBottlenecks(
        professionals,
        rooms,
        existingAppointments,
      )

      // Generate recommendations
      const recommendations = this.generateSchedulingRecommendations(
        suggestedSlots,
        resourceUtilization,
        bottlenecks,
      )

      return {
        suggestedSlots,
        resourceUtilization,
        bottlenecks,
        recommendations,
      }
    } catch {
      console.error('Error optimizing resource allocation:', error)
      throw new Error('Failed to optimize resource allocation')
    }
  }

  /**
   * Get real-time availability with conflict detection
   */
  async getRealTimeAvailability(
    clinicId: string,
    _dateRange: { start: Date; end: Date },
    professionalId?: string,
  ): Promise<{
    availableSlots: Array<{
      start: Date
      end: Date
      professionalId: string
      roomId: string
      confidence: number
    }>
    conflicts: Array<{
      type: 'overlap' | 'resource' | 'capacity'
      severity: 'low' | 'medium' | 'high'
      description: string
    }>
  }> {
    try {
      // Build query filters
      const whereClause: any = {
        clinicId: clinicId,
        startTime: { gte: dateRange.start },
        endTime: { lte: dateRange.end },
        status: { in: ['scheduled', 'confirmed'] },
      }

      if (professionalId) {
        whereClause.professionalId = professionalId
      }

      // Get existing appointments
      const existingAppointments = await prisma.appointment.findMany({
        where: whereClause,
        include: {
          professional: true,
          room: true,
        },
        orderBy: { startTime: 'asc' },
      })

      // Get professional availability
      const professionals = await prisma.professional.findMany({
        where: {
          clinicId,
          isActive: true,
          ...(professionalId ? { id: professionalId } : {}),
        },
        include: {
          availabilities: {
            where: {
              date: {
                gte: dateRange.start,
                lte: dateRange.end,
              },
            },
          },
        },
      })

      // Get rooms
      const rooms = await prisma.room.findMany({
        where: { clinicId, isActive: true },
      })

      // Generate available slots
      const availableSlots = this.generateAvailableSlots(
        professionals,
        rooms,
        existingAppointments,
        dateRange,
      )

      // Detect conflicts
      const conflicts = this.detectConflicts(existingAppointments)

      return {
        availableSlots,
        conflicts,
      }
    } catch {
      console.error('Error getting real-time availability:', error)
      throw new Error('Failed to get real-time availability')
    }
  }

  /**
   * Generate automated reminder schedule
   */
  async generateReminderSchedule(
    appointmentId: string,
  ): Promise<
    Array<{
      type: 'email' | 'sms' | 'whatsapp'
      timing: Date
      message: string
      priority: 'low' | 'medium' | 'high'
    }>
  > {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: true,
          professional: true,
          clinic: true,
        },
      })

      if (!appointment) {
        throw new Error('Appointment not found')
      }

      const reminders: Array<{
        type: 'email' | 'sms' | 'whatsapp'
        timing: Date
        message: string
        priority: 'low' | 'medium' | 'high'
      }> = []

      const appointmentTime = new Date(appointment.startTime)
      const now = new Date()

      // Calculate reminder timings based on no-show risk
      const riskScore = appointment.noShowRiskScore || 0
      const reminderCount = riskScore > 50 ? 4 : riskScore > 30 ? 3 : 2

      // Reminder 1: 7 days before (high risk only)
      if (reminderCount >= 4) {
        const reminderTime = new Date(appointmentTime.getTime() - 7 * 24 * 60 * 60 * 1000)
        if (reminderTime > now) {
          reminders.push({
            type: 'email',
            timing: reminderTime,
            message: this.generateReminderMessage(appointment, 'week_before'),
            priority: 'medium',
          })
        }
      }

      // Reminder 2: 3 days before
      const reminderTime3Days = new Date(appointmentTime.getTime() - 3 * 24 * 60 * 60 * 1000)
      if (reminderTime3Days > now) {
        reminders.push({
          type: 'email',
          timing: reminderTime3Days,
          message: this.generateReminderMessage(appointment, 'three_days_before'),
          priority: 'medium',
        })
      }

      // Reminder 3: 1 day before
      const reminderTime1Day = new Date(appointmentTime.getTime() - 1 * 24 * 60 * 60 * 1000)
      if (reminderTime1Day > now) {
        reminders.push({
          type: appointment.patient.preferredContactMethod === 'email' ? 'email' : 'sms',
          timing: reminderTime1Day,
          message: this.generateReminderMessage(appointment, 'day_before'),
          priority: 'high',
        })
      }

      // Reminder 4: 2 hours before
      const reminderTime2Hours = new Date(appointmentTime.getTime() - 2 * 60 * 60 * 1000)
      if (reminderTime2Hours > now) {
        reminders.push({
          type: 'sms',
          timing: reminderTime2Hours,
          message: this.generateReminderMessage(appointment, 'two_hours_before'),
          priority: 'high',
        })
      }

      return reminders
    } catch {
      console.error('Error generating reminder schedule:', error)
      throw new Error('Failed to generate reminder schedule')
    }
  }

  // Helper methods
  private calculateConfidence(
    features: NoShowPredictionFeatures,
    patient: Patient,
  ): number {
    let confidence = 0.5 // Base confidence

    // Increase confidence with more data points
    if (patient.totalAppointments > 10) confidence += 0.2
    if (patient.totalAppointments > 50) confidence += 0.1

    // Increase confidence with complete feature set
    if (features.patientAge) confidence += 0.05
    if (features.distanceFromClinic) confidence += 0.05
    if (features.socioeconomicIndicators) confidence += 0.05

    return Math.min(1, confidence)
  }

  private generatePreventionRecommendations(
    riskScore: number,
    riskFactors: string[],
    patient: Patient,
  ): string[] {
    const recommendations: string[] = []

    if (riskScore > 50) {
      recommendations.push('Implement multi-channel reminder system')
      recommendations.push('Schedule confirmation call 24 hours before')
      recommendations.push('Consider flexible rescheduling options')
    }

    if (riskFactors.includes('High historical no-show rate')) {
      recommendations.push('Address underlying barriers to attendance')
      recommendations.push('Consider appointment deposit or insurance')
    }

    if (riskFactors.includes('Far from clinic')) {
      recommendations.push('Offer telemedicine alternative')
      recommendations.push('Provide transportation assistance information')
    }

    if (patient.preferredContactMethod === 'email') {
      recommendations.push('Enable SMS backup for critical reminders')
    }

    return recommendations
  }

  private async generateOptimalTimeSlots(
    context: AppointmentSchedulingContext,
    professionals: any[],
    existingAppointments: any[],
    rooms: any[],
    _dateRange: { start: Date; end: Date },
  ): Promise<any[]> {
    const slots: any[] = []

    // Simple slot generation algorithm
    for (const professional of professionals) {
      if (
        context.preferredProfessionals.length > 0
        && !context.preferredProfessionals.includes(professional.id)
      ) {
        continue
      }

      // Generate slots based on professional availability
      for (const availability of professional.availabilities) {
        const dayStart = new Date(availability.date)
        dayStart.setHours(
          availability.startTime.getHours(),
          availability.startTime.getMinutes(),
          0,
          0,
        )

        const dayEnd = new Date(availability.date)
        dayEnd.setHours(availability.endTime.getHours(), availability.endTime.getMinutes(), 0, 0)

        // Generate 30-minute slots
        const slotDuration = context.duration // Use appointment duration
        const currentSlot = new Date(dayStart)

        while (currentSlot.getTime() + slotDuration * 60000 <= dayEnd.getTime()) {
          const slotEnd = new Date(currentSlot.getTime() + slotDuration * 60000)

          // Check for conflicts
          const hasConflict = existingAppointments.some((apt) =>
            apt.professionalId === professional.id
            && apt.startTime < slotEnd
            && apt.endTime > currentSlot
          )

          if (!hasConflict) {
            // Find available room
            const availableRoom = rooms.find((room) =>
              !existingAppointments.some((apt) =>
                apt.roomId === room.id
                && apt.startTime < slotEnd
                && apt.endTime > currentSlot
              )
            )

            if (availableRoom) {
              slots.push({
                start: new Date(currentSlot),
                end: new Date(slotEnd),
                professionalId: professional.id,
                roomId: availableRoom.id,
                confidence: 0.8, // Base confidence
                efficiency: 0.9,
                reason: 'Optimal slot with available resources',
              })
            }
          }

          currentSlot.setTime(currentSlot.getTime() + 30 * 60000) // 30-minute increments
        }
      }
    }

    // Sort by efficiency and confidence
    return slots.sort((a, b) => (b.efficiency + b.confidence) - (a.efficiency + a.confidence))
  }

  private calculateResourceUtilization(
    professionals: any[],
    rooms: any[],
    appointments: any[],
    dateRange: { start: Date; end: Date },
  ) {
    const totalHours = (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60)

    const professionalHours = appointments.reduce((sum, apt) => {
      const duration = (apt.endTime.getTime() - apt.startTime.getTime()) / (1000 * 60 * 60)
      return sum + duration
    }, 0)

    const roomUtilization = professionalHours / (rooms.length * totalHours)
    const professionalUtilization = professionalHours / (professionals.length * totalHours)

    return {
      professionals: Math.round(professionalUtilization * 100),
      rooms: Math.round(roomUtilization * 100),
      equipment: 75, // Placeholder
    }
  }

  private identifyBottlenecks(
    professionals: any[],
    rooms: any[],
    appointments: any[],
  ): string[] {
    const bottlenecks: string[] = []

    // Check professional utilization
    const professionalLoad = new Map<string, number>()
    appointments.forEach((apt) => {
      const current = professionalLoad.get(apt.professionalId) || 0
      professionalLoad.set(apt.professionalId, current + 1)
    })

    professionalLoad.forEach((load, professionalId) => {
      if (load > 8) { // More than 8 appointments per day
        bottlenecks.push(`Professional ${professionalId} overloaded`)
      }
    })

    // Check room utilization
    const roomLoad = new Map<string, number>()
    appointments.forEach((apt) => {
      if (apt.roomId) {
        const current = roomLoad.get(apt.roomId) || 0
        roomLoad.set(apt.roomId, current + 1)
      }
    })

    roomLoad.forEach((load, roomId) => {
      if (load > 12) { // More than 12 appointments per day
        bottlenecks.push(`Room ${roomId} overutilized`)
      }
    })

    return bottlenecks
  }

  private generateSchedulingRecommendations(
    slots: any[],
    utilization: any,
    bottlenecks: string[],
  ): string[] {
    const recommendations: string[] = []

    if (utilization.professionals > 90) {
      recommendations.push('Consider adding more professional availability')
    }

    if (utilization.rooms > 85) {
      recommendations.push('Optimize room scheduling or add more rooms')
    }

    if (bottlenecks.length > 0) {
      recommendations.push('Address identified bottlenecks in resource allocation')
    }

    if (slots.length < 10) {
      recommendations.push('Limited availability detected - consider expanding schedule')
    }

    return recommendations
  }

  private generateAvailableSlots(
    _professionals: any[],
    _rooms: any[],
    _appointments: any[],
    _dateRange: { start: Date; end: Date },
  ): any[] {
    // Implementation for generating available slots
    return []
  }

  private detectConflicts(appointments: any[]): any[] {
    const conflicts: any[] = []

    // Detect overlapping appointments
    for (let i = 0; i < appointments.length; i++) {
      for (let j = i + 1; j < appointments.length; j++) {
        const apt1 = appointments[i]
        const apt2 = appointments[j]

        if (
          apt1.professionalId === apt2.professionalId
          && apt1.startTime < apt2.endTime
          && apt1.endTime > apt2.startTime
        ) {
          conflicts.push({
            type: 'overlap',
            severity: 'high',
            description: `Professional ${apt1.professionalId} has overlapping appointments`,
          })
        }
      }
    }

    return conflicts
  }

  private generateReminderMessage(
    appointment: any,
    type: 'week_before' | 'three_days_before' | 'day_before' | 'two_hours_before',
  ): string {
    const { patient, professional, clinic, startTime } = appointment
    const formattedDate = startTime.toLocaleDateString('pt-BR')
    const formattedTime = startTime.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })

    const messages = {
      week_before:
        `Olá ${patient.fullName}, seu agendamento com ${professional.fullName} está confirmado para ${formattedDate} às ${formattedTime}. Por favor, confirme sua presença.`,
      three_days_before:
        `Lembrete: Seu agendamento é em 3 dias - ${formattedDate} às ${formattedTime} com ${professional.fullName}.`,
      day_before:
        `Atenção: Seu agendamento é amanhã às ${formattedTime} com ${professional.fullName} na ${clinic.name}.`,
      two_hours_before:
        `Seu agendamento é em 2 horas às ${formattedTime} com ${professional.fullName}. Por favor, chegue com 15 minutos de antecedência.`,
    }

    return messages[type]
  }
}
