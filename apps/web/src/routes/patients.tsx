import { createFileRoute, Outlet, } from '@tanstack/react-router'
import { authGuards, } from '../lib/auth-utils'

function PatientsLayout() {
  return (
    <div className="container mx-auto py-6">
      <Outlet />
    </div>
  )
}

export const Route = createFileRoute('/patients',)({
  component: PatientsLayout,
  beforeLoad: authGuards.requireAuth,
},)
