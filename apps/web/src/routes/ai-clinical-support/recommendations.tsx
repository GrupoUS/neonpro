import { TreatmentRecommendationsDashboard } from '@/components/ai-clinical-support/TreatmentRecommendationsDashboard'
import { api } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import * as React from 'react'

// Define loader data type
interface TreatmentRecommendationsLoaderData {
  patientId: string
  assessmentId?: string
}

export const Route = createFileRoute('/ai-clinical-support/recommendations')({
  component: TreatmentRecommendationsPage,
  loader: async ({ search }) => {
    const patientId = search.patientId as string
    const assessmentId = search.assessmentId as string

    if (!patientId) {
      throw new Error('Patient ID is required')
    }

    return {
      patientId,
      assessmentId,
    } as TreatmentRecommendationsLoaderData
  },
})

function TreatmentRecommendationsPage() {
  const loaderData = useLoaderData({ from: '/ai-clinical-support/recommendations/' })

  const { data: _patient } = useQuery({
    queryKey: ['patient', loaderData.patientId],
    queryFn: () => api.patients.getById(loaderData.patientId),
  })

  return (
    <TreatmentRecommendationsDashboard
      patientId={loaderData.patientId}
      assessmentId={loaderData.assessmentId}
      onTreatmentPlanCreate={async recommendations => {
        try {
          const result = await api.aiClinicalSupport.createTreatmentPlan({
            patientId: loaderData.patientId,
            recommendations: recommendations.map(r => r.id),
            sourceAssessmentId: loaderData.assessmentId,
          })
          return result
        } catch (error) {
          console.error('Error creating treatment plan:', error)
          throw error
        }
      }}
    />
  )
}
