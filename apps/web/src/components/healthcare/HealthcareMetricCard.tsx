'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, Heart, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * TweakCN NEONPRO Healthcare Metric Card
 * Professional medical dashboard component inspired by TweakCN analytics design
 * Optimized for Brazilian healthcare workflows with compliance indicators
 */

export interface HealthcareMetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period: string;
  };
  icon?: React.ComponentType<{ className?: string }>;
  variant: 'revenue' | 'patients' | 'appointments' | 'satisfaction' | 'compliance';
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  complianceStatus?: 'compliant' | 'warning' | 'critical';
  loading?: boolean;
  className?: string;
}

const variantStyles = {
  revenue: {
    icon: DollarSign,
    gradient: 'from-chart-primary to-chart-success',
    bgColor: 'bg-gradient-to-br from-primary/5 to-chart-5/5',
    borderColor: 'border-primary/20',
  },
  patients: {
    icon: Users,
    gradient: 'from-chart-2 to-chart-3',
    bgColor: 'bg-gradient-to-br from-chart-2/5 to-chart-3/5',
    borderColor: 'border-chart-2/20',
  },
  appointments: {
    icon: Calendar,
    gradient: 'from-chart-4 to-chart-1',
    bgColor: 'bg-gradient-to-br from-chart-4/5 to-chart-1/5',
    borderColor: 'border-chart-4/20',
  },
  satisfaction: {
    icon: Heart,
    gradient: 'from-chart-5 to-chart-1',
    bgColor: 'bg-gradient-to-br from-chart-5/5 to-chart-1/5',
    borderColor: 'border-chart-5/20',
  },
  compliance: {
    icon: AlertCircle,
    gradient: 'from-chart-2 to-chart-4',
    bgColor: 'bg-gradient-to-br from-chart-2/5 to-chart-4/5',
    borderColor: 'border-chart-2/20',
  },
};

const complianceStatusStyles = {
  compliant: 'text-lgpd-consent-granted',
  warning: 'text-lgpd-consent-pending',
  critical: 'text-lgpd-consent-denied',
};

export function HealthcareMetricCard({
  title,
  value,
  change,
  icon,
  variant,
  subtitle,
  trend,
  complianceStatus,
  loading = false,
  className,
}: HealthcareMetricCardProps) {
  const variantConfig = variantStyles[variant];
  const IconComponent = icon || variantConfig.icon;

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      // Format large numbers with Brazilian locale
      if (val >= 1000000) {
        return (val / 1000000).toLocaleString('pt-BR', { 
          maximumFractionDigits: 1 
        }) + 'M';
      }
      if (val >= 1000) {
        return (val / 1000).toLocaleString('pt-BR', { 
          maximumFractionDigits: 1 
        }) + 'K';
      }
      return val.toLocaleString('pt-BR');
    }
    return val;
  };

  const getTrendIcon = () => {
    if (!change) return null;
    
    switch (change.type) {
      case 'increase':
        return <TrendingUp className="h-4 w-4" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getChangeColor = () => {
    if (!change) return '';
    
    switch (change.type) {
      case 'increase':
        return variant === 'revenue' || variant === 'satisfaction' 
          ? 'healthcare-metric-increase' 
          : 'healthcare-metric-decrease';
      case 'decrease':
        return variant === 'revenue' || variant === 'satisfaction'
          ? 'healthcare-metric-decrease'
          : 'healthcare-metric-increase';
      default:
        return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card className={cn("healthcare-metric-card", variantConfig.bgColor, variantConfig.borderColor, className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 bg-muted animate-pulse rounded w-24"></div>
          <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-muted animate-pulse rounded w-20 mb-1"></div>
          <div className="h-3 bg-muted animate-pulse rounded w-16"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "healthcare-metric-card healthcare-transition healthcare-hover-scale",
        variantConfig.bgColor,
        variantConfig.borderColor,
        "hover:shadow-lg",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
          {complianceStatus && (
            <span className={cn("ml-2 text-xs", complianceStatusStyles[complianceStatus])}>
              •
            </span>
          )}
        </CardTitle>
        <IconComponent 
          className={cn(
            "h-4 w-4 text-muted-foreground healthcare-transition",
            `text-${variant === 'revenue' ? 'primary' : `chart-${variant === 'patients' ? '2' : variant === 'appointments' ? '4' : variant === 'satisfaction' ? '5' : '2'}`}`
          )} 
        />
      </CardHeader>
      <CardContent>
        <div className="healthcare-metric-value">
          {formatValue(value)}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mb-2">
            {subtitle}
          </p>
        )}
        {change && (
          <div className={cn("healthcare-metric-change", getChangeColor())}>
            {getTrendIcon()}
            <span>
              {change.type === 'increase' ? '+' : ''}
              {change.value}% em relação {change.period}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Healthcare Metrics Grid Component
 * Responsive grid layout for displaying multiple metric cards
 */
export interface HealthcareMetricsGridProps {
  metrics: HealthcareMetricCardProps[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function HealthcareMetricsGrid({ 
  metrics, 
  columns = 4, 
  className 
}: HealthcareMetricsGridProps) {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn("grid gap-4", gridClasses[columns], className)}>
      {metrics.map((metric, index) => (
        <HealthcareMetricCard key={index} {...metric} />
      ))}
    </div>
  );
}

// Example usage and sample data for documentation
export const sampleMetrics: HealthcareMetricCardProps[] = [
  {
    title: 'Receita Mensal',
    value: 45231,
    variant: 'revenue',
    change: { value: 20.1, type: 'increase', period: 'mês passado' },
    subtitle: 'Total em procedimentos estéticos',
  },
  {
    title: 'Pacientes Ativos',
    value: 2847,
    variant: 'patients',
    change: { value: 15.3, type: 'increase', period: 'último trimestre' },
    subtitle: 'Pacientes com consultas agendadas',
  },
  {
    title: 'Consultas Hoje',
    value: 24,
    variant: 'appointments',
    change: { value: 8.2, type: 'increase', period: 'semana passada' },
    subtitle: 'Agendamentos confirmados',
  },
  {
    title: 'Satisfação NPS',
    value: '94%',
    variant: 'satisfaction',
    change: { value: 2.4, type: 'increase', period: 'último mês' },
    subtitle: 'Avaliação pós-procedimento',
  },
];