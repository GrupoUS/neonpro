"use client"

import React, { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { usePatientAuth } from './use-patient-auth'

interface Appointment {
  id: string
  patient_id: string
  service_id: string
  professional_id: string
  scheduled_at: string
  duration_minutes: number
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  service: {
    id: string
    name: string
    category: string
    price: number
  }
  professional: {
    id: string
    name: string
    specialty: string
  }
  created_at: string
  updated_at: string
}

interface TreatmentHistory {
  id: string
  patient_id: string
  appointment_id: string
  treatment_type: string
  description: string
  before_photos?: string[]
  after_photos?: string[]
  notes: string
  satisfaction_score?: number
  side_effects?: string
  follow_up_required: boolean
  follow_up_date?: string
  created_at: string
  updated_at: string
}

interface Document {
  id: string
  patient_id: string
  type: 'receipt' | 'medical_report' | 'consent_form' | 'prescription' | 'exam_result'
  title: string
  description?: string
  file_url: string
  file_name: string
  file_size: number
  mime_type: string
  created_at: string
  appointment_id?: string
}

interface PatientDataContextType {
  appointments: Appointment[]
  treatmentHistory: TreatmentHistory[]
  documents: Document[]
  isLoading: boolean
  error: string | null
  refreshAppointments: () => Promise<void>
  refreshTreatmentHistory: () => Promise<void>
  refreshDocuments: () => Promise<void>
  refreshAll: () => Promise<void>
}

export function usePatientData(): PatientDataContextType {
  const { patient } = usePatientAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [treatmentHistory, setTreatmentHistory] = useState<TreatmentHistory[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (patient) {
      refreshAll()
    } else {
      // Clear data when no patient
      setAppointments([])
      setTreatmentHistory([])
      setDocuments([])
      setIsLoading(false)
    }
  }, [patient])

  const refreshAppointments = async () => {
    if (!patient) return

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          service:services(id, name, category, price),
          professional:users(id, name, role)
        `)
        .eq('patient_id', patient.id)
        .order('scheduled_at', { ascending: true })

      if (error) {
        throw error
      }

      setAppointments(data || [])
    } catch (error: any) {
      console.error('Error fetching appointments:', error)
      setError('Erro ao carregar agendamentos')
    }
  }

  const refreshTreatmentHistory = async () => {
    if (!patient) return

    try {
      const { data, error } = await supabase
        .from('treatment_history')
        .select('*')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setTreatmentHistory(data || [])
    } catch (error: any) {
      console.error('Error fetching treatment history:', error)
      setError('Erro ao carregar histórico de tratamentos')
    }
  }

  const refreshDocuments = async () => {
    if (!patient) return

    try {
      const { data, error } = await supabase
        .from('patient_documents')
        .select('*')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setDocuments(data || [])
    } catch (error: any) {
      console.error('Error fetching documents:', error)
      setError('Erro ao carregar documentos')
    }
  }

  const refreshAll = async () => {
    if (!patient) return

    setIsLoading(true)
    setError(null)

    try {
      await Promise.all([
        refreshAppointments(),
        refreshTreatmentHistory(),
        refreshDocuments()
      ])
    } catch (error: any) {
      console.error('Error refreshing patient data:', error)
      setError('Erro ao carregar dados do paciente')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    appointments,
    treatmentHistory,
    documents,
    isLoading,
    error,
    refreshAppointments,
    refreshTreatmentHistory,
    refreshDocuments,
    refreshAll
  }
}
