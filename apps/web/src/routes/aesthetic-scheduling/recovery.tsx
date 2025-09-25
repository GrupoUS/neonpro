import { RecoveryPlanning } from '@/components/aesthetic-scheduling/RecoveryPlanning'
import { api } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import * as React from 'react'

// Define loader data type
interface RecoveryPlanningLoaderData {
  procedures: string[]
  appointmentId?: string
  treatmentPlanId?: string
  patientId?: string
}

export const Route = createFileRoute('/aesthetic-scheduling/recovery')({
  component: RecoveryPlanningPage,
  loader: async ({ params: _params, search: _search }) => {
    // Get procedure IDs from URL parameters or search params
    const procedureIds = search.procedureIds?.split(',') || []
    const appointmentId = search.appointmentId as string
    const treatmentPlanId = search.treatmentPlanId as string
    const patientId = search.patientId as string

    return {
      procedures: procedureIds,
      appointmentId,
      treatmentPlanId,
      patientId,
    } as RecoveryPlanningLoaderData
  },
})

function RecoveryPlanningPage() {
  const loaderData = useLoaderData({ from: '/aesthetic-scheduling/recovery/' })

  const { data: _procedures } = useQuery({
    queryKey: ['aesthetic-procedures'],
    queryFn: () => api.aestheticScheduling.getAestheticProcedures(),
  })

  return (
    <RecoveryPlanning
      appointmentId={loaderData.appointmentId}
      treatmentPlanId={loaderData.treatmentPlanId}
      procedureIds={loaderData.procedures}
      patientId={loaderData.patientId}
      onRecoveryPlanCreate={async plan => {
        try {
          const result = await api.aestheticScheduling.createRecoveryPlan(plan)
          return result
        } catch (error) {
          console.error('Error creating recovery plan:', error)
          throw error
        }
      }}
    />
  )
}
