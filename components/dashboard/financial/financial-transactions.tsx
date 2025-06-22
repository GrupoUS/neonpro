'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  DollarSign,
  Calendar,
  User,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

interface Transaction {
  id: string
  start_time: string
  price_at_booking: number
  status: string
  clients: {
    id: string
    full_name: string
  } | null
  services: {
    id: string
    name: string
  } | null
}

export function FinancialTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Buscar agendamentos como transações financeiras
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          price_at_booking,
          status,
          clients (
            id,
            full_name
          ),
          services (
            id,
            name
          )
        `)
        .eq('user_id', user.id)
        .order('start_time', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Erro ao carregar transações:', error)
        return
      }

      setTransactions(data || [])
    } catch (error) {
      console.error('Erro ao carregar transações:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string; icon: any }> = {
      'completed': { variant: 'default', label: 'Pago', icon: CheckCircle },
      'confirmed': { variant: 'secondary', label: 'Confirmado', icon: Clock },
      'scheduled': { variant: 'outline', label: 'Agendado', icon: Clock },
      'cancelled': { variant: 'destructive', label: 'Cancelado', icon: XCircle },
      'no_show': { variant: 'destructive', label: 'Faltou', icon: XCircle },
    }
    
    const statusInfo = statusMap[status] || { variant: 'outline', label: status, icon: Clock }
    const IconComponent = statusInfo.icon
    
    return (
      <Badge variant={statusInfo.variant} className="flex items-center">
        <IconComponent className="mr-1 h-3 w-3" />
        {statusInfo.label}
      </Badge>
    )
  }

  const getTransactionIcon = (status: string) => {
    if (status === 'completed') {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    }
    return <TrendingDown className="h-4 w-4 text-gray-400" />
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse p-4 rounded-lg">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              Nenhuma transação
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Você ainda não possui transações registradas.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="mr-2 h-5 w-5" />
          Transações Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                {getTransactionIcon(transaction.status)}
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium">
                      {transaction.services?.name || 'Serviço não especificado'}
                    </h4>
                    {getStatusBadge(transaction.status)}
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground space-x-4">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      {formatDateTime(transaction.start_time)}
                    </div>
                    
                    {transaction.clients?.full_name && (
                      <div className="flex items-center">
                        <User className="mr-1 h-4 w-4" />
                        <Link 
                          href={`/dashboard/clientes/${transaction.clients.id}`}
                          className="hover:underline"
                        >
                          {transaction.clients.full_name}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className={`font-semibold ${
                    transaction.status === 'completed' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {formatCurrency(transaction.price_at_booking)}
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/agendamentos/${transaction.id}`}>
                        Ver agendamento
                      </Link>
                    </DropdownMenuItem>
                    
                    {transaction.status !== 'completed' && (
                      <DropdownMenuItem>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Marcar como pago
                      </DropdownMenuItem>
                    )}
                    
                    {transaction.clients?.id && (
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/clientes/${transaction.clients.id}`}>
                          Ver cliente
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
