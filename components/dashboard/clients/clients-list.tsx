'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ClientCard } from './client-card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users } from 'lucide-react'

export function ClientsList() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function loadClients() {
      try {
        const supabase = createClient()
        
        // Verificar autenticação
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (!currentUser) {
          setError('Você precisa estar logado para ver os clientes.')
          setLoading(false)
          return
        }

        setUser(currentUser)

        // Buscar clientes do usuário - simplified query for mock
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', currentUser.id)

        if (clientsError) {
          setError(`Erro ao carregar clientes: ${clientsError.message}`)
        } else {
          setClients(clientsData || [])
        }
      } catch (err: any) {
        setError(`Erro inesperado: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    loadClients()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-200 animate-pulse p-4 rounded-lg h-24"></div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          Você precisa estar logado para ver os clientes.
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
