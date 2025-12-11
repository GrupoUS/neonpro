import { useAuth } from '@/hooks/useAuth';
import { getCurrentSession } from '@/integrations/supabase/client';
import {
  fetchFinancialSummary,
  fetchPendingInvoices,
  fetchRecentTransactions,
  formatCurrency,
  formatDate,
  formatShortDate,
  type FinancialSummary,
  type Invoice,
  type Transaction,
} from '@/services/financial.service';
import { Badge, Button } from '@neonpro/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@neonpro/ui';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { CreditCard, DollarSign, Loader2, Receipt, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/financial')({
  beforeLoad: async () => {
    const session = await getCurrentSession();
    if (!session) {
      throw redirect({
        to: '/',
        search: { redirect: '/financial' },
      });
    }
    return { session };
  },
  component: FinancialPage,
});

function FinancialPage() {
  const { profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Get clinic ID from profile
  const clinicId = profile?.clinicId || profile?.tenantId || null;

  useEffect(() => {
    const loadFinancialData = async () => {
      if (!clinicId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [summaryData, transactionsData, invoicesData] = await Promise.all([
          fetchFinancialSummary(clinicId),
          fetchRecentTransactions(clinicId, 5),
          fetchPendingInvoices(clinicId),
        ]);

        setSummary(summaryData);
        setTransactions(transactionsData);
        setInvoices(invoicesData);
      } catch (error) {
        console.error('Error loading financial data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      loadFinancialData();
    }
  }, [clinicId, authLoading]);

  // Loading state
  if (authLoading || loading) {
    return (
      <div className='container mx-auto p-6'>
        <div className='flex items-center justify-center h-96'>
          <div className='flex flex-col items-center gap-2'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
            <span className='text-sm text-muted-foreground'>Carregando dados financeiros...</span>
          </div>
        </div>
      </div>
    );
  }

  // No clinic configured
  if (!clinicId) {
    return (
      <div className='container mx-auto p-6'>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-lg font-semibold text-amber-600'>Clínica não configurada</p>
              <p className='mt-2 text-sm text-muted-foreground'>
                Você precisa estar associado a uma clínica para visualizar dados financeiros.
              </p>
              <Button
                variant='outline'
                onClick={() => window.location.href = '/settings'}
                className='mt-4'
              >
                Ir para Configurações
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasData = summary && (summary.totalRevenue > 0 || summary.totalExpenses > 0 || transactions.length > 0);

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold tracking-tight'>Financeiro</h1>
        <div className='text-sm text-muted-foreground'>
          Gestão financeira da clínica
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <Card enableShineBorder>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Receita Total</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {summary ? formatCurrency(summary.totalRevenue) : 'R$ 0,00'}
            </div>
            <p className='text-xs text-muted-foreground flex items-center'>
              {summary && summary.revenueChange !== 0 ? (
                <>
                  {summary.revenueChange > 0 ? (
                    <TrendingUp className='h-3 w-3 mr-1 text-green-500' />
                  ) : (
                    <TrendingDown className='h-3 w-3 mr-1 text-red-500' />
                  )}
                  {summary.revenueChange > 0 ? '+' : ''}{summary.revenueChange.toFixed(1)}% em relação ao mês anterior
                </>
              ) : (
                'Este mês'
              )}
            </p>
          </CardContent>
        </Card>

        <Card enableShineBorder>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Despesas</CardTitle>
            <Receipt className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {summary ? formatCurrency(summary.totalExpenses) : 'R$ 0,00'}
            </div>
            <p className='text-xs text-muted-foreground flex items-center'>
              {summary && summary.expensesChange !== 0 ? (
                <>
                  {summary.expensesChange < 0 ? (
                    <TrendingDown className='h-3 w-3 mr-1 text-green-500' />
                  ) : (
                    <TrendingUp className='h-3 w-3 mr-1 text-red-500' />
                  )}
                  {summary.expensesChange > 0 ? '+' : ''}{summary.expensesChange.toFixed(1)}% em relação ao mês anterior
                </>
              ) : (
                'Este mês'
              )}
            </p>
          </CardContent>
        </Card>

        <Card enableShineBorder>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Lucro Líquido</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {summary ? formatCurrency(summary.netProfit) : 'R$ 0,00'}
            </div>
            <p className='text-xs text-muted-foreground flex items-center'>
              {summary && summary.profitChange !== 0 ? (
                <>
                  {summary.profitChange > 0 ? (
                    <TrendingUp className='h-3 w-3 mr-1 text-green-500' />
                  ) : (
                    <TrendingDown className='h-3 w-3 mr-1 text-red-500' />
                  )}
                  {summary.profitChange > 0 ? '+' : ''}{summary.profitChange.toFixed(1)}% em relação ao mês anterior
                </>
              ) : (
                'Este mês'
              )}
            </p>
          </CardContent>
        </Card>

        <Card enableShineBorder>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Contas a Receber</CardTitle>
            <CreditCard className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {summary ? formatCurrency(summary.accountsReceivable) : 'R$ 0,00'}
            </div>
            <p className='text-xs text-muted-foreground'>
              {summary?.pendingInvoicesCount || 0} fatura{(summary?.pendingInvoicesCount || 0) !== 1 ? 's' : ''} pendente{(summary?.pendingInvoicesCount || 0) !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions and Pending Invoices */}
      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>
              Últimas movimentações financeiras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {transactions.length === 0 ? (
                <p className='text-sm text-muted-foreground text-center py-8'>
                  Nenhuma transação registrada
                </p>
              ) : (
                transactions.map((transaction) => (
                  <div key={transaction.id} className='flex items-center justify-between p-4 border rounded-lg'>
                    <div className='flex items-center space-x-4'>
                      <div className={`w-2 h-2 rounded-full ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                      <div>
                        <p className='font-medium'>
                          {transaction.description}
                          {transaction.patientName && ` - ${transaction.patientName}`}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <Badge
                        variant={transaction.status === 'paid' ? 'secondary' : 'destructive'}
                        className='text-xs'
                      >
                        {transaction.status === 'paid' ? 'Pago' :
                          transaction.status === 'overdue' ? 'Vencido' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contas a Receber</CardTitle>
            <CardDescription>
              Faturas pendentes de pagamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {invoices.length === 0 ? (
                <p className='text-sm text-muted-foreground text-center py-8'>
                  Nenhuma fatura pendente
                </p>
              ) : (
                invoices.map((invoice) => (
                  <div key={invoice.id} className='flex items-center justify-between p-4 border rounded-lg'>
                    <div>
                      <p className='font-medium'>{invoice.patientName}</p>
                      <p className={`text-sm ${invoice.status === 'overdue' ? 'text-red-600' : 'text-muted-foreground'
                        }`}>
                        Vencimento: {formatShortDate(invoice.dueDate)}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='font-medium'>{formatCurrency(invoice.amount)}</p>
                      <Badge
                        variant={invoice.status === 'overdue' ? 'destructive' : 'outline'}
                        className='text-xs'
                      >
                        {invoice.status === 'overdue' ? 'Vencida' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty state message */}
      {!hasData && (
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center py-8'>
              <DollarSign className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <p className='text-lg font-medium'>Nenhum dado financeiro encontrado</p>
              <p className='text-sm text-muted-foreground mt-2'>
                Os dados financeiros aparecerão aqui conforme você registrar transações e pagamentos.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

