/**
 * Hook for managing medical history in MultiSessionScheduler
 */
import { type PregnancyStatus } from '@/types/aesthetic-scheduling'
import { useState } from 'react'

interface MedicalHistoryState {
  pregnancyStatus: PregnancyStatus
  contraindications: string[]
  medications: string[]
  allergies: string[]
}

interface UseMedicalHistoryReturn {
  medicalHistory: MedicalHistoryState
  newContraindication: string
  newMedication: string
  newAllergy: string
  setNewContraindication: (value: string) => void
  setNewMedication: (value: string) => void
  setNewAllergy: (value: string) => void
  updatePregnancyStatus: (status: PregnancyStatus) => void
  handleAddContraindication: () => void
  handleRemoveContraindication: (contraindication: string) => void
  handleAddMedication: () => void
  handleRemoveMedication: (medication: string) => void
  handleAddAllergy: () => void
  handleRemoveAllergy: (allergy: string) => void
}

export function useMedicalHistory(): UseMedicalHistoryReturn {
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryState>({
    pregnancyStatus: 'none' as const,
    contraindications: [] as string[],
    medications: [] as string[],
    allergies: [] as string[],
  })

  const [newContraindication, setNewContraindication] = useState('')
  const [newMedication, setNewMedication] = useState('')
  const [newAllergy, setNewAllergy] = useState('')

  const updatePregnancyStatus = (status: PregnancyStatus) => {
    setMedicalHistory({ ...medicalHistory, pregnancyStatus: status })
  }

  const handleAddContraindication = () => {
    if (
      newContraindication.trim()
      && !medicalHistory.contraindications.includes(newContraindication.trim())
    ) {
      setMedicalHistory({
        ...medicalHistory,
        contraindications: [...medicalHistory.contraindications, newContraindication.trim()],
      })
      setNewContraindication('')
    }
  }

  const handleRemoveContraindication = (contraindication: string) => {
    setMedicalHistory({
      ...medicalHistory,
      contraindications: medicalHistory.contraindications.filter((cont) =>
        cont !== contraindication
      ),
    })
  }

  const handleAddMedication = () => {
    if (newMedication.trim() && !medicalHistory.medications.includes(newMedication.trim())) {
      setMedicalHistory({
        ...medicalHistory,
        medications: [...medicalHistory.medications, newMedication.trim()],
      })
      setNewMedication('')
    }
  }

  const handleRemoveMedication = (medication: string) => {
    setMedicalHistory({
      ...medicalHistory,
      medications: medicalHistory.medications.filter((med) => med !== medication),
    })
  }

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !medicalHistory.allergies.includes(newAllergy.trim())) {
      setMedicalHistory({
        ...medicalHistory,
        allergies: [...medicalHistory.allergies, newAllergy.trim()],
      })
      setNewAllergy('')
    }
  }

  const handleRemoveAllergy = (allergy: string) => {
    setMedicalHistory({
      ...medicalHistory,
      allergies: medicalHistory.allergies.filter((all) => all !== allergy),
    })
  }

  return {
    medicalHistory,
    newContraindication,
    newMedication,
    newAllergy,
    setNewContraindication,
    setNewMedication,
    setNewAllergy,
    updatePregnancyStatus,
    handleAddContraindication,
    handleRemoveContraindication,
    handleAddMedication,
    handleRemoveMedication,
    handleAddAllergy,
    handleRemoveAllergy,
  }
}
