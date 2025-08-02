'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  UserX, 
  Calendar,
  Heart,
  AlertTriangle,
  Target
} from 'lucide-react';
import { RetentionDashboardOverview } from '@/types/retention-analytics';
import { cn } from '@/lib/utils';

interface RetentionMetricsCardsProps {
  metrics: RetentionDashboardOverview;
}

export function RetentionMetricsCards({ metrics }: RetentionMetricsCardsProps) {
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable', isPositive: boolean = true) => {
    if (trend === 'stable') return 'text-blue-600';
    
    if (isPositive) {
      return trend === 'up' ? 'text-green-600' : 'text-red-600';
    } else {
      return trend === 'up' ? 'text-red-600' : 'text-green-600';
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Taxa de Retenção Global */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Taxa de Retenção
          </CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPercentage(metrics.overall_retention_rate)}
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            {getTrendIcon(metrics.retention_trend)}
            <span className={cn(
              getTrendColor(metrics.retention_trend, true)
            )}>
              {formatPercentage(Math.abs(metrics.retention_change))} vs mês anterior
            </span>
          </div>
          <Progress 
            value={metrics.overall_retention_rate * 100} 
            className="mt-2"
          />
        </CardContent>
      </Card>

      {/* Risco de Churn */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pacientes em Risco
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {metrics.at_risk_patients}
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <UserX className="h-3 w-3" />
            <span>
              {formatPercentage(metrics.churn_risk_percentage)} dos pacientes ativos
            </span>
          </div>
          <div className="mt-2 flex gap-1">
            <Badge variant="destructive" className="text-xs">
              Alto Risco: {metrics.high_risk_patients}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Pacientes Ativos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pacientes Ativos
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.active_patients.toLocaleString('pt-BR')}
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            {getTrendIcon(metrics.active_patients_trend)}
            <span className={cn(
              getTrendColor(metrics.active_patients_trend, true)
            )}>
              {Math.abs(metrics.active_patients_change)} vs mês anterior
            </span>
          </div>
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              Novos: {metrics.new_patients_this_month}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Valor de Vida do Cliente */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            LTV Médio
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(metrics.average_ltv)}
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            {getTrendIcon(metrics.ltv_trend)}
            <span className={cn(
              getTrendColor(metrics.ltv_trend, true)
            )}>
              {formatCurrency(Math.abs(metrics.ltv_change))} vs mês anterior
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Baseado em {metrics.ltv_calculation_months} meses
          </div>
        </CardContent>
      </Card>
    </div>
  );
}