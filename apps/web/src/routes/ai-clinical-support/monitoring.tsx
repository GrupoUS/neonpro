import { ProgressMonitoring } from '@/components/ai-clinical-support/ProgressMonitoring'
import { api } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import * as React from 'react'

// Define loader data type
interface ProgressMonitoringLoaderData {
  patientId: string
  treatmentPlanId?: string
}

export const Route = createFileRoute('/ai-clinical-support/monitoring/')({
  component: ProgressMonitoringPage,
  loader: async ({ search }) => {
    const patientId = search.patientId as string
    const treatmentPlanId = search.treatmentPlanId as string

    if (!patientId) {
      throw new Error('Patient ID is required')
    }

    return {
      patientId,
      treatmentPlanId,
    } as ProgressMonitoringLoaderData
  },
})

function ProgressMonitoringPage() {
  const loaderData = useLoaderData({ from: '/ai-clinical-support/monitoring/' })

  const { data: _patient } = useQuery({
    queryKey: ['patient', loaderData.patientId],
    queryFn: () => api.patients.getById(loaderData.patientId),
  })

  const { data: treatmentPlans } = useQuery({
    queryKey: ['patient-treatment-plans', loaderData.patientId],
    queryFn: () => api.treatmentPlans.getByPatientId(loaderData.patientId),
  })

  return (
    <ProgressMonitoring
      patientId={loaderData.patientId}
      treatmentPlanId={loaderData.treatmentPlanId || treatmentPlans?.[0]?.id}
      onUpdateProgress={async (update) => {
        try {
          const result = await api.aiClinicalSupport.addProgressUpdate(update)
          return result
        } catch (error) {
          console.error('Error updating progress:', error)
          throw error
        }
      }}
    />
  )
}
