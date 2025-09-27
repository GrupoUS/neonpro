import { createFileRoute, useLoaderData } from '@tanstack/react-router'
// import { useQuery } from "@tanstack/react-query";
// import { api } from "@/lib/api";
import { ContraindicationAnalysis } from '@/components/ai-clinical-support/ContraindicationAnalysis'
import { logger } from '@/utils/logger.js'


// Define loader data type
interface ContraindicationAnalysisLoaderData {
  patientId: string
  procedureId?: string
  treatmentPlanId?: string
}

export const Route = createFileRoute('/aesthetic-scheduling/contraindications')({
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
  const loaderData = useLoaderData({ from: '/aesthetic-scheduling/contraindications/' })

  return (
    <ContraindicationAnalysis
      patientId={loaderData.patientId}
      procedureId={loaderData.procedureId}
      treatmentPlanId={loaderData.treatmentPlanId}
      onExportReport={async analysis => {
        try {
          // Implementation for exporting report
          await logger.warn('Exporting contraindication analysis:')
          return analysis
        } catch (error) {
          await logger.error('Error exporting report:')
          throw error
        }
      }}
    />
  )
}
