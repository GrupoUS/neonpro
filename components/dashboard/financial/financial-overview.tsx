import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export async function FinancialOverview() {
  const supabase = createClient()
  
  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Acesso negado</div>
  }

  // Buscar dados financeiros do mês atual
  const currentMonth = new Date()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

  const { data: transactions, error } = await supabase
    .from('financial_transactions')
    .select('*')
    .eq('user_id', user.id)
    .gte('transaction_date', firstDayOfMonth.toISOString().split('T')[0])
    .lte('transaction_date', lastDayOfMonth.toISOString().split('T')[0])

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-red-600">
            Erro ao carregar dados financeiros: {error.message}
          </p>
        </CardContent>
      </Card>
    )
  }

  // Calcular métricas
  const income = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0
  const expenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0
  const profit = income - expenses
  
  const paidIncome = transactions?.filter(t => t.type === 'income' && t.payment_status === 'paid').reduce((sum, t) => sum + Number(t.amount), 0) || 0
  const pendingIncome = transactions?.filter(t => t.type === 'income' && t.payment_status === 'pending').reduce((sum, t) => sum + Number(t.amount), 0) || 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const currentMonthName = format(currentMonth, 'MMMM yyyy', { locale: ptBR })

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Receita Total */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Receita Total
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(income)}
          </div>
          <p className="text-xs text-muted-foreground">
            {currentMonthName}
          </p>
        </CardContent>
      </Card>

      {/* Despesas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Despesas
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(expenses)}
          </div>
          <p className="text-xs text-muted-foreground">
            {currentMonthName}
          </p>
        </CardContent>
      </Card>

      {/* Lucro */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Lucro Líquido
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(profit)}
          </div>
          <p className="text-xs text-muted-foreground">
            {currentMonthName}
          </p>
        </CardContent>
      </Card>

      {/* Receita Pendente */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            A Receber
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(pendingIncome)}
          </div>
          <p className="text-xs text-muted-foreground">
            Pagamentos pendentes
          </p>
        </CardContent>
      </Card>

      {/* Resumo Detalhado */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Resumo de {currentMonthName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Receitas</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Recebido:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(paidIncome)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pendente:</span>
                  <span className="font-medium text-orange-600">
                    {formatCurrency(pendingIncome)}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t pt-1">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold">
                    {formatCurrency(income)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Despesas</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(expenses)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Performance</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Margem:</span>
                  <span className={`font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {income > 0 ? `${((profit / income) * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transações:</span>
                  <span className="font-medium">
                    {transactions?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
