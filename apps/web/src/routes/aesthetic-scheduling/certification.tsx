import { CertificationValidator } from '@/components/aesthetic-scheduling/CertificationValidator'
import { apiClient as api } from '@/lib/api.ts'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { logger } from '@/utils/logger.ts'


export const Route = createFileRoute('/aesthetic-scheduling/certification')({
  component: CertificationValidatorPage,
  loader: () => {
    // Pre-load data for better UX
    return {
      professionals: api.aestheticScheduling.getProfessionals(),
      procedures: api.aestheticScheduling.getAestheticProcedures(),
    }
  },
})

function CertificationValidatorPage() {
  const { data: professionals } = useQuery({
    queryKey: ['professionals'],
    queryFn: () => api.aestheticScheduling.getProfessionals(),
  })

  const { data: procedures } = useQuery({
    queryKey: ['aesthetic-procedures'],
    queryFn: () => api.aestheticScheduling.getAestheticProcedures(),
  })

  return (
    <CertificationValidator
      professionals={professionals || []}
      procedures={procedures || []}
      onValidation={async data => {
        try {
          const result = await api.aestheticScheduling.validateProfessionalCertifications(data)
          return result
        } catch (error) {
          await logger.error('Error validating certifications:')
          throw error
        }
      }}
    />
  )
}
