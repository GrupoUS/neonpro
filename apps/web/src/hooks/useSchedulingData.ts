/**
 * Hook for managing scheduling data queries in MultiSessionScheduler
 * Extracts tRPC queries for procedures and professionals
 */
import { trpc } from '@/lib/trpc'
import { type AestheticProcedure } from '@/types/aesthetic-scheduling'

interface UseSchedulingDataReturn {
  proceduresData: AestheticProcedure[] | undefined
  professionalsData: any[] | undefined
  proceduresLoading: boolean
  professionalsLoading: boolean
  checkContraindicationsMutation: ReturnType<typeof trpc.aestheticScheduling.checkContraindications.useMutation>
}

export function useSchedulingData(): UseSchedulingDataReturn {
  // Fetch available procedures
  const { data: proceduresData, isLoading: proceduresLoading } = trpc.aestheticScheduling
    .getAestheticProcedures.useQuery(
      { limit: 100, offset: 0 },
      {
        select: data => data.procedures || [],
      },
    )

  // Fetch available professionals
  const { data: professionalsData, isLoading: professionalsLoading } = trpc
    .enhancedAestheticProfessionals.getProfessionals.useQuery()

  // Check contraindications mutation
  const checkContraindicationsMutation = trpc.aestheticScheduling.checkContraindications
    .useMutation()

  return {
    proceduresData,
    professionalsData,
    proceduresLoading,
    professionalsLoading,
    checkContraindicationsMutation,
  }
}