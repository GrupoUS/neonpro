/**
 * Subscription Management Page for NeonPro
 * Displays subscription status, available models, and upgrade options
 */

import SubscriptionStatus from '@/components/subscription/SubscriptionStatus';
import SubscriptionUpgrade from '@/components/subscription/SubscriptionUpgrade';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/integrations/supabase/client';
// Explicit extension helps Node ESM/Vercel resolution
import { cn } from '@/lib/utils';
import { Button } from '@neonpro/ui';
import { createFileRoute } from '@tanstack/react-router';
import { Crown, ExternalLink, RefreshCw } from 'lucide-react';

export const Route = createFileRoute('/financial/subscription')({
  component: SubscriptionPage,
});

function SubscriptionPage() {
  const { hasPro, isLoading, refetch, availableModels } = useSubscription();
  const { toast } = useToast();

  const handleRefresh = async () => {
    try {
      await refetch();
      toast('Status atualizado - Informações da assinatura foram atualizadas.');
    } catch (_error) {
      console.error('Failed to refresh subscription status:', error);
      toast(
        'Erro ao atualizar - Não foi possível atualizar o status da assinatura.',
      );
    }
  };

  const handleManageSubscription = async () => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast(
          'Erro - Você precisa estar logado para acessar o portal do cliente.',
        );
        return;
      }

      // Call API to create customer portal session
      const response = await fetch('/api/v1/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (data.success && data.portal_url) {
        // Redirect to Stripe Customer Portal
        window.location.href = data.portal_url;
      } else {
        toast(
          `Erro - ${data.error || 'Não foi possível abrir o portal do cliente.'}`,
        );
      }
    } catch (_error) {
      console.error('Error opening customer portal:', error);
      toast('Erro - Falha ao conectar com o portal do cliente.');
    }
  };

  if (isLoading) {
    return (
      <div className='p-6 max-w-4xl mx-auto'>
        <div className='animate-pulse space-y-6'>
          <div className='h-8 bg-[#D2D0C8]/20 rounded w-1/3'></div>
          <div className='h-32 bg-[#D2D0C8]/20 rounded'></div>
          <div className='h-48 bg-[#D2D0C8]/20 rounded'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 max-w-4xl mx-auto space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-[#112031] mb-2'>
            Gerenciar Assinatura
          </h1>
          <p className='text-[#B4AC9C]'>
            Gerencie sua assinatura NeonPro e acesso aos modelos de IA
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')}
            />
            Atualizar
          </Button>
          {hasPro && (
            <Button
              variant='outline'
              size='sm'
              onClick={handleManageSubscription}
            >
              <ExternalLink className='w-4 h-4 mr-2' />
              Gerenciar
            </Button>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Content */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Subscription Status */}
          <SubscriptionStatus showUpgrade={false} showModels={true} />

          {/* AI Models Overview */}
          <div className='bg-white rounded-lg border border-[#D2D0C8] p-6'>
            <h3 className='text-lg font-semibold text-[#112031] mb-4'>
              Modelos de IA Disponíveis
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Free Models */}
              <div className='space-y-3'>
                <h4 className='text-sm font-medium text-[#112031] flex items-center'>
                  <div className='w-2 h-2 bg-green-500 rounded-full mr-2'></div>
                  Modelos Gratuitos
                </h4>
                {availableModels
                  .filter(model => !model.requiresPro)
                  .map(model => (
                    <div
                      key={model.model}
                      className='bg-green-50 border border-green-200 rounded-lg p-3'
                    >
                      <div className='font-medium text-green-800 text-sm'>
                        {model.label}
                      </div>
                      {model.description && (
                        <p className='text-xs text-green-600 mt-1'>
                          {model.description}
                        </p>
                      )}
                    </div>
                  ))}
              </div>

              {/* Pro Models */}
              <div className='space-y-3'>
                <h4 className='text-sm font-medium text-[#112031] flex items-center'>
                  <Crown className='w-4 h-4 text-[#AC9469] mr-2' />
                  Modelos Pro
                </h4>
                {availableModels
                  .filter(model => model.requiresPro)
                  .map(model => (
                    <div
                      key={model.model}
                      className={cn(
                        'rounded-lg p-3 border',
                        model.available
                          ? 'bg-[#AC9469]/10 border-[#AC9469]/20'
                          : 'bg-gray-50 border-gray-200',
                      )}
                    >
                      <div
                        className={cn(
                          'font-medium text-sm flex items-center justify-between',
                          model.available ? 'text-[#AC9469]' : 'text-gray-600',
                        )}
                      >
                        {model.label}
                        {!model.available && <Crown className='w-3 h-3 text-gray-400' />}
                      </div>
                      {model.description && (
                        <p
                          className={cn(
                            'text-xs mt-1',
                            model.available
                              ? 'text-[#AC9469]/80'
                              : 'text-gray-500',
                          )}
                        >
                          {model.description}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Upgrade Card */}
          {!hasPro && <SubscriptionUpgrade variant='card' />}

          {/* Pro Benefits */}
          {hasPro && (
            <div className='bg-gradient-to-br from-[#AC9469]/10 to-[#294359]/10 rounded-lg border border-[#AC9469]/20 p-6'>
              <div className='flex items-center space-x-2 mb-4'>
                <Crown className='w-5 h-5 text-[#AC9469]' />
                <h3 className='text-lg font-semibold text-[#112031]'>
                  Você é Pro!
                </h3>
              </div>
              <p className='text-[#B4AC9C] text-sm mb-4'>
                Obrigado por ser um assinante NeonPro Pro. Você tem acesso a todos os recursos
                premium.
              </p>
              <div className='space-y-2 text-sm'>
                <div className='flex items-center text-[#112031]'>
                  <Crown className='w-3 h-3 text-[#AC9469] mr-2' />
                  Todos os modelos de IA
                </div>
                <div className='flex items-center text-[#112031]'>
                  <Crown className='w-3 h-3 text-[#AC9469] mr-2' />
                  Suporte prioritário
                </div>
                <div className='flex items-center text-[#112031]'>
                  <Crown className='w-3 h-3 text-[#AC9469] mr-2' />
                  Recursos avançados
                </div>
              </div>
            </div>
          )}

          {/* Help Card */}
          <div className='bg-white rounded-lg border border-[#D2D0C8] p-6'>
            <h3 className='text-lg font-semibold text-[#112031] mb-3'>
              Precisa de Ajuda?
            </h3>
            <p className='text-[#B4AC9C] text-sm mb-4'>
              Entre em contato conosco se tiver dúvidas sobre sua assinatura.
            </p>
            <Button variant='outline' size='sm' className='w-full'>
              Contatar Suporte
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
