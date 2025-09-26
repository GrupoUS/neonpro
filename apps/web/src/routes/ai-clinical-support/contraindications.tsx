import { ContraindicationAnalysis } from '@/components/ai-clinical-support/ContraindicationAnalysis'
import { apiClient as api } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { logger } from '@/utils/logger'


// Define loader data type
interface ContraindicationAnalysisLoaderData {
  patientId: string
  procedureId?: string
  treatmentPlanId?: string
}

export const Route = createFileRoute('/ai-clinical-support/contraindications')({
  component: ContraindicationAnalysisPage,
  loader: async ({ search }) => {
    const patientId = search.patientId as string
    const procedureId = search.procedureId as string
    const treatmentPlanId = search.treatmentPlanId as string

    if (!patientId) {
      throw new Error('Patient ID is required')
    }

    return {
      patientId,
      procedureId,
      treatmentPlanId,
    } as ContraindicationAnalysisLoaderData
  },
})

function ContraindicationAnalysisPage() {
  const loaderData = useLoaderData({ from: '/ai-clinical-support/contraindications/' })

  const { data: _patient } = useQuery({
    queryKey: ['patient', loaderData.patientId],
    queryFn: () => api.patients.getById(loaderData.patientId),
  })

  const { data: _procedures } = useQuery({
    queryKey: ['aesthetic-procedures'],
    queryFn: () => api.aestheticScheduling.getAestheticProcedures(),
  })

  return (
    <ContraindicationAnalysis
      patientId={loaderData.patientId}
      procedureId={loaderData.procedureId}
      treatmentPlanId={loaderData.treatmentPlanId}
      onExportReport={async analysis => {
        try {
          // Implementation for exporting contraindication analysis report
          const blob = new Blob([JSON.stringify(analysis, null, 2)], {
            type: 'application/json',
          })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `contraindication-analysis-${loaderData.patientId}-${
            new Date().toISOString().split('T')[0]
          }.json`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)

          return analysis
        } catch (error) {
          await logger.error('Error exporting contraindication analysis:')
          throw error
        }
      }}
    />
  )
}
