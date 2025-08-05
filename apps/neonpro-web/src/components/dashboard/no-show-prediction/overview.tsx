// Story 11.2: No-Show Prediction Overview Component
// Key metrics and real-time dashboard overview

"use client";

import type { useEffect, useState } from "react";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Icons } from "@/components/ui/icons";
import type { useToast } from "@/hooks/use-toast";
import type { cn } from "@/lib/utils";

interface OverviewMetrics {
  total_predictions: number;
  accuracy_rate: number;
  high_risk_patients: number;
  interventions_today: number;
  revenue_protected: number;
  cost_savings: number;
  recent_predictions: Array<{
    id: string;
    patient_name: string;
    appointment_date: string;
    risk_score: number;
    intervention_status: string;
  }>;
}

export default function NoShowPredictionOverview() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch("/api/no-show-prediction/overview");
        if (!response.ok) throw new Error("Failed to fetch metrics");

        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error("Error fetching overview metrics:", error);
        toast({
          title: "Erro ao carregar métricas",
          description: "Não foi possível carregar as métricas de predição.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [toast]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhuma métrica disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Predições</CardTitle>
            <Icons.calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_predictions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Predições realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Acurácia</CardTitle>
            <Icons.target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.accuracy_rate * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Precisão das predições</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alto Risco</CardTitle>
            <Icons.alertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics.high_risk_patients}</div>
            <p className="text-xs text-muted-foreground">Pacientes em risco</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Intervenções Hoje</CardTitle>
            <Icons.users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.interventions_today}</div>
            <p className="text-xs text-muted-foreground">Ações realizadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Impact */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receita Protegida</CardTitle>
            <CardDescription>
              Valor estimado de receita protegida através das intervenções
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R${" "}
              {metrics.revenue_protected.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Economia de Custos</CardTitle>
            <CardDescription>Redução de custos operacionais através da otimização</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R${" "}
              {metrics.cost_savings.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Predictions */}
      <Card>
        <CardHeader>
          <CardTitle>Predições Recentes</CardTitle>
          <CardDescription>Últimas predições de não comparecimento realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.recent_predictions.map((prediction) => (
              <div key={prediction.id} className="flex items-center justify-between border-b pb-2">
                <div className="space-y-1">
                  <p className="font-medium">{prediction.patient_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(prediction.appointment_date).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      prediction.risk_score >= 0.7
                        ? "destructive"
                        : prediction.risk_score >= 0.4
                          ? "default"
                          : "secondary"
                    }
                  >
                    {(prediction.risk_score * 100).toFixed(0)}% risco
                  </Badge>
                  <Badge
                    variant={
                      prediction.intervention_status === "completed"
                        ? "default"
                        : prediction.intervention_status === "pending"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {prediction.intervention_status === "completed"
                      ? "Intervenção realizada"
                      : prediction.intervention_status === "pending"
                        ? "Pendente"
                        : "Não iniciada"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
