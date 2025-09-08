import { ANVISAControlledSubstancesService, } from '@/lib/compliance/anvisa-controlled-substances'
import type { ANVISASubstance, ControlledPrescription, } from '@/types/compliance'
import { useEffect, useState, } from 'react'

// Mock data for prescriptions (temporary until backend integration)
const mockPrescriptions: ControlledPrescription[] = [
  {
    id: 'RX001',
    substanceId: 'sub_001',
    patientId: 'pat_001',
    prescriberId: 'doc_001',
    quantity: 30,
    dosage: '10mg',
    instructions: '1 comprimido a cada 8 horas',
    issueDate: new Date('2024-01-15',),
    expiryDate: new Date('2024-02-15',),
    status: 'active',
    notificationNumber: 'NOT001',
    createdAt: new Date('2024-01-15',),
    updatedAt: new Date('2024-01-15',),
  },
  {
    id: 'RX002',
    substanceId: 'sub_002',
    patientId: 'pat_002',
    prescriberId: 'doc_002',
    quantity: 60,
    dosage: '5mg',
    instructions: '1 comprimido pela manhã',
    issueDate: new Date('2024-01-10',),
    expiryDate: new Date('2024-01-10',),
    status: 'expired',
    notificationNumber: 'NOT002',
    createdAt: new Date('2024-01-10',),
    updatedAt: new Date('2024-01-10',),
  },
]

export interface UseANVISADataReturn {
  substances: ANVISASubstance[]
  prescriptions: ControlledPrescription[]
  loading: boolean
  error: string | null
  refreshData: () => Promise<void>
}

export const useANVISAData = (): UseANVISADataReturn => {
  const [substances, setSubstances,] = useState<ANVISASubstance[]>([],)
  const [prescriptions, setPrescriptions,] = useState<ControlledPrescription[]>([],)
  const [loading, setLoading,] = useState(true,)
  const [error, setError,] = useState<string | null>(null,)

  const loadData = async () => {
    try {
      setLoading(true,)
      setError(null,)

      // Load controlled substances
      const anvisaService = ANVISAControlledSubstancesService.getInstance()
      const substancesData = anvisaService.searchSubstances('',) // Get all substances
      setSubstances(substancesData,)

      // Load prescriptions (using mock data for now)
      setPrescriptions(mockPrescriptions,)
    } catch (err) {
      console.error('Error loading ANVISA data:', err,)
      setError('Erro ao carregar dados da ANVISA',)
    } finally {
      setLoading(false,)
    }
  }

  const refreshData = async () => {
    await loadData()
  }

  useEffect(() => {
    loadData()
  }, [],)

  return {
    substances,
    prescriptions,
    loading,
    error,
    refreshData,
  }
}
