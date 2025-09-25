import {
  type Appointment,
  type AppointmentCalendarView,
  type AppointmentFilters,
  AppointmentRepository as IAppointmentRepository,
  type AppointmentStatistics,
  AppointmentStatus,
  type AppointmentTimeline,
  type DailyAppointmentCount,
} from '@neonpro/domain'
import { SupabaseClient } from '@supabase/supabase-js'
import { logHealthcareError } from '../utils/logging'

/**
 * Supabase implementation of AppointmentRepository
 * Handles all appointment data access operations
 */
export class AppointmentRepository implements IAppointmentRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Appointment | null> {
    try {
      const { data, error } = await this.supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        logHealthcareError('database', error as Error, {
          method: 'findById',
          appointmentId: id,
          component: 'appointment-repository',
        })
        return null
      }

      return data ? this.mapToDomain(data) : null
    } catch (error) {
      logHealthcareError('database', error as Error, {
        component: 'appointment-repository',
        action: 'findById',
        appointmentId: id,
      })
      return null
    }
  }

  async findByPatientId(
    patientId: string,
    includePast: boolean = true,
  ): Promise<Appointment[]> {
    try {
      let query = this.supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)

      if (!includePast) {
        query = query.gte('start_time', new Date().toISOString())
      }

      const { data, error } = await query.order('start_time', { ascending: true })

      if (error) {
        logHealthcareError('database', error as Error, {
          component: 'appointment-repository',
          action: 'findByPatientId',
          patientId,
        })
        return []
      }

      return data.map(this.mapToDomain)
    } catch (error) {
      logHealthcareError('database', error as Error, {
        component: 'appointment-repository',
        action: 'findByPatientId',
        patientId,
      })
      return []
    }
  }

  async findByProfessionalId(
    professionalId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Appointment[]> {
    try {
      let query = this.supabase
        .from('appointments')
        .select('*')
        .eq('professional_id', professionalId)

      if (startDate) {
        query = query.gte('start_time', startDate)
      }

      if (endDate) {
        query = query.lte('end_time', endDate)
      }

      const { data, error } = await query.order('start_time', { ascending: true })

      if (error) {
        logHealthcareError('database', error as Error, {
          component: 'appointment-repository',
          action: 'findByProfessionalId',
          professionalId,
        })
        return []
      }

      return data.map(this.mapToDomain)
    } catch (error) {
      logHealthcareError('database', error as Error, {
        component: 'appointment-repository',
        action: 'findByProfessionalId',
        professionalId,
      })
      return []
    }
  }

  async findByClinicId(
    clinicId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Appointment[]> {
    try {
      let query = this.supabase
        .from('appointments')
        .select('*')
        .eq('clinic_id', clinicId)

      if (startDate) {
        query = query.gte('start_time', startDate)
      }

      if (endDate) {
        query = query.lte('end_time', endDate)
      }

      const { data, error } = await query.order('start_time', { ascending: true })

      if (error) {
        logHealthcareError('database', error as Error, {
          component: 'appointment-repository',
          action: 'findByClinicId',
          clinicId,
        })
        return []
      }

      return data.map(this.mapToDomain)
    } catch (error) {
      logHealthcareError('database', error as Error, {
        component: 'appointment-repository',
        action: 'findByClinicId',
        clinicId,
      })
      return []
    }
  }

  async findByRoomId(
    roomId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Appointment[]> {
    try {
      let query = this.supabase
        .from('appointments')
        .select('*')
        .eq('room_id', roomId)

      if (startDate) {
        query = query.gte('start_time', startDate)
      }

      if (endDate) {
        query = query.lte('end_time', endDate)
      }

      const { data, error } = await query.order('start_time', { ascending: true })

      if (error) {
        logHealthcareError('database', error as Error, {
          component: 'appointment-repository',
          action: 'findByRoomId',
          roomId,
        })
        return []
      }

      return data.map(this.mapToDomain)
    } catch (error) {
      logHealthcareError('database', error as Error, {
        component: 'appointment-repository',
        action: 'findByRoomId',
        roomId,
      })
      return []
    }
  }

  async findByStatus(
    status: AppointmentStatus,
    clinicId?: string,
  ): Promise<Appointment[]> {
    try {
      let query = this.supabase
        .from('appointments')
        .select('*')
        .eq('status', status)

      if (clinicId) {
        query = query.eq('clinic_id', clinicId)
      }

      const { data, error } = await query.order('start_time', { ascending: true })

      if (error) {
        logHealthcareError('database', error as Error, {
          component: 'appointment-repository',
          action: 'findByStatus',
          status,
          clinicId,
        })
        return []
      }

      return data.map(this.mapToDomain)
    } catch (error) {
      logHealthcareError('database', error as Error, {
        component: 'appointment-repository',
        action: 'findByStatus',
        status,
        clinicId,
      })
      return []
    }
  }

  async findByDateRange(
    startDate: string,
    endDate: string,
    clinicId?: string,
  ): Promise<Appointment[]> {
    try {
      let query = this.supabase
        .from('appointments')
        .select('*')
        .gte('start_time', startDate)
        .lte('end_time', endDate)

      if (clinicId) {
        query = query.eq('clinic_id', clinicId)
      }

      const { data, error } = await query.order('start_time', { ascending: true })

      if (error) {
        logHealthcareError('database', error as Error, {
          component: 'appointment-repository',
          action: 'findByDateRange',
          startDate,
          endDate,
          clinicId,
        })
        return []
      }

      return data.map(this.mapToDomain)
    } catch (error) {
      logHealthcareError('database', error as Error, {
        component: 'appointment-repository',
        action: 'findByDateRange',
        startDate,
        endDate,
        clinicId,
      })
      return []
    }
  }

  async findForCalendar(
    startDate: string,
    endDate: string,
    clinicId?: string,
    professionalId?: string,
  ): Promise<AppointmentCalendarView[]> {
    try {
      let query = this.supabase
        .from('appointments')
        .select(
          'id, start_time, end_time, status, type, priority, patient_id, professional_id, room_id',
        )
        .gte('start_time', startDate)
        .lte('end_time', endDate)

      if (clinicId) {
        query = query.eq('clinic_id', clinicId)
      }

      if (professionalId) {
        query = query.eq('professional_id', professionalId)
      }

      const { data, error } = await query.order('start_time', { ascending: true })

      if (error) {
        logHealthcareError('database', error as Error, {
          component: 'appointment-repository',
          action: 'findForCalendar',
          startDate,
          endDate,
          clinicId,
          professionalId,
        })
        return []
      }

      return data.map(this.mapToCalendarView)
    } catch (error) {
      logHealthcareError('database', error as Error, {
        component: 'appointment-repository',
        action: 'findForCalendar',
        startDate,
        endDate,
        clinicId,
        professionalId,
      })
      return []
    }
  }

  async hasTimeConflict(
    professionalId: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string,
  ): Promise<boolean> {
    try {
      let query = this.supabase
        .from('appointments')
        .select('id')
        .eq('professional_id', professionalId)
        .neq('status', 'cancelled')
        .or(`start_time.lt.${endTime}&end_time.gt.${startTime}`)

      if (excludeAppointmentId) {
        query = query.neq('id', excludeAppointmentId)
      }

      const { data, error } = await query

      if (error) {
        logHealthcareError('database', error as Error, {
          component: 'appointment-repository',
          action: 'hasTimeConflict',
          professionalId,
          startTime,
          endTime,
        })
        return false
      }

      return data.length > 0
    } catch (error) {
      logHealthcareError('database', error as Error, {
        component: 'appointment-repository',
        action: 'hasTimeConflict',
        professionalId,
        startTime,
        endTime,
      })
      return false
    }
  }

  async create(
    appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Appointment> {
    try {
      const dbAppointment = this.mapToDatabase(appointment)
      const { data, error } = await this.supabase
        .from('appointments')
        .insert(dbAppointment)
        .select()
        .single()

      if (error) {
        logHealthcareError('database', error as Error, {
          component: 'appointment-repository',
          action: 'create',
        })
        throw error
      }

      return this.mapToDomain(data)
    } catch (error) {
      logHealthcareError('database', error as Error, {
        component: 'appointment-repository',
        action: 'create',
      })
      throw error
    }
  }

  async update(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    try {
      const dbUpdates = this.mapToDatabaseUpdates(updates)
      const { data, error } = await this.supabase
        .from('appointments')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logHealthcareError('database', error as Error, {
          component: 'appointment-repository',
          action: 'update',
          appointmentId: id,
        })
        throw error
      }

      return this.mapToDomain(data)
    } catch (error) {
      logHealthcareError('database', error as Error, {
        component: 'appointment-repository',
        action: 'update',
        appointmentId: id,
      })
      throw error
    }
  }

  async cancel(
    id: string,
    cancelledBy: string,
    reason: string,
    notes?: string,
  ): Promise<Appointment> {
    try {
      const { data, error } = await this.supabase
        .from('appointments')
        .update({
          status: 'cancelled' as AppointmentStatus,
          cancelled_at: new Date().toISOString(),
          cancelled_by: cancelledBy,
          cancellation_reason: reason,
          cancellation_notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logHealthcareError('database', error as Error, {
          component: 'appointment-repository',
          action: 'cancel',
          appointmentId: id,
        })
        throw error
      }

      return this.mapToDomain(data)
    } catch (error) {
      logHealthcareError('database', error as Error, {
        component: 'appointment-repository',
        action: 'cancel',
        appointmentId: id,
      })
      throw error
    }
  }

  async reschedule(
    id: string,
    newStartTime: string,
    newEndTime: string,
    rescheduledBy: string,
  ): Promise<Appointment> {
    try {
      const { data, error } = await this.supabase
        .from('appointments')
        .update({
          start_time: newStartTime,
          end_time: newEndTime,
          rescheduled_from: id,
          updated_at: new Date().toISOString(),
          updated_by: rescheduledBy,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logHealthcareError('database', error as Error, {
          component: 'appointment-repository',
          action: 'reschedule',
          appointmentId: id,
        })
        throw error
      }

      return this.mapToDomain(data)
    } catch (error) {
      logHealthcareError('database', error as Error, {
        component: 'appointment-repository',
        action: 'reschedule',
        appointmentId: id,
      })
      throw error
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('appointments')
        .delete()
        .eq('id', id)

      if (error) {
        logHealthcareError('database', error as Error, {
          component: 'appointment-repository',
          action: 'delete',
          appointmentId: id,
        })
        return false
      }

      return true
    } catch (error) {
      logHealthcareError('database', error as Error, {
        component: 'appointment-repository',
        action: 'delete',
        appointmentId: id,
      })
      return false
    }
  }

  async countByClinic(
    clinicId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<number> {
    try {
      let query = this.supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)

      if (startDate) {
        query = query.gte('start_time', startDate)
      }

      if (endDate) {
        query = query.lte('end_time', endDate)
      }

      const { count, error } = await query

      if (error) {
        logHealthcareError('database', error as Error, {
          component: 'appointment-repository',
          action: 'countByClinic',
          clinicId,
        })
        return 0
      }

      return count || 0
    } catch (error) {
      logHealthcareError('database', error as Error, {
        component: 'appointment-repository',
        action: 'countByClinic',
        clinicId,
      })
      return 0
    }
  }

  async getStatistics(
    clinicId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<AppointmentStatistics> {
    try {
      let query = this.supabase
        .from('appointments')
        .select('*')
        .eq('clinic_id', clinicId)

      if (startDate) {
        query = query.gte('start_time', startDate)
      }

      if (endDate) {
        query = query.lte('end_time', endDate)
      }

      const { data, error } = await query

      if (error) {
        logHealthcareError('database', error as Error, {
          component: 'appointment-repository',
          action: 'getStatistics',
          clinicId,
        })
        return this.getDefaultStatistics()
      }

      return this.calculateStatistics(data)
    } catch (error) {
      logHealthcareError('database', error as Error, {
        component: 'appointment-repository',
        action: 'getStatistics',
        clinicId,
      })
      return this.getDefaultStatistics()
    }
  }

  // Helper methods
  private mapToDomain(data: any): Appointment {
    return {
      id: data.id,
      clinicId: data.clinic_id,
      patientId: data.patient_id,
      professionalId: data.professional_id,
      serviceTypeId: data.service_type_id,
      startTime: data.start_time,
      endTime: data.end_time,
      duration: data.duration,
      status: data.status,
      priority: data.priority,
      type: data.type,
      notes: data.notes,
      internalNotes: data.internal_notes,
      diagnosis: data.diagnosis,
      treatment: data.treatment,
      prescription: data.prescription,
      reminderSentAt: data.reminder_sent_at,
      confirmationSentAt: data.confirmation_sent_at,
      whatsappReminderSent: data.whatsapp_reminder_sent,
      smsReminderSent: data.sms_reminder_sent,
      emailReminderSent: data.email_reminder_sent,
      roomId: data.room_id,
      location: data.location,
      virtualMeetingLink: data.virtual_meeting_link,
      cancelledAt: data.cancelled_at,
      cancelledBy: data.cancelled_by,
      cancellationReason: data.cancellation_reason,
      cancellationNotes: data.cancellation_notes,
      rescheduledFrom: data.rescheduled_from,
      rescheduledTo: data.rescheduled_to,
      billingCode: data.billing_code,
      insuranceApproved: data.insurance_approved,
      cost: data.cost,
      paidAmount: data.paid_amount,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      updatedBy: data.updated_by,
    }
  }

  private mapToCalendarView(data: any): AppointmentCalendarView {
    return {
      id: data.id,
      startTime: data.start_time,
      endTime: data.end_time,
      status: data.status,
      type: data.type,
      priority: data.priority,
      patientId: data.patient_id,
      professionalId: data.professional_id,
      roomId: data.room_id,
    }
  }

  private mapToDatabase(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): any {
    return {
      clinic_id: appointment.clinicId,
      patient_id: appointment.patientId,
      professional_id: appointment.professionalId,
      service_type_id: appointment.serviceTypeId,
      start_time: appointment.startTime,
      end_time: appointment.endTime,
      duration: appointment.duration,
      status: appointment.status,
      priority: appointment.priority,
      type: appointment.type,
      notes: appointment.notes,
      internal_notes: appointment.internalNotes,
      diagnosis: appointment.diagnosis,
      treatment: appointment.treatment,
      prescription: appointment.prescription,
      reminder_sent_at: appointment.reminderSentAt,
      confirmation_sent_at: appointment.confirmationSentAt,
      whatsapp_reminder_sent: appointment.whatsappReminderSent,
      sms_reminder_sent: appointment.smsReminderSent,
      email_reminder_sent: appointment.emailReminderSent,
      room_id: appointment.roomId,
      location: appointment.location,
      virtual_meeting_link: appointment.virtualMeetingLink,
      cancelled_at: appointment.cancelledAt,
      cancelled_by: appointment.cancelledBy,
      cancellation_reason: appointment.cancellationReason,
      cancellation_notes: appointment.cancellationNotes,
      rescheduled_from: appointment.rescheduledFrom,
      rescheduled_to: appointment.rescheduledTo,
      billing_code: appointment.billingCode,
      insurance_approved: appointment.insuranceApproved,
      cost: appointment.cost,
      paid_amount: appointment.paidAmount,
      created_by: appointment.createdBy,
      updated_by: appointment.updatedBy,
    }
  }

  private mapToDatabaseUpdates(updates: Partial<Appointment>): any {
    const dbUpdates: any = {}

    if (updates.clinicId !== undefined) dbUpdates.clinic_id = updates.clinicId
    if (updates.patientId !== undefined) dbUpdates.patient_id = updates.patientId
    if (updates.professionalId !== undefined) dbUpdates.professional_id = updates.professionalId
    if (updates.serviceTypeId !== undefined) dbUpdates.service_type_id = updates.serviceTypeId
    if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime
    if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime
    if (updates.duration !== undefined) dbUpdates.duration = updates.duration
    if (updates.status !== undefined) dbUpdates.status = updates.status
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority
    if (updates.type !== undefined) dbUpdates.type = updates.type
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes
    if (updates.internalNotes !== undefined) dbUpdates.internal_notes = updates.internalNotes
    if (updates.diagnosis !== undefined) dbUpdates.diagnosis = updates.diagnosis
    if (updates.treatment !== undefined) dbUpdates.treatment = updates.treatment
    if (updates.prescription !== undefined) dbUpdates.prescription = updates.prescription
    if (updates.reminderSentAt !== undefined) dbUpdates.reminder_sent_at = updates.reminderSentAt
    if (updates.confirmationSentAt !== undefined) {
      dbUpdates.confirmation_sent_at = updates.confirmationSentAt
    }
    if (updates.whatsappReminderSent !== undefined) {
      dbUpdates.whatsapp_reminder_sent = updates.whatsappReminderSent
    }
    if (updates.smsReminderSent !== undefined) dbUpdates.sms_reminder_sent = updates.smsReminderSent
    if (updates.emailReminderSent !== undefined) {
      dbUpdates.email_reminder_sent = updates.emailReminderSent
    }
    if (updates.roomId !== undefined) dbUpdates.room_id = updates.roomId
    if (updates.location !== undefined) dbUpdates.location = updates.location
    if (updates.virtualMeetingLink !== undefined) {
      dbUpdates.virtual_meeting_link = updates.virtualMeetingLink
    }
    if (updates.cancelledAt !== undefined) dbUpdates.cancelled_at = updates.cancelledAt
    if (updates.cancelledBy !== undefined) dbUpdates.cancelled_by = updates.cancelledBy
    if (updates.cancellationReason !== undefined) {
      dbUpdates.cancellation_reason = updates.cancellationReason
    }
    if (updates.cancellationNotes !== undefined) {
      dbUpdates.cancellation_notes = updates.cancellationNotes
    }
    if (updates.rescheduledFrom !== undefined) dbUpdates.rescheduled_from = updates.rescheduledFrom
    if (updates.rescheduledTo !== undefined) dbUpdates.rescheduled_to = updates.rescheduledTo
    if (updates.billingCode !== undefined) dbUpdates.billing_code = updates.billingCode
    if (updates.insuranceApproved !== undefined) {
      dbUpdates.insurance_approved = updates.insuranceApproved
    }
    if (updates.cost !== undefined) dbUpdates.cost = updates.cost
    if (updates.paidAmount !== undefined) dbUpdates.paid_amount = updates.paidAmount
    if (updates.updatedBy !== undefined) dbUpdates.updated_by = updates.updatedBy

    dbUpdates.updated_at = new Date().toISOString()

    return dbUpdates
  }

  private getDefaultStatistics(): AppointmentStatistics {
    return {
      total: 0,
      byStatus: {} as Record<AppointmentStatus, number>,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      noShowRate: 0,
      cancellationRate: 0,
      averageDuration: 0,
      revenue: 0,
    }
  }

  private calculateStatistics(appointments: any[]): AppointmentStatistics {
    const total = appointments.length
    const byStatus: Record<AppointmentStatus, number> = {} as Record<AppointmentStatus, number>
    const byType: Record<string, number> = {}
    const byPriority: Record<string, number> = {}

    let totalDuration = 0
    let totalRevenue = 0
    let cancelledCount = 0
    let noShowCount = 0

    appointments.forEach(appointment => {
      // Count by status
      byStatus[appointment.status] = (byStatus[appointment.status] || 0) + 1

      // Count by type
      byType[appointment.type] = (byType[appointment.type] || 0) + 1

      // Count by priority
      if (appointment.priority) {
        byPriority[appointment.priority] = (byPriority[appointment.priority] || 0) + 1
      }

      // Sum duration and revenue
      if (appointment.duration) {
        totalDuration += appointment.duration
      }
      if (appointment.cost) {
        totalRevenue += appointment.cost
      }

      // Count cancellations and no-shows
      if (appointment.status === 'cancelled') {
        cancelledCount++
      }
      if (appointment.status === 'no_show') {
        noShowCount++
      }
    })

    return {
      total,
      byStatus,
      byType,
      byPriority,
      noShowRate: total > 0 ? noShowCount / total : 0,
      cancellationRate: total > 0 ? cancelledCount / total : 0,
      averageDuration: total > 0 ? totalDuration / total : 0,
      revenue: totalRevenue,
    }
  }
}

/**
 * Appointment Query Repository Implementation
 * For complex queries and reporting
 */
export class AppointmentQueryRepository implements AppointmentQueryRepository {
  constructor(private supabase: SupabaseClient) {}

  async findWithFilters(filters: AppointmentFilters): Promise<Appointment[]> {
    try {
      let query = this.supabase
        .from('appointments')
        .select('*')

      if (filters.clinicId) {
        query = query.eq('clinic_id', filters.clinicId)
      }

      if (filters.patientId) {
        query = query.eq('patient_id', filters.patientId)
      }

      if (filters.professionalId) {
        query = query.eq('professional_id', filters.professionalId)
      }

      if (filters.roomId) {
        query = query.eq('room_id', filters.roomId)
      }

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.type) {
        query = query.eq('type', filters.type)
      }

      if (filters.priority) {
        query = query.eq('priority', filters.priority)
      }

      if (filters.startDate) {
        query = query.gte('start_time', filters.startDate)
      }

      if (filters.endDate) {
        query = query.lte('end_time', filters.endDate)
      }

      if (filters.createdFrom) {
        query = query.gte('created_at', filters.createdFrom)
      }

      if (filters.createdTo) {
        query = query.lte('created_at', filters.createdTo)
      }

      if (filters.sortBy) {
        query = query.order(filters.sortBy, {
          ascending: filters.sortOrder === 'asc',
        })
      } else {
        query = query.order('start_time', { ascending: true })
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      if (filters.offset) {
        query = query.range(filters.offset, (filters.offset || 0) + (filters.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) {
        logHealthcareError('database', error as Error, {
          component: 'appointment-query-repository',
          action: 'findWithFilters',
          filters,
        })
        return []
      }

      return data.map(this.mapToDomain)
    } catch (error) {
      logHealthcareError('database', error as Error, {
        component: 'appointment-query-repository',
        action: 'findWithFilters',
        filters,
      })
      return []
    }
  }

  async countWithFilters(filters: AppointmentFilters): Promise<number> {
    try {
      let query = this.supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })

      if (filters.clinicId) {
        query = query.eq('clinic_id', filters.clinicId)
      }

      if (filters.patientId) {
        query = query.eq('patient_id', filters.patientId)
      }

      if (filters.professionalId) {
        query = query.eq('professional_id', filters.professionalId)
      }

      if (filters.roomId) {
        query = query.eq('room_id', filters.roomId)
      }

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.type) {
        query = query.eq('type', filters.type)
      }

      if (filters.priority) {
        query = query.eq('priority', filters.priority)
      }

      if (filters.startDate) {
        query = query.gte('start_time', filters.startDate)
      }

      if (filters.endDate) {
        query = query.lte('end_time', filters.endDate)
      }

      if (filters.createdFrom) {
        query = query.gte('created_at', filters.createdFrom)
      }

      if (filters.createdTo) {
        query = query.lte('created_at', filters.createdTo)
      }

      const { count, error } = await query

      if (error) {
        logHealthcareError('database', error as Error, {
          component: 'appointment-query-repository',
          action: 'countWithFilters',
          filters,
        })
        return 0
      }

      return count || 0
    } catch (error) {
      logHealthcareError('database', error as Error, {
        component: 'appointment-query-repository',
        action: 'countWithFilters',
        filters,
      })
      return 0
    }
  }

  async getTimeline(
    patientId: string,
    startDate: string,
    endDate: string,
  ): Promise<AppointmentTimeline[]> {
    try {
      const { data, error } = await this.supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .gte('start_time', startDate)
        .lte('end_time', endDate)
        .order('start_time', { ascending: true })

      if (error) {
        logHealthcareError('database', error as Error, {
          component: 'appointment-query-repository',
          action: 'getTimeline',
          patientId,
        })
        return []
      }

      return this.groupAppointmentsByDate(data)
    } catch (error) {
      logHealthcareError('database', error as Error, {
        component: 'appointment-query-repository',
        action: 'getTimeline',
        patientId,
      })
      return []
    }
  }

  async getDailyCounts(
    clinicId: string,
    startDate: string,
    endDate: string,
  ): Promise<DailyAppointmentCount[]> {
    try {
      const { data, error } = await this.supabase
        .from('appointments')
        .select('start_time, status')
        .eq('clinic_id', clinicId)
        .gte('start_time', startDate)
        .lte('end_time', endDate)
        .order('start_time', { ascending: true })

      if (error) {
        logHealthcareError('database', error as Error, {
          component: 'appointment-query-repository',
          action: 'getDailyCounts',
          clinicId,
        })
        return []
      }

      return this.calculateDailyCounts(data)
    } catch (error) {
      logHealthcareError('database', error as Error, {
        component: 'appointment-query-repository',
        action: 'getDailyCounts',
        clinicId,
      })
      return []
    }
  }

  // Helper methods
  private mapToDomain(data: any): Appointment {
    return {
      id: data.id,
      clinicId: data.clinic_id,
      patientId: data.patient_id,
      professionalId: data.professional_id,
      serviceTypeId: data.service_type_id,
      startTime: data.start_time,
      endTime: data.end_time,
      duration: data.duration,
      status: data.status,
      priority: data.priority,
      type: data.type,
      notes: data.notes,
      internalNotes: data.internal_notes,
      diagnosis: data.diagnosis,
      treatment: data.treatment,
      prescription: data.prescription,
      reminderSentAt: data.reminder_sent_at,
      confirmationSentAt: data.confirmation_sent_at,
      whatsappReminderSent: data.whatsapp_reminder_sent,
      smsReminderSent: data.sms_reminder_sent,
      emailReminderSent: data.email_reminder_sent,
      roomId: data.room_id,
      location: data.location,
      virtualMeetingLink: data.virtual_meeting_link,
      cancelledAt: data.cancelled_at,
      cancelledBy: data.cancelled_by,
      cancellationReason: data.cancellation_reason,
      cancellationNotes: data.cancellation_notes,
      rescheduledFrom: data.rescheduled_from,
      rescheduledTo: data.rescheduled_to,
      billingCode: data.billing_code,
      insuranceApproved: data.insurance_approved,
      cost: data.cost,
      paidAmount: data.paid_amount,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      updatedBy: data.updated_by,
    }
  }

  private groupAppointmentsByDate(appointments: any[]): AppointmentTimeline[] {
    const grouped = appointments.reduce((acc, appointment) => {
      const date = appointment.start_time.split('T')[0]
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(this.mapToDomain(appointment))
      return acc
    }, {} as Record<string, Appointment[]>)

    return Object.entries(grouped).map(([date, appointments]) => ({
      date,
      appointments,
      total: appointments.length,
    }))
  }

  private calculateDailyCounts(appointments: any[]): DailyAppointmentCount[] {
    const grouped = appointments.reduce((acc, appointment) => {
      const date = appointment.start_time.split('T')[0]
      if (!acc[date]) {
        acc[date] = { total: 0, completed: 0, cancelled: 0, noShow: 0 }
      }
      acc[date].total++

      if (appointment.status === 'completed') {
        acc[date].completed++
      } else if (appointment.status === 'cancelled') {
        acc[date].cancelled++
      } else if (appointment.status === 'no_show') {
        acc[date].noShow++
      }

      return acc
    }, {} as Record<string, DailyAppointmentCount>)

    return Object.entries(grouped).map(([date, counts]) => ({
      date,
      ...counts,
    }))
  }
}
