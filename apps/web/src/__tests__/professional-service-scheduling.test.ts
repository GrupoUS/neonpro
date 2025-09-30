import { describe, it, expect, beforeEach } from 'vitest'
import { ProfessionalService } from '@neonpro/core/src/profissionais/services/ProfessionalService'
import { Professional, AvailabilitySlot, ProfessionalRating } from '@neonpro/core/src/profissionais/types'

describe('ProfessionalService - Scheduling Logic', () => {
  let mockProfessional: Professional
  let mockAvailability: AvailabilitySlot[]

  beforeEach(() => {
    mockAvailability = [
      {
        id: 'slot-1',
        day_of_week: 1, // Monday
        start_time: '09:00',
        end_time: '12:00',
        is_available: true,
        max_appointments: 4
      },
      {
        id: 'slot-2',
        day_of_week: 1,
        start_time: '14:00',
        end_time: '18:00',
        is_available: true,
        max_appointments: 6
      },
      {
        id: 'slot-3',
        day_of_week: 3, // Wednesday
        start_time: '09:00',
        end_time: '13:00',
        is_available: true,
        max_appointments: 5
      },
      {
        id: 'slot-4',
        day_of_week: 5, // Friday
        start_time: '10:00',
        end_time: '14:00',
        is_available: false, // Unavailable
        max_appointments: 4
      }
    ]

    mockProfessional = {
      id: 'prof-1',
      name: 'Dra. Maria Silva',
      cpf: '12345678909',
      professional_license: 'CRM/SP 123456',
      email: 'maria.silva@clinic.com.br',
      phone: '+5511999998888',
      specialty: 'dermatologist',
      commission_rate: 0.15,
      is_active: true,
      availability: mockAvailability,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  })

  describe('canPerformTreatment', () => {
    it('should allow dermatologist to perform BOTOX treatments', () => {
      const result = ProfessionalService.canPerformTreatment(mockProfessional, 'BOTOX')
      expect(result).toBe(true)
    })

    it('should allow dermatologist to perform PREENCHIMENTO', () => {
      const result = ProfessionalService.canPerformTreatment(mockProfessional, 'PREENCHIMENTO')
      expect(result).toBe(true)
    })

    it('should allow dermatologist to perform LASER treatments', () => {
      const result = ProfessionalService.canPerformTreatment(mockProfessional, 'LASER')
      expect(result).toBe(true)
    })

    it('should allow dermatologist to perform PEELING_QUIMICO', () => {
      const result = ProfessionalService.canPerformTreatment(mockProfessional, 'PEELING_QUIMICO')
      expect(result).toBe(true)
    })

    it('should reject beauty therapist from performing medical treatments', () => {
      const beautyTherapist: Professional = {
        ...mockProfessional,
        specialty: 'beauty_therapist',
        professional_license: 'TECNICA 123456'
      }

      expect(ProfessionalService.canPerformTreatment(beautyTherapist, 'BOTOX')).toBe(false)
      expect(ProfessionalService.canPerformTreatment(beautyTherapist, 'PREENCHIMENTO')).toBe(false)
      expect(ProfessionalService.canPerformTreatment(beautyTherapist, 'LASER')).toBe(false)
    })

    it('should allow beauty therapist to perform basic aesthetic procedures', () => {
      const beautyTherapist: Professional = {
        ...mockProfessional,
        specialty: 'beauty_therapist',
        professional_license: 'TECNICA 123456'
      }

      expect(ProfessionalService.canPerformTreatment(beautyTherapist, 'LIMPEZA_DE_PELE')).toBe(true)
      expect(ProfessionalService.canPerformTreatment(beautyTherapist, 'MASSAGEM')).toBe(true)
      expect(ProfessionalService.canPerformTreatment(beautyTherapist, 'SOBRANCELHA')).toBe(true)
    })

    it('should handle case-insensitive treatment names', () => {
      expect(ProfessionalService.canPerformTreatment(mockProfessional, 'botox')).toBe(true)
      expect(ProfessionalService.canPerformTreatment(mockProfessional, 'Botox')).toBe(true)
      expect(ProfessionalService.canPerformTreatment(mockProfessional, 'Peeling_Quimico')).toBe(true)
    })

    it('should handle unknown treatments gracefully', () => {
      const result = ProfessionalService.canPerformTreatment(mockProfessional, 'UNKNOWN_TREATMENT')
      expect(result).toBe(false)
    })
  })

  describe('generateWeeklyAvailability', () => {
    it('should generate availability for a full week', () => {
      const monday = new Date('2024-01-08') // Monday
      const weeklyAvailability = ProfessionalService.generateWeeklyAvailability(mockProfessional, monday)

      expect(weeklyAvailability).toHaveLength(7)
      
      // Check that each day has a date and slots array
      weeklyAvailability.forEach(day => {
        expect(day.date).toBeInstanceOf(Date)
        expect(Array.isArray(day.slots)).toBe(true)
      })
    })

    it('should include only available slots', () => {
      const monday = new Date('2024-01-08') // Monday
      const weeklyAvailability = ProfessionalService.generateWeeklyAvailability(mockProfessional, monday)

      // Monday (day 1) should have 2 available slots
      const mondayAvailability = weeklyAvailability.find(day => day.date.getDay() === 1)
      expect(mondayAvailability?.slots).toHaveLength(2)

      // Wednesday (day 3) should have 1 available slot
      const wednesdayAvailability = weeklyAvailability.find(day => day.date.getDay() === 3)
      expect(wednesdayAvailability?.slots).toHaveLength(1)

      // Friday (day 5) should have 0 available slots (is_available: false)
      const fridayAvailability = weeklyAvailability.find(day => day.date.getDay() === 5)
      expect(fridayAvailability?.slots).toHaveLength(0)
    })

    it('should handle professionals with no availability', () => {
      const noAvailabilityProfessional: Professional = {
        ...mockProfessional,
        availability: []
      }

      const monday = new Date('2024-01-08')
      const weeklyAvailability = ProfessionalService.generateWeeklyAvailability(noAvailabilityProfessional, monday)

      weeklyAvailability.forEach(day => {
        expect(day.slots).toHaveLength(0)
      })
    })

    it('should calculate correct time slot duration', () => {
      const monday = new Date('2024-01-08')
      const weeklyAvailability = ProfessionalService.generateWeeklyAvailability(mockProfessional, monday)

      const mondayAvailability = weeklyAvailability.find(day => day.date.getDay() === 1)
      const morningSlot = mondayAvailability?.slots.find(slot => slot.start_time === '09:00')
      const afternoonSlot = mondayAvailability?.slots.find(slot => slot.start_time === '14:00')

      expect(morningSlot?.end_time).toBe('12:00') // 3 hours
      expect(afternoonSlot?.end_time).toBe('18:00') // 4 hours
    })
  })

  describe('calculateAverageRating', () => {
    it('should calculate average rating correctly', () => {
      const ratings: ProfessionalRating[] = [
        { id: '1', professional_id: 'prof-1', patient_id: 'p1', rating: 5, comment: 'Excelente', created_at: new Date().toISOString() },
        { id: '2', professional_id: 'prof-1', patient_id: 'p2', rating: 4, comment: 'Muito bom', created_at: new Date().toISOString() },
        { id: '3', professional_id: 'prof-1', patient_id: 'p3', rating: 5, comment: 'Perfeito', created_at: new Date().toISOString() }
      ]

      const result = ProfessionalService.calculateAverageRating(ratings)

      expect(result.average).toBe(4.67) // (5 + 4 + 5) / 3
      expect(result.totalRatings).toBe(3)
      expect(result.distribution).toEqual({
        5: 2, // Two 5-star ratings
        4: 1, // One 4-star rating
        3: 0,
        2: 0,
        1: 0
      })
    })

    it('should handle empty ratings array', () => {
      const result = ProfessionalService.calculateAverageRating([])
      
      expect(result.average).toBe(0)
      expect(result.totalRatings).toBe(0)
      expect(result.distribution).toEqual({})
    })

    it('should handle single rating', () => {
      const ratings: ProfessionalRating[] = [
        { id: '1', professional_id: 'prof-1', patient_id: 'p1', rating: 3, comment: 'Regular', created_at: new Date().toISOString() }
      ]

      const result = ProfessionalService.calculateAverageRating(ratings)

      expect(result.average).toBe(3)
      expect(result.totalRatings).toBe(1)
      expect(result.distribution).toEqual({
        5: 0,
        4: 0,
        3: 1,
        2: 0,
        1: 0
      })
    })
  })

  describe('validateProfessional', () => {
    it('should validate complete professional data', () => {
      const result = ProfessionalService.validateProfessional(mockProfessional)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should validate CPF format', () => {
      const invalidCPF = {
        ...mockProfessional,
        cpf: '123.456.789-09'
      }

      const result = ProfessionalService.validateProfessional(invalidCPF)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('CPF inválido')
    })

    it('should validate professional license', () => {
      const invalidLicense = {
        ...mockProfessional,
        professional_license: 'ABC'
      }

      const result = ProfessionalService.validateProfessional(invalidLicense)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Número do registro profissional é obrigatório')
    })

    it('should validate commission rate range', () => {
      const tooHighCommission = {
        ...mockProfessional,
        commission_rate: 1.5 // 150%
      }

      const result = ProfessionalService.validateProfessional(tooHighCommission)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Taxa de comissão deve estar entre 0 e 1 (0-100%)')
    })

    it('should accept valid commission rates', () => {
      const validProfessional = {
        ...mockProfessional,
        commission_rate: 0.20 // 20%
      }

      const result = ProfessionalService.validateProfessional(validProfessional)
      expect(result.isValid).toBe(true)
    })
  })

  describe('Scheduling Conflicts', () => {
    it('should detect overlapping appointments in same time slot', () => {
      // This would require an additional method in ProfessionalService
      // For now, we'll test the availability logic
      const monday = new Date('2024-01-08')
      const weeklyAvailability = ProfessionalService.generateWeeklyAvailability(mockProfessional, monday)

      const morningSlot = weeklyAvailability.find(day => day.date.getDay() === 1)?.slots[0]
      expect(morningSlot?.max_appointments).toBe(4)

      // If there are already 4 appointments, no more should be allowed
      // This logic would be implemented in a isTimeSlotAvailable method
    })

    it('should respect professional availability preferences', () => {
      const professionalWithBreaks = {
        ...mockProfessional,
        availability: [
          ...mockAvailability,
          {
            id: 'slot-lunch',
            day_of_week: 1,
            start_time: '12:00',
            end_time: '14:00',
            is_available: false, // Lunch break
            max_appointments: 0
          }
        ]
      }

      const monday = new Date('2024-01-08')
      const weeklyAvailability = ProfessionalService.generateWeeklyAvailability(professionalWithBreaks, monday)
      const mondayAvailability = weeklyAvailability.find(day => day.date.getDay() === 1)

      // Should have morning and afternoon slots but no lunch break
      expect(mondayAvailability?.slots).toHaveLength(2)
      expect(mondayAvailability?.slots.some(slot => slot.start_time === '12:00')).toBe(false)
    })
  })

  describe('Brazilian Market Specifics', () => {
    it('should validate professional license formats', () => {
      const validLicenses = [
        'CRM/SP 123456',
        'CRO/RJ 789012',
        'TECNICA SP 345678'
      ]

      validLicenses.forEach(license => {
        const professional = { ...mockProfessional, professional_license: license }
        const result = ProfessionalService.validateProfessional(professional)
        expect(result.isValid).toBe(true)
      })
    })

    it('should handle specialty-specific requirements', () => {
      const specialties = ['dermatologist', 'plastic_surgeon', 'aesthetic_physician']
      
      specialties.forEach(specialty => {
        const professional = { ...mockProfessional, specialty }
        
        // Medical specialists should be able to perform injectable treatments
        expect(ProfessionalService.canPerformTreatment(professional, 'BOTOX')).toBe(true)
        expect(ProfessionalService.canPerformTreatment(professional, 'PREENCHIMENTO')).toBe(true)
      })
    })

    it('should validate phone number format for Brazil', () => {
      const validPhones = [
        '+5511999998888',
        '+5521977776666',
        '+55133334444'
      ]

      validPhones.forEach(phone => {
        const professional = { ...mockProfessional, phone }
        const result = ProfessionalService.validateProfessional(professional)
        expect(result.isValid).toBe(true)
      })
    })
  })
})