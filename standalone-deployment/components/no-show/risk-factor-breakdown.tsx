"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  // Clock,
  // CreditCard,
  History,
  MapPin,
  Thermometer,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react";
import React from "react";

export interface RiskFactor {
  id: string;
  name: string;
  value: string | number;
  impact: number; // 0-100
  weight: number; // 0-1
  description: string;
  category: "historical" | "demographic" | "appointment" | "external" | "behavioral";
  trend?: "increasing" | "decreasing" | "stable";
  confidence: number; // 0-100
  icon?: React.ComponentType<unknown>;
}

export interface RiskFactorBreakdownProps {
  factors: RiskFactor[];
  totalRiskScore: number;
  className?: string;
  defaultExpanded?: boolean;
}

const categoryConfig = {
  historical: {
    label: "Histórico do Paciente",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: History,
  },
  demographic: {
    label: "Demografia",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: User,
  },
  appointment: {
    label: "Consulta",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: Calendar,
  },
  external: {
    label: "Fatores Externos",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: MapPin,
  },
  behavioral: {
    label: "Comportamento",
    color: "bg-pink-100 text-pink-800 border-pink-200",
    icon: TrendingUp,
  },
};

const getImpactColor = (impact: number) => {
  if (impact >= 70) return "text-red-600";
  if (impact >= 40) return "text-orange-600";
  if (impact >= 20) return "text-yellow-600";
  return "text-green-600";
};

const getImpactLabel = (impact: number) => {
  if (impact >= 70) return "Alto Impacto";
  if (impact >= 40) return "Médio Impacto";
  if (impact >= 20) return "Baixo Impacto";
  return "Impacto Mínimo";
};

export function RiskFactorBreakdown({
  factors,
  totalRiskScore,
  className,
  defaultExpanded = false,
}: RiskFactorBreakdownProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  // Agrupar fatores por categoria
  const factorsByCategory = factors.reduce((acc, factor) => {
    if (!acc[factor.category]) {
      acc[factor.category] = [];
    }
    acc[factor.category].push(factor);
    return acc;
  }, {} as Record<string, RiskFactor[]>);

  // Ordenar fatores por impacto
  const sortedFactors = factors.sort((a, b) => b.impact - a.impact);

  // Top 3 fatores mais impactantes
  const topFactors = sortedFactors.slice(0, 3);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Análise de Fatores de Risco
          </CardTitle>
          <Badge
            variant="outline"
            className={cn(
              "px-3 py-1",
              totalRiskScore >= 70
                ? "bg-red-100 text-red-800 border-red-200"
                : totalRiskScore >= 40
                ? "bg-orange-100 text-orange-800 border-orange-200"
                : totalRiskScore >= 20
                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                : "bg-green-100 text-green-800 border-green-200",
            )}
          >
            {totalRiskScore.toFixed(1)}% risco total
          </Badge>
        </div>

        {/* Top 3 fatores resumidos */}
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            Principais fatores de risco:
          </div>
          <div className="flex flex-wrap gap-2">
            {topFactors.map((factor) => {
              const categoryInfo = categoryConfig[factor.category];
              return (
                <Badge
                  key={factor.id}
                  variant="outline"
                  className={cn("text-xs", categoryInfo.color)}
                >
                  {factor.name} ({factor.impact}%)
                </Badge>
              );
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Breakdown detalhado - collapsible */}
        <Collapsible
          open={isExpanded}
          onOpenChange={setIsExpanded}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="flex w-full items-center justify-between p-0 hover:bg-transparent"
            >
              <span className="text-sm font-medium">
                Ver análise detalhada ({factors.length} fatores)
              </span>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-4">
            <Separator />

            {/* Filtros por categoria */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="text-xs"
              >
                Todos ({factors.length})
              </Button>
              {Object.entries(factorsByCategory).map(([category, categoryFactors]) => {
                const config = categoryConfig[category as keyof typeof categoryConfig];
                return (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="text-xs"
                  >
                    <config.icon className="mr-1 h-3 w-3" />
                    {config.label} ({categoryFactors.length})
                  </Button>
                );
              })}
            </div>

            {/* Lista de fatores */}
            <div className="space-y-3">
              {sortedFactors
                .filter((factor) => !selectedCategory || factor.category === selectedCategory)
                .map((factor) => {
                  const categoryInfo = categoryConfig[factor.category];
                  const FactorIcon = factor.icon || categoryInfo.icon;

                  return (
                    <div
                      key={factor.id}
                      className="rounded-lg border p-3 space-y-2 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2 flex-1">
                          <FactorIcon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{factor.name}</span>
                              <Badge
                                variant="outline"
                                className={cn("text-xs px-2 py-0.5", categoryInfo.color)}
                              >
                                {categoryInfo.label}
                              </Badge>
                              {factor.trend && (
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs px-2 py-0.5",
                                    factor.trend === "increasing"
                                      ? "bg-red-50 text-red-700 border-red-200"
                                      : factor.trend === "decreasing"
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : "bg-gray-50 text-gray-700 border-gray-200",
                                  )}
                                >
                                  {factor.trend === "increasing" && (
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                  )}
                                  {factor.trend === "decreasing" && (
                                    <TrendingDown className="w-3 h-3 mr-1" />
                                  )}
                                  {factor.trend === "stable" && (
                                    <Thermometer className="w-3 h-3 mr-1" />
                                  )}
                                  {factor.trend === "increasing"
                                    ? "Aumentando"
                                    : factor.trend === "decreasing"
                                    ? "Diminuindo"
                                    : "Estável"}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {factor.description}
                            </div>
                            <div className="text-xs font-medium">
                              Valor: <span className="text-foreground">{factor.value}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right space-y-1 shrink-0">
                          <div
                            className={cn("font-semibold text-sm", getImpactColor(factor.impact))}
                          >
                            {factor.impact.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {getImpactLabel(factor.impact)}
                          </div>
                        </div>
                      </div>

                      {/* Barra de progresso do impacto */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Impacto no risco total</span>
                          <span>Confiança: {factor.confidence}%</span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Progress
                            value={factor.impact}
                            className="flex-1 h-2"
                          />
                          <Progress
                            value={factor.confidence}
                            className="w-16 h-2"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Resumo por categoria */}
            {selectedCategory === null && (
              <div className="space-y-3">
                <Separator />
                <div className="text-sm font-medium">Resumo por Categoria</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(factorsByCategory).map(([category, categoryFactors]) => {
                    const config = categoryConfig[category as keyof typeof categoryConfig];
                    const avgImpact = categoryFactors.reduce((sum, f) => sum + f.impact, 0)
                      / categoryFactors.length;
                    const totalImpact = categoryFactors.reduce(
                      (sum, f) => sum + f.impact * f.weight,
                      0,
                    );

                    return (
                      <div
                        key={category}
                        className="rounded-lg border p-3 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <config.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{config.label}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {categoryFactors.length} fator{categoryFactors.length !== 1 ? "es" : ""}
                        </div>
                        <div className="text-lg font-semibold">
                          {totalImpact.toFixed(1)}%
                        </div>
                        <Progress value={avgImpact} className="h-1" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* ML Model Confidence Indicator */}
        <div className="rounded-lg bg-muted/50 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Confiança do Modelo</span>
          </div>
          <div className="flex items-center gap-3">
            <Progress
              value={Math.min(
                factors.reduce((sum, f) => sum + f.confidence, 0) / factors.length,
                100,
              )}
              className="flex-1 h-2"
            />
            <span className="text-sm font-semibold">
              {Math.min(factors.reduce((sum, f) => sum + f.confidence, 0) / factors.length, 100)
                .toFixed(1)}%
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Baseado em {factors.length} fatores analisados pelo algoritmo de machine learning
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RiskFactorBreakdown;
