import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  type FinancialMetric,
  FinancialMetricsService,
  type MetricsCalculationOptions,
} from '@/services/financial-metrics';
import { Calendar, Download, RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export interface FinancialMetricsProps {
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  autoRefresh?: boolean;
  refreshInterval?: number;
  onMetricsUpdate?: (metrics: FinancialMetric[]) => void;
  className?: string;
  'data-testid'?: string;
}

export const FinancialMetrics: React.FC<FinancialMetricsProps> = ({
  period = 'monthly',
  autoRefresh = false,
  refreshInterval = 5 * 60 * 1000, // 5 minutes
  onMetricsUpdate,
  className,
  'data-testid': testId,
}) => {
  const [metrics, setMetrics] = useState<FinancialMetric[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadMetrics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const endDate = new Date();
      const startDate = new Date();

      // Calculate start date based on period
      switch (period) {
        case 'daily':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case 'weekly':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'monthly':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'yearly':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const options: MetricsCalculationOptions = {
        period,
        startDate,
        endDate,
        includeComparisons: true,
      };

      const result = await FinancialMetricsService.calculateMetrics(options);
      setMetrics(result);
      setLastUpdated(new Date());

      if (onMetricsUpdate) {
        onMetricsUpdate(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - 1);

      const options: MetricsCalculationOptions = {
        period,
        startDate,
        endDate,
      };

      const blob = await FinancialMetricsService.exportMetrics(options, 'csv');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-metrics-${period}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export metrics');
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [period]);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(loadMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, period]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getChangeColor = (change: number): string => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  if (error) {
    return (
      <Card className={className} data-testid={testId}>
        <CardContent className='p-6'>
          <div className='text-center text-red-600'>
            <p>Error loading metrics: {error}</p>
            <Button onClick={loadMetrics} className='mt-4'>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className} data-testid={testId}>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span>Financial Metrics - {period.charAt(0).toUpperCase() + period.slice(1)}</span>
          <div className='flex items-center gap-2'>
            {lastUpdated && (
              <span className='text-sm text-gray-500'>
                <Calendar className='h-4 w-4 inline mr-1' />
                {lastUpdated.toLocaleTimeString('pt-BR')}
              </span>
            )}
            <Button
              variant='outline'
              size='sm'
              onClick={handleExport}
              disabled={isLoading || metrics.length === 0}
            >
              <Download className='h-4 w-4 mr-1' />
              Export
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={loadMetrics}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading
          ? (
            <div className='space-y-4'>
              {[1, 2, 3].map(i => (
                <div key={i} className='animate-pulse'>
                  <div className='h-4 bg-gray-200 rounded w-1/4 mb-2'></div>
                  <div className='h-8 bg-gray-200 rounded w-1/2'></div>
                </div>
              ))}
            </div>
          )
          : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {metrics.map(metric => (
                <div
                  key={metric.id}
                  className='p-4 border rounded-lg hover:shadow-md transition-shadow'
                >
                  <div className='text-sm text-gray-600 mb-1'>{metric.name}</div>
                  <div className='text-2xl font-bold mb-2'>
                    {formatCurrency(metric.value)}
                  </div>
                  <div className={`text-sm font-medium ${getChangeColor(metric.change)}`}>
                    {metric.change > 0 ? '+' : ''}
                    {metric.changePercentage.toFixed(1)}%
                    <span className='text-gray-500 ml-1'>vs. previous {metric.period}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
      </CardContent>
    </Card>
  );
};

export default FinancialMetrics;
