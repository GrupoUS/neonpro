import { createClient } from '@/lib/supabase/server'
import { ServiceCard } from './service-card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Settings } from 'lucide-react'

export async function ServicesList() {
  const supabase = createClient()
  
  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          Você precisa estar logado para ver os serviços.
        </AlertDescription>
      </Alert>
    )
  }

  // Buscar serviços do usuário
  const { data: services, error } = await supabase
    .from('services')
    .select(`
      id,
      name,
      description,
      duration_minutes,
      price,
      category,
      is_active,
      created_at,
      updated_at
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Erro ao carregar serviços: {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  if (!services || services.length === 0) {
    return (
      <div className="text-center py-12">
        <Settings className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum serviço</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comece cadastrando o primeiro serviço da sua clínica.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  )
}
