/**
 * Subscription Upgrade Component for NeonPro
 * Handles Pro tier upgrade with Stripe integration
 */

import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/useToast';
import { cn } from '@neonpro/ui';
import { Button } from '@neonpro/ui';
import { Brain } from 'lucide-react';
import { useState } from 'react';

interface SubscriptionUpgradeProps {
  className?: string;
  variant?: 'card' | 'modal' | 'inline';
  showFeatures?: boolean;
}

const PRO_FEATURES = [
  {
    icon: Brain,
    title: 'Modelos de IA Avançados',
    description: 'Acesso ao GPT-4o, Gemini Pro, Claude 3 Sonnet e outros modelos premium',
  },
  {
    icon: Zap,
    title: 'Respostas Mais Rápidas',
    description: 'Processamento prioritário para consultas mais rápidas',
  },
  {
    icon: Shield,
    title: 'Suporte Premium',
    description: 'Suporte técnico prioritário e atendimento especializado',
  },
];

export default function SubscriptionUpgrade({
  className,
  variant = 'card',
  showFeatures = true,
}: SubscriptionUpgradeProps) {
  const { subscriptionInfo, hasPro, isLoading } = useSubscription();
  const { toast } = useToast();
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setUpgrading(true);

    try {
      // Open Stripe payment link in new tab
      const paymentUrl = 'https://buy.stripe.com/6oU3cw8Tz0IZ4mW2bFgYU02';
      window.open(paymentUrl, '_blank');

      toast(
        'Redirecionando para pagamento - Você será redirecionado para completar sua assinatura Pro.',
      );
    } catch (_error) {
      console.error('Error opening payment link:', error);
      toast('Erro ao processar upgrade - Tente novamente em alguns instantes.');
    } finally {
      setUpgrading(false);
    }
  };

  // Don't show if user already has pro
  if (hasPro) {
    return null;
  }

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Button
          onClick={handleUpgrade}
          disabled={upgrading || isLoading}
          size='sm'
          className='bg-gradient-to-r from-[#AC9469] to-[#294359] hover:from-[#294359] hover:to-[#112031] text-white'
        >
          <Crown className='w-4 h-4 mr-2' />
          {upgrading ? 'Processando...' : 'Upgrade Pro'}
          <ExternalLink className='w-3 h-3 ml-1' />
        </Button>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div
        className={cn(
          'bg-white rounded-lg border border-[#D2D0C8] p-6',
          className,
        )}
      >
        <div className='text-center mb-6'>
          <div className='w-16 h-16 bg-gradient-to-br from-[#AC9469] to-[#294359] rounded-full flex items-center justify-center mx-auto mb-4'>
            <Crown className='w-8 h-8 text-white' />
          </div>
          <h3 className='text-xl font-semibold text-[#112031] mb-2'>
            Upgrade para NeonPro Pro
          </h3>
          <p className='text-[#B4AC9C] mb-4'>
            Desbloqueie todos os modelos de IA avançados
          </p>
          <div className='text-3xl font-bold text-[#112031] mb-1'>
            R$ 99,00
            <span className='text-lg font-normal text-[#B4AC9C]'>/mês</span>
          </div>
        </div>

        {showFeatures && (
          <div className='space-y-4 mb-6'>
            {PRO_FEATURES.map((feature, _index) => (
              <div key={index} className='flex items-start space-x-3'>
                <div className='w-8 h-8 bg-[#AC9469]/10 rounded-full flex items-center justify-center flex-shrink-0'>
                  <feature.icon className='w-4 h-4 text-[#AC9469]' />
                </div>
                <div>
                  <h4 className='font-medium text-[#112031] mb-1'>
                    {feature.title}
                  </h4>
                  <p className='text-sm text-[#B4AC9C]'>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={handleUpgrade}
          disabled={upgrading || isLoading}
          className='w-full bg-gradient-to-r from-[#AC9469] to-[#294359] hover:from-[#294359] hover:to-[#112031] text-white'
        >
          <Crown className='w-4 h-4 mr-2' />
          {upgrading ? 'Processando...' : 'Fazer Upgrade Agora'}
          <ExternalLink className='w-4 h-4 ml-2' />
        </Button>
      </div>
    );
  }

  // Default card variant
  return (
    <div
      className={cn(
        'bg-gradient-to-br from-white to-[#AC9469]/5 rounded-lg border border-[#AC9469]/20 p-6 shadow-lg',
        className,
      )}
    >
      <div className='flex items-start justify-between mb-4'>
        <div>
          <div className='flex items-center space-x-2 mb-2'>
            <Crown className='w-5 h-5 text-[#AC9469]' />
            <h3 className='text-lg font-semibold text-[#112031]'>
              NeonPro Pro
            </h3>
          </div>
          <p className='text-[#B4AC9C] text-sm mb-3'>
            Acesse todos os modelos de IA avançados
          </p>
          <div className='text-2xl font-bold text-[#112031] mb-1'>
            R$ 99,00
            <span className='text-sm font-normal text-[#B4AC9C]'>/mês</span>
          </div>
        </div>
        <div className='text-right'>
          <div className='text-xs text-[#B4AC9C] mb-1'>Status Atual</div>
          <div className='text-sm font-medium text-[#112031]'>
            {subscriptionInfo.displayStatus}
          </div>
        </div>
      </div>

      {showFeatures && (
        <div className='space-y-2 mb-6'>
          <div className='text-sm font-medium text-[#112031] mb-3'>
            Incluído no Pro:
          </div>
          {PRO_FEATURES.map((feature, _index) => (
            <div key={index} className='flex items-center space-x-2'>
              <Check className='w-4 h-4 text-[#AC9469] flex-shrink-0' />
              <span className='text-sm text-[#112031]'>{feature.title}</span>
            </div>
          ))}
        </div>
      )}

      <Button
        onClick={handleUpgrade}
        disabled={upgrading || isLoading}
        className='w-full bg-gradient-to-r from-[#AC9469] to-[#294359] hover:from-[#294359] hover:to-[#112031] text-white'
      >
        <Crown className='w-4 h-4 mr-2' />
        {upgrading ? 'Processando...' : 'Fazer Upgrade'}
        <ExternalLink className='w-4 h-4 ml-2' />
      </Button>

      <p className='text-xs text-[#B4AC9C] text-center mt-3'>
        Cancele a qualquer momento. Sem compromisso.
      </p>
    </div>
  );
}
