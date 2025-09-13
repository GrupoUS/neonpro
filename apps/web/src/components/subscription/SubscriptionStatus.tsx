/**
 * Subscription Status Component for NeonPro
 * Displays current subscription status and available models
 */

import { Badge } from '@neonpro/ui';
import { Crown, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';
import SubscriptionUpgrade from './SubscriptionUpgrade';

interface SubscriptionStatusProps {
  className?: string;
  showUpgrade?: boolean;
  showModels?: boolean;
  variant?: 'compact' | 'detailed';
}

export default function SubscriptionStatus({ 
  className, 
  showUpgrade = true,
  showModels = true,
  variant = 'detailed'
}: SubscriptionStatusProps) {
  const { 
    subscriptionInfo, 
    hasPro, 
    isOnTrial, 
    isExpired,
    trialDaysRemaining,
    availableModels,
    isLoading 
  } = useSubscription();

  if (isLoading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className='h-20 bg-[#D2D0C8]/20 rounded-lg'></div>
      </div>
    );
  }

  const getStatusIcon = () => {
    if (hasPro) return <Crown className='w-4 h-4 text-white' />;
    if (isOnTrial) return <Clock className='w-4 h-4 text-[#AC9469]' />;
    if (isExpired) return <XCircle className='w-4 h-4 text-red-500' />;
    return <CheckCircle className='w-4 h-4 text-[#B4AC9C]' />;
  };

  const getStatusColor = () => {
    if (hasPro) return 'bg-gradient-to-r from-[#AC9469] to-[#294359] text-white';
    if (isOnTrial) return 'bg-[#AC9469]/10 text-[#AC9469] border border-[#AC9469]/20';
    if (isExpired) return 'bg-red-50 text-red-600 border border-red-200';
    return 'bg-[#D2D0C8]/20 text-[#112031] border border-[#D2D0C8]';
  };

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Badge className={cn('px-3 py-1 text-xs font-medium', getStatusColor())}>
          {getStatusIcon()}
          <span className='ml-1'>{subscriptionInfo.displayStatus}</span>
        </Badge>
        {isOnTrial && trialDaysRemaining > 0 && (
          <span className='text-xs text-[#B4AC9C]'>
            {trialDaysRemaining} dias restantes
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Status Card */}
      <div className='bg-white rounded-lg border border-[#D2D0C8] p-4'>
        <div className='flex items-center justify-between mb-3'>
          <h3 className='text-lg font-semibold text-[#112031]'>Status da Assinatura</h3>
          <Badge className={cn('px-3 py-1 text-sm font-medium', getStatusColor())}>
            {getStatusIcon()}
            <span className='ml-2'>{subscriptionInfo.displayStatus}</span>
          </Badge>
        </div>

        {/* Trial Warning */}
        {isOnTrial && trialDaysRemaining <= 3 && (
          <div className='bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3'>
            <div className='flex items-center space-x-2'>
              <AlertTriangle className='w-4 h-4 text-amber-600' />
              <span className='text-sm font-medium text-amber-800'>
                Seu teste grátis expira em {trialDaysRemaining} dias
              </span>
            </div>
            <p className='text-xs text-amber-700 mt-1'>
              Faça upgrade para continuar usando modelos avançados.
            </p>
          </div>
        )}

        {/* Expired Warning */}
        {isExpired && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-3 mb-3'>
            <div className='flex items-center space-x-2'>
              <XCircle className='w-4 h-4 text-red-600' />
              <span className='text-sm font-medium text-red-800'>
                Sua assinatura expirou
              </span>
            </div>
            <p className='text-xs text-red-700 mt-1'>
              Renove sua assinatura para continuar usando modelos avançados.
            </p>
          </div>
        )}

        {/* Current Plan Info */}
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div>
            <span className='text-[#B4AC9C]'>Plano Atual:</span>
            <div className='font-medium text-[#112031]'>
              {hasPro ? 'NeonPro Pro' : 'Gratuito'}
            </div>
          </div>
          <div>
            <span className='text-[#B4AC9C]'>Modelos Disponíveis:</span>
            <div className='font-medium text-[#112031]'>
              {availableModels.filter(m => m.available).length} de {availableModels.length}
            </div>
          </div>
        </div>
      </div>

      {/* Available Models */}
      {showModels && (
        <div className='bg-white rounded-lg border border-[#D2D0C8] p-4'>
          <h4 className='text-md font-semibold text-[#112031] mb-3'>Modelos de IA</h4>
          <div className='space-y-2'>
            {availableModels.map((model) => (
              <div 
                key={model.model} 
                className={cn(
                  'flex items-center justify-between p-2 rounded-lg border',
                  model.available 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                )}
              >
                <div className='flex items-center space-x-2'>
                  {model.available ? (
                    <CheckCircle className='w-4 h-4 text-green-600' />
                  ) : (
                    <XCircle className='w-4 h-4 text-gray-400' />
                  )}
                  <div>
                    <span className={cn(
                      'text-sm font-medium',
                      model.available ? 'text-green-800' : 'text-gray-600'
                    )}>
                      {model.label}
                    </span>
                    {model.description && (
                      <p className={cn(
                        'text-xs',
                        model.available ? 'text-green-600' : 'text-gray-500'
                      )}>
                        {model.description}
                      </p>
                    )}
                  </div>
                </div>
                {model.requiresPro && !model.available && (
                  <Badge variant="outline" className='text-xs'>
                    <Crown className='w-3 h-3 mr-1' />
                    Pro
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upgrade Component */}
      {showUpgrade && !hasPro && (
        <SubscriptionUpgrade variant="card" />
      )}
    </div>
  );
}
