// Appointment service for aesthetic clinic scheduling
import { addMinutes, isAfter, isBefore } from 'date-fns'
import { Appointment, AppointmentStatus } from '../types'

// Appointment slot interface for availability tracking
export interface AppointmentSlot {
  professionalId: string
  startTime: Date
  endTime: Date
  isAvailable: boolean
}

export class AppointmentService {
  // Generate available time slots for a professional
  static generateAvailableSlots(
    professionalId: string,
    date: Date,
    durationMinutes: number,
    existingAppointments: Appointment[],
    workSchedule: { start: string; end: string },
  ): AppointmentSlot[] {
    const slots: AppointmentSlot[] = []
    const [startHour, startMin] = workSchedule.start.split(':').map(Number)
    const [endHour, endMin] = workSchedule.end.split(':').map(Number)

    // Type guard for parsed hour values
    if (
      typeof startHour === 'number' && typeof startMin === 'number' &&
      typeof endHour === 'number' && typeof endMin === 'number' &&
      !isNaN(startHour) && !isNaN(startMin) && !isNaN(endHour) && !isNaN(endMin)
    ) {
      const startTime = new Date(date)
      startTime.setHours(startHour, startMin, 0, 0)

      const endTime = new Date(date)
      endTime.setHours(endHour, endMin, 0, 0)

      let currentTime = startTime

      while (isBefore(currentTime, endTime)) {
        const slotEndTime = addMinutes(currentTime, durationMinutes)

        if (isAfter(slotEndTime, endTime)) break

        // Check if slot conflicts with existing appointments
        const hasConflict = existingAppointments.some(apt => {
          const aptStart = new Date(apt.datetime)
          const aptEnd = addMinutes(aptStart, apt.duration)

          return (
            (isAfter(currentTime, aptStart) && isBefore(currentTime, aptEnd)) ||
            (isAfter(slotEndTime, aptStart) && isBefore(slotEndTime, aptEnd)) ||
            (!isAfter(currentTime, aptStart) && !isBefore(slotEndTime, aptEnd))
          )
        })

        slots.push({
          professionalId,
          startTime: currentTime,
          endTime: slotEndTime,
          isAvailable: !hasConflict,
        })

        currentTime = addMinutes(currentTime, durationMinutes)
      }
    }

    return slots
  }

  // Check if patient has any contraindications for treatment
  static async checkPatientContraindications(
    _patientId: string,
    _treatmentId: string,
  ): Promise<{ hasContraindications: boolean; reasons: string[] }> {
    // This would integrate with medical records system
    // For now, return basic implementation
    // TODO: integrate with medical records to evaluate contraindications using _patientId and _treatmentId
    return {
      hasContraindications: false,
      reasons: [],
    }
  }

  // Calculate total appointment revenue
  // Note: Price calculation would require additional service/pricing data
  static calculateRevenue(appointments: Appointment[]): number {
    return appointments
      .filter(apt => apt.status === AppointmentStatus.COMPLETED)
      .reduce((total, _apt) => total + 0, 0) // Placeholder: actual price logic needed
  }

  // Get appointment statistics
  static getAppointmentStats(appointments: Appointment[]) {
    const total = appointments.length
    const completed = appointments.filter(apt => apt.status === AppointmentStatus.COMPLETED).length
    const cancelled = appointments.filter(apt => apt.status === AppointmentStatus.CANCELLED).length
    const noShows = appointments.filter(apt => apt.status === AppointmentStatus.NO_SHOW).length

    return {
      total,
      completed,
      cancelled,
      noShows,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      cancellationRate: total > 0 ? (cancelled / total) * 100 : 0,
      noShowRate: total > 0 ? (noShows / total) * 100 : 0,
    }
  }

  // Set hours for a date with type safety and undefined handling
  static setHours(date: Date, hours: number | undefined): Date {
    // Type guard to ensure hours is a valid number
    if (typeof hours === 'number' && hours !== undefined && !isNaN(hours)) {
      const newDate = new Date(date)
      newDate.setHours(hours, 0, 0, 0)

      // LGPD compliance: log when date operations are performed
      if (process.env['NODE_ENV'] === 'development') {
        console.log(`[LGPD-AUDIT] Date hours set to ${hours} for date ${date.toISOString()}`)
      }

      return newDate
    } else {
      // Use current hour as default when hours is undefined or invalid
      const currentHour = new Date().getHours()
      const newDate = new Date(date)
      newDate.setHours(currentHour, 0, 0, 0)

      // LGPD compliance: log when default is used
      if (process.env['NODE_ENV'] === 'development') {
        console.log(`[LGPD-AUDIT] Using default hour ${currentHour} for date ${date.toISOString()}`)
      }

      return newDate
    }
  }
}
