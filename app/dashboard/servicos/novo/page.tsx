import { ServiceForm } from '@/components/dashboard/services/service-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NovoServicoPage() {
  return (
    <div className="space-y-6">
      {/* Header da página */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/servicos">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Serviço</h1>
          <p className="text-muted-foreground">
            Cadastre um novo serviço oferecido pela clínica
          </p>
        </div>
      </div>

      {/* Formulário de serviço */}
      <div className="max-w-2xl">
        <ServiceForm mode="create" />
      </div>
    </div>
  )
}
