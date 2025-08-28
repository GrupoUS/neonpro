'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { 
  RiskIndicatorProps, 
  RISK_THRESHOLDS, 
  RISK_LABELS_PT, 
  RISK_COLORS 
} from '@/types/no-show-prediction';

/**
 * Risk Indicator Component for No-Show Prediction
 * Displays color-coded risk levels with Brazilian Portuguese localization
 */
export function RiskIndicator({ 
  riskScore, 
  riskLevel, 
  size = 'medium',
  showLabel = true,
  className 
}: RiskIndicatorProps) {
  
  const getRiskIcon = (level: string) => {
    const iconProps = { 
      className: cn(
        'inline-block',
        size === 'small' ? 'h-3 w-3' : 
        size === 'medium' ? 'h-4 w-4' : 'h-5 w-5'
      ) 
    };
    
    switch (level) {
      case 'low': return <CheckCircle {...iconProps} />;
      case 'medium': return <AlertCircle {...iconProps} />;
      case 'high': return <AlertTriangle {...iconProps} />;
      case 'critical': return <XCircle {...iconProps} />;
      default: return <AlertCircle {...iconProps} />;
    }
  };

  const getRiskPercentageColor = () => {
    if (riskScore <= RISK_THRESHOLDS.LOW) return 'text-green-600';
    if (riskScore <= RISK_THRESHOLDS.MEDIUM) return 'text-yellow-600';
    if (riskScore <= RISK_THRESHOLDS.HIGH) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <Badge 
        variant="outline" 
        className={cn(
          'inline-flex items-center gap-1',
          RISK_COLORS[riskLevel],
          size === 'small' ? 'px-1 py-0 text-xs' :
          size === 'medium' ? 'px-2 py-1 text-sm' : 'px-3 py-1 text-base'
        )}
      >
        {getRiskIcon(riskLevel)}
        {showLabel && (
          <span className="font-medium">
            {RISK_LABELS_PT[riskLevel]}
          </span>
        )}
      </Badge>
      
      <span className={cn(
        'font-mono font-bold',
        getRiskPercentageColor(),
        size === 'small' ? 'text-xs' :
        size === 'medium' ? 'text-sm' : 'text-base'
      )}>
        {riskScore}%
      </span>
    </div>
  );
}

/**
 * Risk Indicator with Tooltip - Enhanced version with hover details
 */
export function RiskIndicatorWithTooltip({
  riskScore,
  riskLevel,
  size = 'medium',
  showLabel = true,
  className,
  tooltipContent
}: RiskIndicatorProps & { tooltipContent?: {
  confidence: number;
  topFactors: Array<{ factor: string; impact: number; description: string }>;
  recommendedActions: string[];
}}) {
  
  if (!tooltipContent) {
    return (
      <RiskIndicator 
        riskScore={riskScore}
        riskLevel={riskLevel}
        size={size}
        showLabel={showLabel}
        className={className}
      />
    );
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div className="cursor-pointer">
            <RiskIndicator 
              riskScore={riskScore}
              riskLevel={riskLevel}
              size={size}
              showLabel={showLabel}
              className={className}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-sm p-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-sm">Detalhes da Predição</h4>
              <p className="text-xs text-muted-foreground">
                Confiança: {tooltipContent.confidence}%
              </p>
            </div>
            
            {tooltipContent.topFactors.length > 0 && (
              <div>
                <h5 className="font-medium text-xs">Principais Fatores:</h5>
                <ul className="mt-1 space-y-1">
                  {tooltipContent.topFactors.slice(0, 3).map((factor, index) => (
                    <li key={index} className="text-xs">
                      <span className={cn(
                        'inline-block w-8 text-center',
                        factor.impact > 0 ? 'text-red-500' : 'text-green-500'
                      )}>
                        {factor.impact > 0 ? '+' : ''}{factor.impact}
                      </span>
                      {factor.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {tooltipContent.recommendedActions.length > 0 && (
              <div>
                <h5 className="font-medium text-xs">Ações Recomendadas:</h5>
                <ul className="mt-1 space-y-1">
                  {tooltipContent.recommendedActions.slice(0, 2).map((action, index) => (
                    <li key={index} className="text-xs text-blue-600">
                      • {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}