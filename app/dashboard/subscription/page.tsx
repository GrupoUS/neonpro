/**
 * Subscription Management Page
 * Epic: EPIC-001 - Advanced Subscription Management
 * Story: EPIC-001.1 - Subscription Middleware & Management System
 */

'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Settings, 
  History, 
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import SubscriptionDashboard from '@/components/subscription/SubscriptionDashboard';
import PlanSelector from '@/components/subscription/PlanSelector';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function SubscriptionPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<string | undefined>();
  const { toast } = useToast();
  const router = useRouter();

  const handleSelectPlan = async (planId: string, billingCycle: 'monthly' | 'quarterly' | 'yearly') => {
    try {
      setLoading(true);
      
      // Create checkout session
      const response = await fetch('/api/subscription/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: planId,
          billing_cycle: billingCycle,
          payment_provider: 'stripe' // Default to Stripe
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to checkout
        window.location.href = result.data.checkout_url;
      } else {
        if (result.code === 'EXISTING_SUBSCRIPTION') {
          toast({
            title: 'Assinatura Existente',
            description: result.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Erro ao Processar Pagamento',
            description: result.error || 'Erro interno do servidor',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: 'Erro de Conexão',
        description: 'Não foi possível processar o pagamento. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    setActiveTab('plans');
  };

  const handleManageBilling = () => {
    // TODO: Implement billing management
    toast({
      title: 'Em Desenvolvimento',
      description: 'Funcionalidade de gerenciamento de cobrança em breve.',
    });
  };

  const handleCancelSubscription = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/subscription/current', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancel_at_period_end: true,
          cancellation_reason: 'User requested cancellation'
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Assinatura Cancelada',
          description: result.message,
        });
        // Refresh the page to show updated status
        window.location.reload();
      } else {
        toast({
          title: 'Erro ao Cancelar',
          description: result.error || 'Erro interno do servidor',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        title: 'Erro de Conexão',
        description: 'Não foi possível cancelar a assinatura. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assinatura</h1>
          <p className="text-muted-foreground">
            Gerencie seu plano, cobrança e uso do NeonPro
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Planos</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>Cobrança</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Configurações</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <SubscriptionDashboard
            onUpgrade={handleUpgrade}
            onManageBilling={handleManageBilling}
            onCancelSubscription={handleCancelSubscription}
          />
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Escolha Seu Plano</CardTitle>
              <CardDescription>
                Selecione o plano que melhor atende às necessidades da sua clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlanSelector
                currentPlanId={currentPlanId}
                onSelectPlan={handleSelectPlan}
                isUpgrade={true}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Cobrança</CardTitle>
              <CardDescription>
                Visualize suas faturas e histórico de pagamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Funcionalidade de histórico de cobrança em desenvolvimento.
                  Suas faturas serão exibidas aqui em breve.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pagamento</CardTitle>
                <CardDescription>
                  Gerencie seus cartões e métodos de pagamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Gerenciamento de métodos de pagamento em desenvolvimento.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Notificações de Cobrança</CardTitle>
                <CardDescription>
                  Configure quando receber lembretes de pagamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Lembrete de Renovação</p>
                      <p className="text-sm text-muted-foreground">
                        7 dias antes do vencimento
                      </p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Confirmação de Pagamento</p>
                      <p className="text-sm text-muted-foreground">
                        Após pagamento processado
                      </p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Falha no Pagamento</p>
                      <p className="text-sm text-muted-foreground">
                        Notificação imediata
                      </p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações da Assinatura</CardTitle>
              <CardDescription>
                Gerencie configurações avançadas da sua assinatura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Exportar Dados</p>
                  <p className="text-sm text-muted-foreground">
                    Baixe todos os seus dados antes de cancelar
                  </p>
                </div>
                <Button variant="outline">
                  Exportar
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Suporte Técnico</p>
                  <p className="text-sm text-muted-foreground">
                    Entre em contato com nossa equipe
                  </p>
                </div>
                <Button variant="outline">
                  Contatar
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/20">
                <div>
                  <p className="font-medium text-destructive">Cancelar Assinatura</p>
                  <p className="text-sm text-muted-foreground">
                    Cancele sua assinatura ao final do período atual
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={handleCancelSubscription}
                  disabled={loading}
                >
                  {loading ? 'Cancelando...' : 'Cancelar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}