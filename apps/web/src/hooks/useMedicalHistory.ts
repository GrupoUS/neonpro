import { useState, useCallback } from 'react'
import { api } from '@/lib/api.js'
import type { MedicalHistory } from '@/types/aesthetic-scheduling.js'

export function useMedicalHistory(patientId: string) {
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMedicalHistory = useCallback(async () => {
    if (!patientId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.patient.getMedicalHistory.query({ patientId })
      setMedicalHistory(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch medical history')
    } finally {
      setLoading(false)
    }
  }, [patientId])

  const addMedicalRecord = useCallback(async (record: Omit<MedicalHistory, 'id'>) => {
    try {
      const response = await api.patient.addMedicalRecord.mutate({
        patientId,
        record
      })
      setMedicalHistory(prev => [...prev, response])
      return response
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add medical record')
      throw err
    }
  }, [patientId])

  const updateMedicalRecord = useCallback(async (recordId: string, updates: Partial<MedicalHistory>) => {
    try {
      const response = await api.patient.updateMedicalRecord.mutate({
        patientId,
        recordId,
        updates
      })
      setMedicalHistory(prev => 
        prev.map(record => record.id === recordId ? response : record)
      )
      return response
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update medical record')
      throw err
    }
  }, [patientId])

  const deleteMedicalRecord = useCallback(async (recordId: string) => {
    try {
      await api.patient.deleteMedicalRecord.mutate({
        patientId,
        recordId
      })
      setMedicalHistory(prev => prev.filter(record => record.id !== recordId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete medical record')
      throw err
    }
  }, [patientId])

  return {
    medicalHistory,
    loading,
    error,
    fetchMedicalHistory,
    addMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord
  }
}