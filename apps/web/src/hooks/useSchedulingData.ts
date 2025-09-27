import { useState, useCallback } from 'react'

export interface SchedulingData {
  patientId: string
  professionalId: string
  procedureId: string
  dateTime: Date
  duration: number
  notes?: string
}

export interface UseSchedulingDataReturn {
  schedulingData: Partial<SchedulingData>
  updateSchedulingData: (data: Partial<SchedulingData>) => void
  resetSchedulingData: () => void
  isDataValid: boolean
}

export function useSchedulingData(): UseSchedulingDataReturn {
  const [schedulingData, setSchedulingData] = useState<Partial<SchedulingData>>({})

  const updateSchedulingData = useCallback((data: Partial<SchedulingData>) => {
    setSchedulingData(prev => ({ ...prev, ...data }))
  }, [])

  const resetSchedulingData = useCallback(() => {
    setSchedulingData({})
  }, [])

  const isDataValid = Boolean(
    schedulingData.patientId &&
    schedulingData.professionalId &&
    schedulingData.procedureId &&
    schedulingData.dateTime &&
    schedulingData.duration
  )

  return {
    schedulingData,
    updateSchedulingData,
    resetSchedulingData,
    isDataValid
  }
}