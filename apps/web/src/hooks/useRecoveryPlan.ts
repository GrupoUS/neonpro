/**
 * Hook personalizado para gerenciar planos de recuperação estética
 * Integra com React Query para cache otimizado e estado global
 */

import { apiClient as api } from '@/lib/api.ts'
import type { RecoveryPlan } from '@/types/aesthetic-scheduling.ts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface UseRecoveryPlanOptions {
  procedureId?: string
  treatmentPlanId?: string
  patientId?: string
  appointmentId?: string
}

interface CreateRecoveryPlanData extends Partial<RecoveryPlan> {
  patientId: string
}

export function useRecoveryPlan(options: UseRecoveryPlanOptions = {}) {
  const queryClient = useQueryClient()
  const { procedureId, treatmentPlanId, patientId, appointmentId } = options

  // Query key factory para cache consistente
  const getQueryKey = (params: UseRecoveryPlanOptions) =>
    [
      'recovery-plan',
      params.procedureId,
      params.treatmentPlanId,
      params.patientId,
      params.appointmentId,
    ].filter(Boolean)

  // Query para buscar plano de recuperação
  const recoveryPlanQuery = useQuery({
    queryKey: getQueryKey(options),
    queryFn: async () => {
      if (!procedureId && !treatmentPlanId) {
        return null
      }

      return api.aestheticScheduling.getRecoveryPlan({
        procedureId: procedureId || '',
        treatmentPlanId: treatmentPlanId || '',
        patientId,
      })
    },
    enabled: !!(procedureId || treatmentPlanId),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })

  // Mutation para criar plano de recuperação
  const createRecoveryPlanMutation = useMutation({
    mutationFn: async (data: CreateRecoveryPlanData) => {
      return api.aestheticScheduling.createRecoveryPlan(data)
    },
    onSuccess: (newPlan, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({
        queryKey: ['recovery-plan'],
      })

      // Atualizar cache específico se possível
      const cacheKey = getQueryKey({
        procedureId: variables.procedureId,
        treatmentPlanId: options.treatmentPlanId,
        patientId: variables.patientId,
        appointmentId: variables.appointmentId,
      })

      queryClient.setQueryData(cacheKey, newPlan)

      // Invalidar queries de appointments relacionados
      if (variables.appointmentId) {
        queryClient.invalidateQueries({
          queryKey: ['appointments', variables.appointmentId],
        })
      }

      // Invalidar queries de paciente
      if (variables.patientId) {
        queryClient.invalidateQueries({
          queryKey: ['patients', variables.patientId],
        })
      }
    },
    onError: error => {
      console.error('Erro ao criar plano de recuperação:', error)
    },
  })

  // Mutation para atualizar plano de recuperação
  const updateRecoveryPlanMutation = useMutation({
    mutationFn: async (data: Partial<RecoveryPlan> & { id: string }) => {
      // Implementar quando o endpoint de update estiver disponível
      return api.aestheticScheduling.createRecoveryPlan(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['recovery-plan'],
      })
    },
  })

  // Função helper para refetch
  const refetchRecoveryPlan = () => {
    return recoveryPlanQuery.refetch()
  }

  // Função helper para criar plano com dados padrão
  const createRecoveryPlan = async (customData: Partial<CreateRecoveryPlanData> = {}) => {
    if (!patientId) {
      throw new Error('patientId é obrigatório para criar plano de recuperação')
    }

    const defaultData: CreateRecoveryPlanData = {
      patientId,
      appointmentId,
      procedureId,
      recoveryPeriodDays: 14,
      careLevel: 'medium',
      activityRestrictions: [],
      careInstructions: [],
      emergencyContacts: [],
      ...customData,
    }

    return createRecoveryPlanMutation.mutateAsync(defaultData)
  }

  // Função helper para invalidar cache
  const invalidateRecoveryPlan = () => {
    queryClient.invalidateQueries({
      queryKey: getQueryKey(options),
    })
  }

  // Estado derivado
  const isLoading = recoveryPlanQuery.isLoading
  const isError = recoveryPlanQuery.isError
  const error = recoveryPlanQuery.error
  const data = recoveryPlanQuery.data
  const isCreating = createRecoveryPlanMutation.isPending
  const isUpdating = updateRecoveryPlanMutation.isPending

  // Funções de conveniência
  const hasRecoveryPlan = !!data
  const isReadyToCreate = !!(patientId && (procedureId || treatmentPlanId))

  return {
    // Dados
    recoveryPlan: data,
    hasRecoveryPlan,

    // Estados
    isLoading,
    isError,
    error,
    isCreating,
    isUpdating,
    isReadyToCreate,

    // Mutations
    createRecoveryPlan,
    updateRecoveryPlan: updateRecoveryPlanMutation.mutate,

    // Utilities
    refetch: refetchRecoveryPlan,
    invalidate: invalidateRecoveryPlan,

    // Query direta (para casos avançados)
    query: recoveryPlanQuery,
    createMutation: createRecoveryPlanMutation,
    updateMutation: updateRecoveryPlanMutation,
  }
}

// Hook complementar para listar planos de recuperação de um paciente
export function usePatientRecoveryPlans(patientId?: string) {
  const queryClient = useQueryClient()

  const recoveryPlansQuery = useQuery({
    queryKey: ['recovery-plans', 'patient', patientId],
    queryFn: async () => {
      if (!patientId) return []

      // Implementar endpoint para listar planos de um paciente
      // Por enquanto retorna array vazio
      return []
    },
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  })

  const invalidatePatientPlans = () => {
    queryClient.invalidateQueries({
      queryKey: ['recovery-plans', 'patient', patientId],
    })
  }

  return {
    recoveryPlans: recoveryPlansQuery.data || [],
    isLoading: recoveryPlansQuery.isLoading,
    isError: recoveryPlansQuery.isError,
    error: recoveryPlansQuery.error,
    refetch: recoveryPlansQuery.refetch,
    invalidate: invalidatePatientPlans,
  }
}

// Hook para estatísticas e métricas de recuperação
export function useRecoveryPlanMetrics(clinicId?: string) {
  const metricsQuery = useQuery({
    queryKey: ['recovery-plan-metrics', clinicId],
    queryFn: async () => {
      // Mock de métricas - implementar endpoint quando disponível
      return {
        totalPlans: 0,
        activeRecoveries: 0,
        completedRecoveries: 0,
        averageRecoveryTime: 14,
        complianceRate: 0.95,
      }
    },
    enabled: !!clinicId,
    staleTime: 10 * 60 * 1000, // 10 minutos
  })

  return {
    metrics: metricsQuery.data,
    isLoading: metricsQuery.isLoading,
    isError: metricsQuery.isError,
    error: metricsQuery.error,
    refetch: metricsQuery.refetch,
  }
}

export default useRecoveryPlan
