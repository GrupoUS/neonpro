import { createFileRoute } from '@tanstack/react-router'

function NewPatientPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Novo Paciente</h1>
      </div>
      <div className="text-center py-12">
        <p className="text-muted-foreground">Formulário de cadastro em desenvolvimento</p>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/patients/new')({
  component: NewPatientPage,
})