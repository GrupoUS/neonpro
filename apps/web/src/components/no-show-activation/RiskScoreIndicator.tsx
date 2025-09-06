"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  // AlertCircle,
  // AlertTriangle,
  // Calendar,
  CheckCircle,
  Clock,
  Info,
  Phone,
  TrendingUp,
  // User,
  XCircle,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";

// Risk Score Types
export interface RiskFactor {
  factor: string;
  impact: number; // -1.0 to 1.0
  description: string;
  category: "historical" | "temporal" | "contextual" | "behavioral";
}

export interface RiskScoreData {
  patientId: string;
  appointmentId: string;
  noShowProbability: number; // 0.0 to 1.0
  confidenceScore: number; // 0.0 to 1.0
  riskCategory: "low" | "medium" | "high" | "critical";
  contributingFactors: RiskFactor[];
  lastUpdated: string;
  modelVersion: string;
}

// Component Props
export interface RiskScoreIndicatorProps {
  riskData: RiskScoreData;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
  showTooltip?: boolean;
  interactive?: boolean;
  onInterventionTrigger?: (appointmentId: string, riskLevel: string) => void;
  className?: string;
}

// Risk configuration
const RISK_CONFIG = {
  low: {
    threshold: 0.25,
    color: "text-green-600 border-green-200 bg-green-50",
    badgeColor: "bg-green-100 text-green-800",
    icon: CheckCircle,
    label: "Baixo Risco",
    description: "Probabilidade baixa de falta",
  },
  medium: {
    threshold: 0.5,
    color: "text-yellow-600 border-yellow-200 bg-yellow-50",
    badgeColor: "bg-yellow-100 text-yellow-800",
    icon: CheckCircle,
    label: "Risco Moderado",
    description: "Atenção recomendada",
  },
  high: {
    threshold: 0.75,
    color: "text-orange-600 border-orange-200 bg-orange-50",
    badgeColor: "bg-orange-100 text-orange-800",
    icon: XCircle,
    label: "Alto Risco",
    description: "Intervenção recomendada",
  },
  critical: {
    threshold: 1,
    color: "text-red-600 border-red-200 bg-red-50",
    badgeColor: "bg-red-100 text-red-800",
    icon: XCircle,
    label: "Risco Crítico",
    description: "Intervenção urgente necessária",
  },
};

export function RiskScoreIndicator({
  riskData,
  size = "md",
  showDetails = false,
  showTooltip = true,
  interactive = true,
  onInterventionTrigger,
  className = "",
}: RiskScoreIndicatorProps) {
  const [showFactors, setShowFactors] = useState(false);

  // Memoized risk configuration
  const riskConfig = useMemo(() => {
    return RISK_CONFIG[riskData.riskCategory];
  }, [riskData.riskCategory]);

  // Calculate risk percentage
  const riskPercentage = useMemo(() => {
    return Math.round(riskData.noShowProbability * 100);
  }, [riskData.noShowProbability]);

  // Format last updated time
  const formattedDate = useMemo(() => {
    const date = new Date(riskData.lastUpdated);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }, [riskData.lastUpdated]);

  // Handle intervention trigger
  const handleInterventionTrigger = useCallback(() => {
    if (onInterventionTrigger && interactive) {
      onInterventionTrigger(riskData.appointmentId, riskData.riskCategory);
    }
  }, [
    onInterventionTrigger,
    interactive,
    riskData.appointmentId,
    riskData.riskCategory,
  ]);

  // Size configurations
  const sizeConfig = {
    sm: {
      indicator: "h-6 w-6",
      text: "text-sm",
      badge: "text-xs",
      progress: "h-2",
    },
    md: {
      indicator: "h-8 w-8",
      text: "text-base",
      badge: "text-sm",
      progress: "h-3",
    },
    lg: {
      indicator: "h-12 w-12",
      text: "text-lg",
      badge: "text-base",
      progress: "h-4",
    },
  };

  const IconComponent = riskConfig.icon;

  // Simple indicator for compact display
  if (!showDetails) {
    const indicator = (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg p-2 border-2 transition-all duration-200",
          riskConfig.color,
          interactive && "hover:shadow-md cursor-pointer",
          className,
        )}
      >
        <IconComponent className={cn(sizeConfig[size].indicator)} />
        <div className="flex flex-col">
          <span className={cn("font-medium", sizeConfig[size].text)}>
            {riskPercentage}%
          </span>
          <Badge className={cn(riskConfig.badgeColor, sizeConfig[size].badge)}>
            {riskConfig.label}
          </Badge>
        </div>
      </div>
    );

    if (!showTooltip) {
      return indicator;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{indicator}</TooltipTrigger>
          <TooltipContent side="top" className="max-w-sm">
            <div className="space-y-2">
              <div className="font-medium">
                {riskConfig.label} - {riskPercentage}% probabilidade
              </div>
              <div className="text-sm text-muted-foreground">
                {riskConfig.description}
              </div>
              <div className="text-xs text-muted-foreground">
                Confiança: {Math.round(riskData.confidenceScore * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">
                Atualizado: {formattedDate}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Detailed display with factors
  return (
    <Card className={cn("transition-all duration-200", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconComponent
              className={cn(
                sizeConfig[size].indicator,
                riskConfig.color.split(" ")[0],
              )}
            />
            <span className={cn(sizeConfig[size].text)}>
              Análise de Risco - {riskPercentage}%
            </span>
          </div>
          <Badge className={riskConfig.badgeColor}>{riskConfig.label}</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Risk Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Probabilidade de Falta</span>
            <span className="font-medium">{riskPercentage}%</span>
          </div>
          <Progress
            value={riskPercentage}
            className={cn(sizeConfig[size].progress)}
          />
        </div>

        {/* Confidence Score */}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            Confiança do Modelo
          </span>
          <span className="font-medium">
            {Math.round(riskData.confidenceScore * 100)}%
          </span>
        </div>

        {/* Contributing Factors */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFactors(!showFactors)}
            className="p-0 h-auto font-normal text-sm text-muted-foreground hover:text-foreground"
          >
            <Info className="h-4 w-4 mr-1" />
            {showFactors ? "Ocultar" : "Ver"} Fatores Contribuintes (
            {riskData.contributingFactors.length})
          </Button>

          {showFactors && (
            <div className="grid gap-2 mt-2">
              {riskData.contributingFactors.slice(0, 5).map((factor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted rounded-lg text-sm"
                >
                  <span className="font-medium">{factor.factor}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        factor.impact > 0 ? "text-red-600" : "text-green-600",
                      )}
                    >
                      {factor.impact > 0 ? "+" : ""}
                      {Math.round(factor.impact * 100)}%
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{factor.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ))}

              {riskData.contributingFactors.length > 5 && (
                <div className="text-xs text-muted-foreground text-center py-1">
                  +{riskData.contributingFactors.length - 5} fatores adicionais
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {interactive
          && (riskData.riskCategory === "high"
            || riskData.riskCategory === "critical")
          && (
            <div className="flex gap-2 pt-2 border-t">
              <Button
                size="sm"
                onClick={handleInterventionTrigger}
                className="flex-1"
              >
                <Phone className="h-4 w-4 mr-1" />
                Acionar Intervenção
              </Button>
            </div>
          )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formattedDate}
          </span>
          <span>Modelo v{riskData.modelVersion}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default RiskScoreIndicator;
