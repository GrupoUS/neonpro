import { useState, useCallback } from 'react'
import { api } from '@/lib/api.js'
import type { ProfessionalSchedule } from '@/types/aesthetic-scheduling.js'

export function useProfessionalSelection() {
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalSchedule | null>(null)
  const [professionals, setProfessionals] = useState<ProfessionalSchedule[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfessionals = useCallback(async (filters?: {
    specialty?: string
    available?: boolean
    certification?: string
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.professional.getAll.query(filters || {})
      setProfessionals(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch professionals')
    } finally {
      setLoading(false)
    }
  }, [])

  const selectProfessional = useCallback((professional: ProfessionalSchedule) => {
    setSelectedProfessional(professional)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedProfessional(null)
  }, [])

  const getProfessionalById = useCallback((id: string) => {
    return professionals.find(prof => prof.id === id)
  }, [professionals])

  const getProfessionalsBySpecialty = useCallback((specialty: string) => {
    return professionals.filter(prof => prof.specialty === specialty)
  }, [professionals])

  const getAvailableProfessionals = useCallback((date: Date, time: string) => {
    const dayOfWeek = date.getDay()
    return professionals.filter(prof => {
      const workingHours = prof.workingHours.find(wh => wh.dayOfWeek === dayOfWeek)
      if (!workingHours || !workingHours.isAvailable) return false
      
      const [hour, minute] = time.split(':').map(Number)
      const [startHour, startMinute] = workingHours.startTime.split(':').map(Number)
      const [endHour, endMinute] = workingHours.endTime.split(':').map(Number)
      
      const timeValue = hour * 60 + minute
      const startValue = startHour * 60 + startMinute
      const endValue = endHour * 60 + endMinute
      
      return timeValue >= startValue && timeValue <= endValue
    })
  }, [professionals])

  const validateProfessionalSelection = useCallback((professionalId: string) => {
    const professional = getProfessionalById(professionalId)
    if (!professional) {
      return { valid: false, error: 'Professional not found' }
    }
    
    // Check if professional has valid certifications
    const hasValidCertifications = professional.maxAppointmentsPerDay > 0
    if (!hasValidCertifications) {
      return { 
        valid: false, 
        error: 'Professional does not have valid certifications' 
      }
    }
    
    return { valid: true, error: null }
  }, [getProfessionalById])

  return {
    selectedProfessional,
    professionals,
    loading,
    error,
    fetchProfessionals,
    selectProfessional,
    clearSelection,
    getProfessionalById,
    getProfessionalsBySpecialty,
    getAvailableProfessionals,
    validateProfessionalSelection
  }
}