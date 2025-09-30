import { describe, it, expect } from 'vitest'
import { TreatmentService } from '@neonpro/core/src/tratamentos/services/TreatmentService'
import { Treatment, TreatmentCategory } from '@neonpro/core/src/tratamentos/types'

describe('TreatmentService - Age Restrictions', () => {
  // Mock treatment data for testing
  const mockTreatment: Treatment = {
    id: 'treatment-1',
    name: 'Tratamento Facial',
    description: 'Tratamento de rejuvenescimento facial completo',
    category: TreatmentCategory.FACIAL_TREATMENTS,
    base_price: 1500,
    duration_minutes: 90,
    session_count: 6,
    interval_days: 7,
    requires_preparation: true,
    recovery_days: 1,
    contraindications: ['gravidez', 'cancer_pele'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    clinic_id: 'clinic-1'
  }

  describe('isAgeAppropriate', () => {
    it('should approve facial treatment for patient within age range', () => {
      const result = TreatmentService.isAgeAppropriate(mockTreatment, 25)
      
      expect(result.isAppropriate).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it('should reject facial treatment for patient below minimum age', () => {
      const result = TreatmentService.isAgeAppropriate(mockTreatment, 15)
      
      expect(result.isAppropriate).toBe(false)
      expect(result.reason).toContain('mínimo de 16 anos')
    })

    it('should approve facial treatment for patient exactly at minimum age', () => {
      const result = TreatmentService.isAgeAppropriate(mockTreatment, 16)
      
      expect(result.isAppropriate).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it('should approve injectable treatment only for patients 21+', () => {
      const injectableTreatment: Treatment = {
        ...mockTreatment,
        category: TreatmentCategory.INJECTABLES
      }

      const resultUnder21 = TreatmentService.isAgeAppropriate(injectableTreatment, 18)
      expect(resultUnder21.isAppropriate).toBe(false)
      expect(resultUnder21.reason).toContain('21 anos ou mais')

      const result21 = TreatmentService.isAgeAppropriate(injectableTreatment, 21)
      expect(result21.isAppropriate).toBe(true)
    })

    it('should approve body treatment only for patients 18+', () => {
      const bodyTreatment: Treatment = {
        ...mockTreatment,
        category: TreatmentCategory.BODY_TREATMENTS
      }

      const resultUnder18 = TreatmentService.isAgeAppropriate(bodyTreatment, 17)
      expect(resultUnder18.isAppropriate).toBe(false)
      expect(resultUnder18.reason).toContain('maioridade')

      const result18 = TreatmentService.isAgeAppropriate(bodyTreatment, 18)
      expect(result18.isAppropriate).toBe(true)
    })

    it('should approve laser treatment only for patients 18+', () => {
      const laserTreatment: Treatment = {
        ...mockTreatment,
        category: TreatmentCategory.LASER_TREATMENTS
      }

      const resultUnder18 = TreatmentService.isAgeAppropriate(laserTreatment, 17)
      expect(resultUnder18.isAppropriate).toBe(false)
      expect(resultUnder18.reason).toContain('maioridade')

      const result18 = TreatmentService.isAgeAppropriate(laserTreatment, 18)
      expect(result18.isAppropriate).toBe(true)
    })

    it('should approve thread lift only for patients 25+', () => {
      const threadLiftTreatment: Treatment = {
        ...mockTreatment,
        category: TreatmentCategory.THREAD_LIFT
      }

      const resultUnder25 = TreatmentService.isAgeAppropriate(threadLiftTreatment, 24)
      expect(resultUnder25.isAppropriate).toBe(false)
      expect(resultUnder25.reason).toContain('25 anos ou mais')

      const result25 = TreatmentService.isAgeAppropriate(threadLiftTreatment, 25)
      expect(result25.isAppropriate).toBe(true)
    })

    it('should approve hair treatment for patients 14+', () => {
      const hairTreatment: Treatment = {
        ...mockTreatment,
        category: TreatmentCategory.HAIR_TREATMENTS
      }

      const resultUnder14 = TreatmentService.isAgeAppropriate(hairTreatment, 13)
      expect(resultUnder14.isAppropriate).toBe(false)
      expect(resultUnder14.reason).toContain('mínimo de 14 anos')

      const result14 = TreatmentService.isAgeAppropriate(hairTreatment, 14)
      expect(result14.isAppropriate).toBe(true)
    })
  })

  describe('validateTreatment with age considerations', () => {
    it('should include age-specific warnings in validation', () => {
      const treatmentWithAgeWarnings = {
        ...mockTreatment,
        minimum_age: 21,
        category: 'injection' // Botox requires higher minimum age in Brazil
      }

      const validation = TreatmentService.validateTreatment(treatmentWithAgeWarnings)
      expect(validation.isValid).toBe(true)
    })

    it('should validate treatment duration for different age groups', () => {
      const longTreatment = {
        ...mockTreatment,
        duration_minutes: 300, // 5 hours
        category: 'body'
      }

      const validation = TreatmentService.validateTreatment(longTreatment)
      expect(validation.isValid).toBe(true) // 5 hours is under 8 hour limit
    })
  })

  describe('Brazilian-specific age restrictions', () => {
    it('should enforce minimum age for injectable treatments', () => {
      const botoxTreatment: Treatment = {
        ...mockTreatment,
        name: 'Tratamento com Toxina Botulínica',
        category: TreatmentCategory.INJECTABLES
      }

      // Test Brazilian legal requirement for botox (21+)
      const resultUnder21 = TreatmentService.isAgeAppropriate(botoxTreatment, 18)
      expect(resultUnder21.isAppropriate).toBe(false)
      expect(resultUnder21.reason).toContain('21 anos ou mais')
      
      const result21 = TreatmentService.isAgeAppropriate(botoxTreatment, 21)
      expect(result21.isAppropriate).toBe(true)
    })

    it('should handle laser treatments with age restrictions', () => {
      const laserTreatment: Treatment = {
        ...mockTreatment,
        name: 'Tratamento a Laser',
        category: TreatmentCategory.LASER_TREATMENTS
      }

      const resultUnder18 = TreatmentService.isAgeAppropriate(laserTreatment, 16)
      expect(resultUnder18.isAppropriate).toBe(false)
      expect(resultUnder18.reason).toContain('maioridade')
    })
  })

  describe('Edge cases', () => {
    it('should handle invalid age inputs gracefully', () => {
      const result1 = TreatmentService.isAgeAppropriate(mockTreatment, -5)
      const result2 = TreatmentService.isAgeAppropriate(mockTreatment, 0)

      expect(result1.isAppropriate).toBe(false)
      expect(result2.isAppropriate).toBe(false)
    })

    it('should handle treatments without age restrictions', () => {
      const wellnessTreatment: Treatment = {
        ...mockTreatment,
        category: TreatmentCategory.WELLNESS
      }

      const youngPatient = TreatmentService.isAgeAppropriate(wellnessTreatment, 16)
      expect(youngPatient.isAppropriate).toBe(true)
    })
  })
})