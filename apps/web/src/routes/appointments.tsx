import { createFileRoute } from '@tanstack/react-router'

function AppointmentsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Agendamentos</h1>
      </div>
      <div className="text-center py-12">
        <p className="text-muted-foreground">Funcionalidade em desenvolvimento</p>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/appointments')({
  component: AppointmentsPage,
})