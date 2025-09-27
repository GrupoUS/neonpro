import { useCallback, useState } from 'react'

export interface SpecialRequirements {
  specialRequirements: string[]
  newRequirement: string
  setNewRequirement: (requirement: string) => void
  handleAddRequirement: () => void
  handleRemoveRequirement: (index: number) => void
}

export function useSpecialRequirements(): SpecialRequirements {
  const [specialRequirements, setSpecialRequirements] = useState<string[]>([])
  const [newRequirement, setNewRequirement] = useState('')

  const handleAddRequirement = useCallback(() => {
    if (newRequirement.trim()) {
      setSpecialRequirements(prev => [...prev, newRequirement.trim()])
      setNewRequirement('')
    }
  }, [newRequirement])

  const handleRemoveRequirement = useCallback((index: number) => {
    setSpecialRequirements(prev => prev.filter((_, i) => i !== index))
  }, [])

  return {
    specialRequirements,
    newRequirement,
    setNewRequirement,
    handleAddRequirement,
    handleRemoveRequirement
  }
}
