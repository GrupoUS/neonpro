import { PatientAssessmentForm } from '@/components/ai-clinical-support/PatientAssessmentForm'
import { apiClient as api } from '@/lib/api.ts'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { logger } from '@/utils/logger.ts'


// Define loader data type
interface PatientAssessmentLoaderData {
  patientId: string
  assessmentId?: string
}

export const Route = createFileRoute('/ai-clinical-support/assessment')({
  component: PatientAssessmentPage,
  loader: async ({ search }) => {
    const patientId = search.patientId as string
    const assessmentId = search.assessmentId as string

    if (!patientId) {
      throw new Error('Patient ID is required')
    }

    return {
      patientId,
      assessmentId,
    } as PatientAssessmentLoaderData
  },
})

function PatientAssessmentPage() {
  const loaderData = useLoaderData({ from: '/ai-clinical-support/assessment/' })

  const { data: patient } = useQuery({
    queryKey: ['patient', loaderData.patientId],
    queryFn: () => api.patients.getById(loaderData.patientId),
  })

  const { data: previousAssessments } = useQuery({
    queryKey: ['patient-assessments', loaderData.patientId],
    queryFn: () =>
      api.aiClinicalSupport.getPatientTreatmentHistory({
        patientId: loaderData.patientId,
        limit: 5,
      }),
  })

  return (
    <PatientAssessmentForm
      patientId={loaderData.patientId}
      assessmentId={loaderData.assessmentId}
      patientData={patient}
      previousAssessments={previousAssessments?.treatments}
      onSubmit={async assessmentData => {
        try {
          const result = await api.aiClinicalSupport.createPatientAssessment(assessmentData)
          return result
        } catch (error) {
          await logger.error('Error submitting patient assessment:')
          throw error
        }
      }}
    />
  )
}
