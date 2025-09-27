import { TreatmentOutcomePredictor } from '@/components/ai-clinical-support/TreatmentOutcomePredictor'
import { apiClient as api } from '@/lib/api.js'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { logger } from '@/utils/logger.js'


// Define loader data type
interface TreatmentPredictionLoaderData {
  patientId: string
  treatmentPlanId?: string
  procedureIds?: string[]
}

export const Route = createFileRoute('/ai-clinical-support/predictions')({
  component: TreatmentPredictionPage,
  loader: async ({ search }) => {
    const patientId = search.patientId as string
    const treatmentPlanId = search.treatmentPlanId as string
    const procedureIds = search.procedureIds?.split(',') as string[]

    if (!patientId) {
      throw new Error('Patient ID is required')
    }

    return {
      patientId,
      treatmentPlanId,
      procedureIds,
    } as TreatmentPredictionLoaderData
  },
})

function TreatmentPredictionPage() {
  const loaderData = useLoaderData({ from: '/ai-clinical-support/predictions/' })

  const { data: _patient } = useQuery({
    queryKey: ['patient', loaderData.patientId],
    queryFn: () => api.patients.getById(loaderData.patientId),
  })

  const { data: _procedures } = useQuery({
    queryKey: ['aesthetic-procedures'],
    queryFn: () => api.aestheticScheduling.getAestheticProcedures(),
  })

  const { data: _treatmentHistory } = useQuery({
    queryKey: ['patient-treatment-history', loaderData.patientId],
    queryFn: () =>
      api.aiClinicalSupport.getPatientTreatmentHistory({
        patientId: loaderData.patientId,
        limit: 10,
      }),
  })

  return (
    <TreatmentOutcomePredictor
      patientId={loaderData.patientId}
      treatmentPlanId={loaderData.treatmentPlanId}
      procedureIds={loaderData.procedureIds}
      onPredictionUpdate={async prediction => {
        try {
          // Store prediction in local state or send to backend
          await logger.warn('Treatment prediction updated:')
          return prediction
        } catch (error) {
          await logger.error('Error updating prediction:')
          throw error
        }
      }}
    />
  )
}
