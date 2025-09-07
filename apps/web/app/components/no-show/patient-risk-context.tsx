"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
// Mock type for MVP
interface PatientRiskContextProps {
  prediction: any;
  patient: any;
  showActions?: boolean;
}
import { INTERVENTION_ACTIONS_PT /*, RiskFactor*/ } from "@/types/no-show-prediction"; // RiskFactor unused import
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  MessageSquare,
  Phone,
  // TrendingDown, // Unused import
  TrendingUp,
  User,
} from "lucide-react";
import { useState } from "react";
import { RiskIndicatorWithTooltip } from "./risk-indicator";

/**
 * Patient Risk Context Card - Detailed risk information for specific patient
 */
export function PatientRiskContext({
  prediction,
  patient,
  showActions = true,
}: PatientRiskContextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getFactorIcon = (category: string) => {
    switch (category) {
      case "behavioral":
        return <User className="h-3 w-3" />;
      case "historical":
        return <Clock className="h-3 w-3" />;
      case "scheduling":
        return <Calendar className="h-3 w-3" />;
      case "demographic":
        return <TrendingUp className="h-3 w-3" />;
      default:
        return <TrendingUp className="h-3 w-3" />;
    }
  };

  const sortedFactors = [...prediction.factors].sort(
    (a, b) => Math.abs(b.impact) - Math.abs(a.impact),
  );

  const positiveFactors = sortedFactors.filter((f) => f.impact > 0);
  const negativeFactors = sortedFactors.filter((f) => f.impact < 0);

  // Map risk level to appropriate intervention actions
  const getRiskInterventions = (riskLevel: string): string[] => {
    switch (riskLevel) {
      case "low":
        return [INTERVENTION_ACTIONS_PT.reminder];
      case "medium":
        return [INTERVENTION_ACTIONS_PT.reminder, INTERVENTION_ACTIONS_PT.confirmation];
      case "high":
        return [
          INTERVENTION_ACTIONS_PT.confirmation,
          INTERVENTION_ACTIONS_PT.incentive,
          INTERVENTION_ACTIONS_PT.personal_contact,
        ];
      case "critical":
        return [
          INTERVENTION_ACTIONS_PT.personal_contact,
          INTERVENTION_ACTIONS_PT.incentive,
          INTERVENTION_ACTIONS_PT.rescheduling,
        ];
      default:
        return [];
    }
  };

  const interventionActions = getRiskInterventions(prediction.riskLevel);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="text-sm">{patient.name}</span>
          </div>
          <RiskIndicatorWithTooltip
            riskScore={prediction.riskScore}
            riskLevel={prediction.riskLevel}
            size="sm"
            showLabel={false}
            tooltipContent={{
              confidence: prediction.confidence,
              topFactors: sortedFactors.slice(0, 3),
              recommendedActions: interventionActions,
            }}
          />
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Risk Summary */}
        <div className="rounded-lg bg-muted/50 p-3">
          <div className="flex items-center justify-between text-sm">
            <span>Confiança da Predição:</span>
            <span className="font-mono font-semibold">
              {prediction.confidence}%
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Modelo:</span>
            <span className="font-mono text-xs text-muted-foreground">
              {prediction.modelVersion}
            </span>
          </div>
        </div>

        {/* Risk Factors Preview */}
        <div>
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Fatores de Risco</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 px-2"
            >
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>

          {/* Top 2 factors preview */}
          <div className="mt-2 space-y-1">
            {sortedFactors
              .slice(0, isExpanded ? sortedFactors.length : 2)
              .map((factor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-1">
                    {getFactorIcon(factor.category)}
                    <span
                      className="truncate max-w-[180px]"
                      title={factor.description}
                    >
                      {factor.description}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs px-1",
                      factor.impact > 0
                        ? "text-red-600 border-red-200"
                        : "text-green-600 border-green-200",
                    )}
                  >
                    {factor.impact > 0 ? "+" : ""}
                    {factor.impact}
                  </Badge>
                </div>
              ))}
          </div>
        </div>

        {/* Intervention Actions */}
        {showActions && interventionActions.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium text-sm mb-2">Ações Recomendadas</h4>
              <div className="grid gap-2">
                {interventionActions.map((action: string, index: number) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="justify-start h-8 text-xs"
                  >
                    {action.includes("WhatsApp") && <MessageSquare className="mr-1 h-3 w-3" />}
                    {action.includes("telefônica") && <Phone className="mr-1 h-3 w-3" />}
                    {action.includes("reagendamento") && <Calendar className="mr-1 h-3 w-3" />}
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Timestamp */}
        <div className="text-xs text-muted-foreground text-center">
          Predição realizada em {new Date(prediction.predictedAt).toLocaleString("pt-BR")}
        </div>
      </CardContent>
    </Card>
  );
}
