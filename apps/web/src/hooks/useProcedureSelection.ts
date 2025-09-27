import { useCallback, useState } from 'react'

export interface ProcedureSelection {
  selectedProcedures: string[]
  handleProcedureSelect: (procedureId: string, selected: boolean) => void
  getSelectedProceduresData: (procedures: any[]) => any[]
  getTotalEstimatedDuration: (procedures: any[]) => number
  getTotalEstimatedCost: (procedures: any[]) => number
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

  const getSelectedProceduresData = useCallback((procedures: any[]) => {
    return procedures.filter(procedure => selectedProcedures.includes(procedure.id))
  }, [selectedProcedures])

  const getTotalEstimatedDuration = useCallback((procedures: any[]) => {
    const selected = getSelectedProceduresData(procedures)
    return selected.reduce((total, procedure) => total + (procedure.baseDuration || 0), 0)
  }, [getSelectedProceduresData])

  const getTotalEstimatedCost = useCallback((procedures: any[]) => {
    const selected = getSelectedProceduresData(procedures)
    return selected.reduce((total, procedure) => total + (procedure.basePrice || 0), 0)
  }, [getSelectedProceduresData])

  return {
    selectedProcedures,
    handleProcedureSelect,
    getSelectedProceduresData,
    getTotalEstimatedDuration,
    getTotalEstimatedCost
  }
}
