// Hook for managing appointments in aesthetic clinic
import { useState, useEffect } from 'react'
import { Appointment, AppointmentStatus } from '../types'
import { AppointmentService } from '../services'

interface UseAppointmentsOptions {
  professionalId?: string
  patientId?: string
  status?: AppointmentStatus
  dateRange?: { start: Date; end: Date }
}

export function useAppointments(options: UseAppointmentsOptions = {}) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void fetchAppointments()
  }, [options.professionalId, options.patientId, options.status])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // This would be an actual API call
      // For now, simulate with placeholder data
      const baseAppointments: Appointment[] = []
      let filteredAppointments = baseAppointments
      
      // Apply filters
      if (options.professionalId) {
        filteredAppointments = filteredAppointments.filter(
          apt => apt.professionalId === options.professionalId
        )
      }
      
      if (options.patientId) {
        filteredAppointments = filteredAppointments.filter(
          apt => apt.patientId === options.patientId
        )
      }
      
      if (options.status) {
        filteredAppointments = filteredAppointments.filter(
          apt => apt.status === options.status
        )
      }
      
      setAppointments(filteredAppointments)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar agendamentos')
    } finally {
      setLoading(false)
    }
  }

  const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // API call to create appointment
      const newAppointment: Appointment = {
        ...appointmentData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      setAppointments(prev => [...prev, newAppointment])
      return newAppointment
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar agendamento')
      throw err
    }
  }

  const updateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus) => {
    try {
      // API call to update status
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status, updatedAt: new Date() }
            : apt
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status')
      throw err
    }
  }

  const deleteAppointment = async (appointmentId: string) => {
    try {
      // API call to delete appointment
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cancelar agendamento')
      throw err
    }
  }

  const getStats = () => {
    return AppointmentService.getAppointmentStats(appointments)
  }

  const getRevenue = () => {
    return AppointmentService.calculateRevenue(appointments)
  }

  return {
    appointments,
    loading,
    error,
    createAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    refetch: fetchAppointments,
    getStats,
    getRevenue
  }
}