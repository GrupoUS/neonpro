'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface KPICardProps {
  title: string;
  value: string | number;
  formattedValue?: string;
  previousValue?: number;
  percentageChange?: number;
  trend?: 'up' | 'down' | 'stable';
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function KPICard({
  title,
  value,
  formattedValue,
  previousValue,
  percentageChange,
  trend = 'stable',
  description,
  icon,
  className
}: KPICardProps) {
  const displayValue = formattedValue || value;
  
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-4 w-4 text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{displayValue}</div>
        {(percentageChange !== undefined || trend !== 'stable') && (
          <div className="flex items-center pt-1">
            {getTrendIcon()}
            {percentageChange !== undefined && (
              <span className={cn("text-xs ml-1", getTrendColor())}>
                {percentageChange > 0 ? '+' : ''}{percentageChange}%
              </span>
            )}
            {description && (
              <span className="text-xs text-muted-foreground ml-2">
                {description}
              </span>
            )}
          </div>
        )}
        {description && !percentageChange && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}