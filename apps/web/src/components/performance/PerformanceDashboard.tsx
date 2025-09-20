/**
 * PerformanceDashboard Component - Performance Optimization (FR-012)
 * Comprehensive performance metrics visualization and monitoring
 *
 * Features:
 * - Real-time performance metrics display
 * - Performance status indicators
 * - Brazilian Portuguese labels
 * - Accessibility compliance (WCAG 2.1 AA+)
 * - Mobile-responsive design
 * - Performance alerts and recommendations
 */

'use client';

import {
  PERFORMANCE_THRESHOLDS,
  type PerformanceStatus,
  usePerformanceMonitor,
} from '@/hooks/usePerformanceMonitor';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui';
import { Badge } from '@neonpro/ui';
import { Progress } from '@neonpro/ui';
import {
  IconActivity,
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconDeviceMobile,
  IconSearch,
  IconWifi,
} from '@tabler/icons-react';
import { useState } from 'react';

interface PerformanceDashboardProps {
  className?: string;
  compact?: boolean;
}

// Status configuration
const statusConfig: Record<
  PerformanceStatus,
  {
    color: string;
    bgColor: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  excellent: {
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    label: 'Excelente',
    icon: IconCheck,
  },
  good: {
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    label: 'Bom',
    icon: IconActivity,
  },
  fair: {
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    label: 'Regular',
    icon: IconClock,
  },
  poor: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    label: 'Ruim',
    icon: IconAlertTriangle,
  },
};

export function PerformanceDashboard({
  className,
  compact = false,
}: PerformanceDashboardProps) {
  const { metrics, alerts, getAnalytics, getPerformanceStatus, isHealthy } =
    usePerformanceMonitor();
  const [showDetails, setShowDetails] = useState(false);

  const analytics = getAnalytics();

  // Format time values
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Get progress percentage
  const getProgress = (value: number, threshold: number) => {
    return Math.min((value / threshold) * 100, 100);
  };

  // Performance metrics data
  const performanceMetrics = [
    {
      key: 'search',
      title: 'Tempo de Busca',
      value: metrics.searchResponseTime,
      threshold: PERFORMANCE_THRESHOLDS.SEARCH_RESPONSE_TIME,
      status: getPerformanceStatus(
        metrics.searchResponseTime,
        PERFORMANCE_THRESHOLDS.SEARCH_RESPONSE_TIME,
      ),
      icon: IconSearch,
      target: '<300ms',
    },
    {
      key: 'mobile',
      title: 'Carregamento Móvel',
      value: metrics.mobileLoadTime,
      threshold: PERFORMANCE_THRESHOLDS.MOBILE_LOAD_TIME,
      status: getPerformanceStatus(
        metrics.mobileLoadTime,
        PERFORMANCE_THRESHOLDS.MOBILE_LOAD_TIME,
      ),
      icon: IconDeviceMobile,
      target: '<500ms',
    },
    {
      key: 'realtime',
      title: 'Latência Tempo Real',
      value: metrics.realTimeLatency,
      threshold: PERFORMANCE_THRESHOLDS.REAL_TIME_LATENCY,
      status: getPerformanceStatus(
        metrics.realTimeLatency,
        PERFORMANCE_THRESHOLDS.REAL_TIME_LATENCY,
      ),
      icon: IconWifi,
      target: '<1s',
    },
  ];

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div
          className={cn(
            'w-3 h-3 rounded-full',
            isHealthy ? 'bg-green-500 animate-pulse' : 'bg-red-500',
          )}
        />
        <span className='text-sm text-muted-foreground'>
          Performance: {isHealthy ? 'Saudável' : 'Atenção'}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <IconActivity className='h-5 w-5' />
            Monitoramento de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {performanceMetrics.map(metric => {
              const config = statusConfig[metric.status];
              const IconComponent = metric.icon;
              const progress = getProgress(metric.value, metric.threshold);

              return (
                <div key={metric.key} className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <IconComponent className='h-4 w-4 text-muted-foreground' />
                      <span className='text-sm font-medium'>
                        {metric.title}
                      </span>
                    </div>
                    <Badge
                      variant='secondary'
                      className={cn(config.bgColor, config.color)}
                    >
                      {config.label}
                    </Badge>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>Atual:</span>
                      <span
                        className={cn(
                          'font-mono',
                          metric.value > metric.threshold
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-green-600 dark:text-green-400',
                        )}
                      >
                        {formatTime(metric.value)}
                      </span>
                    </div>

                    <Progress
                      value={progress}
                      className='h-2'
                      aria-label={`${metric.title}: ${
                        formatTime(
                          metric.value,
                        )
                      } (meta: ${metric.target})`}
                    />

                    <div className='flex items-center justify-between text-xs text-muted-foreground'>
                      <span>Meta: {metric.target}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <IconAlertTriangle className='h-5 w-5 text-yellow-600' />
              Alertas de Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {alerts.slice(-5).map((alert, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border',
                    alert.severity === 'error'
                      && 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
                    alert.severity === 'warning'
                      && 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20',
                    alert.severity === 'critical'
                      && 'border-red-300 bg-red-100 dark:border-red-700 dark:bg-red-900/30',
                  )}
                >
                  <IconAlertTriangle
                    className={cn(
                      'h-4 w-4 mt-0.5',
                      alert.severity === 'error'
                        && 'text-red-600 dark:text-red-400',
                      alert.severity === 'warning'
                        && 'text-yellow-600 dark:text-yellow-400',
                      alert.severity === 'critical'
                        && 'text-red-700 dark:text-red-300',
                    )}
                  />

                  <div className='flex-1 space-y-1'>
                    <p className='text-sm font-medium'>{alert.message}</p>
                    <p className='text-xs text-muted-foreground'>
                      {new Date(alert.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>

                  <Badge
                    variant='outline'
                    className={cn(
                      alert.severity === 'error'
                        && 'border-red-300 text-red-700 dark:border-red-700 dark:text-red-300',
                      alert.severity === 'warning'
                        && 'border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-300',
                      alert.severity === 'critical'
                        && 'border-red-400 text-red-800 dark:border-red-600 dark:text-red-200',
                    )}
                  >
                    {alert.severity === 'error' && 'Erro'}
                    {alert.severity === 'warning' && 'Aviso'}
                    {alert.severity === 'critical' && 'Crítico'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Analytics */}
      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span className='flex items-center gap-2'>
                <IconActivity className='h-5 w-5' />
                Análise de Performance
              </span>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className='text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
              >
                {showDetails ? 'Ocultar' : 'Ver'} Detalhes
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <h4 className='text-sm font-medium text-muted-foreground'>
                  Busca (Média)
                </h4>
                <p className='text-2xl font-bold'>
                  {formatTime(analytics.average.searchResponseTime)}
                </p>
                <p className='text-xs text-muted-foreground'>Meta: &lt;300ms</p>
              </div>

              <div className='space-y-2'>
                <h4 className='text-sm font-medium text-muted-foreground'>
                  Mobile (Média)
                </h4>
                <p className='text-2xl font-bold'>
                  {formatTime(analytics.average.mobileLoadTime)}
                </p>
                <p className='text-xs text-muted-foreground'>Meta: &lt;500ms</p>
              </div>

              <div className='space-y-2'>
                <h4 className='text-sm font-medium text-muted-foreground'>
                  Tempo Real (Média)
                </h4>
                <p className='text-2xl font-bold'>
                  {formatTime(analytics.average.realTimeLatency)}
                </p>
                <p className='text-xs text-muted-foreground'>Meta: &lt;1s</p>
              </div>
            </div>

            {showDetails && (
              <div className='mt-6 pt-6 border-t space-y-4'>
                <h4 className='text-sm font-medium'>Métricas Detalhadas</h4>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                  <div>
                    <span className='text-muted-foreground'>
                      Tempo de Página:
                    </span>
                    <p className='font-mono'>
                      {formatTime(metrics.pageLoadTime)}
                    </p>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Renderização:</span>
                    <p className='font-mono'>
                      {formatTime(metrics.renderTime)}
                    </p>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Memória:</span>
                    <p className='font-mono'>
                      {metrics.memoryUsage.toFixed(1)}MB
                    </p>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Rede:</span>
                    <p className='font-mono'>
                      {formatTime(metrics.networkLatency)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
