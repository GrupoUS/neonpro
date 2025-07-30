'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowUpIcon, ArrowDownIcon, DollarSign, TrendingUp, Users, Target } from 'lucide-react'
import { MarketingROIMetrics } from '@/app/types/marketing-roi'

interface ROIMetricsOverviewProps {
  metrics: MarketingROIMetrics
  isLoading?: boolean
  period?: string
}

export function ROIMetricsOverview({ metrics, isLoading = false, period = '30d' }: ROIMetricsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpIcon className="h-4 w-4 text-green-600" />
    if (change < 0) return <ArrowDownIcon className="h-4 w-4 text-red-600" />
    return null
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total ROI */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ROI Total</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPercentage(metrics.totalROI)}</div>
          <div className={`text-xs flex items-center gap-1 ${getChangeColor(metrics.roiChange)}`}>
            {getChangeIcon(metrics.roiChange)}
            {formatPercentage(metrics.roiChange)} vs período anterior
          </div>
          <Progress 
            value={Math.min(Math.max(metrics.totalROI, 0), 100)} 
            className="mt-2"
          />
        </CardContent>
      </Card>

      {/* Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
          <div className={`text-xs flex items-center gap-1 ${getChangeColor(metrics.revenueChange)}`}>
            {getChangeIcon(metrics.revenueChange)}
            {formatPercentage(metrics.revenueChange)} vs período anterior
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Meta: {formatCurrency(metrics.revenueTarget || 0)}
          </div>
        </CardContent>
      </Card>

      {/* Cost */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Investimento Total</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.totalCost)}</div>
          <div className={`text-xs flex items-center gap-1 ${getChangeColor(-metrics.costChange)}`}>
            {getChangeIcon(-metrics.costChange)}
            {formatPercentage(metrics.costChange)} vs período anterior
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Orçamento: {formatCurrency(metrics.budgetRemaining || 0)} restante
          </div>
        </CardContent>
      </Card>

      {/* Conversions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversões</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalConversions.toLocaleString()}</div>
          <div className={`text-xs flex items-center gap-1 ${getChangeColor(metrics.conversionChange)}`}>
            {getChangeIcon(metrics.conversionChange)}
            {formatPercentage(metrics.conversionChange)} vs período anterior
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Taxa: {formatPercentage(metrics.conversionRate || 0)}
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-lg">Métricas Adicionais - {period}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground">CAC</div>
              <div className="text-lg font-bold">{formatCurrency(metrics.averageCAC || 0)}</div>
              <Badge variant={metrics.averageCAC && metrics.averageCAC < 100 ? 'default' : 'destructive'}>
                {metrics.averageCAC && metrics.averageCAC < 100 ? 'Ótimo' : 'Alto'}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground">LTV</div>
              <div className="text-lg font-bold">{formatCurrency(metrics.averageLTV || 0)}</div>
              <Badge variant={metrics.averageLTV && metrics.averageLTV > 500 ? 'default' : 'secondary'}>
                {metrics.averageLTV && metrics.averageLTV > 500 ? 'Alto' : 'Médio'}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground">LTV/CAC</div>
              <div className="text-lg font-bold">
                {metrics.averageLTV && metrics.averageCAC 
                  ? (metrics.averageLTV / metrics.averageCAC).toFixed(1) 
                  : '0'}
              </div>
              <Badge variant={
                metrics.averageLTV && metrics.averageCAC && 
                (metrics.averageLTV / metrics.averageCAC) > 3 ? 'default' : 'destructive'
              }>
                {metrics.averageLTV && metrics.averageCAC && 
                 (metrics.averageLTV / metrics.averageCAC) > 3 ? 'Saudável' : 'Risco'}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground">ROAS</div>
              <div className="text-lg font-bold">{(metrics.roas || 0).toFixed(2)}</div>
              <Badge variant={metrics.roas && metrics.roas > 4 ? 'default' : 'secondary'}>
                {metrics.roas && metrics.roas > 4 ? 'Excelente' : 'Normal'}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground">Margem</div>
              <div className="text-lg font-bold">{formatPercentage(metrics.profitMargin || 0)}</div>
              <Badge variant={metrics.profitMargin && metrics.profitMargin > 20 ? 'default' : 'secondary'}>
                {metrics.profitMargin && metrics.profitMargin > 20 ? 'Alta' : 'Média'}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground">Payback</div>
              <div className="text-lg font-bold">{(metrics.paybackPeriod || 0).toFixed(0)} dias</div>
              <Badge variant={metrics.paybackPeriod && metrics.paybackPeriod < 90 ? 'default' : 'destructive'}>
                {metrics.paybackPeriod && metrics.paybackPeriod < 90 ? 'Rápido' : 'Lento'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}