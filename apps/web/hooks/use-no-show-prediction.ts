'use client'

import type { RiskLevel, } from '@/components/no-show/risk-indicator'
import { useCallback, useEffect, useState, } from 'react'

export interface NoShowPrediction {
  appointmentId: string
  patientId: string
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  factors: string[]
  recommendation: string
  confidence: number
  lastUpdated: Date
}

export interface AppointmentWithPrediction {
  id: string
  patientId: string
  patientName: string
  appointmentDate: string
  appointmentTime: string
  type: string
  status: string
  prediction?: NoShowPrediction
  riskLevel?: RiskLevel
}

export interface UseNoShowPredictionOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  enableRealTime?: boolean
}

export interface UseNoShowPredictionReturn {
  predictions: NoShowPrediction[]
  loading: boolean
  error: string | null
  refreshPredictions: () => Promise<void>
  getPredictionForAppointment: (
    appointmentId: string,
  ) => NoShowPrediction | undefined
  calculateRiskLevel: (prediction: NoShowPrediction,) => RiskLevel
}

// Mock data para desenvolvimento
const mockPredictions: NoShowPrediction[] = [
  {
    appointmentId: '1',
    patientId: 'patient-1',
    riskScore: 75,
    riskLevel: 'high',
    factors: ['2 faltas anteriores', 'Consulta de rotina', 'Horário matinal',],
    recommendation: 'Contato de confirmação 48h antes da consulta',
    confidence: 0.85,
    lastUpdated: new Date(),
  },
  {
    appointmentId: '2',
    patientId: 'patient-2',
    riskScore: 25,
    riskLevel: 'medium',
    factors: ['Primeira consulta', 'Paciente jovem',],
    recommendation: 'Lembrete automático 24h antes',
    confidence: 0.72,
    lastUpdated: new Date(),
  },
]

export function useNoShowPrediction(
  options: UseNoShowPredictionOptions = {},
): UseNoShowPredictionReturn {
  const {
    autoRefresh = false,
    refreshInterval = 300_000, // 5 minutos
    enableRealTime = false,
  } = options

  const [predictions, setPredictions,] = useState<NoShowPrediction[]>([],)
  const [loading, setLoading,] = useState(true,)
  const [error, setError,] = useState<string | null>(null,)

  const fetchPredictions = useCallback(async () => {
    try {
      setLoading(true,)
      setError(null,)

      // Simular chamada à API
      await new Promise((resolve,) => setTimeout(resolve, 1000,))

      // Em produção, isso seria uma chamada real à API
      // const response = await fetch('/api/no-show/predictions');
      // const data = await response.json();

      setPredictions(mockPredictions,)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar previsões',
      )
    } finally {
      setLoading(false,)
    }
  }, [],)

  const refreshPredictions = useCallback(async () => {
    await fetchPredictions()
  }, [fetchPredictions,],)

  const getPredictionForAppointment = useCallback(
    (appointmentId: string,) => {
      return predictions.find((p,) => p.appointmentId === appointmentId)
    },
    [predictions,],
  )

  const calculateRiskLevel = useCallback(
    (prediction: NoShowPrediction,): RiskLevel => {
      const { riskScore, factors, recommendation, } = prediction

      let level: RiskLevel['level']
      if (riskScore >= 70) {
        level = 'critical'
      } else if (riskScore >= 50) {
        level = 'high'
      } else if (riskScore >= 30) {
        level = 'medium'
      } else {
        level = 'low'
      }

      return {
        level,
        score: riskScore,
        factors,
        recommendation,
      }
    },
    [],
  )

  // Carregar previsões iniciais
  useEffect(() => {
    fetchPredictions()
  }, [fetchPredictions,],)

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) {
      return
    }

    const interval = setInterval(() => {
      fetchPredictions()
    }, refreshInterval,)

    return () => clearInterval(interval,)
  }, [autoRefresh, refreshInterval, fetchPredictions,],)

  // Real-time updates (WebSocket simulation)
  useEffect(() => {
    if (!enableRealTime) {
      return
    }

    // Simular atualizações em tempo real
    const interval = setInterval(() => {
      setPredictions((prev,) =>
        prev.map((p,) => ({
          ...p,
          lastUpdated: new Date(),
          // Pequena variação no score para simular atualizações
          riskScore: Math.max(
            0,
            Math.min(100, p.riskScore + (Math.random() - 0.5) * 5,),
          ),
        }))
      )
    }, 30_000,) // Atualizar a cada 30 segundos

    return () => clearInterval(interval,)
  }, [enableRealTime,],)

  return {
    predictions,
    loading,
    error,
    refreshPredictions,
    getPredictionForAppointment,
    calculateRiskLevel,
  }
}

// Hook para appointments com previsões integradas
export function useEnhancedAppointments() {
  const { predictions, loading, error, calculateRiskLevel, } = useNoShowPrediction({
    autoRefresh: true,
    enableRealTime: true,
  },)

  const [appointments, setAppointments,] = useState<AppointmentWithPrediction[]>(
    [],
  )
  const [appointmentsLoading, setAppointmentsLoading,] = useState(true,)

  // Mock appointments data
  const mockAppointments: AppointmentWithPrediction[] = [
    {
      id: '1',
      patientId: 'patient-1',
      patientName: 'Maria Silva',
      appointmentDate: '2024-01-15',
      appointmentTime: '09:00',
      type: 'Consulta de Rotina',
      status: 'scheduled',
    },
    {
      id: '2',
      patientId: 'patient-2',
      patientName: 'João Santos',
      appointmentDate: '2024-01-15',
      appointmentTime: '10:30',
      type: 'Primeira Consulta',
      status: 'scheduled',
    },
    {
      id: '3',
      patientId: 'patient-3',
      patientName: 'Ana Costa',
      appointmentDate: '2024-01-15',
      appointmentTime: '14:00',
      type: 'Retorno',
      status: 'scheduled',
    },
  ]

  useEffect(() => {
    // Simular carregamento de appointments
    const loadAppointments = async () => {
      setAppointmentsLoading(true,)
      await new Promise((resolve,) => setTimeout(resolve, 800,))

      // Combinar appointments com previsões
      const enhancedAppointments = mockAppointments.map((appointment,) => {
        const prediction = predictions.find(
          (p,) => p.appointmentId === appointment.id,
        )
        const riskLevel = prediction
          ? calculateRiskLevel(prediction,)
          : undefined

        return {
          ...appointment,
          prediction,
          riskLevel,
        }
      },)

      setAppointments(enhancedAppointments,)
      setAppointmentsLoading(false,)
    }

    loadAppointments()
  }, [predictions, calculateRiskLevel,],)

  return {
    appointments,
    loading: loading || appointmentsLoading,
    error,
    predictions,
    refreshData: async () => {
      // Refresh both appointments and predictions
      setAppointmentsLoading(true,)
      await new Promise((resolve,) => setTimeout(resolve, 500,))
      setAppointmentsLoading(false,)
    },
  }
}

// Utility functions
export const noShowPredictionUtils = {
  formatRiskScore: (score: number,): string => {
    return `${score.toFixed(1,)}%`
  },

  getRiskColor: (level: string,): string => {
    switch (level) {
      case 'critical':
        return 'text-red-600'
      case 'high':
        return 'text-orange-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  },

  shouldSendReminder: (prediction: NoShowPrediction,): boolean => {
    return prediction.riskScore >= 30
  },

  getRecommendedAction: (prediction: NoShowPrediction,): string => {
    if (prediction.riskScore >= 70) {
      return 'Contato telefônico obrigatório'
    } else if (prediction.riskScore >= 50) {
      return 'Confirmação por WhatsApp'
    } else if (prediction.riskScore >= 30) {
      return 'Lembrete automático'
    }
    return 'Acompanhamento padrão'
  },
}

export default useNoShowPrediction
