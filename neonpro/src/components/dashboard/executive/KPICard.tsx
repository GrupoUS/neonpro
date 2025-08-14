/**
 * KPI Card Component
 * 
 * Displays individual KPI metrics with trend indicators, status badges,
 * and interactive features for the executive dashboard.
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

import { KPIMetric, KPIStatus, TrendDirection } from '@/lib/dashboard/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface KPICardProps {
  kpi: KPIMetric;
  size?: 'sm' | 'md' | 'lg';
  showTrend?: boolean;
  showTarget?: boolean;
  showActions?: boolean;
  onClick?: (kpi: KPIMetric) => void;
  onDrillDown?: (kpi: KPIMetric) => void;
  onAlert?: (kpi: KPIMetric) => void;
}

interface KPICardVariant {
  bgColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
}

// ============================================================================
// CONSTANTS & HELPERS
// ============================================================================

const KPI_STATUS_VARIANTS: Record<KPIStatus, KPICardVariant> = {
  excellent: {
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-900',
    iconColor: 'text-green-600',
    badgeVariant: 'default'
  },
  good: {
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-900',
    iconColor: 'text-blue-600',
    badgeVariant: 'secondary'
  },
  warning: {
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-900',
    iconColor: 'text-yellow-600',
    badgeVariant: 'outline'
  },
  critical: {
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-900',
    iconColor: 'text-red-600',
    badgeVariant: 'destructive'
  }
};

const SIZE_VARIANTS = {
  sm: {
    cardClass: 'h-24',
    titleClass: 'text-sm',
    valueClass: 'text-lg',
    iconSize: 'h-4 w-4',
    padding: 'p-3'
  },
  md: {
    cardClass: 'h-32',
    titleClass: 'text-base',
    valueClass: 'text-2xl',
    iconSize: 'h-5 w-5',
    padding: 'p-4'
  },
  lg: {
    cardClass: 'h-40',
    titleClass: 'text-lg',
    valueClass: 'text-3xl',
    iconSize: 'h-6 w-6',
    padding: 'p-6'
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatKPIValue = (value: number, format: string): string => {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    
    case 'percentage':
      return `${value.toFixed(1)}%`;
    
    case 'number':
      return new Intl.NumberFormat('pt-BR').format(value);
    
    case 'decimal':
      return value.toFixed(2);
    
    case 'integer':
      return Math.round(value).toString();
    
    default:
      return value.toString();
  }
};

const getTrendIcon = (direction: TrendDirection, iconSize: string) => {
  const className = `${iconSize} ${direction === 'up' ? 'text-green-600' : 
                     direction === 'down' ? 'text-red-600' : 'text-gray-400'}`;
  
  switch (direction) {
    case 'up':
      return <TrendingUp className={className} />;
    case 'down':
      return <TrendingDown className={className} />;
    default:
      return <Minus className={className} />;
  }
};

const getStatusIcon = (status: KPIStatus, iconSize: string) => {
  const variant = KPI_STATUS_VARIANTS[status];
  const className = `${iconSize} ${variant.iconColor}`;
  
  switch (status) {
    case 'excellent':
      return <CheckCircle className={className} />;
    case 'good':
      return <CheckCircle className={className} />;
    case 'warning':
      return <AlertTriangle className={className} />;
    case 'critical':
      return <XCircle className={className} />;
    default:
      return <Clock className={className} />;
  }
};

const getStatusLabel = (status: KPIStatus): string => {
  switch (status) {
    case 'excellent':
      return 'Excelente';
    case 'good':
      return 'Bom';
    case 'warning':
      return 'Atenção';
    case 'critical':
      return 'Crítico';
    default:
      return 'Desconhecido';
  }
};

const getTrendLabel = (direction: TrendDirection, changePercent?: number): string => {
  const percent = changePercent ? ` (${Math.abs(changePercent).toFixed(1)}%)` : '';
  
  switch (direction) {
    case 'up':
      return `Crescimento${percent}`;
    case 'down':
      return `Declínio${percent}`;
    default:
      return 'Estável';
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const KPICard: React.FC<KPICardProps> = ({
  kpi,
  size = 'md',
  showTrend = true,
  showTarget = true,
  showActions = true,
  onClick,
  onDrillDown,
  onAlert
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const variant = KPI_STATUS_VARIANTS[kpi.status];
  const sizeVariant = SIZE_VARIANTS[size];
  
  const formattedValue = useMemo(() => {
    return formatKPIValue(kpi.currentValue, kpi.format);
  }, [kpi.currentValue, kpi.format]);
  
  const formattedTarget = useMemo(() => {
    if (!kpi.target) return null;
    return formatKPIValue(kpi.target, kpi.format);
  }, [kpi.target, kpi.format]);
  
  const targetProgress = useMemo(() => {
    if (!kpi.target) return null;
    return Math.min(100, Math.max(0, (kpi.currentValue / kpi.target) * 100));
  }, [kpi.currentValue, kpi.target]);
  
  const trendLabel = useMemo(() => {
    return getTrendLabel(kpi.trend.direction, kpi.trend.changePercent);
  }, [kpi.trend]);
  
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleCardClick = () => {
    onClick?.(kpi);
  };
  
  const handleDrillDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDrillDown?.(kpi);
  };
  
  const handleAlert = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAlert?.(kpi);
  };
  
  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  
  const renderHeader = () => (
    <CardHeader className={`${sizeVariant.padding} pb-2`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <CardTitle className={`${sizeVariant.titleClass} font-medium text-gray-900 truncate`}>
            {kpi.name}
          </CardTitle>
          {kpi.description && size !== 'sm' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-gray-400 mt-1 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{kpi.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusIcon(kpi.status, sizeVariant.iconSize)}
          
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onDrillDown && (
                  <DropdownMenuItem onClick={handleDrillDown}>
                    Ver Detalhes
                  </DropdownMenuItem>
                )}
                {onAlert && kpi.status === 'critical' && (
                  <DropdownMenuItem onClick={handleAlert}>
                    Criar Alerta
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Exportar Dados
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </CardHeader>
  );
  
  const renderContent = () => (
    <CardContent className={`${sizeVariant.padding} pt-0`}>
      <div className="space-y-2">
        {/* Main Value */}
        <div className="flex items-baseline justify-between">
          <span className={`${sizeVariant.valueClass} font-bold ${variant.textColor}`}>
            {formattedValue}
          </span>
          
          {showTrend && kpi.trend && (
            <div className="flex items-center gap-1">
              {getTrendIcon(kpi.trend.direction, sizeVariant.iconSize)}
              {kpi.trend.changePercent && size !== 'sm' && (
                <span className={`text-xs ${
                  kpi.trend.direction === 'up' ? 'text-green-600' :
                  kpi.trend.direction === 'down' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {Math.abs(kpi.trend.changePercent).toFixed(1)}%
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge variant={variant.badgeVariant} className="text-xs">
            {getStatusLabel(kpi.status)}
          </Badge>
          
          {kpi.lastUpdated && size !== 'sm' && (
            <span className="text-xs text-gray-500">
              {new Date(kpi.lastUpdated).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          )}
        </div>
        
        {/* Target Progress */}
        {showTarget && kpi.target && targetProgress !== null && size !== 'sm' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Meta: {formattedTarget}</span>
              <span>{targetProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  targetProgress >= 100 ? 'bg-green-500' :
                  targetProgress >= 80 ? 'bg-blue-500' :
                  targetProgress >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, targetProgress)}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Trend Information */}
        {showTrend && kpi.trend && size === 'lg' && (
          <div className="pt-2 border-t border-gray-100">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 text-xs text-gray-600 cursor-help">
                    {getTrendIcon(kpi.trend.direction, 'h-3 w-3')}
                    <span>{trendLabel}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p>Período: {kpi.trend.period}</p>
                    {kpi.trend.previousValue && (
                      <p>
                        Valor anterior: {formatKPIValue(kpi.trend.previousValue, kpi.format)}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </CardContent>
  );
  
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <Card
      className={`
        group relative transition-all duration-200 cursor-pointer
        ${sizeVariant.cardClass}
        ${variant.bgColor}
        ${variant.borderColor}
        ${isHovered ? 'shadow-md scale-105' : 'shadow-sm'}
        ${onClick ? 'hover:shadow-lg' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {renderHeader()}
      {renderContent()}
      
      {/* Loading Overlay */}
      {kpi.isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
        </div>
      )}
      
      {/* Critical Alert Indicator */}
      {kpi.status === 'critical' && (
        <div className="absolute -top-1 -right-1">
          <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
        </div>
      )}
    </Card>
  );
};

export default KPICard;
