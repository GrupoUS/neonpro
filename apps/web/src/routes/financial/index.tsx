import { getCurrentSession } from '@/integrations/supabase/client';
import { Badge } from '@neonpro/ui';
import { Card } from '@neonpro/ui';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { CreditCard } from 'lucide-react';

export const Route = createFileRoute('/financial/')({
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
            <div className='text-2xl font-bold'>R$ 45.231,89</div>
            <p className='text-xs text-muted-foreground flex items-center'>
              <TrendingUp className='h-3 w-3 mr-1 text-green-500' />
              +20.1% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card enableShineBorder>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Despesas</CardTitle>
            <Receipt className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>R$ 12.450,32</div>
            <p className='text-xs text-muted-foreground flex items-center'>
              <TrendingDown className='h-3 w-3 mr-1 text-red-500' />
              -5.2% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card enableShineBorder>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Lucro Líquido</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>R$ 32.781,57</div>
            <p className='text-xs text-muted-foreground flex items-center'>
              <TrendingUp className='h-3 w-3 mr-1 text-green-500' />
              +25.3% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card enableShineBorder>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Contas a Receber
            </CardTitle>
            <CreditCard className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>R$ 8.920,15</div>
            <p className='text-xs text-muted-foreground'>
              15 faturas pendentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions and Pending Invoices */}
      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>Últimas movimentações financeiras</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div className='flex items-center space-x-4'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <div>
                    <p className='font-medium'>Procedimento - Maria Silva</p>
                    <p className='text-sm text-muted-foreground'>
                      11/01/2025 - 14:30
                    </p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='font-medium text-green-600'>+R$ 850,00</p>
                  <Badge variant='secondary' className='text-xs'>
                    Pago
                  </Badge>
                </div>
              </div>

              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div className='flex items-center space-x-4'>
                  <div className='w-2 h-2 bg-red-500 rounded-full'></div>
                  <div>
                    <p className='font-medium'>
                      Fornecedor - Produtos Estéticos
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      10/01/2025 - 09:15
                    </p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='font-medium text-red-600'>-R$ 1.200,00</p>
                  <Badge variant='destructive' className='text-xs'>
                    Despesa
                  </Badge>
                </div>
              </div>

              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div className='flex items-center space-x-4'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <div>
                    <p className='font-medium'>Procedimento - João Santos</p>
                    <p className='text-sm text-muted-foreground'>
                      09/01/2025 - 16:45
                    </p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='font-medium text-green-600'>+R$ 1.250,00</p>
                  <Badge variant='secondary' className='text-xs'>
                    Pago
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contas a Receber</CardTitle>
            <CardDescription>Faturas pendentes de pagamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div>
                  <p className='font-medium'>Ana Costa</p>
                  <p className='text-sm text-muted-foreground'>
                    Vencimento: 15/01/2025
                  </p>
                </div>
                <div className='text-right'>
                  <p className='font-medium'>R$ 750,00</p>
                  <Badge variant='outline' className='text-xs'>
                    Pendente
                  </Badge>
                </div>
              </div>

              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div>
                  <p className='font-medium'>Carlos Oliveira</p>
                  <p className='text-sm text-muted-foreground'>
                    Vencimento: 20/01/2025
                  </p>
                </div>
                <div className='text-right'>
                  <p className='font-medium'>R$ 1.100,00</p>
                  <Badge variant='outline' className='text-xs'>
                    Pendente
                  </Badge>
                </div>
              </div>

              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div>
                  <p className='font-medium'>Fernanda Lima</p>
                  <p className='text-sm text-muted-foreground text-red-600'>
                    Vencimento: 05/01/2025
                  </p>
                </div>
                <div className='text-right'>
                  <p className='font-medium'>R$ 920,00</p>
                  <Badge variant='destructive' className='text-xs'>
                    Vencida
                  </Badge>
                </div>
              </div>

              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div>
                  <p className='font-medium'>Roberto Silva</p>
                  <p className='text-sm text-muted-foreground'>
                    Vencimento: 25/01/2025
                  </p>
                </div>
                <div className='text-right'>
                  <p className='font-medium'>R$ 650,00</p>
                  <Badge variant='outline' className='text-xs'>
                    Pendente
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
