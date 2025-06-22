import { createClient } from '@/lib/supabase/server'
import { ClientForm } from '@/components/dashboard/clients/client-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface EditClientPageProps {
  params: {
    id: string
  }
}

export default async function EditarClientePage({ params }: EditClientPageProps) {
  const supabase = createClient()
  
  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Acesso negado</div>
  }

  // Buscar dados do cliente
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !client) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header da página */}
      <div className="flex items-center space-x-4">
        <Link href={`/dashboard/clientes/${params.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Cliente</h1>
          <p className="text-muted-foreground">
            Atualize as informações de {client.full_name}
          </p>
        </div>
      </div>

      {/* Formulário de cliente */}
      <div className="max-w-2xl">
        <ClientForm mode="edit" client={client} />
      </div>
    </div>
  )
}
