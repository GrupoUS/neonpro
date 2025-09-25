/**
 * Hook for managing form coordination in MultiSessionScheduler
 * Extracts form submission and data assembly logic
 */
import { type MultiSessionSchedulingRequest, type AestheticSchedulingResponse } from '@/types/aesthetic-scheduling'

interface UseSchedulingFormReturn {
  handleSubmitForm: (e: React.FormEvent, formData: {
    patientId: string
    selectedProcedures: string[]
    preferredDates: Date[]
    preferredProfessionals: string[]
    urgencyLevel: 'routine' | 'priority' | 'urgent'
    specialRequirements: string[]
    medicalHistory: {
      pregnancyStatus: string
      contraindications: string[]
      medications: string[]
      allergies: string[]
    }
  }) => Promise<void>
}

export function useSchedulingForm(
  onSuccess?: (response: AestheticSchedulingResponse) => void,
  onError?: (error: Error) => void,
): UseSchedulingFormReturn {
  const handleSubmitForm = async (
    e: React.FormEvent,
    formData: {
      patientId: string
      selectedProcedures: string[]
      preferredDates: Date[]
      preferredProfessionals: string[]
      urgencyLevel: 'routine' | 'priority' | 'urgent'
      specialRequirements: string[]
      medicalHistory: {
        pregnancyStatus: string
        contraindications: string[]
        medications: string[]
        allergies: string[]
      }
    }
  ) => {
    e.preventDefault()

    try {
      // Validate form data
      const requestData: MultiSessionSchedulingRequest = {
        patientId: formData.patientId,
        procedures: formData.selectedProcedures,
        preferredDates: formData.preferredDates,
        preferredProfessionals: formData.preferredProfessionals.length > 0
          ? formData.preferredProfessionals
          : undefined,
        urgencyLevel: formData.urgencyLevel,
        specialRequirements: formData.specialRequirements.length > 0 ? formData.specialRequirements : undefined,
        medicalHistory: {
          pregnancyStatus: formData.medicalHistory.pregnancyStatus,
          contraindications: formData.medicalHistory.contraindications.length > 0
            ? formData.medicalHistory.contraindications
            : undefined,
          medications: formData.medicalHistory.medications.length > 0
            ? formData.medicalHistory.medications
            : undefined,
          allergies: formData.medicalHistory.allergies.length > 0 ? formData.medicalHistory.allergies : undefined,
        },
      }

      // Note: The actual submission will be handled by the useSchedulingSubmission hook
      // This hook just handles data assembly and validation
      return requestData
    } catch (error) {
      onError?.(error as Error)
      throw error
    }
  }

  return {
    handleSubmitForm,
  }
}