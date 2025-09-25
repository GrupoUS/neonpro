/**
 * Hook for managing procedure selection in MultiSessionScheduler
 */
import { type AestheticProcedure } from '@/types/aesthetic-scheduling'
import { useState } from 'react'

interface UseProcedureSelectionReturn {
  selectedProcedures: string[]
  handleProcedureSelect: (procedureId: string, checked: boolean) => void
  getSelectedProceduresData: (procedures: AestheticProcedure[]) => AestheticProcedure[]
  getTotalEstimatedDuration: (procedures: AestheticProcedure[]) => number
  getTotalEstimatedCost: (procedures: AestheticProcedure[]) => number
}

export function useProcedureSelection(): UseProcedureSelectionReturn {
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([])

  const handleProcedureSelect = (procedureId: string, checked: boolean) => {
    if (checked) {
      setSelectedProcedures([...selectedProcedures, procedureId])
    } else {
      setSelectedProcedures(selectedProcedures.filter(id => id !== procedureId))
    }
  }

  const getSelectedProceduresData = (procedures: AestheticProcedure[]) => {
    return procedures.filter((p: AestheticProcedure) => selectedProcedures.includes(p.id))
  }

  const getTotalEstimatedDuration = (procedures: AestheticProcedure[]) => {
    const selectedProceduresData = getSelectedProceduresData(procedures)
    return selectedProceduresData.reduce(
      (total: number, proc: AestheticProcedure) => total + proc.baseDuration,
      0,
    )
  }

  const getTotalEstimatedCost = (procedures: AestheticProcedure[]) => {
    const selectedProceduresData = getSelectedProceduresData(procedures)
    return selectedProceduresData.reduce(
      (total: number, proc: AestheticProcedure) => total + proc.basePrice,
      0,
    )
  }

  return {
    selectedProcedures,
    handleProcedureSelect,
    getSelectedProceduresData,
    getTotalEstimatedDuration,
    getTotalEstimatedCost,
  }
}
