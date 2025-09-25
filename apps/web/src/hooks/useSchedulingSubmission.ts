/**
 * Hook for managing form submission in MultiSessionScheduler
 * KISS: avoid importing router types; use a minimal TRPC client shim.
 */
import { trpcClient } from '@/lib/trpcClient'
import {
  type AestheticSchedulingResponse,
  type MultiSessionSchedulingRequest,
} from '@/types/aesthetic-scheduling'
import { MultiSessionSchedulingSchema } from '@/types/aesthetic-scheduling'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface UseSchedulingSubmissionReturn {
  scheduleMutation: ReturnType<
    typeof useMutation<AestheticSchedulingResponse, Error, MultiSessionSchedulingRequest>
  >
  isSubmitting: boolean
  handleSubmit: (data: MultiSessionSchedulingRequest) => Promise<void>
  handleSubmitWrapper: (e: React.FormEvent, data: MultiSessionSchedulingRequest) => Promise<void>
}

export function useSchedulingSubmission(
  patientId: string,
  onSuccess?: (response: AestheticSchedulingResponse) => void,
  onError?: (error: Error) => void,
): UseSchedulingSubmissionReturn {
  const queryClient = useQueryClient()

  const scheduleMutation = useMutation<
    AestheticSchedulingResponse,
    Error,
    MultiSessionSchedulingRequest
  >({
    mutationFn: async (input: MultiSessionSchedulingRequest) => {
      // Minimal client call; replace with real path when API stabilizes
      const result = await trpcClient.mutation('aestheticScheduling.scheduleProcedures', input)
      return result as AestheticSchedulingResponse
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['patients', patientId] })
      onSuccess?.(data)
    },
    onError: error => {
      onError?.(error)
    },
  })

  const handleSubmit = async (data: MultiSessionSchedulingRequest) => {
    try {
      await MultiSessionSchedulingSchema.parseAsync(data)
      await scheduleMutation.mutateAsync(data)
    } catch (error) {
      onError?.(error as Error)
    }
  }

  const handleSubmitWrapper = async (e: React.FormEvent, data: MultiSessionSchedulingRequest) => {
    e.preventDefault()
    await handleSubmit(data)
  }

  return {
    scheduleMutation,
    isSubmitting: scheduleMutation.isPending ?? (scheduleMutation as any).isLoading,
    handleSubmit,
    handleSubmitWrapper,
  }
}
