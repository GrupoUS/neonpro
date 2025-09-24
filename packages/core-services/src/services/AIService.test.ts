import { describe, expect, it, vi } from 'vitest'
import type { ServiceContext } from '../types'
import { AIService } from './AIService'

// Mock types and dependencies if needed
describe('Enhanced No-Show Prediction', () => {
  const mockContext: ServiceContext = { _userId: 'test' }

  describe('preprocessNoShowData', () => {
    it('should bin patientAge in preprocessNoShowData', async () => {
      // Note: To test private method, we can use (aiService as any)['preprocessNoShowData'] or expose it for testing
      // For now, test via public API once implemented
      const data = {
        daysSinceScheduled: 7,
        appointmentType: 'consultation',
        patientAge: 25,
        previousNoShows: 0,
      }

      const aiService = new AIService()
      const processed = (aiService as any)['preprocessNoShowData'](data) // Temporary for RED phase; later use public method

      expect(processed.patientAge).toBe('0-30') // Binned as per design (will fail until implemented)
    })
  })

  describe('makePrediction', () => {
    it('should use enhanced logic with flag true and achieve confidence >0.8', async () => {
      const request = {
        type: 'appointment_noshow',
        data: {
          daysSinceScheduled: 1,
          appointmentType: 'consultation',
          patientAge: 25,
          previousNoShows: 1,
        },
        // enhanced: true, // Not yet in type, but we'll add to request for enhanced path (will fail until implemented)
      }

      const aiService = new AIService()
      const response = await aiService.makePrediction(request, mockContext)

      expect(response.confidence).toBeGreaterThan(0.8)
      expect(response).toHaveProperty('enhanced', true)
      expect(response).toHaveProperty('anonymizedFeatures')
    })

    it('should fallback to mock logic with flag false', async () => {
      const request = {
        type: 'appointment_noshow',
        data: {
          daysSinceScheduled: 7,
          appointmentType: 'consultation',
          patientAge: 45,
          previousNoShows: 0,
        },
        enhanced: false,
      }

      const aiService = new AIService()
      const response = await aiService.makePrediction(request, mockContext)

      expect(response.confidence).toBeLessThan(0.8) // Mock logic has lower confidence
      expect(response).toHaveProperty('enhanced', false)
    })

    it('should handle different appointment types', async () => {
      const appointmentTypes = ['consultation', 'followup', 'emergency', 'surgery']
      const aiService = new AIService()

      for (const appointmentType of appointmentTypes) {
        const request = {
          type: 'appointment_noshow',
          data: {
            daysSinceScheduled: 3,
            appointmentType,
            patientAge: 35,
            previousNoShows: 0,
          },
        }

        const response = await aiService.makePrediction(request, mockContext)
        expect(response).toHaveProperty('confidence')
        expect(response.confidence).toBeGreaterThan(0)
        expect(response.confidence).toBeLessThanOrEqual(1)
      }
    })

    it('should handle edge cases for patient age', async () => {
      const edgeAges = [0, 18, 65, 100]
      const aiService = new AIService()

      for (const patientAge of edgeAges) {
        const request = {
          type: 'appointment_noshow',
          data: {
            daysSinceScheduled: 2,
            appointmentType: 'consultation',
            patientAge,
            previousNoShows: 0,
          },
        }

        const response = await aiService.makePrediction(request, mockContext)
        expect(response).toHaveProperty('confidence')
        expect(response.confidence).toBeGreaterThan(0)
      }
    })

    it('should handle high previous no-shows', async () => {
      const request = {
        type: 'appointment_noshow',
        data: {
          daysSinceScheduled: 1,
          appointmentType: 'consultation',
          patientAge: 30,
          previousNoShows: 5, // High no-show history
        },
      }

      const aiService = new AIService()
      const response = await aiService.makePrediction(request, mockContext)

      expect(response.confidence).toBeGreaterThan(0.5) // Should have higher confidence due to history
      expect(response.prediction).toBe(true) // Likely to be a no-show
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid prediction types', async () => {
      const request = {
        type: 'invalid_type' as any,
        data: {
          daysSinceScheduled: 1,
          appointmentType: 'consultation',
          patientAge: 25,
          previousNoShows: 0,
        },
      }

      const aiService = new AIService()

      await expect(
        aiService.makePrediction(request, mockContext),
      ).rejects.toThrow('Unsupported prediction type')
    })

    it('should handle missing required data fields', async () => {
      const request = {
        type: 'appointment_noshow',
        data: {
          // Missing required fields
          appointmentType: 'consultation',
        } as any,
      }

      const aiService = new AIService()

      await expect(
        aiService.makePrediction(request, mockContext),
      ).rejects.toThrow('Missing required data fields')
    })
  })
})
