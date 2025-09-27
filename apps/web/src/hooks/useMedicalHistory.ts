import { useCallback, useState } from 'react'

export interface MedicalHistory {
  medicalHistory: {
    contraindications: string[]
    medications: string[]
    allergies: string[]
    isPregnant: boolean
  }
  newContraindication: string
  newMedication: string
  newAllergy: string
  setNewContraindication: (value: string) => void
  setNewMedication: (value: string) => void
  setNewAllergy: (value: string) => void
  updatePregnancyStatus: (status: boolean) => void
  handleAddContraindication: () => void
  handleRemoveContraindication: (index: number) => void
  handleAddMedication: () => void
  handleRemoveMedication: (index: number) => void
  handleAddAllergy: () => void
  handleRemoveAllergy: (index: number) => void
}

export function useMedicalHistory(): MedicalHistory {
  const [medicalHistory, setMedicalHistory] = useState({
    contraindications: [],
    medications: [],
    allergies: [],
    isPregnant: false
  })

  const [newContraindication, setNewContraindication] = useState('')
  const [newMedication, setNewMedication] = useState('')
  const [newAllergy, setNewAllergy] = useState('')

  const updatePregnancyStatus = useCallback((status: boolean) => {
    setMedicalHistory(prev => ({ ...prev, isPregnant: status }))
  }, [])

  const handleAddContraindication = useCallback(() => {
    if (newContraindication.trim()) {
      setMedicalHistory(prev => ({
        ...prev,
        contraindications: [...prev.contraindications, newContraindication.trim()]
      }))
      setNewContraindication('')
    }
  }, [newContraindication])

  const handleRemoveContraindication = useCallback((index: number) => {
    setMedicalHistory(prev => ({
      ...prev,
      contraindications: prev.contraindications.filter((_, i) => i !== index)
    }))
  }, [])

  const handleAddMedication = useCallback(() => {
    if (newMedication.trim()) {
      setMedicalHistory(prev => ({
        ...prev,
        medications: [...prev.medications, newMedication.trim()]
      }))
      setNewMedication('')
    }
  }, [newMedication])

  const handleRemoveMedication = useCallback((index: number) => {
    setMedicalHistory(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }))
  }, [])

  const handleAddAllergy = useCallback(() => {
    if (newAllergy.trim()) {
      setMedicalHistory(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }))
      setNewAllergy('')
    }
  }, [newAllergy])

  const handleRemoveAllergy = useCallback((index: number) => {
    setMedicalHistory(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }))
  }, [])

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
    handleRemoveAllergy
  }
}
