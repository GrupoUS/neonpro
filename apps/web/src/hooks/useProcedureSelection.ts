import { useState, useCallback } from 'react'
import { api } from '@/lib/api.js'
import type { Treatment, ProfessionalSchedule } from '@/types/aesthetic-scheduling.js'

export function useProcedureSelection() {
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null)
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalSchedule | null>(null)
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [professionals, setProfessionals] = useState<ProfessionalSchedule[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTreatments = useCallback(async (category?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.treatment.getAll.query({ category })
      setTreatments(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch treatments')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchProfessionals = useCallback(async (specialty?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.professional.getAll.query({ specialty })
      setProfessionals(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch professionals')
    } finally {
      setLoading(false)
    }
  }, [])

  const selectTreatment = useCallback((treatment: Treatment) => {
    setSelectedTreatment(treatment)
    // Auto-fetch professionals that can perform this treatment
    fetchProfessionals(treatment.category)
  }, [fetchProfessionals])

  const selectProfessional = useCallback((professional: ProfessionalSchedule) => {
    setSelectedProfessional(professional)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedTreatment(null)
    setSelectedProfessional(null)
  }, [])

  const getAvailableTimeSlots = useCallback((date: Date) => {
    if (!selectedProfessional) return []
    
    // This would typically fetch from the API
    // For now, return the professional's availability
    return selectedProfessional.availability.filter(slot => 
      slot.isAvailable && !slot.appointmentId
    )
  }, [selectedProfessional])

  const validateSelection = useCallback(() => {
    if (!selectedTreatment) {
      return { valid: false, error: 'Please select a treatment' }
    }
    if (!selectedProfessional) {
      return { valid: false, error: 'Please select a professional' }
    }
    
    // Check if professional can perform this treatment
    const canPerform = selectedProfessional.specialty === selectedTreatment.category ||
      selectedProfessional.specialty === 'general'
    
    if (!canPerform) {
      return { 
        valid: false, 
        error: 'Selected professional cannot perform this treatment' 
      }
    }
    
    return { valid: true, error: null }
  }, [selectedTreatment, selectedProfessional])

  return {
    selectedTreatment,
    selectedProfessional,
    treatments,
    professionals,
    loading,
    error,
    fetchTreatments,
    fetchProfessionals,
    selectTreatment,
    selectProfessional,
    clearSelection,
    getAvailableTimeSlots,
    validateSelection
  }
}