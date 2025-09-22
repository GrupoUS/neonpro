import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Minus } from 'lucide-react';
import React from 'react';

export interface FinancialMetric {
  id: string;
  label: string;
  value: number;
  currency: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
}

export interface FinancialWidgetProps {
  metric: FinancialMetric;
  size?: 'small' | 'medium' | 'large';
  showTrend?: boolean;
  showPercentage?: boolean;
  isLoading?: boolean;
  onRefresh?: () => void;
  onExpand?: () => void;
  className?: string;
  'data-testid'?: string;
}

export const FinancialWidget: React.FC<FinancialWidgetProps> = ({
  metric, size = 'medium', showTrend = true, showPercentage = true, isLoading = false,onRefresh, onExpand,className,
  'data-testid': testId, }) => {
  const formatCurrency = (value: number, currency: string): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up':
        return <TrendingUp className='h-4 w-4 text-green-600' aria-hidden='true' />;
      case 'down':
        return <TrendingDown className='h-4 w-4 text-red-600' aria-hidden='true' />;
      default:
        return <Minus className='h-4 w-4 text-gray-400' aria-hidden='true' />;
    }
  };

  const getTrendColor = () => {
    switch (metric.changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const sizeClasses = {
    small: 'h-32',
    medium: 'h-40',
    large: 'h-48',
  };

  const titleSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  const valueSizes = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-3xl',
  };

  if (isLoading) {
    return (
      <Card
        className={cn(sizeClasses[size], 'animate-pulse', className)}
        data-testid={testId}
        role='status'
        aria-label='Loading financial metric'
      >
        <CardHeader className='pb-2'>
          <div className='h-4 bg-gray-200 rounded w-3/4'></div>
        </CardHeader>
        <CardContent>
          <div className='h-8 bg-gray-200 rounded w-1/2 mb-2'></div>
          <div className='h-4 bg-gray-200 rounded w-1/4'></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(sizeClasses[size], 'transition-all hover:shadow-md', className)}
      data-testid={testId}
      role='region'
      aria-labelledby={`${metric.id}-title`}
    >
      <CardHeader className='pb-2'>
        <CardTitle
          id={`${metric.id}-title`}
          className={cn('flex items-center justify-between', titleSizes[size])}
        >
          <span className='text-gray-600'>{metric.label}</span>
          <div className='flex items-center gap-1'>
            {showTrend && getTrendIcon()}
            {onRefresh && (
              <Button
                variant='ghost'
                size='sm'
                onClick={onRefresh}
                aria-label={`Refresh ${metric.label} data`}
                data-testid={`${testId}-refresh`}
              >
                <RefreshCw className='h-4 w-4' />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          <div
            className={cn('font-bold', valueSizes[size])}
            aria-label={`${metric.label}: ${formatCurrency(metric.value, metric.currency)}`}
          >
            {formatCurrency(metric.value, metric.currency)}
          </div>

          {showPercentage && (
            <div className='flex items-center gap-2'>
              <span
                className={cn('text-sm font-medium', getTrendColor())}
                aria-label={`Change: ${formatPercentage(metric.change)} from previous period`}
              >
                {formatPercentage(metric.change)}
              </span>
              <span className='text-xs text-gray-500'>
                vs. previous {metric.period}
              </span>
            </div>
          )}

          {onExpand && (
            <Button
              variant='outline'
              size='sm'
              onClick={onExpand}
              className='w-full mt-2'
              aria-label={`View detailed ${metric.label} information`}
              data-testid={`${testId}-expand`}
            >
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialWidget;
