import { ProfessionalForm } from '@/components/dashboard/professionals/professional-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NovoProfissionalPage() {
  return (
    <div className="space-y-6">
      {/* Header da página */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/profissionais">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Profissional</h1>
          <p className="text-muted-foreground">
            Cadastre um novo membro da equipe
          </p>
        </div>
      </div>

      {/* Formulário de profissional */}
      <div className="max-w-4xl">
        <ProfessionalForm mode="create" />
      </div>
    </div>
  )
}
