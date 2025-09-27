import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: DashboardRedirect,
})

function DashboardRedirect() {
  // Redireciona para o dashboard completo com barra final
  return <Navigate to="/dashboard/" replace />
}
