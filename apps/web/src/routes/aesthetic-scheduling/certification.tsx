import { CertificationValidator } from '@/components/aesthetic-scheduling/CertificationValidator'
import { api } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'

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
          console.error('Error validating certifications:', error)
          throw error
        }
      }}
    />
  )
}
