// Appointment service for aesthetic clinic scheduling
import { Appointment, AppointmentSlot, AppointmentStatus } from '../types'
import { format, addMinutes, isAfter, isBefore } from 'date-fns'

export class AppointmentService {
  // Generate available time slots for a professional
  static generateAvailableSlots(
    professionalId: string,
    date: Date,
    durationMinutes: number,
    existingAppointments: Appointment[],
    workSchedule: { start: string; end: string }
  ): AppointmentSlot[] {
    const slots: AppointmentSlot[] = []
    const [startHour, startMin] = workSchedule.start.split(':').map(Number)
    const [endHour, endMin] = workSchedule.end.split(':').map(Number)
    
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
        const aptStart = new Date(apt.scheduled_start)
        const aptEnd = new Date(apt.scheduled_end)
        
        return (
          (isAfter(currentTime, aptStart) && isBefore(currentTime, aptEnd)) ||
          (isAfter(slotEndTime, aptStart) && isBefore(slotEndTime, aptEnd)) ||
          (!isAfter(currentTime, aptStart) && !isBefore(slotEndTime, aptEnd))
        )
      })
      
      slots.push({
        professional_id: professionalId,
        start_time: currentTime,
        end_time: slotEndTime,
        is_available: !hasConflict
      })
      
      currentTime = addMinutes(currentTime, durationMinutes)
    }
    
    return slots
  }
  
  // Check if patient has any contraindications for treatment
  static async checkPatientContraindications(
    patientId: string,
    treatmentId: string
  ): Promise<{ hasContraindications: boolean; reasons: string[] }> {
    // This would integrate with medical records system
    // For now, return basic implementation
    return {
      hasContraindications: false,
      reasons: []
    }
  }
  
  // Calculate total appointment revenue
  static calculateRevenue(appointments: Appointment[]): number {
    return appointments
      .filter(apt => apt.status === AppointmentStatus.COMPLETED)
      .reduce((total, apt) => total + apt.price, 0)
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
      noShowRate: total > 0 ? (noShows / total) * 100 : 0
    }
  }
}