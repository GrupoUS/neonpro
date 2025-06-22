import { createClient } from '@/lib/supabase/server'
import { ClientCard } from './client-card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users } from 'lucide-react'

export async function ClientsList() {
  const supabase = createClient()
  
  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          Você precisa estar logado para ver os clientes.
        </AlertDescription>
      </Alert>
    )
  }

  // Buscar clientes do usuário
  const { data: clients, error } = await supabase
    .from('clients')
    .select(`
      id,
      full_name,
      email,
      phone,
      birthdate,
      created_at,
      updated_at,
      profile_photo_url,
      notes
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Erro ao carregar clientes: {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  if (!clients || clients.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum cliente</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comece cadastrando seu primeiro cliente.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {clients.map((client) => (
        <ClientCard key={client.id} client={client} />
      ))}
    </div>
  )
}
