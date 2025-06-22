import { ClientForm } from '@/components/dashboard/clients/client-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NovoClientePage() {
  return (
    <div className="space-y-6">
      {/* Header da página */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/clientes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Cliente</h1>
          <p className="text-muted-foreground">
            Cadastre um novo cliente no sistema
          </p>
        </div>
      </div>

      {/* Formulário de cliente */}
      <div className="max-w-2xl">
        <ClientForm mode="create" />
      </div>
    </div>
  )
}
