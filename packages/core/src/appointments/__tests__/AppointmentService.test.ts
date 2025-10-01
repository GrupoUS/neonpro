import { beforeEach, describe, expect, it } from 'vitest'
import { AppointmentService } from '../services/AppointmentService'
import { Appointment, AppointmentStatus } from '../types'

describe('AppointmentService', () => {
  let testDate: Date

  beforeEach(() => {
    testDate = new Date('2023-01-01T10:00:00Z')
  })

  describe('setHours', () => {
    it('should set hours when a valid number is provided', () => {
      const result = AppointmentService.setHours(testDate, 14)
      expect(result.getHours()).toBe(14)
    })

    it('should use current hour when undefined is provided', () => {
      const currentHour = new Date().getHours()
      const result = AppointmentService.setHours(testDate, undefined)
      expect(result.getHours()).toBe(currentHour)
    })

    it('should use current hour when NaN is provided', () => {
      const currentHour = new Date().getHours()
      const result = AppointmentService.setHours(testDate, NaN)
      expect(result.getHours()).toBe(currentHour)
    })

    it('should return a new date instance', () => {
      const result = AppointmentService.setHours(testDate, 14)
      expect(result).not.toBe(testDate)
    })

    it('should reset minutes, seconds, and milliseconds to 0', () => {
      const dateWithTime = new Date('2023-01-01T10:30:45.123Z')
      const result = AppointmentService.setHours(dateWithTime, 14)
      expect(result.getMinutes()).toBe(0) // Should be reset to 0
      expect(result.getSeconds()).toBe(0) // Should be reset to 0
      expect(result.getMilliseconds()).toBe(0) // Should be reset to 0
    })
  })

  describe('generateAvailableSlots', () => {
    it('should generate available slots for a professional', () => {
      const professionalId = 'professional-123'
      const date = new Date('2023-01-01')
      const durationMinutes = 30
      const existingAppointments: Appointment[] = []
      const workSchedule = { start: '09:00', end: '17:00' }

      const slots = AppointmentService.generateAvailableSlots(
        professionalId,
        date,
        durationMinutes,
        existingAppointments,
        workSchedule,
      )

      expect(slots).toHaveLength(16) // 8 hours * 2 slots per hour
      // ensure the first slot exists before accessing its properties to satisfy TypeScript strict checks
      expect(slots[0]).toBeDefined()
      if (slots[0]) {
        expect(slots[0].professionalId).toBe(professionalId)
        expect(slots[0].isAvailable).toBe(true)
      }
    })

    it('should mark slots as unavailable when conflicting with existing appointments', () => {
      const professionalId = 'professional-123'
      const date = new Date('2023-01-01')
      const durationMinutes = 30
      const existingAppointments = [
        {
          id: 'appointment-1',
          datetime: new Date('2023-01-01T10:00:00Z'),
          duration: 30,
          type: 'consultation',
          status: AppointmentStatus.SCHEDULED,
          patientId: 'patient-1',
          professionalId: 'professional-123',
          cfmCompliance: true,
          createdAt: new Date('2023-01-01T09:50:00Z'),
          updatedAt: new Date('2023-01-01T09:50:00Z'),
        } as unknown as Appointment,
      ] as Appointment[]
      const workSchedule = { start: '09:00', end: '17:00' }

      const slots = AppointmentService.generateAvailableSlots(
        professionalId,
        date,
        durationMinutes,
        existingAppointments,
        workSchedule,
      )

      const conflictingSlot = slots.find(slot =>
        slot.startTime.getHours() === 10 && slot.startTime.getMinutes() === 0
      )
      expect(conflictingSlot?.isAvailable).toBe(false)
    })

    it('should handle invalid work schedule gracefully', () => {
      const professionalId = 'professional-123'
      const date = new Date('2023-01-01')
      const durationMinutes = 30
      const existingAppointments: any[] = []
      const workSchedule = { start: 'invalid', end: '17:00' }

      const slots = AppointmentService.generateAvailableSlots(
        professionalId,
        date,
        durationMinutes,
        existingAppointments,
        workSchedule,
      )

      expect(slots).toHaveLength(0)
    })
  })

  describe('calculateRevenue', () => {
    it('should calculate revenue from completed appointments - CURRENT BUG', () => {
      const appointments: Appointment[] = [
        {
          id: 'appointment-1',
          status: AppointmentStatus.COMPLETED,
          patientId: 'patient-1',
          professionalId: 'professional-1',
          datetime: new Date(),
          duration: 30,
          type: 'consultation',
          cfmCompliance: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          // Missing price field but should still work with default pricing
        } as unknown as Appointment,
        {
          id: 'appointment-2',
          status: AppointmentStatus.COMPLETED,
          patientId: 'patient-2',
          professionalId: 'professional-2',
          datetime: new Date(),
          duration: 45,
          type: 'treatment',
          cfmCompliance: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          // Missing price field but should still work with default pricing
        } as unknown as Appointment,
      ] as Appointment[]

      const revenue = AppointmentService.calculateRevenue(appointments)
      
      // ✅ FIXED: Now returns correct revenue using default prices
      console.log('FIXED: Revenue calculation returns:', revenue)
      console.log('EXPECTED: Should return sum of appointment prices (consultation + treatment)')
      
      // After fix: should return sum of default prices (150 + 300 = 450)
      expect(revenue).toBe(450)
    })

    it('should only include completed appointments in revenue calculation', () => {
      const appointments: Appointment[] = [
        {
          id: 'appointment-1',
          status: AppointmentStatus.COMPLETED,
          patientId: 'patient-1',
          professionalId: 'professional-1',
          datetime: new Date(),
          duration: 30,
          type: 'consultation',
          cfmCompliance: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as Appointment,
        {
          id: 'appointment-2',
          status: AppointmentStatus.SCHEDULED,
          patientId: 'patient-2',
          professionalId: 'professional-2',
          datetime: new Date(),
          duration: 30,
          type: 'consultation',
          cfmCompliance: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as Appointment,
        {
          id: 'appointment-3',
          status: AppointmentStatus.CANCELLED,
          patientId: 'patient-3',
          professionalId: 'professional-3',
          datetime: new Date(),
          duration: 30,
          type: 'consultation',
          cfmCompliance: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as Appointment,
      ] as Appointment[]

      const revenue = AppointmentService.calculateRevenue(appointments)
      
      // ✅ FIXED: Should only include completed appointments (1 completed = 150)
      expect(revenue).toBe(150) // Only the completed consultation should be counted
      
      console.log('FIXED: Revenue for completed appointments only:', revenue)
      console.log('EXPECTED: Should return 150 for single completed consultation')
    })

    it('should return zero for empty appointment list', () => {
      const appointments: Appointment[] = []

      const revenue = AppointmentService.calculateRevenue(appointments)
      
      // This should work correctly even with the bug
      expect(revenue).toBe(0)
    })

    it('should handle appointments with different statuses correctly', () => {
      const appointments: Appointment[] = [
        {
          id: 'appointment-1',
          status: AppointmentStatus.COMPLETED,
          patientId: 'patient-1',
          professionalId: 'professional-1',
          datetime: new Date(),
          duration: 30,
          type: 'consultation',
          cfmCompliance: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as Appointment,
        {
          id: 'appointment-2',
          status: AppointmentStatus.COMPLETED,
          patientId: 'patient-2',
          professionalId: 'professional-2',
          datetime: new Date(),
          duration: 45,
          type: 'treatment',
          cfmCompliance: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as Appointment,
        {
          id: 'appointment-3',
          status: AppointmentStatus.IN_PROGRESS,
          patientId: 'patient-3',
          professionalId: 'professional-3',
          datetime: new Date(),
          duration: 60,
          type: 'follow_up',
          cfmCompliance: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as Appointment,
      ] as Appointment[]

      const revenue = AppointmentService.calculateRevenue(appointments)
      
      // ✅ FIXED: Should sum prices of 2 completed appointments (consultation + treatment)
      expect(revenue).toBe(450) // 150 (consultation) + 300 (treatment) = 450
      
      console.log('FIXED: Revenue for multiple completed appointments:', revenue)
      console.log('EXPECTED: Should return sum of prices for completed appointments only (150 + 300 = 450)')
    })

    it('should demonstrate the placeholder comment issue - FIXED', () => {
      // This test specifically addresses the issue mentioned in the PR comment:
      // "Price calculation would require additional service/pricing data"
      // "Placeholder: actual price logic needed"
      
      const appointments: Appointment[] = [
        {
          id: 'appointment-1',
          status: AppointmentStatus.COMPLETED,
          patientId: 'patient-1',
          professionalId: 'professional-1',
          datetime: new Date('2023-01-01T10:00:00Z'),
          duration: 30,
          type: 'consultation',
          cfmCompliance: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as Appointment,
      ] as Appointment[]

      const revenue = AppointmentService.calculateRevenue(appointments)
      
      // ✅ FIXED: Now uses default pricing when price field is missing
      expect(revenue).toBe(150) // Default consultation price
      
      console.log('FIXED: Implementation now handles missing price data gracefully:', revenue)
      console.log('EXPECTED: Should use default pricing (consultation = 150)')
    })
  })

  describe('getAppointmentStats', () => {
    it('should calculate appointment statistics', () => {
      const appointments: Appointment[] = [
        {
          id: 'appointment-1',
          status: AppointmentStatus.COMPLETED,
          patientId: 'patient-1',
          professionalId: 'professional-1',
          datetime: new Date(),
          duration: 30,
          type: 'consultation',
          cfmCompliance: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as Appointment,
        {
          id: 'appointment-2',
          status: AppointmentStatus.CANCELLED,
          patientId: 'patient-2',
          professionalId: 'professional-2',
          datetime: new Date(),
          duration: 30,
          type: 'consultation',
          cfmCompliance: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as Appointment,
        {
          id: 'appointment-3',
          status: AppointmentStatus.NO_SHOW,
          patientId: 'patient-3',
          professionalId: 'professional-3',
          datetime: new Date(),
          duration: 30,
          type: 'consultation',
          cfmCompliance: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as Appointment,
      ] as Appointment[]

      const stats = AppointmentService.getAppointmentStats(appointments)
      expect(stats.total).toBe(3)
      expect(stats.completed).toBe(1)
      expect(stats.cancelled).toBe(1)
      expect(stats.noShows).toBe(1)
      expect(stats.completionRate).toBe(33.33333333333333)
      expect(stats.cancellationRate).toBe(33.33333333333333)
      expect(stats.noShowRate).toBe(33.33333333333333)
    })

    it('should handle empty appointment list', () => {
      const stats = AppointmentService.getAppointmentStats([])
      expect(stats.total).toBe(0)
      expect(stats.completed).toBe(0)
      expect(stats.cancelled).toBe(0)
      expect(stats.noShows).toBe(0)
      expect(stats.completionRate).toBe(0)
      expect(stats.cancellationRate).toBe(0)
      expect(stats.noShowRate).toBe(0)
    })
  })
})
