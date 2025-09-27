import { useEffect, useState } from 'react'

export interface UseSchedulingDataReturn {
  proceduresData: any[] | null
  professionalsData: any[] | null
  proceduresLoading: boolean
  professionalsLoading: boolean
  error: string | null
}

export function useSchedulingData(): UseSchedulingDataReturn {
  const [proceduresData, setProceduresData] = useState<any[] | null>(null)
  const [professionalsData, setProfessionalsData] = useState<any[] | null>(null)
  const [proceduresLoading, setProceduresLoading] = useState(false)
  const [professionalsLoading, setProfessionalsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Mock data loading - replace with actual API calls
    setProceduresLoading(true)
    setProfessionalsLoading(true)

    setTimeout(() => {
      setProceduresData([])
      setProfessionalsData([])
      setProceduresLoading(false)
      setProfessionalsLoading(false)
    }, 100)
  }, [])

  return {
    proceduresData,
    professionalsData,
    proceduresLoading,
    professionalsLoading,
    error
  }
}
