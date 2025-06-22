import { createClient } from '@/lib/supabase/server'
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
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  CreditCard
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface TransactionsListProps {
  limit?: number
  showHeader?: boolean
}

export async function TransactionsList({ limit = 10, showHeader = true }: TransactionsListProps) {
  const supabase = createClient()
  
  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          Você precisa estar logado para ver as transações.
        </AlertDescription>
      </Alert>
    )
  }

  // Buscar transações
  let query = supabase
    .from('financial_transactions')
    .select(`
      id,
      type,
      category,
      description,
      amount,
      payment_method,
      payment_status,
      transaction_date,
      due_date,
      paid_date,
      notes,
      created_at,
      clients (
        id,
        full_name
      ),
      appointments (
        id,
        start_time,
        services (
          id,
          name
        )
      )
    `)
    .eq('user_id', user.id)
    .order('transaction_date', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data: transactions, error } = await query

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Erro ao carregar transações: {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhuma transação</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece registrando sua primeira transação financeira.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR })
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      'pending': { variant: 'outline', label: 'Pendente' },
      'paid': { variant: 'default', label: 'Pago' },
      'partial': { variant: 'secondary', label: 'Parcial' },
      'cancelled': { variant: 'destructive', label: 'Cancelado' },
      'refunded': { variant: 'outline', label: 'Reembolsado' },
    }
    
    const statusInfo = statusMap[status] || { variant: 'outline', label: status }
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    )
  }

  const getPaymentMethodLabel = (method: string | null) => {
    const methodMap: Record<string, string> = {
      'cash': 'Dinheiro',
      'card': 'Cartão',
      'pix': 'PIX',
      'transfer': 'Transferência'
    }
    return method ? methodMap[method] || method : '-'
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Transações Recentes
            </CardTitle>
            <Link href="/dashboard/financeiro/transacoes">
              <Button variant="outline" size="sm">
                Ver todas
              </Button>
            </Link>
          </div>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction: any) => (
            <div
              key={transaction.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="flex items-center">
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                      )}
                      <h4 className="font-medium">
                        {transaction.description}
                      </h4>
                    </div>
                    {getStatusBadge(transaction.payment_status)}
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground space-x-4">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      {formatDate(transaction.transaction_date)}
                    </div>
                    
                    {transaction.payment_method && (
                      <div className="flex items-center">
                        <CreditCard className="mr-1 h-4 w-4" />
                        {getPaymentMethodLabel(transaction.payment_method)}
                      </div>
                    )}

                    {transaction.category && (
                      <div>
                        <Badge variant="outline" className="text-xs">
                          {transaction.category}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {transaction.clients?.full_name && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Cliente: {transaction.clients.full_name}
                    </div>
                  )}

                  {transaction.appointments?.services?.name && (
                    <div className="text-sm text-muted-foreground">
                      Serviço: {transaction.appointments.services.name}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                    {transaction.due_date && transaction.payment_status === 'pending' && (
                      <div className="text-xs text-muted-foreground">
                        Vence: {formatDate(transaction.due_date)}
                      </div>
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/financeiro/transacoes/${transaction.id}/editar`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {transaction.notes && (
                <div className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                  {transaction.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
