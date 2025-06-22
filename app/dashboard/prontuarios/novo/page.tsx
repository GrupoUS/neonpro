import { createClient } from '@/lib/supabase/server'
import { MedicalRecordForm } from '@/components/dashboard/medical-records/medical-record-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface NovoProntuarioPageProps {
  searchParams: {
    cliente?: string
  }
}

export default async function NovoProntuarioPage({ 
  searchParams 
}: NovoProntuarioPageProps) {
  const supabase = createClient()
  
  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Acesso negado</div>
  }

  // Buscar clientes para o formulário
  const { data: clients } = await supabase
    .from('clients')
    .select('id, full_name, email, phone, birthdate')
    .eq('user_id', user.id)
    .order('full_name')

  // Cliente pré-selecionado se vier da URL
  const preselectedClient = searchParams.cliente 
    ? clients?.find(c => c.id === searchParams.cliente)
    : null

  return (
    <div className="space-y-6">
      {/* Header da página */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/prontuarios">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Prontuário</h1>
          <p className="text-muted-foreground">
            Crie um novo prontuário eletrônico para um cliente
          </p>
        </div>
      </div>

      {/* Formulário de prontuário */}
      <div className="max-w-4xl">
        <MedicalRecordForm 
          mode="create"
          clients={clients || []}
          preselectedClient={preselectedClient}
        />
      </div>
    </div>
  )
}
