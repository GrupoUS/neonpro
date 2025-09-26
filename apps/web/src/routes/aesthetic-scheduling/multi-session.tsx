import { MultiSessionScheduler } from '@/components/aesthetic-scheduling/MultiSessionScheduler'
import { api } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { logger } from '@/utils/logger'


export const Route = createFileRoute('/aesthetic-scheduling/multi-session')({
  component: MultiSessionSchedulerPage,
  loader: () => {
    // Pre-load data for better UX
    return {
      procedures: api.aestheticScheduling.getAestheticProcedures(),
      professionals: api.aestheticScheduling.getProfessionals(),
    }
  },
})

function MultiSessionSchedulerPage() {
  const { data: procedures } = useQuery({
    queryKey: ['aesthetic-procedures'],
    queryFn: () => api.aestheticScheduling.getAestheticProcedures(),
  })

  const { data: professionals } = useQuery({
    queryKey: ['professionals'],
    queryFn: () => api.aestheticScheduling.getProfessionals(),
  })

  return (
    <MultiSessionScheduler
      procedures={procedures || []}
      professionals={professionals || []}
      onSchedule={async data => {
        try {
          const result = await api.aestheticScheduling.scheduleProcedures(data)
          return result
        } catch (error) {
          await logger.error('Error scheduling procedures:')
          throw error
        }
      }}
    />
  )
}
