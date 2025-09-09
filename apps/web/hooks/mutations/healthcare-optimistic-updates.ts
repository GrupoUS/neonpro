/**
 * Healthcare Optimistic Updates
 * TanStack Query Integration Analysis and Optimization
 * 
 * Optimistic updates for healthcare operations with LGPD/ANVISA compliance
 */

import type { QueryClient } from '@tanstack/react-query'
import { patientQueries, appointmentQueries, professionalQueries } from '@/lib/queries/patient-queries'

// ============================================================================
// TYPES
// ============================================================================

interface OptimisticUpdateResult {
  rollback: () => void
  tempId?: string
}

// ============================================================================
// HEALTHCARE OPTIMISTIC UPDATES
// ============================================================================

/**
 * Healthcare-optimized optimistic updates
 * Implements safe optimistic updates with rollback capabilities
 */
export const healthcareOptimisticUpdates = {
  /**
   * Patient-related optimistic updates
   */
  patient: {
    /**
     * Optimistically update patient data
     */
    update: async (
      queryClient: QueryClient,
      patientId: string,
      updateData: any
    ): Promise<OptimisticUpdateResult> => {
      if (!patientId || !updateData) {
        throw new Error('Patient ID and update data are required')
      }

      const queryKey = ['patients', 'detail', patientId]
      const previousData = queryClient.getQueryData(queryKey)

      // Apply optimistic update
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old
        return { ...old, ...updateData }
      })

      // Return rollback function
      return {
        rollback: () => {
          queryClient.setQueryData(queryKey, previousData)
        }
      }
    },

    /**
     * Optimistically create new patient
     */
    create: async (
      queryClient: QueryClient,
      newPatient: any
    ): Promise<OptimisticUpdateResult> => {
      if (!newPatient) {
        throw new Error('Patient data is required')
      }

      const tempId = `temp-patient-${Date.now()}`
      const patientWithTempId = { ...newPatient, id: tempId }
      const listQueryKey = ['patients', 'list']

      // Store previous list data
      const previousListData = queryClient.getQueryData(listQueryKey)

      // Add to patient list optimistically
      queryClient.setQueryData(listQueryKey, (old: any) => {
        if (!old || !old.data) return old
        return {
          ...old,
          data: [patientWithTempId, ...old.data],
          total: (old.total || 0) + 1
        }
      })

      return {
        tempId,
        rollback: () => {
          queryClient.setQueryData(listQueryKey, previousListData)
        }
      }
    },

    /**
     * Optimistically delete patient
     */
    delete: async (
      queryClient: QueryClient,
      patientId: string
    ): Promise<OptimisticUpdateResult> => {
      if (!patientId) {
        throw new Error('Patient ID is required')
      }

      const detailQueryKey = ['patients', 'detail', patientId]
      const listQueryKey = ['patients', 'list']

      // Store previous data
      const previousDetailData = queryClient.getQueryData(detailQueryKey)
      const previousListData = queryClient.getQueryData(listQueryKey)

      // Remove from detail cache
      queryClient.setQueryData(detailQueryKey, undefined)

      // Remove from list cache
      queryClient.setQueryData(listQueryKey, (old: any) => {
        if (!old || !old.data) return old
        return {
          ...old,
          data: old.data.filter((patient: any) => patient.id !== patientId),
          total: Math.max((old.total || 0) - 1, 0)
        }
      })

      return {
        rollback: () => {
          queryClient.setQueryData(detailQueryKey, previousDetailData)
          queryClient.setQueryData(listQueryKey, previousListData)
        }
      }
    },

    /**
     * Optimistically add appointment to patient
     */
    addAppointment: async (
      queryClient: QueryClient,
      patientId: string,
      appointmentData: any
    ): Promise<OptimisticUpdateResult> => {
      if (!patientId || !appointmentData) {
        throw new Error('Patient ID and appointment data are required')
      }

      const patientAppointmentsKey = ['patients', patientId, 'appointments']
      const appointmentsListKey = ['appointments', 'list']

      // Store previous data
      const previousPatientAppointments = queryClient.getQueryData(patientAppointmentsKey)
      const previousAppointmentsList = queryClient.getQueryData(appointmentsListKey)

      // Add to patient appointments
      queryClient.setQueryData(patientAppointmentsKey, (old: any) => {
        if (!old) return [appointmentData]
        return [appointmentData, ...old]
      })

      // Add to general appointments list
      queryClient.setQueryData(appointmentsListKey, (old: any) => {
        if (!old || !old.data) return old
        return {
          ...old,
          data: [appointmentData, ...old.data],
          total: (old.total || 0) + 1
        }
      })

      return {
        rollback: () => {
          queryClient.setQueryData(patientAppointmentsKey, previousPatientAppointments)
          queryClient.setQueryData(appointmentsListKey, previousAppointmentsList)
        }
      }
    },

    /**
     * Optimistically update medical record
     */
    updateMedicalRecord: async (
      queryClient: QueryClient,
      patientId: string,
      medicalRecordData: any
    ): Promise<OptimisticUpdateResult> => {
      if (!patientId || !medicalRecordData) {
        throw new Error('Patient ID and medical record data are required')
      }

      const medicalRecordsKey = ['patients', patientId, 'medical-records']
      const previousData = queryClient.getQueryData(medicalRecordsKey)

      // Update medical records
      queryClient.setQueryData(medicalRecordsKey, (old: any) => {
        if (!old) return [medicalRecordData]
        
        const existingIndex = old.findIndex((record: any) => record.id === medicalRecordData.id)
        if (existingIndex >= 0) {
          // Update existing record
          const updated = [...old]
          updated[existingIndex] = { ...updated[existingIndex], ...medicalRecordData }
          return updated
        } else {
          // Add new record
          return [medicalRecordData, ...old]
        }
      })

      return {
        rollback: () => {
          queryClient.setQueryData(medicalRecordsKey, previousData)
        }
      }
    },
  },

  /**
   * Appointment-related optimistic updates
   */
  appointment: {
    /**
     * Optimistically update appointment
     */
    update: async (
      queryClient: QueryClient,
      appointmentId: string,
      updateData: any
    ): Promise<OptimisticUpdateResult> => {
      if (!appointmentId || !updateData) {
        throw new Error('Appointment ID and update data are required')
      }

      const queryKey = ['appointments', 'detail', appointmentId]
      const previousData = queryClient.getQueryData(queryKey)

      // Apply optimistic update
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old
        return { ...old, ...updateData }
      })

      return {
        rollback: () => {
          queryClient.setQueryData(queryKey, previousData)
        }
      }
    },

    /**
     * Optimistically create new appointment
     */
    create: async (
      queryClient: QueryClient,
      newAppointment: any
    ): Promise<OptimisticUpdateResult> => {
      if (!newAppointment) {
        throw new Error('Appointment data is required')
      }

      const tempId = `temp-appointment-${Date.now()}`
      const appointmentWithTempId = { ...newAppointment, id: tempId }
      
      const listQueryKey = ['appointments', 'list']
      const calendarQueryKey = ['appointments', 'calendar', newAppointment.date]

      // Store previous data
      const previousListData = queryClient.getQueryData(listQueryKey)
      const previousCalendarData = queryClient.getQueryData(calendarQueryKey)

      // Add to appointments list
      queryClient.setQueryData(listQueryKey, (old: any) => {
        if (!old || !old.data) return old
        return {
          ...old,
          data: [appointmentWithTempId, ...old.data],
          total: (old.total || 0) + 1
        }
      })

      // Add to calendar
      queryClient.setQueryData(calendarQueryKey, (old: any) => {
        if (!old) return [appointmentWithTempId]
        return [appointmentWithTempId, ...old]
      })

      return {
        tempId,
        rollback: () => {
          queryClient.setQueryData(listQueryKey, previousListData)
          queryClient.setQueryData(calendarQueryKey, previousCalendarData)
        }
      }
    },

    /**
     * Optimistically delete appointment
     */
    delete: async (
      queryClient: QueryClient,
      appointmentId: string,
      appointmentData: any
    ): Promise<OptimisticUpdateResult> => {
      if (!appointmentId) {
        throw new Error('Appointment ID is required')
      }

      const detailQueryKey = ['appointments', 'detail', appointmentId]
      const listQueryKey = ['appointments', 'list']
      const calendarQueryKey = ['appointments', 'calendar', appointmentData?.date]

      // Store previous data
      const previousDetailData = queryClient.getQueryData(detailQueryKey)
      const previousListData = queryClient.getQueryData(listQueryKey)
      const previousCalendarData = queryClient.getQueryData(calendarQueryKey)

      // Remove from caches
      queryClient.setQueryData(detailQueryKey, undefined)

      queryClient.setQueryData(listQueryKey, (old: any) => {
        if (!old || !old.data) return old
        return {
          ...old,
          data: old.data.filter((appointment: any) => appointment.id !== appointmentId),
          total: Math.max((old.total || 0) - 1, 0)
        }
      })

      if (appointmentData?.date) {
        queryClient.setQueryData(calendarQueryKey, (old: any) => {
          if (!old) return old
          return old.filter((appointment: any) => appointment.id !== appointmentId)
        })
      }

      return {
        rollback: () => {
          queryClient.setQueryData(detailQueryKey, previousDetailData)
          queryClient.setQueryData(listQueryKey, previousListData)
          if (appointmentData?.date) {
            queryClient.setQueryData(calendarQueryKey, previousCalendarData)
          }
        }
      }
    },
