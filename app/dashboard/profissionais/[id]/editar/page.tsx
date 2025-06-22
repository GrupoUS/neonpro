import { createClient } from '@/lib/supabase/server'
import { ProfessionalForm } from '@/components/dashboard/professionals/professional-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface EditarProfissionalPageProps {
  params: {
    id: string
  }
}

export default async function EditarProfissionalPage({ params }: EditarProfissionalPageProps) {
  const supabase = createClient()
  
  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Acesso negado</div>
  }

  // Buscar dados do profissional
  const { data: professional, error } = await supabase
    .from('professionals')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !professional) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header da página */}
      <div className="flex items-center space-x-4">
        <Link href={`/dashboard/profissionais/${params.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Profissional</h1>
          <p className="text-muted-foreground">
            Atualize as informações de {professional.name}
          </p>
        </div>
      </div>

      {/* Formulário de profissional */}
      <div className="max-w-4xl">
        <ProfessionalForm mode="edit" professional={professional} />
      </div>
    </div>
  )
}
