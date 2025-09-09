import { PatientsList, } from '@/components/patients-list'
import { createFileRoute, } from '@tanstack/react-router'
import { authGuards, } from '../../lib/auth-utils'

function PatientsIndexPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Pacientes</h1>
      </div>
      <PatientsList />
    </div>
  )
}

export const Route = createFileRoute('/patients/',)({
  component: PatientsIndexPage,
  beforeLoad: authGuards.requireAuth,
},)
