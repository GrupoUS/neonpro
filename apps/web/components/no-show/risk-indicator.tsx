"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import React from "react";

export interface RiskLevel {
  level: "low" | "medium" | "high" | "critical";
  score: number;
  factors: string[];
  recommendation: string;
}

export interface RiskIndicatorProps {
  risk: RiskLevel;
  className?: string;
  showTooltip?: boolean;
  compact?: boolean;
}

const riskConfig = {
  low: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
    label: "Baixo Risco",
  },
  medium: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
    label: "Risco Médio",
  },
  high: {
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: AlertTriangle,
    label: "Alto Risco",
  },
  critical: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
    label: "Risco Crítico",
  },
};

export function RiskIndicator({
  risk,
  className,
  showTooltip = true,
  compact = false,
}: RiskIndicatorProps) {
  const config = riskConfig[risk.level];
  const Icon = config.icon;

  const indicator = (
    <Badge
      variant="outline"
      className={cn(
        config.color,
        "flex items-center gap-1.5 font-medium",
        compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
        className,
      )}
    >
      <Icon className={cn("shrink-0", compact ? "h-3 w-3" : "h-4 w-4")} />
      {compact
        ? risk.score.toFixed(0)
        : `${config.label} (${risk.score.toFixed(1)}%)`}
    </Badge>
  );

  if (!showTooltip) {
    return indicator;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{indicator}</TooltipTrigger>
        <TooltipContent className="max-w-sm p-4">
          <div className="space-y-2">
            <div className="font-semibold text-sm">
              {config.label} - {risk.score.toFixed(1)}% de chance de não comparecimento
            </div>

            {risk.factors.length > 0 && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  Fatores de Risco:
                </div>
                <ul className="text-xs space-y-0.5">
                  {risk.factors.map((factor, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-muted-foreground">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {risk.recommendation && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  Recomendação:
                </div>
                <div className="text-xs">{risk.recommendation}</div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function RiskIndicatorWithTooltip(props: RiskIndicatorProps) {
  return <RiskIndicator {...props} showTooltip />;
}

// Componente para lista de indicadores
export interface RiskIndicatorListProps {
  risks: {
    id: string;
    patientName: string;
    appointmentDate: string;
    risk: RiskLevel;
  }[];
  onRiskClick?: (riskId: string) => void;
}

export function RiskIndicatorList({
  risks,
  onRiskClick,
}: RiskIndicatorListProps) {
  return (
    <div className="space-y-2">
      {risks.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
          onClick={() => onRiskClick?.(item.id)}
        >
          <div className="flex-1">
            <div className="font-medium text-sm">{item.patientName}</div>
            <div className="text-xs text-muted-foreground">
              {item.appointmentDate}
            </div>
          </div>
          <RiskIndicatorWithTooltip risk={item.risk} compact />
        </div>
      ))}
    </div>
  );
}

// Hook para calcular risco baseado em fatores
export function useRiskCalculation() {
  const calculateRisk = React.useCallback(
    (factors: {
      previousNoShows: number;
      daysSinceLastAppointment: number;
      appointmentType: string;
      timeOfDay: string;
      weatherCondition?: string;
      patientAge: number;
      hasInsurance: boolean;
    }): RiskLevel => {
      let score = 0;
      const riskFactors: string[] = [];

      // Histórico de não comparecimento
      if (factors.previousNoShows > 0) {
        score += factors.previousNoShows * 15;
        riskFactors.push(
          `${factors.previousNoShows} não comparecimento(s) anterior(es)`,
        );
      }

      // Tempo desde última consulta
      if (factors.daysSinceLastAppointment > 180) {
        score += 10;
        riskFactors.push("Mais de 6 meses desde a última consulta");
      }

      // Tipo de consulta
      if (factors.appointmentType === "routine") {
        score += 5;
        riskFactors.push("Consulta de rotina");
      }

      // Horário da consulta
      if (
        factors.timeOfDay === "early_morning"
        || factors.timeOfDay === "late_afternoon"
      ) {
        score += 8;
        riskFactors.push("Horário com maior índice de faltas");
      }

      // Idade do paciente
      if (factors.patientAge < 25 || factors.patientAge > 65) {
        score += 5;
        riskFactors.push("Faixa etária com maior risco");
      }

      // Seguro de saúde
      if (!factors.hasInsurance) {
        score += 12;
        riskFactors.push("Paciente sem plano de saúde");
      }

      // Determinar nível de risco
      let level: RiskLevel["level"];
      let recommendation: string;

      if (score >= 40) {
        level = "critical";
        recommendation = "Contato obrigatório 24h antes + confirmação no dia";
      } else if (score >= 25) {
        level = "high";
        recommendation = "Contato de confirmação 48h antes da consulta";
      } else if (score >= 15) {
        level = "medium";
        recommendation = "Lembrete automático 24h antes";
      } else {
        level = "low";
        recommendation = "Acompanhamento padrão";
      }

      return {
        level,
        score: Math.min(score, 100),
        factors: riskFactors,
        recommendation,
      };
    },
    [],
  );

  return { calculateRisk };
}

export default RiskIndicator;
