import { createClient } from '@/lib/supabase/server'
import { ServiceForm } from '@/components/dashboard/services/service-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface EditarServicoPageProps {
  params: {
    id: string
  }
}

export default async function EditarServicoPage({ params }: EditarServicoPageProps) {
  const supabase = createClient()
  
  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Acesso negado</div>
  }

  // Buscar dados do serviço
  const { data: service, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !service) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header da página */}
      <div className="flex items-center space-x-4">
        <Link href={`/dashboard/servicos/${params.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Serviço</h1>
          <p className="text-muted-foreground">
            Atualize as informações de {service.name}
          </p>
        </div>
      </div>

      {/* Formulário de serviço */}
      <div className="max-w-2xl">
        <ServiceForm mode="edit" service={service} />
      </div>
    </div>
  )
}
