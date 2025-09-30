// Hook for managing patients in aesthetic clinic
import { useState, useEffect } from 'react'
import { Patient } from '../types'
import { PatientService } from '../services'

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // This would be an actual API call
      // For now, simulate with empty data
      setPatients([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pacientes')
    } finally {
      setLoading(false)
    }
  }

  const createPatient = async (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Validate patient data
      const validation = PatientService.validatePatient(patientData)
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      // API call to create patient
      const newPatient: Patient = {
        ...patientData,
        id: crypto.randomUUID(),
        created_at: new Date(),
        updated_at: new Date()
      }
      
      setPatients(prev => [...prev, newPatient])
      return newPatient
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar paciente')
      throw err
    }
  }

  const updatePatient = async (patientId: string, updates: Partial<Patient>) => {
    try {
      // API call to update patient
      setPatients(prev => 
        prev.map(patient => 
          patient.id === patientId 
            ? { ...patient, ...updates, updated_at: new Date() }
            : patient
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar paciente')
      throw err
    }
  }

  const searchPatients = (query: string) => {
    const normalizedQuery = query.toLowerCase().trim()
    
    if (!normalizedQuery) return patients
    
    return patients.filter(patient =>
      patient.name.toLowerCase().includes(normalizedQuery) ||
      patient.email?.toLowerCase().includes(normalizedQuery) ||
      patient.phone.includes(normalizedQuery) ||
      patient.cpf.includes(normalizedQuery)
    )
  }

  const getVIPPatients = () => {
    return patients.filter(patient => patient.vip_status)
  }

  const getPatientByCPF = (cpf: string) => {
    return patients.find(patient => patient.cpf.replace(/\D/g, '') === cpf.replace(/\D/g, ''))
  }

  return {
    patients,
    loading,
    error,
    createPatient,
    updatePatient,
    refetch: fetchPatients,
    searchPatients,
    getVIPPatients,
    getPatientByCPF
  }
}