import { useCallback, useState } from 'react'
import type { MedicalProcedure, ProcedureCalculation } from '@neonpro/types'

export interface ProcedureSelection {
  selectedProcedures: string[]
  handleProcedureSelect: (procedureId: string, selected: boolean) => void
  getSelectedProceduresData: (procedures: MedicalProcedure[]) => MedicalProcedure[]
  getTotalEstimatedDuration: (procedures: MedicalProcedure[]) => number
  getTotalEstimatedCost: (procedures: MedicalProcedure[]) => number
  getProcedureCalculation: (procedures: MedicalProcedure[]) => ProcedureCalculation
}

export function useProcedureSelection(): ProcedureSelection {
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([])

  const handleProcedureSelect = useCallback((procedureId: string, selected: boolean) => {
    setSelectedProcedures(prev => {
      if (selected) {
        return [...prev, procedureId]
      } else {
        return prev.filter(id => id !== procedureId)
      }
    })
  }, [])

  const getSelectedProceduresData = useCallback((procedures: MedicalProcedure[]) => {
    return procedures.filter(procedure => selectedProcedures.includes(procedure.id))
  }, [selectedProcedures])

  const getTotalEstimatedDuration = useCallback((procedures: MedicalProcedure[]) => {
    const selected = getSelectedProceduresData(procedures)
    return selected.reduce((total, procedure) => total + procedure.duration, 0)
  }, [getSelectedProceduresData])

  const getTotalEstimatedCost = useCallback((procedures: MedicalProcedure[]) => {
    const selected = getSelectedProceduresData(procedures)
    return selected.reduce((total, procedure) => total + procedure.cost, 0)
  }, [getSelectedProceduresData])

  const getProcedureCalculation = useCallback((procedures: MedicalProcedure[]): ProcedureCalculation => {
    const selectedProceduresData = getSelectedProceduresData(procedures)
    return {
      totalDuration: getTotalEstimatedDuration(procedures),
      totalCost: getTotalEstimatedCost(procedures),
      procedureCount: selectedProceduresData.length,
      selectedProcedures: selectedProceduresData
    }
  }, [getSelectedProceduresData, getTotalEstimatedDuration, getTotalEstimatedCost])

  return {
    selectedProcedures,
    handleProcedureSelect,
    getSelectedProceduresData,
    getTotalEstimatedDuration,
    getTotalEstimatedCost,
    getProcedureCalculation
  }
}
