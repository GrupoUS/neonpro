/**
 * RealTimeStatusIndicator Component - Real-Time Features (FR-011)
 * Displays real-time connection status and performance metrics
 *
 * Features:
 * - Connection status indicator with visual feedback
 * - Performance metrics display (latency, messages/sec)
 * - Brazilian Portuguese labels
 * - Accessibility compliance (WCAG 2.1 AA+)
 * - Mobile-responsive design
 * - Detailed metrics tooltip
 */

'use client';

import { type ConnectionStatus, useEnhancedRealTime } from '@/hooks/useEnhancedRealTime';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import {
  IconActivity,
  IconAlertCircle,
  IconCheck,
  IconLoader2,
  IconWifi,
  IconWifiOff,
} from '@tabler/icons-react';
import { useState } from 'react';

interface RealTimeStatusIndicatorProps {
  className?: string;
  showMetrics?: boolean;
  compact?: boolean;
}

// Status configuration
const statusConfig: Record<
  ConnectionStatus,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    color: string;
    bgColor: string;
    animate?: boolean;
  }
> = {
  connecting: {
    icon: IconLoader2,
    label: 'Conectando...',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    animate: true,
  },
  connected: {
    icon: IconCheck,
    label: 'Conectado',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  disconnected: {
    icon: IconWifiOff,
    label: 'Desconectado',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-900/30',
  },
  error: {
    icon: IconAlertCircle,
    label: 'Erro de Conexão',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
  reconnecting: {
    icon: IconWifi,
    label: 'Reconectando...',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    animate: true,
  },
};

export function RealTimeStatusIndicator({
  className,
  showMetrics = false,
  compact = false,
}: RealTimeStatusIndicatorProps) {
  const { connectionStatus, metrics, isConnected } = useEnhancedRealTime();
  const [showDetails, setShowDetails] = useState(false);

  const config = statusConfig[connectionStatus];
  const IconComponent = config.icon;

  // Format latency
  const formatLatency = (_latency: any) => {
    if (latency < 1000) {
      return `${latency}ms`;
    }
    return `${(latency / 1000).toFixed(1)}s`;
  };

  // Format messages per second
  const formatMessagesPerSecond = (_mps: any) => {
    return mps.toFixed(1);
  };

  // Get latency status
  const getLatencyStatus = (_latency: any) => {
    if (latency < 500) return 'excellent';
    if (latency < 1000) return 'good';
    if (latency < 2000) return 'fair';
    return 'poor';
  };

  const latencyStatus = getLatencyStatus(metrics.latency);

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div
          className={cn(
            'w-2 h-2 rounded-full transition-colors',
            isConnected ? 'bg-green-500' : 'bg-red-500',
            isConnected && 'animate-pulse',
          )}
        />
        <span className='text-xs text-muted-foreground'>
          {isConnected ? 'Online' : 'Offline'}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => setShowDetails(!showDetails)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all',
          config.bgColor,
          config.color,
          'hover:opacity-80',
        )}
        aria-label={`Status da conexão em tempo real: ${config.label}`}
      >
        <IconComponent
          className={cn('h-4 w-4', config.animate && 'animate-spin')}
        />

        {!compact && (
          <>
            <span className='font-medium'>{config.label}</span>

            {showMetrics && isConnected && (
              <div className='flex items-center gap-2 text-xs'>
                <span
                  className={cn(
                    'px-2 py-1 rounded-full',
                    latencyStatus === 'excellent'
                      && 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200',
                    latencyStatus === 'good'
                      && 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
                    latencyStatus === 'fair'
                      && 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200',
                    latencyStatus === 'poor'
                      && 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200',
                  )}
                >
                  {formatLatency(metrics.latency)}
                </span>

                <div className='flex items-center gap-1'>
                  <IconActivity className='h-3 w-3' />
                  <span>
                    {formatMessagesPerSecond(metrics.messagesPerSecond)}/s
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </Button>

      {/* Detailed metrics tooltip */}
      {showDetails && (
        <div className='absolute top-full right-0 mt-2 w-80 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50'>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <h4 className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                Status da Conexão em Tempo Real
              </h4>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setShowDetails(false)}
                className='h-6 w-6 p-0'
                aria-label='Fechar detalhes'
              >
                ×
              </Button>
            </div>

            <div className='grid grid-cols-2 gap-3 text-sm'>
              <div>
                <span className='text-gray-600 dark:text-gray-400'>
                  Status:
                </span>
                <div className={cn('font-medium', config.color)}>
                  {config.label}
                </div>
              </div>

              <div>
                <span className='text-gray-600 dark:text-gray-400'>
                  Latência:
                </span>
                <div
                  className={cn(
                    'font-medium',
                    latencyStatus === 'excellent'
                      && 'text-green-600 dark:text-green-400',
                    latencyStatus === 'good'
                      && 'text-blue-600 dark:text-blue-400',
                    latencyStatus === 'fair'
                      && 'text-yellow-600 dark:text-yellow-400',
                    latencyStatus === 'poor'
                      && 'text-red-600 dark:text-red-400',
                  )}
                >
                  {formatLatency(metrics.latency)}
                </div>
              </div>

              <div>
                <span className='text-gray-600 dark:text-gray-400'>
                  Mensagens:
                </span>
                <div className='font-medium text-gray-900 dark:text-gray-100'>
                  {metrics.messagesReceived}
                </div>
              </div>

              <div>
                <span className='text-gray-600 dark:text-gray-400'>Taxa:</span>
                <div className='font-medium text-gray-900 dark:text-gray-100'>
                  {formatMessagesPerSecond(metrics.messagesPerSecond)}/s
                </div>
              </div>

              <div>
                <span className='text-gray-600 dark:text-gray-400'>
                  Inscrições:
                </span>
                <div className='font-medium text-gray-900 dark:text-gray-100'>
                  {metrics.subscriptionCount}
                </div>
              </div>

              <div>
                <span className='text-gray-600 dark:text-gray-400'>
                  Reconexões:
                </span>
                <div className='font-medium text-gray-900 dark:text-gray-100'>
                  {metrics.reconnectAttempts}
                </div>
              </div>
            </div>

            {metrics.lastEventTimestamp > 0 && (
              <div className='pt-2 border-t border-gray-200 dark:border-gray-700'>
                <span className='text-xs text-gray-600 dark:text-gray-400'>
                  Último evento: {new Date(metrics.lastEventTimestamp).toLocaleString('pt-BR')}
                </span>
              </div>
            )}

            {/* Performance indicators */}
            <div className='pt-2 border-t border-gray-200 dark:border-gray-700'>
              <div className='text-xs text-gray-600 dark:text-gray-400 mb-2'>
                Indicadores de Performance:
              </div>

              <div className='space-y-1'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs'>Latência</span>
                  <div className='flex items-center gap-1'>
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        latencyStatus === 'excellent' && 'bg-green-500',
                        latencyStatus === 'good' && 'bg-blue-500',
                        latencyStatus === 'fair' && 'bg-yellow-500',
                        latencyStatus === 'poor' && 'bg-red-500',
                      )}
                    />
                    <span className='text-xs capitalize'>
                      {latencyStatus === 'excellent'
                        ? 'Excelente'
                        : latencyStatus === 'good'
                        ? 'Boa'
                        : latencyStatus === 'fair'
                        ? 'Regular'
                        : 'Ruim'}
                    </span>
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-xs'>Conexão</span>
                  <div className='flex items-center gap-1'>
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        isConnected ? 'bg-green-500' : 'bg-red-500',
                      )}
                    />
                    <span className='text-xs'>
                      {isConnected ? 'Estável' : 'Instável'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
