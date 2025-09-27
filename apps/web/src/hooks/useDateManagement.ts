import { useCallback, useState } from 'react'

export interface DateManagement {
  preferredDates: Date[]
  handleAddDate: (date: Date) => void
  handleRemoveDate: (date: Date) => void
}

export function useDateManagement(): DateManagement {
  const [preferredDates, setPreferredDates] = useState<Date[]>([])

  const handleAddDate = useCallback((date: Date) => {
    setPreferredDates(prev => {
      if (!prev.some(d => d.getTime() === date.getTime())) {
        return [...prev, date]
      }
      return prev
    })
  }, [])

  const handleRemoveDate = useCallback((date: Date) => {
    setPreferredDates(prev => prev.filter(d => d.getTime() !== date.getTime()))
  }, [])

  return {
    preferredDates,
    handleAddDate,
    handleRemoveDate
  }
}
