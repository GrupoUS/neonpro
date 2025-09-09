import { AIService } from './AIService'

import { describe, it, expect, vi } from 'vitest'

import type { ServiceContext } from '../types'

// Mock types and dependencies if needed
describe('Enhanced No-Show Prediction', () => {
  const mockContext: ServiceContext = { userId: 'test' }

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
          patientAge: 65,
          previousNoShows: 0,
        },
        // enhanced: false, // Will fail until implemented
      }

      const aiService = new AIService()
      const response = await aiService.makePrediction(request, mockContext)

      expect(response.confidence).toBe(0.89) // Existing mock confidence
      expect(response).not.toHaveProperty('enhanced')
    })

    it('should not leak PII in output for LGPD compliance', async () => {
      const request = {
        type: 'appointment_noshow',
        data: {
          patientId: 'sensitive-id',
          patientAge: 25,
        },
        // enhanced: true, // Will fail until implemented
      }

      const aiService = new AIService()
      const response = await aiService.makePrediction(request, mockContext)

      expect(response).not.toHaveProperty('patientId')
      expect(response).not.toHaveProperty('patientAge') // Should be binned or omitted (will fail until implemented)
    })

    it('should handle edge case for new patient with no history', async () => {
      const request = {
        type: 'appointment_noshow',
        data: {
          daysSinceScheduled: 1,
          appointmentType: 'first-consult',
          patientAge: 18,
          previousNoShows: 0, // No history
        },
        // enhanced: true, // Will fail until implemented
      }

      const aiService = new AIService()
      const response = await aiService.makePrediction(request, mockContext)

      expect(response.confidence).toBeGreaterThan(0.5) // Reasonable for new patient (will fail until implemented)
    })
  })
})
