/**
 * Hook for managing form submission in MultiSessionScheduler
 */
import { trpc } from '@/lib/trpc'
import {
  type AestheticSchedulingResponse,
  type MultiSessionSchedulingRequest,
} from '@/types/aesthetic-scheduling'
import { MultiSessionSchedulingSchema } from '@/types/aesthetic-scheduling'
import { useQueryClient } from '@tanstack/react-query'

interface UseSchedulingSubmissionReturn {
  scheduleMutation: any
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
    onSuccess: (data: AestheticSchedulingResponse) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['patients', patientId] })
      onSuccess?.(data)
    },
    onError: (error: Error) => {
      onError?.(error as Error)
    },
  })

  const handleSubmit = async (data: MultiSessionSchedulingRequest) => {
    try {
      await MultiSessionSchedulingSchema.parseAsync(data)
      scheduleMutation.mutate(data)
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
    isSubmitting: scheduleMutation.isLoading,
    handleSubmit,
    handleSubmitWrapper,
  }
}
