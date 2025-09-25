/**
 * Hook for managing form submission in MultiSessionScheduler
 * KISS: avoid importing router types; use a minimal TRPC client shim.
 */
import { trpc } from '@/lib/trpc'
import {
  type AestheticSchedulingResponse,
  type MultiSessionSchedulingRequest,
} from '@/types/aesthetic-scheduling'
import { MultiSessionSchedulingSchema } from '@/types/aesthetic-scheduling'
import { useQueryClient } from '@tanstack/react-query'

interface UseSchedulingSubmissionReturn {
  scheduleMutation: ReturnType<typeof trpc.aestheticScheduling.scheduleProcedures.useMutation>
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

  const scheduleMutation = trpc.aestheticScheduling.scheduleProcedures.useMutation({
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
    isSubmitting: scheduleMutation.isPending,
    handleSubmit,
    handleSubmitWrapper,
  }
}
